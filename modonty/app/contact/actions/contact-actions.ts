"use server";

import { db } from "@/lib/db";

interface ContactMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string | null;
}

export async function submitContactMessage(data: ContactMessageData) {
  try {
    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: "new",
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
      },
    });

    return { success: true, message: "تم إرسال الرسالة بنجاح" };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return { success: false, error: "فشل إرسال الرسالة" };
  }
}
