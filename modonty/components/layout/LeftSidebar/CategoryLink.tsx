import Link from "@/components/link";
import { Tag } from "lucide-react";
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
        "flex items-center justify-between px-3 py-2 rounded-md transition-colors text-sm group",
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Tag
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"
          )}
        />
        <span className={cn("transition-colors", isActive ? "text-primary-foreground" : "group-hover:text-primary")}>
          {label}
        </span>
      </span>
      <span className={cn("text-xs transition-colors", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")}>
        {count}
      </span>
    </Link>
  );
}
