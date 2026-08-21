import Link from "next/link";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { IconChevronRight } from "@/lib/icons";
import { messages } from "@/lib/i18n/messages";

const text = messages.clients.trustCard;

/**
 * Why this list can be trusted, in one line — the phone version of `TrustCard`, whose
 * rail is `hidden` below 1240px (Khalid, 21 Aug: a directory with no trust context is
 * just a list of strangers). The full 2×2 checklist stays on the desktop rail and behind
 * the `/trust` link; here the visitor gets the promise and the door to the proof.
 */
export function TrustStripMobile() {
  return (
    <Link
      href="/trust"
      className="flex items-center gap-2.5 rounded-lg bg-card px-3 py-2.5 ring-1 ring-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ModontyTrustMark className="h-6 w-6 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-bold leading-tight text-foreground">{text.title}</span>
        {/* Two lines, not one: `truncate` cut the page's core promise one word short —
            «…نشوف أوراقه الرسم…» (measured 21 Aug: 229px shown, 229px needed). */}
        <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{text.subtitle}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-link">
        {text.howWeVerifyButton}
        <IconChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden />
      </span>
    </Link>
  );
}
