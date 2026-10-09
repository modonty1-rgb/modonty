import Link from "next/link";

import { messages } from "@/lib/i18n/messages";
import { IconBell, IconCheck } from "@/lib/icons";

import { enableTopicAlert } from "../../../actions";
import { NotifyButton } from "../../../components/notify-button/NotifyButton";
import { alertLinks } from "../../../helpers/alert-links";
import { getAlertState } from "../../../helpers/get-alert-state";

const t = messages.modonty.football.alerts;
const shared = messages.modonty.sectorPage.alerts;
const links = alertLinks("football", "/modonty/football");
const primary = "inline-flex h-9 max-lg:h-11 items-center rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90";

/**
 * The alert strip shown under a match (on days without one, the hero carries the invitation
 * instead). The reader only registers and agrees; sending is ours (Khalid, 27 Sep 2026: «التنبيه
 * احنا اللي بنرسله»). A visitor is asked to register — the contest is «coming», no prizes promised
 * before a Ministry of Commerce licence exists; a signed-in reader who has not agreed gets one
 * «نبّهني»; one who has sees they are in.
 */
export async function AlertsCard() {
  const state = await getAlertState("football");

  if (state.kind === "guest") {
    return (
      <Shell title={t.guestTitle} body={t.guestBody}>
        <Link href={links.register} className={primary}>
          {shared.register}
        </Link>
        <Link href={links.login} className="inline-flex h-9 max-lg:h-11 items-center rounded-md px-3 text-sm font-medium text-link hover:underline">
          {shared.login}
        </Link>
      </Shell>
    );
  }

  if (state.kind === "member") {
    return (
      <Shell title={t.guestTitle} body={t.memberBody}>
        <form action={enableTopicAlert.bind(null, "football")}>
          <NotifyButton label={shared.notify} className={primary} />
        </form>
      </Shell>
    );
  }

  return <Shell title={shared.onTitle} body={t.onBody} done />;
}

function Shell({ title, body, done = false, children }: { title: string; body: string; done?: boolean; children?: React.ReactNode }) {
  return (
    <section aria-labelledby="football-alerts" className="flex flex-wrap items-center gap-4 rounded-lg bg-card p-5 ring-1 ring-border">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {done ? <IconCheck className="size-5" aria-hidden /> : <IconBell className="size-5" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="football-alerts" className="font-bold">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{body}</p>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </section>
  );
}

/** Same footprint while the session is read, so nothing below jumps. */
export function AlertsCardSkeleton() {
  return <div aria-hidden className="h-[84px] animate-pulse rounded-lg bg-card ring-1 ring-border" />;
}
