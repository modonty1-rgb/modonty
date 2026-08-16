import Link from "next/link";
import { IconCalendarCheck, IconShoppingBag } from "@/lib/icons";
import type { ComponentType } from "react";

interface CommerceAction {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const actions: CommerceAction[] = [
  { href: "/booking", label: "احجز الآن", icon: IconCalendarCheck },
  { href: "/shop", label: "تسوّق الآن", icon: IconShoppingBag },
];

/**
 * Two big icon tiles in the far rail (Khalid, 2026-08-16: icons, not pictures — the
 * artwork was busy and its words unreadable at 130px). One icon each, brand teal on a
 * tinted disc, label under it: reads in a glance and stays crisp at any size.
 */
export function CommerceActions() {
  return (
    <section aria-label="الحجز والتسوّق" className="rounded-lg bg-card p-3 ring-1 ring-border">
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-1.5 rounded-lg bg-primary/[0.06] px-2 py-2.5 ring-1 ring-inset ring-primary/10 transition-colors sm:hover:bg-primary/[0.12] sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="grid size-11 place-items-center rounded-full bg-accent/15 text-accent ring-1 ring-inset ring-accent/30 transition-transform motion-safe:group-hover:scale-105">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
