import type {
  SuccessKey,
  ErrorKey,
  ConfirmKey,
  ArticleHintKey,
  AuthorHintKey,
  CategoryHintKey,
  TagHintKey,
  IndustryHintKey,
  ClientHintKey,
  UserHintKey,
  SettingHintKey,
  FaqHintKey,
  ContactMessageHintKey,
  SubscriptionTierHintKey,
} from './types';

// ─── SUCCESS MESSAGES ───
const success: Record<SuccessKey, string> = {
  created: 'تم الإنشاء بنجاح',
  updated: 'تم التحديث بنجاح',
  deleted: 'تم الحذف بنجاح',
  saved: 'تم الحفظ بنجاح',
  published: 'تم النشر بنجاح',
  archived: 'تم الأرشفة بنجاح',
  restored: 'تم الاستعادة بنجاح',
  copied: 'تم النسخ إلى الحافظة',
  uploaded: 'تم التحميل بنجاح',
  sent: 'تم الإرسال بنجاح',
  read: 'تم القراءة',
  replied: 'تم الرد',
  exported: 'تم التصدير',
  success: 'نجح',
} as const;

// ─── ERROR MESSAGES ───
const error: Record<ErrorKey, string> = {
  required: 'هذا الحقل مطلوب',
  email: 'عنوان بريد إلكتروني غير صحيح',
  url: 'عنوان URL غير صحيح',
  slug_exists: 'هذا الاختصار مستخدم بالفعل',
  unauthorized: 'لا توجد صلاحية للقيام بهذا الإجراء — تسجيل الدخول مطلوب',
  not_found: 'لم يتم العثور على المورد',
  conflict: 'تعارض بيانات — جرب الإعادة',
  validation_failed: 'تحقق من البيانات قبل المتابعة',
  server_error: 'حدث خطأ في الخادم. جرب لاحقاً',
  file_too_large: 'الملف كبير جداً — حد أقصى 5 ميجابايت',
  invalid_file_type: 'نوع ملف غير مدعوم',
  network_error: 'خطأ في الاتصال — تحقق من الإنترنت',
  permission_denied: 'ليس لديك صلاحية للقيام بهذا الإجراء',
  upload_failed: 'فشل التحميل',
  delete_failed: 'فشل الحذف',
  update_failed: 'فشل التحديث',
  copy_failed: 'فشل النسخ',
  export_failed: 'فشل التصدير',
  cloudinary_missing: 'إعدادات Cloudinary مفقودة',
  invalid_filename: 'اسم الملف المُولَّد غير صالح',
  operation_failed: 'فشلت العملية',
  save_failed: 'فشل الحفظ',
  failed: 'فشل',
  error: 'خطأ',
} as const;

// ─── CONFIRMATION MESSAGES ───
const confirm: Record<ConfirmKey, string> = {
  delete: 'هل تريد الحذف؟ لا يمكن التراجع عنه',
  unsaved_changes: 'لديك تغييرات غير محفوظة. هل تريد المتابعة؟',
  publish: 'هل تريد نشر هذا المحتوى؟',
  archive: 'هل تريد أرشفة هذا العنصر؟',
} as const;

// ─── TOAST DESCRIPTIONS ───
const descriptions = {
  // Articles
  article_save_error: 'حدث خطأ أثناء حفظ المقال',
  article_save_success: 'تم حفظ المقال بنجاح وهو في انتظار معاينة المدير',
  articles_exported: 'تم تصدير المقالات بنجاح',
  articles_export_failed: 'فشل تصدير المقالات',
  article_no_data: 'No data to export',
  article_content_required: 'يرجى إضافة محتوى للمقال أولاً',

  // Categories, Tags, Industries (export)
  categories_exported: 'تم تصدير التصنيفات بنجاح',
  categories_export_failed: 'تعذّر تصدير التصنيفات',
  tags_exported: 'تم تصدير الوسوم بنجاح',
  tags_export_failed: 'تعذّر تصدير الوسوم',
  industries_exported: 'تم تصدير الصناعات بنجاح',
  industries_export_failed: 'تعذّر تصدير الصناعات',

  // JSON-LD & SEO
  jsonld_copied: 'تم نسخ JSON-LD',
  jsonld_copy_failed: 'فشل في النسخ',
  seo_preview_failed: 'فشل في معاينة الإصلاحات',
  citations_extracted: 'تمت إضافة مصادر موثوقة',
  citations_error: 'حدث خطأ أثناء استخراج الروابط',
  client_required: 'يرجى اختيار عميل أولاً لضمان تتبع الروابط الخلفية بشكل صحيح',

  // Media
  media_copied: 'تم نسخ رابط الصورة',
  media_copy_failed: 'تعذّر نسخ الرابط',
  media_deleted: 'تم حذف الملف',
  media_delete_failed: 'تعذّر حذف الملف',
  media_upload_error: 'فشل التحميل إلى Cloudinary',

  // Categories, Tags, Industries
  category_deleted: 'تم حذف التصنيف',
  category_delete_failed: 'تعذّر حذف التصنيف',
  tag_deleted: 'تم حذف الوسم',
  tag_delete_failed: 'تعذّر حذف الوسم',
  industry_deleted: 'تم حذف الصناعة',
  industry_delete_failed: 'تعذّر حذف الصناعة',

  // Clients
  client_deleted: 'تم حذف العميل',
  client_delete_failed: 'تعذّر حذف العميل',
  clients_exported: 'تم تصدير العملاء بنجاح',
  clients_export_failed: 'تعذّر تصدير العملاء',

  // Authors
  author_updated: 'تم تحديث بيانات الكاتب بنجاح',
  author_update_failed: 'تعذّر تحديث بيانات الكاتب',

  // FAQ & Contact
  faq_created: 'تم إنشاء السؤال الشائع بنجاح',
  faq_updated: 'تم تحديث السؤال الشائع بنجاح',
  faq_deleted: 'تم حذف السؤال',
  faq_status_changed: 'تم تغيير حالة السؤال',
  faq_create_failed: 'تعذّر إنشاء السؤال الشائع',
  faq_update_failed: 'تعذّر تحديث السؤال الشائع',
  message_status_updated: 'تم تحديث حالة الرسالة',
  message_update_failed: 'تعذّر تحديث حالة الرسالة',
  message_replied: 'تم تعليم الرسالة كمُجاب عليها',
  message_deleted: 'تم حذف الرسالة بنجاح',

  // Media Upload
  upload_in_progress: 'جاري التحميل...',
  upload_complete: 'تم التحميل بنجاح',
  upload_failed: 'فشل التحميل',
  copy_to_clipboard_success: 'تم نسخ المحتوى إلى الحافظة',
  copy_to_clipboard_failed: 'تعذّر نسخ المحتوى إلى الحافظة',
  file_format_error: 'نوع الملف غير مدعوم',
  file_size_error: 'حجم الملف كبير جداً',

  // Subscription Tiers
  tier_created: 'تم إنشاء خطة الاشتراك بنجاح',
  tier_updated: 'تم تحديث خطة الاشتراك بنجاح',
  tier_deleted: 'تم حذف خطة الاشتراك بنجاح',
  tier_create_failed: 'تعذّر إنشاء خطة الاشتراك',
  tier_update_failed: 'تعذّر تحديث خطة الاشتراك',
  tier_delete_failed: 'تعذّر حذف خطة الاشتراك',

  // Users
  user_created: 'تم إنشاء المستخدم بنجاح',
  user_updated: 'تم تحديث بيانات المستخدم بنجاح',
  user_deleted: 'تم حذف المستخدم بنجاح',
  user_create_failed: 'تعذّر إنشاء المستخدم',
  user_update_failed: 'تعذّر تحديث بيانات المستخدم',
  user_delete_failed: 'تعذّر حذف المستخدم',
  password_changed: 'تم تغيير كلمة المرور بنجاح',
  password_change_failed: 'تعذّر تغيير كلمة المرور',

  // Media Management
  media_metadata_updated: 'تم تحديث بيانات الملف بنجاح',
  media_verify_failed: 'تعذّر التحقق من استخدام الملف',
  cloudinary_missing: 'إعدادات Cloudinary مفقودة',
  invalid_filename: 'اسم الملف المُولَّد غير صالح',

  // Validation & Copy
  validation_complete: 'تم التحقق بنجاح',
  validation_failed: 'فشل التحقق',
  copied_to_clipboard: 'تم النسخ إلى الحافظة',
  copy_failed: 'فشل النسخ',
  id_copied: 'تم نسخ المعرّف بنجاح',
  search_data_updated: 'تم تحديث بيانات البحث',

  // Settings
  settings_load_failed: 'تعذّر تحميل الإعدادات',

  // Generic
  unexpected_error: 'حدث خطأ غير متوقع',
  save_error: 'حدث خطأ أثناء الحفظ. حاول مرة أخرى',
  test_data_created: 'تم إنشاء بيانات تجريبية بنجاح',
  test_data_failed: 'فشل إنشاء البيانات التجريبية',
  database_check_required: 'يرجى التأكد من وجود عملاء وتصنيفات وكُتّاب في قاعدة البيانات',
  form_filled: 'تم ملء النموذج بالمحتوى المُولّد بنجاح',
  seo_fixes_applied: 'تم إصلاح المشاكل',
  seo_fixes_error: 'حدث خطأ أثناء إصلاح المشاكل',
  seed_test_complete: 'تم إكمال الاختبار بنجاح',
  seed_test_failed: 'فشل الاختبار. يرجى التحقق من المدخلات والمحاولة مجدداً',
  database_backup_complete: 'تم إكمال النسخ الاحتياطي',
  database_restore_complete: 'تم استعادة قاعدة البيانات',
} as const;

// ─── FORM HINTS (ORGANIZED BY ENTITY) ───
const hints = {
  article: {
    title: 'عنوان المقال — يظهر في نتائج البحث',
    slug: 'اختصار URL — يؤثر على SEO',
    content: 'محتوى المقال الرئيسي',
    metaTitle: 'عنوان محرك البحث — 50-60 حرفاً',
    metaDescription: 'وصف ملخص — 150-160 حرفاً',
    focusKeyword: 'الكلمة الرئيسية المستهدفة',
    wordCount: 'عدد الكلمات الإجمالي',
    images: 'صور المقال',
    status: 'حالة المقال — مسودة أو منشور',
    authors: 'كاتب أو أكثر',
    category: 'فئة المقال',
    tags: 'وسوم ذات صلة',
    publishedAt: 'تاريخ النشر',
  } satisfies Record<ArticleHintKey, string>,

  author: {
    name: 'اسم الكاتب الكامل',
    slug: 'اختصار URL الفريد',
    email: 'البريد الإلكتروني للتواصل',
    bio: 'نبذة مختصرة عن الكاتب',
    avatar: 'صورة الكاتب',
    jobTitle: 'مثال: منصة محتوى، ناشر رقمي',
    expertiseAreas: 'مفصولة بفاصلة',
    credentials: 'كل شهادة في سطر',
    memberOf: 'مفصولة بفاصلة',
    metaTitle: 'العنوان الذي يظهر في جوجل — 30-60 حرف',
    metaDescription: 'الوصف الذي يظهر في نتائج البحث — 120-160 حرف',
  } satisfies Record<AuthorHintKey, string>,

  category: {
    name: 'اسم الفئة الفريد',
    slug: 'اختصار URL — يتم إنشاؤه تلقائياً',
    description: 'وصف الفئة',
    icon: 'أيقونة الفئة',
    metaTitle: 'العنوان الذي يظهر في جوجل — 50-60 حرف',
    metaDescription: 'الوصف الذي يظهر في نتائج البحث — 150-160 حرف',
    metaKeywords: 'يُستخدم في SEO — يُنصح بـ 50+ حرف',
  } satisfies Record<CategoryHintKey, string>,

  tag: {
    name: 'اسم الوسم الفريد',
    slug: 'اختصار URL — يتم إنشاؤه تلقائياً',
    description: 'وصف الوسم',
  } satisfies Record<TagHintKey, string>,

  industry: {
    name: 'اسم الصناعة',
    slug: 'اختصار URL — يتم إنشاؤه تلقائياً',
    description: 'وصف الصناعة',
  } satisfies Record<IndustryHintKey, string>,

  client: {
    name: 'يظهر في المقالات والمحتوى المنشور',
    slug: 'يُنشأ تلقائياً من الاسم — يُستخدم في روابط الصفحات',
    phone: 'رقم الهاتف الرئيسي للتواصل',
    email: 'يظهر في بيانات التواصل وSchema.org',
    contactType: 'نوع التواصل في Schema.org ContactPoint',
    parentOrganization: 'إذا كان العميل فرع أو تابع لشركة أخرى — اتركه فارغ إذا كان مستقل',
    businessBrief: 'شعار الشركة — يظهر في بيانات SEO — حد أقصى 100 حرف',
    country: 'دولة المقر الرئيسي',
    region: 'يُستخدم في Schema.org لتحديد منطقة الخدمة',
    city: 'يظهر في بيانات العنوان — Schema.org',
    latitude: 'إحداثيات الخريطة — Schema.org GeoCoordinates',
    longitude: 'إحداثيات الخريطة — Schema.org GeoCoordinates',
    postalCode: 'الرمز البريدي — إلزامي من 2026',
    tradeLicense: 'رقم السجل التجاري — اختياري',
    taxId: 'رقم التسجيل الضريبي من هيئة الزكاة — 15 رقم',
    subscriptionTier: 'خطة الاشتراك الحالية',
    credentialsTitle: 'بيانات دخول العميل',
    businessType: 'يساعد الكتّاب في تخصيص المحتوى والأسلوب',
    keywords: 'كلمات مفتاحية للكتّاب — مفصولة بفاصلة',
    languages: 'لغات التواصل — تظهر في بيانات SEO',
    parentCompany: 'اختياري — إذا كان العميل فرع من شركة أخرى',
    organizationType: 'نوع المنظمة في SEO — يختلف عن الشكل القانوني',
    legalForm: 'الشكل القانوني للشركة — يختلف عن نوع المنظمة',
    socialDescription: 'وصف المنظمة في Schema.org — 100+ حرف للأفضل',
    twitterHandle: 'حساب X/Twitter الرسمي للعميل',
    gaTrackingId: 'اختياري — فقط إذا كان العميل يريد تتبع منفصل',
    canonical: 'يمنع المحتوى المكرر — يحدد الصفحة الأصلية',
    robots: 'يتحكم في فهرسة محركات البحث لهذا العميل',
    twitterCard: 'شكل المحتوى عند المشاركة في X/Twitter',
    paymentStatus: 'حالة الدفع للاشتراك',
  } satisfies Record<ClientHintKey, string>,

  user: {
    email: 'البريد الإلكتروني الفريد',
    name: 'اسم المستخدم الكامل',
    role: 'دور المستخدم — أدمن أو محرر',
    password: 'كلمة مرور قوية — حروف وأرقام',
    permissions: 'الصلاحيات المسموحة',
  } satisfies Record<UserHintKey, string>,

  settings: {
    siteName: 'اسم الموقع',
    siteUrl: 'عنوان URL الأساسي',
    defaultSeoTitle: 'عنوان SEO الافتراضي',
    defaultSeoDescription: 'وصف SEO الافتراضي',
    defaultLanguage: 'اللغة الافتراضية',
  } satisfies Record<SettingHintKey, string>,

  faq: {
    question: 'السؤال الشائع',
    answer: 'الإجابة التفصيلية',
    category: 'فئة السؤال',
  } satisfies Record<FaqHintKey, string>,

  contactMessage: {
    name: 'اسم المرسل',
    email: 'بريد المرسل الإلكتروني',
    subject: 'موضوع الرسالة',
    message: 'محتوى الرسالة',
  } satisfies Record<ContactMessageHintKey, string>,

  subscriptionTier: {
    name: 'اسم الخطة',
    description: 'وصف الخطة',
    price: 'سعر الخطة',
    features: 'المميزات المتضمنة',
  } satisfies Record<SubscriptionTierHintKey, string>,
} as const;

// ─── EXPORT ───
export const messages = {
  success,
  error,
  confirm,
  descriptions,
  hints,
} as const;
