export type TabItem = { segment: string | null; label: string; shortLabel?: string };

export const ALL_TAB_ITEMS: TabItem[] = [
  { segment: null, label: "الكل" },
  { segment: "about", label: "حول" },
  { segment: "contact", label: "تواصل مع الشركة", shortLabel: "تواصل" },
  { segment: "photos", label: "الصور" },
  { segment: "followers", label: "المتابعون" },
  { segment: "reviews", label: "التقييمات" },
  { segment: "reels", label: "الريلز" },
  { segment: "likes", label: "الإعجابات" },
];
