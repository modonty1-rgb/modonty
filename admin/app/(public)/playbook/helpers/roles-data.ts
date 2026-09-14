/**
 * من يفعل ماذا في مدونتي — مصدر الحقيقة الوحيد للإسناد.
 *
 * أُملي هذا التوزيع من خالد في ١٢ سبتمبر ٢٠٢٦ بعد جرد ١٠٧ مهمة من مسارات الأدمن
 * والكونسول والموقع العام. ويُحرَّر هنا لا في الصفحة: الصفحة تسمح بالتحريك كمسوّدة
 * في متصفّح القارئ، ثم يُنسخ الناتج ويُثبَّت في هذا الملف — فيبقى ما يراه الفريق واحداً.
 *
 * البند التنفيذي لا يعيش هنا. ما يحتاج بناءً يذهب إلى `documents/tasks/task-data.json`
 * (مثاله KW1: إلزام تسجيل الكلمات المفتاحية قبل الكتابة).
 */

export type Person = {
  id: string;
  /** مفتاح القسم — تسحب به صفحة كل قسم أهله ومهامهم. */
  deptKey: string;
  name: string;
  /** دوره كما وصفه خالد، لا مسمّاه الوظيفي. */
  role: string;
  dept: string;
};

export const PEOPLE: Person[] = [
  { id: "khaled", deptKey: "exec", name: "خالد", role: "المدير التنفيذي", dept: "الإدارة" },
  { id: "faten", deptKey: "sales", name: "فاتن", role: "المبيعات وعلاقات الشركاء — من أوّل لمسة إلى التجديد", dept: "المبيعات" },
  { id: "amani", deptKey: "marketing", name: "أماني", role: "الحملات المدفوعة وقياسها", dept: "التسويق" },
  { id: "maryam", deptKey: "marketing", name: "مريم", role: "أورجانك المنصّات والنشرة", dept: "التسويق" },
  { id: "tareq", deptKey: "content", name: "طارق", role: "قائد المحتوى — ويكتب أيضاً", dept: "المحتوى" },
  { id: "yasmin", deptKey: "content", name: "ياسمين", role: "كاتبة", dept: "المحتوى" },
  { id: "maya", deptKey: "content", name: "مايا", role: "كاتبة", dept: "المحتوى" },
  { id: "mustafa", deptKey: "design", name: "مصطفى", role: "تصميم", dept: "الإنتاج البصري" },
  { id: "mohamed", deptKey: "design", name: "محمد", role: "مونتاج", dept: "الإنتاج البصري" },
  { id: "rawan", deptKey: "ops", name: "روان", role: "الموجز وتشغيل ملفّ الشريك", dept: "التشغيل" },
  /**
   * مالكٌ ليس شخصًا — وهذا مقصود.
   *
   * أُنشئ في ١٢ سبتمبر ٢٠٢٦ بأمر خالد: «الوصف الوظيفي للمدير التنفيذي نهائيًّا ما ينفع
   * ينحطّ هنا. المهامّ المسندة له اعمل قسم سمّه القسم التقني واسند المهام هذي له».
   *
   * فانتقل إليه ما يخصّ المنصّة وتشغيلها وأمنها. وما بقي عند خالد إداريٌّ لا تقنيّ
   * (التسعير · العقود · التوظيف · الضريبة · الموردون) فبقي باسمه في اللوحة بلا وصفٍ منشور.
   * وشاغله اليوم خالد نفسه، لكن الوظيفة قائمة عليه لا به — فيوم يُوظَّف لها أحد، تنتقل
   * المهامّ كلّها بتغيير `holder` وحده.
   */
  { id: "tech", deptKey: "tech", name: "القسم التقني", role: "المنصّة وتشغيلها وأمنها", dept: "التقني" },
];

/**
 * سؤال كل دور — نُقل من الصفحة الرئيسية `/playbook` في ١٢ سبتمبر ٢٠٢٦ بقرار خالد.
 *
 * كان قسمًا اسمه «دورك أنت» تحت سؤال «ما هي مدونتي؟»، وهو لا يجيب عنه: يقول لكل واحد
 * ماذا يفعل، وهذا سؤال هذه الصفحة نفسها. وصُحّح فيه شيئان بالنقل:
 * · «متابعة العملاء» سقط — دُمج في المبيعات (قرار خالد، اليوم نفسه).
 * · الحروف اللاتينية (On-page · Technical · Off-page) صارت عربيةً، فقد كانت تنكسر داخل الجملة.
 */
export type RoleAsk = { dept: string; who: string; question: string; answer: string };

export const ROLE_ASKS: RoleAsk[] = [
  {
    dept: "sales",
    who: "المبيعات — فاتن",
    question: "كيف أشرح مدونتي؟",
    answer:
      "تبيع حضورًا داخل منصّة موثّقة: صفحة رسمية باسمه، ومحتوى بأكثر من صيغة، وسيو كامل، وأرقام يراها بنفسه. لا تقل «نصمّم لك موقعًا»، ولا تعد بترتيب أوّل.",
  },
  {
    dept: "marketing",
    who: "التسويق — أماني",
    question: "ما الرسالة التي أبني عليها الحملة؟",
    answer:
      "جهة موثّقة بوثائقها، وفريق ينتج بدل صاحب العمل، وأرقام حقيقية بدل تقديرات. والوجع الذي تخاطبه: لا أحد يريد أن يدير كاتبًا ومصمّمًا وتقنيًا في وقت واحد.",
  },
  {
    dept: "marketing",
    who: "التسويق — مريم",
    question: "ماذا أنشر، ولماذا؟",
    answer:
      "كل مقال يخرج يتحوّل إلى ثلاث أو خمس قطع تُقرأ داخل المنصّة نفسها. ليس نشر روابط — بل توزيع يصل قبل أن تجده محرّكات البحث، ويبني اسم مدونتي فيسهل على المبيعات الإقفال.",
  },
  {
    dept: "ops",
    who: "التشغيل — روان",
    question: "ما مسؤوليتي أوّلًا؟",
    answer:
      "الموجز. تجمعه من بيانات الشريك في الكونسول، وتدعمه لإكمال ما نقص، ثم تسلّمه لقسم المحتوى. وما دام الموجز ناقصًا، فالإنتاج كلّه واقف.",
  },
  {
    dept: "content",
    who: "المحتوى — طارق وياسمين ومايا",
    question: "متى يُعتبر العمل جاهزًا؟",
    answer:
      "حين تكتمل الكلمات المفتاحية ودراسة العميل قبل الكتابة، ثم المحتوى والوسائط وما في الصفحة وما تحتها وفحص الجودة، ويعتمده الشريك. أمّا بناء السلطة الخارجية فخطّة مستمرّة، لا زرّ نشر.",
  },
  {
    dept: "design",
    who: "الإنتاج البصري — مصطفى ومحمد",
    question: "متى أبدأ، ومن ينتظرني؟",
    answer:
      "تبدأ من الموجز نفسه لا من النصّ الجاهز — التصميم يجري مع الكتابة لا بعدها. والريلز تجري مع النشر والتوزيع. من يسلّم متأخّرًا يوقف الدورة كلّها، لا خطوته وحدها.",
  },
];

export type Stage = { key: string; title: string };

export const STAGES: Stage[] = [
  { key: "acq", title: "الاكتساب — كيف يصل إلينا شريك" },
  { key: "money", title: "المال" },
  { key: "setup", title: "التأسيس — من التوقيع إلى جاهزية الملف" },
  { key: "prod", title: "الموجز والإنتاج" },
  { key: "publish", title: "النشر" },
  { key: "after", title: "بعد النشر — التوزيع والأثر" },
  { key: "paid", title: "قنوات مدفوعة" },
  { key: "organic", title: "قنوات أورجانك" },
  { key: "direct", title: "تواصل مباشر وفعاليات" },
  { key: "partners", title: "شراكات وإحالة" },
  { key: "rep", title: "سمعة ومصداقية" },
  { key: "tech", title: "المنصّة والتقنية" },
  { key: "support", title: "الدعم" },
  { key: "index", title: "الفهرسة وصحّة السيو" },
  { key: "plans", title: "الباقات والتسعير" },
  { key: "library", title: "التصنيف والمكتبة" },
  { key: "reports", title: "التقارير والبيانات" },
  { key: "legal", title: "القانوني" },
  { key: "team", title: "الفريق والإدارة" },
  { key: "engage", title: "تفاعل الزوّار والشركاء" },
  { key: "othercontent", title: "أنواع محتوى أخرى" },
  { key: "pages", title: "صفحات ومحتوى قائم" },
  { key: "perms", title: "صلاحيات وحملات وتأهيل" },
  { key: "loop", title: "ثغرات الدائرة" },
  { key: "admin", title: "فجوات إدارية" },
];

export type Duty = {
  n: number;
  t: string;
  stage: string;
  /** معرّف الشخص، أو "" حين لا مالك بعد. */
  owner: string;
  note?: string;
  /** مؤجّلة: خارج النطاق الآن، وتبقى معروضة كي لا تُنسى. */
  parked?: boolean;
};

export const DUTIES: Duty[] = [
  { n: 3, t: "إيميل بارد للشركات", stage: "acq", owner: "faten", note: "بيع لا تسويق: يُقاس بالمواعيد لا بالفتحات" },
  { n: 4, t: "رسائل لينكدإن المباشرة للشركات", stage: "acq", owner: "faten" },
  { n: 5, t: "النشرة البريدية", stage: "acq", owner: "maryam", note: "لقائمة اشتركت بنفسها — بنطاق إرسال منفصل عن البارد" },
  { n: 6, t: "استقبال المهتمّ والردّ عليه", stage: "acq", owner: "faten" },
  { n: 7, t: "العرض والتسعير والإقفال", stage: "acq", owner: "faten" },

  { n: 8, t: "إصدار الفاتورة بعد الإقفال", stage: "money", owner: "faten", note: "من أقفل الصفقة يصدر فاتورتها — خالد، ١٢ سبتمبر ٢٠٢٦" },
  { n: 9, t: "متابعة التحصيل والتأخّر", stage: "money", owner: "faten" },
  { n: 10, t: "الاسترداد والاعتراض على مبلغ", stage: "money", owner: "faten" },
  { n: 11, t: "الإقرار الضريبي والالتزام", stage: "money", owner: "khaled" },

  { n: 12, t: "استلام أوراق التوثيق ومراجعتها قبل الاعتماد", stage: "setup", owner: "rawan" },
  { n: 13, t: "فتح حساب الكونسول للشريك", stage: "setup", owner: "faten" },
  { n: 14, t: "دعم الشريك لتعبئة بياناته في الكونسول", stage: "setup", owner: "rawan" },
  { n: 15, t: "إدخال أصول الشريك نيابةً عنه إن أرسلها خارج الكونسول", stage: "setup", owner: "rawan" },
  { n: 16, t: "ملاحقة الشريك المتأخّر في إرسال أصوله", stage: "setup", owner: "faten" },

  { n: 17, t: "تجهيز الموجز من بيانات الكونسول", stage: "prod", owner: "rawan" },
  { n: 18, t: "دراسة العميل والكلمات المفتاحية وتصوّر المقال", stage: "prod", owner: "tareq", note: "شرط قبل بدء الكتابة" },
  { n: 19, t: "كتابة المقال", stage: "prod", owner: "tareq", note: "المسؤولية عند قائد المحتوى، وينفّذها كل كاتب لمقالاته" },
  { n: 20, t: "تصميم بصريات المقال", stage: "prod", owner: "mustafa" },
  { n: 21, t: "مونتاج الريلز والفيديو", stage: "prod", owner: "mohamed" },
  { n: 22, t: "فحص الجودة والتوقيع قبل الخروج", stage: "prod", owner: "tareq" },

  { n: 24, t: "عرض المقال على الشريك لاعتماده", stage: "publish", owner: "tareq" },
  { n: 25, t: "النشر الفعلي على مدونتي", stage: "publish", owner: "tareq", note: "التوقيع غير النشر" },
  { n: 26, t: "جدولة الإنتاج ومتابعة المتأخّر", stage: "publish", owner: "tareq" },

  { n: 27, t: "تحويل المقال إلى قطع سوشيال", stage: "after", owner: "tareq" },
  { n: 28, t: "نشر القطع على منصّات مدونتي", stage: "after", owner: "maryam" },
  { n: 29, t: "حملات ختامية مدفوعة لمدونتي", stage: "after", owner: "amani" },
  { n: 30, t: "الروابط الخارجية", stage: "after", owner: "tareq", note: "لم يبدأ بعد" },
  { n: 31, t: "تقرير للشريك عن صفحته هو", stage: "after", owner: "rawan", note: "غير تقرير الإدارة (٧٨)" },
  { n: 32, t: "التجديد", stage: "after", owner: "faten" },

  { n: 33, t: "إعلانات بحث جوجل", stage: "paid", owner: "amani", note: "نيّة شراء مباشرة" },
  { n: 34, t: "إعلانات ميتا — فيسبوك وإنستغرام", stage: "paid", owner: "amani" },
  { n: 35, t: "إعلانات تيك توك", stage: "paid", owner: "amani" },
  { n: 36, t: "إعلانات سناب شات", stage: "paid", owner: "amani" },
  { n: 37, t: "إعلانات لينكدإن", stage: "paid", owner: "amani", note: "الأغلى، والأدقّ في استهداف أصحاب القرار" },
  { n: 38, t: "إعلانات يوتيوب", stage: "paid", owner: "amani" },
  { n: 39, t: "تجديد الاستهداف — من زار ولم يطلب", stage: "paid", owner: "faten" },

  { n: 40, t: "سيو مدونتي نفسها لجذب أصحاب الأعمال", stage: "organic", owner: "tareq", note: "غير سيو مقالات الشركاء — هذا يبيعنا نحن" },
  { n: 41, t: "قناة يوتيوب لمدونتي", stage: "organic", owner: "maryam" },
  { n: 42, t: "تيك توك أورجانك", stage: "organic", owner: "maryam" },
  { n: 43, t: "إنستغرام أورجانك", stage: "organic", owner: "maryam" },
  { n: 44, t: "صفحة لينكدإن لمدونتي", stage: "organic", owner: "maryam", note: "نشر محتوى — غير الرسائل المباشرة (٤)" },
  { n: 45, t: "حساب إكس", stage: "organic", owner: "maryam" },
  { n: 46, t: "سناب شات أورجانك", stage: "organic", owner: "maryam" },
  { n: 47, t: "بودكاست أو صوتيات", stage: "organic", owner: "", parked: true },

  { n: 48, t: "واتساب بزنس والاتصال المباشر", stage: "direct", owner: "faten" },
  { n: 49, t: "زيارات ميدانية للشركات", stage: "direct", owner: "", parked: true, note: "شغلنا أونلاين" },
  { n: 50, t: "المعارض والمؤتمرات والفعاليات", stage: "direct", owner: "maryam", note: "فرصة عند سعر مناسب — لا خطة دائمة" },

  { n: 51, t: "برنامج إحالة: شريك يجيب شريكاً", stage: "partners", owner: "faten", note: "أرخص قناة وأعلاها ثقة" },
  { n: 52, t: "عمولة وأفلييت لوسطاء خارجيين", stage: "partners", owner: "khaled" },
  { n: 53, t: "شراكات مع وكالات ومحاسبين ومستشارين", stage: "partners", owner: "khaled", note: "من يخدم نفس أصحاب الأعمال قبلنا" },
  { n: 54, t: "الغرف التجارية والجمعيات المهنية", stage: "partners", owner: "khaled" },

  { n: 55, t: "المؤثّرون ورواد الأعمال", stage: "rep", owner: "maryam" },
  { n: 56, t: "العلاقات العامة والنشر الصحفي", stage: "rep", owner: "khaled" },
  { n: 57, t: "دراسات الحالة وقصص نجاح الشركاء", stage: "rep", owner: "maryam", note: "مادة بيع ومادة سيو في آن" },
  { n: 58, t: "آراء العملاء والتقييمات العامة", stage: "rep", owner: "rawan" },

  { n: 59, t: "تطوير المنصّة وإصلاح الأعطال", stage: "tech", owner: "tech" },
  { n: 60, t: "مراقبة أخطاء النظام والردّ عليها", stage: "tech", owner: "tech" },
  { n: 61, t: "النشر والتحديثات ووضع الصيانة", stage: "tech", owner: "tech" },
  { n: 62, t: "النسخ الاحتياطي وسلامة قاعدة البيانات", stage: "tech", owner: "tech" },
  { n: 63, t: "التخزين والوسائط الخارجية", stage: "tech", owner: "tech" },

  { n: 64, t: "الردّ على رسائل التواصل من الموقع", stage: "support", owner: "faten", note: "غير الليدز البيعية (٦)" },
  { n: 65, t: "الردّ على ملاحظات الزوّار", stage: "support", owner: "rawan" },
  { n: 66, t: "مراجعة أسئلة الشات بوت وتحسين ردوده", stage: "support", owner: "tech" },
  { n: 67, t: "دعم الشريك حين يتعطّل عليه الكونسول", stage: "support", owner: "tech", note: "عطل تقني — غير دعم تعبئة البيانات (١٤)" },

  { n: 68, t: "متابعة Search Console والفهرسة", stage: "index", owner: "tareq" },
  { n: 69, t: "متابعة Bing Webmaster", stage: "index", owner: "tareq" },
  { n: 70, t: "فحص صحّة السيو على مستوى الموقع", stage: "index", owner: "yasmin", note: "غير فحص جودة المقال (٢٢)" },
  { n: 71, t: "سيو الصور: البدائل والأوصاف وأسماء الملفات", stage: "index", owner: "yasmin", note: "غير تصميم البصريات (٢٠)" },

  { n: 72, t: "تسعير الباقات ومراجعتها", stage: "plans", owner: "khaled" },
  { n: 73, t: "تعريف ميزات الباقة وحدودها", stage: "plans", owner: "khaled" },

  { n: 74, t: "إدارة التصنيفات والوسوم", stage: "library", owner: "yasmin" },
  { n: 75, t: "إدارة المجالات", stage: "library", owner: "tareq" },
  { n: 77, t: "تنظيم مكتبة الوسائط", stage: "library", owner: "mustafa" },

  { n: 78, t: "قراءة تقرير الشهر واتّخاذ قرار عليه", stage: "reports", owner: "khaled", note: "النظام يطلّع الأرقام — والمهمّة هي القرار" },
  { n: 79, t: "تصدير البيانات عند الطلب", stage: "reports", owner: "tech" },
  { n: 80, t: "مراجعة سجلّ التدقيق", stage: "reports", owner: "rawan" },

  { n: 81, t: "الشروط والأحكام وسياسة الخصوصية", stage: "legal", owner: "tareq" },
  { n: 82, t: "صفحة الثقة وبيانات الكيان القانوني", stage: "legal", owner: "khaled" },

  { n: 83, t: "التوظيف وسدّ الأدوار الناقصة", stage: "team", owner: "khaled" },
  { n: 84, t: "متابعة مهام الفريق اليومية", stage: "team", owner: "rawan" },
  { n: 85, t: "التأكّد من اكتمال بيانات الناشر قبل النشر", stage: "team", owner: "tareq", note: "اسم الشريك وشعاره ورابطه تدخل publisher في Article schema" },

  { n: 90, t: "ضمان ردّ الشريك على ليداته", stage: "engage", owner: "rawan", note: "الليد يموت في الانتظار" },

  { n: 91, t: "أبواب الدخول: من يظهر في /shop و/booking و/clients وبأي ترتيب", stage: "othercontent", owner: "rawan", note: "ليست متجراً — الثلاثة قوائم شركاء بنفس PartnerCard" },
  { n: 92, t: "الأخبار", stage: "othercontent", owner: "rawan" },
  { n: 93, t: "إنتاج الصوتيات", stage: "othercontent", owner: "rawan", note: "غير مونتاج الفيديو (٢١)" },

  { n: 94, t: "مراجعة صفحات موقع الشريك ومحتواها", stage: "pages", owner: "rawan" },
  { n: 95, t: "تحديث صفحات مدونتي التعريفية", stage: "pages", owner: "tareq" },

  { n: 96, t: "إدارة الأعضاء والصلاحيات", stage: "perms", owner: "tech" },
  { n: 98, t: "تأهيل الموظّف الجديد", stage: "perms", owner: "rawan", note: "غير التوظيف (٨٣)" },

  { n: 99, t: "من يقرّر مواضيع الشهر الجاي لكل شريك؟", stage: "loop", owner: "tareq", note: "الموجز يتعمل مرّة، والنشر يتكرّر كل شهر" },
  { n: 100, t: "من يغيّر الخطّة لما الأرقام تقول شيئاً؟", stage: "loop", owner: "yasmin", note: "الجسر بين قراءة الأرقام والتنفيذ" },
  { n: 101, t: "الردّ على توقّف المنصّة أو عطلها الحرج", stage: "loop", owner: "tech" },
  { n: 102, t: "تحديد وجهة زرّ التواصل في المقال", stage: "loop", owner: "tareq", note: "اليوم ثابت: واتساب ← رابط الشريك ← /clients" },

  { n: 103, t: "تطبيق قيود الشريك الملغي", stage: "admin", owner: "", note: "القرار: الصفحة والمقالات تبقى. يتوقّف شيئان — لا مقال جديد، ولا نشر ريلز أو ألبوم" },
  { n: 104, t: "حساب طاقة الفريق قبل بيع الباقة الجاية", stage: "admin", owner: "khaled" },
  { n: 105, t: "العقد مع الشريك: صياغته وتوقيعه وحفظه", stage: "admin", owner: "khaled" },
  { n: 106, t: "قبول الشريك أو رفضه لعدم الملاءمة", stage: "admin", owner: "khaled" },
  { n: 107, t: "الموردون والتكاليف الشهرية", stage: "admin", owner: "khaled" },
  { n: 108, t: "الأمن والوصول لقاعدة الإنتاج", stage: "admin", owner: "tech" },
  { n: 109, t: "النسخة الإنجليزية", stage: "admin", owner: "", parked: true },
];
