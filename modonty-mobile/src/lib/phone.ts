import { getLocales } from 'expo-localization';

/**
 * دول رقم الحجز — نفس قائمة الويب وأطوال أرقامها (`modonty/components/shared/booking-form/PhoneField.tsx:24-40`)،
 * والخادم يقبل E.164 (`booking-schema.ts`: `^\+\d{8,15}$`). بلا أعلام إيموجي: الاسم ومفتاح الدولة.
 */
export type Country = { code: string; dial: string; name: string; min: number; max: number };

export const COUNTRIES: Country[] = [
  { code: 'SA', dial: '966', name: 'السعودية', min: 9, max: 9 },
  { code: 'EG', dial: '20', name: 'مصر', min: 10, max: 10 },
  { code: 'AE', dial: '971', name: 'الإمارات', min: 9, max: 9 },
  { code: 'KW', dial: '965', name: 'الكويت', min: 8, max: 8 },
  { code: 'QA', dial: '974', name: 'قطر', min: 8, max: 8 },
  { code: 'BH', dial: '973', name: 'البحرين', min: 8, max: 8 },
  { code: 'OM', dial: '968', name: 'عُمان', min: 8, max: 8 },
  { code: 'JO', dial: '962', name: 'الأردن', min: 9, max: 9 },
  { code: 'IQ', dial: '964', name: 'العراق', min: 10, max: 10 },
  { code: 'LB', dial: '961', name: 'لبنان', min: 7, max: 8 },
  { code: 'MA', dial: '212', name: 'المغرب', min: 9, max: 9 },
  { code: 'DZ', dial: '213', name: 'الجزائر', min: 9, max: 9 },
  { code: 'US', dial: '1', name: 'أمريكا/كندا', min: 10, max: 10 },
  { code: 'GB', dial: '44', name: 'بريطانيا', min: 9, max: 10 },
  { code: 'TR', dial: '90', name: 'تركيا', min: 10, max: 10 },
];

/**
 * دولة الجهاز إن كانت من أسواقنا العربية، وإلا السعودية. منطقة الجهاز أضعف من موقع الزائر الذي يأخذه الويب:
 * جوال سعودي بإعداد «US» شائع، فلا يُفتح الحجز على ‎+1 (مقيس على المحاكي ١٠ أكتوبر).
 */
export function defaultCountry(): Country {
  const region = getLocales()[0]?.regionCode?.toUpperCase();
  const arab = COUNTRIES.find((c) => c.code === region && !['US', 'GB', 'TR'].includes(c.code));
  return arab ?? (COUNTRIES[0] as Country);
}

/**
 * الأرقام الوطنية فقط: الأرقام العربية ٠–٩ تُحوَّل، والصفر الأوّل يُسقط (‎05… ← 5…، ‎010… ← 10…)
 * — الويب يرفض ‎05… لأن طوله ١٠؛ هنا يُقبل كما يكتبه الناس.
 */
export function nationalDigits(input: string): string {
  const latin = input.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  return latin.replace(/\D/g, '').replace(/^0/, '');
}

export function isValidNational(digits: string, c: Country): boolean {
  return digits.length >= c.min && digits.length <= c.max;
}

export function toE164(digits: string, c: Country): string {
  return `+${c.dial}${digits}`;
}
