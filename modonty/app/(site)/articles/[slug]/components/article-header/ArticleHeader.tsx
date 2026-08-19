import Link from "next/link";
import { VerifiedBadge } from "@modonty/shared/components/verified-badge/VerifiedBadge";

import { RelativeTime } from "@/components/date/RelativeTime";
import { IconViews, IconHelp } from "@/lib/icons";

interface ArticleHeaderProps {
  title: string;
  excerpt: string | null;
  author: {
    name: string;
  };
  /** The partner who approved the article — the one line a reader checks before trusting it. */
  reviewer?: { name: string; slug: string; credential: string | null } | null;
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
  reviewer,
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

      {/* One line, above the article — the byline Google asks for ("is it self-evident to your
          visitors who authored your content? do pages carry a byline where one might be
          expected?"), and the shape every large medical publisher uses: reviewer named in a
          single line at the top, full card at the end. Before reading, the visitor is asking
          "can I trust this?" — a line answers it. "How do I reach them?" comes after. */}
      {reviewer && (
        <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-2.5 text-sm">
          <VerifiedBadge className="h-4 w-4" label="مراجَع ومعتمَد" />
          <span className="text-muted-foreground">راجعه واعتمده</span>
          <Link
            href={`/clients/${reviewer.slug}`}
            className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {reviewer.name}
          </Link>
          {reviewer.credential && (
            <span className="text-muted-foreground line-clamp-1">— {reviewer.credential}</span>
          )}
        </div>
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
