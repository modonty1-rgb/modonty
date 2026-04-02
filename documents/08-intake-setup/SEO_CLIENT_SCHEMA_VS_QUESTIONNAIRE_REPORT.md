# دليل استبيان SEO وغطاء قاعدة البيانات

**الهدف الرئيسي:** مساعدة فريق SEO على جمع **كل البيانات اللازمة** من العميل لبناء استراتيجية تحسين شاملة والوصول لمراتب متقدمة. الاستبيان هو المرجع الأساسي — وهذا المستند يوضح ما يمكن تخزينه في النظام وما يُوثَّق خارجياً.

---

## للفريق: كيف تستخدم هذا المستند

1. **قبل المقابلة** — راجع استبيان `SEO_CLIENT_INTAKE_FINAL_AR.md` واستعد لأسئلته.
2. **أثناء المقابلة** — اجمع كل الإجابات دون تخطّي أقسام.
3. **بعد المقابلة** — ادخل في النظام كل ما يُخزَّن في Client (انظر القسم 1)، ووثّق الباقي في ملف المشروع أو SeoIntake.
4. **النتيجة** — بيانات كاملة = استراتيجية SEO دقيقة = تحسين فعّال لظهور العميل.

---

## نموذج مودونتي: عميل واحد = مشروع واحد

مودونتي يعتمد على **عميل واحد لكل مشروع**: كل Client في النظام يمثل مشروع/شركة مستقلة. لا يوجد نموذج فروع — كل مشروع له عنوان رئيسي واحد وNAP واحد. إن وُجدت مشاريع متعددة، يُنشأ عميل منفصل لكل منها.

---

## 1. ما تجمعه وتدخله مباشرة في النظام (Client Schema)

### أساسيات النشاط

- **البيانات الأساسية** — تغطية جيدة عبر:
  - `name`, `legalName`, `alternateName` (اسم الشركة والأسماء البديلة)
  - `url`, `slogan`, `description` (الموقع والشعار والوصف)
  - `industryId`, `organizationType` (القطاع ونوع المنظمة)
  - `foundingDate` (تاريخ التأسيس)
  - `businessBrief`, `targetAudience`, `contentPriorities` (نبذة الأعمال، الجمهور المستهدف، أولويات المحتوى)

### العنوان والموقع

- **عنوان رئيسي واحد لكل عميل** — كامل عبر:
  - `addressStreet`, `addressCity`, `addressCountry`, `addressPostalCode`
  - `addressRegion`, `addressNeighborhood`, `addressBuildingNumber`, `addressAdditionalNumber`
  - `addressLatitude`, `addressLongitude`
- يطابق نموذج مودونتي: عميل واحد = عنوان رئيسي واحد.

### بيانات السعودية والخليج

- تغطية كاملة عبر:
  - `commercialRegistrationNumber` (رقم السجل التجاري)
  - `vatID`, `taxID` (الضريبة)
  - `legalForm` (الشكل القانوني)
  - `licenseNumber`, `licenseAuthority` (الرخص وجهة الإصدار)

### الجمهور المستهدف

- تغطية جزئية عبر:
  - `targetAudience` (وصف الجمهور المستهدف)
  - `knowsLanguage` (اللغات)

### الحسابات الاجتماعية

- روابط الحسابات متوفرة في `sameAs` (لينكدإن، تويتر، فيسبوك، إلخ)

### الكلمات المفتاحية

- تغطية كافية عبر `keywords` و `contentPriorities`

### المحتوى

- تغطية جزئية عبر `businessBrief` و `description`

### E-E-A-T والموثوقية

- بيانات أساسية موجودة: `description`, `alternateName`, والعنوان والاتصال
- يحتاج نموذج `Author` منفصل لفريق الكتاب والخبراء

### On-Page SEO

- تغطية كاملة:
  - `seoTitle`, `seoDescription`
  - `canonicalUrl`, `metaRobots`

### SEO المحلي

- عنوان كامل + `email` و `phone` — كافٍ لكل عميل وفق نموذج مودونتي (عميل واحد = موقع رئيسي واحد)

### العلامة التجارية

- تغطية جزئية عبر `slogan` و `description`

### الدولية

- تغطية جزئية عبر `knowsLanguage` و `canonicalUrl`

---

## 2. ما تجمعه وتوثّقه (مهم لتحسين SEO — يُخزَّن لاحقاً أو في ملف المشروع)

**مهم لفريق SEO:** اجمع هذه البيانات حتى لو لم تكن مخزنة في النظام بعد. وثّقها في ملف المشروع أو SeoIntake — هي أساس استراتيجية التحسين ولا تُستغنى عنها.

### أ. بيانات تشغيلية ومشروع

الاستبيان يطلب بيانات لا تنتمي عادةً لسجل العميل نفسه:

- أهداف SEO و KPIs — يُقترح: `seoGoals Json?` أو نموذج `SeoProject`
- معايير النجاح (عدد الزيارات، التحويلات، الإيرادات) — نفس أعلاه
- ميزانية SEO — يُقترح: `seoBudget Json?` أو في نموذج المشروع
- مواعيد النتائج المتوقعة — في نموذج المشروع
- من يملك ملف SEO داخلياً — في نموذج المشروع

### ب. فروع ومواقع متعددة (خارج النطاق حالياً)

- نموذج مودونتي لا يدعم فروعاً متعددة لعميل واحد — كل مشروع = عميل منفصل.
- في المستقبل: إن أصبحت العلامات متعددة المواقع شائعة، يُراعى إضافة نموذج `ClientBranch` أو `ClientLocation` مع NAP وروابط GBP لكل موقع.

### ج. أصول رقمية وتقنية

- دومينات متعددة وredirects — يُقترح: نموذج `ClientDomain` أو `domains Json?`
- روابط Google Business Profile — يُقترح: `googleBusinessProfileUrl String?`
- قنوات YouTube وPodcast وNewsletter — يُقترح: `digitalChannels Json?` أو حقول منفصلة
- Brand guidelines (ألوان، نبرة) — يُقترح: `brandGuidelines Json?`

### د. وصول وصلاحيات (Governance)

- صلاحيات GSC, GA4, GTM, CMS — يُقترح: نموذج `ClientAccess` أو `accessCredentials Json?` (مع حماية عالية)
- آلية الموافقات على المحتوى — يُخزّن في نموذج المشروع

### هـ. بيانات تقنية وتدقيق SEO

- المنصة/CMS (WordPress, Next.js…) — يُقترح: `platform String?` أو `technicalProfile Json?`
- بيئة Staging — ضمن `technicalProfile`
- Core Web Vitals — يُقترح: `coreWebVitals Json?` أو تدقيق منفصل
- سجل Migrations — يُقترح: `migrationHistory Json?`
- عقوبات Google — يُقترح: `seoAuditHistory Json?`
- hreflang ومتعدد اللغات — قد يُخزّن في SiteConfig أو `alternateLanguages Json?`

### و. تحليلات وقياس

- تعريف التحويلات المهمة — نموذج Conversion موجود، يُقترح: `conversionDefinitions Json?` إن احتجناه
- CRM المستخدم — يُقترح: `crmType String?` أو نموذج Integration
- أفضل وأسوأ landing pages — يُستمد من التحليلات، غالباً لا يحتاج تخزين مباشر

### ز. منافسون وسوق

- قائمة المنافسين (أسماء وروابط) — يُقترح: نموذج `ClientCompetitor` أو `competitors Json?`
- كلمات المنافسين — ضمن `keywordResearch Json?` أو نموذج Keyword
- حجم البحث وتنافسية السوق — ضمن نموذج Keyword أو `keywordResearch`

### ح. استراتيجية كلمات مفتاحية مفصّلة

- كلمات مستهدفة (5–10) مع سبب الاختيار — يُقترح: نموذج `ClientKeyword` أو `targetKeywords Json?`
- كلمات ممنوعة — يُقترح: `forbiddenKeywords String[]` أو حقل في JSON
- تصنيف النية (Transactional, Informational…) — في نموذج Keyword أو JSON

### ط. محتوى وهيئة تحريرية

- نبرة الكتابة — يُقترح: `contentTone String?`
- حدود الامتثال (طبي، مالي…) — يُقترح: `complianceConstraints Json?`
- Pillar pages و Topic clusters — يُربط بالمقالات، وقد يحتاج `contentStrategy Json?`

### ي. E-E-A-T

- صفحات Team/Authors — يُقترح: نموذج `Author` مرتبط بـ Client و Article
- Policies (Privacy, Returns, Shipping) — قد تكون صفحات منفصلة أو `policyUrls Json?`
- شهادات واعتمادات — يُقترح: `certifications Json?` أو `accreditations String[]`

### ك. روابط خلفية (Off-Page)

- Domain Authority / DR — يُقترح: `domainAuthority Float?` أو `seoMetrics Json?`
- عدد الروابط الخلفية — نفس الحقل أعلاه
- سياسة الروابط المدفوعة — يُقترح: `linkBuildingPolicy String?` أو ضمن JSON

### ل. سوشيال ويوتيوب

- قنوات سوشيال نشطة — `sameAs` تغطي الروابط فقط وليس حالة النشاط
- روابط YouTube/Podcast — يمكن إضافتها في `sameAs` أو حقول منفصلة
- هوية هاشتاقات — يُقترح: `socialIdentity Json?`

### م. موارد وميزانية

- ميزانية SEO — في نموذج مشروع أو عقد
- توقعات النتائج (1–3 أشهر أم 6–12) — نفس النموذج
- أدوات مستخدمة — يُقترح: `seoTools Json?` أو في نموذج المشروع

### ن. قيود قانونية وتجارية

- كلمات ممنوعة تسويقياً — يُقترح: `forbiddenClaims String[]` أو في JSON
- إمكانية ذكر المنافسين — يُقترح: `competitiveMentionsAllowed Boolean?`
- تراخيص وسجلات تجارية — جزئياً عبر `commercialRegistrationNumber` و `licenseNumber`

### س. توقعات العميل وآلية العمل

- تفضيل التواصل (واتساب، إيميل، اجتماعات)
- شكل التقارير (أسبوعية، شهرية)
- Quick wins المطلوبة في أول 30 يومًا

كلها تُخزّن في نموذج مشروع أو عقد وليس في Client نفسه.

---

## 3. ملخص سريع لفريق SEO

### ما تدخله في النظام حالياً (من الاستبيان)

- بيانات المنظمة: اسم، وصف، شعار، قطاع، عنوان رئيسي، اتصال
- بيانات السعودية والخليج: CR، VAT، رخص
- SEO أساسي: عنوان، وصف، canonical، meta
- لغات وكلماة مفتاحية أساسية
- روابط الحسابات الاجتماعية
- يطابق نموذج مودونتي: عميل واحد = عنوان رئيسي واحد

### ما تجمعه وتوثّقه حتى لو لم يُخزَّن بعد (أولويات للتطوير)

1. **حقل `seoIntake Json?`** أو نموذج `SeoIntake` لتخزين إجابات الاستبيان كاملة

2. **حقول إضافية على Client:**
   - `targetKeywords`, `forbiddenKeywords`
   - `competitors` (أو نموذج منفصل)
   - `technicalProfile` (منصة، staging، hreflang)
   - `seoGoals`, `seoMetrics`, `linkBuildingPolicy`
   - `brandGuidelines`, `contentTone`, `complianceConstraints`

3. **نموذج Author** للـ E-E-A-T وصفحات الفريق

4. **نموذج ClientProject** أو **SeoContract** للأهداف، الميزانية، آلية العمل، والتقارير

### اعتبار مستقبلي (اختياري)

- إن بدأت مودونتي بمنصات متعددة المواقع (سلاسل، امتيازات)، يُراعى إضافة نموذج `ClientBranch` أو `ClientLocation` مع NAP وروابط GBP لكل موقع.

---

## 4. حقول مقترحة للإضافة في Schema

### أ. حقول إضافية على نموذج Client

- **`technicalProfile`** — `Json?`  
  `{platform?, stagingUrl?, hreflang?, cacheType?}`.  
  **كيف يساعد:** سياق تقني للتدقيق والإصلاحات؛ Junior يعرف البنية التقنية التي يعمل عليها.

- **`seoGoals`** — `Json?`  
  `{primaryGoal?, kpis?, successMetrics?, timeline?}`.  
  **كيف يساعد:** محاذاة العمل مع توقعات العميل؛ مؤشرات للتقارير.

- **`seoMetrics`** — `Json?`  
  `{domainAuthority?, backlinkCount?, lastUpdated?}`. لقطات اختيارية.  
  **كيف يساعد:** خط أساس لمتابعة التقدّم؛ عدم الحاجة للبحث اليدوي.

- **`linkBuildingPolicy`** — `String?`  
  السياسة تجاه الروابط المدفوعة، Guest posts، الأدلة.  
  **كيف يساعد:** منع ممارسات خطرة؛ الحفاظ على بناء الروابط آمناً.

- **`brandGuidelines`** — `Json?`  
  `{tone?, voice?, colors?, dosAndDonts?}`.  
  **كيف يساعد:** محتوى متسق و E-E-A-T؛ تقليل المراجعات مع العميل.

- **`contentTone`** — `String?`  
  رسمي، ودّي، تقني، إلخ.  
  **كيف يساعد:** مرجع سريع للكتّاب؛ صوت موحّد.

- **`complianceConstraints`** — `Json?`  
  `{industry?, restrictedClaims?, needsReview?}`.  
  **كيف يساعد:** تجنّب مخاطر قانونية/امتثال؛ حدود واضحة للمحتوى.

- **`googleBusinessProfileUrl`** — `String?`  
  رابط ملف الأعمال على جوجل.  
  **كيف يساعد:** رابط مباشر لـ SEO المحلي وتدقيق الإدراجات.

- **`forbiddenKeywords`** — `String[]`  
  كلمات لا يجب استهدافها (عدم انسجام مع البراند، سلبية، أو امتثال).  
  **كيف يساعد:** منع محتوى ومواضع خاطئة؛ ضمان الامتثال.

- **`forbiddenClaims`** — `String[]`  
  ادعاءات تسويقية أو عبارات لا يجوز استخدامها.  
  **كيف يساعد:** الامتثال؛ تجنّب محتوى مرفوض.

- **`competitiveMentionsAllowed`** — `Boolean?`  
  هل يمكن ذكر أسماء المنافسين في المقارنات.  
  **كيف يساعد:** سياسة محتوى واضحة لصفحات المقارنة.

### ب. نماذج جديدة (إن لزم)

- **SeoIntake** — `clientId`, `answers Json`, `collectedAt`, `collectedBy`  
  تخزين الاستبيان كنموذج منفصل مع إمكانية التعديل وإعادة الجمع.  
  **كيف يساعد:** نسخ متعددة، تتبّع، تدقيق سجل الاستبيانات عبر الوقت.

- **ClientCompetitor** — `clientId`, `name`, `url`, `notes`, `order`  
  قائمة منافسين منظمة.  
  **كيف يساعد:** استعلامات منظمة، تقارير، إدارة أفضل للمنافسين.

- **ClientKeyword** — `clientId`, `keyword`, `intent`, `priority`, `reason`  
  كلمات مفتاحية مستهدفة مع النية والأولوية.  
  **كيف يساعد:** قائمة واضحة للتحسين والمحتوى؛ أولويات محددة.

- **ClientProject** — `clientId`, `goals`, `budget`, `timeline`, `contactPerson`, `reportingPreference`  
  نطاق المشروع وعقد SEO.  
  **كيف يساعد:** نطاق العمل، الفوترة، التسليم بين الفريق والعميل.

**ملاحظة:** Author موجود مسبقاً في الـ Schema.

### ج. هيكل التوصية النهائية

- **جداول جديدة:** SeoIntake، ClientCompetitor، ClientKeyword، ClientProject (كلها مع `clientId`).
- **حقول على Client:** technicalProfile، seoGoals، seoMetrics، linkBuildingPolicy، brandGuidelines، contentTone، complianceConstraints، googleBusinessProfileUrl، forbiddenKeywords، forbiddenClaims، competitiveMentionsAllowed.
- **Author:** موجود، لا يُضاف.

---

**مراجع:**

- الاستبيان: `SEO_CLIENT_INTAKE_FINAL_AR.md` — استخدمه في كل مقابلة اكتشاف
- Schema: `dataLayer/prisma/schema/schema.prisma` — نموذج Client
- النموذج: عميل واحد = مشروع واحد (مودونتي)
