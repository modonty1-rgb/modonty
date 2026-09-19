"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * **وثائقُ العميل — من جهته هو.**
 *
 * خالد (١٩ سبتمبر ٢٠٢٦): «العميل يرفع من الكونسول من عنده، واحنا لو عندنا أيّ حاجة
 * نقدر نرفعها».
 *
 * ── والحارسُ مخطَّطٌ لا نوع ──
 * الجارُ في هذا التطبيق (`profile-actions.ts`) يحرس بنوع TypeScript وحده، فيقبل حقولاً
 * تعرضها الشاشةُ للقراءة فقط — والبريدُ فيها وهو اسمُ الدخول. والنمطُ الصحيح موجودٌ
 * هنا أيضاً (`my-site/helpers/my-site-schema.ts`)، وهذا يتبعه.
 *
 * ── والعميلُ لا يلمس إلّا وثائقَه ──
 * `clientId` من الجلسة لا من الطلب، وكلُّ فعلٍ يتحقّق أنّ الصفَّ له. فمعرّفُ وثيقةِ
 * عميلٍ آخر يُرفض ولو أُرسل صحيحاً.
 */

const addSchema = z.object({
  label: z.string().trim().min(1, "اكتب اسم الوثيقة").max(80, "الاسم طويل"),
  url: z.string().trim().url("رابط غير صالح"),
  expiresAt: z.string().trim().nullable().optional(),
});

type Result = { ok: true } | { ok: false; error: string };

async function sessionClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

export async function addMyDocument(input: unknown): Promise<Result> {
  const clientId = await sessionClientId();
  if (!clientId) return { ok: false, error: "غير مصرَّح" };

  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "القيم غير صحيحة" };
  const d = parsed.data;

  const exists = await db.clientDocument.findFirst({ where: { clientId, url: d.url }, select: { id: true } });
  if (exists) return { ok: false, error: "هذه الوثيقة مرفوعةٌ بالفعل" };

  await db.clientDocument.create({
    data: {
      clientId,
      label: d.label,
      url: d.url,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      source: "CLIENT",
    },
  });

  revalidatePath("/dashboard/documents");
  return { ok: true };
}

export async function deleteMyDocument(documentId: string): Promise<Result> {
  const clientId = await sessionClientId();
  if (!clientId) return { ok: false, error: "غير مصرَّح" };

  // الملكيّةُ تُفحص قبل الحذف: `deleteMany` بشرط `clientId` يرفض صفَّ غيره بلا استعلامٍ ثانٍ.
  const res = await db.clientDocument.deleteMany({ where: { id: documentId, clientId } });
  if (res.count === 0) return { ok: false, error: "لم تُوجد" };

  revalidatePath("/dashboard/documents");
  return { ok: true };
}
