import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface ContactFreelancerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  freelancer: {
    id: string;
    full_name: string | null;
    email: string;
  };
  senderName?: string;
  senderEmail?: string;
}

const ContactFreelancerDialog = ({
  open,
  onOpenChange,
  freelancer,
  senderName,
  senderEmail,
}: ContactFreelancerDialogProps) => {
  const defaultMessage = `Hi ${freelancer.full_name || "there"},

I came across your profile on FreelancerWorks and was impressed by your skills and experience. I have a project that I believe would be a great fit for your expertise.

Would you be available for a quick chat to discuss the details?

Looking forward to hearing from you!

Best regards,
${senderName || "A potential client"}`;

  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          freelancerEmail: freelancer.email,
          freelancerName: freelancer.full_name || "Freelancer",
          senderName: senderName || "A FreelancerWorks User",
          senderEmail: senderEmail || "noreply@freelancerworks.com",
          message: message.trim(),
        },
      });

      if (error) throw error;

      toast.success("Message sent successfully!");
      onOpenChange(false);
      setMessage(defaultMessage);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact {freelancer.full_name || "Freelancer"}</DialogTitle>
          <DialogDescription>
            Send a message to {freelancer.full_name || "this freelancer"}. They will receive it at their registered email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              placeholder="Write your message here..."
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/2000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending || message.length > 2000}>
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactFreelancerDialog;
