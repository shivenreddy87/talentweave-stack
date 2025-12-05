import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InterviewEmailRequest {
  freelancerEmail: string;
  freelancerName: string;
  jobTitle: string;
  employerName: string;
  interviewDate: string;
  interviewTime: string;
  interviewNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      freelancerEmail,
      freelancerName,
      jobTitle,
      employerName,
      interviewDate,
      interviewTime,
      interviewNotes,
    }: InterviewEmailRequest = await req.json();

    console.log("Sending interview email to:", freelancerEmail);

    const formattedDate = new Date(interviewDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Interview Scheduled!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Hi ${freelancerName},
            </p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
              Great news! ${employerName || "The employer"} has scheduled an interview with you for the position of <strong>${jobTitle}</strong>.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #166534; margin: 0 0 16px 0; font-size: 18px;">Interview Details</h2>
              <p style="margin: 8px 0; color: #374151;">
                <strong>📅 Date:</strong> ${formattedDate}
              </p>
              <p style="margin: 8px 0; color: #374151;">
                <strong>🕐 Time:</strong> ${interviewTime}
              </p>
              ${interviewNotes ? `
              <p style="margin: 16px 0 0 0; color: #374151;">
                <strong>📝 Notes:</strong><br>
                <span style="color: #6b7280;">${interviewNotes}</span>
              </p>
              ` : ""}
            </div>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
              Please make sure to be available at the scheduled time. If you need to reschedule, please contact the employer directly.
            </p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 8px;">
              Good luck with your interview!
            </p>
            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The FreelancerWorks Team
            </p>
          </div>
          <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              This is an automated message from FreelancerWorks
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FreelancerWorks <onboarding@resend.dev>",
        to: [freelancerEmail],
        subject: `Interview Scheduled for ${jobTitle}`,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Interview email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending interview email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
