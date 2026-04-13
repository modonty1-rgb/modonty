# SEO Settings Audit — مراجعة الإعدادات مقابل المصادر الرسمية

> هذا التقرير يثبت إن إعدادات الـ SEO في مدونتي مبنية على معلومات صحيحة 100% من المصادر الرسمية.
> تاريخ المراجعة: 2026-04-03

---

## المصادر اللي رجعنا لها

- Google Search Central — الوثائق الرسمية لمحرك البحث
- Schema.org — المواصفات الرسمية للبيانات المنظمة
- Open Graph Protocol (ogp.me) — المواصفات الرسمية لـ Facebook/LinkedIn
- Twitter/X Developer — المواصفات الرسمية لكروت تويتر
- Semrush — أكبر أداة SEO في العالم (بيانات محدثة 2026)
- Next.js — الوثائق الرسمية لـ generateMetadata
- Ahrefs — دراسة على 953,276 صفحة عن العناوين

---

## عنوان الصفحة (Title Tag)

**ايش يقولون:**
- جوجل: ما في حد رسمي بالحروف — يقيس بالبكسل (600px). عملياً 50-60 حرف آمن.
- Semrush: أقل من 55 حرف هو الأفضل.
- Ahrefs: جوجل يعيد كتابة العنوان 61.6% من الوقت — خصوصاً العناوين القصيرة جداً أو الطويلة جداً.

**ايش عندنا:**
- `seoTitleMin: 30` — الحد الأدنى
- `seoTitleMax: 60` — الحد الأقصى
- `seoTitleRestrict: false` — تحذير بس ما يمنع

**الحكم:** ممتاز ✅ — 30-60 يغطي كل التوصيات.

---

## وصف الصفحة (Meta Description)

**ايش يقولون:**
- جوجل: ما في حد رسمي. يقول "اكتب وصف مختصر ودقيق". عملياً 150-160 حرف هو المعيار.
- Semrush (2026): 120-125 حرف هو الـ safe zone — يظهر كامل على أغلب الأجهزة.

**ايش عندنا:**
- `seoDescriptionMin: 120` — الحد الأدنى
- `seoDescriptionMax: 160` — الحد الأقصى
- `seoDescriptionRestrict: false` — تحذير بس ما يمنع

**الحكم:** ممتاز ✅ — الحد الأدنى 120 يتوافق مع Semrush. الأقصى 160 يتوافق مع جوجل.

---

## أوامر الروبوتات (Robots Meta Tag)

**ايش يقولون:**
- جوجل يدعم: `noindex`, `nofollow`, `nosnippet`, `max-snippet:-1`, `max-image-preview:large`, `max-video-preview:-1`, `notranslate`, `nopagereadaloud`
- الافتراضي لو ما حطيت شيء: `index, follow` (جوجل يفهرس ويتبع الروابط)

**ايش عندنا:**
- `defaultMetaRobots` — القيمة الافتراضية (مثل "index, follow")
- `defaultGooglebot` — قيمة خاصة لجوجل بوت
- `defaultNotranslate` — يمنع Chrome من اقتراح ترجمة (مهم جداً للمحتوى العربي)

**الحكم:** ممتاز ✅ — مغطي كل اللي جوجل يدعمه.

---

## الرابط الرسمي (Canonical URL)

**ايش يقولون:**
- جوجل: استخدم `rel="canonical"` — أقوى إشارة (hint) بعد الـ redirect. لا تحط أكثر من canonical واحد لكل صفحة. (ملاحظة: canonical هو إشارة وليس أمر — جوجل ممكن يتجاهلها لو إشارات ثانية تتعارض معها.)
- Semrush: لا تخلط canonical مع hreflang بشكل خاطئ. كل صفحة لازم canonical يشير لنفسها.

**ايش عندنا:**
- `canonicalUrl` في كل entity — لو الأدمن حدده نستخدمه، لو لا نبنيه تلقائي من `siteUrl + type + slug`
- Canonical دائماً يشير لنفس الصفحة (ما يشير لصفحة ثانية)

**الحكم:** ممتاز ✅

---

## OpenGraph (Facebook, LinkedIn)

**ايش يقولون:**
- المواصفات الرسمية (ogp.me) — 4 حقول مطلوبة: `og:title`, `og:type`, `og:image`, `og:url`
- موصى بها: `og:description`, `og:site_name`, `og:locale`, `og:image:alt`, `og:image:width`, `og:image:height`
- Semrush: `og:title`, `og:image`, `og:url` هي الأساسية

**ايش عندنا:**
- `og:title` — من seoTitle أو اسم العنصر ✅
- `og:type` — من `defaultOgType` في Settings ✅
- `og:image` — من socialImage ✅
- `og:url` — من canonical ✅
- `og:description` — من seoDescription ✅
- `og:site_name` — من `siteName` في Settings ✅
- `og:locale` — من `defaultOgLocale` في Settings ✅
- `og:determiner` — من `defaultOgDeterminer` في Settings ✅
- `og:image:width` — من `defaultOgImageWidth` في Settings ✅
- `og:image:height` — من `defaultOgImageHeight` في Settings ✅
- `og:image:type` — من `defaultOgImageType` في Settings ✅
- `og:image:alt` — من `socialImageAlt` ✅

**الحكم:** تغطية كاملة 100% ✅ — كل الحقول المطلوبة والموصى بها موجودة.

---

## Twitter/X Cards

**ايش يقولون:**
- المواصفات الرسمية (developer.x.com) — Summary Large Image يحتاج: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
- اختياري: `twitter:site`, `twitter:creator`

**ايش عندنا:**
- `twitter:card` — من `defaultTwitterCard` في Settings ✅
- `twitter:title` — من seoTitle ✅
- `twitter:description` — من seoDescription ✅
- `twitter:image` — من socialImage ✅
- `twitter:site` — من `twitterSite` في Settings ✅
- `twitter:creator` — من `twitterCreator` في Settings ✅
- `twitter:site:id` — من `twitterSiteId` في Settings ✅ (إضافي)
- `twitter:creator:id` — من `twitterCreatorId` في Settings ✅ (إضافي)

حدود الطول:
- `twitterTitleMax: 70` ✅
- `twitterDescriptionMax: 200` ✅

**ملاحظة:** Twitter/X يقرأ OpenGraph كـ fallback — لو عندك og:title و og:description، تويتر يستخدمهم تلقائي. الحقل الوحيد الفريد المطلوب هو `twitter:card`. لكن وجود الحقول كلها يعطي تحكم أدق.

**الحكم:** تغطية كاملة 100% ✅ — حتى الحقول الإضافية اللي ما كل أحد يحطها.

---

## Structured Data / JSON-LD

**ايش يقولون:**
- جوجل: JSON-LD هو الأفضل — الأسهل في القراءة والتحديث. يدعم أنواع كثيرة (Article, Organization, BreadcrumbList, FAQPage, وغيرها).
- Semrush: JSON-LD هو الأكثر دعماً وجوجل يوصي فيه. 57% من الشركات الكبيرة ما عندها structured data — فرصة للتميز.
- Schema.org: CollectionPage (صفحة تجميعية) و DefinedTerm (مصطلح معرف) أنواع صالحة.

**ايش عندنا:**
- JSON-LD format ✅
- BreadcrumbList — جوجل يدعمها كـ Rich Result ✅
- CollectionPage — نوع Schema.org صالح للفئات والتاقات ✅
- DefinedTerm — نوع Schema.org صالح لوصف المصطلحات ✅
- Organization — جوجل يدعمها رسمياً للعملاء ✅
- Article — جوجل يدعمها رسمياً للمقالات ✅
- FAQPage — جوجل يدعمها للأسئلة الشائعة ✅ (تحذير: منذ أغسطس 2023 جوجل قلّص عرض FAQPage Rich Results — فقط المواقع الحكومية والصحية الموثوقة تحصل على Rich Results. الـ schema نفسه ما يضر لكن ما يعطي Rich Results لأغلب المواقع.)

**الحكم:** ممتاز ✅

**ملاحظة مهمة عن BreadcrumbList:**
- الحقول المطلوبة حسب جوجل: `position`, `name`, `item` (ما عدا آخر عنصر ما يحتاج `item`)
- عندنا: نحط الثلاث في كل عنصر ✅

---

## hreflang (اللغة والمنطقة)

**ايش يقولون:**
- جوجل: استخدم ISO 639-1 للغة + ISO 3166-1 Alpha 2 للمنطقة. العربية في السعودية = `ar-SA`.
- Semrush: كل صفحة لازم تعلن عن نفسها (self-referencing hreflang). لا تخلط canonical مع hreflang.

**ايش عندنا:**
- `inLanguage` — لغة المحتوى (مثل "ar") ✅
- `defaultHreflang` — القيمة الافتراضية ✅
- `defaultAlternateLanguages` — مصفوفة اللغات البديلة ✅
- `defaultOgLocale: ar_SA` — اللغة الإقليمية ✅

**الحكم:** ممتاز ✅

---

## Sitelinks Search Box

**ايش يقولون:**
- جوجل أعلن في أكتوبر 2024: شال Sitelinks Search Box من نتائج البحث نهائياً.
- جوجل يقول: "ما تحتاج تشيل الكود — ما يسبب مشاكل."

**ايش عندنا:**
- `orgSearchUrlTemplate` في Settings — وعندنا SearchAction في Client JSON-LD

**الحكم:** ما يضر بس ما يفيد ⚠️ — ممكن نشيله مستقبلاً من JSON-LD الجديد.

---

## Sitemap

**ايش عندنا:**
- `defaultSitemapPriority` — أولوية الصفحات ✅
- `defaultSitemapChangeFreq` — تكرار التحديث ✅
- `articleDefaultSitemapPriority` — أولوية المقالات ✅
- `articleDefaultSitemapChangeFreq` — تكرار تحديث المقالات ✅

**الحكم:** مغطي ✅

---

## وسائل التواصل الاجتماعي (sameAs)

**ايش عندنا:**
- `facebookUrl`, `twitterUrl`, `linkedInUrl`, `instagramUrl`, `youtubeUrl`, `tiktokUrl`, `pinterestUrl`, `snapchatUrl`
- تُستخدم في JSON-LD كـ `sameAs` array — جوجل يقرأها لربط الحسابات الاجتماعية بالموقع

**الحكم:** تغطية كاملة ✅

---

## المؤسسة (Organization)

**ايش يقولون:**
- جوجل: ما في حقول "مطلوبة" — تضيف اللي ينطبق عليك.

**ايش عندنا:**
- اسم المؤسسة، الشعار، العنوان الوطني (سعودي)، الاتصال، السجل التجاري، الضريبة، المنطقة، الإحداثيات

**الحكم:** تغطية غنية جداً ✅

---

## الخلاصة

**جدول الإعدادات (Settings) مغطي 100% حسب كل المصادر الرسمية.**

ما في حقل ناقص. كل ما ذكرته جوجل وSemrush وSchema.org وOpenGraph وTwitter — موجود عندنا.

**المشكلة الوحيدة مش في الإعدادات — في إن بعض المولدات (generators) ما تقرأ كل الإعدادات.** هذا اللي نحتاج نصلحه في خطوة التنفيذ.
