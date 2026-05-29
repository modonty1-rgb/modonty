import Link from "next/link";
import {
  Building2,
  Briefcase,
  FolderTree,
  Tag,
  Factory,
  Newspaper,
  Flame,
  Shield,
  ImageIcon,
  ArrowRight,
  Check,
} from "lucide-react";
import { getAllSettings, type AllSettings } from "./actions/settings-actions";
import { formatTimeAgo } from "./_shared/format-time-ago";

export const dynamic = "force-dynamic";

interface CardSpec {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  cacheKey: keyof AllSettings | null;
  primary?: boolean;
}

const CARDS: CardSpec[] = [
  {
    href: "/settings/modonty",
    title: "Modonty Homepage",
    description: "Site identity, SEO, banner, contact, address, and social profiles.",
    icon: Building2,
    cacheKey: "jsonLdLastGenerated",
    primary: true,
  },
  {
    href: "/settings/clients",
    title: "Clients Page",
    description: "SEO + Hero B2B panel for the clients listing.",
    icon: Briefcase,
    cacheKey: "clientsPageJsonLdLastGenerated",
  },
  {
    href: "/settings/categories",
    title: "Categories Page",
    description: "SEO and metadata for the categories listing.",
    icon: FolderTree,
    cacheKey: "categoriesPageJsonLdLastGenerated",
  },
  {
    href: "/settings/tags",
    title: "Tags Page",
    description: "SEO and metadata for the tags listing.",
    icon: Tag,
    cacheKey: "tagsPageJsonLdLastGenerated",
  },
  {
    href: "/settings/industries",
    title: "Industries Page",
    description: "SEO and metadata for the industries listing.",
    icon: Factory,
    cacheKey: "industriesPageJsonLdLastGenerated",
  },
  {
    href: "/settings/articles",
    title: "Articles Page",
    description: "SEO and metadata for the articles listing.",
    icon: Newspaper,
    cacheKey: "articlesPageJsonLdLastGenerated",
  },
  {
    href: "/settings/trending",
    title: "Trending Page",
    description: "SEO and metadata for the trending articles page.",
    icon: Flame,
    cacheKey: "trendingPageJsonLdLastGenerated",
  },
  {
    href: "/settings/defaults",
    title: "Default Images",
    description: "Fallback logo, article, and hero images shown when an entity has none.",
    icon: ImageIcon,
    cacheKey: null,
  },
  {
    href: "/settings/system",
    title: "System",
    description: "Read-only technical defaults — charset, robots, OG types, sitemap.",
    icon: Shield,
    cacheKey: null,
  },
];

export default async function SettingsDashboardPage() {
  const settings = await getAllSettings();

  return (
    <div className="max-w-[1200px] mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Configure your site once — your team handles the rest. Each card opens a focused page for one area of modonty.com.
        </p>
        <p className="text-sm text-muted-foreground/80 mt-1 max-w-2xl" dir="rtl">
          إعدادات موقع مودونتي كاملاً — كل بطاقة تفتح صفحة مخصصة لجانب معين. مدونتي = الصفحة الرئيسية، والباقي صفحات الفئات والوسوم والقطاعات والمقالات.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const cacheDate = card.cacheKey ? (settings[card.cacheKey] as Date | string | null) : null;
          const cacheLabel = cacheDate ? formatTimeAgo(cacheDate) : null;
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative rounded-lg border bg-card hover:bg-muted/30 transition-colors p-5 flex flex-col gap-3 ${
                card.primary ? "ring-1 ring-primary/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`h-10 w-10 rounded-md flex items-center justify-center ${
                  card.primary
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
              {cacheLabel && (
                <div className="mt-auto pt-2 border-t border-border/50 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  {cacheDate ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      Cache: <span className="text-foreground">{cacheLabel}</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                      Not cached
                    </>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
