# Console Audit — Fix TODO
**المصدر:** CONSOLE-FULL-AUDIT-REPORT.md
**التطبيق:** console (localhost:3002)

---

## 🔴 Critical — يمنع الإطلاق

- [x] **BUG-03** — التحويلات تظهر 0 رغم وجود بيانات
  - **الملف:** `console/app/(dashboard)/dashboard/analytics/helpers/enhanced-analytics-queries.ts` سطر 245
  - **أيضاً:** `console/app/(dashboard)/dashboard/helpers/dashboard-queries.ts` سطر 176، 514
  - **الإصلاح:** `article: { clientId }` ← `clientId` مباشرة
  - **التحقق:** افتح Dashboard + Analytics → Conversions يجب أن يُظهر > 0

- [x] **BUG-04** — إحصائية الأسئلة: الإجمالي=1 لكن الجدول=8
  - **الملف:** `console/app/(dashboard)/dashboard/questions/helpers/question-queries.ts` سطر 86
  - **الإصلاح:** حذف `submittedByEmail: { not: null }` من فلتر `total`
  - **التحقق:** صفحة Questions → "الإجمالي" يجب أن يطابق عدد الصفوف في الجدول

- [x] **BUG-01** — توزيع عمق التمرير = 0% لكل الأعمدة
  - **الملف:** `console/app/(dashboard)/dashboard/analytics/helpers/enhanced-analytics-queries.ts` سطر 191
  - **الإصلاح:** القراءة من `analytics` table بدلاً من `engagementDuration` الفارغ
  - **التحقق:** Analytics → Engagement → أشرطة التوزيع تعرض نسب حقيقية

- [x] **BUG-02** — وقت القراءة = 0 ثانية دائماً
  - **الملف:** `enhanced-analytics-queries.ts` سطر 231
  - **الإصلاح:** fallback لـ `analytics.timeOnPage` عندما يكون `engagementDuration.readingTime` = null
  - **التحقق:** Analytics → Engagement → "وقت القراءة" يظهر قيمة > 0

---

## 🟡 Medium — يؤثر على دقة القرارات

- [x] **BUG-05** — معدل الزوار العائدين (Return Rate) معادلته خاطئة
  - **الإصلاح:** عدّ الجلسات التي زارت أكثر من مرة ÷ إجمالي الجلسات الفريدة ✅
  - **نتيجة Live Test:** Return rate: 28.6% — منطقي ✅

- [x] **BUG-06** — المستخدمون النشطون يتأثر بـ null sessionId
  - **الإصلاح:** إزالة `distinct: ["sessionId"]` واستخدام Set يدوي بـ `userId ?? sessionId` ✅
  - **نتيجة Live Test:** Active Users: 7 — صحيح ✅

- [x] **BUG-07** — فارق في المشاهدات: Dashboard=19 vs Analytics=20
  - **الإصلاح:** Dashboard الآن يحسب articleViews + clientViews مثل Analytics ✅
  - **نتيجة Live Test:** Dashboard = Analytics = 20 ✅

- [x] **BUG-08** — لا يوجد قسم CTA Clicks في صفحة Analytics
  - **الإصلاح:** إضافة قسم "أكثر الأزرار نقرة" + query `getTopCTAClicks` ✅
  - **نتيجة Live Test:** 5 أزرار مع نقراتها (أضف تعليق:3، Tab–حول:1، اسأل العميل:1...) ✅

- [x] **BUG-09** — Engagement Score يفقد 35% من مكوناته
  - **الإصلاح:** إعادة توزيع الأوزان — time:40% + scroll:35% + interactions:25% ✅
  - **نتيجة Live Test:** Engagement Score = 52 (كان 30) — أدق وأعلى ✅

---

## 🟢 Minor — تحسين UX (لا تمنع الإطلاق)

- [x] **OBS-02** — Recent Activity نصوص بالإنجليزية في console عربي
  - **الإصلاح:** كل النصوص أصبحت عربية في `getRecentActivity` ✅
  - **نتيجة Live Test:** "اشتراك نشرة"، "تعليق جديد"، "مشترك جديد"، "مقال جديد منشور" ✅

- [x] **OBS-03** — Leads page فارغة بدون إرشاد للمستخدم
  - **الإصلاح:** empty state يعرض "لم يُعثر على عملاء محتملين" + تلميح واضح ✅
  - **نتيجة Live Test:** رسالة + تلميح "انقر تحديث الدرجات" ✅

- [x] **OBS-04** — Campaign page empty state لا تشرح كيفية البدء
  - **الإصلاح:** empty state يشرح UTM مع مثال عملي ✅
  - **نتيجة Live Test:** "لبدء التتبع، أضف معامل utm_campaign لروابطك — مثال: /articles/slug?..." ✅

- [x] **OBS-06** — Dashboard stat cards بعرض ثابت 180px تنكسر على بعض الشاشات
  - **الإصلاح:** `min-w-[160px] flex-1` على كل البطاقات ✅
  - **نتيجة Live Test:** البطاقات منتظمة ومرنة ✅

---

---

## ✅ كامل — تم Live Test وتأكيد 100%

| الخطأ | الإصلاح | Live Test |
|-------|---------|-----------|
| BUG-01 — توزيع التمرير = 0% | قراءة من `analytics` بدلاً من `engagementDuration` | 61.5% / 23.1% / 15.4% ✅ |
| BUG-02 — وقت القراءة = 0 | fallback لـ `analytics.timeOnPage` | 80s ✅ |
| BUG-03 — التحويلات = 0 | `clientId` مباشرة بدلاً من `article: { clientId }` | 1 newsletter · 5.26% ✅ |
| BUG-04 — الأسئلة total=1 vs 8 | حذف `submittedByEmail: { not: null }` | الإجمالي: 8 ✅ |
| BUG-05 — Return Rate خاطئ | عدّ returners ÷ uniqueSessions | 28.6% ✅ |
| BUG-06 — Active users null session | Set يدوي بـ `userId ?? sessionId` | 7 مستخدمين ✅ |
| BUG-07 — Views مختلف | Dashboard الآن = articleViews + clientViews | كلاهما = 20 ✅ |
| BUG-08 — لا يوجد CTA section | قسم جديد + `getTopCTAClicks` | 5 أزرار مع نقراتها ✅ |
| BUG-09 — Engagement Score ناقص | أوزان جديدة: time:40% scroll:35% interactions:25% | 52/100 ✅ |
| OBS-02 — Recent Activity إنجليزي | نصوص عربية في `getRecentActivity` | "تعليق جديد"، "مشترك جديد"... ✅ |
| OBS-03 — Leads empty state | رسالة + تلميح لـ Refresh | يظهر ✅ |
| OBS-04 — Campaigns empty state | شرح UTM مع مثال عملي | يظهر ✅ |
| OBS-06 — Cards عرض ثابت | `min-w-[160px] flex-1` | منتظمة ✅ |

**TSC:** صفر أخطاء ✅  
**آخر تحديث:** 2026-04-09 — مكتمل 100%  
**الملف:** `documents/tasks/console/CONSOLE-AUDIT-FIXES-TODO.md`
