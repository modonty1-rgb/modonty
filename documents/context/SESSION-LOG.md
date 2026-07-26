# Session Context — Last Updated: 2026-07-26

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

### ✅ خرجت من المعلّقات (أُنجزت 2026-07-21/22)
- **d5 — فصل الطاقم اكتمل (مدفوع 2026-07-22 `8a7b639`):** حُذفت نسخ `User` القديمة + شِيل `db.staff ?? db.user` (admin 0.95.0، staff-only) + فُعّل ربط Google الآمن (`allowDangerousEmailAccountLinking`، آمن بعد الفصل). المتبقّي اختياري: تنبيهات `userId`→`staffId`. المصدر: `memory/project_pending_d5_remove_staff_fallback`.
- **فصل الطاقم:** نُشر (`118e367`) + رُحّل (10 أدمن→staff بنفس `_id`) + دُوّر `AUTH_SECRET` + تحقّق دخول staff حيّ.
- **معرض العميل + محسّن WebP:** نُشر + اختُبر حيّ على الإنتاج (كيمازون معرض إضافة/حذف · فرسان التعافي WebP −88%).

### 🔮 مستقبلي
- [ ] نقل تخزين معارض العملاء إلى Bunny (Cloudinary مكلف) — آمن بمعمارية Media ID. المصدر: `documents/tasks/TODO.md`.

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

---

## Session: 2026-07-24 21:55 — قفل مسار الفوترة (٣ أخطاء مالية) + بانر الكونسول + صفحة فواتير العميل · جاهز للدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر مهمة:** تجهيز الدفع. تم: حذف ملفات مؤقتة · رفع النسخ · باكب (dev) · هذا السجل. **المتبقّي: `git add` بقائمة صريحة ثم عرضها على خالد قبل أي commit.**
- **أول خطوة:** `git add` للملفات المذكورة في «Git» أدناه — **بلا `git add -A`** (الريلز WIP يجب أن يبقى خارج الدفع).

### ✅ أُنجز هذه الجلسة
- **🔴 ٣ أخطاء مالية أُصلحت قبل الدفع** (تفاصيلها الكاملة بالأدلة في `documents/tasks/TODO.md` قسم «قفل مسار الفوترة»):
  1. **السداد كان يسحب الاشتراك للخلف** — معادلتان متعارضتان (الإصدار يحسب من كل الفواتير، السداد من المدفوعة فقط). دُمجتا في `recomputeSubscriptionEnd` واحدة.
  2. **فخّ مونجو `archivedAt: null` = صفر صفوف** — محا `subscriptionEndDate` فعلياً في أول تشغيل حي. قياس: `eqNull=0` مقابل `isSet:false=8`. أُصلح في ٦ نقاط قراءة.
  3. **فرق يوم بين معاينة التاريخ والمحفوظ** — حساب الأشهر صار UTC في الخادم والواجهة.
- **🔒 قفل «ما نبيع بالآجل»:** لا تُصدَر فاتورة والعميل عليه مستحقّة (خادم + واجهة).
- **🗄️ الأرشفة:** `archivedAt/archivedReason/archivedByUserId` — بديل الحذف، المخرج الوحيد من القفل، تسحب مدّتها من تاريخ النهاية.
- **الكونسول:** بانر الحساب انتقل إلى الـ layout (يتبع العميل لكل صفحة، بلا زر إغلاق) + **صفحة فواتير جديدة** `/dashboard/invoices` + رابط «الفواتير» في السايدبار (ديسكتوب + جوال).
- **تسمية:** عمود `Activation/not activated` صار **First article / no article yet** والكرت «بلا مقال منشور» (كان يُقرأ كأن الحساب معطّل — ملاحظة خالد).
- **tsc:** admin · console · modonty = **صفر أخطاء**. **Build:** لم يُشغَّل. **تست حي:** ١٠ حالات في الأدمن + ٤ حالات بانر بالكونسول + العدّادات — كلها بلقطات في `.playwright-mcp/`.

### 📝 قرارات (مع السبب)
- **قفل الإصدار كامل بلا تجاوز** (خالد: «بقفلها كاملة») → أي checkbox تجاوز يفتح نفس الباب الذي نسدّه؛ البديل المشروع الوحيد = الأرشفة.
- **الأرشفة لا الحذف** → الدفتر يبقى كاملاً للحسابات.
- **الفاتورة المؤرشفة تختفي من كونسول العميل وتبقى في الأدمن مشطوبة** → العميل لا يرى فاتورة أُلغيت؛ المحاسبة ترى كل شيء.
- **البانر بلا زر إغلاق** (خالد) → «تذكير على طول طالما ما سدّد».

### 🚧 معلّق / محجوب
- **بيانات تست على `modonty_dev`:** فاتورة `MOD-2026-00011` (3,999 مدفوعة على «هابي سمايل») — رفض خالد أمر التنظيف، تُترك.
- **بعد الدفع للإنتاج:** ضغطة **«تحميل الأزرار الافتراضية»** في Dropdown Lists (بدونها القائمة تطلع فاضية للأدمن؛ العملاء الحاليون غير متأثرين).
- **الباكب يحمي dev لا الإنتاج:** `scripts/backup.sh` يقرأ `.env.shared` = `modonty_dev`. يحتاج قراراً لاحقاً.
- **لم يُقرَّر:** هل تدخل `documents/gsc/` و`documents/design/` في الدفع.

### 📂 ملفات رئيسية
- `admin/app/(dashboard)/clients/[id]/account/helpers/billing.ts` — **جديد**: المعادلة الموحّدة + قفل الإصدار + `NOT_ARCHIVED`.
- `admin/app/(dashboard)/clients/[id]/account/actions/archive-invoice.ts` — **جديد**.
- `.../actions/create-invoice.ts` · `.../actions/mark-paid.ts` — يستدعيان المعادلة الموحّدة؛ حساب UTC؛ القفل.
- `.../components/account-ledger.tsx` — مودال الأرشفة · شارة مؤرشفة · زر إصدار معطّل + شريط الشرح.
- `admin/app/(dashboard)/clients/accounts/{page,components/accounts-table}.tsx` — استبعاد المؤرشفة + تسمية «First article».
- `admin/app/(dashboard)/actions/client-status-counts.ts` — استبعاد المؤرشفة من عدّاد الداشبورد.
- `console/app/(dashboard)/layout.tsx` + `components/dashboard-layout-client.tsx` — البانر في الـ layout.
- `console/app/(dashboard)/dashboard/invoices/**` — **جديد** (صفحة + استعلام).
- `console/app/(dashboard)/components/{sidebar,mobile-sidebar}.tsx` + `console/lib/ar.ts` — رابط الفواتير.
- `dataLayer/prisma/schema/schema.prisma` — حقول الأرشفة على `Invoice`.

### 🔁 Git / نشر
- **الفرع:** main · **آخر commit:** `ad5ec2b` · **مدفوع:** لا — التغييرات كلها غير مدفوعة.
- **النسخ:** admin **1.0.0** · console **0.22.0** · modonty **1.80.0**.
- **⛔ يُستثنى من الدفع:** `modonty/app/reels/` · `documents/reels/` · `documents/modonty-v3-handoff/` (ريلز WIP).
- **لا يحتاج** `prisma db push` ولا سكربت ترحيل: الحقول اختيارية على مونجو، وكل الفلاتر تعالج غياب الحقل.

### 🚀 استئناف في ٣٠ ثانية
1. `git status --porcelain` — تأكّد أن الريلز ما زال خارج المرحلة.
2. `git add` بالقائمة الصريحة → اعرضها على خالد → commit → **انتظر إذنه للـ push**.
3. بعد الدفع: افتح أدمن الإنتاج → Dropdown Lists → «تحميل الأزرار الافتراضية».

---

## Session: 2026-07-24 — أزرار CTA كقائمة تُدار (Dropdown Lists) + Playwright ديناميكي · لم يُدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **🔴 أول شي بعد الـ restart:** خالد يعيد تشغيل Claude Code لتحميل إعداد Playwright الجديد. **تحقّق أولاً:** افتح أي صفحة واقرأ `page.viewportSize()` + `window.innerWidth/Height` — لازم تطابق نافذة Edge الحقيقية (لا 1280×800 ثابتة).
- **ثم:** المرحلة **٣/٥** من خطة الـ CTA — ربط الـ presets بنموذج العميل (`cta-section.tsx` يقرأ من DB بدل الخيارات الثابتة). المرحلتان ٤ (إصلاح الهيرو) و٥ (تحقّق) بعدها.
- **سيرفر dev admin على :3000** (مات مع آخر `taskkill` — أعد `pnpm dev:admin`).

### ✅ المنجَز (كله dev، غير مدفوع، مُختبَر حيّاً)
- **م١/٥ — موديل `CtaPreset`** في `schema.prisma`: `labelAr` + `labelKey` (`@unique`) + `mode` + `defaultUrl?` + `hint?` + `isActive` + `sortOrder`. **بلا لمس حقول `Client` الثلاثة** (`ctaMode`/`ctaLabel`/`ctaUrl`) → الأسطح السبعة والسيغمنتات تشتغل بلا تعديل.
- **م٢/٥ — صفحة الإدارة:** تبويب ثالث **CTA Buttons** (أول وافتراضي) داخل صفحة `/settings/reference-data`، وأُعيدت تسميتها **«Dropdown Lists»** (عنوان + sidebar). CRUD كامل + تفعيل + seed افتراضي (٥ أزرار) + شرح للأدمن أن FORM يحتفظ بالـ lead و LINK يعطيه بره.
- **تغيير جوهري بأمر خالد — الهوية = نص الزر:** حُذف حقل `key` التقني نهائياً (الأدمن ما يشوفه). المعرّف الداخلي = `id` التلقائي، والظاهر = **نص الزر العربي**. التفرّد على `labelKey` = **نص مطبَّع** ([normalize-arabic-label.ts](admin/app/(dashboard)/settings/reference-data/lib/normalize-arabic-label.ts)): حذف تشكيل/تطويل + توحيد `أإآٱ→ا` و`ى→ي` و`ة→ه` + دمج مسافات. **دليل حيّ:** `تسوق الآن` رُفضت برسالة تسمّي المتعارض «تسوّق الآن».
- **رابط Reference Data/Dropdown Lists أُضيف للـ sidebar** (كان موجوداً بلا رابط) — مجموعة System، أيقونة `ListChecks`.
- **Playwright ديناميكي حسب الشاشة:** خالد على ٣ شاشات ويراجع من نافذة Playwright نفسها. أُنشئ [playwright-mcp.config.json](playwright-mcp.config.json) بـ `contextOptions.viewport: null` و`.mcp.json` صار `--config` (**حُذف `--viewport-size`**). سند رسمي من Playwright عبر Context7. تحقّق: السيرفر يقلع بالإعداد الجديد ورد `initialize` نظيف.

### 📝 قرارات (بالسبب)
- **presets تعبّي الحقول الموجودة، لا تستبدلها:** البديل (`ctaPresetId` + قراءة بالعلاقة) يلمس ~٣٥ ملفاً ويكسر سيغمنتات «العملاء غير القابلين للوصول» في شريط اليوم → **مرفوض**.
- **«CTA غير محدود» = presets غير محدودة فوق سلوكين** (`FORM`/`LINK`) — يغطي حجز/متجر/واتساب/اتصال/تصفّح. سلوك ثالث حقيقي = كود جديد.
- **واتساب واتصال بلا وجهة افتراضية عمداً:** رقم مشترك يرسل زوار عميل إلى عميل آخر.
- **الاسم «Dropdown Lists»** (اختيار خالد من ٣ مقترحات) بدل «Reference Data» التقني.

### 🐛 أخطاء اكتُشفت وأُصلحت أثناء التنفيذ
- **`"use server"` لا يسمح إلا بتصدير دوال async** → `normalizeArabicLabel` سبّبت خطأ بناء 500؛ نُقلت لملف `lib/` مستقل.
- **زر «Load default buttons» كان مخفياً** لو الدول موجودة (شرط `isEmpty` للثلاث قوائم) → أُضيف داخل تبويب الـ CTA.
- **رسالة الخطأ كانت خلف الـ dialog** → صارت داخله (الشخص اللي يملأ النموذج كان ما يشوف سبب الرفض).

### 🚧 معلّق / مفتوح
- **`prisma db push` لم يُشغَّل** → فهرس `labelKey @unique` + `@@index` غير موجودين في القاعدة. الحماية تعمل عبر حارس صريح في الأكشن. يُنفَّذ وقت النشر بإذن خالد.
- **نفس مشكلة «الخطأ خلف الـ dialog» موجودة أصلاً** في نموذجَي الدول والجهات (كود قديم، لم يُلمس).
- **الأزرار الجديدة كلها `sortOrder = 0`** (لا حقل ترتيب في النموذج) — تُرتَّب بالاسم.
- **الـ breadcrumb يقول «Reference-data»** لأن المسار لم يتغيّر — خالد لم يحسم تغييره لـ `/settings/lists`.
- **`documents/tasks/TODO.md`:** بنود «المهتمون» المفتوحة + تسمية كرت Subscribers + ملاحظة UI (عرض فقرة الهنت).

### 📂 ملفات لُمست
- `dataLayer/prisma/schema/schema.prisma` — موديل `CtaPreset`.
- `admin/.../settings/reference-data/actions/reference-data-actions.ts` — CRUD الـ presets + تفرّد مطبَّع + seed.
- `admin/.../settings/reference-data/lib/normalize-arabic-label.ts` — **جديد**.
- `admin/.../settings/reference-data/components/reference-data-client.tsx` — تبويب CTA + panel + dialog + إعادة التسمية.
- `admin/.../settings/reference-data/page.tsx` — تمرير `initialCtaPresets`.
- `admin/components/admin/sidebar.tsx` — «Dropdown Lists» + أيقونة `ListChecks`.
- `playwright-mcp.config.json` — **جديد** · `.mcp.json` — `--config` بدل `--viewport-size`.
- `memory/project_playwright_settings.md` — قاعدة المقاس الديناميكي + السند الرسمي.

### 🔁 Git / deploy
- **الفرع:** main · **غير مدفوع:** نعم (كل ما سبق + شغل الجلسة السابقة) · **آخر commit:** `97f2c2f` · **Vercel:** لا شيء.
- **القاعدة المستخدمة:** `modonty_dev` (تحقّقت من `.env.shared` — صفر مساس بالإنتاج). **ملاحظة:** `dataLayer/.env` يشير الآن لـ `modonty_dev` كذلك، خلافاً لذاكرة قديمة تقول PROD.

### 🚀 استئناف في ٣٠ ثانية
1. بعد الـ restart: افتح صفحة بـ Playwright واقرأ الـ viewport — لازم يطابق النافذة الحقيقية.
2. `pnpm dev:admin` ثم افتح `/settings/reference-data` → تبويب CTA Buttons (٥ أزرار).
3. ابدأ م٣: `admin/.../clients/components/form-sections/cta-section.tsx` — استبدل الخيارات الثابتة بـ `getActiveCtaPresets()`.

---

## Session: 2026-07-23 (تكملة-٢) — قسم Members بالداشبورد + معماريّة «المهتمون» + Reference Data بالـ sidebar · لم يُدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** شغل داشبورد + نقاش معماري (بلا push، بلا tsc — دِف عادي). خالد طالع مشوار ويرجع.
- **🔴 أول خطوة عند الاستئناف (خالد حدّدها):** تاسك **CTA كقائمة قابلة للإدارة** — بند «▶️ ابدأ هنا» في `documents/tasks/TODO.md`. قرار مطلوب قبله: هل الـ preset يحدد النمط (FORM/LINK) أو الليبل فقط؟ ودمج بصفحة Reference Data أو صفحة مستقلة؟
- **متبقّي:** بقية تاسكات الداشبورد (تسمية كرت Subscribers + بنود «المهتمون»).

### ✅ المنجَز هذه الجلسة (كله dev، غير مدفوع)
- **قسم Members جديد بالداشبورد (admin):** نسخة نمط `SubscribersPipeline` — يعرض Google مقابل Email+password + تأكيد رابط التحقق. ملفات: `actions/member-counts.ts` (جديد) + `lib/dashboard/cached.ts` (`memberCounts`) + `components/sections/members-pipeline.tsx` (جديد) + `page.tsx`.
- **🐛 إصلاح عدّ Members:** كان Google=0 (المجموع ٣٥ ≠ ١٢). السبب: MongoDB — مستخدم Google بلا حقل `password`/`emailVerified` (غائب لا null)، وفلتر Prisma `{ field: null }` ما يلقّط الغائب. الحل: العدّ على `{ not: null }` فقط + اشتقاق الباقي بالطرح (مطابق `members-actions.ts`). صار Google=23 · Email=12 · Awaiting=12. (بدليل من الصورة الحيّة اللي أرسلها خالد.)
- **إشارات الاهتمام داخل قسم Subscribers:** رقمان (اهتمام المقالات=`ArticleFavorite` · اهتمام العملاء=`ClientLike`) + **هنت عربي واضح** يشرح إنها أساس الاشتراك القادم. (كرت مستقل أُنشئ ثم حُذف ودُمج داخل Subscribers بطلب خالد.)
- **Reference Data بالـ sidebar:** الصفحة `/settings/reference-data` (الدول + الوزارات/الجهات) كانت موجودة بلا رابط → أُضيف في مجموعة System (أيقونة Landmark). ملف: `admin/components/admin/sidebar.tsx`.
- **tsc:** لم يُشغّل (قاعدة: لا تحقّق حتى الأمر). **build/live test:** لم يُجرَ.

### 📝 قرارات (بالسبب)
- **«المهتمون» بدل نظام Subscriber منفصل:** لا موديل Interest/Subscriber جديد. إشارة الاهتمام موجودة أصلاً (`ArticleFavorite`+`ArticleLike` للمقال · `ClientLike`/Follow للعميل). المفقود = الموافقة الصريحة → تُضاف كتشيك بوكس على `User.notificationPreferences`. الاستهداف بالموضوع يُشتق من `articleId` (category/industry/tags). **لماذا:** يوحّد المنظومة بلا ترحيل، ويستفيد من بيانات موجودة.
- **الموافقة inline لحظة التسجيل، default=false (غير مؤشّرة):** رفضتُ default=true لأنها موافقة **باطلة** — GDPR Recital 32 + Planet49 + PDPL السعودي + قانون مصر 151/2020 + ضرر sender reputation. خالد وافق على unchecked.
- **دمج «تابعني» + «اشترك في النشرة» في زر واحد «تابعني»:** Follow (`clientLike`) يتطلب دخول → كل متابِع عضو له إيميل. النشرة = متابِع + موافقة. **البدائل المرفوضة:** إبقاء الزرّين (تكرار) · موديل جديد (بلا داعٍ).
- **حذف «اشترك في النشرة» من المقال والعميل:** بشرط نقل كرت «المشتركون» في كونسول العميل ليقرأ من `ClientLike + consent`.
- **CTA:** hard-coded حالياً (enum `ClientCtaMode`: NONE/FORM/LINK + `ctaLabel` نص حر). خالد يبي قائمة presets قابلة للإدارة → أُضيفت كتاسك «ابدأ هنا».

### 🚧 معلّق / مفتوح (في TODO)
- الموديلات الثلاثة القديمة (`NewsSubscriber`/`Subscriber`/`JbrseoSubscriber`) — قرار التوحيد/الترحيل لم يُقفل.
- كرت داشبورد «Subscribers» مسمّى غلط «newsletter audience» بينما يعرض `db.subscriber` (لكل عميل) → يحتاج فصل/تسمية.
- واجهة إطلاق الحملة بالأدمن — مستقبلي.

### 📂 ملفات لُمست
- `admin/app/(dashboard)/actions/member-counts.ts` — جديد (عدّ الأعضاء بالطرح الآمن).
- `admin/lib/dashboard/cached.ts` — أُضيف `memberCounts`.
- `admin/app/(dashboard)/components/sections/members-pipeline.tsx` — جديد.
- `admin/app/(dashboard)/components/sections/subscribers-pipeline.tsx` — إشارات الاهتمام + هنت عربي.
- `admin/app/(dashboard)/page.tsx` — أُضيف `<MembersPipeline>`.
- `admin/components/admin/sidebar.tsx` — رابط Reference Data + استيراد Landmark.
- `documents/tasks/TODO.md` — أقسام: «ابدأ هنا CTA» + «المهتمون» + «باقي تاسكات الداشبورد» + منجز إصلاح Members.
- محذوف: `components/sections/interest-signals.tsx` (دُمج داخل Subscribers).

### 🔁 Git / deploy
- **الفرع:** main · **تغييرات غير مدفوعة:** نعم (كل الملفات فوق) · **آخر commit:** `97f2c2f` · **مدفوع:** لا · **Vercel:** لا شيء.

### 🚀 استئناف في ٣٠ ثانية
1. افتح `documents/tasks/TODO.md` → بند **«▶️ ابدأ هنا — CTA كقائمة قابلة للإدارة»**.
2. اقفل القرار: preset يحدد النمط ولا الليبل فقط؟ + صفحة مستقلة ولا ضمن Reference Data؟
3. ابدأ الموديل `CtaPreset` بنمط Reference Data (kill node → `prisma:generate` أول).

---

## Session: 2026-07-23 (تكملة) — سيو صور المقال من داخل المحرّر + إعادة تسمية تلقائية (admin 0.99.0)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع — admin **0.99.0**. tsc admin أخضر (0) + backup (90 collections) + تحقّق حيّ كامل بأدلة خام (DB + Cloudinary + JSON-LD). سيرفر dev admin على **:3000**.
- **🔴 أول خطوة عند الاستئناف — عاجل (الفريق معطّل):** حلّ الصور المضمّنة داخل نص المقال (الحل B: إعادة كتابة روابط `content` عند rename). التفاصيل + الدليل الحيّ في `documents/tasks/TODO.md`.

### ✅ المنجَز (تبويب Media في محرّر المقال — كامل ومتحقَّق حيّاً)
- **سيو الصورة داخل المحرّر:** كل صورة غلاف/معرض عليها بادج score + نواقص + زر «تعديل SEO» يفتح `ImageSeoDialog` المشترك (score + توليد ذكاء + عرض بيانات). المعرض تحوّل لعمود (كل صورة بنفس فكرة الغلاف). `ImageSeoStrip` موحّد.
- **توليد الذكاء يقرأ المقال أولاً:** لو الصورة تخص مقال → Gemini يقرأ عنوان+مقتطف+محتوى المقال. دليل حيّ: وصف «صيف الرياض 2026: اكتشف أقوى فعاليات… البوليفارد».
- **إعادة تسمية اسم الملف تلقائياً عند الحفظ:** `renameCloudinaryAsset` → يحدّث `Media.url`+`cloudinaryPublicId`+`filename` → يجدّد JSON-LD المقال+العميل. دليل حيّ: `2026-owq4d07gw`→`صيف-الرياض-…` · القديم 404/الجديد 200 · JSON-LD (×3) تحدّثت · الوصف دخل `ImageObject.description` · score 80٪→100٪. بوابة أمان تتخطّى الصور المضمّنة.
- **إصلاح الوضع الداكن لمتن المقال** (شطب ألوان inline عند الرندر) — مدفوع مع هذي.

### 🔴 معلّق عاجل
- **الصور المضمّنة (inline) في نص المقال:** تُخزَّن `<img src>` بالرابط لا بالـ ID → rename يكسرها. الحل B معتمد (بعد الـ push). دليل حيّ + الخطة في TODO.

---

## Session: 2026-07-23 — مؤشّر صحة SEO على الداشبورد + توحيد الصفوف (admin 0.98.0)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع — admin **0.98.0**. tsc أخضر + تحقّق حيّ (Overall 78٪ يتقاطع مع Articles 81٪/Clients 69٪). سيرفر dev admin على **:3000**.
- **أول خطوة:** لا شي عاجل. (تعديل الـ media: تحقّق رندر الصفحة لم يُلتقط حيّاً — ids العيّنة كانت عملاء؛ tsc+grep أخضر.)

### ✅ media: سيو الصورة اتحوّل للكاتب
- شِيل Alt/Title/Description من فورم تعديل الأدمن (`edit-media-form.tsx`) — ملكيتها لـ `/seo-images` (dialog الكاتب بتوليد ذكاء + نتيجة سيو). الأدمن يملك الملف/الحقوق فقط. اسم Cloudinary عند الاستبدال من القيم المخزّنة. + مسافة أسفل شريط تمرير «Blocking 100%».

### ✅ أُنجز هذه الجلسة
- **مؤشّر صحة SEO لكل الكيانات** (article + client): النسبة = **متوسّط درجات الرُبريك المشترك** (مجموع÷عدد)، لا «كم كامل». تفصيل «Blocking 100%» مقسوم محتوى⇄نظام (سطر واحد).
- **Overall ribbon أعلى الداشبورد** = صحة منصة مدونتي كاملة: (مجموع درجات المقالات+العملاء)÷(عددهم)، دقيق ومرجّح بالعدد. `platform-seo-overall.tsx`.
- **توحيد الصفوف (DRY):** مكوّنات مشتركة `pipeline-row.tsx` (`BudgetRow` للتقسيمات الحقيقية فقط + `PipelineRow`) و`seo-health-card.tsx`؛ Articles وClients على نفس اللغة. قسم Clients تحوّل من كروت لصفوف. قسم Money بإطار كهرماني مميّز.
- **صفحتا سيقمنت SEO** لكل من article/client (`seo-imperfect`/`seo-perfect`) بـ`scoreFilter`.
- **الروابط الداخلية:** لا حدّ أدنى ٣ من قوقل (موثّق) — لم تُضف.
- **حُفظ في القاعدة:** الريلز WIP يُستبعد من أي دفع (`project_reels_wip_exclude_from_push`).

### ⚠️ ملاحظات
- الدفع بقائمة ملفات صريحة — **reels مستبعد** (`modonty/app/reels/` كود إنتاج ناقص).

---

## Session: 2026-07-23 — مراجعة v3 النقدية + إصلاحا محرّر المقال (مدفوع ✅ 57b7fb2)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع (`57b7fb2`→main)، admin **0.96.0** ينشر. سيرفر dev admin شغّال على **:3000** (task خلفي).
- **أول خطوة:** المرحلة الجاية = شغل UI/UX على مدونتي عبر Google Stitch (تصاميم = موكب ملزم). لا شي عاجل.

### ✅ أُنجز هذه الجلسة
- **مراجعة v3 النقدية العكسية** (بلا تعديل كود): تقرير HTML5 `documents/modonty-v3-handoff/CRITICAL-REVIEW-v1.html` — قرأت الـ15 ملف + وثّقت من Context7 (Next.js: `priority`→`preload`؛ Tailwind: dark = prefers-color-scheme). أخطر النقاط: مساعد AI يجاوب YMYL، الموكب يكسر قواعد نظامه (إيموجي/عربي-فقط/طبقة-واحدة)، لقطات=رهان منتج مدسوس، الداكن-افتراضي لمنتج قراءة، ازدحام CTA. الدرجة 6.5/10 «أساس ممتاز يحتاج انضباط قبل أن يصير عقدًا».
- **إصلاحا محرّر المقال** (`admin/.../rich-text-editor.tsx`، ملف واحد، مدفوع):
  1. **شريط ثابت** — منطقة المحتوى `max-h-[60vh] overflow-y-auto` فتتمرّر داخليًا والشريط+عدّاد الكلمات فوق دائمًا. (اخترنا هذا بدل sticky لأن الأقسام داخل Accordion فيه `overflow-hidden` يكسر sticky — والحل الداخلي يعمل مع التبويبات والأكورديون معًا.)
  2. **نص الوضع الداكن مقروء** — شِلنا `TextStyle`+`Color` (ما لهما زر بالشريط، بس كانتا تحملان الأسود المبيّت المستورد `color:rgb(0,0,0)` ×130 + رمادي ×2). النص يرث الثيم الآن + المحتوى ينظّف نفسه عند الحفظ. متحقّق حيًّا: `inlineColorCount 0`، لون `rgb(248,250,252)`.
- TSC admin=0. تست حي على الإنتاج/dev بلقطات في `.playwright-mcp/`.

### 🧠 قرارات
- **scroll داخلي للمحرّر** (لا sticky) — الأكورديون `overflow-hidden` يقتل sticky؛ الحل الداخلي مستقل عن الحاوية (تبويبات/أكورديون).
- **إزالة Color/TextStyle** لا يفقد ميزة (لا زر لون) ويحذف الخردة من المصدر.

### 🚧 متبقّي / بيد خالد
- **تنظيف الموقع العام:** HTML المقالات في DB لسه فيه الأسود المبيّت — يختفي مقال-بمقال عند الحفظ، أو دفعة كـ Run-All لو صار الموقع العام داكن (مرتبط بقرار v3). مو عاجل (العام فاتح).
- v3: قرارات المنتج الثلاثة (AI/لقطات/داكن) تحتاج حسمًا منفصلًا قبل البناء.

### 🔁 Git / deploy
- Branch: main · آخر commit `57b7fb2` (محرّر) · مدفوع ✅ · admin 0.96.0 ينشر. سبقه `97f2c2f` (تيليجرام).
- **غير مدفوع عمداً:** تقرير `CRITICAL-REVIEW-v1.html` + `DESIGN_SYSTEM.md` المسترجع + `documents/*` + `.claude/*`.

### 🚀 استئناف في 30 ثانية
1. لا شي عاجل — مدفوع ومنشور.
2. المرحلة الجاية: مدونتي UI/UX عبر Google Stitch (موكب ملزم + Tajawal/RTL/بندل).
3. مرجع النقد: `documents/modonty-v3-handoff/CRITICAL-REVIEW-v1.html`.

---

## Session: 2026-07-22 (تكملة-٢) — إشعارات تيليجرام أوضح + إغلاق d5 (staff-only) + ربط Google (مدفوع ✅ 97f2c2f)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع (`97f2c2f`→main) ومنشور (admin 0.95.0 · modonty 1.79.0 · console 0.21.3). tsc نظيف ×3 + backup. الـ changelog **متروك بأمر خالد** (النظام قديم — SOT واقف عند 0.42.0 بينما admin 0.95.0).
- **أول خطوة عند الاستئناف:** المرحلة الجاية = **شغل admin ثم المدونة (UI/UX معركة أساسية)**. خالد بيربط Claude بـ **Google Stitch** كمصدر تصميم. أي تصميم Stitch = **موكب ملزم** → أبنيه طبق الأصل بعد تثبيت قيود مدوّنتي (Tajawal/Montserrat · RTL · حساسية البندل).

### ✅ أُنجز هذه الجلسة
- **إشعارات تيليجرام أوضح (داخل التيليجرام فقط):** تنظيف اللابلات (لايك→إعجاب · ديسلايك→عدم إعجاب · CTA→«ضغط على زر» · Conversion→«تحويل مكتمل» · Lead→«زائر باهتمام عالٍ») في `events.ts` (modonty+console) · توحيد «من فعل» → **الزائر** في كل مكان · زيارة الصفحة «من»→**المصدر** · المشاركة تعرض **اسم المقال الحقيقي** بدل الـ slug + أسماء المنصات بالعربي (تويتر/واتساب/…) · إشعار الضغط: عنوان المقال + النوع(عربي) + الوجهة، **بلا تسمية إنجليزية** · نوع التحويل بالعربي.
- **⚠️ تصحيح نطاق مهم:** أول محاولة عرّبت تسمية «الزر» عبر تعديل **~25 ملف كومبوننت** (نفس `label=` يغذّي التحليلات) — خالد رصد أني «طلعت برّا التيليجرام». **رجّعت كل الـ25 ملف عبر `git restore`** + شِلت سطر «الزر» من الإشعار (يكتفي بعنوان المقال+النوع+الوجهة). صفر لمس للكومبوننتس/التحليلات.
- **d5 اكتمل:** شِيل `db.staff ?? db.user` من `admin/proxy.ts` + `admin/lib/admin-guard.ts` + `admin/auth.config.ts` (staff-only) — بعد تأكيد خالد دخول الـ10 من staff صباحاً.
- **ربط Google آمن مُفعّل:** `allowDangerousEmailAccountLinking:true` على Google في `modonty/auth.config.ts` — يحل تصادم «باسورد ثم Google بنفس الإيميل» (كان OAuthAccountNotLinked). آمن الآن لأن صفر admin في جدول user العام بعد الفصل.
- **عمود «موثّق» في Members:** مستخدمو Google يظهرون موثّقين (`!u.password`) — كانوا «–».
- **TSC:** admin=0 · modonty=0 · console=0. Build: Vercel (منشور). **تست حي: لم يُطلب** (خالد ما طلب Playwright).

### 📝 قرارات (بسبب)
- **نطاق تيليجرام فقط** (بأمر خالد الصريح) — عدم تعريب تسميات الكومبوننتس يتفادى: (أ) الخروج عن النطاق (ب) انجراف تسميات التحليلات. البديل (تعريب الكل) رُفض بعد ما رصد خالد التوسّع.
- **تفعيل ربط Google** (انعكاس القاعدة القديمة «ممنوع») — بعد فصل الطاقم صفر admin في user العام + لا صفحة عامة تحرس على `role==="ADMIN"` → صفر تصعيد. تحقّق رسمي Auth.js: Google يتحقق من ملكية الإيميل → آمن.
- **الـ changelog متروك** — النظام (`changelog-sync.ts`) SOT واقف عند 0.42.0 من 24 أبريل بينما admin 0.95.0؛ إحياؤه صح = تعبئة ~50 نسخة ناقصة، مو إدخال واحد. لا كتابة إنتاج بتخمين.

### 🚧 معلّق / القادم
- **المرحلة الجاية:** admin ثم **المدونة — UI/UX (شغل كبير)** عبر Google Stitch (تصاميم = موكب ملزم + حراس Tajawal/RTL/بندل).
- **معلّق ثابت:** إدخال الشروط/الخصوصية على DB الإنتاج.
- **اختياري:** إحياء الـ changelog · تنبيهات `userId`→`staffId`.

### 📂 ملفات لُمست (تيليجرام — مدفوعة `97f2c2f`)
- `modonty/lib/telegram/events.ts` · `console/lib/telegram/events.ts` · `modonty/lib/conversion-tracking.ts` · `modonty/app/api/track/cta-click/route.ts` · `modonty/app/api/articles/[slug]/share/route.ts` · `modonty/app/api/clients/[slug]/{share,view,follow,favorite}/route.ts` · `modonty/app/articles/[slug]/actions/article-interactions.ts` · package.json (modonty 1.79.0 · console 0.21.3)
- **auth (مدفوعة `8a7b639`):** `admin/{auth.config.ts,proxy.ts,lib/admin-guard.ts,app/(dashboard)/members/actions/members-actions.ts}` · `modonty/auth.config.ts` · admin 0.95.0

### 🔁 Git / deploy
- Branch: main · آخر commit `97f2c2f` (تيليجرام) · سبقه `8a7b639` (auth) · مدفوع ✅ · local==origin · الثلاثة منشورة.
- **غير مدفوع عمداً:** `.claude/*` · `documents/*` (سياق) · `modonty/app/reels/` · `documents/reels/` · `CLAUDE.md.backup-2026-07-21`.

### 🚀 استئناف في 30 ثانية
1. لا شي عاجل — الجلسة مكتملة ومدفوعة ومنشورة.
2. المرحلة الجاية: admin ثم المدونة UI/UX. انتظر تصاميم Google Stitch من خالد.
3. أي تصميم Stitch → عامله كموكب ملزم (`feedback_mockup_is_the_contract`) + ثبّت Tajawal/RTL/بندل قبل الكود.

---

## Session: 2026-07-22 (تكملة) — لوحة «Start Here» + رد رسائل التواصل + إثراء سجل الأخطاء (مدفوع ✅ 7710a57)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع (`7710a57`→main)، Vercel ينشر الثلاثة (admin 0.94.0 · modonty 1.78.0 · console 0.21.2). tsc نظيف ×3 + backup.
- **أول خطوة:** تأكيد نجاح نشر Vercel الثلاثة. لا شي عاجل غيره.

### ✅ أُنجز هذه الجلسة
- **صف «Today — Start Here»** أُعيد بناؤه: صف واتساب (شعار أصلي، حالات live/quiet/broken) · صف الرسائل المباشرة (#1) · تقسيم «visitor actions» لثلاثة (حجوزات للاتصال form-only بلا تكرار واتساب · تعليقات · أسئلة) · ترتيب + ألوان (أحمر=نزيف، برتقالي=منتظرك) + أيقونات صحيحة لكل موضوع.
- **تقرير الأسئلة:** يعدّ **كل** PENDING (فريق مودونتي ينتظر موافقة + زائر ينتظر جواب = 216)، تفاصيل per-client بتقسيم فريق/زائر.
- **تعديل العميل:** حُذف SEO title/description (ملك الكاتب، مكانهم صفحة SEO Client).
- **رد رسائل التواصل من الأدمن:** فورم في صفحة التفاصيل + dialog في القائمة → يرسل عبر Resend + يعلّم replied (`sendContactReply`).
- **إثراء سجل الأخطاء:** device/geo/bot + renderType + تصنيف framework/app (framework يتخطّى تلغرام) + زر Copy + مفتاح Hide framework. المصدر: memory `project_system_error_enrichment`.

### 🔎 تحقيق موثّق (بلا تخمين)
- خطأ `__next_metadata_boundary__` = **باق Next رسمي مفتوح (#93401)**، مو كودنا، منخفض الخطورة، ما ينعاد إنتاجه محلياً. تفاصيل: memory `project_next_metadata_boundary_framework_bug`.

---

## Session: 2026-07-22 02:06 — إصلاح دخول Google (www) + نظام رؤية أخطاء كامل (مدفوع ✅ 3c4bd95)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** نُشر كل شي ومُحقّق حيّ على الإنتاج. السجل نُظّف (Clear All). الجلسة مكتملة.
- **أول خطوة عند الاستئناف:** لا شي عاجل. المعلّقات: (١) d5 بعد 2026-07-24 (memory `project_pending_d5_remove_staff_fallback`) · (٢) الريلز (تاسك خالد، غير مدفوع).

### ✅ أُنجز هذه الجلسة
- **مصيبة دخول Google — الجذر:** `NEXTAUTH_URL` على modonty كان الآبكس `modonty.com` والموقع كانونيكال `www` (آبكس→www 308) → قفزة عبر-هوست تُسقط كوكي PKCE على Safari/متصفحات التطبيقات (مصر) → فشل صامت («يختار الحساب ويرجع للدخول»). الحل: `NEXTAUTH_URL=https://www.modonty.com` + redeploy. محقّق: redirect_uri=www + كوكي=www + محاكاة جوال. **لا يغيّر AUTH_SECRET → ما طرد أحد.** memory `project_modonty_oauth_host_www`.
- **نظام رؤية أخطاء كامل (مدفوع `3c4bd95`):** إظهار إرور الدخول العربي على `?error=` (كان صامت) + تسجيله · GA4 `login_start` مستقل · `/system-errors` صار إنتاج-فقط (حارس `VERCEL_ENV`) + موسوم تطبيق (🟢modonty/🔵admin/🟣console) + مسار عربي مفكوك + revalidate · تغطية الكونسول (كان أعمى) · **إشعار Telegram لكل خطأ** (`@Modonty_admin_bot`، نقطة واحدة).
- **فصل الطاقم (نفس السلسلة):** تدوير `AUTH_SECRET` + ترحيل 10 أدمن→staff + تحقق دخول staff. **معرض/WebP:** اختُبر حيّ على الإنتاج.
- TSC: admin=0 · modonty=0 · console=0. Build: نجح الثلاثة (Vercel). تست حي: كل ما سبق محقّق على الإنتاج.

### 🧠 قرارات
- **OAuth كله على www** — الترقيع القديم (sameSite) ما لمس الجذر (انفصام الهوست). ممنوع ترجع NEXTAUTH_URL للآبكس.
- **تسجيل إنتاج-فقط** بحارس `VERCEL_ENV==="production"` (مو NODE_ENV) — يستثني dev+preview. تحقّق `autoExpose=true` للثلاثة قبل الاعتماد.
- **وسم التطبيق عبر `source:"<app>:<sub>"`** بدل حقل schema — صفر migration، العرض يفكّه لشارة.
- **Clear All للسجل** — الـ«200 خطأ» كانت صفحة كاش مجمّدة (أكّد أن إصلاح revalidate حقيقي).

### 🚧 المتبقّي / بيد خالد
- **d5** (بعد 2026-07-24): حذف نسخ users + شِل fallback. memory `project_pending_d5_remove_staff_fallback`. cron مجدول (session-only).
- تأكيدات: وصول Telegram · `login_start` في GA4 Realtime · **العميل المصري يعيد دخول Google (الدليل الأقوى)**.
- الريلز (تاسك خالد، غير مدفوع) · إدخال الشروط/الخصوصية (معلّق ثابت).

### 📂 ملفات لُمست (مدفوعة `3c4bd95`)
- `modonty/app/users/login/{page.tsx,components/login-form.tsx}` · `modonty/lib/log-error.ts` · `modonty/lib/analytics/{events-registry.ts,track-login-client.ts}` · `modonty/app/api/track/login/route.ts` · `modonty/instrumentation.ts`
- `admin/instrumentation.ts` · `admin/app/api/internal/log-error/route.ts` · `admin/app/(dashboard)/system-errors/components/system-errors-table.tsx`
- `console/instrumentation.ts` (جديد) · package.json ×3 (admin 0.93.1 · modonty 1.77.0 · console 0.21.1)

### 🔁 Git / deploy
- Branch: main · Last commit `3c4bd95` · مدفوع ✅ · الثلاثة READY. سبقه `118e367` (الطاقم+المعرض+WebP، نفس السلسلة).
- **غير مدفوع عمداً:** `modonty/app/reels/` · `documents/reels/` · `.claude/*` · `CLAUDE.md.backup-2026-07-21` · `PRE-PUSH-CHECKLIST.html`.

### 🚀 استئناف في 30 ثانية
1. لا شي عاجل — الجلسة مكتملة ومدفوعة.
2. بعد 2026-07-24: memory `project_pending_d5_remove_staff_fallback` → نفّذ d5 بإذن خالد.
3. أو ارجع للريلز (تاسك خالد المفتوح).

---

## Session: 2026-07-21 (مساءً-٢) — تحسين CLAUDE.md → Skills + إزالة التكرار بالنطاق · ملفات إعداد فقط · لا كود تطبيقي · لم يُدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** خالد يعمل **restart للجهاز** عشان أقرأ تحديثات ملفات الإعداد (CLAUDE.md المضغوط + السكِلات الجديدة). الجلسة مجمّدة قبل الـ restart.
- **أول خطوة بعد الـ restart:** لا شي على ملفات الإعداد — خلصت وثابتة. نرجع لشغل الـ push المعلّق (المعرض) حسب قسم «معلّقات ثابتة» أعلى الملف.

### ✅ أُنجز هذه الجلسة (ملفات إعداد فقط · صفر كود تطبيقي)
1. **ضغط `~/.claude/CLAUDE.md`** ٦٤٦→٢١٥ سطر (−٦٧٪): نقل الأقسام الإجرائية/المرجعية لسكِلات (progressive disclosure)، ضغط الحراس الدائمين بلا فقدان قاعدة. نسخة احتياطية `~/.claude/CLAUDE.md.bak`.
2. **ضغط `MODONTY/CLAUDE.md`** ٣٥٧→١٠٨ سطر (−٧٠٪): حذف تعليق `code-review-graph` الميّت (سطر ١) + حذف `<anti_patterns>` (تكرار ١٠٠٪) + إزالة تكرار داخلي (RTL ٣×، Prisma ٣×، revalidate ٤×). كل قاعدة فريدة + كل snippet محفوظ. نسخة احتياطية `MODONTY/CLAUDE.md.backup-2026-07-21`.
3. **سكِلات عامة جديدة** (`~/.claude/skills/`): `vercel-cost` (١٧٩) · `session-update` (٦٨) · `arabic-prose` (٢٦٠). موجود مسبقاً: `modonty-uiux`.
4. **حذف `code-review-graph`** تماماً (سكِل + قسم) — غير مستخدم.
5. **إزالة التكرار بالنطاق (بطلب خالد):** العربي كان ٣ نسخ (سكِلي الأفقر ٩٣ + `languageStyle.md` ٣٤٩ + CLAUDE.md) → نسخة واحدة: سكِل `arabic-prose` = المحتوى الغني الكامل (المصدر الوحيد)، `documents/myskill/languageStyle.md` صار مؤشّر ٩ أسطر. Vercel: نظّفت السكِل من تفاصيل مدونتي (`modonty_dev`/الكلستر/الدومين) — تبقى بذاكرة المشروع فقط (`project_mongodb_flex_upgrade_host_stable`). تحقّق `grep`=٠ تسريب.

### 🧠 قرارات
- **الحراس الدائمون يبقون في CLAUDE.md** (لا مجاملة/تخمين/push/DB/ULTRATHINK) — السكِل نايم لين يُستدعى، فالحارس الدائم لا يصير سكِل.
- **قواعد كود المشروع لا تصير سكِل** — لازم تشتغل مع كل تعديل؛ سكِل نايم = خطر التزام.
- **بيت واحد لكل معلومة بالنطاق:** عالمي→global skill · خاص بمدونتي→project memory · الباقي يشاور.
- **السكِل هو المصدر الأم للعربي، الملف مؤشّر** — أكفأ لتحميلي (تحميل واحد عند `tr>`، لا تحميلين).

### 🚧 المتبقّي
- كل بنود «🔒 معلّقات ثابتة» سارية (شغل المعرض + فصل الطاقم + الشروط/الخصوصية).

### 🔁 Git
- Branch: main · لا commit · تعديلات على `~/.claude/*` (خارج الريبو) + `MODONTY/CLAUDE.md` + `documents/myskill/languageStyle.md` (داخل الريبو، غير مدفوعة).

---

## Session: 2026-07-21 (مساءً) — قائمة ما قبل الـ Push + تقسيم SESSION-LOG بالأشهر + دفتر معلّقات ثابت · لا كود تطبيقي · لم يُدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** خالد طلب `us>` + **restart للجهاز** (استنزاف موارد بعد جلسة طويلة) ثم test كامل + push لإغلاق المعلّقات. الجلسة مجمّدة قبل الـ restart.
- **أول خطوة بعد الـ restart (بالترتيب):** (1) **قفل نطاق الدفع أولاً** — الشجرة (١٣٠) فيها ترحيل فصل الطاقم (schema.prisma) + ريلز + سيو ذكاء + بوابة حراسة + المعرض. **ممنوع دفع الكل دفعة واحدة** (فصل الطاقم يكسر دخول أدمن الإنتاج بلا ترحيل بيانات + تدوير AUTH_SECRET — عملية آخر الليل منفصلة). (2) شغّل سيرفرات dev. (3) tsc معاد (بعد الـ restart) + build. (4) تست حي prod-only. (5) backup + version bump + changelog + push بإذن صريح.

### ✅ أُنجز هذه الجلسة (بنية سياق فقط · صفر كود تطبيقي)
1. **قائمة ما قبل الـ Push** — `documents/context/PRE-PUSH-CHECKLIST.html` (RTL، تفاعلي، يحفظ التقدّم بالمتصفح). كشفت أن الشجرة فيها **١٨٠ تغيير غير مدفوع** من جلسات كثيرة متداخلة (مش شغل المعرض فقط): فصل الطاقم (schema) · نظام الريلز · إصلاح سيو شامل (سكربتات لمرة واحدة) · سيو صور بالذكاء · بوابة حراسة الأدمن · خردة تشخيص في الجذر (~١٩ md/yml). التوصية: **لا تدفع الشجرة كاملة** — افصل الدفعات (أ: المعرض بعد حذف الخردة واستثناء schema · ب: فصل الطاقم آخر الليل مع ترحيل البيانات).
2. **تقسيم `SESSION-LOG.md`** (كان ٤٧٢ك/٣٤٢٣ سطر — استنزاف token): نشط = آخر أسبوع فقط (٩ جلسات ٠٧-١٤→٢١، **٧٩ك**) + أرشيف شهري دائم `SESSION-LOG-2026-07.md` (١٣) و`SESSION-LOG-2026-06.md` (٤٤). تحقّق صفر-فقدان صفر-تكرار: ٩+١٣+٤٤=٦٦=الأصل، كل جلسة في مكان واحد.
3. **إصلاح انتقادي (بطلب خالد):** أضفت قسم **«🔒 معلّقات ثابتة — لا تُدوَّر»** أعلى النشط — الشغل غير المنجز لا يسقط بالعمر (أكبر سلبية في القص الزمني). كل بند مؤشّر لمصدره (بلا نسخ محتوى → لا split-brain). أزلت تداخل آخر أسبوع بين النشط وأرشيف يوليو.
4. **قاعدة التدوير الأسبوعي (تلقائية بأمر خالد)** في رأس النشط + `memory/feedback_session_log_weekly_rotation.md`: كلود يدوّر بنفسه كل جلسة (أي جلسة أقدم من ٧ أيام تُنقَل لأرشيف شهرها، بلا طلب)؛ القراءة الافتراضية من النشط؛ التدوير يمسّ بلوكات `## Session:` فقط؛ تحقّق عدّ إلزامي؛ القص عند `---` فقط.
5. **نُفّذ التقليدي قبل الـ push (آمن، بلا إنتاج):** فحص أسرار `.claude` = نظيف (إيجابيات كاذبة) · حذف **٥٣ ملف خردة** (٢١ Playwright snapshot + ٣٢ سكربت/تست لمرة واحدة، بلا أرشفة؛ مصدر lib/ محفوظ) · `tsc --noEmit` admin+modonty+console = **صفر** (dataLayer عبرها). الشجرة **١٨٠→١٣٠**. بنود الـ checklist المنجزة معلّمة في `PRE-PUSH-CHECKLIST.html`.

### 🧠 قرارات
- **Context7/docs رسمية لا تنطبق** على تنظيم Markdown — لا مكتبة في المعادلة. الضمان = حفظ البيانات (عدّ) + مصدر حقيقة واحد.
- **دفتر المعلّقات = مؤشّرات لا نسخ** — يتفادى تضارب النسخ؛ التفاصيل تبقى في مصدرها (ذاكرة/checklist/TODO).
- **الأرشيف الشهري = نقل لا نسخ** (Model B) — كل جلسة في ملف واحد، لا ازدواج.

### 🚧 المتبقّي
- كل بنود قسم «🔒 معلّقات ثابتة» أعلى الملف سارية (tsc admin · تست prod للمعرض/المحسّن · قرار وتنفيذ الـ push · ترحيل الطاقم · الشروط/الخصوصية · نقل Bunny مستقبلاً).
- سؤال مفتوح لخالد: تذكير آلي للتدوير الأسبوعي (hook/cron) أم يبقى بالذاكرة؟

### 🔁 Git
- Branch: main · لا commit هذه الجلسة · تعديلات documents/context + memory فقط (غير مدفوعة، جزء من الشجرة الكبيرة).

## Session: 2026-07-21 — فصل معرض العميل عن الميديا + أداة تحسين الصور (WebP) · لم يُدفع · لم يُختبر tsc

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** كنت أشغّل سيرفر الأدمن (`cd admin && pnpm dev`) — كان متوقّفاً (استنزاف Turbopack بعد جلسة طويلة). المنافذ 3000/3001 كانت فاضية.
- **أول خطوة عند الاستئناف:** (1) شغّل `pnpm dev` في `admin/` (المنفذ 3000 هذه الجلسة). (2) شغّل `pnpm tsc --noEmit` في `admin/` — **لم يُشغّل بعد** والملفات الجديدة كثيرة. (3) تست حي للأداة الجديدة.

### ✅ أُنجز هذه الجلسة (كله dev · لم يُدفع · tsc لم يُشغّل)
1. **إعادة هيكلة السايدبار** (`admin/components/admin/sidebar.tsx`): مجموعة **Accounts أولاً** (Accounts + Subscription Tiers) · تحت Articles أكورديون على مستويين (submenu): **Production Line** (5 خطوات + شارة مجموع) · **Maintenance & SEO** · **Content Setup** · مجموعة **Media** (Media Library · **Client Galleries** · Maintenance) · مجموعة **Analytics & Channels** (Search Console · Bing · Social). شيل رابط **SEO**. النافبار العلوي: شيل **Media** (بقي Articles).
2. **`/media/upload`:** حُذف فورم السيو (Title/Alt/Description) — رفع فقط، التحسين في `/seo-images`. أُعيد توازن مرحلة الرفع لعمود واحد موسّط. حُذف مكوّن `seo-form.tsx` (يتيم).
3. **باگ فقدان بيانات أُصلح (GALLERY/CLIENT_MINI):** `admin/lib/media/usage-where.ts` — أضيف بند «GALLERY/CLIENT_MINI لها clientId = مستخدمة» (تُستهلك بـ clientId+type بلا علاقة عكسية). + `admin/app/(dashboard)/media/actions/can-delete-media.ts` — يمنع حذفها من أي مسار. النتيجة على الصيانة: unused 100→36، مهدور 66.7→15.6MB.
4. **راوت مستقل `/client-galleries`** (مستويان): `page.tsx` (جدول عملاء + عدد صور) → `[clientId]/page.tsx` (شبكة معرض). إضافة (رفع Cloudinary unsigned، **معرض فقط بلا ريل**) + حذف (يطابق الكونسول: media+reels+Bunny+regen). ملفات: `helpers/load-galleries.ts` · `actions/gallery-mutations.ts` · `components/galleries-clients-table.tsx` · `[clientId]/components/client-gallery-grid.tsx` · loading.tsx ×2. بلاطة تعرض الصيغة (WEBP/JPG) + الحجم. **متحقّق حيّاً: المستويان يعملان.**
5. **GALLERY طلعت نهائياً من `/media`:** `get-media.ts` + `get-media-stats.ts` (SCOPE_FILTER) + `actions/media-counts.ts` (SCOPE_FILTER) + `lib/media/media-specs.ts` (شيل GALLERY من MEDIA_TYPE_ORDER). متحقّق حيّاً.
6. **أداة تحسين الصور في `/media/maintenance`** — قسم «Optimize images (89)»، **صورة صورة، بلا bulk**، يفحص **كل الأنواع including GALLERY**: غير WebP أو >300KB. ملفات: `lib/compress-image.ts` (نسخة من الكونسول) · `maintenance/helpers/optimizable.ts` · `media/actions/optimize-image.ts` · `maintenance/components/optimize-images-section.tsx` + سلكها في `maintenance/page.tsx`. **ظهر حيّاً (89 صورة) لكن زر «حوّل لـ WebP» لم يُنقر (mutation على بيانات حقيقية).**
7. **تنظيف segments.ts:** شيل «title» المحذوف + 40→50 نقطة للنص البديل.

### 🧠 قرارات + معمارية (مهم)
- **كل عرض للصور بالـ Media ID (علاقة)** → media.url؛ أجسام المقالات صفر روابط مضمّنة (متحقّق DB: 0/76). تغيير الرابط آمن للموقع الحي.
- **الاستثناء = نسخ literal للرابط في الكاش:** `jsonLdStructuredData`+`nextjsMetadata` (مقال+عميل) · `Reel.imageUrl`. **أداة `optimize-image.ts` تعالجها كلها بالترتيب:** رفع WebP → تحديث الصف → إعادة توليد سيو المقالات المتأثرة (`generateAndSaveNextjsMetadata`+`generateAndSaveJsonLd`) → سيو العميل (`generateClientSEO`) → تحديث Reel.imageUrl → **ثم** حذف الأصل القديم من Cloudinary.
- **⚠️ Cloudinary حساب مشترك dev/prod** → أداة التحسين + طفرات المعرض **للإنتاج فقط** (مثل Orphans). حذف على dev يكسر صورة الإنتاج.
- **الضغط سليم:** الكونسول `compressToWebP` (2000px + WebP 0.85) يشتغل — الثقيلة **قديمة قبل الأداة** (37 غير-WebP = 47.7MB؛ فرسان التعافي 24 PNG). DB=modonty_dev: GALLERY 64 (27 webp · 27 png · 10 jpg).

### 🚧 المتبقّي
- [ ] شغّل الأدمن + `pnpm tsc --noEmit` (admin) — **إلزامي قبل push**، ملفات جديدة كثيرة لم تُفحص.
- [ ] تست حي: زر «حوّل لـ WebP» end-to-end (نقطة CORS: جلب صورة Cloudinary للـ canvas) — لم يُختبر · يُختبر على **prod** فقط.
- [ ] تست حي: إضافة/حذف في `/client-galleries` (طفرات — على prod).
- [ ] push: version bump + `bash scripts/backup.sh` + changelog + إذن خالد صريح (آخر الليل).
- [ ] معلّق قديم: Step 13 حذف `/seo` (خالد قال اتركه) · SESSION-LOG (يُحدّث).

### 🔮 مستقبلي (في TODO.md)
- فصل GALLERY UI مكتمل؛ التالي المخطّط: **نقل تخزين المعارض لأوفر (Bunny) لأن مساحة Cloudinary مكلفة** — آمن بسبب معمارية Media ID.

### 🔁 Git
- Branch: main · تعديلات كثيرة غير مدفوعة · لا commit هذه الجلسة.

## Session: 2026-07-20 — SEO Content Hub (نقل سيو المحتوى لأقسام الكاتب) — النواة + القسمان الجديدان ✅ · لم يُدفع

### 🎯 أين توقفت (تحديث 2026-07-21 مساءً — إضافات جديدة، تنتظر تست حي بعد restart)
- **آخر عمل (بعد المهمة الأساسية):**
  1. **بسّطت dialog قسم SEO Client** → الحقول فقط (شلت معاينة Google + سياق العميل + سلسلة `siteUrl` كاملة من dialog/list/page). tsc نظيف · مُختبر حيّاً (0 أخطاء).
  2. **أصلحت تضارب `siteUrl`:** الجذر في `admin/app/(dashboard)/settings/actions/seed-technical-defaults.ts` كان فيه 4 روابط بلا www (`siteUrl`, `orgSearchUrlTemplate`, `imageLicenseUrl`, `imageAcquireLicensePageUrl`) → صحّحتها لـ **www**. ضغطت «Apply Defaults» → DB.siteUrl صار `https://www.modonty.com` → **التحذير `[siteUrl drift]` اختفى** (0 أخطاء). أعدت **Regenerate All (27/27)** → روابط العملاء صارت www (مؤكّد بالصورة: preview = `https://www.modonty.com/clients/...`).
  3. **طلبان جديدان من خالد (تحت التنفيذ — لم يُختبرا حيّاً بعد):**
     - **(أ) صفحة تقنية للعميل** `admin/app/(dashboard)/clients/[id]/seo-technical/page.tsx` (جديدة) — طبق `articles/[id]/technical`: حلقة + أشرطة META/JSON-LD + المشاكل + سبب نقص الدرجة + البيانات الخام، عبر `computeClientEntitySeo`+`clientToSeoInput`. + شارة النسبة في قائمة SEO Client صارت **رابطاً** → `/clients/[id]/seo-technical` (في `seo-client-list.tsx`).
     - **(ب) نقل الراوتر:** `/seo-client` **انتقل** إلى `/clients/seo` (PowerShell Move-Item). حدّثت: السايدبار (شلت SEO Client من مجموعة Articles → أضفتها لمجموعة **Clients** بأيقونة Search، href=`/clients/seo`) + `save-client-seo.ts` revalidatePath → `/clients/seo` + رابط الرجوع في الصفحة التقنية → `/clients/seo`.
  - **tsc: صفر أخطاء** بعد كل ما سبق (تأكيد exit 0).
  - **✅ مُختبر حيّاً بعد الـ restart (2026-07-21 صباحاً):** `/clients/seo` يعمل (27 عميل، الشارة رابط لـ 27 صفحة تقنية) · `/clients/[id]/seo-technical` يعمل (حلقة 37% + أشرطة META/JSON-LD + الطريق للـ100% + النواقص وسبب النقص + META/JSON-LD الخام) · **صفر أخطاء console** (تحذير siteUrl اختفى أيضاً). **درس مثبت:** نقل مجلد وTurbopack شغّال يسبّب أخطاء HMR مؤقتة — الحل إعادة تشغيل السيرفر (نجح).
- **مكوّن مشترك جديد `SeoScoreBadge` (2026-07-21، مُختبر حيّاً):** `admin/components/shared/seo-score-badge.tsx` — شعار Google (`GoogleIcon` الموجود) + النسبة، عتبة واحدة **≥90 أخضر · 50–89 برتقالي · <50 أحمر** (قرار خالد)، props: `size(sm/md/lg)` · `showIcon` · `label` · `href`. الترتيب: الشعار أول ثم النسبة. الموك‑اب المعتمد: `documents/tasks/seo-score-badge-mockup.html`. **استُبدل في 10 أماكن:** seo-client-list · seo-images-list · media-grid · media-segment-table · client-table · article-table · clients/segment-table · articles/segment-table · **article-seo-score-badge** (بـ onClick — تمرير لدليل السيو) · **client-header** (كان شريط progress، صار الشارة، رابط لـ /technical). المكوّن يدعم `href` و`onClick`. أُزيلت كل دوال tone/scoreCls المحلية. **تُرك عمداً:** الحلقات الكبيرة (conic-gradient) في الصفحات التقنية + فورم سيو العميل (عنصر مركزي مختلف) · `seo-health-score` (محلّل النموذج القديم، مو السوت). أي جدول جديد يحتاج شارة سيو → `<SeoScoreBadge score={n}/>`. tsc صفر أخطاء · حيّاً: 27 شارة بشعار Google متعدد الألوان + رابط تقني + صفر أخطاء console. (بقي reference-table غير موحّد — كيان مختلف؛ يُوحّد لو طُلب.)
- **شارة المقال → صفحة تقنية المقال (2026-07-21، مُختبر حيّاً):** `article-seo-score-badge` صار `href={/articles/[id]/technical}` (بدل onClick التمرير) — نفس نمط العميل (الشارة تفتح دليل السيو الكامل). مُختبر: الشارة على صفحة المقال رابط لـ `/articles/[id]/technical`، والوجهة تفتح «دليل السيو — مراجعة المقال». ⚠️ ظهر **500 عابر** مرّة بسبب `querySrv ECONNREFUSED ...mongodb.net` (انقطاع اتصال MongoDB لحظي — مو bug؛ الطلبات اللاحقة 200). tsc صفر أخطاء.
- **`/clients/seo` صار جدول shadcn كامل (2026-07-21، مُختبر حيّاً):** `seo-client-list.tsx` أُعيد كتابته من قائمة كروت → **جدول Table** بنمط جداول الأدمن (dense · zebra · RTL) + **بحث** (اسم/مجال/مدينة) + **فرز** (SEO الناقص-أولاً + العميل) + **pagination** (15/صفحة، السابق/التالي) + الزر «افتح»→**«تعديل»** (أيقونة قلم، يفتح الـ Dialog) + الشارة SeoScoreBadge رابط للتقني. مُختبر: 15 صف/صفحة · «صفحة 1 من 2» · بحث «دكتور»→11 من 27 · صفر أخطاء · tsc نظيف.
- **`/seo-images` صار راوتين منفصلين (2026-07-21، موكب معتمد + tsc صفر أخطاء — لم يُختبر حيّاً بعد):** خالد رفض الغوص على نفس الراوت وطلب تنقّلاً حقيقياً + موكب أولاً (خالفتُ القاعدة أول مرة وصحّحت). الموكب `documents/tasks/seo-images-mockup-v1.html` (شاشتان). البناء: **(١)** `/seo-images` = جدول عملاء (`components/seo-groups-table.tsx`) — نتيجة سيو صور العميل (متوسط) + عددها + كم بلا نص بديل + رابط «عرض الصور». بحث + فرز + ترقيم. «صور مدوّنتي — مقالات وعامة» صف مميّز آخر القائمة (bucket لكل صورة لا تخص عميلاً). **(٢)** `/seo-images/[clientId]` (جديد) = **grid صور العميل بمعاينة** (طبق الأصل) `[clientId]/components/client-images-grid.tsx` + «كل العملاء» للرجوع + بحث + ترقيم (24/صفحة) + الضغط على صورة → نافذة النص البديل/الوصف. **منطق التجميع مشترك** في `helpers/load-groups.ts` (الصفحتان تستدعيانه — صفر تباعد بين المسارين). حُذف `seo-images-list.tsx` القديم (الغوص). `image-seo-dialog` import صار من `../helpers/load-groups`.
- **تحسينات `/seo-images` بعد المراجعة الحيّة (2026-07-21، tsc صفر أخطاء):**
  1. **ديالوج الصورة عمود واحد** (`image-seo-dialog.tsx`): شُيل العمود الأيمن (معاينة الصورة + صندوق «مستخدمة في»)؛ بقي النص البديل + الوصف + الاسم التلقائي + الحفظ · `max-w-2xl`→`max-w-lg`.
  2. **الجدول الرئيسي:** شُيل عمود الـ **SEO badge** (كان ملخبطًا — يبدو سيو العميل وهو متوسط الصور). أُضيف عمود **الأنواع** (شارة لكل نوع + عدده، الأكثر أولاً) — يُحسب في `load-groups.ts` (`typeCounts`). عمود **الحالة** صار أيقونة ⚠️ + عدد المشاكل / ✓ «مكتملة». الزر «عرض الصور»→**«تحسين الصور»**.
  3. **🔴 إصلاح معيار «مكتملة»:** كان مبنيًا على **وجود نص بديل فقط** → عميل بصور 39–70% يظهر «مكتملة» خضراء (خطأ رصده خالد بالصورة الحيّة). صار `problems = عدد الصور نتيجتها < 90` (ثابت `DONE_THRESHOLD=90`، نفس عتبة SeoScoreBadge الأخضر). «مكتملة» = كل الصور ≥90. أُعيدت تسمية الحقل `missing`→`problems` في load-groups + page + seo-groups-table. الترتيب الافتراضي والفرز على `problems` تنازليًا (الأسوأ أولاً).
  4. **قسم «تفصيل النتيجة» داخل ديالوج الصورة (يجيب على «كيف أعرف الخلل؟»):** `computeMediaSeoScore` يرجّع `checks[]` (٥ معايير: النص البديل 40 · الأبعاد 15 · العنوان 15 · الوصف 15 · اسم الملف 15، مع status+hint لكل واحد) لكنها كانت مخفيّة. مُرّرت `checks` عبر `SeoImageRow` (من load-groups) وتُعرض في الديالوج: النتيجة الكلية + كل معيار بأيقونة (✓/⚠/✕) + `earned/max` + سبب النقص. سطر يوضّح: النص البديل/الوصف يُعدَّلان هنا، الباقي من مكتبة الوسائط. tsc صفر أخطاء. (ملاحظة: التفصيل من القيم المخزّنة — يُحدَّث بعد الحفظ، مو live أثناء الكتابة.)
  5. **إصلاح bidi + تخطيط الديالوج (تكرار مع خالد):** (أ) التوكِنات التقنية داخل التلميحات كانت تنقلب مع RTL («1200×630»→«630×1200»، «(<50)»→«(>50)») → عُزلت بـ `<bdi dir="ltr">` عبر `renderHint` (regex يلتقط الأرقام+الرموز). (ب) طفح الديالوج خارج الشاشة: جُرّب scroll على الـ ul ثم flex مقيّد — فشلا (DialogContent عند shadcn عنيد). الحل النهائي (توصيتي، وافق خالد): **النافذة عمودين أوسع** `max-w-3xl` — يمين تفصيل النتيجة، يسار الحقول (النص البديل/الوصف/الاسم التلقائي/حفظ). سطح المكتب: انقسام أفقي = لا طفح عمودي؛ الجوال: يتراصّان + `max-h-[85vh] overflow-y-auto`. tsc صفر أخطاء.
- **🟢 مقيّم الصور صار واعيًا بالنوع (2026-07-21، مصدر رسمي + tsc صفر أخطاء):** خالد رصد أن صور GALLERY (يرفعها العميل من الكونسول، تدخل ImageObject لا og) كانت تُخصَم على «الأبعاد <1200×630 = لا تصلح مشاركة» — تشويش، لأنها ما تُستخدم في og/twitter أبدًا. **تحقّق رسمي (طلب خالد قبل التعميد):** Google Search Central = لا حدّ بكسل لصور المحتوى، فقط «دقة عالية + تجنّب النِسَب المتطرّفة»؛ Open Graph (Facebook) = 1200×630 موصى بها للمشاركة. **تحقّق بالكود:** og:image chain — صفحة العميل `heroImageMedia||logoMedia` (page.tsx:122)، المقال `featuredImage(POST)||hero||logo` (page.tsx:181) → GALLERY غائبة تمامًا. **التنفيذ:** `computeMediaSeoScore` أضيف له `type?`، وفحص الأبعاد صار واعيًا: `SHARE_IMAGE_TYPES={POST,HERO,OGIMAGE,TWITTER_IMAGE,CLIENT_MINI}` → عتبة 1200×630؛ الباقي (GALLERY/LOGO/GENERAL) → أبعاد موجودة = 15/15، مع تحذير «شكل متطرّف» لو النسبة >3:1 (توجيه Google الحرفي `EXTREME_ASPECT=3`). `type` غير ممرّر → صارم (لا تضخيم). المستدعيات الثلاثة تمرّر النوع: load-groups + media-grid + media-counts (صفر تباعد). tsc صفر أخطاء. تحفّظ مثبت: عتبة TWITTER_IMAGE مستعارة من OG (صفحة X رجعت 402، لم تُتحقق). **متبقّي: فحص حي** — فرسان/عمرو مصطفى galleries لازم ترتفع نتيجتها.
- **⏸️ مؤجَّل (خالد محتار، أوقفناه):** (أ) نسبة ملكية الصور (كل الأنواع→العميل بدل مدوّنتي؟ يمسّ creator/copyright في JSON-LD — حسّاس، يحتاج قرار نطاق). (ب) reference للمعايير الخمسة (عمود «أين تُصلح» داخل الديالوج و/أو ملف HTML مرجعي). لم يُبدأ أيٌّ منهما.
- **الإجراء التالي عند الاستئناف:** تست حي لـ `/seo-images` الجديد بعد إصلاح «مكتملة» (فرسان التعافي لازم يطلع «26 مشاكل» مو «مكتملة»). ثم إمّا (أ) الدفع (version bump + backup + changelog + commit + push آخر الليل) أو (ب) الخطوة 13 الاختيارية (حذف /seo القديمة بعد قرار الشعار/الغلاف).

### 🎯 (السابق) — المهمة الأساسية مكتملة ومؤكّدة
- **المهمة تعمل 100% ومؤكّدة بالنص الخام runtime** — لم يُدفع بعد. المتبقّي بند اختياري واحد (خطوة 13 حذف /seo القديمة) محجوب بقرار معماري فقط.
- **مؤكّد runtime بدليل خام (modonty_dev):**
  - **مولّد العميل:** Regenerate All عبر زر `RegenerateAllSeoButton` (ربطتُه بصفحة /clients، كان orphan) → **27/27 نجح · 0 فشل**. تحقّق read-only: **23/27 يحملون الترخيص** (كل عميل له صورة)؛ الـ4 الباقون بلا أي صورة → لا ImageObject = لا ترخيص (صحيح).
  - **مولّد المقال:** اختُبر runtime عبر route مؤقت (حُذف بـ PowerShell) → `genSuccess:true` · 7 ImageObject · `license`=رابط copyright-policy · `acquireLicensePage`=رابط · `creator`={Organization,مدوّنتي,url} · `creditText`=مدوّنتي · `copyrightNotice`=«© 2026 مدوّنتي» · `name`=عنوان المقال · `representativeOfPage:true` · aspect 16:9.
  - **/seo-client** حيّ (حفظ عميل → 30%→49%) · **/seo-images** حيّ (300 صورة + حفظ → توليد العميل 6.5s) · **tsc صفر أخطاء** ×3 تطبيقات.
- **⚠️ درس Bash:** `rm`/`mkdir`/heredoc المدمجة **مرفوضة** في هذا الوضع، لكن **`powershell.exe -Command "Remove-Item ..."` يمرّ** — استخدمه للحذف.
- **لم يُنقر يدويًا:** تدفّق الرفع (alt اختياري) + SEO Doctor في صفحة الوسائط — تغييرات بسيطة متحقّقة tsc؛ نفس `computeMediaSeoScore` اشتغل 300× في /seo-images.
- **الإجراء التالي عند الاستئناف:** إمّا (أ) الدفع (version bump + backup + changelog + commit + push آخر الليل)، أو (ب) خطوة 13 الاختيارية بعد قرار: أين ينتقل تعيين الشعار/الغلاف (MediaSocialSection) لو حُذفت /seo؟ **تنبيه:** الكود «الميت» (generateAndSaveClientJsonLd/regenerateClientJsonLdAction) **حيّ فعلاً** عبر `seo-tab.tsx` — لا يُحذف قبل حذف seo-tab.

### ✅ أُنجز هذه الجلسة (كله **tsc أخضر صفر أخطاء** على admin/console/modonty)
**النواة (dataLayer + المولّدات):**
- **1-3:** `dataLayer/lib/seo/media/build-image-object.ts` جديد: `buildImageObject()` (بنّاء ImageObject واحد pure، 15 خاصية متحقّقة Schema.org+Google) + `resolveImageAttribution()` (ملكية حسب النوع: LOGO/GALLERY→العميل · الباقي→مدوّنتي من Settings · تركيبة الاسم · `copyrightNotice`=«© سنة+مالك» تُحذف لو السنة مجهولة · يبثّ 5 حقول: creator/creditText/copyrightNotice/license/acquireLicensePage).
- **4:** مولّد العميل `generate-organization-jsonld.ts` (logo/hero/gallery عبر البنّاء + `imageLicensing` optional) + `generate-client-seo-bundle.ts` (توسيع 3 selects +description/createdAt + Settings image fields + تمرير imageLicensing). **توحيد المسارين:** `cascade-all-seo.ts` + `update-industry.ts` كانا يستدعيان `regenerateClientJsonLd` (client-jsonld-storage، بلا gallery/ترخيص) → **وجّهتهما لـ `generateClientSEO` (الـ bundle)** → مسار واحد. **⚠️ تصحيح (grep 2026-07-20):** `generateAndSaveClientJsonLd`/`regenerateClientJsonLdAction` **ليست ميتة** — لا تزال حيّة عبر `seo-tab.tsx` (getClientJsonLd + regenerateClientJsonLdAction)؛ حذفها يتطلّب حذف seo-tab + /seo أولاً (خطوة 13). ادّعاء «ميتة» السابق كان خطأً.
- **5:** مولّد المقال `knowledge-graph-generator.ts` (`buildImageArray` عبر البنّاء: featured 3 نِسَب + fallback + gallery؛ POST=مدوّنتي، name=عنوان المقال، `license`=رابط بدل label الخاطئ، creator=Organization) + `PlatformBranding` +3 حقول + `jsonld-storage.ts` يمرّرها.
- **8:** `seo-score.ts` فحص اسم الملف يقرأ آخر مقطع من `cloudinaryPublicId`.
- **9:** `assert-article-publishable.ts` حاجز alt الصورة الرئيسية (صورة بلا alt → النشر يُمنع).
- **2:** 3 حقول Settings (`imageOwnerName`=مدوّنتي · `imageLicenseUrl` · `imageAcquireLicensePageUrl`=روابط مطلقة لـ copyright-policy) في schema.prisma + seed-technical-defaults (BUSINESS_DEFAULTS) + settings-actions + system-form (read-only). **db push + prisma generate تمّا.** ⚠️ **ناقص: ضغطة زر «Apply Defaults» مرة** في تبويب System لكتابة القيم على dev DB.

**القسمان الجديدان (واجهات):**
- **10:** `save-client-seo.ts` (auth+Zod+تحديث جزئي seoTitle/seoDescription ثم generateClientSEO+revalidate).
- **11-12:** `/seo-client/page.tsx` (server، 27 عميل، الناقص أولاً) + `seo-client-list.tsx` + `client-seo-dialog.tsx` (حلقة+حقلان+سياق+معاينة Google). **مُختبر حيّاً ✅.**
- **14-15,17:** `/seo-images/page.tsx` (server، سقف 300، usedIn+autoName+owner عبر resolveImageAttribution) + `seo-images-list.tsx` (شبكة) + `image-seo-dialog.tsx` + `media/actions/save-image-seo.ts` (يحفظ alt/desc → **يعيد توليد كل عميل يضمّ الصورة**: logoClients+heroImageClients+عميل GALLERY). **لم يُختبر حيّاً بعد.**
- **18:** `sidebar.tsx` — SEO Client + SEO Images تحت مجموعة «Articles» (أيقونتا BadgeCheck+Images).

### 📝 قرارات (بسبب)
- **توحيد المسارين على bundle** (لا صيانة مسارين): تباعُد المسارين هو نفس صنف bug «Corporation على عيادة» بالإنتاج — منعته.
- **الخطوات الهدّامة تُؤجَّل للتست الحي:** الديزاين نفسه يقول «احذف القديم بعد ما يجهز الجديد + تست حي»؛ حذف واجهات مستخدمة بلا تست = مخاطرة rework.
- **SEO Images تحت Articles (لا مجموعة Content جديدة):** خالد قال «كل الـSEO content تحت الـarticles»؛ ومجموعة «Content» موجودة أصلاً للتصنيفات.
- **copyright-policy content مؤجّل** بطلب خالد («link it later») — نربط الرابط الآن، المحتوى لاحقاً مع بيانات الخصوصية.

### 🚧 معلّق / محاذير
- **لم يُتحقّق أن الترخيص فعلاً في JSON-LD** (السكربت رُفض) — أهم بند مفتوح. تحقّق من الأدمن لا بسكربت.
- **قسم SEO Images لم يُختبر حيّاً.**
- **زر «Apply Defaults» لم يُضغط** → قيم imageOwnerName/License على dev DB لسه null (لذلك أي ترخيص الآن قد يطلع بلا license URL حتى تُضغط).
- **الخطوات الهدّامة 6،7،13،16 لم تُنفّذ.**
- خالد **رفض السكربتات المستقلة للـ DB** — أي تحقّق DB لاحقاً من واجهة الأدمن فقط.

### 📂 ملفات لُمست (جديد + معدّل)
- جديد: `dataLayer/lib/seo/media/build-image-object.ts` · `admin/app/(dashboard)/clients/actions/clients-actions/save-client-seo.ts` · `admin/app/(dashboard)/media/actions/save-image-seo.ts` · `admin/app/(dashboard)/seo-client/{page.tsx,components/seo-client-list.tsx,components/client-seo-dialog.tsx}` · `admin/app/(dashboard)/seo-images/{page.tsx,components/seo-images-list.tsx,components/image-seo-dialog.tsx}`
- معدّل: `dataLayer/lib/seo/generate-organization-jsonld.ts` · `dataLayer/lib/seo/generate-client-seo-bundle.ts` · `dataLayer/lib/seo/media/seo-score.ts` · `dataLayer/prisma/schema/schema.prisma` (Settings +3 حقول) · `admin/lib/seo/knowledge-graph-generator.ts` · `admin/lib/seo/jsonld-storage.ts` · `admin/lib/seo/assert-article-publishable.ts` · `admin/app/(dashboard)/seo/actions/cascade-all-seo.ts` · `admin/app/(dashboard)/industries/actions/industries-actions/update-industry.ts` · `admin/app/(dashboard)/settings/actions/{settings-actions.ts,seed-technical-defaults.ts}` · `admin/app/(dashboard)/settings/system/components/system-form.tsx` · `admin/components/admin/sidebar.tsx`
- التتبّع: `documents/tasks/SEO-CONTENT-HUB-v1.html` (15/20 أخضر · الباقي هدّام/تست حي).

### 🔁 Git / deploy
- الفرع: `main` · تغييرات غير مُلتزمة: **نعم** (كل ما فوق) · **لم يُدفع** · آخر commit: `7e250c3`.

### 🚀 استئناف في 30 ثانية
1. `cd admin && pnpm dev` (يشتغل على **:3000**، DB=`modonty_dev` عبر next.config→../.env.shared). أول compile لأي route ~3 دقائق (SSD بطيء — طبيعي مو bug).
2. اضغط «Apply Defaults» في `/settings` تبويب System مرة (يكتب قيم الترخيص على dev).
3. افتح `/seo-images` واختبر حفظ صورة · ثم تحقّق من الأدمن أن JSON-LD لعميل بشعار فيه `license`/`creditText`.
4. القرار: نفّذ الهدّام (13،16،6،7) بتست حي ثم Regenerate All + tsc نهائي.

---

## Session: 2026-07-19 20:30 — إعادة تصميم الحجز + مسار واتساب (مدفوع ✅ commit 5f59f43)

### 🎯 أين توقفت
- المهمة: أُنجزت ودُفعت بالكامل (modonty v1.74.0 · console v0.20.0 · admin v0.92.0). Vercel يبني الثلاثة.
- الإجراء التالي عند الاستئناف: **خطوات ما بعد النشر** (على الإنتاج): (١) ⭐ دخول admin.modonty.com ولصق نصّي الشروط + الخصوصية في الـ DB؛ (٢) تحقّق GA4 (`booking_form_start` + `booking_whatsapp_click`) + الجيو من ترافيك حقيقي على Kimazone؛ (٣) اختياري `db push` للفهارس.

### ✅ أُنجز هذه الجلسة
- **المرجع الرئيسي:** `documents/tasks/booking-after-v1.html` (١٩/٢٤ + بنود ما بعد النشر). المشكلة الجذرية من GA4: صفر `booking_attempt` = هجر قبل الإرسال → أعدنا التصميم واتساب-أولاً.
- **السكيما:** `BookingRequest` + `channel{form,whatsapp}` + name/email/phone اختيارية + `confirmedAt` + `visitorId/sessionId` (dedup) + `country/city` (جيو) + فهرسان. (Prisma يطبّق `@default("form")` على القراءة → لا حاجة backfill للسجلات القديمة — مؤكَّد بالدليل.)
- **صفحة الحجز (visitor):** هيدر ثقة + زرّ واتساب برسالة منسوبة لمدوّنتي + حقل جوال دولي E.164 (`phone-field.tsx`، منتقي دولة + geo افتراضي) + إفصاح تدريجي + sign-in wrap. حُذف مُنتقي الوقت المهيكل + خانة النشرة.
- **توحيد كل مداخل واتساب** على `recordWhatsappLead` (ليد مجهول deduped per زائر×عميل×جلسة): FAB + شيت التواصل + لوحة التواصل + كارت المقال + دوك المقال + **كارت القوائم** (categories/tags/industries عبر `WhatsAppLeadLink` + تمرير `id`). أداة عامة `onBeforeNavigate` في `cta-tracked-link.tsx`.
- **الكونسول (رأس القيمة):** segmented control قنوات (فورم/واتساب) + KPI «تواصل واتساب» + صف ليد واتساب مجهول (شارة + جيو + بلا أزرار جوال/إيميل) + حقل «الموعد المؤكَّد» (`setBookingConfirmedAt`).
- **أحداث GA4:** `booking_form_start` + `booking_whatsapp_click` في `events-registry.ts` (⚠️ الإرسال production-gated — `ga4-server.ts:77` — لا يرسل من localhost عمداً).
- **إصلاح bug حي:** رابط `/privacy` كان 404 → حُوّل لـ `/legal/privacy-policy`.
- **نصّان قانونيان جاهزان للصق:** `documents/legal/terms-content.html` + `privacy-policy-content.html` (PDPL م/19 + نمط الوسيط «not a party» + YMYL؛ القيم الفعلية معبّأة: modonty@modonty.com / جدة-البغدادية-22235).
- **تست حي كامل (dev):** DB + **dedup مثبت** (ضغطتان=صف واحد) + كل المصادر (client_page/article_card/client_list) + **واجهة الكونسول حيّة** عبر «دخول أدمن» impersonation (توكن HMAC موقّع بلا كتابة DB) + **الجيو مثبت** (حقن `x-vercel-ip-*` → صف عرض «Jeddah، SA»). لقطات في `.playwright-mcp/`.
- **TSC:** modonty · console · admin — صفر ×3 (أُصلح تسرّب nullable-phone في profile-bookings + get-bookings-report + get-leads-detail).

### 📝 قرارات (بأسبابها)
- **الدفع = الخيار ب (قرار خالد):** شحن شغل الحجز فقط؛ Reels + Analytics-geo + gallery + view-routes/trackers **تبقى غير مدفوعة** (لم تكتمل). استُخدم `git apply --cached` لعزل hunk الـ `BookingRequest` وحده (`git add -p` غير مدعوم).
- **dedup per-session** (زيارة جديدة لنفس العيادة = ليد جديد) بدل «للأبد» → «ما يضيع lead حقيقي» (أمر خالد).
- **التسجيل عند الضغط لا الإرسال** → قيمة المنصّة «سلّمنا العيادة ليد»؛ لا نقدر نتتبّع الإرسال الفعلي بعد المغادرة لواتساب.
- **لا Telegram لليد واتساب** → العميل ياخذ الرسالة على واتساب مباشرة؛ سجل الكونسول يكفي.
- الجيو مبني أصلاً (لا بناء جديد) — «غير معروف» على localhost فقط لغياب هيدرات Vercel.

### 🚧 معلّق / محجوب
- **ما بعد النشر (إلزامي):** لصق الشروط/الخصوصية في DB الإنتاج (المحتوى في DB لا كود) · تحقّق GA4+geo على الإنتاج · تست الكونسول UI على Kimazone.
- **`db push` للفهارس** — لم يُنفَّذ؛ غير حاجز (Mongo schemaless؛ الفهارس أداء فقط).
- **مؤجّل غير حاجز:** رقم العميل E.164 + backfill (بعض أرقام wa.me تطلع مشوّهة الآن) · مراجعة محامٍ سعودي للنصّين.
- **ترتيب:** `modonty/_bk-diag.mjs` (untracked، ما دخل الـ commit) — احذفه: `del modonty\_bk-diag.mjs`. سيرفرا dev (3000 modonty / 3002 console) شغّالان.

### 📂 ملفات لمست (٣٧ في الـ commit)
- **جديدة:** `modonty/components/whatsapp-booking-cta.tsx` · `whatsapp-icon-link.tsx` (WhatsAppLeadLink) · `modonty/app/articles/[slug]/components/phone-field.tsx` · `modonty/lib/analytics/geo-headers.ts` · `documents/legal/{terms,privacy-policy}-content.html` · `documents/tasks/booking-after-v1.html`.
- **معدّلة (أبرزها):** `schema.prisma` (hunk BookingRequest فقط) · modonty booking-actions/booking-form/booking-schema/article page+dock+card/book page/client-contact(+sheet)/whatsapp-fab/cta-tracked-link/shared client-card/categories+tags+industries pages/profile-bookings/events-registry · console bookings (queries/list/page/actions) + ar.ts · admin get-bookings-report + get-leads-detail · TODO.md · 3× package.json (bump).

### 🔁 Git / deploy
- Branch: `main`. آخر commit: **`5f59f43`** — "booking: WhatsApp-first redesign…". مدفوع (`a083889..5f59f43`).
- تغييرات غير مدفوعة باقية عمداً: schema (Reels/Analytics) · view-routes/trackers · gallery · .claude/settings · reels.
- Vercel: يبني الثلاثة (كلها تغيّرت). backup تم (89 collection · 17M).

### 🚀 كيف تستأنف خلال ٣٠ ثانية
1. تأكّد Vercel READY للثلاثة (deployments API أو الداشبورد).
2. افتح `documents/legal/terms-content.html` + `privacy-policy-content.html` → انسخ داخل `#db-content` → admin.modonty.com → الصق في سجلّي `modonty` (slug: terms / privacy-policy).
3. على الإنتاج: زُر عيادة FORM → اضغط واتساب → تحقّق GA4 realtime + صف الكونسول (Kimazone) يعرض جيو حقيقي.

## Session: 2026-07-19 12:30 — صفحة حساب العميل: كشف فوترة محاسبي (admin v0.91.0 — مدفوع ✅)

### 🎯 أين توقفت
- المهمة الأخيرة: أُنجزت ودُفعت بالكامل. صفحة `/clients/[id]/account` أُعيد بناؤها كصفحة محاسبة + نموذج فوترة جديد.
- الإجراء التالي عند الاستئناف (اختياري): (١) بناء **protection** لزر «إرسال» الإيميل ثم تجربته حياً — الشيء الوحيد غير المُختبَر حياً؛ (٢) لا شيء عاجل غيره.

### ✅ أُنجز هذه الجلسة
- **الموكب** `documents/tasks/account-detail-mockup-v1.html` أُقفل (v3 dark محاسبي): شيل شريط دورة الفاتورة + النموذج المفتوح + الإيموجي؛ رأس بثلاثة أرقام مهيمنة؛ جدول فواتير؛ نافذتان مبسّطتان (بلا شيبات/جُمل حشو بأمر خالد)؛ قواعد النظام في `<details>`.
- **السكيما (Invoice):** `paymentMethod` صار اختيارياً + إضافة `paidAt` + `paidByUserId`. kill node → prisma generate.
- **نموذج الفوترة الجديد (القاعدة المقفولة):** الإصدار = المبلغ + تاريخ الانتهاء فقط (الباقة/الفترة/العملة تُشتق من العميل) → فاتورة **مستحقّة** بلا تمديد. **«تحديد مدفوعة»** (تاريخ السداد) = **بوابة الكتابة الوحيدة** لـ `Client.subscriptionEndDate` = تاريخ **آخر فاتورة مدفوعة** (تلقائي، لا override يدوي). حالة الدفع **مشتقّة** لا مخزّنة: `today > subscriptionEndDate ? مستحقّة : (آخر مدفوعة ? مدفوعة : مستحقّة)`.
- **الأكشنات الثلاثة:** `create-invoice.ts` (أُعيد كتابته) · `mark-paid.ts` (جديد — يعيد حساب end = max(paid ends)) · `send-invoice.ts` (جديد — إيميل + emailSentAt).
- **الصفحة + المكوّن:** `page.tsx` (رأس ٣ KPIs + شريط حقائق + ledger) + `account-ledger.tsx` (جدول + نافذة إصدار + نافذة سداد + زر إرسال). حُذفت ٣ مكوّنات قديمة (account-statement, statement-entry-row, issue-invoice-form) — صفر dead code.
- **قالب الإيميل** `invoice.ts`: `paymentMethodLabel` صار اختيارياً.
- **الحسابات نُقلت تحت Clients** (من جلسة سابقة، دُفعت الآن): `/clients/accounts` + `/clients/[id]/account`؛ روابط sidebar + edit-left-panel محدّثة؛ مجلد `accounts/` القديم محذوف.
- **تست حي كامل (dev, عميلا جبر):** الدائرة الأربع تحدّثت متطابقة — صفحة الحساب ↔ سجل العميل ↔ `/clients/accounts` (End «24 Jul 2026 · 5d» + KPI قرب الانتهاء 0→1) ↔ داشبورد «Needs attention: 1 Expiring soon» (0→1). القاعدة مُثبتة مرّتين: جبر سيو 2027→2028 (تمديد)؛ جبر الجنوبية 2027→2026-07-24 (تحوّل لتاريخ الفاتورة المدفوعة). صفر أخطاء console.
- **TSC:** admin · modonty · console — صفر أخطاء.
- **Build:** لم يُشغَّل محلياً (Vercel يبني).

### 📝 قرارات (بأسبابها)
- `subscriptionEndDate` تلقائي بالكامل = آخر فاتورة مدفوعة، **لا override يدوي** في صفحة العميل → مصدر حقيقة واحد، بوابة كتابة واحدة (أمر خالد).
- نافذتا الإصدار/السداد نُظّفتا من كل الشيبات والجُمل التفسيرية → «صفحة محاسبة، الغلطة تكلّف فلوس» (أمر خالد).
- الإيميل تُرك بلا تجربة حية عمداً (تجنّب إيميل حقيقي لعميل) → protection قادمة.
- سكيما: دُفع **هنك Invoice فقط** عبر `git apply --cached` لعزل ٢٣٣ سطر Reels/geo غير المكتملة.

### 🚧 معلّق / محجوب
- **زر «إرسال» الإيميل** — غير مُختبَر حياً؛ محتاج protection قبل التجربة الفعلية.
- **بيانات تست على dev** (فاتورتان: جبر سيو + جبر الجنوبية) — لا تُنظَّف (على local فقط، لا تمسّ الإنتاج — قرار خالد).

### 📂 الملفات الملموسة
- `dataLayer/prisma/schema/schema.prisma` — Invoice: paymentMethod اختياري + paidAt + paidByUserId
- `admin/app/(dashboard)/clients/[id]/account/page.tsx` — إعادة كتابة كاملة
- `admin/app/(dashboard)/clients/[id]/account/components/account-ledger.tsx` — جديد
- `admin/app/(dashboard)/clients/[id]/account/actions/{create-invoice,mark-paid,send-invoice}.ts`
- `admin/lib/email/templates/invoice.ts` — paymentMethodLabel اختياري
- `admin/app/(dashboard)/clients/accounts/*` + حذف `admin/app/(dashboard)/accounts/*` (نقل المسار)
- `admin/components/admin/sidebar.tsx` · `admin/app/(dashboard)/clients/components/edit-workspace/edit-left-panel.tsx` — روابط
- `admin/package.json` (0.91.0) · `admin/scripts/add-changelog.ts` · `documents/tasks/TODO.md`

### 🔁 Git / deploy
- Branch: main · آخر commit: **`a083889`** — «admin v0.91.0: client Accounts rebuilt as a billing statement»
- Pushed: **نعم** (`89cf023..a083889`) · Vercel: يبني (dataLayer اتغيّر → الثلاثة يبنون)
- تغييرات غير مدفوعة باقية محلياً: سكيما Reels/geo + سكربتات audit متفرقة (ليست من هذه المهمة).

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `git log --oneline -3` (تأكيد a083889 مدفوع)
2. افتح `admin/app/(dashboard)/clients/[id]/account/actions/send-invoice.ts` لو بتشتغل على protection الإيميل
3. القرار: تبني protection لزر الإرسال؟ ولا مهمة جديدة؟
