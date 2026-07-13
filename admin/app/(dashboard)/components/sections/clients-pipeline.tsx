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
  MousePointerClick,
  User,
  Users,
  UserX,
  type LucideIcon,
} from "lucide-react";

import { clientStatusCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, Ghost, GroupLabel, SectionHead, TierCard, ZChip, type Tier } from "../dashboard-ui";

/**
 * Clients (contract: admin-dashboard-triage-v2-ui.html). Four groups, each answering
 * one question, each packing to the same 4-cell grid:
 *
 *   Money & portfolio → is anyone costing me? what is the book made of?
 *   Reach             → can a visitor actually contact them? (the 12-of-27 number)
 *   Content           → where does their content stand?
 *   Images            → do their pages and previews have pictures?
 *
 * Live numbers get a card; zeros compress into chips; an all-clear group collapses to
 * one green line. Same three tiers as everywhere on this page.
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

export async function ClientsPipeline() {
  const { total, needsYou, portfolio, contact, content, images, statusUnaccounted } =
    await clientStatusCounts();

  const unreachable = contact.none + contact.unset;

  const money: Item[] = [
    { value: needsYou.overdue, label: "Payment overdue", note: "they owe you money", href: "/clients/segment/overdue", tier: "hot", icon: Banknote },
    { value: needsYou.expired, label: "Subscription expired", note: "still live, no longer paying", href: "/clients/segment/expired", tier: "hot", icon: CalendarX },
    { value: needsYou.expiringSoon, label: "Expiring this week", note: "call them before it lapses", href: "/clients/segment/expiring-soon", tier: "hot", icon: Calendar },
    { value: needsYou.pending, label: "Waiting to be activated", note: "signed up, not switched on yet", href: "/clients/segment/pending", tier: "hot", icon: User },
  ];

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

  const imageItems: Item[] = [
    { value: images.noImage, label: "No image at all", note: "no logo, no hero, no share — start here", href: "/clients/segment/no-image", tier: "warm", icon: ImageIcon },
    { value: images.noLogo, label: "No logo", note: "what Google's knowledge panel reads", href: "/clients/segment/no-logo", tier: "warm", icon: ImageIcon },
    { value: images.noHero, label: "No hero image", note: "the banner on their page", href: "/clients/segment/no-hero", tier: "warm", icon: ImageIcon },
    { value: images.noOg, label: "No share image", note: "links preview blank — 25 pts of SEO", href: "/clients/segment/no-og", tier: "warm", icon: ImageIcon },
  ];

  const m = split(money);
  const r = split(reach);
  const c = split(contentItems);
  const im = split(imageItems);

  return (
    <div>
      <SectionHead
        icon={Users}
        title="Clients"
        subtitle="subscription and readiness"
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
      />

      {statusUnaccounted > 0 && (
        <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-700 dark:text-red-400">
          <b>{statusUnaccounted}</b> clients have no subscription status on their record — the same
          missing-field trap that hit the CTA. They are counted in the total but in none of the
          statuses below, so this section will not add up until they are backfilled.
        </p>
      )}

      <GroupLabel icon={Banknote}>Money &amp; portfolio</GroupLabel>
      <div className={CARD_GRID}>
        {m.live.map((i) => (
          <TierCard key={i.label} href={i.href} tier={i.tier} icon={i.icon} value={i.value} label={i.label} note={i.note} />
        ))}
        {m.empty.length > 0 && (
          <div
            className={`flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 ${
              m.empty.length >= 3 ? "col-span-2" : ""
            }`}
          >
            ✓ Money is fine — {m.empty.map((i) => `0 ${i.label.toLowerCase()}`).join(" · ")}
          </div>
        )}
        <Ghost title="Portfolio">
          <ZChip>
            <b className="font-bold text-foreground">{portfolio.active}</b> active ·{" "}
            <b className="font-bold text-foreground">{portfolio.ymyl}</b> YMYL
          </ZChip>
          <ZChip>
            <b className="font-bold text-foreground">{portfolio.standard}</b> standard ·{" "}
            <b className="font-bold text-foreground">{portfolio.cancelled}</b> cancelled
          </ZChip>
        </Ghost>
      </div>

      <GroupLabel icon={MousePointerClick} hint={`— the ${unreachable} red ones are the number above`}>
        How visitors reach them
      </GroupLabel>
      <div className={CARD_GRID}>
        {r.live.map((i) => (
          <TierCard key={i.label} href={i.href} tier={i.tier} icon={i.icon} value={i.value} label={i.label} note={i.note} />
        ))}
        {r.empty.length > 0 && (
          <Ghost title="Empty">
            {r.empty.map((i) => (
              <ZChip key={i.label}>
                <b className="font-bold text-foreground">0</b> {i.label.toLowerCase()}
              </ZChip>
            ))}
          </Ghost>
        )}
      </div>

      <GroupLabel icon={FileText} hint="— a client can be in more than one">
        Content
      </GroupLabel>
      <div className={CARD_GRID}>
        {c.live.map((i) => (
          <TierCard key={i.label} href={i.href} tier={i.tier} icon={i.icon} value={i.value} label={i.label} note={i.note} />
        ))}
        {c.empty.length > 0 && (
          <Ghost title="Empty">
            {c.empty.map((i) => (
              <ZChip key={i.label}>
                <b className="font-bold text-foreground">0</b> {i.label.toLowerCase()}
              </ZChip>
            ))}
          </Ghost>
        )}
      </div>

      <GroupLabel icon={ImageIcon} hint="— first card is the intersection">
        Images
      </GroupLabel>
      <div className={CARD_GRID}>
        {im.live.map((i) => (
          <TierCard key={i.label} href={i.href} tier={i.tier} icon={i.icon} value={i.value} label={i.label} note={i.note} />
        ))}
        {im.empty.length > 0 && (
          <Ghost title="Healthy">
            {im.empty.map((i) => (
              <ZChip key={i.label} good>
                <b className="font-bold">0</b> {i.label.toLowerCase()} ✓
              </ZChip>
            ))}
          </Ghost>
        )}
      </div>
    </div>
  );
}
