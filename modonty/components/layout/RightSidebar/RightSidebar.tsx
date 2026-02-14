import { getRecentArticles } from "@/app/api/helpers/article-queries";
import { cn } from "@/lib/utils";
import { isMobileRequest } from "../is-mobile-request";
import { ModontyCard } from "./ModontyCard";
import { NewClientsCard } from "./NewClientsCard";
import { SocialCard } from "./SocialCard";
import { More } from "./More";
import type { RightSidebarArticle } from "./types";

interface RightSidebarProps {
  className?: string;
}

export async function RightSidebar({ className }: RightSidebarProps) {
  if (await isMobileRequest()) {
    return null;
  }

  const suggestedArticles = await getRecentArticles(3) as RightSidebarArticle[];

  return (
    <aside
      className={cn(
        "hidden lg:block w-[300px] sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]",
        className
      )}
    >
      <div className="flex h-full flex-col space-y-4">
        <SocialCard />
        <ModontyCard articles={suggestedArticles} />
        <NewClientsCard articles={suggestedArticles} />
        <More />
      </div>
    </aside>
  );
}
