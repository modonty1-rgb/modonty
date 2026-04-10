'use client';

import { IconComment, IconHelp } from "@/lib/icons";

interface ArticleEngagementMetricsProps {
  comments: number;
  questions?: number;
}

export function ArticleEngagementMetrics({
  comments,
  questions = 0,
}: ArticleEngagementMetricsProps) {
  const scrollToComments = () => {
    document.getElementById('article-comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToFaq = () => {
    document.getElementById('article-faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (comments === 0 && questions === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {comments > 0 && (
        <button
          type="button"
          onClick={scrollToComments}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="انتقل إلى قسم التعليقات"
        >
          <IconComment className="h-4 w-4 shrink-0" />
          <span className="text-xs tabular-nums leading-none">{comments.toLocaleString('ar-SA')}</span>
        </button>
      )}
      {questions > 0 && (
        <button
          type="button"
          onClick={scrollToFaq}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="انتقل إلى الأسئلة الشائعة"
        >
          <IconHelp className="h-4 w-4 shrink-0" />
          <span className="text-xs tabular-nums leading-none">{questions.toLocaleString('ar-SA')}</span>
        </button>
      )}
    </div>
  );
}
