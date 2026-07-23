# 🗄️ أرشيف الجلسات — يوليو 2026

> السجل الدائم لجلسات يوليو 2026 الأقدم من النافذة النشطة. الملف النشط `SESSION-LOG.md` يحمل آخر أسبوع فقط.
> تدوير أسبوعي: كل جلسة تتجاوز ٧ أيام تُنقَل هنا (نقل، لا نسخ — بلا تداخل).

## Session: 2026-07-14 — دبل تشيك GEO/AEO + أربعة أعطال كشفها خالد بالتست الحي + الدفعة

### 🎯 أين توقفت
- **آخر مهمة:** دُفعت الدفعة (admin v0.87.0 + modonty v1.72.0). **الخطوة التالية فوراً: التفعيل على الإنتاج.**
- **أول إجراء عند العودة:** من أدمن الإنتاج → (١) Regenerate للعملاء (١١ عميلاً يأخذون نوع السكيما الصحيح) · (٢) خطوة **«Article hreflang»** من Run-All (٥٦ مقالاً ترجع لهم ٥ نقاط) · (٣) تست حي.

### ✅ أُنجز هذه الجلسة
**أ) دبل تشيك نهائي على إصلاحات GEO/AEO** (بطلب خالد «مليون في المئة») — كل بطاقة روجعت ضد الكود + المصادر الرسمية ووُسمت بشارة زرقاء في التقرير. **٥ اكتشافات جديدة أُصلحت:** رابط `/articles` ميت في llms.txt · تحويل المؤلف 308 كان مبتلَعاً داخل try/catch (أُصلح بـ `unstable_rethrow`) · تسريب المقالات المجدولة في feed/llms/image-sitemap · **ثغرة تهريب `<` في 17 موقع حقن ld+json** (أُغلقت كلها).

**ب) أربعة أعطال كشفها خالد بالتست الحي على الأدمن:**
1. 🔴 **Edit ينهار** لكل مقال بحالة `AWAITING_APPROVAL`/`NEEDS_REVISION` (٢٠ مقالاً غير قابلة للتعديل = مرحلة المراجعة مشلولة). السبب: قائمة بيضاء بـ5 حالات من أصل 7.
2. **روابط breadcrumb ميتة** — ١٢ مساراً وسيطاً (segment/workflow/campaigns/…). أُصلحت بمطابقة المسار الكامل (لا الاسم) حتى لا تُقتل `/settings/social` الحقيقية.
3. 🔴 **الصفر الكاذب:** الداشبورد يقول «0 expiring this week» بينما **٢١ من ٢٦ عميلاً نشطاً بلا تاريخ انتهاء** → المراقبة عمياء وتدّعي الاطمئنان. أُصلح ببانر صريح + مجموعة «Record data» بأربع بطاقات.
4. 🔴 **السكور يظلم كل مقال:** hreflang لا يُحفظ إطلاقاً (0 من 56) بينما الموقع الحي يبنيه → خصم 5 نقاط ظلماً. + **نوع سكيما العميل:** ١٢ من ١٧ عميلاً طبياً بنوع لا يصفهم؛ بُنيت **قاعدة عامة صناعة-محايدة** (`resolveOrganizationType`) بقرار خالد «الإصلاح يكون عام لا خاص».

- **tsc:** admin 0 · modonty 0 · console 0.
- **البيلد:** لم يُشغَّل (Vercel يبنيه).
- **التست الحي:** Playwright — 8 روابط Edit من 5 جداول (تطابق الكيان) · حفظ مقال (hreflang صار يُخزَّن، السكور 57%→62%) · حفظ عميل (`Corporation` → `Hospital`) · 12/12 في جدول حقيقة القاعدة.

### 📝 قرارات
- **الوكلاء:** ممنوع إطلاقهم بمبادرتي (حرقوا حد الاستخدام) — قاعدة ذهبية دائمة.
- **نوع السكيما:** قاعدة عامة (الأخص يفوز) لا شرط طبي — «بكرة عندنا أثاث ومتاجر إلكترونية».
- **`Corporation`/`NGO`:** يُصلحان بالكود لا يدوياً (بقرار خالد) — لكن العميل غير الطبي بلا اشتقاق يبقى كما هو (لا تجاوز أعمى).

### 🚧 معلّق
- **تعبئة تواريخ انتهاء الاشتراك للـ21 عميلاً** (من `/clients/segment/no-end-date`) — بيد خالد؛ بدونها مراقبة التجديد تبقى عمياء.
- **سكور AEO** (المرحلة الثانية) — جلسة مستقلة بعد التفعيل.
- **الدفعة الثانية** (Bunny/geo tracking/schema.prisma) — **مستبعدة عمداً من هذه الدفعة**، ما زالت تنتظر تدوير مفتاح Bunny.

### 🔁 حالة Git والنشر
- **الفرع:** main · **الكوميت:** `001deeb` · **مدفوع:** ✅ (`5e89a58..001deeb`)
- **الإصدارات:** admin v0.87.0 · modonty v1.72.0 · **54 ملفاً**
- **changelog:** كُتب في LOCAL + PROD ✅ (admin id `6a565fbd…` · modonty id `6a565fbe…`)
- **نسخة احتياطية:** تمت قبل الدفع (17M · 15 نسخة محفوظة)
- **Vercel:** ✅ **النشر اكتمل ومتحقَّق منه** — `admin.modonty.com` 200 · `www.modonty.com` 200 · **`/feed.xml` 200** · **`/llms.txt` 200** (القناتان الجديدتان حيّتان فعلاً على الإنتاج).
- **غير مدفوع عمداً:** الدفعة الثانية (Bunny gallery · geo tracking · `schema.prisma` بـ230 سطراً · سكربتات `.mjs`) — تنتظر تدوير مفتاح Bunny. **لا تدفعها بالخطأ.**
- **ضجيج محلي غير مرصود:** لقطات Playwright بجذر المستودع (`articles-full.yml` · `articles-list.yml` · `current-page.yml` · `edit-after-fix.yml` · `save-btn.yml`) — احذفها متى شئت، ليست في أي كوميت.

### 🔄 تكملة بعد إعادة التشغيل — التفعيل كشف ٤ أخطاء (دفعة ثانية: admin v0.87.1)
**١. خطوة hreflang على الإنتاج — نجحت:** Run-All → `Complete — 174 fixed in 50s · 11/11 · صفر أخطاء` · **«Article hreflang» = 78 مقالاً أُصلح**. الـ5 نقاط المخصومة ظلماً رجعت لكل مقال.

**٢. توقفتُ قبل ضغط «Trigger Full Cascade» على الإنتاج — وكان قراراً أنقذ البطاقات.** فحص الكود كشف أن الـCascade يسلك مساراً ثانياً:
- 🔴 **القاعدة كانت في الطبقة الخطأ:** وضعتُها في `generate-client-seo-bundle` (أحد المستدعين)، بينما الـCascade يبني عبر `generateCompleteOrganizationJsonLd` مباشرة → **الضغط على الإنتاج كان سيعيد كتابة `Corporation`/`LocalBusiness` في الـ27 بطاقة**. **نُقلت داخل بنّاء البطاقة نفسه.**
- 🔴 **الـCascade يجرّد الساعات والسعر:** استعلامه ينقصه `openingHoursSpecification` و`priceRange` → كل تشغيل يفقر البطاقات. **أُلغي مساره الخاص → يستدعي `generateClientSEO` (المولّد المشترك)** فصار الـCascade والحفظ ينتجان بطاقة متطابقة.
- 🔴 **فخ الحقل الناقص:** استعلام الـCascade لا ينتقي `isYmyl`/`ymylCategory`/`ymylData` → الاشتقاق يرجع فارغاً. أُضيفت.

**٣. بأمر خالد «تأكد من المصادر الرسمية» — كشفت أخطاء schema.org حقيقية في كونفج YMYL:**
- 🔴 **`PhysicalTherapy` ليس منظمة** — هو **إجراء طبي** (`Thing > MedicalEntity > MedicalProcedure > MedicalTherapy`). عيادة العلاج الطبيعي كانت تُصنَّف «عملية علاجية» لقوقل. **الصحيح: `Physiotherapy`** (`Organization > LocalBusiness > MedicalBusiness`).
- 🔴 **`Dietitian` غير موجود على schema.org (404)** — نوع مخترع. **الصحيح: `DietNutrition`**.
- 🔴 **ثلاث قوائم متباينة** لأنواع «الأماكن» (البنّاء 16 · سكور العميل **9 فقط** · القائمة البيضاء) — ولا واحدة تعرف `Optician` → عيادتا عيون تأخذان النوع الطبي ثم تُحرمان العنوان والساعات. **وُحّدت في `LOCAL_FAMILY` واحدة**، مع استبعاد `MedicalOrganization` و`DiagnosticLab` (خارج عائلة LocalBusiness رسمياً → ممنوعان من geo). **وسكور العميل صار يقرأ نوع البطاقة المُقدَّمة لا العمود الخام.**

**تست حي (dev، Cascade كامل):** 17/17 عميل طبي بنوع صحيح (`Dentist` · `MedicalClinic` · `Hospital` · `Optician`) · **ساعات العمل رجعت** (16/17؛ الأخير بلا ساعات في سجله) · `geo=✗` **ليس خللاً كودياً** — **صفر عميل** عنده إحداثيات في سجله (متحقق بسكربت قراءة فقط). tsc صفر ×3.

### ✅ التفعيل اكتمل على الإنتاج — كل شيء أخضر (2026-07-14، آخر تحديث)
- **النشر متحقَّق من Vercel API:** `755f1ed` **READY** على التطبيقات الثلاثة (admin · modonty · console).
- **Run-All (hreflang):** `Complete — 174 fixed · 11/11 · صفر أخطاء` → **78 مقالاً** استرد نقاطه.
- **Trigger Full Cascade:** `Complete · 100% · **158/158 كياناً** · 7m50s · **صفر أخطاء**` (10 فئات · 35 وسماً · 7 صناعات · **27 عميلاً** · **78 مقالاً** · قائمة).
- **تحقق من قاعدة الإنتاج (قراءة فقط) + من الموقع الحي (الـ26 صفحة عميل):**
  - **17/17 عيادة مصنّفة طبية** تحمل نوعها الدقيق: `Dentist` · `MedicalClinic` · `Hospital` · `Optician` — **وكلها بساعات عمل** عدا واحدة بلا ساعات في سجلها.
  - العملاء غير الطبيين يبقون `Organization` (صحيح — لا اشتقاق متاح). «بسيطة» تحتفظ بـ`LocalBusiness` (اختيار صريح احتُرم).
  - مثال حي مؤكَّد من مصدر الصفحة: `/clients/عيادة-علاج-الألم` → `"@type": "Hospital"` + `OpeningHoursSpecification` (كانت `Corporation` بلا ساعات).
- **الحكم: الكود 100%. المتبقي بيانات فقط.**

### 📌 بيد خالد (بيانات لا كود — كل واحدة دقيقتان بالأدمن)
1. **🟡 ثلاث عيادات غير مؤشَّرة كـ YMYL/طبية** فتبقى بطاقتها `Organization` عامة: **Choucha dentistry** · **عيادة د. أحمد الصاوى** · **عيادة د. حسام حسني** (هذه الأخيرة **عندها ساعات عمل في سجلها لكن البطاقة لا تحملها** — لأن `Organization` لا تقبل ساعات رسمياً). الحل: فعّل YMYL + «طبي» + التخصص → البطاقة تترقّى تلقائياً عند الحفظ.
2. **الإحداثيات:** صفر عميل عنده `addressLatitude/Longitude` → لا `geo` في أي بطاقة إطلاقاً.
3. **تواريخ انتهاء الاشتراك:** 21 عميلاً (من `/clients/segment/no-end-date`) — بدونها مراقبة التجديد عمياء.
4. **د. أمل زكريا:** بلا ساعات عمل في سجلها.

### ⏭️ المهمة التالية (مؤجلة بقرار خالد — يشتغل على مشروع آخر)
**سكور AEO «جاهزية الإجابة»** — جلسة عمل واحدة (~3-4 ساعات): مُسجِّل في dataLayer يقيس 7 إشارات (مصادر · إحصاءات · اقتباسات · جواب مبكر · FAQ · حداثة · وسائط) + عمود جديد بجانب SEO في جداول المقالات + كرت داشبورد. الأرض صارت صادقة (المخزَّن = المُقدَّم) فالسكور سيقيس الحقيقة من أول يوم.

### 🚀 (مرجع تاريخي) — خطوات التفعيل التي نُفّذت
> ⚠️ الكود مدفوع لكن **أثره لم يسرِ بعد على البيانات القديمة**: البطاقات المخزنة ما زالت بالنوع القديم، والـ56 مقالاً ما زالت بلا hreflang مخزّن. الخطوتان أدناه هما ما يفعّلانه.

1. ~~Run-All / hreflang~~ ✅ **تم على الإنتاج** (78 مقالاً).
2. **بعد نشر v0.87.1:** `admin.modonty.com/seo` → **«Trigger Full Cascade»** (~3-5 دقائق) → الـ27 بطاقة تُعاد ببناء صحيح: النوع الطبي الدقيق + ساعات العمل + السعر. **⛔ لا تضغطه قبل أن ينشر Vercel هذه النسخة** — النسخة السابقة كانت ستفسد البطاقات.
3. **تست حي:** افتح عيادة على modonty.com → `@type` طبي (`Dentist`/`MedicalClinic`/`Hospital`/`Optician`) لا `Corporation` · افتح مقالاً → `hreflang` في المصدر.
4. **ثم:** سكور AEO (المرحلة الثانية — جلسة مستقلة).

### 📌 بيد خالد (بيانات، لا كود)
- **الإحداثيات:** صفر عميل عنده `addressLatitude/Longitude` → لا `geo` في أي بطاقة. تعبئتها تفتح خصائص المكان لكل العيادات.
- **السعر (`priceRange`):** صفر عميل.
- **تواريخ انتهاء الاشتراك:** 21 عميلاً بلا تاريخ (من `/clients/segment/no-end-date`).

---

## Session: 2026-07-13 (مساءً) — 🤖 فحص GEO/AEO المصيري: 4 جولات تدقيق + الانفصام الثلاثي

### 🎯 Where I stopped
- **التقرير النهائي**: `documents/seo/GEO-AEO-AUDIT-2026-07-13.html` — 4 جولات (مسح → تدقيق عدائي → اختبار تقارب → تغطية كاملة Ultra بمنظومة workflow). **جولة الإقفال تعمل الآن في الخلفية** (استئناف wf_3e0cb479-797 بعد رفع حد الجلسة 22:00): كاشف نص-التقرير + تحقق أسماء الزواحف الـ37 + مكذّبون مزدوجون لبنود الجولة ٤ الثمانية.
- **Next action:** دمج نتائج الإقفال في التقرير → إقفاله رسمياً (بروتوكول الإقفال مكتوب في ملحق المنهجية داخل الملف). خالد أعطى صلاحية كاملة — بلا أسئلة.

### ✅ أهم النتائج (كلها بتحقق مزدوج كود + إنتاج حي)
- **🔴 الانفصام الثلاثي — «نقيس ما لا نقدّم»**: (١) المقالات: أدمن يخزّن JSON-LD غنياً (citation + مؤلف Person) لا يُقدَّم أبداً؛ الصفحة تولّد نسخة حية أفقر (مؤلف Organization=مودونتي) — وسكور AS نصفه يقيس المخزّن غير المُقدَّم. (٢) العملاء: أكمل عميل يُقدَّم Organization بـ9 مفاتيح — صفر sameAs/address/geo/hours/تصنيف YMYL رغم وجودها بالصف واحتسابها بالسكور. (٣) المرجعيات: صفحات [slug] للفئات/الوسوم/الصناعات تُقدَّم بصفر JSON-LD بينما سكور الداشبورد يقيس بلوباتها المخزنة.
- **🔴 PII**: `/users/[id]` يبث Person لأي مستخدم + وصف الميتا يسقط على الإيميل الخام + زواحف AI الـ37 غير ممنوعة من /users/ (مجموعاتها بلا disallow — الأخص يفوز).
- **🔴 فاحص robots بالأدمن معكوس**: يتوقع block لخمسة زواحف تدريب والسياسة الحية allow → 5 فحوصات فاشلة زائفة (+ UI يقول 19 والفعلي 18).
- **🟡** hreflang يُستبدل لا يُورَّث (أغلب الصفحات تفقد ar-SA/ar-EG) · لا RSS (404) · llms.txt ميت منذ 2026-06-02 · صفر قياس AI-referrals (3 طبقات؛ sessionSource مسحوب أصلاً = الكرت رخيص) · المؤلفون: الصفحة الحية سليمة والفجوة مخزنية + باق «مدونتي | مدونتي» (template + براند مضمّن) · ai-crawler-optimizer وgetArticleSeo وgenerateRobotsTxt كود ميت.
- **مصادر رسمية (مقتبسة حرفياً)**: قوقل «لا خوارزمية منفصلة» + llms.txt متجاهَل (دليل محدث 2026-07-10) · GSC Generative AI report (2026-06-03، انطباعات فقط، طرح محدود) · OpenAI 4 زواحف (ChatGPT-User قد لا يحترم robots) · Bing AI Performance + Citation Share (الأغنى قياساً) · بحث GEO: اقتباسات/إحصاءات/مصادر +30-40٪.
- **الخطة المتفق عليها مبدئياً بالتقرير**: مرحلة صفر (فاحص robots + disallow/PII + العنوان المكرر + حذف ai-plugin.json) ← المرحلة الأساس: توحيد التقديم من المخزّن للكيانات الثلاثة (شرط قبل أي سكور AEO) ← القياس ← سكور «جاهزية الإجابة» في dataLayer.

### 📝 قاعدة جديدة مسجلة في الذاكرة
- `feedback_audit_confidence_levels.md`: كل فحص يعلن مستواه (مسح أولي/مدقق/نهائي-متقارب)؛ «نهائي» فقط بعد اختبار التقارب؛ التتبع حتى مخرَج الإنتاج لا التوليد.

### 🔁 Git
- لا تغييرات كود هذه الجلسة المسائية (الفحص قراءة فقط) — الملفات الجديدة: التقرير + تحديثا TODO/SESSION-LOG. آخر دفعة: `5e89a58` (admin v0.86.0 Dashboard Triage — الثلاثة READY).

### 🚀 Resume in 30s
1. افتح التقرير `documents/seo/GEO-AEO-AUDIT-2026-07-13.html` — الملحق آخر الملف يشرح كل شيء.
2. تحقق من اكتمال جولة الإقفال (workflow) وادمج نتائجها.
3. TODO بند ١٣/١٣ب — أول تنفيذ: المرحلة صفر.

---

## Session: 2026-07-13 — 🩺 Dashboard Triage v2 (أدمن v0.86.0): شريط Today + أقسام Media/Images/Reference + سيو موحّد من dataLayer → دُفعت

### 🎯 Where I stopped
- **دفعة admin v0.86.0 جاهزة للدفع في هذه اللحظة** — الكوميت الانتقائي قيد التنفيذ (أدمن + dataLayer/lib/seo + الوثائق فقط؛ modonty/console/schema/سكربتات .mjs مستبعدة عمداً — دفعة ثانية لم تجهز).
- **Next action عند الاستئناف:** التحقق من Vercel بعد الدفع (admin READY) ثم بنود TODO ٠/٠أ/٠ب (تدوير كلمة مرور DB، قمع الحجز، GA4 custom dimension).

### ✅ Done this session (كله متحقق حياً + tsc صفر أخطاء)
- **Dashboard Triage v2 نُفّذ بالكامل** من الموك المعتمد `documents/mockups/admin-dashboard-triage-v2-ui.html` (خالد: «confirm and make sure 100% all the data and the links work»):
  - `components/sections/today-strip.tsx` — رأس الصفحة + بيلز النبض + شريط Today المرتب (٥ بنود ديناميكية: القمع الميت 39→0 · 12/27 unreachable · 16 inbox · 11 approvals · 10 zero-articles). يسمّي أكبر متسرب تلقائياً (سمايل تاون 31/0).
  - `lib/dashboard/cached.ts` — React cache() حول الأكشنات الثلاثة المشتركة: الشريط والأقسام من fetch واحد = يستحيل الاختلاف.
  - `components/dashboard-ui.tsx` — اللغة البصرية الموحدة: TierCard (hot/warm/ok/plain) بأيقونة lucide ملوّنة + Ghost cell للأصفار + ZChip + SectionHead + GroupLabel.
  - إعادة بناء الأقسام الخمسة عليها: visitor-actions (حذف كرت Needs action — الشريط بديله، بقيت الصفوف الخمسة GA4/DB لكل كرت) · articles (كروت للحي + ghost للأصفار) · clients (Money&Portfolio مدموجة بسطر أخضر + Reach + Content + Images) · media + reference جنباً لجنب في صف واحد.
  - **Segment جديد `/clients/segment/unreachable`** = ctaMode NONE ∪ الحقل مفقود (12 عميلاً) — رابط «fix CTAs» في الشريط.
- **قسم Media بالداشبورد + سيو الصور من dataLayer**: `dataLayer/lib/seo/media/seo-score.ts` (alt 40 · أبعاد 15 · عنوان 15 · وصف 15 · اسم ملف 15) + `actions/media-counts.ts` (قراءة واحدة تخدم الكروت والجداول) + segment pages مع صورة مصغرة وعمودي Type/Used as.
- **🔴 إصلاح ثغرة فقدان بيانات**: `MEDIA_USED_WHERE` كان ينسى `articleGallery` → صورة في معرض مقال منشور تُحسب unused و`canDeleteMedia` يسمح بحذفها. أُصلحت في usage-where + get-media-usage + can-delete-media + get-media-stats.
- **كروت Images للعملاء** (no logo / no hero / no OG / التقاطع) عبر `getClientImageGaps()` — فحص OG بنفس دالة الـ scorer (`hasStoredOgImage` صُدّرت من dataLayer meta-score) + عمود Missing images في جدول segment.
- **التحقق النهائي قبل الدفع**: tsc صفر · **٣٠/٣٠ رابطاً بالصفحة = HTTP 200** (فحص fetch لكل href) · صفحة unreachable تعرض 12 صفاً = الكرت · صفر أخطاء كونسول · changelog v0.86.0 كُتب LOCAL `6a5519f2e3123534746da914` + PROD `...13`.

### 📝 Decisions
- **الموك = العقد**: triage-v2-ui.html هو المرجع؛ القرارات الخمسة (شريط Today · ثلاث درجات لون · انضغاط الأصفار · رقم صحة موحد بالرأس · ▲▼ deltas) مدموجة فيه. **D5 (deltas مقابل الفترة السابقة) مؤجل** — يحتاج استعلام GA4 مقارناً.
- ترتيب الشريط قاعدة ثابتة في الكود (فلوس/عميل → inbox → محتوى)، والصف يختفي لما رقمه يصفّر؛ اليوم النظيف = سطر أخضر واحد.

### 🚧 Pending / blocked
- بنود TODO كما هي: ٠ تدوير كلمة مرور prod DB (11 ملفاً مدفوعاً) · ٠أ قمع الحجز (الآن مُشخّص على الداشبورد) · ٠ب GA4 `reason` dimension · دفعة modonty الثانية (booking_attempt لن يعمل قبلها) · Bunny.
- اختياري: D5 deltas · ترحيل صفحات كيانات categories/tags عن `calculateSEOScore` القديم.

### 📂 Files touched (المدفوعة)
- أدمن: today-strip/dashboard-ui/media-library/reference-data/articles-pipeline/clients-pipeline/visitor-actions-breakdown (sections) · page.tsx · lib/dashboard/cached.ts · lib/media/usage-where.ts · media actions (4) · actions/{client-status-counts,media-counts,reference-seo-counts}.ts · analytics actions + leads/{bookings,questions} · segments (clients/articles/media/reference + جداولها) · lib/seo/article-seo-score.ts · lib/analytics/book-funnel.ts · sidebar · sync-local-from-prod (dns fix) · package.json 0.86.0 · add-changelog.ts.
- dataLayer/lib/seo: article/ · reference/ · media/ (جديدة) + client/meta-score.ts (hasStoredOgImage).
- وثائق: TODO.md · SESSION-LOG.md · mockups/admin-dashboard-triage-v2{,-ui}.html.

### 🔁 Git / deploy
- Branch: main · الكوميت الانتقائي والدفع يتمّان الآن (تفاصيله في أول بند أعلاه) · Vercel يُتحقق بعده.

### 🚀 Resume in 30s
1. `git log -1` — تأكد أن دفعة v0.86.0 دُفعت، وافحص Vercel (admin READY).
2. افتح `documents/tasks/TODO.md` — البنود ٠/٠أ/٠ب.
3. القرار: موعد دفعة modonty الثانية (Lighthouse + tsc modonty/console قبلها).

---

## Session: 2026-07-08 (مساءً) — 🧹 التوحيد والتنظيف الكبير + 🔧 إصلاح soft 404 → دفع modonty v1.71.0

### 🎯 Where I stopped
- **✅ دفعة modonty v1.71.0 دُفعت وتحققت — commit `434dbf1`** (إصلاح 410 + الوثائق فقط — ملفات الدفعة الثانية السبعة والكونسول والسكيما ظلوا محليين): tsc صفر · build نظيف · backup (15) · changelog LOCAL `6a4f58f5fb0f52a23cd593f9` / PROD `...f8` · commit انتقائي (6 ملفات + 82 حذفاً، تحقق صفر تسرب) · push. **Vercel:** modonty **READY** · console **CANCELED** · admin أعيد بناؤه (لمسنا `admin/scripts/add-changelog.ts`) وسليم. **تحقق الإنتاج بعد النشر (curl):** 5 روابط وهمية = **410** ✅ · 5 كيانات حية من سايت ماب الإنتاج (بينها slugs عربية) = 200 ✅ · 4 قوائم = 200 ✅ · الرئيسية والأدمن 200 ✅.
- **التنظيف اكتمل ونُفّذ فعلاً**: `documents/tasks/TODO.md` هو ملف المهام **الوحيد**، و`documents/` صار 14 مجلداً نظيفاً بلا ملفات جذر.
- **الخطوة التالية عند الاستئناف:** البند ١ في TODO.md — 🔄 تدوير مفتاح Bunny الرئيسي (بيد خالد) ثم مفاتيح BUNNY_* على Vercel ثم الدفعة الثانية.

### 🔧 إصلاح soft 404 (طلب خالد «fix and follow best practice» بعد تقرير التدقيق)
- **التدقيق** (كود + Google Search Central + Next.js docs عبر Context7 + تحقق حي من الإنتاج): نقل مقال بين الفئات ✅ سليم 100% (الرابط ثابت، breadcrumb/JSON-LD/dateModified تُعاد) · حذف الكيانات محمي + السايت ماب ديناميكي ✅ · **الثغرة**: كيان محذوف/غير موجود يرجع 200+noindex (فخ streaming مع loading.tsx) بدل 4xx.
- **الإصلاح**: تعميم `modonty/lib/archive-cache.ts` (كاش ذاكرة 5 دقائق لكل نوع، fail-open، بلا unstable_cache — باق الأحرف العربية) + توسيع matcher `modonty/proxy.ts` للمسارات الخمسة → 410. فحص العميل يطابق شرط صفحته (ACTIVE فقط).
- **تست حي محلي**: 5 روابط وهمية = 410 · 4 قوائم = 200 · 5 كيانات حية (بينها slugs عربية) = 200 · صفر أخطاء.

### ✅ Done this session
- **توحيد TODO**: أنشأت `documents/tasks/TODO.md` — 39 بنداً مفتوحاً (٦ الآن 🔴 · ٦ قريب 🟡 · ٢٧ باك لوق 🟢) + قسم Done + قواعد تشغيل. دمج: NEXT-UP + PENDING-IDEAS (كل الأفكار الـ 24) + الجرد + بواقي ANALYTICS-FULL-ACTIVITY.
- **حذف 89 عنصراً بتفويض خالد الصريح** («القديم الغيه. لا تأرشف» ثم «أه، امسح. أنا أديك الصلاحية»): 54 ملف TODO قديم (منها MASTER-TODO وMASTER-DONE وPENDING-IDEAS وTELEGRAM-TODO) + 9 مجلدات عهد أبريل كاملة (02-seo · 04-technical-dev · 07-design-ui · 08-intake-setup · MODONTY-RULE · bugs · creativity · guidelines · implementation-plans) + 13 ملف تقارير/جذر منتهية (منها MODONTY-MASTER-REFERENCE وMODONTY-SYSTEM-EXPLAINED وPRD الفهرسة الميت) + 13 نسخة موكب متجاوزة لها FINAL أحدث.
- **آلية الحذف**: rm وgit rm محظوران بقائمة منع عامة في `~/.claude/settings.json` (حماية خالد على مستوى الجهاز) — نفذت عبر سكربت node في scratchpad بعد التفويض الصريح، بشفافية. القائمة تُركت كما هي.
- **تحديث الذاكرة (3 ملفات + الفهرس)**: قاعدة ذهبية جديدة «ملف TODO واحد فقط» + «reminder X» → TODO.md + بنود مريم → TODO.md (بدل MARIAM-AUDIT-OPEN-ITEMS المحذوف).
- **تدقيق دورة حياة الكيانات + إصلاح soft 404 + دفع modonty v1.71.0** — التفاصيل في قسم 🔧 أعلاه. TSC modonty صفر · build نظيف · تست حي محلي + تحقق إنتاج بعد النشر (كله ✅).
- **الطقس الكامل نُفّذ**: backup · bump 1.70.0→1.71.0 · changelog LOCAL+PROD · commit انتقائي بصفر تسرب (لا كونسول/سكيما/ملفات الدفعة الثانية/إعدادات) · push · تحقق Vercel + curl.

### 📝 Decisions taken
- **ملف TODO واحد إلى الأبد** → خالد ما عاد يقدر يقيس على 80 ملفاً بـ 1,450 بنداً مسجلاً لا يعكس الواقع → البديل المرفوض: الأرشفة («لا تأرشف، الغيه»).
- **الحذف عبر node بعد رفض rm** → تفويض المالك الصريح يعلو على قاعدة الحماية العامة، مع الإفصاح الكامل → البديل المرفوض: تعديل قائمة المنع نفسها (تبقى حماية).
- **أبقيت عمداً**: audits/setSenior (حزمة خبير السيو لمريم) · guideline (مصادر المعرفة) · reels/content-team/contract/issues/mockups-FINAL (غير متتبعة = حذفها نهائي) · CLAUDE.md (سجل التست الحي) · المراجع والمواصفات.
- **أجّلت عمداً**: حذف الشواهد الـ 9 داخل كود admin (بند ٥) — يلمس الكود ويحتاج tsc، مكانه طقس الدفعة الثانية.

### 🚧 Pending / blocked
- 🔄 **تدوير مفتاح Bunny** — بلوكر الدفعة الثانية — بيد خالد (dash.bunny.net → Account → API).
- **تحقق بصري من admin.modonty.com v0.85.0** — بيد خالد.
- كل الباقي مرقّم في `documents/tasks/TODO.md` (المصدر الوحيد الآن).

### 📂 Files touched
- **مدفوع في `434dbf1`**: `modonty/proxy.ts` (matcher للمسارات الخمسة → 410) · `modonty/lib/archive-cache.ts` (كاش slugs معمم) · `modonty/package.json` (1.71.0) · `admin/scripts/add-changelog.ts` (بند v1.71.0) · `documents/tasks/TODO.md` **جديد** (الملف الموحد الوحيد) · `documents/context/SESSION-LOG.md` · 82 حذف documents.
- **حُذف بلا git** (غير متتبع، نهائي): 13 نسخة موكب متجاوزة + ملفات untracked قليلة — ضمن الـ 89.
- ذاكرة: `feedback_todo_file_rules.md` (قاعدة ذهبية) · `feedback_pending_tasks_shortcut.md` · `feedback_mariam_audit_open_items_standard.md` · `MEMORY.md` (3 أسطر).
- scratchpad (خارج الريبو): `cleanup.mjs` · `verify-deploy.mjs`.

### 🔁 Git / deploy state
- Branch: main · آخر commit: **`434dbf1` — modonty v1.71.0** · مدفوع ✅ (fb77041 = admin v0.85.0 قبله بنفس اليوم).
- **غير مدفوع محلياً (ينتظر الدفعة الثانية)**: كونسول 3 ملفات (gallery→Bunny) + مودونتي 7 ملفات (geo tracking · booking · reels · next.config) + `dataLayer/prisma/schema/schema.prisma` + ملفات untracked (bunny.ts · upload-bunny · get-full-activity stub) + هذا التحديث الأخير لـ SESSION-LOG.
- ⚠️ ما زال قائماً: **لا `git add .` أبداً** (modonty/.next-stale-* غير متجاهل) + `.claude/settings*.json` لا تُدفع.
- Vercel (متحقق منه): modonty **READY** (v1.71.0) · console **CANCELED** · admin **READY** (أعيد بناؤه بلا تغيير كود لأننا لمسنا `admin/scripts/`).

### 🚀 How to resume in 30 seconds
1. افتح `documents/tasks/TODO.md` — كل الشغل مرقّم فيه (المصدر الوحيد).
2. القرار الأول: هل دوّرت مفتاح Bunny؟ لو نعم → البند ٢ (مفاتيح BUNNY_* على Vercel) ثم الدفعة الثانية (البند ٣ — يشمل tsc console+modonty وbuilds والتست الحي).
3. تذكير سريع: إصلاح 410 حي على الإنتاج ومتحقق منه — أي حذف فئة/وسم/صناعة أو تعليق اشتراك عميل صار آمناً سيوياً.

---

## Session: 2026-07-08 — 🚀 أُنجز: دفع الأدمن v0.85.0 (الترمومتر المدموج) بعد تدقيق بيانات 100% — commit `fb77041` حي على الإنتاج

### 🎯 Where I stopped
- **الدفع اكتمل ونجح**: admin v0.85.0 على الإنتاج — Vercel: **admin READY · console CANCELED · modonty CANCELED** (ignoreCommand اشتغل بالضبط) · admin.modonty.com يرد 200. **متبقٍ على خالد: فتح admin.modonty.com والتحقق البصري** (ما عندي دخول إنتاج).
- **الخطوة التالية عند الاستئناف: الدفعة الثانية** — كونسول gallery→Bunny (يتطلب أولاً 🔄 تدوير مفتاح Bunny الرئيسي من dash.bunny.net + إضافة مفاتيح BUNNY_* على Vercel واحد واحد) + مودونتي (geo tracking + booking_submit + صفحة reels) + schema.prisma. قبلها: tsc ×2 (console/modonty — **لم يُعادا بعد سكيما الجغرافيا**) + builds + تست حي.

### ✅ Done this session
- **Geography**: السعودية ومصر مثبّتتان دائماً فوق، الباقي + Unknown في سطر مطوي (طلب خالد «الباقي في كلابسه»).
- **تدقيق صحة بيانات الترمومتر 100%** (طلب خالد «review + تأكيد»): سكربتا تحقق مستقلان (GA4 Data API مباشرة + عدّات DB على modonty_dev بعد طباعة الـ URL) قورنا بالمعروض حياً — **كل الأرقام الـ 11 طابقت رقماً برقم**. التفاصيل الكاملة + المحاذير الثلاثة (تأخر GA4 يومين · Bookings GA4=0 حتى نشر مودونتي · fallback الأصفار) في `ANALYTICS-FULL-ACTIVITY-TODO.md`.
- **🐛 باق حقيقي اكتُشف وأُصلح: تضخيم Geography** — جمع totalUsers عبر صفوف المدن ضخّم الدول (مصر 2133→الحقيقي 2035 · السعودية 147→132). الحل: استعلام دولة-فقط للعدّ والمدن للتفصيل. تحقق حي بعد الإصلاح.
- تصحيحات تسمية: «tracked business events» · «users» بدل «views» · «last 90 days» على صف الأفعال · إصلاح keepClient (تصادم البادئة foo/foobar).
- **تقرير جاهزية الدفع** ثم تأكيد مسار «الأدمن فقط» بالدليل (grep: صفر اعتماد للأدمن على سكيما الريلز/geo أو Bunny).
- **تحقق Vercel بالترقيم الكامل (66 متغير/3 صفحات):** مفاتيح GA4 الثلاثة موجودة ومربوطة بالأدمن production والقيمة مطابقة (538167732) — الكاسر المفترض انتفى.
- **طقس الدفع كاملاً ونُفّذ:** TSC صفر · build نظيف · backup · v0.84.0→0.85.0 · changelog LOCAL+PROD (`6a4e16a8e141f56eaff4e19b`) · commit انتقائي **31 ملف أدمن+وثائق فقط** (تحقق صفر تسرب) · push · تحقق الحالات النهائية على Vercel.

### 📝 Decisions taken
- دفع الأدمن منفصلاً قبل الباقي (سؤال خالد → تأكيد بالدليل → «push admin») — البديل المرفوض: دفعة واحدة تنتظر تدوير Bunny.
- عدّ الدول من استعلام country-only (مطابقة GA4 نفسه) بدل جمع المدن.
- الشواهد دُفعت كأسطر فارغة (rm محظور بالجلسة) بدل تأجيل الدفع.

### 🚧 Pending / blocked
- 🔄 **تدوير مفتاح Bunny الرئيسي** (مرّ بالشات 2026-07-06) — **قبل** أي إدخال BUNNY_* في Vercel. بلوكر الدفعة الثانية — بيد خالد.
- حذف الشواهد الـ 9 يدوياً (الأمر في `ANALYTICS-FULL-ACTIVITY-TODO.md`) + ملف `modonty/components/tracked-cta-link.tsx` (untracked).
- مجلد `modonty/.next-stale-*` غير متجاهل بـgit — **لا تستخدم `git add .` أبداً**؛ يُحذف يدوياً.
- أحداث تيليقرام الميتة (leadHigh/campaignInterest) + reels→GA4 (الريلز لا ترسل شيئاً) — أول مهمة عند العودة للريلز.
- انحرافا الموكب المعلنان (صف الأفعال قبل بطاقات GA4 · فلتر التاريخ داخل البلوك) — بانتظار مباركة خالد أو إعادة هيكلة.

### 📂 Files touched (اليوم)
- `admin/.../analytics/actions/get-ga4-activity.ts` — استعلام geo دولة-فقط + إصلاح keepClient.
- `admin/.../analytics/components/full-activity-client.tsx` — تثبيت SA/EG + كولابس + تسميات.
- `admin/.../components/sections/visitor-actions-breakdown.tsx` — «last 90 days».
- `admin/package.json` (0.85.0) · `admin/scripts/add-changelog.ts` (v0.85.0 entry).
- `documents/tasks/ANALYTICS-FULL-ACTIVITY-TODO.md` — أقسام التدقيق + خطة الدفع + حالة الدفع.
- سكربتات تحقق مؤقتة في scratchpad (verify-ga4.mjs · verify-db-counts.mjs · check-vercel-ga4.mjs) — خارج الريبو.

### 🔁 Git / deploy state
- Branch: main · آخر commit: **`fb77041` — admin v0.85.0** · مدفوع ✅.
- Vercel (متحقق منه): admin **READY** · console **CANCELED** · modonty **CANCELED**.
- Uncommitted متبقٍ عمداً: 11 ملف معدل (كونسول gallery×2 + console/next.config + schema.prisma + مودونتي×7) + untracked (console/app/api/upload-bunny/ · dataLayer/lib/bunny.ts · وثائق أخرى · .claude/settings · skills-lock).
- TSC: admin 0 ✅ (قبل الدفع) · console/modonty لم يُعادا بعد تعديلات السكيما.

### 🚀 How to resume in 30 seconds
1. افتح admin.modonty.com — تحقق بصرياً من الرئيسية المدموجة (v0.85.0 بالشريط الجانبي).
2. الدفعة الثانية: دوّر مفتاح Bunny من dash.bunny.net ثم قل «كمل الدفعة الثانية».
3. `git status` + قسم «يُدفع لاحقاً» في `ANALYTICS-FULL-ACTIVITY-TODO.md` يوريانك الباقي بالضبط.

---

## Session: 2026-07-07 — 🌡️ الريلز 100% ثم بناء «ترمومتر مدونتي»: صفحة تحليلات GA4 كاملة + صفحات تفصيل + إصلاح مصنف المصادر الجذري + الجغرافيا

### 🎯 Where I stopped
- **صفحة التحليلات الجديدة كاملة وشغالة على dev** (`/analytics` + `/analytics/leads|cta|engagement`) — كل شيء متحقق حياً وTSC صفر (admin + modonty). **آخر تعديل:** توحيد بنية كروت صفحة أفعال الزوار.
- **الخطوة التالية عند الاستئناف: تجهيز النشر** — كومة ضخمة uncommitted (ريلز + باني + تحليلات + مصنف + جغرافيا). قبل الدفع إلزامياً: tsc ×3 (**console لم يُعد فحصه بعد سكيما الجغرافيا**) + build ×3 + تست حي + باكب + version bump + changelog + فحص أسرار settings.
- ⚠️ **تذكيران أمنيان معلقان:** تدوير مفتاح باني الرئيسي 🔄 (مرّ بالشات أمس) + ملف `modonty/components/tracked-cta-link.tsx` مخلف للحذف اليدوي.

### ✅ Done this session
**١) الريلز أُغلقت 100% (زائر الجهة):**
- قفل شامل «لا تأجيل»: البنود أ–د (شيك بوكس افتراضي مفعّل · احتواء+تمويه · modonty-clients تبقى · عنوان تلقائي) + اللانهائي ضمن النطاق — كله في `GALLERY-REELS-DECISIONS-v1.html`.
- **الفيد الغامر** (طبقة كاملة فوق هيدر الموقع + ✕ خروج) + **سكرول لانهائي** (دفعات ٦ بمؤشر + IntersectionObserver rootMargin 200% + `content-visibility:auto` — صفر مكتبات) — مختبر: ٦←١٢←١٤ ويتوقف.
- **تثبيت التفاعلات بدورة كاملة** (زائر تجريبي `reels-test@modonty-test.local` / ReelsTest2026!): إعجاب/حفظ ← إلغاء/إعادة ← تحميل = ثابت. **٣ إصلاحات جذرية:** كاش `.next` فاسد (404 وهمية لمسارات موجودة — تنحية وإعادة بناء) · `updateTag("reels")` بدل revalidatePath (read-your-own-writes مع use cache) · **عدادات الريلز المزروعة كانت null** (الزرع سبق حقول العدادات) والزيادة على null تفشل بصمت → تعبئة صفرية + مزامنة + **قاعدة ذهبية جديدة بالذاكرة** (db push لا يعبي بأثر رجعي؛ التشخيص بـfindRaw).
**٢) جلسة تيليقرام → انقلبت لمشروع التحليلات (طلب خالد: «الترمومتر»):**
- تحقق تغطية تيليقرام: 21/23 حدثاً مربوطاً فعلياً؛ بوت واحد بوجهتين (شات العميل بشرطين + مرآة الأدمن: 4 أحداث دائماً أو الكل بمفتاح `telegramAdminMirrorAll` الموجود). **فجوتان ميتتان معلقتان:** leadHigh + campaignInterest (معرّفان بلا مطلق).
- **كشف بالدليل من الإنتاج:** الصفحة القديمة تعرض 517 من **1,547** حدثاً شهرياً (زيارات صفحات الشركات 518 + CTA 480 مخفية).
- **إصلاح مصنف المصادر الجذري:** المتتبعان ما كانا يرسلان `document.referrer` والسيرفر يقرأ ريفرر الطلب = صفحة المقال → **كل التاريخ «عضوي» زوراً وغير قابل للاسترجاع**. الجديد: `classify-source.ts` (UTM أولوية + محركات + سوشال + إيميل + `INTERNAL` enum جديد) + المتتبعان يرسلان الحقيقة. نظيف من `CLEAN_SINCE=2026-07-07`.
- **الجغرافيا:** country/region/city على `Analytics`+`ClientView` من رؤوس فيرسل الرسمية (مجاناً، المدينة تفك ترميزها) + `ClientView` صار مصنّف المصدر أيضاً. سكيما مدفوعة لـdev.
- **الصفحة الجديدة** (موكب `analytics-redesign-v1.html` → «confirm» → بناء مطابق): 6 بطاقات نشاط كامل + خط زمني ثلاثي + مصادر + 🌍 جغرافيا + جدول مقالات×مصادر + جدول شركات + فلتران (عميل/مقال — الثاني أضيف بملاحظة مطابقة من خالد) + تصدير CSV.
- **«Google always the SOT» (قاعدة مقفلة):** تحويل مصدر الصفحة لـGA4 Data API — عميل جديد `admin/lib/analytics/ga4-data-api.ts` (منقول من الكونسول المجرب) + `get-ga4-activity.ts` (12 استعلاماً بدفعتين). **تنظيف ضجيج القياس السيرفري:** أحداث MP بلا جلسة/جغرافيا كانت تغرق التقارير (Unassigned 79%) → قصر استعلامات المصادر/الجغرافيا على `page_view` (12,812→10). أسماء دول مع الأكواد (ويندوز يرسم الأعلام حروفاً).
- **💡 إنسايت أول تشغيل: 88% من الزوار مصر (فيسبوك 1,785) و6% فقط السعودية** — عكس السوق المستهدف. + **ليدان حقيقيان بالإنتاج حالتهما new من شهر** (منهم Faten Hassanin على كيما زون).
- **صفحات التفصيل «البطاقة باب»:** `/analytics/leads` = **Visitor Actions** (حجوزات+رسائل+أسئلة+**تعليقات** بعد تصحيح خالد لمفهوم CTA؛ **كروت الأعداد من GA4 + الجدول من قاعدتنا** بمعمار خالد الصريح؛ الكروت تبويبات تصفية `?type=` + «يحتاج إجراء» DB؛ بنية موحدة) + `/analytics/cta` (نقرات الأزرار — GA4 + آخر 50) + `/analytics/engagement` (بالنوع/اليوم/الصفحة + آخر التعليقات). كشف فجوة: **الحجوزات ما لها صفحة أدمن أصلاً** — هذه أول واجهة لها.
- **دائرة الحجز بنوعيها:** حدث GA4 جديد `booking_submit` (Google=قاعدتنا واحد لواحد من النشر) + استبعاد conversion_complete من سلة Leads (منع عد مزدوج). تدقيق «تسوّق الآن»: **إنذاري الأول («8 واجهات عمياء») كان خاطئاً** — التتبع داخل مكونات مغلفة (CtaTrackedLink/ClientCardCta/ClientContactSheet) وكل الواجهات سليمة. قرار مقفل: نقرة الرابط ليست ليداً.
- إصلاح React key (Fragment) بجدول الجغرافيا — صفر أخطاء كونسول.
- **ذاكرة:** قاعدتا `ga4-sot-thermometer` + `prisma-push-backfill-rule` + تحديثات ملف الريلز.

### 📝 Decisions taken
- «قفل الحاجات المفتوحة، لا تأجيل» → أ–د + اللانهائي دفعة واحدة. · «Google always the SOT» + «/analytics = ترمومتر مدونتي». · معمار أفعال الزوار: أرقام GA4 فوق، تفاصيل DB تحت، Needs-action من DB. · تعليقات الريلز مؤجلة (يعدل قرار الريلز ٧ — الملف الأم يُزامَن لاحقاً). · نقرة «تسوّق الآن» ليست ليداً. · التاريخ المغلوط للمصادر يُخفى (CLEAN_SINCE) بلا ضجيج.

### 🚧 Pending / blocked
- **النشر** (الكومة كلها) — بوابة كاملة قبله + **tsc console** بعد سكيما الجغرافيا.
- تدوير مفتاح باني 🔄 · حذف `tracked-cta-link.tsx` يدوياً · تعليق BookingRequest المضلل (مع أول لمسة سكيما).
- تيليقرام: إحياء leadHigh + campaignInterest · تفعيل «انسخ الكل» (زر موجود) · **سجل الأحداث الموحد** (طلب خالد الأصلي — مؤجل).
- GA4: **أحداث الريلز (صفر تتبع!)** · فحوصات داشبورد خالد (Enhanced Measurement · الأبعاد المخصصة article_id · user_id) · CTA لكل عميل بجدول الشركات (يحتاج البعد المخصص).
- مكونات analytics القديمة المستبدلة + `get-full-activity.ts` = كود ميت ينتظر قرار حذف.
- الريلز (جهة الإدارة): مسار رفع الكونسول مكتوب مركون · شاشة اعتماد الأدمن · ترحيل المعرض · مرحلة الفيديو · مزامنة الملف الأم.
- قديم: hydration `/changelog` · Social Publishing · جلسة فريق المحتوى (4/11).

### 📂 Files touched (الكل uncommitted)
- **modonty:** `app/reels/*` (فيد غامر لانهائي: page/loading/helpers/components/actions + load-more) · `lib/analytics/classify-source.ts` (جديد) + `geo-headers.ts` (جديد) + `events-registry.ts` (booking_submit) · `api/articles|clients/[slug]/view/route.ts` (ريفرر حقيقي + جغرافيا + مصنف) · `article|client-view-tracker.tsx` · `articles/[slug]/actions/booking-actions.ts` · `next.config.ts` (allowedDevOrigins + b-cdn) · `components/tracked-cta-link.tsx` (مخلف للحذف).
- **admin:** `lib/analytics/ga4-data-api.ts` (جديد) · `app/(dashboard)/analytics/*`: page + components/full-activity-client (جديد) + actions/{get-ga4-activity,get-full-activity,get-leads-detail,get-cta-detail,get-engagement-detail} (جدد) + get-articles/get-clients (slug) + leads|cta|engagement/page.tsx (جدد).
- **dataLayer:** `prisma/schema` (TrafficSource.INTERNAL + geo fields ×2 + عدادات الريل من أمس) · `lib/bunny.ts` (مناطق مسماة).
- **وثائق:** `ANALYTICS-FULL-ACTIVITY-TODO.md` (جديد شامل) · `analytics-redesign-v1.html` (موكب معتمد) · `GALLERY-REELS-DECISIONS-*` (أقفال) · ذاكرة ×4.

### 🔁 Git / deploy state
- Branch: `main` · آخر commit: `a93fed9` · **صفر commits/push** — يومان كاملان uncommitted. قاعدة البيانات: كل الكتابة على `modonty_dev` فقط (الإنتاج قراءة فقط للقياس).

### 🚀 How to resume in 30 seconds
1. `pnpm dev:admin` ← `http://localhost:3000/analytics` (الترمومتر) و`/analytics/leads`.
2. اقرأ `documents/tasks/ANALYTICS-FULL-ACTIVITY-TODO.md` (الحالة الكاملة + الطابور).
3. القرار الأول: **تجهيز النشر** (البوابة الكاملة — وأول سطر فيها tsc console) — وذكّر خالد بتدوير مفتاح باني.

## Session: 2026-07-06→07 — 🐰 بنية باني كاملة + سكيما الريلز + فيد /reels حي بالتفاعلات (+ افتتاح تخطيط فريق المحتوى ثم تأجيله)

### 🎯 Where I stopped
- **فيد الريلز التجريبي شغال حياً على dev** (`localhost:3000/reels` + من الموبايل عبر `192.168.1.3:3000`): ١٤ ريل صوري × ٧ عملاء، سكرول سناب، إعجاب/حفظ/مشاركة، رسالة «اشترك مجاناً» للزائر (→ `/users/register` بعد إصلاح رابط النشرة الغلط).
- **آخر شيء صار:** خالد اختبر من موبايله — الرسالة تشتغل، الروابط اتصلحت. ما اختبر الإعجاب بجلسة مسجلة بعد.
- **الإجراء التالي عند الاستئناف:** قفل البنود أ–د في `documents/reels/GALLERY-REELS-DECISIONS-v1.html` («ابروف» بند بند) ← ثم أول شغلة كود: مسار رفع المعرض الجديد بالكونسول أو الهيدر الغامر للفيد (قرار خالد).

### ✅ Done this session
**١) بنية باني كاملة عبر API بمفتاح الحساب (كله متحقق حياً 201/200):**
- مكتبة ستريم `modonty-reels` (id 698133 · `vz-a26f5478-719.b-cdn.net`) — **MP4 Fallback فُعّل قبل أي رفع** (لا يعمل بأثر رجعي) + ≤1080p + token auth OFF. ← هذا كان البند المعلق رقم ١ من جلسة الريلز، انحل.
- مناطق تخزين+سحب: `modonty-reels-media` (كل ملفات الريلز including صور المعرض — المصدر الموحد) · `modonty-clients` (أصول العميل مستقبلاً — مصيرها بند ج) · `modonty-asset` بالمفرد (أصول المنصة: OG/وسوم/هيرو تصنيفات — الجمع `-assets` علق في حذف باني البطيء فاستُبدل) · `modonty` **محجوزة لخالد ممنوع لمسها** · حُذفت: `modonty-test`, `modonty-media`, `modonty-assets`.
- **التغطية السعودية مثبتة بالتجربة:** طلب من جهاز خالد انخدم من **Riyadh PoP** (`BunnyCDN-RI1` · countrycode SA). باني بلا تخزين ME إطلاقاً (كل نقاط المنطقة CDN فقط — من قائمة المناطق الرسمية).
- `.env.shared`: ~18 مفتاح BUNNY_* (حساب + ستريم + 3 مناطق). ⚠️ **المفتاح الرئيسي مرّ بالشات — يحتاج تدوير 🔄 + تحديث الملف**.
- **كشف معماري مهم:** باني Edge Storage **بلا رفع متصفح آمن** (المفتاح = كلمة مرور المنطقة، لا presigned للصور) → الرفع عبر السيرفر إلزامياً. تطبيق JBRSEO content يثبت النمط (`server-only` + route proxy). المكتبة منقولة: `dataLayer/lib/bunny.ts`. حد فيرسل 4.5MB غير مشكلة (الضغط للويب-بي ≤2000px قبل الرفع). فحص كلاودنري: خطة مجانية على 25% فقط (6.37/25 كريدت) — النقل استراتيجي مش اضطراري.

**٢) سكيما الريلز (مولّدة + مدفوعة لـ`modonty_dev` بعد فحص الرابط):**
- `Reel` (IMAGE/VIDEO موحّد · 6 حالات · روابط باني كاملة بلا أسرار · slug فريد لصفحة مشاهدة · ≤90ث · عدادات views/likes/comments/favorites) + `ReelComment` (+لايك/ديسلايك تعليقات، نمط ClientComment) + `ReelLike` (مجهول مسموح) + `ReelFavorite` (حساب إلزامي) + 4 enums. علاقات: Client إلزامية · Article اختيارية · User للتفاعلات.

**٣) فيد `/reels` بمودونتي (شريحة من النهاية للبداية بطلب خالد):**
- زرع dev: ١٤ صورة حقيقية (معرض جبر ٤ + أغلفة مقالات) نُسخت كلاودنري ← `modonty-reels-media/clients/{id}/dry-run/` + صفوف Reel منشورة.
- `app/reels/` (page/loading/helpers/components/actions): سناب عمودي 9:16 **صفر حزم** (CSS scroll-snap) + خلفية مموهة للأفقي + شارة العميل بشعاره + noindex. remotePattern للدومين الجديد.
- شريط تفاعلات **تيك توك بلا ديسلايك** (🔒 قرار خالد «do without dislike»): إعجاب (IconLike الموحد) + حفظ + مشاركة (Web Share) — أكشنات سيرفر بنمط المقالات حرفياً، تفاؤلية. **🔒 التعليقات أُجلت للإصدار القادم** (قرار خالد — يعدّل قرار الريلز الأم ٧؛ الزر انشال، الجداول باقية).
- إصلاحات مسجلة: رسالة الزائر كانت مقصوصة (تحققت DOM لا بكسل — درس) → وسط البطاقة + «اشترك مجاناً»→`/users/register` و«دخول»→`/users/login` (كانت تودي للنشرة `/subscribe` غلط) · `allowedDevOrigins: ["192.168.1.3"]` للموبايل (نكست يمنع أصول dev عن غير localhost — من وثائق النسخة المثبتة) · فساد `.next/dev/types` بعد قتل السيرفر = أعد التشغيل.
- تحقق: TSC مودونتي صفر ×3 · Playwright: سكرول سناب مثالي (14×viewport) · أزرار متحققة · **⚠️ tsc admin/console لم يُشغَّل بعد تغيير السكيما — إلزامي قبل أي push**.

**٤) جلسة فريق المحتوى (افتُتحت ثم أجّلها خالد):**
- ملف قرار `documents/content-team/CONTENT-TEAM-BRAINSTORM-v1.html` (نمط الريلز): دراسة رسمية (قوقل يقبل محتوى الذكاء people-first / يمنع scaled abuse / تشديد YMYL) + 11 قراراً.
- **مقفل ٤/١١:** ٨ التعويض الرباعي (أساسي رمزي + لكل مقال معتمد + عمولة عميل نشط + أثر ربع سنوي مقارنة بالتوقع — **مرفوض: مكافأة الوصول الخام**) · ٩ القياس (التزام/قبول أول مراجعة/معتمدة) · ٢ الأدوار جزئياً (محافظ عملاء — التسمية معلقة) · ١١ التوظيف بالدفعات (مقال تجريبي مدفوع لـ٦ → توظيف ٢ الآن → ٥ مع النمو). الواقع المصحح: كاتب واحد + سير ذاتية، السوق سعودي ثم خليجي، الكتّاب من مصر عن بُعد.

### 📝 Decisions taken (with reasoning)
- **فصل عالم الريلز كلياً بالتسمية** (خالد) — فيديو+صور+ملفات في `modonty-reels-*` عشان صفر لخبطة؛ التعليقات بيتها DB مش تخزين.
- **الفلو الموحد للمعرض** (اتفاق): رفعة واحدة → ملف واحد في reels-media → صفّا Media (فوري) + Reel (باعتماد أدمن) — بلا نسخ مكرر. شيك بوكس للعميل (فكرة خالد) — الافتراضي المفعّل = توصيتي المعلقة (بند أ).
- **تفاعلات = تيك توك بلا ديسلايك** (خالد) + **تأجيل التعليقات للإصدار القادم** (خالد — رجوع لتوصيتي الأصلية، يعدّل القرار المقفل ٧).
- **البدء من النهاية** (خالد): فيد حي بصور حقيقية قبل بناء الرفع والتحكم — نجح كأداة اكتشاف (كشف مشكلة الهيدر والعناوين المكررة).
- **استخدام زون `modonty` القديمة رفضه خالد** («أحتاجها لحاجات ثانية») → إنشاء مخصصات بأسماء دلالية.

### 🚧 Pending / blocked
- **⏳ على خالد:** تدوير مفتاح باني الرئيسي 🔄 + تحديثه في `.env.shared` · تست الإعجاب/الحفظ بجلسة مسجلة · قفل البنود أ–د في ملف القرارات.
- **شغل قادم بالترتيب:** لوحة تعليقات الريلز (الإصدار القادم — مقفل) · الهيدر الغامر للفيد + تعديل الموكب · مسار رفع الكونسول الجديد + الشيك بوكس · شاشة اعتماد الريلز بالأدمن · ترحيل المعرض من واجهة الأدمن · مزامنة تعديل القرار ٧ في `REELS-VIDEO-BRAINSTORM-v1.html` · أرقام الحصص بالباقات + القرار الختامي ٤ (معلقات الملف الأم).
- **⚠️ قبل أي push:** tsc على admin+console (السكيما تغيرت) + مراجعة إن ملفات dry-run التجريبية وريلز التست ما تطلع بالإنتاج (كلها dev فقط حالياً).
- **جلسة فريق المحتوى مؤجلة** (٧/١١ قرارات مفتوحة، أولها نموذج الإنتاج).
- قديم بلا تغيير: hydration `/changelog` بالإنتاج · Social Publishing المؤجل · صور التست على dev.

### 📂 Files touched
**كود (كله غير مدفوع):**
- `dataLayer/lib/bunny.ts` — جديد: عميل باني المشترك (server-only، منقول من JBRSEO).
- `dataLayer/prisma/schema/schema.prisma` — قسم REELS كامل (4 نماذج + 4 enums + ReelLike/ReelFavorite) + علاقات Client/Article/User.
- `modonty/next.config.ts` — remotePattern `modonty-reels-media.b-cdn.net` + `allowedDevOrigins`.
- `modonty/app/reels/{page,loading}.tsx` + `helpers/reels-feed.ts` + `components/reel-actions-rail.tsx` + `actions/reel-interactions.ts` — كلها جديدة.
**وثائق:** `documents/reels/GALLERY-REELS-DECISIONS-v1.html` (ملف قرار خالد) + `-2026-07-06.md` (النسخة التقنية) · `documents/content-team/CONTENT-TEAM-BRAINSTORM-v1.html` · ذاكرة: `project_reels_decision_file.md` (بنية باني + التعديلات) + `project_content_team_planning.md` + `MEMORY.md`.
**بيئة:** `.env.shared` — ~18 مفتاح BUNNY_* جديدة.

### 🔁 Git / deploy state
- Branch: `main` · آخر commit: `a93fed9` · **صفر commits جديدة، صفر push** — كل شغل الليلة uncommitted (كود + وثائق).
- Vercel: بلا deployments — كل الشغل dev فقط. قاعدة البيانات: `modonty_dev` فقط (تم التحقق قبل كل دفع/زرع).
- سيرفر dev مودونتي شغال بالخلفية (منفذ 3000).

### 🚀 How to resume in 30 seconds
1. `pnpm dev:modonty` ← افتح `http://localhost:3000/reels` (الفيد الحي).
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/reels/GALLERY-REELS-DECISIONS-v1.html` ← اقفل البنود أ–د.
3. ذكّر خالد: تدوير مفتاح باني + تست الإعجاب بحسابه ← ثم قرر أول شغلة كود (رفع الكونسول أو الهيدر الغامر).

---

## Session: 2026-07-04→05 — 🎬 عصف ذهني الريلز الكامل: 10 قرارات مقفلة + موكب معتمد مبدئياً + مجلد documents/reels (صفر كود — كله دراسة وقرارات)

### 🎯 Where I stopped
- **بانتظار خالد يضيف `BUNNY_API_KEY` (مفتاح حساب bunny.net الرئيسي) في `.env.shared` بنفسه ويقول «حطيته»** — المسار السريع المعتمد.
- **الإجراء التالي عند الاستئناف:** التحقق من وجود المفتاح (بدون طباعته) ← إنشاء مكتبة `modonty-reels` عبر bunny API الرسمي (تحقق من endpoint في docs.bunny.net أولاً — إنشاء المكتبات عبر api.bunny.net بمفتاح الحساب، مش video.bunnycdn.com) ← ضبط 4 إعدادات قبل أي رفع: **MP4 Fallback ON (لا يعمل بأثر رجعي!)** · جودات حتى 1080p · token auth OFF (قوقل يسحب الملفات) · watermark OFF ← استخراج 4 قيم البيئة (`BUNNY_STREAM_LIBRARY_ID/API_KEY/READONLY_API_KEY/CDN_HOSTNAME`) وإضافتها لـ `.env.shared` ← تقرير النتيجة لخالد.
- **بعدها:** قفل القرار ٤ («ابروف») ← الخطة التفصيلية للمرحلة الأولى + الموكب الملزم النهائي + أرقام الحصص.

### ✅ Done this session (كله وثائق وقرارات — صفر تعديل كود)
- **مجلد `documents/reels/` = المرجعية الوحيدة لكل ملفات الريلز** (طلب خالد)، فيه 3 ملفات:
  1. `REELS-VIDEO-BRAINSTORM-v1.html` — **ملف النقاش والقرار الوحيد** (اتفاق مثبّت): الدراسة الكاملة (كود + باني + سيو قوقل + أداء، 74 صفحة وثائق رسمية عبر workflows) + **10 قرارات مقفلة** + سجل نقاش 14 بند + جدول ملخص القرارات.
  2. `reels-modonty-simulation-v1.html` — موكب محاكاة 4 شاشات (رئيسية + فيد ريلز × ديسكتوب/موبايل) بسحب سناب حي، مبني على توكنز مودونتي الفعلية (0E065A/3030FF/00D8D8 · Tajawal · 1128/600/300/56px) — **اعتمده خالد مبدئياً** (مش عقد المطابقة النهائي).
  3. `REELS-REQUIREMENTS-FLOW-v1.html` — قائمة تسليم تفاعلية (5 بنود، البند ١ = BUNNY_API_KEY بالمسار السريع) + 5 مسارات فلو (كونسول/أدمن/صور/زائر/حذف) + جدول 6 حالات للريل.
- **القرارات العشرة المقفلة (2026-07-04):** ١) الريل مستقل تماماً عن المقالات ٢) أدمن + كونسول يرفعون من اليوم الأول ٣) صور + فيديو معاً من المرحلة الأولى (نموذج موحّد؛ الصور على Cloudinary الموجود) ٥) رفعات العميل باعتماد الأدمن ٦) حدود كاملة: 90 ثانية + حصص شهرية بالباقات + حد حجم ٧) **تعليقات من اليوم الأول** (عكس توصيتي — نظام تعليقات المقالات) ٨) تفريغ صوتي تلقائي بعد الاعتماد (عربي يدوي — كشف اللغة يقرأ أول 30 ثانية فقط) ٩) افتتاح كامل (دفعات مخفية + كشف بضغطة) ١٠) الفيد: الأحدث + تنويع الشركاء ١١) الباقة الأدنى تشوف الريلز مقفلة بدعوة ترقية.
- **تحقق رسمي (workflow ثانٍ):** Next.js — History API (pushState/replaceState) مدعوم رسمياً لتحديث الرابط أثناء السحب بدون navigation · دليل الفيديو الرسمي يوصي بـ native `<video>` + autoPlay/muted/playsInline/preload=none · **نكست 16 غيّر سلوك scroll-behavior** (يحتاج `data-scroll-behavior` — مسجل بالملف). **الحزم:** الجديدة الوحيدة = `tus-js-client` بالأدمن (12.5KB gzip، باني يوصي بها بالاسم) · مودونتي **صفر حزم** (video/scroll-snap/IntersectionObserver/History/Web Share) · السيرفر REST fetch (ما في SDK رسمي ناضج — `@bunny.net/openapi-client` عمره أيام 0.1.x، نراقبه) · hls.js مؤجلة (107-161KB) · 6 مشغّلات مرفوضة بالقياس (video.js 197KB · react-player · plyr · vidstack «latest» عالق من 2024 · next-video ما يدعم باني).
- **اكتشافات مهمة من الدراسة:** تبويب «الريلز» موجود placeholder في `modonty/app/clients/[slug]/reels/` (noindex، يعرض صور مقالات 9:16) · `Client.introVideoUrl` موجود بلا استخدام · قوقل يشترط صفحة مشاهدة مستقلة لكل فيديو + ملفات قابلة للسحب (بلا توكن) + VideoObject + video sitemap · شريط «Short videos» بنتائج قوقل **بلا توثيق رسمي** (محتكر للمنصات الكبرى — ما نوعد فيه) · باني: MP4 fallback لازم يتفعل **قبل** أول رفع · توصيل الشرق الأوسط Standard = $0.06/GB (الأغلى — يحتاج قياس Standard vs Volume من SA) · تفريغ عربي $0.10/دقيقة.
- **ذاكرة محدثة:** `project_reels_decision_file.md` (المجلد + الحالة الكاملة) + **MEMORY.md انضغط من 24KB لتحت الحد** (hooks قصيرة، دمج المكرر).
- TSC/build/live-test: **N/A** — صفر لمس كود التطبيقات هذي الجلسة.

### 📝 Decisions taken (with reasoning)
- **ملف HTML واحد = النقاش والقرار** (اتفاق خالد) — العربي المختلط بالشات صعب عليه؛ قرارات تفاعلية تنقفل بالتاريخ، سجل نقاش، كل التحديثات في نفس الملف.
- **مستقل عن المقالات** (خالد، عكس توصية «اختياري») — رخيص التوسعة لاحقاً (حقل اختياري).
- **تعليقات من اليوم الأول** (خالد، عكس توصية التأجيل) — نقطة للخطة: التحقق من جاهزية أدوات إشراف التعليقات بالأدمن.
- **90 ثانية حد المدة** — مربوط معمارياً بقرار MP4-بلا-حزم (التوصيات الرسمية: progressive تحت الدقيقتين).
- **مودونتي صفر أسرار باني** — روابط التشغيل/الصور تنحفظ كاملة في DB؛ الأسرار للأدمن والكونسول فقط.
- **المسار السريع لتجهيز باني** — خالد يعطي مفتاح الحساب في `.env.shared` (مش بالشات) وكلود يجهز المكتبة بالكامل عبر API.

### 🚧 Pending / blocked
- **⏳ محظور على خالد:** إضافة `BUNNY_API_KEY` في `.env.shared` (البند ١ بقائمة التسليم).
- **القرار ٤ الختامي** ما انقفل («نناقش أكثر») — بعد قفله: خطة تفصيلية + موكب ملزم نهائي.
- **نقطتان للموكب النهائي:** تبويب «الريلز» بالهيدر؟ + موضع الشريط (فوق/تحت بانر الاشتراك).
- **أرقام تجارية وقت الخطة:** أي باقات تشمل الريلز + الحصص الشهرية + حد الحجم (اقتراح مبدئي 1GB).
- **قياس السرعة من SA:** Standard ($0.06/GB بالشرق الأوسط) vs Volume ($0.005 بس PoPs أقل) — يحتاج الفيديو التجريبي.
- **قديم من جلسات سابقة (بلا تغيير):** hydration صفحة `/changelog` بالإنتاج (React #418) · Social Publishing settings المؤجلة (mockup جاهز) · `modonty/scripts/{diagnose,seed}-featured*.ts` قرار حذف/إبقاء · صور التست على tags/categories/industries dev.

### 📂 Files touched (كلها untracked — وثائق فقط)
- `documents/reels/REELS-VIDEO-BRAINSTORM-v1.html` — جديد (انتقل من tasks/) — ملف القرار: دراسة + 10 قرارات + موكب معتمد + روابط الملفات.
- `documents/reels/reels-modonty-simulation-v1.html` — جديد (انتقل من mockups/) — محاكاة 4 شاشات.
- `documents/reels/REELS-REQUIREMENTS-FLOW-v1.html` — جديد — قائمة التسليم + 5 فلوهات + الحالات.
- ذاكرة: `~/.claude/projects/.../memory/project_reels_decision_file.md` (جديد+محدث) · `MEMORY.md` (مضغوط + بند الريلز).
- **صفر تعديل على admin/modonty/console/dataLayer.**

### 🔁 Git / deploy state
- Branch: `main` · آخر commit: `a93fed9` (chore: changelog v0.84.0) · مدفوع: نعم (من الجلسة السابقة).
- Uncommitted: ملفات وثائق untracked فقط (documents/reels/ الجديدة + mockups/tasks/issues/contract القديمة + .claude/settings + skills-lock) — **ولا ملف كود**.
- Vercel: بلا deployments جديدة هذي الجلسة (آخر نشر admin v0.84.0 READY).

### 🚀 How to resume in 30 seconds
1. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/reels/REELS-VIDEO-BRAINSTORM-v1.html` (ملف القرار — فيه كل شيء).
2. اسأل خالد: «حطيت `BUNNY_API_KEY` في `.env.shared`؟» — لو نعم: نفّذ تجهيز مكتبة باني (الخطوات في Where I stopped، تحقق من docs.bunny.net قبل كل نداء).
3. لو المكتبة جهزت: اطلب من خالد قفل القرار ٤ («ابروف») ← ابدأ الخطة التفصيلية للمرحلة الأولى.

---

## Session: 2026-07-04 ~16:00→20:00 — إعادة تنظيم أدمن كاملة: مجموعة Modonty بالشريط + 5 فصول إعدادات (✅ مدفوع ومنشور + changelog)

### 🎯 Where I stopped
- **✅ مدفوع ومنشور (2026-07-04 ~19:50):** commit `eebe433` — admin v0.84.0. Vercel: admin **READY** · console/modonty **CANCELED** (ignoreCommand يشتغل مثالي).
- قبل الدفع: بوابة كاملة — build exit 0 · TSC ×3 صفر · 10 صفحات HTTP 200 · صفر أخطاء كونسول · backup (80 مجموعة، 7.3M) · فحص أسرار نظيف (6 تطابقات = إنذار كاذب "disk-inspect").
- **قرار خالد:** `seo-preview.tsx` يبقى (رفض حذفه مرتين) — غير مستخدم لكن محفوظ.
- **✅ changelog v0.84.0 أُضيف ومُتحقّق على الإنتاج:** الآلية الفعلية = `admin/scripts/add-changelog.ts` (يُحدَّث ويُشغَّل مع كل push، يكتب LOCAL+PROD — قرار 2026-04-29). ليس `changelog-sync.ts` (مهجور، يقف عند 0.42.0) ولا `createChangelog` action (صفر مستدعين). الإدخال ظاهر على admin.modonty.com/changelog. commit ثانٍ `a93fed9` ثبّت تعديل السكربت.
- **بند متابعة جديد (غير عاجل):** صفحة `/changelog` على الإنتاج فيها hydration error (React #418) من فئة بق التواريخ نفسه — قديم، مش من شغل اليوم (إصلاحنا غطّى صفحات الإعدادات فقط). الإصلاح المرجّح: `suppressHydrationWarning` على عناصر التاريخ في `changelog-client.tsx`.

### ✅ Done this session
- **Sidebar** (`admin/components/admin/sidebar.tsx`): دعم مستوى ثاني (SubMenu متداخل قابل للطي) + مجموعة **Modonty** بدل «Modonty Pages»: submenu **Info & Legal** (7 صفحات) + submenu **Master Pages** (Homepage · Articles · Clients · Categories · Tags · Industries · Trending). صفر نقل مسارات.
- **Settings dashboard** (`settings/page.tsx`): شيل Homepage + Listings SEO (انتقلوا للشريط) → بقي: Social presence (جديد) · Sales channel · Reference · Assets & system. 7 areas / 6 editable.
- **فصل Social Links**: صفحة جديدة `/settings/social` (`social/page.tsx` + `social/components/social-links-form.tsx`) — 12 حقل (10 روابط منصّات + X handles) بنفس `updateAllSettings`؛ وانشال تبويب Social من `modonty-form.tsx` + تحديث وصف الصفحة.
- **فصل Business Info** (نفس النمط): صفحة جديدة `/settings/business` (`business/page.tsx` + `business/components/business-info-form.tsx`) — 10 حقول (contact/address/geo/GBP)؛ انشال تبويب Business من `modonty-form.tsx` → **بقي تبويبان** (SEO & Sharing · Homepage Banner). لوحة Settings: قسم «Organization» ببطاقتي Social + Business (8 areas / 7 editable). تحقّق كامل: TSC صفر + production build نجح (business/social في artifacts البناء) + دورة حفظ GBP كاملة (حفظ→persist→استعادة، والحقول المجاورة ما انلمست) + بقايا مراجع صفر + git: dataLayer/modonty/console صفر تغيير + كونسول نظيف.
- **إصلاح hydration mismatch** (خطأ بلّغه خالد — **بق قديم** مش من الريفاكتور): `formatTimeAgo` يعتمد `Date.now()` فنص السيرفر ≠ العميل عند عبور حد دقيقة. أُضيف `suppressHydrationWarning` (حل React الرسمي للطوابع الزمنية) في الموضعين المصابين فقط: كاش سترِب `modonty-form.tsx` + `_shared/save-bar.tsx` (يغطي كل صفحات Master Pages الست). باقي الاستخدامات آمنة (client-state فقط). TSC صفر.
- **شيل Live preview (SeoPreview)** من صفحة Homepage (طلب خالد «ما له داعي»): انشال الغريد ثنائي الأعمدة + بلوك SeoPreview + الـ import؛ الفورم صار عمود واحد. ملف `seo-preview.tsx` صار **غير مستخدم** (رُفض حذفه بالجلسة — يُقرَّر وقت الـ push: حذف ولا إبقاء). تحقّق: TSC صفر + حيّ (لا Live preview · 3 حقول · زر الحفظ سليم).
- **نقل Brand Description لصفحة Brand** (اقتراح خالد + وافقت — الحقل يظهر بكل مقال/صفحة كاتب = هوية site-wide): انتقل `brandDescription` مع صندوق الإرشاد العربي من فورم Homepage → `/settings/brand` (مجموعة «Brand identity» فوق «Logos & alt text»). فورم Homepage النهائي: **Search appearance + Share image فقط** (3 حقول: عنوان/وصف/OG). تحقّق: TSC صفر + حيّ (القيمة 216 حرف تظهر بصفحة Brand · فورم Homepage بلا Brand Description).
- **فصل Logo & Brand** (طلب خالد): صفحة جديدة `/settings/brand` (`brand/page.tsx` + `brand/components/brand-assets-form.tsx`) — 3 حقول (logoUrl/logoIconUrl/altImage بـ ImageField)؛ بطاقة «Logo & Brand» ثالثة في قسم Organization (9 areas / 8 editable)؛ فورم Homepage احتفظ بـ Share Image (ogImageUrl مربوط بمعاينة السيو) وصار: Search appearance · Brand identity · Share image. المنطق: الشعار هوية site-wide (نافبار + Organization logo) → Settings، بعكس البانر (محتوى صفحة) → Modonty group. تحقّق: TSC صفر + حيّ (الشعارات تظهر من DB · فورم Homepage بلا حقول شعار · اللوحة 3 بطاقات).
- **فصل Homepage Banner** (قرار خالد: «حسب توصيتك» — البند في مجموعة Modonty بالشريط، مش لوحة Settings): صفحة جديدة `/settings/banner` (`banner/page.tsx` + `banner/components/homepage-banner-form.tsx`) — حقلا platformTagline/platformDescription + المعاينة الحيّة؛ فورم Homepage صار **قسم SEO واحد بلا تبويبات** (شيل Tabs بالكامل)؛ بند مباشر «Homepage Banner» (أيقونة PanelTop) بعد Master Pages. الغرض المستقبلي: يكبر لـ Landing/hero/overlay. تحقّق: TSC صفر + حيّ (معاينة حيّة تتحدث + دورة حفظ tagline كاملة حفظ→persist→استعادة الفاضي).
- **تحقّق:** TSC صفر أخطاء ×3 مرات · **production build نجح (exit 0)** و`/settings/social` في قائمة الـ routes · تست حيّ: dirty tracking + حفظ Pinterest تجريبي على dev + persist بعد reload + استعادة الأصل · كونسول نظيف · JSON-LD sameAs مسار البيانات لم يُلمس · git status: سطح التغيير = 4 ملفات admin + مجلد social فقط (صفر dataLayer/modonty/console).
- **تحقيق 404 مُغلق:** `/modonty/pages/about` أعطى 404 مؤقتاً أثناء الفحص → تجربة stash/pop أثبتت إنه **أثر `.next` قديم** (البناء الإنتاجي كتب فوق مجلد dev) مش من الكود — بعد إعادة الترجمة نفس الكود يرندر سليم، وكل روابط Info & Legal + Master Pages تعمل بصفر أخطاء كونسول.
- **ملاحظة بيئة:** بعد أي `pnpm build:admin` محلي، أعد تشغيل dev server — البناء يكتب فوق `.next` وقد يسبّب 404 وهمي على مسارات ديناميكية حتى يُعاد ترجمتها.
- **Mockups:** `documents/mockups/admin-modonty-ia-FINAL.html` (v4) + `admin-social-publishing-settings-v1.html` (مؤجّل).

### 📝 Decisions taken (with reasoning)
- **رفض بطاقة «Integrations status»** — عرض «متصل (env)» بلا قيمة؛ القيمة في إعدادات سلوك (خالد وافق).
- تسميات الشريط بقرار خالد: **Info & Legal** + **Master Pages** (بعد رفض Pages/Page SEO/Listings SEO لغموضها)، وHomepage دخل جوّه Master Pages.
- الأسرار تبقى في env — ما ننقل مفاتيح للـ UI.

### 🚧 Pending / blocked
- **hydration error بصفحة `/changelog` على الإنتاج** (React #418، فئة بق التواريخ نفسه — قديم، مش من شغل اليوم) — الإصلاح المرجّح: `suppressHydrationWarning` على عناصر التاريخ في `admin/app/(dashboard)/changelog/changelog-client.tsx`. غير عاجل، دقائق.
- **مؤجّل باتفاق:** إعدادات سلوك السوشيال (Social Publishing: قالب كابشن/UTM/نشر تلقائي/جدولة/موافقة — الموكاب جاهز: `documents/mockups/admin-social-publishing-settings-v1.html`) + فكرة نقل Email Templates لـ Settings.
- **معلّقات قديمة (من جلسات سابقة، بلا تغيير):** سكربتا `modonty/scripts/{diagnose,seed}-featured*.ts` غير المتتبَّعين (قرار حذف/إبقاء) · صور dev التجريبية على tags/categories/industries.

### 📂 Files touched (كلها مدفوعة)
- `admin/components/admin/sidebar.tsx` — مستوى submenu ثاني + مجموعة Modonty (Info & Legal + Master Pages + Homepage Banner)
- `admin/app/(dashboard)/settings/page.tsx` — لوحة جديدة: Organization (Social·Business·Brand) + Sales + Reference + Assets & system (9 areas / 8 editable)
- `admin/app/(dashboard)/settings/modonty/components/modonty-form.tsx` — صار سيو فقط (3 حقول، بلا تبويبات، بلا SeoPreview) + suppressHydrationWarning
- `admin/app/(dashboard)/settings/modonty/page.tsx` — وصف محدّث
- `admin/app/(dashboard)/settings/_shared/save-bar.tsx` — suppressHydrationWarning على Cache label
- جديد ×4: `settings/{social,business,brand,banner}/` (page.tsx + components/*-form.tsx لكل واحدة)
- `admin/package.json` — v0.84.0 · `admin/scripts/add-changelog.ts` — إدخال v0.84.0
- ملف يتيم بقرار خالد: `settings/modonty/components/seo-preview.tsx` (غير مستخدم — رفض حذفه)
- موكابات (غير مدفوعة، untracked كالعادة): `admin-modonty-ia-FINAL.html` · `admin-modonty-ia-reorg-v1.html` · `admin-social-publishing-settings-v1.html`

### 🔁 Git / deploy state
- Branch: `main` · مدفوع: **commit `eebe433`** (admin v0.84.0 — 15 ملف) + **commit `a93fed9`** (changelog entry)
- Vercel: admin **READY** على الإنتاج (تحقّقت حيّاً — الشريط الجديد ظاهر على admin.modonty.com) · console/modonty **CANCELED** (ignoreCommand)
- Changelog v0.84.0: مكتوب LOCAL (`modonty_dev`) + PROD ومُتحقّق على `/changelog`
- Backup قبل الدفع: `backups/backup-2026-07-04_19-40` (80 مجموعة · 7.3M)
- Uncommitted متبقٍ: موكابات/تقارير untracked قديمة + `.claude/settings*` + `skills-lock.json` + سكربتا modonty المستبعدان (بلا تغيير عن قبل)

### 🚀 How to resume in 30 seconds
1. `pnpm --filter @modonty/admin exec next dev -p 3001` → افتح `/settings` — الوضع الجديد كامل
2. افتح هذا البلوك في `documents/context/SESSION-LOG.md`
3. اختر التالي: (أ) إصلاح hydration صفحة `/changelog` (دقائق) · (ب) Social Publishing settings (الموكاب جاهز) · (ج) موضوع جديد

---

## Session: 2026-07-04 ~13:45 — صفحات القوائم الموحّدة + هيرو الصورة + صورة لكل صفحة (مدفوع + مُتحقّق على الإنتاج)

### 🎯 Where I stopped
- **كل شي مكتمل ومدفوع ومُتحقّق على الإنتاج.** لا مهام مفتوحة في هذا الموضوع.
- آخر خطوة: تحقّقت حيّاً إن التفجير التلقائي يشتغل على الإنتاج (صورة الصناعات انعكست خلال ~12 ثانية، ثم استُرجعت لصورة خالد).
- **الخطوة التالية عند الرجوع:** لا شي مطلوب لهذا الموضوع. اختياري: (أ) DB changelog للنسخة، (ب) تنظيف صور dev التجربة، (ج) موضوع جديد.

### ✅ Done this session
- **النمط الموحّد للصفحات الثلاث** (`/tags` `/categories` `/industries`): كمبوننت مشترك `EntityCard` + `ListingHero` + `EntitySearchForm` + `EntitySortFilter` + `InfiniteEntityGrid` (بحث/فرز/infinite scroll). حُذفت 8 ملفات route-specific ميتة + `industries-hero.tsx`/`categories-hero.tsx`.
- **هيرو full-bleed:** صورة `og:image` خلفية كاملة + scrim داكن من الأسفل + `object-position:50% 88%` (الشعار فوق، النص تحت نظيف) + شارة زجاجية. accent teal (صناعات) / blue (فئات/وسوم).
- **صورة مستقلة لكل صفحة:** 6 حقول schema (`{page}PageImage`+`Alt`) في `Settings` + قسم "Hero Image" بالأدمن + المولّد يستخدم صورة الصفحة ‖ العامة → الهيرو يعكسها تلقائيًا.
- **إصلاح بق أدمن:** `updateAllSettings` كانت تُسقط سيو tags/industries/articles + b2b (chunk 4).
- **إصلاح الانعكاس:** `updateSettingsPageCache` تنادي `revalidateModontyTag("settings")` + تجاوز dev-only في `revalidate-modonty-tag`.
- **الحالة:** TSC (modonty+admin+console) صفر أخطاء · build (modonty+admin) نجح · تست حيّ local + **prod** (auto-reflect ~12 ثانية) ✓

### 📝 Decisions taken (with reasoning)
- **صورة واحدة مشتركة كـ hero (أولاً)** → ثم قرار خالد: حقل صورة لكل صفحة (تمييز بصري) رغم إضافة داتا. البديل المرفوض: بقاء صورة عامة واحدة فقط.
- **الصورة تُقرأ من `og:image` في الـ SEO metadata** (لا استعلام/حقل قراءة جديد على مودونتي) — الهيرو يعكس أي تغيير تلقائيًا.
- **`object-position:50% 88%`** لأن صورة البراند شعارها بالمنتصف؛ دفعها لأعلى يجلس النص على منطقة داكنة نظيفة بلا تداخل (v3 المعتمدة).
- **الإصلاحات في الـ helper المشترك** (`updateSettingsPageCache`) لتغطية كل صفحات القوائم دفعة واحدة.

### 🚧 Pending / blocked
- **DB changelog للنسخة** — آلية غير مؤكّدة (يُضاف من الأدمن؟)، وما ألمس prod DB بسكربت. بند [feedback_changelog_with_push].
- **صور dev التجربة** — خالد's image على tags/categories/industries في **dev فقط** (بيانات تجربة). على prod مضبوطة صح.
- **سكربتان مستبعَدان** من الـ commit: `modonty/scripts/{diagnose,seed}-featured*.ts` (standalone، مخالفة القاعدة) — قرار حذف/إبقاء لاحق.

### 📂 Files touched (رئيسية)
- جديد: `modonty/components/shared/{ListingHero,EntityCard,EntityPlaceholder,EntitySearchForm,EntitySortFilter,InfiniteEntityGrid,client-card}.tsx` · `modonty/lib/{entity-utils,seo/og-image,seo/industries-page-seo,seo/tags-page-seo}.ts` · `modonty/app/actions/{category,tag,industry}-actions.ts` · `modonty/app/{industries,tags}/error.tsx`
- معدّل: `modonty/app/{categories,tags,industries}/page.tsx` + `loading.tsx` · `dataLayer/prisma/schema/schema.prisma` (6 حقول) · `admin/app/(dashboard)/settings/actions/settings-actions.ts` · `admin/app/(dashboard)/settings/_shared/listing-page-form.tsx` · `admin/lib/seo/listing-page-seo-generator.ts` · `admin/lib/revalidate-modonty-tag.ts`

### 🔁 Git / deploy state
- Branch: **main**
- Uncommitted: `documents/context/SESSION-LOG.md` (هذا التحديث) + `.claude/settings*.json` + `skills-lock.json` (auto، لا تُدفع)
- Last commits: `95d9a23` (docs) ← `fb5cdc0` (reflect fix، admin 0.83.1) ← `2faf431` (الميزة، modonty 1.70.0 + admin 0.83.0)
- Pushed: **نعم** (كلها على origin/main)
- Vercel: نُشرت ومُتحقّقة على الإنتاج (modonty.com)
- النسخ: modonty **1.70.0** · admin **0.83.1** · console 0.18.4 (بلا تغيير)

### 🚀 How to resume in 30 seconds
1. الموضوع مكتمل ومدفوع — لا شي مطلوب. لو موضوع جديد → ابدأ منه.
2. لو تبي تكمّل محليًا: `cd modonty && pnpm dev` (3000) + `cd admin && pnpm dev --port 3001`. (بروتوكول Prisma لو عدّلت schema: kill node → `pnpm prisma:generate` → restart.)
3. صور الصفحات تُدار من: أدمن → Settings → {categories/tags/industries} → قسم "Hero Image" (لصق رابط Cloudinary) → Save + Regenerate → تنعكس تلقائيًا خلال ~12 ثانية.

---

## Session: 2026-07-04 (5) — EntityCard المرحلة 3 (Industry) مكتملة + هيرو يقرأ السيو + إصلاح أيقونة الفئة

### 🎯 Where I stopped
- **✅ تحقّق إنتاج نهائي (modonty.com):** التفجير التلقائي **يشتغل على الإنتاج** — عدّلت صورة الصناعات على أدمن الإنتاج → Save+Regenerate → انعكست خلال **~12 ثانية** بلا تفجير يدوي (ثم استُرجعت لصورة خالد). الثلاثة تعرض صورة خالد على الإنتاج. مشكلة "الصناعة ما تنعكس" السابقة كانت **توقيت نشر fb5cdc0** (عُدّلت أثناء الـ deploy) — مش بق كود؛ الكود متطابق ١٠٠٪ للثلاثة.
- **🔧✅ إصلاح تابع مدفوع** — commit `fb5cdc0` (admin **0.83.1**): زر "Regenerate cache" ما كان يفجّر كاش مودونتي → التعديل ما ينعكس. أُصلح: (1) `updateSettingsPageCache` تنادي `revalidateModontyTag("settings")`. (2) `revalidate-modonty-tag` تجاوز dev-only يفجّر `localhost:3000` (siteUrl=prod للـ canonicals). **مُتحقّق حيّ للصفحات الثلاث** (tags/categories/industries — كلها تنعكس تلقائيًا). صورة الوسوم (صورة خالد) محفوظة في **dev فقط** — على prod تُضاف من أدمن الإنتاج.
- **✅ PUSHED** — commit `2faf431` (`82ad130..2faf431 main`). النسخ: modonty **1.70.0** · admin **0.83.0**. Vercel auto-deploy جارٍ. TSC×3 + build (modonty+admin) نظيف قبل الدفع. السكربتان `scripts/{diagnose,seed}-featured*.ts` + الـ mockups **استُبعدت** من الـ commit عمداً.
- **متبقّي:** (1) DB changelog للنسخة (آلية غير مؤكّدة — يُضاف من admin). (2) التحقق من حالة Vercel deploy. (3) السيرفرات موقوفة — تُشغّل عند الحاجة.
- **النمط الموحّد اكتمل للصفحات الثلاث** (`/tags`، `/categories`، `/industries`) — كلها مُختبرة حيّاً، TSC نظيف
- **`error.tsx` تمّ** (tags + industries) · **الملفات الميتة الـ8 اتحذفت** (خالد شغّل Remove-Item) · TSC modonty نظيف بعد الحذف
- **🔴 بَق أدمن انكشف بالتست + انصلح:** `updateAllSettings` كانت **ما تحفظ** سيو الوسوم/الصناعات/المقالات + b2b + platform (سقطت وقت تقسيم chunks لحد الـ50 field). أُضيف **chunk 4** → صار يحفظهم. مُختبر حيّ: الصناعات + الوسوم تنحفظ الآن، والانعكاس على هيرو مودونتي شغّال end-to-end.
- **🎨 هيرو صورة full-bleed للصفحات الثلاث (منفّذ):** الهيرو الآن يعرض صورة `og:image` (نفس الصورة العامة من Site Identity) كخلفية كاملة + scrim داكن من الأسفل + النص overlay تحت. كمبوننت مشترك `ListingHero`. **الموزاييك + chips اتشالوا** (كود أقل). `industries-hero.tsx` + `categories-hero.tsx` صاروا **dead** → للحذف: `Remove-Item app/industries/components/industries-hero.tsx, app/categories/components/categories-hero.tsx`
- **الخطوة التالية (قبل push):** حذف ملفَّي الهيرو الميتين + `pnpm build` (modonty + admin) + TSC الثلاثة + bump نسخة (modonty **و admin**) + changelog. **الـ push يشمل modonty + admin.**

### ✅ Done — Listing hero = full-bleed OG image + text overlay
- **جديد:** `components/shared/ListingHero.tsx` (صورة `next/image` fill · `object-position:50% 88%` يرفع الشعار · scrim تدرّج من الأسفل + top-fade · شارة زجاجية backdrop-blur · H1+فقرة مع text-shadow · accent teal/blue · fallback خلفية داكنة لو ما فيه صورة) · `lib/seo/og-image.ts` (`extractOgImageFromMetadata` — يسحب الصورة من `openGraph.images` بلا استعلام/حقل جديد)
- **معدّل:** `industries/page.tsx` (teal) · `categories/page.tsx` (blue) · `tags/page.tsx` (blue) — كلها تمرّر `ListingHero` + شِيلت حسابات `topIndustries/topCategories/mosaicTags` وإمبورتات `EntityPlaceholder/IconHash`. سكيلتونات الـ loading الثلاثة حُدّثت (نص تحت، بلا موزاييك)
- **القرار (خالد):** نفس الـ Social Image = Hero Image (صفر داتا/كود مكرّر). صورة البراند مركزية → دُفعت لأعلى ليجلس النص على منطقة داكنة نظيفة (بلا تداخل). معاينة معتمدة v3 مبنيّة طبق الأصل
- **مُتحقّق حيّ:** الثلاثة ديسكتوب + جوال — الصورة full-bleed، النص مقروء، صفر تداخل. TSC نظيف

### ✅ Done — صورة مستقلة لكل صفحة قائمة (per-page hero image)
- **Schema** (`dataLayer/prisma/schema/schema.prisma`, موديل `Settings`): 6 حقول جديدة — `categoriesPageImage`+`Alt` · `tagsPageImage`+`Alt` · `industriesPageImage`+`Alt`. اختيارية (MongoDB schemaless → `prisma generate` كافٍ، بلا `db push`، ما لمسنا الـ DB). اتّبع بروتوكول Prisma: kill node → generate → restart.
- **Admin backend** (`settings-actions.ts`): `ListingPageImages` interface + `AllSettings extends` + DEFAULT_SETTINGS + getAllSettings (الفرعين) + updateAllSettings **chunk 4** (نفس مكان بقية حقول القوائم).
- **Admin form** (`_shared/listing-page-form.tsx`): قسم **"Hero Image"** قابل للتعديل (`ImageField` رابط Cloudinary + `Input` للـ alt) — يظهر فقط للصفحات اللي لها `imageKey` (categories/tags/industries). الحقول أُضيفت لـ `fieldList` فتنحفظ.
- **المولّد** (`listing-page-seo-generator.ts`): في الـ3 regenerators → `ogImage = {page}PageImage || ogImageUrl` (صورة الصفحة، وإلا العامة fallback). لأن الهيرو في مودونتي يقرأ `og:image` → **ينعكس تلقائيًا بلا تعديل مودونتي**.
- **تست حيّ (admin 3001 ↔ modonty 3000):** حطّيت صورة SEO مستقلة للصناعات → حفظ (ثبت) → regenerate → هيرو الصناعات صار صورة SEO ✓ · الفئات بقيت الصورة العامة (fallback) ✓ · استرجعت (صورة الصناعات اتشالت → رجعت للعامة). TSC admin+modonty نظيف.
- **ملاحظة إنتاج:** الحقول اختيارية → ما تحتاج migration على prod (MongoDB). الـ push يشمل: modonty + admin + dataLayer(schema).

### ✅ Done — Admin bug fix (updateAllSettings) + live SEO reflect test
- **الملف:** `admin/app/(dashboard)/settings/actions/settings-actions.ts` — `updateAllSettings` أُضيف لها chunk رابع فيه: `tags/industries/articlesSeoTitle+Description` · `b2b*` (7) · `platformTagline/Description` · `tags/industries/articlesPageMetaTags`(+JsonLd+LastGenerated+ValidationReport). 27 field، تحت حد الـ50 تبع Mongo Atlas.
- **الجذر:** الحقول سقطت من الدالة (الفئات/الرائج/الرئيسية/العملاء-seo كانت موجودة، لكن tags/industries/articles + b2b لأ). `saveModontySettings` كانت كاملة — البَق محصور في `updateAllSettings` اللي تستدعيه فورمات صفحات القوائم.
- **تست حيّ (Playwright، admin:3001 + modonty:3000):**
  - قبل الإصلاح: تعديل عنوان الصناعات → حفظ → reload → **رجع القديم** (control: الفئات انحفظت) → أكّد البَق
  - بعد الإصلاح: الصناعات + الوسوم **تنحفظ** ✓ · تعديل عنوان+وصف الصناعات → regenerate → **انعكس على مودونتي** (H1 + الفقرة + meta description) ✓
  - كل القيم اتسترجعت للأصل، وكاش مودونتي "settings" اتفجّر يدويًا (POST `/api/revalidate/tag`)
- **الإنتاج موثوق:** `cascadeSettingsToAllEntities` (عبر `after()` على كل حفظ) يستدعي `regenerateAllListingCaches()` ثم `revalidateModontyTag("settings")` بالترتيب الصح → الحفظ لوحده يكفي للانعكاس.
- **ملاحظة:** زر "Regenerate cache" لكل صفحة **لا** يفجّر كاش مودونتي (فقط الحفظ عبر cascade يفعل) — مش عطل، بس تحسين محتمل مستقبلًا.

### ✅ Done this session
**العدّادات + الهيرو (كل الصفحات):**
- شِيلت **كل العدّادات** من هيرو الفئات والوسوم (كانت متناقضة مع المحتوى) — الهيرو صار: شارة + H1 + فقرة + موزاييك فقط
- الهيرو الآن **يقرأ من كاش السيو** (مصدر واحد): H1 = عنوان السيو ناقص لاحقة `| مدونتي`، الفقرة = وصف السيو. طُبّق على الثلاثة. صفر نصوص ثابتة مخترعة
- إصلاح أيقونة الفئة: `getEntityIcon("category")` كان `IconSearch` (عدسة = غلط) → صار `IconCategory` (يصلح الـ SVG placeholder + الموزاييك)
- إصلاح سكيلتون `categories/loading.tsx` + `tags/loading.tsx` (كانا يعرضان 3 عدّادات وهمية)

**المرحلة 3 — Industry (7 ملفات):**
- `lib/types.ts` — `IndustryListItem` + `IndustryQueryOptions` (رأس الكرت = عدد الشركاء، لا مقالات)
- `app/api/helpers/industry-queries.ts` — `getIndustriesEnhanced` + `getIndustriesPage`: استعلام واحد مباشر عبر `Client.industryId` (عدّ ACTIVE + أول 3 أفاتار)، يخفي الفاضية. **بلا GA4** (الأثر مخفي + الأداء أولوية #1)
- `app/actions/industry-actions.ts` — `loadMoreIndustries` (يمرّر `clientCount` كـ `articleCount`)
- `lib/seo/industries-page-seo.ts` — يقرأ `Settings.industriesPageMetaTags` + الـ JSON-LD (الحقول موجودة في الschema)
- `app/industries/components/industries-hero.tsx` — هيرو داكن أكسنت تركوازي (لون الصناعة) + أيقونة المصنع
- `app/industries/page.tsx` — إعادة بناء كاملة: Breadcrumb + هيرو + بحث/فرز (خياران: الأكثر شركاء + أبجديًا) + `InfiniteEntityGrid` 3 أعمدة + key remount + `title.absolute`
- `app/industries/loading.tsx` — سكيلتون مطابق
- **العلاقة المباشرة تحلّ لغز الـ 21:** الرعاية الصحية عرضت 6 شركاء (شركاء بلا مقالات يظهرون على كرت الصناعة) ✓

### 🔍 Live-verified (Playwright, port 3000)
- `/industries`: H1 من السيو، بلا عدّادات، 5 صناعات مرتّبة بالشركاء، البحث ("تعليم"→1) + الفرز الأبجدي شغّالين، الفاضية مخفية
- `/categories` + `/tags`: الهيرو من السيو، البحث ("ريادة"→2)، عنوان بلاحقة براند واحدة
- ملاحظة: أخطاء console الأربعة (`JWTSessionError`) = كوكي جلسة قديم في متصفح dev، لا علاقة بالكود
- TSC modonty: صفر أخطاء (بعد كل مرحلة)

### 📝 قرار تصميم مثبّت
- كرت الصناعة يعرض العدد مرّتين (شارة "N شركة" فوق + أفاتار "N شريك" تحت) — مقبول عمداً للاتساق مع الفئات/الوسوم (خالد وافق على "أتركها")

---

## Session: 2026-07-04 (4) — EntityCard المرحلة 2 (Category) منفّذة + مكوّنات البحث/الفرز صارت shared

### 🎯 Where I stopped
- `/tags` و`/categories` الاثنان يشتغلان بنفس النمط الموحّد، مُختبرين حيّاً
- **الخطوة التالية:** المرحلة 3 = **Industry** (آخر كيان) — نفس الخطوات بالضبط (industry أبسط: علاقة `Client.industryId` مباشرة، بدون junction ولا Article hop)
- **قبل أي push:** حذف الملفات الميتة (تحت) + `pnpm build` الكامل + `error.tsx` للصفحات الثلاث

### ✅ Done this session (Category migration)
- `lib/types.ts` — أُضيف `digitalImpact?` لـ `CategoryResponse`
- `app/api/helpers/category-queries.ts` — `getCategoriesEnhanced` صار: (1) `Promise.all` للـ clientRows + `getClientsGA4Stats` (نفس إصلاح waterfall تاق) (2) يجمع كل client slugs لكل فئة (3) يحسب `digitalImpact` + أُضيف `getCategoriesPage(page, options)` للـ pagination
- `app/actions/category-actions.ts` — جديد، `loadMoreCategories(options, page)`
- `app/categories/page.tsx` — **أُعيد بناؤه بالكامل:** CategoriesHero (dark، أزرق) + Toolbar + `InfiniteEntityGrid` (4 أعمدة) + `key={search|sort}` (إصلاح الحالة القديمة) + `title.absolute` (إصلاح تكرار البراند) + يقرأ `getCategoriesPageSeo` (كان يقرأه أصلاً) مع fallback breadcrumb. **أُسقطت list view + featured filter** (توحيد مع نمط tag، grid فقط)
- `app/categories/components/categories-hero.tsx` — الموزاييك بدّل `generateCategoryGradient` (rainbow) بـ`EntityPlaceholder type="category"` (ألوان البراند)
- `app/categories/loading.tsx` — أُعيد ليطابق الـ Hero الغامق + شبكة كروت skeleton (كان يعرض الشكل القديم)
- **♻️ DRY — البحث/الفرز صارا مكوّنين مشتركين generic:** `components/shared/EntitySearchForm.tsx` (props: basePath/placeholder) + `EntitySortFilter.tsx` (props: basePath/options/currentSort). tags هُوجرت لهم كمان. industries (المرحلة 3) بيعيد استخدامهم مباشرة
- **اختبار حي (categories):** البحث "تسويق" → فلترة صحيحة (يبحث اسم+وصف، فـ"العقارات" ظهر عبر وصفه) · الفرز أبجدي صحيح · title مرة وحدة · الكروت + placeholders البراند + avatars كلها سليمة · TSC صفر أخطاء (شُغّل بعد كل خطوة)
- **`title.absolute` أُصلح لـ categories** (كان فيه نفس تكرار "| مدونتي | مدونتي" — تأكّد الآن مرة وحدة)

### 🗑️ ملفات ميتة تحتاج حذف يدوي (rm مرفوض بالصلاحيات — احذفها أو اعتمد الحذف)
- `app/tags/components/tag-search-form.tsx` · `tag-sort-filter.tsx` (استُبدلا بالمشتركين)
- `app/categories/components/category-list-item.tsx` · `category-search-form.tsx` · `category-filters.tsx` · `categories-skeleton.tsx` · `empty-state.tsx` (يتّمهم إعادة بناء الصفحة)
- `app/categories/components/featured-categories.tsx` (كان ميتاً **قبل** التعديل — لا مستورد له)
- **ملاحظة:** `EnhancedCategoryCard` **يبقى** (مستخدم في `related-categories` بصفحة [slug]). `parseCategorySearchParams` يبقى (لسّه يُستدعى)

### ➕ فلتر الفئات الفارغة (طلب خالد)
- `getCategoriesEnhanced` صار يخفي أي فئة `articleCount === 0 && clientCount === 0` (فلتر بعد حساب clientCount، قبل search/sort/pagination) → الـ Hero count + الشرائح تعكس المحتوى فقط
- **تحقّق side-effect:** المستهلك الثاني `related-categories.tsx` (widget "فئات ذات صلة" بصفحة [slug]) يستفيد كمان (ما يقترح فئة فاضية) — لا ضرر. اختُبر حيّاً: 25 → 7 فئات، العداد "7 فئة متاحة"، صفر كرت فاضي
- **⚠️ فرق تعريف بين الكيانات لم يُحسم بعد:** categories يخفي لو (صفر مقالات AND صفر شركاء) · tags يخفي لو (صفر مقالات فقط، بغضّ النظر عن الشركاء). سُئل خالد: نوحّد أو نترك؟ رأيي تركهم (وسم بلا مقالات بلا معنى). **Industry (المرحلة 3): نطبّق نفس فلتر categories** (صناعة بلا شركات = تُخفى)

### 🎯 (سابق) المرحلة 1 (Tag)

### ✅ Done this session
- بُنيت المرحلة 1 كاملة (7 ملفات، كلها جديدة عدا `ga4.ts`/`tag-queries.ts` المعدَّلين):
  - `modonty/lib/entity-utils.ts` — gradient/icon مشترك للكيانات الثلاثة
  - `modonty/components/shared/EntityCard.tsx` — الكرت الموحّد
  - `modonty/components/shared/InfiniteEntityGrid.tsx` — wrapper عام للتمرير اللانهائي
  - `modonty/app/api/helpers/tag-queries.ts` — أُضيف `getTagsEnhanced`/`getTagsPage` (client previews عبر ArticleTag + pagination) — `getTagsWithCounts` القديمة لم تُمس (تستخدمها HomeBottomBar/LeftSidebar)
  - `modonty/lib/analytics/ga4.ts` — أُضيف `getEntityGA4Stats(entityPath)` (نفس نمط `getClientsGA4Stats`، فلترة `pagePath`)
  - `modonty/app/actions/tag-actions.ts` — `loadMoreTags(options, page)` server action
  - `modonty/app/tags/page.tsx` — استبدال كامل للـ pills بـ Hero+Toolbar+InfiniteEntityGrid
  - `modonty/app/tags/components/tag-search-form.tsx` + `tag-sort-filter.tsx` — جديدة
- **🐛 باگ حقيقي اكتُشف وأُصلح (مو تخمين، تحقّق بالـ Network tab):** `tailwind.config.ts` الـ `content` globs ما فيها `./lib/**/*` — أي gradient class تُبنى ديناميكياً من ملف في `lib/` كانت تطلع بدون تلوين (شفافة/بيضاء) لأن Tailwind ما يمسحها. الإصلاح: أضفنا `"./lib/**/*.{js,ts,jsx,tsx,mdx}"` للـ content array — إصلاح جذري يفيد أي كود مستقبلي في `lib/`، مو بس EntityCard
- **TSC: صفر أخطاء** بعد كل مرحلة من الـ 5 (شُغّل 5 مرات تراكمياً)
- **اختبار حي في Playwright (Chrome, localhost:3000):**
  - ✅ الكروت تعرض gradient صحيح متنوّع + أيقونة # + badge المقالات + avatar الشركاء الحقيقيين (شعارات JBRSEO ظهرت فعلاً)
  - ✅ Hero stats صحيحة (32 وسم · 201 مقال · 21 شريك) من بيانات DB حقيقية (modonty_dev)
  - ✅ الأثر الرقمي (GA4) يعرض أرقام حقيقية أو "–" لو صفر — بدون ألوان
  - ✅ Infinite scroll: صفحة أولى 20 → سكرول → 32 (الكل) → رسالة "🎉 شاهدت الكل (32)" في النهاية
  - ✅ البحث (`?search=جوجل`): فلترة صحيحة (32→2)، الـ Hero stats تحدّثت تبع الفلترة
  - ✅ الفرز (`?sort=name`): يعمل، الرابط يتحدّث
  - ⚠️ 4 أخطاء console موجودة (JWTSessionError — "no matching decryption secret") — **قبل شغلنا، غير مرتبطة**، كوكي جلسة قديمة/AUTH_SECRET، تظهر بأي صفحة فيها TopNav/NotificationsBell
- **🐛 تصحيح فوري (نفس السشن):** خالد لاحظ ألوان hardcoded (`bg-white`/`text-zinc-*`/`border-zinc-*`) في `EntityCard.tsx` + `InfiniteEntityGrid.tsx` (skeleton) تكسر الـ dark mode (كرت أبيض ثابت). أُصلح باستبدالها بـ semantic tokens (`bg-card`/`text-card-foreground`/`border-border`/`bg-muted`/`text-muted-foreground`/`ring-card`/`bg-primary/10 text-primary` للـ avatar fallback) — نفس التوكنز يتغيّرون تلقائياً عبر `.dark` class (مُتحقَّق من `globals.css`). اختُبر حيّاً بتبديل `localStorage.theme` بين dark/light (next-themes، `attribute="class"`) — لا يوجد ThemeToggle ظاهر في نفس الصفحة لسّه، التبديل يتم حالياً من `/users/profile/settings`. **قاعدة للمراحل الجاية (Industry/Category):** ممنوع أي `bg-white`/`text-zinc-*`/`border-zinc-*` حرفي — استخدم التوكنز دائماً
- **🎨 تصحيح فوري ثانٍ (قرار نهائي: حذف كامل):** خالد لاحظ شريط اللون العلوي (accent strip) "كثرة ألوان" — كان hash-based عشوائي (8 تدرّجات مشتركة بين الكيانات). أول محاولة: تثبيته بلون واحد لكل نوع كيان (`getEntityAccent`). خالد صحّح: يبيه **يُحذف كامل، مو يتلوّن**. التنفيذ النهائي: حُذف عنصر الشريط بالكامل من `EntityCard.tsx` + سطر الـ skeleton المطابق من `InfiniteEntityGrid.tsx` + `getEntityAccent`/`ENTITY_ACCENT` من `entity-utils.ts` (dead code). **تحقّق dead-code:** grep على `getEntityAccent|ENTITY_ACCENT` بكل `modonty/` → صفر نتائج؛ مراجعة يدوية سطر-بسطر للملفات الثلاثة تؤكد صفر imports/vars غير مستخدمة (ESLint v9 ما يشتغل مباشر بالمشروع — `noUnusedLocals` غير مفعّل بـ tsconfig، فـ TSC وحده ما يكفي لفحص هذا، الفحص كان يدوي). التنوّع اللوني (`generateEntityGradient`) بقي بس على صورة الغلاف (thumbnail fallback). `ENTITY-CARD-SPEC.md` قسم 5 عُدِّل لـ v2.1 مع قاعدة صريحة: ممنوع إعادة الشريط في Industry/Category
- **📐 تصحيح صورة الصورة:** خالد طلب الصورة تلامس حواف الكرت العلوية (flush)، مو inset بـ padding. أُزيلت `p-3 pb-0` من حول منطقة الصورة، الصورة صارت `rounded-t-2xl` مباشرة (نفس تقريب الكرت الخارجي)
- **🎨 SVG placeholder جديد (خالد: "خبير جرافيك ديزاين"):** رفض تدرّج الألوان (gradient) نهائياً للصورة البديلة "لما ما يكون في صورة للهاشتاغ" — وصفه "بشع جداً". بُني `modonty/components/shared/EntityPlaceholder.tsx` جديد: SVG مسطّح (لون واحد صلب لكل نوع كيان، لا تدرّج) + دائرتين ناعمتين للعمق (`opacity` منخفضة، نفس عائلة اللون) + نمط نقاط خفيف + أيقونة الكيان بالمنتصف (فيها `showIcon` prop اختياري لإعادة استخدامها كخلفية بس، مثل موزاييك الـ Hero). **حُذف الاستخدام القديم من EntityCard.tsx بالكامل (`Icon`/`getEntityIcon`/`generateEntityGradient` هناك) — dead code تحقّق عبر grep، صفر مراجع متبقية.** اختُبر حيّاً light+dark
- **🚨 تصحيح جوهري: الألوان المستخدمة كانت مُخترعة، مو براند مودونتي (خالد: "use branding color act as senior"):** أول نسخة من `EntityPlaceholder` استخدمت hex عشوائي (بنفسجي/purple لـ Tag) — **مافيه بنفسجي في براند مودونتي إطلاقاً**. تحقّقت من `app/globals.css` ولقيت 3 ألوان رسمية بس: `--brand-navy #0E065A` · `--brand-blue #3030FF` · `--brand-teal #00D8D8`. أُعيد بناء الـ palette بالكامل من هالـ 3 (HSL مشتق من نفس الـ hue الرسمي، لا اختراع): **Category=أزرق، Industry=تركواز، Tag=كحلي** (اللون الثالث المتبقي، مع الأزرق كـ accent/glow ثانوي لضعف تباين الكحلي وحده كنص على خلفية غامقة). **تصحيح موسّع شمل Hero كامل:** بدّلت كل `purple-*`/`fuchsia`/`pink` في `app/tags/page.tsx` (badge + heading + icon + radial glow rgba) لأزرق البراند، واستبدلت موزاييك الـ Hero (كان يستخدم `generateEntityGradient` قوس-قزح) بإعادة استخدام `<EntityPlaceholder type="tag" showIcon={false}>` نفسها — **`generateEntityGradient`/`ACCENT_GRADIENTS` صارت dead code كاملة فحُذفت من `entity-utils.ts`** (تحقّق grep: صفر مراجع). `ENTITY-CARD-SPEC.md` قسم 4 أُضيف له قاعدة صريحة: **3 ألوان براند فقط، ممنوع اختراع أي لون خارجها** — تنطبق على Industry/Category الجايين. اختُبر حيّاً — كل الصفحة الآن كحلي/أزرق متّسق 100%، صفر بنفسجي متبقّي (تأكيد grep)
- **🚨 تصحيح جوهري في حساب «الأثر الرقمي» (خالد: كان غلط):** التنفيذ الأصلي (`getEntityGA4Stats`) كان يحسب زيارات صفحة `/tags/[slug]` **نفسها** — رقم شبه صفري وبلا معنى تجاري. **التعريف الصحيح:** «الأثر الرقمي» لكيان = **مجموع** الأثر الرقمي (GA4 total) لكل عميل ACTIVE مرتبط فيه (مو زيارات صفحتنا). التنفيذ: `getTagsEnhanced` (tag-queries.ts) صار يجمع slugs **كل** العملاء المرتبطين بكل وسم (مو الـ 3 المعروضين بس بالـ avatar)، يستدعي `getClientsGA4Stats()` (نفس الدالة اللي تحسب أثر كرت العميل)، ويجمع `.total` لكل عميل → حقل `digitalImpact` جديد على `TagListItem`. `getEntityGA4Stats`/`EntityGA4Path` صارت dead code كاملة (كانت مبنية على المفهوم الخاطئ) → **حُذفت من `ga4.ts`** (تحقّق grep: صفر مراجع)، وأُزيل استيرادها من `tags/page.tsx` و`tag-actions.ts`. اختُبر حيّاً: الأرقام تغيّرت بشكل جوهري (مثال: "تسويق رقمي" ١٠→١٨١) — تعكس الآن الأثر الحقيقي المجمّع للشركاء، مو زيارات صفحتنا. **قاعدة لمراحل Industry/Category الجاية:** نفس المنطق بالضبط — جمع GA4 لكل العملاء المرتبطين، لا استعلام GA4 منفصل لصفحة الكيان
- **📈 توسيع «الأثر الرقمي» بأرقام حقيقية إضافية (خالد: الأرقام ضعيفة، بتأثر على المبيعات):** خالد رفض اختلاق أرقام (قاعدته الثابتة)، طلب مصادر حقيقية بس. أضفنا لـ `getClientsGA4Stats()` (ga4.ts) جمع تفاعل كل عميل الحقيقي المخزّن أصلاً بقاعدة البيانات على مقالاته المنشورة (`viewsCount+likesCount+commentsCount+favoritesCount`) — حقل جديد `articleEngagement`، يُجمع على `total` (GA4 + تفاعل DB = رقم واحد نهائي، مو عدادات متعددة، حسب طلبه). أُصلحت ثغرة تغطية: عميل بدون أي صف GA4 لكن عنده تفاعل DB حقيقي كان بيختفي من الـ map بالكامل (صار يظهر الآن، `Set` union بين مصدري البيانات).
  - **فحص أثر جانبي (خالد طلب تأكيد صريح):** grep شامل على `getClientsGA4Stats|getClientDigitalImpact` بكل `modonty/` → 7 ملفات فقط، **كلها بدون استثناء تقرأ حقل `.total` فقط** (`ga4Stats[slug]?.total`) — صفر مكان يفكّك `pageViews`/`sessions`/`activeUsers`/`events` لحالها. التعديل إضافة فقط (حقل جديد + معادلة total أشمل)، صفر حقل محذوف. `app/analytics/page.tsx` فيها أسماء حقول مشابهة لكن من دالة مختلفة تمامًا (`getSiteAnalytics`) — لا تعارض. TSC صفر أخطاء بعد التعديل
- **🎨 «الأثر الرقمي» أُخفي من الكرت مؤقتاً (خالد: الأرقام صغيرة، بتأثر على المبيعات لحد ما تكبر مع الـ organic):** الحساب بقي صحيح 100% بطبقة البيانات (`digitalImpact` على `TagListItem`/`EntityCardProps`)، بس ما يُعرض بالـ `EntityCard.tsx` — الفوتر صار شركاء بس (100% العرض بدل 70/30). **dead-code تحقّق:** `formatDigitalImpact` (entity-utils.ts) صار بدون أي مستخدم بعد الإخفاء → **حُذف** (تافه نعيده وقت التفعيل)
- **🔎 مراجعة شاملة: performance + SEO + SEO cache (خالد طلب تأكيد الثلاثة):**
  - **Chrome DevTools Lighthouse/trace غير متاح** (منفذ التصحيح 9222 ما يستجيب) — الفحص كان يدوي بمراجعة الكود، مو تشغيل تلقائي. لم أدّعِ "مضمون" بدون دليل
  - **🐛 باگ أداء حقيقي اكتُشف وأُصلح:** داخل `getTagsEnhanced` (tag-queries.ts)، `clientRows` (DB) و`getClientsGA4Stats()` (شبكة خارجية) كانا يُنفَّذان بالتتابع رغم إنهم مستقلين تماماً — waterfall حقيقي يخالف قاعدة المشروع "🔴 CRITICAL: Eliminate async waterfalls". أُصلح بـ `Promise.all`
  - **✅ تحقّق (مو تخمين):** استيراد `InfiniteEntityGrid` مباشرة (بدون `dynamic/ssr:false`) يطابق نفس نمط `InfiniteArticleList` الموجود فعلاً بـ `CategoryFeedSection.tsx` — قرار صحيح، مش مخالفة لقاعدة "dynamic لكل Client Component" (تلك القاعدة تخص widgets هامشية، مو المحتوى الرئيسي)
  - **🐛 باگ حقيقي: `app/tags/loading.tsx` كان قديم** — يعرض شكل الـ pills القديم (خلفية فاتحة + pills)، يسبّب وميض/CLS عند الانتقال للـ Hero الغامق الجديد. أُصلح بالكامل ليطابق التصميم الحالي (Hero غامق + Toolbar + شبكة كروت skeleton)
  - **🚨 فجوة SEO حقيقية اكتُشفت وأُصلحت:** الصفحة **ما كانت تقرأ الـ SEO cache المُدار من الأدمن** (`Settings.tagsPageMetaTags`/`tagsPageJsonLdStructuredData` — موجودة بالـ schema ويكتبها فعلياً `admin/lib/seo/listing-page-seo-generator.ts`، نفس نظام `/categories`). كانت تبني meta/JSON-LD حيّة بالكود بدل قراءة المُعتمَد من الأدمن. أُصلح: بُني `lib/seo/tags-page-seo.ts` (نفس نمط `categories-page-seo.ts`) + ربطه بـ`generateMetadata()` والـ JSON-LD — **اختُبر حيّاً**: عنوان الصفحة تغيّر فعلياً من القيمة الثابتة بالكود لعنوان الأدمن المخزّن ("التاجات — المواضيع الرائجة")، يثبت إن الإصلاح شغّال
  - **🚨 باگ عنوان مكرر "| مدونتي | مدونتي" — شُخِّص غلط أول مرة ثم صُحِّح (خالد: "راجع تاني راجع تاني"):** أول تشخيص كان سطحي (خيّرت بين "تصليح المولّد" أو "شيل التمبلت" — الاثنان غلط). المراجعة الثانية بالدليل (DOM + قراءة مصدر `admin/lib/seo/listing-page-seo-generator.ts` + docs Next.js المحلية):
    - **الجذر الحقيقي:** حقل الـ SEO title في الأدمن (`tagsSeoTitle`/`categoriesSeoTitle`/...) **نفسه يتضمّن "| مدونتي"** (دليل قاطع: `og:title` يطلع بلاحقة واحدة، والمولّد يحطّ `openGraph.title = config.title`). مودونتي يرندر العنوان كنص عادي → `title.template: "%s | مدونتي"` بالـ layout **يُضيف** اللاحقة ثانية (موثّق Next.js docs سطر 343: النص العادي يُضاف له template الأب) → التكرار في `<title>` فقط، الـ og سليم
    - **الحل الصحيح المؤكّد من docs (سطر 293):** `title.absolute` يتجاهل template الأب. طُبِّق في `generateMetadata` بصفحة الوسوم: لو `merged.title` نص → لُفّ بـ`{ absolute }`. **اختُبر حيّاً:** `<title>` صار "التاجات — المواضيع الرائجة | مدونتي" (لاحقة وحدة)، og+twitter+canonical+robots كلها سليمة ومتّسقة
    - **⚠️ نفس الباگ موجود بـ /categories و/industries و/clients و/articles و/trending** (كلها تستهلك `buildListingMetadata` بنص عادي) — يحتاج نفس إصلاح `{absolute}` لما نوصلها بمراحلها. للآن أُصلح tags فقط (نطاق المرحلة الحالية)
- Build: لم يُشغّل `pnpm build` بعد (dev فقط) — لازم قبل push

### 📝 Decisions taken (with reasoning)
- **`getTagsEnhanced` دالة جديدة منفصلة عن `getTagsWithCounts`** → الأخيرة تُستخدم في HomeBottomBar/LeftSidebar بشكل مختلف تماماً (بدون previews/pagination)؛ تعديلها كان يكسر consumers غير مرتبطين
- **Pagination بالـ slice بعد حساب كامل، مو DB-level cursor** → عدد الوسوم فعلياً صغير (32) وحساب `recentArticleCount`/`clientPreviews` أصلاً يحتاج المصفوفة كاملة (نفس منطق `getCategoriesEnhanced` الموجود)؛ تكلفة إضافية = صفر عملياً
- **Server Action تُمرَّر بـ `.bind(null, options)`** → نمط رسمي موثّق (`node_modules/next/dist/docs/01-app/02-guides/forms.md`)، يمرّر search/sort الحاليين لصفحات "تحميل المزيد" التالية بدون كسر توقيع `(page:number)=>` العام لـ `InfiniteEntityGrid`

### 🚧 Pending / blocked
- لا شيء حاجز. الخطوة التالية مباشرة: تكرار نفس الـ 7 خطوات لـ Industry
- `pnpm build` كامل + فحص TSC للـ 3 تطبيقات لم يُشغّل بعد — مطلوب قبل أي push

### 📂 Files touched
- **جديد:** `lib/entity-utils.ts`, `components/shared/EntityCard.tsx`, `components/shared/InfiniteEntityGrid.tsx`, `app/actions/tag-actions.ts`, `app/tags/components/tag-search-form.tsx`, `app/tags/components/tag-sort-filter.tsx`
- **معدَّل:** `app/api/helpers/tag-queries.ts` (إضافة فقط)، `lib/analytics/ga4.ts` (إضافة فقط)، `app/tags/page.tsx` (استبدال كامل)، `tailwind.config.ts` (سطر واحد — content glob)
- `documents/context/ENTITY-CARD-SPEC.md` — عُدِّل قسم 2+10: ترتيب التنفيذ صار **Tag → Industry → Category** (بدل Industry أولاً) بطلب خالد — الوسوم أصعب كيان فبنبدأ فيه

### 🔁 Git / deploy state
- Branch: main
- Uncommitted changes: yes — كل الملفات أعلاه، لم تُضَف للـ staging بعد
- Last commit: `82ad130` — admin v0.82.8: redeploy to activate REPLICATE_API_TOKEN
- Pushed: لا — لسّه ما طلب خالد push، والـ build الكامل لم يُشغّل بعد (شرط إلزامي قبل أي push)
- Vercel: بدون تغيير
- Dev server: يعمل بالخلفية (task `ba7mwjtx6`) على `localhost:3000`

### 🚀 How to resume in 30 seconds
1. تأكد السيرفر شغّال (`localhost:3000/tags`) — لو لأ: `pnpm dev:modonty`
2. طبّق نفس الـ 7 ملفات لـ **Industry**: `industry-queries.ts` (إضافة `getIndustriesEnhanced`/`getIndustriesPage` بنفس نمط tag-queries) → `industry-actions.ts` → `app/industries/page.tsx` (Hero teal + Toolbar + InfiniteEntityGrid، 3 أعمدة)
3. قبل أي push: `pnpm build` كامل + TSC للثلاث تطبيقات

---

### 🎯 Where I stopped
- الـ BRD مكتمل ومكتوب في `ENTITY-CARD-SPEC.md` v2.0 — كل القرارات مثبّتة، صفر نقاش معلّق
- **الخطوة التالية عند الاستئناف:** ابدأ التنفيذ الفعلي — المرحلة 1 = **Industry** (راجع قسم 10 في الـ spec لخطة الملفات)

### ✅ Done this session
- صُحّح خطأين جوهريين من السشن السابق (تحقّق كود مباشر، مو تخمين):
  - ❌→✅ مصدر «الأثر الرقمي» **مو GSC** (غير موجود في modonty) — **هو GA4**، موجود وشغّال فعلاً (`lib/analytics/ga4.ts` → `getClientsGA4Stats` يفلتر `pagePath` لكل عميل). نفس الآلية تُمدّد لـ Category/Industry/Tag بفلترة `/categories/`, `/industries/`, `/tags/`
  - ❌→✅ صفحة `/tags/[slug]` **ما فيها فجوة** — تعرض `<ClientCard>` grid كامل بالفعل (شعار+GA4+تقييمات)، الملاحظة القديمة "تعرض مقالات" كانت خاطئة
- **قرار جديد: Tags تمشي بنفس الـ layout/pattern تماماً** — لا قرار سابق حقيقي كان يفصلها كـ pills (كان افتراض بلا رقم فعلي من الـ DB)
- **قرار جديد: Infinite Scroll إلزامي على الثلاثة** — الداتا في نمو مستمر. تحقّقت من نمط موجود ومُثبَت (`InfiniteArticleList` + `loadMoreArticles` server action في فيد المقالات) — سيُعمَّم بمكوّن واحد `InfiniteEntityGrid` بدل تكراره 3 مرات
- اكتُشف عيب موجود بمعزل عن هذا العمل: `getCategoriesEnhanced`/`getIndustriesWithCounts`/`getTagsWithCounts` تجيب **كل** الصفوف بدون `take` — سيُصلَح كجزء من تفعيل الـ pagination
- بُني mockup كامل لـ page layout (`entity-page-layout-v1.html`) — Hero + Toolbar + Grid، 3 تبويبات حيّة (Category/Industry/Tag)
- أُعيد كتابة `ENTITY-CARD-SPEC.md` بالكامل → v2.0 (10 أقسام: منطق تجاري، ترتيب تنفيذ، تحقق schema، layout، anatomy، مصدر GA4، infinite scroll، Props، خارج النطاق، خطة ملفات المرحلة 1)
- TSC state: لم يُشغّل (لا كود تطبيق بعد، مرحلة توثيق فقط)
- Build/Live test: not done — لا كود تطبيق تغيّر هذا السشن

### 📝 Decisions taken (with reasoning)
- **ترتيب التنفيذ: Industry → Category → Tag** — خالد اعتمد البدء بـ Industry، ونفس الحل التقني يتكرر حرفياً بالباقي بدون إعادة نقاش
- **الأثر الرقمي = GA4 لا GSC** → GSC غير موجود في modonty، ويخالف نمط live-fetch القائم؛ GA4 موجود ومُستخدم بنفس الغرض في كرت العميل
- **Tags = نفس layout الكامل (Hero+Toolbar+Grid+EntityCard)** → لا سبب فعلي يمنعها، القرار القديم كان تخمين
- **مكوّن Infinite Scroll واحد عام لكل الكيانات** (`InfiniteEntityGrid`) بدل 3 نسخ منفصلة → يطابق فلسفة "pattern واحد" المطبّقة على الكرت

### 🚧 Pending / blocked
- لا شيء معلّق — الـ BRD مقفول 100%. الخطوة التالية تنفيذ مباشر
- ملاحظة مفتوحة غير حاجزة: العدد الفعلي للوسوم بالـ DB لم يُتحقّق منه من مصدر حي (لا يمنع البدء، فقط يؤثر على أولوية pagination لصفحة Tags تحديداً)

### 📂 Files touched
- `documents/context/ENTITY-CARD-SPEC.md` — **أُعيد كتابته بالكامل v2.0** (BRD نهائي، مرجع التنفيذ الوحيد من الآن)
- `documents/mockups/entity-page-layout-v1.html` — إنشاء + تعديل (أُضيف تبويب Tag كامل)
- (من السشن السابق، بدون تغيير: `categories-card-redesign-v1/v2/v3.html`, `entity-card-pattern-system-v1.html`)

### 🔁 Git / deploy state
- Branch: main
- Uncommitted changes: yes — ملفات التوثيق/المكب أعلاه غير مضافة، **لا كود تطبيق (modonty/) تغيّر بعد**
- Last commit: `82ad130` — admin v0.82.8: redeploy to activate REPLICATE_API_TOKEN
- Pushed: لا شيء (مرحلة توثيق)
- Vercel: بدون تغيير

### 🚀 How to resume in 30 seconds
1. افتح `documents/context/ENTITY-CARD-SPEC.md` قسم 10 — خطة ملفات المرحلة 1 (Industry)
2. ابدأ بـ `modonty/lib/entity-utils.ts` (تعميم من `category-utils.ts`) ثم `EntityCard.tsx`
3. بعد Industry: نفس الخطوات حرفياً لـ Category ثم Tag (بدون نقاش جديد)

---

## Session: 2026-07-02 (2) — REPLICATE_API_TOKEN fix on Vercel production

### 🎯 Where I stopped
- admin v0.82.8 READY على production
- `REPLICATE_API_TOKEN` مضاف لـ Vercel + admin rebuilt

### ✅ Done this session
- اكتشفنا 401 من Replicate في prod — السبب: `REPLICATE_API_TOKEN` مو موجود على Vercel
- أضفنا `REPLICATE_API_TOKEN` لـ Vercel عبر API (project-level على admin فقط، encrypted)
- bump admin: 0.82.7 → **0.82.8** لإجبار rebuild
- Vercel: admin READY ✅ · modonty CANCELED ✅ · console CANCELED ✅

### 📝 Decisions taken
- REPLICATE_API_TOKEN يُضاف على project-level (admin فقط) لا shared — modonty/console ما يحتاجونه

### 🚧 Pending / blocked
- **Live test** لـ AI image generation في prod (Generate Preview زر)
- **Instagram bio link** — رابط البايو على حساب مودونتي يحتاج تحديث يدوي

### 📂 Files touched
- `admin/package.json` — v0.82.8
- Vercel env vars — REPLICATE_API_TOKEN مضاف

### 🔁 Git / deploy state
- Branch: main
- Last commits:
  - `57402e6` — chore: redeploy admin (empty commit — لم يبن)
  - `82ad130` — admin v0.82.8: redeploy to activate REPLICATE_API_TOKEN
- Pushed: ✅
- Vercel: admin READY ✅ (v0.82.8)

### 🚀 How to resume in 30 seconds
1. اختبر زر "Generate Preview" على مقال في `/social/facebook/[articleId]` → Instagram tab → AI
2. تحقق الصورة تظهر (FLUX 1.1 Pro)
3. حدّث bio link في Instagram يدوياً

---

## Session: 2026-07-02 — Social Publishing: Instagram+FB unified, Twitter hidden, Vercel fixed

### 🎯 Where I stopped
- كل الـ 3 apps READY على الإنتاج بدون أخطاء
- آخر عمل: force rebuild لـ modonty + console بعد lockfile error

### ✅ Done this session

**Social Publishing Page — /social/facebook/[articleId]:**
- FLUX 1.1 Pro ($0.04/image) عبر Replicate — AI image generation
- Gemini 2.5-flash prompt: طبيعي بالإنجليزي + شخصيات سعودية + مدن سعودية + JSON structured output
- Instagram best practices: Hook (125 chars visible) + "رابط في البايو ☝️" + 3-5 hashtags من article.tags
- Facebook: 2 hashtags + رابط clickable في الكابشن
- `assembleFbCaption` vs `assembleIgCaption` — دالتان منفصلتان
- Cloudinary upload عند الـ publish: FLUX URL → Cloudinary → يحفظ `imageUrl` + `imagePublicId` في SocialPost DB
- `imagePublicId String?` — حقل جديد أُضيف لـ SocialPost في schema.prisma + prisma generate
- Platform checkboxes (FB/IG) جنب زر Publish مباشرة في top row
- Tabs: Content | Facebook | Instagram (Twitter حُذف من الـ UI)
- Sharp: crops cover إلى 1080×1350 + blur(18) كـ Default Instagram image مجاني

**Twitter — قرار إيقاف:**
- Twitter API v2 (2026) = credit-based — $0.015/tweet بدون رابط، $0.20/tweet مع رابط
- ما في free tier فعلي للكتابة — مؤكّد من Twitter Developer Console (balance $0.00)
- Twitter checkbox + Twitter tab + twResult حُذفوا من facebook-post-client.tsx
- Backend code (`postArticleToTwitter` في _actions.ts) باقي محفوظ للمستقبل

**Sidebar:**
- "Social Media" تحوّل من collapsible group (Facebook + Instagram كـ children) → link مباشر واحد → `/social/facebook`
- حُذفت Facebook و Instagram كـ imports من sidebar.tsx

**TypeScript fixes (قبل الـ push):**
- `CloudinaryUploader` type: أُضيف `public_id: string` للـ upload response
- `Article.imageUrl` غير موجود في Prisma → صُحّح إلى `featuredImage: { select: { url: true } }`
- TSC: admin ✅ zero errors

**Vercel deployment fixes:**
- bad5d53: كل الـ 3 apps ERROR بسبب lockfile mismatch (twitter-api-v2 في lockfile بس مش في package.json)
- 8a76fbb: أُضيف `twitter-api-v2: ^1.29.0` لـ admin/package.json → admin READY
- 0c938b5: modonty v1.69.3 + console v0.18.4 → force rebuild → كلهم READY

**Versions:**
- admin: 0.82.6 → **0.82.7**
- modonty: 1.69.2 → **1.69.3**
- console: 0.18.3 → **0.18.4**

### 📝 Decisions taken
- Twitter مُوقف نهائياً من الـ UI (تكلفة $0.20/تغريدة) — backend محفوظ
- Instagram + Facebook في صفحة واحدة `/social/facebook/[articleId]`
- Hashtags من article.tags مباشرة (بدون AI): 2 لـ FB، 5 لـ IG
- Body مشترك بين FB و IG (مش منفصل)

### 🚧 Pending / blocked
- **REPLICATE_API_TOKEN** — مطلوب إضافته لـ Vercel عشان AI image generation تشتغل في prod
- **Live test** في prod لـ FB posting و IG posting end-to-end
- **Instagram bio link** — تحديث رابط البايو على حساب مودونتي يدوياً

### 📂 Files touched
- `admin/app/(dashboard)/social/facebook/[articleId]/_components/facebook-post-client.tsx`
- `admin/app/(dashboard)/social/facebook/[articleId]/page.tsx` — maxDuration: 120
- `admin/app/(dashboard)/social/facebook/_actions.ts` — Cloudinary, Sharp, FLUX, Twitter backend
- `admin/components/admin/sidebar.tsx` — Social Media → direct link
- `admin/package.json` — v0.82.7 + twitter-api-v2
- `dataLayer/prisma/schema/schema.prisma` — imagePublicId در SocialPost
- `modonty/package.json` — v1.69.3
- `console/package.json` — v0.18.4
- `pnpm-lock.yaml`

### 🔁 Git / deploy state
- Branch: main
- Last commits:
  - `bad5d53` — admin v0.82.7: social publishing page
  - `8a76fbb` — fix: add twitter-api-v2 to admin dependencies
  - `0c938b5` — modonty v1.69.3 + console v0.18.4: force rebuild
- Pushed: ✅
- Vercel: admin READY ✅ · modonty READY ✅ · console READY ✅

### 🚀 How to resume in 30 seconds
1. أضف `REPLICATE_API_TOKEN` لـ Vercel (Shared Env) عشان AI image generation تشتغل في prod
2. اختبر FB + IG posting على مقال حقيقي في prod
3. حدّث bio link في Instagram يدوياً

