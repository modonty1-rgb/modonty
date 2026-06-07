import Link from "next/link";
import {
  Building2,
  Target,
  Briefcase,
  FolderTree,
  Tag,
  Factory,
  Newspaper,
  Flame,
  Shield,
  ImageIcon,
  ScrollText,
  Send,
  ArrowRight,
  Lock,
  Landmark,
} from "lucide-react";
import { db } from "@/lib/db";
import { getAllSettings, type AllSettings } from "./actions/settings-actions";
import { formatTimeAgo } from "./_shared/format-time-ago";

export const dynamic = "force-dynamic";

interface CardSpec {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  cacheKey: keyof AllSettings | null;
  tag?: string;
}

// Dominant focal point — the richest, most-edited surface.
const HERO: CardSpec = {
  href: "/settings/modonty",
  title: "Modonty Homepage",
  description:
    "Site identity, SEO, homepage banner, contact details, address, and social profiles — everything visitors see first.",
  icon: Building2,
  cacheKey: "jsonLdLastGenerated",
};

// Sales channel — JBR SEO B2B promo ("بوابة البيع"). Its own area; the panel is shown on the clients hero.
const SALES: CardSpec = {
  href: "/settings/jbr-seo",
  title: "JBR SEO",
  description: "B2B sales channel — the promo panel pitching JBR SEO services on the clients page (CTA → jbrseo.com).",
  icon: Target,
  cacheKey: null,
};

// Secondary, homogeneous group — SEO + metadata for each public listing.
const LISTINGS: CardSpec[] = [
  {
    href: "/settings/clients",
    title: "Clients",
    description: "SEO and metadata for the clients listing.",
    icon: Briefcase,
    cacheKey: "clientsPageJsonLdLastGenerated",
  },
  {
    href: "/settings/categories",
    title: "Categories",
    description: "SEO and metadata for the categories listing.",
    icon: FolderTree,
    cacheKey: "categoriesPageJsonLdLastGenerated",
  },
  {
    href: "/settings/tags",
    title: "Tags",
    description: "SEO and metadata for the tags listing.",
    icon: Tag,
    cacheKey: "tagsPageJsonLdLastGenerated",
  },
  {
    href: "/settings/industries",
    title: "Industries",
    description: "SEO and metadata for the industries listing.",
    icon: Factory,
    cacheKey: "industriesPageJsonLdLastGenerated",
  },
  {
    href: "/settings/articles",
    title: "Articles",
    description: "SEO and metadata for the articles listing.",
    icon: Newspaper,
    cacheKey: "articlesPageJsonLdLastGenerated",
  },
  {
    href: "/settings/trending",
    title: "Trending",
    description: "SEO and metadata for the trending articles page.",
    icon: Flame,
    cacheKey: "trendingPageJsonLdLastGenerated",
  },
];

// Reference data — admin-managed foundational lookups (countries + licensing
// authorities) reused across the platform (YMYL client verification, etc.).
const REFERENCE: CardSpec = {
  href: "/settings/reference-data",
  title: "Reference Data",
  description:
    "Foundational lookups — countries and the licensing authorities used for YMYL client verification (medical, legal, financial).",
  icon: Landmark,
  cacheKey: null,
};

const DEFAULTS: CardSpec = {
  href: "/settings/defaults",
  title: "Default Images",
  description: "Fallback logo, article & hero images shown when an entity has none.",
  icon: ImageIcon,
  cacheKey: null,
};

const SYSTEM: CardSpec = {
  href: "/settings/system",
  title: "System",
  description: "Technical defaults — charset, robots, OG types, sitemap.",
  icon: Shield,
  cacheKey: null,
};

const DISCLAIMER: CardSpec = {
  href: "/settings/disclaimer",
  title: "Content Disclaimer",
  description: "Content-responsibility text clients accept before saving sensitive data.",
  icon: ScrollText,
  cacheKey: null,
};

const TELEGRAM: CardSpec = {
  href: "/settings/telegram",
  title: "Telegram",
  description: "Admin activity feed — mirror client events to the admin Telegram channel (more bot controls later).",
  icon: Send,
  cacheKey: null,
};

const DAY_MS = 86_400_000;
const STALE_DAYS = 30;

function SectionLabel({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5 mt-5 first:mt-1">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">{children}</h2>
      {count != null && (
        <span className="text-[10px] font-semibold text-muted-foreground/70 bg-muted border rounded-full px-2 py-0.5 tabular-nums">
          {count}
        </span>
      )}
      <span className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
    </div>
  );
}

function Freshness({ date }: { date: Date | string | null }) {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / DAY_MS);
  const stale = days > STALE_DAYS;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
      title={stale ? "Cache is over a month old — consider regenerating" : "Cache up to date"}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${stale ? "bg-amber-500" : "bg-emerald-500"}`} />
      {formatTimeAgo(date)}
    </span>
  );
}

export default async function SettingsDashboardPage() {
  // Parallel — settings + per-area data counts (no waterfall).
  const [settings, clientCount, categoryCount, tagCount, industryCount, articleCount] =
    await Promise.all([
      getAllSettings(),
      db.client.count(),
      db.category.count(),
      db.tag.count(),
      db.industry.count(),
      db.article.count(),
    ]);

  // Data counts keyed by href. Trending is a dynamic page (top articles) — no stored count.
  const COUNTS: Record<string, number> = {
    "/settings/clients": clientCount,
    "/settings/categories": categoryCount,
    "/settings/tags": tagCount,
    "/settings/industries": industryCount,
    "/settings/articles": articleCount,
  };

  const cacheOf = (key: keyof AllSettings | null) =>
    key ? (settings[key] as Date | string | null) : null;

  // Freshest = most recently generated cache across all cached areas (for the header chip).
  const allDates = [HERO, ...LISTINGS]
    .map((c) => cacheOf(c.cacheKey))
    .filter(Boolean)
    .map((d) => new Date(d as Date | string).getTime());
  const freshest = allDates.length ? new Date(Math.max(...allDates)) : null;

  const editableCount = 2 + LISTINGS.length + 1; // homepage + jbr + listings + default images
  const total = editableCount + 1; // + system (read-only)

  const HeroIcon = HERO.icon;

  return (
    <div className="max-w-[1080px] mx-auto pb-6">
      <header className="mb-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Configure modonty.com once — pick an area below. Your team handles the rest.
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
          {freshest && (
            <span>
              Freshest cache <span className="font-semibold text-foreground">{formatTimeAgo(freshest)}</span>
            </span>
          )}
        </div>
      </header>

      {/* ── Main site — dominant focal point ── */}
      <SectionLabel>Main site</SectionLabel>
      <Link
        href={HERO.href}
        title={HERO.description}
        className="group relative flex items-center gap-3.5 rounded-xl border bg-card ring-1 ring-inset ring-primary/20 px-4 py-3.5 overflow-hidden transition-colors hover:bg-muted/30"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-primary/[0.07] via-transparent to-transparent pointer-events-none" />
        <div className="relative h-10 w-10 flex-none rounded-lg bg-primary/10 text-primary grid place-items-center">
          <HeroIcon className="h-5 w-5" />
        </div>
        <h3 className="relative text-sm font-bold truncate">{HERO.title}</h3>
        <span className="relative flex-none text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
          Primary
        </span>
        <div className="relative ms-auto flex flex-none items-center gap-3">
          <Freshness date={cacheOf(HERO.cacheKey)} />
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>

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

      {/* ── Listing pages — secondary, homogeneous ── */}
      <SectionLabel count={LISTINGS.length}>Listing pages · SEO &amp; metadata</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {LISTINGS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              title={card.description}
              className="group flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="h-9 w-9 flex-none rounded-lg bg-muted text-muted-foreground grid place-items-center transition-colors group-hover:text-foreground">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <h3 className="text-sm font-semibold truncate">{card.title}</h3>
              {COUNTS[card.href] != null && (
                <span
                  className="flex-none text-[11px] font-semibold tabular-nums text-foreground/80 bg-muted rounded-full px-2 py-0.5"
                  title={`${COUNTS[card.href]} total`}
                >
                  {COUNTS[card.href]}
                </span>
              )}
              {card.tag && (
                <span className="flex-none text-[9.5px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/25 rounded-full px-2 py-0.5">
                  {card.tag}
                </span>
              )}
              <div className="ms-auto flex flex-none items-center gap-3">
                <Freshness date={cacheOf(card.cacheKey)} />
                <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

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
