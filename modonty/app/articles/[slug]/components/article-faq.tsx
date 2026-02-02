import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ArticleFaqProps {
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

export function ArticleFaq({ faqs }: ArticleFaqProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="my-8 md:my-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-semibold mb-6">الأسئلة الشائعة</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
