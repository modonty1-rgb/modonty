"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { Article } from "../helpers/article-view-types";
import { FieldLabel } from "./shared/field-label";
import { CopyableId } from "./shared/copyable-id";

interface ArticleViewFaqsProps {
  article: Article;
  sectionRef: (el: HTMLElement | null) => void;
}

export function ArticleViewFaqs({ article, sectionRef }: ArticleViewFaqsProps) {
  if (!article.faqs || article.faqs.length === 0) return null;

  return (
    <Card id="section-faqs" ref={sectionRef} className="scroll-mt-20">
      <CardHeader className="text-right" dir="rtl">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <CardTitle className="text-right flex-1">Frequently Asked Questions</CardTitle>
          <FieldLabel
            label=""
            fieldPath="article.faqs"
            fieldType="ArticleFAQ[]"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-right" dir="rtl">
        {article.faqs.map((faq, index) => (
          <div key={faq.id} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-2">
              <div className="text-base font-semibold flex items-start gap-2 text-right flex-1">
                <span className="text-primary mt-0.5 shrink-0">س{index + 1}:</span>
                <span>{faq.question}</span>
              </div>
              <CopyableId id={faq.id} label="FAQ" />
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap text-right" dir="rtl">
              {faq.answer}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
