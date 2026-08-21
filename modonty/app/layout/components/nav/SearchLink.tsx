import Link from "next/link";
import { ModontySearchMark } from "@/components/icons/modonty-search-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchLinkProps {
  variant?: "full" | "compact" | "icon";
  className?: string;
}

export function SearchLink({ variant = "full", className = "" }: SearchLinkProps) {
  if (variant === "icon") {
    return (
      <Button
        asChild
        variant="navigation"
        size="mobileIcon"
        className={cn("rounded-xl", className)}
      >
        <Link href="/search" prefetch={false} aria-label="بحث المقالات" className="[--modonty-search-accent:hsl(var(--accent))]">
          <ModontySearchMark aria-hidden />
        </Link>
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href="/search"
        prefetch={false}
        aria-label="بحث المقالات"
        className={cn(
          "group flex h-11 min-w-0 max-w-[200px] items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        <span className="relative flex h-9 w-full min-w-0 items-center overflow-hidden rounded-full border border-input bg-background pe-4 ps-10 text-xs text-muted-foreground transition-colors group-hover:border-primary/50 group-hover:bg-primary/5 group-hover:text-foreground">
          <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center [--modonty-search-accent:hsl(var(--accent))]">
            <ModontySearchMark className="size-4" aria-hidden />
          </span>
          <span className="truncate">البحث…</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/search"
      aria-label="بحث المقالات"
      className={cn(
        "relative flex items-center overflow-hidden rounded-full border border-input bg-background pe-4 ps-10 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "h-10 w-full max-w-xs text-sm",
        className
      )}
    >
      <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center [--modonty-search-accent:hsl(var(--accent))]">
        <ModontySearchMark className="h-4 w-4" aria-hidden />
      </span>
      <span className="truncate">البحث…</span>
    </Link>
  );
}
