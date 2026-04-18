import { CtaTrackedLink } from "@/components/cta-tracked-link";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { Button } from "@/components/ui/button";
import { IconArticle } from "@/lib/icons";
import type { FeedPost } from "@/lib/types";

interface ClientPageFeedProps {
  posts: FeedPost[];
  clientName: string;
  clientId?: string;
  relatedClientsCount?: number;
}

export function ClientPageFeed({ posts, clientName, clientId, relatedClientsCount = 0 }: ClientPageFeedProps) {
  return (
    <div className="w-full min-w-0 lg:max-w-[600px] order-1 lg:order-2 space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
      <section aria-labelledby="client-articles-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-3 pt-4">
          <h2 id="client-articles-heading" className="text-base font-bold text-foreground">
            أحدث المقالات
          </h2>
          {posts.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground tabular-nums">
              {new Intl.NumberFormat("ar-SA").format(posts.length)}
            </span>
          )}
        </div>
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post, index) => (
<PostCard
                      key={post.id}
                      post={post}
                      index={index}
                      hideClient
                      className="animate-in fade-in duration-300"
                    />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
              <IconArticle className="h-12 w-12" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              لا توجد مقالات حتى الآن
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              لم ينشر {clientName} أي مقالات حتى الآن. تصفح المحتوى الآخر أو عد لاحقاً.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {relatedClientsCount > 0 && (
                <CtaTrackedLink
                  href="#client-related-heading"
                  label="Empty state – تصفح العملاء المشابهين"
                  type="LINK"
                  clientId={clientId}
                >
                  <Button variant="outline" size="sm">
                    تصفح العملاء المشابهين
                  </Button>
                </CtaTrackedLink>
              )}
              <CtaTrackedLink
                href="/clients"
                label="Empty state – تصفح العملاء"
                type="LINK"
                clientId={clientId}
              >
                <Button variant="outline" size="sm">
                  تصفح العملاء
                </Button>
              </CtaTrackedLink>
              <CtaTrackedLink href="/" label="Empty state – الرئيسية" type="LINK" clientId={clientId}>
                <Button variant="ghost" size="sm">
                  الرئيسية
                </Button>
              </CtaTrackedLink>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
