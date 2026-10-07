import { SAUDI_BUSINESS_VERIFY_URL } from "@/constants";
import { IconMapPin, IconShieldCheck, IconWallet } from "@/lib/icons";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import { CAPITAL_CURRENCY_LABEL } from "../../helpers/story-constants";

interface TrustStripProps {
  /** Read from Settings by the server page — rendered as-is. */
  legal: LegalEntityDisplay;
  siteName?: string;
}

/** COMPACT TRUST STRIP — landmark section + lucide icons + balanced visual weight. */
export function TrustStrip({ legal, siteName }: TrustStripProps) {
  return (
    <section
      aria-label="بيانات الشركة الموثّقة"
      className="mb-5 pt-3 border-t border-border/30 space-y-1.5"
    >
      {/* Row 1: Brand/DBA + verification cluster (نشط badge + تحقّق link) */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs leading-snug min-w-0 flex-1">
          <span className="font-bold text-foreground/95">{siteName}</span>
          {legal.legalName && (
            <span className="text-foreground/65"> · تحت مظلة {legal.legalName}</span>
          )}
        </p>
        <div className="inline-flex items-center gap-1.5 shrink-0">
          {legal.crStatus && (
            <span
              className={
                legal.isRegistrationActive
                  ? "inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded"
                  : "inline-flex items-center gap-1 text-xs font-bold text-foreground/60 bg-foreground/10 px-1.5 py-0.5 rounded"
              }
            >
              {/* The shield is a claim of good standing — it goes with the
                  status, not with the mere presence of one. */}
              {legal.isRegistrationActive && (
                <IconShieldCheck className="w-3 h-3" aria-hidden />
              )}
              {legal.crStatus}
            </span>
          )}
          {legal.cr && (
            <a
              href={SAUDI_BUSINESS_VERIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-primary hover:underline whitespace-nowrap max-md:inline-flex max-md:items-center max-md:justify-center max-md:min-h-11 max-md:min-w-11 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded"
              aria-label={`ابحث بالرقم ${legal.cr} في وزارة التجارة`}
            >
              تحقّق
              <span aria-hidden> ↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Row 2: Credentials strip — wrap-safe, balanced weight, Latin year for numeric consistency */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {legal.cr && (
          <span className="inline-flex items-center gap-1">
            <span className="text-emerald-500" aria-hidden>
              ✓
            </span>
            <span className="text-foreground/65">سجل</span>
            <span
              className="font-mono font-bold text-foreground text-xs tracking-tight"
              dir="ltr"
            >
              {legal.cr}
            </span>
          </span>
        )}
        {legal.capital && (
          <span
            className="inline-flex items-baseline gap-1"
            aria-label={`رأس المال ${legal.capital} ${CAPITAL_CURRENCY_LABEL}`}
          >
            <IconWallet className="w-3 h-3 text-amber-600 dark:text-amber-400 self-center" aria-hidden />
            <span className="text-foreground/65 text-xs" aria-hidden>
              رأس المال
            </span>
            <span
              className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs tracking-tight"
              dir="ltr"
              aria-hidden
            >
              {legal.capital}
            </span>
            <span className="font-bold text-amber-600/85 dark:text-amber-400/85 text-xs" aria-hidden>
              {CAPITAL_CURRENCY_LABEL}
            </span>
          </span>
        )}
        {(legal.city || legal.country || legal.foundedYear) && (
          <span className="inline-flex items-center gap-1 text-foreground/65">
            <IconMapPin className="w-3 h-3" aria-hidden />
            <span>
              {[legal.city, legal.country, legal.foundedYear]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </span>
        )}
      </div>
    </section>
  );
}
