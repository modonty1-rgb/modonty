'use client';

import { MessageCircle, Eye, HelpCircle } from "lucide-react";

interface ArticleEngagementMetricsProps {
  comments: number;
  views: number;
  questions?: number;
}

export function ArticleEngagementMetrics({
  comments,
  views,
  questions = 0,
}: ArticleEngagementMetricsProps) {
  const scrollToComments = () => {
    const commentsSection = document.getElementById('article-comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToFaq = () => {
    const faqSection = document.getElementById('article-faq');
    if (faqSection) {
      faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
      {views > 0 && (
        <div className="flex items-center gap-1.5">
          <Eye className="h-4 w-4 shrink-0" />
          <span className="tabular-nums">{views.toLocaleString('ar-SA')}</span>
        </div>
      )}
      {questions > 0 && (
        <button
          type="button"
          onClick={scrollToFaq}
          className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
          aria-label="انتقل إلى الأسئلة الشائعة"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span className="tabular-nums">{questions.toLocaleString('ar-SA')}</span>
        </button>
      )}
      {comments > 0 && (
        <button
          onClick={scrollToComments}
          className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
          aria-label="انتقل إلى قسم التعليقات"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="tabular-nums">{comments.toLocaleString('ar-SA')}</span>
        </button>
      )}
    </div>
  );
}
