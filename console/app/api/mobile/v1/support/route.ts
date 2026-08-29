import type { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { arabicNumber } from "@/lib/mobile-api/arabic-format";
import { mobileSessionFromRequest } from "@/lib/mobile-api/auth";
import { fail, ok } from "@/lib/mobile-api/http";
import { readBody } from "@/lib/mobile-api/request";

/**
 * S14 «المساعدة والدعم» — the client writing TO the Modonty team.
 *
 * Stored as a `ContactMessage` with **`clientId: null`**, deliberately. On that model
 * `clientId` means «this message is FOR that client»: the console inbox at
 * `/dashboard/support` is literally `where: { clientId }`. Stamping our own client id here
 * would drop the client's outgoing message into their own inbox of reader messages —
 * the wrong direction, and confusing the moment they open that page.
 *
 * The sender is still identifiable: `name` and `email` are read from the authenticated
 * Client row (never from the request body), and the subject names the app it came from.
 * Admin's `/contact-messages` lists messages unfiltered, so it lands there.
 */

const MESSAGE_MAX_LENGTH = 2000;
const input = z.object({ message: z.string().trim().min(1).max(MESSAGE_MAX_LENGTH) });

function reviewCopy() {
  return {
    title: "المساعدة والدعم",
    backLabel: "رجوع",
    heroTitle: "كيف نساعدك؟",
    heroDescription: "أرسل رسالتك من التطبيق بدل البحث عن قناة",
    messageLabel: "رسالتك",
    messagePlaceholder: "اكتب رسالتك هنا",
    submitLabel: "إرسال للدعم",
    submittingLabel: "يُرسل…",
    noteLabel: "سنرسل تأكيدًا عند استلام رسالتك.",
    sentTitle: "وصلت رسالتك",
    sentDescription: "فريق مودونتي بيرد عليك على بريدك.",
    messageMaxLength: MESSAGE_MAX_LENGTH,
    counterMaxLabel: arabicNumber(MESSAGE_MAX_LENGTH),
    emptyMessageError: "اكتب رسالتك أولاً.",
    sendErrorTitle: "ما قدرنا نرسل رسالتك",
    retryLabel: "إعادة المحاولة",
    offlineTitle: "ما في اتصال",
    offlineDescription: "تأكد من الإنترنت وجرّب مرة ثانية.",
  };
}

export async function GET(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  return ok({ review: reviewCopy() });
}

export async function POST(request: NextRequest) {
  const session = await mobileSessionFromRequest(request);
  if (!session) return fail("UNAUTHORIZED", "سجّل الدخول للمتابعة.");
  const parsed = await readBody(request, input);
  if ("response" in parsed) return parsed.response;
  const client = await db.client.findUnique({ where: { id: session.clientId }, select: { name: true, email: true } });
  if (!client?.email) return fail("CONFLICT", "حسابك بلا بريد مسجّل، فما نقدر نرد عليك. راجع فريق مودونتي.");
  const created = await db.contactMessage.create({
    data: {
      name: client.name,
      email: client.email,
      subject: `دعم تطبيق الكونسول — ${client.name}`,
      message: parsed.value.message,
      status: "new",
      clientId: null,
    },
    select: { id: true },
  });
  return ok({ message: { id: created.id }, review: reviewCopy() });
}
