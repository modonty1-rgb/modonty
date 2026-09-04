import "server-only";

import { db } from "@/lib/db";

/**
 * يعيد بناء الحقول المنسوخة على صفّ العميل من جدول المتابعة.
 *
 * `SalesLead.nextActionAt` و`nextActionNote` و`lastContactAt` نسخةٌ من الجدول لا مصدرٌ ثانٍ:
 * تُكتب هنا وحدها، وأي فعلٍ يلمس المتابعة يستدعي هذه بعده. الكتابة المباشرة عليها من أي مكان
 * آخر تخلق الحقيقتين المتناقضتين التي وُجد هذا الملف ليمنعها.
 *
 * ── لماذا الفلترة في الكود لا في الاستعلام ───────────────────────────────────────────────
 * في مونجو الحقل **الغائب ليس `null`**، و`doneAt: null` في `where` لا يطابق الصفوف التي لم
 * يُكتب فيها الحقل أصلاً — وهي الغالبية، لأن بريزما تحذف الحقل الاختياري بدل أن تكتبه فارغاً.
 * البديل `OR` مع `isSet: false` يعمل، لكنه يتكرّر في كل استعلام ويُنسى مرّة واحدة فتسقط
 * النتيجة بصمت. صفوف المتابعة للعميل الواحد عشرات لا آلاف، فقراءتها مرّةً وحسابها في الذاكرة
 * أرخص من الاستعلامين، وصحيحةٌ مهما كان الحقل غائباً أو فارغاً — `== null` تمسك الاثنين.
 */
export async function syncLeadNextAction(leadId: string): Promise<void> {
  const rows = await db.salesLeadFollowUp.findMany({
    where: { leadId },
    orderBy: { happenedAt: "desc" },
    select: { happenedAt: true, nextActionAt: true, nextActionNote: true, doneAt: true },
    take: 500,
  });

  // أقرب موعد مفتوح لا آخر ما كُتب: لو عليها موعدان، المستحقّ هو الأقرب.
  const open = rows
    .filter((r) => r.nextActionAt != null && r.doneAt == null)
    .sort((a, b) => a.nextActionAt!.getTime() - b.nextActionAt!.getTime())[0];

  await db.salesLead.update({
    where: { id: leadId },
    data: {
      // `null` صريحة لا `undefined`: الأخيرة تعني «لا تلمس» في بريزما، فيبقى موعدٌ قديم
      // معلّقاً على الصفّ بعد أن أُقفل في الجدول.
      nextActionAt: open?.nextActionAt ?? null,
      nextActionNote: open?.nextActionNote ?? null,
      lastContactAt: rows[0]?.happenedAt ?? null,
    },
  });
}
