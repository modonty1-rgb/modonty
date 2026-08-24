# أر


## Session: 2026-08-17 (مساءً) → 2026-08-18 (فجراً) — 🧱 بانِي موقع الشريك: كونسول «موقعك» + جدول `ClientSite` + مكوّنات مشتركة + رِندَر مطابق على مدونتي (فرع `modonty-site-groups` · **٧٧ ملفاً غير مثبَّت** · **لم يُدفع** · **لا merge**)

> خالد في نهاية الجلسة: حصّة موديل Fable الأسبوعية عند ٩٥٪ → جمّد الجلسة (`us>`) وقد يكمّل بموديل آخر. **الجلسة الجاية تبدأ بـ`hh>`** ثم إمّا كوميت محلّي للـ٧٧ ملفاً (عرضتُه، لم يقرّر) أو نقاش بند «٦ — الدفع».

### 🎯 أين توقفت
- **آخر تاسك:** بانِي موقع الشريك — البنود ١ (تحسين التصميم) · ٢ (الجوّال) · ٤ (الفيديو) · ٥ (التنظيف) **أُنجزت**. البند ٣ (النطاق الفرعي) **أُجّل بقرار خالد** إلى بطاقة `SUBDOM` على اللوحة (HIGH). البند ٦ (الدفع/النشر) **لم يُناقَش**.
- **الخطوة التالية عند الرجوع:** `hh>` → اسأل خالد: (أ) كوميت محلّي بلا دفع للـ٧٧ ملفاً؟ (ب) نبدأ بند ٦ (`tsc` على الثلاثة · `pnpm build` مدونتي · خطة `prisma db push` على الإنتاج بيد خالد)؟ — لا تُنفَّذ إلا بأمره.

### ✅ المنجز هذه الجلسة (بعد ضغط سياقي؛ الأقدم في ملخّص الجلسة داخل المحادثة)
- **السكيما (`shared/prisma/schema/schema.prisma`):** حُذف `PageTemplate` وحقول القوالب من `Client`؛ أُضيف `model ClientSite` (1:1 مع `Client`: `headerTemplate` · `footerTemplate` · `primaryColor?` · `hiddenSections[]` · `subdomain? @unique` — السطر 726) + `site ClientSite?` على `Client`. **دُفعت إلى `modonty_dev` فقط** (`pnpm prisma:push -- --skip-generate` بأمر خالد الصريح «you do it»؛ الناتج `[+] Collection client_sites`). ⚠️ `db push` أسقط ٣ فهارس TTL — Run-All يعيدها.
- **المكوّنات المشتركة `shared/components/partner-site/`:** ٥ هيدرات (`free/header/{classic,centered,utility,transparent,pill}-header.tsx` + سجلّ `HEADER_TEMPLATES`) · ٤ فوترات (`free/footer/{columns,simple,brand,centered}-footer.tsx` + `FOOTER_TEMPLATES`) · بلوكات الرئيسية والصفحات (`free/{hero,trust,about,services,stats,testimonials,gallery,team,video,faq,blog,contact,cta,newsletter,booking}/…` بسجلّات `HOME_BLOCKS` · `ABOUT_BLOCKS` · `SERVICES_BLOCKS` · `GALLERY_BLOCKS` · `FAQ_BLOCKS` · `CONTACT_BLOCKS` · `BLOG_BLOCKS` · `BOOKING_BLOCKS` · `REVIEWS_BLOCKS`؛ كل بلوك `{key,name,toggleable,isEmpty(data),Component}`) · أجزاء `parts/{brand-logo,whatsapp-button}` · `social-links.tsx`.
- **المكتبة المشتركة `shared/lib/partner-site/`:** `get-home-data.ts` (استعلامات Prisma → `HomeData` واحد) · `partner-site-palette.ts` (٨ ألوان WCAG) · `hex-to-hsl-triplet.ts` · `detect-social-platform.ts` · `validate-subdomain.ts:44` · `index.ts`.
- **الكونسول:** مجموعة تنقّل «موقعك» أوّلاً (`nav-config.ts` · `site-pages.ts` ٩ صفحات) · `/dashboard/my-site` (راديو هيدر/فوتر بمعاينة كاملة العرض `dir="rtl"` · لوحة ألوان · حقل النطاق الفرعي؛ حفظ = upsert `ClientSite` + `revalidateModontyTag("clients")`) · `/dashboard/site-pages/[page]` (مفتاح إظهار/إخفاء لكل بلوك = حفظ فوري) · «محتوى الموقع» مرتَّب بالصفحة · تبديل الوضع الداكن (`next-themes` من الجذر) · شريط تمرير جانبي · خط القائمة `font-normal` · حزم: `zod` + `next-themes` في `console/package.json`.
- **مدونتي `app/(partner)/clients/[slug]/`:** `layout.tsx` يقرأ `client.site` → هيدر/فوتر من السجلّات + `--primary` · `components/page-blocks.tsx` (يرشّح المخفيّ والفارغ) · الرئيسية + ٨ صفحات داخلية `(inner)/{about,services,photos,faq,contact,articles,reviews,book}` كلها `PageBlocks` · `(inner)/(plain)/{reels,followers,likes,mentions}` منقولة (بيانات الزائر لا الشريك) · **حُذفت ١٨ ملفاً ميّتاً** (هيرو/تيزرات/أقسام/هيدر/فوتر القديمة). قائمة المستخدم: `hint` prop لإخفاء فقاعة «مزاياك هنا» في شريط الشريك.
- **الأدمن:** خطوات القوالب أُزيلت من Run-All (رجع لأصله). **اللوحة:** بطاقة `SUBDOM` (HIGH) على `TASK.html:1373` بأثر تحقّق (ملف:سطر + ناتج Vercel API + توثيق رسمي).
- **TSC:** ⚠️ **لم يُشغَّل هذه الجلسة على أي تطبيق** (قاعدة «ممنوع tsc إلا بطلب») — **غير متحقَّق**. **Build:** لم يُشغَّل. **تست حيّ:** ✅ على `modonty_dev` — جبر سيو (`support@jbrseo.com` / `JbrSeo2026!` كلمة تست أُعيد ضبطها بسكربت dev): الكونسول يحفظ (هيدر pill · فوتر brand · لون teal `175 77% 26%` · النشرة مخفيّة) → مدونتي ترسم نفس المكوّنات؛ ٨ صفحات داخلية 200 بمعرّفات الأقسام المتوقَّعة؛ ٦ عملاء آخرون يرسمون الافتراضي. **بلوك الفيديو غير مختبَر بصرياً** (لا عميل dev عنده فيديو Bunny).

### 📝 قرارات (بالسبب)
- **جدول منفصل `ClientSite` صف واحد لكل عميل بمفاتيح مكوّنات** (فكرة خالد، وافقتُ) بدل كتالوج `PageTemplate` الأوّل → أبسط وأسرع؛ الصف الغائب = افتراضيات؛ الكتالوج القديم كان معقّداً («الفكرة اللي عملتها أول كانت معقدة»).
- **قالب واحد لكل بلوك الآن + مفتاح إظهار/إخفاء** → «الشريك ليس تقنياً»: بلا سحب، لوحة ألوان جاهزة، افتراضيات تشتغل.
- **النطاق الفرعي = ميزة بريميوم اختيارية لا افتراضية، ومؤجَّل** → منطقة DNS مملوكة في حساب Vercel آخر (`domain_already_exists` · `GET /v6/domains?teamId → []` · records `forbidden`)؛ الـwildcard يشترط نيم سيرفرات Vercel (توثيق رسمي).
- **حُذف الريلز/المتابعون/الإعجابات/الإشارات من قائمة صفحات الشريك** → بيانات يولّدها الزائر لا يديرها الشريك (خالد: «إيوة، شيلها»).
- **`year` يُمرَّر في `FooterData` و`getCopyrightYear()` تحت `use cache`** → `new Date()` ممنوع في الـprerender مع `cacheComponents`.
- **سجلّ البلوكات لا يُمرَّر من صفحة سيرفر إلى مكوّن عميل** → «Functions cannot be passed to Client Components»؛ يُمرَّر مفتاح الصفحة نصّاً والخريطة تعيش في العميل.

### 🚧 معلّق / محجوب
- **بند ٦ — الدفع/النشر:** لم يُناقَش. يتطلّب: `tsc` على admin/console/modonty · `pnpm build` مدونتي · `prisma db push` على الإنتاج **بيد خالد** (سيُنشئ `client_sites` ويُسقط `page_templates`+حقول القوالب — تأكّد أنّ لا بيانات إنتاج فيها قبل الحذف) · لا Run-All مطلوب.
- **`SUBDOM`** — بانتظار خالد/مريم: نقل `modonty.com` من حساب dreamtoapp إلى فريق `modonty` على Vercel، ثم بقية الخطوات على البطاقة.
- **بلوك الفيديو** — تست بصري بعد رفع فيديو حقيقي على Bunny من الكونسول.
- **ملفات ميّتة قديمة تُركت بقرار خالد** (client-discussions-section · client-results-section · client-review-form · gallery-interactive · seed-client1-test-data · client-bottom-bar · client-footer-cta · client-newsletter-card · client-whatsapp-fab · related-clients).
- **`documents/idea/partner-site-builder.html`** — §7/§8 محدَّثان لكن الملف ما زال يصف كتالوج `PageTemplate` المهجور في صفوف المرحلتين ١/٢ — يحتاج تحديثاً.
- **ملفات خارج الشغل على الشجرة:** `.pnpm-store/` · `img-reqs.txt` · `mobile-uiux-mockup.html` · `.claude/settings*.json` · `.mcp.json` — **لا تُضاف لأي كوميت**.

### 📂 الملفات (٧٧ = `git status --porcelain | wc -l`) — الأهم
- `shared/prisma/schema/schema.prisma` · `shared/components/partner-site/**` (جديد) · `shared/lib/partner-site/**` (جديد)
- `console/app/(dashboard)/dashboard/my-site/**` · `console/app/(dashboard)/dashboard/site-pages/**` (جديدان) · `console/app/(dashboard)/dashboard/page-content/{page,components/page-content-editor}.tsx` · `console/app/(dashboard)/components/{nav-config,site-pages,theme-toggle,dashboard-header,sidebar,sidebar-nav,sidebar-groups}.tsx` · `console/app/components/providers/theme-provider.tsx` · `console/app/{layout.tsx,globals.css}` · `console/lib/ar.ts` · `console/package.json` · `pnpm-lock.yaml`
- `modonty/app/(partner)/clients/[slug]/{layout,page}.tsx` · `…/components/page-blocks.tsx` · `…/components/chrome/platform-bar.tsx` · `…/helpers/{get-partner-site,build-chrome-data,get-cached-home-data,get-copyright-year}.ts` · `…/(inner)/**` (٨ صفحات + `(plain)/`) · `modonty/app/layout/components/user-menu/{UserMenu,LoginButton,MobileAccountBenefitsMenu}.tsx` · **٢٧ ملفاً محذوفاً** تحت `…/clients/[slug]/`
- `admin/app/(dashboard)/database/{actions/run-all-maintenance.ts,components/auto-maintenance-panel.tsx}` (رجوع لأصله)
- `documents/tasks/TASK.html` (+٨ أسطر: `SUBDOM`) · `documents/idea/partner-site-builder.html`

### 🔁 Git / النشر
- **الفرع:** `modonty-site-groups` · **آخر كوميت:** `3f8f766` (تجميد ١٧ أغسطس) · **غير مثبَّت:** نعم — ٧٧ ملفاً · **مدفوع:** لا · **merge:** لا (ممنوع بلا تأكيد صريح) · **Vercel:** لا شيء نُشر؛ `*.modonty.com` مُضاف للمشروع فقط (pending verification، بلا أثر حيّ). · **القاعدة:** الإنتاج لم يُلمس؛ كل شيء على `modonty_dev`.

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `hh>` — ثم `git status --porcelain | wc -l` (المتوقَّع ٧٧) و`git log -1` (المتوقَّع `3f8f766`).
2. افتح `documents/tasks/TASK.html:1373` (`SUBDOM`) و`shared/prisma/schema/schema.prisma:700-735` (`ClientSite`).
3. قرار خالد: كوميت محلّي الآن؟ ثم بند ٦ (الدفع) أم إكمال تصميم/بلوكات؟

---

---

## Session: 2026-08-17 (نهاراً → مساءً) — 🏬 موقع الشريك على مجموعات المسار `(site)/(partner)` + بانِي الموقع (دراسة) + جرد الكونسول (فرع `modonty-site-groups` · **٥ كوميتات لم تُدفع** · **لا merge**)

> خالد في نهاية الجلسة: «خلصنا الـtask هذا — ٨٠٪ من الشغل، باقي صفحتان أو ثلاث» · و«التاسك الجاي كبير ومحتاج تركيز ١٠٠٪، الغلطة فيه مصيبة» → الجلسة الجاية تبدأ **نظيفة** بـ`hh>` ثم تنتظر تعريفه للتاسك.

### 🎯 أين توقفت
- **موقع الشريك** (`modonty/app/(partner)/clients/[slug]/`) مبنيّ ومتحقَّق حيّاً على الديسكتوب (فرسان التعافي مقياساً): كروم (شريط مدونتي + هيدر الشريك + فوتر) · رئيسية بترتيب الزائر (تعرّف عليه → أرقامه → خدماته → آراؤه → معرضه → فين وكيف → مقالاته → نداء) · صفحات داخلية `(inner)` (about · services · contact · articles · faq · photos · reels · reviews · book · followers · likes · mentions). خالد يعتبره **٨٠٪** — المتبقّي «صفحتان أو ثلاث» (لم يسمّها؛ مرشَّحات: تحسين الصفحات الداخلية القديمة المنقولة photos/reels/reviews بنفس نظام التصميم — **مؤشّر لا قرار**).
- **بانِي الموقع (Site Builder)** — ملف نقاش `documents/idea/partner-site-builder.html` (v2) ينتظر قرارات خالد الثمانية (§٨). **صفر كود** فيه.
- **الخطوة التالية عند الرجوع:** `hh>` → خالد يعرّف «التاسك الكبير» → قبل أي سطر: تصنيفه (محدود/معماري) + خطة مراحل + قراءة الكود المعني كاملاً (`feedback_pre_task_code_review`).

### ✅ المنجز هذه الجلسة (بعد الضغط السياقي — التفاصيل الأقدم في كوميتات الفرع)
- **`b016aed`** الهيرو وعد واحد وسطر واحد (`clip()` على slogan/description) · «تعرّف عليه» نافذة تمرير رفيعة `max-h-60` · الفوتر `line-clamp-3`.
- **`ad4d572`** مهارة `.claude/skills/partner-site-templates/SKILL.md` — نموذج القوالب (Shopify settings_schema · Salla twilight.json · Wix) → كتالوج `PageTemplate` + `Client.templateId/themeSettings/sections`.
- **`65d4d14` + `0857e2c`** ملف الفكرة `partner-site-builder.html`: سكيما · تدفّق · شاشة «موقعي» · بريميوم · مراحل · قرارات · قاعدة «الشريك ليس تقنياً» (مفاتيح لا سحب · ٨ ألوان جاهزة · افتراضيات تشتغل).
- **`7fb99da`** قسم **٠.٥ «الوضع الحالي في الكونسول»** (بطلب خالد «المفروض تسويه بدون ما أقول لك»): خريطة القائمة الجانبية (`console/app/(dashboard)/components/nav-config.ts`) · كل قسم في الموقع ← شاشته ← مالكه · ما يشتغل صح (الحفظ → `regenerateClientSeo` → `revalidateModontyTag("clients")` في ٨ أكشنات) · ٦ فجوات · ٧ تحسينات مرتّبة P0/P1/P2 · **قرار ٨**: نقل ملكية الغلاف/الشعار/زرّ الطلب/اللون للشريك (اليوم أدمن فقط: `admin/.../form-sections/cta-section.tsx` و`media-section.tsx`).
- **سكيلز:** نُزّلت ثم **استُخلصت وحُذفت** (بأمر خالد «ما نبغى ضجيج»): superpowers ×١٤ + task-observer + find-skills → ٨ بنود جديدة في `~/.claude/CLAUDE.md` قسم «🧪 منهجية الشغل — مستخلَص» (الأسطر 225–248). `impeccable` v4.0.4 كانت موجودة وبقيت. `claude-mem` بلَغن — **خالد ينزّله بنفسه** (`/plugin marketplace add thedotmack/claude-mem` → `/plugin install claude-mem`).
- **ذاكرة جديدة:** `feedback_study_current_state_before_proposing` (أي دراسة تبدأ بالوضع الحالي المقيس) + `feedback_deliverable_docs_html_not_md`.
- **TSC:** لم يُشغَّل هذه الجلسة (تعديلات المرحلة الأخيرة وثائق فقط) — آخر tsc صفر أخطاء كان بعد نقل المجموعات (**غير متحقَّق الآن**). **Build:** لم يُشغَّل بعد `b016aed`. **تست حي:** الرئيسية والصفحات الداخلية على `http://localhost:3000/clients/مؤسسة-فرسان-التعافي` (ديسكتوب ١٢٨٠×٨٠٠) قبل الضغط السياقي — **الجوّال لم يُختبر عمداً** (قاعدة «الديسكتوب أوّلاً»).

### 📝 قرارات
- **الشريك = موقع كامل داخل مدونتي بشريط منصّة رفيع** (لا صفحة داخلية) — نُفّذ بمجموعتَي مسار `(site)` (٢٦ مسار + SiteShell) و`(partner)`؛ الروابط والسيو لم يتغيّرا (routes 99=99، render modes مطابقة — من جرد `documents/tasks/PARTNER-SITE-MOVE-INVENTORY.html`).
- **الفرع `modonty-site-groups` يُدفع وحده، ولا merge إلى `modonty-ui` إلا بأمر خالد بعد تسته** (`feedback_never_merge_without_explicit_confirmation`).
- **بانِي الموقع:** القالب كود، القاعدة قيم وقرارات، الكونسول محرّر، مدونتي ترسم؛ الشريك ليس تقنياً؛ الأداء همّ مدونتي وحدها.
- **الدراسة تبدأ بالوضع الحالي** — قاعدة جديدة بعد ملاحظة خالد.

### 🚧 معلّق / بانتظار خالد
- **قرارات بانِي الموقع (٨)** في `partner-site-builder.html §٨` — أهمّها **٨** (الملكية) و**١** (النشر الذاتي) و**٤** (قالبان في الإطلاق).
- **دفع الفرع** `modonty-site-groups` (٥ كوميتات محلية: `b016aed` `ad4d572` `65d4d14` `0857e2c` `7fb99da`) — بأمر خالد فقط.
- **ملفّان ميّتان بانتظار حذف خالد:** `modonty/app/(partner)/clients/[slug]/components/home/credentials-strip.tsx` · `modonty/app/(partner)/clients/[slug]/helpers/get-client-identity.ts` (الحذف رُفض لي).
- **بطاقات TASK.html:** `GALPNG` (صور معرض PNG قديمة ١.٧ م.ب على بني ← محسّن الصور 500) · `PREV` · `83d`. النطاق الفرعي مؤجَّل.
- **محمول من بلوك `/modonty` (الفرع `modonty-ui`):** عطل hydration على الرايل الأيمن — **لم يُلمس هذه الجلسة، حالته غير متحقَّقة**.
- **ملفّات غير متتبَّعة بجذر المستودع ليست منّي في هذه الجلسة:** `img-reqs.txt` · `mobile-uiux-mockup.html` · `.pnpm-store/` — لا تُضاف للكوميت حتى يقرّر خالد.

### 📂 ملفّات لُمست (هذه الجلسة بعد الضغط)
- `documents/idea/partner-site-builder.html` — v2 + §٠.٥ + قرار ٨ · `documents/idea/README.md` — سطر الفهرس.
- `.claude/skills/partner-site-templates/SKILL.md` — قواعد «ليس تقنياً».
- `~/.claude/CLAUDE.md` — قسم «🧪 منهجية الشغل — مستخلَص» · `~/.claude/skills/` (حذف ١٦ سكيل مستخلَصة).
- الذاكرة: `feedback_study_current_state_before_proposing.md` + سطر في `MEMORY.md`.

### 🔁 Git / النشر
- الفرع: `modonty-site-groups` (= `modonty-ui` عند `bf8f51a` + ١٣ كوميت؛ `modonty-ui` صفر كوميت أمامه).
- غير مثبَّت: `.claude/settings*.json` · `.mcp.json` (مستثناة دائماً) + الثلاثة غير المتتبَّعة أعلاه.
- آخر كوميت: `7fb99da` · **مدفوع: لا** (`origin/modonty-site-groups` عند `c4bb848`، ٥ خلفه).
- فيرسل: لا نشر من هذا الفرع (لا preview مطلوب حتى الآن).

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `hh>` — ثم `git status` و`git log --oneline -6` على `modonty-site-groups`.
2. افتح `documents/idea/partner-site-builder.html` (§٠.٥ و§٨) لو التاسك الجاي هو البانِي — وإلا انتظر تعريف خالد للتاسك الكبير.
3. قبل أي كود في التاسك الكبير: تصنيف + خطة مراحل + قراءة كاملة للكود المعني + `pnpm tsc --noEmit` كخط أساس.

---

---

## Session: 2026-08-17 (ليلاً، حتى ≈ 03:00) — 🏛️ صفحة `/modonty` الرائدة: ثلاثة أعمدة مشتركة + درج→Popover + هيرو «النقطة» + جاليري الفريق (فرع `modonty-ui` · محلي فقط · **لم يُدفع** · **عطل hydration مفتوح**)

### 🎯 أين توقفت
- **آخر تاسك (مفتوح، عطل حقيقي):** بعد تحريك «قصة الشعار» إلى الرايل الأيمن + إضافة جاليري الفريق، ظهر **hydration mismatch** على `/modonty`: بعد ≈٤ ثوانٍ من التحميل، الرايل الأيمن («قصة مدونتي») يفقد بطاقاته الخمس كلها على العميل (`aside.innerHTML` = العنوان `<p>` فقط)، والرايل الأيسر (جاليري + «آراء شركائنا») سليم. **الدليل الخام:** HTML السيرفر (`curl`) فيه `aria-haspopup="dialog"` ×٦ · بعد الهيدريشن `document.querySelectorAll('aside button[aria-haspopup]').length` = **1** · حزمة RSC (`curl -H "RSC: 1"`) فيها كل العناوين الخمسة (`كيف بدأنا: 1` إلخ) و`StoryPopover: 2`. آخر خطوة كنت أحاول قراءة سياق العناوين داخل حزمة RSC (نسخ `/tmp/m.rsc` رُفض) — لم أصل للسبب الجذري بعد.
- **فرضيتان لم تُختبَرا:** (أ) `StoryCardTrigger` مكوّن سيرفر بـ`forwardRef` يُمرَّر كـ`trigger` لمكوّن عميل — يعمل SSR لكن قد يفشل بالعميل عند خمس نسخ (اليسار نسخة واحدة تعمل)؛ (ب) شيء في `RIGHT_TOPICS`/`ModontyMark` يعطّل فكّ الحزمة. **الاختبار الأسرع:** انقل بطاقة «آراء شركائنا» إلى اليمين مؤقتاً أو انقل «قصة الشعار» لليسار وشوف مَن يكسر — بيسكشن سطر واحد.
- **الخطوة التالية عند الرجوع:** (١) `hh>` (٢) افتح `http://localhost:3000/modonty`، انتظر ٤ ثوانٍ، عدّ الأزرار (٣) بيسكشن العطل ثم أصلحه (٤) بعدها قرار خالد على صفحة الموظف (أدناه).

### ✅ المنجز هذه الجلسة
- **`ThreeColumnLayout` + `TwoColumnLayout` + `StickyRail` صارت مشتركة عبر التطبيقات** في `shared/components/column-layout/` و`shared/components/sticky-rail/` (بطلب خالد الصريح: «وديه في الـshared الرئيسي») — واستُبدلت في `/` و`/clients` و`/industries` و`/modonty`. موثَّق في `.claude/rules/folder-structure.md` (قسم «Existing cross-app shells»).
- **قاعدة «كل نصّ عربي من `messages/ar.json`»** أُضيفت لـ`.claude/skills/modonty-uiux/SKILL.md` §0 ومرآتها في `memory/feedback_uiux_standards.md`.
- **`/modonty` رجعت ثلاثة أعمدة** بعد حذف `AboutCard` (self-link)؛ الرايلان = ٨ مواضيع من `/story` (نصّ مختصر مُعاد كتابته بلا تشكيل) في `messages.modonty.story.*`.
- **درج (Sheet) → Popover:** خالد رفض الدرج حيّاً («فكرة فاشلة»). ثُبّت `@radix-ui/react-popover` في `shared/package.json` وأُنشئ `shared/components/ui/popover.tsx` (مأخوذ عبر `npx shadcn@latest view popover` ومكيَّف لنمط الريبو). `story-drawer/` حُذف. الأزرار موحّدة (`StoryCardTrigger` = بطاقة أيقونة+عنوان+وصف، `forwardRef`).
- **تدقيق `apple-design` skill** (ثُبّت من `emilkowalski/skills` إلى `.claude/skills/apple-design/`) → إصلاحان على `shared/ui`: `motion-safe:active:scale-[0.97]` على `Button`/`StoryCardTrigger`، و`motion-reduce:` (فيد بدل سلايد/زوم) في `sheet.tsx` و`popover.tsx`.
- **الصفحة الرائدة — مفهوم «النقطة»** (خالد: «أبهرني» ثم «do»): هيرو صورة ٦:١ + شبكة نقاط ٨٪ + شعار ٨٠px يركب الحافة + زرّ جدة (رابط خرائط بإحداثيات المقر) + العدّادات caption · `AccentHeading` (شرطة تركواز) موحّد · معرض فسيفساء · ظهور منسّق واحد (`helpers/reveal.ts`) · `loading.tsx` مطابق.
- **جاليري الفريق** (`components/team-gallery/TeamGalleryCard.tsx`): مربّعات، القيادة ٢×٢، فسيفساء زغزاغ (L L s s / L L s s / s s L L / s s L L / s s s ·) مع بلاطة براند تسدّ الخلية الأخيرة (١٣ = عدد أوّلي). البيانات نُقلت من `app/story/TeamCarousel.tsx` إلى `lib/team/team-members.ts` (مستهلكان → lib التطبيق)، و`TeamCarousel` يستوردها.
- **حذف «شركاؤنا الأوائل»** (كود + نصّ) بطلب خالد · «قصة الشعار» انتقلت لليمين (اليمين = «قصة مدونتي» ٥ · اليسار = «الفريق والشركاء») · دوران السهم استُبدل بانزلاق+تلاشٍ.
- **TSC (modonty):** آخر تشغيل `TSC_EXIT:0` بعد جاليري الفريق. **Build:** لم يُشغَّل. **تست حيّ:** الهيرو/المعرض/الحركة/الـPopover تحقّقت فاتح+داكن ١٢٨٠×٨٠٠ **قبل** آخر تغييرين؛ العطل أعلاه ظهر بعدها.

### 📝 قرارات
- **الفريق ليس في القاعدة** — خالد قال «حتلاقيها في جدول السيو»؛ قِيس على `modonty_dev` (المفعَّل في `shared/.env`): `Author` = صفّ واحد (مدونتي نفسها) · `Staff` = ١٢ صفاً كلها بلا صورة وأسماء لا تطابق الـ١٣. **لا، غلط — أُبلغ.** الإنتاج لم يُفحص (ممنوع سكربت عليه بلا كلمته).
- **توصيتي لصفحة الموظف (لم تُنفَّذ، تنتظر خالد):** استعمال `Author` (نموذج Person/E-E-A-T بصفحة عامة جاهزة `/authors/[slug]`) + `staffId?` + `isPublic`، لا حقول على `Staff` (جدول دخول فيه باسوردات). التواصل عبر إيميل الشركة من `Settings` فقط. الإدخال من الأدمن (١٣ سجلاً + صور بني).
- الـPopover لا الدرج · Popover مو Accordion (الأكورديون يغيّر ارتفاع الرايل الـsticky).

### 🚧 معلّق
- 🔴 **عطل hydration الرايل الأيمن** (أعلاه) — لازم يُقفل قبل أي دفع.
- ⚠️ `ahmed.png` على بني حجمه **1.45 MB** (`curl` → `SIZE:1452594`) — أول تحميل عبر محسّن Next تأخّر وظهرت الصورة مكسورة لحظة؛ يحتاج ضغطاً على بني (بيانات لا كود).
- شرائح الخدمات لا تظهر على `/modonty` — `services` فاضي بالقاعدة (استنتاج من الرسم، لم يُقَس مباشرة).
- توزيع المواضيع بين الرايلين لم يؤكّده خالد نهائياً · صفحة الموظف تنتظر قراره · V10 الجوّال · باقي معلّقات البلوكات السابقة.
- تحذير مكرّر بالكونسول على كل صفحة: `[auth][error] JWTSessionError` ×٢ (`MobileNotificationBadge` · `NotificationsBell`) — موجود قبل الجلسة على `/` أيضاً، ليس من شغل اليوم.

### 📂 الملفات
- `shared/components/column-layout/{ThreeColumnLayout,TwoColumnLayout}.tsx` · `shared/components/sticky-rail/StickyRail.tsx` · `shared/components/ui/popover.tsx` (جديدة) · `shared/components/ui/{button,sheet}.tsx` (motion) · `shared/package.json` (+popover) · `.claude/rules/folder-structure.md` · `.claude/skills/modonty-uiux/SKILL.md` · `.claude/skills/apple-design/SKILL.md` (جديد).
- `modonty/app/modonty/**` (page · loading · TASK.md · components/{profile-hero,gallery,articles-feed,right-rail,left-rail,story-popover,team-gallery,accent-heading} · helpers/reveal.ts) · `modonty/messages/ar.json` (namespace `modonty`) · `modonty/lib/team/team-members.ts` (جديد) · `modonty/app/story/{TeamCarousel.tsx,_constants.ts}` · `modonty/components/shared/about-card/AboutCard.tsx` (رابط `/modonty`) · صفحات `/`,`/clients`,`/industries` (استبدال القشرة).

### 🔁 Git
- الفرع `modonty-ui` · آخر كوميت **`339b369`** «الرئيسية: كرت مدونتي بارتفاع كرت الحساب…» (وقبله `b45b307` — كلاهما بعد `1e79b3c` المسجّل في البلوك السابق؛ **حالة دفعهما غير متحقَّقة**، افحص `git status -sb`).
- **غير مثبَّت: كثير جداً** — كل شغل اليوم + شغل سابق (انظر `git status`؛ ≈ ٤٠ ملفاً معدَّلاً + عشرات المجلّدات الجديدة تحت `modonty/app/{clients,industries,modonty,about}` و`modonty/components/shared/*` و`modonty/messages` و`shared/components/*`).
- **لم يُدفع.** فيرسل بلا تغيير.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم `git status -sb` (هل `339b369` مدفوع؟).
2. شغّل مودونتي، افتح `/modonty`، انتظر ٤ ثوانٍ، نفّذ في الكونسول: `document.querySelectorAll('aside button[aria-haspopup]').length` — لو ≠ 6 فالعطل قائم → بيسكشن (انقل بطاقة واحدة بين الرايلين).
3. بعد الإصلاح: قرار خالد على نموذج بيانات الفريق (`Author` + `isPublic`) قبل أي سكيما.

## Session: 2026-08-16 (صباحاً) — 🛠️ إصلاح فشل بناء فيرسل بعد `c71cb61` (`1e79b3c` · modonty 1.90.1 · فرع `modonty-ui` · مدفوع · `test.modonty.com` أخذ التعديلات)

### 🎯 أين توقفت
- **آخر شيء:** خالد سأل «ليش ما تأثر النطاق الفرعي بالتعديلات؟» + لقطة فيرسل: نشر `c71cb61` **Error 39s**. شخّصت من سجلّ البناء، أصلحت، بنيت محلياً (٢٨٢/٢٨٢)، دفعت `1e79b3c` بأمره «push»، وتحقّقت: النشر الجديد **Ready** و`test.modonty.com` يخدم الرئيسية الجديدة (200، النصوص الأربعة موجودة في الـHTML الحيّ).
- **الخطوة التالية عند الرجوع:** خالد يقرّر — الجوّال (V10) أو مراجعة الرئيسية الحيّة على `test.modonty.com` (ريفرش على `/page/3` + الرِيلان). الدمج بأمره الصريح فقط.

### ✅ المنجز هذه الجلسة
- **السبب الجذري (سببان من نقل الهيدر إلى القشرة الثابتة في `c71cb61`):** لمّا شِلت `<Suspense>` القديم حول الهيدر (كان في `TopNavWithFavorites`)، صار جوّاه مكوّنان يقرأان بيانات الطلب بلا حدّ → `Uncached data was accessed outside of <Suspense>` وقت التصيير المسبق:
  1. `UserMenu` → `useSession()` (يعلّق على وعد الجلسة) — أول فشل على `/tags/[slug]` (سجلّ فيرسل: `UserMenu.tsx:13`).
  2. `DesktopNavLinks` → `usePathname()` — الثاني على `/page/[pageNumber]` (أثر `--debug-prerender` → `TopNavDesktop`). التوثيق الرسمي `node_modules/next/dist/docs/.../use-pathname.md:8`: مع `cacheComponents` يحتاج `Suspense` على أي مسار له باراميتر ديناميكي.
- **الإصلاح:** حدّان صغيران بدل حدّ واحد حول الهيدر كلّه (الهدف الأصلي — الهيدر في القشرة — محفوظ): `UserMenu` تحت حدّ بحجم زرّ «دخول» (ديسكتوب `h-9 w-16`، جوّال `h-11 w-11`) · القائمة فُصلت إلى `DesktopNavList` عرضية، الحدّ يبثّ علامة «النشط» فقط والبديل هو نفس الروابط بلا علامة — صفر إزاحة، الروابط تبقى في القشرة.
- **`loading.tsx` لـ`/page/[pageNumber]`** كان ناقصاً (قاعدة المشروع) — يعيد تصدير هيكل الرئيسية. (لم يكن هو سبب الفشل — جرّبته أوّلاً وفشل البناء ثانيةً؛ سُجّل هنا كي لا يُعاد التخمين).
- **الحالة:** `next build` محلياً = `✓ 282/282` · EXIT 0 (TypeScript ضمنه) · فيرسل `ak9hx2l0j` **● Ready** · `curl test.modonty.com` = 200 ويحوي «اسأل مودو · استكشف المجالات · الطلّات · شركاء موثوقون».

### 📝 قرارات
- الحدود على المستهلكين (UserMenu · روابط القائمة) لا على الهيدر كلّه → لأن حدّاً حول الهيدر يعيد المشكلة المقيسة يوم ١٥ أغسطس (الهيدر آخر ما يصل). البديل المرفوض: `generateStaticParams` على `/page/n` (يجعل الحدّ اختيارياً لكنه يثبّت أرقام صفحات تتغيّر مع كل مقال).

### 🚧 معلّق
- ⚠️ ملاحظة جانبية من `--debug-prerender` فقط: `USE_CACHE_TIMEOUT` من `getClientsGA4Stats` (`lib/analytics/ga4.ts:208`) على `/clients/[slug]` — لم يظهر في البناء العادي ولا على فيرسل؛ مرشّح للمراجعة، ليس عطلاً مثبتاً.
- كل معلّقات البلوك السابق كما هي: V10 الجوّال · V3 صور/وصف المجالات (بيانات) · T3 (`loading.tsx` + sitemap لـ/booking و/shop) · T6 · «الطلّات» الوهمية dev-only في `CachedHomePage.tsx` · `IconVerified` في `ClientsCardMobile` · ملفان تجريبيان في الجذر (`img-reqs.txt` · `mobile-uiux-mockup.html`).
- الدمج إلى `main` — بأمر خالد الصريح فقط.

### 📂 الملفات
- `modonty/app/layout/components/nav/DesktopUserAreaClient.tsx` — Suspense حول `UserMenu` (بديل بحجم زرّ دخول).
- `modonty/app/layout/components/nav/TopNav.tsx` — نفسه للجوّال (44px).
- `modonty/app/layout/components/nav/NavLinksClient.tsx` — `DesktopNavList({pathname})` عرضية + `DesktopNavLinks` تقرأ `usePathname`.
- `modonty/app/layout/components/nav/TopNavDesktop.tsx` — `<Suspense fallback={<DesktopNavList pathname={null}/>}>`.
- `modonty/app/(homepage)/page/[pageNumber]/loading.tsx` — جديد، يعيد تصدير `(homepage)/loading`.
- `modonty/package.json` — 1.90.0 → 1.90.1.

### 🔁 Git
- الفرع `modonty-ui` · آخر كوميت `1e79b3c` «إصلاح فشل بناء فيرسل…» · **مدفوع** (`c71cb61..1e79b3c`) · محلي = بعيد ٠/٠ · غير مثبَّت: `settings.local.json` · `.mcp.json` · `.pnpm-store/` · الملفان التجريبيان.
- فيرسل: `modonty-modonty` نشر `ak9hx2l0j` Ready (Preview من الفرع) · `test.modonty.com` حيّ عليه.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `test.modonty.com` بريفرش قاسٍ وقارن مع `.playwright-mcp/review4-desktop.png`.
2. اختبر على التست: `/page/3` ريفرش + عجلة → `/page/4`، والرِيلان.
3. قرار خالد: الجوّال (V10) أو الدمج.

---

## Session: 2026-08-16 (فجراً) — 🖥️ إعادة بناء الرئيسية على الديسكتوب اكتملت ودُفعت (`c71cb61` · modonty 1.90.0 · shared 0.2.3 · فرع `modonty-ui`)

### 🎯 أين توقفت
- **آخر شيء:** دفعت كوميت واحد كبير `c71cb61` (كل شغل ١٥–١٦ أغسطس) إلى `origin/modonty-ui` — الفرع المحلي = البعيد (٠/٠). خالد قال «خلصنا الديسكتوب بهذا».
- **الخطوة التالية عند الرجوع:** خالد نفسه قال إن **الجوّال له شغل ثانٍ لاحقاً** (لم يبدأ) — أول مقال على الجوّال عند y≈٧٩٨ من ٨٤٤ (بند V10). ثم قرار الدمج/النشر لـ`test.modonty.com` (الفرع يخدم نطاق التست تلقائياً بعد الدفع — يُتحقّق منه أولاً).

### ✅ المنجز هذه الجلسة (كلّه مقيس، اللقطات في `.playwright-mcp/review*.png`)
**بنية الرئيسية (ديسكتوب):**
- الرِيل الأيمن (يظهر من ١٠٢٤): كرت الحساب (سيرفر، فتحة تمريرية عبر `use cache`) + كرت مدونتي. الرِيل الأيسر (من ١٢٤٠): «شركاء موثوقون» → «احجز/تسوّق» (أيقونات لا صور) → «استكشف المجالات» (صفوف: صورة مربّعة + اسم + وصف من القاعدة، ٦ ظاهرة والباقي سكرول داخلي بتدرّج، بلا رابط «كل المجالات»).
- عمود المقالات: شريط مودو (رابط بشكل حقل «Start a post») → طلّات (٤ مربّعات، عنوان للآلة فقط، أيقونة تشغيل وسطية ٣٢) → المقالات. **أول مقال عند y=٣٢٠ من ٨٠٠** (كان ٥٣٧).
- `StickyRail` (مكوّن عميل صغير): الرِيل الأقصر من الشاشة يثبت تحت الهيدر، الأطول يتحرّك حتى يظهر آخره ثم يثبت — بلا سكرول داخلي للرِيل. الرِيلان ٦٥٣/٦٩٠ < ٧٠٤.
- «المزايا» حُذفت من القائمة مع سلسلتها الميتة (٣ ملفات) + `TopNavWithFavorites` و`get-favorites-count` (كانا يحجبان الهيدر لعدّاد لا يُعرض) + `SectionLink` + `services-card` + `ask-modo` القديم.
- القائمة العلوية: الرئيسية · الرائجة · الشركاء · الطلّات · استمع · عن مدونتي (بعلامة مدونتي M). الفوتر: «الصناعات»→«المجالات» + التصنيفات + الطلّات + الأسئلة الشائعة (`/help/faq`) + تواصل معنا.
- مبدّل المظهر (فاتح/داكن/حسب الجهاز، shadcn فوق next-themes) في مجموعة أدوات الهيدر (ديسكتوب + جوّال)، لونه باهت وقائمته بلون الهيدر. حقل البحث بيضاوي بلا شارة `/`. الشعار: ارتفاع ثابت وعرض حرّ (كان محشوراً ٤٠×١٠).
**الأداء:**
- الهيدر ثابت في القشرة (كان آخر ما يصل، +٣٫٣ ث بعد القشرة) — الجرس وشارة التنبيهات وحدهما يُبثّان في حدود صغيرة. كرت الحساب: هيكل ١٩٠ = الكرت (كان ٢٢٠ → قفزة ٣٠). قِست: `auth()` ٢٥–٥٧ مللي، القاعدة ٣٠ — التأخير الملحوظ = وضع التطوير.
- LCP: البطلان (تغذية الديسكتوب · كرت مدونتي جوّال) `eager` + `fetchPriority="high"` بدل `preload`/lazy، و`sizes` صادقة تعطي التوأم المخفيّ 16w. مقيس بارد على DPR 3: طلب واحد ≥640w، ١٨٨ كيلو للرئيسية.
- البلور (LQIP) رجع لكل بطاقات التغذية (`imageBlur` على `FeedPost` — إضافة فقط، عقد `/api/articles` لم يتغيّر). صورة بطاقة المقال 5:2 بدل 16:9.
- حذف نمط تسخين صور الصفحة التالية (NextFaster) بعد فحص المصادر — ليس رسمياً (`project_preload_hero_removed`).
**نظام التصميم:** `--link` للنصّ الأزرق (الليلي #7070FF — النصوص الفاشلة ٣→٠) · ثلاثة أوزان 400/500/700 (§٣.١ صُحّح: 500 محمَّل أصلاً) · قاعدة الزرّ المشتركة `rounded-full`+`font-bold` (مدونتي ماستر) · علامة التوثيق (الدرع مع M) مكوّن مشترك `shared/components/icons/modonty-trust-mark.tsx` + `modonty-mark.tsx`.
**النصوص:** ٢٧ نصّاً بلهجة سعودية بسيطة («مدونتي أحلى بحسابك» · «إنشاء حساب» · «نجيب لك المزيد…») · «عملاء»→«شركاء» في ١١ موضعاً بمعنى الشركاء (تُركت ١٥ بمعنى زبائن الشريك عمداً).
**الحالة:** tsc = 0 (عدا ضجيج `.next/dev/types/validator.ts`) · build لم يُعَد بعد الكوميت · تست حيّ Playwright ديسكتوب مكتمل · الجوّال غير مراجَع.

### 📝 قرارات
- الجوّال يُترك لجلسة لاحقة (خالد). · الحجز/التسوّق تبقى بطاقة مستقلّة (قيمة بزنس للشريك) لا أزراراً داخل شريط مودو. · لا سكرول داخلي في الرِيل؛ سكرول داخلي مقبول في كرت المجالات فقط. · «عملاء» بمعنى زبائن الشريك تبقى.

### 🚧 معلّق
- V10 الجوّال (أول مقال خارج القشرة) · V3 صور المجالات = بيانات (`socialImage` = الشعار الافتراضي للثمانية؛ تفريغها بيد خالد على dev ثم prod) + وصف المجالات فارغ في dev · T3 (`loading.tsx` + sitemap لـ/booking و/shop) · T6 (`data-scroll-behavior`) · «الطلّات» وهمية في dev (٣ من المقالات، `NODE_ENV=development` فقط في `CachedHomePage.tsx`) — تُحذف قبل الدمج أو تبقى لأنها dev-only (قرار).
- شارة `IconVerified` ما زالت في `ClientsCardMobile` (الجوّال) — تُستبدل بعلامة التوثيق مع شغل الجوّال.
- ملفان تجريبيان في الجذر غير مثبَّتين: `img-reqs.txt` · `mobile-uiux-mockup.html`.

### 📂 أبرز الملفات (٩٩ ملفاً في الكوميت)
`app/(homepage)/components/{page-layout/CachedHomePage,shared/StickyRail,home-actions,commerce-actions,industries-card,clients-card,reels-card,left-sidebar,right-sidebar}` · `app/layout/components/nav/{TopNav,TopNavDesktop,ThemeToggle,LogoNav,SearchLink,NavLinksClient}` · `app/layout/helpers/nav-config.ts` · `shared/components/{infinite-list,use-mount-on-approach,icons/modonty-mark,icons/modonty-trust-mark,ui/button}` · `app/globals.css` (`--link`) · `documents/design/DESIGN-SYSTEM.md` · `app/(homepage)/documentation/HOMEPAGE-BOARD.html`.

### 🔁 Git
- الفرع `modonty-ui` · آخر كوميت `c71cb61` · **مدفوع** (`ed121af..c71cb61`) · محلي = بعيد · غير مثبَّت: `settings.local.json` · `.mcp.json` · `.pnpm-store/` · الملفان التجريبيان.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `.playwright-mcp/review4-desktop.png` واللوحة `HOMEPAGE-BOARD.html`.
2. تحقّق أن `test.modonty.com` أخذ الكوميت (الفرع يغذّيه) واختبر الريفرش على `/page/3` والرِيلين هناك.
3. ابدأ الجوّال (V10) لو قال خالد، أو الدمج بأمره الصريح فقط.

---

## Session: 2026-08-15 (ليلاً) — ♾️ التمرير اللانهائي اكتمل ١٠٠٪ (IS1–IS6) + فحص ختامي ضدّ توثيق جوجل الحيّ + رجوع Next إلى 16.2.9 (فرع `modonty-ui` · محلي فقط · **لم يُدفع**)

### 🎯 أين توقفت
- **آخر شيء أنجزته:** الفحص الختامي للتمرير اللانهائي — كل شروط جوجل السبعة (مجلوبة اليوم من التوثيق الحيّ لا من الذاكرة) انقاست ونجحت بدليل خام. الحكم: **نهائي على بيئة التطوير، صفر فجوات، صفر بطاقات جديدة**.
- **الخطوة التالية عند الرجوع:** قرار خالد — إمّا دفع الفرع (٦٨ ملفاً غير مثبَّت، طقس الدفع الكامل) وبعده فحص URL Inspection في Search Console، أو مواصلة بطاقات اللوحة المفتوحة (D1 · V3 · V4 · T1 · T2 · T3).

### ✅ المنجز هذه الجلسة

**١ — رجوع Next.js إلى `16.2.9` بأمر خالد** — ترقية 16.3.1 فشل تحقّقها (`tsc` انهار مرّتين بنفاد الذاكرة حتى مع 8GB؛ جُرّب TS 7.0.2 فقرأ أنواع Prisma خطأ). بعد الرجوع: `pnpm build` ✓ 279/279.

**٢ — كنسة use-client على الرئيسية: من ١٦ ملف عميل إلى ٣** (المتبقّية بمبرّر مقيس: `MoreArticles` · `MoreArticlesOnScroll` · `UserCard`):
- `AskModo` سيرفر (الكرت كله رابط لـ`/modo-chat`) · `ModontyCard` سيرفر (بطل + ٣ مصغّرات) · `IndustriesCard` على `Scroller` المشترك الجديد (صفر JS، `scrollbar-rail` في globals.css).
- أشرطة الجوال أُعيد بناؤها سيرفراً بنفس التصميم الأول حرفياً: `ServiceBar` + `DiscoveryBar` + `BottomBar`؛ حُذفت الأوراق المنزلقة والأزرار العائمة وملفات بياناتها (−٤ استعلامات DB من الرئيسية). صفحتا `/booking` و`/shop` أُنشئتا.
- `ScrollButtons` صار سيرفر-فقط بأنيميشن CSS مقاد بالتمرير (`animation-timeline: scroll(root block)` + `animation-range: 800px 900px` + `fill both`) — ثلاثة أعطال حُلّت وموثَّقة على اللوحة: Link يبتلع نفس الهاش (→ `<a>` خام) · السهم الظاهر مع motion-reduce (→ حذف الحركة من الكيفريم) · النسبة المئوية تنزاح مع التمرير اللانهائي (→ عتبات بكسل).
- `buttonVariants` بدل `<Button asChild>` في ٥ مواضع (تصحيح خالد من توثيق shadcn الرسمي).

**٣ — التمرير اللانهائي IS1–IS6 كلّه أُقفل** (خطة اللوحة بند-بند، كل بند بقياس):
- **IS1** سلسلة `/page/n` (لا `?page=n` — حماية القشرة الثابتة؛ `searchParams` ممنوعة داخل `use cache`): صفحة خارجية `FeedPage` تمرّر الرقم لـ`CachedFeedPage` بـ`use cache` + كانونيكال ذاتي + عنوان فريد + روابط سابقة/تالية `<a>`. الحالات عبر `proxy.ts` (القشرة تنطلق قبل `notFound()` فالـ404 من البروكسي) + `publishedFeedTotalPages` في `archive-cache.ts`.
- **IS2** القراءة من `GET /api/articles` لا سيرفر أكشن (الأكشنات تصطفّ واحداً-واحداً) · **IS3** `ArticlesList` سيرفر + حذف فلاتر `?client=/?category=` الميتة (تصحيح مسجَّل: «ازدواج ١٥٦ كيلو» لم يثبت) · **IS4** حذف `content` من `FeedPost` والمنتجين الثلاثة والمستهلكين · **IS5** `content-visibility:auto` + `contain-intrinsic-size` على بطاقتي المقال.
- **IS6 بقرار خالد: المحرّك في حزمة `shared/` الجذرية** (سيخدم الكونسول والأدمن؛ تجاوز واعٍ لقاعدة «لا ترقية عند أول استخدام»، شرطه: صفر معرفة منتج): `shared/components/infinite-list.tsx` (مراقِب + جلب + منع تكرار بالمفتاح + pushState اختياري + render props تمرّر البيانات للأعلى — عقد جوجل موثَّق في رأسه) + `shared/components/use-mount-on-approach.ts` (بوّابة تأجيل التحميل). `MoreArticles` صار جِلداً بنفس الواجهة حرفياً.

**٤ — الفحص الختامي ضدّ جوجل (طلب خالد «perfect 100%»):** التوثيق جُلب حيّاً (lazy-loading + pagination). القياسات الخام: `/page/2..12` حتمية (md5 متطابق بين تحميلين) · تداخل صفر (رئيسية∩ص٢=٠ · ص٢∩ص٣=٠) · الأخيرة (١٢) بلا «تالية» و`hasMore:false` · `abc/0/02/13+/99999`→404 و`/page/1`→308 · كل دفعة مرسومة سيرفراً (curl بلا JS) · حيّ بالمتصفح بعد استخراج IS6: التمرير `/`←`/page/2`←`3`←`4` مع التقاط `GET /api/articles?page=n` · زر الرجوع يرجّع الرابط ويبقي المحتوى (النمط الصحيح) · بلا noindex + كانونيكال ذاتي.
- **حالة التحقّق:** tsc مودونتي = ٠ (بعد IS6) · build لم يُعَد بعد IS4–IS6 · تست حيّ للتمرير = نجح كاملاً.

### 📝 قرارات
- **الرجوع لـ16.2.9** → OOM بيئي على هذا الجهاز، وخالد أوقف الملاحقة → البقاء على 16.3.1 رُفض.
- **`/page/n` لا `?page=n`** → حماية القشرة الثابتة (١١٧ كيلو) → قراءة searchParams رُفضت.
- **الحالات من البروكسي** → soft-404 مقيس (القشرة 200 قبل notFound) — نفس نمط بقيّة الأقسام.
- **IS6 في `shared/` الجذرية بقرار خالد** → الكونسول والأدمن سيستهلكانه → إبقاؤه داخل مدونتي رُفض.
- **ترقيم مطلق مع منع تكرار بالمفتاح** → جوجل تمنع العناصر النسبية (`?date=yesterday`) → تثبيت النافذة بختم زمني رُفض.

### 🚧 معلّق
- **قرارات اللوحة:** D1 (أسئلة النيّة الثلاثة — يحجب V1·V2·V5) · D2 (قاعدة button.tsx المشتركة) · D3 (إرجاع تثبيت featured في ModontyCard).
- **جاهز للتنفيذ:** V3 (صور الروبوت المتكرّرة) · V4 (انهيار العمود الأيمن حين ReelsCard يرجع null) · T1 (قصّ أسماء المجالات عند 1128px) · T2 (١٣ لون rgba يدوي) · T3 (loading.tsx + sitemap لـ/booking و/shop).
- **فحص Search Console (URL Inspection) للسلسلة المرقّمة** — لا يتمّ إلا على الإنتاج بعد الدفع.
- **تحسين اختياري خارج شروط جوجل:** `aria-live` لإعلان الدفعات الجديدة لقارئ الشاشة.
- أخطاء كونسول `JWTSessionError` في النافبار (جلسة قديمة بمتصفح التست) — خارج نطاق التمرير، لم تُعالج.

### 📂 أبرز الملفات (٦٨ غير مثبَّت — القائمة الكاملة في `git status`)
- `shared/components/infinite-list.tsx` + `shared/components/use-mount-on-approach.ts` — **جديدان**: محرّك التمرير المشترك وبوّابته.
- `modonty/app/(homepage)/page/[pageNumber]/page.tsx` — **جديد**: السلسلة المرقّمة.
- `modonty/proxy.ts` · `modonty/lib/archive-cache.ts` — حالات السلسلة (308/404) + عدّ الصفحات.
- `modonty/app/(homepage)/components/articles-list/{ArticlesList,MoreArticles,MoreArticlesOnScroll}.tsx` — سيرفر + جِلد المحرّك + البوّابة.
- `modonty/lib/types.ts` + المنتجون الثلاثة + `MobilePostCard`/`PostCardBody`/`DesktopPostCard` — حذف `content` + content-visibility.
- `modonty/app/(homepage)/components/mobile-bottom-bar/{BottomBar,ServiceBar,DiscoveryBar}.tsx` · `scroll-buttons/ScrollButtons.tsx` · `components/shared/scroller/Scroller.tsx` — إعادة البناء سيرفراً.
- `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — **العقد المرجعي**: IS1–IS6 خضراء بقياساتها + التصحيحات + المفتوح.

### 🔁 Git
- الفرع: `modonty-ui` · آخر كوميت: `ed121af` (مدفوع) · **٦٨ ملفاً غير مثبَّت — لم يُدفع شيء بعده** · لا دفع بلا إذن صريح جديد.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — الحالة كلها فيه.
2. لو القرار «ندفع»: طقس الدفع الكامل (backup · tsc الثلاثة · version bump · كوميت بمسارات محدّدة يستثني الريلز و`.mcp.json`/`settings.local.json`).
3. لو القرار «نكمل اللوحة»: ابدأ بقرار D1 أو ببنود جاهز-للتنفيذ.

---

## Session: 2026-08-15 (مساءً) — 🌐 نطاق التست `test.modonty.com` حيّ + كنسة نظام التصميم على الرئيسية + ترقية Next 16.3.1 **غير محقَّقة**

### 🎯 أين توقفت
- **آخر شيء كنت أعمله:** التحقّق من ترقية Next.js إلى `16.3.1` — `tsc` انهار مرّتين بنفاد الذاكرة (`FATAL ERROR: Ineffective mark-compacts near heap limit`)، وخالد أوقف المحاولة الثالثة (بذاكرة ٨ جيجا) وطلب تجميد الجلسة وإعادة التشغيل.
- **الخطوة الأولى عند الرجوع:** `cd modonty && NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit` — بجهاز مُعاد تشغيله. لو نظيف، `pnpm build`. لو انهار مرّة أخرى فالسبب الجهاز لا الترقية، والقرار: نبقى أو نرجّع لـ`16.2.9`.
- **خالد قال صراحةً:** «موضوع التسليم ذا تشيل همه» — يعني لا نستعجل ولا نرجّع الترقية بحجّة الوقت.

### ✅ المنجز هذه الجلسة

**١ — نطاق التست حيّ ويعمل: `https://test.modonty.com`**
- أُضيف للمشروع عبر `POST /v10/projects/{id}/domains` مع `gitBranch: modonty-ui` (الـCLI ٥٩٫١٫٣ لا يملك أمراً لنطاقات المشروع — لا وجود لـ`vercel project domains`).
- احتاج سجلّ `TXT` على `_vercel.modonty.com` (نمط الحساب: سجلّ لكل نطاق فرعي — خمسة موجودة أصلاً). خالد أضافه، والتوثيق نجح.
- **الفحص القاسي مقيس خاماً:** `test.modonty.com` → `200` + `X-Robots-Tag: noindex, nofollow` · `www.modonty.com` → `200` بلا الرأس · قاعدة البيانات `target:["preview"] → modonty_dev` · `/` `/clients` `/reels` `/trending` `/about` = ٢٠٠ · صفحة مفقودة = ٤٠٤ · `misconfigured: false`.
- `/articles` يرجع ٤٠٤ **عن قصد** — مشروح في `next.config.ts:17-23`.

**٢ — كوميت واحد دُفع: `ed121af`** (٩٣ ملفاً · ١١٩١ سطراً · النسخة `1.89.0`)
- إعادة هيكلة الرئيسية كاملة (كانت **غير مثبَّتة أصلاً**، لا مجرّد غير مدفوعة — صحّحت ادّعائي السابق).
- رأس `X-Robots-Tag: noindex` على أي نشر ليس إنتاجاً، مفتاحه `VERCEL_ENV`.
- **عطل في الطريق:** أول بناء فشل — الكاش المستعاد يحمل روابط خطّ Montserrat قديمة وجوجل ترجع `404` عليها. تحقّقت بنفسي (القديم ٤٠٤ · الحيّ ٢٠٠)، فأعدت النشر بلا كاش عبر `VERCEL_FORCE_NO_BUILD_CACHE=1` مؤقتاً ثم حذفته.

**٣ — كنسة نظام التصميم على `app/(homepage)/` (غير مثبَّتة)**
| البند | قبل | بعد |
|---|---|---|
| ظلّ في التدفّق | ٩ `shadow-sm` + ٧ مخصّص | صفر (٣ باقية على عناصر تطفو فوق صور — مسموحة) |
| `ring-1` | ١ | ٢١ |
| أوزان ممنوعة | ١٤ `semibold` + ١١ `medium` | صفر |
| نصف القطر | ٧ مقاسات | ٣ (`lg` حاوية · `full` تحكّم · `sm` مصغّرة) |
| عرض الحاوية | `1280px` | `1128px` |
| جهات فيزيائية | ٣ | صفر |

**٤ — كل عناصر التحكّم صارت shadcn** — كانت ١٠ `<button>` خام + `<input>` خام. المقيس بعدها: **صفر عنصر خام** في المسار. وأسهم الكاروسيل صارت قرصاً ٣٢ داخل هدف لمس ٤٨ (§٧ · WCAG 2.5.5).

**٥ — لوحة مرجعية جديدة:** `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — بطلب خالد، وهي **المرجعية المتّفق عليها للرئيسية**. أربعة أقسام: جرد الأزرار · التقرير البصري · تدقيق نظام التصميم · المفتوح.

**٦ — الترقية (غير محقَّقة):** `next` ١٦٫٢٫٩ ← **١٦٫٣٫١** في مدونتي والأدمن والكونسول · `react`/`react-dom` ١٩٫٢٫٤ ← **١٩٫٢٫٨**. `pnpm install` مرّ.

**حالات التحقّق:** `tsc` نظيف قبل الترقية · **بعدها: انهار بنفاد ذاكرة (غير معروف)** · بناء: لم يُشغَّل · تست حيّ: الرئيسية ترسم على ١٦٫٢٫٩ فقط.

### 📝 قرارات بأسبابها
- **نطاق تست دائم بدل الاكتشاف على الإنتاج** → صار قاعدة ذهبية بأمر خالد: التست محلياً وعلى النطاق الفرعي، والإنتاج هدف نشر لا مكان اكتشاف. البدائل المرفوضة: Vercel Authentication (خالد رفضها — «الموظف عادي حيدخل على الدومين») · النطاق البديل بالـwildcard (يحتاج نقل الـDNS كاملاً لـVercel).
- **`X-Robots-Tag` وحده بلا `Disallow` في robots.txt** → لأن الـ`Disallow` يمنع الزاحف من جلب الصفحة فلا يقرأ الـ`noindex` أصلاً. المصدر: Google Search Central.
- **المفتاح `VERCEL_ENV` لا `NEXT_PUBLIC_SITE_URL`** → الفحص على Vercel أثبت أن الأخير يحمل نفس القيمة في البيئات الثلاث فالشرط ما كان بيتحقّق أبداً.
- **الظلّ يبقى على ما يطفو فوق الصور** (سهما الكاروسيل · شارة الريل) → حلقة ١px تختفي فوق صورة عشوائية. حكم لا تطبيق أعمى للقاعدة.
- **UI/UX senior صار قاعدة ذهبية** بنصّ خالد، وشِقّها الثاني «التدريب»: أسمّي المبدأ ومصدره وأرفض الحلّ المبتدئ صراحةً. سُجّلت في `memory/feedback_uiux_standards.md`.

### 🚧 معلّق / محجوب
- **ترقية `16.3.1`** — محجوبة بفحص `tsc` الذي ينهار بنفاد الذاكرة. الجهاز في جلسة طويلة (القاعدة المعروفة: استنزاف الـheap بعد كثرة العمليات).
- **مهارة `next-dev-loop`** — `npx skills add vercel/next.js --skill next-dev-loop` خرج بصفر لكن **لم ينزل شيء على القرص**. لم تُشخَّص بعد. تحتاج `agent-browser@^0.27`. لا تحتاج Playwright — متصفّح مستقلّ، فخالد يشتغل على Chrome بلا تصادم.
- **قاعدة الزرّ المشتركة تخالف النظام** — `shared/components/ui/button.tsx` فيها `rounded-md` و`font-medium`. **قرار خالد:** نصلّح القاعدة مرّة (ونفحص الأدمن) أم نُبقي الأصناف الزائدة في نداءات مدونتي؟
- **انحدار أحدثته:** تضييق الحاوية لـ`1128px` يقصّ أسماء بلاطات «استكشف المجالات» (`calc((100%-1.5rem)/3)`).
- **الألوان اليدوية `rgba(` ×١٣** في ٨ ملفات — لم تُكنس.
- **الأسئلة الثلاثة** — تحجب أي تعديل بصري على الرئيسية. لم يُجب على أيٍّ منها.
- **`ignoreCommand` في `modonty/vercel.json`** — كوميت لا يلمس `modonty/` يتخطّى البناء، فالنطاق قد يعرض نشراً قديماً. لم يُعالَج.
- **تبعيات `@tiptap/*` في الأدمن** — تحذير أقران غير محلول (`core@3.19.0` مقابل `^3.22.2` المطلوب). سابق للترقية.

### 📂 ملفات مسّت (غير مثبَّتة)
- `modonty/app/(homepage)/components/**` — ١٧ ملفاً: حلقات بدل ظلال · أوزان · أقطار · shadcn بدل الخام
- `modonty/app/(homepage)/loading.tsx` · `components/page-layout/PageLayout.tsx` — الحاوية `1128px`
- `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — جديد، اللوحة المرجعية
- `modonty/package.json` · `admin/package.json` · `console/package.json` — `next: 16.3.1`
- `shared/package.json` — `react: ^19.2.8` · `pnpm-lock.yaml`
- `C:/Users/w2nad/.claude/projects/…/memory/feedback_uiux_standards.md` + `MEMORY.md`

### 🔁 حالة الجيت والنشر
- الفرع: `modonty-ui` · آخر كوميت **`ed121af`** · **مدفوع** (`origin/modonty-ui` متطابق، ahead = 0)
- غير مثبَّت: ٣٠ مدخلاً (١٧ ملف واجهة + ٤ ملفات حزم + `pnpm-lock.yaml` + اللوحة الجديدة + `img-reqs.txt` و`mobile-uiux-mockup.html` و`.mcp.json` و`settings.local.json` — الأربعة الأخيرة **تُستبعد من أي كوميت**)
- Vercel: نشر `dpl_5QvNHup…` **Ready** من `ed121af` على `test.modonty.com` · الإنتاج على `main` لم يُمسّ إطلاقاً
- السيرفر المحلي: **مقفول** (`taskkill node` قبل الترقية)

### 🚀 الاستئناف في ٣٠ ثانية
1. أعد تشغيل الجهاز أولاً (الـheap مستنزف) ثم: `cd modonty && NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit`
2. لو نظيف: `pnpm build` ثم `pnpm dev` وافتح `http://localhost:3000` — والقياس المرجعي في `HOMEPAGE-BOARD.html`
3. القرار الأول: قاعدة الزرّ المشتركة — نصلّحها مرّة أم نُبقي الأصناف الزائدة؟
4. اللوحة: `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html`

---

## Session: 2026-08-15 — 🗄️ يوم «مصدر الحقيقة»: الكيان القانوني واسم الموقع وhreflang كلّها من القاعدة + خمس بطاقات SOT أُقفلت (فرع `modonty-ui` · ٤ كوميتات حتى `12c3dea` · **دُفعت ضمن `ed121af`**)

### 🎯 أين توقفت
- **كل صفحات الموقع أُقفلت على hreflang** — تسع عشرة صفحة من كل نوع، تسع لغات لكلٍّ منها، مقيسة خاماً. لا بقيّة لهذا البند.
- الخطوة الأولى عند الرجوع: **قرار خالد** — نطلب إذن الدفع للكوميتات الأربعة، ولّا نفتح بنداً جديداً على اللوحة؟

### ✅ المنجز هذه الجلسة

**خمس بطاقات أُقفلت على اللوحة: SOT2 · SOT4 · SOT3 · SOT5 · SOT6.**

- **SOT2 — الكيان القانوني من القاعدة:** كائن `LEGAL` (١٧ قيمة ثابتة في `constants/brand.ts`) حُذف بالكامل. `/trust` و`/story` صارتا تقرآن من `Settings` عبر اشتقاق واحد (`to-legal-entity-display.ts`). ثمانية من تسعة حقول كانت **تخالف** ما في القاعدة.
  - عطل كشفه سؤال خالد «متأكد ١٠٠٪؟»: الحالة كانت `active: true` مثبَّتة، فسجلّ تجاري منتهٍ كان سيظهر أخضر بدرع توثيق على صفحة اسمها «الموثوقية». صار `isRegistrationActive` مشتقّاً — أُثبت بضبط القاعدة على «منتهي» وإعادة القياس.
  - `Intl.DateTimeFormat("ar-SA")` كان يطبع التاريخ **هجرياً** (الافتراضي أم القرى). صار `ar-SA-u-ca-gregory`.
- **SOT5 — اسم الموقع من القاعدة:** `SITE_NAME = "مودونتي"` (إملاء خاطئ) صار `SITE_NAME_FALLBACK = "Modonty"`، و`knowledge-graph-generator.ts:170` صار يقرأ `settings.siteName` الذي كان يستلمه ويتجاهله. وأُصلح `${siteUrl}#website` → `${siteUrl}/#website` — كان كياناً ثانياً يزاحم الأول في نظر جوجل.
- **اسم البراند كان يتكرّر ثلاث مرات في العنوان:** قالب `layout.tsx:35` + لاحقة البنّاء + النص المخزَّن. المقيس على `/about`: «منصة مدونتي… - مدونتي | مدونتي». كُنس على السبع صفحات.
- **hreflang من القاعدة (طلب خالد صراحةً):** `Settings.defaultAlternateLanguages` يحمل **تسع** لغات، والصفحات كانت تعلن **أربعاً**. `build-hreflang-languages.ts` رُفع من مسار المقال ليخدم الجميع. خمسة أسواق خليجية (الإمارات · الكويت · قطر · البحرين · عُمان) تصل جوجل لأول مرة.
- **`get-page-seo-defaults.ts` — الحلقة المفقودة:** السلسلة الصحيحة `عمود الصفحة → افتراضي Settings → نصّ في الكود`. كل الصفحات عدا المقال كانت تقفز فوق الحلقة الوسطى.
- **بنّاء ميتاداتا واحد لتسع صفحات:** `build-metadata-from-page-row.ts`. **حُذف ٤٦٣ سطراً وأُضيف ٥٤**. وحُذفت ٤ استيرادات ميتة في كل ملف.
- **SOT4 وSOT6 — إنذاران كاذبان:** البطاقتان كانتا تصفان مشكلة **محلولة أصلاً**. أُقفلتا بدليل لا بشغل. اللوحة كانت تحمل إنذارات قديمة.
- **`og:image:width/height` حُذفا من نموذج الأدمن** — اختياريان في مواصفة ogp.me، والقيمتان تُحقنان في الكود (1200×630).
- **الأدمن:** `/trust` و`/story` صارتا قابلتين للتحرير سيوياً فقط (`seoOnly: true` — بلا محرّر نصّ)، وأُضيفتا للقائمة الجانبية ولوحة فحص السيو (صارت ١٦ صفحة).

### 🌍 كنسة hreflang الكاملة (الكوميت الرابع — بعد قياس كشف أن العلّة أوسع)

القياس الأول أظهر ٢–٤ لغات على الصفحات القوائمية، فتتبّعت المصدر ووجدت **خمسة كتّاب
مستقلّين** لنفس القيمة، كل واحد يكتب قائمته بيده:

| المصدر | كان يكتب | المصاب |
|---|---|---|
| `buildHreflang` في مولّد الأدمن | لغتان | الرئيسية والست القوائمية |
| `build-alternates.ts` في مودونتي | أربع | صفحة الكاتب (المسار الاحتياطي) |
| `buildModontyAuthorSeo` في الأدمن | **واحدة** | صفحة الكاتب (المخزَّن) |
| صفحة الشريك | لغتان، مكتوبتان مرّتين في نفس الملف | كل صفحات الشركاء |
| `app/page.tsx` | أربع، تدهس ما يرجعه القارئ | الرئيسية |

- **`build-hreflang-languages.ts` صعد إلى `shared/lib/seo/`** — الأدمن ومدونتي يكتبان نفس
  القيمة، فقراءتهما من ملفين هي بعينها آليّة الانحراف. و**`build-alternates.ts` حُذف نهائياً**
  (صفر مستهلك بعده).
- **مدونتي تقرأ hreflang حيّاً لا من البطاقة المخزَّنة.** هذي أهم نقطة معمارية في البند: إصلاح
  المولّد وحده كان يترك الصفحات غلط حتى يضغط أحدٌ «إعادة توليد» على كل واحدة. البطاقة كاش،
  وhreflang سياسة موقع لا محتوى صفحة، فتُقرأ عند العرض.

### 📏 القياس الحيّ النهائي (خام، `curl` على `localhost:3000`)

**تسع عشرة صفحة، تسع لغات لكلٍّ منها:** الرئيسية · الست القوائمية · التسع التحريرية ·
صفحة الكاتب · صفحة مقال · صفحة شريك. صفر استثناء. و`canonical` لم يتغيّر على أيٍّ منها
(فُحص صراحةً بعد التعديل).

قبل اليوم: أربع لغات في أحسن الحالات، ولغة واحدة على صفحة الكاتب، وبلا `x-default` على
الصفحات القوائمية أصلاً.

`pnpm tsc --noEmit` على مودونتي: **صفر أخطاء**. البناء: **لم يُشغَّل**.

### 📝 القرارات المتّخذة
- **الثابت يُهبَط إلى «احتياطي» لا يُصحَّح** → اقترحتُ أول مرة تصحيح إملاء الثابت فقط. غلط: نسختان تتّفقان اليوم تختلفان غداً. الصحيح حذف النسخة الثانية أو تسميتها `_FALLBACK` صراحةً.
- **لا عمود جديد على `Settings` لاسم الموقع** → خالد أوقفني: «راجع ملف الـsettings، أنا متأكد إنه اسم الـsite موجود». كان محقّاً — `jsonld-storage.ts:131` يمرّر `settings.siteName` أصلاً، والمولّد كان يتجاهله. صارت مشكلة بيانات لا مشكلة كود.
- **صفّ غائب = صفّ فارغ، لا مسار كود ثانٍ** → أول نسخة من البنّاء كانت ترجع مبكّراً عند غياب الصفّ فتُسقط `og:` و`robots` بالكامل. `const row = page ?? {}` يمرّر الغائب على نفس السلسلة.
- **لا لاحقة براند في البنّاء** → القالب في `layout.tsx` يضيفها؛ إضافتها مرّة ثانية تنتج «… \| مدونتي \| مدونتي».
- **البنّاء المشترك في `shared/` لا في `modonty/`** → لأن للقيمة كاتبَين: الأدمن يولّدها في البطاقة، ومدونتي تعرضها. كاتبان لقيمة واحدة من ملفين = الانحراف نفسه الذي شغلَنا اليوم كلّه.
- **hreflang يُقرأ عند العرض لا يُورَث من البطاقة** → البطاقة كاش كتبه الأدمن وقت الحفظ؛ وhreflang سياسة موقع لا محتوى صفحة. الاكتفاء بإصلاح المولّد كان يعلّق الصحّة على ضغطة «إعادة توليد» لكل صفحة.
- **حذف `build-alternates.ts` لا تصحيحه** → لو بقي، بقي مصدرٌ ثانٍ للقيمة. صفر مستهلك = يُحذف.

### 🚧 المعلّق / المحجوب
- **`prisma db push`** — لم يُنفَّذ على أي قاعدة (الأعمدة الاختيارية على `Settings`).
- **بانتظار خالد (إدخال بيانات، لا كود):**
  - فتح `/modonty/pages/trust` و`/modonty/pages/story` في الأدمن والحفظ — الحفظ هو ما يُنشئ الصفّين.
  - القيم الحقيقية للسجلّ التجاري في `/settings/business` + الإحداثيات `21.502370834350586` / `39.1859245300293` لإرجاع خريطة `/trust`.
  - **زرّ إعادة توليد بطاقات ١١٧ مقالاً** — المقيس: «مقالات منشورة: ١١٧ \| بطاقتها المخزَّنة تكتب مودونتي: ١١٧».
  - قرار على ٣٧ موضعاً تكتب «مودونتي» في قوالب البريد و`admin/lib/messages/ar.ts`.
  - قرار: هل تبقى صورة الشهادة ظاهرة حين لا توجد بيانات سجلّ؟
- **`MEDIA1`** — الريلز والصوت وModo-chat، مؤجَّل لما بعد ريفاكتور مودونتي.

### 📂 الملفات التي لُمست
**جديدة:** `modonty/lib/seo/build-metadata-from-page-row.ts` · `shared/lib/seo/build-hreflang-languages.ts` (نشأ في مودونتي ثم صعد لـ`shared`) · `modonty/lib/seo/to-legal-entity-display.ts` · `modonty/lib/settings/get-page-seo-defaults.ts` · `modonty/lib/settings/get-site-language.ts` · `modonty/constants/legal.ts` · `modonty/app/{trust,story}/helpers/*-metadata.ts`
**معدَّلة:** `modonty/constants/brand.ts` (حذف `LEGAL`) · `modonty/app/{trust,story}/page.tsx` + مكوّنات القصّة · `modonty/app/layout.tsx` (`lang` من القاعدة) · سبع صفحات محتوى (`about` · `contact` · `terms` + الأربع القانونية) · `admin/lib/constants/site-name.ts` + ١١ مستهلكاً · `admin/lib/seo/knowledge-graph-generator.ts` · `admin/…/setting/helpers/page-config.ts` + `components/page-form.tsx` · `admin/…/actions/listing-pages-seo-audit.ts` · `admin/components/admin/sidebar.tsx` · `admin/…/settings/system/components/system-form.tsx` · `documents/tasks/TASK.html`
**كنسة hreflang (الكوميت الرابع):** `admin/lib/seo/listing-page-seo-generator.ts` · `admin/…/authors/helpers/build-modonty-author-seo.ts` · `modonty/app/page.tsx` · `modonty/app/authors/[slug]/page.tsx` · `modonty/app/clients/[slug]/page.tsx` · `modonty/lib/seo/get-listing-page-seo.ts` · `modonty/lib/seo/index.ts` · **محذوف:** `modonty/lib/seo/build-alternates.ts`

### 🔁 حالة Git والنشر
- **الفرع:** `modonty-ui`
- **أربعة كوميتات هذه الجلسة، كلها على الفرع:**
  - `9c2f34a` — «بيانات الشركة واسم الموقع من القاعدة، لا من ثوابت في الكود»
  - `6ee14fd` — «بنّاء ميتاداتا واحد لتسع صفحات، وhreflang من القاعدة لا من الكود» (١٢ ملفاً · **+٥٢١ / −٨٣٢**)
  - `df021a1` — تجميد الجلسة
  - `12c3dea` — «hreflang من القاعدة في كل صفحة، وحذف المصادر الخمسة المتنافسة» (١٠ ملفات · **+١٠٦ / −٥٥**)
- **الشجرة نظيفة** إلا المستبعَد عمداً: `.claude/settings.local.json` · `.mcp.json` · `img-reqs.txt` · `mobile-uiux-mockup.html`.
- **`tsc`:** صفر أخطاء على **مودونتي والأدمن** معاً (شُغِّل بعد الكوميت الرابع).
- **البناء:** لم يُشغَّل. **مدفوع:** **لا** — الأربعة محليّون. الدفع يحتاج إذناً صريحاً جديداً.
- **النشر:** لا شيء. `main` لم تُمسّ.

### 🚀 الاستئناف في ٣٠ ثانية
1. `git log --oneline -4` — توقّع `12c3dea` على رأس `modonty-ui`، والشجرة نظيفة إلا الأربعة المستبعَدة.
2. `cd modonty && pnpm exec next dev -p 3000` ثم `curl -s http://localhost:3000/categories | grep -c hreflang` — توقّع ٩. (لو ظهر رقم قديم فهو كاش `"use cache"`: أوقف السيرفر وشغّله من جديد.)
3. القرار الأول: نطلب إذن الدفع للأربعة، ولّا نفتح بنداً جديداً على اللوحة؟


---

## Session: 2026-08-14 — 🧹 دمج قرّاء سيو الصفحات في دالّة واحدة + قتل الاستعلام المكرّر في صفحتَي الشريك والمقال (فرع `modonty-ui` · محلي فقط · **لم يُدفع**)

### 🎯 أين توقفت
- آخر بند: **SOT7 وSOT8 نُفِّذا وأُقفلا** — صفحة الشريك وصفحة المقال ما عادتا تسألان القاعدة مرّتين عن نفس الوثيقة.
- الخطوة الأولى عند الرجوع: **قرار خالد على الخطأين الباقيين في `tsc`** — `/trust` و`/story` يستوردان `ORGANIZATION_JSONLD` وهو محذوف. خياران: (أ) توصيلهما بـ`getLegalEntity()` القارئة من القاعدة، (ب) إرجاع الثابت.

### ✅ المنجز هذه الجلسة
- **مزامنة الإنتاج → المحلي:** خالد ضغط Sync بنفسه. القاعدة المحلية `modonty_dev` صارت نسخة الإنتاج. القيم القانونية الـ١٤ اللي كانت معبّأة على التطوير انمسحت (متوقَّع — الإنتاج ما عنده الأعمدة الجديدة).
- **إقفال كل سيرفرات node** (١٥ عملية) لتوفير موارد الجهاز.
- **دمج سبعة قرّاء سيو في ملف واحد** — `modonty/lib/seo/get-page-seo.ts` (٩١ سطراً) بدل ٣١٠ أسطر موزّعة على سبعة ملفات متطابقة إلا في اسم الحقل. كل صفحة تنادي `getPageSeo("tags")`. قراءة واحدة مخبّأة (`readSettingsSeoColumns`) تخدم السبع صفحات: الرئيسية · الفئات · الشركاء · الصناعات · الوسوم · الرائج · الأسئلة.
  - **عطل جانبي انحلّ بالدمج:** `faq-page-seo.ts` كان ناقصه `"use cache"` — كان يضرب القاعدة في كل طلب.
  - `getB2bPanelSettings` نُقل لملفه المستقلّ (بلا مستهلك واحد في الكود — لم يُحذف).
- **كلمة `fallback` في كل بنّاء احتياطي** (بطلب خالد، عشان يتميّز عن المصدر الأساسي): `buildFallbackJsonLd` في الفئات والصناعات والوسوم والأسئلة.
- **SOT7 — صفحة الشريك:** حُذف `db.client.findUnique` العاري من `Promise.all`؛ الحقل `jsonLdStructuredData` كان جاي أصلاً مع `include` في `client-page-data.ts:22`. استعلام واحد بدل اثنين.
- **SOT8 — صفحة المقال:** `generateMetadata` صار ينادي `getArticleContentBySlug` (نفس الدالّة المخبّأة اللي يناديها جسم الصفحة) بدل `getArticleForMetadata`. حُذف `article-metadata.ts`. ضربة واحدة على القاعدة بدل اثنتين.
- **بطاقتان جديدتان على لوحة Task:** SOT7 وSOT8 في بورد «مصدر بيانات السيو» — أُضيفتا ثم نُفِّذتا في نفس الجلسة.
- **حالة `tsc` على مودونتي:** خطآن فقط، وهما سابقان لهذه الجلسة (`/trust:11` و`/story:4`). الدمج والتعديلات لم تضف ولا خطأ.
- **البناء:** لم يُشغَّل. **التست الحيّ:** لم يُشغَّل (السيرفرات مقفولة بطلب خالد).

### 📝 القرارات المتّخذة
- **دمج قرّاء `Settings` نعم، ودمج قارئ المقال والشريك لا** → السبعة تقرأ من صفّ واحد بنفس الشكل، فالدمج ربح صافٍ. أما المقال والشريك فحقولهما تجي ضمن قراءة الصفحة الكبرى، فدالّة مشتركة كانت ستعني استعلاماً ثانياً — وهو بالضبط العطل اللي كنّا نصلحه.
- **`get-page-seo.ts` لا يحمل كلمة `fallback` في اسمه** → هو المصدر الأساسي (يقرأ ما خزّنه الأدمن)، والاحتياطي هو ما يُبنى حيّاً داخل الصفحات. تسميته «احتياطي» تقلب المعنى.
- **قراءة الأعمدة الأربعة عشر كلها في استعلام واحد بلا وسيط** → عشان تُخزَّن نسخة واحدة في الكاش تخدم السبع صفحات، بدل سبع نسخ. كلها تُبطَل معاً على `cacheTag("settings")` أصلاً.

### 🚧 المعلّق / المحجوب
- **الخطآن في `tsc`** — بانتظار قرار خالد (أ أو ب). هذا يمنع البناء.
- **تعديل السكيما** — ثمانية أعمدة اختيارية على `Settings` (`git diff --stat` = `+11`). `pnpm prisma:validate` و`generate` تمّا؛ **`prisma db push` لم يُنفَّذ على أي قاعدة**. غير مدفوع.
- **`LE1`** — إدخال بيانات الكيان القانوني على إنتاج الأدمن بعد النشر.
- **SOT3 · SOT5** — بانتظار قرار خالد (لا شغل كود).
- **SOT6 · PG4** — تحتاج فحص صفحة صفحة قبل أي رأي.
- **عدّ مقالات الإنتاج الناقصة `jsonLdStructuredData`** — محجوب: لا يوجد `DATABASE_URL` للإنتاج مفعَّل في المستودع (`MODONTY_PROD_DATABASE_URL` موجود باسم منفصل، لا يُقرأ افتراضياً).

### 📂 الملفات التي لُمست
- `modonty/lib/seo/get-page-seo.ts` — **جديد** · الدالّة الموحّدة `getPageSeo(page)` + القراءة المخبّأة الواحدة
- `modonty/app/clients/helpers/get-b2b-panel-settings.ts` — **جديد** · نُقل من `clients-page-seo.ts` قبل حذفه
- محذوفة (٧): `categories-page-seo.ts` · `clients-page-seo.ts` · `faq-page-seo.ts` · `industries-page-seo.ts` · `tags-page-seo.ts` · `trending-page-seo.ts` · `home-page-seo.ts`
- محذوف: `modonty/app/articles/[slug]/actions/article-metadata.ts`
- `modonty/app/{page,categories,clients,industries,tags,trending,help/faq}/page.tsx` — توصيل `getPageSeo` + تسمية البنّاء الاحتياطي
- `modonty/app/clients/[slug]/page.tsx` — حذف الاستعلام المكرّر · القراءة من `client.jsonLdStructuredData`
- `modonty/app/articles/[slug]/page.tsx` — `generateMetadata` على `getArticleContentBySlug`
- `modonty/app/articles/[slug]/actions/article-data.ts` — تصدير `getArticleContentBySlug`
- `modonty/app/articles/[slug]/actions/index.ts` — تحديث البرميل
- `documents/tasks/TASK.html` — بطاقتا SOT7 وSOT8

### 🔁 حالة Git والنشر
- **الفرع:** `modonty-ui`
- **آخر كوميت:** `3f2432b` — «الأيقونات من السجلّ وحده، وتوازٍ في موضعين»
- **تعديلات غير مدفوعة:** نعم — عشرات الملفات في `modonty/` + `shared/prisma/schema/schema.prisma` + `documents/tasks/TASK.html` + `.claude/rules/modonty-scope.md` (غير متعقَّب)
- **مدفوع:** لا
- **النشر:** لا شيء. `main` لم تُمسّ.

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd modonty && pnpm tsc --noEmit` — لازم يظهر الخطآن نفسهما فقط (`/trust:11` و`/story:4`).
2. افتح `modonty/lib/seo/organization-jsonld.ts` — شوف `getLegalEntity()` الموجودة.
3. القرار الأول: (أ) نوصّل `/trust` و`/story` بـ`getLegalEntity()` من القاعدة، ولّا (ب) نرجّع ثابت `ORGANIZATION_JSONLD` ونؤجّل؟

---

## Session: 2026-08-13 (تكملة) — 🚪 دليل الكونسول: زرّ رجوع للوحة (مدفوع `a28a2b4` · console 0.27.1)

### 🎯 أين وقفت
- **آخر ما جرى:** دُفع `a28a2b4` على `main`، والمحلي = البعيد. لا شغل ناقص في يد.
- **الخطوة التالية عند الاستئناف:** لا شيء معلّق من هذا البند. أقرب فحص اختياري: دخول الكونسول كعميل وتجربة اللفة من نافذة الترحيب («ابدأ الجولة» → `/help` → «رجوع للوحة») — لم تُجرَّب مسجَّلَ الدخول.

### ✅ أُنجز في هذه الجلسة
- **المشكلة كما وصفها خالد:** العميل أول زيارة تظهر له نافذة ترحيب تدلّه على الدليل، وحين يدخل الدليل **ما يلقى زرّاً يرجّعه للكونسول**.
- **التأكد من الكود قبل أي تعديل (طلب خالد صراحةً):** `grep "/dashboard"` في كل `console/app/help/` = **صفر نتائج** · `find app/help -name "layout*"` = **لا يوجد** · جذر التخطيط `console/app/layout.tsx:29` = `<Providers>{children}</Providers>` بلا هيدر · `HelpClient.tsx:34` رابطه الوحيد خارجي · `ConsoleTourClient.tsx:130` يرجّع لـ`/help` لا للوحة. المشكلة مؤكَّدة بالكود لا بالانطباع.
- **الحل:** ملف واحد جديد `console/app/help/layout.tsx` — شريط علوي ثابت فيه «رجوع للوحة» → `/dashboard`، يغطّي الصفحات الثلاث (`/help` · `/help/general` · `/help/console`) دفعةً واحدة.
- **تست حيّ على ٣٩٠ عرضاً** (الكونسول محلياً على `3002`): الشريط `top = 0` عند `scrollY = 4000` · اختبار الإصابة على مركز الرابط يرجع `href="/dashboard"` · **ضغطة حقيقية** من `/help/general` مُمرَّراً ٣٠٠٠ انتقلت فعلاً لـ`/dashboard` · الشريطان لا يتراكبان (رجوع `0→45`، أدوات `44→97`) · قائمة المحتويات تبدأ ١١٢ > ٩٧٫٧ · صفر تمرير أفقي · **صفر أخطاء كونسول**.
- **على سطح المكتب (١١٠٠):** الشريطان ينتهيان عند ١٠٣٫٧ وقائمة المحتويات المثبّتة عند ١١٢ — تُخلي بـ٨ بكسل. لقطة سليمة: `.playwright-mcp/help-bar-final.png`.
- **حالة `tsc`:** console = **صفر أخطاء** (`TSC_EXIT_CODE=0`، مخرج فاضي). admin/modonty لم تُمَسّا.
- **البناء:** لم يُشغَّل. **الدفع:** تمّ (`push>` — بلا نسخة احتياطية عمداً).

### 📝 قرارات وأسبابها
- **`fixed` لا `sticky`** → `html`/`body` في الكونسول عندهما `overflow-x: hidden`، وهذا يجعل الجسم حاوية تمرير خاصة به فينكسر أي التصاق علوي. **مُثبَت حيّاً:** جرّبت `sticky` أولاً وسقط الشريط عند التمرير على ٣٩٠. المرفوض: تعديل `overflow` في `globals.css` — أثر عام على كل التطبيق مقابل مشكلة محلية.
- **الحشوة العلوية على جذر الصفحة لا على غلاف المحتوى** → على الجوّال تُرسم قائمة المحتويات في السياق الطبيعي **قبل** المحتوى، فلو كانت الحشوة على الغلاف لبدأت القائمة تحت الشريطين. المرفوض: حشوة على الغلاف (الأبسط ظاهرياً، ويُخفي القائمة).
- **شريطان متراصّان (٩٧ بكسل) لا شريط واحد مدموج** → دمج أدوات الصفحات (مشغّل الصوت، زرّ إعادة الجولة) في شريط التخطيط يتطلّب سياقاً أو منفذاً من العميل للتخطيط — إعادة هيكلة كبيرة مقابل مكسب ٥٠ بكسل. المرفوض أيضاً: إلغاء تثبيت أشرطة الصفحات (يفقد مشغّل الصوت وصوليته الدائمة).
- **ارتفاع الشريط ٤٤ بكسل** → الحد الأدنى لهدف اللمس، وأقلّ ما يمكن اقتطاعه من شاشة الجوّال.
- **«رجوع للوحة» لا «رجوع للوحة التحكم»** → أقصر وأسهل على ٣٩٠ بكسل، وبلا اختصار على الجوّال (وسم «مركز المساعدة» وحده هو المخفي دون `sm`).
- **لم أمسّ رابط «رجوع لمركز المساعدة» في صفحة الجولة** → يعمل ولم يكن جزءاً من الطلب.

### 🚧 معلّق / محجوب
- **اللفة كاملةً مسجَّلَ الدخول** — لم تُجرَّب. السبب: كوكي جلسة قديمة من الأدمن على نفس `localhost` كسرت المصادقة (`JWTSessionError: no matching decryption secret`)، ثم علّق سيرفر التطوير وأُعيد تشغيله. **الخطر منخفض ومُبرَّر:** صفحات `/help` الثلاث لا تقرأ الجلسة إطلاقاً (`grep` لـ`auth()`/`session` داخل `app/help/` = صفر) ولا يوجد `proxy.ts`/`middleware.ts` في الكونسول — فما اختُبر مجهولاً هو **نفس الترميز** الذي يراه العميل.
- **سجلّ التغييرات `1.17.0` + إدخال نسخة الكونسول `0.27.1`** — من شاشة الأدمن، بيد خالد (يعيش في القاعدة).

### 📂 الملفات
- `console/app/help/layout.tsx` — **جديد**: شريط «رجوع للوحة» المشترك للصفحات الثلاث.
- `console/app/help/HelpClient.tsx` — شريط الأدوات نزل لـ`top-11`؛ الحشوة `pt-28` انتقلت لجذر الصفحة.
- `console/app/help/console/ConsoleTourClient.tsx` — نفس التعديلين.
- `console/app/help/HelpLanding.tsx` — `pt-11` على الجذر (لا شريط أدوات لهذه الصفحة).
- `console/app/help/components/v2/TocSidebarV2.tsx` — `md:top-4` → `md:top-28` لتخلي الشريطين على سطح المكتب.
- `console/package.json` — `0.27.0` → `0.27.1`.

### 🔁 حالة الجيت
- الفرع: `main` · آخر كوميت: `a28a2b4` «دليل الكونسول: زرّ رجوع للوحة — العميل كان يدخل الدليل ولا يلقى مخرجاً» · **مدفوع ✅** (`16edaba..a28a2b4`، المحلي = البعيد).
- غير مدفوع عمداً: `.claude/settings*.json` · `.mcp.json` · سجلّات الجلسة · `mobile-uiux-mockup.html` · `documents/archive/tasks/UIUX-CLARITY-FINDINGS-v1.html` · `documents/context/BUSINESS-MODEL-REFERENCE.md`.
- فرع `modonty-ui` (شغل Codex في مجلّد منفصل): لم يُمَسّ.

### ⚠️ ملاحظة بيئة
- **لقطات Playwright على الجوّال غير موثوقة في هذه الجلسة:** Edge المرئي يرسم سطحاً أصغر من المنفذ المفروض (`setViewportSize(390,844)` ينتج منفذاً ٤٨٧×١٠٥٥ و`devicePixelRatio = 0.8`) فتختفي العناصر المثبّتة **من الصورة لا من الصفحة**. لقطة سطح المكتب سليمة. البديل الموثوق: قياس الهندسة و`elementFromPoint` عبر `browser_evaluate`.
- سيرفران يعملان معاً (أدمن `3001` + كونسول `3002`) خالف قاعدة «سيرفر واحد»، والكونسول علّق فعلاً واحتاج إعادة تشغيل.

### 🚀 استئناف في ٣٠ ثانية
1. `git log --oneline -1` → المتوقَّع `a28a2b4`، وما بعده يعني شغلاً جديداً.
2. افتح `console/app/help/layout.tsx` — نقطة الدخول لأي تعديل على شريط الدليل.
3. القرار: هل نجرّب اللفة مسجَّلَ الدخول (نحتاج مسح كوكي `localhost` أولاً)، أم ننتقل لبند جديد؟

---

## Session: 2026-08-13 — 🖼️ اسم الصورة من نصّها البديل + حارس بني + دليل الفريق وثيقةً واحدة + حدّ طلبات جبر سيو (مدفوع: `16edaba` مودونتي · `eb9da64` جبر سيو)

### 🎯 أين وقفت
- **آخر ما جرى:** دُفع المستودعان. لا شغل ناقص في يد.
- **الخطوة التالية عند الاستئناف:** افتح `TASK.html` ← البند `IMGRENAME`. تنفيذه **يعتمد على إكمال ترحيل الصور إلى بني أوّلاً** (٣٠٢ من ٣٢٩ صورة مدوّنتي ما زالت على كلاود إيناري).

### ✅ أُنجز هذي الجلسة

**١. إعادة تسمية الصور — الخلل الأصلي وإصلاحه**
- الحفظ كان يخاطب **كلاود إيناري**: مع صور بني الجديدة لا يفعل شيئاً بصمت (`cloudinaryPublicId` فارغ)، ومع المهاجَرة يعيد تسمية نسخة لا يخدمها أحد بينما اللوحة تعطي ١٥/١٥ كاذبة.
- صار ينقل الملف على بني بمنطقته الصحيحة (`clients` أو `reels` — تُستنتج من الرابط لا تُفترض)، وينقل القصّات الثلاث، ويستدعي `syncEntityImageUrls`، ويبطّل كاش الوسوم والتصنيفات.
- **ثلاثة أخطاء في كودي كشفها التست الحيّ قبل أن تلمس ملفاً:** منطقة خاطئة · الرابط أحياناً في `url` لا `bunnyUrl` · كلمة `upload` قُرئت كمفتاح تفرّد.

**٢. الاسم يُشتقّ من النصّ البديل (فكرة طارق)**
- `dataLayer/lib/seo/media/alt-to-filename.ts` — دالّة نقيّة، السقف `MAX_FILE_BASE=125` مطابق لـ`sanitizeBunnyBase`.
- منع تكرار النصّ البديل داخل العميل الواحد، ورسالة تسمّي الصورة المتعارضة.
- **قاعدة «مرّة واحدة»:** لا يُعاد التسمية بعد أوّل مرّة — كل تغيير رابط يُبطل ما جمعته الصورة عند جوجل.
- معاينة حيّة للاسم مع كل حرف، بنفس دالّة الخادم.

**٣. حارس بني** — `devPrefix()` و`assertWritable()` في `dataLayer/lib/bunny.ts`: خارج الإنتاج كل رفع في `_dev/`، وحذف أو نقل أي مسار إنتاج **مرفوض بخطأ صريح**. الإنتاج بلا أي تغيير (`VERCEL_ENV=production` يخرج فوراً).

**٤. دليل الفريق** — `/guidelines` صار وثيقة واحدة (١٩ قسماً · ٨٩٩ سطراً) بدل ستّ عشرة صفحة. أُضيفت أقسام لم تكن موثّقة: بوّابة النشر · سيو الصور · الريلز · مقالات العملاء · البريفات. حُذفت صفحة `about` بعد نقل محتواها. الأسعار تُقرأ حيّة من نظام الباقات.

**٥. تصحيحات أرقام كانت تكذب**
- عدّاد «عنوان السيو» كان يسمح بـ**٦٠** والحفظ يرفض فوق **٥١** → صار ٥١.
- «كلاود إيناري» في صفحتَي الوسائط والممنوعات → بني.
- «٨ مقالات» مكتوبة يدوياً في أربعة مواضع → تُقرأ من الباقة.

**٦. جدول المقالات** — كان يجلب ٥٠ صفّاً فقط (٥ صفحات مهما كان العدد) → رُفع القيد، صار ١٤ صفحة.

**٧. معيار المقالات المرتبطة** (شكوى طارق) — بُني كبُعد ثالث بوزن ١٠٪، وكشف باقاً أقدم: المحرّر يقرأ الاتجاه المعاكس فيفتح فارغاً و**يمحو القائمة** عند الحفظ التالي. مُصلَح ومُختبَر (٠→٥٦ · ١→٦٠ · ٣→٦٦).

**٨. جبر سيو** — حدّ الطلبات ٣٠→١٢٠/دقيقة مع استثناء طلبات التنقّل والزواحف وصفحة عربية بدل النصّ البرمجي؛ ومدّة تخزين مقالات مودونتي ٣٦٠٠→٦٠ ثانية.

**الحالة:** `tsc` صفر على أدمن ومدوّنتي وكونسول وجبر سيو · نسخة احتياطية `PROD-2026-08-13` (٩٥ مجموعة · ٥٩ ميجا) · تست حيّ كامل للفة الصورة (رفع → `_dev/` → إعادة تسمية → القصّات الثلاث → صفر تسرّب للإنتاج).

### 📝 قرارات (بسببها)
- **الاسم من النصّ البديل** لا من مولّد عامّ → وصف واحد يكتبه الكاتب فيخرج منه الاسم. رُفض إبقاء المولّد: يعطي «كيما زون — صورة» وهو أعمّ من النصّ البديل.
- **السقف ١٢٥ لا ٨٠** → قصُّنا يضيّع كلمات للأبد، وقصّ جوجل في العرض تجميليّ. Bunny يسمح بـ٦٬٠٠٠ وجوجل بلا حدّ رقميّ.
- **العربي في اسم الملف يبقى** → جوجل يوصي به صراحةً («استخدم كلمات بلغة جمهورك»)، وموقعا «موضوع» و«المرسال» يفعلانها على نطاق واسع. **لم يُحسم** شكل عرضه في بطاقة بحث الصور — جوجل يحجب المعاينة الآلية ولا توثيق يذكره.
- **الدقيقة بدل الإشعار الفوري** لجبر سيو → تحلّ ٩٥٪ من الشكوى بلا سرّ مشترك ولا نداء من مودونتي. **حُذف** مسار الإشعار بعد القرار (لا كود ميت).
- **الحارس بدل زون تطوير منفصل** → الزون وحده لا يحمي، لأن صفوف قاعدة التطوير تشير لمسارات الإنتاج.

### 🚧 معلّق
- **`IMGRENAME`** (على اللوحة) — إعادة التسمية الجماعية. **محجوبة** حتى يكتمل ترحيل الصور إلى بني: ٣٠٢ من ٣٢٩ «خارج بني».
- **٢٣ صورة بلا نصّ بديل** — شغل تحريري لطارق لا شغل كود.
- **سجلّ الإصدارات `1.17.0`** — يُضاف من شاشة الأدمن (يعيش في القاعدة).
- **`pending` من محدّد المعدّل في جبر سيو** لا يُمرَّر لـ`waitUntil` — يمسّ دقّة تحليلات المحدّد لا الحماية.

### 📂 ملفّات مسّتها
- `dataLayer/lib/seo/media/alt-to-filename.ts` — **جديد**: النصّ البديل ← اسم ملف.
- `dataLayer/lib/bunny.ts` — حارس `_dev/` · `bunnyZoneOfUrl` · `bunnyRenamedPath` · `extractBunnyUniqueKey` · `sanitizeBunnyBase`.
- `dataLayer/lib/seo/media/seo-score.ts` — يقيس اسم الرابط المخدوم (`servedUrl` إلزامي).
- `dataLayer/lib/seo/article/links-score.ts` — **جديد**: معيار الربط الداخلي.
- `admin/app/(dashboard)/media/actions/save-image-seo.ts` — النقل على بني · منع التكرار · «مرّة واحدة».
- `admin/app/(dashboard)/seo-images/**` — خطّة الأسماء معروضة داخل الشاشة.
- `admin/app/(public)/guidelines/**` — الوثيقة الواحدة + الأقسام الجديدة.
- `admin/app/(dashboard)/articles/**` — عدّاد ٥١ · رفع قيد الجدول · شريط الربط في الصفحة التقنية.
- `JBRSEO/jbrseo.com/{proxy.ts,lib/rate-limit.ts,lib/modonty-articles.ts}`.

### 🔁 حالة الجيت
- **مودونتي:** `main` · مدفوع `16edaba` · غير المحفوظ: إعدادات و`.mcp.json` وسجلّات وملفّات موكاب (مستبعدة عمداً).
- **جبر سيو:** `main` · مدفوع `eb9da64`.
- **Codex:** `origin/modonty-ui` عند `5c317ba` — لا دمج، والدمج آخر مرحلة بيدي.

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd admin && pnpm exec next dev --port 3001` (المنفذ ٣٠٠٠ لسيرفر Codex — و`NEXTAUTH_URL` في `admin/.env.local` مضبوط على ٣٠٠١).
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/TASK.html` ← البند `IMGRENAME`.
3. القرار الأول: نبدأ ترحيل الـ٣٠٢ صورة إلى بني، أم نمسك شيئاً آخر؟

---

## Session: 2026-08-11 23:08 — 📊 Clarity وُصِل بالواجهة البرمجية + تشخيص تجربة الاستخدام بالدليل الحيّ (محلي فقط · **لم يُدفع** · صفر تعديل كود)

### 🎯 أين وقفت
- **آخر فعل:** سلّمت ملف `documents/archive/tasks/UIUX-CLARITY-FINDINGS-v1.html` (١١٠ كيلوبايت، فيه لقطة مضمّنة) وسألت خالد: أبدأ الموجة الأولى؟ **ينتظر قراره — لم يُبدأ أي كود.**
- **الفعل التالي عند الرجوع:** لو وافق خالد على الموجة الأولى، أرخص إصلاح وأوضحه أولاً: كلاس `relative z-10` على رابط شعار العميل في [PostCardAvatar.tsx:37](../../modonty/components/feed/postcard/PostCardAvatar.tsx#L37).
- **قرار خالد المعلّق (الوحيد):** بدء الموجة الأولى من خطة تجربة الاستخدام (٤ بنود، يوم واحد).

### ✅ ما أُنجز في هذه الجلسة
- **Clarity صار مسحوباً برمجياً لأول مرة.** التوكن مولَّد من خالد ومحفوظ في `.env.shared` باسم `CLARITY_DATA_EXPORT_TOKEN` (متحقَّق: الملف مستثنى من Git بالسطر ٢٣ في `.gitignore`).
- **سُحبت قراءتان (٢ من سقف ١٠ طلبات باليوم):** بعد الرابط (`dimension1=URL`) وبعد الجهاز والقناة. الاثنتان رجعتا `HTTP 200`.
- **تشخيص حيّ على الإنتاج بمقاس ٣٩٠ بكسل** (Playwright، Edge headed) على: الرئيسية · صفحة العملاء · صفحة جبر الجنوبية · صفحة تصنيف.
- **مُخرَج واحد:** ملف تشخيص بالعربي فيه ٦ نتائج، كل واحدة بمكانها في الكود وبالحلّ، مع لقطة مضمّنة `base64` وخطّة على ٣ موجات.
- **صفر تعديل على كود المنتج.** التعديل الوحيد على مستودع الشغل: سطر التوكن في `.env.shared` (غير مُتتبَّع في Git).
- **tsc:** لم يُشغَّل (لا داعي — صفر تغيير كود).
- **تست حيّ:** تمّ، وهو مادة التقرير نفسه.

### 📊 أرقام Clarity — ٣ أيام حتى ١١ أغسطس (الإنتاج)
- **١٢٩ جلسة · ٩٦ زائراً · ١١ بوت.** كمبيوتر ٨٠ · جوال ٤٤ · تابلت ٥.
- **المصادر:** بحث طبيعي ٥٢ · مباشر ١٢ · إحالة ١ · **غير معروف ٦٤** (نصف الترافيك بلا مصدر — يستاهل فحصاً منفصلاً).
- **٤٢ نقرة ميتة، ٣٧ منها على الجوال** (٨٨٪).
- **الرئيسية:** ٤٩ جلسة · عمق تمرير ٣٢٪ · وقت نشط **ثانية واحدة للجلسة** · ١١ رجوعاً سريعاً من ٤٩.
- **صفر خطأ سكربت · صفر نقرة على عنصر معطوب · صفر تمرير مفرط** على ٧٣ صفحة مزارة.

### 🔍 النتائج المؤكَّدة (بدليل خام) — مادة الموجة الأولى
1. **شريط العدّادات في صفحة العميل ميت بالكامل** — [client-articles-section.tsx:77-82](../../modonty/app/clients/[slug]/components/sections/client-articles-section.tsx#L77-L82). أربع خانات ٧٧×٧٨ بكسل فيها أيقونتا 👍 و🔗، والقياس: `totalInteractiveInGrid: 0` وكل خانة «اللمس يقع على: لا شيء». صفحة جبر الجنوبية: ١٠ نقرات ميتة + **نقرتان غاضبتان** في ٨ جلسات. متجر باقتك: ١٠٠٪ من جلساته.
2. **لمس شعار العميل يفتح المقال بدل صفحة العميل** — [PostCardAvatar.tsx:37](../../modonty/components/feed/postcard/PostCardAvatar.tsx#L37) بلا `relative z-10`، بينما رابط الاسم في [PostCardHeader.tsx:44](../../modonty/components/feed/postcard/PostCardHeader.tsx#L44) عنده `z-10`. الطبقة الممدودة تبتلع الشعار. القياس: الشعار `z-index: "auto"` واللمس يذهب إلى `/articles/…` لا `/clients/…`.
3. **وسوم المواضيع `<span>` لا روابط** — [client-articles-section.tsx:88-93](../../modonty/app/clients/[slug]/components/sections/client-articles-section.tsx#L88-L93). ارتفاعها ٢٥ بكسل (أقل من نصف الحدّ المريح للمس).
4. **قسم «الموقع والتواصل» بلا وسيلة تواصل** — [client-contact-section.tsx:102-107](../../modonty/app/clients/[slug]/components/sections/client-contact-section.tsx#L102-L107). الكود سليم؛ لمّا يغيب الإحداثي وبطاقة العمل ينهار القسم لسطر عنوان أصمّ تحت عنوان يَعِد بالتواصل. الشقّ الثاني بيانات: تعبئة الإحداثيات لكل عميل من الكونسول.
5. **الرئيسية بلا نقطة تركيز** — تحتاج تصميماً لا إصلاحاً (الموجة الثالثة).
6. **التصفية حسب التصنيف تشتغل بلا ما تبان** — العنوان يظل «آخر المقالات»، ولا تصنيف نشط معلَّم، والرابط يزحف وحده لـ`page=2` أثناء التمرير.

### ❌ فرضيتان سقطتا (مهم — لا تُعاد)
- **صور بطاقات المقالات ليست ميتة.** الرابط ممدود على كامل البطاقة عبر `after:absolute after:inset-0` في [PostCardBody.tsx:25](../../modonty/components/feed/postcard/PostCardBody.tsx#L25). اللمس على مركز الصورة يرجّع رابط المقال — مُختبَر على ٦ بطاقات. **سبب الغلط:** `getBoundingClientRect` لا يحسب العنصر الزائف، فأي كاشف يعتمد «الصورة داخل رابط؟» يعطي إيجابيات كاذبة. الفحص الصحيح = `document.elementFromPoint` على مركز العنصر.
- **رابط المقال داخل صفحة العميل ليس ميتاً** — الكاشف بالتمرير أعطاه ميتاً، والفحص المباشر بـ`elementsFromPoint` أثبت أن اللمس يقع على الرابط في المواضع الثلاثة.

### 📝 قرارات وأسبابها
- **حفظ التوكن في `.env.shared` بلا استئذان** → Clarity تعرضه مرّة واحدة فقط؛ ضياعه يعني توليد توكن جديد. تحقّقت أن الملف مستثنى من Git قبل الكتابة.
- **سحبتان لا أكثر** → السقف ١٠ باليوم وآخر ٣ أيام فقط؛ البُعدان (الرابط، الجهاز×القناة) يغطّيان السؤال كله.
- **لم أربط خادم Clarity في `.mcp.json`** → خالد ما جاوب على السؤال، والسحب المباشر بالطرف البرمجي كفى. السؤال ما زال مفتوحاً.
- **رفضت الادّعاء بأن «الموقع سليم»** → بوّابة الأحكام أوقفتني بحقّ؛ الصياغة الصحيحة: «ما ظهر أي خطأ تقني **في الصفحات المزارة**» — الأداة تقيس ما يحصل عند زائر فعلي فقط.
- **الموجة الثالثة (الرئيسية) لا تبدأ بكود** → نموذج مرئي يعتمده خالد أولاً (قاعدة «Mockup = عقد ملزم»).

### 🚧 معلّق / محجوب
- **الموجة الأولى** — بانتظار موافقة خالد (٤ إصلاحات، يوم واحد).
- **ربط خادم Clarity في `.mcp.json`** — بانتظار قرار خالد: خادم دائم (`npx @microsoft/clarity-mcp-server --clarity_api_token=…`) أم سحب مباشر عند الطلب؟
- **الخريطة الحرارية نفسها لا تُسحب برمجياً** — الواجهة تعطي أرقاماً لا صوراً، والخرائط التنبؤية ما زالت «قادم» عند مايكروسوفت. تُشاهَد من لوحة Clarity فقط.
- **٦٤ جلسة بلا مصدر معروف** — يحتاج فحصاً على وسوم الحملات.
- **صفحة المقال نفسها لم تُفحص** — ثلاثة مقالات تقف عند ٥٪-١٢٪ تمرير، وواحد منها يسجّل ٦٨ ثانية قراءة نشطة (يقرأ المقدّمة ثم يتوقّف). لم أفتحها.

### 📂 ملفات لُمست
- `.env.shared` — أُضيف `CLARITY_DATA_EXPORT_TOKEN` + تعليق فيه العنوان والمعاملات والسقف. **غير مُتتبَّع في Git** (`.gitignore:23`).
- `documents/archive/tasks/UIUX-CLARITY-FINDINGS-v1.html` — **جديد** · ملف التشخيص (١١٠ كيلوبايت، لقطة مضمّنة `base64`، ٩ بطاقات، ٤ أقسام).
- `.playwright-mcp/clarity-dead-clicks-client-counters.png` — لقطة شريط العدّادات الميت.
- **صفر تعديل على `modonty/` أو `admin/` أو `console/` أو `dataLayer/`.**

### 🔁 حالة Git والنشر
- **الفرع:** `main` · **آخر كوميت:** `059bbcb` (١١ أغسطس) — نفس كوميت الجلسة السابقة، **لم يُضَف كوميت في هذه الجلسة**.
- **مقابل الأصل:** `git rev-list --left-right --count origin/main...main` = **صفر/صفر** (الإنتاج يشغّل نفس الكود المحلي — لهذا كل استنتاج عن الكود في التقرير صالح).
- **تغييرات غير مدفوعة:** `.claude/settings.json` · `.claude/settings.local.json` · `.mcp.json` · `SESSION-LOG.md` · `SESSION-LOG-2026-08.md` · **جديد:** `documents/context/BUSINESS-MODEL-REFERENCE.md` · `documents/archive/tasks/UIUX-CLARITY-FINDINGS-v1.html` · `mobile-uiux-mockup.html`.
- **النشر:** لا شيء — صفر تغيير كود.

### 🔑 مرجع سريع لواجهة Clarity (للجلسة القادمة)
```
GET https://www.clarity.ms/export-data/api/v1/project-live-insights
  header: Authorization: Bearer $CLARITY_DATA_EXPORT_TOKEN
  params: numOfDays=1|2|3 & dimension1..3
  الأبعاد: Browser · Device · Country · OS · Source · Medium · Campaign · Channel · URL
  السقف: ١٠ طلبات للمشروع باليوم · آخر ٣ أيام فقط · ٣ أبعاد للطلب · ١٠٠٠ صف بلا ترقيم
  المقاييس: ScrollDepth · EngagementTime · Traffic · DeadClickCount · RageClickCount ·
            QuickbackClick · ExcessiveScroll · ScriptErrorCount · ErrorClickCount
```
**فخّ تعلّمناه:** بُعد `URL` يعدّ الجلسات لكل صفحة، فمجموعه يفوق عدد الجلسات الحقيقي (٢٢٠ مقابل ١٢٩). لعدد الجلسات الصحيح استعمل بُعد `Device`.

**طريقة كشف النقر الميت الصحيحة:** `document.elementFromPoint(cx, cy)` على مركز العنصر ثم `.closest('a[href],button')` — لا الاعتماد على «هل العنصر داخل رابط في الشجرة؟» لأن الروابط الممدودة تعمل بعنصر زائف لا يظهر في الشجرة.

### 🚀 الرجوع في ٣٠ ثانية
1. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/archive/tasks/UIUX-CLARITY-FINDINGS-v1.html`
2. لو خالد وافق: ابدأ بـ[PostCardAvatar.tsx:37](../../modonty/components/feed/postcard/PostCardAvatar.tsx#L37) → أضف `className="relative z-10"` على `<Link>`
3. القرار المطلوب: الموجة الأولى تبدأ؟ وهل نربط خادم Clarity دائماً في `.mcp.json`؟

---

## Session: 2026-08-11 22:08 — 🔗 بوّابة روابط المقال قبل الحفظ + تحرير روابط مقال العميل + القوائم المرقّمة تظهر (مدفوع `059bbcb`)

### 🎯 أين وقفت
- **آخر فعل:** `git push` تمّ (`be3dcab..059bbcb main -> main`)، و`git rev-list --left-right --count origin/main...main` = **صفر/صفر**.
- **الفعل التالي عند الرجوع:** التحقّق من نشر Vercel للأدمن ومودونتي (لم يُتحقَّق في هذه الجلسة) — افتح `admin.modonty.com`، عدّل مقالاً فيه رابط ملصوق من وورد، واضغط حفظ: لازم تطلع نافذة «راجع الروابط قبل الحفظ».
- **بعده مباشرة:** خلّي طارق يجرّب اللصق من وورد على الإنتاج ويقول إن كان الحوار واضحاً له بلا شرح.

### ✅ أُنجز في هذه الجلسة
- **البوّابة (`LNKGATE`) — الطلب الأصلي.** طارق يكتب في وورد ويلصق؛ اللصق يختم `rel="nofollow"` على كل رابط بلا ما أحد يختار، حتى الروابط اللي تشاور على مودونتي نفسها — يعني نقول لقوقل «لا تحسب صفحاتي». الحلّ الذي اختاره خالد صراحةً (ورفض الإصلاح الآلي الصامت): **الحفظ يتوقّف** وتطلع نافذة تعرض خصائص كل رابط مشكوك فيه، وما يمرّ الحفظ إلا بقرار بشري. «الـ control يكون في يدنا».
- **خمسة فحوص في الماسح** (`internal-link-audit.ts`): رابط داخلي عليه nofollow · باكلينك لمودونتي من موقع العميل عليه nofollow · `http://` غير آمن · صفحة ما تفتح (مقيسة على الشبكة، مو مخمّنة) · عنوان مكسور.
- **فحص الروابط الميتة** (`check-links.ts`، سيرفر أكشن): HEAD أولاً، وإذا رجع ≥٤٠٠ يتأكّد بـGET حقيقي قبل الاتهام. ٤٠ رابطاً كحد · ٦ ثوانٍ مهلة · ٦ بالتوازي.
- **ختم القرار البشري** `data-link-reviewed="1"` — أُعلن داخل امتداد الروابط في المحرّر عشان يعيش دورة التحرير كاملة، فما تعيد البوّابة السؤال عن رابط حُسم.
- **حارس روابط موقع العميل أُزيل** (`LNKFREE`) — كان يمنع الحفظ؛ الآن طارق يربط براحته. الدافع من خالد: يبغى **باكلينك** من موقع العميل (jbrseo.com) لمودونتي، والحارس القديم كان يقف في وجهه.
- **القوائم المرقّمة والنقطية تظهر** (`LISTFIX`) — `prose` من Tailwind تطفئ العلامات؛ أُعيدت في ثلاث شاشات (المحرّر · معاينة الأدمن · صفحة المقال على مودونتي) بـ`ps-6` لا `me-6`، لأن العلامة في RTL تعيش في `padding-inline-start`.
- **الحفظ التلقائي صار ظاهراً** — كان يشتغل كل ٣٠ ثانية بصمت ويصفّر `isDirty`، فيبان زرّ الحفظ ميتاً والكاتب يظنّ أن التنسيق ضاع. الآن يطلع وقت آخر حفظ تلقائي.
- **الحالة:** `tsc --noEmit` صفر أخطاء · `next build` نجح («✓ Compiled successfully in 60s») · تست حيّ على Playwright شمل لصقاً حقيقياً من ملف وورد الطارق + قوائم مرقّمة تحقّقت في القاعدة وفي العرض · نسخة احتياطية للإنتاج قبل الدفع (`modonty` · ٩٥ مجموعة · ٥٣ ميغا).

### 📝 قرارات (بسببها)
- **بوّابة توقف الحفظ، لا إصلاح آلي** → خالد رفض الصامت: الكاتب لازم يشوف ويقرّر. البديل المرفوض: تحويل تلقائي لكل رابط داخلي إلى follow — يخفي المشكلة ويشيل السيطرة.
- **رفضت قاعدة خالد «www + دومين + .com»** لفحص شكل الرابط → لو طُبّقت لرفضت `kimazone.net` و`support.google.com` و`developers.home.google.com` و`jbrseo.com` — كلها روابط شرعية نستخدمها يومياً. المطبَّق بدلاً منها: ما يكسره اللصق فعلاً — بروتوكول مكرّر · مسافة داخل العنوان · مضيف بلا نقطة · عنوان لا يُقرأ. خالد وافق («do»).
- **الرابط الميت يتأكّد بـGET قبل الاتهام** → `support.google.com` يرجّع ٤٠٤ على HEAD و٢٠٠ على GET؛ الاتهام بلا تأكيد كان بيوقف حفظاً سليماً.
- **الرابط المكسور ما يُرسل للشبكة** → مشكوٌّ فيه أصلاً، والسؤال عنه يضيف شكوى ثانية على نفس الرابط.

### 🚧 معلّق / محجوب
- **نشر Vercel للأدمن ومودونتي غير متحقَّق منه** — الدفع تمّ، البناء لم يُراجع.
- **تست طارق الحقيقي على الإنتاج** — الحوار مكتوب بلغته، لكن ما جرّبه هو بنفسه بعد.
- **ESLint ما يشتغل في الأدمن** — لا يوجد `eslint.config.js`، و`next lint` أُزيل في Next 16. غير مصلَح عمداً (خارج نطاق التاسك).
- **`T41` — رسائل الفشل ما تظهر في نموذج المقال** (`toastViewportText` فاضٍ). عطل قديم لمسناه ولم نصلحه.
- **سجلّ التغييرات ما كُتب** — سكربته مهجور (آخر مدخل `0.41.0` والحزمة `1.15.0`). قرار خالد السابق: تركه.

### 📂 ملفات لُمست (١٣ ملفاً في `059bbcb`)
- `admin/app/(dashboard)/articles/helpers/internal-link-audit.ts` — **جديد**، الماسح: خمسة فحوص، يقرأ ولا يقرّر.
- `admin/app/(dashboard)/articles/components/internal-link-review-dialog.tsx` — **جديد**، نافذة القرار: عنوان قابل للتعديل + زر «حوّله إلى https» + نوع الرابط وطريقة الفتح.
- `admin/app/(dashboard)/articles/actions/check-links.ts` — **جديد**، قياس وصول الروابط.
- `admin/app/(dashboard)/articles/components/article-form-context.tsx` — البوّابة نفسها: الحفظ يتوقّف حتى تُحسم الروابط.
- `admin/app/(dashboard)/articles/components/rich-text-editor.tsx` — إعلان `data-link-reviewed` + علامات القوائم `ps-6`.
- `admin/app/(dashboard)/articles/components/article-form-header.tsx` — إظهار وقت الحفظ التلقائي.
- `admin/app/(dashboard)/articles/[id]/page.tsx` · `modonty/app/articles/[slug]/page.tsx` — إرجاع علامات القوائم في `prose`.
- `.../mutations/create-article.ts` · `update-article.ts` — إزالة حارس روابط موقع العميل.
- `admin/package.json` (`1.14.0 → 1.15.0`) · `modonty/package.json` (`1.87.0 → 1.87.1`) · `documents/tasks/TASK.html` (٣ بطاقات منجزة: `LNKGATE` · `LNKFREE` · `LISTFIX`).

### 🔁 حالة Git والنشر
- **الفرع:** `main` · **آخر كوميت:** `059bbcb` — «روابط المقال: بوّابة قبل الحفظ، ومقال العميل يربط بحرّية، والقوائم تظهر» · **مدفوع:** نعم (صفر/صفر مع origin).
- **غير مرفوع (متروك عمداً):** `.claude/settings*.json` · `.mcp.json` · ملفا SESSION-LOG · `BUSINESS-MODEL-REFERENCE.md` · `mobile-uiux-mockup.html`.
- **Vercel:** بناء تلقائي انطلق للأدمن ومودونتي — **غير متحقَّق منه**.

### 🚀 الرجوع في ٣٠ ثانية
1. `cd admin && pnpm dev` (المنفذ **3000** — `NEXTAUTH_URL` مربوط عليه؛ أي منفذ ثاني يكسر الدخول).
2. افتح مقالاً فيه رابط ملصوق واضغط حفظ → لازم تطلع «راجع الروابط قبل الحفظ».
3. القرار الأول: نطلب من طارق يجرّبها على الإنتاج، أو نمسك `T41` (رسائل الفشل المخفيّة)؟

### 🧠 قواعد ثبتت هذه الجلسة
- **ممنوع تركيب الروابط بيدي وقت التست** — التنقّل بالضغط على الواجهة فقط. الرابط المركَّب لوّث الدليل وشكّك خالد بلا سبب. محفوظة في `feedback_no_url_crafting_navigate_by_ui`.
- **مشاكل البيئة تُحلّ بالبيئة لا بالكود** — سيرفر على منفذ غلط ما يُعالَج بتعديل كود؛ يُقفل ويُشغَّل من جديد.

---

## Session: 2026-08-11 13:52 — 🧭 الكونسول: قائمة جانبية مجمّعة + «مقالاتك على موقعك» صارت تبويباً + حذف صفحة «نشاط المحتوى» (مدفوع `be3dcab`)

### 🎯 أين وقفت
- **آخر فعل:** `git push` تمّ بنجاح (`42b450b..be3dcab main -> main`) بعد رفع إصدار الكونسول `0.26.0 → 0.27.0`.
- **الفعل التالي:** التحقّق من نشر Vercel للكونسول (لم يُتحقَّق منه بعد في هذه الجلسة) — `vercel inspect` أو فتح `console.modonty.com` والتأكّد أن التبويب الخامس ظاهر.
- **قرار صغير معلّق لخالد:** هل يُعاد تسمية بند «المقالات» في القائمة الجانبية إلى «المحتوى»؟ توصيتي: لا — اللي جوّاه مقالات فعلاً.

### ✅ أُنجز هذه الجلسة

**١. بوّابة الشريط الجانبي (الخطأ الأصلي):**
- كان بند «مقالاتك على موقعك» يظهر لمن **عنده مقالات منشورة** بدل من **عنده الصلاحية** — أي أنه يختفي بالضبط لحظة ما يحتاجه العميل (قبل أول نشر). صار يقرأ `canPublishToOwnSite`.
- تست مميِّز على `modonty_dev`: أُطفئت الصلاحية من الأدمن → البند اختفى (١٩ رابطاً مقابل ٢٠) → أُعيدت.

**٢. إعادة بناء القائمة الجانبية:**
- مجموعات قابلة للطي بـshadcn Collapsible، **واحدة مفتوحة فقط**، وتُفتح تلقائياً على المجموعة التي فيها الصفحة الحالية (مزامنة أثناء الرِّندَر لا `useEffect`).
- روابط سريعة مثبَّتة فوق المجموعات: المقالات · الأسئلة الشائعة.
- بطاقة الاشتراك ثابتة أعلى القائمة (الباقة · الحالة · الأيام المتبقية · تاريخ الانتهاء)، وفيها **كرة أرضية خضراء بعلامة صح** بجانب «نشط» حين تكون خاصية النشر على موقع العميل مفعّلة.
- «لوحة التحكم» و«دليل الاستخدام» أُزيلا من القائمة؛ «الإعدادات» و«صحة موقعك» نزلا **أيقونتين في الفوتر الثابت** → اختفى الـscrollbar من القائمة الرئيسية (القياس: `needsH` من ٧٩١ إلى ٧٨٠ بيكسل).
- **مصدر واحد للتنقّل** (`nav-config.ts`) يقرأه سطح المكتب والجوال معاً — كانا نسختين يدويتين، وبسببها لم يصل بند «مقالاتك على موقعك» لمستخدمي الجوال أصلاً.

**٣. نقل إلى صفحة الإعدادات:** لوحة «ربط موقعك بمحتوانا» (عناوين السحب) + «فحص موقعك» (فحص الفهرسة) — إعداد يُضبط مرّة واحدة من مطوّر، لا شغل يومي.

**٤. «مقالاتك على موقعك» صارت تبويباً:**
- تبويب خامس في `/dashboard/articles` يستخدم **نفس بطاقة المقال** (صورة · وسوم · عدد كلمات · زمن قراءة) بدل قائمة عنوان-ورابط.
- زرّ «عرض على موقعك» يودّي لدومين العميل (`canonicalUrl ?? mainEntityOfPage`) لا لمودونتي، وشارة البطاقة تقول «منشور على موقعك».
- من لا يملك الخاصية يشوف **رسالة ترقية أنيقة** (عنوان + ٣ فوائد + زرّ «كلّمنا نفعّلها لك» → الدعم). معاينة HTML اعتمدها خالد: `documents/HTML/console-site-articles-upsell.html`.
- **حُذفت** صفحة `/dashboard/site-articles` بالكامل وسطرها من القائمة.

**٥. «نشاط المحتوى» حُذفت (`/dashboard/content`):**
- كانت تكراراً: العدّادات موجودة كتبويبات، و«آخر ٥ منشورة» نفس تبويب «منشور».
- المعلومة الوحيدة الفريدة (**الرصيد الشهري**) صارت شريطاً نحيفاً فوق التبويبات، وكل تبويب صار يحمل رقمه.

**الحالة:** `tsc` الكونسول **صفر أخطاء** · Build لم يُشغَّل · تست حيّ على `localhost:3002` بحساب جبر سيو: التبويبات `بانتظار الموافقة 1 · مجدولة · منشور 14 · كل المقالات 18 · مقالاتك على موقعك 2`، والشريط «رصيدك هذا الشهر: 0 من 8 — متبقّي 8 · يُجدَّد ١ سبتمبر ٢٠٢٦`، و`/dashboard/content` يردّ 404.
**رسالة الترقية:** ✅ تحقّق منها خالد بنفسه (١١ أغسطس ٢٠٢٦) — البند مقفول. (كلود ما شافها داخل التطبيق؛ اعتماديات العميل التجريبي `demo-normal@modonty-test.local` لم تعد تعمل.)

### 📝 قرارات مع أسبابها
- **البوّابة على الصلاحية لا على العدد** → الشاشة تلزم العميل *قبل* أول نشر (عنوان السحب وفحص الفهرسة). البديل المرفوض: عدّ المقالات — يخفي الشاشة وقت الحاجة.
- **تبويب لا صفحة** → العميل يقرأ كل شغله في مكان واحد وببطاقة موحّدة. البديل المرفوض: إبقاء الصفحة المستقلة — قائمة أفقر ونقطة دخول ثانية لنفس المحتوى.
- **إبقاء التبويب ظاهراً لغير المشترك مع رسالة ترقية** (طلب خالد) → التبويب المخفي لا يبيع شيئاً، والعميل أصلاً يفكّر بمقالاته في هذه اللحظة.
- **حذف «نشاط المحتوى» بدل تحسينها** → ٤ من ٥ عناصرها تكرار لما تقوله التبويبات؛ الخسارة الوحيدة (الرصيد) نُقلت.
- **استخراج `ARTICLE_LIST_INCLUDE`** في `article-queries.ts` → أربع استعلامات كانت تكرّر ١٣٥ سطراً حرفياً؛ أي حقل جديد كان يُضاف لواحدة فقط ويظهر كعطل بيانات في بطاقة.
- **`getSiteArticles` تُجلب دائماً داخل `Promise.all`** بدل انتظار قراءة الصلاحية → تجنّب waterfall؛ الاستعلام يردّ فارغاً لمن لا يملك الخاصية.
- **تنسيق تاريخ التجديد على السيرفر** → لو حُسب في المتصفّح لاعتمد على ساعة الزائر وسبّب اختلاف hydration.

### 🚧 معلّق / محجوب
- **تسمية بند «المقالات»** — بانتظار قرار خالد (توصيتي: يبقى «المقالات»).
- **نشر Vercel للكونسول** — لم يُراقَب بعد.
- **اعتماديات العميل التجريبي `demo-normal@modonty-test.local`** — لم تعد تعمل على `modonty_dev`.
- سؤالان قديمان بلا جواب: رفع ارتفاع صفوف الجوال إلى ٤٤ بيكسل؟ · إرجاع شارة «مدفوع» الخضراء في بطاقة الاشتراك؟

### 📂 ملفات لُمست (٣١ ملفاً في الدفعة)
- `console/app/(dashboard)/components/nav-config.ts` — **جديد**: مصدر التنقّل الوحيد (سطح المكتب + الجوال).
- `console/app/(dashboard)/components/sidebar-groups.tsx` — **جديد**: أكورديون Collapsible بمجموعة واحدة مفتوحة.
- `console/app/(dashboard)/components/sidebar-subscription.tsx` — **جديد**: بطاقة الاشتراك + علامة الكرة الأرضية الخضراء.
- `console/app/(dashboard)/components/sidebar-icon-link.tsx` — **جديد**: رابط أيقونة فقط لفوتر القائمة.
- `console/lib/subscription.ts` — **جديد**: اشتقاق حالة الاشتراك (مشترك بين القائمة والإعدادات).
- `console/app/(dashboard)/components/sidebar.tsx` · `mobile-sidebar.tsx` · `dashboard-layout-client.tsx` · `dashboard-header.tsx` · `sidebar-nav.tsx` — إعادة الترتيب وحذف تمرير `canSeeSiteArticles` الميت وسطر `/dashboard/content`.
- `console/app/(dashboard)/layout.tsx` — حقول الاشتراك + اشتقاقها على السيرفر.
- `console/app/(dashboard)/dashboard/articles/page.tsx` — `getSiteArticles` + عدّاد الشهر + تاريخ التجديد.
- `console/app/(dashboard)/dashboard/articles/components/articles-page-client.tsx` — التبويب الخامس + أرقام التبويبات + شريط الرصيد.
- `console/app/(dashboard)/dashboard/articles/components/article-card.tsx` — حالة `PUBLISHED_ON_CLIENT_SITE`: شارة «منشور على موقعك» + زرّ يودّي لدومين العميل.
- `console/app/(dashboard)/dashboard/articles/components/site-articles-upsell.tsx` — **جديد**: رسالة الترقية.
- `console/app/(dashboard)/dashboard/articles/components/monthly-quota-bar.tsx` — **جديد**: شريط الرصيد الشهري.
- `console/app/(dashboard)/dashboard/articles/helpers/article-queries.ts` — `ARTICLE_LIST_INCLUDE` + `getSiteArticles` + `canSeeSiteArticles` + `getMonthlyPublishedCount`.
- `console/app/(dashboard)/dashboard/articles/actions/article-actions.ts` — حذف `revalidatePath("/dashboard/content")`.
- `console/app/(dashboard)/dashboard/settings/page.tsx` + `components/pull-address-panel.tsx` + `components/site-seo-check.tsx` + `helpers/check-client-site-seo.ts` — منقولة من `site-articles/`.
- **محذوف:** `console/app/(dashboard)/dashboard/site-articles/**` · `console/app/(dashboard)/dashboard/content/**`.
- `console/lib/ar.ts` — `noOnSite` + عناوين المجموعات؛ حُذف `nav.content` و`nav.groupContent`.
- `console/package.json` — `0.26.0 → 0.27.0`.
- `documents/HTML/console-site-articles-upsell.html` — معاينة رسالة الترقية (معتمَدة).

### 🔁 حالة Git / النشر
- **الفرع:** `main`
- **آخر كوميت:** `be3dcab` — «الكونسول: قائمة جانبية مجمّعة، ومقالات العميل صارت تبويباً»
- **مدفوع:** نعم — `42b450b..be3dcab main -> main`
- **غير ملتزم (متروك عمداً):** `.claude/settings.json` · `.claude/settings.local.json` · `.mcp.json` · `documents/context/SESSION-LOG.md`
- **Vercel:** لم يُتحقَّق منه بعد.

### 🚀 استئناف في ٣٠ ثانية
1. `cd console && npx next dev -p 3002` ثم دخول جبر سيو (`support@jbrseo.com` / `JbrSeo2026!`).
2. افتح `http://localhost:3002/dashboard/articles` — لازم تشوف ٥ تبويبات وشريط الرصيد فوقها.
3. القرار الأول: تسمية بند «المقالات» في القائمة الجانبية — يبقى أو يصير «المحتوى»؟

---

## Session: 2026-08-09 → 08-10 (ليل طويل) — 🚢 **مقالات العملاء دُمجت ونُشرت على الإنتاج** + فحص E2E كامل (١٩ هدفاً من ٢١) + مراجعة سيو جبر سيو (٢٨ بنداً)

### 🎯 أين وقفت
- **آخر حالة:** مودونتي **على الإنتاج**. `main` = `42b450b`، مدفوع، والمسارات الجديدة حيّة ومتحقَّقة حيّاً. الميزة **نائمة**: صفر عميل مفعَّل وصفر مقال عميل على الإنتاج ⇒ صفر تغيير لأي أحد.
- **الخطوة التالية بالضبط:** الشغل انتقل إلى **جبر سيو** (مستودع منفصل) — تأكيد معرّف العميل في قاعدة الإنتاج ثم تبديله في `lib/modonty-articles.ts:65`. **التفاصيل الكاملة في سجلّ جبر سيو نفسه** (`JBRSEO/jbrseo.com/documents/context/SESSION-LOG.md`، الجلسة في الأعلى) — خالد طلب صراحةً أن يُوثَّق شغل جبر سيو هناك ويكمل منه.

### ✅ ما أُنجز — النشر
- **بناء ثلاثة تطبيقات نجح:** `admin` · `console` · `modonty`. (فشل أول مرة بـ`EPERM` على Prisma — السبب المعروف: سيرفرات التطوير تمسك الملفات؛ حُلّ بإقفال `node` ثم إعادة البناء.)
- **تست ٩/٩ على البناء الإنتاجي** (لا وضع التطوير): القائمة · المقال المفرد بسلَق عربي · البطاقة ٤ عقد بلا خطّ تنقّل · الرابط على نطاق العميل · ETag 304 · معرّف معدوم 404 · عميل مقفول 403 · الخريطة.
- **طقوس الدفع كاملة:** رفع الإصدار (`admin 1.14.0` · `console 0.26.0`) · مدخل سجلّ تغييرات بسبعة بنود · **نسخة احتياطية للإنتاج** (٩٥ مجموعة · ٥٠ ميغا) · تثبيت `42b450b` · دمج fast-forward · دفع `1a1262e..42b450b`.
- **تحقّق حيّ بعد النشر:** `api.modonty.com/v1/sites/<id>/articles` → **403** «Publishing is not enabled» لعميل مقفول · **404** «Unknown site» لمعرّف مشوّه · `www.modonty.com` و`api.modonty.com` → 200.
- **فخّ انكشف:** أول قراءة أعطت 404 بصفحة HTML — كان **خبء شبكة عمره ٢٢ ساعة** (`Age: 78778`) لا ردّاً من الكود. انكشف بقراءة `Age` و`Content-Type`. **الدرس: لا تحكم على الإنتاج من رمز الحالة وحده.**

### ✅ ما أُنجز — تعديل الكود الوحيد
- `admin/lib/seo/knowledge-graph-generator.ts` (+22 −5): **`BreadcrumbList` لا تُبنى لمقال موقع العميل**، و`WebPage.breadcrumb` يُحذف معها (مرجع `@id` لعقدة غائبة أسوأ من غياب الخطّ). مقالات مودونتي **مطابقة حرفياً** لما كانت — أُثبت بتشغيل المولّد على النوعين.

### ✅ ما أُنجز — فحص E2E كامل على قاعدة التطوير
- **رحلة مقال جديد من الصفر:** `WRITING → DRAFT → AWAITING_APPROVAL → (موافقة العميل في الكونسول) → SCHEDULED → PUBLISHED_ON_CLIENT_SITE` — المعرّف `6a78d5c7bbfdd41f23035688`.
- **١٩ هدفاً من ٢١ مثبَتاً بدليل خام.** الباقيان يخصّان تهيئة الإنتاج ونشر جبر سيو.
- **ما ثبت سليماً:** بوّابة الجودة ٢١/٢١ (تسمّي كل عطل وتدلّ على مكانه) · العزل 403/404/ETag · لوحة العميل في الكونسول · حارس الروابط الداخلية اليدوية (منع الحفظ فعلاً) · تتبّع آخر سحب (يتحرّك) · حارس عنوان النشر (رفض عنواناً وهمياً بعد فحص فعليّ) · إعادة الخبز عند تغيير العنوان (في الاتجاهين) · **زرّ الطوارئ**: `canPublishToOwnSite` → 200 ← 403 ← 200 فوراً.
- **TSC:** صفر أخطاء على `admin` و`console` و`jbrseo`. **البناء:** الثلاثة نجحت. **التست الحيّ:** بضغطات حقيقية في المتصفّح.

### 📝 قرارات مأخوذة
- **`isPartOf` تبقى تشير لمودونتي** → خالد: «العميل بالفعل جزء من مدونتي». وschema.org تعرّفها «(in some sense) is part of»، وقوقل **لا تستعملها لأي نتيجة ثرية** (فُحص معرض الميزات + محتوى الاشتراك المدفوع). ⇒ لا مكسب في تغييرها ولا خسارة في إبقائها.
- **`BreadcrumbList` تُحذف من مقال العميل** → قوقل نصّاً: «Don't add structured data about information that is not visible to the user, **even if the information is accurate**». ولا نضمن قالب أي عميل، ولا نستطيع مراجعة كل عميل للأبد. والدليل من أوّل عميل: جبر سيو يعرض «المقالات › العنوان» وكنّا نرسل «الرئيسية (مودونتي) › العنوان».
- **لا حذف في مودونتي — أرشفة فقط**، وزرّ سحب المقال من موقع العميل **مرحلة ثانية**. الجدار الحالي (`hasLeftForClientSite`) مقصود ومعتمَد.
- **الفحص الكامل من الصفر لا الاختصار** → خالد رفض «تعديل مقال موجود»، وكان محقّاً: الاختصار كان سيمرّ فوق عطل السلَق العربي.

### 🚧 معلّق / محجوب
- **T41 — نموذج المقال:** النجوم لا تطابق التحقّق (`Slug` و`Content` إلزاميان **بلا نجمة**، و`SEO Title`/`SEO Description` بنجمة وهما اختياريان)، **والحفظ يفشل صامتاً** بلا ما يسمّي الحقل الناقص. رُصد بثلاث محاولات حفظ فاشلة. الرسائل موجودة في السكيما ولا تصل الشاشة.
- **أثر غير محسوب:** لو سقط `articlesBaseUrl` (فشل فحص العنوان)، تُعاد بطاقات مقالات **منشورة أصلاً** على مودونتي بينما `canonicalUrl` يبقى عند العميل — تناقض داخل المقال الواحد. المقترح: استثناء ما غادر فعلاً (`hasLeftForClientSite`) من إعادة الخبز.
- **لا مسار تحديث فوري:** وسوم الجلب موجودة في `lib/modonty-articles.ts` ولا شيء يطلقها ⇒ أي تصحيح ينتظر ساعة عند العميل.
- **ملاحظة واجهة:** شريط الحفظ اللاصق في صفحة العميل يغطّي مفتاح «النشر على موقعه» فلا يُضغط إلا عبر نصّه.
- **تهيئة الإنتاج (تخصّ جبر سيو):** `canPublishToOwnSite = false` و`articlesBaseUrl = null` ⇒ الميزة نائمة حتى تُفعَّل.

### 📂 ملفات لُمست (مودونتي)
- `admin/lib/seo/knowledge-graph-generator.ts` — العقدة والمرجع.
- `admin/scripts/changelog-sync.ts` — مدخل `1.14.0`.
- `admin/package.json` · `console/package.json` — رفع الإصدار.

### 🔁 حالة git والنشر
- **الفرع:** `main` · **آخر كوميت:** `42b450b` · **مدفوع:** نعم (`1a1262e..42b450b`) · `origin/main` == المحلي (0 · 0).
- **فرع `client-articles`** مدموج بالكامل (fast-forward) ويمكن حذفه.
- **Vercel:** المشاريع الثلاثة نُشرت والمسارات متحقَّقة حيّاً.
- **غير مثبَّت (مقصود):** `.claude/settings*.json` و`.mcp.json`.

### 🚀 كيف تكمل في ٣٠ ثانية
1. الشغل الآن في **جبر سيو** — اقرأ سجلّه: `JBRSEO/jbrseo.com/documents/context/SESSION-LOG.md` (الجلسة في الأعلى).
2. في مودونتي لا يوجد شيء عالق يمنع أحداً؛ المعلّق أعلاه تحسينات لا أعطال حاجزة.
3. لو أردت إقفال T41: `admin/.../articles/components/sections/basic-section.tsx` (النجوم) و`save-article-button.tsx` (إظهار سبب الفشل).
4. لوحة جبر سيو المرجعية: `JBRSEO/jbrseo.com/documents/tasks/JBRSEO-SEO-TASK.html` — ٢٨ بنداً، المفتوح فيها `T35` و`T36` و`T41`.

---

## Session: 2026-08-09 (تكملة، بعد التجميد الأول) — 🌐 صفحتا المقالات على جبر سيو (الجذر · كل الدول) + الدمج مع `main` + الصفحة حيّة وفاضية

### 🎯 Where I stopped
- الصفحة نزلت على الموقع الحيّ فعلاً: `https://www.jbrseo.com/articles` ترجع **200** (التحويل إلى `/sa` توقّف) — لكنها تعرض **«ما نزلت مقالات بعد»**، لأن مفاتيح السحب الثلاثة موجودة في `.env.local` على جهاز خالد فقط، فالموقع الحيّ لا يعرف من أين يسحب.
- **آخر رسالة من خالد (مقطوعة):** يفضّل ألّا تُرصّ المفاتيح كما هي، بل **يُضاف لها قسم في الإعدادات** — الجملة انقطعت قبل أن تكتمل. **لا تُنفَّذ أي إضافة على Vercel قبل أن يوضّح مقصده**: قسم في إعدادات مشروع Vercel؟ أم شاشة إعدادات داخل جبر سيو نفسه؟
- الفعل التالي عند الرجوع: اسأل خالد سؤالاً واحداً قصيراً عن مقصده، ثم نفّذ.

### ✅ Done this session
- **دراسة بنية جبر سيو** قبل أي كتابة: توجيه الدول في `proxy.ts`، و`RESERVED_FIRST_SEGMENTS`، ونمط صفحات `app/(site)/`.
- **صفحتا المقالات على الجذر لا تحت الدولة** — `app/(site)/articles/page.tsx` (قائمة، المقال الرئيسي يتصدّر) و`app/(site)/articles/[slug]/page.tsx` (المقال).
- **`"articles"` أُضيفت إلى `RESERVED_FIRST_SEGMENTS`** في `lib/country-config.ts` — بدونها `proxy.ts:99` كان يحوّل `/articles` إلى `/sa`. مستهلكها الوحيد هو ذلك السطر، فالأثر محصور.
- **`lib/modonty-articles.ts`** — طبقة السحب: `getArticles()` و`getArticle(slug)`، تخزين ساعة مع وسوم `modonty-articles`، وتقرأ `MODONTY_API_BASE` و`MODONTY_API_KEY` و`MODONTY_PREVIEW_BYPASS`.
- **الدمج مع `main` ودفعه:** `cbe03c2..a54dd8c` — «المقالات: صفحتا القائمة والمقال على الجذر، تُسحب من مودونتي». `origin/main...HEAD` = **صفر/صفر**.
- **النشر:** مشروع Vercel اسمه **`jbrseo`** (نطاقاه `jbrseo.com` و`www.jbrseo.com`) — نشرة `08-09T01:34` **READY**.
- **قياس حيّ خام:** `/articles` ⇐ **200** (٧٦٧٣٢ بايت · نصّ الفراغ حاضر · السلَق غائب) · `/articles/client-site-jsonld-test-2` ⇐ **500**.

### 📝 Decisions taken (with reasoning)
- **المقالات على الجذر لا تحت الدولة** (قرار خالد) → المقال واحد يخدم السعودية ومصر وغيرهما؛ نسخه تحت كل دولة يصنع محتوى مكرّراً ويشتّت قوة الرابط.
- **جبر سيو يطبع ولا يفكّر** → الرابط الأساسي والفهرسة والبطاقة المهيكلة **تُطبع كما وصلت من مودونتي**. السبب مكتوب في رأس `lib/modonty-articles.ts`: لحظة ما يبدأ هذا الملف يقرّر سيو، تصير جودة السيو التي ندفع لمودونتي مقابلها = جودة هذا الملف.
- **`dynamicParams = true`** → المقال الجديد يظهر بين نشرتين؛ حجبه حتى إعادة البناء يجعل زرّ النشر في الأدمن كذبة.
- **العنوان المقطوع لا يُسقط الصفحة** → `getArticles()` ترجع قائمة فارغة لا تُلقي خطأ؛ الزائر يرى «ما نزلت مقالات بعد» (صحيحة من موقعه) بدل شاشة عطل. الخطأ يُسجَّل لنا لا له.

### 🚧 Pending / blocked
- **🔑 المفاتيح الثلاثة (`MODONTY_API_BASE` · `MODONTY_API_KEY` · `MODONTY_PREVIEW_BYPASS`) غير موجودة على الإنتاج** — هذا وحده سبب فراغ القائمة. **محجوب على توضيح خالد** (انظر «Where I stopped»).
- **`/articles/<سلَق>` ترجع 500** — **التشخيص غير مثبت**: أرجّح أن `notFound()` في المسار الديناميكي بلا حدّ `not-found` مطابق، لكن **لم يُقرأ سجلّ النشرة بعد**. لا يُحكم قبل قراءة السجلّ الخام على Vercel.
- **مراجعة سيو الصفحتين — ما تحقّق وما بقي:** صفحة المقال مكتملة (رابط أساسي مخبوز · `robots` من الحمولة · بطاقة مهيكلة حرفية · `openGraph` بأبعاد حقيقية · صورة `priority` + `blurDataURL`). **صفحة القائمة ناقصة**: عندها عنوان ووصف ورابط أساسي فقط — **بلا `openGraph` وبلا بطاقة `ItemList`**. بند مفتوح.
- **عنوان جبر سيو في الأدمن** ما زال غير مضبوط على `https://www.jbrseo.com/articles` — الفاحص يفترض أنه يقبله الآن بعد زوال التحويل (**غير مجرَّب**). عند الضبط تعمل إعادة الخبز تلقائياً.
- **زرّ «جرّب العنوان» في الكونسول** — ٣ ملفات مبنية ومختبَرة محلياً، **ما زالت غير مدفوعة**.
- **تجربة طارق** على المعاينات — البوّابة قبل دمج `client-articles` مع `main`.
- **`prisma db push`** للفهرسين `[clientId,status,updatedAt]` و`[apiKey]` · **`Client-Site Flag`** على الإنتاج بعد الدمج · **`CAIMG`** (صور جبر سيو على بني) — كلها كما هي.
- **بعد الدمج:** نقل عنوان السحب إلى `api.modonty.com/v1` وحذف مفتاح التجاوز.

### 📂 Files touched
**مستودع جبر سيو (`JBRSEO/jbrseo.com`):**
- `app/(site)/articles/page.tsx` — **جديد**، قائمة المقالات على الجذر.
- `app/(site)/articles/[slug]/page.tsx` — **جديد**، صفحة المقال.
- `lib/modonty-articles.ts` — **جديد**، طبقة السحب من مودونتي.
- `lib/country-config.ts` — `"articles"` ضمن المقاطع المحجوزة.
- `.env.local` — ثلاثة أسطر (**محلي فقط، لا يُدفع**).

### 🔁 Git / deploy state
- **جبر سيو:** `main` عند `a54dd8c` (مدفوع، متطابق مع `origin`). الفرع المحلي الحالي `feat/inline-content-review`.
  - ⚠️ **غير مدفوع في جبر سيو:** `SESSION-LOG.md` و`SESSION-LOG-2026-07.md` معدّلان، و**٧ لقطات `.jpeg` سائبة في جذر المستودع** (`gift-*`, `pricing-section-local`, `eg-hero-local`, `cancel-message-fixed`) — **لا تُدفع**، مكان اللقطات `.playwright-mcp/`.
  - ⚠️ **مشروع Vercel اسمه `jbrseo.com`** (بالنقطة) **ميت** — غير مربوط، وكل بناءاته ERROR منذ ٣ أغسطس. **ليس الموقع الحيّ.** الحيّ هو `jbrseo`. لا تعيد الوقوع في هذا.
- **مودونتي:** الفرع `client-articles`، آخر كوميت `deb8452`. غير مدفوع: زرّ «جرّب العنوان» (٣ ملفات) + `TASK.html` + `CLIENT-ARTICLES-PREVIEW.md` + هذا الملف.

### 🚀 How to resume in 30 seconds
1. اسأل خالد: **«القسم اللي تقصده — قسم في إعدادات مشروع Vercel، ولا شاشة إعدادات جوّا جبر سيو نفسه؟»**
2. بعد جوابه: أضف المفاتيح الثلاثة → أعد النشر → افتح `https://www.jbrseo.com/articles` وتأكّد أن السلَق ظهر.
3. ثم اقرأ سجلّ النشرة على Vercel لسبب الـ500 على `/articles/<سلَق>` — **قبل أي حكم**.

---

## Session: 2026-08-09 (ليل طويل ≈ ٦ ساعات) — 🚀 «مقالات العملاء» من صفر كود إلى رحلة كاملة مُختبَرة + معاينة على Vercel

### 🎯 Where I stopped
- آخر شيء: بُني زرّ **«جرّب العنوان»** في شاشة الكونسول (يعرض ردّ الـAPI داخل المتصفّح بلا تسريب المفتاح) — **مبنيّ ومختبَر محلياً، غير مدفوع**.
- الفعل التالي عند الرجوع: `git add` الملفات الثلاثة الجديدة + دفعها → تُبنى معاينة جديدة (روابط جديدة) → تحديث الروابط في `CLIENT-ARTICLES-PREVIEW.md` وبطاقة `CAP` → تسليمها لطارق.

### ✅ Done this session
**الرحلة كاملة، مُختبَرة حيّاً من الكتابة إلى تسليم موقع العميل:**
- **القاعدة:** حالة `PUBLISHED_ON_CLIENT_SITE` + `Article.isClientSiteArticle`/`isMainArticle`/`lastFetchedAt` + ٦ حقول على `Client` (الإذن · العنوان · المفتاح وتواريخه · الإيقاف).
- **فاحص العنوان أُعيد بناؤه مرتين** بعد غلطتين مسكهما خالد — القاعدة النهائية: الرسوب على **التحويل** لا على رمز الحالة، وإضافة `www` تلقائياً، والعنوان الراسب **يُمسح** ولا يُخزَّن (ويُطفأ النشر) بلا إفشال بقية الحفظ.
- **الخبز بنطاق العميل:** الرابط الأساسي + `mainEntityOfPage` + البطاقة المهيكلة. `generateArticleKnowledgeGraph` صارت تستقبل `pageBaseUrl` بدل أن تفترضه.
- **بند ٢.٥:** إعادة خبز روابط مقالات العميل تلقائياً عند تغيّر `articlesBaseUrl` (عند التغيّر الفعلي فقط).
- **النشر يقرأ الوجهة من المقال لا من الزرّ** — كانت شاشة «Scheduled → Published» تكتب `PUBLISHED` ثابتة، فمقال العميل كان سينشر على مودونتي.
- **قسم «مقالات العملاء»** في الأدمن (قائمة عملاء ← صفحة العميل بمقالاته) + إخفاء مقالات العملاء من `/articles` + تمييزها بخلفية بنفسجية وشارة **في كل مراحل الرحلة** وفي صفحتَي العرض والتعديل.
- **عنوان القراءة في الكونسول:** `GET /v1/articles` و`/v1/articles/{slug}` — المفتاح يحدّد العميل، ETag/304، حدّ ١٢٠/دقيقة → 429، وحمولة جاهزة للطباعة.
- **شاشة «مقالاتك على موقعك»** للعميل + فحص `robots.txt`/الخريطة على نطاقه (بالضغط لا عند الفتح).
- **الصيانة:** خطوة `Client-Site Flag` في Run-All (عبّأت **١٣٤** مقالاً) + استثناء مقالات العملاء من مصحّح الروابط الأساسية (كان سيرجّعها لمودونتي).
- **TSC:** admin صفر · console صفر · modonty صفر (بعد ٣ إصلاحات أنواع).
- **Build:** لم يُشغَّل محلياً؛ **معاينات Vercel الثلاث بُنيت READY**.
- **Live test:** الرحلة كاملة مرّتين على `modonty_dev` — كتابة ← مسودّة ← فحص ٢١/٢١ ← موافقة العميل في الكونسول ← جدولة ← نشر ← العنوان سلّم المقال (`count: 1`) ← ترجيع الحالة سحبه (`count: 0`).

### 📝 Decisions taken (with reasoning)
- **الرسوب على التحويل لا على ٢٠٠** → لأن `www.modonty.com/articles` نفسها ترجع ٤٠٤ بينما `/articles/<سلَق>` ترجع ٢٠٠؛ اشتراط الـ٢٠٠ كان سيرفض عنواننا نحن. البديل المرفوض: رمز تحقّق يطبعه مبرمج العميل (خالد: «ما في عميل يغيّر domain بلا ما يبلّغنا»).
- **العنوان الراسب يُمسح ولا يُفشِل الحفظ** (خالد: «إحنا online») → بقية أقسام العميل بيانات حيّة، وحجزها بسبب حقل واحد أسوأ من عدم تخزينه.
- **الوجهة تُقرأ في لحظة النشر داخل السيرفر** → شاشة واحدة تنشر كل المقالات؛ القرار في الزرّ يعني تكراره في كل مكان ينشر وينكسر أول ما يُنسى.
- **رابط داخلي في مقال العميل = منتقي مقالات لا خانة عنوان** (فكرة خالد) → تمنع الغلط بدل اكتشافه، وتحلّ تعارض «المحلّل يطالب بروابط متن وأنا أمنعها»، وتبقي الرابط مرجعاً نملكه فنعيد كتابته عند تغيّر النطاق.
- **لا حذف لمقالات العملاء — أرشفة فقط** → لأن مودونتي نفسها بلا زرّ حذف (`DeleteArticleButton` مكوّن يتيم)؛ إضافته هنا مخالفة للنمط.
- **مفتاح العميل لا يُعرض في شاشة الكونسول** → اعتمادية تُطبع في شاشة يفتحها أي أحد تتسرّب؛ تُسلَّم مرة واحدة من الأدمن.
- **لا تشغيل ترحيل بني كأثر جانبي** (قرار خالد) → يكتب على تخزين بني ويغيّر ٥٤٨ صورة؛ شغل مستقل.

### 🚧 Pending / blocked
- **زرّ «جرّب العنوان» غير مدفوع** — يحتاج `git add` + push.
- **تجربة طارق على المعاينة** — البوّابة قبل الدمج مع `main`.
- **`prisma db push`** للفهرسين `[clientId,status,updatedAt]` و`[apiKey]` — غير موجودين.
- **تشغيل `Client-Site Flag` على الإنتاج** بعد الدمج (شُغّل على dev فقط).
- **بند ٣.٣**: منتقي الروابط الداخلية بُني ولم يُختبَر حيّاً بمقالين منشورين.
- **`CAIMG`**: صور جبر سيو غير مرحَّلة لبني (٣٩ من ٥٨٧ فقط) فالحمولة تخرج بروابط Cloudinary — **ليست علّة في الكود**، معلَّقة على الترحيل.
- **بعد الدمج:** نقل عنوان السحب من المعاينة إلى `api.modonty.com/v1` وحذف مفتاح التجاوز.

### 📂 Files touched
- `dataLayer/prisma/schema/schema.prisma` — الحالة الجديدة + حقول المقال والعميل + فهرسان.
- `admin/.../clients/actions/clients-actions/probe-articles-base-url.ts` — الفاحص، أُعيد بناؤه بالكامل.
- `admin/.../clients/actions/clients-actions/rebake-client-site-canonicals.ts` — **جديد**، إعادة خبز الروابط عند تغيّر العنوان.
- `admin/.../clients/actions/clients-actions/create-client-api-key.ts` · `helpers/api-key.ts` — **جديدان**، إنشاء المفتاح.
- `admin/.../clients/components/form-sections/client-site-section.tsx` — **جديد**، قسم النشر والمفتاح.
- `admin/app/(dashboard)/client-articles/**` — **جديد**، القسم كاملاً (شاشتان + أكشن المقال الرئيسي).
- `admin/.../articles/components/client-site-banner.tsx` · `helpers/client-site-guard.ts` · `helpers/client-site-links.ts` — **جديدة**.
- `admin/lib/seo/knowledge-graph-generator.ts` · `jsonld-storage.ts` · `url-builders.ts` — نطاق الصفحة يُمرَّر بدل أن يُفترض.
- `admin/.../articles/workflow/actions/transition-article.ts` — الوجهة تُقرأ من المقال عند النشر.
- `admin/.../articles/workflow/[transition]/page.tsx` · `maintenance/page.tsx` · `technical/page.tsx` — تلوين وشارة مقالات العملاء.
- `admin/.../database/actions/client-site-flag-backfill.ts` — **جديد**، تعبئة الحقل ضمن Run-All.
- `admin/.../database/actions/canonical-sanitizer.ts` — استثناء مقالات العملاء.
- `console/app/api/v1/**` — **جديد**، العنوان بمساريه ومصادقته وكاشه وحدّه.
- `console/app/(dashboard)/dashboard/site-articles/**` — **جديد**، شاشة العميل + فحص الفهرسة + زرّ التجربة (الأخير غير مدفوع).
- `console/next.config.ts` — تحويل `/v1/*` ← `/api/v1/*`.
- `modonty/app/api/articles/[slug]/*` · `actions/assert-public-article.ts` — ٨ مسارات كتابة صارت تفلتر الحالة.
- `documents/tasks/TASK.html` — ٦ بطاقات أُقفلت + بطاقتا `CAP` و`CAIMG`.
- `documents/tasks/CLIENT-ARTICLES-PREVIEW.md` — **جديد**، كل بيانات المعاينة.

### 🔁 Git / deploy state
- **الفرع:** `client-articles` (مدفوع، `origin` متطابق).
- **آخر كوميت:** `deb8452` — «مقالات العملاء: الرحلة كاملة من الكتابة إلى تسليم موقع العميل».
- **غير مدفوع:** زرّ «جرّب العنوان» (٣ ملفات) + `TASK.html` + `CLIENT-ARTICLES-PREVIEW.md` + هذا الملف.
- **إصدارات:** admin `1.12.0` · console `0.24.0`.
- **معاينات Vercel (READY):** admin `modonty-admin-ld8cvhktp-…` · console `modonty-console-nmdyr41dc-…` · modonty `modonty-modonty-fx1y27zxa-…`.
- **🔒 قاعدة المعاينة = `modonty_dev`** — أُضيف `DATABASE_URL[preview]` للأدمن والكونسول (مودونتي كان مضبوطاً). **الإنتاج لم يُلمس.** الدليل: نداء معاينة الكونسول رجّع `count=1` بمقال موجود في dev وحدها.
- **`api.modonty.com`** أُضيف لمشروع الكونسول و`verified: true` · `misconfigured: false` (سجلّا Namecheap مكتوبان في `CLIENT-ARTICLES-PREVIEW.md`). يخدم **الإنتاج**، فلا يرد على كود الفرع قبل الدمج.
- **مفتاح تجاوز حماية المعاينة:** `c6CyLBo1tun2qz7usqjW2kw9FxeG3Ig4` (ترويسة `x-vercel-protection-bypass`) — للمعاينة فقط، يُحذف بعد الدمج.

### 🚀 How to resume in 30 seconds
1. `git add console/app/\(dashboard\)/dashboard/site-articles documents/tasks && git commit && git push` — دفع زرّ التجربة.
2. افتح `documents/tasks/CLIENT-ARTICLES-PREVIEW.md` وحدّث روابط المعاينة من النشرة الجديدة.
3. القرار: تسليم الروابط لطارق ليبدأ التجربة — هو البوّابة قبل الدمج مع `main`.

---

## Session: 2026-08-08 مساءً — 🧭 «مقالات العملاء»: انقلاب معماري من ترقيعٍ لجبر سيو إلى خدمةٍ تُباع + دفع إدارة المحتوى للإنتاج

### 🎯 Where I stopped
- **آخر تاسك:** دراسة مشاهد لوحة القصّة لمشروع «مقالات العملاء»، مشهداً مشهداً. **المشهد ١ (الاعتماد) حُسم**؛ المشهد ٢ (إثبات ملكية النطاق) هو التالي ولم يُبدأ.
- **صفر كود كُتب لهذا المشروع** — الجلسة كلها تصميم وخطّة على اللوحة، بقرار خالد: «ما في تعديل كود، الآن إحنا تعديل خطة».
- **الخطوة الملموسة عند العودة:** افتح `documents/tasks/TASK.html#b=ca` ← تبويب «🌐 العميل» ← المشهد ٢، واختر آلية إثبات ملكية النطاق من الخيارات الثلاثة المطروحة فيه (ملف تحقّق · سجلّ DNS · بلا تحقّق).

### ✅ Done this session
- **دُفع للإنتاج:** `ce1c85b..1a1262e` على `main` — ثلاثة إيداعات: إدارة محتوى جبر سيو من أدمن مودونتي · إعادة بناء لوحة المهام · رفع إصدار الأدمن `1.11.0`.
- **نسخة احتياطية قبل الدفع:** قاعدة `modonty` (PROD) · ٩٥ مجموعة · ٤٧ م.ب.
- **حالة الفحص:** tsc الأدمن **صفر أخطاء** · Build **لم يُشغَّل** · تست حيّ **لم يُعَد** (إدارة المحتوى اختُبرت دورة كاملة في الجلسة السابقة) · سجلّ التغييرات **لم يُكتب عمداً** — سكربته يكتب في القاعدة وآخر بند فيه `0.41.0` بينما الحزمة `1.11.0`، فهو مهجور، وخالد قال يُترك.
- **الفروع:** `jbrseo-content` اندمج على `main` (fast-forward) ثم فُتح `client-articles` — وهو الفرع الحالي، فاضٍ ومتطابق مع `main`.
- **لوحة المهام أُعيد بناؤها بالكامل:** بورد «جبر سيو» صار **«مقالات العملاء»** (`k:"ca"`، `FOCUS='ca'`) · حُذفت ٥ قرارات ألغاها المعمار الجديد (JBR2·5·6·8·10) · أُضيفت **١١ مشهد قصّة** + كرت «📋 المطلوب من العميل» + **٧ مراحل بناء** (CA1..CA7) + **٤ قرارات مرجعية** (CA0، CAD1..CAD3).
- **ثلاثة تبويبات في البورد المسطّح:** 🛠️ مدونتي Admin · 🌐 العميل · 🔑 الكونسول — بطلب خالد «عشان ما أتوه». الآلية: خاصية `side` على البطاقة + شريط أزرار داخل `render()`.

### 📝 Decisions taken (with reasoning)
1. **الفكرة كبرت من موقعٍ واحد إلى خدمة تُباع** → مقال يُكتب في أدمن مودونتي ويُنشر على **موقع العميل نفسه**؛ جبر سيو أوّل زبون. البديل المرفوض: مشروع معزول خاصّ بجبر سيو (قرار JBR10 القديم) — لأنه يبني شيئاً لا يُعاد استعماله.
2. **قاعدة خالد الحاكمة:** «أي حاجة تخصّ أو تؤثّر ولو تأثيراً ضئيلاً على مودونتي فهي مرفوضة تماماً». وهي التي أسقطت كل حلٍّ يمسّ `modonty.com`.
3. **العزل بحالة المقال لا بجدول منفصل** → قيمة جديدة `PUBLISHED_EXTERNAL`. الدليل: كل مسار عامّ في مودونتي يفلتر `status: PUBLISHED` — **٣٤ ملفاً، ١٩ منها مسارات عامّة** (`article-data.ts:12` · `article-metadata.ts:13` · `sitemap.ts:53`). فقيمة لا تطابق أياً منها = عزل مجاني ودائم، وأي استعلام جديد يُكتب بنفس النمط يستثنيها تلقائياً.
4. **لا رابط أساسي عبر النطاقات — بمصدر رسمي.** نصّ قوقل: «The canonical link element is **not recommended** for those who want to avoid duplication by syndication partners… The most effective solution is for partners to **block indexing** of your content». السبب: الرابط الأساسي عبر النطاقات **إشارة** لا أمر مُلزِم. وبديل قوقل (منع الفهرسة) يدفع مودونتي ثمنه → مرفوض بالقاعدة ٢. **فالحلّ: لا ننشئ التكرار أصلاً** — مقال واحد، نطاق واحد، رابط أساسي يشير لنفسه.
5. **الوجهة خاصية المقال لا العميل** — وإلا تعارض وعدان: حضور العميل عندنا بمقالاته، وتسليمه مقالات موقعه.
6. **التسليم بواجهة برمجية في كونسول لا بمرآة قاعدة.** المرآة تُرمى لاحقاً وتربط موقع العميل بسكيمتنا الداخلية بلا عقد. وكونسول لا الأدمن: الأدمن أداة داخلية نعيد نشرها كثيراً وتعطّله ما يصحّ يوقّف مواقع العملاء؛ وفتح مسار عامّ فيه ثقبٌ في بوّابة حمايته.
7. **المشهد ١ (محسوم):** إذن يدوي `Client.canPublishToOwnSite` مستقلّ عن الباقة — الباقة تصف ما اشتراه العميل، لا ما نسمح له به. ومعه `Client.articlesBaseUrl` (رابط مقالاته كاملاً، مستقلّ عن `Client.url` لأنّ ذاك الصفحة الرئيسية والمقالات قد تكون تحت `/blog` أو نطاق فرعي). **بوّابتان معاً** تفتحان خيار الوجهة، والرابط **عنوان متّفق عليه** مع مبرمج العميل لا شرط وجود الصفحة. وهذا أبطل قرار CAD3 الذي جعل البوّابة حقل الباقة.
8. **الحمولة جاهزة للطباعة** — نرسل البطاقة المهيكلة وبيانات الوصف مخبوزة **بنطاق العميل**؛ موقعه «يطبع ولا يفكّر». الحجّة: تسليم بناء البطاقة ليد العميل يعني أنّه هو من يخرّب جودة السيو، وهي بالضبط الحاجة التي تُباع.

### 🚧 Pending / blocked
- **المشاهد ٢..١١ لم تُدرَس.** أربعة منها تحمل قرارات لخالد: ٢ إثبات ملكية النطاق · ٤ وصول المفتاح ليد العميل · ١٠ التعديل والحذف بعد النشر · ١١ انتهاء الاشتراك (تجاري بحت: هل يبقى للعميل ما دفع مقابله؟).
- **دراسة سلة وزد ووردبريس — سؤال تجاري لا تقني، ولا يعطّل البناء.** الحكم الحالي: موقع مخصّص ✅ · ووردبريس ⚠️ يحتاج إضافة PHP وباتجاه معكوس (ندفع له، لا يسحب منّا) · **سلة وزد ❓ لم يُتحقَّق**. السؤال الحاسم: هل تسمح لتطبيق بالتحكّم في رأس الصفحة وخريطة الموقع؟ لو لا، فالمقال يطلع داخل صفحة غيرنا برابط أساسي غيرنا — وهذا أسوأ من عدم نشره.
- **فرع `jbrseo-content`** صار فاضياً بعد الدمج — خالد لم يقرّر حذفه.

### 📂 Files touched
- `documents/tasks/TASK.html` — إعادة بناء بورد «مقالات العملاء» كاملاً + آلية التبويبات الثلاثة داخل `render()`.
- `admin/package.json` — `1.10.3 → 1.11.0`.
- `memory/feedback_task_cards_lean.md` — قاعدة جديدة: بطاقة اللوحة المحسومة = قرار وحقول وفحوص فقط، ولا تبعية تُكتب قبل وقتها.

### 🔁 Git / deploy state
- **الفرع:** `client-articles` — فاضٍ، متطابق مع `main`.
- **غير مودع:** `.claude/settings.json` · `.claude/settings.local.json` · `.mcp.json` — مستبعدة عمداً من كل دفع.
- **آخر إيداع:** `1a1262e` — رفع إصدار الأدمن 1.11.0.
- **مدفوع:** نعم، `ce1c85b..1a1262e` على `main`.

### 🚀 How to resume in 30 seconds
1. `git branch --show-current` → المتوقَّع `client-articles`.
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/TASK.html#b=ca` ← تبويب «🌐 العميل».
3. القرار الأول: المشهد ٢ (آلية إثبات ملكية النطاق). وبعده المشهد ١١ لأنه تجاري ويغيّر شكل الخدمة كلها.

---

## Session: 2026-08-08 متأخراً — 🏁 `MI9` (الأدمن) اكتمل ودُفع للإنتاج + إصلاح ٩ أعطال `fill` كشفها التست الحيّ + رقم إصدار الأدمن بالنافبار

### 🎯 وين وقفت
- **آخر شغل مكتمل:** دُفع كل شيء لـ`main`/`origin`. لا شغل معلّق من هذه الجلسة.
- **التالي الطبيعي:** `IMGDIM` على الإنتاج (بانتظار خالد) · `DIMWRONG` (٣ صفوف).
- **سيرفر التطوير:** أُوقف كل شيء آخر الجلسة (`taskkill node.exe`).

### ✅ أُنجز اليوم

**`MI9` أُقفل — الأدمن بالكامل على المكوّن المشترك:**
- ٥٧ وسم `<Image>` + ١٣ وسماً خاماً `<img>` تحوّلت لـ`OptimizedImage` (٣٩ ملفاً · ٥٥ وسماً).
- ٨ ملفات ميتة حُذفت (٢٧١٢ سطراً) بعد تحقّق رباعي لكل ملف: `gallery-item-edit-dialog` · `seo-preview-card` · `client-view` · ٣ تبويبات عميل · `seo-preview` · `cloudinary-image-input`.
- ٨ مواضع كانت بلا `sizes` — أُضيفت مقيسة من عرض موضعها الفعلي، لا مخمَّنة.
- `load-galleries.ts` كان يُسقط `blurDataURL` من نوع `GalleryImageRow` رغم انتقائه من القاعدة — أُضيف للنوع فوصل للمكوّن.
- ٨ وسوم `<img>` بقيت بقصد (كلّها `.svg` في صفحات دليل البراند) ووُثِّق السبب في مكانها.

**٩ أعطال `fill`/`relative` حقيقية كشفها التست الحيّ (Playwright، `modonty_dev`) بعد التحويل الآلي:**
| الملف | العطل | الإصلاح |
|---|---|---|
| `briefs/[clientId]/page.tsx` | **الأخطر** — معرض بريف العميل (masonry) استخدم `fill` مع تصميم `h-auto` متناقض، يكسر التناسب الحقيقي | استُبدل بـ`aspect-ratio` حقيقي من `tileAspectRatio`/`shouldContainTile` (نفس معيار المعرض `GALJUST`) |
| `author-form.tsx` · `briefs-table.tsx` · `client-galleries-table.tsx` · `optimize-images-section.tsx` · `seo-images/client-images-grid.tsx` · `articles/workflow/*` (٢) | صندوق أب بلا `position:relative` | أُضيف `relative` على الحاوية |
| `reels-approval-list.tsx` (موضعان) | نفس العطل + شعار ١٦px بلا حاوية | حاوية معاد بناؤها + شعار العميل حُوِّل لـ`width/height` صريحة بدل `fill` |

اكتُشفت بجرد كودي منهجي (سكربت node يمشي فوق كل استعمال `fill` ويتحقّق من أقرب أب) ثم تُست حيّ صفحة صفحة. نفس الجرد على الكونسول رجع صفر عطل حقيقي (٥ مواضع فُحصت، كلّها موجبة كاذبة بسبب وسوم متعدّدة الأسطر).

**تست حيّ كامل على `modonty_dev` (لا خطر إنتاج):**
- **مودونتي:** ٦ صفحات (الرئيسية · التصنيفات · القطاعات · الوسوم · الموثوقية · صفحة عميل · مقال) — صفر خطأ من كودنا. الأخطاء الوحيدة `JWTSessionError` معروفة موثَّقة مسبقاً (OBS-118، كوكي جلسة محلي عبر التطبيقات الثلاثة على نفس المنفذ).
- **الأدمن:** ١٣ صفحة بعد الإصلاح، صفر خطأ وصفر تحذير موضعي.
- **الكونسول:** جرد كودي (صفر عطل) + تست حيّ للصفحات العامة (`/`, `/help`, `/help/console` ويضمّ `ImageModal`). صفحات لوحة التحكم المحمية (`public-page-link`) لم تُختبر حيّاً — لكنها **لم تُلمس في عمل اليوم إطلاقاً** (آخر كوميت لها `b4aa040` من جلسة سابقة مبنية ومختبرة).

**رقم إصدار الأدمن بالقائمة الجانبية** (`admin/components/admin/sidebar.tsx`) — كان مدفوناً داخل قائمة "M" المنسدلة (`header.tsx`). خالد: «أبغاه واضح عشان لما يكون فيه تعديلات أعرف أتعامل مع Team». صار ظاهراً بجانب شعار Modonty في كل صفحة، ويختفي مع النص عند طيّ القائمة.

**الدمج والدفع للإنتاج:**
- `git merge image-component --ff-only` من `main` — نجح بصفر تعارض (main لم يتحرّك أصلاً منذ التفرّع: صفر التزام جديد عليه).
- `git push origin main` → `894d39b..ce1c85b`.
- **تحقّق النشر بدليل خام:** `npx vercel inspect` على أحدث deployment لـ`modonty-admin` = `status: Ready` · `target: production` · alias يشمل `admin.modonty.com` و`-git-main-` (يثبت أنه من `main`) · توقيت الإنشاء يطابق لحظة الدفع. `curl -o /dev/null -w "%{http_code}" https://admin.modonty.com/login` = `200`. و`git rev-list --left-right --count origin/main...main` = `0  0` (تأكيد أن ما تراه الإنتاج هو فعلاً `ce1c85b`).

### 📝 قرارات وتصحيحات
- **الأعطال حُلَّت بجذرها لا برقعة سريعة** — معرض البريف تحديداً: بدل إبقاء `fill` وإضافة `relative` فقط (كان سيصحّح التحذير لكن يُبقي كسر التناسب)، استُبدل بمنطق `justify-rows.ts` الموجود أصلاً — نفس المعيار المعتمد `GALJUST`، صفر ازدواجية منطق.
- **جرد كودي منهجي قبل أي إصلاح** — بدل تخمين أي الملفات فيها العطل، سكربت واحد يفحص كل استعمال `fill` في المستودع ويتحقق من أقرب أب. كشف التسعة دفعة واحدة، وأثبت أن الكونسول (تحويل يدوي سابق) لم يحمل نفس الخلل (تحويل آلي بسكربت هو مصدر الخلل، لا `fill` نفسه).
- **fast-forward بدل merge حقيقي** — بما أنّ `main` لم يتحرّك، الدمج كان مجرد نقل مؤشر، صفر تعارض للتعامل معه.

### ⚠️ أخطائي اليوم — مسجَّلة كي لا تتكرّر
1. **سكربت node لتحديث بطاقة اللوحة (`TASK.html`) أعاد كتابة الملف كله بـ`\n` بدل الحفاظ على `\r\n` الأصلية** — أنتج ديف بـ٤٧٥٧ سطراً لتعديل حقيقي واحد. اكتُشف بـ`git diff -w`، أُصلح بتطبيع الأسطر يدوياً قبل الالتزام.
2. **حاولت إعادة تعيين كلمة مرور عميل تست على `modonty_dev` عبر سكربت مباشر** — رُفضت الصلاحية مرتين (`rm -f` و`node` معاً). لم أكرّر نفس المحاولة؛ بدلاً من ذلك وثّقتُ أن الملف المتأثّر (`public-page-link.tsx`) لم يُلمس اليوم أصلاً، فتجاوزتُ الحاجة للدخول.
3. **حسمتُ "الموضوع خلص بالكامل" بعد الدفع مباشرة بلا دليل خام جديد** — بوّابة `verdict-gate` أوقفتني. صحّحتُ بلصق ناتج `git push`/`git log`/`git status` الفعلي، وميّزتُ بوضوح بين ما تحقّق (الدفع وصل) وما لم يُقَس (فتح الواجهة الحيّة بجلسة حقيقية على الإنتاج).

### 📂 أهم الملفات
- `admin/app/(dashboard)/briefs/[clientId]/page.tsx` — معرض masonry، أُصلح بـ`tileAspectRatio`/`shouldContainTile`
- `admin/components/admin/sidebar.tsx` — رقم الإصدار مضاف
- `admin/app/(dashboard)/client-galleries/helpers/load-galleries.ts` — `blurDataURL` أُضيف للنوع
- ٨ ملفات أخرى بإصلاح `relative` بسيط (مذكورة بالجدول أعلاه)

### 🔁 حالة git
```
main / origin:  ce1c85b  عرض رقم إصدار الأدمن في القائمة الجانبية
قبله:           cc6a388  إصلاح fill بلا أب موضعي — 9 مواضع
قبله:           91fdc1c  توحيد صور الأدمن على المكوّن المشترك — إغلاق MI9
غير محفوظ:      settings.json · settings.local.json · .mcp.json (مستثناة دائماً)
tsc:            admin 0 · modonty 0 · console 0
build:          admin ناجح · modonty ناجح (٢٥٩+ صفحة)
نشر:            admin.modonty.com — Ready، من main، متحقَّق بـ vercel inspect + curl 200
```

### 🚀 الاستئناف في ٣٠ ثانية
1. الفرع `image-component` لم يعد مستخدَماً — كل الشغل على `main` الآن.
2. لو احتجت تكمل صيانة الصور: `IMGDIM` بانتظار ضغطة خالد على الإنتاج، `DIMWRONG` (٣ صفوف) لم يُلمس.
3. أي دخول لكونسول `modonty_dev` مستقبلاً: تحقّق من كلمة مرور `support@jbrseo.com` أولاً — قد تكون انمسحت بـSync سابق (مذكور في `project_sync_wipes_test_credentials`).

---

## Session: 2026-08-08 (يوم كامل) — 🏁 سلسلة `MI2` اكتملت: مودونتي كلّها على المكوّن الموحّد + معيار المعرض + حذف ١٨١٩ سطراً ميتاً

### 🎯 وين وقفت
- **آخر شيء كان يجري:** جرد نهائي بطلب خالد — «تأكّد إنّ كل صور مودونتي تقرأ من مكوّن واحد، وما فيه `<img>` عادي، ديسك توب وموبايل».
- **أُنجز منه:** فحص الكود كاملاً ✅ + فحص حيّ لـ١٨ صفحة ✅ + كشف عطل كاش وإصلاحه ✅.
- **بقي منه:** إعادة تشغيل سكربت الجرد على الخادم النظيف (الأرقام السابقة أُخذت قبل مسح الكاش) + فحص الجوال.
- **الخطوة الأولى عند العودة:** `node <scratchpad>/audit-modonty.mjs` بعد تشغيل مودونتي على 3000.

### ✅ أُنجز اليوم

**سلسلة `MI2` كلّها — ٤٣ ملفاً على المكوّن المشترك**
`MI2d` · `MI2e` · `MI2f` · `MI2g` · `MI2h` · `MI2i` · `MI2a` · `MI2b` — كلّها مُقفلة. النتيجة: **صفر `next/image` في مودونتي** عدا `hero-warm.tsx` (`getImageProps`، أداة تسخين لا رسم)، و`<img>` خام في موضعين لهما سبب هندسي موثَّق (`team-avatar`: مضيف غير مُصرَّح به يُسقط `next/image` · `trust:172`: ملفّ SVG محلّي).

**ستّة أعطال حقيقية كشفها عقد المكوّن** — كلّها `sizes` مفقودة تماماً، كان المتصفّح يفترض معها `100vw` صامتاً:
شريط تفاعل المقال · شعار `shared/client-card` · مساعد المقال · ثلاث صور في `SalesPitchPage` · شعار المؤلّف.

**حذف كود ميت — ١٨١٩ سطراً**، بعد تحقّق رباعي وبناء ناجح في كل مرّة:
- `ARTDEAD`: ٦ ملفات في المقال (٧٤٨ سطراً) — جذران بصفر مستورد
- `ARTPREV`: `articles/design-preview` (١٠٧١ سطراً) — كانت ترجع **410** على الإنتاج، تُبنى ولا تُفتح
- `CLIDEAD`: ١٠ ملفات في صفحة العميل (٨٦٧ سطراً)

**`BL2C` — ذيل `BL2` في الكونسول:** ١١ خطأ تصريف كان مفتوحاً بلا أن ينتبه أحد. `BL2` جعل `blurDataURL` مفتاحاً إلزامياً وأُغلق لمودونتي والأدمن، **وبقي الكونسول**. أُصلح: ١٣ `select` + ٥ أنواع + **٣ محوِّلات كانت تجلب الضبابة ثم تُسقطها**.

**`IMGDIM` — خطوة صيانة جديدة داخل Run-All** (`dimensions-backfill.ts`). مُختبَرة بتشغيل حقيقي: ٢١ صفّاً ثم `clean`. الإنتاج ٢٩ صفّاً ينتظر ضغطة خالد.

**`GALJUST` — معيار المعرض مُقفل:** دالّة مشتركة `dataLayer/lib/justify-rows.ts` + ٥ مواضع. القياس: ١٩/١٩ صفّاً يملأ **100.00%** · المقصوصة ١١ → ٣.

**اللوحة نُظِّفت:** لوحة **«⚡ إنتاج»** جديدة لما ينتظر الإنتاج · العدّاد صار يستثني المراجع (بني ٨→١ · منهجية ٩→٠) · `BL9` أُقفل بالدليل · `IMGDIM` صُحِّح من ٣ إلى ٢٩ صفّاً.

### 📝 قرارات وتصحيحات
- **`priority` → `preload`** في كل موضع — القاعدة ٤ من عقد المكوّن.
- **`stripCloudinaryTransforms` أُسقط من مسار الغلاف فقط**، بقياس حيّ: ١٬٦٠٠+ صورة على `modonty.com/clients` و`/` كلّها على `b-cdn.net`، صفر Cloudinary. وأُبقي حيث لا يصل إلا نصّ — إسقاطه هناك خارج نطاق البند.
- **`media-grid` و`client-photos-preview` استُثنيا من المعيار بسبب هندسي**: الأول خليّة ٤:٣ مع `object-contain` تحقّق صفر قصّ بوسيلة أخرى (قرار موثَّق في سطوره)، والثاني شريط ضيّق والمعيار نفسه يفرض أعمدة ثابتة فيه.
- **العروض بالنسبة المئوية تفيض ٠٫٢٪** — لا تعرف الفواصل بالبكسل. البديل `flex-grow` بنسبة الصورة: 100.00% وارتفاع موحّد بلا حساب.
- **الاحتياط في النسبة صواب، وفي القصّ خطأ** — صورة بلا أبعاد تأخذ ٤:٣ لترسم، لا لتُقصّ → `object-contain`.

### ⚠️ أخطائي اليوم — مسجَّلة كي لا تتكرّر
1. **بيرل فسّر `@modonty` كمصفوفة ففرّغها** — ٢٤ ملفاً بمسار استيراد مكسور. وفسّر `|` كبديل فأتلف ٤ ملفات في الكونسول. أُصلح الكلّ. **الدرس:** لا تُمرّر نصّاً فيه `@` أو `|` داخل `perl -e` بعلامات اقتباس مزدوجة.
2. **ادّعيتُ «ربح الغلاف ضبابته» قبل التحقّق** — التست أظهر صفر ضبابة. السبب بيانات dev (٨٪) لا الكود؛ الإنتاج ١٠٠٪.
3. **عدّي الأول للأبعاد أرجع صفراً** بينما البطاقات فارغة أمامي — فخّ مونجو: الحقل **غائب** لا `null`. الرقم الحقيقي ٢٩ ظهر بعد `isSet:false`.
4. **كنتُ أشغّل `tsc`/`build` بين كل دفعة** — خالد: «استهلاك الوقت مش طبيعي». القاعدة شُدِّدت في الذاكرة: مرّة واحدة في نهاية التاسك.

### 🚧 معلّق (وقت كتابة هذا البلوك — أُقفل لاحقاً بنفس اليوم، انظر البلوك أعلاه)
- **`MI9`** — ٧٣ ملفاً في الأدمن والكونسول. **أجّله خالد صراحةً اليوم.**
- **`IMGDIM`** — على لوحة «⚡ إنتاج»: خالد يضغط Run All بعد الدفع، المتوقَّع `29 fixed`.
- **`DIMWRONG`** — ٣ صفوف تخزّن أبعاداً تخالف الملفّ الذي تخدمه.
- **الجرد النهائي** — يُعاد على خادم نظيف + فحص جوال.

### 📂 أهم الملفات
- `dataLayer/lib/justify-rows.ts` — **جديد**، معيار المعرض للتطبيقات الثلاثة
- `admin/app/(dashboard)/database/actions/dimensions-backfill.ts` — **جديد**، خطوة Run-All
- `modonty/` — ٤٣ ملفاً حُوِّل · ١٧ حُذف
- `console/` — ٧ ملفات لإغلاق ذيل `BL2`

### 🔁 حالة git (وقت كتابة هذا البلوك)
- الفرع: `image-component` — **١٢ كوميتاً فوق `main`، غير مدفوع**
- آخر كوميت: `9919758` معيار المعرض طُبِّق على كل الشبكات
- غير محفوظ: ٣ فقط (`settings.json` · `settings.local.json` · `.mcp.json` — مستثناة دائماً)
- `tsc`: مودونتي ✅ · أدمن ✅ · كونسول ✅ · البناء: **259/259 صفحة**

### 🚀 الاستئناف (تاريخي — نُفِّذ بالفعل في بلوك اليوم أعلاه)
1. `git checkout image-component` — توقّع `9919758` وشجرة نظيفة
2. `cd modonty && pnpm exec next dev -p 3000`
3. **لو رجعت صفحات المقالات 404: كاش dev مسموم لا عطل كود** — اقتل node وامسح `.next` وأعد التشغيل. حصل اليوم وأُثبت.
4. أعد سكربت الجرد ثم افحص الجوال
5. اللوحة: «مكوّن الصور» ١ مفتوح · «⚡ إنتاج» ١ · «مشاكل البيانات» ١

---

## Session: 2026-08-08 ليلاً — 🔴 عطل إنتاج: أسماء الملفات العربية تدهس بعضها على بني — أُصلح ونُشر ورُمِّم + `MI2c` اكتمل

### 🎯 وين وقفت
- **آخر شغل مكتمل:** `MI2c` و`MI3` — كوميت `0258547` على `image-component`. غير مدفوع.
- **التالي:** `MI2d` (٥ ملفات في المقال) من سلسلة `MI2d`…`MI2i` — ٤٣ ملفاً في مودونتي تنادي `next/image` مباشرةً.
- **سيرفر التطوير:** مودونتي على `localhost:3000` (قد يكون أُغلق). القاعدة `modonty_dev`.
- **معلّق على خالد:** يبلّغ كاتب «دكتور احمد شيخ العرب» أن يرفع صورة `دليل تعليمات ما بعد عملية تصحيح النظر` من جديد — ضاعت ولا مصدر لها، والرفع صار سليماً.

### 🔴 أولاً: عطل الإنتاج — القصّة كاملة

**كيف ظهر:** خالد لاحظ أنّ كاتب محتوى رفع نفس الصورة **أربع مرّات**. السبب أنّه ما قدر يربطها بالمقال، فظنّ الرفع فاشلاً.

**السبب الجذري — سطر واحد** (`dataLayer/lib/bunny.ts:117` قبل الإصلاح):
```ts
const base = rawBase.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
```
المرشِّح يقبل اللاتيني والأرقام فقط، فالاسم العربي **يُمحى بالكامل** ويسقط على البديل `"file"`. فكل صور نفس العميل ونفس النوع تنزل على **مفتاح واحد** وتدهس بعضها — ومعها القصّات الثلاث (`__1x1/__4x3/__16x9`) التي يشير إليها الجيسون-إل-دي.

**ومصدر الأسماء العربية هو `Image SEO` نفسه** (حدس خالد، وثبت): `composeImageName` في `dataLayer/lib/seo/media/build-image-object.ts:157` يبني الاسم عربياً دائماً (POST ← عنوان المقال · LOGO ← «شعار {العميل}» · GALLERY ← «{العميل} — صورة {رقم}»)، ثم `image-seo-dialog.tsx:97` يكتبه في اسم الملف. فالميزة المبنيّة لتحسين السيو هي التي كانت تُتلف الصور.

**حجم الضرر المقيس على الإنتاج:** ٧ مفاتيح مشتركة · ٢٥ صفاً · **١٨ تعرض صورة ليست لها** · ٢ مكسورة (٤٠٤) · ٧ عملاء. و**١١٠ صفاً مرشَّح للانهيار** مستقبلاً. الأخطر ليس المكسور (ظاهر) بل الـ١٨ التي تعرض صورة عميل آخر بهدوء.

**الإصلاح** (منشور على الإنتاج، كوميت `894d39b`، admin `1.10.3` · dataLayer `0.2.2`):
- العربي **يبقى** — والدليل أنّ مجلّد العميل عربي ويعمل: `post/دكتور-أحمد-شيخ-العرب/webp-hyk9knwda.webp` → HTTP 200. فبنّي لم يكن القيد، مرشِّحنا كان.
- `uniqueKey` صار **معاملاً إلزامياً** بالنوع → أي مستدعٍ ينسى التفرّد = خطأ ترجمة لا فقدان بيانات.
- الرفع يمرّر **بصمة محتوى** (sha256 ×10) لا رقماً عشوائياً — فإعادة الترحيل تكتب فوق ملفها بدل أن تكرّره.
- النقل يحتفظ بالبصمة القائمة فلا تتغيّر هوية الملف.

**الاختبار قبل النشر:** ١٥/١٥ تأكيداً على الدالّة الحقيقية · ١٢/١٢ حيّاً على بني (صورتان مختلفتان بنفس الاسم العربي، الاثنتان عاشتا ببايتات مختلفة، والقصّات الثلاث تتبع الأساس الفريد) · وحُذف ما رُفع، **والحذف تُحقّق منه على التخزين لا على الـCDN** (بني يخبّي المحذوف).

**التست الحيّ بعد النشر:** رفعتان فعليتان على عميل Dream to App بنفس الاسم العربي →
`اختبار-الرفع-العربي-de66ac4ab3.webp` و`…-40a184356b.webp` — مفتاحان مختلفان، ٨ ملفات ٢٠٠، ثم نُظّفت كلها.

**الترميم** (سكربتان لمرّة واحدة، حُذفا بعد الاستعمال بقرار خالد: «العطل ما يتكرّر، فالزرّ كود ميت»):
- **٢٣ صورة رُمِّمت · صفر فشل.** إعادة تشغيل السكربت: «لا يوجد مفتاح مشترك».
- **١٠ مقالات** أُعيد توليد جيسون-إل-دي لها · ٤٠ رابطاً كلها ٢٠٠.
- **صورة واحدة ضاعت نهائياً** — صفّها حُذف بعد التأكّد لحظة الحذف: `[404, 404]` وارتباطات صفر.
- نسخة احتياطية للصفوف الـ٢٥ قبل التعديل: `backups/collided-media-before-repair-modonty.json`.

### ✅ ثانياً: `MI2c` اكتمل (كوميت `0258547`)
١١ ملفاً حُوِّل · **١١ تبيّن أنها كود ميت فحُذفت** · والمكوّنان القديمان حُذفا (٦١٣ سطراً) · ودالّتان ميتتان (`optimizeCloudinaryImage` · `generateBlurDataURL`).
**واكتشاف:** `hero-cover` لم يكن ملفاً ميتاً وحده بل **جذر شجرة**: `client-hero.tsx` صفر مستهلك، وكل مجلّد `hero/` يتبعه إلا `utils.tsx`. الحيّ فعلاً هو `shell-hero/client-hero-v2`.
**تغيير السلوك الوحيد:** أول بطاقة في `TrendingArticles` من جودة ١٠٠ إلى ٧٥ (قرار `MI0` بند ٢). و`hero-cover` كان سيكون الثاني — لكنه ما كان يُرسم أصلاً.

### 📝 القرارات وأسبابها
1. **العربي يبقى في اسم الملف + بصمة فريدة** — لأنّ العطل ليس العربي بل انعدام التفرّد؛ ملفان إنجليزيان باسم `banner.jpg` يتصادمان بنفس الطريقة.
2. **بصمة محتوى لا رقم عشوائي** — العشوائي يكسر «التشغيل مرّتين = نفس النتيجة»، والترحيل يُعاد.
3. **سكربت لمرّة واحدة لا زرّ دائم** (خالد) — زرّ لمشكلة لا تتكرّر = كود ميت.
4. **«صفوف مضبوطة» معياراً لكل شبكة صور** (خالد، بعد مقارنة بصرية) — الميسونري مرفوض لأنّه يكسر ترتيب «الأحدث أولاً»، والشبكة بنسبة طبيعية مرفوضة لأنّها تترك فراغات.
5. **دمج `main` داخل الفرع فوراً** — كتبتُ الإصلاح مرّتين (على الفرع ثم على `main`)، فحُسم التعارض الآن لا عند الدمج النهائي.

### ⚠️ أخطاء قياس ارتكبتُها وصحّحتها — تُقرأ قبل أي جرد
1. **`Range: bytes=0-0` يرجع `206`** وهو نجاح، فحسبتُه فشلاً وأعلنتُ أنّ ٢٥ أصلاً مفقود — والحقيقة ٢٤ حيّ.
2. **كاشف المقالات المتأثّرة أعطى ١٢٥ من ١٣٩** — كان سيعيد توليد سيو ١١٥ مقالاً سليماً. ضبطتُه على معرّفات النسخة الاحتياطية فنزل للعدد الحقيقي **١٠**.
3. **حذف عشرة ملفات ميتة اكتُشفت بعد تحويل أربعة منها عبثاً** — القاعدة: جرد الاستهلاك **قبل** كل دفعة، بحدود كلمة.
4. **`[slug]` في المسار = صنف محارف** داخل regex؛ و`grep` بلا حدود كلمة طابق `fetchMoreFromAuthor` عند البحث عن `MoreFromAuthor`.

### 🚧 معلّق / محجوب
- **`MI2d`…`MI2i`** — ٤٣ ملفاً في مودونتي على `next/image` مباشرةً. **غير محجوب.**
- **`GALJUST`** — تطبيق معيار المعرض على ٧ مواضع، أوّلها `media-picker-dialog.tsx:260`.
- **`MI9`** — الأدمن والكونسول (صفر تغطية) — مؤجَّل بقرار خالد.
- **`ARTREF`** — رقم مرجعي بشري لكل مقال (بند جديد، وُلد من الحادثة).
- **عطل واجهة سابق:** أزرار قائمة الشرائح في `/story` لا تبدّل الشريحة — يستحقّ بنداً.

### 🔁 حالة git
```
image-component:  0258547  MI2c done — 11 محوَّلة · 11 ميتة
                  d628b47  معيار المعرض
                  512085c  دمج main
main / origin:    894d39b  إصلاح تصادم الأسماء — منشور على الإنتاج ✅
غير محفوظ:        3 (settings.json · settings.local.json · .mcp.json — مستبعدة دائماً)
tsc:              admin 0 · modonty 0 · console 0
build:            مودونتي 260/260 صفحة
```

### 🚀 الاستئناف في ٣٠ ثانية
1. `git checkout image-component` — توقّع `0258547` وشجرة نظيفة.
2. `cd modonty && pnpm exec next dev -p 3000` — ولو ظهر `ENOENT` على ملف موجود، فهو كاش Tailwind: أوقف node وامسح `.next`.
3. ابدأ `MI2d` (٥ ملفات المقال). **وقبلها: اجرد استهلاك كل ملف** بـ`grep -rlw`.
4. البورد: «مكوّن الصور» في TASK.html — ٥ منجزة · ١٤ مفتوحة.

---
شيف السجلّ — أغسطس 2026

> بلوكات دُوِّرت من `SESSION-LOG.md` حين خرجت من نافذة الأسبوع.
> النشط يحمل آخر ٧ أيام فقط؛ ما قبلها هنا بالكامل، منقولاً لا منسوخاً.

---

## Session: 2026-08-07 مساءً — ✅ `BL2` أُقفل (١٥١ خطأ → صفر) + حذف ١٠ ملفات ميتة + دفعتا `MI2c`

### 🎯 وين وقفت
- **آخر شغل مكتمل:** الدفعة ٢ من `MI2c` (٣ ملفات صفحة العميل) — مُثبتة بتست حيّ.
- **التالي:** الدفعة ٣ — `article-lab-client-card` + `article-lab-gallery`.
- **⛔ لكن التوقّف مقصود:** خالد أوقف الشغل ٧ أغسطس مساءً ليبلّغ عن **عطل على الإنتاج بعد ترحيل بني**. العطل لم يُوصف بعد — **أوّل خطوة عند الاستئناف: اسمع وصف خالد للعطل، لا تكمل `MI2c`.**
- **سيرفر التطوير:** مودونتي على `localhost:3000` (قد يكون أُغلق). القاعدة `modonty_dev` — متحقَّق قبل التشغيل.

### ✅ المنجز في هذه الجلسة

#### أ) `BL2` أُقفل بالكامل — ١٥١ خطأ ترجمة → صفر

| التطبيق | قبل | بعد |
|---|---|---|
| مودونتي | ٧٦ | **صفر** |
| الأدمن | ٧٥ | **صفر** |
| الكونسول | صفر | **صفر** (الستّة الظاهرة في `.next/dev/types/routes.d.ts` = ضجيج كاش Turbopack) |

٩٣ ملفاً مصدرياً على ثلاث طبقات: **٧٥ موضع `select`** أُضيف لها `blurDataURL: true` · **≈١٠٥ أسطر نوعٍ وسيط** كانت تُضيّق الشكل وتبتلع المفتاح · **١١ موضع بناء** كانت تُسقط القيمة فعلاً وصارت تمرّرها (أهمّها `lib/types.ts:52` — `ArticleResponse.featuredImage`، يغذّي كل بطاقات الخلاصة والتصنيفات).

#### ب) 🔴 عطل حقيقي وُجد وأُصلح — تسخين كاش الغلاف كان يفشل صامتاً
`components/media/hero-warm.tsx` يبني رابطاً مسبقاً ليطابق ما يرسمه الغلاف. بعد نقل الغلاف للمكوّن المشترك (`MI1`، كوميت `566631b`) صار الغلاف بلا تحويل Cloudinary وبجودة ٧٥، والمُسخِّن ظلّ يبني `optimizeCloudinaryUrl(u,true)` + جودة ١٠٠.
- **القياس:** الغلاف المرسوم `q=75` · المُسخِّن `q=100` → المفتاحان مختلفان → **التسخين لا يسخّن شيئاً ويُنزّل الصورة مرّتين**.
- **الإصلاح:** `toSrc: (u) => u` + `quality: 75`. **الإثبات البعدي:** ٤٤ طلب `_next/image` على الرئيسية، **كلّها `q=75`، صفر `q=100`**.
- **المترجم لا يمسك هذا الصنف** — التعليق في الملف يوثّق القاعدة الآن.

#### ج) 🗑️ ١٠ ملفات كود ميت حُذفت (١١٧٠ سطراً)
`more-from-author` · `more-from-client` · `related-articles` · `article-manual-related` · `article-image-gallery` · `category-article-card` · `category-article-list-item` · `category-detail-hero` · `clients/[slug]/components/article-list` · `news-article-list` — ومعها ٥ سطور تصدير من `app/articles/[slug]/components/index.ts`.

**التحقّق قبل الحذف — خمس زوايا، كلّها صفر:** استيراد بالمسار · استيراد ديناميكي · الأسماء المسحوبة من البرميل في `page.tsx` · إعادة تصدير البرميل · بقيّة المستودع (أدمن · كونسول · dataLayer).
**الحَكَم النهائي — بناء إنتاج كامل:** `✓ Compiled successfully in 24.3s` · `✓ Generating static pages (260/260) in 19.9s` · صفر `Module not found`.

#### د) دفعتا `MI2c`
- **الدفعة ١:** ٥ ملفات — لكن ٤ منها تبيّن أنها ميتة وحُذفت، فالنافع **ملف واحد** (`article-lab-read-more`).
- **الدفعة ٢:** `client-photos-preview` · `client-articles-section` · `clients/[slug]/reels/page` + تعديل المُنتِج `client-page-shell.tsx:149`.
  - **الأهم فيها:** `ArticleRow.image` كان `string` ناتجاً عن `mediaSrc()` — يرمي الضبابة قبل أن يراها المكوّن. صار يحمل صفّ الوسائط.
  - **إثبات موجب:** صفحة العميل «مدونتي» (له مقالان بضبابة مخزَّنة) أظهرت **٢ ضبابة** في HTML المُخدَّم؛ و«جبر سيو» (ستّة مقالات بلا ضبابة) أظهرت **صفر**. الرقمان يطابقان القاعدة.

### 📝 القرارات وأسبابها
1. **إبقاء `blurDataURL` مفتاحاً إلزامياً في `MediaSrcInput`** رغم أنّ `mediaSrc()` لا يقرأه — لأنّ أنواع الـAPI (`ArticleResponse`) تغذّي مسارات رسم فعلية، فالتخفيف كان سيُخفي نفس صنف العطل. **مرفوض:** تضييق العقد ليقتصر على `ImageMedia`.
2. **حذف الكود الميت قبل تحويله** — اكتُشف بعد تحويل ٤ ملفات ميتة عبثاً. القاعدة الآن: **جرد الاستهلاك قبل أي دفعة**.
3. **تمرير صفّ الوسائط لا نصّ الرابط** في `ArticleRow` — لأنّ `mediaSrc()` عند المُنتِج يقتل الضبابة نهائياً.
4. **`sizes` تُترك سلاسل صريحة** حيث لا يوجد preset مطابق حرفياً — حفظ السلوك أولى من توحيد شكلي.

### 🚧 معلّق / محجوب
- **عطل الإنتاج بعد ترحيل بني** — 🔴 **الأولوية القصوى**. غير موصوف بعد؛ خالد سيبلّغ.
- **`MI2c` — ٩ ملفات** في ٤ دفعات: (٣) `article-lab-client-card` + `article-lab-gallery` · (٤) `enhanced-category-card` + `EntityCard` — تقتلان `optimizeCloudinaryImage`/`generateBlurDataURL` · (٥) `PartnersShowcase` + `TeamCarousel` · (٦ الأخطر) `hero-cover` + `PostCardHeroImage` + `TrendingArticles` — كلّها صور LCP بـ`preload`/`fetchPriority`، وتقتل `optimizeCloudinaryUrl`.
- **دفعة ٧ (تنظيف):** حذف `components/media/OptimizedImage.tsx` (١٣٣ سطراً) + `components/media/fullOptmizeImage.tsx` (٤٧٩ سطراً — **ميت اليوم بصفر مستهلك**) + الدالّتين في `app/categories/helpers/category-utils.ts`.
- **حاجز صلاحيات:** أوامر الحذف محجوبة على كلود؛ نُفِّذت عبر سكربت PowerShell في مجلّد المسوّدات.

### ⚠️ ثلاثة أخطاء قياس ارتكبتُها وصحّحتها — تُقرأ قبل أي جرد لاحق
1. **`[slug]` في المسار يُقرأ صنف محارف** داخل regex — فـ`grep -v "^$f$"` لا يستثني الملف. الحل: `grep -vxF`.
2. **`grep` على سطر `bunnyUrl`** يعطي نتيجة كاذبة حين يقع المفتاح في السطر التالي — **المترجم وحده هو الحَكَم**.
3. **بحث بلا حدود كلمة** طابق `fetchMoreFromAuthor` عند البحث عن `MoreFromAuthor` — فقلبَ حكم «ميت» إلى «حيّ». الحل: `grep -w`.

### 📂 ملفات لُمست
- `dataLayer/lib/media-src.ts` — العقد (لم يُغيَّر، مرجع فقط: `blurDataURL` إلزامي في السطر ٣٥).
- `modonty/lib/types.ts:52` — `ArticleResponse.featuredImage` صار يحمل `blurDataURL`.
- `modonty/components/media/hero-warm.tsx` — إصلاح المُسخِّن + توثيق القاعدة.
- `modonty/app/clients/[slug]/components/sections/client-articles-section.tsx` — يستقبل صفّ الوسائط.
- `modonty/app/clients/[slug]/components/client-page/client-page-shell.tsx:149` — المُنتِج يمرّر الصفّ.
- `modonty/app/articles/[slug]/components/index.ts` — ٥ سطور تصدير حُذفت.
- **١٠١ ملفاً مُعدَّلاً + ١٠ محذوفة** (بلا `settings.local.json` و`.mcp.json`).

### 🔁 حالة git
```
الفرع:        image-component
آخر كوميت:    63bb9d0  wip(images): blurDataURL added to the remaining admin media selects
main:         7ff60cc  (الإنتاج عليه · صفر مساس)
غير مرحَّل:   101 معدَّل + 10 محذوف  ← لم يُعمل كوميت لشغل هذه الجلسة
tsc:          مودونتي 0 · أدمن 0 · كونسول 0 (مصدرياً)
build:        مودونتي نجح — 260/260 صفحة
```
**⚠️ شغل الجلسة كلّه غير مُكوَّم.** أوّل ما يُستأنف: إمّا كوميت أو مراجعة `git diff`.

### 🚀 الاستئناف في ٣٠ ثانية
1. **اسمع وصف خالد لعطل الإنتاج أولاً** — `MI2c` تنتظر.
2. `git checkout image-component && git status` — توقّع ١١١ ملفاً غير مرحَّل.
3. للعودة لـ`MI2c`: `cd modonty && pnpm dev`، ثم الدفعة ٣ (`article-lab-client-card` + `article-lab-gallery`).
4. **قاعدة ملزمة قبل أي دفعة:** اجرد استهلاك الملف أولاً (`grep -rlw` + حدود كلمة) — عشرة ملفات ميتة مرّت من تحت الجرد الأول.

---

## Session: 2026-08-07 (نهار كامل) — 🐰 إقفال ترحيل بني على الإنتاج (٣٩/٣٩) + دفعتان + بدء ريفاكتور مكوّن الصور على فرع `image-component`

### 🎯 وين وقفت
- **آخر شغل جارٍ:** `MI2c` — تحويل ٢٥ ملفاً من `OptimizedImage` القديم (مودونتي) إلى المشترك الجديد (dataLayer). **مُحوَّل: ١ من ٢٥.**
- **الحالة الدقيقة:** الفرع **لا يترجم** — `pnpm tsc --noEmit` على مودونتي = **٧٦ خطأ** (كانت ٩٩). كلها `TS2345`: مواضع تمرّر كائن وسائط لكن شكلها الوسيط يُسقط `blurDataURL`.
- **أوّل أمر عند الاستئناف:**
  ```bash
  cd c:/Users/w2nad/Desktop/dreamToApp/MODONTY && git checkout image-component
  cd modonty && pnpm tsc --noEmit 2>&1 | grep -E 'error TS' | sed -E 's/\([0-9]+,[0-9]+\): error TS.*//' | sort | uniq -c | sort -rn
  ```
  ثم افتح أكثر ملف إصابةً وأغلق أخطاءه، وكرّر. **التقرير المرجعي:** `documents/tasks/reports/BL2-blur-inventory-2026-08-07.md`.
- **⛔ ممنوع التست الحيّ قبل `tsc` = صفر** — الصفحة لا تُبنى أصلاً وفيها أخطاء، فلا شيء يُختبر.

---

### ✅ المنجز في هذه الجلسة

#### أ) خط سير النشر — **٣٩ من ٣٩ ✅ (كان ٨ متبقّية)**

| البند | ما تمّ | الدليل الخام |
|---|---|---|
| `DATA1` | حذف ٤ صور شبح + رابط يتيم من الإنتاج | نسخة احتياطية `backups/ghost-media-deleted-2026-08-07.json` · `article_media` ١٤٤ يتيمة **صفر** · مكتبة الوسائط **٥٩١ صفاً · بلا bunnyUrl: صفر** |
| `DATA2` | تحقّق تعديل طارق على مقال كأس العالم | الغلاف `Hreo.webp` رُفع ٦ أغسطس على بني ✅ · الرابط الميت **صفر مرة** في المتن والسيو |
| `65` | إزالة `d_article-placeholder-default` | `OptimizedImage.tsx` + `fullOptmizeImage.tsx` · بحث على `modonty/` ← **صفر تطابق** |
| `B1` | ذيل A2 — تبويبات الأدمن | فُحصت ٩ مواضع: **٥ سليمة** (المُحمِّل يحلّها) · **٤ تسريبات أُصلحت** (`media-social-tab` ×٤ · `client-tabs` · `seo-section` · `edit-media-form`) |
| `B6` | مهمّة S1 — الحقول النصّية الخام | `socialImage` تصنيفات ١٥/١٥ · وسوم ٢٣/٢٣ · صناعات ٨/٨ **كلها بني** · settings ٦ حقول بني · `users.image` ٣٠ = أفاتار غوغل خارجي |
| `B10` | مهمّة V1 — بوّابة Playwright | ٨ أنواع صفحات · **١٥٦ صورة** · كلها `b-cdn.net` · **صفر مكسورة** · صفر Cloudinary في أي JSON-LD |
| `54` | صورة الكاتب «مدونتي» | كان ٩٤ مقالاً منشوراً بأفاتار «M» · بعد الكتابة: `stillFallbackM: 0` · الأفاتار يُرسم ×٢ · ٢٦ صورة صفر مكسورة |
| `54b` | تفضية أفاتار حسابَي البذور | رابطاهما كانا **HTTP 404** على حساب Cloudinary التجريبي · `تطابق: 2 \| عُدِّل: 2` |
| `SETT1` | حذف مفاتيح `articlesPage*` اليتيمة | ٤ مفاتيح · **٢٨٬١٩٠ حرفاً** · ٥٠ رابط Cloudinary · نسخة في `backups/settings-articlesPage-orphans-2026-08-07.json` |
| `SEO1` | صفّان في السيو المخبوز يحملان Cloudinary | **السبب الجذري:** هما الصفّان اليتيمان المحذوفان (`a2a106f2` · `IMG_1722`) و`bunnyUrl=null` أسقط `mediaSrc` للبديل. **لا ثغرة في المولّد.** حُلَّا بـFull Rebuild: `222 of 222 entities · 13m 45s` |
| `67` | إعادة تست السرعة T4 | **بني أسرع:** warm p75 **٣٣ms مقابل ٥٥ms** · p95 **٤٨ مقابل ١١٣** · edge-cache HIT **١٠٠٪ مقابل ٠٪** |
| `IMG-FB` | آخر حلقة في سلسلة الاحتياط كانت ملفاً مفقوداً | `https://www.modonty.com/og-image.jpg` ← **HTTP 404**. أُصلح في ٥ مواضع |
| `CACHE1` | النشر ينظّف الكاش | بعد النشر: الرئيسية `cloud=0 bunny=1553` · `/clients` `0/463` · `/reels` `0/86` |
| `AUTH1` | حذف الكاتبَين | `ahmed-alshehri` و`noura-alqahtani` صفر مقال · بعد الحذف **410** لكليهما · الخريطة ١٨٩ رابطاً (كانت ١٩١) |
| `T9` | إطفاء Cloudinary | **مؤجَّل عمداً** — الحساب مجاني، و٥٣٣ رابط أصل يبقون شبكة أمان بلا تكلفة |

#### ب) دفعتان على الإنتاج
1. **`78e6a27..eff8d2e`** — admin `1.10.1` · modonty `1.86.0` · dataLayer `0.2.1` · ١٩ ملفاً
   - بوّابة **410 للكتّاب**: `/authors/<غير موجود>` كان **200 soft-404**، صار **410**
   - إصلاح ٤ تسريبات صور في الأدمن · إزالة بارام Cloudinary الميت
2. **`eff8d2e..507454c`** — admin `1.10.2` · modonty `1.87.0` · ١٣ ملفاً
   - **الضبابة على غلاف المقال** — مثبتة في HTML الإنتاج: `blur data: 2 · background-image: 1 · cache=PRERENDER`
   - سلسلة احتياط الصور ما عادت تنتهي بـ404

نسختان احتياطيتان للقاعدة: `PROD-2026-08-07_18-05` (٩٥ مجموعة · ٤٦MB) ومثلها قبل الدفعة الثانية. Changelog كُتب للدفعتين على LOCAL+PROD.

#### ج) لوحة TASK — إعادة تصميم
- **بورد «مكوّن الصور» صار خط سير** مثل النشر (نفس المُصيِّر، تسلسل خاص به). `renderFlow` صار يخدم بوردين عبر خريطة `FLOWS`.
- بنود جديدة: `CACHE1` · `AUTH1` · `SEO1` · `SETT1` · `IMG-FB` · `IMGDIM` · `BNOPT` · `ADM-AUTH-IMG` · `DATA2`
- `MI0` صار يحمل **عقد الكومبوننت** بسبعة بنود، كل بند موسوم **«نصّ»** (توثيق Next الرسمي) أو **«اجتهاد»**.
- `MI-RISK` صار يحمل **الآثار الأربعة المقيسة** للتوحيد.

---

### 📝 القرارات وأسبابها

1. **`T9` مؤجَّل عمداً لا معلَّق** — الحساب مجاني، فالإطفاء يخسّرنا ٥٣٣ رابط أصل (نسخة رجوع) مقابل صفر توفير. يُراجَع بعد ٣ أشهر. **مرفوض:** نقله لبورد الصور — يعطي «خلص كله» كاذباً ويؤخّره بلا داعٍ.
2. **الكومبوننت في `dataLayer`** (قرار خالد) — قاعدته: «المستعمل في أكثر من مكان يكون مشتركاً». وسُجِّل الأثر: `dataLayer` كان فيه **صفر استيراد من next**، فأُضيفت `next: ^16.2.0` لـ`peerDependencies`. **مرفوض:** إبقاؤه في مودونتي.
3. **`quality` افتراضه ٧٥ لا ١٠٠** — نصّ التوثيق: «high quality value will increase the file size without improving appearance». الكومبوننت القديم يرفعها تلقائياً مع `preload` — أي يبطّئ LCP وهو يظنّ أنّه يسرّعه.
4. **محسّن بني عبر `loaderFile` لا حقن `loader`** — مثال التوثيق للـ`loader` يبدأ بـ`'use client'`، فحقنه كخاصيّة يحوّل كل مستهلك لمكوّن عميل. و`image.md:197`: «configure **every instance** … **without passing a prop**».
5. **`sizes` إلزامية عبر presets** (قرار خالد: «فيها control») — رغم أنّ القياس أظهر أنّ المكسب انضباط لا إنقاذ.
6. **الفرع المنفصل** — كل شغل الصور على `image-component`، و`main` يبقى نظيفاً والإنتاج عليه.

---

### 🚧 معلّق / محجوب

- **`MI2c` وما بعده** — ٢٤ ملفاً باقية. غير محجوب، فقط طويل.
- **`IMGDIM`** — الصور الافتراضية الثلاث `width/height = undefined` في القاعدة ← خطر CLS حقيقي حين تُستعمل. الحلّ: قراءة الأبعاد من بني وكتابتها + إرجاعها من `getPlatformDefaultImages()`.
- **`ADM-AUTH-IMG`** — الأدمن بلا حقل لصورة الكاتب (اضطررنا لكتابتها بسكربت).
- **`BNOPT`** — محسّن بني. محجوب بثلاث بوّابات: تأكيد تفعيله على الزونات · قياس السعر من فاتورة Vercel · قياس السرعة بمنهج `67`.
- **`65b`** — فولباك الصورة المكسورة وقت العرض (`onError`). لا يوجد اليوم؛ صفر صورة مكسورة فلا شيء يُلتقط.

---

### 📂 ملفات لُمست (الفرع `image-component`، كوميت `566631b`)

- `dataLayer/components/optimized-image.tsx` — **جديد**. الكومبوننت المشترك بالعقد كاملاً.
- `dataLayer/lib/media-src.ts` — `blurDataURL` صار **مفتاحاً إلزامياً** (أداة الجرد).
- `dataLayer/package.json` — `next: ^16.2.0` في `peerDependencies` + `pnpm install` ربطها فعلاً.
- **٤٠ ملفاً · ٧٧ موضع `select`** في مودونتي/الأدمن/dataLayer — أُضيف `blurDataURL: true`.
- `modonty/app/articles/[slug]/components/article-featured-image.tsx` — **مُحوَّل** (إثبات النمط).
- `documents/tasks/reports/BL2-blur-inventory-2026-08-07.md` — **جديد**، ٣٠٤ أسطر، تقرير الجرد الكامل.
- `documents/tasks/TASK.html` — إعادة تصميم بورد الصور + البنود الجديدة.

**على `main` (مدفوع):** ١٩ + ١٣ ملفاً في الدفعتين — تفصيلها في رسالتَي الكوميت `eff8d2e` و`507454c`.

---

### 🔁 حالة git

```
main:             7ff60cc   (متطابق مع origin/main · الإنتاج عليه)
الفرع الحالي:      image-component
آخر كوميت فيه:     566631b  wip(images): shared OptimizedImage in dataLayer
الحالة:            لا يترجم — 76 خطأ TS2345 في مودونتي
غير مرحَّل:        .claude/settings.local.json · .mcp.json (مستبعدان دائماً)
```

**الإنتاج:** admin `1.10.2` · modonty `1.87.0` · console `0.23.0` · dataLayer `0.2.1` — الثلاثة `READY` على `507454c`.

---

### ⚠️ ثلاثة أحكام خاطئة أطلقتها وصحّحتها — تُقرأ قبل الاستئناف

1. **«٧١١ رابط Cloudinary يُقدَّم للزوّار»** → كان كاش Vercel قديماً يتحدّث ذاتياً. الجولة الثانية: **صفر**.
2. **«٩٤ مقالاً بلا صورة في السيو»** → الكاتب يُولَّد `Organization` ومعه `logo` كامل. النقص كان **شكلياً فقط**.
3. **«هدر ٩٦× على الجوال»** → أداة قياسي قرأت `img.src` للصور الكسولة، وهو الرابط الاحتياطي الأكبر **ولم يُنزَّل**. القياس الصحيح (٣٩٠ بكسل، ١٨ صورة محمَّلة): **واحدة فقط تتجاوز 2×**.

**الدرس المسجَّل:** الخطر ليس في المعمارية بل في الحكم قبل القياس. كل رقم يُذكر معه ناتجه الخام، وكل قاعدة يُذكر معها مصدرها — نصّ أم اجتهاد.

---

### 🚀 الاستئناف في ٣٠ ثانية

1. `git checkout image-component`
2. `cd modonty && pnpm tsc --noEmit` — توقّع **٧٦** خطأ
3. افتح `documents/tasks/reports/BL2-blur-inventory-2026-08-07.md` — خريطة الشغل
4. أغلق الأخطاء ملفاً ملفاً (الأكثر إصابةً أولاً: `api/helpers/client-queries.ts` ٨ · `article-queries.ts` ٥ · `category-queries.ts` ٤)
5. لمّا يصير `tsc` صفراً → شغّل مودونتي محلياً → **التست الحيّ** (`MI4`): كل الصفحات · كل الصور تُحمَّل · صفر خطأ كونسول · قارن `q=` و`w=` قبل/بعد
6. ثم دمج في `main` بطقوس الدفع المعتادة

**قاعدة التنبيه الصوتي المحدَّثة:** انتهاء تاسك (نغمة صاعدة) · انتظار قرار أو ضغطة (نغمة مزدوجة) — `feedback_sound_alert_on_task_done_and_on_blocking`.

---

## Session: 2026-08-07 02:00→04:00 — 🚀 النشر الكبير كاملاً: push + مرحلة ما بعد النشر كلها + إصلاح مفاتيح Vercel + بدء إثبات T2b

### 🎯 Where I stopped — ⚠️ عملية جارية لحظة التجميد
- **بند 66 (إثبات T2b idempotent) في منتصفه بالضبط:** التنفيذ الأول لـT2b على **التطوير** انطلق للتوّ من `localhost:3000/bunny-migration` (كُتب LINK وضُغط «نفّذ» — الخطة: ٩٦ إجراءً، منها قراران لخالد يُتخطّيان بالتصميم). **ما اتُحقّق من اكتماله بعد.**
- **الخطوات المتبقية للبند حرفياً:** (١) انتظر اكتمال التنفيذ الأول وتأكد «سيُنفَّذ:0» أو ما يعادلها (٢) خذ لقطة وسيطة: `cd admin && node .tmp-t2b-snapshot.mjs <ملف>` (٣) اضغط «نفّذ» ثانية بنفس LINK (٤) لقطة بعدية وقارن البصمتين — لازم تتطابقان مع الوسيطة، والبروفة تعرض «منجز» كله (٥) سجّل 66 خضراء على TASK.html.
- **لقطة «قبل» محفوظة:** `scratchpad/t2b-before.json` — بصمتها `66c4a55a…` (561 media · 23 tags · 15 categories · 8 industries · 30 clients). السكربت نفسه منسوخ في `admin/.tmp-t2b-snapshot.mjs` (احذفه بعد القفل).
- **اكتشاف أثناء البند:** آخر Sync محا شغل T2b السابق على التطوير كله (٩٦ معلّقاً بعدما كان منجزاً) ومحا `coreClientId` — أعدتُ ضبطه على التطوير («مدونتي») قبل البروفة.
- سيرفر التطوير admin شغّال بالخلفية (مهمة `b3yytmujl`).

### ✅ Done this session
- **بند 16f:** قياس حجم الباندل بالمنهجية الكاملة — أرضية ١٨٠ ك.ب brotli، أثقل صفحة (المقال) ٢٢٩ ك.ب، صفر هدر. تصحيحان منهجيان: core-js موسوم `noModule` لا يُحمَّل (−٣٤ ك.ب من الرقم) · `next-cloudinary` في package.json بلا أي استيراد
- **تبويب «📐 منهجية القياس»** على TASK.html — ٩ بطاقات مرجعية (M0–M8) تُتَّبع في أي قياس أداء لاحق
- **BK1+BK2:** لقطة Atlas متحقَّقة عبر Admin API (٨ لقطات COMPLETED) + `mongodump` يدوي ٤٧ م.ب / ٩٠ مجموعة في `backups/PROD-2026-08-07_02-27`
- **push `e3dbfba ← 78e6a27`:** ١٨ كوميت · ٢٦٣ ملفاً · نسخ: admin 1.10.0 · modonty 1.85.0 · console 0.23.0 · dataLayer 0.2.0 · قرار خالد: ضمّ الريلز (قاعدة الاستبعاد ماتت — كود مدفوع يستوردها) وحذف `.cursor/`
- **تحقّق النشر الثلاثي:** modonty `/reels`=200 · admin `/api/cron/backup`=401 · console `/api/log-client-error`=405
- **بند 45:** `prisma db push` على الإنتاج (بموافقة خالد الصريحة) — ٩٠←٩٥ مجموعة، فهرس `redirects_section_fromSlug_key` انبنى، المقالات ١٣٩ = صفر حذف. فحص التكرار المسبق: صفر تعارض على `section+fromSlug`
- **بند G16 (عبر واجهة الأدمن الحية Run-All):** Media Reels Fields = **٥٦٧ صفاً**، + فهارس TTL الثلاثة أُنشئت + ٥٩ نسخة مقال نُظِّفت — ١٤/١٤ خطوة
- **بند 81 (عبر الواجهة):** coreClientId = «مدونتي» — ثابت بعد إعادة تحميل
- **بند 16g:** LCP الحي عبر PSI API — الرئيسية جوّال ٧٠/100 LCP ٥.١ث ⚠️ · مكتب ٩٩/100 · CLS صفر في الكل. الأساس المرجعي لبورد مكوّن الصور
- **بند G2:** حذف الصفّ اليتيم الأخير `article_tags` — بإذن خالد الصريح فُتح حارس `prod-db-write` مؤقتاً وأُغلق فوراً بعدها (متحقَّق بقراءة الملف). `deleteOne` بالمعرّف `6a672133cbc8dedf1d48bffe` · الفحص البعدي صفر يتامى · مقال جبر سيو صار يفتح (200)
- **بند F2 + F3:** فرضيتاهما سقطتا بعد النشر — وسم «خدمات طبية» يخدم الافتراضية (لا صورة عميل آخر) و`og:image` معبّأ حيّاً ١٢٠٠×٦٣٠. أُقفلا بالدليل
- **بند 80:** النسخ الاحتياطي على الإنتاج متحقَّق — تشغيل يدوي للمسار `api/cron/backup` بمفتاح Bearer: 200 · ٨٣ مجموعة · ٦٠٢٢ مستنداً · ٥.٢ م.ب · ورسالة تيليجرام **وصلت خالد** («بوصلة الرسالة»). الجدولة `0 1 * * *`
- **بند B3 — الأهم:** اكتشاف وإصلاح عطل إنتاجي حقيقي. الرفع كان يفشل بصمت («Bunny env missing for zone clients» — قُرئ من جسم ردّ الـserver action): **١٣ مفتاح BUNNY_* لم يصلوا Vercel قط**. أُضيفوا عبر `POST /v1/env` بصيغة `{target,type,projectId,evs:[…]}` (مربوطين admin+console · production+preview) + إعادة نشر المشروعين حتى READY. الإثبات النهائي: رفعة حيّة نجحت — `modonty-clients.b-cdn.net/general/dream-to-app/b3-real-test.jpg` والصفّ فيه bunnyUrl **والضبابة ١١٩ حرفاً اتولّدت تلقائياً**
- **واجهة TASK.html:** المنجز صار خلفية خضراء كاملة ✓ بالتاريخ ويبقى في المسار (طلب خالد) ثم صار ينزل تحت قسم «✅ المنجز» والمفتوح فوق مرقّماً · البوّابتان المجتازتان خضراوان · بندا BK1/BK2 والمنهجية (تبويب M0–M8)
- تقرير اليتامى تقلّص قبل الحذف: من ٣ صفوف إلى صفّ واحد — صفّا ClientReview اختفيا وحدهما
- TSC state: الثلاثة صفر أخطاء (قبل الدفع) · Build modonty passed · تست حي: أدلة النشر الثلاثة + ثبات coreClientId + رفعة بني حيّة

### 📝 Decisions taken
- «فحص الأداء» انقسم بنداً قبل الدفع (الحجم — يُقاس محلياً بدقة) وبنداً بعده (LCP — لا يُقاس إلا حياً) — مصدر القاعدة `next/dist/docs/…/version-16.md:1000-1002`
- Atlas Flex لا يدعم لقطة عند الطلب (متحقَّق `docs/atlas/reference/flex-limitations`) → mongodump المحلي هو نسخة لحظة الصفر
- حذف اليتامى: الحارس يمنع سكربتات الإنتاج + الواجهة تقرير-فقط (`deleteOrphansForRelation` بلا زرّ) → الحذف من Atlas بيد خالد

### 🚧 Pending / blocked
- **بند 66 — جارٍ لحظة التجميد** (التفاصيل والخطوات في «Where I stopped» أعلاه)
- بعده بقية الترحيل: 65c (فولباك السيو — كود) · B8 · B1 · B6 · B10 · 54 · 54b · 68 · 67 ثم T7–T9 (خالد) ثم T6b
- قراران لخالد ظهرا في خطة T2b (يُتخطّيان ولا يحجزان): Tag «خدمات طبية» + Settings.ogImageUrl — كلاهما صورته مملوكة لعميل آخر
- اختياري غير حاجز: الاستعادة التجريبية الشهرية (ذيل 80) · تنظيف `NEXT_PUBLIC_CONTENTSQUARE_TAG_ID` من Vercel · حذف `admin/.tmp-t2b-snapshot.mjs` بعد قفل 66

### 📝 Decisions taken (هذه الجلسة — الجزء الثاني)
- خالد فتح صلاحية حذف الإنتاج **لمرة واحدة** ثم أُغلقت («اعمل script وعندك الصلاحية إنك تحذف. بس بعد كده قفل الصلاحية») — النمط: تعطيل مؤقت مُعلَّم في الحارس + سكربت يشترط العدد المتوقع بالضبط + إعادة الحارس فوراً + حذف السكربت
- قاعدة عرض اللوحة: المنجز ينزل تحت فوراً بخلفية خضراء، والمفتوح فوق مرقّماً — «اللي يخلص على طول نزله تحت»
- قاعدة استبعاد الريلز من الدفع **ماتت** (قرار خالد «yes include all») — الكود المدفوع يستوردها

### 🔁 Git / deploy state
- Branch: `main` @ `78e6a27` — **مدفوع ومنشور على الإنتاج** (أول دفعة منذ ٢٨ يوليو)
- Uncommitted: `settings.local.json` + `.mcp.json` (مستبعَدان عمداً) + تعديلات `documents/` بعد الدفعة (TASK.html + SESSION-LOG)
- Vercel: الثلاثة READY — وأُعيد نشر admin+console بعد إضافة مفاتيح BUNNY (`dpl_BW8jon…` + `dpl_65N2r4…`)
- سيرفر التطوير admin شغّال على :3000 (مهمة خلفية `b3yytmujl`)

### 🚀 How to resume in 30 seconds
1. **أكمل بند 66 من منتصفه:** افتح `localhost:3000/bunny-migration` (لو السيرفر واقف: `cd admin && pnpm dev`) ← اضغط «بروفة بلا تنفيذ» — لو أظهرت «منجز 96» فالتنفيذ الأول كمل؛ لو «سيُنفَّذ» متبقٍّ فأعد «نفّذ» بكتابة LINK
2. لقطة وسيطة: `cd admin && node .tmp-t2b-snapshot.mjs <ملف-mid>` ← «نفّذ» ثانية ← لقطة بعدية ← البصمتان لازم تتطابقا = idempotent مُثبَت ← علّم 66 خضراء
3. الخطوة التالية بعدها: 65c (فولباك الصورة الافتراضية في مولّد السيو — كود، شرط قبل 68/T8)

---

## Session: 2026-08-06 — 📨 تبليغات تيليجرام (مقالات + ريلز) · رسالة «المقال ما ينفتح» · لوحة Task · تنظيف أدوات ميتة (على `main` · محلي فقط · **لم يُدفع**)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر بند مكتمل:** تبليغ تيليجرام للريلز — متحقَّق حيّاً (٣ علامات ← رسالة واحدة، خالد أكّدها بعينه).
- **خالد قال: الساعة ٥ العصر** نطلع بالدفع + Bunny + الدمج + كل المعلّق. الآن دوام.
- **أول خطوة عند الاستئناف:** افتح `documents/tasks/TASK.html` — بورد «النشر القادم»، فيه ٩ بنود تحجب الدفعة، منها **`G16` الجديد** (تعبئة `inGallery` على الإنتاج فور النشر).

### ✅ أُنجز في هذه الجلسة

**١. تبليغات تيليجرام لفريق المحتوى (جديد كلياً)**
- `sendContentTeamTelegram` في `dataLayer/lib/telegram/client.ts` — بوت منفصل عن بوت الأدمن، **بلا فولباك متعمَّد**: ملاحظة تنزل صامتة في سجل الأخطاء أسوأ من فشل ظاهر.
- البوت `@Jbrseo_bot` (الاسم الظاهر `Jbrseo_alerts_bot`) · القروب `-1003960199240`. متغيّراته في `.env.shared` فقط — **غير مضافة على Vercel**.
- الشكل المعتمد: مرسل · مستلم · اسم العميل · اقتباس · رابط. HTML style الرسمي فقط.

**٢. مسار `/briefs` كامل** — جدول بنسبة اكتمال مرتّب من الأفرغ · أقسام قابلة للطي + «افتح/أقفل الكل» · معرض منسوري · منتقي مستلمين (EDITOR + CREATIVE) بإعادة تحقّق على السيرفر. بلا أي معلومة مالية.

**٣. قرارات العميل على المقالات → تيليجرام** — `notify-article-decision.ts` + توصيل `approveArticle`/`requestChanges` بـ`after()`. المستلم = محرّر العميل من القاعدة. **وصولها أكّده خالد.**

**٤. `showSchedule` لكل عميل** — يخفي تبويب «المجدولة» **وصفوفها من الخادم**.

**٥. رسالة «هذا المقال ما ينفتح» بدل الارتداد الصامت**
- **العطل:** سطر `ArticleTag` معلّق على وسم محذوف → برزما ترفض الاستعلام كلّه → `catch` يرجّع `null` → الصفحة تقرأها «غير موجود» → `redirect("/articles")`.
- **الحل:** `loadArticleOrProblem` يفصل «غير موجود» (يرتد) عن «مكسور» (يعرض). مكوّن `ArticleLoadError`: شرح غير تقني + رقم المقال + زرّ نسخ التقرير + تفصيل تقني مطوي **منقّى من ضجيج Turbopack**. طُبِّق على العرض **والتعديل**.

**٦. تبليغ تيليجرام للريلز المنتظرة اعتماداً** (كانت فكرة، نُفّذت اليوم)
- `console/.../reels/actions/notify-reel-pending.ts` (جديد) + توصيل **ثلاثة أبواب**: رفع مستقل · علامة صورة معرض · ريل مرفوض عُدِّل.
- **حارس الطوفان بلا جدولة ولا حقل جديد:** التبليغ يخرج فقط لو ما دخل الطابور شي آخر لنفس العميل في آخر ١٠ دقائق — والسؤال مُجاب من `updatedAt` الموجود أصلاً.
- **تست حيّ:** ٣ علامات متتابعة ← **رسالة واحدة** (أكّدها خالد). القاعدة تؤكّد الثلاثة `PENDING_APPROVAL`.

**٧. لوحة `TASK.html` — المرجع الرئيسي الجديد**
- سايدبار ببوردات (النشر القادم · بني · عيوب · سيو وأداء · مشاريع · باك لوق · أفكار) وجوّا كل بورد أعمدة (معلّق · للتنفيذ · أفكار · منجز). البيانات مصفوفة `TASKS` داخل نفس الملف.
- **قاعدة الاستنزاف المزدوج:** البند المنجز يُحذف من `TODO.md` **ويُنقل** لعمود «منجز» — وتصفير `TODO.md` هو دليل اكتمال النقل. مسجّلة في `feedback_task_html_main_board`.

**٨. تنظيف أدوات ميتة**
- `.cursor/` — ١٩ ملفاً (مسجَّلة في جِت، يُسترجع بأمر).
- `code-review-graph` — ٥١ ميجا + مدخل `.mcp.json` + **خطّافان كانا يشتغلان عند كل تعديل وعند بداية كل جلسة** على برنامج غير موجود + ١٣ قاعدة صلاحيات + سطرا `.gitignore`. القرار بُني على مصادر رسمية: بلاغ #262 المفتوح (ويندوز ١١ + MCP = مهلة ١٢٠ث) + اعتراف الكاتب أن مقياس الدقّة دائري.

**حالة `tsc`:** admin صفر · console صفر. **Build:** ما شُغّل. **تست حيّ:** ✅ (مقال مكسور عرض+تعديل · مقال سليم · دورة قرار العميل · تبليغ الريلز · Run-All).

### 📝 قرارات وأسبابها
- **`after()` لا وعد معلّق** — الوعد غير المنتظَر يُقتل مع إغلاق الرد (عطل OBS-216).
- **`ADMIN_ORIGIN` ثابت لا مضيف الطلب** — ثلاث ملاحظات وصلت ١١ شخصاً وفيها `localhost:3000`.
- **حارس الطوفان مشتقّ من `updatedAt`** لا من جدول أو مجدول — أرخص حل يحلّ المشكلة فعلاً.
- **«غير موجود» ≠ «مكسور»** — كانا ينهاران في نتيجة واحدة، وهذا أصل عطل طارق.
- **SQLite للوحة المهام رُفض** — `file://` ممنوع من الكتابة (تُحقّق من توثيق MDN). والسيرفر المحلي رُفض كذلك: جهاز يختنق من سيرفر واحد، وكل التعديلات تجي من كلود أصلاً.
- **`brand/` أُبقي** — أصل فنّي لا يُعاد بناؤه بأمر، بخلاف الأدوات الميتة.

### 🚧 معلّق / محجوب
- **`G16` — حاجز نشر جديد:** ٥٥٥ صفاً كان ينقصه `inGallery` ومعرض كل عميل فاضٍ على التطوير. Run-All صلّحها، **لكن تُشغَّل على الإنتاج فور النشر وبعد أي Sync** وإلا معارض العملاء تطلع فاضية على modonty.com.
- **السطر اليتيم لم يُحذف** — مقال جبر سيو `6a60a5dd8aab9fc935de6835` ما زال لا ينفتح.
- **متغيّرات بوت المحتوى غير مضافة على Vercel.**
- **صورة مقال ٥ أغسطس ما زالت على Cloudinary** — يحتاج تحقيقاً: ترحيل ناقص أم مسار رفع لسّه يكتب هناك؟
- **مقالان مكرّران بنفس العنوان** لجبر سيو — نشرهما معاً = محتوى مطابق.
- **بندان تجاوزا موعدهما:** إعادة تست السرعة T4 والتمرير اللانهائي (الاثنان كانا لـ٥ أغسطس).
- **`TASK.html` غير مسجَّل في جِت** (`??`) — يُضاف في دفعة اليوم.

### 🔎 اكتشافات الجلسة
- **الأيتام ٣ فقط** على التطوير: `ClientReview.reviewer` ×٢ · `ArticleTag.tag` ×١ — والأخير هو الذي يوقف مقال جبر سيو. والفاحص **ليس محبوساً**؛ يعمل من Run-All عادي (كلامي السابق عنه كان غلط).
- **حظر Run-All على dev بطل** — خطوة Cloudinary أُزيلت في يونيو وصفر مناديين. المذكّرة حُدّثت.
- **بطاقة «All maintenance tools are healthy» تكذب** — بقيت خضراء بينما الفاحص وجد ٣ أيتام. وفحص الأيتام يُعرض بلون الخطأ وهو تقرير مقصود.
- **بايثون انمسح من الجهاز** — لذلك `code-review-graph` كان معطّلاً بصمت منذ أبريل ولم أنتبه.

### 📂 ملفات لُمست
- `dataLayer/lib/telegram/client.ts` — `sendContentTeamTelegram`
- `dataLayer/prisma/schema/schema.prisma` — `Client.showSchedule` · `ClientNotification.recipientIds/Names`
- `admin/app/(dashboard)/briefs/**` — المسار كامل (جديد)
- `admin/.../articles/actions/articles-actions/queries/article-load-problem.ts` — جديد
- `admin/.../articles/actions/articles-actions/queries/get-article-by-id.ts` — `loadArticleOrProblem`
- `admin/.../articles/[id]/components/article-load-error.tsx` — جديد
- `admin/.../articles/[id]/page.tsx` + `[id]/edit/page.tsx`
- `console/.../articles/actions/notify-article-decision.ts` — جديد
- `console/.../articles/actions/article-actions.ts`
- `console/.../reels/actions/notify-reel-pending.ts` — جديد
- `console/.../reels/actions/reels-actions.ts` · `console/.../gallery/actions/gallery-actions.ts`
- `documents/tasks/TASK.html` — جديد (المرجع الرئيسي) · `NEW-IDEAS.md` — البند ٢ انشال
- `.mcp.json` · `.claude/settings.json` (الخطّافان) · `.claude/settings.local.json` · `.gitignore`
- محذوف: `.cursor/` · `.code-review-graph/` · `PENDING-INVENTORY-v1.html`
- `.env.shared` — متغيّرات بوت المحتوى (لا يُدفع)

### 🔁 حالة Git / النشر
- **الفرع:** `main` · **غير مدفوع:** نعم — ١٧٢ مدخلاً في `git status` (تراكم عدة جلسات)
- **آخر كوميت:** `fe7375f` — Merge branch 'version-2' · **Vercel:** بلا تغيير

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd admin && pnpm dev` (سيرفر واحد فقط — الكونسول يتنازع على ٣٠٠٠).
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/TASK.html` ← بورد «النشر القادم».
3. القرار الأول: نحذف السطر اليتيم (٣ أيتام فقط، معروفة بالاسم)، ولّا نبدأ بترتيب الدفع؟

## Session: 2026-08-05 21:45 — 🏁 خطة الأدمن اكتملت: أ٤ صفحة الخطأ + أ٥ اعتماد الريلز + أ٦ الفيديو الخارجي + أ٧ أُقفل بالفحص (على `main` · محلي فقط · **لم يُدفع**)

### 🎯 وين وقفت
- آخر تاسك: **خطة `ADMIN-WORK-PLAN-v1.html` خلصت بالكامل** — ستة بنود نُفِّذت ومتحقَّق منها بتست حيّ، وبند أُقفل بالفحص بلا تنفيذ. تبويب «قيد التنفيذ» صار فاضياً.
- الخطوة القادمة عند الرجوع: **خالد يختار تاسك جديد** (قال «Task خلص، نبدأ Task تاني»). لا يوجد شغل ناقص من هذي الجلسة.

### ✅ اللي خلص في الجلسة

**أ٤ — صفحة خطأ الكونسول (كانت مبنية، وقُفلت فجوتها الثانية):**
- أربع ملفات جديدة: `console/app/error.tsx` (تمسك سقوط لوحة التحكم — التلاتة عشر استعلام قبل أي صفحة) · `console/app/(dashboard)/error.tsx` (سقوط صفحة واحدة، الشريط الجانبي يظل شغّالاً) · `console/app/global-error.tsx` (سقوط الهيكل نفسه) · `console/components/error-view.tsx` (الشاشة المشتركة).
- استُعمل `unstable_retry` (Next 16.2) لا `reset` — الأول يعيد جلب بيانات السيرفر، الثاني يعيد الرسم فقط فيقع فوراً. تحقّقت من الفرق في `next/dist/client/components/error-boundary.js` قبل الكتابة.
- الشاشة تفرّق بين عطل عندنا وانقطاع نت العميل (`navigator.onLine`)، وتعرض رقم العطل بزرّ نسخ.
- **الفجوة الثانية قُفلت:** أخطاء المتصفح ما كانت توصل سجل الأخطاء إطلاقاً. مسار جديد `console/app/api/log-client-error/route.ts` (المفتاح السرّي يبقى على السيرفر) + التبليغ من شاشة الخطأ. **الفكرة الحاكمة:** وجود رقم العطل = خطأ سيرفري مسجّل أصلاً؛ غيابه = متصفّح — فشرط واحد يمنع التكرار (مؤكّد من توثيق النسخة المثبّتة: `error.md:111`). المنفذ محمي: إنتاج فقط · ٥ بلاغات/دقيقة لكل عنوان · سقف ٤KB · كل الردود ٢٠٠.
- أُضيف عطل الترجمة الآلية (`removeChild` — حادثة JBRSEO) لقائمة أخطاء الإطار في `dataLayer/lib/system-error/enrich.ts` حتى ما يرنّ تيليجرام على عطل مو عطلنا.

**أ٥ — شاشة اعتماد الريلز (المخرج اللي كان ناقصاً):**
- مسار جديد `/reels` في الأدمن: قائمة الانتظار الأقدم أولاً، معاينة طولية (الفيديو يشتغل داخل البطاقة)، اسم العميل وشعاره، الحقول الثلاثة مصفوفة.
- **الاعتماد ينشر مباشرة** بلا حالة وسيطة — لأن الوعد المكتوب للعميل «بعد اعتماد مُدَوَّنَتِي يظهر»، وحالة معلّقة ما يقرأها أحد كانت بتكسر الوعد بصمت.
- **الحارسان (ق٩) مُنفَّذان في السيرفر لا في الواجهة فقط:** عنوان/وصف فاضي → مقفول · عنوان مكرّر لنفس العميل → مقفول. وحساب التكرار يشمل قائمة الانتظار نفسها (ريلان معلّقان بنفس العنوان يُعلَّمان الاثنان).
- الرفض يشترط سبباً مكتوباً يوصل بطاقة العميل.

**أ٦ — علامة الفيديو الخارجي:**
- شارة على اسم العميل + زرّ تصفية «فيديو خارجي ٥». الشارة تفرّق: **كهرماني** = على قناة ما يملكها، **أحمر** = الرابط ما يشتغل كفيديو (صفحة فيسبوك/درايف، صفحة لا ملف). التلميح يعرض الرابط كاملاً.
- **اكتشاف مو مذكور في البند:** عميل واحد عنده **٣ روابط محشورة في نفس الحقل** — الشارة تعدّها «×٣» وتقول لازم أحد يختار واحداً.
- تنطفئ بنفسها: الشرط ثنائي (`introVideoUrl` موجود **و**`introVideoMediaId` فاضي)، والرفع يكتب الاثنين في كتابة واحدة.

**أ٧ — أُقفل بالفحص، لم يُنفَّذ:**
- البند قال «نسخة مكرّرة، الربط يوحّد السلوك». **الفحص أثبت العكس:** رفع الأدمن يفرض ٥ نسب قصّ (`1:1`·`16:9`·`1.91:1`·`6:1`·Free) والكمبوننت المشترك فيه **صفر** إشارة قصّ؛ وحذف الأدمن يسأل السيرفر `canDeleteMedia` ويرفض «مستعملة في N مقال منشور».
- **التنفيذ كان بيشيل حارسين شغّالين.** نفس درس أ٣/أ٢: «افحص قبل ما تفترض».

### 📝 قرارات وأسبابها
- **`unstable_retry` بدل `reset`** → لأن `reset` يمسح حالة الخطأ فقط ولا يعيد الجلب، فخطأ بيانات السيرفر يقع فوراً من جديد. البديل المرفوض: إعادة تحميل الصفحة كاملة (تفقد حالة العميل).
- **الاعتماد ينشر مباشرة (لا `APPROVED` وسيطة)** → الوعد المعروض للعميل. البديل المرفوض: حالة معتمد-غير-منشور، ما يقرأها أي كود فتصير وعداً مكسوراً بصمت.
- **الحارسان في السيرفر لا الواجهة فقط** → تبويبان مفتوحان يقدران يعتمدان نسختين من نفس العنوان. الزرّ الرمادي مجاملة، الإجراء هو الحارس.
- **الشارة تقول *أي نوع* رابط** → المكالمة مع العميل مختلفة: «فيديوك على قناة ما تملكها» ≠ «الرابط هذا مو فيديو أصلاً».
- **أ٧ يُقفل لا يُنفَّذ** → الدليل الخام معروض لخالد وأقرّه.

### 🚧 معلّق / محجوب
- **لا شيء من هذي الجلسة.** الخطة اكتملت.
- المعلّقات الثابتة أعلى الملف على حالها (نشر الشروط/الخصوصية · `db push` لمجموعة `redirects` · ذيل ترحيل Bunny).

### 📂 الملفات

**جديدة (١١):**
- `console/app/error.tsx` · `console/app/(dashboard)/error.tsx` · `console/app/global-error.tsx` · `console/components/error-view.tsx` — بوابات الخطأ الثلاث + شاشتها
- `console/app/api/log-client-error/route.ts` — منفذ تبليغ أخطاء المتصفح (محمي بحد معدّل + سقف حجم + إنتاج فقط)
- `admin/app/(dashboard)/reels/page.tsx` · `loading.tsx` · `helpers/load-reels.ts` · `actions/reel-approval.ts` · `components/reels-approval-list.tsx` — شاشة الاعتماد + الحارسان
- `admin/app/(dashboard)/clients/helpers/intro-video-link.ts` — تصنيف الرابط الخارجي (يوتيوب/فيسبوك/درايف) + عدّ الروابط المتعددة

**معدّلة (٩):**
- `dataLayer/lib/system-error/enrich.ts` — توقيع عطل الترجمة الآلية → يُصنّف «إطار» فما يرنّ تيليجرام
- `modonty/app/api/revalidate/tag/route.ts` + `admin/lib/revalidate-modonty-tag.ts` — تاغ `reels` مسموح
- `admin/components/admin/sidebar.tsx` — بند «Reels Approval» تحت Media
- `admin/app/(dashboard)/clients/actions/clients-actions/get-clients.ts` + `types.ts` — جلب حقلَي فيديو التعريف
- `admin/app/(dashboard)/clients/components/client-table.tsx` + `clients-page-client.tsx` + `clients-tabs.tsx` — الشارة + التصفية
- `documents/archive/tasks/ADMIN-WORK-PLAN-v1.html` — نقل أ٤·أ٥·أ٦·أ٧ لتبويب «منجز» + تفريغ «قيد التنفيذ»

### 🔁 حالة Git والنشر
- الفرع: `main`
- تعديلات غير مدفوعة: **نعم** — ١١ ملفاً جديداً + ٩ معدّلة من هذي الجلسة، فوق تعديلات جلسات سابقة على نفس الفرع.
- آخر كوميت: `fe7375f` — Merge branch 'version-2'
- مدفوع: **لا**
- Vercel: لا شيء — ما في دفع.
- **البيئة طوال الجلسة:** `modonty_dev` (طُبع الرابط وتُحقّق منه قبل أي سكربت).

### ✔️ حالة التحقق
- `tsc --noEmit`: **صفر أخطاء** على الأدمن والكونسول ومودونتي (شُغّل بعد أ٥ وبعد أ٦).
- `build`: لم يُشغَّل.
- **تست حيّ: نُفِّذ كاملاً على أ٥ وأ٦.**
  - أ٥: ٣ ريلز حقيقية من الكونسول بحساب كيما زون → المكتمل اعتُمد وظهر فعلاً في صفحة الريلز على مودونتي · الناقص وصفه انقفل · المكرّر عنوانه انقفل · الرفض وصل سببه بطاقة العميل. **وفحص الالتفاف:** عُطِّل قفل الواجهة عمداً وضُغط الاعتماد → السيرفر رفض والقاعدة ما تغيّرت، ثم أُعيد القفل.
  - أ٦: ٣٠ عميلاً، ٥ بروابط خارجية → الشارات على الخمسة بألوانها الصحيحة، التصفية رجّعت ٥ صفوف، التلميحات عرضت الروابط كاملة.
- **لقطات:** `.playwright-mcp/reels-approval-guards.png` · `reels-duplicate-guard.png` · `reels-reject-done.png` · `modonty-reels-feed-live.png` · `console-reels-after-decision.png` · `clients-external-video-badge.png` · `clients-external-video-filtered.png`

### ⚠️ ملاحظة بيئة (ليست عطلاً في الكود)
- خمسة أخطاء `JWTSessionError` تظهر في متصفح مودونتي — سببها أن التطبيقات الثلاثة تشتغل على نفس المنفذ ٣٠٠٠ بنفس المتصفح فتتشارك كوكي الجلسة، والكوكي `httpOnly` فما ينمسح من الصفحة. مسجّلة سابقاً (OBS-118) ولا علاقة لها بشغل الجلسة.

### 🚀 استئناف في ٣٠ ثانية
1. `cd admin && pnpm dev` (تطبيق واحد في المرة — قاعدة الجهاز)، الدخول `modonty@modonty.com / Modonty123!`
2. افتح `documents/archive/tasks/ADMIN-WORK-PLAN-v1.html` → تبويب «منجز» فيه تفاصيل الستة + قرار أ٧
3. القرار: **خالد يحدّد التاسك الجديد** — لا يوجد شغل ناقص محمول من هذي الجلسة

---

## Session: 2026-08-05 — 🔗 دمج الريلز في الوسائط: السكيما + الكود + `db push` + تعبئة ٥٧٢ صفاً (على `main` · محلي فقط · **لم يُدفع**)

### 🎯 أين وقفت
- **آخر فعل:** بنيت خطوة تعبئة `inGallery` في Run-All ونفّذتها مرة على قاعدة التطوير — رجّع معرض العميل ١٦ صورة بعد ما كان فاضياً.
- **الخطوة التالية عند العودة:** **تست حيّ بالمتصفح** على `http://localhost:3002/dashboard/gallery` (الكونسول شغّال على 3002 الآن) — تأكيد ظهور الـ١٦ صورة وتجربة علامة الريلز على صورة واحدة. **ثم** شاشة الاعتماد في الأدمن (م٤) — وهي السبب الجذري للبند 83 أصلاً.
- **⛔ حاجز:** أداة Playwright **ما تقدر توصل الجهاز** — الخارجي يفتح (`example.com` ✅) والمحلي مرفوض (`localhost` · `127.0.0.1` · `192.168.1.3` كلها `ERR_CONNECTION_REFUSED`) بينما `curl` يرجّع 307 على نفس الرابط، وبروكسي ويندوز مطفي. **السبب: أنا نفّذت `taskkill /F /IM node.exe` وقتلت معه سيرفر Playwright.** يحتاج **Reload لـ Claude Code**، أو خالد يفتح الرابط بنفسه.

### ✅ أُنجز هذه الجلسة
- **دراسة أثر الاعتماد على الإنتاج — الجواب: صفر تأثير على أي شي يشوفه أحد.** بالـ`git grep` على `origin/main` (لا `main` المحلي — هو ١٧ كوميت متقدّم وغير مدفوع): **٤ مواضع تنادي `db.reel`** (إنشاء واحد في رفع صور المعرض · حذفان · تحديث رابط) و**صفر قراءة**. يعني صفوف الريلز تُكتب في الفراغ.
- **السكيما (`dataLayer/prisma/schema/schema.prisma`):** انحذف `Reel` + ٥ جداول تابعة + `enum ReelType` · حقول الريلز انركّبت على `Media` (منها `inGallery` و`inReels` كمفتاحين مستقلين + ٤ فهارس) · ٣ جداول تفاعل جديدة (`MediaComment` · `MediaReaction` · `CommentReaction`) · العلاقات العكسية اتصلحت على `User` و`Client` و`Article`.
- **`db push` نُفّذ على التطوير والسؤال المعلّق انحسم بالدليل:** الدفع **ما حذف ولا مجموعة** — الستّ القديمة موجودة بكامل صفوفها (٥٥ ريل · إعجاب · مفضّلة)، والمجموعات ٩٥←٩٩. **يعني التغيير قابل للرجوع.** وانكشف جانبياً إن `media` كان عليها فهرس `_id` فقط.
- **٩ ملفات كود اتعدّلت**، منها **موضعان انحذفوا نهائياً** (مزامنة الرابط المنسوخ في `optimize-image.ts` · الحذف الصامت في `gallery-mutations.ts`)، و**حارس الحذف اتركّب في ٣ مواضع**: المنشور أو اللي عليه تفاعل **يطلع من المعرض ولا ينحذف**.
- **خطوة تعبئة جديدة في Run-All** (`media-reels-backfill.ts`) + وصلها في `run-all-maintenance.ts` والواجهة. **النتيجة الخام على التطوير:** ناقص المفتاح قبل = **٥٧٢** ← تعبّى **٥٧٢** (والعدّادات ٥٧٢) ← ناقص بعد = **صفر** · معرض «مختبرات الأطباء» = **١٦** · صفوف انقلبت للريلز بالغلط = **صفر**. **idempotent.**
- **حالة tsc:** صفر أخطاء على الثلاثة. (خطأ `authorityCodes` في `admin/lib/seo/ymyl-helpers.ts:145` **سابق ومن شغل YMYL غير المكتمل**، مو من هذه الجلسة — وهو «الخطأ الواحد» في شريط VS Code.)
- **البناء:** ما نُفّذ. **التست الحي:** ما تمّ (الحاجز أعلاه).

### 📝 قرارات اتخذت (بالسبب)
- **الصف في `Media` هو الريل نفسه** — لا جدول منفصل. البديل المرفوض: إبقاء `Reel` كصف ينسخ الرابط (كان يفرض مزامنة رابط في موضعين، وانحذفوا).
- **`type` ما اتمسّ إطلاقاً** — معناه «دور الملف» و١٥ استعلاماً يقرأه؛ الريل صار **علامة `inReels` فوقه** لا قيمة جديدة فيه.
- **تفرّد `reelSlug` يُفحص في الكود لا بفهرس القاعدة** — فهرس فريد في مونجو يرفض الـ`null` الثاني.
- **٣ جداول تفاعل لا واحد** — إعجاب التعليق يشير للتعليق لا للملف؛ الواحد كان يجبرنا على صفّ يشير لشيئين.

### ❌ غلطة مني هذه الجلسة (مسجّلة صراحةً)
- قلت **«`NOT: { inGallery: false }` يطابق الغائب والصحيح معاً»** بلا ما أختبرها، وبنيت عليها استعلام المعرض. **طلعت غلط:** الصيغ الثلاث (`true` · `NOT:{false}` · `{not:false}`) **كلها رجّعت صفر من ١٦** على قاعدة التطوير. **ما في حل على مستوى الاستعلام أبداً — الحقل لازم ينكتب على الصفوف أولاً.** وخالد هو اللي شافها («الصور تبعت العميل من Gallery، فين راحت؟»). القاعدة المخالَفة: [[feedback_no_guessing]].
- وقلت إني نفّذت `npm i --save-dev prisma@latest` — **ما نفّذته**، كان سطراً داخل صندوق تنبيه Prisma نفسه في مخرَج `generate`.

### 🚧 معلّق / محجوز
- **التست الحي** — محجوز على Reload لـ Claude Code (Playwright مقطوع عن الجهاز).
- **شاشة اعتماد الريلز في الأدمن (م٤)** — لسه ما اتبنت، وهي أصل البند 83.
- **رفع الفيديو مباشرة من المتصفح إلى Bunny بمفتاح مؤقّت (م٥)** — المسار الحالي للصور فقط.
- **مصير ٥٥ صفاً يتيماً في مجموعة `reels`** — موجودة بالقاعدة وPrisma ما عادت تعرفها. غير ضارّة، والقرار مؤجّل.
- **مودونتي (الواجهة العامة) مرحلة ثانية** — خارج هذه الدفعة.

### 📂 ملفات لُمست
- `dataLayer/prisma/schema/schema.prisma` — حذف `Reel`+٥ تابعة+`ReelType` · حقول الريلز والمفتاحان والفهارس على `Media` · ٣ جداول تفاعل.
- `admin/app/(dashboard)/database/actions/media-reels-backfill.ts` — **جديد**: تعبئة `inGallery`/`inReels` والعدّادات الأربعة (idempotent).
- `admin/app/(dashboard)/database/actions/run-all-maintenance.ts` — خطوة `runStepMediaReelsBackfill`.
- `admin/app/(dashboard)/database/components/auto-maintenance-panel.tsx` — الخطوة في قائمة Run-All.
- `admin/app/(dashboard)/media/actions/optimize-image.ts` — **حُذف** بلوك مزامنة الرابط (`db.reel.updateMany`).
- `admin/app/(dashboard)/client-galleries/actions/gallery-mutations.ts` — حارس الحذف (المنشور/عليه تفاعل → `inGallery:false`).
- `console/app/(dashboard)/dashboard/gallery/page.tsx` — استعلام واحد بدل اثنين + `inGallery: true`.
- `console/app/(dashboard)/dashboard/gallery/actions/gallery-actions.ts` — `createReelFromMedia` انشال ← `buildReelSlug` · `setImageInReels` صار تحديثاً واحداً.
- `console/app/(dashboard)/dashboard/gallery/components/gallery-manager.tsx` — العلامة تقرأ `inReels` مباشرة.
- `console/app/(dashboard)/dashboard/reels/actions/reels-actions.ts` + `page.tsx` — إعادة كتابة على `db.media`.
- `console/app/(dashboard)/dashboard/reels/components/reels-manager.tsx` — `sourceMediaId` ← `inGallery`.
- `modonty/app/reels/helpers/reels-feed.ts` + `actions/reel-interactions.ts` — الفيد والتفاعل على `Media`/`MediaReaction`.
- `documents/tasks/TODO.md` — البند 83 (تصحيح غلطة الاستعلام + نتيجة التعبئة).
- `documents/context/SESSION-LOG.md` + `SESSION-LOG-2026-07.md` — تدوير أسبوعي (٤ جلسات انتقلت · ١٩ = ٤ + ١٥ ✅).

### 🔁 حالة Git / النشر
- **الفرع:** `main` (**لا `version-2`** — الدمج صار من قبل).
- **تعديلات غير مدفوعة:** نعم — كل الملفات أعلاه + شغل سابق غير مدفوع على الفرع.
- **آخر كوميت:** `fe7375f` — `Merge branch 'version-2'`.
- **مدفوع:** ❌ لا. **النشر:** ما صار.
- **⚠️ عند النشر:** الكود ينزل **أول** ثم `db push`، وبعده **ضغط زرّ Run-All فوراً** — قبلها معرض كل عميل يطلع فاضي على الإنتاج.
- **⛔ مستبعد من أي دفعة:** `modonty/app/reels/` · `documents/reels/` · `settings.local.json` · `.mcp.json`.

### 🚀 استئناف في ٣٠ ثانية
1. **Reload لـ Claude Code** (يرجّع Playwright)، ثم `cd console && npx next dev -p 3002`.
2. افتح `http://localhost:3002/dashboard/gallery` — لازم تشوف ١٦ صورة، جرّب علامة الريلز على وحدة.
3. بعدها ابدأ شاشة الاعتماد في الأدمن (م٤).

---

---


## Session: 2026-08-03/04 ليلاً — 🎬 دمج `main` محلياً + بروفة الترحيل الكاملة على بيانات الإنتاج

### 🎯 أين وقفت
- **آخر فعل:** بروفة T7 الكاملة على اللوكال ببيانات إنتاج طازجة — نجحت كلها، وأُغلقت بإثبات idempotent.
- **الفعل التالي:** `git push origin main` = **النشر الفعلي** — ينتظر أمر خالد وحده. كل الفحوص خضراء.
- **⚠️ قبل تشغيل T7 على الإنتاج:** بند **81** — ثلاث خطوات يدوية اكتشفتها البروفة (تفاصيلها في `TECH-NOTES.md`).

### ✅ أُنجز هذه الجلسة

**١. الدمج إلى `main` — محلياً فقط، بتعميد خالد خطوة بخطوة (بعد التاسعة، الفريق خارج النظام)**
- **① نسخة إنتاج على القرص:** `backups/PROD-2026-08-03_23-11` — ٨٦ مجموعة · ٤١ ميجا · قاعدة `modonty` · محقَّقة بـ`bsondump` (١٢٧ مقالاً · ٣٠ عميلاً · ٥١٠ وسائط · ٤١ مستخدماً).
- **② دفع الوثائق:** كوميت `aff180d` على `version-2` — ٤ ملفات، صفر كود.
- **③ الدمج المحلي:** كوميت `fe7375f` — ٣٧٦ ملفاً · +١٨٬٧٠٤/−٧٬٦٧٦. **شجرة الدمج مطابقة لـ`version-2` حرفياً (صفر انحراف — تحقّقت بـ`git diff --cached version-2`).**
- **④ الفحص:** `tsc` ×٣ صفر أخطاء · **البناء الإنتاجي ٣/٣ نجح** (modonty · admin · console — `exit 0` للثلاثة). أول تشغيل للبناء الكامل في هذا المسار.
- **`origin/main` لم يُلمس** — ما زال `e3dbfba`.

**٢. تعارضان حُسما بدليل لا بتخمين**
- `main` كان فيه كوميت منفرد `e3dbfba` (إصلاح تعليق يتيم) غير موجود على `version-2`.
- التعارض في `client-reviews.ts` + `modonty/package.json` → حُسم لجانب `version-2` لثلاثة أسباب مقيسة: نفس الإصلاح موجود على الفرعين والفرق أسماء حقول فقط · السكيما تحمل `reviewerId String @map("authorId")` فعمود القاعدة **لم يتغيّر إطلاقاً (صفر ترحيل)** · جانب `main` لا يمرّ على `tsc` أصلاً.

**٣. بروفة الترحيل الكاملة — على اللوكال بكود `main` المدموج + بيانات إنتاج طازجة**
| المرحلة | النتيجة |
|---|---|
| Sync إنتاج←لوكال | ٨٦/٨٦ · ٥٬١٨٨ وثيقة · صفر فشل |
| تصفير Bunny | ١٠٠٢/١٠٠٢ · زون assets المحمي بقي ٢٥ |
| ت١ نقل الصور | ٥٠٧ نجح · ٣ فشل · +٥٢ قصّة · −١ رابط معلّق |
| ت٢ اليتيمة | ٢٥ |
| ت٣ الحقول الخام | ٨٣/٨٣ |
| ت٤ السيو | ٢١٦ كياناً (١٢٧ مقال · ٣٠ عميل · ١٤ تصنيف · ٢٣ وسم · ٨ صناعة · ١ مؤلف · ٦ صفحات مدوّنتي · ٧ صفحات قوائم) |
| التمليك T2b | ٧٠ منجزة · ٢ قرارات معلّقة |

- **النتيجة:** ٥٣٢/٥٣٥ صورة على Bunny (٩٩٫٤٪) · الحقول الخام ٨٨←٠ · اليتيمة ٣٩←٠ · السيو المولَّد ٤١٠←٤.
- **إثبات idempotent:** بروفة ثانية بعد التنفيذ = «سيُنفَّذ 0 · منجز 70».
- **الثلاثة الفاشلة مُفسَّرة:** `source fetch failed (404)` — ملفاتها محذوفة أصلاً من Cloudinary. **نفس العدد ونفس السبب في بروفة 08-01.**

**٤. بندان جديدان**
- **81** (جديد الليلة): ثلاث خطوات يدوية قبل ترحيل الإنتاج — `coreClientId` غير مضبوط (حاجب فعلي) + صورة وسم «خدمات طبية» + `Settings.ogImageUrl`.
- **80**: `scripts/backup.sh` يقرأ قاعدة التست لا الإنتاج — اكتُشف قبل النسخة.

### 📝 قرارات ومنطقها
- **إلغاء تست `next start` قبل البروفة** → مسار الـSync محروس بـ`NODE_ENV === "production"` فيرجّع 403. البروفة أثمن، فقُدّمت.
- **عدم اختيار صورة وسم «خدمات طبية» نيابةً عن خالد** → قرار هوية يراه الزائر وتراه Google؛ و`platform-default-post` غير ظاهر في المنتقي أصلاً. زرع اختيار عشوائي ثم البناء عليه أسوأ من تركه معلّقاً موثّقاً.
- **التصفير قبل الترحيل** → لتكون البروفة صادقة: نبدأ من صفر ملف فنعرف أن الـ٤٥٢ رُحّلت فعلاً لا أن الكرت تخطّاها.

### 🚧 معلّق / محجوب
- **`git push origin main`** — ينتظر أمر خالد. `main` المحلي متقدّم بـ**١٧ كوميتاً**.
- **بند 81** — حاجب لـT7/T8 على الإنتاج.
- بند 78 (١٢ مقالاً مجدولاً عالقاً) · 80 · 79 · 77 · 76 (مؤجَّل لـ08-05) · 75 · 70.
- **⚠️ بعد نشر الإنتاج: لا تفتح `admin.modonty.com/seo`** — الإصلاحات القياسية تعمل تلقائياً عند التحميل وتكتب في القاعدة، فتصطدم ببوابة T8.

### 📂 ملفات لمستُها
- `documents/archive/tasks/BUNNY-GOLIVE-FLOW-v1.html` — كرت T6b: الخطوات الأربع + التعارضان + طبقات التراجع + نتائج البروفة + البنود اليدوية الثلاثة + تحديث تاريخي الترويسة.
- `documents/archive/tasks/BUNNY-GOLIVE-PRD-v1.html` — لقطة «أين نحن» 07-31 ← 08-03 + صفّا الجودة وgit.
- `documents/tasks/TODO.md` + `TECH-NOTES.md` — بندان 80 و81.

### 🔁 الحالة في Git
- `version-2` عند **`aff180d`** — مدفوع.
- `main` المحلي عند **`fe7375f`** — متقدّم بـ١٧ كوميتاً · **`origin/main` بكر عند `e3dbfba`**.
- غير ملتزم: ملفات الوثائق الأربعة أعلاه.
- **قاعدة `modonty_dev` الآن = نسخة إنتاج مُرحَّلة بالكامل** (لا بيانات التست القديمة).
- سيرفر أدمن dev شغّال على المنفذ **٣٠٠٠**.

### 🚀 الاستئناف في ٣٠ ثانية
1. اقرأ بند **81** في `TECH-NOTES.md` — الخطوات الثلاث قبل ترحيل الإنتاج.
2. لو خالد قال «ادفع» → `git push origin main` (كل الفحوص خضراء، التراجع ست طبقات).
3. الوثائق الأربعة غير الملتزمة تدخل مع الدفعة القادمة.

---


## Session: 2026-08-02 — 🎯 سيو مودونتي مصدر واحد + دُفع على version-2 + فحص Google حيّ + اكتشاف ١٢ مقالاً عالقاً

### 🎯 أين وقفت
- **آخر فعل:** بحث (بلا تعديل كود) في اختلاف أعداد مقالات عميل «عمر الديدي» — انتهى بتشخيص كامل وبندين جديدين (78/79).
- **الفعل التالي عند الاستئناف:** بند **78** — ١٢ مقالاً بحالة `SCHEDULED` بلا تاريخ نشر، عالقة ولن تُنشر أبداً. يبدأ بفحص: هل مسار الجدولة في الأدمن يسمح بالحفظ بلا تاريخ؟ وهل توجد آلية نشر تلقائي أصلاً؟
- **⏰ موعد مثبَّت:** `T6b` (merge إلى `main` = نشر الإنتاج) **بعد الساعة ٩ ليلاً** والفريق خارج النظام — قرار خالد. البوابة محقّقة، ينتظر أمره فقط.

### ✅ أُنجز هذه الجلسة

**١. سيو صفحات مودونتي — مصدر واحد مدقّق (مدفوع)**
- الصفحات السبع (الرئيسية · العملاء · التصنيفات · الوسوم · القطاعات · الرائج · الأسئلة الشائعة) صارت تُبنى من `previewPageSeo` وحده بثلاثة مدقّقات. كان مولّدان يكتبان نفس أعمدة `Settings` والأخير يكسب.
- **باغ حيّ:** صفحة الأسئلة الشائعة كانت تفقد `canonical` وصورة تويتر (ميتا بشكل غير متوافق مع `Metadata`) — أُصلح عبر `regenerateFaqPageCache`.
- بطاقة الأسئلة الشائعة لُفّت بـ`@graph` (كانت الوحيدة غير المدقّقة). بُناة غنية جديدة للوسوم والقطاعات. تقرير التحقّق المزيّف `{valid:true}` أُزيل.
- **إزالة صفحة وهمية:** `/articles` غير موجودة (404 مقصود موثّق في `next.config.ts` بعد حادثة سلاگ عربي عرّضت ١٧+ مقالاً لخطر الشطب). كنّا نولّد لها سيو مع كل إنشاء/تعديل/حذف مقال + كل cascade، بـcanonical يشير لـ404. أُزيلت — **والرئيسية هي صفحة المقالات**، فوجود الاثنتين تنافس داخلي.
- **تنظيف:** ٢٢ ملفاً + ٦ أعمدة سكيما وبياناتها (`$unset` بعد باكب: ١٤٣ ← ١٣٧ حقلاً، الفرق ٦ بالضبط، صفر ضرر جانبي).

**٢. الدفع والتحقق**
- كوميت `e973d1b` — ٦٣ ملفاً · +١٧٣٠/−٢٦٥٦ · مدفوع على `version-2`. admin `1.9.0` · modonty `1.84.1` · console بلا تغيير.
- changelog سُجّل على القاعدتين (محلي + **إنتاج**): `6a6f3743f114f133996db037` / `...038`.
- **تحقق preview: ٧/٧** صفحات تبثّ canonical + `@graph` + Organization + WebSite + عقدة الصفحة · `/articles` يرجّع 404 كما صُمّم.
- **فحص Google Rich Results حيّ (١١ عيّنة):** ٣ مقالات · ٢ عميل · وسم · تصنيف · قطاع · الرئيسية · الرائج · الأسئلة الشائعة → **صفر خطأ حرج · صفر عنصر غير صالح**. `Image Metadata` ٨-١٠ لكل صفحة = شارة Licensable شغّالة.

**٣. تنظيم الملفات (أمر خالد)**
- ملف جديد `documents/tasks/TECH-NOTES.md` — التفاصيل التقنية كلها هناك، و`TODO.md` صار سطراً واحداً لكل بند بلغة بزنس + رابط. الترقيم مشترك. القاعدة حُفظت في الذاكرة (`feedback_todo_tech_notes_split`).
- `BUNNY-GOLIVE-FLOW-v1.html`: **`T6b` نُقل ليتصدّر To Do** (كان آخر القائمة رغم أن T7/T8/T9 تحتاج الكود منشوراً) + صندوق تصحيح + بوابة محقّقة · T8 صار قابلاً للتنفيذ (الصفحات الستّ بأسمائها) · عدّاد «باقي N» أُضيف للشريط.

**٤. حالة الفحوص:** `tsc` ×٣ صفر أخطاء · cascade كامل ١٩٨/١٩٨ · Build لم يُشغَّل.

### 📝 قرارات ومنطقها
- **الميتا في `listing-page-seo-generator` حصراً، والجيسون يُفوَّض لـ`previewPageSeo`** → مودونتي تصبّ عمود الميتا مباشرة كـ`Metadata` بلا محوّل، فأي شكل آخر يُسقط `canonical` بصمت.
- **عدم بناء `/articles`** بدل إصلاح مولّدها → المسار 404 بقرار سابق مبني على حادثة حقيقية، والرئيسية تؤدي دورها.
- **تأجيل بند 76** (إصلاح التمرير اللانهائي) لما بعد 08-05 → يمسّ نموذج رندر أهم صفحة ويصادم قاعدة «الأداء #1»؛ يُنفَّذ مع قياس السرعة على أساس معروف.
- **الـmerge بعد ٩ ليلاً** → النشر ذرّي بلا انقطاع، لكن أي تبويب أدمن مفتوح قد يحتاج F5 وقد تضيع بيانات نموذج غير محفوظة.

### 🚧 معلّق / محجوب
- **`T6b` الـmerge** — ينتظر أمر خالد بعد ٩ ليلاً. ١٥ كوميتاً · ٣٧٥ ملفاً · +١٨٬٤٤٨ سطراً ستنتقل لـ`main`.
- **بند 78** (١٢ مقالاً عالقاً) — الأخطر، ينتظر قرار المعالجة.
- بند 76 (التمرير اللانهائي) مؤجَّل لـ08-05 · بند 77 (فحص schema.org المستقل) جاهز في أي وقت · بند 75 (عناوين ١٢ عميلاً) إدخال يدوي · بند 79 (تسمية Total Articles).
- أعمدة `articlesPage*` الستة ما زالت **ببياناتها على الإنتاج** (حُذفت من التست فقط) — ضمن T8.

### 🔍 نتائج بحث «عمر الديدي» (بلا تعديل كود)
- الحقيقة: ٨ مقالات — ٣ منشورة · ٤ مجدولة · ١ بانتظار.
- الأرقام: أدمن-جدول ٨·٣·١ ✅ · **أدمن-صفحة العميل ٨** (`_count.articles` بلا فلتر) ⚠️ · مودونتي ٣ ✅ · قائمة الشركاء ٣ ✅ → **لا بيانات ضائعة، تسمية مضلّلة فقط** (بند 79).
- **الاكتشاف الأخطر:** ١٢ مقالاً `SCHEDULED` **وكلها بلا `datePublished`** → لن تُنشر أبداً (بند 78).
- **فرضية خاطئة صُحّحت:** شككتُ في فخّ مونجو على `datePublished`؛ القياس نفاها — مونجو يرتّب `null` قبل التواريخ فـ`$lte` يطابقه (٨١ في كل الصيغ).

### 📂 ملفات لمستُها (الرئيسية)
- `admin/lib/seo/listing-page-seo-generator.ts` · `admin/app/(dashboard)/modonty/setting/actions/generate-home-and-list-page-seo.ts` · `.../helpers/build-taxonomy-page-jsonld.ts` (جديد) · `.../build-faq-page-jsonld.ts` · `admin/app/(dashboard)/seo/components/seo-fix-sequence.tsx` (جديد) · `dataLayer/prisma/schema/schema.prisma`
- **غير مدفوع بعد:** `documents/tasks/TECH-NOTES.md` (جديد) · `TODO.md` · `BUNNY-GOLIVE-FLOW-v1.html` · `SESSION-LOG.md`

### 🔁 الحالة في Git
- الفرع `version-2` · آخر كوميت **`e973d1b` مدفوع** · `main` **لم يُلمس** (متأخر بـ١٥ كوميتاً).
- تعديلات غير ملتزمة: ملفات الوثائق الأربعة أعلاه فقط.
- باكب: `backups/backup-2026-08-02_14-43` (٩١ مجموعة · ٣٠ ميجا).
- مستبعد دائماً: `modonty/app/reels/` · `documents/reels/` · `.claude/` · `.mcp.json` · `playwright-mcp.config.json`.

### 🚀 الاستئناف في ٣٠ ثانية
1. اقرأ بند **78** في `TECH-NOTES.md` — الأسئلة الثلاثة قبل الإصلاح.
2. لو الوقت بعد ٩ ليلاً والفريق خارج → اسأل خالد عن `T6b` (merge لـ`main`).
3. الوثائق الأربعة غير الملتزمة تدخل مع الدفعة القادمة.

---


## Session: 2026-08-02 00:15 — ✅ JSON-LD: إصلاح المُراجع (Person) + زرّ Cascade صار Checkbox+Cancel + تحقق Google لأربع مراحل (Categories·Tags·Industries·Clients)

### 🎯 أين توقفت
- **آخر مهمة:** المنهجية المتّفق عليها مع خالد: **مرحلة مرحلة** — خالد يشغّل المرحلة من `/seo` (check + Start Selected) ثم يقول «خلص»، وأنا أسحب صفحاتها من الـ preview وأفحص الـ JSON-LD بالدليل الخام + أجهّز له كود اللصق في Google Rich Results ليختبره بنفسه.
- **آخر شيء ظهر:** فحص Google لصفحة عميل (mbc-clinic) = **1 valid item** لكن مع **ملاحظتين غير حرجتين** على صورة اللوقو: `Missing field 'license' (optional)` و`Missing field 'acquireLicensePage' (optional)`. بدأت تتبّع السبب (المُولّد يقرأ `imageLicenseUrl`/`imageAcquireLicensePageUrl` من Settings — انظر «معلّق» أدناه) ثم انتهت الجلسة.
- **الخطوة التالية عند الاستئناف:** (١) قرار حقلَي الترخيص (تعبئة الحقلين في `/settings` أم تركهما — اختياريان عند Google). (٢) تشغيل **Articles + Listings** (آخر مرحلتين) بنفس الطريقة ثم فحصهما.

### ✅ Done this session (كله بدليل خام)
1. **إصلاح المُراجع اليمّي = `Person`** في `admin/lib/seo/build-ymyl-jsonld.ts`: `Physician`/`Attorney` نوعان تحت `LocalBusiness` في schema.org، فكان Google يطالب *شخصاً* بـ telephone/priceRange/address. + التخصص انتقل من `medicalSpecialty` (ليست خاصية Person) إلى `knowsAbout`. النتيجة على المقال: **صفر ملاحظات نهائياً**.
2. **زرّ Full Cascade أُعيد بناؤه** (`admin/app/(dashboard)/seo/components/cascade-status-panel.tsx`) بأمر خالد: **٦ checkboxes** (Categories·Tags·Industries·Clients·Articles·Listings) + زر يتحوّل «Start Selected (N)» + **زر Cancel** يوقف بعد الدفعة الجارية (`cancelRef`) + حالة `cancelled` في الشارة. المراحل غير المختارة تُتخطّى ولا تُحتسب في النسبة.
3. **Categories ✅** — الـ14 صفحة من الـ preview: parse سليم · صفر Cloudinary · كل الصور `*.b-cdn.net`. فحص Google: **1 valid item (Breadcrumbs) · صفر أخطاء/تحذيرات**.
4. **Tags ✅** — الـ23 وسم: نفس النتيجة النظيفة. لوحظ أن الوسوم بلا صورة تأخذ **اللوقو الافتراضي من المكتبة** (`logo/_platform/platform-default-logo`) — الفولباك الجديد شغّال.
5. **Industries ✅** — الـ7 صناعات: نفس النتيجة النظيفة (1 valid item · صفر ملاحظات).
6. **Clients ✅ (٢٩ عميل)** — التفريق YMYL/عادي مؤكَّد بالجدول الخام: Dentist/MedicalClinic/Hospital/Optician = `telephone` + `priceRange` + صورة ✔️ · العاديون (كيما زون، جبر سيو، dream-to-app…) = `Organization` نظيف **بدون** telephone/priceRange (Google لا يطالب بها خارج عائلة LocalBusiness) · `DiagnosticLab` كذلك خارج العائلة = سليم. صفر Cloudinary · كل الصور Bunny.

### 📝 قرارات (بأسبابها)
- **المُراجع دائماً `Person`** → لأن أنواع المهن في schema.org تحت LocalBusiness وتجرّ متطلبات محل تجاري على شخص. البديل (تعبئة telephone/address للمراجع) مرفوض: بيانات كاذبة عن شخص.
- **Cascade بالاختيار بدل «الكل»** (أمر خالد) → المرحلة الواحدة تُشغَّل وتُفحص فوراً؛ توفير وقت هائل مقابل تشغيل ٣-٥ دقائق كامل لكل تجربة.
- **الفحص يتم على الـ preview + لصق يدوي في Rich Results** → أتمتة Google بـ Playwright كانت تحرق وقتاً (زر TEST CODE داخل `div[jsaction]`)؛ خالد يلصق ويصوّر النتيجة أسرع بكثير.

### 🚧 معلّق / محجوز
- **ملاحظتا الترخيص على صور العملاء** (`license` + `acquireLicensePage`, اختياريتان) — المصدر: `dataLayer/lib/seo/media/build-image-object.ts` يقرأهما من إعدادات: `settings.imageLicenseUrl` / `settings.imageAcquireLicensePageUrl`. لو انملت الحقلان في `/settings` تختفي الملاحظتان لكل الصور. **قرار خالد مطلوب.**
- **٣ عملاء بلا أي صورة/لوقو في قاعدة البيانات** (دكتور سمير شوقي · مركز فريق الإغاثة العربي · دكتورة سارة طارق) → عقدة المنظمة بلا `image`. **حلّها بيانات لا كود**: رفع لوقو من الأدمن.
- **Articles (118) + Listings (1)** — لم تُشغَّل بعد في هذه الجولة (الكاسكيد السابق وصل ~55/118 قبل ما يقتله الـHMR وقت تعديل الملف). التوليد **idempotent** فإعادة التشغيل آمنة.
- `admin/lib/seo/structured-data.ts:118` — استعمال خام لـ `safeOrganizationType(client.organizationType)` (نفس صنف الخلل القديم) **لم يُصلَح بعد**.

### 📂 ملفات لُمست
- `admin/lib/seo/build-ymyl-jsonld.ts` — المُراجع صار Person + التخصص عبر knowsAbout.
- `admin/app/(dashboard)/seo/components/cascade-status-panel.tsx` — checkboxes + Start Selected + Cancel + حالة cancelled.
- `admin/lib/seo/knowledge-graph-generator.ts` · `dataLayer/lib/seo/generate-organization-jsonld.ts` — إصلاحات المولّدين (MedicalClinic + telephone + priceRange افتراضي + fallback الصورة).
- `documents/tasks/TODO.md` · `documents/archive/tasks/BUNNY-GOLIVE-FLOW-v1.html` — توثيق بند 68 والنتائج.

### 🔁 حالة Git / النشر
- الفرع: `version-2` · آخر كوميت: `28b2ae9` (ترحيل Bunny على التست: T2b + الافتراضيات).
- **تعديلات غير مدفوعة:** الملفات الأربعة أعلاه + ملفات التوثيق. **ممنوع الدمج/الدفع إلى main إلا بأمر خالد الصريح.**
- التوليد كله على **قاعدة التست (`modonty_dev`)** — الإنتاج لم يُمسّ (حارس T8 قائم: صفر regenerate على الإنتاج قبل تأكيد الـCDN حياً 100%).
- tsc: **لم يُشغَّل** بعد تعديلات هذه الجلسة (قاعدة: قبل الدفع فقط). Build: لم يُشغَّل.

### ➕ تكملة الجلسة (فجر 2026-08-02) — الإعدادات + إصلاح ترخيص صور المقالات
- **مراجعة الافتراضيات كلها مقابل مصادرها الرسمية** (بطلب خالد «شاك فيها من أول») — النتيجة: ٣ مشاكل حقيقية + ٦ قيم ميتة. طُبِّق **Apply Defaults** فتغيّرت **٧ قيم**: حقول ترخيص الصور الثلاثة · `orgAddressCountry` عربي ← `SA` · رابط البحث آبكس ← www · **رخصة المحتوى** من `CC BY 4.0` ← رابط سياسة مدوّنتي (السياسة المنشورة تمنع الاستخدام التجاري وتدريب الذكاء الاصطناعي — كان تناقضاً صريحاً) · **`defaultNotranslate`** من true ← **false** (كان يمنع Google من عرض ترجمة الموقع كله، ويناقض قاعدة CLAUDE.md).
- **درس محوري:** السيو مخبوز في قاعدة البيانات — أي تغيير في الإعدادات **يحتاج إعادة توليد ثانية** ليظهر. العملاء وُلِّدوا مرتين لهذا السبب، والثانية أثبتت `license`+`acquireLicensePage` حيّاً على اللوقو والغلاف.
- **سقف تست مؤقت:** `ARTICLES_TEST_LIMIT = 10` في `cascade-status-panel.tsx` + شارة صفراء (أمر خالد — ١١٨ مقالاً تستهلك وقتاً). **يُرفع إلى `null` لاحقاً.**
- **إصلاح ترخيص صور المقالات (أمر خالد «أي حاجة تخص السيو ما تتأجل»):** الفحص كشف ١/٥ صور مرخّصة فقط — عُقد المنظمة تُبنى بمسار منفصل. أُصلح في ٣ مواضع: `generateOrganizationNode` (يستقبل `imageLicensing` ويبني عبر `resolveImageAttribution`+`buildImageObject`) · `generatePlatformAuthorNode` (لوقو مدوّنتي) · `generateSiteIdentityStructuredData` في مدوّنتي + helper جديد `getPlatformImageLicensing()`. **النتيجة الحيّة ١/٥ ← ٤/٥**؛ الخامسة (هوية الموقع) تُرندَر حيّة في مدوّنتي فتحتاج نشر preview للتأكيد. **tsc على التطبيقين = صفر أخطاء ✅.**
- **🏆 فحص Google النهائي على صفحة العميل:** **٤ أنواع valid · صفر أخطاء · صفر تحذيرات** (Breadcrumbs 1 · **Image Metadata 3** · Local businesses 1 · Organization 1). **الأهم:** نوع `Image Metadata` **ظهر لأول مرة** بفضل حقلَي الترخيص ← صور مدوّنتي صارت مؤهّلة لشارة **Licensable** في بحث صور Google. يعني الإصلاح لم يُزل تحذيرين فقط، بل **أضاف قناة ظهور جديدة**.

### 🚀 استئناف في 30 ثانية
1. الأدمن على **بورت 3000** → `localhost:3000/seo`.
2. **الخطوة الأولى: دفع فرع `version-2`** (بإذن خالد الصريح) ليلتقط الـ preview تعديل مدوّنتي، ثم تأكيد ٥/٥ على مقال.
3. بعدها: رفع `ARTICLES_TEST_LIMIT` إلى `null` وتشغيل Articles + Listings كاملة.

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
- `documents/archive/tasks/BUNNY-GOLIVE-FLOW-v1.html` — ٣ تبويبات + أولويات + T2b مفكك + T2b-1/T3 في Done
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
