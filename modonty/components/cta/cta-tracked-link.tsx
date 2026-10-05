"use client";

import { IntentLink } from "@/components/shared/intent-link/IntentLink";
import { trackCtaClick } from "@/lib/analytics/cta-tracking";
import type { CTAType } from "@/lib/analytics/cta-tracking";
import { recordWhatsappLead } from "@/components/shared/booking-form/booking-actions";

/** نفس قاعدة `isWhatsAppUrl` في مسار المقال — هنا لأنّ المكوّن مشترك ولا يستورد من مسار. */
function isWhatsAppHref(raw: string): boolean {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return host === "wa.me" || host.endsWith("whatsapp.com");
  } catch {
    return false;
  }
}


interface CtaTrackedLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  label: string;
  type: CTAType;
  articleId?: string;
  clientId?: string;
  /** Extra side-effect fired alongside CTA tracking (e.g. recordWhatsappLead). */
  onBeforeNavigate?: () => void;
  children: React.ReactNode;
}

export function CtaTrackedLink({
  href,
  label,
  type,
  articleId,
  clientId,
  onBeforeNavigate,
  className,
  target,
  rel,
  children,
  ...rest
}: CtaTrackedLinkProps) {
  return (
    <IntentLink
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => {
        trackCtaClick({ type, label, targetUrl: href, articleId, clientId });
        if (onBeforeNavigate) onBeforeNavigate();
        // زرّ واتساب العميل يسجّل تواصلاً (ومنه جرس تطبيق الكونسول) — كان يُحسب نقرةً فقط في
        // زرّ المقال وواجهة صفحة العميل، فلا يصل العميل خبرٌ (اختبار ٥ أكتوبر ٢٠٢٦).
        else if (clientId && isWhatsAppHref(href)) {
          void recordWhatsappLead({ clientId, source: articleId ? "article_dock" : "client_page", articleId: articleId ?? null });
        }
      }}
      {...rest}
    >
      {children}
    </IntentLink>
  );
}
