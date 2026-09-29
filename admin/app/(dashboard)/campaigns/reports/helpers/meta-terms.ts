/**
 * مصطلحات ميتا بلغة الإدارة (خالد ٢٩ سبتمبر ٢٠٢٦: «مصطلحات فيسبوك ما هي واضحة»).
 *
 * أنواع النتائج مقيسة من حساب مدونتي (`results.indicator` لكلّ حملة، ٢٩ سبتمبر) لا من ذاكرة. نوعٌ
 * لم يُعرَّف هنا يظهر باسمه الخام من ميتا — أصدق من اسمٍ مخمَّن.
 */
type ResultTerm = { one: string; many: string; perThousand?: boolean };

const RESULT: Record<string, ResultTerm> = {
  reach: { one: "شخص وصله الإعلان", many: "شخص وصلهم الإعلان", perThousand: true },
  impressions: { one: "مرة ظهر فيها", many: "مرة ظهر فيها", perThousand: true },
  profile_visit_view: { one: "زيارة للحساب", many: "زيارة للحساب" },
  "actions:onsite_conversion.messaging_conversation_started_7d": { one: "محادثة بدأت", many: "محادثة بدأت" },
  "actions:offsite_conversion.fb_pixel_lead": { one: "تسجيل من الموقع", many: "تسجيل من الموقع" },
  "actions:offsite_conversion.fb_pixel_complete_registration": { one: "تسجيل مكتمل في الموقع", many: "تسجيل مكتمل في الموقع" },
  "actions:lead": { one: "عميل محتمل", many: "عميل محتمل" },
  "actions:onsite_conversion.lead_grouped": { one: "عميل محتمل من نموذج ميتا", many: "عميل محتمل من نموذج ميتا" },
  "actions:landing_page_view": { one: "زيارة للموقع", many: "زيارة للموقع" },
  "actions:omni_landing_page_view": { one: "زيارة للموقع", many: "زيارة للموقع" },
  "actions:link_click": { one: "نقرة على الرابط", many: "نقرة على الرابط" },
  "actions:post_engagement": { one: "تفاعل مع المنشور", many: "تفاعل مع المنشور" },
  "actions:like": { one: "إعجاب بالصفحة", many: "إعجاب بالصفحة" },
  "actions:video_view": { one: "مشاهدة فيديو", many: "مشاهدة فيديو" },
  "actions:omni_purchase": { one: "عملية شراء", many: "عملية شراء" },
};

export function resultTerm(indicator: string): ResultTerm & { known: boolean } {
  const term = RESULT[indicator];
  return term ? { ...term, known: true } : { one: indicator, many: indicator, known: false };
}

/** «التكلفة» كما يقرؤها المدير: للوصول والظهور لكلّ ألف، ولغيرهما للواحد. */
export function costUnit(indicator: string): string {
  const t = resultTerm(indicator);
  return t.perThousand ? `لكل ١٬٠٠٠ ${indicator === "reach" ? "شخص" : "ظهور"}` : `لكل ${t.one}`;
}

export const OBJECTIVE_TERM: Record<string, string> = {
  OUTCOME_AWARENESS: "يعرفونا (انتشار)",
  OUTCOME_ENGAGEMENT: "تفاعل ومحادثات",
  OUTCOME_LEADS: "عملاء محتملون",
  OUTCOME_SALES: "مبيعات",
  OUTCOME_TRAFFIC: "زيارات",
  OUTCOME_APP_PROMOTION: "تحميل التطبيق",
  LINK_CLICKS: "زيارات",
  MESSAGES: "محادثات",
  POST_ENGAGEMENT: "تفاعل",
};

export const STATUS_TERM: Record<string, { label: string; tone: string }> = {
  ACTIVE: { label: "شغّالة", tone: "text-emerald-700 dark:text-emerald-400" },
  PAUSED: { label: "موقوفة", tone: "text-muted-foreground" },
  CAMPAIGN_PAUSED: { label: "موقوفة", tone: "text-muted-foreground" },
  ADSET_PAUSED: { label: "موقوفة", tone: "text-muted-foreground" },
  WITH_ISSUES: { label: "فيها مشكلة", tone: "text-rose-700 dark:text-rose-400" },
  IN_PROCESS: { label: "تحت المراجعة", tone: "text-amber-700 dark:text-amber-400" },
  PENDING_REVIEW: { label: "تحت المراجعة", tone: "text-amber-700 dark:text-amber-400" },
  DISAPPROVED: { label: "مرفوضة من ميتا", tone: "text-rose-700 dark:text-rose-400" },
  ARCHIVED: { label: "مؤرشفة", tone: "text-muted-foreground" },
  DELETED: { label: "محذوفة", tone: "text-muted-foreground" },
};

export function isRunning(status: string) {
  return status === "ACTIVE";
}

/** «حملة واحدة · حملتين · ٣ حملات · ١١ حملة» — العدد العربيّ لا «٥ حملة». */
export function campaignsCount(n: number, fmt: (n: number) => string): string {
  if (n === 1) return "حملة واحدة";
  if (n === 2) return "حملتين";
  return `${fmt(n)} ${n >= 3 && n <= 10 ? "حملات" : "حملة"}`;
}

const region = new Intl.DisplayNames(["ar"], { type: "region" });
const arNum = new Intl.NumberFormat("ar-EG");

/** «استهدفنا» في سطرٍ واحد: الجنس · العمر · المكان · الاهتمامات — من إعداد المجموعات الإعلانية. */
export function audienceParts(a: {
  ageMin: number | null;
  ageMax: number | null;
  genders: number[];
  countries: string[];
  places: string[];
  interests: string[];
}): string[] {
  const parts: string[] = [];
  parts.push(a.genders.length === 1 ? (a.genders[0] === 1 ? "رجال" : "نساء") : "رجال ونساء");
  if (a.ageMin != null || a.ageMax != null) {
    parts.push(`العمر ${arNum.format(a.ageMin ?? 18)}–${a.ageMax && a.ageMax < 65 ? arNum.format(a.ageMax) : `${arNum.format(65)}+`}`);
  }
  const where = [...a.countries.map((c) => region.of(c) ?? c), ...a.places];
  if (where.length) parts.push(where.slice(0, 5).join("، ") + (where.length > 5 ? ` و${arNum.format(where.length - 5)} غيرها` : ""));
  parts.push(a.interests.length ? `اهتمامات: ${a.interests.slice(0, 4).join("، ")}${a.interests.length > 4 ? "…" : ""}` : "بدون اهتمامات محدّدة");
  return parts;
}

export const GENDER_TERM: Record<string, string> = { male: "رجال", female: "نساء", unknown: "غير محدّد" };

export function ageTerm(age: string): string {
  if (age === "Unknown") return "عمر غير معروف";
  return age.replace(/\d+/g, (d) => arNum.format(Number(d)));
}
