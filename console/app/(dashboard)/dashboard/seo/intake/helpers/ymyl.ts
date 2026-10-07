// YMYL = "Your Money or Your Life" — Google E-E-A-T category. Sections flagged
// `visibility.ymylOnly` only render for clients in regulated/sensitive industries
// (medical, financial, legal) where unverified claims are dangerous.
const YMYL_KEYWORDS = [
  "طب", "طبي", "طبية", "صحة", "صحي", "صحية", "دواء", "أدوية", "صيدلة", "صيدلية",
  "مستشفى", "عيادة", "تجميل طبي", "أسنان", "نفسي", "علاج",
  "مالي", "مالية", "بنك", "بنوك", "تأمين", "استثمار", "تمويل", "مصرفي",
  "قانون", "قانوني", "قانونية", "محاماة", "محامي",
  "medical", "health", "pharmacy", "dental", "clinic", "hospital", "therapy",
  "financial", "banking", "insurance", "investment", "wealth",
  "legal", "law", "attorney", "lawyer",
];

export function isYmylIndustry(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return YMYL_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}
