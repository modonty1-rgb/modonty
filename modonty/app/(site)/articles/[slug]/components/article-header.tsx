import { RelativeTime } from "@/components/date/RelativeTime";
import { IconViews, IconHelp } from "@/lib/icons";

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
  views?: number;
  questionsCount?: number;
}

export function ArticleHeader({
  title,
  excerpt,
  author,
  datePublished,
  createdAt,
  readingTimeMinutes,
  wordCount,
  views,
  questionsCount,
}: ArticleHeaderProps) {
  return (
    <header className="mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-4 break-words">
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
        {views !== undefined && (
          <span className="flex items-center gap-1">
            <IconViews className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">{views.toLocaleString('ar-SA')}</span>
          </span>
        )}
        {questionsCount !== undefined && questionsCount > 0 && (
          <a
            href="#article-faq"
            className="flex items-center gap-1 hover:text-primary transition-colors"
            aria-label="انتقل إلى الأسئلة الشائعة"
          >
            <IconHelp className="h-3.5 w-3.5 shrink-0" />
            <span className="tabular-nums">{questionsCount.toLocaleString('ar-SA')}</span>
          </a>
        )}
      </div>

    </header>
  );
}
