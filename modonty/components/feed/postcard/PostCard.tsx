import { cn } from "@/lib/utils";
import type { PostCardProps } from "./PostCard.types";
import { PostCardHeader } from "./PostCardHeader";
import { PostCardBody } from "./PostCardBody";
import { PostCardFooter } from "./PostCardFooter";

export function PostCard({ className, index, priority, isLcp, ...rest }: PostCardProps) {
  // Caller controls priority & isLcp; defaults are just safety.
  const effectivePriority = priority ?? false;
  const effectiveIsLcp = isLcp ?? false;

  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        "bg-white border border-border",
        className
      )}
    >
      <header className="flex flex-col space-y-1.5 p-6 pb-3">
        <PostCardHeader
          post={rest.post}
          priority={effectivePriority}
          isLcp={effectiveIsLcp}
          index={index}
        />
      </header>
      <div className="p-6 pt-0 space-y-4">
        <PostCardBody
          post={rest.post}
          priority={effectivePriority}
          isLcp={effectiveIsLcp}
          index={index}
        />
        <PostCardFooter post={rest.post} />
      </div>
    </article>
  );
}

