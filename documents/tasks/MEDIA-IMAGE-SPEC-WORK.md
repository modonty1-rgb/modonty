# 🖼️ Media / Image Spec — Work Stream

**Last Updated:** 2026-06-12
**الحالة:** مفتوح — يحتاج شغل مركّز على الـ media في الأدمن.

---

## 1. الـ Rules موجودة وتحدّد المقاسات (مؤكّد)

المرجع الرسمي: `admin/app/(public)/guidelines/media/page.tsx` — صفحة «Media & Image Standards» لفريق التصميم.

| نوع الصورة | المقاس | النسبة | ملاحظة |
|---|---|---|---|
| صورة المقال | 1920×1080 | 16:9 | |
| لوجو العميل | 500×500 | 1:1 | PNG شفاف إلزامي |
| صورة الكاتب | 500×500 | 1:1 | الوجه في المنتصف |
| **غلاف العميل (hero)** | **2400×400** | **6:1** | ⚠️ لا نصوص داخل الصورة |
| صورة الفئة | 600×600 | 1:1 | |

القاعدة متّسقة في 4 أماكن: الجدول أعلاه + `media-picker.tsx:130` + `client-hero-modal.tsx:68` + `guidelines/team-onboarding/page.tsx:68`.

القاعدة فيها مبدأ **Safe Zone**: «نفس الصورة تطلع بأماكن مختلفة → حطّ المهم في المنتصف» — أي القصّ في الأماكن الصغيرة **متوقّع ومقصود**.

---

## 2. التضارب الفعلي الوحيد

`admin/.../client-seo-config/validators-advanced.ts:104` يقول **«Hero image recommended (1200×630)»** — وهذا فحص **صورة المشاركة (og:image)** المنفصل، يخالف قاعدة الغلاف **6:1**. → يحتاج توحيد أو توضيح إنه شأن سوشيال منفصل.

---

## 3. اصطدام مع شغل اليوم (2026-06-12)

في جلسة إعادة هيكلة الرئيسية، غُيّرت صناديق عرض الـ hero لـ **`aspect-[1200/630]`** (1.905):
- `HeroSlider.tsx` · `article-lab-client-card.tsx` · `sidebar/article-client-card.tsx` · `SidebarSkeletons.tsx`
- وصفحة العميل `hero-cover.tsx` لا تزال **6:1**.

هذا **يخالف قاعدة الـ 6:1** → لازم قرار قبل المتابعة.

---

## 4. القرار المعلّق (keystone — كل شي يعتمد عليه)

- **مسار أ — نلتزم بالقاعدة (6:1):** الغلاف يبقى 2400×400. الـ mini (السلايدر/البطاقة) يعرض **وسط** الصورة (`object-cover` + center-safe). أرجّع تعديلات اليوم لتتوافق. مقصود، مش «كامل».
- **مسار ب — نغيّر القاعدة:** الغلاف → نسبة أقرب للمربّع (مثلاً 16:9 / 1.91) تظهر «كاملة» في الـ mini. نحدّث: جدول الـ rules + media-picker + modal + onboarding + og-validator + `hero-cover.tsx`. بانر صفحة العميل يصير أقل عرضًا.

---

## 5. «الـ media محتاجة شغل» — نطاق أوسع (للتفصيل مع خالد)

- توحيد التضارب أعلاه (القرار).
- مراجعة صفحة الـ rules (`guidelines/media`) — دقّتها مقابل العرض الفعلي.
- (محتمل) فرض cropper بنسبة موحّدة عند رفع الغلاف في الأدمن/الكونسول.
- (محتمل) مراجعة مكتبة الميديا `/media`.

---

## 6. مكتبة التحرير — مُنزّلة ✅ (2026-06-12)

**القرار:** `react-filerobot-image-editor` (مجانية، مفتوحة المصدر، React-native، محرّر كامل مش مجرد قص).

**النسخ المُثبّتة في `admin/package.json`:**
- `react-filerobot-image-editor@5.0.0-beta.159` — خط الـ React 19 (peer `react >=19`)، الـ maintainer ناشره كـ `latest` رغم وسم beta. الـ "stable" 5.0.1 قديم (2024، قبل React 19) → مرفوض.
- `react-konva@^19.2.5` · `konva@^10.3.0` · `styled-components@^6.4.2` (peers).
- صفر تعارض peer مع React 19.2.4 (الوحيد الظاهر = tiptap، سابق).

**القدرات المؤكّدة عبر Context7:** 6 تبويبات — Finetune (سطوع/تباين/تشبّع/exposure) · Filters · Adjust (قص+تدوير+قلب) · Resize · Annotate · Watermark + زوم. قفل النسبة: `Crop={{ ratio, presetsItems }}`. الإخراج: `onSave(imageData)` → base64 → رفع Cloudinary. Next 16: client-only → `dynamic(..., { ssr:false })`.

**ملاحظة تشغيلية:** الـ postinstall (`prisma generate`) فشل أول مرة بـ EPERM لأن سيرفر admin كان ماسك الـ DLL — حُلّت بإعادة `add --ignore-scripts` (الـ schema ما تغيّر فالـ client الموجود صالح). لو احتجنا regenerate لاحقاً: اقتل node → generate → شغّل.

---

## 7. صفحة `/media/upload` — أُعيد بناؤها بالكامل ✅ (2026-06-12، live-verified، UNPUSHED)

نظام رفع جديد بالـ **control** على المقاسات. tsc admin = صفر أخطاء.

**الملفات:**
- `admin/lib/media/media-specs.ts` (جديد) — مصدر واحد: ratio/size/min-res/format/note لكل `MediaType` + `requiresCrop` + `isRatioValid` + `isResolutionValid` + `specSummary`.
- `.../upload-zone/components/image-editor-modal.tsx` (جديد) — Filerobot dynamic ssr:false، نسبة مقفولة (`Crop.ratio` + `noPresets`)، tabs (Adjust/Finetune/Filters/Resize)، `onSave`→base64→File + فحص نسبة+دقة قبل القبول.
- `.../upload-zone/components/media-type-selector.tsx` (جديد) — شبكة أدوار بصرية تُظهر شكل كل نسبة (6:1 شريط رفيع · 1:1 مربع · 16:9 …).
- `.../upload-zone/hooks/use-upload-zone.ts` — أضيف `mediaType` + editor state/handlers، gating على الدور، **تمرير `type` لـ `createMedia`** (كان دايماً GENERAL).
- `.../upload-zone/index.tsx` — أُعيد بناؤه: stepper (1 عميل · 2 دور · 3 رفع+قص)، SpecBanner، Edit/Enhance، editor overlay.
- `.../upload-zone/components/file-drop-zone.tsx` + `upload/page.tsx` — specHint + رابط Standards.

**التحقق الحي (Playwright):** الدور Client Cover → الـ editor فتح **مقفول 6:1** (1200×200، بلا أزرار نِسب) → فحص الدقة رفض القص (1200 < 1800 min) فبقي الـ editor مفتوح. كله صحيح.

**المكتبة:** `react-filerobot-image-editor@5.0.0-beta.159` + react-konva@19 + konva@10 + styled-components@6 (راجع §6). 6 تحذيرات console غير قاتلة (styled-components × React 19 strictness، dev-only).

**متبقّي/ملاحظات:**
- لم أختبر الحفظ النهائي إلى Cloudinary+DB حيًّا (Cloudinary مشترك dev/prod — تجنّب تلويثه). مسار `type`→`createMedia` مُتحقّق بالكود + tsc.
- القرار keystone (§4): نسبة الغلاف بقيت **6:1** (القاعدة الحالية) — اعتُمدت كما هي («ثبّت الـ rules»).
- كله UNPUSHED — يحتاج version bump + commit + push (بإذن صريح).

---

## 8. التحكّم في المحرّر + إصلاح console (2026-06-12، live-verified، UNPUSHED)

كله في `image-editor-modal.tsx`. tsc admin = صفر أخطاء.

- **إصلاح خطأ console** `Received false for a non-boolean attribute active` (وأخطال styled-components الأخرى) — كان من داخل Filerobot (styled-components v6 شال الفلترة التلقائية). الحل الرسمي: لفّ المحرّر بـ `<StyleSheetManager shouldForwardProp={...}>` يفلتر بـ `@emotion/is-prop-valid` (مُثبّتة) لعناصر الـ DOM فقط. **متحقّق حيًّا: السيشن صار صفر errors/warnings.**
- **إخراج بالمقاس المضبوط** — `produceFile()` يعيد تحجيم الناتج لـ `spec.width×spec.height` (canvas) → الشعار دايماً 500×500، الهيرو 2400×400…
- **تثبيت المؤشّر + الإخراج معاً** — `loadableDesignState={{ resize:{ width, height, manualChangeDisabled:true } }}` للأدوار ذات المقاس الثابت → المؤشّر العلوي يقرأ **500×500** والإخراج مقفول (لا تغيير يدوي). متحقّق حيًّا (كان يعرض 630).
- **إزالة Rotate / Flip X / Flip Y** — Filerobot ما عنده config لإخفاء أدوات Adjust الفردية؛ نخفيها بالنص الدقيق عبر `MutationObserver` مربوط بحاوية المحرّر (يصمد عبر التبويبات/الـ re-renders). مطبّق على **كل الأدوار**. متحقّق حيًّا (Crop ظاهر، الثلاثة مخفيين).
- **محرّر قص نقي (Khalid 2026-06-12):** شِلنا تبويب **Resize** (المقاس مقفول) ثم **Finetune + Filters** → `tabsIds = ["Adjust"]` و `defaultToolId="Crop"`. الهدف **تحكّم foolproof** لا تحسين (الشعار/أصول البراند ما يصحّ تتعدّل ألوانها وقت الرفع). Finetune/Filters كانوا يشتغلون تمام (مو bug) — قرار منتج. يمكن رجوع التحسين لدور معيّن بسطر واحد لاحقاً.
- **WebP مقفول + بلا نافذة حفظ (Khalid 2026-06-12):** الـ format مثبّت WebP والمصمم ما يقدر يغيّره. `removeSaveButton` + زر **«Save WebP»** مخصّص يستدعي `getCurrentImgData({ extension:"webp", quality:0.85 })` → يحفظ مباشرة، يتخطّى نافذة «Save as» (اللي كانت فيها قائمة format). متحقّق حيًّا: الناتج **image/webp · 500×500 · ~3.9KB مضغوط · بلا dialog**. الضغط مؤكّد من docs Filerobot: WebP = `canvas.toDataURL("image/webp", quality)` lossy، والجودة تُطبَّق على base64 (اللي نستخدمه). ⚠️ ملاحظة `onBeforeSave` يرجّع false = **يلغي الحفظ** مش يتخطّى النافذة (تحقّقت). **النطاق:** هذا المحرّر فقط (مسار /media/upload). مسارات رفع أخرى (edit-media المباشر، مودالات اللوجو) لسه ترفع بالفورمات الأصلي؛ العرض على مودونتي أصلاً WebP عبر Cloudinary `f_auto`. توحيد كل المسارات على WebP = مهمة لاحقة لو طُلبت.
- **عرض الحجم قبل/بعد (Khalid 2026-06-12):** `originalSize` (bytes الملف المختار) يمرّ عبر الـ hook → المحرّر يعرض **«Original: X»** جنب زر الحفظ، والـ Preview بعد الحفظ يعرض **«Original X → WebP Y · −Z%»** (بادج أخضر للتوفير). `formatBytes` أُضيفت لـ `admin/lib/utils.ts`. متحقّق حيًّا: 17.6KB → 3.9KB · −78%. إزالة زر «Edit/Enhance» (التول صار قص فقط) + تنظيف openEditor/isImageFile.
- التبعيات المضافة: `@emotion/is-prop-valid` · (سابقاً §6: filerobot + react-konva + konva + styled-components).

---

## 9. إعادة ترتيب UX — كشف تدريجي + بؤرة الصورة (2026-06-12، live-verified، UNPUSHED)

طلب خالد: الدور لا يظهر قبل اختيار العميل · بعد اختيار الدور يُقفل/يطوي · منطقة الصورة كبيرة · الفورم minimal. مطبّق (Track A — progressive disclosure). tsc admin = صفر أخطاء.

- **بوّابات الخطوات (`index.tsx`):** الخطوة 1 (عميل) تظهر فقط حتى يُختار · الخطوة 2 (دور) **تنكشف فقط بعد اختيار العميل وتختفي بعد اختيار الدور** · الخطوة 3 (رفع+قص) تظهر فقط بعد اكتمال الاثنين.
- **شريط ملخّص (Summary rail):** العميل والدور المكتملان يطويان لشريحتين دائريتين أعلى الصفحة، كلٌّ فيه زر **Change** (يرجّع للخطوة). تغيير العميل يُبقي الدور (مستقل عن العميل)؛ كلاهما يصفّر أي ملف قيد العمل.
- **بؤرة الصورة:** الحاوية `max-w-5xl` متمركزة · drop zone كبّرته لـ `min-h-[300px]` (منطقة آمنة كبيرة) · عند وجود ملف: preview عريض `lg:col-span-3` + فورم `lg:col-span-2` (alt إلزامي + Save + سطر تلميح واحد) — أُزيلت أعمدة الـ actions/Info الزائدة.
- **hook (`use-upload-zone.ts`):** أُضيف `resetFlowFiles` (DRY) + `handleChangeClient` + `handleChangeRole`، و`handleMediaTypeChange` يعيد استخدامها.
- **التحقق الحي:** البداية = الخطوة 1 فقط (لا دور) → اختيار عميل → العميل يطوي لشريحة + الدور يظهر → اختيار Client Logo → الجريد يختفي + شريحتان + منطقة رفع كبيرة (banner: 500×500 · 1:1 · PNG + ملاحظة Safe Zone). صفر console errors.

---

## 10. قفل دائرة تعديل المكتبة — Replace + Update (2026-06-13، live-verified، UNPUSHED)

كانت صفحة `/media/[id]/edit` **باباً خلفياً**: زر Replace يرفع الملف بالأصل (بلا قص/نسبة/WebP)، والـ Media Type dropdown فيه OG/Twitter وناقص HERO/GALLERY. أُقفلت الدائرة بإعادة استخدام نفس `ImageEditorModal`. tsc admin = صفر أخطاء.

كله في `edit-media-form.tsx`:
- **Replace يمرّ على المحرّر المقفول:** `processReplacement(file)` → لو `requiresCrop(media.type)` و image → يفتح `ImageEditorModal` بنسبة `media.type` → قص → WebP → يصير `newFile`. الأدوار الحرّة (GENERAL/GALLERY) أو الفيديو → استبدال مباشر كما كان. أُضيف `handleEditorSave`/`handleEditorClose` + `editorState`/`originalSize` state.
- **الدور read-only:** استُبدل الـ Media Type `Select` ببطاقة عرض ثابتة (`typeSpec.label` + المقاس + النسبة + الفورمات) + سطر يشرح («Fixed role. Replacing re-crops to this ratio and saves as WebP» / «Free role…»). `formData.type` يبقى = `media.type` (لا يتغيّر) → يُغلق تناقض النسبة. القائمة القديمة (OG/Twitter/ناقصة HERO) انتهت.
- **قفل WebP** يأتي من المحرّر نفسه (نفس الرفع). عرض المقارنة Original→WebP بعد الاستبدال (`formatBytes`).
- **التحقق الحي (لوجو Dream to App، 500×500):** الدور read-only يعرض «Client Logo · 500×500 · 1:1 · PNG» → Replace برفع PNG 1280×828 → المحرّر فتح **مقفولاً 500×500 · 1:1 · Crop فقط · Save WebP · Original 131 KB**، بلا أزرار نِسب. متطابق مع الرفع 100%. **لم يُنفَّذ Save فعلي** (Cloudinary مشترك dev/prod + الحفظ يحذف الأصل القديم) — أُوقف قبل الكتابة عمداً.
- **متبقّي للدائرة:** الأدوار الحرّة تأكيد بصري (منطقي عبر الكود + tsc) · الحفظ الفعلي end-to-end يُختبر في prod أو على صورة تجريبية مخصّصة (تجنّب تلويث Cloudinary المشترك).

---

## 11. إعادة تصميم صفحة /media + أداة فحص المطابقة (2026-06-13، live-verified، UNPUSHED)

خالد: الصفحة بدائية → redesign كامل (تنفيذ مباشر حي، اختاره). ثم: أداة فحص ذكية تلقائية تعطي «صح/خطأ + ليش» لكل صورة، معالجة يدوية. tsc admin = صفر أخطاء · 0 console errors/warnings.

**أ) إعادة تصميم المعرض (`media-grid.tsx` + `media-toolbar.tsx` + `media-page-client.tsx`):**
- **شبكة DAM موحّدة** (best practice، خالد فوّض القرار): خلية `aspect-[4/3]` ثابتة + `object-contain` + خلفية `bg-muted/30` → حجم موحّد واضح **و** الصورة كاملة بنسبتها (اللوجو وسط الخلية، الغلاف 6:1 شريط كامل) بلا قص. (تطوّر: `aspect-square cover` يقص → masonry بنسب طبيعية يتفاوت → استقرّ على الخلية الموحّدة + contain.) 4 أعمدة standard / 6 compact.
- **Tooltip سبب المخالفة** (shadcn `Tooltip` على الشارة الحمراء `z-20`): عند المرور يعرض قائمة الأخطاء بوضوح بدل النص الباهت في الـ overlay (طلب خالد 2026-06-13). الشارة الخضراء + نقطة الاستخدام بـ `title`.
- **أكشنز hover-overlay** (تدرّج سفلي + اسم الملف + أبعاد·حجم + copy/info/edit/delete) — البطاقة هادئة افتراضياً.
- **معرض مسطّح افتراضي** (`groupByClient=false`) + زر **Group** (FolderTree) للتجميع بالعميل عند الحاجة.
- **شريط اسم العميل** سفلي دائم في الوضع المسطّح (يختفي عند hover) — تعرف لمن الصورة بنظرة. صور General بلا عميل تبقى نظيفة.
- كثافة أعلى: 5 أعمدة standard / 8 compact. `priority` لأول 10 صور (حلّ تحذيرات LCP).

**ب) أداة الفحص التلقائي (`checkMediaCompliance` في `media-specs.ts`):**
- دالة pure تقرأ الـ row فقط (`type/mimeType/filename/width/height`) — **صفر لمس Cloudinary/DB**، تشتغل client-side في كل render = حكم تلقائي لحظة فتح الصفحة.
- المنطق: الفورمات يجب WebP لكل الأدوار **عدا اللوجو** (PNG/WebP شفاف)؛ النسبة+الدقة تُفحص للأدوار ذات النسبة فقط (الحرّة GENERAL/GALLERY = فورمات فقط). ترجّع `{ ok, issues[] }`.
- العرض: شارة ✓ خضراء / ⚠ حمراء فوق-يسار + **إطار أحمر** للبطاقة المخالفة + الأسباب في الـ hover overlay (نص أحمر) + صف **Spec** في نافذة التفاصيل + أيقونة/تلوين صف في الـ list view.
- **المعالجة يدوية:** المخالف → Edit → Replace → المحرّر المقفول يصلّحه (WebP + المقاس) — يكتمل مع §10. لا إصلاح تلقائي (قرار خالد: تجنّب لمس Cloudinary المشترك).
- متوقّع: أغلب الصور القديمة تطلع «خطأ فورمات» (PNG/JPG قبل تثبيت WebP) — مقصود = قائمة المعالجة.
- **متبقّي (اقتراح، لم يُبنَ):** عداد مخالفات + فلتر «Issues only» في التولبار لتسهيل المعالجة اليدوية.

---

## 12. Check-up شامل لكل شغل الـ media (2026-06-13، UNPUSHED)

طلب خالد قبل الرجوع لمودونتي. مراجعة كود مستقلة (subagent) + فرز يدوي + TSC كامل + فحص حيّ لكل المسارات.

**إصلاحات طُبّقت (5):**
- **HIGH — حارس host مفقود في list view + info dialog** (`media-grid.tsx`): الـ grid يحمي بـ `isHostAllowed` لكن الـ list + الـ dialog كانا يمرّرا `item.url`/`getImageUrl` لـ `next/image` بلا حارس → كراش محتمل لأي صورة host خارج `remotePatterns`. أُضيف الحارس + fallback `ImageOff`.
- **MED — عقد `onSave` ميت** (`image-editor-modal.tsx`): كان `(file, width, height)` والـ callers يهملوا w/h (الأبعاد تأتي من Cloudinary) → بُسّط لـ `(file) => void`.
- **LOW — `key={index}`** في قائمة أخطاء الـ tooltip → `key={iss}`.
- **LOW — a11y:** `aria-label="Clear search"` لزر مسح البحث.
- **LCP warning** في معاينة صفحة التعديل → `priority`.

**بند مرفوض (خطأ المراجع):** اقتراح توحيد العرض على `getImageUrl` — مرفوض، لأن `getImageUrl` يرجّع الأصل الخام (بلا `f_auto`) وهو لنسخ الرابط فقط؛ `item.url` المحسّن هو الصحيح للعرض. التوحيد كان سيبطّئ المعرض.

**ملاحظات legacy مسجّلة (خارج نطاق شغلنا، لم تُلمس):** SVG قد لا يُعرض في `next/image` بلا `dangerouslyAllowSVG` بينما `validateFile` يقبله · effect «cleanup on unmount» في `use-upload-zone` يعيد التشغيل على كل تغيير `files` (double-revoke غير ضار) · `files.find` بدل `filesRef.current` في `handleSaveMedia` (يشتغل في الـ flow العادي) · تكرار `formatFileSize`/`formatBytes` · تكرار interface `Media` في 3 ملفات.

**الفحص الحيّ (كله 0 console errors/warnings):** الشبكة الموحّدة · list view + الحارس · شارات/أيقونات/Tooltip المطابقة · المنطق صح (webp=✓ · PNG=«Format should be WebP») · صف Spec في التفاصيل · upload page · edit page. **TSC admin الكامل = صفر أخطاء.**

**تصحيح label بعد الفحص (خالد 2026-06-13):** البطاقة كانت تعرض «OG Image» لصورة اختيرت كـ «Client Mini». السبب: مصدران للـ label — `MEDIA_SPECS[OGIMAGE].label`=«Client Mini» (الصحيح، الدور يعيد استخدام type=OGIMAGE) مقابل `getMediaTypeLabel` القديم (switch يدوي = «OG Image»، وناقص HERO/GALLERY → يعرضهما «General»). الإصلاح: `getMediaTypeLabel` صار يقرأ من `MEDIA_SPECS` (مصدر واحد) → كل أماكن العرض (grid badge · list badge · info dialog · media-picker-dialog) متّسقة الآن، و HERO/GALLERY أخذا اسمهما الصحيح. متحقّق حيًّا: البطاقة تعرض «Client Mini».

**متبقّي قبل push:** `pnpm build` نهائي + version bump (لم يُطلبا بعد). كل شغل الـ media UNPUSHED.

---

## 13. نوع enum جديد `CLIENT_MINI` (قرار خالد النهائي 2026-06-13، live-verified، UNPUSHED)

خالد رفض إعادة استخدام `OGIMAGE` (اسم داخلي مضلّل) → **نوع صريح `CLIENT_MINI`**، و`OGIMAGE` تبقى محجوزة للـ og:image مستقبلاً.

- **Schema** (`dataLayer/prisma/schema/schema.prisma`): أُضيف `CLIENT_MINI` لـ `MediaType` enum. `prisma generate` (أُوقف السيرفران لحظة بـ kill على ports 3000/3001 ثم أُعيد تشغيلهما — MCP بقي). MongoDB: إضافة enum value = generate فقط (لا migration/push).
- **كود الأدمن:** `media-specs.ts` — `CLIENT_MINI` spec (1200×630·1.91:1، label «Client Mini»)؛ `OGIMAGE` رجعت label «OG Image» (محجوزة، note «لا تُرفع يدويًا»)؛ `MEDIA_TYPE_ORDER` استبدل OGIMAGE بـ CLIENT_MINI. `media-utils.ts` badge variant/color + case CLIENT_MINI. `media-filters.tsx` + `media-picker-dialog.tsx` أُضيف SelectItem «Client Mini» (OGIMAGE بقيت). `get-media-stats.ts` + `media-stats.tsx` أُضيف CLIENT_MINI bucket/interface.
- **الدائرة الكاملة admin↔modonty (live-verified 2026-06-13):** رُفعت 4 صور Client Mini عبر الأدمن (Glowry Dental · Catchers · Nelly Dawoud · Dream to App) — كلها مرّت بالمحرّر المقفول 1.91:1 → WebP → Cloudinary+DB (ملفات جديدة، صفر لمس للأصول الموجودة). مودونتي: السلايدر رجع يظهر بـ **4 slides حصري Client Mini** تملأ صندوق 1200/630 بلا قص · 0 console errors. **ملاحظة dev:** الكاش عبر العمليتين (admin 3001 / modonty 3000) لا يتبادل revalidate محليًا → أُعيد تشغيل modonty لإبطال `cacheTag("clients")`. **للإنتاج:** يجب التأكد أن `createMedia` بالأدمن يفجّر `revalidateModontyTag("clients")` وإلا الصور المرفوعة لا تظهر فورًا (نقطة مفتوحة).
- **بطاقة المقال — متحقّقة (2026-06-13):** رُفعت Client Mini لعميل «مدونتي» (عنده مقالات) → بطاقة العميل في صفحة المقال تعرض **نفس الصورة** (img w=279 من `clients/{id}/...` = الـ Client Mini، مع اللوجو كـ badge). **bug اكتُشف وحُلّ:** كنت عدّلت `getArticleBySlug` (سطر 98) لكن صفحة المقال تستخدم `getArticleBySlugMinimal` → `getArticleContentBySlug` (سطر 278) — لحسن الحظ تعديل الـ `include` ذهب للدالة الصحيحة فعلًا (الـ media مُضاف هناك سطر 293). **الكاش:** `'use cache'` المستمر على القرص لا يبطله الـ restart → استُخدم `POST /api/revalidate/tag {tag:"articles"}` الرسمي (لا مسح يدوي للكاش). **للإنتاج (نقطة مفتوحة مؤكّدة):** `createMedia` بالأدمن يجب أن يفجّر `revalidateTag("articles")` + `("clients")` لمودونتي وإلا الصور المرفوعة لا تظهر فورًا.
- **مودونتي (كامل):** `getClientHeroSlides` (`client-queries.ts`) صار **حصريًا Client Mini** (خالد 2026-06-13: «ما تطلع صور ثانية») — الـ where = `media: { some: { type: CLIENT_MINI } }` فقط، **بلا fallback للـ hero**؛ السلايدر يختفي للعميل بلا Client Mini. (شِيل `heroImageMedia` من select/where.) متحقّق حيًّا: السلايدر اختفى الآن (صفر Client Mini مرفوعة). **بطاقة المقال أيضًا:** `article-data.ts` (الـ selectان: select + include) يجلبان `media(type=CLIENT_MINI)`؛ `article-lab-client-card` + `sidebar/article-client-card` يفضّلان `client.media[0]?.url` على الـ hero؛ أُضيف `media?: {url}[]` لأنواع الـ passthrough (`article-mobile-layout` + `article-mobile-sidebar-sheet`). tsc modonty نظيف · homepage 0 console errors (fallback للـ hero يشتغل بلا صورة CLIENT_MINI مرفوعة بعد).
- **لا تحويل للصور القديمة** (خالد: data محلية للتجربة) — أي OGIMAGE قديمة تبقى وتُعرض «OG Image».
- **التحقق الحي (admin):** الرفع → دور «Client Mini» → المحرّر فتح **مقفول 1200×630·1.91:1 · Crop فقط · Save WebP**؛ المكتبة: الصورة القديمة OGIMAGE تعرض «OG Image»؛ فلترا OGIMAGE + CLIENT_MINI يشتغلان. **tsc admin = صفر · tsc modonty نظيف عدا `framer-motion` مفقودة في `app/story/*` (دَين قديم مش من هذا الشغل) · 0 console errors.**
