import type { MediaSegmentKey } from "../../actions/media-counts";

/**
 * Media segments — one key per clickable card in the dashboard's Media section.
 * Same contract as the client, article and reference segments: the key owns the title
 * and the description, and the rows come from the same function that produced the count.
 */

interface MediaSegment {
  title: string;
  description: string;
}

const SEGMENTS: Record<MediaSegmentKey, MediaSegment> = {
  unused: {
    title: "ملفات غير مستخدمة",
    description:
      "ما شي يشير لها — لا صورة مقال رئيسية ولا معرضه ولا شعار عميل ولا غلافه. تكلّف تخزين وبس.",
  },
  "no-alt": {
    title: "بلا نص بديل (alt)",
    description:
      "ما تظهر في صور جوجل وما يقرأها قارئ الشاشة. تساوي 50 نقطة من سيو الصورة، وهي أهم حقل تعبّيه.",
  },
  "failing-seo": {
    title: "تفشل في السيو",
    description: "تحت 60. النص البديل أو الأبعاد أو الوصف أو اسم الملف ينقصها.",
  },
  "no-dimensions": {
    title: "بلا أبعاد محفوظة",
    description:
      "ما في عرض ولا ارتفاع في السجل. المتصفح ما يحجز لها مكان (الصفحة تقفز)، وما تصلح صورة مشاركة.",
  },
};

export function getMediaSegment(key: string): (MediaSegment & { key: MediaSegmentKey }) | null {
  const s = SEGMENTS[key as MediaSegmentKey];
  return s ? { ...s, key: key as MediaSegmentKey } : null;
}
