import type { HomeBlock } from "../home";
import { ServicesList } from "./services-list";
import { BookingBlock } from "../booking/booking-block";
import { TrustStrip } from "../trust/trust-strip";
import { StatsRow } from "../stats/stats-row";
import { TestimonialsGrid } from "../testimonials/testimonials-grid";
import { FaqAccordion } from "../faq/faq-accordion";
import { FinalCta } from "../cta/final-cta";

/**
 * «خدماتنا» — الترتيب: ما نقدّمه → لماذا نحن (اعتمادات · أرقام · آراء) → الأسئلة → طلبٌ
 * واحد → خاتمة.
 *
 * أُعيد ترتيبها في ٣١ أغسطس بعد قياس الصفحة الحيّة: كان «احجز» ثانياً — قبل أي دليل —
 * وكانت ثلاثة أقسام تطلب (احجز · تواصل · النداء) تشغل **١٢٩٠px من ٣٢٤٣** أي ٤٠٪ من
 * الصفحة، مقابل ٥٩٧px للخدمات نفسها. ما يقوله البحث:
 *
 * - CXL: بنية الصفحة المحوِّلة = عنوان → منفعة → **دليل اجتماعي** → **طلبٌ واحد** يتكرّر
 *   في مواضع منطقية؛ والصفحات متعدّدة العروض تجلب **٢٦٦٪ عملاء أقلّ** من صفحة بعرض واحد.
 * - NN/g: «النداءات المتنافسة تُضعف بعضها» (multiple, competing CTAs diminish each
 *   other's salience).
 * - NN/g: الأسئلة الشائعة تسبق الطلب لأنها تُسقط الاعتراضات قبله.
 *
 * فـ«تواصل» غادرت هذي الصفحة — لها صفحتها، ورابطها في الشريط والذيل — ليبقى في الصفحة
 * طلبٌ واحد: نموذج الحجز، ثم شريط الخاتمة.
 */
export const SERVICES_BLOCKS: readonly HomeBlock[] = [
  { key: "services", name: "الخدمات بالتفصيل", toggleable: false, isEmpty: (d) => d.services.length === 0, Component: ServicesList },
  { key: "trust", name: "شريط الثقة", toggleable: true, isEmpty: (d) => d.trust.credentials.length === 0, Component: TrustStrip },
  { key: "stats", name: "أرقامنا", toggleable: true, isEmpty: (d) => d.stats.length === 0, Component: StatsRow },
  { key: "testimonials", name: "آراء العملاء", toggleable: true, isEmpty: (d) => d.testimonials.length === 0, Component: TestimonialsGrid },
  { key: "faq", name: "الأسئلة الشائعة", toggleable: true, isEmpty: (d) => d.faqs.length === 0, Component: FaqAccordion },
  { key: "booking", name: "احجز", toggleable: true, isEmpty: (d) => d.booking.mode === "NONE", Component: BookingBlock },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
