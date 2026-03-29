import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ id: string; success: true }> {
  const from = process.env.RESEND_FROM?.trim();
  if (!from) {
    throw new Error("RESEND_FROM is not configured");
  }
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html ?? (params.text ? params.text.replace(/\n/g, "<br>") : undefined),
    text: params.text ?? "",
  });
  if (error) {
    throw new Error((error as { message?: string }).message ?? "Email send failed");
  }
  return { id: data?.id ?? "sent", success: true };
}
