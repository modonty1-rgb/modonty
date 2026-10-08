import "server-only";

import { db } from "@/lib/db";
import { saveContactMessage } from "./save-contact-message";

const CONTACT_RATE_LIMIT = 3;
const CONTACT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export type AcceptContactResult =
  | { kind: "invalid"; error: string }
  | { kind: "rate_limited"; error: string }
  | { kind: "sent"; message: string }
  | { kind: "failed"; error: string };

/**
 * A support message as it arrives at `POST /contact/api` — required fields, the hourly cap per IP
 * (DB-based, works across instances), then `saveContactMessage`. Shared by the web route and the
 * mobile API; each passes its verified reader (or null) and its conversion session.
 */
export async function acceptContactMessage(input: {
  body: Record<string, unknown>;
  headers: Headers;
  userId: string | null;
  resolveSessionId: () => Promise<string>;
}): Promise<AcceptContactResult> {
  const { name, email, subject, message, clientId } = input.body;

  if (!name || !email || !subject || !message
    || typeof name !== "string" || typeof email !== "string" || typeof subject !== "string" || typeof message !== "string") {
    return { kind: "invalid", error: "جميع الحقول مطلوبة" };
  }

  if (!email.includes("@")) {
    return { kind: "invalid", error: "البريد الإلكتروني غير صحيح" };
  }

  /**
   * The identity the hourly cap is counted against, so the sender must not be able to choose
   * it. `x-forwarded-for` is a list: whatever the sender put in it stays at the FRONT and each
   * proxy appends the address it accepted the connection from, so only the LAST entry was
   * written by infrastructure we run. Reading the whole header handed the sender a fresh key on
   * every request. On Vercel the platform overwrites this header and refuses to forward an
   * external one (vercel.com/docs/headers/request-headers).
   */
  const forwardedFor = input.headers.get("x-forwarded-for")?.split(",") ?? [];
  const ipAddress = forwardedFor[forwardedFor.length - 1]?.trim() || "unknown";

  // Rate limit: max 3 messages per IP per hour (DB-based, works across instances)
  const recentCount = await db.contactMessage.count({
    where: {
      ipAddress,
      createdAt: { gt: new Date(Date.now() - CONTACT_WINDOW_MS) },
    },
  });
  if (recentCount >= CONTACT_RATE_LIMIT) {
    return { kind: "rate_limited", error: "لقد تجاوزت الحد المسموح به. يرجى المحاولة بعد ساعة." };
  }
  const userAgent = input.headers.get("user-agent") || "unknown";
  const referrer = input.headers.get("referer") || input.headers.get("referrer") || null;

  const result = await saveContactMessage(
    {
      name,
      email,
      subject,
      message,
      ipAddress,
      userAgent,
      referrer,
      clientId: typeof clientId === "string" ? clientId : undefined,
      userId: input.userId ?? undefined,
    },
    input.resolveSessionId,
  );

  return result.success
    ? { kind: "sent", message: result.message ?? "تم إرسال الرسالة بنجاح" }
    : { kind: "failed", error: result.error || "فشل إرسال الرسالة" };
}
