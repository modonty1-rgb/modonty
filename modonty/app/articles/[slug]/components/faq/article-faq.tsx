"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PendingFaq {
  id: string;
  question: string;
  createdAt: Date;
}

interface ArticleFaqProps {
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  pendingFaqs?: PendingFaq[];
}

export function ArticleFaq({ faqs, pendingFaqs = [] }: ArticleFaqProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const totalCount = (faqs?.length ?? 0) + pendingFaqs.length;
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
              {(faqs ?? []).map((faq) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
