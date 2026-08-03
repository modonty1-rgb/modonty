# Session Context — Last Updated: 2026-08-02

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
- `documents/tasks/TODO.md` · `documents/tasks/BUNNY-GOLIVE-FLOW-v1.html` — توثيق بند 68 والنتائج.

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
