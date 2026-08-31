import {
  Image as ImageIcon,
  FileText,
  Pen,
  Folder,
  XCircle,
  Search,
  Award,
  Sparkles,
  Gauge,
  Rocket,
  ShieldCheck,
  Globe,
} from "lucide-react";

import { ModontyIcon } from "@/components/admin/icons/modonty-icon";

/**
 * THE list of guideline sections — one source for the directory page AND the hub sidebar.
 *
 * They used to be two separate hand-maintained arrays. The sidebar was never updated when
 * sections were added or merged, so it kept offering «البراند» as its own page long after it
 * became part of the identity page, and showed none of the sections written since. Two lists
 * of the same thing always drift; the only fix is to have one.
 *
 * Order = the production loop from the business model: research → write → visuals → review →
 * publish. That is the order the team works in, so the directory needs no explaining.
 */

export interface GuidelineItem {
  id: string;
  title: string;
  /** One short line — this is a directory, it gets scanned, not read. */
  line: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface GuidelineStage {
  n: string;
  title: string;
  question: string;
  items: GuidelineItem[];
}

export const GUIDELINE_STAGES: GuidelineStage[] = [
  {
    n: "١",
    title: "بحث وتخطيط",
    question: "وش نكتب، ولمين؟",
    items: [
      { id: "organization", title: "تنظيم المحتوى", line: "تصنيف · وسم · مجال — وش الفرق", icon: Folder },
      { id: "briefs", title: "البريفات وأسئلة العميل", line: "من وين تجي فكرة المقال", icon: FileText },
    ],
  },
  {
    n: "٢",
    title: "كتابة",
    question: "كيف يُكتب المقال؟",
    items: [
      { id: "articles", title: "المقالات", line: "الرحلة من الفكرة إلى النشر", icon: FileText },
      { id: "authors", title: "الكتّاب", line: "مين يُنسب له المقال ومتى", icon: Pen },
    ],
  },
  {
    n: "٣",
    title: "إنتاج بصري",
    question: "الصور والفيديو",
    items: [
      { id: "media", title: "الصور والوسائط", line: "المقاسات ومكان كل صورة", icon: ImageIcon },
      { id: "image-seo", title: "سيو الصور", line: "النص البديل والوصف واسم الملف", icon: Gauge },
      { id: "reels", title: "الريلز", line: "تسليم متعاقَد عليه في الباقة", icon: Sparkles },
    ],
  },
  {
    n: "٤",
    title: "مراجعة واعتماد",
    question: "وش يمنع النشر؟",
    items: [
      { id: "publishing", title: "بوّابة النشر وصحّة المقال", line: "الشروط اللي توقف النشر", icon: ShieldCheck },
      { id: "seo-score", title: "نتيجة سيو المقال", line: "من وين يجي الرقم", icon: Gauge },
      { id: "prohibitions", title: "الممنوعات", line: "الخطوط الحمراء عبر كل الأقسام", icon: XCircle },
    ],
  },
  {
    n: "٥",
    title: "نشر وقياس",
    question: "وين يوصل المحتوى؟",
    items: [
      { id: "seo-visual", title: "معاينة البحث والمشاركة", line: "شكل مقالك في جوجل وواتساب", icon: Search },
      { id: "client-articles", title: "مقالات العملاء", line: "يُنشر على موقع العميل لا عندنا", icon: Globe },
    ],
  },
];

/**
 * Read once in the first week. «مودونتي والبراند» is ONE entry: who we are and how we look
 * and sound are the same identity, and as two links a new hire read one and left the other.
 */
export const GUIDELINE_FOUNDATION: GuidelineItem[] = [
  // «من نحن» and the brand identity now live in the one-document guideline itself — they were
  // moved there, not deleted, so a separate entry would send the reader to a duplicate.
  { id: "golden-rules", title: "القواعد الذهبية", line: "٢٠ قاعدة لا تُكسر", icon: Award },
  { id: "team-onboarding", title: "تأهيل الفريق", line: "خطّة أول أسبوع", icon: Rocket },
];
