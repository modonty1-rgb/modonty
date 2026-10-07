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
