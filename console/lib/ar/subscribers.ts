export const subscribers = {
  title: "مشتركو النشرة",
  manageNewsletter: "كل من اشترك في نشرتك ووافقاته الخصوصية في مكان واحد.",

  // Filters
  all: "الكل",
  active: "نشط",
  subscribedUsers: "يستقبلون نشرتك",
  unsubscribed: "ألغوا الاشتراك",
  leftTheList: "غادروا القائمة",
  withConsentOnly: "بموافقة الخصوصية",

  // KPI cards
  gdprConsent: "موافقة الخصوصية",
  consentLabel: "وافقوا على استلام النشرة",
  thisMonth: "هذا الشهر",
  newSubscribers: "اشتركوا حديثاً",
  total: "الإجمالي",
  allSubscribers: "كل سجلّات المشتركين",

  // Table + search
  subscribersList: "القائمة",
  subscribersCount: "مشترك",
  showingPagedHint: "نعرض أحدث {n} سجل — استخدم البحث للوصول للأقدم.",
  searchPlaceholder: "ابحث بالبريد أو الاسم…",
  exportCsv: "تصدير CSV",
  exporting: "جارٍ التصدير…",

  // Columns
  email: "البريد الإلكتروني",
  subscribedAt: "تاريخ الاشتراك",
  status: "الحالة",
  name: "الاسم",
  consent: "الموافقة",
  actions: "الإجراءات",
  noConsent: "بدون موافقة",
  yesConsent: "موثّقة",

  // Empty states
  noSubscribers: "لا يوجد مشتركون بعد",
  noSubscribersHint: "سيظهر هنا كل من يشترك في نشرتك من زوّار مقالاتك.",
  noSearchResults: "لا توجد نتائج للبحث",
  noSearchHint: "جرّب كلمات بحث مختلفة أو ألغِ الفلاتر.",
  noFilterResults: "لا يوجد مشتركون في هذا الفلتر",

  // Bulk actions
  selected: "مُحدَّد",
  selectAll: "تحديد الكل",
  bulkUnsubscribe: "إلغاء اشتراك المحدد",
  bulkDelete: "حذف المحدد",
  clearSelection: "إلغاء التحديد",

  // Confirmations + toasts
  confirmUnsubscribeOne: "إلغاء اشتراك هذا المشترك؟",
  confirmDeleteOne: "حذف نهائي لهذا المشترك؟ لا يمكن التراجع.",
  confirmBulkUnsubscribe: "إلغاء اشتراك {n} مشترك؟",
  confirmBulkDelete: "حذف {n} مشترك نهائياً؟ لا يمكن التراجع.",
  confirmYes: "نعم، تنفيذ",
  cancel: "إلغاء",

  unsubscribed_toast: "تم إلغاء الاشتراك",
  resubscribed_toast: "تم تفعيل الاشتراك",
  deleted_toast: "تم الحذف",
  bulkUnsubscribed_toast: "تم إلغاء اشتراك {n} مشترك",
  bulkDeleted_toast: "تم حذف {n} مشترك",
  exported_toast: "تم تصدير الملف",

  unsubscribeFailed: "ما تم إلغاء الاشتراك. جرّب مرة أخرى.",
  resubscribeFailed: "ما تمت إعادة الاشتراك. جرّب مرة أخرى.",
  deleteFailed: "ما تم الحذف. جرّب مرة أخرى.",
  exportFailed: "ما تم التصدير. جرّب مرة أخرى.",
  bulkFailed: "ما تمت العملية. جرّب مرة أخرى.",

  // Detail drawer
  detailsTitle: "تفاصيل المشترك",
  contactInfo: "بيانات التواصل",
  timeline: "السجلّ الزمني",
  consentInfo: "موافقة الخصوصية",
  consentGivenAt: "تاريخ الموافقة",
  subscribedSince: "مشترك منذ",
  unsubscribedAt: "أَلغَى الاشتراك في",
  preferencesLabel: "التفضيلات",
  noPreferences: "لا توجد تفضيلات مخصّصة.",
  actionUnsubscribe: "إلغاء الاشتراك",
  actionResubscribe: "إعادة التفعيل",
  actionDelete: "حذف نهائي",
} as const;
