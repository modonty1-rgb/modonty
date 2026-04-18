import Link from "@/components/link";
import { IconSearch } from "@/lib/icons";

interface SearchLinkProps {
  variant?: "full" | "compact" | "icon";
  className?: string;
}

export function SearchLink({ variant = "full", className = "" }: SearchLinkProps) {
  if (variant === "icon") {
    return (
      <Link
        href="/search"
        aria-label="بحث المقالات"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground ${className}`}
      >
        <IconSearch className="h-5 w-5" />
      </Link>
    );
  }

  const sizeClasses =
    variant === "compact"
      ? "h-9 w-full max-w-[200px] text-xs"
      : "h-10 w-full max-w-xs text-sm";

  return (
    <Link
      href="/search"
      role="search"
      aria-label="بحث المقالات"
      className={`relative flex items-center rounded-md border border-input bg-background pr-10 pl-8 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground ${sizeClasses} ${className}`}
    >
      <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center">
        <IconSearch className="h-4 w-4" aria-hidden />
      </span>
      <span>ابحث...</span>
      <kbd className="absolute left-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center justify-center rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground/70 select-none">/</kbd>
    </Link>
  );
}

