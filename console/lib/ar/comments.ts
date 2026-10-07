export const comments = {
  title: "مراجعة التعليقات",
  reviewModerate: "وافِق أو ارفض تعليقات قرّائك. ردّ مباشرة عليهم لتشجيع المحادثة.",

  // KPI cards
  pending: "بانتظار المراجعة",
  awaitingReview: "بانتظار المراجعة",
  approved: "معتمد",
  publishedComments: "تعليقات منشورة",
  rejected: "مرفوض",
  rejectedComments: "تعليقات مرفوضة",
  deletedKpi: "محذوفة",
  deletedHint: "تعليقات نقلتها للأرشيف",
  total: "الإجمالي",
  all: "الكل",
  allComments: "كل التعليقات النشطة",
  activeOnly: "النشطة فقط (بدون المحذوفة)",
  commentsCount: "تعليق",

  // Filters + table
  listTitle: "القائمة",
  searchPlaceholder: "ابحث في التعليق أو الكاتب أو المقال…",
  fromArticle: "في مقال",
  selected: "مُحدَّد",
  selectAll: "تحديد الكل",
  clearSelection: "إلغاء التحديد",

  // Actions
  approveComment: "موافقة",
  rejectComment: "رفض",
  deleteComment: "حذف",
  restoreComment: "استرجاع",
  approveSelected: "الموافقة على المحدد",
  rejectSelected: "رفض المحدد",
  confirmDeleteOne: "حذف هذا التعليق؟ يمكن استرجاعه لاحقاً.",
  confirmYes: "نعم، تنفيذ",
  cancel: "إلغاء",

  // Toasts
  approved_toast: "تم النشر",
  rejected_toast: "تم الرفض",
  deleted_toast: "تم الحذف (يمكن استرجاعه)",
  restored_toast: "تم الاسترجاع",
  bulkApproved_toast: "تم نشر {n} تعليق",
  bulkRejected_toast: "تم رفض {n} تعليق",
  approveFailed: "ما تمت الموافقة. جرّب مرة أخرى.",
  rejectFailed: "ما تم الرفض. جرّب مرة أخرى.",
  deleteFailed: "ما تم الحذف. جرّب مرة أخرى.",
  bulkApproveFailed: "ما تمت الموافقة الجماعية. جرّب مرة أخرى.",
  bulkRejectFailed: "ما تم الرفض الجماعي. جرّب مرة أخرى.",

  // Empty states
  noCommentsFound: "لا توجد تعليقات بعد",
  noCommentsHint: "ستظهر هنا تعليقات قرّائك على مقالاتك. كلما زاد التفاعل، زاد الأثر.",
  noSearchResults: "لا توجد نتائج للبحث",
  noFilterResults: "لا توجد تعليقات في هذا الفلتر",

  // Author info
  anonymous: "زائر مجهول",
  noEmail: "لا يوجد بريد",
  replies: "رد",
  replyTo: "رد على:",

  // Detail drawer
  detailsTitle: "تفاصيل التعليق",
  authorSection: "بيانات الكاتب",
  authorName: "الاسم",
  authorEmail: "البريد",
  contactCta: "تواصل عبر البريد",
  commentSection: "نص التعليق",
  parentSection: "تعليق رد عليه",
  statsSection: "تفاعل التعليق",
  likesLabel: "إعجابات",
  dislikesLabel: "عدم إعجاب",
  repliesLabel: "ردود",
  timelineSection: "الزمن",
  createdAt: "تاريخ النشر",
  updatedAt: "آخر تحديث",
  editedBadge: "مُعدَّل",
} as const;
