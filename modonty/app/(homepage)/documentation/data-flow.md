# من وين تجي بيانات الصفحة الرئيسية

## القاعدة

`page.tsx` يجيب **كل** البيانات في `Promise.all` واحد (سبع قراءات متوازية)،
ويمرّرها للبطاقات كـ props. البطاقات لا تضرب القاعدة بنفسها.

**الاستثناء الوحيد:** الشريط السفلي للجوّال `mobile-bottom-bar/BottomBar.tsx`
يجيب بياناته بنفسه — خمس قراءات.

## الجدول

| القسم على الشاشة | الدالّة | الملف |
|---|---|---|
| قائمة المقالات | `getHomeFeedArticles` | `data/get-home-feed-articles.ts` |
| «مدونتي» + نسخة الجوّال | `getCorePublisherArticles` | `data/get-core-publisher-articles.ts` |
| «استكشف المجالات» | `getIndustriesWithCounts` | `lib/queries/` (مشترك مع مسارات أخرى) |
| «طلة جديدة» (ريلز) | `getReelsFeedPage` | `app/reels/helpers/` ⚠️ استعارة من مسار شقيق |
| «ماذا تريد أن تفعل اليوم؟» | `getServicesCard` | `data/get-services-card.ts` |
| الشعار | `getBrandMedia` | `lib/settings/` |
| الميتاداتا والبيانات المنظّمة | `getListingPageSeo("home")` | `lib/seo/` |
| المزيد عند التمرير | `getMoreArticles` | `data/get-more-articles.ts` |
| الشريط السفلي (جوّال) | ٥ دوالّ | `data/` + `lib/queries/` |

## ملاحظات تخصّ الأداء

- الصفحة عليها `"use cache"` مع `cacheLife("minutes")`، ووسوم الإبطال:
  `homepage` · `articles` · `settings`.
- مقيس من `prerender-manifest.json` بعد بناء ناجح (١٥ أغسطس ٢٠٢٦):
  `/ → renderingMode = PARTIALLY_STATIC`. يعني قشرة ثابتة + بثّ للباقي.
- **الدَّمج التلقائي للاستعلامات المكرّرة يشتغل على `fetch` فقط** حسب توثيق Next،
  وإحنا على Prisma. فأي دالّة تُنادى من مكانين لازم تحمل `"use cache"` بنفسها.
  `getIndustriesWithCounts` اليوم بلا كاش وتُنادى مرّتين — مسجّلة في `TASK.md`.
