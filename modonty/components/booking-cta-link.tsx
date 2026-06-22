import Link from "@/components/link";
import { IconCalendar } from "@/lib/icons";

interface BookingCtaLinkProps {
  /** Client slug — the booking page lives at /clients/[slug]/book. */
  clientSlug: string;
  /** Button label override (defaults to «احجز الآن»). */
  label?: string | null;
  /** Tracking source carried as ?source= for the booking record. */
  source?: string;
  /** Article context carried as ?article= when booked from an article. */
  articleId?: string | null;
  /** Style override; defaults to the primary full-width button. */
  className?: string;
}

/**
 * FORM-mode CTA — a styled Link to the standalone booking page (replaces the old
 * BookingDialog). Plain server component = zero client JS; the page enforces the
 * YMYL acknowledgment gate. Conversion is recorded server-side on submit.
 */
export function BookingCtaLink({ clientSlug, label, source, articleId, className }: BookingCtaLinkProps) {
  const params = new URLSearchParams();
  if (source) params.set("source", source);
  if (articleId) params.set("article", articleId);
  const qs = params.toString();
  const href = `/clients/${encodeURIComponent(clientSlug)}/book${qs ? `?${qs}` : ""}`;

  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      }
    >
      <IconCalendar className="h-4 w-4" />
      {label?.trim() || "احجز الآن"}
    </Link>
  );
}
