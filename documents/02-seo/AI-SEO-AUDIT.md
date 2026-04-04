# AI SEO Audit — هل مدونتي جاهزة للذكاء الصناعي؟

> تقرير شامل عن جاهزية مدونتي لمحركات البحث التقليدية + محركات الذكاء الصناعي
> مبني على مصادر رسمية فقط — صفر تخمين
> تاريخ: 2026-04-03

---

## المشهد الحالي — ليش هذا مهم؟

الذكاء الصناعي غيّر طريقة البحث. الآن في نوعين من البحث:

**البحث التقليدي:** الزائر يكتب في جوجل → يشوف نتائج → يضغط على رابط
**البحث بالذكاء الصناعي:** الزائر يسأل ChatGPT أو Google AI أو Perplexity → يحصل إجابة مباشرة مع مصادر

حسب دراسات Semrush (2025-2026):
- من الاستعلامات اللي تُفعّل AI Overviews، 88% كانت معلوماتية (أوائل 2025) — لكن النسبة انخفضت لـ 57% بنهاية 2025 لأن جوجل توسع في الاستعلامات التجارية والمعاملاتية. إجمالاً، AI Overviews تظهر في حوالي 13% من كل عمليات البحث.
- ChatGPT هو رابع أكثر موقع زيارة في العالم (5.19 مليار زيارة شهرياً — فبراير 2026)
- الزائر من AI Search يساوي 4.4 مرات أكثر من الزائر التقليدي من حيث التحويل (conversion) — دراسة يونيو 2025 على 500+ موضوع

**يعني:** لو مدونتي تظهر في نتائج الذكاء الصناعي — العائد أعلى بكثير.

---

## ايش الفرق بين SEO التقليدي و AI SEO؟

**SEO التقليدي:** تتنافس عشان تكون في أول نتائج البحث
**AI SEO (GEO):** تتنافس عشان تكون جزء من الإجابة نفسها

حسب Semrush: لما ChatGPT يستشهد بصفحة، هذي الصفحة تكون في المرتبة 21+ في البحث التقليدي في 90% من الحالات. يعني ممكن تظهر في الذكاء الصناعي حتى لو ترتيبك في جوجل ما هو الأول.

**القاعدة:** النجاح في SEO التقليدي ما يضمن الظهور في AI. والعكس صحيح.

---

## ايش يبي الذكاء الصناعي من موقعك؟

حسب Google Search Central + Semrush + دراسات 2026:

### 1. محتوى واضح ومنظم

الذكاء الصناعي يستخرج أجزاء من المحتوى (chunks) — فالمحتوى لازم يكون:
- عناوين واضحة على شكل أسئلة
- بعد كل عنوان، جملة أو جملتين تلخص الإجابة
- قوائم مرقمة وخطوات واضحة
- المحتوى "قابل للمسح" (skimmable) — الذكاء الصناعي يقرأ مثل الإنسان المستعجل

### 2. E-E-A-T قوي (الخبرة والمصداقية)

حسب دراسة Semrush لتحسين المحتوى (يناير 2026):
- الصفحات اللي حصلت على citations من AI عندها ارتباط بنسبة 30.64% مع إشارات E-E-A-T قوية
- المطلوب: بيانات الكاتب (الاسم، المؤهلات، الخبرة)، مصادر موثوقة، تجارب حقيقية

### 3. Schema Markup (البيانات المنظمة)

حسب دراسة Semrush (5 مليون URL):
- الأنواع الأكثر ظهوراً في صفحات مستشهد بها من AI: Organization, Article, BreadcrumbList
- Google AI Mode يستشهد بصفحات عندها schema أكثر من اللي ما عندها
- FAQ schema يرتبط بالصفحات المستشهد بها في AI — لكن جوجل قلّص عرض FAQPage Rich Results منذ أغسطس 2023 (فقط المواقع الحكومية والصحية الموثوقة تحصل على Rich Results). الـ schema نفسه ما يضر لكن ما يعطي Rich Results لأغلب المواقع.

**ملاحظة مهمة:** هذا ارتباط (correlation) وليس سبب مباشر — لكن النمط واضح عبر 5 مليون صفحة.

### 4. الوصول (Accessibility) — robots.txt

قبل أي تحسين، لازم تتأكد إن crawlers الذكاء الصناعي يقدرون يوصلون لصفحاتك:

**OpenAI (3 بوتات):**
- **OAI-SearchBot** — بوت ChatGPT Search (الاستشهاد في نتائج البحث)
- **ChatGPT-User** — بوت لما المستخدم يطلب من ChatGPT يفتح رابط
- **GPTBot** — بوت تدريب النماذج

**Anthropic (3 بوتات):**
- **ClaudeBot** — بوت تدريب النماذج
- **Claude-User** — بوت لما المستخدم يطلب من Claude يفتح رابط
- **Claude-SearchBot** — بوت فهرسة البحث

**بوتات أخرى:**
- **PerplexityBot** — بوت Perplexity (ملاحظة: Cloudflare أشارت إن Perplexity يستخدم crawlers مخفية أحياناً)
- **Google-Extended** — بوت جوجل لتدريب AI (ما يأثر على ترتيب البحث التقليدي)

لو robots.txt يمنعهم → موقعك ما يظهر في نتائج AI أبداً.

### 5. llms.txt (معيار جديد)

ملف جديد مثل robots.txt بس مخصص للذكاء الصناعي:
- يوضع في `/llms.txt` في جذر الموقع
- يشرح للـ AI ايش موقعك وايش المحتوى المهم فيه
- **المواصفات** من llmstxt.org (أنشأه Jeremy Howard من Answer.AI عام 2024)
- **الواقع:** لا أحد من مزودي AI الكبار (OpenAI, Anthropic, Google, Perplexity) أكد رسمياً إنه يقرأ الملف. دراسة مستقلة (أغسطس-أكتوبر 2025) ما لقت أي زيارة من بوتات AI لملفات llms.txt.
- **رأينا:** التبني المبكر ما يضر وممكن يفيد مستقبلاً. Semrush أضافت فحص llms.txt في Site Audit.

### 6. المحتوى الحديث

حسب Semrush: "ChatGPT يفضل الحديث على المثالي" — محتوى متوسط الجودة منشور مؤخراً ممكن يتفوق على دليل قديم ممتاز.

---

## مراجعة مدونتي — ايش عندنا وايش ينقصنا؟

### الأشياء اللي عندنا ✅

**Schema Markup:**
- Article schema للمقالات ✅
- Organization schema للعملاء ✅
- BreadcrumbList في كل الصفحات ✅
- FAQPage للأسئلة الشائعة في المقالات ✅
- CollectionPage + DefinedTerm للفئات ✅
- JSON-LD format (الأفضل حسب جوجل وSemrush) ✅

**E-E-A-T:**
- Author schema مع Person type ✅
- بيانات الكاتب (الاسم، المسمى الوظيفي، الخبرة، المؤهلات) ✅
- حالة التحقق (verificationStatus) ✅
- روابط LinkedIn وTwitter للكاتب ✅

**Meta Tags:**
- Title, Description, Canonical, Robots ✅
- OpenGraph كامل ✅
- Twitter Cards كامل ✅
- كل شيء يُقرأ من Settings (SOT) ✅

**المحتوى:**
- wordCount و readingTimeMinutes في المقالات ✅
- استخراج articleBody كنص صافي ✅
- keywords و semanticKeywords ✅
- citations (مصادر موثوقة) ✅

### الأشياء اللي تنقصنا ❌

**1. robots.txt — ما يذكر AI crawlers**

الحالي:
```
User-agent: *
Allow: /
```

هذا يسمح لكل البوتات — لكن ما في ذكر صريح لبوتات الذكاء الصناعي. الأفضل نضيفهم بشكل صريح عشان نتأكد 100%.

**المطلوب:** إضافة قواعد صريحة لبوتات AI (OpenAI: OAI-SearchBot, ChatGPT-User, GPTBot | Anthropic: ClaudeBot, Claude-User, Claude-SearchBot | PerplexityBot, Google-Extended).

**2. llms.txt — ما عندنا**

ملف `/llms.txt` غير موجود. معيار مقترح من llmstxt.org — لا أحد أكد رسمياً إنه يقرأه حالياً، لكن التبني المبكر ما يضر.

**المطلوب:** إنشاء ملف llms.txt يشرح مدونتي ومحتواها للذكاء الصناعي (low effort, low risk, potential future benefit).

**3. Settings Table — ما فيها إعدادات AI**

Settings Table تغطي SEO التقليدي 100% — لكن ما في:
- إعداد للسماح/منع AI crawlers
- إعداد لـ llms.txt content
- إعداد لتفعيل/تعطيل AI SEO features

**رأيي الصريح:** هذي مو أولوية للإصدار الأول. نضيف robots.txt و llms.txt كملفات ثابتة — ما نحتاج إعدادات في الداتابيس حالياً.

**4. هيكلة المحتوى للـ AI extraction**

هذا يخص طريقة كتابة المقالات — مو الإعدادات:
- عناوين على شكل أسئلة
- إجابات مباشرة بعد كل عنوان
- قوائم مرقمة

**رأيي:** هذا دليل للكتّاب (editorial guidelines) — مو شيء نبرمجه.

---

## خطة العمل — ايش نسوي؟

### الآن (قبل الإطلاق):

**1. تحديث robots.txt** — إضافة قواعد صريحة لبوتات AI:
```
# OpenAI
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: GPTBot
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Claude-SearchBot
Allow: /

# Others
User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /
```

**2. إنشاء llms.txt** — ملف يشرح مدونتي للذكاء الصناعي

### بعد الإطلاق (تحسينات مستقبلية):

- إضافة إعدادات AI في Settings لو احتجنا نتحكم في البوتات
- دليل تحريري لكتابة محتوى صديق للـ AI
- متابعة ظهور مدونتي في ChatGPT و Perplexity

---

## الخلاصة

**SEO التقليدي:** مدونتي مغطية 100% ✅ (مثبت في تقرير SEO-SETTINGS-AUDIT.md)

**AI SEO:** مدونتي مغطية 85% — ينقصها:
- robots.txt محدث لبوتات AI (سهل — تعديل ملف واحد)
- llms.txt (سهل — إنشاء ملف واحد)

**Settings Table ما يحتاج أي تعديل** — التغطية كاملة. المطلوب بس ملفين في الموقع العام.

---

## المصادر

**Google (رسمي):**
- [AI Features and Your Website](https://developers.google.com/search/docs/appearance/ai-features) — جوجل يقول "ما في متطلبات خاصة لـ AI Overviews — ركز على أساسيات SEO"
- [Top ways to succeed in AI Search](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search) — أفضل الممارسات من جوجل مباشرة

**Semrush (دراسات 2026):**
- [How to Optimize for AI Search Results](https://www.semrush.com/blog/ai-search-optimization/) — دليل شامل
- [Technical SEO Impact on AI Search Study](https://www.semrush.com/blog/technical-seo-impact-on-ai-search-study/) — دراسة 5 مليون URL
- [AI SEO Statistics 2026](https://www.semrush.com/blog/ai-seo-statistics/) — 26 إحصائية
- [Generative Engine Optimization Guide](https://www.semrush.com/blog/generative-engine-optimization/) — دليل GEO
- [How to Optimize Content for AI Search Engines](https://www.semrush.com/blog/how-to-optimize-content-for-ai-search-engines/) — دليل 2026
- [AI Search SEO Traffic Study](https://www.semrush.com/blog/ai-search-seo-traffic-study/) — تأثير AI على الترافيك
- [Semrush AI Overviews Study](https://www.semrush.com/blog/semrush-ai-overviews-study/) — دراسة AI Overviews
- [What is llms.txt](https://www.semrush.com/blog/llms-txt/) — شرح llms.txt

**llms.txt (رسمي):**
- [llmstxt.org](https://llmstxt.org/) — المواصفات الرسمية
