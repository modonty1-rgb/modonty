# 🚨 CRITICAL TODO — مشاكل بانتظار حل لاحق

> **آخر تحديث:** 2026-06-02
> **الغرض:** مهام مهمة لكنها مؤجّلة الآن لوجود أولويات أعلى. لا تُحذف ولا تُهمل — كل واحدة تحتاج جلسة مخصّصة.

---

## CRIT-008 🟡 توحيد حقلَي GBP عند العميل (`gbpProfileUrl` vs `googleBusinessProfileUrl`)

**الحالة:** مؤجّل — قرار خالد 2026-06-02 (لا حذف الآن؛ الحذف السريع غير آمن — له side effects كبيرة)
**التاريخ:** 2026-06-02

### المشكلة (الجذر)
العميل عنده **حقلان** يحملان رابط ملف Google التجاري، يخدمان تدفّقين مختلفين:
- **`gbpProfileUrl`** (`schema.prisma` ضمن بلوك GBP: + `gbpPlaceId`/`gbpAccountId`/`gbpLocationId`/`gbpCategory`) — الملف الذي **تديره مودونتي** للعميل عبر الـ API. يُحرَّر في فورم الأدمن (`client-seo-form.tsx`) ويغذّي structured data العميل (`build-client-seo-data.ts`).
- **`googleBusinessProfileUrl`** (ضمن قسم SEO Intake) — رابط الملف **الذي يلتقطه الكونسول** أثناء الإنتيك: يُكتشف تلقائيًا من موقع العميل، يُخزَّن في `client.intake.technical.googleBusinessProfileUrl`، ويُنسَخ للعمود القديم عبر `save-intake.ts`.

التضارب: حقلان لنفس المفهوم (رابط GBP للعميل) → لخبطة في مصدر الحقيقة.

### ليه الحذف السريع غير آمن (side effects مؤكّدة)
`googleBusinessProfileUrl` **مستخدَم فعليًا** عبر:
- **الكونسول**: `intake/page.tsx` · `intake-types.ts` (IntakeTechnical) · `intake-form.tsx` + `dynamic-intake-form.tsx` (UI + auto-detect) · `save-intake.ts` (mirror) · `profile-actions.ts`.
- **الأدمن**: `create-client.ts` · `client-server-schema.ts` (Zod).
- **seed**: `intake-seed-definition.ts` (`technical.googleBusinessProfileUrl`).
حذف العمود = كسر فورم الإنتيك بالكونسول + `save-intake` + تحديث البروفايل + إنشاء العميل.

### الحلّ (جلسة مخصّصة)
توحيد مدروس وليس حذفًا: نقرّر **مصدر الحقيقة الواحد** + اتجاه المزامنة بين الإنتيك (`client.intake.technical.*`) والـ GBP المُدار (`gbpProfileUrl` + معرّفات الـ API). على الأرجح: الإنتيك = إدخال العميل/الاكتشاف، والـ `gbpProfileUrl` المُدار = المصدر النهائي للـ structured data؛ نزامنهما باتجاه واحد واضح ونزيل الازدواج تدريجيًا.

### Why
حقلان لنفس البيان = خطر تعارض + ارتباك أي صيانة مستقبلية. لكن كلاهما حيّ، فالتوحيد يحتاج تخطيطًا لا حذفًا متسرّعًا.

### How to apply
في الجلسة المخصّصة: ارسم خريطة القرّاء/الكتّاب للحقلين أولًا → قرّر المصدر الواحد → اكتب mirror باتجاه واحد → اختبر فورم الإنتيك (كونسول) + إنشاء/تعديل العميل (أدمن) + structured data العميل على modonty live قبل إزالة أي عمود. (منهجية الطبقة الكاملة modonty ↕ admin ↕ console).

---

## CRIT-007 🟡 توحيد تسمية الباقات — مصدر واحد (jbrseo → SubscriptionTierConfig) بدل ازدواجية enum

**الحالة:** مؤجّل — قرار خالد 2026-05-30 (نشتغل UI أولاً، الـ schema/refactor لاحقاً)
**التاريخ:** 2026-05-30

### المشكلة (الجذر)
ازدواجية تسمية للباقات تسبّب لخبطة:
- **enum تقني** `SubscriptionTier` (schema.prisma:42): `BASIC · STANDARD · PRO · PREMIUM` — مخزّن في كل عميل (`client.subscriptionTier`)
- **الأسماء + الأسعار الحقيقية** في `SubscriptionTierConfig` (DB، متزامنة من jbrseo): `مجاني · الانطلاقة · الزخم · الريادة` + `pricing {SA/EG, mo/yr}` + `jbrseoId (free/starter/growth/scale)`

التطابق: BASIC=مجاني(free) · STANDARD=الانطلاقة(starter) · PRO=الزخم(growth) · PREMIUM=الريادة(scale). الـ enum **ما يطابق** الأسماء العربية → لخبطة في كل UI يعرض الباقة.

### الحلّان (خالد يختار في الجلسة المخصّصة)
- **أ) جذري ثقيل:** حذف الـ enum، العميل يرتبط بالـ config بـ relation. يلمس **~65 ملف** (admin 53 · modonty 10 · console 2) + migration للبيانات. خطر/وقت عالي.
- **ب) جذري ذكي (توصية Claude):** الـ enum يبقى مفتاح داخلي ثابت، **مصدر واحد** `getTierDisplay(tier)` يترجمه للاسم+السعر من `SubscriptionTierConfig`. يلمس فقط أسطح العرض (قِلّة) — بدون migration. اللخبطة تختفي من الجذر، خطر أقل بكثير.

### Why
الأسماء والأسعار متناثرة بدون نقطة توحيد. مصدر jbrseo موجود ومتزامن أصلاً (`pricing` JSON + `FALLBACK_PRICING_BY_NAME` + `resolvePricing()` في `admin/.../subscription-tiers/lib/pricing.ts`) — نستهلكه، ما نعيد بناءه.

### How to apply
في الجلسة المخصّصة: ابدأ بالخيار (ب) — helper مركزي واحد، استبدل كل عرض خام للـ enum به، اختبر live على أسطح العرض. لا تلمس قيمة الـ enum المخزّنة في DB.

---

## CRIT-006 🟡 مراجعة مفاتيح env اللي أُضيفت لـ Vercel (2026-05-29) + تعارض GTM على modonty

**الحالة:** غير عاجل — لا يؤثر حالياً (مفاتيح إضافية فقط، تسري بعد redeploy)
**التاريخ:** 2026-05-29

### السياق
خلال محاولة مزامنة env، أضفتُ ~٢٠ مفتاح تحليلات/تسويق كـ Shared Env Vars على Vercel (GTM_* · GA4_* · NEXT_PUBLIC_HOTJAR_* · NEXT_PUBLIC_SALES_* · NEXT_PUBLIC_CEO_EMAIL · GEMINI_API_KEY · INDEXNOW_KEY) عبر `scripts/sync-env-to-vercel.mjs`. **أُضيفت بناءً على مقارنة ناقصة** (قرأت صفحة وحدة من ٦٦ متغير — الـ API يرجّع ٢٥/صفحة) فظننت admin ناقص ٤٠ مفتاح. **الحقيقة:** المفاتيح الحرجة (DATABASE_URL=prod · RESEND_API_KEY · RESEND_FROM · CLOUDINARY · GSC · OPENAI) كانت موجودة ومربوطة بالثلاثة من البداية — إنذار كاذب.

### المطلوب (جلسة مخصّصة)
1. **مراجعة الـ ~٢٠ مفتاح المضاف** — تأكيد إن كل واحد صحيح القيمة + مربوط بالمشروع الصح + فعلاً مطلوب. (آمنة ومفيدة غالباً، بس أُضيفت بدون تحقق كامل.)
2. **GTM على modonty — مقصود، مش تعارض (وضّحه خالد 2026-05-29):** `NEXT_PUBLIC_GTM_CONTAINER_ID` له قيمتان:
   - project-level على modonty = `GTM-MNRR2NS9` (حاوية **مدوّنتي**)
   - shared = `GTM-P43DC5FM` (حاوية **جبر SEO** — افتراضي مشترك)
   - Vercel يرجّح الـ project-level، فمدوّنتي تطلق حاويتها الصحيحة `GTM-MNRR2NS9`. **سليم — لا إجراء مطلوب.** (تنظيف اختياري لاحقاً: فكّ ربط حاوية جبر SEO عن مشروع modonty لتقليل اللبس، لكنها غير ضارة لأنها مُتجاوَزة.)
3. **٥ مفاتيح أخرى مكررة على modonty (project + shared)** — قديمة (قبل اليوم، مش مني): DATABASE_URL · GOOGLE_CLIENT_ID · GOOGLE_CLIENT_SECRET · AUTH_TRUST_HOST · NEXT_PUBLIC_SITE_URL. الـ ٣ الأخيرة تأكدنا إنها متطابقة القيمة (غير ضارة)؛ DATABASE_URL + GOOGLE_CLIENT_* نوع sensitive (ما نقدر نقرأ قيمتها عبر API) → تتأكد منها أنت من dashboard.

### Why
الـ env drift خطر مثبت (انظر CRIT-005). المفاتيح المضافة آمنة حالياً بس تحتاج تدقيق عشان ما نراكم تعارضات صامتة.

### How to apply
الأداة `scripts/sync-env-to-vercel.mjs` لها dry-run افتراضي + يطبع CREATE/LINK/SKIP. شغّلها dry-run أول لمراجعة الحالة قبل أي تعديل. القاعدة الذهبية الجديدة (في `~/.claude/CLAUDE.md`): paginate القائمة كاملة قبل أي استنتاج.

---

## CRIT-005 🔴 GUARDRAIL — `.env.shared` migration broke PROD silently for 4 weeks

**الحالة:** ✅ مُحلَّل + مُصلَح في 2026-05-27 — لكن لازم guardrails دائمة
**التاريخ:** المشكلة بدأت 2026-04-30 (commit `3d3ad5d`) واتكشفت 2026-05-26 عبر GSC reports

### الحدث

نقلتُ كل المتغيرات إلى `.env.shared` (gitignored). نسيت إضافة الـ 5 vars يدويًا على Vercel modonty. CDN cache غطّى المشكلة 4 أسابيع. كل المقالات الجديدة كانت ترجع 500 من الـ origin، Google صنّفها 404/5xx، de-indexing فعلي.

### Guardrails المطلوبة (لازم تُنفَّذ قبل أي migration env مستقبلية)

1. **Vercel env var diff script** — `pnpm vercel:env:diff` يقارن `.env.shared.example` ضد ما هو موجود فعليًا على Vercel projects (modonty/admin/console) ويصرخ على أي var ناقصة
2. **Post-deploy smoke test** — بعد كل deploy، استدعاء غير مُكاش لـ `/api/health` يتأكد إن DB connection شغّال (يفشل CI/CD لو رجع 500)
3. **CDN cache buster after env changes** — لما تتغير env vars في Vercel، لازم purge للـ CDN cache (مش بس redeploy)، عشان نكشف المشكلة فورًا مش بعد أسبوع لما الكاش ينتهي
4. **next.config.ts: fail loud if `.env.shared` not found AND not on Vercel** — حاليًا `loadDotenv` يفشل بصمت. لازم throw error في dev mode لو الملف مش موجود
5. **GSC URL Inspection daily cron** — تنبيه Telegram لو أي مقال جديد رجع verdict ≠ INDEXING_ALLOWED

### Why: السبب الجذري للحدث

- ملف بيلد config (`next.config.ts`) كان يقرأ من ملف gitignored
- نسيت أنشر القيم على Vercel بعد النقل
- النظام كله "بدا" شغّال لأن CDN cache غطّى المشكلة
- الكشف الوحيد كان عبر Google (متأخر 4 أسابيع + خسارة فهرسة فعلية)

### How to apply

أي migration مستقبلي يلامس env vars لازم يمر بـ 5 الخطوات أعلاه قبل الاعتبار "complete". لا استثناءات.

---

## CRIT-004 🟠 Auto-Maintenance JSON-LD regen — scalability ceiling

**الحالة:** اكتُشف خلال v0.63.0 — يعمل اليوم لكن سيكسر مع نمو المحتوى
**التاريخ:** 2026-05-26
**القياس الفعلي:** على DEV، 25 مقال JSON-LD regen = **182.7 ثانية** (~7.3 ثانية/مقال)

### الإسقاط

| عدد المقالات | الوقت المتوقع | يدخل في حدود Vercel Pro Fluid (800s)؟ |
|---|---|---|
| 25 (الآن — DEV) | 3 دقايق | ✅ |
| 100 | ~12 دقيقة | ❌ يتجاوز |
| 200 | ~24 دقيقة | ❌ يتجاوز |
| 500 | ~60 دقيقة | ❌ يتجاوز بكثير |
| 1,000 | ~2 ساعات | ❌ مستحيل |

### السبب
`batchRegenerateJsonLd()` في `admin/lib/seo/jsonld-storage.ts` يعالج المقالات في حلقة سيريالية (واحد بعد الآخر). كل مقال يحتاج:
- read article + relations (~500 ms)
- generate JSON-LD graph (~200 ms)
- write to DB cache (~300 ms)

### الحلول المقترحة (للنقاش)
1. **Promise.all batches** (متوازي 5-10) — يقلل الوقت بنسبة x5 → 1000 مقال = ~20 دقيقة (لا يزال يتجاوز Vercel)
2. **after() background tasks** بنفس النمط المُستخدم في Settings cascade — يبدأ → يُكمل بعد الـ response → maxDuration 800s (Pro Fluid)
3. **Cron split** — صف من 50 مقال/تنفيذ، يجدّد كل ساعة عبر Vercel Cron
4. **On-demand only** — لا regenerate تلقائياً؛ يُعاد توليد JSON-LD فقط عند تعديل المقال (الحالي السلوك في `updateArticle`)
5. **Move to Vercel Workflows** — للأحجام الفعلية الكبيرة (1000+) — Google توصي به للجوبات الطويلة المدى

### الخطة الموصى بها (سيقتم القراء عند الحاجة)
- ≤ 100 مقال: ابق على الحلقة السيريالية (تكفي)
- 100-500 مقال: حوّل لـ `after()` + Promise.all batches (5 بالموازاة)
- 500+ مقال: Cron split + Workflows

### كيفية الإثبات
حالياً modonty عنده 25 مقال. عند الوصول لـ 100، أعد القياس على DEV قبل تشغيل Run-All على PROD.

---

## CRIT-001 🔴 صور Cloudinary مكسورة (21 ملف على PROD)

**الحالة:** مؤجّلة — مهام أهم على المشروع حالياً
**التاريخ المكتشف:** 2026-05-25
**الفريق:** واقف على هذه النقطة — لكن غير حرجة لدرجة إيقاف باقي العمل

### الوصف
21 صورة من أصل 103 على PROD database مرجعها في DB موجود لكن الملف نفسه محذوف من Cloudinary CDN (يرجع 404). الصور المتأثرة:
- شعار **بسيطة** (b-logo) — Media ID: `6a0e35f2485eafc814f561bc`
- شعار **متجر باقتك**
- شعار **مدونتي**
- شعار **Dream to App**
- + 17 صورة أخرى (يحتاج script لاستخراج القائمة الكاملة)

### السبب المُحقَّق
- Sync from PROD يجلب الـ DB references بشكل صحيح
- Cloudinary CDN يرجع 404 لأن الملفات محذوفة من حساب Cloudinary
- خالد جرّب Replace flow على `/media/[id]/edit` للشعار `بسيطة` لكن DB ما تحدّث — `updatedAt` بقي 2026-05-20

### كود Replace — تم التحقق إنه سليم 100%
الموقع: [admin/app/(dashboard)/media/[id]/edit/edit-media-form.tsx:121-281](admin/app/(dashboard)/media/[id]/edit/edit-media-form.tsx#L121-L281)

التدفّق:
1. رفع ملف جديد لـ Cloudinary API
2. لو فشل → toast error + return
3. حذف Cloudinary asset القديم
4. `updateMedia(media.id, {cloudinaryPublicId, url, ...})` على نفس الـ `_id` row
5. Toast نجاح + `router.push("/media")`

### النقطة المعلّقة
- خالد قال إنه عمل Replace من admin على PROD، بعدها sync لـ local
- DB check يقول `updatedAt` للشعار `بسيطة` = 2026-05-20 (5 أيام قديم — مش جديد)
- إما الـ Replace ما اكتمل، أو خالد كان على صفحة ثانية (مودال "Add Publisher Logo" في client edit ≠ `/media/[id]/edit` Replace)

### الخطوات المطلوبة عند الرجوع
1. خالد يفتح PROD: `admin.modonty.com/media/6a0e35f2485eafc814f561bc/edit`
2. يفتح DevTools → Network tab قبل ضغط Save
3. يرفع صورة جديدة → يضغط Save → ينتظر toast + redirect
4. يلتقط screenshots لكل خطوة
5. لو DB ما تحدّث رغم نجاح Save → debug عميق على `updateMedia` server action
6. لو DB تحدّث → نكرّر للـ 20 ملف الباقي + نعمل sync لـ local + نتحقق

### الـ files المتعلقة
- [admin/app/(dashboard)/media/[id]/edit/edit-media-form.tsx](admin/app/(dashboard)/media/[id]/edit/edit-media-form.tsx)
- [admin/app/(dashboard)/clients/components/client-logo-modal.tsx](admin/app/(dashboard)/clients/components/client-logo-modal.tsx) — هذه فقط تغيّر reference، ما ترفع/تحذف
- [admin/scripts/audit-sync-completeness.ts](admin/scripts/audit-sync-completeness.ts) — للتحقق بعد الحل

### قاعدة ذهبية ذُكرت في الجلسة
- ممنوع أي تعديل code قبل ما خالد يأكّد الـ root cause بنفسه
- Sync لا يحل المشكلة — لازم Replace فعلي على PROD أولاً ثم sync

---

## CRIT-003 🔴 Canonical URL host mismatch (www vs non-www) — متكرر

**الحالة:** ✅ Root cause تم تحديده · 🔄 جاري المناقشة لاختيار الحل
**التاريخ:** 2026-05-25

### العَرَض
المقالات تفشل في Quality Check برسالة:
> `canonicalUrl in DB points to https://modonty.com/articles/... (different host from article URL)`
> **CRITICAL** — يمنع `Send for Approval`

### الـ root cause الحقيقي — Multiple Sources of Truth لـ base URL
الـ admin يقرأ base URL من **3 مصادر مختلفة بدون توحيد:**

| # | المصدر | الكود | يولّد |
|---|---|---|---|
| 1 | `Settings.siteUrl` (DB) via `loadSiteUrl()` | [admin/lib/seo/site-url.ts:18](admin/lib/seo/site-url.ts#L18) | `canonicalUrl` المُخزَّن في DB |
| 2 | `NEXT_PUBLIC_SITE_URL` env | [seo-generation.ts:59](admin/app/(dashboard)/articles/helpers/seo-generation.ts#L59) | fallback للـ canonical |
| 3 | `NEXT_PUBLIC_SITE_BASE_URL` env | [admin/lib/gsc/client.ts:52](admin/lib/gsc/client.ts#L52) → `SITE_BASE_URL` | `article.url` المبني في الـ validator |

### تسلسل الفشل
1. Save المقال → `update-article.ts:164` ينادي `loadSiteUrl()` → يخزّن canonical بـ host المصدر #1
2. Quality Check → `page.tsx:109` يبني `article.url` من المصدر #3
3. الـ validator يقارن `sameHost(canonical, article.url)` → mismatch → CRITICAL

### القرار المتفّق عليه (2026-05-25)
- ✅ **Source of Truth واحد = `Settings.siteUrl` (DB)**
- ✅ شيل `NEXT_PUBLIC_SITE_BASE_URL` نهائياً (env المتعارض)
- ✅ migration script للـ DB القديمة (لكل المقالات + clients + categories + tags + industries + authors)
- ✅ **القرار الاستراتيجي: `https://www.modonty.com` (مع www)** — verified من Vercel + Google + الواقع الحالي
- ✅ **Architecture: DB Source of Truth** — Server: `loadSiteUrl()` · Client: prop drilling من server parent. زيرو env reads في runtime.
- ✅ **ترتيب التنفيذ المعتمد من خالد (2026-05-25):**
  1. **Code refactor أولاً** — الـ 40 ملف يصبحوا يقرأوا من DB
  2. **Migration للبيانات** — يصلح canonical المخزّن في DB (8 جداول)
  3. **يدخل ضمن Run-All Auto-Maintenance** على `/database` — أي data جديدة أو قديمة تتصلح تلقائياً (حسب قاعدة `project_auto_maintenance_rule.md`)
- ✅ القاعدة: ناقش قبل أي code
- ✅ Full repo search تم

### 📊 Audit الكامل — الأرقام الدقيقة 100% (2026-05-25)

| Scope | المؤشّر | الرقم |
|---|---|---|
| **Admin** | ملفات تقرأ `process.env.NEXT_PUBLIC_SITE_URL` مباشرة | **36 ملف · 40 occurrence** |
| **Admin** | ملفات تستخدم `SITE_BASE_URL` constant | **13 ملف · 31 occurrence** |
| **Admin** | Fallback **بدون www** (❌ غلط) | **29 ملف · 33 occurrence** |
| **Admin** | Fallback **مع www** (✅ صحيح) | **2 ملف فقط · 3 occurrence** |
| **Modonty** | ملفات تقرأ env | **18 ملف · 25 occurrence** |
| **Modonty** | Fallback مع www (✅) | **16 ملف · 23 occurrence** — نظيف |
| **Modonty** | Fallback بدون www (❌) | **0** — نظيف 100% |
| **Console** | استخدام siteUrl | **0** — لا يستخدمها |

**النسبة الحرجة:** 29 / 31 = **94% من admin fallbacks بدون www → غلط**

### 🔗 الخطة التفصيلية (Live)
انظر **[SITE-URL-SOURCE-OF-TRUTH-TODO.md](SITE-URL-SOURCE-OF-TRUTH-TODO.md)** — الـ tracking الحي للـ refactor.

### الخطة المقترحة (6 phases — للمناقشة)
- **Phase 0:** قرار www / non-www + قراءة `Settings.siteUrl` الحالية في PROD
- **Phase 1:** Read-only audit — كم مقال متأثر بالضبط
- **Phase 2:** Code refactor — توحيد كل القراءات على `loadSiteUrl()`، حذف `SITE_BASE_URL` constant، الـ validator يستقبل URL مبني من نفس المصدر
- **Phase 3:** Env cleanup — حذف `NEXT_PUBLIC_SITE_BASE_URL` من admin/.env.local + Vercel
- **Phase 4:** Migration script — dry-run أولاً، ثم apply
- **Phase 5:** Modonty app audit — نفس المشكلة هل موجودة في modonty side؟
- **Phase 6:** Final verification — sanitizer staleCount = 0 + live test

### مرتبط بـ
- OBS-113 (admin سابقاً) — نفس المشكلة، انحلت مؤقتاً بسانيتايزر لكن الجذر بقي
- [admin/app/(dashboard)/database/actions/canonical-url-sanitizer.ts](admin/app/(dashboard)/database/actions/canonical-url-sanitizer.ts) — السانيتايزر الحالي

---

## CRIT-002 🔴 زرار "Detect Broken / Orphan URLs" في admin

**الحالة:** مؤجّلة — نشتغل عليه بعد CRIT-001 أو بشكل مستقل
**التاريخ المضاف:** 2026-05-25

### الوصف
زرار في admin (على الأرجح في `/database` أو `/media`) لما يضغطه خالد، يفحص كل صفوف `Media` في DB ويكشف:
- **Broken URLs:** الـ `url` المخزّن في DB لكن Cloudinary CDN يرجع 404
- **Orphan References:** Media references في `Client.logoMediaId` / `Client.heroImageMediaId` / `Article.featuredImageId` تشير لـ Media IDs غير موجودة في collection
- **Unused Media:** Media docs ما يستخدمها أي client أو article (للتنظيف لاحقاً)

### الـ output المطلوب
- جدول واضح لكل صف: Media ID · public ID · URL · نوع المشكلة (404 / orphan reference / unused) · مَن يرجع لها (client name / article title)
- زرار لكل صف: "Fix" → يفتح `/media/[id]/edit` للـ Replace
- ملخص أعلى: عدد كل نوع مشكلة
- (اختياري) زرار "Export CSV" للنتائج

### Endpoints المطلوبة
- HEAD request متوازي لكل `Media.url` (concurrency محدودة عشان ما نخرّب الـ rate limit)
- Cross-reference `Client.logoMediaId` / `Client.heroImageMediaId` / `Article.featuredImageId` مع `Media._id`

### الفائدة
- يخلّينا نعرف بسرعة كم ملف مكسور (CRIT-001 الحالي = 21 — لكن لا نعرف القائمة الكاملة بالضبط)
- نقدر نعالج on-demand بدل ما ننتظر بلاغ من العميل/الفريق
- يدخل تحت قاعدة "Run-All Auto-Maintenance" على `/database` كـ Step جديد

### مرتبط بـ
- CRIT-001 — هذا الزرار = الأداة التشخيصية الكاملة لـ CRIT-001
- [project_auto_maintenance_rule.md](C:/Users/w2nad/.claude/projects/c--Users-w2nad-Desktop-dreamToApp-MODONTY/memory/project_auto_maintenance_rule.md) — أي أداة صيانة جديدة تدخل ضمن Run-All

---

## ✅ Done
(فاضي — انقل هنا أي بند يتم حلّه مع التاريخ والـ commit hash)
