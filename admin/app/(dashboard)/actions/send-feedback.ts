"use server";

import { sendEmailWithRetry } from "@/lib/email/resend-client";

const FEEDBACK_EMAIL = "modonty1@gmail.com";

export async function sendFeedback(data: {
  name: string;
  message: string;
  page: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.name?.trim()) return { success: false, error: "Please select your name" };
    if (!data.message?.trim()) return { success: false, error: "Please write a message" };

    await sendEmailWithRetry({
      from: process.env.RESEND_FROM || "noreply@modonty.com",
      to: FEEDBACK_EMAIL,
      subject: `Feedback from ${data.name} — Modonty Admin`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
            New Feedback — Modonty Admin
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666; width: 100px;">From:</td>
              <td style="padding: 8px;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Page:</td>
              <td style="padding: 8px;">${data.page}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold; color: #666;">Time:</td>
              <td style="padding: 8px;">${new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })}</td>
            </tr>
          </table>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Sent from Modonty Admin Beta Feedback System
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send feedback:", error);
    return { success: false, error: "Failed to send. Please try again." };
  }
}
