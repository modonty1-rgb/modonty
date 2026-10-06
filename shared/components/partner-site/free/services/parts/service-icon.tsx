import {
  Baby, Bone, Brain, Briefcase, Camera, Car, Code, Dumbbell, Eye, GraduationCap, HeartPulse, Home,
  Megaphone, Pill, Plane, Scale, Scissors, ShieldCheck, ShoppingBag, Smile, Sparkles, Stethoscope,
  Syringe, Utensils, Wrench, type LucideIcon,
} from "lucide-react";

/**
 * One icon per service instead of the same briefcase on every card (review, 4 Oct 2026: seven
 * services, seven identical icons). The partner's own choice (`icon`, a name from this list) wins;
 * otherwise the service title picks one by keyword; otherwise the briefcase. A fixed list, not all
 * of lucide — the console preview renders this in the browser, and the whole set would ship there.
 */
const ICONS: Record<string, LucideIcon> = {
  baby: Baby, bone: Bone, brain: Brain, briefcase: Briefcase, camera: Camera, car: Car, code: Code,
  dumbbell: Dumbbell, eye: Eye, "graduation-cap": GraduationCap, "heart-pulse": HeartPulse, home: Home,
  megaphone: Megaphone, pill: Pill, plane: Plane, scale: Scale, scissors: Scissors,
  "shield-check": ShieldCheck, "shopping-bag": ShoppingBag, smile: Smile, sparkles: Sparkles,
  stethoscope: Stethoscope, syringe: Syringe, utensils: Utensils, wrench: Wrench,
};

/** Arabic keywords → icon. First match wins, so the specific words come before the general ones. */
const KEYWORDS: [RegExp, LucideIcon][] = [
  [/أطفال|طفل|رضيع/, Baby],
  [/تبييض|تجميل|بشرة|ليزر/, Sparkles],
  [/تنظيف|وقاية|تعقيم|حماية|ضمان/, ShieldCheck],
  [/أسنان|سنّ|سن |تقويم|زراعة|ابتسامة|حشو/, Smile],
  [/عصب|جذور|حقن|تخدير/, Syringe],
  [/نفسي|علاج سلوكي|إدمان|تعافي/, Brain],
  [/قلب|طوارئ|إسعاف/, HeartPulse],
  [/عيون|نظر|بصر/, Eye],
  [/عظام|مفاصل|علاج طبيعي/, Bone],
  [/صيدلية|دواء|أدوية/, Pill],
  [/كشف|استشارة طبية|طبيب|عيادة|فحص/, Stethoscope],
  [/حلاقة|صالون|شعر/, Scissors],
  [/مطعم|طعام|وجبات|تموين|ضيافة/, Utensils],
  [/سيارة|سيارات|نقل|توصيل/, Car],
  [/عقار|شقق|بيت|منزل|تصميم داخلي/, Home],
  [/تعليم|دورة|تدريب|أكاديمية/, GraduationCap],
  [/محاماة|قانون|استشارة قانونية|عقود/, Scale],
  [/تسويق|إعلان|سوشيال|علامة تجارية/, Megaphone],
  [/برمجة|تطبيق|موقع|تقنية/, Code],
  [/تصوير|فيديو|مونتاج/, Camera],
  [/رياضة|لياقة|نادي/, Dumbbell],
  [/سفر|سياحة|رحلات|طيران/, Plane],
  [/متجر|بيع|منتجات|تسوّق/, ShoppingBag],
  [/صيانة|تركيب|إصلاح/, Wrench],
];

export function serviceIcon(title: string, chosen?: string | null): LucideIcon {
  if (chosen && ICONS[chosen]) return ICONS[chosen];
  return KEYWORDS.find(([re]) => re.test(title))?.[1] ?? Briefcase;
}
