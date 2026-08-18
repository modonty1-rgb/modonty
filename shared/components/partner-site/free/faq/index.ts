import type { HomeBlock } from "../home";
import { FaqList } from "./faq-list";
import { ContactCards } from "../contact/contact-cards";
import { FinalCta } from "../cta/final-cta";

/**
 * «الأسئلة الشائعة» — an FAQ page is the questions, then the way to ask what is not there
 * (the pattern every FAQ page shares: accordion → «still have a question?» contact → CTA).
 */
export const FAQ_BLOCKS: readonly HomeBlock[] = [
  { key: "faq", name: "كل الأسئلة", toggleable: false, isEmpty: (d) => d.faqs.length === 0, Component: FaqList },
  { key: "contact", name: "ما لقيت سؤالك؟ تواصل", toggleable: true, isEmpty: (d) => !d.contact.address && !d.contact.email && !d.phone, Component: ContactCards },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
