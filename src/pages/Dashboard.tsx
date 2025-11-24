import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, MapPin, Calendar, FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  location: string;
}

interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  status: string;
  created_at: string;
  proposed_rate: number | null;
  cover_letter: string;
  phone_number: string | null;
  resume_url: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
  jobs: {
    title: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

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
    await fetchJobs(session.user.id);
    await fetchApplications(session.user.id);
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
      console.error("Error fetching profile:", error);
    }
  };

  const fetchJobs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchApplications = async (userId: string) => {
    try {
      // First get jobs for this employer
      const { data: employerJobs } = await supabase
        .from("jobs")
        .select("id")
        .eq("employer_id", userId);

      if (!employerJobs || employerJobs.length === 0) {
        setApplications([]);
        return;
      }

      const jobIds = employerJobs.map(j => j.id);

      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch related data separately
      const applicationsWithDetails = await Promise.all(
        (data || []).map(async (app) => {
          const [profileData, jobData] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, email")
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
            profiles: profileData.data || { full_name: null, email: "" },
            jobs: jobData.data || { title: "" }
          };
        })
      );

      setApplications(applicationsWithDetails);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      const { error: updateError } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      // Create notification for the freelancer
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: application.freelancer_id,
        title: `Application ${newStatus}`,
        message: `Your application for "${application.jobs.title}" has been ${newStatus}.`,
        type: newStatus === "accepted" ? "success" : "error",
        related_application_id: applicationId,
      });


      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      toast.success(`Application ${newStatus} successfully`);
    } catch (error: any) {
      toast.error("Failed to update application");
    }
  };

  const handleDownloadResume = async (resumeUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 60);
      
      if (error) throw error;
      
      window.open(data.signedUrl, "_blank");
    } catch (error: any) {
      toast.error("Failed to open resume");
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
        <div className="max-w-6xl mx-auto space-y-8">
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

          <Tabs defaultValue="jobs" className="space-y-6">
            <TabsList>
              <TabsTrigger value="jobs">My Posted Jobs</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({applications.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="jobs" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Posted Jobs</h2>
                <Button onClick={() => navigate("/post-job")}>
                  Post New Job
                </Button>
              </div>

              {jobs.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
                    <Button onClick={() => navigate("/post-job")}>
                      Post Your First Job
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <Card key={job.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{job.title}</CardTitle>
                            <CardDescription className="mt-2">{job.description}</CardDescription>
                          </div>
                          <Badge>{job.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <h2 className="text-2xl font-bold">Job Applications</h2>

              {applications.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No applications received yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {application.profiles.full_name || "Applicant"}
                            </CardTitle>
                            <CardDescription>
                              Applied for: {application.jobs.title}
                            </CardDescription>
                            <p className="text-sm text-muted-foreground">
                              {application.profiles.email}
                            </p>
                            {application.phone_number && (
                              <p className="text-sm text-muted-foreground">
                                Phone: {application.phone_number}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={
                              application.status === "accepted"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {application.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Cover Letter</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {application.cover_letter}
                          </p>
                        </div>

                        {application.proposed_rate && (
                          <div>
                            <p className="text-sm font-medium">
                              Proposed Rate: ${application.proposed_rate}/hr
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-4 border-t">
                          <p className="text-xs text-muted-foreground">
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {application.resume_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResume(application.resume_url!)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View Resume
                            </Button>
                          )}
                          
                          {application.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateApplicationStatus(application.id, "accepted")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleUpdateApplicationStatus(application.id, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
