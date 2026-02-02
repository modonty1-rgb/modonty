import { ArticleCard } from "@/components/ArticleCard";

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  publishedAt: Date;
  clientName: string;
  status: "published" | "draft";
}

interface ArticleFeedProps {
  articles: Article[];
}

export function ArticleFeed({ articles }: ArticleFeedProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}




