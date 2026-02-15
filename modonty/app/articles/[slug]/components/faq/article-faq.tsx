"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchArticleFaqs } from "../../actions/article-lazy-actions";
import { fetchPendingFaqsForArticle } from "../../actions/ask-client-actions";

interface PendingFaq {
  id: string;
  question: string;
  createdAt: Date;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface ArticleFaqProps {
  articleId: string;
  faqsCount: number;
}

function FaqSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="p-4 pb-0">
            <Skeleton className="h-5 w-4/5" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ArticleFaq({ articleId, faqsCount }: ArticleFaqProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [faqs, setFaqs] = useState<FaqItem[] | null>(null);
  const [pendingFaqs, setPendingFaqs] = useState<PendingFaq[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCollapsed || fetched) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchArticleFaqs(articleId), fetchPendingFaqsForArticle(articleId)])
      .then(([faqsData, pendingData]) => {
        setFaqs(faqsData ?? []);
        setPendingFaqs(Array.isArray(pendingData) ? pendingData : []);
        setFetched(true);
      })
      .catch(() => setError("فشل تحميل الأسئلة"))
      .finally(() => setLoading(false));
  }, [isCollapsed, fetched, articleId]);

  const retry = () => { setFetched(false); setError(null); };

  const totalCount = fetched ? (faqs?.length ?? 0) + pendingFaqs.length : faqsCount;
  if (totalCount === 0) return null;

  return (
    <section id="article-faq" className="my-2 md:my-3" aria-labelledby="faq-heading">
      <Card className="min-w-0">
        <CardContent className="p-4 flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setIsCollapsed((c) => !c)}
            className="flex w-full items-center justify-between gap-2 rounded-md hover:bg-muted/50 p-2 -m-2 transition-colors text-right"
            aria-expanded={!isCollapsed}
          >
            <div className="flex flex-col items-end">
              <h2 id="faq-heading" className="text-xs font-semibold text-muted-foreground uppercase shrink-0">
                الأسئلة الشائعة ({totalCount})
              </h2>
              <span className="text-xs text-muted-foreground">
                {isCollapsed ? "انقر لعرض الأسئلة" : "انقر للإخفاء"}
              </span>
            </div>
            <span className="shrink-0 text-muted-foreground" aria-hidden>
              {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </span>
          </button>
          {!isCollapsed && (
            <div className="space-y-4">
              {loading && <FaqSkeleton />}
              {!loading && error && (
                <div className="py-4 text-center">
                  <p className="text-sm text-destructive mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={retry}>إعادة المحاولة</Button>
                </div>
              )}
              {!loading && !error && faqs !== null && (
                <>
                  {faqs.map((faq) => (
                    <Card key={faq.id}>
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingFaqs.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase pt-2">
                        أسئلتك المعلقة
                      </p>
                      {pendingFaqs.map((faq) => (
                        <Card key={faq.id}>
                          <CardHeader className="p-4 pb-0">
                            <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-2">
                            <Badge variant="secondary" className="text-xs">
                              قيد المراجعة
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
