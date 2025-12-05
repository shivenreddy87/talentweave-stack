import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import JobsList from "@/components/dashboard/JobsList";
import ApplicationsTabs, { Application } from "@/components/dashboard/ApplicationsTabs";
import ApplicationDetails from "@/components/dashboard/ApplicationDetails";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  location: string | null;
  applicationCount?: number;
}

interface InterviewData {
  date: string;
  time: string;
  notes: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);
    await fetchProfile(session.user.id);
    await fetchJobsWithCounts(session.user.id);
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error fetching profile:", error);
      toast.error("Unable to load profile data");
    }
  };

  const fetchJobsWithCounts = async (userId: string) => {
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", userId)
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Fetch application counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);
          
          return { ...job, applicationCount: count || 0 };
        })
      );

      setJobs(jobsWithCounts);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error fetching jobs:", error);
      toast.error("Unable to load jobs");
    }
  };

  const fetchApplicationsForJob = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data
      const applicationsWithDetails = await Promise.all(
        (data || []).map(async (app) => {
          const [profileData, jobData] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, email, skills")
              .eq("id", app.freelancer_id)
              .single(),
            supabase
              .from("jobs")
              .select("title")
              .eq("id", app.job_id)
              .single()
          ]);

          return {
            ...app,
            profiles: profileData.data || { full_name: null, email: "", skills: [] },
            jobs: jobData.data || { title: "" }
          };
        })
      );

      setJobApplications(applicationsWithDetails);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error fetching applications:", error);
      toast.error("Unable to load applications");
    }
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
    setSelectedApplication(null);
    fetchApplicationsForJob(job.id);
  };

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setSelectedApplication(null);
    setJobApplications([]);
  };

  const handleBackToApplications = () => {
    setSelectedApplication(null);
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string, 
    newStatus: string, 
    interviewData?: InterviewData
  ) => {
    try {
      const application = jobApplications.find(app => app.id === applicationId);
      if (!application) return;

      // Update application status and interview data
      const updateData: any = { status: newStatus };
      if (interviewData) {
        updateData.interview_date = interviewData.date;
        updateData.interview_time = interviewData.time;
        updateData.interview_notes = interviewData.notes;
      }

      const { error: updateError } = await supabase
        .from("job_applications")
        .update(updateData)
        .eq("id", applicationId);

      if (updateError) throw updateError;

      // If accepting, update job status to 'in_progress'
      if (newStatus === "accepted") {
        const { error: jobUpdateError } = await supabase
          .from("jobs")
          .update({ status: "in_progress" })
          .eq("id", application.job_id);

        if (jobUpdateError) throw jobUpdateError;
      }

      // Create notification
      const notificationTitle = interviewData 
        ? "Interview Scheduled" 
        : `Application ${newStatus}`;
      
      const notificationMessage = interviewData
        ? `An interview has been scheduled for "${application.jobs.title}" on ${new Date(interviewData.date).toLocaleDateString()} at ${interviewData.time}.`
        : `Your application for "${application.jobs.title}" has been ${newStatus}.`;

      await supabase.from("notifications").insert({
        user_id: application.freelancer_id,
        title: notificationTitle,
        message: notificationMessage,
        type: newStatus === "accepted" ? "success" : newStatus === "rejected" ? "error" : "info",
        related_application_id: applicationId,
      });

      // Send email notification
      try {
        if (interviewData) {
          await supabase.functions.invoke("send-interview-email", {
            body: {
              freelancerEmail: application.profiles.email,
              freelancerName: application.profiles.full_name || "Freelancer",
              jobTitle: application.jobs.title,
              employerName: profile?.full_name || "The employer",
              interviewDate: interviewData.date,
              interviewTime: interviewData.time,
              interviewNotes: interviewData.notes,
            },
          });
        } else {
          await supabase.functions.invoke("send-application-email", {
            body: {
              freelancerEmail: application.profiles.email,
              freelancerName: application.profiles.full_name || "Freelancer",
              jobTitle: application.jobs.title,
              status: newStatus,
              employerName: profile?.full_name,
            },
          });
        }
      } catch (emailError) {
        if (import.meta.env.DEV) console.error("Email notification failed:", emailError);
      }

      // Update local state
      const updatedApplications = jobApplications.map(app =>
        app.id === applicationId 
          ? { ...app, status: newStatus, ...updateData } 
          : app
      );
      setJobApplications(updatedApplications);

      // Update selected application if it's the one being modified
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus, ...updateData });
      }

      // Refresh job counts
      if (user) {
        fetchJobsWithCounts(user.id);
      }

    } catch (error: any) {
      toast.error("Failed to update application");
      throw error;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-24">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-2xl">
                      {profile?.full_name?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{profile?.full_name || "User"}</CardTitle>
                    <CardDescription>{user?.email}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate("/profile")}>
                    Edit Profile
                  </Button>
                  <Button variant="outline" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {profile?.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>}
              {profile?.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Dashboard Content */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Panel - Jobs List */}
            <div className="lg:col-span-4">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">My Posted Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <JobsList 
                    jobs={jobs} 
                    onJobSelect={handleJobSelect}
                    selectedJobId={selectedJob?.id}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Applications */}
            <div className="lg:col-span-8">
              {!selectedJob ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <p className="text-muted-foreground">
                      Select a job from the left to view applications
                    </p>
                  </CardContent>
                </Card>
              ) : selectedApplication ? (
                <ApplicationDetails
                  application={selectedApplication}
                  employerName={profile?.full_name}
                  onStatusUpdate={handleUpdateApplicationStatus}
                  onBack={handleBackToApplications}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{selectedJob.title}</CardTitle>
                        <CardDescription>
                          {jobApplications.length} application{jobApplications.length !== 1 ? "s" : ""}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleBackToJobs}>
                        ← Back
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ApplicationsTabs
                      applications={jobApplications}
                      onApplicationSelect={handleApplicationSelect}
                      selectedApplicationId={selectedApplication?.id}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
