export const leads = {
  title: "العملاء المحتملون",
  trackQualify: "الزوار الأكثر تفاعلاً مع محتواك خلال الـ 30 يوم الأخيرة.",

  // KPI cards
  hotLeads: "اهتمام عالٍ",
  warmLeads: "اهتمام متوسط",
  coldLeads: "اهتمام منخفض",
  qualified: "مؤهلون للتواصل",
  avgScore: "متوسط الدرجة",
  highEngagement: "درجة ≥ 70 — أولوية تواصل عاجل",
  moderateEngagement: "درجة 40 إلى 69 — تابعهم",
  lowEngagement: "درجة أقل من 40 — تفاعل بسيط",
  readyForOutreach: "درجة ≥ 60 — وقت التواصل",
  outOf100: "من 100",

  // Filters + table
  leadsOverview: "القائمة",
  leadsCount: "عميل محتمل",
  all: "الكل",
  hot: "عالٍ",
  warm: "متوسط",
  cold: "منخفض",
  qualifiedFilter: "مؤهل",
  searchPlaceholder: "ابحث بالاسم أو البريد…",
  showingPagedHint: "نعرض أعلى {n} درجة — استخدم البحث للوصول للأقدم.",

  contact: "جهة الاتصال",
  level: "المستوى",
  score: "الدرجة",
  pages: "صفحات",
  timeMin: "وقت (دقيقة)",
  interactions: "تفاعلات",
  conversions: "تحويلات",
  lastActive: "آخر نشاط",

  // Empty states
  noLeadsFound: "لا يوجد عملاء محتملون بعد",
  noLeadsHint: "اضغط \"تحديث الدرجات\" لحساب نقاط الزوار بناءً على تفاعلهم مع المحتوى.",
  noSearchResults: "لا توجد نتائج للبحث",
  noFilterResults: "لا يوجد عملاء في هذا الفلتر",

  noContact: "لا يوجد اتصال",
  anonymous: "زائر مجهول",
  unqualified: "غير مؤهل",
  qualifiedBadge: "مؤهل",

  // Refresh
  refreshScores: "تحديث الدرجات",
  refreshing: "جارٍ التحديث…",
  refreshSuccess: "تم تحديث {n} عميل · حُذف {d} قديم",
  refreshScoresError: "ما تم تحديث الدرجات. جرّب مرة أخرى.",
  never: "لم يُحسب بعد",
  lastRefreshed: "آخر تحديث",
  refreshedJustNow: "الآن",
  refreshedMinutesAgo: "منذ {n} دقيقة",
  refreshedHoursAgo: "منذ {n} ساعة",
  refreshedDaysAgo: "منذ {n} يوم",

  // Export
  exportCsv: "CSV",
  exporting: "…",
  exported_toast: "تم تصدير الملف",
  exportFailed: "ما تم التصدير. جرّب مرة أخرى.",

  // Detail drawer
  detailsTitle: "تفاصيل العميل المحتمل",
  contactInfo: "بيانات التواصل",
  scoreBreakdown: "تفاصيل الدرجة",
  scoreView: "مشاهدة الصفحات",
  scoreTime: "الوقت في الصفحات",
  scoreInteraction: "التفاعلات (نقرات CTA)",
  scoreConversion: "التحويلات",
  activitySection: "النشاط في آخر 30 يوم",
  timeSpentLabel: "إجمالي الوقت",
  pagesViewedLabel: "صفحات مشاهَدة",
  interactionsLabel: "تفاعلات",
  conversionsLabel: "تحويلات",
  lastActivityLabel: "آخر نشاط",
  contactCta: "تواصل عبر البريد",
  whatsappCta: "تواصل عبر واتساب",
  noContactMethods: "لا توجد بيانات تواصل لهذا الزائر بعد.",

  // KPI info popovers
  howScoreWorksTitle: "ما اللي يرفع الدرجة؟",
  howScoreWorksIntro: "كل زائر له درجة من 100 بناءً على 4 سلوكيات:",
  factor1: "يقرأ مقالاتك",
  factor2: "يقضي وقتاً في صفحاتك",
  factor3: "يضغط على أزرارك",
  factor4: "يتحوّل إلى عميل (نموذج، اشتراك، شراء)",
  formulaLine: "كلما زاد تفاعله، ارتفعت درجته.",
  windowNote: "نقيس آخر 30 يوم فقط. الزوار الخامدين يُحذفون تلقائياً.",

  infoHighTitle: "اهتمام عالٍ — مَن هو؟",
  infoHighDesc: "الزائر اللي يتفاعل معك بقوة:",
  infoHighExample:
    "• قرأ مقالات متعددة\n• قضى وقت طويل\n• ضغط على روابطك\n• وغالباً حوّل (سجّل، طلب، اشترى)\n\nهؤلاء أولوية تواصل عاجل.",

  infoMediumTitle: "اهتمام متوسط — مَن هو؟",
  infoMediumDesc: "الزائر المهتم لكن لسه ما اتخذ خطوة:",
  infoMediumExample:
    "• يقرأ ويتفقّد\n• ضغط على بعض الأزرار\n• لكن ما حوّل بعد\n\nقريب من 'عالي' — تابعه بمحتوى أو رسالة.",

  infoLowTitle: "اهتمام منخفض — مَن هو؟",
  infoLowDesc: "الزائر العابر:",
  infoLowExample:
    "• شاف صفحة أو اثنين\n• بدون تفاعل واضح\n• ممكن قارئ صدفة\n\nلو ما رجع خلال 30 يوم، يُحذف تلقائياً عند التحديث.",

  infoQualifiedTitle: "مؤهل للتواصل — وش يعني؟",
  infoQualifiedDesc: "الزائر اللي وصل لمستوى تستحق فيه التواصل:",
  infoQualifiedNote:
    "ممكن يكون 'عالي' أو 'متوسط مرتفع' — المهم إنه يهتم ومتابع لمحتواك. اتصل بيه أو ابعث له رسالة.",

  infoAvgTitle: "متوسط الدرجة — وش يعني؟",
  infoAvgDesc: "رقم يقيس صحة جمهورك ككل:",
  infoAvgExample:
    "• عالي → جمهورك متفاعل، محتواك يجذب\n• منخفض → المحتوى يحتاج تطوير، أو الجمهور غير المستهدف",
  infoAvgInterpret:
    "نحسبه كمتوسط لكل العملاء المحتملين الحاليين (آخر 30 يوم).",

  infoButton: "كيف يُحتسب؟",
  closeBtn: "إغلاق",
} as const;
