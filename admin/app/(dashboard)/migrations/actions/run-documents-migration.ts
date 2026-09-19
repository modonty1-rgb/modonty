"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { checkFinanceAdmin } from "@/lib/require-finance-admin";
import { planDocuments } from "../helpers/plan-documents";

/**
 * **ينسخ الروابط إلى صفوف — ولا يمسح شيئاً.**
 *
 * وهو الفرقُ الجوهريُّ عن ترحيل الطلبات: ذاك يمسح الطلباتِ والفواتيرَ ويعيد بناءها،
 * فحارسُه يرفض إن وُجد طلبٌ واحد. وهذا **يضيف فقط** — المصدرُ يبقى في مكانه
 * (`verificationImageUrl` و`ymylData`) حتّى تُثبَت سلامةُ الجدول الجديد، والتكرارُ
 * يُمنع بالرابط نفسِه لا بعلامةٍ تُرفع.
 *
 * فيجوز تشغيلُه مرّةً بعد مرّة: الثانيةُ لا تُنشئ نسخة، والوثائقُ الجديدةُ التي ظهرت
 * بين التشغيلين تُلتقط.
 */
export async function runDocumentsMigration(): Promise<
  { ok: true; created: number; skipped: number } | { ok: false; error: string }
> {
  const gate = await checkFinanceAdmin();
  if (gate.status !== "ok") return { ok: false, error: "غير مصرَّح — مديرُ النظام وحده" };

  const plan = await planDocuments();
  if (plan.candidates.length === 0) {
    return { ok: true, created: 0, skipped: plan.alreadyMigrated };
  }

  await db.clientDocument.createMany({
    data: plan.candidates.map((c) => ({
      clientId: c.clientId,
      label: c.label,
      url: c.url,
      source: c.source,
      // ملاحظةٌ تبقى مع الصفّ: من يفتحها بعد شهرٍ يعرف أنّها مرحَّلةٌ لا مرفوعة، وأنّ
      // رابطَها خارجيٌّ إن كان كذلك.
      note: c.external ? "مُرحَّلة — رابطٌ خارجيٌّ ليس على مخزننا" : "مُرحَّلة",
    })),
  });

  revalidatePath("/migrations");
  return { ok: true, created: plan.candidates.length, skipped: plan.alreadyMigrated };
}
