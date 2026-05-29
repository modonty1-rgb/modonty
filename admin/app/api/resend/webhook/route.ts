import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

// Resend → Svix webhook for email events (delivered, opened, clicked, bounced...).
// Verifies the signature, then logs a generic EmailEvent. Entity is identified via
// the tags we attach when sending (emailType + clientId).

interface ResendWebhookPayload {
  type: string; // e.g. "email.delivered", "email.opened"
  created_at: string;
  data: {
    email_id: string;
    created_at?: string;
    from?: string;
    to?: string[];
    subject?: string;
    tags?: Record<string, string>;
  };
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return new NextResponse("Webhook secret not configured", { status: 500 });
  }

  // Raw body is required for signature verification — never parse before verifying.
  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let evt: ResendWebhookPayload;
  try {
    const wh = new Webhook(secret);
    evt = wh.verify(payload, headers) as ResendWebhookPayload;
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    const tags = evt.data.tags ?? {};
    const tagClientId = tags.clientId;

    await db.emailEvent.create({
      data: {
        emailId: evt.data.email_id,
        type: evt.type.replace(/^email\./, ""), // "email.opened" → "opened"
        recipient: evt.data.to?.[0] ?? null,
        subject: evt.data.subject ?? null,
        emailType: tags.emailType ?? null,
        clientId: tagClientId && OBJECT_ID.test(tagClientId) ? tagClientId : null,
        eventAt: evt.data.created_at ? new Date(evt.data.created_at) : null,
      },
    });
  } catch (error) {
    // Don't make Resend retry on our storage errors — log and ack.
    console.error("[resend-webhook] store failed:", error);
  }

  return NextResponse.json({ received: true });
}
