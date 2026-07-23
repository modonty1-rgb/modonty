import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CalendarX,
  FileCheck,
  FileText,
  FileX,
  Image as ImageIcon,
  Link2,
  MapPin,
  MousePointerClick,
  User,
  Users,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { clientSeoQuality, clientStatusCounts } from "@/lib/dashboard/cached";
import { GoogleIcon } from "@/components/admin/icons/google-icon";
import { GroupLabel, SummaryChip, type Tier } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";
import { SeoHealthCard } from "../seo-health-card";
import { BudgetRow, PipelineRow } from "../pipeline-row";

/**
 * Clients — the same ROW language as Articles (Khalid 2026-07-23: «نحول كله نفس فكرة
 * الجدول»). Each dimension is a labelled strip of rows:
 *
 *   Money & portfolio → who is costing me? what is the book made of?
 *   How visitors reach them → a true PARTITION of the book (every client has one CTA
 *     mode), so it earns the segmented budget bar — the honest analog of "In production".
 *   Content · Record data · Images → overlapping flags (a client can be in several), so
 *     they are plain rows, never a budget bar that would imply a false partition.
 *
 * Live numbers get a row; zeros compress into a chip footer. Same three tiers everywhere.
 */

interface Item {
  value: number;
  label: string;
  note: string;
  href: string;
  tier: Tier;
  icon: LucideIcon;
}

function split(items: Item[]) {
  return {
    live: items.filter((i) => i.value > 0),
    empty: items.filter((i) => i.value === 0),
  };
}

const action = (t: Tier) => (t === "hot" || t === "warm" ? "fix" : "view");

/** A labelled strip of rows for one overlapping-flag dimension: live → rows, zeros → chips. */
function RowGroup({
  icon,
  title,
  hint,
  items,
  emptyGood,
}: {
  icon: LucideIcon;
  title: string;
  hint?: string;
  items: Item[];
  emptyGood?: boolean;
}) {
  const { live, empty } = split(items);
  return (
    <>
      <GroupLabel icon={icon} hint={hint}>
        {title}
      </GroupLabel>
      <div className="mb-3 overflow-hidden rounded-xl border bg-card shadow-sm">
        {live.map((i) => (
          <PipelineRow
            key={i.label}
            href={i.href}
            tier={i.tier}
            icon={i.icon}
            value={i.value}
            label={i.label}
            note={i.note}
            action={action(i.tier)}
          />
        ))}
        {live.length === 0 && (
          <div className="px-4 py-3 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ all clear
          </div>
        )}
        {empty.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t bg-muted/20 px-4 py-2.5">
            {empty.map((i) => (
              <span
                key={i.label}
                className={`text-[11px] tabular-nums ${
                  emptyGood ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                }`}
              >
                <b className={`font-bold ${emptyGood ? "" : "text-foreground"}`}>0</b>{" "}
                {i.label.toLowerCase()}
                {emptyGood ? " ✓" : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export async function ClientsPipeline() {
  const [
    { total, needsYou, portfolio, contact, content, images, data, statusUnaccounted },
    seoQuality,
  ] = await Promise.all([clientStatusCounts(), clientSeoQuality()]);

  const seoTotal = seoQuality.perfect + seoQuality.below;
  // Health = the AVERAGE client score (Khalid 2026-07-23), not "how many are perfect".
  const seoHealthPct = seoQuality.avgScore;
  const seoTier: Tier = seoHealthPct >= 80 ? "ok" : seoHealthPct >= 50 ? "warm" : "hot";

  const unreachable = contact.none + contact.unset;
  const moneyIssues = needsYou.overdue + needsYou.expired + needsYou.expiringSoon + needsYou.pending;
  // An ACTIVE client with no end date cannot match the expiring-soon date filter — so a
  // "0 expiring this week" next to a non-zero count here means "blind", not "safe".
  const renewalBlind = data.noEndDate;

  const money: Item[] = [
    { value: needsYou.overdue, label: "Payment overdue", note: "they owe you money", href: "/clients/segment/overdue", tier: "hot", icon: Banknote },
    { value: needsYou.expired, label: "Subscription expired", note: "still live, no longer paying", href: "/clients/segment/expired", tier: "hot", icon: CalendarX },
    { value: needsYou.expiringSoon, label: "Expiring this week", note: "call them before it lapses", href: "/clients/segment/expiring-soon", tier: "hot", icon: Calendar },
    { value: needsYou.pending, label: "Waiting to be activated", note: "signed up, not switched on yet", href: "/clients/segment/pending", tier: "hot", icon: User },
    { value: data.noEndDate, label: "Renewal date missing", note: "active, but no end date — the expiry watch cannot see them", href: "/clients/segment/no-end-date", tier: "hot", icon: CalendarX },
  ];

  // CTA modes partition every client, so these ARE a budget: form + link + none + unset = total.
  const reach: Item[] = [
    { value: contact.unset, label: "CTA never set", note: "field missing on their record — behaves as no button", href: "/clients/segment/unset", tier: "hot", icon: AlertTriangle },
    { value: contact.none, label: "No button at all", note: "paying, but the visitor has no way in", href: "/clients/segment/none", tier: "hot", icon: UserX },
    { value: contact.form, label: "Booking form", note: "the lead lands in our database", href: "/clients/segment/form", tier: "ok", icon: Calendar },
    { value: contact.link, label: "External link", note: "their site or WhatsApp — we see the click, never the lead", href: "/clients/segment/link", tier: "plain", icon: MousePointerClick },
  ];

  const contentItems: Item[] = [
    { value: content.noArticles, label: "No articles at all", note: "paying for silence", href: "/clients/segment/no-articles", tier: "warm", icon: FileX },
    { value: content.awaitingApproval, label: "Waiting on the client", note: "we wrote it — chase their sign-off", href: "/clients/segment/awaiting-approval", tier: "warm", icon: User },
    { value: content.published, label: "Has published", note: "at least one article live", href: "/clients/segment/has-published", tier: "ok", icon: FileCheck },
    { value: content.inProgress, label: "In progress", note: "articles exist, nothing live yet — on us", href: "/clients/segment/content-in-progress", tier: "plain", icon: FileText },
  ];

  const dataItems: Item[] = [
    { value: data.noAddress, label: "No address", note: "no city — their JSON-LD carries no location", href: "/clients/segment/no-address", tier: "warm", icon: MapPin },
    { value: data.noSocial, label: "No social links", note: "sameAs empty — nothing ties them to their real profiles", href: "/clients/segment/no-social", tier: "warm", icon: Link2 },
    { value: data.noDescription, label: "No description", note: "Organization schema says who, not what", href: "/clients/segment/no-description", tier: "warm", icon: FileText },
  ];

  const imageItems: Item[] = [
    { value: images.noImage, label: "No image at all", note: "no logo, no hero, no share — start here", href: "/clients/segment/no-image", tier: "warm", icon: ImageIcon },
    { value: images.noLogo, label: "No logo", note: "what Google's knowledge panel reads", href: "/clients/segment/no-logo", tier: "warm", icon: ImageIcon },
    { value: images.noHero, label: "No hero image", note: "the banner on their page", href: "/clients/segment/no-hero", tier: "warm", icon: ImageIcon },
    { value: images.noOg, label: "No share image", note: "links preview blank — 25 pts of SEO", href: "/clients/segment/no-og", tier: "warm", icon: ImageIcon },
  ];

  const m = split(money);

  return (
    <CollapsibleSection
      iconNode={<Users className="h-4 w-4 text-muted-foreground" />}
      title="Clients"
      subtitle="subscription and readiness"
      storageKey="dashClientsOpen"
      summary={
        <>
          <SummaryChip icon={UserX} value={unreachable} tier={unreachable > 0 ? "hot" : "plain"} />
          <SummaryChip icon={Banknote} value={moneyIssues} tier={moneyIssues > 0 ? "hot" : "plain"} />
          <SummaryChip icon={Users} value={total.toLocaleString("en-US")} tier="plain" />
          {seoTotal > 0 && <SummaryChip icon={GoogleIcon} value={`${seoHealthPct}%`} tier={seoTier} />}
        </>
      }
      right={
        <Link
          href="/clients/segment/unreachable"
          className="flex items-baseline gap-2 text-xs text-muted-foreground hover:underline"
        >
          <span
            className={`text-base font-bold tabular-nums ${
              unreachable > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {unreachable}
          </span>
          unreachable
          <span className="text-muted-foreground/40">·</span>
          of {total.toLocaleString("en-US")}
          <span className="text-primary">→</span>
        </Link>
      }
    >
      <SeoHealthCard
        score={seoQuality.avgScore}
        perfect={seoQuality.perfect}
        below={seoQuality.below}
        checks={seoQuality.checks}
        contentIcon={User}
        caption={
          <span className="flex shrink-0 items-center gap-3 text-[12px]">
            {seoQuality.below > 0 && (
              <Link
                href="/clients/segment/seo-imperfect"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span className="font-extrabold tabular-nums text-red-600 dark:text-red-400">
                  {seoQuality.below}
                </span>
                <span className="text-muted-foreground">problems</span>
                <span className="font-bold text-primary">fix →</span>
              </Link>
            )}
            {seoQuality.perfect > 0 && (
              <Link
                href="/clients/segment/seo-perfect"
                className="inline-flex items-center gap-1 hover:underline"
              >
                <span className="font-extrabold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {seoQuality.perfect}
                </span>
                <span className="text-muted-foreground">perfect</span>
              </Link>
            )}
          </span>
        }
      />
      {statusUnaccounted > 0 && (
        <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-700 dark:text-red-400">
          <b>{statusUnaccounted}</b> clients have no subscription status on their record — the same
          missing-field trap that hit the CTA. They are counted in the total but in none of the
          statuses below, so this section will not add up until they are backfilled.
        </p>
      )}
      {/* Money is the section that costs you — a distinctive amber frame + header strip so it
          reads as THE priority, not just another group (Khalid 2026-07-23). */}
      <div className="mb-3 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.05] to-transparent shadow-sm ring-1 ring-amber-500/10">
        <div className="flex items-center gap-2.5 border-b border-amber-500/20 bg-amber-500/[0.07] px-4 py-2.5">
          <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Banknote className="h-4 w-4" />
          </span>
          <span className="text-[12px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Money &amp; portfolio
          </span>
          <span className="hidden text-[11px] text-muted-foreground sm:inline">— act on these first</span>
          {m.live.length > 0 && (
            <span className="ms-auto rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-400">
              {m.live.length} flagged
            </span>
          )}
        </div>
        {m.live.map((i) => (
          <PipelineRow
            key={i.label}
            href={i.href}
            tier={i.tier}
            icon={i.icon}
            value={i.value}
            label={i.label}
            note={i.note}
            action="fix"
          />
        ))}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t bg-muted/20 px-4 py-2.5">
          {m.empty.map((i) => (
            <span key={i.label} className="text-[11px] tabular-nums text-muted-foreground">
              {i.label === "Expiring this week" && renewalBlind > 0 ? (
                <>
                  <b className="font-bold text-amber-600 dark:text-amber-400">?</b> expiring this week:
                  unknown
                </>
              ) : (
                <>
                  <b className="font-bold text-foreground">0</b> {i.label.toLowerCase()}
                </>
              )}
            </span>
          ))}
          {m.empty.length > 0 && <span className="text-muted-foreground/40">·</span>}
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Portfolio
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.active}</b> active
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.ymyl}</b> YMYL
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.standard}</b> standard
          </span>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            <b className="font-bold text-foreground">{portfolio.cancelled}</b> cancelled
          </span>
        </div>
      </div>

      {/* Reach — the one true partition, so the honest budget bar (mirror of "In production"). */}
      <GroupLabel icon={MousePointerClick} hint={`— ${unreachable} unreachable, the number above`}>
        How visitors reach them
      </GroupLabel>
      <div className="mb-3 overflow-hidden rounded-xl border bg-card shadow-sm">
        <BudgetRow
          total={total}
          label="clients"
          icon={MousePointerClick}
          reviewHref="/clients/segment/unreachable"
          reviewLabel="fix"
          segments={reach.map((i) => ({
            key: i.label,
            href: i.href,
            label: i.label,
            value: i.value,
            tier: i.tier,
          }))}
        />
      </div>

      <RowGroup
        icon={FileText}
        title="Content"
        hint="— a client can be in more than one"
        items={contentItems}
      />
      <RowGroup
        icon={FileText}
        title="Record data"
        hint="— holes in the record itself: the money watch and the schema both read these"
        items={dataItems}
        emptyGood
      />
      <RowGroup
        icon={ImageIcon}
        title="Images"
        hint="— first row is the intersection"
        items={imageItems}
        emptyGood
      />
    </CollapsibleSection>
  );
}
