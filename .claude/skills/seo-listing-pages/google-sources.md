# المصادر الرسمية — مقتبسة حرفياً

كل قاعدة في `SKILL.md` ترجع إلى فقرة هنا. جُلبت الصفحات الأربع في **١٦ أغسطس ٢٠٢٦**.
عند أي شكّ، أعد جلب الصفحة — جوجل يعدّل توثيقه بلا إعلان، والمقتبس أدناه لقطة لحظتها.

---

## §1 — التنقّل المصنّف (الفلاتر)

المصدر: `https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation`

- «Use robots.txt to disallow crawling of faceted navigation URLs» — بنمط مثل
  `disallow: /*?*products=` مع إبقاء الصفحة غير المفلترة مسموحة.
- «crawling faceted URLs tends to cost sites large amounts of computing resources».
- «If your filtering mechanism is based on URL fragments, it will have no impact on
  crawling (positive or negative).»
- استعمال `rel="canonical"` نحو النسخة غير المفلترة «may, over time, decrease the crawl
  volume of non-canonical versions».
- «Using `rel="nofollow"` attributes on anchors pointing to filtered results pages may be
  beneficial» — بشرط تطبيقه على **كل** رابط يشير إلى نسخة مفلترة.
- «Return an HTTP 404 status code when a filter combination doesn't return results»
  بدل التحويل إلى صفحة خطأ.
- فواصل الباراميترات: `&` القياسية؛ تُتجنّب الفواصل والفواصل المنقوطة والأقواس.

## §2 — الصفحات المرقّمة

المصدر: `https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading`

- «include links from each page to the following page using `<a href>` tags».
- «give each page its own canonical URL» — لا توجيه كل الصفحات إلى الأولى.
- «Google no longer uses these tags, although these links may still be used by other
  search engines» — عن `rel="next"` و`rel="prev"`.
- «Google ignores fragment identifiers» — فلا ترقيم بعد `#`.
- «Google's crawlers don't "click" buttons and generally don't trigger JavaScript
  functions» — عن التمرير اللانهائي وزرّ «المزيد».
- عن نسخ الفرز: «Use `noindex` or robots.txt to prevent duplicate indexed versions of the
  same content with different orderings».

## §3 — `ItemList` وصفحات الملخّص

المصدر: `https://developers.google.com/search/docs/appearance/structured-data/carousel`

- «To specify a list, define an `ItemList` that contains at least two `ListItem` elements.»
- `position`: «The item's position in the carousel. This is a 1-based number.»
- `url`: «The canonical URL of the item detail page. All URLs in the list must be unique,
  but live on the same domain.»
- «All items in the list must be of the same type. For example, if a list is about
  recipes, only include `Recipe` items. Don't mix different types.»
- شكلان مدعومان: صفحة ملخّص تشير إلى صفحات تفصيل، أو صفحة واحدة تحمل كل العناصر بمراسٍ داخلية.

## §4 — `LocalBusiness`

المصدر: `https://developers.google.com/search/docs/appearance/structured-data/local-business`

- المطلوب: `name` + `address` (من نوع `PostalAddress`).
- «Use the most specific `LocalBusiness` sub-type possible» — أمثلة: `Restaurant` ·
  `DaySpa` · `HealthClub` · `Pharmacy` · `Electrician` · `Plumber` · `Locksmith`.
- `geo`: «The precision must be at least 5 decimal places.»
- `priceRange`: «This field must be shorter than 100 characters.»
- `aggregateRating`: «This property is only recommended for sites that capture reviews
  about other local businesses.»
- `openingHoursSpecification` بـ`dayOfWeek` و`opens` و`closes`، مع `validFrom`/`validThrough` الموسميّين.
