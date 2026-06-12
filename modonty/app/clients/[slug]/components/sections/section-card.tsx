import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  /** Anchor id for the scroll-spy tabs. */
  id?: string;
  /** Header icon — an emoji string or a small node (zero-bundle, no barrel imports). */
  icon: ReactNode;
  title: string;
  /** Dominant gradient treatment (services). */
  feature?: boolean;
  /** Optional "الكل ›" link. */
  moreHref?: string;
  moreLabel?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The mockup's `.block` card — Card chrome (bg-card · border · rounded-lg) + a
 * `.bhead` header (icon tile · title · optional «الكل ›»)
 * + `.bbody`. Shared by every client-page section so the design stays 1:1 with the
 * binding mockup. Pure Server Component (zero JS).
 */
export function SectionCard({
  id,
  icon,
  title,
  feature,
  moreHref,
  moreLabel,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-[116px] overflow-hidden rounded-lg border bg-card shadow-sm",
        feature &&
          "border-primary/15 bg-gradient-to-br from-primary/[0.06] to-accent/[0.07] shadow-[0_16px_44px_-28px_hsl(var(--primary)/0.45)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3.5">
        <h3
          className={cn(
            "inline-flex items-center gap-2.5 font-extrabold text-foreground",
            feature ? "text-[17px]" : "text-[15px]"
          )}
        >
          <span
            className={cn(
              "grid h-[31px] w-[31px] shrink-0 place-items-center rounded-[9px] text-[17px]",
              feature
                ? "bg-gradient-to-br from-primary to-accent text-white"
                : "bg-primary/[0.08] text-primary"
            )}
            aria-hidden
          >
            {icon}
          </span>
          {title}
        </h3>
        {moreHref && (
          <a
            href={moreHref}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            {moreLabel ?? "الكل"} ›
          </a>
        )}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
