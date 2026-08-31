import type { HomeBlock } from "../home";
import { GalleryJustified } from "./gallery-justified";
import { FinalCta } from "../cta/final-cta";

/**
 * «ألبوم أعمالنا» — صور الشغل، وبس، ثم دعوة واحدة للتواصل.
 *
 * كانت الصفحة تحمل الفيديو التعريفي وآراء العملاء أيضاً (نمط بورتفوليو عام). خالد شالهما
 * في ٣١ أغسطس: للفيديو مكانه مع القصّة في الرئيسية، وللآراء صفحتها المستقلّة — وتكرارهما
 * هنا يبعد الزائر عن سبب دخوله الصفحة. الاسم نفسه صار «ألبوم»، فالصور هي موضوعها.
 */
export const GALLERY_BLOCKS: readonly HomeBlock[] = [
  { key: "gallery", name: "كل الصور", toggleable: false, isEmpty: (d) => d.gallery.length === 0, Component: GalleryJustified },
  { key: "cta", name: "النداء الأخير", toggleable: false, isEmpty: () => false, Component: FinalCta },
] as const;
