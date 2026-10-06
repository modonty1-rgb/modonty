import { SiteLink } from "../../parts/site-link";
import { WhatsAppIcon } from "../../../icons/whatsapp-icon";
import { cn } from "../../../../lib/utils/index";
import { WHATSAPP_SURFACE } from "../../parts/whatsapp-button";
import type { HomeData } from "../home/home-data";
import { bookingLabel } from "../booking/booking-label";

/**
 * نصّ الشريط، مصدره واحد: يرسمه المكوّن أدناه، وتقرأه شاشة «محتوى الموقع» لتُري الشريك
 * ما يصل الزائر حرفياً. نسخةٌ ثانية مكتوبة هناك كانت ستكذب بعد أوّل تعديل هنا.
 */
export function finalCtaLines(name: string, booking?: HomeData["booking"]): string[] {
  // No partner name in the heading: a long one ran three lines on a phone (review, 4 Oct 2026) —
  // and the visitor already knows whose site this is from the header right above.
  void name;
  return ["مستعدّ للخطوة الأولى؟", "اترك رسالة ونردّ عليك بأقرب وقت.", `زرّ: ${finalCtaAction(booking).label}`];
}

/**
 * The button follows the request button the admin chose (4 Oct 2026) — it was always WhatsApp,
 * so a clinic whose button is a booking form ended its page on «راسلنا على واتساب».
 * FORM → his booking page · LINK → his link · nothing set → WhatsApp.
 */
function finalCtaAction(booking?: HomeData["booking"]): { kind: "form" | "link" | "whatsapp"; label: string; url: string | null } {
  if (booking?.mode === "FORM") return { kind: "form", label: bookingLabel(booking), url: null };
  if (booking?.mode === "LINK" && booking.url) return { kind: "link", label: bookingLabel(booking), url: booking.url };
  return { kind: "whatsapp", label: "راسلنا على واتساب", url: null };
}

/**
 * «النداء الأخير» — شريط بلون العلامة، سطرٌ وزرّ واتساب (Tailwind "CTA section").
 *
 * الحوامش على الحاوية لا على القسم — كبقيّة الأقسام وبنفس السُلَّم (٤٨/٦٤). كان القسم
 * يحمل `px-6` والشريط `px-8` فوقها، فيبدأ نصّه عند **٥٦px** بينما كل قسم آخر يبدأ عند
 * ٢٤ — يخسر الجوّال ٣٢px من عرضه ويكسر عمود الصفحة (مقيس ٣١ أغسطس).
 */
export function FinalCta({ data, preview = false }: { data: HomeData; preview?: boolean }) {
  const action = finalCtaAction(data.booking);
  const isWa = action.kind === "whatsapp" || /wa\.me|whatsapp\.com/i.test(action.url ?? "");
  const btn = (
    // The text colour must be set: on the brand band it inherited white, so a booking/link button
    // was a blank white pill (measured 4 Oct 2026, «احجز موعدك» invisible). WhatsApp keeps its green.
    <span className="inline-flex h-11 items-center gap-2 rounded-[var(--ps-radius-control,9999px)] bg-white px-6 text-sm font-bold" style={{ color: isWa ? WHATSAPP_SURFACE : data.primaryColor ?? "hsl(var(--primary))" }}>
      {isWa ? <WhatsAppIcon size={16} /> : null} {action.label}
    </span>
  );
  const href =
    action.kind === "form" ? data.bookHref ?? null : action.kind === "link" ? action.url : data.whatsappHref ?? null;
  const live = !preview && href && !href.startsWith("#");
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
      <div className="mx-auto max-w-[1128px] px-6 py-[var(--ps-section-y,3rem)] md:py-[var(--ps-section-y-md,4rem)]">
        <div
          className={cn("flex flex-wrap items-center justify-between gap-6 rounded-[var(--ps-radius-card,0.5rem)] px-5 py-6 md:px-8 md:py-8", band)}
          style={data.primaryColor ? { backgroundColor: data.primaryColor } : undefined}
        >
          <div>
            {/* A heading, not a <p> — the page's closing question was invisible to heading navigation. */}
            <h2 className="text-2xl font-bold leading-tight">{finalCtaLines(data.name)[0]}</h2>
            {/* بلا شفافية: التدرّج بالحجم والوزن، لا بخفض التباين. */}
            <p className="mt-1 text-sm">{finalCtaLines(data.name)[1]}</p>
          </div>
          {live ? <SiteLink href={href!} {...(action.kind === "form" ? {} : { target: "_blank", rel: "noopener noreferrer" })}>{btn}</SiteLink> : btn}
        </div>
      </div>
    </section>
  );
}
