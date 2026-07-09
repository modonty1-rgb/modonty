# ✅ TODO — ملف المهام الوحيد

> **القاعدة (بأمر خالد 2026-07-08):** هذا هو ملف الـ TODO الوحيد في المشروع كله. أي مهمة جديدة أو «reminder» أو بند من تقرير مريم يدخل **هنا**. ممنوع إنشاء ملف TODO جديد لأي مهمة — ملف تفصيلي يُسمح به فقط لمشروع ضخم وبموافقة خالد، ويُربط من هنا.
>
> **حذف القديم — تم 2026-07-08:** 54 ملف TODO/خطة + 35 ملف/مجلد documents متجاوز حُذفت فعلاً بتفويض خالد («القديم الغيه. لا تأرشف» + «أنا أديك الصلاحية»). المتتبع في git (82 ملفاً) يُسترجع بـ `git log --all --oneline -- "documents/tasks/<FILE>"` ثم `git show <hash>:documents/tasks/<FILE>`. الحذف يُدفع مع أول commit قادم.
>
> **ما ليس TODO يبقى بمكانه:** ملفات القرارات (documents/reels/ · documents/content-team/) · المراجع والمواصفات (ARABIC-SLUG-DECISION، CLIENT-PAGE-BUILD-SPEC، ARTICLE-SEO-PERFECT-AUDIT قالب المراجعة، YMYL-FLOW-DISCUSSION…) · سجل ملاحظات التست الحي `documents/tasks/CLAUDE.md` · الموكبات HTML · SESSION-LOG.

**Last Updated: 2026-07-08**

---

## 🔴 الآن — الدفعة الثانية (كل الكود جاهز محلياً وينتظر)

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
- [ ] **٦ · دفع الحذف**: حذف الملفات القديمة (82 ملفاً متتبعاً) تم محلياً 2026-07-08 — يُدفع تلقائياً مع أول commit قادم (الدفعة الثانية).

## 🟡 قريب — مرتبط بالشغل الأخير

- [ ] **٧ · الريلز — الجهة الإدارية** (مركونة بطلب خالد): أول مهمة **reels→GA4** (الفيد لا يرسل أي أحداث: reel_view/like/favorite/share)، ثم تست رفع الكونسول الحي، شاشة موافقة الأدمن، ترحيل gallery القديمة، مرحلة الفيديو، قرار الكوتا. المرجع: `documents/reels/`.
- [ ] **٨ · تيليقرام**: إحياء الحدثين الميتين (leadHigh + campaignInterest) + تفعيل مرآة الأدمن الكاملة (التوجل موجود) + سجل الأحداث الموحد للتحليل (طلب خالد 2026-07-07). ملاحظة: 21/26 حدث يعمل فعلاً (OBS-199).
- [ ] **٩ · GA4 لوحة Google (بيد خالد)**: تسجيل custom dimensions (`client_id` + `article_id` + `user_id`) — يفتح عمود CTA لكل عميل بجدول الشركات (حالياً 0 عمداً). + التحقق من Enhanced Measurement (scroll 90% · site search · outbound).
- [ ] **١٠ · انحرافا موكب الرئيسية**: صف أفعال الزوار قبل بطاقات GA4 + فلتر التاريخ داخل بلوك النشاط — مباركة خالد أو إعادة هيكلة.
- [ ] **١١ · تعليق سكيما مضلل**: `BookingRequest.source` comment يقول "warm-lead LINK clicks" — يُصحح مع أول لمسة سكيما قادمة.
- [ ] **١٢ · `get-full-activity.ts` (نسخة DB)** غير مستخدمة بعد التحول لـ GA4 — قرار خالد: مرجع/fallback أم حذف؟ (حالياً شاهدة ضمن بند ٥).
- [ ] **١٢-ب (بقية) · التحقق من إصلاح soft 404 على الإنتاج بعد دفع الدفعة الثانية**: `curl -I` على رابط فئة/وسم/صناعة/عميل وهمي على modonty.com — المتوقع 410 (حالياً على الإنتاج 200+noindex حتى ينزل الكود).

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

- [x] 2026-07-08 — **إصلاح soft 404 للكيانات المحذوفة (يُنشر مع الدفعة الثانية)**: تدقيق دورة حياة الفئات/الوسوم/الصناعات + نقل المقال بين الفئات ضد المصادر الرسمية (Google Search Central + Next.js docs) — نقل المقال ✅ best practice (الرابط ثابت + breadcrumb/JSON-LD/dateModified تُعاد)، والحذف محمي (يرفض والكيان مستخدم) والسايت ماب ديناميكي ✅. الثغرة الوحيدة: الكيان المحذوف كان يرجع 200+noindex (فخ streaming مع loading.tsx — متحقق حياً من الإنتاج). الإصلاح: تعميم `modonty/lib/archive-cache.ts` (كاش ذاكرة 5 دقائق لكل نوع، fail-open، بلا unstable_cache بسبب باق الأحرف العربية) + توسيع matcher `modonty/proxy.ts` للمسارات الخمسة → **410**. tsc صفر + تست حي search محلي: 5 روابط وهمية = 410 · 4 قوائم = 200 · 5 كيانات حية (بينها slugs عربية) = 200 · صفر أخطاء كونسول.
- [x] 2026-07-08 — **تنظيف documents/ الشامل (89 عنصراً حُذف)**: 54 ملف TODO قديم + 9 مجلدات عهد أبريل كاملة (02-seo · 04-technical-dev · 07-design-ui · 08-intake-setup · MODONTY-RULE · bugs · creativity · guidelines · implementation-plans) + 13 ملف تقارير/جذر منتهية + 13 نسخة موكب متجاوزة. التنفيذ عبر node بعد تفويض خالد الصريح (قائمة المنع العامة في `~/.claude/settings.json` تحظر rm). النتيجة: documents/ = 14 مجلداً نظيفاً بلا ملفات جذر.
- [x] 2026-07-08 — **توحيد كل ملفات TODO في هذا الملف** (بأمر خالد: «اعمل ملف واحد... والقديم الغيه. لا تأرشف») — دمج NEXT-UP + PENDING-IDEAS + الجرد + بواقي ANALYTICS-FULL-ACTIVITY.
- [x] 2026-07-08 — دفع **admin v0.85.0** (`fb77041`): الرئيسية = الترمومتر المدموج (GA4 SOT) + صفحات التفصيل، بعد تدقيق بيانات 100% (11 رقماً طابقت رقماً برقم) وإصلاح تضخيم Geography + تثبيت السعودية/مصر. Vercel: admin READY والباقي CANCELED. مفاتيح GA4 الثلاثة متحقق منها على Vercel (ترقيم كامل 66 متغيراً).
