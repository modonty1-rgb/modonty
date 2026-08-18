import type { ComponentType } from "react";

import {
  IconCategory,
  IconAi,
  IconCode,
  IconBriefcase,
  IconTrending,
  IconUsers,
  IconLightbulb,
  IconZap,
  IconRocket,
  IconTarget,
  IconMessage,
  IconLike,
} from "@/lib/icons";

export type ScopeIconComponent = ComponentType<{ className?: string }>;

/**
 * Picks an icon from a scope's Arabic or English name — neither industries nor categories
 * carry an icon field, and chat has no room to ask for one.
 */
export function getScopeIcon(name: string): ScopeIconComponent {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('صحة') || nameLower.includes('طب') || nameLower.includes('علاج') || nameLower.includes('health')) {
    return IconLike;
  }
  if (nameLower.includes('تقنية') || nameLower.includes('تكنولوجيا') || nameLower.includes('برمجة') || nameLower.includes('tech')) {
    return IconCode;
  }
  if (nameLower.includes('تجارة') || nameLower.includes('عقار') || nameLower.includes('أعمال') || nameLower.includes('business') || nameLower.includes('إدارة')) {
    return IconBriefcase;
  }
  if (nameLower.includes('تسويق') || nameLower.includes('marketing')) {
    return IconTrending;
  }
  if (nameLower.includes('تصميم') || nameLower.includes('design')) {
    return IconAi;
  }
  if (nameLower.includes('تأهيل') || nameLower.includes('تدريب') || nameLower.includes('تنمية') || nameLower.includes('مجتمع') || nameLower.includes('community') || nameLower.includes('اجتماعي')) {
    return IconUsers;
  }
  if (nameLower.includes('ابتكار') || nameLower.includes('innovation')) {
    return IconLightbulb;
  }
  if (nameLower.includes('إنتاجية') || nameLower.includes('productivity')) {
    return IconZap;
  }
  if (nameLower.includes('ريادة') || nameLower.includes('startup')) {
    return IconRocket;
  }
  if (nameLower.includes('استراتيجية') || nameLower.includes('strategy')) {
    return IconTarget;
  }
  if (nameLower.includes('محتوى') || nameLower.includes('content')) {
    return IconMessage;
  }
  if (nameLower.includes('علاقات') || nameLower.includes('relationship')) {
    return IconLike;
  }

  return IconCategory;
}
