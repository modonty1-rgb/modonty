/**
 * Category utility functions
 * Pure functions that can run on server or client
 */

import {
  Tag, Sparkles, Code, Briefcase, TrendingUp, Users,
  Lightbulb, Zap, Rocket, Target, MessageSquare, Heart,
  type LucideIcon
} from "lucide-react";

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

export function getCategoryIcon(name: string): LucideIcon {
  const nameLower = name.toLowerCase();

  if (nameLower.includes('تقنية') || nameLower.includes('برمجة') || nameLower.includes('tech')) {
    return Code;
  }
  if (nameLower.includes('أعمال') || nameLower.includes('business') || nameLower.includes('إدارة')) {
    return Briefcase;
  }
  if (nameLower.includes('تسويق') || nameLower.includes('marketing')) {
    return TrendingUp;
  }
  if (nameLower.includes('تصميم') || nameLower.includes('design')) {
    return Sparkles;
  }
  if (nameLower.includes('مجتمع') || nameLower.includes('community') || nameLower.includes('اجتماعي')) {
    return Users;
  }
  if (nameLower.includes('ابتكار') || nameLower.includes('innovation')) {
    return Lightbulb;
  }
  if (nameLower.includes('إنتاجية') || nameLower.includes('productivity')) {
    return Zap;
  }
  if (nameLower.includes('ريادة') || nameLower.includes('startup')) {
    return Rocket;
  }
  if (nameLower.includes('استراتيجية') || nameLower.includes('strategy')) {
    return Target;
  }
  if (nameLower.includes('محتوى') || nameLower.includes('content')) {
    return MessageSquare;
  }
  if (nameLower.includes('علاقات') || nameLower.includes('relationship')) {
    return Heart;
  }

  return Tag;
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

export function optimizeCloudinaryImage(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif';
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width = 600, height = 338, quality = 'auto', format = 'auto' } = options;

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    'c_fill',
    `q_${quality}`,
    `f_${format}`,
  ].join(',');

  return url.replace('/upload/', `/upload/${transformations}/`);
}

export function generateBlurDataURL(width: number = 10, height: number = 6): string {
  const canvas = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:rgb(230,230,230);stop-opacity:1" />
        <stop offset="100%" style="stop-color:rgb(200,200,200);stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#grad)" />
  </svg>`;
  
  if (typeof Buffer !== 'undefined') {
    const base64 = Buffer.from(canvas).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(canvas)}`;
}
