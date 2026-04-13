# AI SEO Strategy — مودونتي

> هذا الملف يوثق استراتيجية الظهور في محركات بحث الذكاء الاصطناعي (AEO).
> آخر تحديث: 2026-04-04

---

## 1. سياسة robots.txt — من يدخل ومن يُحظر

### المبدأ: اسمح لبوتات البحث، احظر بوتات التدريب

| البوت | الشركة | الغرض | السياسة | المصدر |
|-------|--------|-------|---------|--------|
| **OAI-SearchBot** | OpenAI | بحث ChatGPT | ✅ مسموح | [OpenAI Bots](https://developers.openai.com/api/docs/bots) |
| **PerplexityBot** | Perplexity | بحث Perplexity | ✅ مسموح | [Perplexity Docs](https://docs.perplexity.ai/guides/bots) |
| **Googlebot** | Google | بحث Google + AI Overviews | ✅ مسموح | [Google Crawlers](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) |
| **GPTBot** | OpenAI | تدريب نماذج GPT | ❌ محظور | [OpenAI Bots](https://developers.openai.com/api/docs/bots) |
| **Google-Extended** | Google | تدريب Gemini | ❌ محظور | [Google Crawlers](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers) |
| **CCBot** | Common Crawl | dataset تدريب مفتوح | ❌ محظور | |
| **ClaudeBot** | Anthropic | تدريب Claude | ❌ محظور | |
| **Bytespider** | ByteDance | تدريب | ❌ محظور | |

### ملاحظات مهمة
- **ChatGPT-User** — لا يحترم robots.txt (تصرف المستخدم). لا حاجة لحظره.
- **Perplexity-User** — نفس الشيء، لا يحترم robots.txt.
- **Google-Extended** — حظره لا يؤثر على AI Overviews! فقط يمنع تدريب Gemini.
- **حظر OAI-SearchBot = اختفاء من ChatGPT Search** — لذلك سمحنا له.

---

## 2. الملفات المنشورة

| الملف | الموقع | الغرض | المواصفات |
|-------|--------|-------|-----------|
| `llms.txt` | `/llms.txt` (public/) | وصف مختصر للموقع — يساعد LLMs على فهم الموقع عند الاستدلال | [llmstxt.org](https://llmstxt.org/) |
| `llms-full.txt` | `/llms-full.txt` (public/) | وثائق تفصيلية — كل أنواع المحتوى والـ schemas | Community pattern |
| `robots.txt` | `/robots.txt` (Next.js auto) | سياسة الزحف لكل بوت | [Google Robots](https://developers.google.com/search/docs/crawling-indexing/robots/intro) |
| `sitemap.xml` | `/sitemap.xml` (Next.js auto) | خريطة الموقع الديناميكية | [Google Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) |

---

## 3. Structured Data — اللي ينفع الـ AI

### المنفذ حالياً في مودونتي

| Schema Type | أين يُستخدم | فائدة AI |
|-------------|-------------|----------|
| **Article** + Person + Organization | صفحات المقالات | Google AI Overviews + Bing Copilot يقتبسون المقالات |
| **FAQPage** + Question/Answer | صفحة FAQ + مقالات فيها FAQ | يظهر مباشرة في إجابات AI كـ Q&A |
| **SpeakableSpecification** | FAQ | يساعد Google Assistant و Alexa |
| **Organization / LocalBusiness** | صفحات العملاء | يساعد في Knowledge Graph + Local SEO |
| **CollectionPage + ItemList** | صفحات القوائم | يساعد AI يفهم هيكل المحتوى |
| **BreadcrumbList** | كل الصفحات العامة | يساعد AI يفهم تنقل الموقع |
| **WebSite + SearchAction** | الصفحة الرئيسية | يساعد AI يعرف إن الموقع فيه بحث |
| **OpeningHoursSpecification** | عملاء LocalBusiness | Google يوصي فيه — recommended property |
| **GeoCoordinates** | عملاء فيهم عنوان | Local SEO + خريطة |
| **ContactPoint** | كل عميل | معلومات التواصل في Knowledge Graph |

### مصادر رسمية
- [Google Article Structured Data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google LocalBusiness Structured Data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google Organization Structured Data](https://developers.google.com/search/docs/appearance/structured-data/organization)
- [Google FAQ Structured Data](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
- [schema.org/SpeakableSpecification](https://schema.org/SpeakableSpecification)

---

## 4. Meta Tags المهمة لـ AI

| Meta Tag | القيمة | الفائدة |
|----------|--------|---------|
| `max-snippet: -1` | في googleBot config | يسمح لـ AI بقراءة المحتوى كامل بدون اقتطاع |
| `max-image-preview: large` | في googleBot config | يسمح بعرض الصور الكبيرة في AI Overviews |
| `robots: noindex` | صفحات المستخدمين + البحث + الاشتراك | يمنع فهرسة الصفحات الخاصة |

---

## 5. استراتيجية المحتوى لظهور AI

### بناءً على أبحاث رسمية:

1. **الإجابة أولاً** — أول 50-70 كلمة في المقال تجاوب على السؤال مباشرة
2. **فقرات مستقلة** — كل فقرة 40-60 كلمة تقدر تُقتبس لوحدها كإجابة كاملة
3. **بيانات وأرقام** — الحقائق المدعومة بأرقام تُقتبس أكثر من الكلام العام
4. **هيكل واضح** — H2, H3, قوائم نقطية، جداول — يسهل على AI استخراج الإجابات
5. **E-E-A-T** — كاتب معروف + خبرة واضحة + مصادر موثوقة
6. **تحديث مستمر** — المحتوى اللي ما يتحدث كل 3 شهور يخسر 3x اقتباسات AI
7. **بدون JavaScript** — 46% من زيارات ChatGPT Bot تكون في "reading mode" (HTML فقط)

### مصادر:
- [Google: Succeeding in AI Search](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)
- [Bing AI Performance Tools](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)
- [Frase.io AEO Guide](https://www.frase.io/blog/what-is-answer-engine-optimization-the-complete-guide-to-getting-cited-by-ai)

---

## 6. التحسينات المستقبلية

### أولوية عالية
- [ ] **Bing Webmaster Tools** — ربط الموقع + تفعيل IndexNow للاكتشاف السريع
- [ ] **Google Search Console** — مراقبة AI Overviews performance
- [ ] **تحديث المحتوى** — جدول ربع سنوي لتحديث المقالات القديمة

### أولوية متوسطة
- [ ] **about + mentions في Article JSON-LD** — ربط المحتوى بـ Knowledge Graph (Google لا يستخدمهم حالياً لـ rich results لكن ممكن يتغير)
- [ ] **HowTo schema** — للمقالات التعليمية خطوة بخطوة
- [ ] **Reddit/YouTube presence** — AI engines تقتبس هالمنصات كثير

### اختياري
- [ ] `.well-known/ai-plugin.json` — ChatGPT plugin integration
- [ ] **IndexNow API** — إشعار فوري لـ Bing عند نشر محتوى جديد

---

## 7. أدوات المراقبة

| الأداة | الرابط | الفائدة |
|--------|--------|---------|
| Google Search Console | search.google.com/search-console | مراقبة AI Overviews + الأداء |
| Bing Webmaster Tools | bing.com/webmasters | AI Performance report — يعرض اقتباسات Copilot |
| Rich Results Test | search.google.com/test/rich-results | فحص structured data |
| Schema Markup Validator | validator.schema.org | فحص JSON-LD |

---

## 8. الإحصائيات المهمة

- زوار AI search يحولون **4.4x** أكثر من الزوار العاديين
- يقضون **68%** وقت أطول في الموقع
- الظهور في AI Overviews يزيد النقرات **35%** مقارنة بعدم الظهور
- **46%** من زيارات ChatGPT Bot تكون في reading mode (HTML فقط بدون CSS/JS)

مصدر: [SeriesX Marketing - AI Search Optimization](https://www.seriesxmarketing.com/blog/ai-search-optimization/)
