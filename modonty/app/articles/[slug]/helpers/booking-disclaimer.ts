/**
 * YMYL consultation disclaimer, SPLIT by the client's regulated domain
 * (`ymylCategory`: medical | legal | financial/other) so a visitor only sees the
 * sections relevant to that activity — not one all-encompassing wall of text.
 *
 * ⚠️ LEGAL REVIEW PENDING: this wording is drafted, not yet approved. Have a
 * licensed Saudi lawyer sign off before relying on it in production — especially
 * the cross-border tele-medicine clause and the PDPL consent wording.
 */

export interface DisclaimerSection {
  title: string;
  body: string;
}

export const DISCLAIMER_HEADING = "شروط الاستشارات وإخلاء المسؤولية";
export const DISCLAIMER_CHECKBOX_LABEL = "أقرّ بأنني قرأت ما سبق وأوافق عليه.";

// Always shown, first — the platform-role + verification basics.
const COMMON_INTRO: DisclaimerSection[] = [
  {
    title: "طبيعة الخدمة",
    body: "الاستشارات المتاحة عبر منصّة «مدوّنتي» هي توجيه ومعلومات عامة لأغراض تثقيفية، وليست خدمة مهنية رسمية، ولا بديلًا عن مراجعة مختصّ مرخّص بشكل مباشر.",
  },
  {
    title: "دور المنصّة",
    body: "«مدوّنتي» وسيط تقني يتيح التواصل بين المستخدم والمختصّ، وليست مقدِّمًا لأي خدمة طبية أو قانونية أو مهنية. ولا تتحمّل المنصّة مسؤولية محتوى الاستشارة أو دقّتها أو نتائجها؛ وتقع المسؤولية المهنية الكاملة على المختصّ مقدّم الاستشارة وحده.",
  },
  {
    title: "التحقّق من المختصّين",
    body: "يخضع كل مختصّ للتحقّق من اعتماداته ووثائقه قبل اشتراكه. ومع ذلك، لا تضمن المنصّة نتائج أي استشارة، ولا تتحمّل مسؤولية أي تقصير مهني من المختصّ.",
  },
];

// Medical-only clauses (diagnosis/treatment limits + emergency numbers).
const MEDICAL_SECTIONS: DisclaimerSection[] = [
  {
    title: "أحكام خاصة بالاستشارات الطبية",
    body: "الاستشارة الطبية توجيه صحي عام لأغراض تثقيفية، وليست تشخيصًا أو علاجًا أو وصفة دوائية أو تقريرًا طبيًا معتمدًا أو إجازة مرضية. وللحصول على تشخيص أو علاج داخل المملكة، يُرجى مراجعة مقدّم رعاية صحية مرخّص محليًا.",
  },
  {
    title: "الطوارئ الطبية",
    body: "في الحالات الطارئة المهدِّدة للحياة، اتصل فورًا بالرقم الموحّد للطوارئ ٩١١ (المُفعَّل في الرياض ومكة المكرمة والمنطقة الشرقية، وجارٍ تعميمه)، أو بالإسعاف والهلال الأحمر السعودي على ٩٩٧ في بقية المناطق. وللاستشارة الصحية غير الطارئة، تتوفّر خدمة وزارة الصحة على الرقم ٩٣٧ على مدار الساعة. ولا يجوز الاعتماد على هذه الخدمة في الحالات الطارئة.",
  },
];

// Legal-only clause (no attorney/client relationship).
const LEGAL_SECTIONS: DisclaimerSection[] = [
  {
    title: "أحكام خاصة بالاستشارات القانونية",
    body: "الاستشارة القانونية توجيه قانوني عام لأغراض تثقيفية، وليست رأيًا قانونيًا رسميًا ولا تمثيلًا قانونيًا، ولا تُنشئ علاقة موكّل/محامٍ. ولا يُبنى عليها أي قرار أو إجراء قانوني دون مراجعة محامٍ مرخّص لدى الجهة المختصة في بلد المستخدم.",
  },
];

// Financial + any other regulated specialty.
const OTHER_SECTIONS: DisclaimerSection[] = [
  {
    title: "التخصصات الأخرى",
    body: "تنطبق المبادئ ذاتها على أي تخصص آخر: المحتوى توجيه عام لا يُغني عن مراجعة مختصّ مرخّص في ذلك المجال.",
  },
];

// Always shown, last — minors + PDPL privacy + liability cap.
const COMMON_TAIL: DisclaimerSection[] = [
  {
    title: "القُصّر",
    body: "للأشخاص دون سنّ الثامنة عشرة، تُشترط موافقة وحضور وليّ الأمر.",
  },
  {
    title: "الخصوصية وحماية البيانات",
    body: "المعلومات التي تشاركها تُستخدم لغرض الاستشارة فقط، وتُعامَل بسرّية تامة، ولا تُشارك مع أي طرف ثالث دون موافقتك، وفقًا لنظام حماية البيانات الشخصية في المملكة (PDPL). ويحق لك سحب موافقتك وطلب حذف بياناتك في أي وقت.",
  },
  {
    title: "حدود المسؤولية",
    body: "إلى أقصى حدّ يسمح به النظام، لا تتحمّل المنصّة أي مسؤولية عن أضرار مباشرة أو غير مباشرة تنشأ عن الاعتماد على أي استشارة تُقدَّم عبرها.",
  },
];

/**
 * Returns the disclaimer sections relevant to the client's YMYL category.
 * Unknown/empty category falls back to the generic "other" set (safe default).
 */
export function getDisclaimerSections(ymylCategory: string | null | undefined): DisclaimerSection[] {
  const cat = (ymylCategory ?? "").toLowerCase();
  const specific =
    cat === "medical" ? MEDICAL_SECTIONS : cat === "legal" ? LEGAL_SECTIONS : OTHER_SECTIONS;
  return [...COMMON_INTRO, ...specific, ...COMMON_TAIL];
}
