# SEO Intake Form Audit — Modonty Console

> **تاريخ:** 2026-04-27 (Session 70)
> **النطاق:** كل بيانات SEO اللي العميل يعبّيها في الـ console
> **الملف المصدر:** [console/app/(dashboard)/dashboard/seo/helpers/intake-sections.ts](../../console/app/(dashboard)/dashboard/seo/helpers/intake-sections.ts) (747 سطر)
> **حجم البيانات الفعلية:** **83 سؤال** عبر **13 قسم** + تبويبَي keywords/competitors + 18 حقل SEO في profile
> **الهدف:** نختزل الأسئلة لأقل عدد فعلاً يخدم الـ AI/team في كتابة محتوى عربي SEO قوي
> **منهجية البحث:** قراءة كاملة للكود + 8 مراجع صناعية SEO رسمية (Cornerstone, Content Snare, SE Ranking, Search Engine Journal, Surfer SEO, Stan Ventures, 99signals, File Request Pro)

---

## 1. الخلاصة التنفيذية

| المؤشر | الواقع الحالي | المعيار الصناعي | الحكم |
|---|---|---|---|
| **عدد الأسئلة الكلي** | **83** | 10-30 | ❌ **3-8× أكثر من اللازم** |
| **عدد الأقسام** | 13 | 5-7 | ❌ **2× أكثر من اللازم** |
| **زمن التعبئة المتوقع** | 45-60 دقيقة | 10-15 دقيقة | ❌ معدل تخلّي عالي |
| **نسبة الـ textareas** | ~70/83 | 5-10/20 | ❌ مرهق ذهنياً |
| **أسئلة تقنية للعميل غير التقني** | ~40% (sitemap, https, schema, indexing) | 0% | ❌ خطأ منهجي |
| **أسئلة قابلة للاستخراج آلياً** | ~33 سؤال | معظمها يُؤتمت | ❌ هدر وقت العميل |

**التشخيص الجوهري:**
> الاستمارة تطلب من **صاحب نشاط (مطعم/متجر/طبيب)** بيانات تقنية يستحيل عليه معرفتها (sitemap, schema, indexing, NAP consistency, backlinks toxicity). معظم هذه البيانات يجب أن تأتي **آلياً** من Google Analytics + Search Console + PageSpeed APIs.

---

## 2. تصنيف كل سؤال (83 سؤال)

### 🟢 KEEP — أساسي لكتابة المحتوى (16 سؤال)

| ID | السؤال (مختصر) | المبرّر |
|---|---|---|
| q1 | قصة المشروع | Brand voice فريد لا يُستخرج آلياً |
| q2 | ما يميزك (USP) | يدخل في عناوين/مقدمات المقالات |
| q4 | المواسم | تقويم محتوى |
| q5 | أهداف 6 أشهر/سنة | يحدد أولويات المحتوى |
| q11 | المشكلة الرئيسية للعميل | المحرّك الأول للمحتوى |
| q12 | اعتراضات قبل الشراء | محتوى objection handling |
| q14 | الأسئلة المتكررة | بذرة مباشرة لـ FAQs + مقالات |
| q15 | الكلمات المتوقعة للبحث | seed keywords |
| q16 | مرحلة رحلة الشراء | يحدد funnel content |
| q26 | تعدّد النطاقات | استراتيجي مهم |
| q33 | المواضيع التي تجذب العملاء | content seeds |
| q44 | فرع فعلي؟ | branching للـ local SEO |
| q45 | المدن المخدومة | local content |
| q50 | متجر إلكتروني؟ | branching للـ e-commerce |
| q70 | مواضيع غير مغطاة | content gap gold |
| q75 | الشخص المعتمد للقرار | workflow |

### 🟡 SIMPLIFY — مفيد لكن نختصره/ندمجه (10 أسئلة)

| ID | الحالي | الاقتراح |
|---|---|---|
| q9 | متوسط قيمة العميل | اجعله اختياري + نطاق سريع |
| q13 | سوء الفهم الشائع | **ادمجه مع q12** (اعتراضات) |
| q19 | خطط تغيير الموقع | اختصره: نعم/لا/متى |
| q34 | تعليمي vs تحويلي | اختصره لـ checkbox واحد |
| q59 | مقالات سابقة في مواقع | yes/no مع روابط |
| q61 | شركاء محتملين | bullet points فقط |
| q62 | عضويات/شراكات | bullet points فقط |
| q63 | محتوى مجاني للمشاركة | yes/no مع وصف قصير |
| q67 | بدائل عند العميل | multiselect 3 خيارات |
| q77 | تجارب SEO سابقة | yes/no + سطرين |

### 🔵 DERIVE — نستخرجه آلياً (33 سؤال — لا نسأل!)

| ID | السؤال | المصدر التلقائي |
|---|---|---|
| q3, q72 | حجم المنافسة | Keywords research API + SEMrush |
| q6, q10 | تتابع الزوار؟ | حالة اتصال GA من admin |
| q7 | عدد الزوار الشهري | **Google Analytics 4 API** |
| q8 | معدل التحويل | **Google Analytics 4 API** |
| q17 | اللغة | الموقع نفسه + GSC |
| q18 | جوال/كمبيوتر | **Google Analytics 4** |
| q20, q82 | تاريخ هبوط الزيارات | **Google Analytics history** |
| q21 | Search Console مفعّل؟ | فحص حساب من admin |
| q22 | https + mobile-friendly | **PageSpeed Insights API** |
| q23 | سرعة الموقع | **PageSpeed/CrUX API** |
| q24 | sitemap موجود؟ | `curl /sitemap.xml` |
| q25 | صفحات لا تظهر | **Search Console URL Inspection API** |
| q27 | كلمات تظهر فيها | **Search Console Performance API** |
| q28 | كلمات منافسيك | SEMrush/Ahrefs API |
| q36, q37 | بنية + عدد الصفحات | sitemap crawl |
| q38, q39 | صفحات فريدة + FAQ | site crawler audit |
| q40 | URL structure | sitemap analysis |
| q41 | محتوى ضعيف | content audit tool |
| q42, q43 | روابط داخلية + CTA | site crawler |
| q46 | NAP consistency | Google My Business + Yelp APIs |
| q48 | تقييمات | **Google Places API** |
| q49 | صفحات مدن | derived from q45 |
| q51, q53, q54 | متجر: descriptions/filters/categories | site crawler |
| q56 | تقييمات منتجات | site crawler |
| q57, q65 | شهرة العلامة | branded search في GSC |
| q58 | backlinks | **Ahrefs/Moz API** |
| q60 | روابط ضارة | backlink audit |
| q66 | أقوى منافس | KSP analysis + competitors tab |
| q69 | ظهور المنافس في الإعلام | PR research |
| q71 | حجم السوق | search volume API |
| q73 | منافسون جدد | SERP monitoring |
| q80 | تغيير الدومين | DNS history (SecurityTrails) |
| q81 | تغييرات على الموقع | Wayback Machine |
| q83 | بيانات قديمة | GA history |

### 🔴 REMOVE — لا يخدم AI/فريق المحتوى (16 سؤال)

| ID | السبب |
|---|---|
| q29 | **مكرر** لـ q4 (المواسم) |
| q30 | كم مرة تنشر — modonty تكتب، بلا قيمة |
| q31 | من يكتب — modonty تكتب |
| q32 | تقويم محتوى — modonty تنظّم |
| q35 | head vs long-tail — قرار فريق SEO، مو العميل |
| q47 | تسجيل في أدلة محلية — out of content scope |
| q52 | عملية الشراء — CRO scope مو content |
| q55 | وضوح معلومات المنتج — CRO scope |
| q64 | السوشيال يجلب عملاء؟ — out of scope |
| q68 | فجوات مع المنافس — مكرر مع q70 |
| q74 | فريقك الداخلي — modonty تنفّذ |
| q76 | سرعة تنفيذ التغييرات — modonty تنشر مباشرة |
| q78 | عملت مع وكالات سابقة — admin context، ليس content |
| q79 | بياناتهم القديمة — admin context |

---

## 3. النموذج المقترح — 20 سؤال × 5 أقسام

### القسم 1 — نشاطك (3 أسئلة) ⏱️ 3 دقائق
1. **ما قصة مشروعك ولماذا بدأته؟** [textarea]
2. **ما الذي يميزك فعلاً عن منافسيك؟** [textarea]
3. **هل لنشاطك مواسم محددة؟** [select: نعم محدد / متذبذب / ثابت طوال السنة]

### القسم 2 — عملاؤك (5 أسئلة) ⏱️ 5 دقائق — **أهم قسم لكتابة المحتوى**
4. **ما المشكلة الرئيسية التي تحلها لعميلك؟** [textarea]
5. **ما المخاوف التي تمنع العميل من الشراء معك؟** [textarea]
6. **ما الأسئلة الأكثر تكراراً من عملائك؟** [textarea — متعدد الأسطر]
7. **ما الكلمات التي تتوقع جمهورك يبحث بها؟** [textarea — متعدد الأسطر]
8. **متى يصلك العميل عادة؟** [multiselect: ما يعرف الخدمة / يقارن / جاهز للشراء]

### القسم 3 — أهدافك (3 أسئلة) ⏱️ 2 دقيقة
9. **بعد 6 أشهر، ما أهم 3 نتائج تريد تحقيقها؟** [textarea]
10. **ما أهم خدمة/منتج تركّز عليه؟** [textarea] — *جديد، مهم لـ ROI*
11. **هل لديك إرشادات brand voice أو tone محددة؟** [textarea أو رفع PDF] — *جديد*

### القسم 4 — تواجدك (4 أسئلة branching) ⏱️ 2 دقيقة
12. **هل لديك فرع/مكتب فعلي؟** [yes/no]
13. **ما المدن التي تخدمها؟** [textarea — يظهر إذا 12 = نعم]
14. **هل لديك متجر إلكتروني؟** [select: لا / 1-50 / 51-200 / 200+]
15. **هل عندك تواجد قوي على السوشيال؟** [yes-strong / yes-medium / no]

### القسم 5 — منافسيك ومحتواك (5 أسئلة) ⏱️ 3 دقائق
16. **من أقوى 2-3 منافسين ولماذا؟** [textarea — *يمكن نقله لتبويب المنافسين*]
17. **ما المواضيع المهمة لجمهورك ولا أحد يغطيها بشكل ممتاز؟** [textarea — content gap gold]
18. **ما المواضيع التي تجذب عملاءك أكثر؟** [multiselect: نصائح / مقارنات / أسعار / قصص / أسئلة]
19. **نوع المحتوى الأنسب** [multiselect: تعليمي / تحويلي / كلاهما]
20. **هل لديك أي محتوى مجاني تقدمه (دليل، أداة، قالب)؟** [textarea]

**+ سؤال workflow** (يُضاف للـ admin tab أو settings):
- **من الشخص المعتمد لاتخاذ القرارات معنا؟** [name + role]

**⏱️ زمن التعبئة الإجمالي:** ~15 دقيقة (مقابل 45-60 دقيقة الآن).

---

## 4. Auto-Audit Engine — البيانات المطلوب أتمتتها (33 بند)

| المصدر | الحقول المستخرجة |
|---|---|
| **Google Analytics 4 API** | عدد الزوار، معدل التحويل، جوال/ديسكتوب، مصادر الزيارات، peak periods، history |
| **Google Search Console API** | الكلمات الظاهرة، URLs غير مفهرسة، CTR، impressions، تاريخ التغيرات |
| **PageSpeed Insights / CrUX API** | السرعة، LCP، CLS، INP، https، mobile-friendly، Web Vitals |
| **Google Places API** | NAP consistency، تقييمات Google، رصيد سمعة |
| **Backlink API (Ahrefs/Moz/SEMrush)** | عدد backlinks، الروابط الضارة، كلمات منافسيك |
| **Sitemap crawl + Site audit** | بنية الموقع، عدد الصفحات، URL structure، روابط داخلية، schema، content gaps |
| **DNS / Wayback Machine** | تاريخ الدومين، التغييرات الكبيرة، الانتقالات |
| **SERP monitoring** | منافسون جدد، تغير ترتيبك، featured snippets |

---

## 5. الفائدة المتوقعة من التبسيط

| المؤشر | قبل (83 Q) | بعد (20 Q) | التحسّن |
|---|---|---|---|
| زمن التعبئة | 45-60 دقيقة | 15 دقيقة | **-67%** |
| معدل إكمال الاستمارة | متوقع <40% | متوقع **>80%** | **2× أكثر** |
| جودة الإجابات | منخفضة (إجهاد + تخمين) | **مركّزة** | إجابات قابلة للاستخدام |
| البيانات الفنية | يكذب أو يخمن | **آلياً = دقة 100%** | لا أخطاء |
| تكلفة الوقت على الـ team | 30 دقيقة لتفسير الإجابات | 5 دقائق | **-83%** |
| تكلفة الـ AI tokens لـ brief | عالية (سياق طويل) | منخفضة (سياق مكثّف) | **-60%** |

---

## 6. خارطة طريق التنفيذ

### 🔴 عاجل (Sprint 1 — أسبوع)
1. **اختزل الاستمارة من 83 → 20 سؤال** (تعديل [intake-sections.ts](../../console/app/(dashboard)/dashboard/seo/helpers/intake-sections.ts))
2. **اجعل s4-s6-s8-s9 (الفنية) قسم admin** يعبّئه فريق modonty عبر site audit
3. **انقل s11-المنافسين إلى تبويب competitors** الموجود (لا تكرّر)
4. **احذف s12-فريق + s13-تجارب سابقة** (admin context مو content)

### 🟡 متوسط المدى (Sprint 2-3 — شهر)
5. **بناء Auto-Audit Engine** يستدعي GA + GSC + PageSpeed APIs
6. **تكامل Google Places API** لجلب NAP والتقييمات
7. **Wayback Machine integration** لتاريخ الدومين

### 🔵 بعيد المدى (Quarter)
8. **AI Content Brief Generator** — يحوّل 20 إجابة + Auto-Audit data → brief جاهز للكاتب/AI
9. **Continuous monitoring** — تجدد البيانات تلقائياً شهرياً

---

## 7. مقارنة مع المعايير الصناعية

| المرجع | عدد الأسئلة الموصى به | الفرق مع الحالي |
|---|---|---|
| Content Snare | 10 must-ask | +73 |
| Cornerstone Content | 13 essential | +70 |
| Pathfinder SEO | 15 questions | +68 |
| 99signals | 20 questions | +63 |
| SE Ranking | 20 things | +63 |
| Search Engine Journal | 27 questions | +56 |
| Stan Ventures | 30 must-ask | +53 |
| File Request Pro | 40+ questions | +43 |
| Surfer SEO | 71 questions | +12 |

**الموقع الحالي (83 Q) = ضعف Surfer SEO الذي هو الأعلى في الصناعة** بدون أتمتة.

---

## 8. قبل-بعد للأسئلة الذهبية

### مثال لإعادة الصياغة (إجابة العميل تخدم AI مباشرة):

**❌ الحالي (q11):**
> ما المشكلة الرئيسية التي يعاني منها عميلك وتحلها أنت؟
> *Help: المشكلة التي تحلها هي أساس كل محتوى نكتبه...*

**✅ المقترح:**
> **في جملة واحدة:** ما المشكلة الكبيرة التي يأتيك عميلك ليحلها معك؟
> *Help: مثال: "صاحب المطعم اللي يعاني من قلة الزبائن في يوم الإثنين"*
> [textarea — حد أقصى 200 حرف]

التركيز:
- جملة قصيرة محددة
- مثال ملموس
- حد أقصى للحروف يمنع الإطالة
- AI يحصل على signal واضح

---

## 9. مخاطر الإبقاء على الوضع الحالي

1. **معدل تخلّي مرتفع** — العملاء يبدؤون ولا يكملون
2. **بيانات منخفضة الجودة** — العميل يخمّن في الأسئلة التقنية
3. **هدر وقت الفريق** — 30+ دقيقة لتفسير إجابة كل عميل
4. **ضعف جودة المحتوى** — AI يبني على إجابات متخمّنة
5. **تجربة سيئة** — العميل يحس "modonty طلبت كل شي ولم أحس بالتقدم"
6. **تكلفة فرص ضائعة** — العملاء الذين يرون الاستمارة ولا يكملونها = خسارة

---

## 10. مصادر الصناعة (8 مرجع)

- [SEO Questionnaire: 10 Must-Ask Questions — Content Snare](https://contentsnare.com/seo-questionnaire/)
- [13 Essential SEO Questions — Cornerstone Content](https://cornerstonecontent.com/seo-questionnaire/)
- [SEO Client Onboarding 20 Questions — SE Ranking](https://seranking.com/blog/seo-client-onboarding-questionnaire/)
- [27 Questions for New SEO Clients — Search Engine Journal](https://www.searchenginejournal.com/questions-new-seo-clients/409203/)
- [SEO Client Questionnaire Template (40+) — File Request Pro](https://filerequestpro.com/articles/seo-client-questionnaire-template)
- [71 Questions For SEO Client Questionnaire — Surfer SEO](https://surferseo.com/blog/seo-client-questionnaire/)
- [SEO Client Questionnaire 30 Questions — Stan Ventures](https://www.stanventures.com/blog/seo-questionnaire/)
- [20 Questions to Ask Potential SEO Clients — 99signals](https://www.99signals.com/questions-potential-seo-clients/)

---

## 11. ملاحظات للنقاش

- ❓ هل نحتاج فعلاً قسم s8-المتجر الإلكتروني، أم نطرح "هل عندك متجر؟" ثم نطلب رابط الموقع فقط ونعتمد على crawler؟
- ❓ بعض الأسئلة في s9-السمعة (q61, q62) قد تكون مفيدة لـ link building، لكن هل modonty تقدم خدمة link building؟ إن لا → احذفها.
- ❓ هل نضيف upload فيلد لـ Brand Guidelines PDF؟ هذا أفضل بكثير من 10 أسئلة عن brand voice.
- ❓ هل نسمح للعميل برفع فيديو/صوت لشرح القصة بدلاً من الكتابة؟ كثير من أصحاب الأعمال أسهل عليهم الكلام.

---

**حالة الملف:** جاهز للمقارنة مع تقارير أخرى تأتي من مصادر/Agents مختلفة.
