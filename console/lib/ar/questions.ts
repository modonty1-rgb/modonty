export const questions = {
  title: "أسئلة الزوار",
  description:
    "بريد القرّاء — أسئلة وصلت من زوار مقالاتك. ردّ بنقرة، يصلهم الرد عبر الإيميل تلقائياً.",
  pageHint: "هذي الصفحة للأسئلة من المساعد الذكي + الزوار المسجَّلين فقط — أسئلة فريق مودونتي تجد في 'الأسئلة الشائعة'.",

  // KPI cards
  pending: "بانتظار الرد",
  answered: "تم الرد",
  rejected: "مرفوض",
  total: "الإجمالي",
  awaitingReply: "أولوية: ردّ سريعاً",
  publishedReplies: "ردود منشورة",
  rejectedHint: "أسئلة لن تُجاب",
  allQuestions: "كل الأسئلة (نشطة + مرفوضة)",

  // Filters + table
  listTitle: "القائمة",
  questionsCount: "سؤال",
  searchPlaceholder: "ابحث في السؤال أو الكاتب أو المقال…",
  fromArticle: "من مقال",
  fromReader: "من زائر",
  sourceChatbot: "من المساعد الذكي",
  sourceUser: "من زائر مسجَّل",

  // Actions
  reply: "أرسل الرد",
  replyPlaceholder: "اكتب ردك هنا…",
  replying: "جارٍ الإرسال…",
  rejectQuestion: "رفض السؤال",
  rejectingQuestion: "جارٍ الرفض…",
  restoreQuestion: "إعادة للانتظار",
  confirmReject: "رفض هذا السؤال؟ يمكن إرجاعه لاحقاً.",
  confirmYes: "نعم، تنفيذ",
  cancel: "إلغاء",
  answerRequired: "اكتب ردك قبل الإرسال",

  // Toasts
  replySuccess: "تم إرسال الرد للزائر عبر الإيميل",
  replyFailed: "ما تم إرسال الرد. جرّب مرة أخرى.",
  rejected_toast: "تم الرفض",
  restored_toast: "تمت الإعادة لـ 'بانتظار الرد'",
  rejectFailed: "ما تم الرفض. جرّب مرة أخرى.",

  // Submitter
  submitter: "المرسل",
  anonymous: "زائر مجهول",
  noEmail: "لا يوجد بريد",
  yourReply: "ردك",

  // Empty states
  noQuestions: "لا توجد أسئلة بعد",
  noQuestionsHint:
    "ستظهر هنا الأسئلة من زوار مقالاتك (المساعد الذكي أو نموذج 'اسأل عن المقال').",
  noSearchResults: "لا توجد نتائج للبحث",
  noFilterResults: "لا توجد أسئلة في هذا الفلتر",

  // Detail drawer
  detailsTitle: "تفاصيل السؤال",
  submitterSection: "بيانات الزائر",
  submitterName: "الاسم",
  submitterEmail: "البريد",
  contactCta: "تواصل عبر الإيميل",
  questionSection: "نص السؤال",
  answerSection: "الرد المنشور",
  articleSection: "المقال",
  timelineSection: "الزمن",
  submittedAt: "وصل في",
  repliedAt: "تم الرد في",
} as const;
