/**
 * Country calling codes offered in the phone field — the Arab countries, Saudi Arabia first
 * (checked against Wikipedia's «List of telephone country codes», 27 Sep 2026). A reader from
 * anywhere else picks «دولة أخرى» and types the full number with its own code (Khalid: «ممكن
 * يكون المشترك مصري ممكن يكون يمني ممكن يكون اي جنسية»).
 */
export const DIAL_CODES = [
  { iso: "SA", name: "السعودية", code: "966" },
  { iso: "EG", name: "مصر", code: "20" },
  { iso: "AE", name: "الإمارات", code: "971" },
  { iso: "KW", name: "الكويت", code: "965" },
  { iso: "QA", name: "قطر", code: "974" },
  { iso: "BH", name: "البحرين", code: "973" },
  { iso: "OM", name: "عُمان", code: "968" },
  { iso: "YE", name: "اليمن", code: "967" },
  { iso: "JO", name: "الأردن", code: "962" },
  { iso: "IQ", name: "العراق", code: "964" },
  { iso: "SY", name: "سوريا", code: "963" },
  { iso: "LB", name: "لبنان", code: "961" },
  { iso: "PS", name: "فلسطين", code: "970" },
  { iso: "SD", name: "السودان", code: "249" },
  { iso: "LY", name: "ليبيا", code: "218" },
  { iso: "TN", name: "تونس", code: "216" },
  { iso: "DZ", name: "الجزائر", code: "213" },
  { iso: "MA", name: "المغرب", code: "212" },
  { iso: "MR", name: "موريتانيا", code: "222" },
  { iso: "SO", name: "الصومال", code: "252" },
  { iso: "DJ", name: "جيبوتي", code: "253" },
  { iso: "KM", name: "جزر القمر", code: "269" },
] as const;

/** The «دولة أخرى» choice: the reader types the whole number, starting with + and its code. */
export const OTHER_DIAL = "other";
