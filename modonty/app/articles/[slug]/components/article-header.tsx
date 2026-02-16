import { RelativeTime } from "@/components/date/RelativeTime";

interface ArticleHeaderProps {
  title: string;
  excerpt: string | null;
  author: {
    name: string;
  };
  datePublished: Date | null;
  createdAt: Date;
  readingTimeMinutes: number | null;
  wordCount: number | null;
}

export function ArticleHeader({
  title,
  excerpt,
  author,
  datePublished,
  createdAt,
  readingTimeMinutes,
  wordCount,
}: ArticleHeaderProps) {
  return (
    <header className="mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">
        {title}
      </h1>

      {excerpt && (
        <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
          {excerpt}
        </p>
      )}

      <div className="flex flex-row flex-wrap items-center gap-2 sm:gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-2">
          <span>{author.name}</span>
        </div>
        <RelativeTime
          date={datePublished ?? createdAt}
          dateTime={datePublished?.toISOString() ?? createdAt.toISOString()}
        />
        {readingTimeMinutes && (
          <span>⏱️ {readingTimeMinutes} دقيقة قراءة</span>
        )}
        {wordCount && <span>📝 {wordCount} كلمة</span>}
      </div>

    </header>
  );
}
