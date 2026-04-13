import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();
    const from = process.env.RESEND_FROM?.trim() ?? "Modonty <no-reply@modonty.com>";

    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error("[Email] Send failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("[Email] Unexpected error:", message);
    return { success: false, error: message };
  }
}
