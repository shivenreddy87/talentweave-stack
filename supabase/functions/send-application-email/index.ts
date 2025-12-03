import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationEmailRequest {
  freelancerEmail: string;
  freelancerName: string;
  jobTitle: string;
  status: string;
  employerName?: string;
}

const getStatusMessage = (status: string, jobTitle: string, employerName?: string): { subject: string; html: string } => {
  const employer = employerName || "The employer";
  
  switch (status) {
    case "accepted":
      return {
        subject: `🎉 Congratulations! Your application for "${jobTitle}" has been accepted`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #10b981;">Great News! 🎉</h1>
            <p>Your application for <strong>"${jobTitle}"</strong> has been <strong style="color: #10b981;">accepted</strong>!</p>
            <p>${employer} was impressed with your profile and would like to work with you.</p>
            <p>Log in to your dashboard to view the details and get started.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>FreelancerWorks Team</p>
          </div>
        `,
      };
    case "rejected":
      return {
        subject: `Application Update for "${jobTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #6b7280;">Application Update</h1>
            <p>We wanted to let you know that your application for <strong>"${jobTitle}"</strong> was not selected this time.</p>
            <p>Don't be discouraged! There are many other opportunities waiting for you on FreelancerWorks.</p>
            <p>Keep applying and showcasing your skills – the right opportunity is out there!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>FreelancerWorks Team</p>
          </div>
        `,
      };
    default:
      return {
        subject: `Application Status Update for "${jobTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1>Application Update</h1>
            <p>Your application status for <strong>"${jobTitle}"</strong> has been updated to: <strong>${status}</strong></p>
            <p>Log in to your dashboard for more details.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>FreelancerWorks Team</p>
          </div>
        `,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { freelancerEmail, freelancerName, jobTitle, status, employerName }: ApplicationEmailRequest = await req.json();

    console.log(`Sending ${status} email to ${freelancerEmail} for job: ${jobTitle}`);

    const { subject, html } = getStatusMessage(status, jobTitle, employerName);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "FreelancerWorks <onboarding@resend.dev>",
        to: [freelancerEmail],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending application email:", error);
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
