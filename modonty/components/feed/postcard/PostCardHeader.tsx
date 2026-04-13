import Link from "@/components/link";
import { RelativeTime } from "@/components/date/RelativeTime";
import type { PostCardProps } from "./PostCard.types";
import { PostCardAvatar } from "./PostCardAvatar";

export function PostCardHeader({ post, index, hideClient }: PostCardProps) {
  const metaRow = (
    <div className="flex items-center gap-2">
      <span
        itemProp="datePublished"
        className="text-xs text-muted-foreground"
      >
        <RelativeTime
          date={post.publishedAt}
          dateTime={post.publishedAt.toISOString()}
        />
      </span>
      {post.readingTimeMinutes && (
        <>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            ⏱️ {post.readingTimeMinutes} دقيقة
          </span>
        </>
      )}
    </div>
  );

  return (
    <div className="flex items-start gap-3">
      {!hideClient && (
        <PostCardAvatar
          clientSlug={post.clientSlug}
          clientName={post.clientName}
          clientLogo={post.clientLogo}
          index={index}
        />
      )}
      <div className="flex-1 min-w-0">
        {!hideClient ? (
          <>
            <Link
              href={`/clients/${encodeURIComponent(post.clientSlug)}`}
              className="relative z-10 font-semibold text-sm hover:text-primary hover:underline"
            >
              <span
                itemProp="publisher"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <span itemProp="name">{post.clientName}</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 mt-1">{metaRow}</div>
          </>
        ) : (
          metaRow
        )}
      </div>
    </div>
  );
}
