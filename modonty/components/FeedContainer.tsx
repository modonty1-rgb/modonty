import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { InfiniteArticleList } from "@/components/InfiniteArticleList";
import { ScrollProgress } from "@/components/ScrollProgress";
import { BackToTop } from "@/components/BackToTop";

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  clientSlug: string;
  clientLogo?: string;
  author: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  likes: number;
  dislikes: number;
  comments: number;
  favorites: number;
  status: "published" | "draft";
}

interface FeedContainerProps {
  posts: Post[];
}

export function FeedContainer({ posts }: FeedContainerProps) {
  return (
    <>
      <ScrollProgress />
      <h1 className="sr-only">أحدث المقالات والمدونات - مودونتي</h1>
      <div className="container mx-auto max-w-[1128px] px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <LeftSidebar />
          <div className="w-full lg:flex-1 lg:max-w-[600px] space-y-4 pb-20 md:pb-0 [&>article:first-of-type]:!mt-0">
            <section aria-labelledby="articles-feed-heading">
              <h2 id="articles-feed-heading" className="sr-only">
                آخر المقالات
              </h2>
              <InfiniteArticleList initialPosts={posts} />
            </section>
          </div>
          <RightSidebar />
        </div>
      </div>
      <BackToTop />
    </>
  );
}

