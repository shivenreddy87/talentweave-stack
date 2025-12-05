import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  location: string | null;
  applicationCount?: number;
}

interface JobsListProps {
  jobs: Job[];
  onJobSelect: (job: Job) => void;
  selectedJobId?: string;
}

const JobsList = ({ jobs, onJobSelect, selectedJobId }: JobsListProps) => {
  const navigate = useNavigate();

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">You haven't posted any jobs yet</p>
          <Button onClick={() => navigate("/post-job")}>
            Post Your First Job
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Posted Jobs</h3>
        <Button onClick={() => navigate("/post-job")} size="sm">
          Post New Job
        </Button>
      </div>
      <div className="grid gap-3">
        {jobs.map((job) => (
          <Card
            key={job.id}
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedJobId === job.id ? "border-primary ring-1 ring-primary" : ""
            }`}
            onClick={() => onJobSelect(job)}
          >
            <CardHeader className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{job.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {job.description}
                  </CardDescription>
                </div>
                <Badge variant={job.status === "open" ? "default" : "secondary"}>
                  {job.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                {job.applicationCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{job.applicationCount} applications</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobsList;
