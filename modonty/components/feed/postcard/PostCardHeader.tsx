import Link from "@/components/link";
import { RelativeTime } from "@/components/date/RelativeTime";
import { CheckCircle2 } from "lucide-react";
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
    <header className="flex items-start justify-between">
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
                className="font-semibold text-sm hover:text-primary hover:underline"
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
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
        <CheckCircle2 className="h-3 w-3" />
        <span>نسخة صوتية</span>
      </span>
    </header>
  );
}

