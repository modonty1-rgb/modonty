# تدقيق Suspense وCache Components — ١ سبتمبر ٢٠٢٦

النطاق: صفحات React تحت `modonty/app/`، مع استبعاد `articles/[slug]` حسب الطلب. لم تُحسب `route.ts` و`actions/` كصفحات: لا تدخل شجرة RSC ولا يوجد فيها انتظار JSX أو `<Suspense>`؛ استعلاماتها طلب/استجابة مباشرة وليست هذا العطل. تعذّر فتح نسخة وثائق Next المذكورة بسبب صلاحيات نظام الملفات، لكن فُحص ضبط `cacheComponents: true` في `modonty/next.config.ts:108`.

## المكشوفة

| المسار | الدالّة | الحكم | ملف:سطر | مكان الانتظار |
|---|---|---|---|---|
| `/categories/[slug]` | `db.category.findUnique` | مكشوفة | `app/(site)/categories/[slug]/page.tsx:108` | داخل `CategoryDetailPage` في جذر الصفحة؛ لا `"use cache"` ولا `<Suspense>`. |
| `/categories/[slug]` | `db.client.findMany` | مكشوفة | `app/(site)/categories/[slug]/page.tsx:119` | `Promise.all` في جذر `CategoryDetailPage`؛ ليس داخل حد. |
| `/categories/[slug]` | `db.clientReview.groupBy` | مكشوفة | `app/(site)/categories/[slug]/page.tsx:152` | انتظار مشروط داخل نفس `Promise.all` الجذري. |
| `/tags/[slug]` | `db.tag.findUnique` | مكشوفة | `app/(site)/tags/[slug]/page.tsx:103` | داخل `TagPage` في جذر الصفحة؛ لا `"use cache"` ولا `<Suspense>`. |
| `/tags/[slug]` | `db.client.findMany` | مكشوفة | `app/(site)/tags/[slug]/page.tsx:114` | `Promise.all` في جذر `TagPage`؛ ليس داخل حد. |
| `/tags/[slug]` | `db.clientReview.groupBy` | مكشوفة | `app/(site)/tags/[slug]/page.tsx:150` | انتظار مشروط داخل نفس `Promise.all` الجذري. |
| `/users/[id]` | `db.user.findUnique`, `db.author.findUnique/findFirst` | مكشوفة | `app/(site)/users/[id]/page.tsx:25,35,97,113,153` | `generateMetadata` و`UserPage` ينتظرانها في الجذر بلا cache أو حد؛ الصفحة تستدعي `auth()` أيضاً. |
| `/users/notifications` | `db.notification.findMany/findFirst`, `db.articleFAQ.findFirst`, `db.contactMessage.findFirst`, `db.client.findUnique` | مكشوفة | `app/(site)/users/notifications/page.tsx:42,54,59,68,79` | بعد `auth()`، كلها منتظرة في جذر `NotificationsPage` بلا `<Suspense>`. |

## مكيّشة

| المسار | الدالّة | الحكم | ملف:سطر | مكان الانتظار |
|---|---|---|---|---|
| `/reels/[slug]` | `getReelBySlug` → `db.media.findFirst` | مكيّشة | `app/(fullscreen)/reels/[slug]/data/get-reel-by-slug.ts:42-46` | الدالة نفسها تبدأ بـ`"use cache"` وتحدد tag/lifetime. |
| `/clients/[slug]` | `getClientForMetadata` → `db.client.findUnique` | مكيّشة | `app/(partner)/clients/[slug]/page.tsx:57-62` | انتظار metadata في الجذر، لكنه ضمن دالة `"use cache"`. |
| `/clients/[slug]` | `getClientPageData`, `getClientPageFaqs`, `getClientGallery`, `client-stats/reviews/followers` | مكيّشة | `app/(partner)/clients/[slug]/helpers/client-page-data.ts:19`; `client-faqs.ts:14,63`; `client-gallery.ts:23` | الدوال تبدأ بـ`"use cache"` وتُستهلك من شجرة الصفحة. |
| `/authors/[slug]` | بيانات الكاتب والمقالات | مكيّشة | `app/(site)/authors/[slug]/page.tsx:48,60,97,127` | دوال الصفحة المعلنة تبدأ بـ`"use cache"` قبل قراءات `db`. |
| `/audio` | `getAudioArticles` → `db.article.findMany` | مكيّشة | `app/(site)/audio/data/get-audio-articles.ts:44` | الدالة تحمل `"use cache"`. |
| `/industries/[slug]` | `getIndustryFeed` → `db.article.findMany` | مكيّشة | `app/(site)/industries/data/get-industry-feed.ts:67` | الدالة تحمل `"use cache"`. |
| `/modonty` | `getModontyReels/Phone/Gallery/Articles` | مكيّشة | `app/(site)/modonty/data/get-modonty-reels.ts:23`; `get-modonty-gallery.ts:29` | كل data accessor في المسار يحمل `"use cache"`. |
| `/` | `getCorePublisherArticles`, `homeFeedShapes`, `getServicesCard` | مكيّشة | `app/(site)/(homepage)/data/get-core-publisher-articles.ts:17`; `home-feed-shapes.ts:72`; `get-services-card.ts:21` | data accessors مكيّشة قبل استهلاك الصفحة. |
| `/search` | `getClientsSearch` → `db.client.findMany` | مكيّشة | `app/(site)/search/helpers/get-clients-search.ts:19` | الدالة تحمل `"use cache"`. |
| `/about`, `/contact`, `/story`, `/terms`, وسياسات legal | `get*Content/get*Metadata` → `db.modonty.findUnique` | مكيّشة | `app/(site)/about/helpers/about-content.ts:9`; `contact/helpers/contact-content.ts:13`; `terms/helpers/terms-content.ts:9` | accessors مكيّشة؛ الصفحات القانونية/عنّا تغلف المحتوى أيضاً بـ`<Suspense>`. |

## محروسة بحدّ Suspense

| المسار | الدالّة | الحكم | ملف:سطر | مكان الانتظار |
|---|---|---|---|---|
| كل صفحات الموقع (التذييل) | `getFooterStats` → تسعة `db.*.count` | محروسة بحدّ Suspense | `app/layout/helpers/get-footer-stats.ts:31-42`; `app/layout/components/Footer.tsx:38` | `Footer` داخل `<Suspense fallback={<FooterStatsSkeleton />}>`. |
| كل صفحات الموقع (جرس الإشعارات) | `NotificationsBell` → `db.notification.count` | محروسة بحدّ Suspense | `app/layout/components/notifications/NotificationsBell.tsx:14-21`; `app/layout/components/nav/TopNav.tsx:62-66` | الجرس غير مكيّش عمداً (`unstable_noStore`) لكن محاط بحد في الناف. |
| `/about` | `AboutContent` → محتوى الصفحة/العملاء/المجالات | محروسة بحدّ Suspense | `app/(site)/about/page.tsx:45-48,104-106` | `AboutContent` كله داخل `<Suspense>`. |
| `/modonty` (rail) | `ModontyGallery` | محروسة بحدّ Suspense | `app/(site)/modonty/components/left-rail/ModontyLeftRail.tsx:34`; `gallery/ModontyGallery.tsx:48-49` | gallery غير حتمية عند الطلب ومحاطة بـ`ModontyGallerySkeleton`. |
| `/clients/[slug]` | `PartnerHome` وشجرة بيانات الشريك | محروسة بحدّ Suspense | `app/(partner)/clients/[slug]/page.tsx:257` | محتوى الصفحة محاط بـ`<Suspense fallback={<PartnerHomeSkeleton />}>`. |

## ملاحظات نطاق

- `generateStaticParams` في الفئات والوسوم والشركاء يقرأ القاعدة (`categories/[slug]/page.tsx:24`، `tags/[slug]/page.tsx:24`، `clients/[slug]/page.tsx:37`) لكنه خطوة توليد مسارات، لا انتظار في شجرة صفحة الطلب؛ لذلك لم يُصنّف كمكشوف.
- صفحات الحساب التي تقرأ `auth()` أو بيانات المستخدم (`/users/notifications` و`/users/[id]`) ديناميكية بطبيعتها، لكنها تحقق تعريف «غير مكيّشة + انتظار جذري» حرفياً، فوضعتها في المكشوفة بدلاً من افتراض الاستثناء.
