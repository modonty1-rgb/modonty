import Link from "next/link";
import { ModontyTrustMark } from "@/components/icons/modonty-trust-mark";
import { messages } from "@/lib/i18n/messages";

const text = messages.clients.trustCard;

/**
 * The trust door on a phone as one of the three stretched tiles (Khalid, 23 Aug: «keep
 * the icon only» → «make them stretch all in the div and add descriptive title and catchy
 * word») — mark + name + the question that pulls a tap. Opens `/about`, where the story
 * lives. The full 2×2 checklist stays on the desktop rail, `hidden` below 1240px as before.
 */
export function TrustStripMobile() {
  return (
    <Link
      href="/about"
      className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-card px-2 py-2 ring-1 ring-primary/15 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ModontyTrustMark className="h-6 w-6 shrink-0" aria-hidden />
      <span className="min-w-0">
        <span className="block text-xs font-bold leading-tight text-foreground">{text.title}</span>
        <span className="mt-0.5 block text-[10px] leading-none text-muted-foreground">{text.howWeVerifyButton}</span>
      </span>
    </Link>
  );
}
