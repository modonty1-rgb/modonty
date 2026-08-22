import { WhatsAppIcon } from "../../icons/whatsapp-icon";
import { cn } from "../../../lib/utils/index";

/** WhatsApp brand green — the request button on every partner site (Khalid 2026-08-17). */
export const WHATSAPP_GREEN = "#25D366";

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
    variant === "text" && "font-medium max-md:min-h-11",
    className,
  );
  const style =
    variant === "solid" || variant === "round"
      ? { backgroundColor: WHATSAPP_GREEN }
      : variant === "text"
        ? { color: WHATSAPP_GREEN }
        : undefined;

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
