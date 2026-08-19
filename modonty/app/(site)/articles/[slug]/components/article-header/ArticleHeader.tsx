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
      {/* The loudest thing on a reading page has to be what the visitor came to read. At
          30px/600 the title was quieter than the partner's 57px call-to-action beside it. */}
      <h1 className="mb-4 break-words text-3xl font-bold leading-tight tracking-tight md:text-[2.5rem]">
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
        {wordCount && <span>📝 {wordCount.toLocaleString("ar-SA")} كلمة</span>}
        {/* A zero is worse than nothing: printing «٠ مشاهدة» under the title tells every new
            reader that nobody has read this. The counter appears once there is one. */}
        {views !== undefined && views > 0 && (
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
