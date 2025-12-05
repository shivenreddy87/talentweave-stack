import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileText, Clock, CheckCircle, Star } from "lucide-react";

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  status: string;
  created_at: string;
  proposed_rate: number | null;
  cover_letter: string;
  phone_number: string | null;
  resume_url: string | null;
  interview_date: string | null;
  interview_time: string | null;
  interview_notes: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    skills?: string[] | null;
  };
  jobs: {
    title: string;
  };
}

interface ApplicationsTabsProps {
  applications: Application[];
  onApplicationSelect: (application: Application) => void;
  selectedApplicationId?: string;
}

const ApplicationsTabs = ({ applications, onApplicationSelect, selectedApplicationId }: ApplicationsTabsProps) => {
  const appliedApplications = applications.filter(a => a.status === "pending");
  const shortlistedApplications = applications.filter(a => a.status === "shortlisted");
  const acceptedApplications = applications.filter(a => a.status === "accepted");

  const renderApplicationCard = (application: Application) => (
    <Card
      key={application.id}
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        selectedApplicationId === application.id ? "border-primary ring-1 ring-primary" : ""
      }`}
      onClick={() => onApplicationSelect(application)}
    >
      <CardHeader className="py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-sm">
              {application.profiles.full_name?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium truncate">
              {application.profiles.full_name || "Applicant"}
            </CardTitle>
            <CardDescription className="text-xs truncate">
              {application.profiles.email}
            </CardDescription>
          </div>
          {application.proposed_rate && (
            <Badge variant="outline" className="text-xs">
              ${application.proposed_rate}/hr
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {application.cover_letter}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Applied {new Date(application.created_at).toLocaleDateString()}
        </p>
        {application.interview_date && (
          <p className="text-xs text-primary mt-1">
            Interview: {new Date(application.interview_date).toLocaleDateString()} at {application.interview_time}
          </p>
        )}
      </CardContent>
    </Card>
  );

  const renderEmptyState = (message: string, icon: React.ReactNode) => (
    <Card>
      <CardContent className="py-8 text-center">
        {icon}
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="applied" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="applied" className="text-xs sm:text-sm">
          <Clock className="h-3 w-3 mr-1 hidden sm:inline" />
          Applied ({appliedApplications.length})
        </TabsTrigger>
        <TabsTrigger value="shortlisted" className="text-xs sm:text-sm">
          <Star className="h-3 w-3 mr-1 hidden sm:inline" />
          Shortlisted ({shortlistedApplications.length})
        </TabsTrigger>
        <TabsTrigger value="accepted" className="text-xs sm:text-sm">
          <CheckCircle className="h-3 w-3 mr-1 hidden sm:inline" />
          Accepted ({acceptedApplications.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="applied" className="mt-4 space-y-3">
        {appliedApplications.length === 0 ? (
          renderEmptyState("No pending applications", <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />)
        ) : (
          appliedApplications.map(renderApplicationCard)
        )}
      </TabsContent>

      <TabsContent value="shortlisted" className="mt-4 space-y-3">
        {shortlistedApplications.length === 0 ? (
          renderEmptyState("No shortlisted candidates", <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />)
        ) : (
          shortlistedApplications.map(renderApplicationCard)
        )}
      </TabsContent>

      <TabsContent value="accepted" className="mt-4 space-y-3">
        {acceptedApplications.length === 0 ? (
          renderEmptyState("No accepted candidates", <CheckCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />)
        ) : (
          acceptedApplications.map(renderApplicationCard)
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ApplicationsTabs;
