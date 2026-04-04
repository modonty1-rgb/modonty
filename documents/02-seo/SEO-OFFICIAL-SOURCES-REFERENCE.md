# مرجع المصادر الرسمية — SEO

**الغرض من هذا الملف:** أن تقرأ كإنسان وتتخذ قراراً مبنياً على **ما تقوله المواقع الرسمية للمطورين**، مع روابط تفتحها عند الحاجة.

**ما ليس هنا:** أرقام تسويق أو نِسَب من Semrush وغيرها — تلك في ملفات التدقيق الأخرى مع ذكر المصدر والتاريخ.

**آخر مراجعة للهيكل:** 2026-04-03

---

## ماذا تعتبر «مصدراً رسمياً» في هذا الملف؟

- **Google Search Central** و**مدونة مطوري البحث** (developers.google.com/search).
- **مواصفات تقنية** مفتوحة: Open Graph (ogp.me)، Schema.org، JSON-LD.org.
- **Twitter / X Developer** لبطاقات المشاركة.
- **Next.js** لأن المشروع يبنى عليه — التوثيق هنا لربط المعايير بالتنفيذ.
- **llmstxt.org** مذكور كـ **مواصفة مقترحة** (مجتمعية)، وليست سياسة Google.

إذا احتجت رقماً أو «دراسة سوق»، ارجع لملفات الـ audit الأخرى وصنّفها صراحة كـ **بحث صناعة** وليس كقانون من Google.

---

## 1. Google Search Central — نقطة الانطلاق

ابدأ من بوابة التوثيق الرئيسية لكل ما يخص الظهور في Google:

https://developers.google.com/search/docs

**محتوى مفيد للجودة العامة:**

https://developers.google.com/search/docs/fundamentals/creating-helpful-content

**البيانات المنظمة (Structured Data):**

- مقدمة كيف تعمل مع Google:

  https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data

- معرض أنواع النتائج التي لها دليل تنفيذ في Google (Search Gallery):

  https://developers.google.com/search/docs/appearance/structured-data/search-gallery

- سياسات الجودة العامة للبيانات المنظمة:

  https://developers.google.com/search/docs/appearance/structured-data/sd-policies

**أداة التحقق أثناء التطوير:**

https://search.google.com/test/rich-results

**ماذا تستفيد قراءةً سريعة من المقدمة الرسمية؟**

Google يقرأ البيانات المنظمة ليفهم الصفحة. المفردات غالباً من schema.org، لكن **ما يُعرَض في Google Search** يُحدَّد بدليل Google لكل نوع، وليس بكل ما يظهر في schema.org. الصيغ المدعومة تشمل JSON-LD وMicrodata وRDFa؛ Google يوصي عادةً بـ **JSON-LD** لسهولة الصيانة وتقليل الخلط مع HTML.

**قرار عملي:** عند التنفيذ، اربط نوع المحتوى (مقال، منتج، خبز… إلخ) بصفحة **Search Gallery** المناسبة، وليس بأي نوع عشوائي من schema.org.

---

## 2. الروابط المعيارية (Canonical)

**توحيد النسخ المكررة واستخدام `rel="canonical"` وطرق أخرى:**

https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

**كيف تختار Google الصفحة المعيارية (الآلية العامة):**

https://developers.google.com/search/docs/crawling-indexing/canonicalization

**ماذا يهمك قرارياً؟**

قوة الإشارات من جهة Google تُرتَّب تقريباً هكذا: **إعادة توجيه دائمة (301)** أقوى من **`rel="canonical"`** (أو رأس HTTP مكافئ)، و**الإدراج في sitemap** إشارة أضعف. لا تعتمد على **robots.txt** لفرض canonical — قد تُفهرَس عناوين محظورة من الزحف بلا محتوى كافٍ. عند استخدام **hreflang**، اربط canonical بلغة منطقية أو أفضل بديل. يُفضَّل **URL مطلق** في عنصر canonical.

---

## 3. وسم robots و X-Robots-Tag

**الصفحة المرجعية الكاملة (قائمة القواعد و`data-nosnippet`):**

https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag

**ماذا يهمك قرارياً؟**

القواعد لا تُطبَّق إن كان الزاحف **لا يستطيع** الوصول للصفحة بطريقة يكتشف بها الوسوم (مثلاً حظر زحف يمنع رؤية `meta`). القائمة الكاملة للقيم المدعومة اليوم (مثل `noindex`, `nosnippet`, `max-snippet`, …) موجودة في **نفس الصفحة** — عند التغيير في الإنتاج ارجع للجدول الرسمي هناك وليس لنسخة قديمة من المستودع. Google يذكر أيضاً أن قاعدة **`nositelinkssearchbox`** لم تعد مستخدمة لأن ميزة صندوق البحث في الروابط لم تعد كما كانت.

---

## 4. النسخ بلغات متعددة و hreflang

**الدليل الرسمي:**

https://developers.google.com/search/docs/specialty/international/localized-versions

**ماذا يهمك قرارياً؟**

استخدم **ISO 639-1** للغة، ويمكن إضافة **ISO 3166-1 alpha-2** للمنطقة عند الحاجة (مثل `ar-SA`). الإشارات بين النسخ يجب أن تكون **متبادلة** حيث ينطبق، وكل نسخة يجب أن **تشير لنفسها** (self-referencing) ضمن مجموعة صحيحة.

---

## 5. ملفات Sitemap

**نظرة عامة:**

https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

**بناء الملف:**

https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

**ماذا يهمك قرارياً؟**

الـ sitemap يقترح للـ Google الصفحات المهمة؛ Google ما زال يقرر الفهرسة والتكرار. يُستخدم مع canonical وروابط داخلية سليمة، لا كبديل عنهما.

---

## 6. الذكاء الاصطناعي ونتائج البحث (من جهة Google)

**ميزات AI وعلاقتها بموقعك:**

https://developers.google.com/search/docs/appearance/ai-features

**مدونة Google (2025) عن النجاح في AI Search:**

https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search

**ماذا يهمك قرارياً؟**

هذه الصفحات تعطي **مبادئ** (محتوى مفيد، شفافية، أساسيات SEO)؛ لا تتوقع منها أرقاماً تسويقية — تلك ليست دورها.

---

## 7. Open Graph — مشاركة الرابط في الشبكات الاجتماعية

**المواصفة الأصلية:**

https://ogp.me/

**ماذا يهمك قرارياً؟**

المواصفة تفرض أربع خصائص أساسية لتحويل الصفحة إلى كائن في الرسم البياني: `og:title`, `og:type`, `og:image`, `og:url`. بعدها توجد خصائص موصى بها مثل `og:description`, `og:site_name`, `og:locale`، وخصائص فرعية للصورة بما فيها `og:image:alt`. هذا مستقل عن Google لكنه يؤثر على معاينة الرابط في منصات تستخدم OGP.

---

## 8. Twitter / X — بطاقات المشاركة (Cards)

**نظرة عامة:**

https://developer.x.com/en/docs/twitter-for-websites/cards/overview/overview

**بدء الاستخدام وعلامات meta:**

https://developer.x.com/en/docs/twitter-for-websites/cards/guides/getting-started

**ماذا يهمك قرارياً؟**

`twitter:card` مطلوب لتحديد نوع البطاقة؛ باقي الحقول تُفصَّل في الدليل حسب النوع. المنصة قد تستخدم Open Graph كاحتياط — راجع الدليل الحالي عند التنفيذ.

---

## 9. Schema.org و JSON-LD

**مفردات الأنواع والخصائص:**

https://schema.org/

**دليل المبتدئين:**

https://schema.org/docs/gs.html

**موقع تنسيق JSON-LD:**

https://json-ld.org/

**ماذا يهمك قرارياً؟**

schema.org واسع. Google يصرّح أن **سلوك النتائج في Google** يُستمد من **Google Search Central** لكل ميزة، وليس من كل ما هو صالح في schema.org. JSON-LD هو التنسيق الذي توصي Google غالباً به عند التمكن.

---

## 10. ملف llms.txt

**المواصفة المقترحة:**

https://llmstxt.org/

**ماذا يهمك قرارياً؟**

هذا **معيار مجتمعي** لملف اختياري في جذر الموقع. **ليس** بديلاً عن سياسات Google، وليس ضماناً أن كل مزوّد نماذج يقرأ الملف. قرارك: هل تريد توثيقاً شفافاً لما تسمح به للوكلاء — مع علم أن الفائدة طويلة المدى غير مضمونة.

---

## 11. وكلاء الزحف من مزوّدي النماذج (ليسوا Google فقط)

**OpenAI — GPTBot:**

https://openai.com/gptbot

**Google — قائمة الزواحف الشائعة (تشمل Google-Extended وشرح token في robots.txt):**

https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers

**Google — مقدمة robots.txt:**

https://developers.google.com/search/docs/crawling-indexing/robots/introducing-robots-txt

**ماذا يهمك قرارياً؟**

أسماء مثل `ClaudeBot` أو `OAI-SearchBot` تتغيّر أو تُفصَّل في **وثائق كل شركة** — عند كتابة قواعد لكل `User-agent`، ارجع لمصدر ذلك المزوّد في يوم التنفيذ. صفحة Google عن **Google-Extended** توضح أنه **لا يُستخدم كإشارة ترتيب في بحث Google** ويخصّ سياق منتجات Google المذكورة هناك.

---

## 12. Next.js (كما يستخدمه المشروع)

**Metadata API:**

https://nextjs.org/docs/app/building-your-application/optimizing/metadata

**ملف robots.ts:**

https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots

**ماذا يهمك قرارياً؟**

هذا يربط **ما يولّده الإطار** (عناوين، robots، …) بما تقرره من معايير في الأقسام أعلاه. أي تعارض يُحسم لصالح **سلوك Google + مواصفات المنصة** بعد قراءة الرابطين.

---

## 13. كيف يتكامل هذا الملف مع باقي التوثيق عندك

- **SEO-SETTINGS-AUDIT.md** و**AI-SEO-AUDIT.md:** اترك فيها التحليل والأرقام، لكن صنّف كل فقرة: **رسمي (رابط من هذا الملف)** مقابل **صناعة/دراسة**.
- **SEO-CACHE-SYSTEM.md:** يصف **تصميم منتجك** (متى يُولَّد الـ cache، أين يُخزَّن). مطابقته للمعايير تتم بمقارنة التنفيذ مع الأقسام أعلاه، وليس العكس.

---

## 14. تنبيه أخير قبل القرار في الإنتاج

المواقع الرسمية تُحدَّث. قبل تغيير سلوك مهم (فهرسة، canonical، بيانات منظمة)، افتح **الرابط نفسه** وتأكد من فقرة «Best practices» أو الجدول الحالي. هذا الملف يوجّهك؛ لا يستبدل قراءة الصفحة في تاريخ التنفيذ.
