import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarX,
  FileCheck,
  HelpCircle,
  Mail,
  MessageSquare,
  PhoneCall,
  UserMinus,
  UserX,
} from "lucide-react";
import { ArticleStatus } from "@prisma/client";

import {
  visitorActionsSummary,
  clientStatusCounts,
  articleStatusCounts,
} from "@/lib/dashboard/cached";
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon";
import { IBOX, type Tier } from "../dashboard-ui";

/**
 * The page's answer to its own title (contract: admin-dashboard-triage-v2-ui.html).
 * "What needs you today" used to be scattered across ~14 red numbers on two screens;
 * this strip IS the ranked answer, built from the SAME cached fetches the sections
 * below consume — so it can never disagree with them.
 *
 * The order is a fixed business rule, not a sort: money/client first, then the inbox,
 * then content. A row only appears while its number is above zero, so on a clean day
 * the strip collapses to one green line.
 */

interface TodayItem {
  tier: Tier;
  icon: React.ComponentType<{ className?: string }>;
  /** Render the icon in its real brand colours (green box + white glyph) instead of
   *  the tier tint — used for the WhatsApp channel so its logo is always recognisable. */
  brand?: boolean;
  num: React.ReactNode;
  text: React.ReactNode;
  ctx: string;
  href: string;
  go: string;
}

const RAIL: Record<Tier, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  ok: "bg-emerald-500",
  plain: "bg-muted-foreground/40",
};
const NUM: Record<Tier, string> = {
  hot: "text-red-600 dark:text-red-400",
  warm: "text-amber-600 dark:text-amber-400",
  ok: "text-emerald-600 dark:text-emerald-400",
  plain: "text-muted-foreground",
};

export async function TodayStrip() {
  const [va, clients, articles] = await Promise.all([
    visitorActionsSummary(),
    clientStatusCounts(),
    articleStatusCounts(),
  ]);

  const items: TodayItem[] = [];

  // 1 · The inbox — THE most important row (Khalid: "this is the inbox"): people who came
  // to modonty and messaged us through the contact form, waiting for a reply. A named
  // human awaiting Khalid personally → top of the list, red.
  if (va.needsAction.messages > 0) {
    const n = va.needsAction.messages;
    items.push({
      tier: "hot",
      icon: Mail,
      num: n,
      text: (
        <>
          <b>
            {n} {n === 1 ? "person" : "people"} messaged you directly.
          </b>{" "}
          Contact-form messages waiting for a reply.
        </>
      ),
      ctx: "straight from modonty’s contact page — the sender is waiting to hear back",
      href: "/contact-messages",
      go: "reply",
    });
  }

  // 2 · The funnel. Opens with zero submit attempts is a dead form, not slow business.
  if (va.bookings.pageViews > 0 && va.bookings.attempts === 0) {
    const top = va.bookings.leaks[0];
    items.push({
      tier: "hot",
      icon: CalendarX,
      num: (
        <>
          {va.bookings.pageViews} <small className="text-xs font-semibold text-muted-foreground">→ 0</small>
        </>
      ),
      text: (
        <>
          <b>The booking funnel is dead.</b> {va.bookings.pageViews} opened the book page, 0 pressed
          submit (90d).
        </>
      ),
      ctx: top
        ? `${va.bookings.leaks.length} clients leaking — ${top.name} alone: ${top.opened} opens, 0 bookings`
        : `${va.bookings.leaks.length} clients leaking`,
      href: "/analytics/leads/bookings",
      go: "investigate",
    });
  }

  // 2 · The WhatsApp channel — ALWAYS shown, even at zero (Khalid: اعرضه حتى لو أصفار،
  // عشان أعرف إنه ما في نشاط). GA4 ≥ DB by design (dedup) so a PARTIAL gap is normal;
  // the RED alarm is only a total wipe (clicks > 0 while db === 0 = recordWhatsappLead
  // is failing → every lead invisible). A broken channel is costing money → ranked here
  // with the hot rows; a healthy/quiet one is status → appended at the bottom (end of list).
  const wa = va.whatsapp;
  const waBroken = wa.clicks > 0 && wa.db === 0;
  const waQuiet = wa.clicks === 0 && wa.db === 0;
  const whatsappItem: TodayItem = waBroken
    ? {
        tier: "hot",
        icon: WhatsAppIcon,
        brand: true,
        num: (
          <>
            {wa.clicks} <small className="text-xs font-semibold text-muted-foreground">→ 0</small>
          </>
        ),
        text: (
          <>
            <b>WhatsApp leads aren&apos;t landing.</b> {wa.clicks} tapped WhatsApp, 0 recorded (90d).
          </>
        ),
        ctx: "the click fires but no lead is saved — every WhatsApp lead is invisible in the console",
        href: "/analytics/leads/bookings",
        go: "investigate",
      }
    : waQuiet
      ? {
          tier: "plain",
          icon: WhatsAppIcon,
          brand: true,
          num: 0,
          text: (
            <>
              <b>No WhatsApp activity.</b> 0 taps, 0 leads (90d).
            </>
          ),
          ctx: "nobody tapped the WhatsApp button in 90 days — the channel is quiet",
          href: "/analytics/leads/bookings",
          go: "view",
        }
      : {
          tier: "ok",
          icon: WhatsAppIcon,
          brand: true,
          num: wa.db,
          text: (
            <>
              <b>WhatsApp is live.</b> {wa.db} lead{wa.db === 1 ? "" : "s"} recorded (90d).
            </>
          ),
          ctx: `${wa.clicks} tap${wa.clicks === 1 ? "" : "s"} → ${wa.db} lead${wa.db === 1 ? "" : "s"} landed`,
          href: "/analytics/leads/bookings",
          go: "see leads",
        };
  // 3 · Unreachable clients — NONE plus the missing-field ones.
  const unreachable = clients.contact.none + clients.contact.unset;
  if (unreachable > 0) {
    const pct = clients.total > 0 ? Math.round((unreachable / clients.total) * 100) : 0;
    items.push({
      tier: "hot",
      icon: UserX,
      num: (
        <>
          {unreachable}
          <small className="text-xs font-semibold text-muted-foreground">/{clients.total}</small>
        </>
      ),
      text: (
        <>
          <b>{unreachable} clients are unreachable.</b> No working contact button on their page.
        </>
      ),
      ctx: `${clients.contact.unset} CTA never set · ${clients.contact.none} no button — ${pct}% of the book cannot convert`,
      href: "/clients/segment/unreachable",
      go: "fix CTAs",
    });
  }

  // A broken WhatsApp channel is a structural money leak (leads captured nowhere), so
  // it ranks here with the red rows — right after the two conversion blockers above.
  if (waBroken) items.push(whatsappItem);

  // 5 · Visitor actions — split into their own rows (Khalid: no aggregate, one row each,
  // each linking to its OWN filtered page). Direct messages are the top row (his "inbox"),
  // not repeated here. Each shows only while its own count is above zero.

  // 5a · Bookings waiting for a call — confirmed leads, money already in hand.
  if (va.needsAction.bookings > 0) {
    const n = va.needsAction.bookings;
    items.push({
      tier: "warm",
      icon: PhoneCall,
      num: n,
      text: (
        <>
          <b>
            {n} booking{n === 1 ? "" : "s"} waiting for your call.
          </b>{" "}
          Confirmed {n === 1 ? "lead" : "leads"} with a phone — call before {n === 1 ? "it cools" : "they cool"}.
        </>
      ),
      ctx: "booked from a client or article page, no callback logged yet",
      href: "/analytics/leads/bookings?status=new",
      go: "call now",
    });
  }

  // 5b · Reader comments the CLIENT still owes a reply. Moderation happens in the
  // client's console, NOT here — the admin's job is to SEE it and nudge the client.
  if (va.needsAction.comments > 0) {
    const n = va.needsAction.comments;
    items.push({
      tier: "warm",
      icon: MessageSquare,
      num: n,
      text: (
        <>
          <b>
            {n} comment{n === 1 ? "" : "s"} waiting on the client.
          </b>{" "}
          Readers commented — only the client can approve or reply, from their console.
        </>
      ),
      ctx: "the admin can't moderate these — nudge the client to clear them",
      href: "/analytics/leads?type=COMMENT",
      go: "nudge client",
    });
  }

  // 5c · Questions the CLIENT still owes an action on — team-prepared FAQs awaiting the
  // client's APPROVAL + visitor questions awaiting an ANSWER. ALL pending, any source
  // (Khalid: the manual/team FAQs are the real backlog, not just visitor questions).
  if (va.questions.pendingAll > 0) {
    const n = va.questions.pendingAll;
    const { pendingTeam: team, pendingVisitor: visitor } = va.questions;
    items.push({
      tier: "warm",
      icon: HelpCircle,
      num: n,
      text: (
        <>
          <b>
            {n} question{n === 1 ? "" : "s"} waiting on your clients.
          </b>{" "}
          They act from their console — the admin can only nudge.
        </>
      ),
      ctx: `${team} team-prepared awaiting approval · ${visitor} visitor-asked awaiting an answer`,
      href: "/analytics/leads/questions",
      go: "see details",
    });
  }

  // 6 · Approvals — ours and theirs.
  const awaiting = articles[ArticleStatus.AWAITING_APPROVAL];
  if (awaiting > 0) {
    items.push({
      tier: "warm",
      icon: FileCheck,
      num: awaiting,
      text: (
        <>
          <b>
            {awaiting} article{awaiting === 1 ? " waits" : "s wait"} for approval.
          </b>
        </>
      ),
      ctx: `plus ${clients.content.awaitingApproval} clients sitting on their own sign-off — chase them`,
      href: "/articles/segment/awaiting-approval",
      go: "review",
    });
  }

  // 7 · Paying for silence. The subject is CLIENTS (paying but producing nothing), so it
  // takes a client icon — UserMinus for churn risk, distinct from row 3's UserX.
  if (clients.content.noArticles > 0) {
    items.push({
      tier: "warm",
      icon: UserMinus,
      num: clients.content.noArticles,
      text: (
        <>
          <b>{clients.content.noArticles} clients are paying with zero articles.</b>
        </>
      ),
      ctx: "paying for silence — the next churn list",
      href: "/clients/segment/no-articles",
      go: "see who",
    });
  }

  // WhatsApp status footer — when the channel is fine or quiet (not broken), it sits
  // below the ranked alarms as a persistent status line, never hidden.
  if (!waBroken) items.push(whatsappItem);

  const hot = items.filter((i) => i.tier === "hot").length;
  const warm = items.filter((i) => i.tier === "warm").length;
  const alarms = hot + warm;
  const moneyFine =
    clients.needsYou.overdue + clients.needsYou.expired + clients.needsYou.expiringSoon === 0;

  return (
    <div>
      {/* Page head + the pulse — the whole page in three pills. */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMM d, yyyy")} — what needs you today
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {hot > 0 && (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-600 dark:text-red-400">
              <span className="text-[13px] tabular-nums">{hot}</span> costing you now
            </span>
          )}
          {warm > 0 && (
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <span className="text-[13px] tabular-nums">{warm}</span> this week
            </span>
          )}
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
              moneyFine
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {moneyFine ? "money is fine" : "money needs you"}
          </span>
        </div>
      </div>

      {/* The ranked strip. */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
          <span className="flex items-center gap-2 text-[13px] font-extrabold">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            Today — start here
          </span>
          <span className="text-[10.5px] text-muted-foreground">
            ranked by cost
            <span className="mx-1.5 inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
            money / client
            <span className="mx-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
            this week
          </span>
        </div>

        {alarms === 0 && (
          <p className="border-b px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ Nothing is costing you today.
          </p>
        )}
        {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                className="relative grid grid-cols-[1.75rem_2.25rem_6.5rem_1fr] items-center gap-3 border-b px-4 py-2.5 transition last:border-b-0 hover:bg-muted/40 md:grid-cols-[1.75rem_2.25rem_6.5rem_1fr_auto]"
              >
                <span className={`absolute inset-y-0 start-0 w-0.5 ${RAIL[item.tier]}`} />
                <span className="justify-self-center text-xs font-extrabold text-muted-foreground/60">
                  {i + 1}
                </span>
                <span
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${
                    item.brand ? "bg-[#25d366]" : IBOX[item.tier]
                  }`}
                >
                  <Icon className={item.brand ? "h-4 w-4 text-white" : "h-4 w-4"} />
                </span>
                <span className={`text-xl font-extrabold leading-none tabular-nums ${NUM[item.tier]}`}>
                  {item.num}
                </span>
                <span className="text-[13px] leading-snug">
                  {item.text}
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.ctx}</span>
                </span>
                <span className="hidden text-[11.5px] font-bold text-primary md:block">
                  {item.go} →
                </span>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
