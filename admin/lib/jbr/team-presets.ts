// منسوخ من jbrseo.com/lib/teamPresets.ts — إدارة محتوى موقع جبر سيو من أدمن مودونتي.
// يحرّر نفس صفوف القاعدة التي يحرّرها أدمن جبر سيو (قاعدة واحدة، نماذج مرآة).
// ⚠️ مرآة: أي تغيير في شكل الحقول يُطبَّق هنا وفي jbrseo.com معاً.

export const DEFAULT_TEAM_AVATAR_GRADIENT = "from-primary/70 to-primary";

export type TeamGradientPreset = {
  label: string;
  value: string;
};

export const GRADIENT_PRESETS: readonly TeamGradientPreset[] = [
  { label: "أزرق (أساسي)", value: "from-primary/70 to-primary" },
  { label: "بنفسجي", value: "from-fuchsia-500/80 to-fuchsia-300" },
  { label: "برتقالي", value: "from-orange-500/80 to-orange-300" },
  { label: "أخضر مائي", value: "from-teal-500/80 to-teal-300" },
  { label: "وردي", value: "from-pink-500/80 to-pink-300" },
  { label: "أحمر", value: "from-red-500/80 to-red-300" },
  { label: "أصفر", value: "from-yellow-500/80 to-yellow-300" },
  { label: "رمادي", value: "from-slate-500/80 to-slate-300" },
] as const;
