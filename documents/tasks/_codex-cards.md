### 1. `SEOBLOB-STALE`
**canonical و hreflang لا يُجدَّدان بعد تغيير الـslug في ثلاث صفحات**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. الجولة الثانية ٢٤ أغسطس ٢٠٢٦: الجذر في الأدمن لا في مدونتي وحدها: update-category.ts:65 وtags-actions.ts:232 وupdate-industry.ts تكتب canonicalUrl: data.canonicalUrl || null من النموذج، والمولّد يحترم القيمة القديمة (category-seo-generator.ts:30,67). المقال والشريك يعيدان الحساب دائماً («never trust DB value» — update-article.ts:164)؛ الثلاثة لا. ما كان مكتوباً: ثلاث صفحات ترجّع البلوب المخزَّن كما هو: categories/[slug]/page.tsx:70 · tags/[slug]/page.tsx:69 · industries/[slug]/page.tsx:36. الفرق عن أخواتها: المقال (articles/[slug]:152-160) والكاتب (authors/[slug]:143-151) والش

### 2. `SEOOG-DIMS`
**أبعاد صورة المشاركة مُدَّعاة لا مقيسة في اثنتي عشرة صفحة**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. الجولة الثانية ٢٤ أغسطس ٢٠٢٦: الأدمن يفعلها أيضاً وبشكل أسوأ: generate-client-seo-bundle.ts:329-330 يرفع الأبعاد إلى الحدّ الأدنى (w &gt;= 1200 ? w : 1200). مقيس حيّاً على شريكين: og:image:width=2544 height=630 — نسبة لا وجود لها. وmetadata-generator.ts:217 يعلن 1200×630 لشعار العميل حين يغيب غلاف المقال. وbuild-home-jsonld-from-settings.ts:260 يعلن 1200×630 لصور الرئيسية الأصلية غير المقصوصة. ما كان مكتوباً: مقيس (المعلن مقابل الملفّ الحقيقي): /trust 1200×630 ← 5000×2625 /story 1200×630 ← 5000×2625 /contact 1200×630 ← 1920×1080 السبب: lib/seo/build-metadata-from-page-row.ts:1

### 3. `SEOWEBSITE`
**‏WebSite يُعلَن على كل مقال بدل الصفحة الرئيسية، ومعرّفه مكرّر**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. الجولة الثانية ٢٤ أغسطس ٢٠٢٦: ليس المقال وحده: WebSite يُبثّ على كل شريك (generate-organization-jsonld.ts:784) وكل فئة ووسم ومجال (category-seo-generator.ts:103) و/clients /help/faq /trending والصفحات الثابتة الثماني. جوجل (١٠ ديسمبر ٢٠٢٥): «must be on the home page». والرئيسية نفسها سليمة. ما كان مكتوباً: generate-site-identity-structured-data.ts:53 يعلن WebSite بمعرّف /#website على كل صفحة مقال. والبلوب المخزَّن يحمل نفس المعرّف داخل isPartOf — فالمعرّف نفسه في سكربتين على الصفحة الواحدة. يخالف: «The WebSite structured data must be on the home page of a site» (Google · Site 

### 4. `SEOJSONLD-ESC`
**سبع صفحات تحقن JSON-LD مخزَّناً بلا هروب**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. about/page.tsx:72 · contact:56 · terms:60 · legal/{privacy-policy,cookie-policy,copyright-policy,user-agreement}:60: __html: storedJsonLd ?? sanitizeJsonLd(buildFallbackStructuredData()) — المخزَّن يمرّ خاماً، والاحتياطي وحده يُهرَّب. مسار المقال يفعلها صح: jsonLdHtmlFromString(storedCard). والملفّ نفسه يأمر بذلك: «Apply at EVERY stored-blob injection point» (lib/seo/index.ts:19). الأثر: نصّ يحوي &lt;/script&gt; داخل حقل مخزَّن يكسر الوسم ويخرج منه. يقفل بـ: كل نقطة حقن للمخزَّن تمرّ عبر jsonLdHtmlFromString. المصدر: تقرير الفحص الكامل documents/modonty/seo/SEO-AUDIT-2026-08-2

### 5. `SEOSITEMAP-GAPS`
**‏story و team و modonty خارج خريطة الموقع رغم ارتباطها داخلياً**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. الثلاث مرتبطة من داخل الموقع (StoryCard.tsx:48 · TeamGalleryCard.tsx:22 · شريط الروابط السريعة) وليست في app/sitemap.ts. ومعها: /search و/page/[n] وكل مسارات الشريك الداخلية خارج الخريطة أيضاً — بعضها مقصود، وهذا ما يُحسم في البند. يقفل بـ: قرار مكتوب لكل مسار: داخل الخريطة أو خارجها ولماذا. المصدر: تقرير الفحص الكامل documents/modonty/seo/SEO-AUDIT-2026-08-24.html.

### 6. `SEOORPHAN`
**‏/news و/analytics بصفر رابط داخلي وارد**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. جرد الروابط: /analytics صفر رابط وارد (وهي noindex فالأثر تنظيمي) · /news صفر رابط وارد وهي في خريطة الموقع — صفحة يتيمة تُقدَّم لجوجل ولا يصلها القارئ. ومعهما: /subscribe رابطه الوحيد داخل قائمة الجوّال، وهي مكوّن عميل لا يُرسَم إلا بعد فتح المستخدم لها — أي لا يراه زاحف. يقفل بـ: كل مسار في الخريطة له رابط داخلي واحد على الأقل في HTML الخام. المصدر: تقرير الفحص الكامل documents/modonty/seo/SEO-AUDIT-2026-08-24.html.

### 7. `SEOFALLBACK-TITLE`
**عطل عابر يشحن عنواناً عامّاً مفهرساً، وعنوان احتياطي إنجليزي**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مصيدة الخطأ في صفحة المقال ترجّع { title: "مقال - مدونتي" } بلا noindex — فأي عطل عابر في القاعدة يشحن عنواناً عامّاً على رابط مقال حقيقي. والتعليق داخل الكود نفسه يشرح لماذا لا يجوز تحويل الأعطال العابرة إلى ٤٠٤: حصل من قبل، وسجّلت كونسول البحث مقالات صحيحة على أنها «غير موجودة». نفس المنطق ينطبق على عنوانٍ عامّ بلا noindex. ومن العناوين الثابتة الأخرى: "Author Not Found" (authors/[slug]/page.tsx:127) — إنجليزية على موقع عربي. ومثلها في الفئات والوسوم والمجالات والشركاء وسبع صفحات شريك داخلية. يقفل بـ: كل عنوان احتياطي عربي، ومسار الخطأ العابر يحمل noindex. المصدر: تقرير الفح

### 8. `SEOSEARCHACTION`
**SearchAction (أوقفته جوجل نوفمبر ٢٠٢٤) ما زال يُبثّ من ثلاثة مولّدات — تنظيف**

تصحيح بعد إعادة فحص التوثيق الرسمي (٢٤ أغسطس، فُتح في المتصفّح): جوجل تقول حرفياً «there's no need to proactively remove it. Structured data that's not being used does not cause problems for Search, but also has no visible effects» (مدوّنة ٨ أغسطس ٢٠٢٣) و«Unsupported structured data like this won't cause issues in Search, and won't trigger errors in Search Console» (مدوّنة ٢١ أكتوبر ٢٠٢٤). ومعرض الميزات الرسمي (محدَّث ١٥ يونيو ٢٠٢٦) لا يذكر FAQ ولا صندوق البحث. الخلاصة: الوسم الميت لا يضرّ — حذفه تنظيف لا إنقاذ. ✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مقيس حيّاً: "@type":"SearchAction" على /clients /about /contact /

### 9. `SEOID-SLASH`
**معرّف الكيان بلا شرطة في أربعة مولّدات — مدونتي كيانان عند جوجل**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مقيس حيّاً: /about /contact /terms /legal/* وكل فئة ووسم ومجال تعلن https://www.modonty.com#organization و#website بلا شرطة، بينما الرئيسية والمقال والفريق تعلن https://www.modonty.com/#organization. المصادر: generate-modonty-page-jsonld.ts:78,124 · category/tag/industry-seo-generator.ts:81-82,99,105. وknowledge-graph-generator.ts:345-349 يوثّق أن هذا العطل بالذات أُصلح في ملف واحد ولم يُعمَّم. ويضاف: /trust و/story تعلنان Organization بلا @id أصلاً (organization-jsonld.ts:138) فلا تندمج مع شيء. وknowledge-graph-generator.ts:210 يعطي كاتب مدونتي معرّفاً ثالثاً /authors/modonty

### 10. `SEOEMPTY-ITEMLIST`
**ItemList بـ numberOfItems: 0 على صفحات تعرض عشرات البطاقات**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. build-home-jsonld-from-settings.ts:438-443 (buildListPageJsonLdFromSettings) يشحن mainEntity: { ItemList, numberOfItems: 0, itemListElement: [] } إلى /clients /categories /trending. الصفحة ترسم عشرات العناصر والبيانات المنظَّمة تقول «لا شيء». ويضاف: audio/page.tsx:70-76 يبثّ ١١٤ ListItem بلا item ولا url. جوجل: «must be a true representation of the page content». يقفل بـ: إمّا تعبئة القائمة من البيانات الحقيقية أو حذفها. المصدر: الجولة الثانية من الفحص documents/modonty/seo/SEO-AUDIT-2026-08-24.html (القسم ٣، رقم البند في العمود الأول).

### 11. `SEOPROXY-SEG`
**مرشّح البروكسي مقطع واحد — بقيت المسارات الفرعية للشريك**

تحديث ٢٥ أغسطس ٢٠٢٦ — نصفها أُغلق: /reels/&lt;محذوف&gt; كانت ترجع ٢٠٠ بينما كل الأقسام ترجع ٤١٠ — قياس جنب قياس: 410 /articles/zzz · 410 /clients/zzz · 410 /categories/zzz · 410 /authors/zzz · 200 /reels/zzz. أُضيف /reels/:slug للمطابق وقسم reels لكاش الأرشيف، والقياس بعده: 410 للمحذوف و200 للطلّات الحيّة الثلاث المفحوصة. الباقي: الصفحات الفرعية للشريك — /clients/&lt;محذوف&gt;/about و/articles و/faq — ما زالت تُفلت لأن المطابق مقطع واحد. يقفل بـ: curl -I /clients/xyz-dead/about = ٤١٠ لا ٢٠٠.

### 12. `SEOBC-EN`
**مسار التنقّل في الفئة والوسم والمجال بأسماء إنجليزية**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. category-seo-generator.ts:91-93 (Home · Categories) · tag-…:91 (Tags) · industry-…:91 (Industries) — بينما المسار المرسوم على الصفحة عربي. وجوجل تستعمل name في النتيجة. يقفل بـ: الأسماء من messages العربية. المصدر: الجولة الثانية من الفحص documents/modonty/seo/SEO-AUDIT-2026-08-24.html (القسم ٣، رقم البند في العمود الأول).

### 13. `SEOHOME-BC`
**مسار التنقّل في الرئيسية عنصراه يشيران إلى نفس الرابط**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. build-home-jsonld-from-settings.ts:296-311: الموضع ١ «الرئيسية» والموضع ٢ «أحدث المقالات» كلاهما @id: siteUrl. جوجل: المسار يمثّل رحلة المستخدم، والصفحة الحالية لا تُدرج. يقفل بـ: حذف BreadcrumbList من الرئيسية (الرئيسية لا مسار لها). المصدر: الجولة الثانية من الفحص documents/modonty/seo/SEO-AUDIT-2026-08-24.html (القسم ٣، رقم البند في العمود الأول).

### 14. `SEOBUNNY-CROP`
**الأدمن يُلحق لاحقة القصّ بأي رابط Bunny بلا حارس وجود القصّ — مؤشّر**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. knowledge-graph-generator.ts:42-48 buildAspectUrl يضيف __16x9.webp لأي .b-cdn.net. مدونتي عندها الحارس (shared/lib/bunny.ts:103-112 — القصّ موجود تحت مجلّد post/ فقط)، والأدمن لا. الفرع الاحتياطي (:521-541) يمرّر شعار العميل وصورته الرئيسية (logo/ hero/) → روابط ٤٠٤ داخل JSON-LD. مقيس جزئياً: في مقال واحد رابطان لنفس الصورة، مُرمَّز (٢٠٠) وبحروف عربية خام (٤٠٤ من curl — قد يكون ترميز الأداة). مؤشّر لا حكم حتى يُقاس بأداة ثانية. يقفل بـ: استعمال hasBunnyAspectCrops() في الأدمن + توحيد الترميز، والقياس: كل contentUrl في JSON-LD يرجّع ٢٠٠. المصدر: الجولة الثانية من الفحص document

### 15. `SEOADM-ARTICLES-LISTING-DENIED`
**مولّد القوائم يوثّق أن /articles «غير موجودة ويجب ألّا توجد» — وهي موجودة ومفهرسة بلا كاش سيو**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. listing-page-seo-generator.ts:277-288 تعليق طويل يعلن حذف مولّد /articles لأن الصفحة لا وجود لها. modonty/app/(site)/articles/page.tsx موجود، مفهرس، في الخريطة، ويبثّ BreadcrumbList. النتيجة: صفحة قائمة رئيسية بلا ميتاداتا مولَّدة (مقيس حيّاً: بلا صورة OG، تويتر summary). القرار الهندسي: إمّا إعادة مولّد /articles أو تحويلها — والتعليق والكود لازم يتّفقان مع الواقع. المصدر: بطاقة SEOADM-RAW على هذه اللوحة (الملحق الخام؛ رقم البند = المجموعة-البند).

### 16. `SEOADM-REVALIDATE-BEFORE-GEN`
**الإنشاء يفرّغ كاش مدونتي قبل توليد السيو — العطل الذي أُصلح في التحديث ولم يُصلح في الإنشاء**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. tags-actions.ts:178-180 (revalidateModontyTag قبل generateAndSaveTagSeo) · create-category.ts:59-63 · create-industry.ts:41-44 — بينما update-industry.ts:78-79 وtags-actions.ts:252-256 يوثّقان هذا العطل بالذات مصلَّحاً في مسار التحديث. الصفحة الجديدة تُبنى بلا بلوب. يقفل بـ: ترتيب واحد: توليد ← ثم تحقّق. المصدر: بطاقة SEOADM-RAW على هذه اللوحة (الملحق الخام؛ رقم البند = المجموعة-البند).

### 17. `SEOADM-YMYL-IDS`
**اليمل: @id المنظّمة يصير «#organization» عارياً (كل العيادات كيان واحد) وصفحة طبية بمعرّف ثانٍ**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. build-ymyl-jsonld.ts:78 `${client.url ?? ""}#organization` — بلا url خارجي = #organization المشترك بين الجميع؛ ومع url = نطاق العميل بينما باقي المنصّة تعرّفه /clients/slug#organization. :152 MedicalWebPage @id = url#webpage بينما knowledge-graph-generator.ts:206,337 يعرّف WebPage بالرابط العاري — عقدتان لصفحة واحدة وreviewedBy على الغلط. :111 المراجع نفس الشكل. :103/:142 تسميات التخصّص بالإنجليزية. يقفل بـ: معرّفات من ids الموحّدة، والتسمية من label.ar. المصدر: بطاقة SEOADM-RAW على هذه اللوحة (الملحق الخام؛ رقم البند = المجموعة-البند).

### 18. `SEOADM-HARDCODED-HOST`
**https://www.modonty.com ثابت في ٩ كاتبات سيو — عند فشل الإعدادات يُكتب في القاعدة**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. knowledge-graph-generator.ts:168 · page-actions.ts:139 · listing-page-seo-generator.ts:29 · industry-seo-generator.ts:116 · structured-data.ts:21,62 · seo-metadata.ts:55 · page-renderer.ts:25 · get-modonty-author.ts:14,21 · generate-client-test-data.ts:93 (بلا www!) · transition-article.ts:156 IndexNow · custom-validation-rules.ts:160,302 وarticle-validator-db.ts:544 يقارنان modonty.com بلا www. مع بطاقة SEOADM-SETTINGS-DEFAULTS يصير الثابت هو ما يُخزَّن. يقفل بـ: loadSiteUrl() يرمي عند الغياب، وصفر نصّ ثابت للمضيف في admin/ وshared/. المصدر: بطاقة SEOADM-

### 19. `SEOADM-CANONICAL-SCHEMA`
**canonicalUrl يُقبل أي نصّ في ٦ سكيمات — ولا يُقارن بالمسار الذاتي في البوّابة**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. article-server-schema.ts:15 · category-server-schema.ts:10 · tag-server-schema.ts:9 · industry-server-schema.ts:9 · client-server-schema.ts:36,29,57,63 — z.string().max(500) بلا .url()؛ وclient-form-schema.ts:125 وpage-schema.ts:51 وarticle-validation.ts:60 تقبل أي مضيف. وبوّابة النشر article-validator-db.ts:399-413 تفحص المضيف لا المسار → canonical يشير لمقال آخر يمرّ. وanalyze-technical.ts:20-45 يعتبر startsWith("https://") نجاحاً. يقفل بـ: سكيما مشتركة: مطلق · https · نفس الأصل · ذاتي المرجع — والبوّابة تقارن الرابط كاملاً. المصدر: بطاقة SEOADM-RAW على 

### 20. `SEOADM-SLUG-UNTRIMMED`
**الإنشاء يفحص الفرادة على slug.trim() ويخزّن غير المقصوص وغير المحلَّل**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. create-article.ts:49 vs 150 · create-category.ts:33 vs 41 (ونتيجة parsed تُهمَل :27) · tags-actions.ts:176,228 (create({ data }) الخام) · create-industry.ts:30 vs 33. مسافة في الـslug = رابط بـ%20 وcanonical لا يطابق أبداً. وarticle-validator-db.ts:135 يسمح بـ/ داخل الـslug. يقفل بـ: parsed.data + slugify في السكيما نفسها. المصدر: بطاقة SEOADM-RAW على هذه اللوحة (الملحق الخام؛ رقم البند = المجموعة-البند).

### 21. `SEOADM-DUP-IDS-LISTS`
**قوائم تعلن عدداً غير المبثوث وتكرّر @id المقال من صفحة أخرى**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. مؤكَّد بالكود الخام. build-trending-page-jsonld.ts:30-75 عقد Article كاملة بمعرّف المقال نفسه على /trending (تكرار @id عبر الصفحات) و:50-54 مدونتي كاتباً بنوع Person بينما هي Organization في مكان آخر · build-taxonomy-page-jsonld.ts:121-129 وbuild-categories-page-jsonld.ts:94,99 وbuild-clients-page-jsonld.ts:310-316 وbuild-home-jsonld-from-settings.ts:278 numberOfItems = total و٢٠ عنصراً فقط · generate-home-and-list-page-seo.ts:330-378 ترتيب الرائج في الذاكرة فوق ١٠٠ صفّ ≠ ما ترسمه الصفحة · tag-seo-generator.ts:76 @id = pageUrl يتصادم عند canonical خارجي · build-taxonomy-page-j

### 22. `SEOADM-ARABIC-MIXUPS`
**نصوص إنجليزية أو غلط تصل جوجل: Home/Modonty في المسار · «Articles by» · «Content Platform» · «بتاج» · «مودونتي» · «Building 1234»**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. generate-modonty-page-jsonld.ts:186 «Modonty» اسم الرئيسية في المسار · build-modonty-author-seo.ts:116 «Articles by …» وصفاً · use-author-form.ts:50 jobTitle افتراضي «Content Platform» · tag-seo-generator.ts:32,69 «مقالات بتاج» (تاج = تاج الملك؛ الصحيح وسم) · generate-client-test-data.ts:89,55 «مودونتي» و«الابتكار beyond الحدود» · generate-organization-jsonld.ts:379-388 «Building 1234, Additional 5» داخل عنوان عربي · settings-actions.ts:1183 وصف العلامة الإنجليزي المزروع · generate-client-seo-bundle.ts:321 «- Organization» في alt · build-ymyl-jsonld.ts:103,142 تخصّصات إنجليزية

### 23. `SEOADM-EMPTY-VALUES`
**قيم فارغة أو عقد خاوية تُخزَّن وتُبثّ: description «» · ContactPoint بلا حقول · undefined/path**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. build-clients-page-jsonld.ts:94,151 وgenerate-modonty-page-jsonld.ts:154 وbuild-meta-from-settings.ts:92 وgenerate-client-seo-bundle.ts:233,244 وbuild-modonty-author-seo.ts:43 description: "" · generate-modonty-page-jsonld.ts:87-93 {"@type":"ContactPoint"} عارية · alert-system.ts:301 undefined/path · page-actions.ts:141-149 secret=undefined في الرابط · build-trending-page-jsonld.ts:59 شعار نصّاً عارياً · knowledge-graph-generator.ts:872-874 hasCredential نصوصاً لا كائنات · structured-data.ts:246-249 numberOfEmployees نصّاً. يقفل بـ: الخاصّية الفارغة تُحذف (spread شرطي) في كل م

### 24. `SEOADM-DEAD-SEO-MODULES`
**وحدات سيو ميتة أو مكرّرة ما زالت مُصدَّرة وتناقض الحيّ — تُحذف**

✔ تحقّق خالد-غيت ٢٤ أغسطس ٢٠٢٦: فتحتُ كل مرجع ملف:سطر في هذه البطاقة بنفسي وقرأت الكود الخام — الادّعاء قائم كما هو. generate-validators-from-mapping.ts (٣٢٤ سطراً، صفر مستهلك) · structured-data.ts:19-270 ميت عدا المسار · custom-validation-rules.ts · international-seo.ts · content-quality-scorer.ts · publish-policy.ts · jsonld-processor.ts:93-150 (compactJsonLd يرجّع id/type بلا @) · modonty-jsonld-validator.ts:209-250 · jsonld-actions.ts:1 برميل يشير لنفسه · alert-system.ts:209-236 · auto-fix.ts:31-39 · generate-off-page-guidance.ts إنجليزي كلّه · client-field-mapping.ts:349-391,820-884 يوثّق أعمدة تويتر غير موجودة وclient-form-config.ts:158 يعرضها للتحرير فتضيع كل حفظ · حقول sitemapPriorit

