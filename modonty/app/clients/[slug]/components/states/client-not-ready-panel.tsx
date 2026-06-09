import Link from "@/components/link";
import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { BookingDialog } from "@/app/articles/[slug]/components/booking-dialog";

interface Props {
  clientId: string;
  clientName: string;
  ctaMode: "NONE" | "FORM" | "LINK";
  ctaUrl: string | null;
  ctaLabel: string | null;
  user: { name: string | null; email: string | null } | null;
}

/**
 * «قيد التجهيز» — shown when an active partner has no substantive content yet.
 * No fake content, no empty sections; just contact/booking + browse. The page
 * is set noindex,follow in generateMetadata for this state (thin content).
 */
export function ClientNotReadyPanel({ clientId, clientName, ctaMode, ctaUrl, ctaLabel, user }: Props) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <div className="px-6 py-10 text-center">
        <span
          className="mx-auto mb-4 grid h-[66px] w-[66px] place-items-center rounded-2xl bg-gradient-to-br from-foreground to-accent text-white"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </span>
        <h2 className="mb-2 text-lg font-black text-foreground">صفحة هذا الشريك قيد التجهيز</h2>
        <p className="mx-auto mb-[18px] max-w-[440px] text-[13px] leading-[1.75] text-muted-foreground">
          نعمل مع «{clientName}» على تجهيز محتواها وخدماتها. تابعها ليصلك أول محتوى، أو تواصل معها مباشرة.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {ctaMode === "FORM" && (
            <div className="min-w-[180px]">
              <BookingDialog
                clientId={clientId}
                clientName={clientName}
                source="client_page"
                user={user}
                label={ctaLabel}
              />
            </div>
          )}
          {ctaMode === "LINK" && ctaUrl && (
            <CtaTrackedLink
              href={ctaUrl}
              label="Not-ready – CTA link"
              type="LINK"
              clientId={clientId}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              {ctaLabel?.trim() || "تواصل / احجز"}
            </CtaTrackedLink>
          )}
          <Link
            href="/clients"
            className="inline-flex items-center justify-center gap-2 rounded-md border bg-card px-4 py-2.5 text-sm font-bold text-foreground hover:bg-muted"
          >
            تصفّح شركاء آخرين ›
          </Link>
        </div>
      </div>
    </div>
  );
}
