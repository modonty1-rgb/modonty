/**
 * Category utility functions
 * Pure functions that can run on server or client
 */

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

export type CategoryIconComponent = ComponentType<{ className?: string }>;

export function generateCategoryGradient(name: string): string {
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const gradients = [
    "from-primary/20 via-primary/10 to-accent/10",
    "from-secondary/20 via-primary/10 to-background",
    "from-accent/20 via-primary/10 to-background",
    "from-primary/15 to-secondary/10",
    "from-accent/15 to-primary/10",
    "from-primary/20 to-accent/15",
    "from-secondary/15 via-accent/10 to-background",
    "from-accent/20 to-secondary/10",
    "from-primary/25 via-accent/15 to-background",
    "from-secondary/20 to-primary/15",
  ];

  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function getCategoryIcon(name: string): CategoryIconComponent {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('تقنية') || nameLower.includes('برمجة') || nameLower.includes('tech')) {
    return IconCode;
  }
  if (nameLower.includes('أعمال') || nameLower.includes('business') || nameLower.includes('إدارة')) {
    return IconBriefcase;
  }
  if (nameLower.includes('تسويق') || nameLower.includes('marketing')) {
    return IconTrending;
  }
  if (nameLower.includes('تصميم') || nameLower.includes('design')) {
    return IconAi;
  }
  if (nameLower.includes('مجتمع') || nameLower.includes('community') || nameLower.includes('اجتماعي')) {
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

export function formatCategoryStats(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function parseCategorySearchParams(params: Record<string, string | string[] | undefined>) {
  const search = typeof params.search === 'string' ? params.search : undefined;
  const sort = typeof params.sort === 'string' && 
    ['name', 'articles', 'trending', 'recent'].includes(params.sort) 
    ? params.sort as 'name' | 'articles' | 'trending' | 'recent'
    : undefined;
  const view = typeof params.view === 'string' && ['grid', 'list'].includes(params.view)
    ? params.view as 'grid' | 'list'
    : 'grid';
  const featured = typeof params.featured === 'string' ? params.featured : undefined;

  return { search, sort, view, featured };
}
