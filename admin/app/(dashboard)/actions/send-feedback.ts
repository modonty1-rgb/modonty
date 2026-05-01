"use server";

import { db } from "@/lib/db";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import { auth } from "@/lib/auth";

const FEEDBACK_EMAIL = "modonty1@gmail.com";

export async function sendFeedback(data: {
  name: string;
  type: string;            // "bug" | "idea" | "other"
  app: string;
  whereExactly?: string;
  message: string;
  steps?: string;          // bug only
  severity?: string;       // bug only
  benefit?: string;        // idea only
  page: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth(); if (!session) return { success: false, error: "Unauthorized" };
  try {
    if (!data.name?.trim()) return { success: false, error: "Please select your name" };
    if (!data.type?.trim()) return { success: false, error: "Please select feedback type" };
    if (!data.app?.trim()) return { success: false, error: "Please select the affected app" };
    if (!data.message?.trim()) return { success: false, error: "Please write your message" };
    // whereExactly required only for bugs
    if (data.type === "bug" && !data.whereExactly?.trim()) {
      return { success: false, error: "For bugs: please describe where exactly" };
    }

    // Save to DB (admin notes)
    await db.adminNote.create({
      data: {
        author: data.name,
        type: data.type,
        app: data.app,
        whereExactly: data.whereExactly?.trim() || null,
        message: data.message.trim(),
        steps: data.steps?.trim() || null,
        severity: data.severity || null,
        benefit: data.benefit?.trim() || null,
        page: data.page || null,
      },
    });

    // Send email
    await sendEmailWithRetry({
      from: process.env.RESEND_FROM || "noreply@modonty.com",
      to: FEEDBACK_EMAIL,
      subject: `[${data.type.toUpperCase()}] from ${data.name} (${data.app}) — Modonty Admin`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
            ${data.type === "bug" ? "🐛 Bug Report" : data.type === "idea" ? "💡 Idea / Suggestion" : "💬 Feedback"} — Modonty Admin
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; font-weight: bold; color: #666; width: 130px;">From:</td><td style="padding: 8px;">${data.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">App:</td><td style="padding: 8px;"><strong style="text-transform: uppercase; color: #f59e0b;">${data.app}</strong></td></tr>
            ${data.whereExactly ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Where:</td><td style="padding: 8px;">${data.whereExactly}</td></tr>` : ""}
            ${data.severity ? `<tr><td style="padding: 8px; font-weight: bold; color: #666;">Severity:</td><td style="padding: 8px;">${data.severity}</td></tr>` : ""}
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Page URL:</td><td style="padding: 8px; font-family: monospace; font-size: 12px;">${data.page}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; color: #666;">Time:</td><td style="padding: 8px;">${new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" })}</td></tr>
          </table>
          <h3 style="margin: 16px 0 8px; color: #333;">${data.type === "idea" ? "💡 The idea" : data.type === "bug" ? "🐛 What happened" : "💬 Message"}</h3>
          <div style="background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 8px 0;">
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
          ${data.steps ? `
            <h3 style="margin: 16px 0 8px; color: #333;">🔄 Steps to reproduce</h3>
            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 8px 0;">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; font-family: monospace; font-size: 13px;">${data.steps.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
          ` : ""}
          ${data.benefit ? `
            <h3 style="margin: 16px 0 8px; color: #333;">✨ Why it would help</h3>
            <div style="background: #dbeafe; border-radius: 8px; padding: 16px; margin: 8px 0;">
              <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${data.benefit.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
          ` : ""}
          <p style="color: #999; font-size: 12px; margin-top: 24px;">
            Sent from Modonty Admin Beta Feedback System
          </p>
        </div>
      `,
    }).catch(() => {
      // Email failure shouldn't block — note is already saved in DB
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send feedback:", error);
    return { success: false, error: "Failed to send. Please try again." };
  }
}
