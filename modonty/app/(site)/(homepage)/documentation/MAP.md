# خريطة المسار — اقرأها قبل أي شغل على الرئيسية

> **هذا الملف مكتوب للوكيل (كلود) قبل البشر.** الغرض منه واحد: تفتحه بدل ما
> تمشّط المستودع كل جلسة. كل سطر هنا يوفّر بحثاً.
>
> **قاعدة الصيانة:** أي تعديل يغيّر ملفاً أو دالّة → حدّث السطر المقابل في نفس
> الكوميت. خريطة قديمة أسوأ من لا خريطة، لأنها تُصدَّق.
>
> آخر مزامنة مع الكود: **١٥ أغسطس ٢٠٢٦**

---

## ابدأ من هنا

| تبغى | افتح |
|---|---|
| تعرف الشغل المفتوح | `../TASK.md` |
| تعدّل قسماً تشوفه على الشاشة | `../components/<اسم القسم>/` |
| تغيّر بياناتٍ تُعرض | `../data/` |
| تبني للجوّال | `./api-articles.md` |
| تعرف مصدر بيانات قسم | `./data-flow.md` |

---

## الملفات — سطر لكل واحد

### `page.tsx` (الجذر)
سيرفر كومبوننت عليه `"use cache"` · `cacheLife("minutes")` · وسوم الإبطال
`homepage` · `articles` · `settings`. يجيب سبع قراءات في `Promise.all` ويمرّرها
لـ`PageLayout`. فيه `generateMetadata` تقرأ من `getListingPageSeo("home")`.

### `components/` — مجلّد لكل قسم يُشاف على الشاشة

| الملف | عميل؟ | إيش يرسم |
|---|:---:|---|
| `page-layout/PageLayout.tsx` | — | الأعمدة الثلاثة. نقطة الدخول لأي تغيير تخطيط |
| `left-sidebar/LeftSidebar.tsx` | — | العمود الأيسر: AskModo · UserCard · ReelsCard |
| `right-sidebar/RightSidebar.tsx` | — | العمود الأيمن: ModontyCard · ServicesCard · ClientsCard |
| `ask-modo/AskModo.tsx` | ✅ | «مساعدة Modo» |
| `user-card/UserCard.tsx` | ✅ | بطاقة المستخدم (تقرأ الجلسة) |
| `reels-card/ReelsCard.tsx` | — | «طلة جديدة». يصدّر أيضاً النوع `ReelItem` |
| `industries-card/IndustriesCard.tsx` | ✅ | «استكشف المجالات» |
| `articles-list/ArticlesList.tsx` | ✅ | «آخر المقالات» — يستلم `serverPosts` |
| `articles-list/MoreArticles.tsx` | ✅ | التمرير اللانهائي. ينادي `loadMoreArticles` |
| `articles-list/MoreArticlesOnScroll.tsx` | ✅ | يؤجّل تحميل السابق حتى يقترب من الشاشة |
| `modonty-card/ModontyCard.tsx` | ✅ | بطاقة «مدونتي» (سطح المكتب) |
| `modonty-card/ModontyCardMobile.tsx` | — | نسختها على الجوّال |
| `services-card/ServicesCard.tsx` | — | «ماذا تريد أن تفعل اليوم؟» |
| `clients-card/ClientsCard.tsx` | — | «عملاء موثوقون» |
| `clients-card/ClientsCardMobile.tsx` | — | نسختها على الجوّال |
| `mobile-bottom-bar/BottomBar.tsx` | — | الشريط السفلي. **يجيب بياناته بنفسه (٥ قراءات)** |
| `mobile-bottom-bar/` (٧ ملفات أخرى) | ✅ | القشرة · المحمّل · الأوراق · القائمة · الأزرار |
| `scroll-buttons/ScrollButtons.tsx` | ✅ | يحمّل `ScrollProgress` و`BackToTop` تحميلاً مؤجّلاً |
| `shared/SectionLink.tsx` | — | رابط «كل الطلات» — تستخدمه بطاقتان |

### `data/` — كل ما يجيب بيانات

| الملف | يرجّع |
|---|---|
| `get-home-feed-articles.ts` | مقالات الواجهة الأولى |
| `home-feed-shapes.ts` | `homeFeedSelect` + المحوِّل + النسخة المخبَّأة. **`"use cache"` هنا** |
| `get-core-publisher-articles.ts` | مقالات مدونتي نفسها |
| `get-services-card.ts` | بطاقات الخدمات |
| `get-categories-with-counts.ts` · `get-tags-with-counts.ts` · `get-clients-for-sidebar.ts` | للشريط السفلي |
| `get-more-articles.ts` | صفحة تالية من المقالات — **يناديها الويب والرابط معاً** |
| `load-more-articles.ts` | `"use server"` — باب رفيع أربعة أسطر على السابق |

### `api/articles/route.ts`
`GET` عام للجوّال. ينادي `getMoreArticles`. العقد الكامل في `api-articles.md`.

---

## حقائق مقيسة — لا تُعاد قياسها بلا سبب

| الحقيقة | الدليل | التاريخ |
|---|---|---|
| الصفحة نصف-ثابتة | `prerender-manifest.json` → `/ : PARTIALLY_STATIC` | ١٥ أغسطس |
| **القشرة الثابتة ١١٧١٧١ بايت بمحتوى حقيقي** (كانت ٦٣٤٢ فاضية) | `.next/server/app/index.html` | ١٥ أغسطس |
| **الكونسول صفر أخطاء** (كانت ٤) | تصفّح حي بعد إصلاح الجلسة | ١٥ أغسطس |
| البناء ينجح | `✓ Compiled successfully in 31.4s` | ١٥ أغسطس |
| الجلسة صحيحة في الحالتين | مسجَّل: الاسم يظهر بلا دعوة تسجيل · مجهول: «أنشئ حسابًا»=١ و«ملفك واهتماماتك»=٠ | ١٥ أغسطس |
| التمرير اللانهائي يشتغل | ٢٠ ← ٦٠ مقالاً بعد تمريرتين | ١٥ أغسطس |
| الرابط يشتغل | `page=1` → ٢٠٠ · `page=abc` → ٤٠٠ | ١٥ أغسطس |
| `PPR` مفعّل | `next.config.ts:34` → `cacheComponents: true` | ١٥ أغسطس |

---

## مصائد — وقعنا فيها مرّة، لا تتكرّر

1. **الدَّمج التلقائي للاستعلامات يشتغل على `fetch` فقط** حسب توثيق Next، وإحنا على
   Prisma. أي دالّة تُنادى من مكانين لازم تحمل `"use cache"` بنفسها.
   `getIndustriesWithCounts` اليوم بلا كاش وتُنادى مرّتين (الصفحة + الشريط السفلي).
2. **`<Suspense>` حول مكوّن يستلم بياناته كـ props لا يشتغل أبداً** — المكوّن لا
   يعلّق، فالهيكل لا يظهر ولا مرّة. حُذفت ثلاثة منها هنا لهذا السبب.
3. **عنوان الصفحة يتضاعف** لو مرّرت العنوان المخزَّن نصّاً — قالب `layout.tsx:36`
   يضيف «| مدونتي» فوقه. الحل `title: { absolute }`.
4. **نقل الملفات يفشل والسيرفر شغّال** — أقفل `node` أولاً.
5. **أربعة أخطاء `JWTSessionError` في الكونسول** بيئية من كوكي قديمة، ليست من الكود.
   (اختفت بعد إصلاح الجلسة — الكونسول اليوم صفر أخطاء.)
6. **`page.tsx` لسّه يستورد الريلز من `app/reels/helpers/`** — خرق مسار شقيق، مسجّل
   في `TASK.md` كأولوية حمراء.
7. **`await auth()` فوق `{children}` في التخطيط يُفرّغ القشرة الثابتة** — كل ما تحته
   ينتظر الطلب. الحلّ الرسمي: مرّر **وعد** الجلسة لا نتيجتها، وعلّق عند المستهلك
   وحده. التفصيل في `refactor-log.md` (المرحلة ٨).
8. **قراءة الساعة (`new Date()`) في مكوّن داخل التخطيط تُسقط البناء كلّه** — بيانات
   لحظة الطلب لا تُثبَّت مسبقاً. سنة التذييل مثبَّتة نصّاً لهذا السبب.
