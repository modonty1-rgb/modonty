import { Suspense } from "react";
import Link from "next/link";
import { LeftSidebar } from "@/components/layout/LeftSidebar/LeftSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar/RightSidebar";
import { LeftSidebarSkeleton, RightSidebarSkeleton } from "@/components/layout/SidebarSkeletons";
import { FeedDeferredUI } from "@/components/feed/FeedDeferredUI";
import { CategoryFeedSection } from "@/components/feed/CategoryFeedSection";
import { InfiniteFeedSkeleton } from "@/components/feed/infiniteScroll/InfiniteFeedSkeleton";
import { PlatformSocialLinks } from "@/components/layout/PlatformSocialLinks";
import { IconInfo } from "@/lib/icons";
import type { FeedPost } from "@/lib/types";
import type { SocialLink } from "@/lib/settings/get-platform-social-links";

interface FeedContainerProps {
  posts: FeedPost[];
  platformTagline?: string | null;
  platformDescription?: string | null;
  socialLinks: SocialLink[];
}

export function FeedContainer({ posts, platformTagline, platformDescription, socialLinks }: FeedContainerProps) {
  return (
    <>
      <FeedDeferredUI />
      <h2 className="sr-only">أحدث المقالات والمدونات - مدونتي</h2>
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <Suspense fallback={<LeftSidebarSkeleton />}>
            <LeftSidebar />
          </Suspense>
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 border-t-2 border-t-accent space-y-2.5">
              {/* Top row — welcome text (start) + «من نحن» in the opposite corner */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground line-clamp-1">{platformTagline ?? "مرحباً بك في مدونتي"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{platformDescription ?? "منصة المحتوى العربي — اكتشف مقالات من خبراء ومتخصصين في مجالات متنوعة."}</p>
                </div>
                <Link
                  href="/about"
                  className="shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconInfo className="h-3.5 w-3.5" aria-hidden />
                  من نحن
                </Link>
              </div>
              {/* Bottom row — social (start) + «جديد مدونتي» (end), uses the free space */}
              <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5">
                {socialLinks.length > 0 ? (
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">تابعنا</span>
                    <PlatformSocialLinks socialLinks={socialLinks} />
                  </div>
                ) : (
                  <span />
                )}
                <Link
                  href="/news"
                  className="shrink-0 inline-flex items-center gap-1 rounded-full bg-accent/10 border border-accent/30 text-accent px-3 py-1 text-xs font-semibold hover:bg-accent/20 transition-colors whitespace-nowrap"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </span>
                  جديد مدونتي
                </Link>
              </div>
            </div>
            <section aria-labelledby="articles-feed-heading" className="space-y-4 [&>*:nth-child(2)]:!mt-0">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <Suspense fallback={<InfiniteFeedSkeleton count={3} />}>
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
