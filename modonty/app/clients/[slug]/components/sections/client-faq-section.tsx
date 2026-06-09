import { SectionCard } from "@/app/clients/[slug]/components/sections/section-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ClientFaqQuestionForm } from "./client-faq-question-form";

interface ClientFaq {
  id: string;
  question: string;
  answer: string;
}

/** Correct Arabic count phrasing for «أجبنا على …» (1=واحد · 2=مثنى · 3-10=جمع · 11+=تمييز مفرد منصوب). */
function answeredCountLabel(n: number): string {
  if (n === 1) return "سؤال واحد";
  if (n === 2) return "سؤالين";
  if (n >= 3 && n <= 10) return `${n} أسئلة`;
  return `${n} سؤالًا`;
}

interface ClientFaqSectionProps {
  faqs: ClientFaq[];
  slug: string;
}

/**
 * Client-page FAQ section (mockup `.faq`/`.fq`/`.faqCount`). Server Component:
 * renders answered questions as a single-open accordion and ALWAYS shows the
 * ask-a-question island below (visitors can ask even with zero published FAQs).
 */
export function ClientFaqSection({ faqs, slug }: ClientFaqSectionProps) {
  const hasFaqs = faqs.length > 0;

  return (
    <SectionCard id="faq" icon="❓" title="الأسئلة الشائعة">
      {hasFaqs ? (
        <>
          <p className="mb-3 text-[11.5px] text-muted-foreground">
            أجبنا على{" "}
            <b className="font-extrabold text-foreground">
              {answeredCountLabel(faqs.length)}
            </b>{" "}
            من أسئلة قرّائنا الحقيقية.
          </p>
          <Accordion type="single" collapsible defaultValue={faqs[0].id} className="flex flex-col gap-[9px]">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="overflow-hidden rounded-md border bg-muted/40"
              >
                <AccordionTrigger className="px-4 py-3 text-start text-[13px] font-extrabold text-foreground no-underline hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3.5 pt-0 text-[12.5px] leading-[1.65] text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </>
      ) : (
        <p className="mb-3 text-[12.5px] leading-[1.65] text-muted-foreground">
          لا توجد أسئلة منشورة بعد — اطرح سؤالك وسنجيبك مباشرةً.
        </p>
      )}

      <ClientFaqQuestionForm slug={slug} />
    </SectionCard>
  );
}
