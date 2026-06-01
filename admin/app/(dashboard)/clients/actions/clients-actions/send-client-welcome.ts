"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { clientWelcomeEmail } from "@/lib/email/templates/client-welcome";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import { DEFAULT_CLIENT_PASSWORD } from "@/lib/default-client-password";

const CONSOLE_URL = process.env.CONSOLE_URL || "https://console.modonty.com";

/**
 * Sends the welcome email (login credentials) to a client after creation.
 * The password sent is the default password — the client changes it from the
 * console on first login (the DB only ever stores its bcrypt hash).
 */
export async function sendClientWelcome(clientId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized. Please log in." };
    }

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { id: true, name: true, email: true },
    });
    if (!client || !client.email) {
      return { success: false, error: "العميل غير موجود أو لا يملك بريداً إلكترونياً." };
    }

    const email = clientWelcomeEmail({
      clientName: client.name,
      email: client.email,
      password: DEFAULT_CLIENT_PASSWORD,
      consoleUrl: CONSOLE_URL,
    });

    await sendEmailWithRetry({
      from: process.env.RESEND_FROM || "",
      to: client.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      // Tags surface in Resend webhooks so we can track delivered/opened per client.
      tags: [
        { name: "emailType", value: "client-welcome" },
        { name: "clientId", value: client.id },
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "فشل إرسال إيميل الترحيب. حاول مرة أخرى." };
  }
}
