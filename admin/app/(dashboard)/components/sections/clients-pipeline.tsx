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

import { clientStatusCounts } from "@/lib/dashboard/cached";
import { CARD_GRID, Ghost, GroupLabel, TierCard, ZChip, type Tier } from "../dashboard-ui";
import { CollapsibleSection } from "../collapsible-section";

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
  const { total, needsYou, portfolio, contact, content, images, data, statusUnaccounted } =
    await clientStatusCounts();

  const unreachable = contact.none + contact.unset;
  // An ACTIVE client with no end date cannot match the expiring-soon date filter — so a
  // "0 expiring this week" next to a non-zero count here means "blind", not "safe".
  const renewalBlind = data.noEndDate;

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

  const dataItems: Item[] = [
    { value: data.noEndDate, label: "Renewal date missing", note: "active, but no end date — the expiry watch cannot see them", href: "/clients/segment/no-end-date", tier: "hot", icon: CalendarX },
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
  const r = split(reach);
  const c = split(contentItems);
  const im = split(imageItems);
  const d = split(dataItems);

  return (
    <CollapsibleSection
      iconNode={<Users className="h-4 w-4 text-muted-foreground" />}
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
      >
      {statusUnaccounted > 0 && (
        <p className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 p-2 text-[11px] text-red-700 dark:text-red-400">
          <b>{statusUnaccounted}</b> clients have no subscription status on their record — the same
          missing-field trap that hit the CTA. They are counted in the total but in none of the
          statuses below, so this section will not add up until they are backfilled.
        </p>
      )}

      {renewalBlind > 0 && (
        <p className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-400">
          The renewal watch is blind to <b>{renewalBlind}</b> of {portfolio.active} active clients —
          their record has no end date, and a date filter can never match an absent field. Until you
          fill those dates, <b>&quot;0 expiring this week&quot; means &quot;unknown&quot;, not
          &quot;safe&quot;</b>.{" "}
          <Link href="/clients/segment/no-end-date" className="font-semibold underline">
            fill the dates →
          </Link>
        </p>
      )}

      <GroupLabel icon={Banknote}>Money &amp; portfolio</GroupLabel>
      <div className={CARD_GRID}>
        {m.live.map((i) => (
          <TierCard key={i.label} href={i.href} tier={i.tier} icon={i.icon} value={i.value} label={i.label} note={i.note} />
        ))}
        {m.empty.length > 0 && (
          <div
            className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
              m.empty.length >= 3 ? "col-span-2" : ""
            } ${
              renewalBlind > 0
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {/* Never print a green all-clear the data cannot support: with end dates missing,
                a zero in `expiring soon` is silence, not health (live test 2026-07-14). */}
            {renewalBlind > 0 ? "⚠" : "✓"} {renewalBlind > 0 ? "Money looks quiet" : "Money is fine"} —{" "}
            {m.empty
              .map((i) =>
                i.label === "Expiring this week" && renewalBlind > 0
                  ? "expiring this week: unknown"
                  : `0 ${i.label.toLowerCase()}`,
              )
              .join(" · ")}
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

      <GroupLabel icon={FileText} hint="— holes in the record itself: the money watch and the schema both read these">
        Record data
      </GroupLabel>
      <div className={CARD_GRID}>
        {d.live.map((i) => (
          <TierCard key={i.label} href={i.href} tier={i.tier} icon={i.icon} value={i.value} label={i.label} note={i.note} />
        ))}
        {d.empty.length > 0 && (
          <Ghost title="Complete">
            {d.empty.map((i) => (
              <ZChip key={i.label} good>
                <b className="font-bold">0</b> {i.label.toLowerCase()} ✓
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
    </CollapsibleSection>
  );
}
