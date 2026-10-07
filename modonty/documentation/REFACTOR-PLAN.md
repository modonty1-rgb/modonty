# REFACTOR-PLAN — modonty (المجلّد `modonty/` فقط)

الفرع: `cloud/refactor-modonty` · المرجع: `documents/cloud/REFACTOR-TASK.md` · تاريخ الجرد: ٧ أكتوبر ٢٠٢٦.
القاعدة: نفس التطبيق بالضبط — البنود الثمانية فقط، كل الممنوعات، `tsc` + `build` بعد كل commit.

## ٠. الأساس قبل أي تعديل

| القياس | القيمة |
|---|---|
| ملفات `.ts`/`.tsx` (app · components · lib · constants · types) | **1047** (منها 619 `.tsx`) |
| أسطر | **74,257** |
| ملفات > ٣٠٠ سطر | **21** |
| ملفات `"use client"` | 255 |
| ملفات `.tsx` تخلط منطقاً بعرض (البند ١) | **109** (عالٍ ١٧ · متوسط ٣١ · منخفض ٦١) |
| `knip`: ملفات بلا مستورِد | **55** |
| `knip`: تصديرات بلا مستورِد | **50** (+ تصديرَي أنواع مكرّرة ٢) |
| `knip`: أنواع مصدّرة بلا مستورِد | **156** |
| مكرّر متطابق سلوكاً (البند ٣) | **33 مجموعة** · مختلف (لا يُدمج) 32 |
| أغلفة DOM قابلة للإزالة/الدمج (البند ٦) | إزالة 12 · دمج 28 · غير متأكد 7 · غير آمن 40 |
| مخالفات `folder-structure.md` (البند ٧) | أشقاء 3 · قشرة 4 · ملف بمستهلك واحد في components/lib 42 · ملف مسار يستهلكه مساران 7 · ملفات متعدّدة الدوال 31 · أسماء 52 |

### ناتج الأدوات قبل التعديل (خام)

```
$ pnpm --filter ./modonty exec tsc --noEmit
(لا ناتج) — exit 0

$ pnpm --filter ./modonty build
▲ Next.js 16.3.4 (Turbopack)
✓ Compiled successfully in 36.2s
  Finished TypeScript in 30.6s ...
  Collecting page data using 3 workers ...
Error: AUTH_SECRET environment variable is required  (lib/auth.ts:13)
```

مع `AUTH_SECRET` و`DATABASE_URL` وهميَّين على سطر الأوامر (بلا لمس `.env*`) يمرّ التجميع وTypeScript،
وتفشل مرحلة prerender فقط لأن الصفحات تقرأ Mongo فعلياً (`lib/settings/get-site-language.ts:27`):
`Server selection timeout: No available servers` — لا قاعدة بيانات في حاوية الجلسة،
ولا يمكن تنزيل `mongod` (المنفذ محجوب) ولا تشغيل ثنائي خارجي.
**نطاق التحقّق المتاح هنا بعد كل commit:** `tsc --noEmit` كاملاً + مرحلتا Compile وTypeScript من `next build`.
مرحلة prerender تحتاج قاعدة بيانات وتُسجَّل فجوةً في الـPR.

### أسطر الأقسام قبل التعديل

| القسم | ملفات | أسطر |
|---|---|---|
| `app/(site)/(homepage)` | 24 | 1403 |
| `app/(site)/about` | 10 | 397 |
| `app/(site)/analytics` | 3 | 302 |
| `app/(site)/articles` | 102 | 8485 |
| `app/(site)/audio` | 5 | 614 |
| `app/(site)/authors` | 3 | 520 |
| `app/(site)/booking` | 3 | 154 |
| `app/(site)/categories` | 13 | 976 |
| `app/(site)/clients` | 27 | 1438 |
| `app/(site)/contact` | 9 | 463 |
| `app/(site)/help` | 19 | 1227 |
| `app/(site)/industries` | 20 | 924 |
| `app/(site)/legal` | 29 | 949 |
| `app/(site)/lucky-wheel` | 3 | 343 |
| `app/(site)/modo-chat` | 48 | 4836 |
| `app/(site)/modo-link` | 1 | 33 |
| `app/(site)/modonty` | 131 | 6671 |
| `app/(site)/news` | 7 | 384 |
| `app/(site)/quran` | 6 | 958 |
| `app/(site)/search` | 16 | 1174 |
| `app/(site)/shop` | 3 | 153 |
| `app/(site)/story` | 16 | 3086 |
| `app/(site)/subscribe` | 4 | 185 |
| `app/(site)/tags` | 10 | 863 |
| `app/(site)/team` | 5 | 236 |
| `app/(site)/terms` | 6 | 201 |
| `app/(site)/trending` | 8 | 551 |
| `app/(site)/trust` | 13 | 690 |
| `app/(site)/users` | 90 | 7307 |
| `app/(partner)/clients` | 113 | 7405 |
| `app/(fullscreen)/reels` | 34 | 2659 |
| `app/(fullscreen)/accounts` | 7 | 455 |
| `app/api` | 14 | 853 |
| `app/layout` | 39 | 2042 |
| `app/*.ts(x)` (layout · sitemap · robots · not-found · global-error) | 5 | 717 |
| `components` | 79 | 6514 |
| `lib` | 106 | 7497 |
| `constants` + `types` | 9 | 210 |

---

## ١. البند ١ — ملفات `.tsx` تخلط المنطق بالعرض (١٠٩)

الخطر: **عالٍ** = يلمس `"use cache"`/`cacheTag`/`noStore` أو شكل `select` أو ترتيب قائمة؛ **متوسط** = منطق مكرّر في عدّة ملفات أو مكوّن مشترك؛ **منخفض** = مساعد نقي.
النقل حرفي دائماً؛ الـdirective `"use cache"` يبقى على الدالة المنقولة كما هو (نفس `cacheTag`/`cacheLife`).

| # | الملف | أسطر | المنطق المخلوط (الدالة/الاستعلام، الأسطر) | الهدف | الخطر |
|---|---|---|---|---|---|
| 1 | `app/(fullscreen)/accounts/page.tsx` | 262 | `fallbackGraph()` JSON-LD ٧١-٨١ | helpers/ | منخفض |
| 2 | `app/(fullscreen)/reels/(index)/page.tsx` | 112 | `withState` دمج liked/fav ٥٩-٦٣ | helpers/ | منخفض |
| 3 | `app/(fullscreen)/reels/components/my-reels-sheet.tsx` | 136 | `useEffect` تحميل `fetchMyReels` ٤٠-٥٥ | hooks/ | منخفض |
| 4 | `app/(fullscreen)/reels/components/reels-feed-client.tsx` | 294 | IntersectionObserver ٤٤-٧٠؛ تتبّع المشاهدة ٧٢-٨٧؛ `loadMoreReels` ٨٩-١١٠ | hooks/ | متوسط |
| 5 | `app/(fullscreen)/reels/[slug]/components/reel-watch-player.tsx` | 86 | تتبّع المشاهدة ٢٥-٣٧ (نفس #4) | hooks/ | متوسط |
| 6 | `app/(fullscreen)/reels/components/reel-comments-sheet.tsx` | 236 | `fetchReelComments` effect ٥٧-٦٨ | hooks/ | منخفض |
| 7 | `app/(partner)/clients/[slug]/(index)/page.tsx` | 261 | `generateStaticParams` ٣٥-٥٢؛ `getClientForMetadata` ("use cache"+cacheTag+select) ٥٦-٧٧؛ robots ١٠٦-١١٧؛ `knownImages` ١٢١-١٢٤؛ `buildFallbackOrganization` ١٩٥-٢١٠ | helpers/ | عالٍ |
| 8 | `app/(partner)/clients/[slug]/components/chrome/platform-bar-actions-island.tsx` | 30 | `auth()` + `db.clientLike.findFirst` ١٩-٢٨ | helpers/ | عالٍ |
| 9 | `app/(partner)/clients/[slug]/components/chrome/platform-bar-actions.tsx` | 75 | share fetch `/api/share` ٢٤-٥٠ | helpers/ | متوسط |
| 10 | `app/(partner)/clients/[slug]/components/client-bottom-bar.tsx` | 249 | follow ٨٤-١٠٥؛ favorite ١٠٨-١٢٨؛ share ١٣٧-١٤٢ (ملف ميت عند knip) | hooks/ | متوسط |
| 11 | `app/(partner)/clients/[slug]/components/client-follow-button.tsx` | 134 | `fetchFollowStatus` ٣٨-٥٦؛ toggle ٧٠-١٠٠ | hooks/ | متوسط |
| 12 | `app/(partner)/clients/[slug]/components/client-newsletter-card.tsx` | 94 | subscribe fetch ٢٢-٤٥ (ملف ميت عند knip) | hooks/ | منخفض |
| 13 | `app/(partner)/clients/[slug]/components/client-view-tracker.tsx` | 32 | fetch `/api/view` ١٥-٢٣ | helpers/ | منخفض |
| 14 | `app/(partner)/clients/[slug]/components/share-client-button.tsx` | 43 | share fetch ٢٥-٣٠ (ملف ميت عند knip) | helpers/ | متوسط |
| 15 | `app/(partner)/clients/[slug]/components/partner-contact-tracker.tsx` | 47 | `kindOf()` ٢١-٢٩ | helpers/ | منخفض |
| 16 | `app/(partner)/clients/[slug]/components/hero/utils.tsx` | 62 | helpers بلا مكوّن (ملف ميت عند knip) | — | منخفض |
| 17 | `app/(partner)/clients/[slug]/components/nav/client-section-menu.tsx` | 192 | `useMemo` ترتيب LEAD_PRIORITY ٤٧-٦٢ (ملف ميت عند knip) | — | عالٍ |
| 18 | `app/(partner)/clients/[slug]/components/sections/client-about-section.tsx` | 115 | `foundingYear`/`languages`/`legalRows` ٥٨-٧٥ | helpers/ | منخفض |
| 19 | `…/sections/client-discussions-section.tsx` | 73 | `fmtDate` ١٨-٢٤، `initial` ٢٦-٢٨ (ملف ميت) | — | منخفض |
| 20 | `…/sections/client-faq-section.tsx` | 77 | `answeredCountLabel` ١٨-٢٣ (ملف ميت) | — | منخفض |
| 21 | `…/sections/client-video-embed.tsx` | 115 | `resolveEmbed()` ٢١-٣٥ | helpers/ | منخفض |
| 22 | `…/shell-hero/client-hero-v2.tsx` | 236 | `socialLinks` ٨٣-٨٨ (ملف ميت) | — | منخفض |
| 23 | `…/shell-hero/hero-stats.tsx` | 103 | `formatCompact` ٢٦-٣٣ (ملف ميت) | — | منخفض |
| 24 | `…/sidebar/client-hours.tsx` | 171 | `formatArabic12h` ٣٧-٤٦؛ `parseSpecs` ٤٩-٧٩؛ `buildRows` ٨٨-١٣١؛ `serverTodayName` ١٣٤-١٣٦؛ `hasOpeningHours` ١٣٩-١٤٣ (تصدير ميت) | helpers/ | عالٍ (ترتيب) |
| 25 | `…/sidebar/client-open-now-badge.tsx` | 108 | `toMinutes` ٢٧-٣٤؛ `formatArabic12h` ٣٧-٤٥ (نسخة #24)؛ `computeStatus` ٥٢-٧١ | helpers/ | متوسط |
| 26 | `…/sidebar/client-trust-card.tsx` | 189 | Intl ٨٥-٩٣؛ `rows` ٩٥-١١٠ (ملف ميت) | — | منخفض |
| 27 | `app/(site)/(homepage)/components/articles-list/MoreArticles.tsx` | 133 | `fetchMoreArticles` ٢٤-٣٦ | helpers/ | منخفض |
| 28 | `…/(homepage)/components/industries-card/IndustriesCarousel.tsx` | 112 | `hasIndustryImage` ٢٨-٣٠ (ملف ميت) | — | منخفض |
| 29 | `…/(homepage)/components/page-layout/CachedHomePage.tsx` | 90 | `getFeedChunk` ٢٤-٢٨ داخل مكوّن "use cache" | helpers/ (الـdirective يبقى) | عالٍ |
| 30 | `…/(homepage)/page/[pageNumber]/page.tsx` | 65 | `parsePageNumber` ٢٤-٢٨ | helpers/ | منخفض |
| 31 | `app/(site)/about/page.tsx` | 108 | `sanitizeJsonLd` ٣١-٣٣ (٨ نسخ)؛ `buildFallbackStructuredData` ٦٢-٧٠ | lib/ | متوسط |
| 32 | `app/(site)/analytics/page.tsx` | 259 | `ar`/`prettyDate`/`arEvent` ٣٧-٦٩؛ `dowItems`/`hourItems` ١٤٥-١٥٣ | helpers/ | عالٍ (ترتيب) |
| 33 | `app/(site)/articles/(index)/page.tsx` | 256 | `readState` ٤٧-٥٩؛ `describeScope` ٦٢-٨٢ | helpers/ | متوسط |
| 34 | `app/(site)/articles/[slug]/page.tsx` | 480 | `buildLanguagesMap` ٦٥-٨٣؛ `withoutTrailingBrand` ١١٥-١٢١؛ `ogLocaleAlternate` ٢١٨-٢٢٢ | helpers/ | متوسط |
| 35 | `…/articles/[slug]/components/audio-player/ArticleAudioPlayer.tsx` | 350 | `toArabic` ٤١، `clock` ٤٤-٥١ (٣ نسخ) | lib/ | متوسط |
| 36 | `…/articles/[slug]/components/body-link-tracker/BodyLinkTracker.tsx` | 48 | `handleClick` fetch ٩-٣٦ | helpers/ | منخفض |
| 37 | `…/articles/[slug]/components/comments/ArticleComments.tsx` | 336 | `fetchArticleComments` ٥٦-٦٧؛ `uniqueCommenters` ٧١-٧٧ | hooks/ | منخفض |
| 38 | `…/articles/[slug]/components/partner-card/PartnerCard.tsx` | 268 | `socialIconFor` ٢٦-٤١ (نسخة #39)؛ social dedupe ١٢٠-١٣٠ | helpers/ | متوسط |
| 39 | `…/partner-card/PartnerDetailsMobile.tsx` | 121 | `socialIconFor` ١٦-٣١ | helpers/ | متوسط |
| 40 | `…/top-engagement-bar/TopEngagementBar.tsx` | 288 | share fetch ١١٣-١١٨؛ `shareArticle()` ٢٧١-٢٨٨ | helpers/ | منخفض |
| 41 | `…/view-tracker/ViewTracker.tsx` | 95 | `getScrollDepth` ١٥-٢٢؛ POST/PATCH ٣٥-٧٨ | hooks/ + helpers/ | منخفض |
| 42 | `app/(site)/articles/components/more-articles/MoreArticles.tsx` | 92 | `toQuery` ٢٢-٣٢؛ `fetchPage` ٤٤-٥٥ | helpers/ | منخفض |
| 43 | `app/(site)/audio/components/listen-queue/ListenQueue.tsx` | 401 | `toArabic`/`clock` ٧٣-٨٢؛ `totalPhrase` ٨٥-٩٣؛ `totalSeconds` ١٢٥ | lib/ + helpers/ | متوسط |
| 44 | `app/(site)/authors/[slug]/page.tsx` | 468 | `parseAuthorPage` ٤١-٤٤؛ `generateStaticParams` ٤٦-٥٧؛ `getAuthorBySlug` ٥٩-٨٩؛ `getAuthorArticles` ("use cache") ٩١-١١٩؛ `getAuthorForMetadata` ("use cache") ١٢٣-١٤٠؛ JSON-LD ٢٤٣-٢٨٨ | helpers/ | عالٍ |
| 45 | `app/(site)/categories/(index)/page.tsx` | 165 | `toCard` ٦٣-٧٤؛ `buildFallbackJsonLd` ٩٤-٩٨ | helpers/ | منخفض |
| 46 | `app/(site)/categories/[slug]/page.tsx` | 199 | `generateStaticParams` ٢١-٢٩؛ `getCategoryForMetadata` ("use cache") ٣١-٤٦ | helpers/ | عالٍ |
| 47 | `app/(site)/contact/page.tsx` | 88 | `sanitizeJsonLd` ٣٣-٣٥؛ `buildFallbackStructuredData` ٥٢-٥٩ | lib/ | متوسط |
| 48 | `app/(site)/help/faq/page.tsx` | 121 | `fallback` ١٩-٢٦؛ `sanitizeJsonLd` ٤٣-٤٥؛ `lastUpdated` ٥٤-٥٩ | helpers/ + lib/ | متوسط |
| 49 | `app/(site)/help/faq/components/faq-accordion.tsx` | 195 | `checkFeedbacks` ٣١-٦٠ | hooks/ | منخفض |
| 50 | `app/(site)/help/faq/components/faq-page-content.tsx` | 120 | useMemo فلترة ٢٧-٣٦؛ ترقيم ٣٨-٤٣ | hooks/ | منخفض |
| 51 | `app/(site)/industries/(index)/page.tsx` | 91 | `buildPageHref` ٥٥؛ `buildFallbackJsonLd` ٥٨-٦٢ | helpers/ | منخفض |
| 52-55 | `app/(site)/legal/{cookie-policy,copyright-policy,privacy-policy,user-agreement}/page.tsx` | ~90 | `sanitizeJsonLd` ٢٧-٢٩؛ `buildFallbackStructuredData` ~٥١-٥٨ | lib/ | متوسط |
| 56 | `app/(site)/lucky-wheel/lucky-wheel.tsx` | 301 | `celebrateModontyGift` ١٦-٢٤؛ `spin()` fetch ١٠٠-١٦٠ | hooks/ + helpers/ | منخفض |
| 57 | `app/(site)/modo-chat/components/chat-list/ChatList.tsx` | 950 | `formatPartnerCount` ٣٤-٣٨؛ effects ١٦٨-٢٢٧؛ `doChat` streaming ٢٢٩-٤٢٢؛ `submit` ٤٢٤-٤٨٢؛ `confirmIndustrySuggestion` ٤٨٤-٥٠١ | hooks/ | متوسط |
| 58 | `app/(site)/modo-chat/components/history-list/HistoryList.tsx` | 242 | `formatRelativeDate` ٣٣-٤٦؛ history fetch ٦٤-٧٦ | helpers/ + hooks/ | منخفض |
| 59 | `app/(site)/modonty/page.tsx` | 238 | page parsing ٥٣-٥٤/١٣١؛ `applyView` ١٠٤-١٠٨؛ `buildHref` ١٤٠-١٤٦ | helpers/ | عالٍ (ترتيب) |
| 60 | `app/(site)/modonty/ai/page.tsx` | 155 | `updated` ٥٣-٥٧ | helpers/ | منخفض |
| 61 | `app/(site)/modonty/football/page.tsx` | 166 | `updated` ٥٩-٦٧ | helpers/ | منخفض |
| 62 | `app/(site)/modonty/components/articles-feed/MoreModontyArticles.tsx` | 99 | `fetchPage` ٤٥-٥٥ | helpers/ | منخفض |
| 63 | `app/(site)/modonty/components/gallery/ModontyGallery.tsx` | 117 | `shuffle` ١١٠-١١٧ | helpers/ | عالٍ (ترتيب) |
| 64 | `app/(site)/modonty/components/sector-hero/SectorHeroBanner.tsx` | 42 | `blurOf` ٩ | helpers/ | منخفض |
| 65 | `…/education/components/free-learning/FreeLearningCard.tsx` | 68 | `duration` ١٠ | helpers/ | منخفض |
| 66 | `…/education/components/holiday-countdown/HolidayCountdown.tsx` | 69 | `daysBetween` ٢٣؛ `upcoming` ٣١ | helpers/ | منخفض |
| 67 | `…/entertainment/components/city-guide/CityGuide.tsx` | 160 | `pick()` fetch ٤٠-٥٥ | hooks/ | منخفض |
| 68 | `…/football/components/season-facts/SeasonFacts.tsx` | 44 | `valueLine` ٩-١٤ | helpers/ | منخفض |
| 69 | `…/football/components/standings-card/StandingsCard.tsx` | 78 | `n` ٩، `signed` ١١ | helpers/ | منخفض |
| 70 | `…/football/components/team-mark/TeamMark.tsx` | 42 | `initial` ٦ | helpers/ | منخفض |
| 71 | `…/health/components/facility-lookup/FacilityLookup.tsx` | 53 | `statusClass` ١٦ | helpers/ | منخفض |
| 72 | `app/(site)/news/(index)/page.tsx` | 143 | `newsTitle` ١٦ | helpers/ | منخفض |
| 73 | `app/(site)/news/subscribe/components/news-subscribe-form.tsx` | 99 | fetch `/api/news/subscribe` ٢٠-٤٠ | hooks/ | متوسط |
| 74 | `app/(site)/quran/components/quran-player/QuranPlayer.tsx` | 647 | `toArabic`/`clock`/`shortName` ٢٣-٣٧؛ localStorage ١٣٩-١٧٥؛ `bare` ٢٧٤-٢٨٦ | lib/ + hooks/ + helpers/ | متوسط |
| 75 | `app/(site)/search/page.tsx` | 126 | `normalize*` ٢٤-٤٦؛ `format*ResultsCount` ٦٣-٧٧ | helpers/ | منخفض |
| 76 | `app/(site)/search/components/SearchResults.tsx` | 161 | `buildPaginationUrl` ٢٥-٣٨ | helpers/ | متوسط |
| 77 | `app/(site)/search/components/SearchSortBar.tsx` | 102 | `buildSearchUrl` ٣٢-٤٧ | helpers/ | متوسط |
| 78 | `app/(site)/search/components/SearchInput.tsx` | 175 | `scopeFromParam` ١١-١٣ | helpers/ | منخفض |
| 79 | `app/(site)/search/components/sort-dropdown.tsx` | 88 | `sortClients` ٦٢-٨٨ (تصدير ميت) | — | عالٍ |
| 80 | `app/(site)/story/page.tsx` | 142 | `STORY_TRANSCRIPT` ١٨-٢٨؛ `buildPodcastSeries` ٤٧-٦١ | helpers/ | منخفض |
| 81 | `app/(site)/story/SalesPitchPage.tsx` | 1722 | `salesWhatsappUrl` ٧٨-٨١؛ `formatTime` ٨٤-٨٨؛ manifest fetch ١٥٦-١٨٢؛ `highlightIndices` ٢٩١-٣١٧؛ `highlightStates` ٣٣١-٣٧٠ | helpers/ + hooks/ | عالٍ |
| 82 | `app/(site)/subscribe/components/subscribe-form.tsx` | 102 | fetch `/api/news/subscribe` ٢٥-٤٥ | hooks/ | متوسط |
| 83 | `app/(site)/tags/(index)/page.tsx` | 189 | `buildFallbackJsonLd` ٨٩-١١٥ | helpers/ | متوسط |
| 84 | `app/(site)/tags/[slug]/page.tsx` | 296 | `generateStaticParams` ٢٢-٣٠؛ "use cache": `getTagBySlug` ٤٥-٦١، `getTagClients` ٦٣-٩٢، `getClientsRatings` ٩٥-١٠٥، `getTagForMetadata` ١٠٧-١٢١، `countTagArticles` ١٢٥-١٣٦؛ `ratingMap` ١٨٦-١٩٣ | helpers/ | عالٍ |
| 85 | `app/(site)/team/page.tsx` | 82 | `SECTIONS` ١٩-٢٤ | helpers/ | منخفض |
| 86 | `app/(site)/terms/page.tsx` | 89 | `sanitizeJsonLd` ٢٧-٢٩؛ `buildFallbackStructuredData` ٥١-٥٨ | lib/ | متوسط |
| 87 | `app/(site)/trending/page.tsx` | 115 | `getPeriodText` ٣٣-٣٨؛ `trending` map ٤١-٦١ | helpers/ | منخفض |
| 88 | `app/(site)/trust/components/location-card/LocationCard.tsx` | 75 | `mapEmbedUrl`/`mapLinkUrl` ١٤-١٦ | helpers/ | منخفض |
| 89 | `app/(site)/users/[id]/page.tsx` | 307 | `generateMetadata` db ٢٧/٣٧؛ `getProfileData` ("use cache") ١٠٣-١٤١؛ `initials` ١٦٨-١٧٣ | helpers/ | عالٍ |
| 90 | `app/(site)/users/login/page.tsx` | 56 | `toSafeCallbackUrl` ٢٨-٣٤ | helpers/ | منخفض |
| 91 | `app/(site)/users/notifications/page.tsx` | 388 | `NotificationsContent` ٦ استعلامات db ٩١-١٣٦؛ tab filter ١٤٠-١٤٥ | helpers/ | عالٍ |
| 92 | `app/(site)/users/verify-email/page.tsx` | 61 | db read/delete/updateMany أثناء الرندر ١٧-٣٨ | helpers/ | عالٍ |
| 93 | `…/users/profile/settings/components/alerts-settings.tsx` | 199 | `getAlertSettings` effect ٣٩-٥٢ | hooks/ | منخفض |
| 94 | `…/profile-settings.tsx` | 221 | avatar upload fetch ٨٥-١٠٠ | hooks/ | منخفض |
| 95 | `…/security-settings.tsx` | 296 | `fetchAccounts` ٤٦-٦٤؛ `getProviderName` ١٠٦-١١٢ | hooks/ + helpers/ | منخفض |
| 96 | `app/layout/components/FooterStats.tsx` | 137 | `formatHero` ٤٥-٥٠؛ `hero`/`cells` ٦٤-٧٦ | helpers/ | منخفض |
| 97 | `app/layout/components/analytics/PageViewTracker.tsx` | 32 | fetch POST ٢٣-٢٨ | helpers/ | منخفض |
| 98 | `app/layout/components/analytics/clarity-page-type.tsx` | 31 | `pageTypeOf` ٩-١٨ | helpers/ | منخفض |
| 99 | `app/layout/components/nav/NavLinksClient.tsx` | 77 | `activeIndexFor` ١٨-٢٥ | helpers/ | منخفض |
| 100 | `app/layout/components/notifications/NotificationsBell.tsx` | 52 | `unstable_noStore` + `auth()` + `db.notification.count` ٩-٣٢ | helpers/ | عالٍ |
| 101 | `components/cta/cta-tracked-link.tsx` | 65 | `isWhatsAppHref` ٩-١٦ | helpers/ | منخفض |
| 102 | `components/date/RelativeTime.tsx` | 49 | `formatRelative` ٩-٢٠؛ `formatAbsolute` ٢٢-٢٨ | lib/ | متوسط |
| 103 | `components/feed/postcard/PostCardAvatar.tsx` | 58 | `initials` ٢٥-٢٩ | lib/ | متوسط |
| 104 | `components/shared/booking-form/PhoneField.tsx` | 179 | `resolveDefault` ٤٤-٤٧ | helpers/ | منخفض |
| 105 | `components/shared/capability-icons/CapabilityIcons.tsx` | 64 | `collect` ٢٤-٣٣ | helpers/ | منخفض |
| 106 | `components/shared/contact-form/ContactForm.tsx` | 149 | fetch POST `/contact/api` ٣٠-٥٥ | hooks/ | متوسط |
| 107 | `components/shared/mobile-cta-bar/FollowCtaButton.tsx` | 130 | `send()` ٥٤-٧٠؛ follow-status effect ٧٢-٨٥ | hooks/ | متوسط |
| 108 | `components/shared/quick-links/OrbitQuickLinks.tsx` | 173 | `getOrbitSteps` ٦٩؛ `getOrbitOffset` ٨٦-٨٨ | helpers/ | منخفض |
| 109 | `components/shared/reels-card/ReelsCard.tsx` | 122 | `getSidebarTileWidth` ٣٩-٤٣ | helpers/ | منخفض |

المجموع: ١٠٩ ملف مختلط — (fullscreen) ٦ · (partner) ٢٠ · (site) ٦٩ · app/layout ٥ · components/ ٩ · lib/ ٠. الخطر: ١٧ عالٍ · ٣١ متوسط · ٦١ منخفض.
لا zod schemas ولا `unstable_cache`/`cache(` داخل أي `.tsx`. `"use cache"` داخل `.tsx`: ٦ ملفات (tags/[slug] · categories/[slug] · authors/[slug] · users/[id] · clients/[slug]/(index) · CachedHomePage).

---

## ٢. البند ٢ — الكود الميت (`knip` + `grep`)

أمر `knip` (نُفِّذ بإعدادات مؤقّتة من خارج الريبو، لم يُضَف لأي `package.json`): entry = `page/layout/route/loading/error/not-found/sitemap/robots` + `instrumentation.ts` + `proxy.ts` + `auth.config.ts` + `next.config.ts` + `scripts/**`. الناتج الخام محفوظ في الـPR.

### ٢.أ ملفات بلا مستورِد (٥٥) — ما يُحذف وما يُحتجز

**يُحتجز — لا يُحذف** (قرار خالد موثّق: «الإخفاء ≠ الحذف»، بطاقة T7/DEADUI7، «بانتظار كلمتك»):

| الملف | الدليل على الاحتجاز |
|---|---|
| `app/(site)/(homepage)/components/industries-card/IndustriesCard.tsx` · `IndustriesCarousel.tsx` · `services-card/ServicesCard.tsx` · `data/get-services-card.ts` · `data/get-core-publisher-articles.ts` | `RightSidebar.tsx:14` «hidden, not deleted (Khalid, 2026-08-16)»؛ `HOMEPAGE-BOARD.html:49` بطاقة DEADUI7 مفتوحة؛ `clients/TASK.md:38` «قرار حذفه لك» |
| `app/(site)/clients/components/{client-card-cta,client-card-loading,empty-state,featured-partners-slider,industry-chips,view-toggle}.tsx` · `helpers/{get-clients-with-counts,use-client-search,use-debounce}.ts` | `clients/TASK.md:25` «لم تُحذف، بانتظار كلمتك» |
| `app/(site)/modonty/football/components/scorers-card/ScorersCard.tsx` | `football/page.tsx:145` «ScorersCard stays in the folder» (خالد ٢٧ سبتمبر) |
| `app/(partner)/clients/[slug]/components/shell-hero/{client-hero-v2,hero-chips,hero-cta-row,hero-google-stat,hero-stats}.tsx` | `client-hero-v2.tsx:150` «غير مُستدعىً اليوم… كي لا يعود خاطئاً إن أُحيي»؛ `(index)/loading.tsx:4` يحاكيه |
| `app/(partner)/clients/[slug]/helpers/seed-client1-test-data.ts` | يستدعيه `package.json#scripts.seed:client1` (المسار فيه قديم `app/clients/...` — `package.json` ممنوع لمسه) |

**يُحذف** (صفر مستورِد في knip + صفر ذِكر في الكود عدا التعليقات والتوثيق، يُعاد التحقّق بـ`grep` لحظة الحذف):

| الملف | الأسطر |
|---|---|
| `app/(fullscreen)/reels/components/reels-bottom-bar.tsx` | 40 |
| `app/(partner)/clients/[slug]/components/client-bottom-bar.tsx` | 249 |
| `app/(partner)/clients/[slug]/components/client-contact-sheet.tsx` | 182 |
| `app/(partner)/clients/[slug]/components/client-footer-cta.tsx` | 28 |
| `app/(partner)/clients/[slug]/components/client-newsletter-card.tsx` | 94 |
| `app/(partner)/clients/[slug]/components/client-whatsapp-fab.tsx` | 46 |
| `app/(partner)/clients/[slug]/components/hero/utils.tsx` | 62 |
| `app/(partner)/clients/[slug]/components/nav/client-section-items.ts` | 9 |
| `app/(partner)/clients/[slug]/components/nav/client-section-menu.tsx` | 192 |
| `app/(partner)/clients/[slug]/components/nav/client-section-nav.tsx` | 97 |
| `app/(partner)/clients/[slug]/components/page-frame.tsx` | 54 |
| `app/(partner)/clients/[slug]/components/related-clients.tsx` | 63 |
| `app/(partner)/clients/[slug]/components/sections/client-discussions-section.tsx` | 73 |
| `app/(partner)/clients/[slug]/components/sections/client-faq-section.tsx` | 77 |
| `app/(partner)/clients/[slug]/components/sections/client-results-section.tsx` | 65 |
| `app/(partner)/clients/[slug]/components/sections/gallery-interactive.tsx` | 48 |
| `app/(partner)/clients/[slug]/components/sections/gallery-lightbox-overlay.tsx` | 162 |
| `app/(partner)/clients/[slug]/components/share-client-button-wrapper.tsx` | 28 |
| `app/(partner)/clients/[slug]/components/share-client-button.tsx` | 43 |
| `app/(partner)/clients/[slug]/components/sidebar/client-quick-contact.tsx` | 69 |
| `app/(partner)/clients/[slug]/components/sidebar/client-trust-card.tsx` | 189 |
| `app/(site)/articles/[slug]/actions/dislike-article.ts` | 75 |
| `app/(site)/articles/components/core-articles-rail/CoreArticlesRail.tsx` | 19 |
| `app/(site)/articles/data/index.ts` | 6 |
| `app/(site)/industries/actions.ts` | 35 |
| `app/(site)/industries/helpers/get-industries-page.ts` | 19 |
| `app/(site)/modo-chat/helpers/has-trusted-content.ts` | 29 |
| `components/cta/whatsapp-booking-cta.tsx` | 59 |
| `components/share/ShareButtons.tsx` | 145 |
| `components/shared/industry-cards/IndustryCards.tsx` | 42 |
| `components/shared/quick-links/ActiveTabMarker.tsx` | 33 |
| `components/shared/quick-links/QuickLinks.tsx` | 100 |
| `components/shared/scroller/Scroller.tsx` | 33 |
| `lib/mobile-push.ts` | 65 |

ملاحظات: `page-frame.tsx` يُستدعى من `page-blocks.tsx`؟ — knip يقول لا؛ يُتحقَّق بـ`grep` قبل الحذف (`page-frame-skeleton.tsx` ملف آخر حيّ). `app/(site)/industries/actions.ts` هو server action بلا مستدعٍ (الصفحة لا تستعمل `loadMoreIndustries`) — يُتحقَّق. `lib/analytics/__tests__/validate-events.mjs` سكربت بلا مستورِد (خارج tsc) — يُحذف أيضاً.

### ٢.ب تصديرات بلا مستورِد (٥٠)

القاعدة: ما لا يُستعمل حتى داخل ملفه يُحذف؛ ما يُستعمل داخل ملفه فقط يُنزع عنه `export`.

| التصدير | الملف |
|---|---|
| `reelsBarItems` | `app/(fullscreen)/reels/helpers/reels-nav-destinations.ts:20:14` |
| `hasOpeningHours` | `app/(partner)/clients/[slug]/components/sidebar/client-hours.tsx:139:17` |
| `buildSiteLinks` | `app/(partner)/clients/[slug]/helpers/build-chrome-data.ts:8:17` |
| `getClientPublishedFaqs` | `app/(partner)/clients/[slug]/helpers/client-faqs.ts:14:23` |
| `getClientReviews` | `app/(partner)/clients/[slug]/helpers/client-reviews.ts:27:23` |
| `homeFeedSelect` | `app/(site)/(homepage)/data/home-feed-shapes.ts:11:14` |
| `mapHomeFeedArticle` | `app/(site)/(homepage)/data/home-feed-shapes.ts:45:17` |
| `ArticleTags` | `app/(site)/articles/[slug]/components/article-tags/ArticleTags.tsx:24:17` |
| `ArticleTags` | `app/(site)/articles/[slug]/components/index.ts:2:10` |
| `ArticleFaq` | `app/(site)/articles/[slug]/components/index.ts:4:10` |
| `ArticleComments` | `app/(site)/articles/[slug]/components/index.ts:6:10` |
| `CommentFormDialog` | `app/(site)/articles/[slug]/components/index.ts:12:10` |
| `getArticleComments` | `app/(site)/articles/[slug]/data/index.ts:7:10` |
| `getPendingFaqsForCurrentUser` | `app/(site)/articles/[slug]/data/index.ts:9:10` |
| `buildAspectRatioUrl` | `app/(site)/articles/[slug]/helpers/image-aspect-ratios.ts:32:17` |
| `TrustHint` | `app/(site)/articles/components/trust-box/TrustBox.tsx:23:17` |
| `FREE_TRIAL_QUESTIONS` | `app/(site)/modo-chat/data/check-anonymous-quota.ts:7:14` |
| `readAnonymousTrial` | `app/(site)/modo-chat/data/check-anonymous-quota.ts:49:23` |
| `invalidateArticleChunks` | `app/(site)/modo-chat/data/get-embedded-chunks.ts:139:23` |
| `chatBodySchema` | `app/(site)/modo-chat/data/guard-chat-request.ts:20:14` |
| `sortClients` | `app/(site)/search/components/sort-dropdown.tsx:62:17` |
| `calculateEngagementScore` | `app/(site)/search/helpers/format-metrics.ts:7:17` |
| `getEngagementLabel` | `app/(site)/search/helpers/format-metrics.ts:23:17` |
| `TASHKEEL_REGEX` | `app/(site)/story/_utils/arabic.ts:6:14` |
| `TEAM_PAGE_URL` | `app/(site)/team/helpers/build-team-jsonld.ts:6:14` |
| `WhatsAppIconLink` | `components/cta/whatsapp-icon-link.tsx:55:14` |
| `SHOW_CLIENT_ENGAGEMENT_STATS` | `constants/feature-flags.ts:21:14` |
| `SHOW_CLIENT_ENGAGEMENT_STATS` | `constants/index.ts:26:41` |
| `GA4_EVENTS` | `lib/analytics/events-registry.ts:227:14` |
| `trackArticleView` | `lib/analytics/events-registry.ts:289:14` |
| `trackClientView` | `lib/analytics/events-registry.ts:307:14` |
| `trackReelViewEvent` | `lib/analytics/events-registry.ts:314:14` |
| `trackClientCommentSubmit` | `lib/analytics/events-registry.ts:325:14` |
| `trackOutboundClick` | `lib/analytics/events-registry.ts:333:14` |
| `trackCampaignInterest` | `lib/analytics/events-registry.ts:351:14` |
| `trackLeadQualified` | `lib/analytics/events-registry.ts:369:14` |
| `GA4_BROWSER_EVENTS` | `lib/analytics/ga4-browser.ts:27:14` |
| `sendGA4EventAwait` | `lib/analytics/ga4-server.ts:141:23` |
| `getClientDigitalImpact` | `lib/analytics/ga4.ts:295:23` |
| `getOrCreateVisitorId` | `lib/analytics/visitor-cookie.ts:57:23` |
| `getSessionId` | `lib/analytics/visitor-cookie.ts:87:23` |
| `getPageLocation` | `lib/analytics/visitor-cookie.ts:132:23` |
| `clearSlugCaches` | `lib/archive-cache.ts:222:17` |
| `signIn` | `lib/auth.ts:18:32` |
| `signOut` | `lib/auth.ts:18:40` |
| `INDUSTRY_TONES` | `lib/industry-tones.ts:14:14` |
| `toneForIndex` | `lib/industry-tones.ts:22:17` |
| `normalizeStoredSiteEntityIds` | `lib/seo/index.ts:34:17` |
| `EMPTY_LEGAL_ENTITY` | `lib/seo/organization-jsonld.ts:49:14` |
| `getWhatsAppNumber` | `lib/whatsapp.ts:7:17` |

### ٢.ج أنواع مصدّرة بلا مستورِد (١٥٦)

نفس القاعدة (نزع `export` أو حذف). القائمة كاملة:

| النوع | الملف |
|---|---|
| `AccountsData` | `app/(fullscreen)/accounts/helpers/get-accounts-data.ts:8:13` |
| `LoadMoreResult` | `app/(fullscreen)/reels/actions/load-more.ts:8:18` |
| `ReelViewGa4Params` | `app/(fullscreen)/reels/actions/track-reel-view.ts:7:18` |
| `ClientQuestionFormData` | `app/(partner)/clients/[slug]/actions/client-faq-actions.ts:20:13` |
| `ClientPageState` | `app/(partner)/clients/[slug]/components/client-page-state.ts:8:13` |
| `ClientPageStateSignals` | `app/(partner)/clients/[slug]/components/client-page-state.ts:10:18` |
| `ClientTeamMember` | `app/(partner)/clients/[slug]/components/sections/client-team-section.tsx:4:18` |
| `ClientPublishedFAQ` | `app/(partner)/clients/[slug]/helpers/client-faqs.ts:5:18` |
| `ClientPageFAQ` | `app/(partner)/clients/[slug]/helpers/client-faqs.ts:48:18` |
| `ClientGalleryImage` | `app/(partner)/clients/[slug]/helpers/client-gallery.ts:5:18` |
| `ClientReviewItem` | `app/(partner)/clients/[slug]/helpers/client-reviews.ts:11:18` |
| `ClientReviewsData` | `app/(partner)/clients/[slug]/helpers/client-reviews.ts:19:18` |
| `MoreArticlesResult` | `app/(site)/(homepage)/data/get-more-articles.ts:8:18` |
| `ArticleLiveCounts` | `app/(site)/articles/[slug]/data/get-article-live-counts.ts:5:18` |
| `ArticleDefaultsFromSettings` | `app/(site)/articles/[slug]/helpers/get-article-defaults-from-settings.ts:11:13` |
| `Viewer` | `app/(site)/articles/[slug]/helpers/get-viewer.ts:5:18` |
| `AspectRatio` | `app/(site)/articles/[slug]/helpers/image-aspect-ratios.ts:21:13` |
| `ArticleImageObject` | `app/(site)/articles/[slug]/helpers/image-aspect-ratios.ts:53:18` |
| `ArticleOutline` | `app/(site)/articles/[slug]/helpers/read-article-outline.ts:7:18` |
| `ResolvedArticleCta` | `app/(site)/articles/[slug]/helpers/resolve-article-cta.ts:1:18` |
| `ListenQueueLabels` | `app/(site)/audio/components/listen-queue/ListenQueue.tsx:33:18` |
| `CategoryWithArticles` | `app/(site)/categories/helpers/categories-page-size.ts:5:13` |
| `ArticleWithClientLogo` | `app/(site)/categories/helpers/categories-page-size.ts:39:13` |
| `TrialVerdict` | `app/(site)/modo-chat/data/check-anonymous-quota.ts:12:18` |
| `RateLimitVerdict` | `app/(site)/modo-chat/data/check-rate-limit.ts:29:18` |
| `AnsweredFaq` | `app/(site)/modo-chat/data/get-answered-faqs.ts:7:18` |
| `ArticleRef` | `app/(site)/modo-chat/data/get-embedded-chunks.ts:17:18` |
| `IndustryScope` | `app/(site)/modo-chat/data/get-industry-scope.ts:8:18` |
| `VisitorMemory` | `app/(site)/modo-chat/data/get-visitor-memory.ts:9:18` |
| `ChatTurnContext` | `app/(site)/modo-chat/data/guard-chat-request.ts:35:18` |
| `RankablePartner` | `app/(site)/modo-chat/data/rank-partners.ts:8:13` |
| `RetrievalResult` | `app/(site)/modo-chat/data/retrieve-from-embedded.ts:46:18` |
| `WebSource` | `app/(site)/modo-chat/data/save-chatbot-message.ts:3:13` |
| `RedirectArticle` | `app/(site)/modo-chat/data/save-chatbot-message.ts:4:13` |
| `StreamAnswerParams` | `app/(site)/modo-chat/data/stream-answer-response.ts:9:18` |
| `ScopeIconComponent` | `app/(site)/modo-chat/helpers/get-scope-icon.ts:18:13` |
| `AiPage` | `app/(site)/modonty/ai/data/get-ai-page.ts:9:18` |
| `BriefSource` | `app/(site)/modonty/ai/data/get-arabic-briefs.ts:16:18` |
| `FeedPaper` | `app/(site)/modonty/ai/helpers/parse-arxiv-feed.ts:9:13` |
| `CalendarCardLabels` | `app/(site)/modonty/education/components/calendar-card/CalendarCard.tsx:7:18` |
| `HolidayCountdownLabels` | `…ite)/modonty/education/components/holiday-countdown/HolidayCountdown.tsx:10:18` |
| `ProgramLookupLabels` | `app/(site)/modonty/education/components/program-lookup/ProgramLookup.tsx:12:18` |
| `SchoolLookupLabels` | `app/(site)/modonty/education/components/school-lookup/SchoolLookup.tsx:12:18` |
| `CityGuideLabels` | `app/(site)/modonty/entertainment/components/city-guide/CityGuide.tsx:11:18` |
| `ActivityLookupLabels` | `…)/modonty/entrepreneurship/components/activity-lookup/ActivityLookup.tsx:12:18` |
| `BreakEvenLabels` | `…/modonty/entrepreneurship/components/calculators/BreakEvenCalculator.tsx:10:18` |
| `PriceCalculatorLabels` | `…site)/modonty/entrepreneurship/components/calculators/PriceCalculator.tsx:9:18` |
| `CrestsByApiName` | `app/(site)/modonty/football/data/get-club-crests.ts:6:13` |
| `FootballPage` | `app/(site)/modonty/football/data/get-football-page.ts:17:18` |
| `WikiCell` | `app/(site)/modonty/football/helpers/read-wiki-table.ts:1:18` |
| `DrugLookupLabels` | `app/(site)/modonty/health/components/drug-lookup/DrugLookup.tsx:8:18` |
| `FacilityLookupLabels` | `app/(site)/modonty/health/components/facility-lookup/FacilityLookup.tsx:8:18` |
| `AlertState` | `app/(site)/modonty/helpers/get-alert-state.ts:6:13` |
| `SectorSlug` | `app/(site)/modonty/helpers/sectors.ts:14:13` |
| `SearchState` | `app/(site)/modonty/helpers/use-debounced-search.ts:5:13` |
| `QuranPlayerLabels` | `app/(site)/quran/components/quran-player/QuranPlayer.tsx:55:18` |
| `Reciter` | `app/(site)/quran/data/quran-reciters.ts:1:18` |
| `Surah` | `app/(site)/quran/data/quran-surahs.ts:1:18` |
| `Phrase` | `app/(site)/story/_utils/phrases.ts:5:18` |
| `TrendingScore` | `app/(site)/trending/helpers/calculate-trending-score.ts:10:18` |
| `TrendingInteractions` | `app/(site)/trending/helpers/calculate-trending-score.ts:16:18` |
| `ProfileActivity` | `app/(site)/users/profile/helpers/profile-activity.ts:24:18` |
| `ProfileBooking` | `app/(site)/users/profile/helpers/profile-bookings.ts:4:18` |
| `VisibleCommentStatus` | `app/(site)/users/profile/helpers/profile-comments.ts:5:13` |
| `UserComment` | `app/(site)/users/profile/helpers/profile-comments.ts:7:18` |
| `CommentsPagination` | `app/(site)/users/profile/helpers/profile-comments.ts:23:18` |
| `ProfileComments` | `app/(site)/users/profile/helpers/profile-comments.ts:30:18` |
| `FavoritedArticle` | `app/(site)/users/profile/helpers/profile-favorites.ts:5:18` |
| `FollowedClient` | `app/(site)/users/profile/helpers/profile-following.ts:4:18` |
| `ProfileStats` | `app/(site)/users/profile/helpers/profile-stats.ts:3:18` |
| `MobileMenuLabels` | `app/layout/components/nav/MobileMenuClient.tsx:14:18` |
| `MobileMenuSections` | `app/layout/components/nav/MobileMenuClient.tsx:24:18` |
| `MobileMenuItems` | `app/layout/components/nav/MobileMenuClient.tsx:30:18` |
| `MainNavItemDef` | `app/layout/helpers/nav-items.ts:15:18` |
| `EntityIconComponent` | `components/listing/entity-utils.ts:11:13` |
| `ListingHeroAccent` | `components/listing/ListingHero.tsx:3:13` |
| `PhoneFieldValue` | `components/shared/booking-form/PhoneField.tsx:49:18` |
| `PartnerCapabilities` | `components/shared/capability-icons/CapabilityIcons.tsx:10:18` |
| `IndustryGridItem` | `components/shared/industry-grid/IndustryGrid.tsx:4:13` |
| `SourceClassification` | `lib/analytics/classify-source.ts:13:18` |
| `CreateConversionData` | `lib/analytics/conversion-tracking.ts:41:18` |
| `CtaClickPayload` | `lib/analytics/cta-tracking.ts:5:18` |
| `ArticleViewParams` | `lib/analytics/events-registry.ts:37:18` |
| `ArticleLikeParams` | `lib/analytics/events-registry.ts:38:18` |
| `ArticleDislikeParams` | `lib/analytics/events-registry.ts:39:18` |
| `ArticleFavoriteParams` | `lib/analytics/events-registry.ts:40:18` |
| `ArticleShareParams` | `lib/analytics/events-registry.ts:41:18` |
| `CommentSubmitParams` | `lib/analytics/events-registry.ts:44:18` |
| `CommentReplyParams` | `lib/analytics/events-registry.ts:48:18` |
| `CommentLikeParams` | `lib/analytics/events-registry.ts:51:18` |
| `ClientViewParams` | `lib/analytics/events-registry.ts:57:18` |
| `ClientShareParams` | `lib/analytics/events-registry.ts:58:18` |
| `ClientFavoriteParams` | `lib/analytics/events-registry.ts:61:18` |
| `ClientCommentSubmitParams` | `lib/analytics/events-registry.ts:62:18` |
| `NewsletterSubscribeParams` | `lib/analytics/events-registry.ts:65:18` |
| `ReelViewParams` | `lib/analytics/events-registry.ts:90:18` |
| `ReelLikeParams` | `lib/analytics/events-registry.ts:91:18` |
| `ReelFavoriteParams` | `lib/analytics/events-registry.ts:92:18` |
| `ReelShareParams` | `lib/analytics/events-registry.ts:93:18` |
| `ReelCommentSubmitParams` | `lib/analytics/events-registry.ts:96:18` |
| `FollowClientParams` | `lib/analytics/events-registry.ts:100:18` |
| `OutboundClickParams` | `lib/analytics/events-registry.ts:101:18` |
| `ContactSubmitParams` | `lib/analytics/events-registry.ts:110:18` |
| `AskClientSubmitParams` | `lib/analytics/events-registry.ts:113:18` |
| `CampaignInterestParams` | `lib/analytics/events-registry.ts:114:18` |
| `ConversionCompleteParams` | `lib/analytics/events-registry.ts:127:18` |
| `FollowConversionParams` | `lib/analytics/events-registry.ts:130:18` |
| `SignupViewParams` | `lib/analytics/events-registry.ts:135:18` |
| `SignupStartParams` | `lib/analytics/events-registry.ts:138:18` |
| `SignupCompleteParams` | `lib/analytics/events-registry.ts:142:18` |
| `LoginStartParams` | `lib/analytics/events-registry.ts:152:18` |
| `BookingSubmitParams` | `lib/analytics/events-registry.ts:158:18` |
| `BookingAttemptParams` | `lib/analytics/events-registry.ts:171:18` |
| `BookingFailedParams` | `lib/analytics/events-registry.ts:185:18` |
| `BookingFormStartParams` | `lib/analytics/events-registry.ts:198:18` |
| `BookingWhatsappClickParams` | `lib/analytics/events-registry.ts:202:18` |
| `LeadQualifiedParams` | `lib/analytics/events-registry.ts:209:18` |
| `WebVitalsParams` | `lib/analytics/events-registry.ts:215:18` |
| `GA4EventName` | `lib/analytics/events-registry.ts:265:13` |
| `Ga4BrowserEvent` | `lib/analytics/ga4-browser.ts:38:13` |
| `Ga4FooterStats` | `lib/analytics/ga4.ts:85:18` |
| `SiteAnalytics` | `lib/analytics/ga4.ts:120:18` |
| `ClientGA4Stats` | `lib/analytics/ga4.ts:153:18` |
| `VisitorGeo` | `lib/analytics/geo-headers.ts:10:18` |
| `ArticleShareResult` | `lib/analytics/record-article-share.ts:35:13` |
| `ArticleViewInput` | `lib/analytics/record-article-view.ts:11:18` |
| `ArticleViewResult` | `lib/analytics/record-article-view.ts:26:13` |
| `ClientViewResult` | `lib/analytics/record-client-view.ts:9:13` |
| `PageViewResult` | `lib/analytics/record-page-view.ts:15:13` |
| `SearchConsoleTotals` | `lib/analytics/search-console-totals.ts:8:18` |
| `LiveSection` | `lib/archive-cache.ts:112:13` |
| `ArchiveQuery` | `lib/articles/archive/get-articles-archive.ts:25:18` |
| `BucketDefinition` | `lib/articles/archive/reading-time-buckets.ts:5:18` |
| `SendEmailParams` | `lib/email/resend-client.ts:15:18` |
| `BookingNotificationEmailPar…` | `lib/email/templates/booking-notification.ts:4:18` |
| `CountForms` | `lib/i18n/messages.ts:24:18` |
| `NotificationTab` | `lib/notifications/get-reader-notifications.ts:7:13` |
| `NotificationTargetKind` | `lib/notifications/notification-target-kind.ts:7:13` |
| `FeedArticlePayload` | `lib/queries/article-feed-shapes.ts:63:13` |
| `LatestPartner` | `lib/queries/get-latest-partners.ts:7:18` |
| `PlatformCounts` | `lib/queries/get-platform-counts.ts:7:18` |
| `ReelsPageForReader` | `lib/reels/get-reels-page-for.ts:7:18` |
| `PageSeoRow` | `lib/seo/build-metadata-from-page-row.ts:13:18` |
| `ListingPageKey` | `lib/seo/get-listing-page-seo.ts:18:13` |
| `ListingPageSeo` | `lib/seo/get-listing-page-seo.ts:28:18` |
| `KnownOpenGraphImageDimensio…` | `lib/seo/index.ts:12:8` |
| `KnownOpenGraphImageDimensio…` | `lib/seo/open-graph-image-dimensions.ts:3:18` |
| `BrandMedia` | `lib/settings/get-brand-media.ts:5:18` |
| `PageSeoDefaults` | `lib/settings/get-page-seo-defaults.ts:10:18` |
| `PlatformImageLicensing` | `lib/settings/get-platform-social-links.ts:59:13` |
| `TelegramEventPayload` | `lib/telegram/notify-telegram.ts:26:18` |
| `TelegramEventGroup` | `lib/telegram/telegram-events.ts:38:13` |
| `TelegramEventDef` | `lib/telegram/telegram-events.ts:40:18` |
| `CategoryAnalytics` | `lib/types.ts:140:18` |
| `CategoryArticleQueryOptions` | `lib/types.ts:160:18` |
| `AlertPreferences` | `lib/users/read-alert-preferences.ts:9:18` |

### ٢.د تصديرات مكرّرة (٢)
- `app/(site)/story/_constants.ts`: `STORY_OG_IMAGE = MODONTY_LOGO_URL` (اسمان لقيمة واحدة).
- `components/cta/whatsapp-icon-link.tsx:55`: `WhatsAppIconLink = WhatsAppLeadLink` (اسم توافقي بلا مستورِد).

### ٢.هـ ما كشفه `tsc --noUnusedLocals --noUnusedParameters` (١٢٤ تشخيصاً داخل النطاق) — البند ٥
استيرادات غير مستعملة في: `articles/[slug]/page.tsx` (١٦ استيراداً) · `(partner)/clients/[slug]/(inner)/{contact,reviews,about,articles,photos,services,(plain)/mentions}/page.tsx` · `(homepage)/components/page-layout/PageLayout.tsx:7` · `modo-chat/components/chat-list/ChatList.tsx:104,120` + `page-layout/PageLayout.tsx:200` (`userImage`) · `articles/[slug]/actions/submit-reply.ts:16` · `lib/articles/fire-engagement.ts:12` · `lib/comments/submit-comment-as.ts:16` · `components/client/submit-ask-client.ts:13` · `lib/clients/follow-client-as.ts:8` · `authors/[slug]/page.tsx:8` · `users/profile/favorites/page.tsx:4` · `booking/page.tsx:6` · `shop/page.tsx:6` · `modo-chat/components/partner-cards/PartnerCards.tsx:4` · `users/profile/following/page.tsx:4` · `search/helpers/get-clients-search.ts:4` · `industries/helpers/get-industries-page.ts:4-7` · `tags/helpers/{get-tags-page,tag-types,get-tags-enhanced}.ts` · `trending/helpers/get-trending-articles.ts` · `lib/queries/{get-articles,article-feed-shapes,get-industries-with-counts}.ts` · `app/layout/components/FooterStats.tsx:11,12` · `app/layout/helpers/footer-stats-types.ts:1-3` · `nav/LogoNav.tsx:2` · `components/shared/trust-note/TrustNote.tsx:3` · `modo-chat/api/{article/[slug],chat}/route.ts` (`trialRemaining`) · `help/faq/helpers/generate-faq-page-structured-data.ts:11` · `booking-form/booking-actions.ts:109` · `partner-card/PartnerCard.tsx:42` · `quick-links/OrbitQuickLinks.tsx:45` · `users/register/page.tsx:9` · `lib/seo/index.ts:171,172` · معاملات موضعية غير مستعملة في `follow/route.ts:12,96` · `settings/api/[id]/accounts/route.ts:7` · `settings/api/[id]/route.ts:30` · `settings-actions.ts:159` (تُسمّى `_x`) · `client-follow-button.tsx:50` (`catch (error)` → `catch {`).
خارج النطاق (لا يُلمس): `modonty/auth.config.ts:139`.

---

## ٣. البند ٣ — المكرّر

### ٣.أ متطابق سلوكاً (٣٣) — يُدمج

| # | المجموعة | المواضع | الموقع الواحد |
|---|---|---|---|
| 1 | `sanitizeJsonLd` = `JSON.stringify(x).replace(/</g,"\\u003c")` | about/page.tsx:31 · legal/{privacy,cookie,user-agreement,copyright}/page.tsx:27 · terms/page.tsx:27 · contact/page.tsx:33 · help/faq/page.tsx:43 | موجود أصلاً: `jsonLdHtml` في `lib/seo/index.ts:20` (نفس الجسم) — يُستعمل بلا ملف جديد |
| 2 | `escapeXml`/`xmlText` | app/feed.xml/route.ts:16 · app/image-sitemap.xml/route.ts:25 · app/sitemap.ts:94 | `lib/seo/escape-xml.ts` |
| 3 | `cosineSimilarity` | modo-chat/data/retrieve-from-embedded.ts:32 · data/is-out-of-scope.ts:9 · api/suggest-industry/route.ts:15 | `modo-chat/helpers/cosine-similarity.ts` |
| 4 | `clock(seconds)` | ArticleAudioPlayer.tsx:44 · ListenQueue.tsx:75 · QuranPlayer.tsx:25 | `lib/audio/clock.ts` (يستدعي `toArabic` — انظر ٣.ب #1: النسخ تختلف في التوقيع فقط؛ `clock` يمرّر string دائماً → الناتج واحد) |
| 5 | `nudge(by)` | نفس الملفات الثلاثة :149/:151/:231 | closure على `audioRef` — يُدمج فقط لو تطابق تماماً بعد الفحص |
| 6 | `cycleSpeed` + `SPEEDS` + `JUMP` | ArticleAudioPlayer.tsx:36-37,156 · ListenQueue.tsx:69-70,158 (QuranPlayer: `JUMP` فقط) | `lib/audio/` |
| 7 | `AR_DIGITS="٠١٢٣٤٥٦٧٨٩"` | ArticleAudioPlayer:40 · ListenQueue:72 · QuranPlayer:22 · modonty/education/helpers/format-dates.ts:3 | `lib/arabic-digits.ts` |
| 8 | `socialIconFor(url)` | articles/[slug]/components/partner-card/PartnerCard.tsx:26 · PartnerDetailsMobile.tsx:16 | `articles/[slug]/helpers/social-icon-for.tsx` |
| 9 | `getClientsRatings` (`"use cache"` + `clientReview.groupBy`) | lib/categories/get-category-page-data.ts:80 · tags/[slug]/page.tsx:95 | `lib/clients/get-clients-ratings.ts` |
| 10 | `formatArabic12h` | (partner) sidebar/client-hours.tsx:37 · client-open-now-badge.tsx:37 | نفس الناتج، الكود مختلف شكلاً (`toMinutes` ثم `/60`) — يُدمج بعد اختبار تطابق الناتج على كل القيم الصحيحة |
| 11 | نوع `{dayOfWeek; opens; closes}` | client-hours.tsx:9 · client-open-now-badge.tsx:5 | `(partner)/clients/[slug]/helpers/opening-hours-spec.ts` |
| 12 | `TypeBadge` | users/profile/liked/page.tsx:76 · disliked/page.tsx:76 | `users/profile/components/type-badge.tsx` |
| 13 | skeleton القوائم (٤×`h-24`) | users/profile/{liked,disliked,favorites}/loading.tsx:3 | `users/profile/components/list-loading.tsx` |
| 14 | `CardSkeleton` | components/listing/InfiniteEntityGrid.tsx:23 · tags/(index)/loading.tsx:4 · categories/(index)/loading.tsx:4 | تصدير الموجود في `components/listing/` |
| 15 | cookie الجلسة `view-${Date.now()}` | lib/analytics/conversion-tracking.ts:26 (مصدَّر) · api/track/cta-click/route.ts:65 · articles/api/track/article-link-click/route.ts:28 · articles/[slug]/api/view/route.ts:33 | إعادة استعمال `getOrCreateSessionId` الموجود |
| 16 | نفسه بـ`crypto.randomUUID()` | (partner) api/view/route.ts:28 · api/share/route.ts:64 · app/api/track/pageview/route.ts:28 | `lib/analytics/get-or-create-uuid-session-id.ts` |
| 17 | `VIEW_SESSION_COOKIE` / `SESSION_MAX_AGE` | ٩ ملفات (conversion-tracking:7-8 · resolve-article-from-recent-view:7 · partner api/view:6-7 · api/share:11-12 · track/cta-click:10-11 · track/pageview:6-7 · article-link-click:8-9 · [slug]/api/view:6-7 · api/analytics/[id]:6) | `lib/analytics/view-session-cookie.ts` |
| 18 | IP من أوّل `x-forwarded-for` | ٩ مواضع (favorite/route:86 · share/route:88 · cta-click:99 · record-article-share:94 · subscribers/route:83 · follow-client-as:55 · booking-actions:103,209 · article-link-click:65) | `lib/analytics/get-client-ip.ts` |
| 19 | IP من آخر `x-forwarded-for` (`"unknown"`) | news/subscribe/route:32 · lucky-wheel/route:27 · contact/api/route:40 | `lib/analytics/get-client-ip-last.ts` |
| 20 | `isMethod(m)` | users/login/api/track/route.ts:7 · users/register/api/track/route.ts:11 | `lib/analytics/is-auth-method.ts` |
| 21 | أنواع `LoginMethod`/`SignupMethod`/`SignupSource` | events-registry.ts:133,134,151 (غير مصدّرة) · ٤ ملفات users | تصديرها من events-registry |
| 22 | `normalizeScope`/`scopeFromParam` | search/page.tsx:24 · search/components/SearchInput.tsx:11 | `search/helpers/normalize-scope.ts` |
| 23 | أنواع `SearchScope`/`ArticleSortOption` | search/helpers/get-search-results.ts:6-7 (مصدّرة) · ٣ مكوّنات | استيراد من المصدر |
| 24 | `toCard` للوسوم | tags/(index)/page.tsx:66 · tags/actions.ts:19 | `tags/helpers/tag-to-card.ts` |
| 25 | `toCard` للفئات | categories/(index)/page.tsx:63 · categories/actions.ts:18 | `categories/helpers/category-to-card.ts` |
| 26 | `goals(n)` | football/components/match-hero/MatchHero.tsx:28 · fixtures-card/FixturesCard.tsx:14 | `football/helpers/format-goals.ts` |
| 27 | `clean(s)` | health/data/get-facilities.ts:29 · get-drugs.ts:15 | `health/helpers/clean-text.ts` |
| 28 | `stripPunct`/`norm` | story/SalesPitchPage.tsx:296 و:335 | `story/helpers/arabic.ts` |
| 29 | `save(fullText, outcome)` | modo-chat/api/chat/route.ts:332 · api/article/[slug]/route.ts:277 | closure — يُدمج إن تطابق حرفياً |
| 30 | وقت الرياض | football/helpers/format-riyadh-time.ts:4 (موجود) · ai/page.tsx:55 · football/page.tsx:61 | `modonty/helpers/format-riyadh-time.ts` |
| 31 | `dateFormatter` (year/short/numeric) | users/profile/favorites/page.tsx:14 · bookings/page.tsx:15 | `users/profile/helpers/date-formatter.ts` |
| 32 | `new Intl.NumberFormat(SITE_LOCALE)` | ١٠ ملفات (hero-stats:23 · hero-google-stat:4 · SchoolLookup:31 · ProgramLookup:25 · HolidayCountdown:21 · ReposCard:8 · ModelsCard:9 · ActivityLookup:28 · TopActivitiesCard:7 · BreakEvenCalculator:20) | `lib/site-number-format.ts` |
| 33 | أنواع مكرّرة الجسم (`PendingFaq` · `ClientGalleryImage` · `ReadMoreItem` · `WebSource` · `SessionUser`) | انظر الـPR | استيراد من الملف المصدِّر |

### ٣.ب مختلف — **لا يُدمج** (٣٢)
`toArabic` (توقيع مختلف) · `getOrCreateSessionId` في faq (cookie مختلف) · IP بصيغة ternary (يرجع `""`) · phone→E.164 (٣ سلوكيات) · rate limiters (ثوابت مختلفة) · WhatsApp host tests · HTML decoders (٣) · tag strippers (٣) · أجسام الصفحات القانونية (مفتاح رسالة مختلف) · `get<Page>PageForMetadata` (slug + cacheTag مختلف) · `get<Page>PageContent` · قوالب `page.tsx` القانونية · sector hero + Suspense (٦) · listing slicers · `loadMore*` actions · تجميع client-preview · `loading.tsx` للقوائم · booking/shop loading · عدّادات عربية (٥) · relative time (٣) · compact numbers (٤) · ذيل modo-chat غير المتدفّق · `handleFollow` · `handleShare` · `handleLike` · follow/favorite داخل bottom-bar · zod ask-client (٣) · dial codes (٢) · أسماء الأيام (٢) · تاريخ الرياض · «المزيد من المقالات» (٣) · `IndustryPreview`/`CountForms`.
أقارب في `shared/` تختلف سلوكاً (تُذكر ولا تُنقل): `shared/lib/phone.ts` · `shared/lib/strip-html-tags.ts` · `shared/lib/partner-site/detect-social-platform.ts` · `shared/lib/partner-site/get-home-data.ts`.

---

## ٤. البند ٤ — ملفات > ٣٠٠ سطر (٢١)

| الملف | الأسطر |
|---|---|
| `app/(site)/story/SalesPitchPage.tsx` | 1722 |
| `app/(site)/modo-chat/components/chat-list/ChatList.tsx` | 950 |
| `app/(site)/quran/components/quran-player/QuranPlayer.tsx` | 647 |
| `app/(site)/articles/[slug]/page.tsx` | 480 |
| `app/(site)/authors/[slug]/page.tsx` | 468 |
| `app/(site)/audio/components/listen-queue/ListenQueue.tsx` | 401 |
| `lib/analytics/ga4.ts` | 397 |
| `components/shared/booking-form/booking-actions.ts` | 394 |
| `app/(site)/users/notifications/page.tsx` | 388 |
| `app/sitemap.ts` | 379 |
| `app/(site)/modo-chat/api/chat/route.ts` | 376 |
| `lib/analytics/events-registry.ts` | 374 |
| `app/(site)/users/profile/settings/actions/settings-actions.ts` | 363 |
| `lib/seo/index.ts` | 353 |
| `app/(site)/articles/[slug]/components/article-main-column/ArticleMainColumn.tsx` | 351 |
| `app/(site)/articles/[slug]/components/audio-player/ArticleAudioPlayer.tsx` | 350 |
| `app/(site)/articles/[slug]/components/comments/ArticleComments.tsx` | 336 |
| `app/(site)/modo-chat/api/article/[slug]/route.ts` | 320 |
| `app/(site)/users/register/components/register-form.tsx` | 312 |
| `app/(site)/users/[id]/page.tsx` | 307 |
| `app/(site)/lucky-wheel/lucky-wheel.tsx` | 301 |

التقسيم المقترح (نفس الكود منقولاً):
- `story/SalesPitchPage.tsx` (1722): مكوّن واحد بحالة مشتركة كثيفة؛ يُقسَّم ما يُقسَّم بلا props جديدة فقط: `WhatsAppIcon` + `formatTime` + `salesWhatsappUrl` → helpers؛ `highlightIndices`/`highlightStates` → `helpers/highlight.ts`؛ أقسام JSX المستقلّة ذات props واضحة → `components/`. ما يتطلّب تمرير >٨ متغيّرات حالة يبقى ويُذكر.
- `modo-chat/components/chat-list/ChatList.tsx` (950): `doChat` streaming + fetch effects → `hooks/`؛ `formatPartnerCount` → helpers.
- `quran/components/quran-player/QuranPlayer.tsx` (647): `toArabic`/`clock`/`shortName` → lib؛ localStorage resume → hook؛ surah filter → helper.
- `articles/[slug]/page.tsx` (480): `buildLanguagesMap` · `withoutTrailingBrand` · `ogLocaleAlternate` → helpers؛ حذف ١٦ استيراداً ميتاً.
- `authors/[slug]/page.tsx` (468): ٤ استعلامات (منها ٢ `"use cache"`) → `helpers/` ملف لكل دالة؛ JSON-LD → `helpers/build-author-json-ld.ts`.
- `audio/.../ListenQueue.tsx` (401) · `ArticleAudioPlayer.tsx` (350): `clock`/`toArabic`/`cycleSpeed` → lib/audio.
- `lib/analytics/ga4.ts` (397) · `events-registry.ts` (374) · `lib/seo/index.ts` (353): دالة لكل ملف + `index.ts` إعادة تصدير (البند ٧).
- `booking-form/booking-actions.ts` (394) · `settings-actions.ts` (363): action لكل ملف (`"use server"` في كل ملف).
- `users/notifications/page.tsx` (388): `NotificationsContent` استعلامات → `helpers/get-notification-detail.ts`؛ JSX الفروع → `components/`.
- `app/sitemap.ts` (379): `xmlText` → lib؛ البناة → helpers بجانبه (`app/sitemap/` غير ممكن لأنه route؛ تبقى بجانب `app/` في `lib/sitemap/`).
- `modo-chat/api/chat/route.ts` (376) · `api/article/[slug]/route.ts` (320): `save` closure + تجهيز السياق → helpers.
- `ArticleMainColumn.tsx` (351) · `ArticleComments.tsx` (336) · `register-form.tsx` (312) · `users/[id]/page.tsx` (307) · `lucky-wheel.tsx` (301): فصل hooks/helpers حسب البند ١.

---

## ٥. البند ٦ — تقليص الـDOM

كل ملف يُلمس هنا يُذكر في الـPR للفحص البصري. **لا يُلمس** «غير متأكد» و«غير آمن».

### أ. غلاف يُزال (بلا خصائص، ابن واحد، الأب block)
| الملف:السطر | الغلاف | الأب | الابن | لماذا آمن |
|---|---|---|---|---|
| `app/(partner)/clients/[slug]/components/home/booking-card.tsx:33` | `<div>` | `div#request.scroll-mt-32.rounded-lg.bg-card.p-6.ring-1` (block) | `<BookingForm/>` (جذره `form.space-y-4` أو `div.flex.flex-col…py-10`) | الأب block مع padding؛ لا margin collapse؛ لا selector يعدّ الأبناء |

### ب. غلاف يصبح Fragment (عدّة أبناء، الأب block عادي بلا flex/grid/space-y/divide/gap)
| الملف:السطر | الغلاف | الأب | لماذا آمن |
|---|---|---|---|
| `components/feed/postcard/MobilePostCard.tsx:132` | `<div>` جذر فرع hero | `div[data-nosnippet].p-2.5` (block، هذا ابنه الوحيد) | الأب block مع padding؛ `-mt-2.5` للغلاف ينهار أصلاً عبر الـdiv |
| `components/feed/postcard/MobilePostCard.tsx:173` | `<div>` جذر الفرع الافتراضي | نفسه | نفسه |
| `app/(partner)/clients/[slug]/components/page-frame.tsx:22` | `<div>` جذر PageFrame | `<main className="flex-1">` في `(partner)/layout.tsx:41` عبر `<>` | main block؛ الغلاف بلا border/padding |
| `app/(site)/audio/page.tsx:50` | `<div>` | `<>` داخل `main#main-content.flex-1` (`SiteShell.tsx:38`) | الأب block |
| `app/(site)/quran/page.tsx:47` | `<div>` | نفسه | الأب block |
| `app/(site)/audio/loading.tsx:11` | `<div>` جذر | نفسه | الأب block |
| `app/(site)/quran/loading.tsx:12` | `<div>` جذر | نفسه | الأب block |
| `app/(site)/users/profile/(index)/page.tsx:62` | `<div>` جذر | layouts تعيد children/`<>` ثم `main` | الأب block |
| `app/(site)/analytics/page.tsx:117` | `<div>` جذر TimeSeries | `section.rounded-xl.border.bg-card.p-5` (Panel) | section block؛ استعمال واحد (السطر ١٨٧) |
| `app/(site)/modonty/education/components/free-learning/FreeLearningCard.tsx:48` | `<div key>` → `<Fragment key>` | `section.rounded-lg.bg-card.p-5.ring-1` (السطر ٢٢) | الأب block؛ `h3.mt-5` ينهار أصلاً عبر الـdiv |
| `app/(site)/modonty/components/story-card/StoryCard.tsx:36` | `<span key>` → `<Fragment key>` | `p.mt-3.text-sm…` (inline flow) | span بلا تنسيق؛ قاعدة `span` الوحيدة في globals.css محصورة بـ`.article-body` |

### ج. دمج class الابن في الأب (الخارجي له ابن واحد مؤكَّد بالمسافة البادئة) — «آمن: نعم»
| الملف:السطر | classes الخارجي | classes الداخلي |
|---|---|---|
| `app/(partner)/clients/[slug]/(index)/loading.tsx:71` | `mx-auto mt-6 max-w-[1128px] px-4` | `grid gap-6 lg:grid-cols-[1fr_320px]` |
| `app/(partner)/clients/[slug]/components/page-frame-skeleton.tsx:17` | `mt-10` | `mx-auto max-w-[1128px] px-6 py-16` |
| `app/(partner)/clients/[slug]/components/states/client-not-ready-panel.tsx:21` | `overflow-hidden rounded-lg border bg-card shadow-sm` | `px-6 py-10 text-center` |
| `app/(site)/categories/[slug]/loading.tsx:17` | `container mx-auto max-w-[1128px] px-4 py-12 md:py-16` | `flex flex-col md:flex-row gap-8 items-start` |
| `app/(site)/tags/[slug]/loading.tsx:23` | `container mx-auto max-w-[1128px] px-4 py-8` | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` |
| `app/(site)/story/SalesPitchPage.tsx:564` | `max-w-[1600px] mx-auto px-3 md:px-4 h-full` | `flex flex-col md:flex-row gap-3 md:gap-4 h-full` |
| `app/(site)/story/SalesPitchPage.tsx:617` | `mb-4 pb-4 border-b border-border/40` | `flex flex-col gap-1.5` |
| `app/(site)/story/StorySkeleton.tsx:22` | `mx-auto h-full max-w-[1600px] px-3 md:px-4` | `flex h-full flex-col gap-3 md:flex-row md:gap-4` |
| `app/(site)/users/profile/settings/components/account-settings.tsx:133` | `p-4 bg-destructive/10 border border-destructive/20 rounded-md` | `flex items-start gap-3` |
| `app/layout/components/FooterStats.tsx:80` | `w-full overflow-hidden rounded-2xl border … shadow-[…]` | `flex divide-x divide-x-reverse divide-white/[0.06]` |
| `app/layout/components/FooterStats.tsx:127` | `w-full rounded-lg bg-primary overflow-hidden shadow-sm` | `grid grid-cols-3 sm:grid-cols-5 divide-x …` |
| `app/(site)/categories/(index)/page.tsx:127` | `container mx-auto max-w-[1128px] flex-1 px-4 py-8` | `<section aria-labelledby>` بلا class |
| `app/(site)/tags/(index)/page.tsx:150` | نفسه | `<section aria-labelledby>` |
| `app/(site)/(homepage)/components/industries-card/IndustriesCard.tsx:59` | `px-4 py-2` | `h2#id.text-base.font-medium.text-foreground` |
| `app/(site)/help/faq/components/faq-page-content.tsx:82` | `text-center py-8` | `p.text-muted-foreground` |
| `app/(site)/users/notifications/page.tsx:251` · `:289` · `:298` · `:349` · `:374` | `p-4 rounded-lg bg-muted` | `p.text-sm.text-foreground.leading-relaxed[.whitespace-pre-wrap]` |
| `app/(site)/users/profile/(index)/page.tsx:191` | `pt-4 border-t max-lg:hidden` | `p.text-sm.text-muted-foreground.mb-4` |
| `app/(site)/users/profile/{bookings:66,comments:61,disliked:55,favorites:58,following:53,liked:54}/page.tsx` | `mb-4 flex items-center justify-between` | `h3.text-lg.font-semibold` (ابن واحد → flex بلا أثر) |
| `app/(site)/help/faq/components/faq-accordion.tsx:182` | `flex items-center gap-2 pt-2 border-t border-border/50` | `p.text-xs.text-muted-foreground.font-medium` |

### د. «غير متأكد» — لا يُلمس (٧)
`users/notifications/page.tsx:199` · `articles/[slug]/components/article-header/ArticleHeader.tsx:100` · `help/faq/components/faq-accordion.tsx:140` · `modo-chat/components/chat-list/ChatList.tsx:822` · `articles/[slug]/page.tsx:335` · `clients/components/featured-partners-slider.tsx:170` · `lucky-wheel/lucky-wheel.tsx:292`

### هـ. غير قابل للدمج (٤٠) — أمثلة
`TableOfContents.tsx:138` (line-box يتغيّر) · أغلفة bg/border/padding مقابل `max-w`/centering (loading في reels/partner/categories/tags، `client-hero-v2.tsx:106`، `client-bottom-bar.tsx:177`، `MoreArticles.tsx:103/105`، `GalleryLazy.tsx:19`، `analytics/page.tsx:103`، `audio/page.tsx:57`، `ChatList.tsx:919/941`، `PageLayout.tsx:184`، `QuranPlayer.tsx:395`، Search*State، `PartnersShowcase.tsx:66`، `StorySkeleton.tsx:36`، `create-password-prompt.tsx:70`، `notifications/page.tsx:46`، loading في users/*) · فواصل «أو» في login/register · `hero-chips.tsx:22`.

### و. أعمق شجرات DOM (عمق JSX من الجذر)
| الملف | العمق | السطر |
|---|---|---|
| `app/(site)/users/profile/favorites/page.tsx` | 15 | 97 |
| `app/(site)/users/profile/following/page.tsx` | 14 | 90 |
| `app/(site)/users/profile/bookings/page.tsx` | 14 | 128 |
| `app/(site)/story/SalesPitchPage.tsx` | 13 | 711 |
| `app/(site)/users/notifications/page.tsx` | 12 | 207 |
| `app/(site)/modo-chat/components/history-list/HistoryList.tsx` | 12 | 190 |
| `app/(site)/lucky-wheel/lucky-wheel.tsx` | 12 | 272 |
| `app/(site)/users/profile/settings/components/account-settings.tsx` | 10 | 146 |
| `app/(site)/users/[id]/page.tsx` | 10 | 277 |
| `app/(site)/trending/components/TrendingArticles.tsx` | 10 | 139 |
| `app/(site)/articles/[slug]/components/comments/ArticleComments.tsx` | 10 | 296 |

الأرقام: ٦١٨ ملف مفحوص · ٥٢ `<div>` عارٍ · ١٢ قابلة للإزالة (١ حرفياً + ١١ Fragment) · ٧٥ زوج خارجي/داخلي بابن واحد: ٢٨ آمن · ٧ غير متأكد · ٤٠ غير آمن.

---

## ٦. البند ٧ — مخالفات `.claude/rules/folder-structure.md`

### ٦.أ استيراد بين أشقاء (٣ — تُصلَح بالترقية لا بالنقل عبر الأشقاء)

| الملف:السطر | المستورَد | العلاج |
|---|---|---|
| `app/(site)/(homepage)/components/left-sidebar/LeftSidebar.tsx:4` | `@/app/(site)/clients/components/trust-card/TrustCard` | مستهلكان (clients · homepage) → `components/shared/trust-card/TrustCard.tsx` |
| `app/(site)/users/profile/following/page.tsx:12` | `@/app/(partner)/clients/[slug]/components/client-follow-button` | مستهلكان → `components/shared/client-follow-button/ClientFollowButton.tsx` |
| `app/api/lucky-wheel/route.ts:5` | `@/app/(site)/lucky-wheel/prizes` | مستهلكان (الصفحة · الـhandler) → `lib/lucky-wheel/prizes.ts`. **لا يُنقل الـhandler** (تغيير مسار `app/` = رابط — ممنوع) |

### ٦.ب مسارات تدخل القشرة `app/layout` (٤ أسطر)
- `(partner)/clients/[slug]/components/chrome/platform-bar.tsx:5-7` ← `LogoNav` · `ThemeToggle` · `UserMenu` (مستهلكان: القشرة + partner) → `components/shared/nav/` و`components/shared/user-menu/` (المجلّد كاملاً مع ملفاته).
- `(fullscreen)/reels/helpers/reels-nav-destinations.ts:1` ← `app/layout/helpers/nav-config` → `lib/nav/nav-config.ts`.
- حدّي: `app/(site)/users/helpers/use-google-redirect-state.ts` يستعمله login و register؛ `users/` ليس مساراً (بلا `page.tsx`) لكنه أب لهما → مسموح (عائلة).

### ٦.ج `@/app/` داخل نفس المسار (١٦٧ سطراً) → نسبي
حسب المسار: clients 31 · modo-chat 30 · app/layout 29 · articles/[slug] 21 · modonty 19 · (homepage) 12 · industries 9 · (partner)/clients/[slug] 7 · trending 2 · واحد في categories · tags · articles · help/faq · users/login · users/register · users/[id]. و١١ سطراً من طفل إلى أبيه (مسموح لكنه alias → نسبي).

### ٦.د ملفات في `components/`/`lib/` بمستهلك واحد (٤٢) → داخل مسار مستهلكها

| الملف | المستهلك الوحيد | إلى |
|---|---|---|
| `components/share/ShareButtons.tsx` | `share-client-button.tsx` (ميت) | يُحذف مع مستهلكه |
| `components/shared/archive-filters/ArchiveSearchForm.tsx` | (homepage) PageLayout.tsx:9 | `(homepage)/components/archive-filters/` |
| `components/shared/archive-filters/FiltersBar.tsx` | articles ArticlesPageLayout.tsx:15 | `articles/components/archive-filters/` |
| `components/shared/booking-form/{BookingForm,PhoneField}.tsx` + `booking-actions.ts` + بقية المجلّد | (partner)/clients/[slug] booking-card.tsx:4 | `(partner)/clients/[slug]/components/booking-form/` |
| `components/shared/desktop-only/DesktopOnly.tsx` | articles/[slug] (ملفان) | `articles/[slug]/components/desktop-only/` |
| `components/shared/partner-invite-card/PartnerInviteCard.tsx` | (site)/clients LeftSidebar.tsx:5 | `clients/components/partner-invite-card/` |
| `components/shared/quick-links/OrbitQuickLinks.tsx` | app/layout SiteShell.tsx:3 | `app/layout/components/quick-links/` |
| `lib/ai/resolve-modo-prompt.ts` | modo-chat (٢ routes) | `modo-chat/helpers/` |
| `lib/analytics/record-article-share.ts` · `record-article-view.ts` | articles/[slug]/api | `articles/[slug]/helpers/` |
| `lib/analytics/record-client-view.ts` | (partner) api/view | `(partner)/clients/[slug]/helpers/` |
| `lib/analytics/record-page-view.ts` | app/api/track/pageview | `app/api/track/pageview/record-page-view.ts` |
| `lib/analytics/search-console-totals.ts` | app/layout FooterStats | `app/layout/helpers/` |
| `lib/archive-cache.ts` | `proxy.ts` (جذر، ليس مساراً) | يبقى |
| `lib/articles/archive/get-articles-filters.ts` | articles (٣ ملفات + FiltersBar) | `articles/helpers/` |
| `lib/articles/like-article-as.ts` · `lib/comments/submit-comment-as.ts` | articles/[slug]/actions | `articles/[slug]/helpers/` |
| `lib/auth/verify-credentials.ts` | `auth.config.ts` (جذر) | يبقى |
| `lib/categories/get-category-page-data.ts` | categories/[slug] | `categories/[slug]/helpers/` |
| `lib/clients/{follow-client-as,get-client-follow-state,unfollow-client-as}.ts` | (partner) api/follow | `(partner)/clients/[slug]/helpers/` |
| `lib/nav/{get-nav-section-path,get-orbit-steps}.ts` | app/layout (+OrbitQuickLinks) | `app/layout/helpers/` |
| `lib/notifications/count-unread-notifications.ts` | app/layout | `app/layout/helpers/` |
| `lib/notifications/{get-reader-notifications,mark-notification-read-as,notification-target-kind}.ts` | users/notifications | `users/notifications/helpers/` |
| `lib/queries/{get-article-for-chat,get-articles-for-out-of-scope-search}.ts` | modo-chat | `modo-chat/data/` |
| `lib/queries/get-latest-partners.ts` | TrustCard (يُرقَّى إلى shared) | يبقى في lib |
| `lib/queries/get-platform-counts.ts` | app/layout | `app/layout/helpers/` |
| `lib/queries/get-user-reel-flags.ts` · `lib/reels/{get-reels-page-for,toggle-reel-reaction-as}.ts` | (fullscreen)/reels | `reels/helpers/` |
| `lib/settings/get-brand-description.ts` | app/feed.xml | `app/feed.xml/get-brand-description.ts` |
| `lib/settings/{get-core-client-slug,get-metadata-settings}.ts` | articles/(index) | `articles/helpers/` |
| `lib/settings/get-site-language.ts` | `app/layout.tsx` (جذر) | يبقى |
| `lib/users/{dial-codes,to-international-phone}.ts` | users/profile/settings | `users/profile/settings/helpers/` |

### ٦.هـ ملف مسار يستهلكه مساران (٧) → ترقية
`client-follow-button.tsx` · `TrustCard.tsx` · `lucky-wheel/prizes.ts` · `LogoNav.tsx` · `ThemeToggle.tsx` · `user-menu/UserMenu.tsx` · `layout/helpers/nav-config.ts` (كلها في ٦.أ/٦.ب).

### ٦.و ملفات بأكثر من دالة مصدّرة (٣١ + ٤) → دالة لكل ملف + `index.ts`
`reels/actions/reel-interactions.ts` (2) · `(partner) helpers/build-chrome-data.ts` (2) · `client-faqs.ts` (2) · `client-reviews.ts` (2) · `client-stats.ts` (2) · `articles/[slug]/helpers/image-aspect-ratios.ts` (2) · `resolve-article-cta.ts` (2) · `help/faq/actions/faq-feedback-actions.ts` (2) · `help/faq/helpers/session-helper.ts` (3) · `search/helpers/format-metrics.ts` (3) · `users/profile/helpers/profile-stats.ts` (2) · `settings-actions.ts` (8) · `lib/analytics/clarity.ts` (2) · `conversion-tracking.ts` (2) · `events-registry.ts` (35) · `ga4-server.ts` (2) · `ga4.ts` (4) · `visitor-cookie.ts` (4) · `lib/archive-cache.ts` (5) · `build-archive-href.ts` (2) · `reading-time-buckets.ts` (2) · `lib/comments/validate-comment.ts` (2) · `lib/format-counts.ts` (2) · `lib/industry-tones.ts` (2) · `article-feed-shapes.ts` (2) · `get-reels-feed-page.ts` (2) · `lib/seo/index.ts` (8) · `organization-jsonld.ts` (2) · `get-platform-social-links.ts` (2) · `lib/utils.ts` (2) · `lib/whatsapp.ts` (3) · `booking-actions.ts` (4) · `(homepage)/data/home-feed-shapes.ts` (2) · `modo-chat/data/check-anonymous-quota.ts` (2) · `get-embedded-chunks.ts` (2).

### ٦.ز الـhandlers في `app/api/**` (١١)
لا يُنقل أيّ handler (تغيير رابط). يُسجَّل: `api/track/web-vitals` بلا مستدعٍ (يُحذف كملف ميت بدليل knip + grep: `WebVitals.tsx:10` يقول استُبدل) · `api/revalidate/article` بلا مستدعٍ حيّ لكنه عقد خارجي (يبقى) · `api/lucky-wheel` و`api/track/pageview` يستدعيهما modonty وحدها (يبقيان).

### ٦.ح الأسماء
- بادئة `_` (٣): `story/_utils/` → `story/helpers/` · `story/_constants.ts` → `story/helpers/story-constants.ts` · `lib/analytics/__tests__/` (يُحذف الملف الميت فيه).
- أسماء ممنوعة (٣): `lib/utils.ts` → `lib/cn.ts` + `lib/format-relative-time.ts` · `components/listing/entity-utils.ts` → دالة لكل ملف · `help/faq/helpers/session-helper.ts` → ٣ ملفات.
- `index.ts` يحمل كوداً (٢): `lib/seo/index.ts` (يُقسَّم) · `constants/index.ts` (يبقى: ثوابت لا دوال — خارج نصّ القاعدة).
- ملفات حرّة في جذر المسار (١٢): `story/*.tsx` (٨) → `story/components/` · `lucky-wheel/lucky-wheel.tsx` → `components/` و`prizes.ts` → `lib/lucky-wheel/` · `(homepage)/home-skeleton.tsx` → `components/`.
- مجلّد غير kebab (١): `components/feed/infiniteScroll` → `infinite-scroll`.
- اسم الملف ≠ اسم دالته (٥٢): تُعاد التسمية لتطابق (`profile-liked.ts` → `get-profile-liked.ts` …) حيث للملف دالة واحدة؛ ما له أكثر يُقسَّم (٦.و).
- خليط PascalCase/kebab في مجلّد واحد (١٠): **لا يُلمس** — القاعدة تحدّد kebab لأسماء الدوال فقط وPascalCase للمكوّنات مقبول في الريبو؛ يُذكر في الـPR.
- `data/` (٧٤ مجلّداً): خارج تخطيط القاعدة لكن مهارة `modonty-naming` تعتمده صراحةً («data/ anything that brings data from the server to the UI») → **يبقى**. `documentation/` يبقى.

### ٦.ط ينتمي إلى `shared/` — يُكتب في التقرير ولا يُنقل
`components/tracking/GTMClientTracker.tsx` = `admin/components/gtm/GTMClientTracker.tsx` · `app/layout/components/gtm/GTMContainer.tsx` ≈ admin/console (0.97) · `lib/db.ts` ≈ `shared/lib/db.ts` (0.92) · `lib/settings/settings-singleton.ts` = `console/lib/settings/settings-singleton.ts` (1.00) · `lib/telegram/notify-telegram.ts` ≈ console (0.98) · `telegram-events.ts` (0.76) · `lib/analytics/ga4-server.ts` ≈ console (0.92) · `visitor-cookie.ts` (0.75) · `events-registry.ts` (0.69) · `articles/[slug]/helpers/sanitize-html.ts` ≈ `admin/lib/sanitize-html.ts` (0.71) · `story/LogoSpotlight.tsx` ≈ console (0.70).

---

## ٧. البند ٨ — أفضل الممارسات

### ٧.أ يُصلَح (الناتج لا يتغيّر)
| الملف:السطر | القاعدة | الإصلاح |
|---|---|---|
| ٤٦ ملفاً: `import { Metadata } from "next"` (lib/seo/index.ts:1 · articles/[slug]/page.tsx:1 · about · categories/(index) · search · help/{faq,(index),feedback} · legal ×4 · authors/[slug] · clients · terms · contact · trending · news/{(index),subscribe} · users/[id] · users/profile/layout · (homepage)/page · subscribe · (partner)/clients/[slug]/(index)) · `MetadataRoute` (sitemap.ts:2 · robots.ts:1) · `NextRequest` في ٢١ route.ts · `ReactNode` في (partner)/clients/[slug]/layout.tsx:1 | type-only import | `import type` |
| `app/layout/components/theme-provider.tsx:3` | `import * as React` للنوع فقط | `import type { ComponentProps }` |
| `articles/[slug]/page.tsx:22-29` و`:16-19` · `helpers/get-article-page-data.ts:13-19` | `bundle-barrel-imports` | استيراد مباشر من الملفات |
| `app/(site)/help/(index)/page.tsx:2,4` | استيرادان من نفس الوحدة | دمج |
| `app/layout/components/user-menu/LoginButton.tsx:1` · `modo-chat/components/shared/TypingDots.tsx:1` | `"use client"` زائد (بلا hooks؛ المستورِد الوحيد client) | يُحذف الـdirective — بعد التحقّق أن كل مستورِد client |
| `(partner)/.../chrome/platform-bar.tsx:24` · `components/shared/about-card/AboutCard.tsx:18` · `lib/archive-cache.ts:119` · `app/api/revalidate/route.ts:4` | `async` بلا `await` | يُحذف `async` (المستدعون يستعملون `await` على قيمة → يعمل). **ملاحظة:** `AboutCard`/`platform-bar` مكوّنا server async → عادي; إزالة `async` من مكوّن server تغيّر توقيته في React؟ لا تغيّر الناتج لكنها تغيّر الـstreaming boundary نظرياً → **تُقرّر في الـPR ولا تُنفَّذ** |
| `ThemeToggleButton.tsx:17` · `AccountBenefitsTrigger.tsx:13` · `UserAvatarButton.tsx:16` | `forwardRef` على React 19 | **لا يُنفَّذ** (Radix `asChild` + ref: سلوك قابل للتغيّر) — يُذكر |
| كل بنود ٢.هـ (استيرادات/متغيّرات غير مستعملة) | البند ٥ | حذف |

### ٧.ب يغيّر سلوكاً أو أداءً مرئياً — **يُكتب ولا يُنفَّذ** (للقرار)
| الملف:السطر | القاعدة | الملاحظة |
|---|---|---|
| `(homepage)/components/page-layout/CachedHomePage.tsx:47-50,75` + `PageLayout.tsx:31` | استعلام بلا قارئ | `getIndustriesWithCounts()` يُنفَّذ في كل رندر ولا يُقرأ `industries` |
| `articles/[slug]/helpers/get-article-page-data.ts:72-78` | نفسه | `getPlatformImageLicensing()` نتيجته لا تُقرأ |
| `lib/clients/get-client-follow-state.ts:20-31` | `async-parallel` | `findUnique` ثم `count` متتاليان |
| `trending/page.tsx:29-30` | `async-parallel` | `getTrendingArticles` ثم `getListingPageSeo` |
| `reels/[slug]/page.tsx:30,34` | `async-parallel` | `getPageSeoDefaults` ينتظر `getReelBySlug` |
| `lib/analytics/record-page-view.ts:47-48` | `async-parallel` | `resolveSessionId` ثم `resolveUserId` |
| `articles/(index)/page.tsx:86-87` | `async-parallel` | filters → scope → archive متتالية |
| `ArticleMainColumn.tsx:274,283,291` | `<a>` بدل `next/link` | روابط الفئات/الوسوم |
| `modonty/components/articles-feed/FeedFilterMenu.tsx:1` · `shell-hero/hero-cta-row.tsx:1` · `users/profile/components/{comment-card,activity-item}.tsx:1` | `"use client"` يمكن أن يصير server | الوقت النسبي سيُرندر على السيرفر |
| `HistoryList.tsx:64` · `security-settings.tsx:46` | fetch في `useEffect` | يمكن تحميله على السيرفر |
| `client-follow-button.tsx:38-55` | `rerender-dependencies` | الاعتماد على `session` كاملاً |
| `FollowCtaButton.tsx:67-81` | طلبان متطابقان | GET follow مرّتين إذا رُكّب الزرّان |
| `lucky-wheel.tsx:4` | `bundle-conditional` | `canvas-confetti` يُحمَّل دائماً |
| `app/layout.tsx:104` | resource hint قديم | `dns-prefetch` لـ facebook.net والبيكسل متوقّف |
| `hero-cta-row.tsx:100` · `client-hero-v2.tsx:218` · `client-team-section.tsx:24` · `analytics/page.tsx:101,120,233` | `key={index}` | مفاتيح بيانات |
| ٥٨ موضعاً في ٣١ ملفاً | shadcn `Skeleton` بدل `animate-pulse` يدوي | شكل قد يتغيّر |
| ٣٥٧ `space-y/x-*` في ١٦١ ملفاً | shadcn: `gap` | يحتاج فحصاً بصرياً لكل ملف |
| ٢٦ `transition-all` في ١٥ ملفاً | web-design-guidelines | تحديد الخصائص |
| `PhoneField.tsx:133` | `focus` بدل `focus-visible` | |
| `faq-search.tsx:29,43` | هدف لمس ٢٤px · `right-3`/`left-2` في RTL | |
| «...» بدل «…» (١٠ مواضع) | طباعة | نص مرئي يتغيّر |
| نصوص عربية ثابتة خارج `messages` (HistoryList:40-44 · subscribe/page:8-10 · reviews/page:42-44 · security-settings:70-74) | i18n | |
| `comment-card.tsx:31-32` | boolean props | تركيب بدل أعلام |
| `auth.config.ts:139` · `package.json#seed:client1` (مسار قديم) | خارج النطاق | يُذكر فقط |

---

## ٨. الخطة — الأقسام من الأقلّ خطراً إلى الأعلى (commit لكل قسم)

ترتيب الخطر مبنيّ على: عدد ملفات `"use cache"` · حجم القسم · وجود تفاعلات client · أهمية الصفحة تجارياً (صفحة الشريك = الأعلى).
كل قسم يطبّق البنود الثمانية داخل مجلّده. ما يمسّ `lib/`/`components/` المشتركة يُنفَّذ في الأقسام ١٤-١٥ بعد أن تستقرّ المسارات. بعد كل commit: `pnpm install` · `tsc --noEmit` · `build` (Compile + TypeScript؛ prerender مُعلَّق لغياب قاعدة البيانات).

| # | القسم | المحتوى | الخطر |
|---|---|---|---|
| 0 | `documentation/REFACTOR-PLAN.md` | هذا الملف | — |
| 1 | `legal/*` · `terms` · `about` · `contact` · `help/*` | `sanitizeJsonLd`→`jsonLdHtml` (٨ ملفات) · `import type` · استيرادات ميتة · helpers من `page.tsx` · دمج `faq-page-content:82` و`faq-accordion:182` · تسمية `*-content`/`*-metadata` | منخفض |
| 2 | `trust` · `team` · `booking` · `shop` · `subscribe` · `news` · `modo-link` · `analytics` | helpers من الصفحات · استيرادات ميتة · DOM `analytics:117` · إعادة تسمية ملفات | منخفض |
| 3 | `story` · `lucky-wheel` · `quran` · `audio` | `_utils`/`_constants`→`helpers` · ملفات حرّة→`components/` · `prizes`→`lib/lucky-wheel` · تقسيم `SalesPitchPage` (حسب ٤) · `clock`/`toArabic`/`AR_DIGITS`→`lib/audio` · DOM (story ×2، skeleton، audio/quran page+loading) | منخفض-متوسط |
| 4 | `modonty/*` (القطاعات) | helpers · `formatRiyadhTime` · `clean` · `goals` · Intl → lib · `@/app`→نسبي (19) · DOM `FreeLearningCard:48` · `StoryCard:36` | متوسط |
| 5 | `search` · `trending` · `categories` · `tags` · `industries` | `normalizeScope` · `toCard` ×2 · `getClientsRatings`→lib · helpers من `[slug]/page.tsx` (`"use cache"` يُنقل حرفياً) · `industries/actions.ts` + `get-industries-page.ts` حذف · `CardSkeleton` · DOM loading/pages · أدلة `get-category-page-data` تنتقل إلى `categories/[slug]/helpers` | متوسط |
| 6 | `authors/[slug]` · `(homepage)` · `clients` (site) | تقسيم `authors/[slug]/page.tsx` · `TrustCard`→shared · `ArchiveSearchForm`/`PartnerInviteCard` → داخل مسارهما · `@/app`→نسبي (43) · `home-skeleton`→components · `IndustriesCard:59` DOM · ملفات clients المحتجزة لا تُلمس | متوسط |
| 7 | `articles` (index + `[slug]`) | ١٦ استيراداً ميتاً · barrel→مباشر · helpers (`buildLanguagesMap`…) · `socialIconFor` · `DesktopOnly`/`FiltersBar`/`get-articles-filters`/`like-article-as`/`submit-comment-as`/`record-article-*` → داخل المسار · `data/index.ts` حذف · `dislike-article.ts` + `CoreArticlesRail` حذف · `articles/[slug]/components/index.ts` تصديرات ميتة · `ArticleAudioPlayer`→lib/audio | متوسط-عالٍ |
| 8 | `users/*` · `(fullscreen)/accounts` | `TypeBadge` · list skeleton · `dateFormatter` · helpers من notifications/verify-email/[id] (حرفياً) · `lib/notifications/*` و`lib/users/*` → داخل المسار · `client-follow-button`→shared · DOM profile (×7 `h3`) + notifications (×5) + `profile/(index):62,191` + `account-settings:133` · `settings-actions` تقسيم | متوسط-عالٍ |
| 9 | `modo-chat` · `(fullscreen)/reels` | `cosineSimilarity` · `save` closure · hooks من `ChatList` · `resolve-modo-prompt`/`get-article-for-chat`/… → داخل المسار · `reels-bottom-bar` حذف · `lib/reels/*` → `reels/helpers` · `nav-config`→`lib/nav` · `reel-interactions` تقسيم · `@/app`→نسبي (30) | عالٍ (streaming + تفاعلات) |
| 10 | `(partner)/clients/[slug]` | ١٦ ملفاً ميتاً (مع احتجاز shell-hero) · استيرادات ميتة في `(inner)/*` · `formatArabic12h` + spec type · helpers من `(index)/page.tsx` (حرفياً مع `"use cache"`) · `booking-form` + `lib/clients/*` + `record-client-view` → داخل المسار · DOM `booking-card:33` · `loading:71` · `page-frame-skeleton:17` · `client-not-ready-panel:21` · `LogoNav`/`ThemeToggle`/`UserMenu`→shared | عالٍ (صفحة الشريك) |
| 11 | `app/layout` · `app/*.ts` (sitemap · feed · image-sitemap · robots) · `app/api` | `escapeXml`→lib · `OrbitQuickLinks` + `lib/nav` + `get-platform-counts` + `count-unread-notifications` + `search-console-totals` → `app/layout` · `QuickLinks`/`ActiveTabMarker`/`Scroller`/`IndustryCards`/`whatsapp-booking-cta` حذف · `web-vitals` handler حذف · DOM `FooterStats:80,127` · `@/app`→نسبي (29) · `LoginButton` directive · `theme-provider` import | متوسط |
| 12 | `components/` | `CardSkeleton` تصدير · `entity-utils` تقسيم · `infiniteScroll`→`infinite-scroll` · `RelativeTime`/`PostCardAvatar` helpers · `WhatsAppIconLink` alias حذف · `GTMClientTracker` يُذكر لـshared | متوسط |
| 13 | `lib/` | دالة لكل ملف (`seo/index` · `ga4` · `events-registry` · `visitor-cookie` · `archive-cache` · `utils` · `whatsapp` …) · ثوابت الجلسة/IP المشتركة · `mobile-push.ts` حذف · تصديرات/أنواع ميتة (knip ٢.ب/٢.ج) · `signIn/signOut` | متوسط |
| 14 | الختام | إعادة `knip` + الأرقام بعد · تحديث هذا الملف بالأرقام النهائية | — |

### ما لن يُنفَّذ (قرار خالد)
- نقل أي `route.ts` (رابط) — ٦.ز.
- حذف الملفات المحتجزة — ٢.أ.
- كل بنود ٧.ب.
- `forwardRef`→`ref` prop · إزالة `async` من مكوّنات server.
- أي شيء في `shared/` أو خارج `modonty/`.
