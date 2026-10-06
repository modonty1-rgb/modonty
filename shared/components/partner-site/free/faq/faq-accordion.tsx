import { Section } from "../home/parts/section";
import { ViewAllLink } from "../home/parts/view-all-link";
import type { HomeData } from "../home/home-data";
import { FaqItems } from "./parts/faq-items";

/**
 * How many questions this accordion renders. Exported because the page that renders it also
 * declares an `FAQPage` to Google, and the two must describe the SAME set: Google's structured
 * data policy is "Don't mark up content that is not visible to readers of the page"
 * (developers.google.com/search/docs/appearance/structured-data/sd-policies). The partner home
 * page declared all thirty questions while showing six, so twenty questions and their answers
 * were promised to Google and absent from the HTML (measured 27 Aug 2026). The full set lives
 * on the partner's /faq page, which renders every question and ships its own FAQPage.
 */
export const HOME_FAQ_LIMIT = 6;

/** «الأسئلة الشائعة» — native <details> accordion (Shopify `collapsible-content`): no client JS, works everywhere. */
export function FaqAccordion({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="faq" eyebrow="قبل أن تسأل" heading="الأسئلة الشائعة">
      <FaqItems faqs={data.faqs.slice(0, HOME_FAQ_LIMIT)} />
      <ViewAllLink href={data.faqHref} label="كل الأسئلة" shown={Math.min(HOME_FAQ_LIMIT, data.faqs.length)} total={data.faqs.length} />
    </Section>
  );
}
