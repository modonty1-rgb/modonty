import Link from "next/link";
import {
  Building2,
  Gem,
  Target,
  Shield,
  Share2,
  ImageIcon,
  ScrollText,
  Send,
  ArrowRight,
  Lock,
  Landmark,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CardSpec {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Organization — social presence + business facts. Both moved out of the
// Modonty Homepage form into their own areas.
const SOCIAL: CardSpec = {
  href: "/settings/social",
  title: "Social Links",
  description:
    "Social profile links shown in the footer + Organization sameAs, and X handles for share cards.",
  icon: Share2,
};

const BUSINESS: CardSpec = {
  href: "/settings/business",
  title: "Business Info",
  description:
    "Contact, address & location — the organization's factual details used in Google's structured data (Knowledge Panel).",
  icon: Building2,
};

const BRAND: CardSpec = {
  href: "/settings/brand",
  title: "Logo & Brand",
  description:
    "Brand description, site logo, mobile icon & alt text — the Organization identity in Google and the navbar logo on every page.",
  icon: Gem,
};

// Sales channel — JBR SEO B2B promo ("بوابة البيع"). Its own area; the panel is shown on the clients hero.
const SALES: CardSpec = {
  href: "/settings/jbr-seo",
  title: "JBR SEO",
  description: "B2B sales channel — the promo panel pitching JBR SEO services on the clients page (CTA → jbrseo.com).",
  icon: Target,
};

// Reference data — admin-managed foundational lookups (countries + licensing
// authorities) reused across the platform (YMYL client verification, etc.).
const REFERENCE: CardSpec = {
  href: "/settings/reference-data",
  title: "Reference Data",
  description:
    "Foundational lookups — countries and the licensing authorities used for YMYL client verification (medical, legal, financial).",
  icon: Landmark,
};

const DEFAULTS: CardSpec = {
  href: "/settings/defaults",
  title: "Default Images",
  description: "Fallback logo, article & hero images shown when an entity has none.",
  icon: ImageIcon,
};

const SYSTEM: CardSpec = {
  href: "/settings/system",
  title: "System",
  description: "Technical defaults — charset, robots, OG types, sitemap.",
  icon: Shield,
};

const DISCLAIMER: CardSpec = {
  href: "/settings/disclaimer",
  title: "Content Disclaimer",
  description: "Content-responsibility text clients accept before saving sensitive data.",
  icon: ScrollText,
};

const TELEGRAM: CardSpec = {
  href: "/settings/telegram",
  title: "Telegram",
  description: "Admin activity feed — mirror client events to the admin Telegram channel (more bot controls later).",
  icon: Send,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5 mt-5 first:mt-1">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">{children}</h2>
      <span className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}

export default function SettingsDashboardPage() {
  // Editable: Social, Business, Brand, JBR, Reference, Default Images, Disclaimer, Telegram (8) + System (read-only).
  const editableCount = 8;
  const total = editableCount + 1;

  return (
    <div className="max-w-[1080px] mx-auto pb-6">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            System &amp; sales configuration. Page content and SEO now live under the <span className="font-medium text-foreground">Modonty</span> group in the sidebar.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {total} areas
          </span>
          <span>
            <span className="font-semibold text-foreground">{editableCount}</span> editable ·{" "}
            <span className="font-semibold text-foreground">1</span> system
          </span>
        </div>
      </header>

      {/* ── Organization — social presence + business facts ── */}
      <SectionLabel>Organization</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Link
          href={SOCIAL.href}
          title={SOCIAL.description}
          className="group flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
        >
          <div className="h-10 w-10 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
            <SOCIAL.icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold truncate">{SOCIAL.title}</h3>
          <span className="flex-none text-[9.5px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
            Footer · sameAs · X cards
          </span>
          <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
        <Link
          href={BUSINESS.href}
          title={BUSINESS.description}
          className="group flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
        >
          <div className="h-10 w-10 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
            <BUSINESS.icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold truncate">{BUSINESS.title}</h3>
          <span className="flex-none text-[9.5px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
            Contact · Address · Maps
          </span>
          <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
        <Link
          href={BRAND.href}
          title={BRAND.description}
          className="group flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
        >
          <div className="h-10 w-10 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
            <BRAND.icon className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-bold truncate">{BRAND.title}</h3>
          <span className="flex-none text-[9.5px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
            Identity · Logo · Alt
          </span>
          <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ── Sales channel — JBR SEO (بوابة البيع) ── */}
      <SectionLabel>Sales channel</SectionLabel>
      <Link
        href={SALES.href}
        title={SALES.description}
        className="group flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
      >
        <div className="h-10 w-10 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
          <SALES.icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold truncate">{SALES.title}</h3>
        <span className="flex-none text-[9.5px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
          B2B · jbrseo.com
        </span>
        <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* ── Reference data — admin-managed foundational lookups ── */}
      <SectionLabel>Reference data</SectionLabel>
      <Link
        href={REFERENCE.href}
        title={REFERENCE.description}
        className="group flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/30"
      >
        <div className="h-10 w-10 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
          <REFERENCE.icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold truncate">{REFERENCE.title}</h3>
        <span className="flex-none text-[9.5px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
          Countries · Authorities
        </span>
        <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
      </Link>

      {/* ── Assets & system ── */}
      <SectionLabel>Assets &amp; system</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Default images — editable */}
        <Link
          href={DEFAULTS.href}
          title={DEFAULTS.description}
          className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="h-9 w-9 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
            <DEFAULTS.icon className="h-[18px] w-[18px]" />
          </div>
          <h3 className="text-sm font-semibold truncate">{DEFAULTS.title}</h3>
          <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* System — read-only (still viewable) */}
        <Link
          href={SYSTEM.href}
          title={SYSTEM.description}
          className="group flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="h-9 w-9 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center">
            <SYSTEM.icon className="h-[18px] w-[18px]" />
          </div>
          <h3 className="text-sm font-semibold truncate">{SYSTEM.title}</h3>
          <span className="ms-auto inline-flex flex-none items-center gap-1 text-[9.5px] font-bold uppercase tracking-wide text-muted-foreground border rounded-full px-2 py-0.5">
            <Lock className="h-2.5 w-2.5" />
            Read-only
          </span>
          <ArrowRight className="h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Content disclaimer — editable */}
        <Link
          href={DISCLAIMER.href}
          title={DISCLAIMER.description}
          className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="h-9 w-9 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
            <DISCLAIMER.icon className="h-[18px] w-[18px]" />
          </div>
          <h3 className="text-sm font-semibold truncate">{DISCLAIMER.title}</h3>
          <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Telegram — admin activity feed (editable) */}
        <Link
          href={TELEGRAM.href}
          title={TELEGRAM.description}
          className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="h-9 w-9 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
            <TELEGRAM.icon className="h-[18px] w-[18px]" />
          </div>
          <h3 className="text-sm font-semibold truncate">{TELEGRAM.title}</h3>
          <ArrowRight className="ms-auto h-4 w-4 flex-none text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
}
