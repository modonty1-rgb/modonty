import { getRecentArticles } from "@/app/api/helpers/article-queries";
import { getOptimizedLogoUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import { isMobileRequest } from "../is-mobile-request";
import { NewsCard } from "./NewsCard";
import { SuggestionsCard } from "./SuggestionsCard";
import { NewsletterCard } from "./NewsletterCard";
import type { RightSidebarArticle } from "./types";

interface RightSidebarProps {
  className?: string;
}

export async function RightSidebar({ className }: RightSidebarProps) {
  if (await isMobileRequest()) {
    return null;
  }

  const suggestedArticles = await getRecentArticles(3) as RightSidebarArticle[];
  const logoSrc = getOptimizedLogoUrl();

  return (
    <aside
      className={cn(
        "hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]",
        className
      )}
    >
      <div className="flex h-full flex-col space-y-4">
        <NewsCard articles={suggestedArticles} logoSrc={logoSrc} />
        <SuggestionsCard articles={suggestedArticles} />
        <NewsletterCard />
      </div>
    </aside>
  );
}
