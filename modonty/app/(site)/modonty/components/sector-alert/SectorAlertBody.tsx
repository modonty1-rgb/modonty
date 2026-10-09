import Link from "next/link";

import { messages } from "@/lib/i18n/messages";
import { IconCheck } from "@/lib/icons";
import type { AlertTopicId } from "@/lib/users/alert-topics";

import { enableTopicAlert } from "../../actions";
import { alertLinks } from "../../helpers/alert-links";
import { getAlertState } from "../../helpers/get-alert-state";
import { NotifyButton } from "../notify-button/NotifyButton";
import { heroLineClass } from "../sector-hero/SectorHeroBanner";

const t = messages.modonty.sectorPage.alerts;

/**
 * The line and buttons under a sector hero's headline, for this reader — read per request, so it
 * streams in under the static title (wrap it in Suspense). The reader only registers and agrees;
 * sending is ours (Khalid, 27 Sep 2026: «التنبيه احنا اللي بنرسله»). A visitor gets register and
 * login; a signed-in reader who has not agreed gets one «نبّهني»; one who has sees «أنت معنا».
 */
export async function SectorAlertBody({
  topic,
  path,
  guestLine,
  memberLine,
  onLine,
}: {
  topic: AlertTopicId;
  path: string;
  guestLine: string;
  memberLine: string;
  onLine: string;
}) {
  const state = await getAlertState(topic);
  const primary = "inline-flex h-11 items-center rounded-lg bg-white px-6 text-base font-bold text-brand-navy hover:bg-white/90";

  if (state.kind === "guest") {
    const links = alertLinks(topic, path);
    return (
      <>
        <p className={heroLineClass}>{guestLine}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link href={links.register} className={primary}>{t.register}</Link>
          <Link href={links.login} className="inline-flex h-11 items-center rounded-lg px-4 text-base font-medium text-white ring-1 ring-white/40 hover:bg-white/10">
            {t.login}
          </Link>
        </div>
      </>
    );
  }
  if (state.kind === "member") {
    return (
      <>
        <p className={heroLineClass}>{memberLine}</p>
        <form action={enableTopicAlert.bind(null, topic)} className="mt-5">
          <NotifyButton label={t.notify} className={primary} />
        </form>
      </>
    );
  }
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-white">
      <IconCheck className="size-6 shrink-0 text-brand-teal" aria-hidden />
      <span className="text-lg font-bold">{t.onTitle}</span>
      <span className="text-sm text-white/85 lg:text-base">{onLine}</span>
    </p>
  );
}
