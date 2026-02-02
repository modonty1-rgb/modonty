'use client';

import { MessageCircle, Eye } from "lucide-react";

interface ArticleEngagementMetricsProps {
  comments: number;
  views: number;
}

export function ArticleEngagementMetrics({
  comments,
  views,
}: ArticleEngagementMetricsProps) {
  const scrollToComments = () => {
    const commentsSection = document.getElementById('article-comments');
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex items-center gap-3 md:gap-4 text-sm text-muted-foreground flex-wrap">
      {views > 0 && (
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>{views.toLocaleString('ar-SA')}</span>
        </div>
      )}
      {comments > 0 && (
        <button
          onClick={scrollToComments}
          className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          aria-label="انتقل إلى قسم التعليقات"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.toLocaleString('ar-SA')}</span>
        </button>
      )}
    </div>
  );
}
