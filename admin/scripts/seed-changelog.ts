import { db } from "../lib/db";

async function run() {
  await db.changelog.deleteMany();

  const changelogs = [
    {
      version: "0.16.0",
      title: "سجل التحديثات + ملاحظات الفريق + إصلاحات",
      items: [
        { type: "feature", text: "صفحة سجل التحديثات — عرض كل التحديثات حسب الإصدار" },
        { type: "feature", text: "نظام ملاحظات الفريق — كتابة ملاحظات + ردود محادثة" },
        { type: "feature", text: "رابط سجل التحديثات في السايدبار جنب رقم الإصدار" },
        { type: "improve", text: "زر إرسال الملاحظة يحفظ في قاعدة البيانات + يرسل إيميل" },
        { type: "fix", text: "إصلاح جذري لمشكلة 'تم تعديل المقال من مستخدم آخر' — السبب: SEO يغيّر updatedAt بعد الحفظ" },
        { type: "fix", text: "إصلاح مؤشر التقدم — كان 56% والصحيح 60%" },
        { type: "improve", text: "جميع رسائل SEO Analyzer بالعربية" },
        { type: "improve", text: "جميع تلميحات الخطوات بالعربية مع وصف واضح" },
      ],
    },
    {
      version: "0.15.0",
      title: "رسائل التنبيه عربية + أيقونات ملونة",
      items: [
        { type: "improve", text: "تحسين شامل لرسائل التنبيه — أيقونات + ألوان + نصوص عربية واضحة" },
        { type: "feature", text: "إضافة نوع success للتنبيهات — أخضر مع علامة صح" },
        { type: "feature", text: "إضافة نوع warning للتنبيهات — أصفر مع علامة تحذير" },
        { type: "improve", text: "التنبيهات تختفي تلقائياً بعد 5 ثواني" },
        { type: "improve", text: "دعم 3 تنبيهات في نفس الوقت بدل 1" },
        { type: "fix", text: "إصلاح تنبيه 'مغادرة الصفحة' بعد الحفظ" },
      ],
    },
    {
      version: "0.14.0",
      title: "أمان الكتّاب والميديا والإعدادات + ربط الصناعات",
      items: [
        { type: "feature", text: "حماية جميع عمليات الكتّاب — تحقق من الصلاحية" },
        { type: "feature", text: "حماية جميع عمليات الميديا (رفع + تعديل + حذف)" },
        { type: "feature", text: "حماية 6 عمليات حفظ في الإعدادات" },
        { type: "feature", text: "ربط تحديث الصناعة بتحديث SEO العملاء تلقائياً" },
        { type: "improve", text: "تحسين وضوح رقم الإصدار في السايدبار" },
      ],
    },
    {
      version: "0.13.0",
      title: "أمان التصنيفات والوسوم والصناعات + نظام الملاحظات",
      items: [
        { type: "feature", text: "حماية التصنيفات — auth + Zod + فحص الرابط المختصر" },
        { type: "feature", text: "حماية الوسوم — auth + Zod + فحص الرابط المختصر" },
        { type: "feature", text: "حماية الصناعات — auth + Zod + فحص الرابط المختصر" },
        { type: "feature", text: "صفحات خطأ (error.tsx) للتصنيفات والوسوم والصناعات" },
        { type: "feature", text: "نظام إرسال الملاحظات عبر البريد + بانر Beta" },
        { type: "improve", text: "تحويل 80+ تسمية عربية في صفحة العملاء إلى إنجليزية" },
        { type: "improve", text: "إضافة Organization + WebSite في JSON-LD لكل الأقسام" },
        { type: "improve", text: "Breadcrumb بالإنجليزية في كل الأقسام" },
        { type: "improve", text: "إضافة alternates.languages (ar-SA) في الميتاداتا" },
        { type: "fix", text: "إصلاح تصميم صفحة العملاء — فلاتر مخفية + إحصائيات مضغوطة" },
      ],
    },
    {
      version: "0.12.0",
      title: "تطوير شامل للمقالات — 5 خطوات + محرر متقدم",
      items: [
        { type: "feature", text: "تقليل خطوات إنشاء المقال من 12 إلى 5" },
        { type: "feature", text: "الحفظ التلقائي كل 30 ثانية في وضع التعديل" },
        { type: "feature", text: "منع النشر تحت 60% SEO" },
        { type: "feature", text: "ترقية المحرر — Undo/Redo + Highlight + YouTube + Superscript + Clear" },
        { type: "feature", text: "توحيد نتيجة SEO بين الفورم وصفحة العرض" },
        { type: "improve", text: "عداد كلمات مباشر + أحرف + وقت قراءة في المحرر" },
        { type: "improve", text: "تحذير عند مغادرة الصفحة بدون حفظ" },
        { type: "improve", text: "بيانات تجريبية محسّنة — محتوى عربي غني + أسئلة شائعة" },
        { type: "fix", text: "إصلاح redirect بعد التحديث" },
        { type: "fix", text: "إصلاح beforeunload المفرط" },
        { type: "fix", text: "إصلاح قص عنوان SEO في منتصف الكلمة" },
        { type: "fix", text: "إصلاح بناء Console — إزالة import مفقود" },
      ],
    },
    {
      version: "0.11.0",
      title: "تطوير شامل للعملاء — أمان + SEO + أداء",
      items: [
        { type: "feature", text: "حماية العملاء — auth + Zod + فحص الرابط المختصر" },
        { type: "feature", text: "ربط تحديث العميل بتحديث JSON-LD المقالات تلقائياً" },
        { type: "fix", text: "إصلاح JSON-LD — @id/@type كانت تُحذف" },
        { type: "fix", text: "إصلاح Tax ID — كان يُسند لحقل خاطئ" },
        { type: "improve", text: "إعادة تصميم واجهة العملاء بالكامل" },
      ],
    },
    {
      version: "0.10.0",
      title: "تطوير صفحة الكتّاب + SEO Cache",
      items: [
        { type: "feature", text: "إعادة تصميم شامل لصفحة الكتّاب" },
        { type: "feature", text: "Person JSON-LD + ربط تلقائي بالمقالات" },
        { type: "feature", text: "صفحة كاتب في الموقع العام" },
        { type: "feature", text: "جرس الإشعارات في الترويسة" },
      ],
    },
    {
      version: "0.9.0",
      title: "تطوير صفحة الميديا + SEO الصور",
      items: [
        { type: "feature", text: "إعادة تصميم شامل لصفحة الميديا" },
        { type: "feature", text: "SEO الصور — alt text + JSON-LD creditText" },
        { type: "feature", text: "خريطة موقع الصور (Image Sitemap)" },
        { type: "improve", text: "إزالة بيانات EXIF من الصور" },
        { type: "improve", text: "إزالة الحذف الجماعي" },
      ],
    },
  ];

  for (const log of changelogs) {
    await db.changelog.create({ data: log });
    console.log(`✅ v${log.version}: ${log.title}`);
  }

  console.log(`\nDone — ${changelogs.length} changelog entries created`);
  await db.$disconnect();
}

run();
