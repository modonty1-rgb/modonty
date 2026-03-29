import Link from "@/components/link";
import { IconCategory } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface CategoryLinkProps {
  label: string;
  count: number;
  slug: string;
  isActive?: boolean;
}

export function CategoryLink({ label, count, slug, isActive }: CategoryLinkProps) {
  return (
    <Link
      href={`/?category=${slug}`}
      className={cn(
        "flex min-w-0 max-w-full items-center justify-between gap-2 overflow-hidden px-3 py-2 rounded-md transition-colors text-sm group",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
    >
      <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        <IconCategory
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
          )}
        />
        <span
          className={cn(
            "min-w-0 truncate text-right transition-colors",
            isActive ? "text-primary-foreground" : "group-hover:text-primary"
          )}
        >
          {label}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 text-xs transition-colors",
          isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
        )}
      >
        {count}
      </span>
    </Link>
  );
}
