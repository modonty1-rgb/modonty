import Link from "next/link";
import { IconChevronRight } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

interface LinkCardProps {
  href: string;
  title: string;
  /** One short line under the title — what the visitor gets on the other side. */
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  className?: string;
}

/**
 * A whole-card link: icon on a tinted disc · title · one line · chevron pointing the way.
 * Same shape everywhere it appears (Khalid, 2026-08-16: «احجز الآن» and «تسوّق الآن» each
 * get one, and more will follow) — so the eye learns it once. A link, not a button: it
 * navigates, so it must be an <a> the browser can preview, open in a tab, and index.
 */
export function LinkCard({ href, title, description, icon: Icon, className }: LinkCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-primary/10 transition-shadow sm:hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className,
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{description}</span>
      </span>
      <IconChevronRight
        className="h-4 w-4 shrink-0 text-primary rtl:rotate-180"
        aria-hidden
      />
    </Link>
  );
}
