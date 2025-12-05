import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Mail, Phone, Star, CheckCircle, X, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Application } from "./ApplicationsTabs";

interface ApplicationDetailsProps {
  application: Application;
  employerName?: string;
  onStatusUpdate: (applicationId: string, newStatus: string, interviewData?: InterviewData) => Promise<void>;
  onBack: () => void;
}

interface InterviewData {
  date: string;
  time: string;
  notes: string;
}

const ApplicationDetails = ({ application, employerName, onStatusUpdate, onBack }: ApplicationDetailsProps) => {
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownloadResume = async () => {
    if (!application.resume_url) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(application.resume_url, 60);
      
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (error) {
      toast.error("Failed to open resume");
    }
  };

  const handleShortlist = async () => {
    setLoading(true);
    try {
      await onStatusUpdate(application.id, "shortlisted");
      toast.success("Candidate shortlisted");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onStatusUpdate(application.id, "rejected");
      toast.success("Application rejected");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      toast.error("Please select date and time");
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(application.id, "shortlisted", {
        date: interviewDate,
        time: interviewTime,
        notes: interviewNotes,
      });
      setShowInterviewForm(false);
      toast.success("Interview scheduled and notification sent");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onStatusUpdate(application.id, "accepted");
      toast.success("Candidate accepted");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted": return "default";
      case "shortlisted": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {application.profiles.full_name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {application.profiles.full_name || "Applicant"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Applied for: {application.jobs.title}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(application.status)}>
                  {application.status}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{application.profiles.email}</span>
                </div>
                {application.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span>{application.phone_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {application.proposed_rate && (
            <div>
              <h4 className="text-sm font-medium mb-1">Proposed Rate</h4>
              <p className="text-lg font-semibold text-primary">${application.proposed_rate}/hr</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium mb-2">Cover Letter</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
              {application.cover_letter}
            </p>
          </div>

          {application.profiles.skills && application.profiles.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {application.profiles.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {application.interview_date && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Interview Scheduled
              </h4>
              <p className="text-sm">
                Date: {new Date(application.interview_date).toLocaleDateString()}
              </p>
              <p className="text-sm">Time: {application.interview_time}</p>
              {application.interview_notes && (
                <p className="text-sm text-muted-foreground mt-2">
                  Notes: {application.interview_notes}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap pt-4 border-t">
            {application.resume_url && (
              <Button variant="outline" size="sm" onClick={handleDownloadResume}>
                <Download className="h-4 w-4 mr-2" />
                View Resume
              </Button>
            )}

            {application.status === "pending" && (
              <>
                <Button size="sm" onClick={handleShortlist} disabled={loading}>
                  <Star className="h-4 w-4 mr-2" />
                  Shortlist
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {application.status === "shortlisted" && (
              <>
                {!showInterviewForm && !application.interview_date && (
                  <Button size="sm" variant="outline" onClick={() => setShowInterviewForm(true)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                )}
                <Button size="sm" onClick={handleAccept} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>

          {showInterviewForm && (
            <Card className="border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Schedule Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="interview-date">Date</Label>
                    <Input
                      id="interview-date"
                      type="date"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interview-time">Time</Label>
                    <Input
                      id="interview-time"
                      type="time"
                      value={interviewTime}
                      onChange={(e) => setInterviewTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interview-notes">Notes (optional)</Label>
                  <Textarea
                    id="interview-notes"
                    placeholder="Add any notes about the interview..."
                    value={interviewNotes}
                    onChange={(e) => setInterviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleScheduleInterview} disabled={loading}>
                    {loading ? "Scheduling..." : "Schedule & Notify"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowInterviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground">
            Applied on {new Date(application.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationDetails;
