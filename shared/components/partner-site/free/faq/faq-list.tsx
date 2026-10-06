import { Section } from "../home/parts/section";
import type { HomeData } from "../home/home-data";
import { FaqItems } from "./parts/faq-items";

/** «الأسئلة الشائعة — كلّها» — the FAQ page's core: every published question, native accordion, one open at a time via <details name>. */
export function FaqList({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="faq" eyebrow="قبل أن تسأل" heading="أسئلة وأجوبتها">
      <FaqItems faqs={data.faqs} name="faq" />
    </Section>
  );
}
