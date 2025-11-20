import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Calendar, DollarSign, FileText } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  job_id: string;
  status: string;
  created_at: string;
  proposed_rate: number | null;
  cover_letter: string;
  phone_number: string | null;
  resume_url: string | null;
  jobs: {
    title: string;
    description: string;
    location: string | null;
    budget_min: number | null;
    budget_max: number | null;
  };
}

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await fetchApplications(session.user.id);
    setLoading(false);
  };

  const fetchApplications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          jobs (
            title,
            description,
            location,
            budget_min,
            budget_max
          )
        `)
        .eq("freelancer_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error("Failed to load applications");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track all your job applications</p>
            </div>
            <Button onClick={() => navigate("/find-work")}>
              <Briefcase className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No applications yet</p>
                <p className="text-muted-foreground mb-6">
                  Start applying to jobs and track them here
                </p>
                <Button onClick={() => navigate("/find-work")}>
                  Browse Available Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{application.jobs.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </span>
                          {application.jobs.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.jobs.location}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {application.jobs.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      {application.proposed_rate && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">Your Rate:</span> ${application.proposed_rate}/hr
                          </span>
                        </div>
                      )}
                      
                      {(application.jobs.budget_min || application.jobs.budget_max) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="font-medium">Job Budget:</span> $
                            {application.jobs.budget_min || 0} - $
                            {application.jobs.budget_max || 0}
                          </span>
                        </div>
                      )}

                      {application.phone_number && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            <span className="font-medium">Contact:</span> {application.phone_number}
                          </span>
                        </div>
                      )}

                      {application.resume_url && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>

                    {application.cover_letter && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Cover Letter</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyApplications;
