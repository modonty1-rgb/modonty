# أرشيف السجلّ — أغسطس 2026

> بلوكات دُوِّرت من `SESSION-LOG.md` حين خرجت من نافذة الأسبوع.
> النشط يحمل آخر ٧ أيام فقط؛ ما قبلها هنا بالكامل، منقولاً لا منسوخاً.

---

---

## Session: 2026-08-01 21:30 — 🏆 T2b نُفّذت (LINK) + T4 جولة أولى + T5 جولة تفتيش نظيفة + tsc/build ×3 + باكب Atlas منزّل + دفع version-2 (من البيت)

### ✅ Done this session (كله متحقق بدليل)
1. **T2b التمليك نُفّذ بأمر LINK:** تملُّك 10 · ربط 35 · إنشاء 21 · تخطٍّ 6 ← **إثبات idempotent: بروفة ثانية = «سيُنفَّذ: 0 · منجز: 63»** ← البطاقات 467→488 كلها Bunny 100% · إعادة فحص = نظيف. القراران حُسمهما خالد يدوياً قبلها (صورة وسم «خدمات طبية» من فورم الوسم + `Settings.ogImageUrl` من /settings/modonty — كلاهما من مكتبة مدوّنتي).
2. **تحقق فجوة JSON-LD عند تبديل الصورة = مقفولة:** حفظ الوسم أعاد توليد سيوه لحظياً (`jsonLdLastGenerated` = وقت الحفظ) + مسح 23 وسم + 14 تصنيف + 7 صناعات = صفر رابط قديم.
3. **T4 جولة السرعة الأولى (240 طلباً صفر فشل):** Cloudinary أسرع p75 (76ms مقابل 125ms دافئ) — كاش Bunny كان مصفّراً (HIT 20%←84%). **قرار خالد: الإعادة الكاملة 2026-08-05 = بند 67.**
4. **T5 جولة التفتيش (10 صفحات على :3001):** صفر صورة مكسورة · صفر Cloudinary بالصفحات وبالـJSON-LD الحي · الافتراضية تظهر بمقال «التقويم الهجري». (أخطاء الكونسول = JWTSessionError كوكي dev قديم OBS-118 فقط.)
5. **tsc صفر أخطاء ×3 + build إنتاجي ناجح ×3** (modonty/admin/console).
6. **باكب Atlas منزّل محلياً:** `backups/atlas-snapshot-2026-08-01.tgz` (36MB، لقطة اليوم 09:26، الأرشيف مفحوص) — عبر API بند 62.
7. **إصدارات:** admin 1.7.0→1.8.0 · modonty 1.83.0→1.84.0. **الدفع: فرع version-2 فقط (preview) — صفر مساس main.**
8. عرَض جانبي حُل: 404 على مسارات `/tags/[id]/*` الفرعية = `.next` تالف (قتل غير نظيف) ← حذف + restart. **قاعدة ذهبية جديدة بأمر خالد: أي مشكلة وقت التيست لا تُتجاهل** (memory: feedback_never_ignore_test_problems).

### 📝 قرارات خالد (2026-08-01 ليلاً)
- **الـmerge لـmain = تاسك مستقل T6b، ترتيبه آخر القائمة** — لا يُنفَّذ إلا بعد تست preview ناجح 100% وبأمر صريح.
- **T8 محروس:** لا إعادة توليد JSON-LD على الإنتاج حتى التأكد 100% أن الصور تُخدم سليمة من المزوّدين.
- زر المعاينة أُعيدت تسميته: «بروفة بلا تنفيذ — شوف إيش اللي بيتعدل قبل ما توقّع».

### 🚧 Pending
- تست حي على رابط الـpreview بعد نشر Vercel ← ثم T6b الـmerge بقرار خالد ← بنود اللايف (بند 66) ← T7/T8/T9.
- بند 67: إعادة تست السرعة 2026-08-05.
- changelog الرسمي يُكتب عند الـmerge (النشر الحقيقي) لا عند دفعة الـpreview.

---

## Session: 2026-08-01 19:00 — 🏁 retest الترحيل الكامل نجح (Sync←تصفير←تاسكات ١-٤ = صفر Cloudinary) + فولباك الافتراضيات بُني ووُصّل + الغلافان الميتان حُلّا (خالد غادر المكتب — يكمل من البيت)

### 🎯 Where I stopped
- Last task in progress: الـretest الكامل اكتمل حتى ما قبل **T2b التمليك** مباشرة. كل شي متحقق بالدليل.
- Next concrete action when resuming: افتح `localhost:3000/bunny-migration` ← زر «معاينة — اعرض الخطة بالضبط» في كرت T2b (قراءة فقط) ← راجع الأرقام مع خالد ← التنفيذ يتطلب كتابة `LINK` والضغط «نفّذ» **بأمر خالد الصريح فقط** ← بعده: «عدّ الملفات» + «إعادة فحص» = التحقق النهائي.

### ✅ Done this session (كل الأرقام مُتحقَّقة بدليل خام)
1. **Sync Local from PROD:** 85/85 جدول · 73 نجح · 12 مُستثنى (فارغ) · 0 فشل · 4,291 وثيقة في 50.5s → `modonty_dev` صار نسخة الإنتاج الطازجة.
2. **التصفير:** زون Bunny `clients` = 972/972 محذوف · 0 فشل · تحقق العدّ الحي بعده = **0 ملف (0 MB)** · زون assets محمي (25 هوية + 53 migrated).
3. **التاسك ١ (نقل المسجّلة):** 441/444 (retry أصلح `fetch failed` عابرة) + قصّات JSON-LD 52 + حذف معلّقة 1. الفشل النهائي = **3 صفوف أصلها محذوف من حساب Cloudinary نفسه (HTTP 404)** — نفس فئة «الميتة الأربعة» من فحص HEAD.
4. **التاسك ٢ (اليتيمة):** 26 نجح → عدّاد اليتيمة 33 → **0**.
5. **التاسك ٣ (الحقول الخام):** 69 نجح → عدّاد الخام 74 → **0**.
6. **التاسك ٤ (regenerate السيو):** 205 نجح · 0 فشل (مقالات 118 · عملاء 29 · تصنيفات 14 · وسوم 23 · صناعات 7 · مؤلفون 1 · صفحات مدوّنتي 6 · قوائم 7). المتبقي الملوّث كان 3 صفوف كلها بسبب الغلافين الميتين.
7. **حسم الغلافين الميتين (قرار خالد: الافتراضية بدل توليد أغلفة):** فك ربط الغلافين من محرر الأدمن (`featuredImageId=null` للمقالين «التقويم الهجري» + «كأس العالم 2026») + فك عنصر معرض ميت من كأس العالم (`articleMedia=0`) + حذف الصفوف الثلاثة من `/media/maintenance` (قائمة Unused). حفظ المقالين أعاد توليد سيوهما تلقائياً → **dirty=0 في القاعدة كلها** · **الوسائط 467/467 كلها بنسخة Bunny (100%)**.
8. **فولباك الافتراضيات بُني ووُصّل (أمر خالد — الشق الأول من بند 65):** helper مشترك جديد `dataLayer/lib/platform-defaults.ts` + مقال بلا صورة → POST الافتراضية + عميل بلا شعار → LOGO + صفحة عميل بلا هيرو → HERO. **تست حي ✓**: مقال «الكلمات المفتاحية» (كان الوحيد بلا صورة) + «التقويم الهجري» بعد الحذف — كلاهما يرندر الافتراضية على :3002.
9. **صفحة `/settings/defaults` رُقّيت للمعيار:** زر «Change from Modonty Library» (تمرير `coreClientId`) + **حذف حقل الرابط اليدوي** (قرار خالد — زر × للإزالة بداله؛ اليدوي يظهر فقط لو الـcore غير مضبوط) + **ريفاكتور UI كامل** (شريط حالة «3/3 configured» + زر الحفظ فوق + شبكة 3 أعمدة + بادج Set/Not set) + رابط جديد بالشريط الجانبي في قروب **System** (بين Bunny Migration وMaintenance).
10. **`Settings.coreClientId` ضُبط على عميل «مدونتي»** من `/settings/system` بالواجهة (كان not set بعد الـSync — القيمة المحلية القديمة ما كانت وصلت الإنتاج). شرط أساسي لزر المكتبة وT2b.
11. **تشخيصات موثقة:** الغلافان مكسوران على **الإنتاج الحي** (og:image 404 + `/_next/image` 404 + سكرينشوت) — المشكلة أقدم من التصفير · فحص «هل الافتراضيات ضمن الترحيل؟» → نعم، صفوف PLATFORM رُفعت في التاسك ١ (تحقق storage بالمفتاح لا CDN) · شرح آلية git للموظف الثاني (رفعة أولى ثم فروع + حماية main).
- **TSC:** لم يُشغَّل (قاعدة خالد — قبل push فقط). **Build:** لم يُشغَّل. **تست حي:** ✓ (النقاط أعلاه، Edge headed أمام خالد طوال الجلسة).

### 📝 Decisions taken (خالد 2026-08-01)
- **الغلافان الميتان → الصورة الافتراضية** (لا توليد أغلفة جديدة) → «if not exist use this default». البديل المرفوض: توليد غلافين مخصصين.
- **صفحة الافتراضيات بلا رابط يدوي** («no manual link») → زر المكتبة فقط + زر × — التعديل في `image-field.tsx` المشترك فينسحب على حقول الإعدادات كلها.
- **الأدمن لا يعرض الافتراضية للمقال بلا صورة** (يعرض «Select Featured Image») — الأدمن = حقيقة البيانات، مدوّنتي = تجربة الزائر. نوقشت وأُقرّت.
- **رابط Default Images في قروب System** (طلب خالد بعد ما وضعته أولاً في قروب Modonty).
- ترتيب متفق: T2b أولاً ثم أي ترقيات لاحقة على الافتراضيات.

### 🚧 Pending / blocked
- **T2b التمليك** — معاينة ثم تنفيذ بكتابة `LINK` — **blocker: أمر خالد الصريح**.
- **التحقق النهائي:** «عدّ الملفات» + «إعادة فحص» في `/bunny-migration` بعد T2b.
- **بند 65 المتبقي:** كشف الملف المكسور وقت العرض (onError) + تنظيف بارام `d_article-placeholder-default` الميت من `OptimizedImage.tsx:55` و`fullOptmizeImage.tsx:293` + فولباك مولّدات السيو.
- **الشغل كله غير مثبّت** — الالتزام بقائمة صريحة عند الـcommit (ممنوع `git add -A`؛ استثناء reels/settings.local.json/.mcp.json).
- ملاحظة dev قائمة: revalidate يستهدف الإنتاج → الكاش المحلي يحتاج restart للسيرفر بعد تعديلات الأدمن (ضربتنا اليوم وحُلّت بـrestart + مسح `.next`).

### 📂 Files touched
- `dataLayer/lib/platform-defaults.ts` — **جديد**: قارئ الافتراضيات الثلاث المشترك (صفوف PLATFORM عبر mediaSrc)
- `modonty/app/articles/[slug]/page.tsx` — فولباك الصورة البارزة → POST الافتراضية (جلب شرطي، صفر كلفة للمسار الشائع)
- `modonty/app/clients/[slug]/components/shell-hero/client-hero-v2.tsx` — prop `defaultImages` + فولباك الشعار والهيرو
- `modonty/app/clients/[slug]/page.tsx` + `components/client-page/client-page-shell.tsx` — جلب/تمرير الافتراضيات
- `admin/app/(dashboard)/settings/_shared/image-field.tsx` — label اختياري + زر مكتبة/× بدل حقل الرابط (اليدوي فقط عند غياب core)
- `admin/app/(dashboard)/settings/defaults/page.tsx` + `components/defaults-form.tsx` — coreClientId + ريفاكتور UI كامل
- `admin/components/admin/sidebar.tsx` — رابط «Default Images» في قروب System
- `documents/tasks/TODO.md` — بند **65** جديد (fallback معطوب مرتين) + تحديث تقدمه (الشق الأول ✓)
- بيانات (dev فقط، كله من الواجهة): Sync كامل · تصفير Bunny clients · تاسكات ١-٤ · فك ربط + حذف 3 صفوف وسائط · `Settings.coreClientId`

### 🔁 Git / deploy state
- Branch: `version-2` · Uncommitted: نعم (~300+ ملف — كل شغل bunny-migration/bunny الجديد + تعديلات اليوم أعلاه)
- Last commit: `4bc4cc2` (T2 modonty core complete) · Pushed: **لا** · صفر مساس بـ`main` · Vercel: لا نشر
- السيرفران: أدمن **:3000** · مودونتي **:3002** (⚠️ البورت تغيّر بعد الـrestart — مو 3001) · القاعدة `modonty_dev` (تحقق صوتي عند كل سكربت قراءة)

### 🚀 How to resume in 30 seconds (من البيت)
1. تأكد السيرفرين: `cd admin && pnpm dev` (3000) + `cd modonty && pnpm dev` (ياخذ أول بورت متاح — راقب الرقم).
2. افتح `localhost:3000/bunny-migration` ← كرت T2b ← زر «معاينة» (قراءة فقط) واعرض الخطة على خالد.
3. القرار الأول: تنفيذ T2b (يكتب `LINK` بأمر خالد) ← بعده «عدّ الملفات» + «إعادة فحص» = قفل الـretest 100%.

---

## Session: 2026-08-01 15:15 — الحلقة النظيفة الكاملة نُفّذت (Sync→تصفير→١-٤) + فحص ختامي كشف ثغرة قصّات الـfallback — الإصلاح مكتوب وينتظر إعادة تاسك ١

### 🎯 Where I stopped
- Last task in progress: **الفحص الختامي بعد اكتمال تاسك ٤** كشف ثغرة جديدة: **30 مسار قصّة ناقص** (= 10 صور × 3 قصّات) في JSON-LD مقالات. **الجذر مؤكد بالدليل:** المقالات الـ10 `featuredImageId = null` → المولّد يسقط على fallback (hero العميل ← logo العميل) ويشتق روابط `__16x9/__4x3/__1x1` منها — وسكوب `featuredCrops` كان يغطي صور `featuredImageId` فقط. **الإصلاح مكتوب داخل الـroute** (توسيع listScope ليشمل صور الـfallback بنفس أسبقية المولّد) لكنه **لم يُشغَّل بعد**.
- Next concrete action when resuming: **قرار خالد (آخر رسالة قبل الإقفال): دورة كاملة من الصفر بالمكتب** — Sync ← تصفير ← تاسك ١-٤ ← فحص ختامي. هذه أول تشغيل حقيقي لإصلاح الـfallback (idempotent). المتوقع: نظيف 100% ما عدا أثر الصور الميتة الثلاث (5 إشارات Cloudinary: مقالا التقويم الهجري/كأس العالم ×2 حقل + settings ×1) — لا تُحلّ إلا برفع بدائل من الأدمن ثم regen.

### ✅ Done this session
- **الحلقة النظيفة الكاملة نُفّذت بالتفويض عبر Playwright** (أمر خالد «شغل إنت واعمل الخطوات كاملة»)، بتحقق مستقل عند كل محطة:
  - Sync من الإنتاج: 91.6s · 444/0/444 ✓ → تصفير 846/846 (تحقق storage: clients=0, assets=78) ✓
  - تاسك ١: 441 مرحّلة (440 + retry واحد transient) + **42 قصّة عبر سكوب featuredCrops الجديد** + 1 رابط معلّق أُصلح + 3 ميتة (مصدرها 404 على Cloudinary) ✓
  - تاسك ٢: 26 يتيمة، صفر فشل → 469/466/3 ✓
  - تاسك ٣: الحقول الخام **NONE من تمريرة واحدة** — إثبات fallback الـsuffix-token في الـresolver ✓
  - تاسك ٤: اكتمل واستقر على **467/470 with-bunny** (الـ3 = الميتات المعروفة) ✓
- **ثغرة قصّات الـfallback:** اكتُشفت بالفحص العميق (`verify-jsonld-full.mjs`) وشُخّصت حتى الجذر (مقال عيّنة: `featuredImageId=null` والقصّات في `Article.image[]` من hero دكتور-محمد-الزهيري) — **الإصلاح**: `cloudinary-to-bunny.ts` سكوب `featuredCrops` يجمع الآن أيضاً `heroImageMedia ?? logoMedia` لعملاء المقالات بلا صورة مميزة (نفس سلسلة `mediaSrc` في `knowledge-graph-generator.ts:451`).
- **راوت `/bunny` جديد تحت System** (أمر خالد): تقرير الوسائط (عدّ DB + مشي الزونات الثلاثة أصلي/قصّات/محمي/migrated) + التقرير المالي (api.bunny.net/billing: رصيد $8.58 · $1/شهر حد أدنى · runway) — `actions/bunny-report.ts` + `page.tsx` + `loading.tsx` + بند سايدبار.
- **مفاتيح Atlas Admin API مفعّلة ومختبرة بالكامل** (نسّقنا مع مريم؛ خالد أضاف قيدي IP `/1+/1` بنفسه): الفواتير + قائمة snapshots + download authorization كلها 200 · `.env.shared` محدّث بالمفاتيح الخمسة · `admin/lib/atlas/atlas-client.ts` يقرأها.
- **إرشاد GitHub لمشروع العميل الجديد:** الريبو صار Private + مسار Add people بالضبط (خالد ينفّذ الدعوة).
- TSC: لم يُشغَّل (قاعدة: قبل الـpush فقط) · Build: لم يُشغَّل · تست حي: الحلقة نفسها كانت التست (Playwright على :3001).

### 📝 Decisions taken (خالد)
- **🔥 «ممنوع Scriptات»** — أي إصلاح داتا لازم يكون داخل route الـbunny-migration نفسه (الإنتاج سيعيد نفس الحلقة، لازم تكون صحيحة 100%). السكربتات القرائية التشخيصية في الـscratchpad مسموحة.
- الروابط المعلّقة تُعالج آلياً داخل الحلقة بدل المعالجة اليدوية مرتين (سكوب danglingLinks: `tag:` حذف / `art:` إسناد platform-default-post).
- تفويض كامل لتشغيل الحلقة عبر Playwright والمتابعة الذاتية.
- قيدا Atlas IP `/1+/1` أضافهما خالد بنفسه بعد رفض مريم المبدئي (Atlas يرفض `0.0.0.0/0`).

### 🚧 Pending / blocked
- **فوري عند الاستئناف:** إعادة ضغط تاسك ١ (توليد قصّات الـ10) ← فحص ختامي شامل ← التقرير النهائي للحلقة.
- **بعد نظافة الحلقة:** ① رفع بدائل الصور الميتة الثلاث من الأدمن (منها غلافا «التقويم الهجري» و«كأس العالم») + regen ← ② تست حي على modonty ‏:3000 (صفر Cloudinary/صور مكسورة) ← ③ حسب TODO سطر 7: T2b التمليك (معاينة←LINK←نفّذ ×2) ← coreClientId ← E2/T9 إطفاء Cloudinary.
- TODO **64**: تقرير Atlas (فواتير + snapshots + زرّ تحميل) في `/database` — بعد إقفال الحلقة.
- على خالد: تحديث `ATLAS_PUBLIC_KEY/PRIVATE_KEY` في Vercel Shared Env · (اختياري) تدوير المفتاح الخاص لاحقاً · دعوة المبرمج على GitHub.

### 📂 Files touched
- `admin/app/(dashboard)/bunny-migration/actions/cloudinary-scopes.ts` — سكوب `featuredCrops` (union + ترتيب + تسمية)
- `admin/app/(dashboard)/bunny-migration/actions/cloudinary-to-bunny.ts` — سكوب featuredCrops (قائمة+تنفيذ، ثم **توسعة الـfallback غير المشغَّلة**) · danglingLinks بـ`tag:/art:` · resolver بـsuffix-token · helpers مشي الزون
- `admin/app/(dashboard)/bunny-migration/components/cloudinary-migration-card.tsx` — توزيع التاسكات الأربعة على السكوبات
- `admin/app/(dashboard)/bunny-migration/actions/storage-inventory.ts` + `components/storage-inventory-card.tsx` — فصل عدّاد migrated/ عن أصول المنصة
- `admin/app/(dashboard)/bunny/` (جديد): `actions/bunny-report.ts` · `page.tsx` · `loading.tsx` — تقرير وسائط + مالي
- `admin/components/admin/sidebar.tsx` — بند Bunny تحت System
- `.env.shared` — بلوك ATLAS (5 متغيرات، مفاتيح مختبرة)
- `documents/tasks/TODO.md` — بند 62 محدّث + بند 64 جديد
- scratchpad (قرائي): `verify-jsonld-full.mjs` · `dump-missing42.mjs` · `sim-featuredcrops.mjs` · `where-in-jsonld.mjs` · `poll-gen/raw2/run2.mjs` وغيرها

### 🔁 Git / deploy state
- Branch: `version-2` · Last commit: `4bc4cc2` · Pushed: **لا** · كل شغل الجلسة **غير مكوميت** فوقه
- ممنوع push/merge بلا إذن صريح جديد · القاعدة `modonty_dev` (الإنتاج قراءة فقط) · السيرفر: أدمن :3001 · مودونتي :3000

### 🚀 How to resume in 30 seconds
1. تأكد سيرفر الأدمن شغال ← افتح `http://localhost:3001/bunny-migration`
2. **دورة كاملة من الصفر** (قرار خالد): Sync ← «احذف كل الملفات» ← تاسك ١ ← ٢ ← ٣ ← ٤ (ممنوع تعديل كود أثناء التشغيل — HMR يقتل الحلقة)
3. `node verify-jsonld-full.mjs` من scratchpad الجلسة ← المتوقع نظيف ما عدا الميتات الثلاث ← ثم رفع بدائلها من الأدمن + regen

---

## Session: 2026-08-01 01:20 — T3 مقفول + زرّ التمليك جاهز بمعاينة حية + صفحة الترحيل مراحل معرّبة — واقفون على ضغط Sync

### 🎯 Where I stopped
- Last task in progress: كل شيء جاهز لتنفيذ **المرحلة ١** من خطة خالد المرحلية في `/bunny-migration` — والسؤال الأخير المعلّق: «نضغط Sync؟» (خالد لم يأمر بعد).
- Next concrete action when resuming: بأمر خالد — **الخطوة ١: زرّ «Sync Local from PROD»** في هيدر الأدمن (روجع كوداً وأُقرّ: ينسخ كل شيء بما فيه ٤٤٤ صف media، يرفض غير `modonty_dev`، الإنتاج قراءة فقط، تقدم حي SSE) ← الخطوة ٢: التصفير (زرّ «احذف كل الملفات» بتقدم حي) ← الخطوة ٣: الترحيل الكامل ← بوابة ← المرحلتان ٢ و٣ (coreClientId + التمليك).

### ✅ Done this session (بعد بلوك 23:55)
- **T3 (تأمين) مقفول:** المؤقتات حُذفت (`bunny-test` + `dataLayer/.tmp-*.mjs` ×٤ + `admin/_mig-*` ×٣ + `CLAUDE.md.backup` + `admin-sweep.json` + console.error التشخيصي) · **commit `4bc4cc2`** على `version-2` (٣١٢ ملفاً، بقائمة صريحة، بلا push؛ المستبعدات الدائمة: reels WIP + `.claude` + `.mcp.json`) · جرد Bunny موثّق في بوابة T3 بالـflow.
- **«المصيبة» أُغلقت (أمر خالد):** `admin/lib/media/sync-entity-image-urls.ts` موصول في `updateMedia` — أي تغيّر لرابط صفّ Media (استبدال/نقل) يعيد كتابة نصوص كل الكيانات المربوطة (العلاقات الخمس + Settings بمطابقة الرابط القديم) ويعيد توليد سيوها المخبوز + revalidate. **مثبت بدورة اتجاهين live** (نقل مدوّنتي↔dream-to-app: الوسم + الميتاداتا + الإعدادات لحقت الرابط، والصفحة الحية og:image صحيح).
- **آخر منفذ PLATFORM أُغلق:** خيار «Modonty — Platform Assets» حُذف من `edit-media-form.tsx` (الخيار + الربط ×٢) — صفر خيار PLATFORM بكل واجهات الأدمن (تست حي).
- **T2b فُكّك لبنود** (لخبطة خالد انحلت): T2b-1 بناء الزرّ · T2b-2 تشغيل التست · T2b-3 الإنتاج (ضمن T5) · T2b-4 قلب القراءة (اختياري) — وبعدها أعيد ضبط الكرت: To Do = أفعال فقط، المنجز في تاب Done.
- **T2b-1 مقفول — الزرّ مبني:** `bunny-migration/actions/link-core-media.ts` + `components/link-core-media-card.tsx` — **معاينة قراءة-فقط تعرض الخطة بنداً بنداً** + تنفيذ idempotent محروس بكتابة LINK. **أرقام المعاينة الحية:** سيُنفَّذ ٥٦ · منجز ٦ · **قرار واحد لخالد:** وسم «خدمات طبية» صورته مملوكة لعميل «متجر باقتك» (الزرّ يتخطّاه). **لغز اليتيمة انحل:** الـ٩ = يتيمتان حقيقيتان + ٧ صفوف PLATFORM.
- **خطة خالد المرحلية اعتُمدت (بلا باكب):** مرحلة ١ = Sync ← تصفير ← ترحيل كامل من الصفر ← بوابة (اللوكال نسخة الإنتاج طبق الأصل) · مرحلة ٢ = coreClientId + حسم القرارات · مرحلة ٣ = التمليك. **تحقّق قراءة-فقط على الإنتاج:** عميل «مدونتي» موجود بالإنتاج **بنفس الـID** `6a0d5ed14fb8550c7ad4bcdb` · `coreClientId` غير مضبوط هناك (ضغطة بعد الـSync) · ٤٤٤ صف media.
- **زرّ Sync روجع سطراً سطراً وأُقرّ:** ينسخ كل المجموعات (media ضمنها) drop+insert بفهارسها؛ يستثني ١٢ مجموعة أحداث خام فقط (تُنشأ فاضية — GA4 مصدرها، صفر علاقة بالصور)؛ حمايات: يرفض غير modonty_dev + معطّل في production runtime.
- **التصفير صار دفعات بتقدم حي:** `wipeBunnyZoneStep` (٦٠/نداء، ١٠ متوازية) + شريط تقدم (X/Y محذوف، أحمر→أخضر) + كشف تعطّل. زون assets يبقى مرفوضاً.
- **صفحة `/bunny-migration` أُعيد ترتيبها = الخطة نفسها** (عناوين مراحل + لافتات خطوات ملوّنة تدل على كل زرّ) **وعُرّبت بالكامل** (طلب خالد — لافتات + كروت + أزرار + نطاقات الترحيل الـ١٢ + toasts؛ أسماء المنتجات لاتيني). فحص آلي: صفر إنجليزي متبقٍ، صفر أخطاء.
- **قاعدة خالد الجديدة محفوظة ومطبّقة:** أي ملف خطة = ٣ تبويبات (⏳ To Do افتراضي · ✅ Done · 📖 Brief) — memory `feedback_plan_files_three_tabs` + طُبّقت على الـflow (الخطورات والقرارات في Brief). و**TODO.md = المفتوح فقط** (السطر الرئيسي أُعيد بناؤه، والمنجز يوثَّق في PRD).

### 📝 Decisions taken (خالد)
- بلا باكب قبل الـSync — اللوكال يُمسح عمداً.
- Sync أولاً ثم كل شيء على نسخة الإنتاج (بدل جولة تست تُمسح لاحقاً).
- صفحة bunny-migration بالعربي كاملة (استثناء من قاعدة أدمن-English — أداة شخصية مؤقتة).
- مصطلحات بسيطة دائماً (Wipe → «احذف كل الملفات»).
- ملفات الخطط = ٣ تبويبات (قاعدة دائمة).

### 🚧 Pending / blocked
- **بانتظار أمر خالد: ضغط Sync** (الخطوة ١، المرحلة ١).
- قرار «خدمات طبية» قبل التنفيذ (أو يُترك — الزرّ يتخطّاه).
- القائمة المفتوحة = سطر ٧ في `documents/tasks/TODO.md` + تاب To Do في الـflow (T2b→T4→T5→T6→T7→T8→T9).

### 📂 Files touched (منذ آخر بلوك)
- `admin/lib/media/sync-entity-image-urls.ts` (جديد — مزامنة المصيبة) + `media/actions/update-media.ts` (الربط)
- `admin/app/(dashboard)/media/[id]/edit/edit-media-form.tsx` — حذف خيار PLATFORM
- `admin/app/(dashboard)/bunny-migration/`: `actions/link-core-media.ts` (جديد) · `components/link-core-media-card.tsx` (جديد — معاينة + تنفيذ + الخطوات المرحلية) · `actions/storage-inventory.ts` (+wipeBunnyZoneStep) · `components/storage-inventory-card.tsx` (تقدم حي + تعريب) · `components/cloudinary-migration-card.tsx` (تعريب) · `actions/cloudinary-scopes.ts` (تسميات عربية) · `page.tsx` (ترتيب مراحل + تعريب)
- `documents/tasks/BUNNY-GOLIVE-FLOW-v1.html` — ٣ تبويبات + أولويات + T2b مفكك + T2b-1/T3 في Done
- حُذفت: bunny-test · .tmp-*.mjs ×٤ · _mig-* ×٣ · CLAUDE.md.backup · admin-sweep.json
- memory: `feedback_plan_files_three_tabs` (جديد) · `feedback_check_datalayer_env` (مصحّح) · `feedback_todo_file_rules` (مكمّل)

### 🔁 Git / deploy state
- Branch: `version-2` · Last commit: **`4bc4cc2`** (T2 core كامل، ٣١٢ ملفاً) · Pushed: **لا**
- Uncommitted بعد الكوميت: شغل هذه الفترة (المزامنة + الزرّ + التعريب + الـflow) — يُضم لكوميت قادم
- ممنوع push/merge بلا إذن صريح · السيرفران: أدمن :3000 · مودونتي :3001 · القاعدة `modonty_dev`
- ⚠️ `dataLayer/.env` = `modonty_dev` (اطبع الـURL كل مرة) · رابط الإنتاج للقراءة موجود hardcoded في `sync-local-from-prod/route.ts`

### 🚀 How to resume in 30 seconds
1. افتح `http://localhost:3000/bunny-migration` — الصفحة نفسها هي الـrunbook بالعربي، مرتّبة مراحل.
2. بأمر خالد: زرّ **Sync Local from PROD** (الهيدر) وراقب التقدم الحي حتى «complete».
3. بعده: «احذف كل الملفات» (اكتب clients) ← الترحيل («تحديد الكل» ← «شغّل المحدد») ← البوابة ← `/settings/system` (coreClientId) ← «معاينة» ← LINK ← «نفّذ» ×٢.

---
