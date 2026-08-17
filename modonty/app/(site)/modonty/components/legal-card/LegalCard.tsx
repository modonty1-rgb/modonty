import Link from "next/link";
import { IconChevronRight, IconEmail, IconExternal, IconMapPin, IconShieldCheck } from "@/lib/icons";
import { ModontyMark } from "@/components/icons/modonty-mark";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { WhatsAppLeadLink } from "@/components/cta/whatsapp-icon-link";
import { messages } from "@/lib/i18n/messages";
import type { LegalEntityDisplay } from "@/lib/seo/to-legal-entity-display";
import type { ComponentType, ReactNode } from "react";

const text = messages.modonty.legal;

// مقر جبر الجنوبية (مدونتي + جبر سيو)، جدة — رابط خرائط أرسله خالد ٢ يونيو ٢٠٢٦. Used only
// when Settings carries no coordinates of its own.
const OFFICE_MAPS_FALLBACK = "https://www.google.com/maps/search/?api=1&query=21.502370834350586,39.1859245300293";

interface LegalCardProps {
  legal: LegalEntityDisplay;
  /** modonty's own `Client` row — the WhatsApp tap is recorded as a lead against it, like any partner. */
  clientId: string;
  clientName: string;
  /** modonty's WhatsApp number (`Client.phone`); null → no row. */
  whatsappPhone: string | null;
}

/**
 * The company's papers, in the rail — the thing that turns «مدونتي» from a website into a
 * registered business (Khalid, 2026-08-17). Same source and wording as `/trust` («تعمل
 * ضمن مظلّة»): modonty is the platform, the company is the operator. Five one-line facts,
 * icon first — the icon IS the label (Khalid: «الأيقونة تدّي المعنى»), the label survives
 * for screen readers only. A fact the visitor can check is a whole-row link that opens the
 * source with a quiet arrow at its end — no pills, no second line. The CR opens `/trust`
 * (our own papers page, which holds the ministry lookup) and «تواصل معنا» opens `/contact`
 * — the visitor stays on the site (Khalid, 2026-08-17). WhatsApp is the one direct line.
 * The header wears the nav's «M» in the accent colour, not a generic shield. An empty
 * column renders no row.
 */
export function LegalCard({ legal, clientId, clientName, whatsappPhone }: LegalCardProps) {
  const mapsHref =
    legal.latitude != null && legal.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${legal.latitude},${legal.longitude}`
      : OFFICE_MAPS_FALLBACK;
  // City + district only — whoever wants the street opens the map (Khalid, 2026-08-17: «جدة، حي الشرفية كافية»).
  const location = [legal.city, legal.district].filter(Boolean).join("، ") || null;
  // «منذ ٢٠٢٤» rides with the operator line (Khalid, 2026-08-17: «تأسّست خذها مع المشغّل الرسمي»).
  const sinceYear = legal.foundedYear ? Number(legal.foundedYear).toLocaleString("ar-SA", { useGrouping: false }) : null;

  return (
    <section aria-labelledby="modonty-legal-heading" className="rounded-lg bg-card p-3 ring-1 ring-primary/10">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-link-accent">
          <ModontyMark className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <h2 id="modonty-legal-heading" className="block truncate text-sm font-medium text-foreground">
            {text.title}
          </h2>
          {/* The operator under the title (Khalid, 2026-08-17: «منصة مدونتي، وتحتها المشغّل الرسمي: شركة جبر الجنوبية»). */}
          {legal.legalName && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {text.operator}: {legal.legalName}
              {sinceYear && <span> · {text.since} {sinceYear}</span>}
            </span>
          )}
        </span>
      </div>

      <ul className="mt-3 space-y-0.5">
        {/* «سجل تجاري رقم …» spelled out — a visitor from Egypt does not know what a bare
            10-digit number is (Khalid, 2026-08-17). Opens /trust, our own papers page. */}
        {legal.cr && (
          <Fact
            icon={IconShieldCheck}
            href="/trust"
            hrefLabel={text.verifyAtTrust}
            value={
              <>
                {text.crPrefix} <span dir="ltr">{legal.cr}</span>
                {legal.isRegistrationActive && (
                  /* A green dot IS the word «نشط» here — the row must stay one line (Khalid). */
                  <span className="ms-1.5 inline-flex items-center align-middle text-emerald-500" title={text.active}>
                    <span aria-hidden className="size-1.5 rounded-full bg-current" />
                    <span className="sr-only">{text.active}</span>
                  </span>
                )}
                {!legal.isRegistrationActive && legal.crStatus && (
                  <span className="ms-2 text-xs text-foreground/60">{legal.crStatus}</span>
                )}
              </>
            }
          />
        )}
        {location && <Fact icon={IconMapPin} label={text.hq} value={location} href={mapsHref} hrefLabel={text.openInMaps} />}
        {whatsappPhone && (
          <li>
            {/* Same tracked link every partner page uses — modonty's own WhatsApp counts as a lead too. */}
            <WhatsAppLeadLink
              phone={whatsappPhone}
              clientId={clientId}
              source="client_page"
              ariaLabel={`${text.whatsapp} — ${clientName}`}
              className={`group ${ROW_CLASS} transition-[background-color,transform] hover:bg-[#25D366]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] motion-safe:active:scale-[0.98]`}
            >
              <span className="grid h-4 w-4 shrink-0 place-items-center text-[#25D366]" aria-hidden>
                <WhatsAppIcon size={16} />
              </span>
              {/* Number stays beside the icon: the row is RTL, only the digits are isolated LTR. */}
              <span className="min-w-0 flex-1 truncate text-sm leading-snug text-foreground/70">
                <span dir="ltr">{whatsappPhone}</span>
              </span>
              <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden>
                <IconExternal className="h-3.5 w-3.5 text-foreground/35 transition-colors group-hover:text-[#25D366]" />
              </span>
            </WhatsAppLeadLink>
          </li>
        )}
        <Fact icon={IconEmail} value={text.contact} href="/contact" hrefLabel={text.contact} />
      </ul>
    </section>
  );
}

/** One row's frame — shared by the facts and the WhatsApp row so all rows sit on one grid. */
const ROW_CLASS = "-mx-1.5 flex items-center gap-2.5 rounded-md px-1.5 py-1.5";

interface FactProps {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  /** Screen-reader label — the icon carries it visually. Omit when the value already says it. */
  label?: string;
  value: ReactNode;
  /** When set, the whole row is the link (opens the source in a new tab; mail opens the client). */
  href?: string;
  hrefLabel?: string;
}

/** One line: icon · value · (a quiet arrow when the row opens somewhere). */
function Fact({ icon: Icon, label, value, href, hrefLabel }: FactProps) {
  const internal = Boolean(href && href.startsWith("/"));
  const body = (
    <>
      <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      {label && <span className="sr-only">{label}: </span>}
      <span className="min-w-0 flex-1 truncate text-sm leading-snug text-foreground/70">{value}</span>
      {/* Same box as the leading icon so both columns sit on one axis: chevron = stays on the
          site, arrow-out = leaves it. */}
      <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden>
        {href && internal && <IconChevronRight className="h-3.5 w-3.5 text-foreground/35 transition-colors rtl:rotate-180 group-hover:text-primary" />}
        {href && !internal && <IconExternal className="h-3.5 w-3.5 text-foreground/35 transition-colors group-hover:text-primary" />}
      </span>
    </>
  );
  const linkClass = `group ${ROW_CLASS} transition-[background-color,transform] hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-safe:active:scale-[0.98]`;

  if (!href) return <li className={ROW_CLASS}>{body}</li>;
  if (internal) {
    return (
      <li>
        <Link href={href} title={hrefLabel} className={linkClass}>
          {body}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" title={hrefLabel} className={linkClass}>
        {body}
      </a>
    </li>
  );
}
