import { db } from "@/lib/db";
import { planAll } from "@/app/api/dev/rebuild-orders/plan";

/**
 * الجردُ للشاشة — يُقرأ في الخادم لا بـ`fetch` من المتصفّح.
 *
 * كان الحوارُ القديم ينادي `GET` عند الفتح فيرى المستخدمُ «...» حتّى يعود. والصفحةُ
 * تُرسَم في الخادم أصلاً، فالجردُ يصل معها في الرسمة الأولى.
 *
 * والمشاكلُ تُجمَع **بنوعها** لا صفّاً صفّاً: «١٤ عميلاً بلا رصيدٍ افتتاحيّ» سطرٌ
 * يُتصرَّف فيه، وأربعةَ عشرَ سطراً متشابهاً جدارٌ يُتخطّى بالعين.
 */
export type GapGroup = { gap: string; clients: { name: string; totalMinor: number; currency: string | null }[] };

export type RebuildPlan = {
  clients: number;
  /**
   * **مَن سيُبنى له طلبٌ فعلاً، ومَن يُتخطّى** — بنفس شرط المسار حرفيّاً.
   *
   * كانت الشاشةُ تعلن `clients` كلَّهم «سيُصنع له طلب» لأنّ الجردَ يخطّط للجميع، بينما
   * المسارُ يبني مَن لا طلبَ له وحدَه. فبعد أوّل تشغيلٍ ناجح بقي الزرُّ يقول «ابنِ ٤٢»
   * وهو يبني صفراً — وهو عينُ الكذب الذي أُسقط في `existing`. فيُقرأ الشرطُ هنا كما
   * يُقرأ هناك: `CheckoutOrder` بـ`clientId` غيرِ فارغ.
   */
  toBuild: number;
  alreadyHave: number;
  clean: number;
  needsReview: number;
  /**
   * **ما هو قائمٌ الآن — ويبقى كما هو.**
   *
   * كان اسمُه `willDelete` يوم كان الترحيلُ يمسح ثمّ يبني. وسقط المسحُ (خالد ١٩ سبتمبر
   * ٢٠٢٦) فصار الاسمُ يكذب على شاشةٍ فيها زرٌّ يُضغط مرّةً على مالٍ حقيقيّ — وهذا أسوأُ
   * من كودٍ ميّت. فالعددان يُعرضان ليقولا «لن يُمسّا»، لا ليُنذرا.
   */
  existing: { orders: number; invoices: number };
  byCurrency: { currency: string; count: number; totalMinor: number }[];
  gapGroups: GapGroup[];
};

export async function planRebuild(): Promise<RebuildPlan> {
  const [planned, orders, invoices, owners] = await Promise.all([
    planAll(),
    db.checkoutOrder.count(),
    db.invoice.count(),
    db.checkoutOrder.findMany({ where: { NOT: [{ clientId: null }] }, select: { clientId: true } }),
  ]);

  // نفسُ مجموعةِ المسار (`rebuild-orders/route.ts`) — لا نسخةٌ ثانيةٌ من الشرط.
  const alreadyHaveOrders = new Set(owners.map((o) => o.clientId as string));
  const toBuild = planned.filter((p) => !alreadyHaveOrders.has(p.clientId));

  const byCurrency = new Map<string, { count: number; totalMinor: number }>();
  const groups = new Map<string, GapGroup["clients"]>();
  for (const p of planned) {
    const cur = p.currency ?? "—";
    const row = byCurrency.get(cur) ?? { count: 0, totalMinor: 0 };
    byCurrency.set(cur, { count: row.count + 1, totalMinor: row.totalMinor + p.totalMinor });
    for (const gap of p.gaps) {
      /**
       * العنوانُ يُعمَّم عن القيم المذكورة فيه: «باقة «الزخم» بلا صفّ» و«باقة «مجاني»
       * بلا صفّ» مشكلةٌ واحدة بقيمتين. وبلا هذا التعميم تصير لكلّ عميلٍ مجموعةٌ من
       * واحد، وهو عينُ السرد الذي أُسقط.
       */
      const key = gap.replace(/«[^»]*»/g, "«…»").replace(/-?\d[\d.,]*/g, "…");
      const list = groups.get(key) ?? [];
      list.push({ name: p.clientName, totalMinor: p.totalMinor, currency: p.currency });
      groups.set(key, list);
    }
  }

  return {
    clients: planned.length,
    toBuild: toBuild.length,
    alreadyHave: planned.length - toBuild.length,
    clean: planned.filter((p) => p.gaps.length === 0).length,
    needsReview: planned.filter((p) => p.gaps.length > 0).length,
    existing: { orders, invoices },
    byCurrency: [...byCurrency].map(([currency, v]) => ({ currency, ...v })).sort((a, b) => b.count - a.count),
    gapGroups: [...groups].map(([gap, clients]) => ({ gap, clients })).sort((a, b) => b.clients.length - a.clients.length),
  };
}
