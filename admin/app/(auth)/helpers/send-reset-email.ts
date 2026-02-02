import { sendEmailWithRetry } from "@/lib/email/resend-client";

/**
 * Password Reset Email
 *
 * Uses reliable email client with retry logic.
 * Hex tokens (0-9, a-f) are URL-safe, no encoding needed.
 */

const baseUrl =
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export async function sendResetEmail(
  email: string,
  token: string,
  requestId: string
): Promise<void> {
  // Hex tokens are URL-safe (0-9, a-f), no encoding needed
  const resetLink = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${token}`;
  const timestamp = new Date().toISOString().slice(11, 19); // HH:MM:SS
  const tokenPrefix = token.substring(0, 8);

  // Unique subject to prevent Gmail threading issues
  const emailSubject = `Reset your admin password [${requestId}] - ${timestamp}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>You requested a password reset for your admin account.</p>
      <p style="margin: 24px 0;">
        <a href="${resetLink}" 
           style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset your password
        </a>
      </p>
      <p style="color: #666; font-size: 14px;">
        This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${resetLink}" style="color: #3b82f6;">${resetLink}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="background: #f5f5f5; padding: 10px; font-family: monospace; font-size: 11px; color: #666;">
        <strong>Debug Info (verify this matches server logs):</strong><br />
        Request ID: <strong>${requestId}</strong><br />
        Token: <strong>${tokenPrefix}...</strong><br />
        Time: <strong>${timestamp}</strong>
      </p>
    </div>
  `;

  console.log(`[sendResetEmail][${requestId}] Preparing email:`, {
    requestId,
    timestamp,
    to: email,
    subject: emailSubject,
    tokenFull: token,
    tokenPrefix,
    resetLink,
  });

  console.log(`[sendResetEmail][${requestId}] HTML being sent (first 300 chars):`, emailHtml.substring(0, 300));

  await sendEmailWithRetry({
    from: process.env.RESEND_FROM || "",
    to: email,
    subject: emailSubject,
    html: emailHtml,
  });

  console.log(`[sendResetEmail][${requestId}] Email sent successfully to:`, email);
}
