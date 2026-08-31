import { WhatsAppIcon } from "../../icons/whatsapp-icon";
import { cn } from "../../../lib/utils/index";

/**
 * أخضر واتساب — زرّ الطلب في كل موقع شريك (خالد ١٧ أغسطس).
 *
 * اللون الشهير `#25D366` هويّة، لا لونَ نصّ ولا سطحَ نصّ. المقيس (٣١ أغسطس):
 *   أبيض فوق `#25D366`  = ١٫٩٨:١   ← وWCAG 1.4.3 يفرض ٤٫٥:١
 *   `#25D366` نصّاً على الفاتح = ١٫٧٧:١
 * فصارت ثلاثة ألوان من العائلة نفسها، كلٌّ لموضعه، وكلها مقيسة:
 *   تعبئة + نصّ أبيض → `#0E7C6B` = ٥٫١:١
 *   نصّ على الفاتح   → `#0E7C6B` = ٤٫٥٦:١
 *   نصّ على الداكن   → `#25D366` = ٩٫١٨:١
 */
export const WHATSAPP_GREEN = "#25D366";
/** السطح الذي يحمل نصّاً أبيض — أخضر واتساب الغامق. */
export const WHATSAPP_SURFACE = "#0E7C6B";

export interface WhatsAppButtonProps {
  /** wa.me link. When absent (console preview) the button renders inert. */
  href?: string | null;
  variant?: "solid" | "outline-light" | "round" | "text";
  className?: string;
}

/**
 * One button, four shapes: solid pill (default) · outlined white (over images) ·
 * round icon (compact bars) · text link (footers). Same anchor everywhere.
 */
export function WhatsAppButton({ href, variant = "solid", className }: WhatsAppButtonProps) {
  const label = "واتساب";
  const inner =
    variant === "round" ? (
      <WhatsAppIcon size={20} />
    ) : (
      <>
        <WhatsAppIcon size={16} /> {label}
      </>
    );

  const classes = cn(
    "inline-flex items-center gap-2 text-sm font-bold",
    // 40px is under the 44px floor on touch. Raised on phones only, so every desktop
    // partner site keeps the exact pill it has today.
    variant === "solid" && "h-10 rounded-full px-5 text-white max-md:h-11",
    variant === "outline-light" && "h-10 rounded-full border border-white/80 px-5 text-white max-md:h-11",
    variant === "round" && "grid h-10 w-10 place-items-center rounded-full text-white max-md:h-11 max-md:w-11",
    // النصّ يبدّل بالسمة: الغامق يُقرأ على الفاتح، والفاتح يُقرأ على الداكن.
    variant === "text" && "font-medium text-[#0E7C6B] dark:text-[#25D366] max-md:min-h-11",
    className,
  );
  const style =
    variant === "solid" || variant === "round" ? { backgroundColor: WHATSAPP_SURFACE } : undefined;

  if (!href) {
    return (
      <span className={classes} style={style} aria-label={variant === "round" ? label : undefined}>
        {inner}
      </span>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={classes} style={style} aria-label={variant === "round" ? label : undefined}>
      {inner}
    </a>
  );
}
