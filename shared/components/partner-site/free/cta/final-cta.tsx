import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { WHATSAPP_SURFACE } from "../../parts/whatsapp-button";
import type { HomeData } from "../home/home-data";

/**
 * نصّ الشريط، مصدره واحد: يرسمه المكوّن أدناه، وتقرأه شاشة «محتوى الموقع» لتُري الشريك
 * ما يصل الزائر حرفياً. نسخةٌ ثانية مكتوبة هناك كانت ستكذب بعد أوّل تعديل هنا.
 */
export function finalCtaLines(name: string): string[] {
  return [`جاهز تبدأ مع ${name}؟`, "اترك رسالة ونردّ عليك في نفس اليوم.", "زرّ: راسلنا على واتساب"];
}

/**
 * «النداء الأخير» — شريط بلون العلامة، سطرٌ وزرّ واتساب (Tailwind "CTA section").
 *
 * الحوامش على الحاوية لا على القسم — كبقيّة الأقسام وبنفس السُلَّم (٤٨/٦٤). كان القسم
 * يحمل `px-6` والشريط `px-8` فوقها، فيبدأ نصّه عند **٥٦px** بينما كل قسم آخر يبدأ عند
 * ٢٤ — يخسر الجوّال ٣٢px من عرضه ويكسر عمود الصفحة (مقيس ٣١ أغسطس).
 */
export function FinalCta({ data }: { data: HomeData; preview?: boolean }) {
  const btn = (
    <span className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-bold" style={{ color: WHATSAPP_SURFACE }}>
      <WhatsAppIcon size={16} /> راسلنا على واتساب
    </span>
  );
  /**
   * لون الشريط يقرّر لون نصّه:
   * - لون الشريك → أبيض. لوحة الألوان الثمانية كلّها ≥ ٤٫٥:١ تحت نصّ أبيض، مقيسة
   *   في `partner-site-palette.ts` (أدناها البرتقالي ٥٫١٨).
   * - بلا لون → `bg-primary` مع زوجه `text-primary-foreground`. الأبيض المكتوب يدوياً هنا
   *   كان يسقط إلى ٣٫٦٨:١ في السمة الداكنة (اللون الأساسي فاتح)، و`white/80` إلى ٢٫٩٢.
   */
  const band = data.primaryColor ? "text-white" : "bg-primary text-primary-foreground";

  return (
    <section id="cta">
      <div className="mx-auto max-w-[1128px] px-6 py-12 md:py-16">
        <div
          className={cn("flex flex-wrap items-center justify-between gap-6 rounded-lg px-5 py-6 md:px-8 md:py-8", band)}
          style={data.primaryColor ? { backgroundColor: data.primaryColor } : undefined}
        >
          <div>
            <p className="text-2xl font-bold leading-tight">{finalCtaLines(data.name)[0]}</p>
            {/* بلا شفافية: التدرّج بالحجم والوزن، لا بخفض التباين. */}
            <p className="mt-1 text-sm">{finalCtaLines(data.name)[1]}</p>
          </div>
          {data.whatsappHref ? <a href={data.whatsappHref} target="_blank" rel="noopener noreferrer">{btn}</a> : btn}
        </div>
      </div>
    </section>
  );
}
