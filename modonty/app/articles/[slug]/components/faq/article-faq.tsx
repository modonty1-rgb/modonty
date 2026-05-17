import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaqCollapsibleBody } from "./faq-collapsible-body";

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
  faqs: FaqItem[];
  pendingFaqs: PendingFaq[];
}

export function ArticleFaq({ articleId: _articleId, faqsCount, faqs, pendingFaqs }: ArticleFaqProps) {
  if (faqsCount === 0 || faqs.length === 0) return null;

  return (
    <section id="article-faq" className="my-2 md:my-3" aria-labelledby="faq-heading">
      <Card className="min-w-0">
        <CardContent className="p-4 flex flex-col gap-4">
          <FaqCollapsibleBody
            headingId="faq-heading"
            title={`الأسئلة الشائعة (${faqsCount})`}
          >
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
                      <Badge className="text-xs bg-accent text-accent-foreground">
                        قيد المراجعة
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </FaqCollapsibleBody>
        </CardContent>
      </Card>
    </section>
  );
}
