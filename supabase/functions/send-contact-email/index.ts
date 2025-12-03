import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  freelancerEmail: string;
  freelancerName: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { freelancerEmail, freelancerName, senderName, senderEmail, message }: ContactEmailRequest = await req.json();

    // Validate inputs
    if (!freelancerEmail || !message) {
      throw new Error("Missing required fields: freelancerEmail and message are required");
    }

    if (message.length > 2000) {
      throw new Error("Message exceeds maximum length of 2000 characters");
    }

    console.log(`Sending contact email to ${freelancerEmail} from ${senderName}`);

    // Escape HTML in message to prevent XSS
    const escapedMessage = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
      .replace(/\n/g, "<br>");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
          New Message from FreelancerWorks
        </h1>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${senderName}</p>
          <p style="margin: 0;"><strong>Email:</strong> ${senderEmail}</p>
        </div>
        
        <div style="padding: 20px 0;">
          <h2 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Message:</h2>
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; line-height: 1.6;">
            ${escapedMessage}
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        
        <p style="color: #6b7280; font-size: 14px;">
          This message was sent via FreelancerWorks. To reply, respond directly to this email or contact the sender at ${senderEmail}.
        </p>
        
        <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
          FreelancerWorks - Connecting talent with opportunity
        </p>
      </div>
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
        subject: `New message from ${senderName} via FreelancerWorks`,
        html,
        reply_to: senderEmail,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await res.json();
    console.log("Contact email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending contact email:", error);
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
