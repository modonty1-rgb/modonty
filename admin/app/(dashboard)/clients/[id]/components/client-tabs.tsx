"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AddressTab } from "./tabs/address-tab";
import { LegalTab } from "./tabs/legal-tab";
import { MediaSocialTab } from "./tabs/media-social-tab";
import { SecurityTab } from "./tabs/security-tab";
import { AdditionalTab } from "./tabs/additional-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { ClientAnalytics } from "./client-analytics";
import { ClientArticles } from "./client-articles";
import { ArticleStatus } from "@prisma/client";
import type { MediaType } from "@prisma/client";

type DetailSection =
  | "address"
  | "legal"
  | "media"
  | "security"
  | "settings"
  | "additional"
  | "analytics"
  | "articles"
  | null;

type ClientTabsProps = {
  client: {
    id: string;
    name: string;
    slug: string;
    legalName: string | null;
    alternateName: string | null;
    slogan: string | null;
    organizationType: string | null;
    url: string | null;
    logoMedia: {
      url: string;
      altText: string | null;
    } | null;
    ogImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    twitterImageMedia: {
      url: string;
      altText: string | null;
    } | null;
    email: string;
    phone: string | null;
    sameAs: string[];
    seoTitle: string | null;
    seoDescription: string | null;
    description: string | null;
    businessBrief: string | null;
    industry: {
      id: string;
      name: string;
    } | null;
    targetAudience: string | null;
    contentPriorities: string[];
    keywords: string[];
    knowsLanguage: string[];
    numberOfEmployees: string | null;
    subscriptionTier: string | null;
    subscriptionStartDate: Date | null;
    subscriptionEndDate: Date | null;
    articlesPerMonth: number | null;
    subscriptionTierConfig?: {
      id: string;
      tier: string;
      name: string;
      articlesPerMonth: number;
      price: number;
      isPopular: boolean;
    } | null;
    subscriptionStatus: string;
    paymentStatus: string;
    contactType: string | null;
    addressStreet: string | null;
    addressCity: string | null;
    addressCountry: string | null;
    addressPostalCode: string | null;
    addressRegion: string | null;
    addressNeighborhood: string | null;
    addressBuildingNumber: string | null;
    addressAdditionalNumber: string | null;
    canonicalUrl: string | null;
    gtmId: string | null;
    nextjsMetadata: unknown;
    jsonLdStructuredData: string | null;
    jsonLdLastGenerated: Date | null;
    jsonLdValidationReport: {
      adobe?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
      custom?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
      richResults?: { valid: boolean; errors?: unknown[]; warnings?: unknown[] };
    } | null;
    foundingDate: Date | null;
    commercialRegistrationNumber: string | null;
    vatID: string | null;
    taxID: string | null;
    legalForm: string | null;
    businessActivityCode: string | null;
    isicV4: string | null;
    licenseNumber: string | null;
    licenseAuthority: string | null;
    parentOrganization: {
      id: string;
      name: string;
      url: string | null;
      slug: string;
    } | null;
    _count: {
      articles: number;
    };
  };
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    createdAt: Date;
    datePublished: Date | null;
    scheduledAt: Date | null;
    views: number;
    category: { name: string } | null;
    author: { name: string } | null;
  }>;
  articlesThisMonth: number;
  analytics: {
    totalViews: number;
    uniqueSessions: number;
    avgTimeOnPage: number;
    bounceRate: number;
    avgScrollDepth: number;
    topArticles?: Array<{
      articleId: string;
      title: string;
      client: string;
      views: number;
    }>;
    trafficSources?: Record<string, number>;
    channelSummary?: Record<string, {
      views: number;
      sessions: number;
      avgTimeOnPage: number;
      bounceRate: number;
      avgScrollDepth: number;
    }>;
  };
  media: Array<{
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    fileSize: number | null;
    width: number | null;
    height: number | null;
    altText: string | null;
    title: string | null;
    description: string | null;
    type: string;
    createdAt: Date;
    cloudinaryPublicId?: string | null;
    cloudinaryVersion?: string | null;
  }>;
};

function SectionCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground/70 uppercase tracking-widest">
          {title}
        </span>
        {badge}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Grid({
  cols = 2,
  children,
}: {
  cols?: 2 | 3 | 4;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "grid-cols-2",
        cols === 3 && "grid-cols-3",
        cols === 4 && "grid-cols-4",
      )}
    >
      {children}
    </div>
  );
}

export function ClientTabs({
  client,
  articles,
  articlesThisMonth,
  analytics,
  media,
}: ClientTabsProps) {
  const [activeDetail, setActiveDetail] = useState<DetailSection>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeDetail && detailRef.current) {
      const el = detailRef.current;
      const main = document.querySelector("main");
      if (main) {
        const top = el.getBoundingClientRect().top + main.scrollTop - 100;
        main.scrollTo({ top, behavior: "smooth" });
      }
    }
  }, [activeDetail]);

  // Delivery
  const promised =
    client.articlesPerMonth ?? client.subscriptionTierConfig?.articlesPerMonth ?? 0;
  const deliveryRate =
    promised > 0 ? Math.round((articlesThisMonth / promised) * 100) : 0;
  const isBehind = articlesThisMonth < promised;

  // SEO — read from cached validation report
  const report = client.jsonLdValidationReport;
  const jsonLdErrors =
    (Array.isArray(report?.adobe?.errors)
      ? (report!.adobe!.errors as unknown[]).length
      : 0) +
    (Array.isArray(report?.custom?.errors)
      ? (report!.custom!.errors as unknown[]).length
      : 0);
  const hasJsonLd = !!client.jsonLdStructuredData;
  const hasMeta = !!client.nextjsMetadata;
  const seoStatus =
    !hasMeta && !hasJsonLd
      ? "critical"
      : jsonLdErrors > 0
        ? "warning"
        : "good";

  // Subscription
  const subExpired = client.subscriptionStatus === "EXPIRED";
  const subOverdue = client.paymentStatus === "OVERDUE";
  const tierLabel = client.subscriptionTier
    ? client.subscriptionTier.charAt(0) +
      client.subscriptionTier.slice(1).toLowerCase()
    : "—";

  const detailNav: Array<{ key: DetailSection; label: string }> = [
    { key: "address", label: "Address" },
    { key: "legal", label: "Legal" },
    { key: "media", label: "Social & Media" },
    { key: "security", label: "Security" },
    { key: "settings", label: "Settings" },
    { key: "additional", label: "Additional" },
  ];

  return (
    <div className="flex gap-6">
      {/* ── LEFT: 4 MAIN CARDS + DETAIL PANEL ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* ① PROFILE */}
        <SectionCard title="Profile">
          <Grid cols={2}>
            <Field label="Email">
              {client.email ? (
                <a
                  href={`mailto:${client.email}`}
                  className="text-primary hover:underline"
                >
                  {client.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Phone">
              {client.phone ? (
                <a
                  href={`tel:${client.phone}`}
                  className="text-primary hover:underline"
                >
                  {client.phone}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Website">
              {client.url ? (
                <a
                  href={client.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {client.url}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </Field>
            <Field label="Industry">
              <span>
                {client.industry?.name ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </span>
            </Field>
          </Grid>
          {client.businessBrief && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Business Brief
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {client.businessBrief}
              </p>
            </div>
          )}
        </SectionCard>

        {/* ② SUBSCRIPTION */}
        <SectionCard
          title="Subscription"
          badge={
            subExpired ? (
              <Badge
                variant="outline"
                className="text-xs text-red-500 border-red-500/40 bg-red-500/10"
              >
                Expired
              </Badge>
            ) : subOverdue ? (
              <Badge
                variant="outline"
                className="text-xs text-red-500 border-red-500/40 bg-red-500/10"
              >
                Overdue
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-green-500 border-green-500/40 bg-green-500/10"
              >
                Active
              </Badge>
            )
          }
        >
          <Grid cols={4}>
            <Field label="Tier">
              <Badge variant="secondary" className="text-xs">
                {tierLabel}
              </Badge>
            </Field>
            <Field label="Articles/month">
              <span className="text-lg font-medium">{promised}</span>
            </Field>
            <Field label="Status">
              <span
                className={cn(
                  "text-sm font-medium",
                  client.subscriptionStatus === "ACTIVE"
                    ? "text-green-500"
                    : "text-red-400",
                )}
              >
                {client.subscriptionStatus}
              </span>
            </Field>
            <Field label="Payment">
              <span
                className={cn(
                  "text-sm font-medium",
                  client.paymentStatus === "PAID"
                    ? "text-green-500"
                    : "text-red-400",
                )}
              >
                {client.paymentStatus}
              </span>
            </Field>
            {client.subscriptionStartDate && (
              <Field label="Start">
                <span>
                  {format(new Date(client.subscriptionStartDate), "MMM d, yyyy")}
                </span>
              </Field>
            )}
            {client.subscriptionEndDate && (
              <Field label="Expires">
                <span className={cn(subExpired && "text-destructive font-medium")}>
                  {format(new Date(client.subscriptionEndDate), "MMM d, yyyy")}
                </span>
              </Field>
            )}
          </Grid>
          {(subExpired || subOverdue) && (
            <div className="mt-3 pt-3 border-t text-xs text-amber-500/80 flex items-center gap-1.5">
              ⚠{" "}
              {subExpired
                ? "Subscription expired — contact client to renew"
                : "Payment overdue — follow up with client"}
            </div>
          )}
        </SectionCard>

        {/* ③ DELIVERY */}
        <SectionCard
          title="Delivery this month"
          badge={
            promised === 0 ? (
              <Badge variant="secondary" className="text-xs">
                No commitment
              </Badge>
            ) : isBehind ? (
              <Badge
                variant="outline"
                className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/10"
              >
                Behind
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-green-500 border-green-500/40 bg-green-500/10"
              >
                On track
              </Badge>
            )
          }
        >
          <Grid cols={3}>
            <Field label="Total articles">
              <Link
                href={`/articles?clientId=${client.id}`}
                className="text-2xl font-semibold text-primary hover:underline"
              >
                {client._count.articles}
              </Link>
            </Field>
            <Field label="This month">
              <span
                className={cn(
                  "text-2xl font-semibold",
                  isBehind && promised > 0 ? "text-amber-500" : "text-foreground",
                )}
              >
                {articlesThisMonth}
                {promised > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    / {promised}
                  </span>
                )}
              </span>
            </Field>
            <Field label="Rate">
              <span
                className={cn(
                  "text-2xl font-semibold",
                  deliveryRate < 50 && promised > 0
                    ? "text-amber-500"
                    : deliveryRate < 100 && promised > 0
                      ? "text-amber-400"
                      : "text-foreground",
                )}
              >
                {promised > 0 ? `${deliveryRate}%` : "—"}
              </span>
            </Field>
          </Grid>
        </SectionCard>

        {/* ④ SEO */}
        <SectionCard
          title="SEO"
          badge={
            seoStatus === "good" ? (
              <Badge
                variant="outline"
                className="text-xs text-green-500 border-green-500/40 bg-green-500/10"
              >
                Good
              </Badge>
            ) : seoStatus === "warning" ? (
              <Badge
                variant="outline"
                className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/10"
              >
                Needs work
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs text-red-500 border-red-500/40 bg-red-500/10"
              >
                Critical
              </Badge>
            )
          }
        >
          <Grid cols={2}>
            <Field label="Meta cache">
              {hasMeta ? (
                <span className="text-green-500 font-medium">✓ Generated</span>
              ) : (
                <span className="text-red-400 font-medium">✗ Missing</span>
              )}
            </Field>
            <Field label="JSON-LD">
              {hasJsonLd && jsonLdErrors === 0 ? (
                <span className="text-green-500 font-medium">✓ Valid</span>
              ) : hasJsonLd && jsonLdErrors > 0 ? (
                <span className="text-amber-500 font-medium">
                  {jsonLdErrors} errors
                </span>
              ) : (
                <span className="text-red-400 font-medium">✗ Missing</span>
              )}
            </Field>
            {client.seoTitle && (
              <Field label="SEO Title">
                <span>{client.seoTitle}</span>
              </Field>
            )}
            {client.canonicalUrl && (
              <Field label="Canonical">
                <a
                  href={client.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline truncate block"
                >
                  {client.canonicalUrl}
                </a>
              </Field>
            )}
          </Grid>
          {!hasMeta && (
            <div className="mt-3 pt-3 border-t text-xs text-red-400/80">
              ✗ No SEO cache — open Edit and save to generate
            </div>
          )}
        </SectionCard>

        {/* ── DETAIL PANELS (toggle on sidebar click) ── */}
        <div ref={detailRef} />
        {activeDetail === "address" && <AddressTab client={client} />}
        {activeDetail === "legal" && <LegalTab client={client} />}
        {activeDetail === "media" && (
          <MediaSocialTab
            client={client}
            media={media.map((m) => ({ ...m, type: m.type as MediaType }))}
          />
        )}
        {activeDetail === "security" && <SecurityTab client={client} />}
        {activeDetail === "settings" && <SettingsTab client={client} />}
        {activeDetail === "additional" && <AdditionalTab client={client} />}
        {activeDetail === "analytics" && (
          <ClientAnalytics
            analytics={analytics}
            clientId={client.id}
            client={client}
            articlesThisMonth={articlesThisMonth}
            totalArticles={articles.length}
          />
        )}
        {activeDetail === "articles" && (
          <ClientArticles
            articles={articles.map((a) => ({ ...a, status: a.status as ArticleStatus }))}
            clientId={client.id}
          />
        )}
      </div>

      {/* ── RIGHT: SIDEBAR ── */}
      <div className="w-44 shrink-0">
        <div
          className="sticky top-6 space-y-3"
          style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 pb-1">
            Details
          </p>
          {detailNav.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveDetail(activeDetail === key ? null : key)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                activeDetail === key
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {label}
            </button>
          ))}

          <div className="border-t my-2" />

          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 pb-1">
            Content
          </p>
          <button
            onClick={() =>
              setActiveDetail(activeDetail === "analytics" ? null : "analytics")
            }
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
              activeDetail === "analytics"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            Performance
          </button>
          <button
            onClick={() =>
              setActiveDetail(activeDetail === "articles" ? null : "articles")
            }
            className={cn(
              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between",
              activeDetail === "articles"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            <span>Articles</span>
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
              {client._count.articles}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}