---
name: seo-listing-pages
description: |
  Senior SEO + UX standard for LISTING and DIRECTORY pages — not articles.
  Use this skill whenever writing, reviewing or restructuring any page that shows a LIST
  of entities with filters, search, sorting or pagination: `/clients`, `/industries`,
  `/tags/[slug]`, `/categories/[slug]`, `/authors`, `/reels`, `/audio`, `/articles`
  archives, `/search`, and any future directory.
  Trigger keywords (Arabic or English): listing page, directory, صفحة قائمة, دليل,
  الشركاء, filter, فلتر, تصفية, facet, faceted navigation, sort, ترتيب, pagination,
  ترقيم الصفحات, صفحة تالية, ItemList, LocalBusiness, بيانات منظمة لقائمة, search intent,
  نيّة الباحث, نية الزائر, empty state, نتائج فاضية, «كم عنصر أعرض».
  Also triggers on any card component inside a list (PartnerCard, PostCard, IndustryCard)
  and on any `searchParams`-driven page under `modonty/app/`.
  For a single ARTICLE's metadata, JSON-LD, images or Core Web Vitals use
  `seo-senior-expert` instead — that skill owns the article; this one owns the list.
---

# سيو صفحات القوائم والأدلّة — مدونتي

هذه المهارة تحكم **صفحة تعرض قائمة**، لا مقالة. المقالة لها `seo-senior-expert`.

كل قاعدة هنا لها مصدر رسمي مقتبس حرفياً في `google-sources.md` مع رابطه وتاريخ جلبه.
**ما لا مصدر له لا يُكتب هنا.** لو احتجت قاعدة ليست في الملف، اجلب صفحة جوجل الرسمية أولاً.

---

## ١. القاعدة الحاكمة: النيّة قبل الحقول

خالد (١٦ أغسطس ٢٠٢٦): «فكّر بمنطق الزائر، منطق المشترك. أنا داخل على صفحة الشركاء،
ما يهمّني كم مقال عنده. إيش نيّة الباحث؟»

قبل أن تضع أي عنصر في بطاقة أو شريط، اكتب سطرين:

```
مَن الداخل؟   …
نيّته إيش؟    …
```

ثم **لا يدخل الشاشة إلا ما يجيب على نيّته**. الترتيب الطبيعي لنيّة الباحث عن جهة:

| # | سؤاله | ما يجيب عليه |
|---|---|---|
| ١ | يخدم حاجتي؟ | التخصّص بلغته (خدمات · نوع النشاط)، لا التصنيف العام |
| ٢ | أثق فيه؟ | توثيق · تقييم · مدينة · ترخيص · سنوات |
| ٣ | كيف أوصله الآن؟ | زرّ الإجراء: احجز · واتساب · المتجر |

**المقاييس الداخلية ليست محتوى.** «عدد المقالات» و«عدد المتابعين» و«آخر نشر» مقاييس
نشاطٍ *لنا*؛ لا تدخل البطاقة إلا إذا تُرجمت إلى إشارة ثقة للزائر. الاختبار: لو شِلتَ الرقم،
هل يفقد الزائر معلومة تخصّ قراره؟ لا → اشِله.

**اختبار البطاقة الفاضية:** قبل أن تعتمد حقلاً، قِس كم صفاً في القاعدة يملؤه فعلاً.
حقلٌ فاضٍ عند ٩٠٪ من الصفوف يجعل البطاقة أفرغ لا أغنى.

---

## ٢. الفلاتر والفرز (faceted navigation)

المصدر: `google-sources.md` §1 — صفحة جوجل الرسمية عن التنقّل المصنّف.

- **قرّر أوّلاً: هل النسخة المفلترة صفحة نتيجة بحث تستحق الفهرسة؟**
  مثال يستحق: `/industries/healthcare` (صفحة لها نيّة بحث حقيقية «شركات الرعاية الصحية»).
  مثال لا يستحق: `/clients?industry=healthcare&page=3` (نفس المحتوى بترتيب آخر).
- **ما لا يستحق الفهرسة: امنع الزحف إليه.** جوجل: «Use robots.txt to disallow crawling of
  faceted navigation URLs» — أو `rel="nofollow"` على كل رابط يشير إليه، أو اجعل الفلتر
  على جزء الرابط بعد `#` («it will have no impact on crawling»).
- **الكانونيكال للنسخة المفلترة يشير للنسخة الأصلية** — يقلّل زحف النسخ مع الوقت، لكنه
  **ليس بديلاً عن منع الزحف**؛ جوجل يزحف قبل أن يقرأ الكانونيكال.
- **الفرز خصوصاً:** «Use `noindex` or robots.txt to prevent duplicate indexed versions of
  the same content with different orderings» — الترتيب لا ينشئ محتوى جديداً أبداً.
- **تركيبة فلاتر بلا نتائج ترجع `404`** — نصّ جوجل: «Return an HTTP 404 status code when a
  filter combination doesn't return results». صفحةٌ فاضية بكود `200` تدخل الفهرس كصفحة رقيقة.
- **فواصل الباراميترات `&` القياسية** — لا فواصل ولا فواصل منقوطة ولا أقواس.

---

## ٣. الصفحات المرقّمة

المصدر: `google-sources.md` §2.

- **رابط `<a href>` حقيقي لكل صفحة تالية** — «Google's crawlers don't "click" buttons and
  generally don't trigger JavaScript functions». التمرير اللانهائي مسموح **فوق** روابط حقيقية،
  لا بدلاً منها.
- **لكل صفحة كانونيكال يخصّها** — «give each page its own canonical URL». توجيه كل الصفحات
  إلى الأولى يحذف الباقي من الفهرس.
- **`rel=next` و`rel=prev` ميّتتان عند جوجل** — «Google no longer uses these tags».
- **الرابط يحمل الصفحة كباراميتر أو مسار، لا بعد `#`** — «Google ignores fragment identifiers».

---

## ٤. البيانات المنظّمة لصفحة قائمة

المصدر: `google-sources.md` §3 و§4.

- **`ItemList` لصفحة الملخّص:** عنصران على الأقل من نوع `ListItem`، لكل واحد `position`
  (يبدأ من ١) و`url` الكانونيكال لصفحة العنصر. «All URLs in the list must be unique, but
  live on the same domain».
- **نوع واحد فقط في القائمة** — «All items in the list must be of the same type… Don't mix
  different types».
- **صفحة الجهة نفسها تأخذ `LocalBusiness`** بأدقّ نوع فرعي ممكن («the most specific
  `LocalBusiness` sub-type possible»): `MedicalClinic` · `Dentist` · `Store`… لا `LocalBusiness` العامّة.
  المطلوب: `name` + `address`. المستحسن: `geo` (بخمس خانات عشرية على الأقل) ·
  `openingHoursSpecification` · `telephone` · `priceRange` · `url`.
- **`aggregateRating` تحذير:** جوجل يخصّها بمواقع تجمع تقييمات عن جهات **أخرى**
  («only recommended for sites that capture reviews about other local businesses»).
  مدونتي تجمع تقييمات عن شركائها → تنطبق، لكن بشرط ألّا تكون تقييمات ذاتية.

---

## ٥. قبل أن تسلّم صفحة قائمة — الفحص

- [ ] كتبتَ سطري «مَن الداخل / نيّته» ويظهر أثرهما في البطاقة؟
- [ ] كل حقل في البطاقة يجيب على واحد من أسئلة النيّة الثلاثة؟ وقِست امتلاءه في القاعدة؟
- [ ] النسخ المفلترة/المرتّبة: إمّا ممنوعة من الزحف أو تستحق الفهرسة بنيّة بحث حقيقية؟
- [ ] نتيجة فاضية = `404`، لا `200` بشاشة فاضية؟
- [ ] روابط الصفحات `<a href>` حقيقية، ولكل صفحة كانونيكالها؟
- [ ] `ItemList` بنوع واحد و`position` و`url` كانونيكال؟
- [ ] العنوان `h1` يصف ما يراه الزائر بعد الفلترة، لا عنواناً ثابتاً؟

الفجوات المقيسة اليوم في `modonty/app/clients` → `modonty-listing-audit.md`.
