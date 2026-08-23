import "server-only";

import { db } from "../db";

const SETTINGS_SINGLETON_WHERE = { singletonKey: "global" as const };

/** Emails go out in bursts (a newsletter, a batch of invoices) — one read serves five minutes. */
const CACHE_TTL_MS = 5 * 60 * 1000;
let cached: { html: string | null; at: number } | null = null;

/**
 * The platform's legal registry as ONE footer block, from `Settings.org*` — the same fields
 * /trust and the invoice show (Khalid 2026-08-20: an email without them is incomplete).
 *
 * Returns `null` when the registry is not usable yet: production Settings can be partially
 * filled, and a footer with an address but no CR is worse than the hardcoded fallback.
 * The rule is the invoice's rule — CR and unified number both present, or nothing.
 */
export async function getLegalFooterHtml(): Promise<string | null> {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.html;

  const s = await db.settings.findUnique({
    where: SETTINGS_SINGLETON_WHERE,
    select: {
      orgLegalName: true,
      orgCommercialRegistrationNumber: true,
      orgUnifiedNationalNumber: true,
      orgLegalForm: true,
      orgCapitalAmount: true,
      orgStreetAddress: true,
      orgAddressNeighborhood: true,
      orgAddressLocality: true,
    },
  });

  const t = (v: string | null | undefined) => v?.trim() || null;
  const cr = t(s?.orgCommercialRegistrationNumber);
  const unified = t(s?.orgUnifiedNationalNumber);

  let html: string | null = null;
  if (s && cr && unified) {
    const line1 = [t(s.orgLegalName), `السجل التجاري ${cr}`, `الرقم الوطني الموحّد ${unified}`, t(s.orgLegalForm)]
      .filter(Boolean)
      .join(" &nbsp;·&nbsp; ");
    const address = [t(s.orgAddressLocality), t(s.orgAddressNeighborhood), t(s.orgStreetAddress)]
      .filter(Boolean)
      .join(" — ");
    // `orgCapitalAmount` is free text «as registered» — it may already carry «ريال»/«﷼»
    // (dev: «50,000 ريال»). Append the sign only when the value has none.
    const capital = t(s.orgCapitalAmount);
    const capitalLabel = capital ? `رأس المال ${capital}${/ريال|﷼|ر\.س/.test(capital) ? "" : " ﷼"}` : null;
    const line2 = [address || null, capitalLabel].filter(Boolean).join(" &nbsp;·&nbsp; ");
    html = [line1, line2].filter(Boolean).join("<br/>");
  }

  cached = { html, at: Date.now() };
  return html;
}
