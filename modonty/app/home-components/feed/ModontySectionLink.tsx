import Link from "next/link";
import { cn } from "@/lib/utils";

interface ModontySectionLinkProps {
  href: string;
  label: string;
  className?: string;
}

export function ModontySectionLink({ href, label, className }: ModontySectionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center px-1 text-foreground transition-opacity active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 sm:hover:opacity-80",
        className
      )}
    >
      <span className="relative inline-flex h-7 items-center justify-center px-4">
        <svg
          aria-hidden
          className="absolute inset-0 size-full text-accent"
          preserveAspectRatio="none"
          viewBox="0 0 112 28"
        >
          <path
            d="M56 1H13L1 14l12 13h43"
            fill="hsl(var(--primary) / 0.14)"
            stroke="currentColor"
            strokeLinejoin="miter"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="relative whitespace-nowrap text-xs font-bold leading-none text-accent">{label}</span>
      </span>
    </Link>
  );
}
