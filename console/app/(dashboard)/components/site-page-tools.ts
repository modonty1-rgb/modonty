import { PAGE_LABELS, type BlocksPage } from "@/lib/my-site/page-keys";

import { SITE_PAGES } from "./site-pages";

/**
 * Every «موقعك» item from the sidebar, spread across the top instead (Khalid 2026-08-30:
 * «كل الصفحات اللي موجودة في Side bar تكون موجودة فوق»). `SITE_PAGES` is the same list the
 * sidebar reads, so a page added to the site appears here without a second edit.
 *
 * الأيقونة من قائمة السايدبار، والتسمية من `PAGE_LABELS` — كان الزرّ يقول «المدونة»
 * ويقول رأس اللوحة «صفحة مقالاتي»، والاسمان لصفحة واحدة يربكان لا يوضّحان.
 *
 * «احجز» ليست صفحة يضبطها الشريك هنا: الحجز قسمٌ داخل الرئيسية والخدمات، وأيقونة
 * ثالثة له تعني حجزين في ذهن العميل (خالد ٣٠ أغسطس). مسارها القديم باقٍ يعمل.
 */
export const SITE_PAGE_TOOLS = SITE_PAGES.filter((p) => p.key !== "book").map((p) => ({
  key: p.key as BlocksPage,
  label: PAGE_LABELS[p.key as BlocksPage] ?? p.label,
  Icon: p.icon,
}));
