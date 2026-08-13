import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The way out of the guide.
 *
 * `/help` sits OUTSIDE the `(dashboard)` group, so it renders with none of the console's
 * chrome — no header, no side nav. A client who opens the guide from the first-visit
 * welcome has never seen the dashboard yet, so even the browser's back button returns
 * them to the login screen. They were stuck.
 *
 * One slim bar, owned here, covers all three help screens at once (`/help`,
 * `/help/general`, `/help/console`) — a per-page button would be three places to forget.
 *
 * `fixed`, not `sticky`: `html`/`body` in this app carry `overflow-x: hidden`, which turns
 * the body into its own scroll container and stops any top-level sticky from ever sticking
 * (verified live — the bar scrolled away at 390px). The page tool bars below sit at
 * `top-11` so the two stack instead of covering each other.
 */
export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-11 max-w-[1100px] items-center justify-between gap-2 px-3 md:px-6">
          <Link
            href="/dashboard"
            className="-ms-2 inline-flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4 shrink-0" />
            رجوع للوحة
          </Link>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            مركز المساعدة
          </span>
        </div>
      </header>
      {children}
    </>
  );
}
