export type TabItem = { segment: string | null; label: string; shortLabel?: string };

export const ALL_TAB_ITEMS: TabItem[] = [
  { segment: null,        label: "الكل",            shortLabel: "الكل"    },
  { segment: "about",     label: "حول",             shortLabel: "حول"     },
  { segment: "contact",   label: "تواصل مع الشركة", shortLabel: "تواصل"   },
  { segment: "photos",    label: "الصور",            shortLabel: "الصور"   },
  { segment: "followers", label: "المتابعون",        shortLabel: "متابعون" },
  { segment: "reviews",   label: "التقييمات",        shortLabel: "تقييمات" },
  { segment: "reels",     label: "الريلز",           shortLabel: "الريلز"  },
  { segment: "likes",     label: "الإعجابات",        shortLabel: "إعجابات" },
];
