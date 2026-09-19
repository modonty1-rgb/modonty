"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkAdmin } from "@/lib/admin-guard";

/**
 * **وثائقُ العميل — إضافةٌ وتعديلٌ وحذف.**
 *
 * ثلاثةُ أفعالٍ في ملفٍّ واحدٍ لأنّها عقدٌ واحد على جدولٍ واحد، وكلُّها تمرّ بالحارس
 * نفسِه. ولكلٍّ مخطَّطُها: أكشنُ الخادم نقطةُ دخولٍ يصلها ما يُرسَل لا ما تعرضه الشاشة
 * — والنوعُ TypeScript يختفي وقتَ التشغيل.
 */

const addSchema = z.object({
  /** نصٌّ حرٌّ لا `enum` (خالد ١٩ سبتمبر ٢٠٢٦): «ممكن تكون في أوراق ثانية ما احنا عارفين إيش هي». */
  label: z.string().trim().min(1, "اكتب اسم الوثيقة").max(80, "الاسم طويل"),
  url: z.string().trim().url("رابط غير صالح"),
  note: z.string().trim().max(300).nullable().optional(),
  /** رخصةٌ منتهيةٌ ليست توثيقاً — واختياريٌّ لأنّ السجلّ التجاريّ قد لا ينتهي. */
  expiresAt: z.string().trim().nullable().optional(),
});

export async function addClientDocument(clientId: string, input: unknown) {
  const gate = await checkAdmin();
  if (gate.status !== "ok") return { ok: false as const, error: "غير مصرَّح" };

  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "القيم غير صحيحة" };
  const d = parsed.data;

  const exists = await db.clientDocument.findFirst({ where: { clientId, url: d.url }, select: { id: true } });
  if (exists) return { ok: false as const, error: "هذه الوثيقة مرفوعةٌ بالفعل" };

  await db.clientDocument.create({
    data: {
      clientId,
      label: d.label,
      url: d.url,
      note: d.note?.trim() || null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      // رفعَها موظّفٌ من هذه الشاشة — والكونسولُ يكتب `CLIENT` حين يُبنى.
      source: "STAFF",
      uploadedByStaffId: gate.userId,
    },
  });

  revalidatePath(`/clients/${clientId}/documents`);
  return { ok: true as const };
}

const editSchema = z.object({
  label: z.string().trim().min(1, "اكتب اسم الوثيقة").max(80),
  note: z.string().trim().max(300).nullable().optional(),
  expiresAt: z.string().trim().nullable().optional(),
});

export async function updateClientDocument(documentId: string, input: unknown) {
  const gate = await checkAdmin();
  if (gate.status !== "ok") return { ok: false as const, error: "غير مصرَّح" };

  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "القيم غير صحيحة" };

  // الرابطُ لا يُعدَّل: تبديلُه يجعل الصفَّ يشهد على ملفٍّ آخر. يُحذف ويُرفع غيرُه.
  const doc = await db.clientDocument.update({
    where: { id: documentId },
    data: {
      label: parsed.data.label,
      note: parsed.data.note?.trim() || null,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
    select: { clientId: true },
  });

  revalidatePath(`/clients/${doc.clientId}/documents`);
  return { ok: true as const };
}

export async function deleteClientDocument(documentId: string) {
  const gate = await checkAdmin();
  if (gate.status !== "ok") return { ok: false as const, error: "غير مصرَّح" };

  // الصفُّ يُحذف والملفُّ يبقى على Bunny: مكتبةُ الوسائط مشتركة، وقد يستعمله شيءٌ آخر.
  const doc = await db.clientDocument.delete({ where: { id: documentId }, select: { clientId: true } });

  revalidatePath(`/clients/${doc.clientId}/documents`);
  return { ok: true as const };
}
