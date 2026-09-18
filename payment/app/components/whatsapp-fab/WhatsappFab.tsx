import { Whatsapp } from "@modonty/shared/components/icons/whatsapp";

import { salesWhatsapp } from "@/lib/sales-whatsapp";

/**
 * زرّ واتساب عائم — ثابتٌ في زاوية الشاشة على امتداد الصفحة.
 *
 * ليش عائمٌ والرقم موجودٌ في الترويسة والتذييل: الترويسة تخرج من الشاشة مع أوّل تمرير،
 * والتذييل لا يصله إلا من قرأ كلّ شيء. والسؤال يولد في **المنتصف** — عند الجدول أو عند
 * السعر — فيحتاج طريقاً لا يتطلّب تمريراً في أي اتجاه.
 *
 * وسيرفر كومبوننت بلا حالة: لا يُطوى ولا يتحرّك ولا يفتح نافذة محادثة. رابطٌ واحد
 * يفتح واتساب — وأي تفاعلٍ أكثر يعني جافاسكربت على كل صفحة مقابل لا شيء.
 *
 * ولا يُرسم إن لم يُضبط `NEXT_PUBLIC_SALES_WHATSAPP`: زرٌّ عائمٌ يفتح محادثةً مع لا أحد
 * أسوأ من غيابه، لأنه يَعِد بإنسانٍ في أكثر لحظةٍ يحتاجه فيها المشتري.
 */
export async function WhatsappFab({ text }: { text?: string }) {
  const wa = await salesWhatsapp();
  if (!wa) return null;

  const href = text ? `${wa.href}?text=${encodeURIComponent(text)}` : wa.href;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`تواصل معنا على واتساب ${wa.label}`}
      /**
       * `start-4`: الصفحة RTL، فـ`start` هو اليمين — موضع الإبهام في يدٍ واحدة.
       *
       * ── `z-[60]`: لا شيء يغطّيه (خالد ١٥ سبتمبر ٢٠٢٦) ──
       * الطبقات في هذا المسار: البطاقات ١٠ · ترويسة ٢٠ · شريط الشراء اللاصق ٥٠. فـ٦٠
       * تضعه فوقها كلّها، وهو المطلوب: زرّ تواصلٍ يختفي خلف شريطٍ لا يعود زرّ تواصل.
       *
       * قيس ما قبله على ٣٢٠px: بـ`z-40` تراكب ٥٦×٥٦ عند `y=1280` فاختفى خلف الشريط،
       * وبـ`z-0` صار كل شيء يعلوه. وجُرّب الرفع الرأسي ثم الإزاحة الأفقية وفشلا —
       * الشريط لاصقٌ فيتحرّك، ويملأ العرض (`16→289` من ٣٢٠) فلا طرف يهرب إليه.
       * فالطبقة هي الحلّ، لا الموضع.
       *
       * والارتفاع من `--fab-bottom` لا ثابتاً: صفحةٌ فيها شريط شراءٍ لاصق ترفعه فوقه.
       * قيس العطل (١٥ سبتمبر ٢٠٢٦ على ٣٧٥px): كان يغطّي **٤٧×٤٨px** من زرّ «شوف سعرها»
       * بـ`z-50` فوق `z-30` — فمن يضغط طرف الزرّ يفتح واتساب بدل أن يشتري.
       * و`z-40` لا `z-50`: الشريط الذي يحمل قرار الشراء يعلوه عند التزاحم.
       *
       * و٥٦px قطراً: فوق حدّ Apple HIG (٤٤pt) بهامش، لأنه هدفٌ يُضغط أثناء التمرير لا
       * من ثبات. والأخضر `#25D366` لون واتساب الرسميّ — استثناءٌ من التوكنات مثل شعارات
       * الدفع: العلامة تُعرَف بلونها، وتلوينها بلون المنصّة يُفقدها التعرّف الفوريّ.
       */
      className="fixed bottom-5 start-4 z-[60] inline-flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_6px_20px_-4px_rgba(37,211,102,.55)] transition-transform duration-150 ease-out hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <Whatsapp className="size-7" aria-hidden />
    </a>
  );
}
