import { isPayMarkName, payMarkAsset } from "@modonty/shared/lib/commercial/pay-mark-names";

import { getCachedPaySectionContent } from "@/app/data/get-cached-catalog";

/**
 * طرق الدفع في السوقين معاً — على الصفحة الرئيسية وحدها.
 *
 * ── لماذا السوقان في صفٍّ واحد بدل سوق الزائر ──
 * الصفحة الرئيسية بلا سوق عمداً (خالد ١٤ سبتمبر ٢٠٢٦: «الصفحة هذه عامة للكل»)، وهذا ما
 * يجعلها ساكنة تُسلَّم من الحافة. ولو اختارت طرق الدفع حسب البلد لاحتاجت رأس الطلب،
 * فتسقط سكونها في أوّل صفحةٍ يفتحها الزائر — وهي أغلى صفحةٍ على الأداء.
 *
 * والبديل الكاذب أسوأ: عرض «مدى» لزائرٍ مصريّ وعدٌ لا يستطيع تنفيذه، وعرض «تحويل بنكي»
 * لسعوديّ تنزيلٌ لما يستحقّه. فبالتصريح بالسوقين يكسب الاثنان: المصريّ يعرف طريقته من
 * أوّل صفحة بدل أن يُفاجأ عند الدفع، والسعوديّ يرى بطاقته.
 *
 * ── ولا قائمة مكتوبة هنا ──
 * كل صفٍّ يُقرأ من `PaySectionContent` لسوقه: `payMarks` و`installmentMark` و
 * `paymentFootnote`. فإضافة طريقة دفعٍ من الأدمن تظهر هنا وفي صفحة الباقات معاً، ولا
 * يوجد موضعان يتناقضان على ما نقبله.
 */

const MARKETS = [
  { code: "SA", flag: "/logos/flag-sa.svg", label: "السعودية" },
  { code: "AE", flag: "/logos/flag-ae.svg", label: "الإمارات" },
  { code: "EG", flag: "/logos/flag-eg.svg", label: "مصر" },
] as const;


export async function MarketPayMethods() {
  const rows = await Promise.all(
    MARKETS.map(async (m) => {
      const c = await getCachedPaySectionContent(m.code);
      return {
        ...m,
        marks: c.payMarks.filter(isPayMarkName).map(payMarkAsset),
        installment:
          c.installmentMark && isPayMarkName(c.installmentMark) ? payMarkAsset(c.installmentMark) : null,
        installmentLabel: c.installmentLabel,
        /* سوقٌ بلا شعارات يقول طريقته نصّاً — مصر تحويلٌ بنكيّ لا بطاقة (PAY-Q12). */
        note: c.paymentFootnote,
      };
    }),
  );

  const visible = rows.filter((r) => r.marks.length > 0 || r.note);
  if (visible.length === 0) return null;

  return (
    <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-2.5">
      {visible.map((r) => (
        <div key={r.code} className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 sm:flex-nowrap sm:justify-start">
          {/* عرضٌ ثابت لاسم السوق: بدونه يبدأ صفّ السعودية وصفّ مصر من عمودين مختلفين
              لأن الاسمين مختلفا الطول — فيُقرأ السطران متكسّرين لا جدولاً من صفّين. */}
          <span className="flex w-[86px] shrink-0 items-center gap-2 pe-2">
            {/* العلم بارتفاعٍ يكفي لتُقرأ ألوانه، وبحدٍّ خفيف لأن علم مصر فيه أبيض
                يذوب في السطح الفاتح. */}
            <img src={r.flag} alt="" aria-hidden className="h-5 w-auto shrink-0 rounded-[3px] ring-1 ring-foreground/25" />
            <span className="text-[12px] font-medium text-muted-foreground">{r.label}</span>
          </span>

          {r.marks.map((m) => (
            /* ⚠ الأرضيّة البيضاء استثناءٌ مقصود من التوكنات: شعارات مدى وفيزا علاماتٌ
               تجارية بألوان ثابتة مصمَّمة على أرضيّة فاتحة — على سطحٍ داكن تختفي أو
               تنقلب. والحدّ وحده يتبع التوكن فينقلب مع السمة. */
            <span
              key={m.src}
              className="flex h-6 items-center rounded bg-white px-1.5 ring-1 ring-foreground/50 dark:ring-foreground/20"
            >
              <img src={m.src} alt={m.alt} style={{ height: 12, width: "auto" }} />
            </span>
          ))}

          {r.installment ? (
            <span className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">{r.installmentLabel ?? "أو قسّط"}</span>
              <span className="flex h-6 items-center rounded bg-white px-1.5 ring-1 ring-foreground/50 dark:ring-foreground/20">
                <img src={r.installment.src} alt={r.installment.alt} style={{ height: 12, width: "auto" }} />
              </span>
            </span>
          ) : null}

          {r.marks.length === 0 && r.note ? (
            <span className="text-[12px] text-muted-foreground">{r.note}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
