import "server-only";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ArticleFAQStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import type { ReaderActor } from "@/lib/users/reader-actor";
import { stripHtmlTags } from "@modonty/shared/lib/strip-html-tags";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

// Visitor question on a client mini-site page → ClientFAQ (source "user",
// PENDING). The client answers it from console /dashboard/page-faq, which
// publishes it into the page FAQ + FAQPage JSON-LD. Mirrors submitAskClientAs.
export const clientQuestionSchema = z.object({
  // الحقل «(اختياري)» في النموذج: الفراغ مقبول والاسم يُؤخذ من الجلسة أدناه؛ ولو كُتب فحرفان على الأقل.
  name: z.string().trim().max(100, "الاسم طويل جداً").refine((v) => v.length === 0 || v.length >= 2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  question: z.string().min(10, "السؤال يجب أن يكون على الأقل 10 أحرف").max(2000, "السؤال طويل جداً"),
});

export type ClientQuestionFormData = z.infer<typeof clientQuestionSchema>;

/** Every refusal the web shows, plus which one it is — the mobile API maps it to a status code. */
export type ClientQuestionResult =
  | { success: true }
  | { success: false; reason: "invalid" | "not_found" | "missing_identity" | "too_many_pending"; error: string };

/**
 * A signed-in reader asks a partner a question from the partner page — the body of
 * `submitClientPageQuestion` with the identity passed in. Not a Server Action on purpose.
 */
export async function submitClientPageQuestionAs(
  actor: ReaderActor,
  data: unknown,
  clientSlug: string
): Promise<ClientQuestionResult> {
  const parsed = clientQuestionSchema.safeParse(data);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg = f.name?.[0] ?? f.email?.[0] ?? f.question?.[0] ?? "البيانات غير صالحة";
    return { success: false, reason: "invalid", error: msg };
  }

  const client = await db.client.findUnique({
    where: { slug: clientSlug },
    select: { id: true, slug: true, name: true },
  });
  if (!client) {
    return { success: false, reason: "not_found", error: "الصفحة غير متاحة" };
  }

  const submittedByName = (actor.name || parsed.data.name).trim();
  const submittedByEmail = (actor.email ?? parsed.data.email).trim();
  if (!submittedByName || !submittedByEmail) {
    return { success: false, reason: "missing_identity", error: "حسابك يفتقد الاسم أو البريد. حدّث الملف الشخصي ثم جرّب مرة أخرى." };
  }

  // Anti-spam: max 5 unanswered questions per visitor per client.
  const pendingCount = await db.clientFAQ.count({
    where: {
      clientId: client.id,
      submittedByEmail,
      status: ArticleFAQStatus.PENDING,
      answer: null,
    },
  });
  if (pendingCount >= 5) {
    return { success: false, reason: "too_many_pending", error: "الحد الأقصى 5 أسئلة معلقة. انتظر الرد على أسئلتك الحالية." };
  }

  const last = await db.clientFAQ.findFirst({
    where: { clientId: client.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;

  const faq = await db.clientFAQ.create({
    data: {
      clientId: client.id,
      question: stripHtmlTags(parsed.data.question.trim()),
      answer: null,
      position,
      status: ArticleFAQStatus.PENDING,
      source: "user",
      submittedByName,
      submittedByEmail,
    },
    select: { id: true },
  });

  revalidatePath(`/clients/${client.slug}`);

  fireClientEvent(client.id, { kind: "page_question", faqId: faq.id });
  notifyTelegram(client.id, "askClientQuestion", {
    title: `سؤال على صفحة ${client.name}`,
    body: `${submittedByName}: ${parsed.data.question.trim()}`,
    meta: { "البريد": submittedByEmail },
    link: {
      label: "الرد من اللوحة",
      url: "https://console.modonty.com/dashboard/page-faq",
    },
  }).catch((e: unknown) => console.error("[submitClientPageQuestionAs] telegram", e));

  return { success: true };
}
