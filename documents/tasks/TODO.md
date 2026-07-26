# ✅ TODO — ملف المهام الوحيد (مرقّم — أعطني الرقم فقط)

> **القاعدة (خالد 2026-07-08):** هذا هو ملف الـ TODO الوحيد. أي مهمة/«reminder»/بند مريم يدخل هنا. ممنوع ملف TODO جديد.
> **ما ليس TODO يبقى بمكانه:** `documents/reels/` · `documents/content-team/` · المراجع · `documents/tasks/CLAUDE.md` · SESSION-LOG.
> **الأرقام مرجعية ثابتة** بيني وبين خالد — البند المنجز يُحذف والباقي يبقى برقمه (بلا إعادة ترقيم).

**Last Updated: 2026-07-27** (بند 45: دمج Tag + Category + Industry — الثلاثة مبنية + تست حي محلي ناجح 100%، بانتظار push. متبقّي: تست أب/ابن التصنيف + push)

---

## 🔴 كبير — مشاريع + قرارات
- [ ] **10.** مراجعة سكيما شاملة + سياسة تكلفة مونجو (خالد 2026-07-24): جرد نمو الجداول · تداخل GA4 (دفع مزدوج) · فهارس TTL (`sessions`/`system_errors`/`audit_logs`) · فهارس زائدة · موديلات ميتة (`SeoIntake`/`JbrseoSubscriber`/`Subscriber` vs `NewsSubscriber`/`intake_*`) · حقول JSON منتفخة. المخرجات: تقرير جرد + سياسة احتفاظ + سكربت TTL (mongosh، إنتاج بإذن + باكب). **⚠️ بلا حذف حتى نراجع سوا** ([[feedback_check_datalayer_env]]).
- [ ] **11.** صلاحيات الأدمن لكل دور (الثغرة الحادّة انسدّت: `checkAdmin`+`proxy.ts` = طاقم نشط فقط). كل الأدوار تشوف كل شي، وعمليات الفلوس (`createInvoice`/`mark-paid`) بـ`auth()` لا role-gate. الخطة `ADMIN-PERMISSIONS-PLAN-v1.html` — خالد يقفل ٥ قرارات.
- [ ] **12.** «المهتمون» — قرارات + بناء: توحيد الموديلات الثلاثة (`NewsSubscriber`/`Subscriber`/`JbrseoSubscriber`) · حذف بوكس نشرة المقال · واجهة إطلاق الحملة بالأدمن · مفتاح الحملات في `notificationPreferences` + تشيك بوكس التسجيل (غير مؤشّر افتراضياً — GDPR/PDPL) + استعلام الاستهداف.
- [ ] **13.** GEO/AEO — التنفيذ (`GEO-AEO-AUDIT-2026-07-13.html`): سكور AEO (مرحلة ٢) · قياس AI referrals (classify-source + enum) · تقرير Bing · hreflang يُستبدل لا يُورَّث. (شُطبت جزئية «PII في /users/[id]» — الراوت غير موجود.)
- [ ] **14.** الريلز — الجهة الإدارية (مركونة): reels→GA4 · تست رفع الكونسول · موافقة الأدمن · ترحيل gallery القديمة · مرحلة الفيديو · قرار الكوتا. `documents/reels/`.
- [ ] **15.** تيليقرام: `leadHigh` **محجوب** (لا lead-scoring في مودونتي بعد) — `campaignInterest` صار مربوطاً. + مرآة الأدمن الكاملة + سجل أحداث موحّد. (22/26 يعمل.)
- [ ] **16.** معرض العميل — راوت مستقل + تخزين أوفر: راوت يعرض معرض كل عميل (إضافة+حذف) · شيله من `/media` (بلا كسر `/seo-images`) · نقله لـ Bunny.
- [ ] **17.** دفع بقية الدفعة الثانية: كونسول (gallery→Bunny يحتاج نموذج Reel) + مودونتي (geo tracking + booking_submit + reels) + نماذج Reels بالسكيما. 🔔 قبل أي دفع modonty: Lighthouse + GZIP + الباندل.

## 🔴 دمج الكيانات (Tag/Category/Industry) + تحويل 308
- [ ] **45.** **دمج/نقل كيان → آخر ثم حذف المصدر** (Tag→Tag · Category→Category · Industry→Industry). الخطورة: الروابط + السيو + JSON-LD.
  - [x] **خطوة 1 — آلية الـ308 (مبنية، tsc modonty صفر أخطاء):** موديل `Redirect{section,fromSlug,toSlug,@@unique}` · كاش قراءة fail-closed في `modonty/lib/archive-cache.ts` (`lookupRedirect`) · سطر في `modonty/proxy.ts` (يُفحص **بعد** isLive قبل الـ410) → `NextResponse.redirect(new URL(...), 308)`. **308 متحقّق من 4 مصادر رسمية:** RFC 7538 · MDN · Google Search Central (301≡308) · Next.js Docs. **بانتظار تست حي + push.**
  - [x] **خطوة 2 — فيتشر الدمج بالأدمن (Tag): مبني + تست حي محلي ناجح (2026-07-27) — بانتظار tsc + push.** `recordRedirect()` مع كسر السلاسل (`admin/lib/redirect/record-redirect.ts`) · محرك الدمج 3 أكشنات (`admin/app/(dashboard)/tags/actions/merge-tag-actions.ts`): `prepareTagMerge` (transaction: dedup على `@@unique[articleId,tagId]` + نقل + كتابة 308 + audit `tag.merge`) → `regenerateArticleSeoForMerge` (لكل مقال، idempotent) → `finalizeTagMerge` (SEO الوجهة+المصدر + listing + revalidate) + `getTagMergeImpact` (أرقام حقيقية للمعاينة) · UI: زر GitMerge بنفسجي + `tag-merge-dialog.tsx` — **عمودين** (يمين: المصدر←الوجهة + dropdown بحث · يسار: معاينة الأثر + بوابة كتابة اسم المصدر) + progress مقالاً مقالاً + شاشة اكتمال، المصدر يصير صفر ويحذفه خالد من الجدول. الموكاب المعتمد: `documents/tasks/merge-dialog-mockup-v1.html`.
    - **✅ تست حي محلي (modonty_dev، بورت 3000):** دمج `seo-tag-test` (٦ مقالات) → `SEO` الحقيقي: نُقلت ٦ (١٢←١٨) · ٠ مكرّر · أُعيد توليد SEO+JSON-LD لـ٦ · **308 اتسجّل** · المصدر صار ٠ مقال. الدائرة كاملة تعمل.
    - **حراسة الجدول:** زر Delete مقفول ما دام `count>0` (لازم دمج أولاً) · الوسم بصفر مقال = بادج amber «0 · Empty» (لون مميّز، معيار الأدمن).
    - **✅ تحقّق على مستوى المقال (2026-07-27):** دمج «أدوات»(1)→«Google» → محرّر المقال `6a60a5dd` يعرض وسومه = Google·SEO·محتوى (أدوات اختفى، Google أُضيف). أدوات صار Empty · 308 `tools-tag-test→google-tag-test`. **الدمج مؤكّد 100%.**
    - **✅ عدّاد الوسم — وُحِّد (2026-07-27، مو كاش):** كان التضارب (قائمة=5 مقابل تفاصيل=4) لأن `tag-view.tsx` يعدّ **المنشور فقط** (`publishedArticlesCount`) بينما القائمة تعدّ **كل** الروابط (`_count.articles`). أُصلح: التفاصيل تعرض `totalArticlesCount` (الكل، مطابق للقائمة + بوابة الحذف/الدمج) + «(N published)» ثانوي. **الدمج نفسه كان dedup صحيح** (المقال كان أصلاً موسوماً بالوجهة → اتحذف رابط المصدر المكرّر، صفر فقدان).
    - **⚠️ قبل التست/الدمج على الإنتاج:** `prisma db push` لإنشاء مجموعة `redirects` + فهرس `@@unique([section,fromSlug])` على الإنتاج (مجموعة جديدة فارغة، بلا backfill؛ باكب أولاً).
  - [x] **خطوة 3أ — تعميم على Category: مبني + تست حي محلي ناجح 100% (2026-07-27) — بانتظار push.** `merge-category-actions.ts` (getCategoryMergeImpact · prepareCategoryMerge [transaction: `article.updateMany` categoryId مصدر→وجهة **بلا dedup** لأن التصنيف مفرد + `category.updateMany` parentId لإعادة ربط الأبناء + 308 «categories» + audit `category.merge` + **حجب الدمج في حفيد** لمنع دورات الهرمية] · finalizeCategoryMerge) · يعيد استخدام `regenerateArticleSeoForMerge` (JSON-LD المقال يحمل `articleSection`=اسم التصنيف) · `category-merge-dialog.tsx` (نفس ديالوج الوسم + سطر «تصنيف فرعي يُعاد ربطه») · قفل حذف على المقالات **أو** الأبناء (`get-categories` أضاف `_count.children`) · amber «0 · Empty». **تست حي:** العقارات(1)→السيو SEO: المقال «شركات مقاولات» تصنيفه صار السيو SEO [selected] · العقارات=0 · السيو=15→16 · 308 مُسجّل. **ملاحظة:** إعادة ربط الأبناء مبنية+محمية لكن ما تفعّلت حياً (لا مصدر تجريبي عنده أبناء). عدّاد التصنيف نظيف أصلاً (بلا إصلاح مثل الوسم).
    - [ ] **⏳ تست معلّق (أب/ابن في دمج التصنيف الواحد):** إعادة ربط الأبناء (`parentId` مصدر→وجهة) مبنية ومحمية لكن **ما اختُبرت حياً**. لاحقاً: أنشئ تصنيفاً فرعياً تحت مصدر ثم ادمج المصدر → تأكّد أن الابن صار تحت الوجهة، والمصدر انفرغ من الأبناء وصار قابلاً للحذف، وأن الابن ما يحتاج إعادة توليد سيو (breadcrumb مسطّح، مؤكَّد).
  - [x] **خطوة 3ب — تعميم على Industry: مبني + تست حي محلي ناجح 100% (2026-07-27) — بانتظار push.** `merge-industry-actions.ts` (getIndustryMergeImpact · prepareIndustryMerge [transaction: `client.updateMany` industryId مصدر→وجهة **بلا dedup** + 308 «industries» + audit `industry.merge`؛ **بلا أبناء** — الصناعة مسطّحة] · `regenerateClientSeoForMerge` [يعيد توليد سيو **العميل** عبر `generateClientSeoBundle` المشترك — knowsAbout يحمل اسم الصناعة] · finalizeIndustryMerge) · `industry-merge-dialog.tsx` (بصيغة «عميل») · قفل حذف على العملاء · amber. **حاسم:** اسم الصناعة يدخل JSON-LD **العميل فقط** (knowsAbout)، و**لا يظهر في Organization node داخل المقال** → **صفر تشعّب لمقالات العميل** (تُحُقّق من `knowledge-graph-generator.ts:507-574`). **تست حي:** العقارات والتطوير(1)→التجارة الإلكترونية: عميل «شركة جبر الجنوبية» صناعته صارت التجارة الإلكترونية [محرّر العميل] · العقارات=0 · التجارة=2→3 · 308 مُسجّل.

## 🟢 الباك لوق — مؤجّل (مشاريع/قرارات/أفكار)
- [ ] **18.** جلسة فريق المحتوى — 7/11 قرار مفتوح. `CONTENT-TEAM-BRAINSTORM-v1.html`.
- [ ] **19.** نظام الروابط المختصرة — 9 مراحل + 3 قرارات (git: `SHORT-LINK-SYSTEM-TODO.md`). **يشمل QR لكل عميل** (QR = تمثيل بصري لرابط مختصر، نفس البنية التحتية).
- [ ] **20.** جرد الإيميلات الشامل — كل trigger/قالب عبر الثلاثة + Resend (حوافز النشرة الست «قريباً»).
- [ ] **21.** مُراجِع YMYL — الطبيب الموافق بالكونسول = المُراجِع (`reviewedById`). المؤجل: MEDICAL-YMYL (~32س). `YMYL-FLOW-DISCUSSION.md`.
- [ ] **22.** صيانة DB داخل Run-All (تنفيذ decay): Analytics/ArticleView (365ي) · إشعارات (30ي) · articleBodyText · NewsSubscriber ملغي (6ش) · Conversion/CampaignTracking · العدادات · يتيمة. **⚠️ ينفّذ ضمن سياسة الاحتفاظ الموحّدة التي يقرّرها البند ١٠ (لا سياستين متضاربتين).**
- [ ] **23.** إعادة تصميم بوابة جودة المقال — قائمة الكاش تكذب + خلط «محسوب» و«ناقص».
- [ ] **24.** Hero 1200×630: رفع القديمة 6:1 + كروبر الكونسول + `hero-cover.tsx` (3:1→6:1).
- [ ] **25.** روابط داخلية سياقية داخل جسم المقال (سيو داخلي).
- [ ] **27.** مراجعة خبير لكلمات الرئيسية (homepage) بعد النشر.
- [ ] **28.** Google Reviews للـ Premium — Places API (بلا AggregateRating + بلا كاش).
- [ ] **29.** نظام Reviews لمودونتي (آراء العملاء على modonty.com).
- [ ] **30.** تدقيق فاتورة Vercel — `vc> audit`.
- [ ] **31.** بطاقة عروض الشركاء — MediaType OFFER + قرار validUntil.
- [ ] **34.** إعادة تصميم صفحة العميل بالأدمن + intake للقراءة + نشاط العميل.
- [ ] **37.** قسم خدمات العميل — موديل ClientService.
- [ ] **38.** تدقيقات تنظيف JSON-LD: حذف `Client.keywords` (~33 موقع) · بطاقة ClientKeyword بالمحرر · إيقاف بثّ الوسوم كـ keywords · حذف isAccessibleForFree · تكرار التواريخ.
- [ ] **40.** تدقيق الكود الميت — يدوي، «شك واحد = احتفظ».
- [ ] **41.** بنود Client Edit / Impersonation المعلقة (git: `CLIENT-EDIT-IMPERSONATION-PENDING.md`).
- [ ] **42.** تحقق المشاريع القديمة الكبيرة — CLIENT-PAGE-FULLSITE · CLIENTS-TODO · STORY-PAGE · SUBSCRIBER-TO-CLIENT-CONVERSION (git history).
- [x] **44.** ربط العميل بالكاتب (Editor) — **مبني + تست حي ناجح، بانتظار push** (2026-07-26). المنفّذ: `Client.editorId → Staff` (علاقة `StaffEditorClients`) · اختيار الكاتب في **الشريط السفلي الثابت** لتعديل العميل + في نموذج الإنشاء · عمود Editor في **جدول العملاء** + **جدول المقالات** (موروث من العميل) + فلتر pills بالكاتب (All/كاتب/No editor). **بلا** skills/Categories (خالد ألغاها — تعقيد زائد). خارج JSON-LD، الناشر يبقى مدوّنتي. أُنشئ كاتب تست `editor-test@modonty-test.local` (EDITOR) للتست على الإنتاج. + **جدول المقالات هُوجِر لمعيار الأدمن**: `DataTable` المشترك (#3) بدل الجدول اليدوي + فلتر الكاتب بـ`CountTab` المشترك (#1، رُفِع لـ`components/admin/count-tab.tsx`). tsc admin صفر أخطاء · console صفر أخطاء.
- [ ] **43.** استثمار `admin/lib/gsc/indexing.ts` (كود يتيم — لا نحذفه). **ما هو:** غلاف Google Indexing API v3 (`requestIndexing` URL_UPDATED · `notifyDeleted` URL_DELETED + نسخ batch + `getRemovalMetadata`). مناديه انحُذفوا سابقاً لأن الـ API الرسمي مقصور على `JobPosting` + `BroadcastEvent` فقط (لا صفحات عامة) — مؤكَّد من مصادر Google. **كيف نستفيد منه مستقبلاً (يا تيم):** (أ) لو أضفنا نوع محتوى **وظائف/فعاليات** لأي عميل → نربطه فوراً لفهرسة فورية شرعية. (ب) `getRemovalMetadata` (read-only، كوتا منفصلة) يصلح كـ«هل أرسلنا هذا الـ URL للحذف؟» فحص تدقيقي بلا استهلاك كوتا الكتابة. (ج) قالب جاهز (JWT + scope + batch concurrency) لأي Google API كتابة قادم. **قبل أي تفعيل:** تأكيد أن نوع المحتوى ضمن ما يسمح به الـ API (وإلا يُفلتر بصمت).

---

## 📌 قواعد التشغيل
- كل بند له **رقم مرجعي ثابت** — خالد يعطي الرقم فقط. المنجز يُحذف والباقي يبقى برقمه.
- «reminder X» → يُضاف فوراً كبند مرقّم هنا.
- تقارير مريم → بنودها المفتوحة تدخل هنا.
- ملاحظات التست الحي → `documents/tasks/CLAUDE.md` (خام)، والقابل للتنفيذ ينتقل هنا.
- أي بند يخلص → **يُحذف** (بلا قسم Done، بلا حشو) + تحديث Last Updated.
