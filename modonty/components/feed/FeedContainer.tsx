import { Suspense } from "react";
import Link from "next/link";
import { LeftSidebar } from "@/components/layout/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar/RightSidebar";
import { LeftSidebarSkeleton, RightSidebarSkeleton } from "@/components/layout/SidebarSkeletons";
import { FeedDeferredUI } from "@/components/feed/FeedDeferredUI";
import { CategoryFeedSection } from "@/components/feed/CategoryFeedSection";
import type { FeedPost } from "@/lib/types";

interface FeedContainerProps {
  posts: FeedPost[];
  platformTagline?: string | null;
  platformDescription?: string | null;
}

export function FeedContainer({ posts, platformTagline, platformDescription }: FeedContainerProps) {
  return (
    <>
      <FeedDeferredUI />
      <h2 className="sr-only">أحدث المقالات والمدونات - مودونتي</h2>
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar />
          </Suspense>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 border-t-2 border-t-accent flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{platformTagline ?? "مرحباً بك في مودونتي"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{platformDescription ?? "منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين في مجالات متنوعة."}</p>
              </div>
              <Link
                href="/whats-new"
                className="shrink-0 inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 text-accent px-3 py-1 text-xs font-semibold hover:bg-accent/20 transition-colors whitespace-nowrap"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                جديد مودونتي
              </Link>
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <Suspense>
                <CategoryFeedSection serverPosts={posts} />
              </Suspense>
            </section>
          </div>
          <Suspense fallback={<RightSidebarSkeleton />}>
            <RightSidebar />
          </Suspense>
        </div>
      </div>
    </>
  );
}
