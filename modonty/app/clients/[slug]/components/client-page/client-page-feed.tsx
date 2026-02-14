import Link from "@/components/link";
import { PostCard } from "@/components/feed/postcard/PostCard";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { FeedPost } from "@/lib/types";

interface ClientPageFeedProps {
  posts: FeedPost[];
  clientName: string;
  relatedClientsCount?: number;
}

export function ClientPageFeed({ posts, clientName, relatedClientsCount = 0 }: ClientPageFeedProps) {
  return (
    <div className="w-full min-w-0 lg:max-w-[600px] order-1 lg:order-2 space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
      <section aria-labelledby="client-articles-heading" className="space-y-4">
        <h2 id="client-articles-heading" className="sr-only">
          المقالات
        </h2>
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
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              لا توجد مقالات حتى الآن
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              لم ينشر {clientName} أي مقالات حتى الآن. تصفح المحتوى الآخر أو عد لاحقاً.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {relatedClientsCount > 0 && (
                <Link href="#client-related-heading">
                  <Button variant="outline" size="sm">
                    تصفح العملاء المشابهين
                  </Button>
                </Link>
              )}
              <Link href="/clients">
                <Button variant="outline" size="sm">
                  تصفح العملاء
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
