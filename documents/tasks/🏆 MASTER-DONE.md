# DONE — كل المهام المنجزة
> **آخر تحديث:** 2026-04-13
> ملف مرجعي جامع لكل ما أُنجز عبر تاريخ المشروع.
> مرتّب بأقسام — كل قسم يمثل منطقة عمل مستقلة.

---

## 0. Mobile UX — Live Audit (2026-04-13) — 18/18 مشكلة ✅

> **Source:** Live Playwright audit — 375×812px (iPhone) — جميع صفحات modonty.com
> **تم الإنجاز:** جلسة واحدة — 2026-04-13

- [x] **MOB-001** — Broken slug `/articles/م` — slug updated in DB + cache revalidated
- [x] **MOB-002** — Navbar congested on mobile — `hidden sm:flex` on CTA pill + 3-column grid
- [x] **MOB-003** — Article title overflows (mixed Arabic/English) — `break-words` on `<h1>` in article-header.tsx
- [x] **MOB-004** — Bottom nav covers page content — `pb-16 md:pb-0` on `<main>` in layout.tsx
- [x] **MOB-005** — Trending thumbnails missing — CLOSED (already vertical aspect-video cards)
- [x] **MOB-006** — Terms/Legal headings clipped — VERIFIED FIXED (wraps correctly)
- [x] **MOB-007** — Login page ~80px dead space — removed `min-h-screen`, replaced with `py-8 sm:py-24`
- [x] **MOB-008** — 404 missing bottom nav — VERIFIED FIXED (nav present)
- [x] **MOB-009** — Categories count label too small — `text-xs` → `text-sm` in EnhancedCategoryCard + CategoryListItem
- [x] **MOB-010** — FeaturedClientCard plain gray placeholder — gradient + large initials fallback
- [x] **MOB-011** — Article toolbar + login hint cramped — resolved via MOB-016 (`hideLoginHint`)
- [x] **MOB-012** — Search nav item no active state — MobileFooter → `"use client"` + `usePathname()`
- [x] **MOB-013** — (merged with MOB-018)
- [x] **MOB-014** — Subscribe page duplicate title — removed `CardTitle` from subscribe-form.tsx
- [x] **MOB-015** — About page no section dividers — `prose-h2:border-t prose-h2:pt-6 prose-h2:mt-8` on prose wrapper
- [x] **MOB-016** — Article floating toolbar overlaps bottom nav — `bottom-16` → `bottom-20` + `hideLoginHint`
- [x] **MOB-017** — FALSE POSITIVE — Arabic numerals rendering was correct
- [x] **MOB-018** — Trending card layout — CLOSED (vertical aspect-video already); added no-image IconArticle placeholder

**Perf pass (same session):**
- [x] `ssr: false` pattern — moved all `dynamic({ ssr: false })` calls to `client-lazy.tsx` (`"use client"` wrapper)
- [x] LeftSidebar parallel fetch — `Promise.all([getCategoriesWithCounts(), getCategoryAnalytics(), getOverallCategoryAnalytics()])`
- [x] 11 missing `loading.tsx` skeletons added (subscribe, profile, help, faq, feedback, terms, 4× legal, news/subscribe)

---

## 1. الأمان والبنية التحتية (Security & Infrastructure)

- [x] Auth + Zod + slug uniqueness على كل الكيانات (articles, clients, categories, tags, industries, authors, media, settings)
- [x] Auth على إدارة المستخدمين (create/update/delete admin)
- [x] Error boundaries: `error.tsx` موجود في كل الأقسام
- [x] Security headers في `next.config.ts` (HSTS, XSS, CSP, Frame-Options)
- [x] Rate limiting على كل Public API routes / Server Actions

---

## 2. Admin — المقالات (Articles)

### UI & Form
- [x] نموذج المقال: من 12 خطوة إلى 5 خطوات
- [x] Auto-save كل 30 ثانية في وضع التعديل
- [x] عداد الكلمات المباشر في footer المحرر
- [x] تحذير "تغييرات غير محفوظة" قبل مغادرة الصفحة (beforeunload — مُحكم وليس aggressive)
- [x] محرر TipTap المُحسَّن (20 أداة)
- [x] شريط التقدم: إصلاح من 56% → 60% كحد أدنى للنشر
- [x] بوابة النشر عند 60% SEO
- [x] إعادة تصميم قائمة المقالات (status tabs, compact stats, clean table)
- [x] إعادة تصميم صفحة التفاصيل (live preview)
- [x] إضافة TOC + Author Bio لصفحة العرض
- [x] إنشاء صفحة Technical منفصلة
- [x] حذف صفحة Preview القديمة
- [x] حذف Bulk Selection
- [x] حذف 30+ ملف dead code
- [x] Beta testing banner

### SEO & Logic
- [x] محلل SEO موحّد (نظام واحد، لا نظامين)
- [x] حذف فحوصات SEO الوهمية (filler checks)
- [x] إصلاح type guard في الـ normalizer
- [x] إصلاح JSON-LD validator
- [x] إصلاح media update revalidation
- [x] إصلاح redirect بعد التحديث
- [x] إصلاح SEO title truncation عند حدود الكلمة
- [x] SEO cascades (author/category/client/media)

### Security
- [x] Auth على كل المutations
- [x] Zod server-side validation
- [x] Slug uniqueness validation
- [x] XSS sanitization
- [x] Optimistic locking
- [x] Status machine transitions (draft → review → published)

### Testing
- [x] Playwright E2E tests (6 اختبارات)
- [x] Seed data محسّن (محتوى عربي غني + FAQs)

---

## 3. Admin — العملاء (Clients)

- [x] Auth على كل mutations
- [x] Zod server-side validation (client-server-schema.ts)
- [x] Slug uniqueness validation
- [x] إزالة Bulk delete
- [x] إصلاح Tax ID assignment bug
- [x] إصلاح JSON-LD @id/@type
- [x] Cascade: client update → article JSON-LD regeneration
- [x] إعادة تصميم كامل للـ UI
- [x] error.tsx boundary
- [x] واجهة عربية → إنجليزية (65+ label في 10 form components)

---

## 4. Admin — التصنيفات (Categories)

- [x] Auth على create/update/delete
- [x] Zod validation (category-server-schema.ts)
- [x] Slug uniqueness قبل الحفظ
- [x] error.tsx boundary
- [x] رسائل خطأ → إنجليزية
- [x] JSON-LD: Organization + WebSite في @graph
- [x] JSON-LD: Breadcrumb labels → إنجليزية
- [x] Metadata: alternates.languages (ar-SA)
- [x] CRUD كامل
- [x] تسلسل هرمي للتصنيفات الأب + tree view
- [x] JSON-LD (CollectionPage) + metadata cache
- [x] Cascade إلى المقالات عند التحديث
- [x] حماية الحذف (يمنع الحذف إذا عنده مقالات أو أبناء)
- [x] SEO health gauge
- [x] Loading skeletons
- [x] CSV export
- [x] Batch SEO regeneration

---

## 5. Admin — الوسوم (Tags)

- [x] Auth على create/update/delete
- [x] Zod validation (tag-server-schema.ts)
- [x] Slug uniqueness قبل الحفظ
- [x] error.tsx boundary
- [x] رسائل خطأ → إنجليزية
- [x] JSON-LD: Organization + WebSite في @graph
- [x] JSON-LD: Breadcrumb labels → إنجليزية
- [x] Metadata: alternates.languages (ar-SA)
- [x] CRUD كامل
- [x] JSON-LD (CollectionPage + DefinedTerm + BreadcrumbList)
- [x] Metadata cache + listing cache regeneration
- [x] Delete protection (يمنع الحذف إذا عنده مقالات)
- [x] SEO health gauge
- [x] Loading skeletons
- [x] Revalidate SEO buttons (single + batch)

---

## 6. Admin — الوسائط (Media)

- [x] إعادة تصميم Header
- [x] إعادة تصميم Grid مع تجميع بالعميل
- [x] Upload page — 3-column grid
- [x] EXIF removal عند الرفع
- [x] Image SEO (alt text, JSON-LD creditText/copyrightHolder)
- [x] Image sitemap
- [x] Search + pagination
- [x] Usage indicator
- [x] إعادة تصميم Edit form
- [x] Empty state
- [x] إزالة Bulk delete
- [x] إصلاح Featured Image preview: `object-cover` → `object-contain` (admin v0.28.0)

---

## 7. Admin — الإعدادات (Settings)

- [x] واجهة عربية → إنجليزية (Arabic labels → English)
- [x] Settings change → auto-cascade إلى كل الكيانات (v0.17.0)
- [x] Slug box ظاهر في كل نماذج الكيانات (categories, tags, industries, authors)
- [x] Social media URLs: من env vars إلى DB (getPlatformSocialLinks())
- [x] Industry cascade to clients

---

## 8. Admin — النظام العام

- [x] Toast UI: رسائل عربية، أيقونات، ألوان، auto-dismiss
- [x] Arabic tooltips + SEO analyzer messages
- [x] Changelog + team notes system
- [x] Feedback banner (Send Note → DB + email)
- [x] Bulk SEO fix لمقالات ذات نقاط منخفضة (SEO Overview page)
- [x] Industry cascade to clients
- [x] Seed data محسّن

---

## 9. Modonty — الصفحة الرئيسية والعامة (Public Site)

- [x] **HP1** — `/articles` كانت تعطي 404 → redirect 308 إلى `/`
- [x] **HP2** — إضافة تعريف المنصة للزائر الجديد فوق الـ feed
- [x] **HP3** — قسم "جديد مودونتي" يختفي إذا كان فارغاً (`articles.length === 0 → null`)
- [x] **HP4** — بطاقات المقالات: placeholder `bg-muted` + IconArticle إذا لا توجد صورة
- [x] **G1** — JWTSessionError في Console: `AUTH_SECRET` جديد + NEXTAUTH_URL صُحّح
- [x] **G2** — Footer quick links: الرئيسية / الرائجة / العملاء / عن مودونتي
- [x] **G3** — نشرة الاشتراك: error state + "جاري الاشتراك..." في newsletter-cta.tsx
- [x] Domain redirect: 307 → 308 من Vercel Dashboard
- [x] Loading pages: 11 ملف جديد (about, contact, legal, login, authors/[slug], notifications, favorites, liked, disliked, comments, following)

---

## 10. Modonty — صفحة المقال (Article Page)

- [x] **A1** — نص المقال في المنتصف → `text-right` + `direction: rtl`
- [x] **A2** — أقسام مخفية → التعليقات + مقالات ذات صلة + المزيد من Modonty/العميل مفتوحة
- [x] **A3** — ترتيب Sidebar الأيمن خاطئ → الترتيب الصح: Author card → TOC → Newsletter
- [x] **A4** — Sidebars تختفي وتترك فراغاً → `sticky top-[3.5rem] self-start h-[calc(100vh-4rem)]`
- [x] **A5** — زر "اسأل العميل" نص ثابت → ديناميكي `اسأل {clientName} مباشرةً` + لون amber
- [x] **A6** — شريط تقدم القراءة → كان مفعّلاً بالفعل في `page.tsx`
- [x] **M1** — Breadcrumb على الموبايل سطرين → `overflow-hidden` + `truncate` على 390px
- [x] صورة المقال — فراغ فوق وتحت → `object-cover` متطابق مع guidelines 16:9

---

## 11. Modonty — SEO Technical

### إصلاحات SEMrush الأساسية
- [x] **SEMR-1** — 93 رابط داخلي مكسور → بناء `/tags/[slug]` page كاملة (v1.29.0)
- [x] **SEMR-2** — 85 structured data item خاطئة → `fixAtKeywordsDeep()` recursive في `jsonld-processor.ts` + regenerate 23 مقال على production
- [x] **SEMR-2B** — 113 Breadcrumb خاطئة → حذف HTML microdata من `breadcrumb.tsx` — JSON-LD فقط (v1.29.6) · مؤكد: Google Rich Results Test → 0 errors
- [x] **SEMR-3** — 1,430 resource محجوب في robots.txt → حذف `/_next/` من قاعدة `*` (v1.29.0)
- [x] **SEMR-4** — 10 صفحات 4XX → بناء `/tags` index page كاملة (v1.29.0)
- [x] **SEMR-5** — 10 صفحات خاطئة في sitemap → إضافة `/tags` + كل `/tags/[slug]` لـ sitemap.ts
- [x] **SEMR-6** — 15 صفحة title طويل → max(51) في admin schemas + slice(0,51) على modonty fallbacks
- [x] **SEMR-7** — 3 صفحات بدون meta description → fallback descriptions ثابتة في 3 صفحات
- [x] **SEMR-8** — 5 صفحات بـ H1 مكرر → حذف sr-only h1 الزائد + FeedContainer h1→h2
- [x] **SEMR-9** — 7 روابط خارجية مكسورة → استبدال كل الروابط الوهمية بروابط مودونتي الحقيقية + twitter.com→x.com
- [x] **SEMR-10** — 20 رابط بدون anchor text → `aria-label` على links + `aria-hidden` على spans
- [x] **SEMR-11** — 9 صفحات orphan (رابط واحد فقط) → إضافة روابط داخلية من صفحات ذات صلة
- [x] **SEMR-12** — 12 URL تعمل redirect دائم → إصلاح جذري للـ canonical

### إصلاحات Audit إضافية
- [x] **AUDIT-1** — Homepage بدون H1 → `<h1 className="sr-only">مودونتي — منصة المحتوى العربي</h1>` (v1.29.0)
- [x] **AUDIT-2** — Response time 1.88s → `cacheLife("hours")` + parallel fetch + cached helper (v1.29.x)
- [x] **AUDIT-3** — Language not detected → ليست مشكلة حقيقية. `lang="ar" dir="rtl"` موجود
- [x] **AUDIT-4** — Backlink spam من linkbooster → disavow file جاهز (لا يُرفع إلا عند Manual Action)

### إصلاحات الـ Canonical (www)
- [x] 9 صفحات خاطئة في sitemap (non-www → www) → تغيير جميع fallbacks في 15 ملف (v1.29.7)
- [x] 4 روابط داخلية مكسورة + 1 صفحة 4XX → إنشاء `app/legal/page.tsx` + إضافة للـ sitemap (v1.29.8)
- [x] 2 hreflang conflicts → محلول بـ www fix (v1.29.7)
- [x] 1 hreflang redirect (308) على /tags → محلول بـ www fix (v1.29.7)
- [x] AI-BOT-1/2/3 → لا مشكلة. `/users/login/` و `/users/profile/` محجوبتان عمداً — صحيح

---

## 12. Modonty — Semantic HTML

- [x] **SEM-1a→g** — 7 صفحات: إزالة `<main>` وإحلال `<div>` (لأن root layout عنده main)
- [x] **SEM-2a** — `clients/page.tsx` → `<h1 sr-only>العملاء</h1>`
- [x] **SEM-2b** — `categories/page.tsx` → `<h1 sr-only>التصنيفات</h1>`
- [x] **SEM-2c** — `users/profile/page.tsx` → `<h1 sr-only>الملف الشخصي</h1>`
- [x] **SEM-2d→i** — 6 صفحات profile (favorites, liked, comments, following, disliked, settings) → sr-only h1 مضاف
- [x] **SEM-3a** — `authors/[slug]/page.tsx` → `aria-labelledby="author-articles-heading"`
- [x] **SEM-3b** — `news/page.tsx` → `aria-labelledby="news-articles-heading"`
- [x] **SEM-4** — `MobileFooter.tsx` → `aria-label="التنقل السفلي"`
- [x] **SEM-5a→i** — 9 error.tsx جديدة (clients, categories, authors/[slug], trending, subscribe, users/profile, users/login, help, help/faq)
- [x] **SEM-6a** — `LeftSidebar.tsx` → `aria-label="الشريط الجانبي الأيسر"`
- [x] **SEM-6b** — `RightSidebar.tsx` → `aria-label="الشريط الجانبي الأيمن"`
- [x] **SEM-6c** — `SidebarSkeletons.tsx` → `aria-hidden="true"` على كلا الـ skeletons

---

## 13. Modonty — الشات بوت (Chatbot)

- [x] **CHAT-1** — "اسأل العميل" بعد جواب الذكاء الاصطناعي → بطاقة gradient مع زرَّي "اقرأ المقال" و"اسأل العميل"
- [x] **CHAT-2** — اقتراح ذكي للفئة من أول رسالة → Cohere embed + cosine similarity → UI تأكيد مع category icon
- [x] **CHAT-3** — جواب الويب → بطاقة أقرب مقال (أعلى مشاهدات في الفئة)
- [x] **CHAT-4** — Trusted sources filter + UNTRUSTED_DOMAINS blacklist
- [x] **CHAT-5** — Hard test 8 cases — كلها نجحت. Bugs مُصلحة: scope threshold، empty message filter، trusted domains
- [x] Category-scoped chatbot — `api/chatbot/chat/route.ts`
- [x] Article-scoped chatbot — `api/articles/[slug]/chat/route.ts`
- [x] RAG pipeline (Cohere + rerank) — `lib/rag/`
- [x] Serper fallback (web search) — `lib/serper.ts`
- [x] Out-of-scope detection — `lib/rag/scope.ts`
- [x] Streaming (NDJSON)
- [x] Chat history في DB — `lib/chat/save-chatbot-message.ts`
- [x] History UI — `ChatHistoryList.tsx`
- [x] Prompt Engineering — 4 prompts قوية (category DB/web + article DB/web)

---

## 14. Modonty — حسابات المستخدمين (User Accounts)

- [x] **USR-B1** — المظهر + التفضيلات يعرضان نفس الكومبوننت → دُمجا في case واحد
- [x] **USR-B3** — حقل Bio: schema + action + JWT session + عرض في الملف الشخصي
- [x] **USR-U1** — Settings tabs مُبسَّطة من 7 إلى 4 (الملف الشخصي · الأمان · المظهر · الحساب)
- [x] **USR-U4** — Badge الإشعارات stale → `BellRevalidateTrigger` في notifications page
- [x] **USR-B5** — تاب "غير المعجبة" حُذف من profile-tabs.tsx، الـ grid من 6 إلى 5
- [x] **USR-BUG** — `replyToQuestion` في console لم تُنشئ إشعار → أُضيفت notification creation لـ faq_reply

---

## 15. Modonty — التفاعل والتحليلات (Analytics & Interactions)

### إصلاحات البيانات
- [x] تغيير حالة التعليق الجديد من "موافق تلقائياً" → "قيد الانتظار"
- [x] تحويل صفحة `/subscribe` للاستدعاء الصحيح
- [x] إضافة حد أقصى للإرسال لكل مستخدم
- [x] إضافة حد أقصى للمشاركة لكل مستخدم

### اختبارات Analytics المؤكدة
- [x] قراءة مقالة 30 ثانية + تمرير 70%+ → `timeOnPage` و`scrollDepth` محدّثان في DB
- [x] إعجاب/إلغاء إعجاب → toggle يعمل صح
- [x] إعجاب + عدم إعجاب → لا يمكن الاثنان معاً
- [x] مفضلة → تُحفظ وتبقى بعد إعادة التحميل
- [x] مشاركة عبر Twitter، WhatsApp، نسخ الرابط → كل منصة تُسجَّل بشكل مستقل
- [x] تعليق جديد → حالة PENDING في DB
- [x] رد على تعليق → `parentId` صحيح
- [x] إعجاب على تعليق → `commentLike` في DB
- [x] متابعة/إلغاء متابعة → تبقى بعد إعادة التحميل
- [x] نموذج "اسأل العميل" → `articleFAQ` بحالة PENDING، ثم يظهر بعد الرد
- [x] نموذج تواصل → "تم إرسال رسالتك بنجاح"
- [x] اشتراك في النشرة → نجاح + duplicate protection

---

## 16. Modonty — JBRSEO CTAs

- [x] **JBRSEO-1** — Header CTA "عملاء بلا إعلانات ↗" — ديسكتوب + موبايل
- [x] **JBRSEO-2** — `/clients` CTA panel gradient في نهاية الصفحة
- [x] **JBRSEO-3** — ClientsHero إعادة تصميم بعمودين B2C + B2B + نصوص SEO
- [x] **JBRSEO-4** — Footer CTA "هل تريد عملاء من جوجل بلا إعلانات؟ جبر SEO ↗"
- [x] **JBRSEO-5** — Client page CTA "أعجبك ما رأيت؟" في نهاية كل صفحة عميل
- [x] **JBRSEO-6** — Article footer CTA "تريد محتوى مثل هذا يجذب عملاء؟"

---

## 17. Console — إصلاحات البيانات

- [x] **BUG-01** — توزيع عمق التمرير = 0% → إصلاح معادلة حساب الـ buckets
- [x] **BUG-02** — وقت القراءة = 0 ثانية دائماً → إصلاح aggregation من DB
- [x] **BUG-03** — التحويلات تظهر 0 رغم وجود بيانات → إصلاح query
- [x] **BUG-04** — إحصائية الأسئلة: الإجمالي=1 لكن الجدول=8 → توحيد مصدر البيانات
- [x] **BUG-05** — Return Rate: معادلة خاطئة → إصلاح الحساب
- [x] **BUG-06** — المستخدمون النشطون يتأثر بـ null sessionId → إضافة null filter
- [x] **BUG-07** — فارق في المشاهدات: Dashboard=19 vs Analytics=20 → توحيد المصدر
- [x] **BUG-08** — لا يوجد قسم CTA Clicks → إضافة القسم
- [x] **BUG-09** — Engagement Score يفقد 35% من مكوناته → إصلاح الحساب الكامل

---

## 18. Brand Compliance

- [x] **BR1-4** — فحص 432 ملف، 66 violation في 24 ملف → كلها محوّلة لـ `text-primary` / `bg-primary/10` / `text-accent` / `text-destructive`

---

## 19. SEO JSON-LD (Structured Data)

- [x] **SEO-A1** — Breadcrumb JSON-LD مضاف لصفحة المقال
- [x] **SEO-A2** — JSON-LD fallback للمقالات بدون DB cache → `generateArticleStructuredData` live fallback
- [x] **SEO-IMG1** — صور المقالات في sitemap.ts عبر `images[]` property
- [x] Organization + WebSite JSON-LD في كل الصفحات
- [x] Person (Author) JSON-LD في صفحات الكتّاب
- [x] FAQPage JSON-LD للمقالات التي فيها أسئلة
- [x] مؤكد بـ Google Rich Results Test: **7 valid items — 0 errors — 0 warnings**

---

## ملاحظة للمرجعية

> كل ما فوق تم نشره على production وهو يعمل الآن على modonty.com، admin.modonty.com، وconsole.modonty.com.
> آخر إصدار مُنجز: **admin v0.29.0 | modonty v1.29.8** (2026-04-11)
