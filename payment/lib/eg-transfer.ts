import "server-only";

/**
 * بيانات تحويل السوق المصري — المصدر الوحيد.
 *
 * ليش هنا لا في قاعدة البيانات (خالد ١٥ سبتمبر ٢٠٢٦): حسابٌ واحد لا يتغيّر إلا
 * بقرارٍ ماليّ، وإدخاله في الأدمن يفتح باباً لتعديله بالخطأ على صفحة يحوّل منها
 * الناس مالاً. وتغييره هنا يمرّ بمراجعةٍ وكوميت.
 *
 * ⚠ ولا يُكتب شيءٌ من هذه الأرقام في صفحةٍ أخرى: رقمٌ يُنسخ يدوياً إلى موضعين ينحرف
 * أحدهما يوماً، والمشتري يحوّل إلى حسابٍ خطأ فيضيع ماله ونُلام نحن.
 *
 * تُحقِّق الآيبان حسابياً (mod-97) عند القراءة لا وقت البناء: سطرٌ مكسور هنا يجب
 * أن يظهر فوراً لا أن يُطبع على صفحة الدفع.
 */

export type EgTransferChannel = {
  kind: "bank" | "instapay";
  label: string;
  /** الأسطر كما تُعرض — كلٌّ منها يُنسَخ بضغطةٍ واحدة. */
  fields: { label: string; value: string; copy: boolean }[];
  note?: string;
};

/**
 * الآيبان المصريّ ٢٩ خانة، والتحقّق بـmod-97 على معيار ISO 13616:
 * تُنقل الخانات الأربع الأولى إلى النهاية، ويُستبدل كل حرفٍ برقمه (A=10)، فيكون
 * الباقي على ٩٧ يساوي ١ إن صحّ الرقم. قيس على هذا الآيبان: الباقي = ١ ✓
 */
export function isValidEgIban(iban: string): boolean {
  const s = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^EG\d{27}$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rem = 0;
  for (const d of numeric) rem = (rem * 10 + Number(d)) % 97;
  return rem === 1;
}

const IBAN = "EG140035002902920303584810010";
const ACCOUNT = "2920303584810010";
const INSTAPAY_NUMBER = "01227002786";

export function egTransferChannels(): EgTransferChannel[] {
  if (!isValidEgIban(IBAN)) {
    throw new Error(`رقم الآيبان المصريّ في lib/eg-transfer.ts غير صالح: ${IBAN}`);
  }

  return [
    {
      kind: "instapay",
      label: "إنستا باي",
      fields: [{ label: "رقم المحفظة", value: INSTAPAY_NUMBER, copy: true }],
      /**
       * إنستا باي يُظهر اسم المستفيد **مقنّعاً** في تطبيق البنك (`حسنى ح**** م***`)
       * — هذا نظامه لا نقصٌ في بياناتنا (خالد: «هو هو كذا نظامهم»). والتصريح به هنا
       * يمنع المحوِّل من التوقّف حين يراه: من لا يعرف أنه مقنَّعٌ افتراضاً يظنّه حساباً
       * خطأ ويلغي التحويل.
       */
      note: "اسم المستفيد يظهر مختصراً في تطبيق بنكك — هذا نظام إنستا باي.",
    },
    {
      kind: "bank",
      label: "تحويل بنكي — SAIB",
      fields: [
        { label: "البنك", value: "SAIB BANK", copy: false },
        { label: "رقم الحساب", value: ACCOUNT, copy: true },
        { label: "رقم الآيبان (IBAN)", value: IBAN, copy: true },
      ],
    },
  ];
}
