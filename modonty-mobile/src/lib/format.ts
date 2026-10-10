/**
 * تنسيق العرض بنفس إعدادات الويب حتى لا يختلف تاريخ المقال بين التطبيق و`modonty.com`:
 * `SITE_LOCALE = "ar-SA"` و`SITE_LOCALE_GREGORIAN = "ar-SA-u-ca-gregory"` (`shared/lib/constants/locale.ts:21,27`)،
 * والمنطقة الزمنية ثابتة `Asia/Riyadh` كبطاقة الويب (`modonty/components/feed/postcard/MobilePostCard.tsx:18`).
 * تُستدعى عند تجهيز البيانات لا داخل كل بطاقة (ENGINEERING §١ — الحساب الثقيل خارج العنصر).
 */
const SITE_LOCALE = 'ar-SA';
const SITE_LOCALE_GREGORIAN = 'ar-SA-u-ca-gregory';
const TZ = 'Asia/Riyadh';

const CARD_DATE = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { month: 'long', year: 'numeric', timeZone: TZ });
const FULL_DATE = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ });
const DATE_TIME = new Intl.DateTimeFormat(SITE_LOCALE_GREGORIAN, {
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: TZ,
});
const COMPACT = new Intl.NumberFormat(SITE_LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
const PLAIN = new Intl.NumberFormat(SITE_LOCALE);

function parse(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function cardDate(iso: string | null | undefined): string | null {
  const d = parse(iso);
  return d ? CARD_DATE.format(d) : null;
}

export function fullDate(iso: string | null | undefined): string | null {
  const d = parse(iso);
  return d ? FULL_DATE.format(d) : null;
}

export function dateTime(iso: string | null | undefined): string | null {
  const d = parse(iso);
  return d ? DATE_TIME.format(d) : null;
}

export function compactNumber(n: number): string {
  return COMPACT.format(n);
}

export function plainNumber(n: number): string {
  return PLAIN.format(n);
}

/** «٥ دقائق قراءة» بصيغة العدد العربية الصحيحة. */
export function readingTime(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null;
  const n = PLAIN.format(minutes);
  if (minutes === 1) return 'دقيقة قراءة';
  if (minutes === 2) return 'دقيقتان قراءة';
  if (minutes <= 10) return `${n} دقائق قراءة`;
  return `${n} دقيقة قراءة`;
}

/** مدّة الفيديو م:ث. */
export function duration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const TWO = new Intl.NumberFormat(SITE_LOCALE, { minimumIntegerDigits: 2 });

/** «٤:٠٢» — زمن المشغّل بأرقام عربية (Screens A · 04ب). صفر ثوانٍ = «٠:٠٠». */
export function clock(seconds: number): string {
  const t = Math.max(0, Math.floor(seconds));
  return `${PLAIN.format(Math.floor(t / 60))}:${TWO.format(t % 60)}`;
}

/** «١٫٢×» — سرعة التشغيل. */
export function rateLabel(rate: number): string {
  // فاصل عشري عربي «٫» صريح: Intl في Hermes يعطي «,» (مقيس على الجوال ١٠ أكتوبر).
  const [int, frac] = String(Math.round(rate * 100) / 100).split('.');
  return `${PLAIN.format(Number(int))}${frac ? `٫${[...frac].map((d) => PLAIN.format(Number(d))).join('')}` : ''}×`;
}

/** «قبل ٨ أيام» للبطاقات (Screens A · 01) — نسبيّ دائماً بصيغة عربية صحيحة، فلا يجاور «قبل ٩ أيام» تاريخٌ مطلق. */
export function ago(iso: string | null | undefined, now = Date.now()): string | null {
  const d = parse(iso);
  if (!d) return null;
  const days = Math.floor((now - d.getTime()) / 86_400_000);
  const n = (k: number) => PLAIN.format(k);
  if (days < 1) return 'اليوم';
  if (days === 1) return 'أمس';
  if (days === 2) return 'قبل يومين';
  if (days <= 10) return `قبل ${n(days)} أيام`;
  if (days < 30) return `قبل ${n(days)} يوماً`;
  const months = Math.floor(days / 30);
  if (months < 12) {
    if (months === 1) return 'قبل شهر';
    if (months === 2) return 'قبل شهرين';
    if (months <= 10) return `قبل ${n(months)} أشهر`;
    return `قبل ${n(months)} شهراً`;
  }
  const years = Math.floor(days / 365);
  if (years === 1) return 'قبل سنة';
  if (years === 2) return 'قبل سنتين';
  if (years <= 10) return `قبل ${n(years)} سنوات`;
  return `قبل ${n(years)} سنة`;
}

/** «قبل ١٢ دقيقة» · «قبل ٣ ساعات» داخل اليوم، ثم `ago` — للإشعارات حيث الدقائق تهمّ. */
export function agoFine(iso: string | null | undefined, now = Date.now()): string | null {
  const d = parse(iso);
  if (!d) return null;
  const mins = Math.floor((now - d.getTime()) / 60_000);
  const n = (k: number) => PLAIN.format(k);
  if (mins < 1) return 'الآن';
  if (mins < 60) return mins === 1 ? 'قبل دقيقة' : mins === 2 ? 'قبل دقيقتين' : mins <= 10 ? `قبل ${n(mins)} دقائق` : `قبل ${n(mins)} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? 'قبل ساعة' : hours === 2 ? 'قبل ساعتين' : hours <= 10 ? `قبل ${n(hours)} ساعات` : `قبل ${n(hours)} ساعة`;
  return ago(iso, now);
}

/** «٩ د قراءة» — الصيغة القصيرة في سطر البطاقة. */
export function readMinutesShort(minutes: number | null | undefined): string | null {
  return minutes && minutes > 0 ? `${PLAIN.format(minutes)} د قراءة` : null;
}

/** عدد بصيغة العربية: واحد · اثنان · ٣–١٠ جمع · ١١+ مفرد منصوب — مثل «شريك واحد · شريكان · ٣ شركاء · ٣٤ شريكاً». */
function arCount(n: number, one: string, two: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  return `${PLAIN.format(n)} ${n <= 10 ? few : many}`;
}

export const partnersCount = (n: number) => arCount(n, 'شريك واحد', 'شريكان', 'شركاء', 'شريكاً');
export const industriesCount = (n: number) => arCount(n, 'مجال واحد', 'مجالان', 'مجالات', 'مجالاً');
export const servicesCount = (n: number) => arCount(n, 'خدمة واحدة', 'خدمتان', 'خدمات', 'خدمة');
/** «خبرة سنة · خبرة سنتين · خبرة ٥ سنوات · خبرة ١٢ سنة». */
export const experienceYears = (n: number) => `خبرة ${n === 1 ? 'سنة' : n === 2 ? 'سنتين' : `${PLAIN.format(n)} ${n <= 10 ? 'سنوات' : 'سنة'}`}`;
