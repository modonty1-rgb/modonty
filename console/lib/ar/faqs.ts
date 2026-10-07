export const faqs = {
  // الاسم يذكر نطاقه: هذه أسئلة تحت المقالات، وأسئلة صفحة الموقع في شاشة «أسئلة صفحتك».
  title: "أسئلة مقالاتك",
  description:
    "أسئلة مقترحة من فريق مودونتي وأخرى من زوّار مقالاتك — وافِق أو ارفض. أسئلة صفحة موقعك مكانها «أسئلة صفحتك».",

  // KPI cards
  pending: "بانتظار الموافقة",
  published: "منشورة",
  rejected: "مرفوضة",
  total: "الإجمالي",
  fromReadersKpi: "من زوّار مقالاتك",
  awaitingApproval: "بانتظار موافقتك",
  publishedFaqs: "أسئلة منشورة",
  rejectedFaqs: "أسئلة مرفوضة",
  allFaqs: "كل الأسئلة",
  fromReadersHint: "أسئلة من قرّاء حقيقيين",

  // Filters + table
  listTitle: "القائمة",
  all: "الكل",
  faqsCount: "سؤال",
  searchPlaceholder: "ابحث في السؤال أو المقال…",
  fromArticle: "من مقال",
  fromReader: "من زائر",
  submittedBy: "أرسله",
  contactReaderViaEmail: "تواصل مع الزائر",

  // Actions
  approve: "نشر",
  reject: "رفض",
  approving: "جاري النشر…",
  rejecting: "جاري الرفض…",
  restore: "إعادة للانتظار",
  restored_toast: "تمت الإعادة لـ 'بانتظار الموافقة'",
  editAnswer: "تعديل الإجابة",
  editPublished: "تعديل النص",
  answerLabel: "الإجابة",
  answerPlaceholder: "اكتب إجابتك هنا…",
  save: "حفظ التعديل",
  saving: "جاري الحفظ…",
  cancel: "إلغاء",
  answerRequired: "اكتب إجابة قبل النشر",

  // Bulk
  selected: "مُحدَّد",
  bulkPublish: "نشر المحدد",
  bulkReject: "رفض المحدد",
  clearSelection: "إلغاء التحديد",
  confirmBulkPublish: "نشر {n} سؤال (الذين عندهم إجابات فقط)؟",
  confirmBulkReject: "رفض {n} سؤال؟",
  confirmYes: "نعم، تنفيذ",
  bulkPublished_toast: "تم نشر {n} سؤال",
  bulkRejected_toast: "تم رفض {n} سؤال",

  // Toasts
  approved_toast: "تم النشر",
  rejected_toast: "تم الرفض",
  saved_toast: "تم الحفظ",
  approveFailed: "ما تم النشر. جرّب مرة أخرى.",
  rejectFailed: "ما تم الرفض. جرّب مرة أخرى.",
  saveFailed: "ما تم الحفظ. جرّب مرة أخرى.",
  bulkFailed: "ما تمت العملية. جرّب مرة أخرى.",

  // Empty states
  noFaqs: "لا توجد أسئلة بعد",
  noFaqsHint: "ستظهر هنا الأسئلة المقترحة من فريق مودونتي + أسئلة زوّار مقالاتك.",
  noSearchResults: "لا توجد نتائج للبحث",
  noFilterResults: "لا توجد أسئلة في هذا الفلتر",

  // Source labels
  source: "المصدر",
  sourceChatbot: "من المساعد الذكي",
  sourceUser: "من زائر مسجَّل",
  sourceManual: "أعدّها فريق مودونتي",
  sourceUnknown: "غير محدّد",

  // Detail drawer
  detailsTitle: "تفاصيل السؤال",
  questionLabel: "السؤال",
  submitterLabel: "بيانات المُرسِل",
  submitterName: "الاسم",
  submitterEmail: "البريد",
  submittedAt: "تاريخ الإرسال",
  lastUpdated: "آخر تعديل",
  articleLink: "افتح المقال",
  needsAnswerHint: "هذا السؤال من زائر — لازم تكتب إجابة قبل النشر.",
} as const;
