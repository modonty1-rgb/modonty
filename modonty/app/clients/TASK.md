# مفتوح على `/clients`

## 🔖 مؤجَّل — يُعالَج بعد اكتمال الريفاكتور (خالد، ١٦ أغسطس: «القديم انساه حالياً»)

مقيسة بالدليل اليوم، ولم تُنفَّذ. المرجع الكامل مع الاقتباسات الرسمية:
`.claude/skills/seo-listing-pages/modonty-listing-audit.md`.

| # | ما هو | الدليل | القاعدة |
|---|---|---|---|
| ١ | كانونيكال واحد لكل الصفحات المرقّمة → `?page=2` و`?page=3` تعلنان الأولى | `app/clients/page.tsx:21` | «give each page its own canonical URL» |
| ٢ | نتيجة بحث فاضية ترجع `200` لا `404`/`noindex` | `components/partners-list/PartnersList.tsx` | «Return an HTTP 404 … when a filter combination doesn't return results» |
| ٣ | كل النسخ المفلترة (`?q=` · `?industry=`) مسموح زحفها | `app/robots.ts:29` | «disallow crawling of faceted navigation URLs» |
| ٤ | لا `ItemList` على صفحة الشركاء | `page.tsx:39` (الجيسون‌إل‌دي من الأدمن فقط) | «at least two `ListItem` … `position` … canonical `url`» |
| ٥ | البطاقة تحمل مقاييسنا لا نيّة الزائر | `components/partner-card/PartnerCard.tsx` | قاعدة خالد: «ما يهمّني كم مقال عنده» |

**ملاحظة على القديم (لا تُبنى عليها قرارات):** `/industries/[slug]` حيّة اليوم (`GET /industries/healthcare` = 200،
لها عنوانها وكانونيكالها، وتعرض شريكاً واحداً = نفس عدد الفلتر)، ومعلنة في `app/sitemap.ts:99`.
هل تبقى صاحبة نيّة «شركاء مجال كذا» أم تُدمج في الفلتر — يُحسم في الريفاكتور، لا الآن.

**ما يحتاج قياساً قبل تنفيذ البند ٥:** كم شريكاً من الثلاثين عنده `ClientServiceItem`، وكم عنده
`ClientReview` معتمدة. بلا الرقمين، استبدال العدّادات قد يُفرغ البطاقة بدل أن يملأها.

## قرارات تنتظر خالد

- **الملفّات القديمة (١٣ مكوّناً + ٦ مساعدات) صارت بلا مستهلك بعد إعادة البناء** — لم تُحذف،
  بانتظار كلمتك. اثنان منها ما زالا مستعملين من `app/search/`:
  `components/client-card.tsx` و`components/sort-dropdown.tsx` — حذفهما يكسر البحث،
  فيلزم أوّلاً نقلهما أو استبدالهما هناك.
  الباقي بلا مستهلك: `clients-section` · `clients-content` · `client-list-item` ·
  `client-card-cta` · `client-card-loading` · `active-filters` · `empty-state` ·
  `featured-partners-slider` · `filter-panel` · `industry-chips` · `view-toggle` ·
  `helpers/get-clients-with-counts` · `helpers/format-metrics` · `helpers/use-client-filters` ·
  `helpers/use-client-search` · `helpers/use-debounce` · `helpers/get-b2b-panel-settings`.
- **`?service=` سقط لأن مصدره مات.** `app/(homepage)/components/services-card/ServicesCard.tsx`
  كان المنتج الوحيد للرابط `/clients?service=<presetId>`، وهو اليوم **بلا مستدعٍ**
  (فحص: `grep ServicesCard` على `app/` لا يرجّع إلا الملف نفسه، وصفحة الرئيسية الحيّة
  ما فيها ولا رابط `?service=`). فحُذف الشرط من الصفحة الجديدة بدل أن يبقى كوداً ميتاً.
  الملف نفسه في مجلّد الرئيسية — قرار حذفه لك.
- **وجهة زرّ «كيف نتأكّد؟»** — الآن `/trust`. تلك الصفحة تشرح شفافية مدونتي مع العميل
  (فاتورة · باقة · دفع) لا آليّة فحص الشركاء. لو تبي صفحة تشرح الفحص نفسه، قلها ونبنيها.
- **`lib/queries/get-clients-by-service.ts` صار بلا مستدعٍ** — `/booking` و`/shop` (١٦ أغسطس)
  انتقلا لقراءة `getClientsList()` نفسها (نفس الكاش اللي تقرأه `/clients`) بدل استعلامهما
  الخاص عبر `CtaPreset`. لم يُحذف — بانتظار كلمتك. الملف القديم `components/client/client-card.tsx`
  لسّه مستعمل في ٣ صفحات لم تُلمس بعد: `categories/[slug]` · `industries/[slug]` · `tags/[slug]`.

## مقيس ومسجَّل — للجوّال (لا يُنفَّذ الآن)

- الرِيلان يختفيان تحت `lg`/`1240px`، فالجوّال حالياً بلا قائمة تصفية بالمجال وبلا بطاقات
  «احجز/تسوّق/صِر شريكاً». يحتاج مكانه في مرحلة الجوّال (V10).
