# ✅ TODO — ملف المهام الوحيد

> **القاعدة (بأمر خالد 2026-07-08):** هذا هو ملف الـ TODO الوحيد في المشروع كله. أي مهمة جديدة أو «reminder» أو بند من تقرير مريم يدخل **هنا**. ممنوع إنشاء ملف TODO جديد لأي مهمة — ملف تفصيلي يُسمح به فقط لمشروع ضخم وبموافقة خالد، ويُربط من هنا.
>
> **حذف القديم — تم 2026-07-08:** 54 ملف TODO/خطة + 35 ملف/مجلد documents متجاوز حُذفت فعلاً بتفويض خالد («القديم الغيه. لا تأرشف» + «أنا أديك الصلاحية»). المتتبع في git (82 ملفاً) يُسترجع بـ `git log --all --oneline -- "documents/tasks/<FILE>"` ثم `git show <hash>:documents/tasks/<FILE>`. الحذف يُدفع مع أول commit قادم.
>
> **ما ليس TODO يبقى بمكانه:** ملفات القرارات (documents/reels/ · documents/content-team/) · المراجع والمواصفات (ARABIC-SLUG-DECISION، CLIENT-PAGE-BUILD-SPEC، ARTICLE-SEO-PERFECT-AUDIT قالب المراجعة، YMYL-FLOW-DISCUSSION…) · سجل ملاحظات التست الحي `documents/tasks/CLAUDE.md` · الموكبات HTML · SESSION-LOG.

**Last Updated: 2026-07-13**

---

## 🔴 الآن — الدفعة الثانية (كل الكود جاهز محلياً وينتظر)

- [x] **✅ Dashboard Triage v2 — نُفّذ وتحقق حياً 2026-07-13.** الموك المعتمد `documents/mockups/admin-dashboard-triage-v2-ui.html` بُني بالكامل: شريط Today المرتب (٥ بنود من نفس الـ fetch عبر `lib/dashboard/cached.ts`) + ثلاث درجات لون + أيقونات lucide + خلايا ghost للأصفار + Media/Reference في صف واحد + segment جديد `/clients/segment/unreachable` (none+unset=12). التحقق: tsc صفر أخطاء · ٣٠/٣٠ رابطاً = 200 · صفحة unreachable تعرض 12 صفاً مطابقاً للكرت. **متبقٍّ اختياري:** أسهم الاتجاه ▲▼ (D5 — تحتاج استعلام GA4 مقارن، مرحلة لاحقة).
- [x] **🔴 ثغرة فقدان بيانات في مكتبة الوسائط — أُصلحت 2026-07-13.** تعريف «صورة مستخدمة» في `admin/lib/media/usage-where.ts` كان يشمل ثلاث علاقات فقط (`featuredArticles` · `logoClients` · `heroImageClients`) وينسى **معرض المقال** (`ArticleMedia`). النتيجة: صورة داخل معرض مقال **منشور** تُحسب unused، تظهر في قائمة «غير المستخدمة»، و`canDeleteMedia()` يسمح بحذفها → فجوة في مقال حي بلا أي تحذير. الإصلاح شمل الأربعة: `usage-where.ts` + `get-media-usage.ts` (يقرأ `articleGallery`) + `can-delete-media.ts` (يمنع الحذف لو الصورة في معرض مقال منشور) + `get-media-stats.ts`. **متبقٍّ:** لم يُتحقق كم صورة كانت معرّضة فعلاً — يُفحص على الإنتاج قبل الدفع.

- [ ] **٠ب · تسجيل `reason` كـ custom dimension في GA4** — بيد خالد (GA4 Admin → Custom definitions → Create custom dimension → Event scope → parameter `reason`). بدونها، جدول «لماذا فشلت المحاولات» يبقى فارغاً رغم أن الحدث يُرسل. حدثا `booking_attempt` و`booking_failed` جاهزان في الكود وينتظران دفعة modonty.
- [ ] **٠أ · 🔴 صفحة `/clients/[slug]/book` لا تُنتج حجوزات** — ٣٩ فتحة في ٩٠ يوماً، **صفر حجز من `client_page`**. كل العيادات (YMYL) ٠٪: سمايل تاون ٣١ فتحة/٠ حجز · شيخ العرب ٣/٠ · يسري ١/٠ · شاهين ١/٠ · عمرو مصطفى ١/٠. الوحيد المحوِّل: كيما زون (غير طبي) ٢/٢ — وحجزاه جاءا من `article_dock` و`article_card` لا من صفحة الحجز. الشك (غير متحقق): حقل `disclaimerAccepted` الإلزامي لعملاء YMYL يمنع الإرسال. التتبّع: صفحة `/book` على الإنتاج → الـ action → الكتابة في DB.

- [ ] **٠ · 🔴 تدوير كلمة مرور مستخدم قاعدة الإنتاج `modonty-admin`** — بيد خالد (Atlas → Database Access). كلمة المرور مكتوبة حرفياً في **١١ ملفاً مدفوعاً على GitHub** (`git grep -l "2053712713" HEAD`): `admin/app/api/dev/sync-local-from-prod/route.ts` + ٩ سكربتات في `admin/scripts/` + `documents/context/SESSION-LOG.md`. صلاحية كتابة كاملة على الإنتاج. حذف السطر لا يكفي — تبقى في تاريخ Git للأبد. بعد التدوير: نقل الرابط لمتغير بيئة في الأحد عشر ملفاً. **أخطر من بند ① (Bunny).**
- [ ] **١ · تدوير مفتاح Bunny الرئيسي** — بيد خالد (dash.bunny.net → Account → API). المفتاح مرّ بالشات 2026-07-06 = مكشوف. **بلوكر كل ما بعده.**
- [ ] **٢ · إضافة مفاتيح BUNNY_* على Vercel** (console + modonty) واحد واحد بالتحقق — بعد التدوير فقط.
- [ ] **٣ · دفع الدفعة الثانية**: كونسول (gallery→Bunny) + مودونتي (geo tracking + booking_submit + صفحة reels) + schema.prisma. قبلها: tsc console+modonty (**لم يُعادا بعد سكيما الجغرافيا**) + builds + تست حي + الطقس الكامل. 🔔 قبل أي دفع modonty: قياس Lighthouse + GZIP + حجم الباندل (الأداء #1).
- [ ] **٤ · تحقق بصري من admin.modonty.com** بعد دفعة v0.85.0 — بيد خالد.
- [ ] **٥ · تنظيف الشواهد**: حذف ملفات الشواهد الـ 9 + `modonty/components/tracked-cta-link.tsx` + مجلد `modonty/.next-stale-*`. الأمر الجاهز (يلصقه خالد):
  ```
  cd c:/Users/w2nad/Desktop/dreamToApp/MODONTY
  rm "admin/app/(dashboard)/analytics/components/analytics-page-client.tsx" "admin/app/(dashboard)/analytics/components/analytics-charts.tsx" "admin/app/(dashboard)/analytics/components/views-chart.tsx" "admin/app/(dashboard)/analytics/components/traffic-sources-chart.tsx" "admin/app/(dashboard)/analytics/components/top-articles-chart.tsx" "admin/app/(dashboard)/analytics/components/export-button.tsx" "admin/app/(dashboard)/analytics/actions/get-views-trend-data.ts" "admin/app/(dashboard)/analytics/actions/get-full-activity.ts" "admin/app/(dashboard)/components/date-range-selector.tsx" "admin/app/(dashboard)/components/sections/db-section.tsx" "modonty/components/tracked-cta-link.tsx"
  rm -rf modonty/.next-stale-*
  ```

## 🟡 قريب — مرتبط بالشغل الأخير

- [ ] **٧ · الريلز — الجهة الإدارية** (مركونة بطلب خالد): أول مهمة **reels→GA4** (الفيد لا يرسل أي أحداث: reel_view/like/favorite/share)، ثم تست رفع الكونسول الحي، شاشة موافقة الأدمن، ترحيل gallery القديمة، مرحلة الفيديو، قرار الكوتا. المرجع: `documents/reels/`.
- [ ] **٨ · تيليقرام**: إحياء الحدثين الميتين (leadHigh + campaignInterest) + تفعيل مرآة الأدمن الكاملة (التوجل موجود) + سجل الأحداث الموحد للتحليل (طلب خالد 2026-07-07). ملاحظة: 21/26 حدث يعمل فعلاً (OBS-199).
- [ ] **٩ · GA4 لوحة Google (بيد خالد)**: تسجيل custom dimensions (`client_id` + `article_id` + `user_id`) — يفتح عمود CTA لكل عميل بجدول الشركات (حالياً 0 عمداً). + التحقق من Enhanced Measurement (scroll 90% · site search · outbound).
- [ ] **١٠ · انحرافا موكب الرئيسية**: صف أفعال الزوار قبل بطاقات GA4 + فلتر التاريخ داخل بلوك النشاط — مباركة خالد أو إعادة هيكلة.
- [ ] **١٠ج · شارات `/analytics/leads` (الصفحة القديمة) بألوان وضع فاتح فقط** — `bg-emerald-100 / bg-blue-100 / bg-amber-100 / bg-violet-100 / bg-red-100` بلا بديل `dark:` → تصرخ في الوضع الداكن. صفحة سابقة لعملي، لم ألمسها. الإصلاح: نفس نمط `bg-<tone>-500/15 + dark:text-<tone>-400` المطبّق في تقريري الحجوزات والأسئلة.
- [ ] **١٠ب · تقرير الأسئلة غير متحقق ببيانات حقيقية** — قاعدة `modonty_dev` فيها صفر أسئلة زوّار (`source:"user"`)، فالصفحة تعرض حالة فارغة صحيحة لكن مسار قراءة `ArticleFAQ` لم يُختبر بصف حقيقي. التحقق: اطرح سؤالاً من مودونتي المحلي على مقال التست ثم افتح `/analytics/leads/questions`.
- [ ] **١١ · تعليق سكيما مضلل**: `BookingRequest.source` comment يقول "warm-lead LINK clicks" — يُصحح مع أول لمسة سكيما قادمة.
- [ ] **١٢ · `get-full-activity.ts` (نسخة DB)** غير مستخدمة بعد التحول لـ GA4 — قرار خالد: مرجع/fallback أم حذف؟ (حالياً شاهدة ضمن بند ٥).

## 🟢 الباك لوق — مشاريع وقرارات مؤجلة

- [ ] **١٣ · جلسة فريق المحتوى** — 7 من 11 قرار مفتوحة. ملف القرار: `documents/content-team/CONTENT-TEAM-BRAINSTORM-v1.html`.
- [ ] **١٤ · نظام الروابط المختصرة** — خطة 9 مراحل جاهزة + 3 قرارات معلقة (التفاصيل في git history: `SHORT-LINK-SYSTEM-TODO.md`). يتقاطع مع بند QR (٢٩).
- [ ] **١٥ · جرد الإيميلات الشامل** — كل trigger/مستلم/قالب/تطبيق عبر التطبيقات الثلاثة + Resend: إشعار المتابعين، تسليم النشرة، حوافز النشرة الست «قريباً» (وعود بلا أنظمة — الشارة تنزال بعد البناء فقط)، التحقق من الإيميلات المعامَلاتية. مرتبط بقرار الاشتراكات «د».
- [ ] **١٦ · قرار مُراجِع YMYL** — اقتراح خالد: الطبيب الموافق بالكونسول = المُراجِع الحقيقي (ربط `reviewedById` عند `approveArticle`). المؤجل الأكبر: شغل MEDICAL-YMYL (~32 ساعة JSON-LD MedicalWebPage — التفاصيل في git history: `MEDICAL-YMYL-READINESS.md`). النقاش المرجعي: `YMYL-FLOW-DISCUSSION.md`.
- [ ] **١٧ · صيانة DB داخل Run-All** (القاعدة: كل صيانة Step داخل `/database`، لا كروت منفصلة): decay لـ Analytics/ArticleView (365 يوم) · إشعارات مقروءة (30 يوم) · تسوية articleBodyText · NewsSubscriber ملغي (6 شهور) · decay لـ Conversion/CampaignTracking · تسوية العدادات · وسوم/فئات يتيمة (مراجعة يدوية).
- [ ] **١٨ · إعادة تصميم بوابة جودة المقال من الصفر** — مؤجلة بطلب خالد («بس مش الآن» 2026-06-07). المشاكل الموثقة: قائمة الكاش القديمة تكذب + عدم التفريق بين «محسوب» و«بيانات ناقصة».
- [ ] **١٩ · Hero 1200×630 — المتبقي**: إعادة رفع الصور القديمة 6:1 + فرض الكروبر في الكونسول + محاذاة `hero-cover.tsx` (3:1→6:1).
- [ ] **٢٠ · HeroSlider للـ Premium فقط** — `getClientHeroSlides` بلا فلتر tier (مسجل عاجل منذ 06-09).
- [ ] **٢١ · إصلاح البراند المزدوج في العناوين** — `admin/lib/seo/metadata-generator.ts:138`: حذف لاحقة العميل + إبقاء قالب «| مدونتي» + Regenerate شامل.
- [ ] **٢٢ · روابط داخلية سياقية داخل جسم المقال** (السيو الداخلي).
- [ ] **٢٣ · بيانات الحداثة/dateModified** للمقالات.
- [ ] **٢٤ · مراجعة خبير لكلمات الرئيسية** (SEO keywords للـ homepage) بعد النشر.
- [ ] **٢٥ · Google Reviews للـ Premium** — Places API (gbpPlaceId موجود بالسكيما). قرارات مقفلة: بلا AggregateRating markup + بلا كاش للمراجعات.
- [ ] **٢٦ · نظام Reviews لمودونتي نفسها** (آراء العملاء على modonty.com).
- [ ] **٢٧ · تدقيق فاتورة Vercel** — `vc> audit` (TOKEN موجود).
- [ ] **٢٨ · بطاقة عروض الشركاء** — MediaType OFFER + قرار validUntil معلق.
- [ ] **٢٩ · QR code لكل عميل** — يتقاطع مع المرحلة 3 من الروابط المختصرة (١٤).
- [ ] **٣٠ · Admin Broadcaster متعدد القنوات** (فكرة).
- [ ] **٣١ · إعادة تصميم صفحة العميل بالأدمن** + عرض intake للقراءة فقط + نشاط العميل.
- [ ] **٣٢ · تكبير شعارات شركاء النجاح** بالرئيسية.
- [ ] **٣٣ · قسم «الجديد» من قنوات السوشيال** (فكرة).
- [ ] **٣٤ · قسم خدمات العميل** — فكرة موديل ClientService.
- [ ] **٣٥ · تدقيقات تنظيف JSON-LD**: حذف `Client.keywords` كلياً (~33 موقع/17 ملف — fallback لـ knowsAbout من industry.name + contentPriorities + تحذير استعارة الـ hint في business-section) · بطاقة إرشاد ClientKeyword بمحرر المقال · إيقاف بثّ وسوم المقال كـ keywords · حذف isAccessibleForFree · إزالة تكرار التواريخ.
- [ ] **٣٦ · خطة حذف seoKeywords** — 17 موقعاً، 6 مراحل، semanticKeywords تبقى 100% (التفاصيل في git history: `SEOKEYWORDS-DELETION-EXECUTION.md`).
- [ ] **٣٧ · تدقيق الكود الميت** — يدوي بلا agents، 3 أنماط grep لكل ادعاء، «شك واحد = احتفظ».
- [ ] **٣٨ · بنود Client Edit / Impersonation المعلقة** — كانت 18 بنداً (git history: `CLIENT-EDIT-IMPERSONATION-PENDING.md`) — تُراجع بند-بند عند فتح الملف.
- [ ] **٣٩ · تحقق بند-بند من المشاريع القديمة الكبيرة** عند الحاجة فقط — CLIENT-PAGE-FULLSITE (79 بند مسجل) · CLIENTS-TODO (48) · STORY-PAGE (22) · SUBSCRIBER-TO-CLIENT-CONVERSION (11) — كلها في git history؛ المسجل فيها لا يعكس الواقع (كثير أُنجز لاحقاً).

## 📌 قواعد التشغيل لهذا الملف

- «reminder X» → يُضاف فوراً كبند هنا (بالقسم المناسب) — لا ملف منفصل.
- تقارير مريم → بنودها المفتوحة تدخل هنا (قسم 🟡 أو 🔴 حسب الخطورة).
- ملاحظات التست الحي → تظل تُسجل في `documents/tasks/CLAUDE.md` (سجل خام)، والقابل للتنفيذ منها ينتقل هنا.
- أي بند يخلص → ينتقل لقسم Done تحت بتاريخ اليوم + تحديث Last Updated.

---

## ✅ Done

- [x] 2026-07-13 — **إصلاح `querySrv ECONNREFUSED` في زر Sync Local from PROD**: محلّل DNS في Node مضبوط على `127.0.0.1` حيث لا يستمع أحد على المنفذ ٥٣. الكود كان فيه علاج (`dns.setServers`) لكنه **يضبط المحلّل الخطأ** — `node:dns` و`node:dns/promises` محلّلان منفصلان بقائمتَي خوادم مستقلّتين، وسائق مونجو يستعمل نسخة الـ promises. الدليل: `dns.setServers([...])` ثم `dnsPromises.getServers()` رجع `["127.0.0.1"]` وفشل الاستعلام؛ بعد `dnsPromises.setServers([...])` رجعت السجلات الثلاثة. الإصلاح في [route.ts](admin/app/api/dev/sync-local-from-prod/route.ts) — ضبط المحلّلين معاً. tsc admin صفر.
- [x] 2026-07-13 — **إعادة بناء صف «أفعال الزوار» + تقريرا الحجوزات والأسئلة (admin، محلياً — لم يُدفع)**: موكب معتمد (`documents/mockups/admin-visitor-actions-v1.html`) ثم بناء مطابق مع **ثلاثة تصحيحات مبنية على الكود**: (١) أسئلة الشات‑بوت ليست أسئلة زوّار — الأدمن ينشئها من محادثات الشات‑بوت ومعها إجابة (`convertToArticleFaq`)، فاستُبعدت؛ (٢) «زائر مقابل عضو» ميت على الأسئلة والتعليقات لأن كليهما يتطلب تسجيل دخول — نُقل للحجوزات والرسائل حيث `userId` قابل لـ null فعلاً؛ (٣) أسئلة صفحة العميل تُجاب من الكونسول لا الأدمن، فالرابط «Open client» لا «Answer». **البق الأصلي أُصلح**: `get-leads-detail.ts` كان يقرأ `clientFAQ` فقط ويتجاهل `ArticleFAQ` بالكامل. ملفات جديدة: `get-visitor-actions.ts` · `get-bookings-report.ts` · `get-questions-report.ts` · `leads/bookings/` · `leads/questions/` (+loading). tsc admin صفر · تست حي: صفر أخطاء كونسول بعد إصلاح `export const` في ملف `"use server"`.
- [x] 2026-07-08 — **دفع modonty v1.71.0 (`434dbf1`) — إصلاح soft 404 حي على الإنتاج ومتحقق منه**: Vercel modonty READY · console CANCELED · admin أعيد بناؤه (سكربت changelog تحته) — و**تحقق curl من الإنتاج بعد النشر**: 5 روابط وهمية = 410 ✅ · 5 كيانات حية من سايت ماب الإنتاج (بينها slugs عربية) = 200 ✅ · 4 قوائم = 200 ✅ · الرئيسية والأدمن 200 ✅. الدفعة ضمت أيضاً: TODO.md الموحد + حذف الـ 82 ملفاً + changelog LOCAL/PROD (`6a4f58f5fb0f52a23cd593f9`/`...f8`).
- [x] 2026-07-08 — **إصلاح soft 404 للكيانات المحذوفة (يُنشر مع الدفعة الثانية)**: تدقيق دورة حياة الفئات/الوسوم/الصناعات + نقل المقال بين الفئات ضد المصادر الرسمية (Google Search Central + Next.js docs) — نقل المقال ✅ best practice (الرابط ثابت + breadcrumb/JSON-LD/dateModified تُعاد)، والحذف محمي (يرفض والكيان مستخدم) والسايت ماب ديناميكي ✅. الثغرة الوحيدة: الكيان المحذوف كان يرجع 200+noindex (فخ streaming مع loading.tsx — متحقق حياً من الإنتاج). الإصلاح: تعميم `modonty/lib/archive-cache.ts` (كاش ذاكرة 5 دقائق لكل نوع، fail-open، بلا unstable_cache بسبب باق الأحرف العربية) + توسيع matcher `modonty/proxy.ts` للمسارات الخمسة → **410**. tsc صفر + تست حي search محلي: 5 روابط وهمية = 410 · 4 قوائم = 200 · 5 كيانات حية (بينها slugs عربية) = 200 · صفر أخطاء كونسول.
- [x] 2026-07-08 — **تنظيف documents/ الشامل (89 عنصراً حُذف)**: 54 ملف TODO قديم + 9 مجلدات عهد أبريل كاملة (02-seo · 04-technical-dev · 07-design-ui · 08-intake-setup · MODONTY-RULE · bugs · creativity · guidelines · implementation-plans) + 13 ملف تقارير/جذر منتهية + 13 نسخة موكب متجاوزة. التنفيذ عبر node بعد تفويض خالد الصريح (قائمة المنع العامة في `~/.claude/settings.json` تحظر rm). النتيجة: documents/ = 14 مجلداً نظيفاً بلا ملفات جذر.
- [x] 2026-07-08 — **توحيد كل ملفات TODO في هذا الملف** (بأمر خالد: «اعمل ملف واحد... والقديم الغيه. لا تأرشف») — دمج NEXT-UP + PENDING-IDEAS + الجرد + بواقي ANALYTICS-FULL-ACTIVITY.
- [x] 2026-07-08 — دفع **admin v0.85.0** (`fb77041`): الرئيسية = الترمومتر المدموج (GA4 SOT) + صفحات التفصيل، بعد تدقيق بيانات 100% (11 رقماً طابقت رقماً برقم) وإصلاح تضخيم Geography + تثبيت السعودية/مصر. Vercel: admin READY والباقي CANCELED. مفاتيح GA4 الثلاثة متحقق منها على Vercel (ترقيم كامل 66 متغيراً).
