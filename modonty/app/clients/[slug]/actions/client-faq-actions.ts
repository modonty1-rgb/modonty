"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArticleFAQStatus } from "@prisma/client";
import { notifyTelegram } from "@/lib/telegram/notify";

// Visitor question on a client mini-site page → ClientFAQ (source "user",
// PENDING). The client answers it from console /dashboard/page-faq, which
// publishes it into the page FAQ + FAQPage JSON-LD. Mirrors submitAskClient.
const clientQuestionSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين").max(100, "الاسم طويل جداً"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  question: z.string().min(10, "السؤال يجب أن يكون على الأقل 10 أحرف").max(2000, "السؤال طويل جداً"),
});

export type ClientQuestionFormData = z.infer<typeof clientQuestionSchema>;

function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export async function submitClientPageQuestion(
  data: ClientQuestionFormData,
  clientSlug: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "يجب تسجيل الدخول لطرح سؤال" };
  }

  const parsed = clientQuestionSchema.safeParse(data);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg = f.name?.[0] ?? f.email?.[0] ?? f.question?.[0] ?? "البيانات غير صالحة";
    return { success: false, error: msg };
  }

  const client = await db.client.findUnique({
    where: { slug: clientSlug },
    select: { id: true, slug: true, name: true },
  });
  if (!client) {
    return { success: false, error: "الصفحة غير متاحة" };
  }

  const submittedByName = (session.user.name ?? parsed.data.name).trim();
  const submittedByEmail = (session.user.email ?? parsed.data.email).trim();
  if (!submittedByName || !submittedByEmail) {
    return { success: false, error: "حسابك يفتقد الاسم أو البريد. حدّث الملف الشخصي ثم جرّب مرة أخرى." };
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
    return { success: false, error: "الحد الأقصى 5 أسئلة معلقة. انتظر الرد على أسئلتك الحالية." };
  }

  const last = await db.clientFAQ.findFirst({
    where: { clientId: client.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  const position = (last?.position ?? -1) + 1;

  await db.clientFAQ.create({
    data: {
      clientId: client.id,
      question: sanitizeText(parsed.data.question.trim()),
      answer: null,
      position,
      status: ArticleFAQStatus.PENDING,
      source: "user",
      submittedByName,
      submittedByEmail,
    },
  });

  revalidatePath(`/clients/${client.slug}`);

  notifyTelegram(client.id, "askClientQuestion", {
    title: `سؤال على صفحة ${client.name}`,
    body: `${submittedByName}: ${parsed.data.question.trim()}`,
    meta: { "البريد": submittedByEmail },
    link: {
      label: "الرد من اللوحة",
      url: "https://console.modonty.com/dashboard/page-faq",
    },
  }).catch(() => {});

  return { success: true };
}
