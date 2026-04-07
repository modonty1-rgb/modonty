import { db } from "../lib/db";

async function run() {
  await db.changelog.deleteMany();

  const changelogs = [
    {
      version: "0.17.0",
      title: "ربط الإعدادات بتحديث SEO لجميع الأقسام تلقائياً",
      createdAt: new Date("2026-04-07T13:10:00+03:00"),
      items: [
        { type: "feature", text: "عند حفظ الإعدادات — يتم تحديث SEO لجميع المقالات والعملاء والتصنيفات والوسوم والصناعات تلقائياً" },
        { type: "improve", text: "تحديث صفحات القوائم (listing pages) بعد كل تغيير في الإعدادات" },
        { type: "improve", text: "إعادة تحقق الموقع العام (revalidate) لجميع الأقسام بعد التحديث" },
      ],
    },
    {
      version: "0.16.0",
      title: "سجل التحديثات + ملاحظات الفريق + إصلاحات",
      createdAt: new Date("2026-04-07T12:30:00+03:00"),
      items: [
        { type: "feature", text: "صفحة سجل التحديثات — عرض كل التحديثات حسب الإصدار" },
        { type: "feature", text: "نظام ملاحظات الفريق — كتابة ملاحظات + ردود محادثة" },
        { type: "feature", text: "رابط سجل التحديثات في السايدبار جنب رقم الإصدار" },
        { type: "improve", text: "زر إرسال الملاحظة يحفظ في قاعدة البيانات + يرسل إيميل" },
        { type: "fix", text: "إصلاح جذري لمشكلة 'تم تعديل المقال من مستخدم آخر'" },
        { type: "fix", text: "إصلاح مؤشر التقدم — كان 56% والصحيح 60%" },
        { type: "improve", text: "جميع رسائل SEO Analyzer بالعربية" },
        { type: "improve", text: "جميع تلميحات الخطوات بالعربية مع وصف واضح" },
      ],
    },
    {
      version: "0.15.0",
      title: "رسائل التنبيه عربية + أيقونات ملونة",
      createdAt: new Date("2026-04-07T02:00:00+03:00"),
      items: [
        { type: "improve", text: "تحسين شامل لرسائل التنبيه — أيقونات + ألوان + نصوص عربية واضحة" },
        { type: "feature", text: "إضافة نوع success للتنبيهات — أخضر مع علامة صح" },
        { type: "feature", text: "إضافة نوع warning للتنبيهات — أصفر مع علامة تحذير" },
        { type: "improve", text: "التنبيهات تختفي تلقائياً بعد 5 ثواني" },
        { type: "fix", text: "إصلاح تنبيه 'مغادرة الصفحة' بعد الحفظ" },
      ],
    },
    {
      version: "0.14.0",
      title: "أمان الكتّاب والميديا والإعدادات + ربط الصناعات",
      createdAt: new Date("2026-04-06T22:30:00+03:00"),
      items: [
        { type: "feature", text: "حماية جميع عمليات الكتّاب والميديا والإعدادات" },
        { type: "feature", text: "ربط تحديث الصناعة بتحديث SEO العملاء تلقائياً" },
        { type: "improve", text: "تحسين وضوح رقم الإصدار في السايدبار" },
      ],
    },
    {
      version: "0.13.0",
      title: "أمان التصنيفات والوسوم والصناعات + نظام الملاحظات",
      createdAt: new Date("2026-04-06T15:00:00+03:00"),
      items: [
        { type: "feature", text: "حماية التصنيفات والوسوم والصناعات — auth + Zod + slug" },
        { type: "feature", text: "صفحات خطأ (error.tsx) للتصنيفات والوسوم والصناعات" },
        { type: "feature", text: "نظام إرسال الملاحظات عبر البريد + بانر Beta" },
        { type: "improve", text: "تحويل 80+ تسمية عربية في صفحة العملاء إلى إنجليزية" },
        { type: "improve", text: "إضافة Organization + WebSite في JSON-LD لكل الأقسام" },
        { type: "fix", text: "إصلاح تصميم صفحة العملاء — فلاتر مخفية + إحصائيات مضغوطة" },
      ],
    },
    {
      version: "0.12.0",
      title: "تطوير شامل للمقالات — 5 خطوات + محرر متقدم",
      createdAt: new Date("2026-04-06T06:15:00+03:00"),
      items: [
        { type: "feature", text: "تقليل خطوات إنشاء المقال من 12 إلى 5" },
        { type: "feature", text: "الحفظ التلقائي كل 30 ثانية في وضع التعديل" },
        { type: "feature", text: "منع النشر تحت 60% SEO" },
        { type: "feature", text: "ترقية المحرر — Undo/Redo + Highlight + YouTube + Superscript" },
        { type: "feature", text: "توحيد نتيجة SEO بين الفورم وصفحة العرض" },
        { type: "improve", text: "عداد كلمات مباشر + أحرف + وقت قراءة في المحرر" },
        { type: "improve", text: "تحذير عند مغادرة الصفحة بدون حفظ" },
        { type: "fix", text: "إصلاح redirect بعد التحديث" },
        { type: "fix", text: "إصلاح قص عنوان SEO في منتصف الكلمة" },
      ],
    },
    {
      version: "0.11.0",
      title: "تطوير شامل للعملاء — أمان + SEO + أداء",
      createdAt: new Date("2026-04-05T18:00:00+03:00"),
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
      createdAt: new Date("2026-04-05T01:00:00+03:00"),
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
      createdAt: new Date("2026-04-04T14:00:00+03:00"),
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
    await db.changelog.create({ data: { version: log.version, title: log.title, items: log.items, createdAt: log.createdAt } });
    console.log(`✅ v${log.version}: ${log.title} — ${log.createdAt.toLocaleDateString("ar-SA")}`);
  }

  console.log(`\nDone — ${changelogs.length} changelog entries created`);
  await db.$disconnect();
}

run();
