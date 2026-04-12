# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-12 (articles table: client avatar + sort by client/SEO/status — query optimization complete)
> **الإصدار الحالي:** admin v0.29.0 | modonty v1.29.8
> المهام المنجزة في → [MASTER-DONE.md](MASTER-DONE.md)

---

## 🔴 CRITICAL — Admin: Auth على Server Actions ناقص

> يجب إصلاحه قبل أي إطلاق للعملاء.

- [ ] `contact-messages-actions.ts` — إضافة auth على: delete, updateStatus, markAsRead, markAsReplied
- [ ] `faq-actions.ts` — إضافة auth على: create, update, delete, reorder, toggleStatus
- [ ] `upload-image.ts` — إضافة auth على: uploadImage
- [ ] `upload-avatar.ts` — إضافة auth على: uploadAvatar
- [ ] `send-feedback.ts` — إضافة auth على: sendFeedback
- [ ] `cascade-all-seo.ts` — إضافة auth على: cascadeSettingsToAllEntities

---

## 🔴 CRITICAL — DB Query Audit (الثلاثة تطبيقات)

> **السبب:** اكتشفنا أن صفحة المقالات كانت تستغرق 20 ثانية بسبب جلب حقل `content` الكامل لكل مقال في القائمة.
> **القاعدة:** كل `findMany` يجب أن يجلب فقط الحقول التي تُعرض فعلاً في الـ UI.
> **ما تم إصلاحه:** articles، categories، tags، contact-messages في الـ admin.
> **ما تبقى:**

### Admin — queries لم تُراجع بعد
- [ ] **QAUDIT-A1** — `faq-actions.ts` → `getFAQs()` — يجلب `question` + `answer` الكامل، الجدول يعرض فقط question مقطوعاً
- [ ] **QAUDIT-A2** — `authors/actions` → `getAuthors()` — مراجعة الحقول المجلوبة مقابل الجدول
- [ ] **QAUDIT-A3** — `industries/actions` → `getIndustries()` — مراجعة الحقول
- [ ] **QAUDIT-A4** — `media/actions` → `getMedia()` — تأكيد أنه محسّن (الـ audit أشار لذلك)
- [ ] **QAUDIT-A5** — `dashboard` queries — analytics + stats queries بدون حد `take`

### Modonty — queries لم تُراجع
- [ ] **QAUDIT-M1** — `getArticles` في الـ feed — هل يجلب `content` كاملاً أم فقط `excerpt`؟
- [ ] **QAUDIT-M2** — `getComments` — هل يجلب حقول غير ضرورية؟
- [ ] **QAUDIT-M3** — `getFaqs` في صفحة المقال — هل يجلب أكثر من المطلوب؟
- [ ] **QAUDIT-M4** — `getRelatedArticles` — مراجعة الـ select

### Console — queries لم تُراجع
- [ ] **QAUDIT-C1** — كل الـ queries في console — مراجعة شاملة قبل أول عميل حقيقي

### المعيار للمراجعة
لكل query:
1. ما الحقول التي تظهر في الـ UI؟
2. هل يوجد `take` لتحديد الحد الأقصى؟
3. هل queries مستقلة تعمل بالتوازي (`Promise.all`)؟
4. هل يُجلب `content`/`answer`/`body` في list views؟ (ممنوع)

---

## ⚠️ Vercel — إجراءات يدوية مطلوبة

- [ ] **AUTH_SECRET** — انسخ القيمة الجديدة لـ Vercel → Settings → Environment Variables
  `rGtnuhR8EeViMTAbFAF9bhL3sH38iRdxsovdyXRnoJI=`
  ⚠️ بعد التحديث: أعد deploy → كل الجلسات ستنتهي (متوقع)
- [ ] **NEXTAUTH_URL** — تأكد أن Vercel عنده `NEXTAUTH_URL=https://www.modonty.com`
- [ ] **SEMrush** — اضغط "Rerun Campaign" بعد اكتمال آخر deploy → الهدف: Site Health ≥ 90%

---

## 🔴 HIGH — Admin: UX Fixes

- [ ] **Inline Media Picker** — عند إضافة صورة داخل محتوى المقال، Dialog يفتح (رفع جديد أو اختيار من المكتبة) بدون مغادرة الصفحة. الحالي: يضطر لمغادرة المقال → Media → رفع → رجوع.
- [ ] **Media Gallery — صور مقطوعة** — `media-grid.tsx:337` يستخدم `object-cover` داخل `aspect-[4/3]` → صور عريضة تُقطع. الإصلاح: `object-contain` + `bg-muted`.
- [ ] **Article Editor — Image Gallery مقطوعة** — نفس مشكلة `object-cover` داخل editor Image Gallery. الإصلاح: `object-contain` + `bg-muted`.
- [ ] **"Featured" label غامض** — حقل "Featured Image" أفضل تسميته "Cover Image" أو "Hero Image". الـ checkbox "Featured" في Publish step أفضل تسميته "Highlight on Homepage" مع وصف واضح.
- [ ] **رسالة خطأ النشر مضللة** — عندما نقاط SEO أقل من 60%، تظهر رسالة "حدث خطأ في الخادم" — العميل يظن النظام معطوب. الإصلاح: رسالة محددة مثل "لا يمكن النشر — نقاط SEO 51% (الحد الأدنى 60%). حسّن حقول SEO أولاً."
- [ ] **SEO Publish Gate — حظر النشر بدون seoDescription** — إضافة validation في `publish-article-action.ts`: إذا `seoDescription` فارغ أو < 50 حرف → حظر النشر + رسالة واضحة.
- [ ] **Media picker search لا تفلتر** (OBS-001) — في Article Editor "Select Featured Image"، الكتابة في search box لا تفلتر النتائج.
- [ ] **Media edit: لا يوجد حقل Client** (OBS-002) — بعد الرفع، لا يمكن نقل الصورة لعميل آخر. الإصلاح: إضافة Client dropdown في `/media/[id]/edit`.
- [ ] **Media upload: client assignment غير واضح** (OBS-004) — الرفع من Global Media يُعيّن العميل عشوائياً. يجب: selector إلزامي عند الرفع، أو pool "General" مرئي لكل العملاء.

---

## 🔴 HIGH — Admin: JBRSEO نصوص من DB

- [ ] **JBRSEO-ADMIN-1** — نصوص ClientsHero B2B تأتي من الأدمن (DB) لا hardcoded
  الحقول: `heroHeadline`, `heroSubheadline`, `heroBullets[]`, `heroCtaText`, `heroCtaUrl`
- [ ] **JBRSEO-ADMIN-2** — نص "مرحباً بك في مودونتي" في FeedContainer يأتي من الأدمن
  الحقول: `platformTagline` + `platformDescription`
  الملف الحالي: `modonty/components/feed/FeedContainer.tsx:27-28`

---

## 🔴 HIGH — Modonty: حسابات المستخدمين (يتطلب Resend)

> ✅ Resend جاهز — `modonty.com` verified على eu-west-1، `resend` مثبّت في modonty، `RESEND_FROM` محدّث في admin وmodonty.

- [x] اشترك في Resend (resend.com) واحصل على API key
- [x] أضف `RESEND_API_KEY` لـ `.env` + domain موثّق (`modonty.com`)
- [x] **USR-R1** — Password Reset (نسيت كلمة المرور) — صفحة + action + إيميل ✅ live tested
- [ ] **USR-R2** — Email Verification عند التسجيل — confirmation link
- [ ] **USR-R3** — Notification Settings (تفضيلات الإشعارات بالإيميل)
- [ ] **USR-L1** — إشعارات الرد على التعليق بالإيميل
- [ ] **USR-L2** — Session management: logout من أجهزة أخرى
- [ ] **USR-N1** — FAQ reply notification: صفحة الإشعارات تعرض "اختر رسالة" عند الضغط على `faq_reply` — تحتاج case خاص يجيب بيانات FAQ ويعرض السؤال والرد في الجانب الأيمن

---

## 🔴 HIGH — Modonty: Subscriptions & Email

- [ ] Welcome email عند الاشتراك في النشرة (`/api/subscribers`)
- [ ] إصلاح `/api/news/subscribe` — ربط بـ Resend
- [ ] اختبار Email delivery end-to-end قبل الإطلاق

---

## 🟡 MEDIUM — SEO

- [ ] **AUDIT-5** — bundle size 401kB → `pnpm build:analyze` + dynamic imports على المكونات الثقيلة *(مؤجل بقرار سابق)*
- [ ] **SEMR-7b** — fallback descriptions من الأدمن بدلاً من hardcoded: إضافة حقل `defaultDescription` في Settings + تحديث `getHomePageSeo`/`getCategoriesPageSeo`/`getClientsPageSeo`
- [ ] **SEO-A3** — `og:site_name` = اسم العميل أم "مودونتي"؟ ← يحتاج قرار
- [ ] **SEO-A4** — صورة المقال في JSON-LD بدون width/height — التحقق من Prisma Media model + إضافة الحقول
- [ ] **SEO-FC1** — Admin JSON-LD re-check: كل entity (Article, Category, Tag, Client, Author, Industry) عبر Google Rich Results Test
- [ ] **SEO-FC2** — Create flow: إنشاء article/tag/category → تحقق JSON-LD + sitemap + 200
- [ ] **SEO-FC3** — Update flow: تعديل title/description → تحقق revalidatePath + metadata محدّث + DB JSON-LD
- [ ] **SEO-FC4** — Delete flow: حذف → 404 + ليس في sitemap + لا broken links
- [ ] **SEO-FC5** — Metadata propagation: تغيير Site Name → cascade وصل لكل الكيانات
- [ ] **SEO-FC6** — `/robots.txt` + `/sitemap.xml` live test بعد كل push كبير

---

## 🟡 MEDIUM — Modonty: صفحات ناقصة

- [ ] بناء `/industries` listing page (cache موجود في `industriesPageMetaTags`)
- [ ] بناء `/articles` listing page (cache موجود في `articlesPageMetaTags`)

---

## 🟡 MEDIUM — Console: اختبار الـ Dashboard

> اختبار يدوي شامل للـ Console — مطلوب مرة واحدة قبل أول عميل حقيقي.

**Dashboard Overview:**
- [ ] **C1** عدد المشتركين صحيح
- [ ] **C2** عدد المقالات (منشورة + قيد الانتظار)
- [ ] **C3** المشاهدات (7 أيام) — رسم بياني يومي
- [ ] **C4** أفضل المقالات بالمشاهدات
- [ ] **C5** النشاط الأخير (تحويلات، تعليقات، مشتركون)

**Analytics:**
- [ ] **C7** المشاهدات (7 أيام + 30 يوم)
- [ ] **C10** متوسط وقت القراءة + عمق التمرير + معدل الارتداد
- [ ] **C11** أفضل المقالات (مشاهدات، تفاعل، تحويلات)
- [ ] **C12** نقرات CTA مفصّلة
- [ ] **C14** Core Web Vitals (LCP, CLS, INP)

**Leads:**
- [ ] **C15** قائمة العملاء مع شارة HOT/WARM/COLD
- [ ] **C16** النقاط 0-100 تظهر بشكل صحيح
- [ ] **C17** زر "Refresh Scores" يعمل

**Moderation:**
- [ ] **C22** التعليقات قيد الانتظار تظهر
- [ ] **C23** زرا الموافقة والرفض يعملان
- [ ] **C25** الأسئلة قيد الانتظار تظهر
- [ ] **C26-C28** نموذج الإجابة + الحفظ + الظهور في الموقع العام
- [ ] **C29-C30** رسائل نموذج التواصل + خيار "تم الرد"

---

## 🟡 MEDIUM — Modonty: Article Page UX (ناقص)

- [ ] **A7** — Badge "نسخة صوتية" بدون مشغل — إذا `article.audioUrl` موجود → audio player تحت العنوان مباشرة
- [ ] **A8** — TOC لا يُبرز القسم الحالي — Intersection Observer → active class على الـ TOC item
- [ ] **A9** — زر "اقرأ المزيد" بدون aria-label — `aria-label={\`اقرأ المزيد: ${article.title}\`}`
- [ ] **MB1** — نص النشرة ثابت — إضافة حقل `newsletterCtaText` في إعدادات العميل (admin) بقيمة افتراضية "اشترك الآن"

---

## 🟡 MEDIUM — Mobile Phase 2

> Mockup جاهز في `design-preview/page.tsx` — ينقل للـ production.

- [ ] **MOB1** — انقل bottom bar من `fixed bottom-16` إلى `sticky top-14`
- [ ] **MOB2** — أضف client avatar + "اسأل العميل" في Zone 1
- [ ] **MOB3** — أضف Newsletter trigger (🔔) في الشريط
- [ ] **MOB4** — أضف views (👁) + questions (❓) في meta row
- [ ] **MOB5** — Newsletter overlay على الصورة الرئيسية
- [ ] **MOB6** — حدّث الـ Sheet بالمحتوى الكامل
- [ ] **MOB7** — وحّد نص CTA: "اسأل العميل" في كل مكان

---

## 🟡 MEDIUM — Chatbot Phase 2

- [ ] **CHAT-FAQ1** — Admin: صفحة أسئلة المستخدمين مجمّعة حسب التكرار
- [ ] **CHAT-FAQ2** — Admin: زر "حوّل لـ FAQ" → ينشئ ArticleFAQ بضغطة زر
- [ ] **CHAT-FAQ3** — Admin: filter حسب الفئة / العميل / المصدر (DB / web)
- [ ] **CHAT-FAQ4** — Modonty: FAQ المحوَّلة تظهر على صفحة المقال للزوار

---

## 🟡 MEDIUM — SEO Infinite Scroll (بعد الإطلاق)

- [ ] **SEO-INF1** — دعم `/?page=N` في `page.tsx` — HTML مختلف لكل صفحة
- [ ] **SEO-INF2** — إضافة `<a>` links لـ "الصفحة التالية / السابقة" في نهاية الـ feed
- [ ] **SEO-INF3** — `pushState` في `InfiniteArticleList` يحدّث الـ URL عند كل batch
- [ ] **SEO-INF4** — canonical tag لكل `/?page=N` يشير لنفسه

---

## 🟢 LOW — JBRSEO تحسينات مستقبلية

- [ ] **JBRSEO-7** — صفحة `/about`: إضافة قسم "للشركات والأعمال"
- [ ] **JBRSEO-8** — Analytics: تتبع النقرات على جميع CTAs الموجهة لـ jbrseo.com

---

## 🟢 LOW — Admin: Nice to Have

- [ ] Centralize all toast messages in one JSON file
- [ ] Split view preview for articles
- [ ] Article templates (news, how-to, listicle)

---

## 🟢 LOW — Production Readiness (للإطلاق الرسمي)

- [ ] Rate limiting (Upstash Redis) — 100 req/min لـ subscribe، 10/min لـ contact
- [ ] Sentry error monitoring — free tier 5K events/month
- [ ] MongoDB Atlas automatic backups (7-day retention)
- [ ] Cloudinary auto-compression (`q_auto, f_auto, WebP`)
- [ ] Validate image file size عند الرفع (max 5MB, warn if >2MB)

---

## 🟢 LOW — Future Features

- [ ] DESIGNER role (Media-only access)
- [ ] Role-based route protection per role
- [ ] User action logging (who did what)
- [ ] AI content suggestions في الأدمن
