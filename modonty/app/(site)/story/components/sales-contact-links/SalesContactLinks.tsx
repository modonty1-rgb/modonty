import { IconEmail } from "@/lib/icons";
import { WhatsAppIcon } from "../whatsapp-icon/WhatsAppIcon";
import { salesWhatsappUrl } from "../../helpers/sales-whatsapp-url";
import { SALES_EMAIL, SALES_EMAIL_URL, SALES_WHATSAPP_DISPLAY } from "../../helpers/sales-contacts";

interface SalesContactLinksProps {
  siteName?: string;
}

/** Tertiary — compact contact links (no headers, no cards). */
export function SalesContactLinks({ siteName }: SalesContactLinksProps) {
  return (
    <div className="mb-5 pt-3 border-t border-border/40 space-y-1">
      <a
        href={salesWhatsappUrl(siteName)}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-2 text-[12px] py-1 max-md:min-h-11 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
        aria-label={`واتساب المبيعات — ${SALES_WHATSAPP_DISPLAY}`}
      >
        <WhatsAppIcon className="w-4 h-4 text-emerald-500/80 shrink-0" />
        <span className="text-foreground/55">واتساب:</span>
        <span
          className="font-mono font-bold text-foreground/85 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
          dir="ltr"
        >
          {SALES_WHATSAPP_DISPLAY}
        </span>
      </a>
      <a
        href={SALES_EMAIL_URL}
        className="group flex items-center gap-2 text-[12px] py-1 max-md:min-h-11 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
        aria-label={`إيميل المبيعات — ${SALES_EMAIL}`}
      >
        <IconEmail className="w-4 h-4 text-foreground/50 shrink-0" />
        <span className="text-foreground/55">إيميل:</span>
        <span
          className="font-medium text-foreground/85 group-hover:text-foreground transition-colors"
          dir="ltr"
        >
          {SALES_EMAIL}
        </span>
      </a>
    </div>
  );
}
