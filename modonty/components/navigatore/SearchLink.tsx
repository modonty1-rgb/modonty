import Link from "@/components/link";
import { Search } from "lucide-react";

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
        <Search className="h-5 w-5" />
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
      className={`relative flex items-center rounded-md border border-input bg-background pr-10 pl-4 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground ${sizeClasses} ${className}`}
    >
      <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center">
        <Search className="h-4 w-4" aria-hidden />
      </span>
      <span>ابحث...</span>
    </Link>
  );
}

