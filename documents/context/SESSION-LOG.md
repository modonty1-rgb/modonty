# Session Context — Last Updated: 2026-07-31

> ⚙️ **ملف نشط = آخر أسبوع فقط** (يتوزّع أسبوعياً لتوفير الـ token عند القراءة).
> الأرشيف الكامل بالأشهر:
> - 🗄️ [يوليو 2026](./SESSION-LOG-2026-07.md)
> - 🗄️ [يونيو 2026](./SESSION-LOG-2026-06.md)
> - 🗄️ [ما قبل يونيو 2026](./SESSION-LOG-archive-until-2026-06-01.md)
>
> 🔄 **تدوير تلقائي أسبوعي** (كلود يسوّيه بنفسه كل جلسة، بلا طلب): أي بلوك `## Session:` أقدم من ٧ أيام من تاريخ اليوم → يُنقَل تلقائياً إلى أرشيف شهره (`SESSION-LOG-YYYY-MM.md`، يُنشأ إن لم يوجد؛ نقل لا نسخ). الجلسات الجديدة تُلحق أعلى قسم الجلسات. الأرشيف الشهري هو السجل الدائم؛ هذا الملف يبقى دائماً ≈ آخر ٧ أيام فقط.
>
> ⛔ **التدوير يمسّ بلوكات `## Session:` فقط.** قسم «معلّقات ثابتة» أدناه **لا يُدوَّر أبداً** — يبقى مهما قدُم عمره حتى يُقفل صراحةً (الشغل غير المنجز هو أهم ما يُحمَل، ولا يجوز أن يسقط بالعمر).
>
> ✅ **تحقّق إلزامي عند كل تدوير (صفر فقدان):** عدّ `grep -c '^## Session:'` في النشط قبل التدوير = (المنقول إلى الأرشيف) + (المتبقّي في النشط). لا تقصّ إلا عند فاصل `---` بين بلوكين، ولا تقطع وسط بلوك.

---

## 🔒 معلّقات ثابتة — لا تُدوَّر (تبقى حتى تُقفل صراحةً)

> هذا القسم **مستثنى من التدوير الأسبوعي**. كل بند = مؤشّر لمصدره الموثوق (لتفادي تضارب النسخ، لا نسخ المحتوى هنا). يُشطب فقط عند إنجازه فعلاً على الإنتاج.

### ⛔ نشر الإنتاج القادم — حسّاس (آخر الليل · إذن خالد صريح · نسخة احتياطية أول)
- [ ] **إدخال محتوى الشروط/الخصوصية** على DB الإنتاج (slugs: `terms` / `privacy-policy`) — مسودات جاهزة في `documents/legal/`.
- [ ] **`prisma db push` على الإنتاج لمجموعة `redirects`** (فيتشر الدمج + 308، مدفوع `b7b7da5`): ينشئ المجموعة + فهرس `@@unique([section,fromSlug])`. الكود يشتغل بدونها (مونجو ينشئ المجموعة عند أول كتابة) لكن **الفهرس الفريد لا يُفرَض** حتى تُنفَّذ. **نسخة احتياطية أولاً**، ثم دمج تجريبي حي على الإنتاج بكيانين. المصدر: `documents/tasks/TODO.md` بند 45.

### ✅ خرجت من المعلّقات (أُنجزت 2026-07-21/22)
- **d5 — فصل الطاقم اكتمل (مدفوع 2026-07-22 `8a7b639`):** حُذفت نسخ `User` القديمة + شِيل `db.staff ?? db.user` (admin 0.95.0، staff-only) + فُعّل ربط Google الآمن (`allowDangerousEmailAccountLinking`، آمن بعد الفصل). المتبقّي اختياري: تنبيهات `userId`→`staffId`. المصدر: `memory/project_pending_d5_remove_staff_fallback`.
- **فصل الطاقم:** نُشر (`118e367`) + رُحّل (10 أدمن→staff بنفس `_id`) + دُوّر `AUTH_SECRET` + تحقّق دخول staff حيّ.
- **معرض العميل + محسّن WebP:** نُشر + اختُبر حيّ على الإنتاج (كيمازون معرض إضافة/حذف · فرسان التعافي WebP −88%).

### 🐇 ترحيل Bunny — نشِط على فرع `version-2` (preview فقط · صفر مساس main)
- [ ] **التبديل (Epic INV) — طبقة القراءة الحيّة اكتملت (2026-07-29):** ٩/١٢ (INV-0·M1..M6·A1·C1) · ٣ تطبيقات tsc نظيف · الرئيسية 45/59 Bunny. **المتبقّي:** ذيل A2 (تبويبات الأدمن ~٨ ملفات) · S1 (نوع S، يحتاج رفع أصول+regenerate) · V1 · **تشغيلات: regenerate السيو + إعادة ترحيل `bunnyUrl=null` + الرفع الجديد→Bunny (الأهم)**. النمط الكامل + الدروس في `BUNNY-MIGRATION-PRD-v1.html` (قسم «🔜 المتبقّي»). المصدر: [[project_bunny_branch_isolation_golden]].
- [ ] **P3-5 تشغيل الترحيل على الإنتاج** — إضافي (`bunnyUrl` فقط)، بإذن خالد، دفعات خارج ذروة مصر.

### 🔮 مستقبلي
- [ ] نقل تخزين معارض العملاء إلى Bunny (Cloudinary مكلف) — آمن بمعمارية Media ID. المصدر: `documents/tasks/TODO.md`.

---

## Session: 2026-07-31 23:55 — 🏁 T2 مدوّنتي core أُقفل 100% + جرد كود شامل + إعادة تنظيم الملفات المرجعية

### 🎯 Where I stopped
- Last task in progress: T2 أُقفل بالكامل (21/21) — واقفون على عتبة **T3 (تأمين)** في BUNNY-GOLIVE-FLOW.
- Next concrete action when resuming: **T3** — commit كل الشغل على فرع `version-2` **بلا push** (بقائمة صريحة، ممنوع `git add -A`) + تنظيف المؤقتات (`modonty/app/bunny-test/` + `dataLayer/.tmp-*.mjs` ×٤ + `admin/_mig-*` + `CLAUDE.md.backup-2026-07-21`) + جرد Bunny — بوابته: git status نظيف.

### ✅ Done this session
- **المرحلة ٤ اكتملت (وبها T2 كله):** p4-settings — زرّ مكتبة مدوّنتي على حقول الإعدادات الستّة عبر ترقية واحدة في `admin/app/(dashboard)/settings/_shared/image-field.tsx` + تمرير `getCoreClientId()` من ٥ صفحات (brand/modonty/tags/categories/industries)؛ دورة وسوم كاملة: القاعدة `tagsPageImage` + المخزّن + HTML الخام (hero+og:image بـcurl). p4-platform-mode — وضع PLATFORM حُذف من `admin/components/shared/media-picker-dialog.tsx` (select المصدر + كل الفروع) + خاصية scope من `media-image-field.tsx`؛ تست حي: صفر خيار مصدر، ٢٤ صورة core. p4-verify ✓ بدورات اليوم.
- **شهادة السجل صارت خاصية (طلب خالد):** حقل `Settings.certificateImageUrl` جديد (سكيما بالطقس الكامل) + مجموعة «Official documents» بزرّ المكتبة في `/settings/brand` + `modonty/app/trust/page.tsx` يقرأه عبر `get-brand-media.ts` مع fallback للملف الثابت — دورة مثبتة بالاتجاهين (اختيار←يظهر، مسح←الثابت يرجع). باقي رفع الشهادة الحقيقية (خالد).
- **`Settings.orgLogoUrl` حُذف نهائياً بأمر خالد** (احتياطي ميّت — الدليل: الموقع الحيّ يرندر الشعار من `logoUrl`): السكيما + ٨ مواضع في `settings-actions.ts` + ٤ fallbacks (authors page/form · build-modonty-author-seo · jsonld-storage) + seed script — صفر مراجع، الصفحات الثلاث تعمل.
- **جرد كود شامل (تقرير بلا تعديل):** `documents/tasks/CODE-IMAGE-AUDIT-2026-07-31.html` — ١٣٢ ملفاً صُنّفت كلها: **صفر مسار رفع نشط لـCloudinary** بالتطبيقات الثلاثة، صفر hardcoded إلا ٣ روابط bunny-test؛ مكتشف جديد: ٤ سكربتات `dataLayer/.tmp-*.mjs`؛ `next-cloudinary` صفر استيراد.
- **إعادة تنظيم مرجعية (قرارات خالد):** `MODONTY-CORE-PLAN-v1.html` **مُقفل** (صفر بند مفتوح — العدّاد 21/21) — قائمة الملكية الستّة نُقلت نصاً بالقياس المحدَّث (يتيمة **٩** · ٤ وسوم+١٤ تصنيف+٧ صناعات؛ المؤلفان والطاقم سقطا) إلى **T2b** والجروب الكامل إلى **T9** في `BUNNY-GOLIVE-FLOW-v1.html`؛ بنود العرض الأربعة («مدوّنتي ليس شريكاً») → ملف جديد `documents/tasks/MODONTY-UIUX-REFACTOR-v1.html`؛ الـflow صار **تابين** (⏳ الباقي بأولوية T3←T2b←T4←T5←T6←T7←T8←T9 مع بادجات · ✅ المنجز والمرجع) وT2 مؤشَّر فيه.
- **تحقّق p5-sitemap:** `/clients/مدونتي` موجودة في sitemap.xml + سطر ١٠٠ من llms.txt (curl).
- **مراجعة الريلز (سؤال خالد):** فلو الكونسول الحقيقي سليم — رفع المعرض ينشئ صفّ Media مملوكاً (`clientId` من الجلسة) + صفّ Reel بانتظار الموافقة (`gallery-actions.ts:55`)؛ الـ١٤ الحالية dry-run بلا صفوف Media (بيانات تست تبقى).
- **`verificationImageUrl` روجع:** دائرته سليمة على المعيار (MediaPicker على مكتبة العميل)؛ تعليقا «Cloudinary» القديمان صُحّحا (سكيما + أكشن، بالطقس).
- TSC: لم يُشغَّل (قاعدة خالد — قبل push فقط). تست حي بالمتصفح: settings/brand + settings/tags + /trust + /tags + الـpicker كلها ✓.

### 📝 Decisions taken (خالد 2026-07-31)
- **TODO.md = المفتوح فقط** — البند المنجز يُحذف؛ توثيق المنجز في ملفات الـPRD (سطر TODO الرئيسي أُعيد بناؤه مفتوحاً فقط + الذاكرة حُدّثت).
- **الإطفاء لا يترك فشلاً صامتاً** — أي لمسة Cloudinary بعد T9 = crash صريح (نمط tripwire؛ القاعدة موثّقة في T9).
- altImage يتعبّأ مع مرحلة المحتوى (الكود مؤكَّد موصولاً fallback في ٨ مواضع توليد).
- أي UI/UX لمودونتي → ملف الـrefactor الجديد فقط.
- علاج بطء الجلسات الطويلة: `us>` + chat جديد عند كل معلم.

### 🚧 Pending / blocked
- القائمة المفتوحة الكاملة = سطر ٧ في `documents/tasks/TODO.md` (D5 ← T2b ← E2/T9 · PERF · UIUX refactor · تنظيف ما قبل الدفع · ملاحظة dev: revalidate الإعدادات يستهدف الإنتاج فاللوكال يحتاج ضربة تاغ يدوية).
- قرارات محتوى عند خالد: رفع الشهادة الحقيقية · صور الصفحات الخمس الباقية · نص altImage.

### 📂 Files touched (الرئيسية)
- `admin/app/(dashboard)/settings/_shared/image-field.tsx` — زرّ مكتبة مدوّنتي (يخدم الحقول الستّة)
- صفحات وفورمات settings الخمس (brand/modonty/tags/categories/industries) — تمرير coreClientId
- `admin/components/shared/media-picker-dialog.tsx` + `media-image-field.tsx` — حذف وضع PLATFORM
- `dataLayer/prisma/schema/schema.prisma` — +`certificateImageUrl` · −`orgLogoUrl` · تعليقات صُحّحت (الطقس ×٣ مرات هذه الجلسة)
- `admin/app/(dashboard)/settings/actions/settings-actions.ts` — الحقل الجديد ٥ مواضع + حذف orgLogoUrl ٨ مواضع
- `modonty/lib/settings/get-brand-media.ts` + `modonty/app/trust/page.tsx` — قراءة الشهادة + fallback
- `admin/app/(dashboard)/clients/actions/clients-actions/update-client-verification-image.ts` — تعليق صُحّح
- documents/tasks: `CODE-IMAGE-AUDIT-2026-07-31.html` (جديد) · `MODONTY-UIUX-REFACTOR-v1.html` (جديد) · `MODONTY-CORE-PLAN-v1.html` (مقفل 21/21) · `BUNNY-GOLIVE-FLOW-v1.html` (تابان + أولويات + T2b/T9 موسّعان + T2 ✓) · `TODO.md` (مفتوح فقط)

### 🔁 Git / deploy state
- Branch: `version-2` · Uncommitted: ~٣٠١ ملف (كل شغل الأيام الأخيرة — الـcommit نفسه هو T3)
- Last commit: `d1a41dc` perf(modonty) · Pushed: لا · **ممنوع push/merge بلا إذن صريح — دمج main ملغى بقرار خالد**
- السيرفران يعملان: أدمن :3000 · مودونتي :3001 · القاعدة `modonty_dev` (تحقّقنا صوتياً عند كل سكربت)
- ⚠️ `dataLayer/.env` يشاور `modonty_dev` الآن (الذاكرة القديمة قالت إنتاج — صُحّحت؛ اطبع الـURL المحسوم كل مرة)

### 🚀 How to resume in 30 seconds
1. افتح `documents/tasks/BUNNY-GOLIVE-FLOW-v1.html` تاب «⏳ الباقي» — **T3 أولوية ١**.
2. نفّذ T3: احذف المؤقتات (bunny-test · .tmp-*.mjs · _mig-* · CLAUDE.md.backup) ← commit بقائمة صريحة (بلا push، بلا add -A، استبعاد reels/settings.local.json/.mcp.json) ← جرد Bunny.
3. البوابة: `git status` نظيف — بعدها T2b (بناء زرّ «Link core media» حسب قائمته الستّة في الكرت).

---

## Session: 2026-07-31 (مساءً) — 🏁 ترحيل Bunny اكتمل: صفر Cloudinary بدليل مزدوج + إصلاح عطل رفع الصور

### 🎯 أين توقّفت
- **ترحيل Bunny انتهى على مدوّنتي.** لا يوجد عمل مفتوح في هذا المسار.
- الخطوة التالية عند الاستئناف: **`E2`** — إزالة كود Cloudinary الميت + مفاتيح البيئة. بعدها مجموعة النشر `D1→D4`.

### ✅ الرقم النهائي (دليل مزدوج مستقل)
```
المسح الحيّ:  174 ok / 0 failed · rendered <img> 2602 · bunny 2602 · cloudinary 0
              JSON-LD: bunny 1246 · cloudinary 0
القاعدة:      صفر Cloudinary عبر ٩ حقول سيو × ٦ كيانات
الكود:        صفر عبر ٢١٩١ ملفاً في التطبيقات الثلاثة (٤ أصناف خلل)
```
٣ راوتات ترجع 404 وليست متعلّقة ببني: `/privacy` (خطأ في قائمة الماسح — الصحيح `/legal/privacy-policy`) · `/articles` و`/authors` (بلا صفحة فهرس بالتصميم).

### ✅ أُنجز
- **🐞 عطل حقيقي كُشف وأُصلح — رفع الصور في الأدمن كان مكسوراً تماماً على ويندوز.**
  - العرض: أي رفع من `/media/upload` يفشل **صامتاً** (لا تنبيه · لا حفظ)، والـaction يرجع في ~100ms.
  - السبب الجذري: `next@16.2.9` يجلب `sharp 0.34.5` كـ`optionalDependency`، والمشروع كان يطلب `^0.35.3`. الاثنان يشحنان `libvips-42.dll` **بنفس الاسم وإصدارين مختلفين** (8.17 مقابل 8.18.3) → ويندوز يحمّل اسم الـDLL مرّة واحدة لكل عملية → `ERR_DLOPEN_FAILED` (خطأ ويندوز 127).
  - الإصلاح: `pnpm.overrides.sharp = "0.34.5"` في الجذر + تثبيت `admin/package.json` على نفس النسخة.
  - التحقّق: بقيت نسخة واحدة في المخزن · الرفع صار 2061ms (رفع حقيقي) · `createMedia` كتب `bunnyUrl`.
  - **الإنتاج لم يكن متأثراً** — لينكس يحمّل `.so` بمسار كامل وsoname مُصدَّر؛ التصادم ويندوزي بحت.
- **غلافا المقالين استُبدلا** (الأصل محذوف من Cloudinary — HTTP 404 فتعذّر ترحيله):
  - «التقويم الهجري» → `post/مدونتي/cover-hijri-calendar.webp` — HTTP 200
  - «كأس العالم 2026» → `post/مدونتي/cover-world-cup-2026.webp` — HTTP 200
  - 1920×1080 · نص بديل ووصف سيو للاثنين · **كله من واجهة الأدمن، صفر سكربتات على القاعدة**.
- **إعادة توليد ٦ نطاقات** من زرّ `/database` (مقالات ٩٢ · عملاء · تصنيفات · وسوم · صناعات · صفحات القوائم) + **حفظ المؤلف `modonty`** من `/authors` (لا يوجد نطاق `authors` في الأداة — فُتح كبند).
- **إصلاحات كود إضافية:** `client-hero-v2.tsx` (سطر واحد أزال Cloudinary من ٢٣ صفحة عميل) · `gallery-lightbox-overlay.tsx` · نوعا الكونسول `GalleryImage` و`MediaWithStats` (تضييق يمحو `bunnyUrl`) · `client-page/types.ts` (فخّ خامد).
- **الـPRD محدَّث:** `C1` · `C2` · `E3` وُسمت منجزة مع صف دليل خام داخل كل بطاقة. العدّاد **15/27**. في `C2` كُتبت **حدود الدليل** صراحةً.
- `tsc` صفر أخطاء على التطبيقات الثلاثة.

### 🔴 تصحيح ذاتي (يُقرأ قبل أي ادّعاء مستقبلي)
أبلغتُ خالد **مرّتين** بأن Cloudinary «صفر» بينما الرقم الحقيقي وقتها كان **٢٠ صورة + ١٣ سيو عبر ١١ مساراً** — قرأتُ سطر ملخّص المسح غلط ونقلته دون تدقيق. صُحِّح فوراً بالأرقام الخام. **الدرس: انسخ سطر الملخّص حرفياً قبل تحويله لجملة.** كذلك تسبّبتُ في إرباك بتكرار «الأدمن والكونسول لم يُمسحا حيّاً» بينما كنتُ أتصفّح الأدمن أمامه — الصياغة كانت مبهمة لا كاذبة.

### 📝 قرارات
- توحيد `sharp` على **نسخة Next** (0.34.5) لا رفع Next لنسختنا — أقل مساس بمُحسِّن صور Next؛ استخدامنا (`metadata`·`resize`·`webp`·`toBuffer`) متطابق في الإصدارين.
- إعادة التوليد من زرّ `/database` لا بسكربت — التزاماً بقاعدة «لا سكربتات DB منفصلة».
- تُرك `console.error` تشخيصي في `upload-image-to-bunny.ts` — الصمت التام هو ما أضاع ٢٠ دقيقة.

### 🚧 معلّق
- **`E2`** إزالة كود Cloudinary الميت + مفاتيح env (البند الوحيد المتبقّي في مسار بني).
- **النشر `D1→D4`:** باكب · بوابة رفع · merge لـmain + دفع + تحقّق حيّ · خطة تراجع.
- **`PERF-0→4` + `C3`:** مشروع أداء منفصل لا علاقة له ببني.
- **ثغرة في أداة الترحيل:** البطاقة **ترصد** `author.jsonLdStructuredData` لكن **لا يوجد نطاق `authors`** يصلحه — يستحق إضافة نطاق.
- **عيب UI:** فشل الرفع لا يُظهر أي تنبيه (`waitForUploadCompletion` يبتلع الخطأ).
- صفّا `Media` القديمان (Cloudinary 404) صارا يتيمين — يزولان بمُنظِّف اليتيمة.
- **الأدمن والكونسول لم تُمسح صفحاتهما بصرياً** — الدليل عليهما كود + قاعدة (كافٍ منطقياً، ليس مسحاً بصرياً).
- **تنظيف إلزامي قبل الدفع:** `admin/_mig-apply.cjs` · `admin/_mig-backup.json` · `admin/_mig-baseline.cjs` · `CLAUDE.md.backup-2026-07-21`.

### 📂 ملفات
- `package.json` (جذر) + `admin/package.json` + `pnpm-lock.yaml` — تثبيت sharp 0.34.5.
- `admin/app/(dashboard)/media/actions/upload-image-to-bunny.ts` — `console.error` تشخيصي.
- `modonty/app/clients/[slug]/components/shell-hero/client-hero-v2.tsx` · `sections/gallery-lightbox-overlay.tsx` · `client-page/types.ts`.
- `console/app/(dashboard)/dashboard/gallery/{actions/gallery-actions.ts,components/gallery-manager.tsx,page.tsx}` · `dashboard/media/{components/media-gallery.tsx,helpers/media-queries.ts}`.
- `documents/tasks/BUNNY-GOLIVE-PRD-v1.html` — `C1`·`C2`·`E3` + شريط الحالة (15/27).
- `documents/tasks/TODO.md` — بندان ٥٩ و٦٠ (منجزان).
- `~/.claude/hooks/auto-approve.mjs` + `~/.claude/settings.json` — إذن تلقائي كامل عدا الحذف (كل المشاريع).

### 🔁 git
- فرع `version-2` · آخر commit `d1a41dc` · **لم يُدفع** · صفر مساس بـ`main` · ~٢٤٤ ملفاً معدّلاً.

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd admin && pnpm dev` (3000 أو 3001 حسب المتاح)
2. افتح `documents/tasks/BUNNY-GOLIVE-PRD-v1.html` → بند **`E2`**.
3. القرار الأول: نبدأ `E2` أم نقفز لمجموعة النشر `D1→D4`؟

---

## Session: 2026-07-31 (تكملة بعد الـrestart) — إذن تلقائي كامل عدا الحذف + المسح الحيّ النهائي

### 🎯 أين توقّفت
- المسح الحيّ النهائي لمدوّنتي (١٧٤ راوتاً) على جهاز مرتاح بعد الـrestart.
- الخطوة التالية عند الاستئناف: قراءة `scratchpad/sweep-final.txt` وتحديث `C1`/`C2` في `BUNNY-GOLIVE-PRD-v1.html`.

### ✅ أُنجز في هذه التكملة
- **الجهاز تعافى:** الرئيسية رجعت **200** (كانت 500 من انهيار Turbopack البيئي `0xc0000142` قبل الـrestart) → المسح صار صالحاً.
- **إذن تلقائي كامل عدا الحذف** (طلب خالد: «ماني قادر أروح على الحمام» من كثرة أسئلة الإذن):
  - سكربت `~/.claude/hooks/auto-approve.mjs` + نسخة في `MODONTY/.claude/hooks/`.
  - مسجَّل عالمياً في `~/.claude/settings.json` تحت `hooks.PreToolUse` بـ `matcher: "*"` → **كل المشاريع**.
  - يرجّع `allow` للكل، و`ask` فقط للحذف · `git push` · إعادة كتابة تاريخ git · سكيما/مسح قاعدة البيانات · `curl -X DELETE|PUT` · حذف Vercel/GitHub · `mkfs`/`dd`.
  - اختُبر على ٧ أوامر — قرار صحيح ١٠٠٪.
  - **يحتاج reload لـ Claude Code** ليسري (الـhooks تُقرأ عند بدء الجلسة). لم يُعمل reload بعد — أُجّل حتى ينتهي المسح لئلا نفقد سيرفر Turbopack الدافئ.
  - سبب اللجوء للـhook: `defaultMode: bypassPermissions` موجود في الإعدادات الثلاثة ومع ذلك الجلسة تسأل، وقوائم `allow` تجاوزت ١٥٠٠ سطراً بلا فائدة.

### 📝 قرارات
- الـhook بدل توسيع `allow` → أي صيغة أمر جديدة كانت تسأل من جديد؛ الـhook يقرر بالنمط لا بالنص الحرفي.
- قائمة `deny` العالمية تُركت كما هي (شبكة أمان). الحذف على ويندوز يمرّ عبر `Remove-Item` وهو ليس في `deny` → يصل للـhook ويسأل خالد.

### 📂 ملفات
- `~/.claude/hooks/auto-approve.mjs` — السكربت (جديد).
- `~/.claude/settings.json` — تسجيل `hooks.PreToolUse` (جديد؛ كان `hooks` فارغاً).
- `MODONTY/.claude/hooks/auto-approve.mjs` — نسخة مرجعية داخل المستودع.
- `memory/feedback_full_permissions_except_delete.md` + مؤشّر في `MEMORY.md`.

### 🔁 git
- فرع `version-2` · آخر commit `d1a41dc` · **لم يُدفع** · صفر مساس بـ `main`.

---

## Session: 2026-07-31 — منع تسريب Bunny من الجذر: `bunnyUrl` إجباري → ٩٢ موضعاً كُشف وأُصلح (فرع `version-2` · local فقط · **لم يُدفع**)

### 🎯 أين توقّفت
- **آخر مهمة:** جعل `bunnyUrl` **إجبارياً** في `MediaSrcInput` — حوّل كل تسريب صامت إلى خطأ ترجمة. **٩٢ موضعاً كُشف، كلها أُصلحت.**
- **الخطوة التالية عند العودة (بعد restart الجهاز):**
  1. `cd modonty && pnpm dev`
  2. شغّل المسح: `node "<scratchpad>/sweep-modonty.mjs" 999`
  3. **المتوقّع: صفر Cloudinary.** المسح السابق **لاغٍ** — كل الصفحات رجعت 500 بسبب انهيار Turbopack البيئي (`0xc0000142` على `globals.css`)، **لا علاقة له بالكود** و`tsc` نظيف.

### ✅ أُنجز هذه الجلسة
- **كرت الترحيل المستقل** في `/database`: ١٠ نطاقات بترتيب مفروض في الكود · شريط تقدّم بنسبة حقيقية · **زر Cancel** يسري عند حدّ الدفعة والمنجَز يُحفظ. **النتيجة: ٣٧٦ ← ٦ صفّاً** على `modonty_dev`، والحقول الخام **صفر**.
- **إعادة تسمية `ClientReview.author` → `reviewer`** بـ`@map("authorId")` — **صفر أثر على البيانات**، أُثبت بقراءة خام من مونجو (الوثيقة ما زالت تحمل `authorId` ولا تعرف `reviewerId`).
- **`B3`** اتساق sitemap الصور + OG مع المرندَر: **١٥/١٥ متسقة**.
- **`bunnyUrl` إجباري** → كشف وإصلاح **٩٢**: مدوّنتي ٣٥ · الأدمن ٥٢ · الكونسول ٥.
- **`tsc`: صفر أخطاء على التطبيقات الثلاثة** (مُتحقَّق مرّتين).
- **`pnpm build`:** لم يُشغَّل. **المسح الحيّ النهائي:** معلّق على إعادة تشغيل الجهاز.

### 📝 قرارات مع سببها
- **`bunnyUrl` إجباري لا اختياري** → الاختياري يجعل `{ url: string }` وسيطاً صالحاً، فيمرّ كل تسريب صامتاً و`tsc` مرتاح. الإجباري ينقل الخطأ لموقع النداء حيث المعلومة فعلاً. **البديل المرفوض:** ملاحقة كل موقع يدوياً — يعالج الحاضر ولا يمنع التكرار.
- **حذف ميزة السوشال بالكامل** بدل إصلاحها (قرار خالد) → أسقط بلوكر `sharp` وشقّ الصور بضربة واحدة.
- **المتصفّح يقود دفعات الترحيل** بدل server action واحد → الأخير ذرّي من جهة المتصفّح: لا نسبة ولا إيقاف ممكنان داخله.

### 🚧 معلّق
- **المسح الحيّ النهائي لمدوّنتي** — يحتاج جهازاً مرتاحاً.
- **إعادة فحص حيّ للأدمن والكونسول** — لم يُعادا بعد تغييرات اليوم.
- **٦ حقول Cloudinary باقية** — سببها **صورتان محذوفتان من Cloudinary (HTTP 404)**، لا أصل يُنسخ؛ تُحلّان برفع غلاف جديد من الأدمن (يذهب لـ Bunny مباشرة).
- **`E2`** إزالة الكود الميت + مفاتيح env، ثم الدفع.

### 📂 أبرز الملفات
- `dataLayer/lib/media-src.ts` — `bunnyUrl` صار إجبارياً + توثيق السبب.
- `dataLayer/prisma/schema/schema.prisma` — `ClientReview.reviewer` + توثيق أن `onDelete: Cascade` وعد بلا ضامن على مونجو.
- `admin/app/(dashboard)/database/actions/cloudinary-to-bunny.ts` + `cloudinary-scopes.ts` + `components/cloudinary-migration-card.tsx`.
- `admin/components/admin/task-progress.tsx` — شريط تقدّم مشترك لأي مهمة طويلة.
- `modonty/app/articles/[slug]/components/article-featured-image.tsx` — كانت تثبّت صورة الـLCP على Cloudinary.
- `modonty/app/clients/[slug]/components/sections/client-gallery-section.tsx` — `src={img.url}` بلا `mediaSrc`.

### 🔁 حالة git
- الفرع `version-2` · آخر commit `d1a41dc` · **٢٣٢ ملفاً معدّلاً غير مثبَّت** · **غير مدفوع** · صفر مساس بـ `main`.
- **`.next` محذوف للتطبيقات الثلاثة** — يُعاد بناؤه عند أول `pnpm dev`.
- **تنظيف إلزامي قبل الدفع:** `admin/_mig-apply.cjs` · `admin/_mig-backup.json` · `admin/_mig-baseline.cjs` · `dataLayer/.tmp-vs.mjs` · `CLAUDE.md.backup-2026-07-21`. وممنوع `git add -A` (الريلز شغل ناقص ومستثنى).

### 🚀 استئناف في ٣٠ ثانية
1. `cd modonty && pnpm dev`
2. شغّل `sweep-modonty.mjs 999` من مجلّد scratchpad
3. لو النتيجة صفر → أقفل `C1`/`C2` في `BUNNY-GOLIVE-PRD-v1.html` وانتقل لـ`E2`

---

## Session: 2026-07-30 16:10 (تكملة) — إقفال البند 51: صنفا خلل جديدان في Bunny + تست حيّ ٧٤ راوتاً + إصلاح صفحة Bing (فرع `version-2` · local فقط · **لم يُدفع**)

### 🎯 أين توقفت
- **آخر تاسك جارٍ:** لا شيء. كل شغل هذه الجلسة **مكتمل ومُتحقَّق حيّاً**، ولا خطوة نصف منجزة.
- **أول إجراء ملموس عند الاستئناف:** ابدأ البند **49** (مراجعة نشر السوشال — آخر تاسك بأمر خالد، وهو **آخر بقعة Cloudinary في الأدمن كلّه**). افتح `admin/app/(dashboard)/social/facebook/_actions.ts:86` وأضف `bunnyUrl: true` للـ select، ثم مرّر `generateInstagramDefaultImage(article.featuredImage.url)` على `mediaSrc()`. المواقع الخمسة كلّها: `social/facebook/page.tsx:31,75` · `social/facebook/[articleId]/page.tsx:26` · `social/facebook/_actions.ts:86,272`.

### ✅ ما أُنجز هذه الجلسة
1. **البند 51 مقفول.** `/articles/workflow/maintenance` من ٢٥ صورة Cloudinary → **٠ Cloudinary / ٢٦ Bunny**.
2. **مسح منهجي بسكربت** (يمشي على الأقواس ويصطاد أي `select` لعلاقة وسائط بلا `bunnyUrl`): رصد **٣١ موقعاً**، عولج **٢٦**، والباقي ٥ في السوشال (البند 49). السكربت كان مؤقّتاً في `C:\tmp` و**حُذف** بعد الاستعمال.
3. **البند 52 (جديد): صفحة Bing Webmaster** — ٣ أخطاء عولجت (التفاصيل الكاملة في `TODO.md` البند 52).
4. `C-ADM` في `BUNNY-GOLIVE-PRD-v1.html` أُقفل بوسم «تست حيّ ✓»، و`TODO.md` حُدّث (51 ✅ · 52 ✅ · 49 اغتنى بمواقعه الخمسة).
- **حالة tsc:** ✅ **صفر أخطاء على الثلاثة** (admin · modonty · console) — آخر تشغيل بعد آخر تعديل.
- **حالة build:** ❌ لم تُشغَّل (`pnpm build` مؤجّلة لما قبل الدفع).
- **حالة التست الحيّ:** ✅ **ناجح.** ٧٤ راوت أدمن على `localhost:3000` · ٣٨٠ صورة `<img>` مرندرة · ٣٠٧ Bunny · **٧٣ Cloudinary كلّها على `/social/facebook` وحده**؛ كل راوت آخر = صفر. زائد `/clients/[id]/edit` على ٣ عملاء (٢ Cloudinary → ٠) وصفحة Bing (جدولان × ١٠ صفوف بصفر تكرار، وصفر `TypeError` في لوق السيرفر).

### 📝 قرارات ودروس (الأهم في هذه الجلسة)
- **صنف خلل ١ — السقوط الصامت:** نداء `mediaSrc()` على `select` ناقص `bunnyUrl` يرجّع Cloudinary **دائماً وبصمت**. `tsc` نظيف، الكود «يبدو» مصحَّحاً، والمخرَج غلط. أخطر ما وُجد لأنه ضرب مولّدات السيو **المخزّن**: `knowledge-graph-generator` · `metadata-storage` · `generate-client-seo-bundle` · `generate-organization-jsonld` · `client-jsonld-storage` · `listing-page-seo-generator` · بناة JSON-LD للرئيسية/الرائج/العملاء. **القاعدة: الإصلاح نصفان — العرض يمرّ على `mediaSrc()` **و** الـ select فيه `bunnyUrl`. نصف واحد = لا شيء.**
- **صنف خلل ٢ — الإخفاء بالكاست:** `client-form.tsx` كان يكتب `as { url?: string }` فيمحي `bunnyUrl` من النوع → `/clients/[id]/edit` ترندر شعاراً وغلافاً من Cloudinary (٢ لكل عميل، تأكّد على ٣ عملاء). **`tsc` لا يشتكي — الكاست نفسه هو الغلط.** ابحث عن `as { url` عند أي جرد قادم.
- **التضييق (narrowing) يكسر عند تبديل الشرط:** استبدال `x?.url` بـ `mediaSrc(x)` في شرط JSX يفقد تضييق TypeScript فتنفجر أسطر تالية بـ «possibly null». **الشرط يبقى `x?.url`** (صفّ الوسائط عنده `url` دائماً، و`bunnyUrl` إضافة فقط) **والقيمة تمرّ على `mediaSrc()`.**
- **درس Bing — «الإصلاح» الأول كان سيخفي الخطأ:** أول حلّ كتبته كان يفلتر الصفوف بلا `Page` فيوقف الانهيار — لكنه كان **يرمي كل الـ١٤٩ صفّاً** ويعرض «No page data yet» وهذا **كذب**. لولا ضرب الـ API الحيّ لتأكّدت أنه «تمام». **القاعدة: لمّا يختفي شيء بعد إصلاح، تحقّق ليش اختفى قبل ما تسمّيه إصلاحاً.**

### 🧪 المنهجية المعتمدة للقياس (لا تُعَد اكتشافها)
عدّ نصوص `res.cloudinary.com` في الـ HTML الخام **إنذار كاذب** — حقل `url` يسكن حِمل RSC كبيانات بالتصميم (ما نلمسه، نضيف `bunnyUrl` فقط). القياس الصحيح: `DOMParser` ← قراءة `<img src>` ← فكّ `/_next/image?url=` رجوعاً للأصل.

### 🚧 معلّق / محجوز
- **البند 49 — مراجعة نشر السوشال.** المعوّق: `sharp ERR_DLOPEN_FAILED` داخل سيرفر Next بينما `require("sharp")` ينجح في node عادي (بعد مسح `.next` و٣ إعادات تشغيل). خالد قرّر إنه **آخر تاسك** («فيه مشاكل من البداية»)، فلا يُبدأ قبل ما يخلص الباقي.
- **البند 50 — كرت الترحيل المستقل** (Cloudinary ← Bunny بزرّ واحد). **ما يدخل Run-All** بأمر خالد. يحتاج: قابلية إعادة تشغيل آمنة + وضع «فحص فقط».
- **البند 47 — تأكيد الموافقة في الكونسول** (إشعار ٨ ثوانٍ ← AlertDialog).
- **C1/C2 — صفحات مدوّنتي** (الخلاصة · صفحة العميل · التصنيفات · الوسوم · الصناعات · المؤلّفون · الريلز · البروفايل) لم تُفحص حيّاً بعد بمنهجية `<img>` المرندرة.
- **تنظيف قبل الدفع (إلزامي):** `admin/_mig-apply.cjs` · `admin/_mig-backup.json` · `admin/_mig-baseline.cjs` · `dataLayer/.tmp-vs.mjs` · `CLAUDE.md.backup-2026-07-21`.

### 📂 ملفات مسّتها هذه الجلسة
- `dataLayer/lib/seo/generate-client-seo-bundle.ts` — `bunnyUrl` في الـ select + الهيرو عبر `mediaSrc`
- `dataLayer/lib/seo/generate-organization-jsonld.ts` — `bunnyUrl` في النوع + الشعار/الهيرو عبر `mediaSrc`
- `admin/lib/seo/knowledge-graph-generator.ts` — صورة المقال + سلسلة الاحتياط + شعار العميل عبر `mediaSrc`
- `admin/lib/seo/metadata-storage.ts` · `admin/lib/seo/metadata-generator.ts` — `bunnyUrl` في الـ select والنوع
- `admin/lib/types/prisma-types.ts` — `bunnyUrl` في أنواع `ArticleWithRelations`/`ClientWithRelations` (٤ مواضع)
- `admin/lib/bing-webmaster/client.ts` — `aggregateBingStats` + توحيد `BingPageStat` مع `BingQueryStat` + توثيق شكل السلك الحقيقي
- `admin/app/(dashboard)/bing-webmaster/page.tsx` — تجميع قبل الترتيب + `safeDecodePath`
- `admin/app/(dashboard)/modonty/setting/helpers/build-{home-jsonld-from-settings,trending-page-jsonld,clients-page-jsonld}.ts` — `mediaSrc` + `bunnyUrl` في الأنواع
- `admin/app/(dashboard)/clients/helpers/client-seo-config/{client-jsonld-storage,generate-organization-structured-data,validators-advanced,media-relation}.ts`
- `admin/app/(dashboard)/articles/helpers/article-seo-config/{generate-article-structured-data,media-relation}.ts`
- `admin/app/(dashboard)/articles/actions/articles-actions/queries/get-article-by-{id,slug}.ts` · `.../mutations/update-article.ts` — الـ select + حِمل السوشال عبر `mediaSrc`
- `admin/app/(dashboard)/articles/actions/gallery-actions.ts` · `admin/app/(dashboard)/clients/actions/clients-actions/get-client-by-id.ts`
- `admin/app/(dashboard)/actions/media-counts.ts` · `admin/app/(dashboard)/seo-images/helpers/load-groups.ts`
- `admin/app/(dashboard)/articles/workflow/{[transition]/page.tsx,quality-check/[articleId]/page.tsx,maintenance/page.tsx,actions/gated-transition.ts}`
- `admin/app/(dashboard)/clients/components/client-form.tsx` — **حذف الكاست `as { url?: string }`** الذي كان يمحي `bunnyUrl`
- `admin/app/(dashboard)/clients/[id]/components/{client-header,client-view}.tsx` · `.../tabs/{details,media-social,seo}-tab.tsx`
- `admin/app/(dashboard)/clients/components/form-sections/{media-section,client-seo-validation-section}.tsx` · `admin/app/(dashboard)/clients/helpers/hooks/use-media-preview.ts`
- `admin/app/(dashboard)/articles/components/{sections/basic-section,steps/metatag-preview-step}.tsx` · `admin/app/(dashboard)/articles/[id]/page.tsx`
- `admin/app/(dashboard)/media/components/media-grid.tsx` · `admin/components/shared/media-picker-dialog.tsx`
- `admin/app/api/articles/[id]/validate/route.ts` · `admin/scripts/compare-failing-vs-working.ts`
- `modonty/app/articles/[slug]/actions/article-data.ts` · `modonty/app/articles/[slug]/components/related-articles.tsx`
- `documents/tasks/TODO.md` · `documents/tasks/BUNNY-GOLIVE-PRD-v1.html` · `documents/context/SESSION-LOG.md`

### 🔁 حالة git / النشر
- **الفرع:** `version-2`
- **تغييرات غير مثبَّتة:** ✅ نعم — ١٨٥ مدخلاً في `git status` (معدّلة + غير متتبَّعة). **لا يوجد commit لأي شغل Bunny بعد.**
- **آخر commit:** `d1a41dc` — `perf(modonty): zero unnecessary client JS on mobile initial + cleaner mobile nav`
- **مدفوع:** ❌ **لا.** صفر مساس بـ `main` أو الإنتاج. الدفع يحتاج **إذناً صريحاً جديداً** (القاعدة الذهبية للعزل).
- **Vercel:** لا نشر من هذه الجلسة.
- **⚠️ عند الدفع:** ممنوع `git add -A` — الريلز شغل ناقص (`modonty/app/reels/` · `documents/reels/` · `modonty-v3-handoff/`) ويُستثنى، وكذلك `settings.local.json` و`.mcp.json`.

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `cd admin && npm run dev` (بورت 3000؛ سيرفر واحد فقط — قاعدة الجهاز).
2. افتح `admin/app/(dashboard)/social/facebook/_actions.ts:86` — أضف `bunnyUrl: true` للـ select ومرّر `generateInstagramDefaultImage` على `mediaSrc()`.
3. **القرار الأول:** هل نلاحق بلوكر `sharp ERR_DLOPEN_FAILED` أولاً (يمنع «Preview Default Image») أم نصلح تسريب Cloudinary الخمسة أولاً ونؤجّل sharp؟ — التوصية: **صلّح التسريب أولاً** (مستقل عن sharp ويقفل آخر بقعة Cloudinary في الأدمن)، ثم لاحق sharp منفصلاً.

---

## Session: 2026-07-30 — إقفال الكونسول والأدمن من Cloudinary + دورة المقال الحيّة كاملة + تست حيّ للأدمن (فرع `version-2` · local/preview فقط · لم يُدفع)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر عمل:** مسح حيّ شامل للأدمن على `localhost:3000` — فحصت **٦٠+ راوت** بقراءة الـ HTML المرندر وفكّ ترميز `/_next/image?url=` لكل `<img>`.
- **النتيجة:** كل الراوتات صفر Cloudinary **ما عدا اثنين مكتشفَين للتوّ**:
  - `/social/facebook` → **٧٣ صورة** ما زالت Cloudinary (تخص بند ٤٩ = مراجعة السوشال، آخر تاسك بأمر خالد).
  - `/articles/workflow/maintenance` → **٢٥ صورة** Cloudinary (لم يُصلَح بعد — **هذه أول خطوة عند الاستئناف**).
- **أول خطوة عند الاستئناف:** افتح صفحة `admin/app/(dashboard)/articles/workflow/maintenance/page.tsx` + مكوّناتها → أضف `bunnyUrl: true` للـ select ومرّر العرض عبر `mediaSrc()` (نفس النمط المكرّر ٨ مرات هذه الجلسة)، ثم أعد الفحص الحيّ للراوت.
- **باقٍ لم يُفحص بعد:** ~٢٠ راوت ثابت (`/settings/disclaimer` · `/settings/industries` · `/settings/jbr-seo` · `/settings/reference-data` · `/settings/social` · `/settings/system` · `/settings/tags` · `/settings/telegram` · `/settings/trending` · `/social/instagram` · `/subscribers` · `/subscription-tiers` · `/system-errors` · `/tags/new` · `/users/new` · صفحات `segment/*`) — أُوقِف الفحص عند طلب الـ restart.

### ✅ أُنجز هذه الجلسة
- **دورة المقال الحيّة كاملة على `modonty_dev`:** رفع صورة داخل المحتوى (`bunny:1 / cloudinary:0`) → بوابة الجودة **21/21** → DRAFT → AWAITING_APPROVAL (أدمن) → موافقة العميل (كونسول) → SCHEDULED → Publish Now → **PUBLISHED** → تحقّق على مدوّنتي: كل طلبات الصور 200 وصفر أخطاء console.
- **الكونسول مُقفَل 100%** (رفع + قراءة): رخصة YMYL صارت `LicenseUpload` → `/api/upload-bunny` · الشعارات الثلاثة تقرأ من `dataLayer/lib/brand-assets.ts`.
- **صورة الزائر في مدوّنتي:** كانت تُخزَّن **base64 داخل قاعدة البيانات** → صارت ترفع على Bunny عبر `modonty/app/api/users/avatar/route.ts` + قفل Zod يرفض `data:` URI.
- **شعار المنصّة (النصفان):** ثوابت الكود + **٦ حقول خام في جدول `Settings`** (`logoUrl` · `logoIconUrl` · `ogImageUrl` · `categoriesPageImage` · `tagsPageImage` · `industriesPageImage`) — نقلها أنزل صفحة المقال من **٥٦ إشارة Cloudinary إلى ١**.
- **٨ مسارات عرض في الأدمن** حُوِّلت لـ `mediaSrc()` + إضافة `bunnyUrl` للـ select + إضافة `.b-cdn.net` لقوائم المضيفين المسموحة (كان غيابها **يُخفي صور Bunny بصمت**).
- **الملفات الوثائقية:** `BUNNY-MIGRATION-PRD-v1.html` **أُقفِل** (60/60 + بانر أرشيف) · `BUNNY-GOLIVE-PRD-v1.html` صار **الملف الحيّ الوحيد** (٢٧ بند، ٦ مشطوبة) · `TODO.md` بنود 47/48✅/49/50.

### 📝 قرارات (بالسبب)
- **كرت الترحيل مستقل، ليس داخل Run-All** (تصحيح خالد) → لأننا نضغطه **مرة واحدة**؛ سؤال الفرز: «هل سنضغطه الشهر القادم؟» لا → كرت مستقل. سُجّل في `memory/project_auto_maintenance_rule` كاستثناء ٢.
- **قاعدة صفر-Cloudinary = قاعدة كود فقط، لا طوارئ** (توضيح خالد: «حأقفل Account» كانت مبالغة) → الحساب يبقى مفتوحاً، الانسحاب هادئ على أيام. خُفِّضت لهجة الملفات الثلاثة.
- **الكود القديم لـ Cloudinary لا يُحذف** → يُحوَّل لـ «فخّ» (`*RETIRED` يرمي استثناء) ليكشف أي مسار خفيّ في الـ local، لا في الإنتاج. مقابل ذلك: أي **مُدقّق يفرض** Cloudinary (مثل `validateHeroImageUrl`) يُزال لأنه يمنع Bunny.
- **قياس «صفر Cloudinary» يكون على `<img>` المرندرة، لا على نص الـ HTML الخام** → لأن `url` (رابط Cloudinary) يبقى في حمولة الـ RSC كبيانات عمداً (لا نلمسه أبداً، نضيف `bunnyUrl` فقط). الخلط بين القياسين يعطي إنذاراً كاذباً.

### 🚧 معلّق / محجوب
- **بند 50** — كرت الترحيل المستقل لمرّة واحدة (٦ حقول Settings + روابط Cloudinary المخبوزة داخل `content` HTML لـ٣ مقالات + regenerate للسيو المخزّن لـ١١٢ مقال). يجب أن يكون **idempotent** + وضع «فحص فقط» قبل التنفيذ.
- **بند 49** — مراجعة نشر فيسبوك/إنستغرام كاملة (**آخر تاسك** بأمر خالد). الكود حُوِّل لـBunny و tsc نظيف لكن **لم يُختبر حيّاً**، ومحجوب بـ`sharp ERR_DLOPEN_FAILED` داخل Next رغم نجاح `node -e "require('sharp')"` — لم يُرقَّع عمداً. + الاكتشاف الجديد: ٧٣ صورة Cloudinary على `/social/facebook`.
- **بند 47** — استبدال تأكيد الموافقة في الكونسول (toast ٨ ثوانٍ) بـ AlertDialog.
- **C1/C2** — بقية صفحات مدوّنتي (الفيد · صفحة العميل · التصنيفات · الوسوم · الصناعات · الكُتّاب · الريلز · البروفايل).

### 📂 ملفات لُمست (أهمّها)
- `dataLayer/lib/brand-assets.ts` — **جديد**: مصدر وحيد لصور المنصّة الأربع على Bunny (بلا `server-only` ليعمل في كل مكان).
- `modonty/app/api/users/avatar/route.ts` — **جديد**: رفع صورة الزائر لـ Bunny (بلا `export const runtime` — يتعارض مع `cacheComponents`).
- `console/.../profile/components/license-upload.tsx` — **جديد** بديل رفع الرخصة.
- `admin/lib/utils/sharp-loader.ts` — **جديد**: محمّل sharp مشترك بـ`createRequire`.
- `admin/.../media/components/media-grid.tsx` · `admin/components/shared/media-picker-dialog.tsx` · `thumbnail-image-view.tsx` · `unused-media-list.tsx` · `client-table.tsx` · `article-table.tsx` · `client-logo-preview.tsx` — كلها تمرّ الآن عبر `mediaSrc()` + `.b-cdn.net` مسموح.
- `admin/.../maintenance/helpers/optimizable.ts` · `maintenance/page.tsx` · `client-galleries/helpers/load-galleries.ts` · `clients/actions/.../get-clients.ts` · `settings/defaults/actions/defaults-actions.ts` — أُضيف `bunnyUrl: true` للـ selects (+ sed شامل غطّى ١٠ مواضع `logoMedia`).
- `documents/tasks/BUNNY-GOLIVE-PRD-v1.html` · `BUNNY-MIGRATION-PRD-v1.html` (مقفل) · `documents/tasks/TODO.md`.

### 🔁 Git / نشر
- Branch: **`version-2`** — آخر commit `d1a41dc` (أداء مدوّنتي). **لا commit هذه الجلسة.**
- تعديلات غير مدفوعة: **نعم، ~151 مسار** (كل شغل Bunny أعلاه + ملفات جديدة untracked).
- Vercel: لا شيء نُشر · **صفر مساس بـ `main`** (القاعدة الذهبية للعزل).
- **حُذفت سكربتات مؤقتة** أنشأتها هذه الجلسة: `admin/scripts/tmp-broken-media.ts` · `tmp-check-media-page.ts` · `tmp-check-maintenance-rows.ts`. **باقٍ للتنظيف قبل الدفع:** `admin/_mig-apply.cjs` · `_mig-backup.json` · `_mig-baseline.cjs` · `dataLayer/.tmp-vs.mjs` · `CLAUDE.md.backup-2026-07-21`.

### 🔢 أرقام تحقّق (دليل، لا تخمين)
- `modonty_dev`: **426** صف ميديا · **424** رابطها Cloudinary · **422** لها نسخة Bunny · **٢ بلا نسخة** · **٣** مقالات فيها روابط مخبوزة في المحتوى · **١١٢** مقالاً فيها Cloudinary داخل السيو المخزّن.
- «صورتان مكسورتان» في `/media` من التمريرة السابقة = **إنذار كاذب**: فحص HEAD لأحدث ٤٠ صورة أعطى **0 فشل**، والفحص الحيّ أعطى `broken: 0` (العدّاد القديم كان يحسب صوراً ما زالت تُحمّل).
- `/modonty/setting` يرجع 404 = **سلوك صحيح**، المجلد فيه `actions/components/helpers` فقط بلا `page.tsx` (الراوت الحقيقي `/modonty/pages/[slug]`). كان خطأً في قائمة راوتاتي أنا.

### 🚀 استئناف في 30 ثانية
1. `cd admin && npm run dev` (يأخذ 3000 إن كانت مدوّنتي مطفأة — انتبه للمنفذ).
2. افتح `admin/app/(dashboard)/articles/workflow/maintenance/` → أصلح ٢٥ صورة Cloudinary بنمط `mediaSrc` + `bunnyUrl` في الـ select.
3. أكمل فحص الـ~٢٠ راوت المتبقّية (القائمة في «أين توقفت»)، ثم اشطب `C-ADM` في `documents/tasks/BUNNY-GOLIVE-PRD-v1.html`.

---

## Session: 2026-07-29 (تكملة) — تنفيذ تبديل قراءة Bunny: طبقة القراءة الحيّة كاملة + مولّدات الأدمن + الكونسول (٣ تطبيقات tsc نظيف · preview/local فقط)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **مُنجز (كود، غير مدفوع):** طبقة قراءة صور مدوّنتي الحيّة **مبدّلة بالكامل** (~٥٥ ملف) + مولّدات سيو الأدمن (A1) + الكونسول (C1) + util الأدمن. **modonty·admin·console = tsc صفر أخطاء.** دليل حي: الرئيسية 45/59 Bunny · صفحة المقال 11/18.
- **أول خطوة عند العودة (بالترتيب):** (1) **ذيل A2** — تبويبات صفحة العميل بالأدمن اللي توصل `client.logoMedia.url` مباشرة (~٨ ملفات: client-view · client-header · tabs/{details,seo,media-social,gallery} · media-grid · thumbnail-image-view) → لفّها بـ `mediaSrc`. (2) **تشغيلات:** regenerate السيو (يفعّل A1 المخبوز) · إعادة ترحيل صفوف `bunnyUrl=null` · **الرفع الجديد → Bunny (الأهم — يوقف نمو Cloudinary)**. (3) S1 (نوع S) · V1 (تحقّق نهائي).

### ✅ ما أُنجز هذه الجلسة (كله tsc نظيف · preview/local)
- **INV-0:** أداة `mediaSrc(m)=m?.bunnyUrl ?? m?.url ?? null` في `dataLayer/lib/media-src.ts` (pure، **بلا server-only** عشان الكمبوننتات client) — تُستورد `@modonty/database/lib/media-src`.
- **INV-M1..M6 (مدوّنتي، ~٥٥ ملف):** كل مُحلّلات الاستعلام (client/article/category/tag/industry/reels-feed) · بروفايل المستخدم (5 helpers) + راوتات `api/users/[id]/*` (4) · صفحة المقال (`article-data.ts`+`article-metadata.ts`+`page.tsx`) + ٨ مكوّنات (related/more-from/lab-cards/gallery/sidebar) · صفحة العميل (page+book+3 helpers+hero-v2+hero-avatar+utils+related-clients+client-page-shell+article-list+client-photos-preview) · صفحات القوائم الأربع (categories/tags/industries/authors + كروت التصنيف) · `lib/seo/index.ts` (JSON-LD الحي) · `sitemap.ts` + `image-sitemap.xml`.
- **INV-A1 (الأدمن، 5 مولّدات):** `structured-data.ts` · `metadata-generator.ts` · `listing-page-seo-generator.ts` · `schema-org-generator.ts` · `open-graph-generator.ts` (knowledge-graph فيه فرع Bunny من Epic 2). + **أصلحت خطأ tsc سابق:** `migrate-media-to-bunny.ts` شِلت `as const` (كان يجعل الـ where readonly).
- **INV-C1 (الكونسول):** `(dashboard)/layout.tsx` · `dashboard/content/page.tsx` · `articles/components/{article-card,article-preview-client}.tsx` + مُحلّلاتها (`article-queries.ts`+`content-queries.ts`). ⚠️ درس: `replace_all` بـ `          url: true,` (10 مسافات) طابق **داخل** سطر 14-مسافة فأضاف `bunnyUrl` مرتين → استخدمت أنماط محدّدة/دي-دَب.
- **A2 جزئي (أعلى رافعة):** `admin/lib/utils/cloudinary-utils.ts` — short-circuit `if (media.bunnyUrl) return media.bunnyUrl;` في `getOptimizedImageUrl`+`getThumbnailUrl`+`generateResponsiveSrcset` → أي عرض أدمن يستخدمها صار Bunny.
- **PRD:** علّمت INV-0·M1·M2·M3·M4·M5·M6·A1·C1 (٩/١٢) + أضفت قسم **«🔜 المتبقّي» أعلى الملف** + صناديق اكتشافات/دروس.

### 📝 قرارات + دروس (مهمة للاستئناف)
- **النمط الذهبي:** `mediaSrc(x)` **دائماً** — يشتغل حتى لو نوع المُستدعي `{url}` ضيّق (تمرير هيكلي + الحقل موجود وقت التشغيل من الـ`select`). النمط المباشر `x.bunnyUrl ?? x.url` **يفشل بـ tsc** على الأنواع الضيّقة (client-hero-v2). لكل `select` علاقة Media: **أضِف `bunnyUrl: true`**.
- **مواقع الإرجاع:** تريد `string|undefined` → `mediaSrc(x) ?? undefined` · تريد `string|null` → `mediaSrc(x)` مباشرة · الحارس الذي يضيّق النوع → `...(client.logoMedia && {` (مش `mediaSrc(...) &&`).
- **🔴 تصحيح كبير:** «صور جسم المقال محفورة في `content`» **تبيّن خاطئاً بالدليل الحي** — كانت **مصغّرات كروت «ذات صلة»** (selects ثانوية متعدّدة الأسطر في `article-data.ts` بلا `bunnyUrl`) — أُصلحت. **ما فيه صور Cloudinary محفورة في محتوى المقال.**
- **الصور الباقية على Cloudinary = بيانات لا كود:** صفوف Media `bunnyUrl=null` (غير مُرحّلة، fallback صح) + حقول نوع S. `optimizeCloudinaryImage` (سطر 119 category-utils) تتخطّى غير-Cloudinary → آمنة على Bunny.
- **🥇 هدف الترحيل الحقيقي (خالد):** **تحكّم بالتخزين لنمو الريلز** (فيديو+صور بحجم غير معروف)، **مو التكلفة**. الريلز أصلاً على Bunny (zone مستقل). تبديل الكود = تكلفة ثابتة مرة واحدة لا تكبر مع عدد الصور. **الأهم القادم = الرفع الجديد → Bunny** (يوقف نمو Cloudinary، يمنع الفخّ).

### 🚧 المتبقّي
- **A2 ذيل** (تبويبات الأدمن direct `.url`) · **S1** (نوع S: socialImage/إعدادات/`lib/brand.ts` LOGO_URL/Author.image — تحتاج **رفع أصول لـ Bunny + تحديث النصوص + regenerate**، مو تبديل قراءة) · **V1** (تحقّق Playwright نهائي «كل الصور 200»).
- **تشغيلات:** regenerate السيو · إعادة ترحيل `bunnyUrl=null` · الرفع الجديد→Bunny · P3-5 (ترحيل إنتاج) · Epic 3.5 (التبديل الحي على prod) · Epic 4 (إيقاف Cloudinary).

### 🔁 Git
- Branch: `version-2` · **لا commit ولا push** هذه الجلسة (كله كود غير مدفوع + PRD/context) · dev server مدوّنتي:3000 على `modonty_dev`. صفر مساس main [[project_bunny_branch_isolation_golden]].

### 🚀 استئناف في ٣٠ ثانية
1. افتح `file:///C:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/BUNNY-MIGRATION-PRD-v1.html` → قسم «🔜 المتبقّي».
2. ذيل A2: لفّ تبويبات صفحة العميل بالأدمن بـ `mediaSrc` (النمط ثابت) + `bunnyUrl: true` في select العميل.
3. ثم التشغيلات (regenerate · re-migrate · new-uploads→Bunny). النمط كامل موثّق في صناديق PRD.

---

## Session: 2026-07-29 — جرد نقاط قراءة الصور (قلب تبديل Bunny) — checklist كامل للتطبيقات الثلاثة · لا كود بعد

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** بنيت **جرد كامل** لكل مكان يعرض صورة في مدوّنتي+admin+console كـ checklist داخل `documents/tasks/BUNNY-MIGRATION-PRD-v1.html` (قسم جديد **«◎ جرد نقاط القراءة»** `data-epic="INV"`، قبل Epic 3.5). خالد قال: **«نكمل بكرة»** — الجرد جاهز للمراجعة، **لم يُبدأ أي كود تبديل**.
- **أول خطوة عند العودة:** خالد يراجع الجرد في الـ HTML. لو ابروف → نبدأ بـ **INV-0**: بناء المُحلّل المشترك `mediaSrc(m) = m?.bunnyUrl ?? m?.url ?? null` في `dataLayer/lib/bunny.ts` + إضافة `bunnyUrl: true` لكل select لعلاقة Media. **ممنوع لمس كود قبل ابروف خالد.**

### ✅ ما أُنجز هذه الجلسة (توثيق + جرد فقط · صفر كود)
- **علّمت المنجز في الـ PRD:** P1-3 · كل Epic 2 (P2-1..5) · P3-1..P3-4 (الترحيل + تحقّق dev). تُركت P3-5 (تشغيل الإنتاج معلّق).
- **دليل حي قاطع (Playwright على preview):** كل الصور تُقرأ من **Cloudinary فقط** — الرئيسية ٥٩/٥٩ · مقال ١٨/١٨ · JSON-LD ١١/١١ كلها `res.cloudinary.com` · **صفر `b-cdn.net`**. Bunny الآن **نسخة محفوظة جنب فقط** (`bunnyUrl`)، صفر قراءة. `bunnyUrl` غير مذكور نهائياً في كود قراءة مدوّنتي (تحقّق grep).
- **بنيت الجرد (١٢ بند):** INV-0 (أداة مشتركة) · مدوّنتي M1-M6 (~٤٠ ملف، لازم تبديل) · admin A1 (مولّدات السيو، حرِج) + A2 (عرض داخلي، تحقّق) · console C1 (داخلي) · S1 (حقول خام) · V1 (تحقّق Playwright).

### 📝 قرارات + اكتشافات معمارية (مهم جداً — قلب التاسك)
- **الصور نوعان:** **[M]** مربوطة بجدول Media (لها `bunnyUrl`، تُحلّ من `media.url`) → التبديل `bunnyUrl ?? url`. **[S]** رابط Cloudinary نصّي مباشر (socialImage · إعدادات · Author.image · User.image) → **بلا `bunnyUrl`، لا يبدّلها الفليب** — تُعالَج بإعادة توليد السيو (P35-3) أو تبقى Cloudinary.
- **🔴 اكتشاف حاسم:** مدوّنتي تقرأ من **طبقتين** — (1) حل حي في الاستعلامات/الكمبوننت · (2) **سيو مخبوز** (`jsonLdStructuredData`+`nextjsMetadata`) يُولَّد في **الأدمن** ويُخزَّن في القاعدة. **فمولّدات السيو في الأدمن جزء من التبديل** (INV-A1)، مو مجرد عرض داخلي.
- **نمط التبديل الأمثل:** المعظم في مدوّنتي يصل `X.logoMedia?.url` / `X.featuredImage?.url` مباشرة (مو كله عبر طبقة استعلام) → الحل = `mediaSrc()` مشترك + `bunnyUrl: true` بكل select، ثم استبدال كل `?.url` بـ `mediaSrc(...)`.
- **admin/console عرض داخلي = Cloudinary يكفي** (تحقّق فقط، لا تبديل) — الهدف أن العام (مدوّنتي) يقرأ Bunny.

### 🚧 معلّق / محجوب
- **INV كامل (التبديل)** — لم يُبدأ؛ ينتظر ابروف خالد على الجرد ثم تنفيذ بند-بند.
- **P3-5 تشغيل الترحيل على الإنتاج** — إضافي بحت (`bunnyUrl` فقط)، بإذن خالد، دفعات خارج ذروة مصر.
- **Epic 3.5 التبديل** = أول خطوة تمسّ الإنتاج. **Epic 4** إيقاف Cloudinary = آخر شي.
- كل العمل على `version-2` (preview فقط) — صفر مساس main [[project_bunny_branch_isolation_golden]].

### 📂 ملفات لُمست
- `documents/tasks/BUNNY-MIGRATION-PRD-v1.html` — علّمت ١٠ بنود منجزة + أضفت قسم «◎ جرد نقاط القراءة» (١٢ checkbox، `data-epic="INV"`).

### 🔁 Git
- Branch: `version-2` · لا commit هذه الجلسة (توثيق فقط) · لا push.

### 🚀 استئناف في ٣٠ ثانية
1. افتح `file:///C:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/BUNNY-MIGRATION-PRD-v1.html` → قسم «◎ جرد نقاط القراءة».
2. خالد يابروف الجرد.
3. ابدأ INV-0: `mediaSrc()` في `dataLayer/lib/bunny.ts` + `bunnyUrl: true` بكل select. ثم M1 (مُحلّلات الاستعلام).

---

## Session: 2026-07-28 (تكملة) — صفر client-JS زائد على الجوال الأولي + تنظيف ملاحة الجوال (مدفوع ✅ `d1a41dc` · modonty 1.83.0 · preview فقط)

### 🎯 أين توقفت
- **مُنجز ومدفوع** لـ `version-2` (`d1a41dc`) — preview فقط، صفر مساس main. الـ preview الجديد حيّ.
- **الخطوة التالية عند العودة:** الحكم النهائي للأداء ينتظر **CrUX الميداني** (يتجمّع لما preview يصير v2 ويجيه ترافيك). اختياري: حذف dead code `TopNavMobileLinks.tsx` · دمج version-2→main (آخر مرحلة فقط، بعد رضا خالد).

### ✅ ما أُنجز هذه الجلسة (تكملة)
- **الشريطان الجانبيان desktop-only → 100% server (صفر JS على الجوال، كل الروابط SSR للسيو):**
  - `DiscoveryCard` (الفئات/الصناعات/الوسوم): تبويبات CSS radio + next/image.
  - `NewClientsCard` (الشركاء): فلتر الصناعة CSS radio + ترتيب الشركاء CSS `order` vars + `PartnerRow` صار server.
- **الـ 3 sheets السفلية (اكتشف/الشركاء/المزايا) → lazy عند أول فتح** (نمط Next.js «load on demand»): `DiscoverSheetContent` + `PartnersSheetContent` (جديدان) + `MazayaSheet` dynamic. الشِل خفيف.
- **تنظيف ملاحة الجوال:** الـ nav العلوي = بحث فقط (شِلنا الشركاء/الرائجة) · الرائجة+البحث → قائمة الـ dots (⋮) · البحث → الشريط السفلي كمان (4 عناصر: بحث/اكتشف/الشركاء/المزايا).
- **الدليل القاطع (bundle scan على build جديد):** صفر مكوّن عميل desktop-only في التحميل الأولي للـ homepage. الـ22 المتبقية = runtime Next.js (7) + ضرورية فعلاً (providers/trackers/ملاحة/شات[الثقيل lazy]/أغلفة feed[الثقيل lazy]).
- **tsc modonty:** صفر أخطاء · **build:** نجح ✅ · **تست حي:** desktop (فلتر 20/2 + ترتيب أبجدي + 28 رابط SSR) + mobile (sheets lazy تنزل عند الضغط، nav نظيف) + صفر أخطاء كونسول.
- **PageSpeed (preview، 3 تمريرات):** TBT نزل لـ **120ms** في 2/3 (كان 280–430) = مؤشّر تقليل client-JS. LCP لسه مختبري متغيّر (4.0↔6.8s، غير قابل للترقيم). Score 73–75.

### 📝 قرارات (بالسبب)
- **CSS-only بدل client** للشرائط: mobile-first indexing يفرض بقاء الروابط SSR (قوقل يقرأ نسخة الموبايل) → ممنوع `dynamic(ssr:false)` يشيل SSR. الحل = server component + CSS radio/order.
- **lazy-on-open للـ sheets** = نمط Next.js الرسمي (`{mounted && <Dynamic/>}`)، مثبّت أصلاً في `MobileMenuClient`.
- **تنازلات ثانوية صُرِّح بها:** أُسقط «ترتيب الصناعات» (chip reorder) + إبراز الشريك النشط (`PartnerRow`) — كلاهما desktop-only وثانوي.

### 🚧 معلّق / محجوب
- **`TopNavMobileLinks.tsx` = dead code** (شِلته من `TopNav`، غير مستخدم) — لم يُحذف (قاعدة: لا حذف بلا طلب). خالد يقرّر.
- **الحكم النهائي للأداء** محجوب على CrUX الميداني (No Data حالياً) [[project_ga4_sot_thermometer]] · [[project_preview_psi_lab_variance]].
- **دمج version-2 → main** = آخر مرحلة فقط، بإذن خالد الصريح [[project_bunny_branch_isolation_golden]].

### 📂 ملفات مُعدّلة (مدفوعة `d1a41dc`)
- جديد: `feed/HomeBottomBar/DiscoverSheetContent.tsx` · `PartnersSheetContent.tsx`
- server: `layout/LeftSidebar/DiscoveryCard.tsx` · `layout/RightSidebar/{NewClientsCard,PartnerRow,NewClientItem}.tsx`
- lazy: `feed/HomeBottomBar/HomeBottomBarShell.tsx`
- ملاحة: `navigatore/{TopNav,MobileMenu,TopNavMobileLinks}.tsx`
- `package.json` 1.82.9→1.83.0

### 🔁 Git / deploy
- **Branch:** `version-2` (تتبّع origin) — صفر مساس main.
- **آخر commit مدفوع:** `d1a41dc` (+ سابقه `b63694d` نفس الجلسة: lean feed query + sidebar logos next/image).
- **preview alias الثابت:** `https://modonty-modonty-git-version-2-modonty-72c2a2ca.vercel.app` [[project_version2_preview_url]].
- **مستبعد دائماً:** `modonty/app/reels/`.

### 🚀 كيف تُستأنف في 30 ثانية
1. `git status` على `version-2`. القياس على preview alias الثابت (PSI بارد + bundle scan حتمي، لا LCP مختبري واحد). `.env.shared` DB = `modonty_dev` (آمن للبناء).
2. bundle scan: `npx next experimental-analyze` ثم سكربت المطابقة (client-reference-manifest × firstLoadChunkPaths) — أعِد كتابته لو ضاع.
3. القرار: حذف `TopNavMobileLinks.tsx`؟ · متى ندمج version-2→main؟

---

## Session: 2026-07-28 — أداء الصفحة الرئيسية (LCP/bundle) على فرع `version-2` (preview فقط)

### 🎯 أين توقفت
- **آخر مهمة:** تشخيص لماذا الشريط السفلي للجوال (`HomeBottomBar`) لا يظهر في متصفح خالد. **⚠️ نقلته مؤقتاً** (`bottom-0` → `top-40`) في `HomeBottomBarShell.tsx:172` عشان خالد يشوفه في اللقطة. **يجب إرجاعه لـ `bottom-0` عند خالد يقول «رجّعه» — قبل أي push.**
- **السبب الجذري المكتشف:** الشريط `dynamic(ssr:false)` → غير موجود في HTML الأولي، يظهر فقط بعد ترطيب الجافاسكربت. على جهاز/اتصال بطيء يتأخّر أو يغيب. الشريط = **الملاحة الأساسية على الجوال** لكنه يعتمد كلياً على JS. ضعف حقيقي (قرار: نخليه SSR للأزرار + sheet lazy؟ معلّق).
- **الخطوة التالية:** (1) إرجاع الشريط لـ bottom-0 عند طلب خالد. (2) قرار NewClientsCard (أدناه).

### ✅ ما أُنجز هذه الجلسة
- **الرافعة #4 (نظافة الباك-إند):** استعلام homepage عجاف `getHomeFeedArticles()` في `app/api/helpers/article-queries.ts` — يسقط join المؤلف (User) + join الصناعة + `wordCount` + `dislikesCount` (البطاقة ما ترندرها). `FeedPost.author`/`dislikes` صارا اختياريين في `lib/types.ts`. `page.tsx` يستخدم الاستعلام العجاف مباشرة.
- **الرافعة #1 (منافسة الصور):** شعارات الشركاء في `RightSidebar/NewClientItem.tsx` من Radix `Avatar` → `next/image`. السبب: Radix يعمل probe عبر `new Image()` عند الترطيب → يجلب 23 شعار full-size على الموبايل رغم `hidden lg:block`. بعد الإصلاح: **تحميل بارد موبايل (PSI) = صفر شعار شريط** (متحقّق).
- **الطرف الثالث (895KB):** مؤكّد `lazyOnload` (GTM + Contentsquare) — لا يمسّ LCP.
- **الخطوط:** أصلاً مثالية (next/font، swap، subset، preload) — لا تُلمس.
- **DiscoveryCard (LeftSidebar) → server component كامل:** تبويبات CSS (radio + `:checked`، صفر JS) + `next/image` بدل Radix Avatar + scroll أصلي. **خرج من bundle العميل** (مؤكّد من client-reference-manifest). وفّر 11KB uncompressed (757→746). كل روابط الاكتشاف تبقى SSR (سيو محفوظ، mobile-first). **تنازل:** أُسقط إبراز الفئة النشطة (كان يحتاج useSearchParams غير متاح تحت `use cache`).
- **tsc modonty:** صفر أخطاء. **build:** نجح ✅.
- **تست حي:** ديسكتوب (تبويبات DiscoveryCard تبدّل، 42 رابط، صفر أخطاء كونسول) + موبايل (رندر سليم، sheet الشركاء يفتح ويشتغل) على localhost + preview.

### 📝 قرارات (بالسبب)
- **القياس على preview فقط، لا الإنتاج** (أمر خالد: preview = الإصدار الثاني). alias ثابت للفرع: `modonty-modonty-git-version-2-modonty-72c2a2ca.vercel.app`.
- **PSI المختبري غير موثوق للترقيم:** LCP قفز 3.9↔6.0s عبر 3 تمريرات. الدليل الحتمي = قياس الشبكة/الكود، لا LCP المختبري. CrUX الميداني «No Data». → `memory/project_preview_psi_lab_variance`.
- **الإشارة الثابتة الوحيدة = TBT 280–430ms** (367KB JS حرج) = هدف الرافعة #2.
- **لا نحذف روابط الشرائط الجانبية من SSR** (mobile-first indexing؛ قوقل يقرأ نسخة الموبايل) → التحويل لازم يبقّي الروابط server-rendered.
- **رُفض حذف أزرار الترتيب** من NewClientsCard — تبيّن بالاختبار الحي أنها مستخدمة على الجوال (في الـ sheet).

### 🚧 معلّق / محجوب
- **قرار NewClientsCard (بطاقة الشركاء، RightSidebar):** لسه client، كودها + Radix المشترك (ScrollArea/dropdown) يُشحن على الموبايل الأولي بلا فايدة (الجوال يستخدم sheet منفصل `HomeBottomBarShell`). التحويل لـ server يحتاج **إبقاء الفلتر + الترتيب للكمبيوتر** عبر CSS كامل (فلتر radio + ترتيب order vars) — معقّد، مخاطرة أعلى. الكسب الأكبر (~15KB مضغوط) مقفول خلفه لأنه يشارك Radix مع DiscoveryCard. **قرار خالد مطلوب:** (أ) تحويل كامل CSS، (ب) نكتفي بـ DiscoveryCard.
- **ظهور الشريط السفلي (ssr:false):** ضعف — الملاحة الأساسية للجوال تعتمد على JS. اقتراح: SSR للأزرار الـ3 + sheet lazy. معلّق.
- **تثبيت/نشر:** DiscoveryCard جاهز لكن 11KB وحده صغير — يُفضّل يُدفع مع NewClientsCard (لو تم) أو منفصل بقرار خالد.

### 📂 ملفات مُعدّلة (غير مدفوعة على version-2)
- `modonty/components/layout/LeftSidebar/DiscoveryCard.tsx` — أُعيد بناؤه server component (تبويبات CSS + next/image). **جاهز.**
- `modonty/components/feed/HomeBottomBar/HomeBottomBarShell.tsx` — **تغيير مؤقت فقط** (`bottom-0`→`top-40`، سطر 172). **يجب إرجاعه.**

### 🔁 Git / deploy
- **Branch:** `version-2` (تتبّع `origin/version-2`) — صفر مساس بـ main (قاعدة ذهبية).
- **آخر commit مدفوع:** `b63694d` — «perf(modonty): lean homepage feed query + sidebar logos via next/image» (modonty 1.82.9). دُفع لـ version-2، Vercel بنى preview.
- **غير مدفوع:** DiscoveryCard (جاهز) + HomeBottomBarShell (تغيير مؤقت — يُرجَّع أولاً).
- **مستبعد دائماً:** `modonty/app/reels/`.

### 🚀 كيف تُستأنف في 30 ثانية
1. `git status` — تأكّد على `version-2`. أرجِع HomeBottomBarShell لـ `bottom-0` (شِيل التغيير المؤقت `top-40`).
2. افتح `modonty/components/layout/RightSidebar/NewClientsCard.tsx` — قرار التحويل (أ CSS كامل / ب نكتفي بـ DiscoveryCard).
3. القياس دائماً على preview alias الثابت، PSI بارد + قياس شبكة حتمي (لا LCP مختبري واحد). `.env.shared` DATABASE_URL = `modonty_dev` (آمن للبناء).

---

## Session: 2026-07-27 (تكملة) — drill-down لشريط صحة العملاء بالداشبورد (مدفوع ✅ `8bedb8f` · admin 1.7.0)

### 🎯 أين وقفت
- **مدفوع.** آخر تاسك: chips لوحة صحة العملاء صارت قابلة للنقر + push + us.
- **الخطوة التالية:** تعميم نفس الـ drill-down على شريط **المقالات** (نفس المكوّن المشترك `SeoHealthCard`، حالياً chips المقالات عدّاد عادي بلا نقر) — لو خالد طلب.

### ✅ أُنجز هذه الجلسة
- **شريط «Blocking 100%» في قسم Clients بالداشبورد صار تفاعلياً:** كل chip يفتح **Popover** فيه: (1) **وصف الحقول المطلوبة** لحلّ الفحص — مرفوع من `hint` سكورر العميل نفسه (`computeClientSeoScore`)، صفر تخمين؛ (2) **قائمة العملاء المتأثّرين**، كل اسم رابط `/clients/[id]/edit`.
- **الملفات (4):** `components/seo-check-chip.tsx` (جديد، client + Popover) · `components/seo-health-card.tsx` (استبدل `<span>` بالـ chip + فصل chips الـ **JSON-LD/system** في سطر مستقل تحت سطر المحتوى) · `actions/client-seo-quality.ts` (يجمع `items[]` + `desc` داخل نفس اللوب — بلا استعلام إضافي، سقف 60/فحص) · نوع `SeoCheckTally` (+`items?`, +`desc?`).
- **تست حي:** نقر «Local SEO» → صندوق بالوصف «أضف الإحداثيات وساعات العمل ونطاق السعر وPlace ID» + قائمة العملاء → نقر «Dream to App» → `/clients/6a0e116a…/edit` ✅. JSON-LD chips في سطرهم المستقل + الـ Popover شغّال عليهم.
- **TSC admin:** صفر أخطاء.

### 📝 قرارات
- **الوصف من السكورر لا من قائمة يدوية** (`c.hint` per key) — مصدر واحد، ما يتعارض مع منطق الدرجات، صفر تكرار.
- **`SeoCheckTally.items` اختياري** — قسم المقالات ما يمرّرها فتبقى chipsه عدّاداً عادياً (بلا كسر). التعميم للمقالات لاحقاً.

### 🚧 معلّق
- نفس معلّق الجلسة السابقة: `prisma db push` على الإنتاج لمجموعة `redirects` (بند ثابت أدناه) — مستقل عن هذه الدفعة.

### 📂 ملفات مسّت
- admin: `app/(dashboard)/components/seo-check-chip.tsx` (جديد) · `app/(dashboard)/components/seo-health-card.tsx` · `app/(dashboard)/actions/client-seo-quality.ts` · `package.json`.

### 🔁 Git / نشر
- Branch: main · Pushed: نعم `8bedb8f` (بلا backup — push>) · Vercel: نشر admin تلقائي · admin 1.7.0 (admin فقط — لا modonty ولا سكيما).

### 🚀 استئناف في 30 ثانية
1. `cd admin && pnpm dev` (بورت 3000) → `/` → مرّر لقسم Clients → اضغط أي chip بشريط صحة السيو.
2. للتعميم على المقالات: عبّئ `items` + `desc` في `article-seo-quality.ts` (نفس نمط `client-seo-quality.ts`).

---

## Session: 2026-07-27 — دمج/نقل الكيانات الثلاثة (Tag·Category·Industry) + آلية 308 (مدفوع ✅ `b7b7da5` · admin 1.6.0 · modonty 1.82.0)

### 🎯 أين وقفت
- **الميزة كاملة ومدفوعة.** آخر تاسك: دمج Industry + تست حي 100% + push + us.
- **الخطوة التالية عند الاستئناف:** (1) `prisma db push` على الإنتاج لمجموعة `redirects` + الفهرس (نسخة احتياطية أولاً) ثم دمج تجريبي حي على الإنتاج بكيانين. (2) تست أب/ابن التصنيف محلياً (إعادة ربط الأبناء لم تُختبر حياً).

### ✅ أُنجز هذه الجلسة
- **الكيانات الثلاثة كاملة (دمج/نقل → 308 → حذف المصدر):**
  - **Tag→Tag** (`merge-tag-actions.ts`): transaction dedup على `@@unique[articleId,tagId]` + نقل + 308 + audit؛ يعيد توليد سيو كل مقال (`articleSection`/keywords).
  - **Category→Category** (`merge-category-actions.ts`): بلا dedup (categoryId مفرد) + **إعادة ربط الأبناء** (`parentId`) + حجب الدمج في حفيد (منع دورات) + 308.
  - **Industry→Industry** (`merge-industry-actions.ts`): ينقل **العملاء** (`Client.industryId`) + يعيد توليد سيو كل عميل عبر `generateClientSeoBundle` المشترك (knowsAbout) + 308. **صفر تشعّب لمقالات العميل** (Organization node للمقال ما يحمل الصناعة — مؤكَّد من `knowledge-graph-generator.ts`).
- **UI موحّد للثلاثة:** ديالوج عمودين + dropdown يفتح أسفل الحقل (بلا scroller في جسم الديالوج) + معاينة أثر بأرقام حقيقية + بوابة كتابة اسم المصدر + progress عنصراً عنصراً + شاشة اكتمال. زر GitMerge بنفسجي · قفل الحذف ما دام فيه روابط (مقالات/أبناء/عملاء) · بادج amber «0 · Empty».
- **آلية 308 في modonty (خطوة 1):** موديل `Redirect{section,fromSlug,toSlug,@@unique}` · `lookupRedirect` (كاش fail-closed) في `archive-cache.ts` · سطر في `proxy.ts` (بعد isLive قبل 410) → `NextResponse.redirect(url, 308)`. متحقّق من 4 مصادر رسمية.
- **إصلاح عدّاد الوسم:** كان التضارب (قائمة 5 مقابل تفاصيل 4) لأن `tag-view.tsx` يعدّ المنشور فقط؛ وُحِّد لـ`totalArticlesCount` (كل الروابط) + «(N published)» ثانوي. (التصنيف/الصناعة نظيفان أصلاً.)
- **TSC:** admin 0 · modonty 0. **Build:** لم يُشغّل (tsc فقط). **تست حي:** ناجح 100% لكل كيان (تتبّع مقال/عميل محدّد قبل/بعد من المحرّر نفسه، مو من العدّاد).

### 📝 قرارات (مع السبب)
- **الأبناء في دمج التصنيف → إعادة ربط تلقائي بالوجهة** (اختيار خالد) بدل الحجب — عشان المصدر يصير فارغاً وقابلاً للحذف تماماً. الأبناء لا يحتاجون إعادة توليد سيو (breadcrumb التصنيف مسطّح، لا يحمل اسم الأب — مؤكَّد).
- **حجب دمج تصنيف في أحد أحفاده** — يمنع دورة هرمية عند إعادة ربط الأبناء.
- **إعادة استخدام `regenerateArticleSeoForMerge`** (عامة) للوسم والتصنيف؛ الصناعة تستخدم `generateClientSeoBundle` (مختلفة لأن المرتبط عميل).
- **التتبّع للتحقّق = المحرّر نفسه** (حقل الوسم/التصنيف/الصناعة على العنصر) مو عدّاد الكيان (العدّادات تختلف بتعريفها عبر الصفحات).

### 🚧 معلّق / محجوب
- `prisma db push` على الإنتاج (blocker: يحتاج backup + إذن صريح؛ push> تخطّى الـ backup).
- تست أب/ابن التصنيف حياً (لا مصدر تجريبي عنده أبناء).

### 📂 ملفات مسّت
- admin: `lib/redirect/record-redirect.ts` · `lib/audit/log-action.ts` · `tags/actions/merge-tag-actions.ts` + `tags/components/{tag-merge-dialog,tag-row-actions,tag-table}.tsx` + `tags/[id]/components/tag-view.tsx` · `categories/actions/merge-category-actions.ts` + `categories/actions/categories-actions/get-categories.ts` + `categories/components/{category-merge-dialog,category-row-actions,category-table,categories-page-client}.tsx` · `industries/actions/merge-industry-actions.ts` + `industries/components/{industry-merge-dialog,industry-row-actions,industry-table}.tsx`.
- modonty: `proxy.ts` · `lib/archive-cache.ts`.
- schema: `dataLayer/prisma/schema/schema.prisma` (موديل Redirect).
- docs: `documents/tasks/TODO.md` + `documents/tasks/merge-dialog-mockup-v1.html`.

### 🔁 Git / نشر
- Branch: main · Pushed: نعم `b7b7da5` (بلا backup — push>) · Vercel: نشر تلقائي admin+modonty.
- نسخ: admin 1.6.0 · modonty 1.82.0.

### 🚀 استئناف في 30 ثانية
1. `cd modonty && pnpm dev` (بورت 3000) — أو الإنتاج.
2. للإنتاج: نسخة احتياطية → `prisma db push` (redirects) → دمج تجريبي حي بكيانين.
3. أو محلياً: تست أب/ابن التصنيف (أنشئ تصنيفاً فرعياً تحت مصدر وادمج).

---

## Session: 2026-07-26 (مساءً-٢) — توحيد المؤلف = منظمة (Organization) + industries + YMYL + خطوة /seo (مدفوع ✅ `11ba323` · admin 1.5.0 · modonty 1.81.0)

### 🎯 أين توقفت
- **آخر مهمة:** توحيد المؤلف (مدوّنتي) ككيان `Organization` واحد — **مكتمل ومدفوع**. خالد **مش مقتنع بصفحة الـAuthor** ويبي نكمّل فيها لما يرجع (بعد restart للجهاز — صار ثقيل).
- **الخطوة التالية عند العودة:** (١) نقاش/تعديل صفحة الـAuthor حسب اعتراض خالد (غير محدّد بعد — يبيّنه). (٢) موضوع `admin/lib/gsc/indexing.ts` (طلب نقاش). (٣) اختياري: محاذاة عقدة `#organization` في صفحة المقال + نواقص E-E-A-T (foundingDate/knowsAbout).

### ✅ أُنجز هذه الجلسة (كله مدفوع `11ba323`)
- **توحيد المؤلف = Organization (الجذر):** كان مدوّنتي `Organization` على المقالات لكن `Person` على صفحته وفي الأدمن (تعارض هوية E-E-A-T). أُصلح: JSON-LD المخزّن صار `Organization` بـ`@id = ${siteUrl}/#organization` (نفس كيان الموقع + author المقال → كيان واحد موثوق). أُكّد رسمياً عبر Context7 (Google: author يصح Organization). الأفراد مستقبلاً يظلّون `Person`.
- **بانِ مشترك DRY** `admin/.../authors/helpers/build-modonty-author-seo.ts` — مصدر واحد لـ JSON-LD + metadata، يستخدمه حفظ الفورم **و** خطوة /seo (يمنع الـdrift). يسحب من الإعدادات: `sameAs`(11 قناة) · `contactPoint` · `address` · `areaServed` · `logo`(logoUrl→orgLogoUrl).
- **خطوة صيانة /seo** «Author Identity» — `admin/.../seo/actions/author-seo-repair.ts` + `runSeoStepAuthor` + بطاقة في `seo-auto-maintenance.tsx` + عدّاد التنبيه. تفعّل تاق `authors` طرف-لطرف (`revalidate-modonty-tag.ts` + `modonty/app/api/revalidate/tag/route.ts`).
- **صفحة `/authors/modonty` العامة = بروفايل ناشر** (Track B): شعار بدل أفاتار · شارة موثّق · صفّ القنوات الرسمية (من `getPlatformSocialLinks`) · «أحدث ما نشرته مدوّنتي». تتفرّع: org→publisher، فرد→person.
- **محرّر الأدمن = محرّر ناشر**: ٤ أقسام (Identity · Presence & Contact · Trust · Search/SEO) + قسم **Business Data** read-only يعرض بيانات المنظمة كاملة من الإعدادات (وصف/إيميل/هاتف/ساعات/عنوان جدة + 11 قناة). شِيلت حقول الشخص (Job Title/Expertise/Organizations/Credentials). الهيدر: شعار حقيقي + «Publisher · Organization» + «N channels» (من الإعدادات مو سجل المؤلف).
- **SEO المؤلف عربي:** حدّثت الصف الحالي (title/desc/bio) لعربي بإطار ناشر — **موثّق بإعادة تحميل من القاعدة**. + بذرة `getModontyAuthor` صارت عربية.
- **industries LIST** على معيار الكيانات (مثل category/tag): `get-industries` + seoScore · `industry-table`→DataTable+SeoScoreBadge+تحذير test-slug · `industries-page-client`→كروت KPI فلاتر · حذف `getIndustriesStats`.
- **YMYL fix** على `/clients/seo`: الشارة كانت مربوطة بـ`organizationType` بدل `isYmyl` الحقيقي → أُصلحت (`page.tsx` + `seo-client-list.tsx`).
- **شِيل «Revalidate All»** (مضلّل، يكرّر batch-generate) من category/tag/industry + حذف ملفاته الثلاثة.
- **السايدبار:** «SEO Maintenance»→`/seo` تحت System · «Authors» نُقلت من Content Setup إلى قسم Modonty.
- **حالة tsc:** admin + modonty = صفر أخطاء (بوابة الدفع). Build: لم يُشغّل. تست حي: تمّ (schema=Organization موثّق على `/authors/modonty`، الأدمن موثّق بالدليل).

### 📝 قرارات (مع السبب)
- **مدوّنتي = Organization فقط الآن، الأفراد لاحقاً:** قرار خالد. الأنسب: نوحّد الآن، ولو جاء كتّاب أفراد نتفرّع (Person صحيح لشخص، Organization للبراند).
- **بيانات المنظمة الغنية مصدرها الإعدادات (مصدر واحد)، مو حقول جديدة على سجل المؤلف** — نفس فلسفة منع الـdrift.
- **الشعار «M» كان غلطي (تخمين):** تأكد لاحقاً أنه محمّل فعلاً (svg 150×150) — كانت لقطة قبل التحميل. خالد نبّه: صفحة الـAuthor **ممنوع فيها تخمين**.

### 🚧 معلّق / مطلوب من خالد
- **تفعيل توحيد المؤلف على الإنتاج (بعد نشر Vercel):** `admin.modonty.com/seo` → Run All SEO Fixes (خطوة Author) **أو** افتح المؤلف واحفظ → يقلب المخزّن لـ`Organization` → تحقّق `modonty.com/authors/modonty` → **GSC Request Indexing** للصفحة.
- **صفحة الـAuthor:** خالد غير مقتنع — ينتظر تفصيله.
- **الإحداثيات (geo) عمداً مو في سكيما Organization** (للـGBP فقط).

### 📂 ملفات لمست (كلها مدفوعة `11ba323` — 30 ملف)
- admin authors: `get-modonty-author.ts` `update-author.ts` `author-form.tsx` `author-seo-config.ts` `page.tsx` + جديد `helpers/build-modonty-author-seo.ts`
- admin seo: جديد `actions/author-seo-repair.ts` · `run-seo-maintenance.ts` · `seo-auto-maintenance.tsx` · `page.tsx`
- admin industries: `get-industries.ts` `index.ts` `industries-page-client.tsx` `industry-table.tsx` `page.tsx` (حذف `get-industries-stats.ts` + `revalidate-all-seo-button.tsx`)
- admin: `clients/seo/{page.tsx,components/seo-client-list.tsx}` (YMYL) · `categories/page.tsx` + حذف زره · `tags/page.tsx` + حذف زره · `components/admin/sidebar.tsx` · `lib/revalidate-modonty-tag.ts` · `package.json`
- modonty: `app/authors/[slug]/page.tsx` · `app/api/revalidate/tag/route.ts` · `lib/brand.ts` (+`MODONTY_AUTHOR_SLUG`) · `package.json`

### 🔁 Git / deploy
- فرع: `main` · Last commit: `11ba323` — "author: unify Modonty as one Organization publisher…" · مدفوع: **نعم** (`70feebc..11ba323`) · Vercel: ينشر تلقائياً · باك أب: **لا** (push> urgent).

### 🚀 استئناف في 30 ثانية
1. `taskkill //F //IM node.exe` ثم `cd admin && pnpm dev` (منفذ 3000؛ الأدمن هو الـ default هذه الجلسة). المؤلف: `localhost:3000/authors`.
2. اسمع اعتراض خالد على صفحة الـAuthor (public `/authors/modonty` أو محرّر الأدمن؟) قبل أي تعديل — **صفر تخمين على هذي الصفحة**.
3. بعدها: افتح `admin/lib/gsc/indexing.ts` للنقاش.

---

## Session: 2026-07-26 (مساءً) — معيار كيانات الأدمن + توحيد سكورر السيو + توحيد category بالكامل (مدفوع ✅ admin 1.4.0 · modonty 1.80.1)

### 🎯 أين توقفت
- **آخر مهمة:** توحيد category على المعايير — اكتمل. **الخطوة التالية:** تكرار **معايير القائمة** (KPI فلاتر + عمود SeoScoreBadge في DataTable) على **tags · authors · industries** (السكورر مهاجَر عندهم أصلاً؛ يبقى القائمة).
- **استئناف:** افتح skill `admin-entity-standard` (المعايير الخمسة) + كرّر نمط قائمة category على tags أول.

### ✅ أُنجز
- **🧠 skill جديد `admin-entity-standard`** (`.claude/skills/`): ٥ معايير مقفلة بمصادر كود + skeletons — #1 توجل `CountTab` · #2 `SeoScoreBadge` (Google G، بلا كلمة طبقة، clickable→technical) · #3 جدول `DataTable` (زيبرا+فواصل+رؤوس muted+**ارتفاع صف 40px مقفل best-practice: Material −3/Carbon md/Ant small**) · #4 كرت KPI = فلتر · #5 صفحة technical (جيج+طريق+ملكية writer/system+META/JSON-LD خام).
- **🥇 توحيد سكورر السيو:** category/tag/author/industry هُوجرت من SEO-doctor القديم (يفحص حقول يدوية → إنذار كانونيكال كاذب) إلى **`computeReferenceSeoScore`** (dataLayer، يقرأ الميتاداتا+JSON-LD الفعليين — نفس عائلة article/client). **الكانونيكال الكاذب انحل جذرياً** (تحقيق إنتاج: كل الصفحات تُخرج canonical صحيح www single-encoded؛ الحقل اليدوي فاضي عمداً).
- **category كامل:** قائمة (DataTable+KPI فلاتر+عمود SEO+slug محذوف) · تفصيل (badge موحّد+عدّاد 58 مو 50+جدول=ArticleTable) · technical (`ReferenceSeoTechnical` مشترك).
- **`DataTable` المشترك طُوّر** (زيبرا/فواصل/40px) → كل جداول الأدمن تحسّنت تلقائياً.
- **modonty:** «اشترك مجاناً»→«سجّل مجاناً» (12 ملف، مدفوع سابقاً b72fad3) · `sanitize-html` يشيل ألوان inline وقت الرندر · `metadata-generator` حارس البراند المزدوج.
- **كود ميت محذوف:** `category-seo-config` · `tag-seo-config` · `industry-seo-config` · `get-categories-stats` (author-seo-config يبقى — الفورم يستخدمه).
- **tsc: admin 0 · modonty 0.** Live: category (list/detail/technical) 0 console errors.

### 🔁 Git
- admin 1.3.1→**1.4.0** · modonty 1.80.0→**1.80.1**. مدفوع (push> عاجل، بلا backup بأمر خالد).
- reels + temp (`_mig-*`, `.tmp-vs`) + `.claude/settings.local`/`.mcp.json` **مستثناة** (مسارات محدّدة، لا `-A`).

### 🚀 استئناف في 30 ثانية
1. skill `admin-entity-standard` = المرجع.
2. tags: كرّر قائمة category (getTags→seoScore per row · tag-table→DataTable+SeoScoreBadge · KPI في صفحة القائمة).
3. tag/industry detail+technical: الكود مكتمل (يطابق category)، يبقى click-through حيّ.

---

## Session: 2026-07-26 — تنظيف TODO بند-بند (بالرقم) + إصلاحات مودونتي · مدفوع

### 🎯 أين توقفت
- **آخر مهمة:** المرور على بنود `documents/tasks/TODO.md` واحد-واحد بالرقم المرجعي (خالد يعطي رقم → أفحص الكود → fix/remove). أنجزنا ١–٩ (قسم «متوسط» كله). المتبقّي: **🔴 كبير ١٠–١٧** + **🟢 باك لوق ١٨–٤٢**.
- **الخطوة التالية عند الرجوع:** خالد يعطي الرقم التالي (البداية المنطقية: البند ١٠ مراجعة السكيما، أو أي رقم يختاره).
- **قاعدة جديدة مهمة:** الأرقام في TODO **مرجعية ثابتة** بيني وبين خالد — البند المنجز يُحذف، الباقي يبقى برقمه، **بلا إعادة ترقيم**.

### ✅ أُنجز هذه الجلسة
- **TODO مرقّم ١–٤٢** + مكوميت محلياً (`todo: number items for easy reference`).
- **البند ١** — توحيد لفظ زر التسجيل: «اشترك مجاناً» → «سجّل مجاناً» في ١٢ ملف مودونتي (LoginButton + FeedTopBanner + ١٠ نماذج تفاعل/تعليق/تسجيل + MobileMenu)؛ الريلز مستُبعدة. مكوميت محلياً (`modonty: unify register CTA wording`).
- **البند ٢** — حُذف (تعبئة ٢٠ عميلاً — قرار خالد).
- **البند ٣** — حُذف: «المتأخّر» يُحسب من نهاية الاشتراك (`segments.ts`/`get-sales-report.ts`)، لا حاجة لحقل `dueDate`.
- **البند ٤** — حُذف: حارس CTA البرمجي (`reference-data-actions.ts:313` findFirst على labelKey) مكتوب عمداً ليغطّي بلا اعتماد على فهرس الـ DB → دفع الفهرس غير ضروري.
- **البند ٥** — إصلاح البراند المزدوج في `<title>`: أضفت حارس `alreadyBranded` في `admin/lib/seo/metadata-generator.ts` (كان `seoTitle` أصلاً «العنوان | العميل» ثم يضاف العميل ثانية). **متبقّي إنتاج:** Regenerate بعد النشر.
- **البند ٦** — حُذف: ربط CTA للـ١٣ عميلاً يدوي عبر `cta-section.tsx` الموجود، مو كود.
- **البند ٧** — حُذف: خطر rename على dev مغطّى بميموري `project_runall_cloudinary_dev_hazard`.
- **البند ٨** — نقلت شِيل ألوان inline لـ`modonty/lib/sanitize-html.ts` (كان فقط في الأدمن) → المحتوى القديم يتنظّف **وقت الرندر**، بلا كتابة على الـ DB. حُذف البند.
- **البند ٩ (🔴)** — حُذف بعد **تحقيق قراءة-فقط على الإنتاج**: «صفر حجز» **غلط** — فيه **٧ حجوزات** (٥ واتساب + ٢ نموذج). نظرية «disclaimer يحجب» ميتة (النموذج يرسل `disclaimerAccepted:true` ثابت، والسيرفر يتحقق للـYMYL فقط). واتساب هو المسار الفعلي.
- **تدوير SESSION-LOG:** بلوكات 2026-07-18 (٣) نُقلت لأرشيف يوليو. النشط 21→18، الأرشيف 15→18، صفر فقدان.

### 🔁 حالة Git / النشر
- Branch: `main`. آخر كوميت: `b72fad3` (CTA wording).
- **تعديلات غير مكوميتة:** `admin/lib/seo/metadata-generator.ts` (حارس البراند) + `modonty/lib/sanitize-html.ts` (شِيل ألوان) + `documents/tasks/TODO.md`. **لم تُدفع** (خالد: لا push حتى يقول).
- ملفات temp قديمة untracked في `admin/` (`_mig-*.cjs/json`, `dataLayer/.tmp-vs.mjs`) — بقايا سابقة، ليست من هذه الجلسة.

### 📂 ملفات مسّت
- `modonty/components/auth/LoginButton.tsx` · `modonty/components/feed/FeedTopBanner.tsx` · `modonty/components/navigatore/MobileMenu.tsx` + ٩ نماذج مقال/عميل/تسجيل — نص الزر.
- `admin/lib/seo/metadata-generator.ts` — حارس `alreadyBranded`.
- `modonty/lib/sanitize-html.ts` — تمريرة شِيل `color/background-color`.
- `documents/tasks/TODO.md` — حذف ١–٩ + قسم «متوسط» + تحديث قاعدة الترقيم الثابت.

### 🚀 استئناف في 30 ثانية
1. افتح `documents/tasks/TODO.md` — البنود المتبقّية ١٠–٤٢ بأرقامها الثابتة.
2. خالد يعطي رقماً → افحص الكود أول (fix/check/remove حسب قوله).
3. قبل أي push: tsc صفر أخطاء + إذن خالد صريح.

---

## Session: 2026-07-25 18:40 — الرصيد الافتتاحي + تقرير المبيعات أساس نقدي (دُفِع ✅ `fd6a953`)

### 🎯 أين توقفت
- الميزة اكتملت، فُحصت حيّاً 100%، **ودُفِعت على الإنتاج** (`main`: `1d9854d..fd6a953`). Vercel ينشر تلقائياً.
- **الفعل القادم عند الاستئناف:** قرار خالد على **هجرة الـ13 عميل** المحلية (إبقاء/تراجع، الـ backup في ذاكرتي مو في ملف بعد التنظيف) + متابعة Phase 6 (backfill أرصدة القدامى على الإنتاج).

### ✅ أُنجز (tsc نظيف admin/modonty/console · تست حي كامل · backup · version admin 1.3.0)
- **سكيما:** `Client.openingBalance` (Float?) + `Invoice.fromOpeningBalance` (Boolean default false). قُتل node ثم `prisma:generate`. مونجو schemaless فالحقول تظهر عند الكتابة، والـ default يُطبَّق عند القراءة للصفوف القديمة.
- **النموذج المحاسبي (حُسم مع خالد):** دفعة التأسيس = **رصيد افتتاحي** على العميل (تاريخ الدفع = createdAt، الشهور من billingCycle) — تدخل التقرير فوراً بلا فاتورة. عند نشر أول مقال، **Auto Button** في صفحة الحساب يولّد أول فاتورة `PAID` مُعلّمة `fromOpeningBalance` (مربوطة بتاريخ أول مقال)، وهي **مستند لا إيراد جديد** فالتقرير يستثنيها. صفر تكرار.
- **التأسيس** (`create-client-form.tsx` + `create-client.ts`): حقل واحد «الرصيد الافتتاحي» (إلزامي للمدفوع، يتعبّى تلقائياً من الباقة×الدورة، يختفي للحساب الداخلي). شِيلت الفاتورة الافتتاحية القديمة (`issueOpeningInvoice`) من `create-invoice.ts`.
- **Auto Button** (`convert-opening-balance.ts` جديد + بانر في `account-ledger.tsx`): يشتغل فقط لو فيه مقال منشور؛ idempotent (يرفض التكرار عبر علم `fromOpeningBalance`)؛ يستدعي `recomputeSubscriptionEnd` فيغذّي `client.subscriptionEndDate` وكل العدّادات.
- **تقرير المبيعات — أساس نقدي** (`get-sales-report.ts`): المحصّل = أرصدة افتتاحية (بتاريخ createdAt) + فواتير مدفوعة (بـ`paidAt`)، **يستثني `fromOpeningBalance`**، المستحق منفصل، التوزيع الشهري بالتحصيل الفعلي.
- **واجهة التقرير** (`sales-report-view.tsx` + `invoices-table.tsx` جديد): شريط KPIs مضغوط ببادجات — لون ثابت لكل عملة (SAR أخضر · EGP أزرق) عبر كروت الشهور والجداول؛ **كرت «منتهي»** (اشتراكات تجاوزت الانتهاء = تعريف segment expired، عدّاد أحمر)؛ **شِيل كرت المناديب** (منطقة فلوس)؛ جدول الفواتير صار **DataTable** (فرز/بحث/pagination) + عمود النوع (شهري/سنوي) + شارة «رصيد افتتاحي»؛ العنوان صار «فواتير · {الفترة}» يتبع الـ toggle.

### 🧪 التست الحي الكامل (فلوس — مصيبة لو غلط)
- أنشأت مندوب SALES + عميل تست (رصيد 4788 SAR) عبر الواجهة. الرصيد حُفظ، ظهر في العمود الجانبي + التقرير (محصّل/شهر/باقة/مندوب).
- **هجرة 13 فاتورة → أرصدة افتتاحية + علم** على dev (سكربت مؤقت، مع backup): فخّ التكرار اتفعّل عمداً (كل عميل عنده رصيد + فاتورة مدفوعة) — **الإجمالي ثبت 4,788 SAR / 43,282 EGP** (ما تضاعف). أُكِّد بإعادة حساب مستقلة من DB (PASS).
- **ضغط Auto Button حقيقي**: ولّد `MOD-2026-00014` (4788 مدفوعة، نهاية 20 Jul 2027 = أول مقال +12)، والتقرير بقي ثابت. المدفوع في الحساب = مرة واحدة.

### 📝 قرارات
- **الرصيد لا يُصفّر بعد التحويل** → التقرير يقرأ الرصيد دائماً ويستثني الفاتورة المُعلّمة؛ العلم وحده يمنع التكرار.
- **كارت overdue = «منتهي»** (اشتراكات لازم تجدّد) بجانب «المستحق» (المبلغ) — بطلب خالد (الاثنين).
- **الألوان ثابتة بالعملة** (SAR أخضر/EGP أزرق) عبر كل الكروت والجداول.

### 📂 أبرز الملفات
- جديد: `clients/[id]/account/actions/convert-opening-balance.ts` · `clients/sales-report/{page,actions/get-sales-report,components/sales-report-view,components/invoices-table}` · `sales-scope.ts` · `audit-log/*` · `users/lib/roles.ts`.
- عُدّل: `schema.prisma` · `create-client.ts` · `create-invoice.ts` (حذف issueOpeningInvoice) · `account/page.tsx` · `account-ledger.tsx` · `create-client-form.tsx` · `client-form-schema.ts` · `use-client-form.ts` · `form-types.ts`.

### 🔁 حالة git/النشر
- الفرع: `main`. الكوميت: `fd6a953`. **مدفوع ✅**. Vercel: نشر تلقائي جارٍ.
- **مُستثنى (WIP):** `documents/reels/` · `modonty/app/reels/` · `modonty-v3-handoff/` (الريلز لسه ما خلص) + سكربتاتي المؤقتة + config محلي.

### 🚧 معلّق
- **هجرة الـ13 عميل** على dev محلية فقط (ما اندفعت) — قرار keep/revert لخالد.
- **Phase 6:** backfill أرصدة العملاء القدامى على الإنتاج (تحتاج مبالغ فعلية = إدخال يدوي/Run-All بمراجعة) + قيم Business Info للإنتاج.
- المعلّقات الثابتة (شروط/خصوصية على الإنتاج) تبقى.

### 🚀 استئناف في 30 ثانية
1. `git log --oneline -3` (تأكيد `fd6a953` مدفوع).
2. افتح `/clients/sales-report` على الأدمن.
3. القرار: هجرة dev keep/revert؟ ثم Phase 6 backfill.

---

## Session: 2026-07-25 12:35 — نظام المناديب + القسم المالي الموحّد + تقرير المبيعات (لم يُدفع بعد)

### 🎯 أين توقفت
- سلسلة مهام مكتملة ومختبَرة حيّاً، **لم تُدفع بعد**. آخر شي: بطاقات فلتر تقرير المبيعات صارت احترافية (splitter EGP|SAR، العملتان دائماً حتى الصفر، أرقام كاملة بلا K).
- **الفعل القادم عند الاستئناف:** `pnpm tsc --noEmit` في admin → إن صفر → `bash scripts/backup.sh` + version bump + طلب إذن الدفع من خالد.

### ✅ أُنجز (كله تست حي · tsc **لم يُشغّل بعد**)
- **ملخّص المناديب** نُقل من Accounts → **Dashboard/ClientsPipeline** بنمط الصفوف (`GroupLabel` + `PipelineRow`): مناديب خضراء + صف «No sales rep» أصفر يفتح قائمة العملاء غير المسندين.
- **شريط تنقل لاصق للداشبورد** (`dashboard-nav.tsx` جديد): أعلى عنصر لاصق تحت الهيدر الرئيسي مباشرة (`-top-4 sm:-top-6` لإلغاء padding الـ main · لون primary مميّز + blur)؛ الضغط يفتح القسم المطوي ثم يعمل scroll؛ الزر النشط يتتبّع القسم (IntersectionObserver). كل قسم `<section id>` + `scroll-mt-24`.
- **القسم المالي — تأسيس العميل** (`create-client-form.tsx`): كرت موحّد = الباقة (كروت مضغوطة، السعر يتبع الدولة/الفترة عبر `resolvePricing`) + **كرت رابع «🏛️ حساب داخلي/مجاني»** (toggle `isInternal`) + دورة الفوترة (`billingCycle`) + العملة (مشتقّة من الدولة) + **المندوب في طرف الهيدر (إجباري)**.
- **المندوب إجباري في التأسيس فقط** — `clientCreateFormSchema` (superRefine على `salesRepId`) مُمرّر لـ `useClientForm`؛ السكيمة المشتركة تبقى اختيارية.
- **القسم المالي — تعديل العميل**: `SubscriptionSection` أُعيد بناؤه ليطابق التأسيس، ونُقل ليكون **زون مستقل `z-financial`** (رقم 2/6، إعادة ترقيم الزونات)؛ المندوب انتقل من Zone 2 للهيدر، و«داخلي» انتقل من الشريط السفلي لكرت رابع (بقي «⭐ مميّز» بالشريط).
- **تقرير المبيعات** (`/clients/sales-report` جديد + رابط sidebar تحت Accounts): KPIs (محصّل/مستحق/فواتير/مناديب) + أحدث الفواتير + حسب الباقة + حسب المندوب + تنبيه «بلا مندوب». **فلتر شهري ببطاقات pro** (All + ١٢ شهر، badge إجمالي مبيعات كل شهر بفاصل EGP|SAR). يقرأ **كل الفواتير** (مش المسندة فقط). أرقام مطابقة لـ Accounts (مستحق 38,388 EGP).

### 📝 قرارات
- **المندوب: إجباري بالتأسيس، اختياري بالتعديل** → لأن ٢٢ عميل حالي بلا مندوب، وفرضه بالتعديل يعطّل حفظهم. لو أردنا فرضه لاحقاً: نُسند لهم مندوباً أولاً.
- **تقرير المبيعات على كل الفواتير** لا المسندة لمناديب → نظام المناديب جديد ومعظم العملاء بلا مندوب، فالتقرير المقيّد بالمندوب يطلع فارغاً.
- **فصل العملات دائماً** (SAR منفصل عن EGP) → جمعهما خطأ محاسبي؛ 88% مصر/6% سعودية.

### 🐞 فخّ تكرر وأُصلح
- `archivedAt: null` في where استعلام Prisma/Mongo = **صفر صفوف** (نفس فخّ null/absent) → أفرغ التقرير كله. الإصلاح: جلب الفواتير وفلترة المؤرشفة **بالكود** (نفس أسلوب صفحة Accounts).

### 🚧 معلّق
- **tsc admin لم يُشغّل** — إلزامي قبل الدفع (عدّة ملفات + إعادة بناء `SubscriptionSection` + صفحة جديدة).
- لم يُدفع · لم يُعمل backup · version لم تُرفع.
- **المعلّقات القديمة تبقى:** أشّر الخمسة داخلية على الإنتاج + «تحميل الأزرار الافتراضية» (CTA) بعد الدفع.

### 📂 ملفات مُلمسة (هذه الجلسة)
- `admin/app/(dashboard)/components/dashboard-nav.tsx` (جديد) · `page.tsx` (nav + `<section id>`) · `sections/sales-reps-summary.tsx` (نمط الصفوف) · `sections/clients-pipeline.tsx`
- `clients/new/components/create-client-form.tsx` · `clients/helpers/client-form-schema.ts` (`clientCreateFormSchema`) · `clients/helpers/hooks/use-client-form.ts`
- `clients/components/form-sections/subscription-section.tsx` (إعادة بناء) · `edit-workspace/client-edit-workspace.tsx` (زون مالي) · `components/client-form.tsx`
- `clients/sales-report/` (جديد: `page.tsx` · `actions/get-sales-report.ts` · `components/sales-report-view.tsx`) · `components/admin/sidebar.tsx`

### 🔁 Git / نشر
- فرع main. admin version **لم تُرفع بعد** (آخر مدفوع 1.2.0). سكيما: **بلا تغيير** (`salesRepId`/`isInternal`/`billingCycle` مُرحّلة سابقاً).
- **يُستثنى من الدفع كالعادة:** الريلز WIP · `.mcp.json`/`playwright-mcp.config.json` · `.claude/*` · ملفات dash*.md المؤقتة.

### 🚀 استئناف في ٣٠ ثانية
1. `cd admin && pnpm tsc --noEmit` → صلّح إن وُجد.
2. تست حي سريع: `/clients/new` + `/clients/[id]/edit` (القسم المالي) + `/clients/sales-report`.
3. backup + version bump + اطلب إذن الدفع.

---

## Session: 2026-07-25 00:50 — عدّادات الاشتراك + حسابات داخلية + تحسين المزامنة (admin 1.2.0) · مدفوع

### 🎯 أين توقفت
- مهمة متكاملة اكتملت وتُدفع الآن. الجلسة تلت مزامنة الإنتاج → dev (نسخة طبق الأصل)، وعالجنا ملاحظات خالد على المحاسبة.

### ✅ أُنجز (كله تست حي + tsc admin صفر · التفاصيل في `documents/tasks/TODO.md`)
- **عدّاد «Subscription expired» كان يطبع 0** (يقرأ علم `subscriptionStatus=EXPIRED` الميت) → صار **بالتاريخ** = 3. **فخّ مونجو ثالث:** `{lt:now}` يطابق الحقل الغائب → 13 بدل 3؛ الإصلاح `{lt:now, not:null}`.
- **«Renewal date missing» كان يخلط نوعين** → فُصل: يعرض **ACTIVE + له مقال منشور + بلا تاريخ** فقط؛ العميل بلا مقال مستبعد (اشتراكه ما بدأ).
- **Accounts: كرت «منتهي» (وردي) منفصل عن «قرب الانتهاء» (بنفسجي)** — كانا مدموجين.
- **إجراءات المقاطع منطقية** (لا «Edit» أعمى): Statement/Fix SEO/Fix CTA/Add image/Open حسب مكان الحل.
- **🏛️ حسابات داخلية مجانية:** حقل `Client.isInternal Boolean?` + خانة في تعديل العميل + استثناء من **كل** المال (`NOT_INTERNAL` بصيغة OR الآمنة). الخمسة (مدوّنتي/جبر×٢/بسيطة/متجر باقتك) أُشّروا على dev. **تست حي كامل:** أشّرنا مختبرات الأطباء → حُفظ → اختفى من Accounts (23→22) → أُرجع.
- **تحسين المزامنة:** ١٢ جدول أحداث/احتياطي تُنسخ **فارغة** (بفهارسها) + إدراج بالدفعات → من ~1265 ثانية لجزء بسيط. البانر يعرض قائمة المستثناة.

### 📝 قرارات
- `isInternal` **حقل** لا ملف JSON (مرئي، بلا نشر، يُدار من الواجهة).
- الحقل **اختياري** ليبقى `isSet` متاحاً (المطلوب لا يعطيه، والقديم غائب).
- الحسابات الداخلية تُستثنى من المال فقط؛ تبقى في المحفظة/السيو (صفحات حقيقية).

### 🚧 معلّق
- **بعد الدفع:** أشّر الخمسة داخلية على الإنتاج · اضغط «تحميل الأزرار الافتراضية» (CTA، من دفعة سابقة).
- **تاسك كبير قادم:** مراجعة سكيما شاملة + سياسة تكلفة مونجو (البند مفصّل أعلى `TODO.md`) — 13,827 وثيقة، جداول أحداث مكرّرة مع GA4.

### 🔁 Git / نشر
- admin **1.2.0** (console 0.22.0 · modonty 1.80.0 بلا تغيير). فرع main. سكيما: `Client.isInternal Boolean?` — بلا `db push`.
- **يُستثنى من الدفع:** الريلز WIP + `.mcp.json`/`playwright-mcp.config.json` (مسارات الجهاز) + `.claude/*`.

### 🚀 استئناف
1. `git log --oneline -3` — تأكّد أن دفعة 1.2.0 وصلت.
2. أشّر الخمسة داخلية على أدمن الإنتاج + «تحميل الأزرار الافتراضية».
3. التاسك القادم: مراجعة السكيما (`TODO.md` قسم «مراجعة سكيما شاملة»).

