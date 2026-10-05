# API-INVENTORY — جرد موقع مدونتي العام وعقد الـAPI لتطبيق القارئ

- التاريخ: ٤ أكتوبر ٢٠٢٦ · النطاق: `modonty/` فقط (+ `shared/` كمصدر لما تستهلكه مدونتي) · قراءة كود بلا تعديل.
- المسارات في هذا الملف نسبية إلى `modonty/` إلا ما بدأ بـ`shared/` أو `console/`.
- القاعدة الحاكمة (`modonty-mobile/AGENTS.md`): التطبيق يقرأ من **نفس الدوال** التي تقرأ منها صفحة الويب. كل نقطة مقترحة أدناه تسمّي الدالة التي تغلّفها؛ ما ليس له دالة موجودة يُوسَم «جديد».

---

## ١ · الملخّص

| البند | الرقم | الدليل |
|---|---|---|
| صفحات `page.tsx` | ٧٨ | `find app -name page.tsx` |
| Route Handlers `route.ts` | ٤٤ (منها ١١ تحت `app/api/`) | `find app -name route.ts` |
| ملفات `"use server"` / دوال أكشن مُصدَّرة | ٣٦ / ٥٠ | grep `^"use server"` |
| دوال مكيّشة `"use cache"` | ٩٥ موضعاً · `cacheLife("hours")` في ٩٧ | grep في `app lib components` |
| قدرات القارئ المكتشفة | **٥٢** صفّاً (جدول §٢) | — |
| نقاط API موجودة يقدر التطبيق يستعملها كما هي (بلا كوكي) | **٥**: `GET /articles/api/list` · `GET /api/articles` (الرئيسية) · `POST /api/news/subscribe` · `POST /api/booking` · `POST /api/lucky-wheel` | §٣ |
| نقاط موجودة لكن تعتمد كوكي الجلسة أو كوكي الزائر (لا تصلح للتطبيق كما هي) | ١٨ | §٣ |
| سطور العقد المقترح تحت `/api/mobile/v1` | **٦٥** (V1: ٣٧ · V2: ٢٢ · V3: ٦) — كلّها تغلّف دوالاً موجودة إلا ٦ موسومة «جديد» (A3 A4 A14 N3 N4 · read-all) | §٤ و§٦ |

### أهم ٥ مخاطر/قرارات

| # | القرار/الخطر | الحكم | الدليل |
|---|---|---|---|
| ١ | **كل الكتابات اليوم Server Actions أو Route Handlers تقرأ `auth()` من كوكي NextAuth** — التطبيق ما عنده كوكي. | يُبنى طبقة مصادقة بتوكن Bearer على مدونتي (نفس نمط الكونسول بعد إصلاحه: صفّ جلسة في القاعدة + إلغاء) وتُعاد كتابة نقاط الكتابة كـRoute Handlers تغلّف **نفس** الدوال. | `lib/auth.ts:18-21` (jwt strategy, cookie) · `console/lib/mobile-api/auth.ts:38-96` · `app/(site)/articles/[slug]/actions/like-article.ts:14` |
| ٢ | **الدوال الحيّة لا تفصل الهويّة عن المنطق**: `likeArticle` تنادي `auth()` داخلها، فلا يمكن استدعاؤها من نقطة Bearer بلا تعديل. | تعديل تركيبي واحد لكل دالّة: استخراج `likeArticleAs(userId, …)` ويبقى الأكشن الحالي غلافاً له. صفر منطق ثانٍ. | `like-article.ts:12-16` · `favorite-article.ts:12-16` · `reel-interactions.ts:31-33` · `submit-comment.ts:17-25` |
| ٣ | **العدّادات والتحليلات تعتمد كوكي `modonty_view_sid` + User-Agent** لمنع التكرار؛ التطبيق بلا كوكي → كل فتح مقال = مشاهدة جديدة وينفخ العدّاد. | رأس `X-Device-Id` ثابت من التطبيق يُستعمل بديلاً لـ`sessionId` في نفس منطق «آخر مشاهدة = نفس المقال». | `app/(site)/articles/[slug]/api/view/route.ts:40-50, 77-88` · `app/api/track/pageview/route.ts:45-70` |
| ٤ | **GA4 المتصفّحي (GTM) غير موجود في التطبيق**: ٨ أحداث تُرسل من المتصفّح فقط (`article_view` …) بسبب جلسات «Unassigned». | التطبيق **لا** يرسل عبر Measurement Protocol من الخادم (نفس المشكلة المقيسة). الخيار: Firebase Analytics SDK في التطبيق لأحداث العرض، والخادم يبقى على MP للأحداث الخادميّة كما هو. قرار لخالد (§٧). | `lib/analytics/ga4-browser.ts:1-40` · `view/route.ts:123-141` |
| ٥ | **OAuth على الجوّال**: الويب يستعمل Google عبر NextAuth بـredirect وكوكي PKCE؛ هذا لا يعمل داخل تطبيق أصلي. وApple إلزامي على iOS لو عرضنا Google. | التطبيق يحصل على `idToken` أصلياً (Google Sign-In / Apple) ويرسله لنقطة `POST /auth/google` تتحقّق منه بـ`google-auth-library.verifyIdToken` ثم تربطه بنفس `User`/`Account` (adapter). | `lib/auth.ts:25-32` · `auth.config.ts:12-19` · Expo docs (§٥) |

---

## ٢ · جدول القدرات (ما يملكه القارئ على الويب فعلاً)

الرموز: **V1** = أساس تطبيق القراءة · **V2** = بعد الإطلاق · **V3/لا** = لاحقاً أو خارج التطبيق. «أثر» = ما يُكتب غير الصفّ نفسه.

### ٢٫١ المحتوى (قراءة)

| # | القدرة | مسار الويب | الدالة (ملف:سطر) | مصادقة | أثر جانبي | كاش | التطبيق | السبب |
|---|---|---|---|---|---|---|---|---|
| 1 | الرئيسية: فيد المقالات (ترتيب اختيارات الأدمن ثم الأحدث) | `/` · `/page/[n]` | `getHomeFeedArticlesCached` — `app/(site)/(homepage)/data/home-feed-shapes.ts:71-84` · `getMoreArticles` — `data/get-more-articles.ts:17-40` | لا | لا | `"use cache"` · tag `articles` · hours (`home-feed-shapes.ts:72-74`) · الصفحة كلّها `cacheTag("homepage","articles","settings")` (`CachedHomePage.tsx:38-42`) | **V1** | الشاشة الأولى |
| 2 | الرئيسية: ريلز + صناعات + شركاء جدد | `/` | `getReelsFeedPage` · `getIndustriesWithCounts` · `getLatestPartners` (`lib/queries/get-latest-partners.ts:25-28`) | لا | لا | hours | V1 (ريلز/صناعات) | أقسام الرئيسية |
| 3 | أرشيف المقالات مع فلاتر (صناعة/تصنيف/وسم/بحث/ترتيب/وقت قراءة) | `/articles` | `getArticlesArchive` — `lib/articles/archive/get-articles-archive.ts:116-119` (سقف ٣٠٠ · `:40`) · `getArticlesFilters` `:49-52` · `filterByReadingTime` | لا | لا | tag `articles` · hours | **V1** | تصفّح |
| 4 | صفحة المقال (محتوى + كاتب + شريك + أسئلة + ذات صلة + عدّادات حيّة) | `/articles/[slug]` | `getArticlePageData` — `app/(site)/articles/[slug]/helpers/get-article-page-data.ts:63` ← `getArticleContentBySlug` (`data/get-article-content-by-slug.ts:14-17`) · `getArticleFaqs` (`:19-22`) · `getRelatedArticlesByArticleId` (`:108-116`) · `getArticleLiveCounts` (`data/get-article-live-counts.ts:26`, غير مكيّش عن قصد) | لا (الهويّة في جزر Suspense: `helpers/get-viewer.ts`) | لا | محتوى: tag `articles` hours · عدّادات: حيّة | **V1** | نفس المصدر للعنوان/الوصف/الكاتب/التاريخ (قاعدة AGENTS.md) |
| 5 | تعليقات المقال (المعتمدة فقط) + حالة إعجابي | `/articles/[slug]` | `getArticleComments` — `data/get-article-comments.ts:17-24` (`CommentStatus.APPROVED`) · `fetchArticleComments` (أكشن) · `getMyArticleReactions` `data/get-my-article-reactions.ts:14` | اختيارية | لا | حيّ | **V1** | — |
| 6 | التصنيفات: قائمة + صفحة تصنيف | `/categories` · `/categories/[slug]` | `getCategoriesEnhanced` — `app/(site)/categories/helpers/get-categories-enhanced.ts:11` (`unstable_cache`) · `loadMoreCategories` أكشن `categories/actions.ts:11` · استعلامات الصفحة داخل `categories/[slug]/page.tsx:35-124` (٥ دوال `use cache` tag `categories`/`clients`/`reviews`) | لا | لا | hours | **V1** | — |
| 7 | الوسوم: قائمة + صفحة وسم | `/tags` · `/tags/[slug]` | `getTagsEnhanced` — `tags/helpers/get-tags-enhanced.ts:18` · `loadMoreTags` `tags/actions.ts:12` · `tags/[slug]/page.tsx:46-128` | لا | لا | hours | V2 | أقلّ أولوية من التصنيفات |
| 8 | الصناعات: قائمة + صفحة صناعة (فيد + شركاء) | `/industries` · `/industries/[slug]` | `getIndustriesEnhanced` — `lib/queries/get-industries-enhanced.ts:16` · `getIndustryFeed` `industries/data/get-industry-feed.ts` · `getIndustriesWithCounts` · `loadMoreIndustries` `industries/actions.ts:12` | لا | لا | hours | **V1** | محور التصفّح في مدونتي |
| 9 | دليل الشركاء (فلترة/ترتيب) | `/clients` | `getClientsList` — `lib/queries/get-clients-list.ts:59-62` (٥٠٠ شريك · `:118`) · `filterPartners` · `parsePartnersQuery` | لا | لا | tag `clients` hours | **V1** | — |
| 10 | صفحة الشريك (الرئيسية) + صفحاته الداخلية (about/articles/services/photos/faq/reviews/contact/book/followers/likes/mentions/reels) | `/clients/[slug]/**` | `getClientPageData` — `app/(partner)/clients/[slug]/helpers/client-page-data.ts:15-18,100` · `getPartnerSite` `helpers/get-partner-site.ts:12-15` · `getCachedHomeData` `:7-11` · `getClientGallery` `:20-29` · `getClientPageFaqs` `client-faqs.ts:59-61` · `getClientReviews` `client-reviews.ts:27-41` · `getClientFollowers` `client-followers.ts:5-10` · `getClientStats` `client-stats.ts:6-9` · `getClientEngagementBySlug` | لا | لا | tags `clients` + `client:<slug>` (`shared/lib/cache/client-cache-tags.ts:13-22`) · hours | **V1** (الرئيسية + المقالات + التواصل) · V2 بقيّة التبويبات | «أساس البيزنس موديل» |
| 11 | صفحة الكاتب | `/authors/[slug]` | استعلامات داخل `authors/[slug]/page.tsx:94-126` (`use cache` tag `authors`) | لا | لا | hours | V2 | — |
| 12 | الريلز: فيد عام (cursor) + ريل واحد + جيرانه + فلتر شريك | `/reels` · `/reels/[slug]` | `getReelsFeedPage(cursor, clientSlug)` — `lib/queries/get-reels-feed-page.ts:48-51` (حجم ٦ · `reels-feed-shapes.ts:2` · `nextCursor` `:126`) · `getReelClientFilterOptions` `:16-18` · `getReelBySlug` `reels/[slug]/data/get-reel-by-slug.ts:41-45` · `getReelNeighbors` `:11-13` · `getUserReelFlags` `lib/queries/get-user-reel-flags.ts:4` | اختيارية للحالة الشخصية | لا | tag `reels` hours؛ الإعجاب يستدعي `updateTag("reels")` (`reel-interactions.ts:61`) | **V1** | المحتوى الأعلى تفاعلاً |
| 13 | تعليقات الريل + إعجاب تعليق | `/reels` | `getReelComments(mediaId, userId)` — `reels/data/get-reel-comments.ts:23-27` (APPROVED · سقف ٢٠٠) | اختيارية | لا | حيّ | V2 | — |
| 14 | الصوت (مقالات لها `audioUrl`) | `/audio` | `getAudioArticles` — `audio/data/get-audio-articles.ts:39-42` | لا | لا | hours | V2 | مشغّل داخل المقال يكفي V1 |
| 15 | الرائج (٧ أيام) | `/trending` | `getTrendingArticles(limit, days)` — `trending/helpers/get-trending-articles.ts:17-30` (React `cache` فقط، بلا `use cache`) | لا | لا | لا (حيّ) | V2 | — |
| 16 | أخبار مدونتي (مقالات الناشر الأساسي) | `/news` | `getArticles` — `lib/queries/get-articles.ts:11` ← `getArticlesCached` `article-feed-shapes.ts:115-118` | لا | لا | hours | V2 | — |
| 17 | قطاعات مدونتي (ai/education/entertainment/entrepreneurship/football/health) + APIs بيانات مفتوحة | `/modonty/*` · `GET /modonty/health/api/drugs` … | `getSectorArticles` · `getSectorHero` + دوال لكل قطاع (`modonty/*/data/*`) | لا | لا | `Cache-Control: s-maxage=86400` على الـAPIs (`modonty/health/api/drugs/route.ts:14`) | V3 | محتوى تحريري خاص؛ `/modonty/[sector]` يرجّع 404 (`modonty/[sector]/page.tsx:9-11`) |
| 18 | صفحات ثابتة (about/contact/legal×4/trust/story/team/help/faq/terms/quran/accounts) | `/about` … | `getContentPageRow` — `lib/seo/get-content-page-row.ts` (tag `pages`) · `getActiveFAQs` `help/faq/actions/faq-actions.ts:5` · `getAccountsData` `accounts/helpers/get-accounts-data.ts:21-23` | لا | لا | hours | V2 (عن/خصوصية/شروط فقط) | متطلّب متجر التطبيقات: رابط خصوصية |
| 19 | RSS / llms.txt / image-sitemap | `/feed.xml` … | `app/feed.xml/route.ts:25-30` | لا | لا | `s-maxage=3600` (`:87`) | لا | للمحرّكات |

### ٢٫٢ البحث والاكتشاف

| # | القدرة | مسار الويب | الدالة | مصادقة | أثر | كاش | التطبيق | السبب |
|---|---|---|---|---|---|---|---|---|
| 20 | بحث مقالات + شركاء (`q`, `type`, ترتيب) | `/search` | `getArticles({search})` — `article-feed-shapes.ts:179-181` (`contains` insensitive على title/excerpt/content) · `getClientsSearch` — `search/helpers/get-clients-search.ts:9-17` · `safeLiteralSearch` `lib/search/safe-literal-search.ts` | لا | لا | hours (مفتاح الكاش يتضمّن النصّ) | **V1** | — |
| 21 | مودو (مساعد ذكي: سؤال/تاريخ/تقييم/اسأل الشريك) | `/modo-chat` · `POST /modo-chat/api/chat` | `modo-chat/api/chat/route.ts:45` · `checkRateLimit` `data/check-rate-limit.ts:41` · `spendAnonymousQuestion` (كوكي موقَّع `modo_trial` · `check-anonymous-quota.ts:7-9`) · `rateAnswer` · `askPartnerFromChat` `data/ask-partner-from-chat.ts:35-39` | اختيارية؛ المجهول ٣ أسئلة بكوكي | يكتب `ChatbotMessage` · Cohere | لا | V3 | تكلفة Cohere + الحصّة المجهولة تعتمد كوكي؛ تحتاج تصميم حصّة بالجهاز |

### ٢٫٣ الحساب والمصادقة

| # | القدرة | مسار الويب | الدالة | مصادقة | أثر | التطبيق |
|---|---|---|---|---|---|---|
| 22 | تسجيل بالبريد (name/email/password/marketingConsent/alertTopic) | `/users/register` | `registerUser` — `users/register/actions/register-actions.ts:18-64` · `registerSchema` `helpers/schemas/register-schema.ts:6-31` · bcrypt 10 (`:49`) | لا | بريد ترحيب + بريد تحقّق (Resend · `:93-109`) · Telegram أدمن · `Conversion SIGNUP` · GA4 `signup_complete` (`:118`) | **V1** |
| 23 | دخول بالبريد/كلمة المرور | `/users/login` | NextAuth Credentials — `auth.config.ts:20-60` (`db.user.findUnique` + bcrypt) | — | GA4 `login_start` من المتصفّح (`users/login/api/track/route.ts:14-24`) | **V1** (نقطة Bearer جديدة تعيد نفس التحقّق) |
| 24 | دخول Google | `/users/login` | NextAuth Google + `allowDangerousEmailAccountLinking` — `auth.config.ts:12-19` · `PrismaAdapter` `lib/auth.ts:20` · حدث `createUser` يسجّل التحويل (`lib/auth.ts:38-49`) | — | `Conversion SIGNUP` · GA4 `signup_complete{google}` | **V1** (idToken أصلي → نقطة جديدة) |
| 25 | نسيت/إعادة كلمة المرور | `/users/forgot-password` · `/users/reset-password` | `forgotPasswordAction` — `forgot-password-action.ts:13-52` (توكن SHA-256 · بريد Resend) · `resetPasswordAction` — `reset-password-action.ts:15-44` (bcrypt 12) | لا | بريد | **V1** (الرابط في البريد يفتح الويب — يكفي) |
| 26 | تحقّق البريد | `/users/verify-email?token=` | `users/verify-email/page.tsx:11-26` (`VerificationToken`) | لا | — | لا (يبقى ويب) |
| 27 | الملف الشخصي (إحصاءات/نشاط/مفضّلة/إعجابات/تعليقات/متابَعون/حجوزات/غير معجَب) | `/users/profile/**` | `getProfileStats` `profile/helpers/profile-stats.ts:20-41` · `getProfileActivity` `:35` · `getProfileFavorites` `:23` · `getProfileLiked` `:28` · `getProfileComments` `:39` · `getProfileFollowing` `:20` · `getProfileBookings` `:19` · `getProfileDisliked` `:37` | **نعم** (`auth()` + redirect) | لا | **V1** (المفضّلة + المتابَعون + الإعجابات) · V2 البقيّة |
| 28 | الإعدادات: تعديل الاسم/النبذة/الصورة · إنشاء/تغيير كلمة المرور · تفضيلات التنبيهات (مواضيع + قنوات + جوّال E.164) · الحسابات المرتبطة | `/users/profile/settings` | `updateProfile` · `createPassword` · `changePassword` — `settings/actions/settings-actions.ts:17-139` · `GET/PUT settings/api/[id]/route.ts:29-153` · `GET …/accounts/route.ts:6` · رفع الصورة `POST profile/api/avatar/route.ts:58-89` (Bunny · ٤ ميجا) · `readAlertPreferences` `lib/users/read-alert-preferences.ts:22` | نعم | `revalidatePath` | V2 |
| 29 | صفحة مستخدم عامّة | `/users/[id]` | `users/[id]/page.tsx:104-137` (`use cache` tag `users`) | لا | لا | V3 |

### ٢٫٤ التفاعل (كتابة)

| # | القدرة | الدالة (ملف:سطر) | مصادقة | أثر جانبي | التطبيق |
|---|---|---|---|---|---|
| 30 | إعجاب/إلغاء إعجاب مقال (يلغي «لا يعجبني») | `likeArticle(articleId, slug)` — `articles/[slug]/actions/like-article.ts:12-61` · `incrementCounters` `lib/counters/increment-counters.ts:18` (`$inc` بلا transaction) | نعم | `revalidatePath` · `fireEngagement` → Telegram `articleLike` + GA4 `article_like` (`lib/articles/fire-engagement.ts:15-62`) | **V1** |
| 31 | لا يعجبني مقال | `dislikeArticle` — `dislike-article.ts:11-66` (ما زال `db.article.update increment` داخل transaction · `:35-57`) | نعم | Telegram + GA4 | V2 |
| 32 | حفظ/مفضّلة مقال | `favoriteArticle` — `lib/articles/favorite-article.ts:12-53` | نعم | Telegram `articleFavorite` + GA4 | **V1** |
| 33 | تعليق + ردّ (يُنشَر PENDING حتى يعتمده الشريك) | `submitComment` — `submit-comment.ts:17-95` · `submitReply` — `submit-reply.ts:17-101` · `validateCommentContent`/`sanitizeComment` `lib/comments/validate-comment.ts` | نعم | Telegram `commentNew`/`commentReply` · GA4 · `revalidatePath` | **V1** (تعليق) · V2 (ردّ) |
| 34 | إعجاب تعليق | `likeComment(commentId, slug)` — `like-comment.ts:12-87` | نعم | Telegram `commentLike` · GA4 | V2 |
| 35 | مشاركة مقال (تتبّع) | `POST /articles/[slug]/api/share` — `api/share/route.ts:24-127` (حدّ ١٠/ساعة/جلسة · `:54-67`) | اختيارية | `Share` row · Telegram `articleShare` · GA4 `article_share` | **V1** |
| 36 | مشاهدة مقال (عدّاد + Analytics + Clarity tags) | `POST /articles/[slug]/api/view` — `view/route.ts:14-142` (dedupe بآخر مشاهدة للجلسة `:77-88`) · `PATCH …/api/analytics/[id]` (timeOnPage/scroll/LCP · `analytics/[id]/route.ts:11-56`) | اختيارية | `ArticleView` + `Analytics` + `$inc viewsCount` · Telegram `articleView` · يرجّع params GA4 للمتصفّح | **V1** |
| 37 | نقر رابط داخل المقال / نقر CTA | `POST /articles/api/track/article-link-click` (`:11-70`) · `POST /api/track/cta-click` (`:42-90` · سقف ٢٠ تنبيه/ساعة/شريك `:33`) | اختيارية | صفوف + Telegram | V2 |
| 38 | متابعة شريك (ClientLike = متابعة) · «تابع مدونتي» = متابعة صفّ Client الأساسي | `GET/POST/DELETE /clients/[slug]/api/follow` — `follow/route.ts:8-193` · `FollowCtaButton.tsx:19-27,52` · `getCoreClientSlug` `lib/settings/get-core-client-slug.ts:11` | نعم | Telegram `clientFollow` · GA4 `follow_client` | **V1** |
| 39 | مفضّلة شريك | `GET/POST/DELETE /clients/[slug]/api/favorite` — `favorite/route.ts:21-138` | نعم | Telegram + GA4 | V2 |
| 40 | مشاهدة/مشاركة صفحة شريك | `POST /clients/[slug]/api/view` (`:12-100`) · `POST …/api/share` (`:35-98`) | اختيارية | `ClientView`/`Share` · Telegram | **V1** (view) · V2 (share) |
| 41 | تقييم شريك (نجوم + نصّ، PENDING) | `postClientReviewAction` — `clients/[slug]/actions/client-review-actions.ts:30-94` (upsert) | نعم | `revalidatePath` | V2 |
| 42 | سؤال للشريك (من صفحته أو من مقال) | `submitClientPageQuestion` — `client-faq-actions.ts:23-98` (سقف ٥ معلّقة `:54-63`) · `submitAskClient` — `components/client/submit-ask-client.ts:15-109` | نعم (+ اسم وبريد في الحساب `:50`) | Telegram `askClientQuestion` · GA4 | V2 |
| 43 | حجز/اترك رقمك (لشريك) | `submitBookingRequest` — `components/shared/booking-form/booking-actions.ts:149-397` · `POST /api/booking` يغلّفه (`api/booking/route.ts:24-67`) · `recordWhatsappLead` `:75` | اختيارية | `BookingRequest` · Push لجوّال العميل (`lib/mobile-push.ts:15`) · `Notification` للأدمن (`:280`) · بريد · Telegram `bookingRequest` · GA4 · اشتراك نشرة اختياري (`:379-381`) | **V1** |
| 44 | ريلز: إعجاب/حفظ · تعليق/ردّ · إعجاب تعليق · مشاهدة · مشاركة | `toggleReelLike`/`toggleReelFavorite` — `reels/actions/reel-interactions.ts:96-100` · `submitReelComment` `:18` · `submitReelCommentReply` `:14` · `toggleReelCommentLike` `:14` · `trackReelView` `track-reel-view.ts:31-47` (بلا dedupe) · `trackReelShareEvent` `:17` | نعم (إلا view/share) | `updateTag("reels")` · Telegram · GA4 | **V1** (like/save/view) · V2 (تعليق/مشاركة) |
| 45 | ريلزي (ما أعجبني/حفظته) | `getMyReels` — `reels/data/get-my-reels.ts:25` · `fetchMyReels` | نعم | — | V2 |
| 46 | اشتراك النشرة العامّة · اشتراك نشرة شريك | `POST /api/news/subscribe` (`:23-90` · حدّ IP في الذاكرة) · `POST /api/subscribers` (`:17-92` · ٥/ساعة/بريد) | لا | بريد ترحيب · Telegram · `Conversion NEWSLETTER` | V2 |
| 47 | رسالة تواصل (دعم) | `submitContactMessage` — `contact/actions/contact-actions.ts:21-94` · `POST /contact/api` (`:10-53` · ٣/ساعة/IP) | اختيارية | `ContactMessage` · Telegram `supportMessage` · GA4 | V2 |
| 48 | تقييم سؤال شائع (مفيد/لا) | `submitFAQFeedback` — `help/faq/actions/faq-feedback-actions.ts:7-36` | اختيارية | — | لا |
| 49 | تفعيل تنبيه موضوع (قطاعات) | `enableTopicAlert` — `modonty/actions.ts:22-38` | نعم | يكتب `notificationPreferences` | V3 |
| 50 | عجلة الحظّ (حملة) | `POST /api/lucky-wheel` (`:25-67` · حدّ IP في الذاكرة) | لا | `LuckyWheel` row | لا (حملة موسمية) |

### ٢٫٥ الإشعارات

| # | القدرة | الدالة | مصادقة | التطبيق |
|---|---|---|---|---|
| 51 | قائمة إشعاراتي (`comment_*` · `reel_comment_*` · `faq_reply` · ردّ رسالة تواصل) + تفاصيل + عدّاد غير المقروء | `users/notifications/page.tsx:78-128` · `getUnreadNotificationCount` `app/layout/components/notifications/get-unread-notification-count.ts:16` · `markNotificationAsRead` `notifications/actions/notifications-actions.ts:7-15` | نعم | **V1** (قائمة + قراءة) |
| 52 | من يكتب الإشعار؟ | **مدونتي لا تكتب أي إشعار للقارئ** (`db.notification.create` الوحيد للأدمن: `booking-actions.ts:280`). الكاتب هو الكونسول (اعتماد تعليق/ردّ سؤال) والأدمن. | — | Push للقارئ **غير موجود** في أي طبقة اليوم (`MobileDevice` مرتبط بـ`clientId` فقط · `shared/prisma/schema/schema.prisma:5182-5209`) → يحتاج جدولاً جديداً `ReaderDevice` + نداء من الكونسول/الأدمن عند الكتابة. V2. |

---

## ٣ · نقاط API الموجودة اليوم — ما يصلح للتطبيق كما هو

| النقطة | عامّة؟ | تعتمد كوكي؟ | الحكم للتطبيق | الدليل |
|---|---|---|---|---|
| `GET /articles/api/list?page&sort&time&industry&category&tag&search&modonty=1` | نعم | لا | **قابلة للاستعمال فوراً** (مكتوب فيها «the door the mobile app will use») — لكن صفحات offset على مصفوفة ≤٣٠٠، بلا `Cache-Control`، وترجع `FeedPost` كاملاً | `articles/api/list/route.ts:11-45` |
| `GET /api/articles?page&category&client&view` (الرئيسية) | نعم | لا | قابلة فوراً («Public endpoint for the coming mobile app») — offset | `(homepage)/api/articles/route.ts:3-25` |
| `POST /api/news/subscribe` · `POST /api/subscribers` | نعم | لا (IP فقط) | قابلة؛ لكن `getOrCreateSessionId` يكتب كوكي لن يراه التطبيق — يعمل بلا ضرر | `api/news/subscribe/route.ts:84-88` |
| `POST /api/booking` | نعم | لا | قابلة فوراً؛ تمرّر لنفس الأكشن | `api/booking/route.ts:46-57` |
| `POST /api/lucky-wheel` | نعم | لا | قابلة؛ حملة | `api/lucky-wheel/route.ts:25` |
| `POST /articles/[slug]/api/view` · `/share` · `PATCH /api/analytics/[id]` · `/clients/[slug]/api/view` · `/share` · `/api/track/pageview` · `/api/track/cta-click` · `article-link-click` | نعم | **نعم** — `modonty_view_sid` للتكرار/الحدّ، و`auth()` اختياري | لا تُستعمل مباشرة: بلا الكوكي يسقط dedupe والحدّ. تُعاد كتابتها خلف `/api/mobile/v1` بمفتاح `X-Device-Id` | `view/route.ts:40-50,77` · `share/route.ts:54-67` |
| `GET/POST/DELETE /clients/[slug]/api/follow` · `/favorite` | — | **نعم** `auth()` | لا تُستعمل مباشرة (كوكي NextAuth فقط) | `follow/route.ts:13-17` |
| `GET/PUT /users/profile/settings/api/[id]` · `/accounts` · `POST /users/profile/api/avatar` | — | نعم | نفس الشيء | `settings/api/[id]/route.ts:34` |
| `POST /modo-chat/api/*` · `GET conversation/history/memory` | — | جزئياً (`modo_trial` + `auth()`) | V3 | `check-anonymous-quota.ts:9` |
| `GET /modonty/*/api/*` (أدوية/مرافق/مدارس/أنشطة) | نعم | لا | قابلة؛ V3 | `Cache-Control` موجود |
| `POST /api/revalidate*` | داخلية (سرّ) | — | **لا** | `api/revalidate/tag/route.ts:31-45` |
| `GET/POST /api/auth/[...nextauth]` | — | كوكي | لا تُستعمل من التطبيق (redirect + PKCE cookies) | `lib/auth.ts:25-32` |
| `/users/login/api/track` · `/users/register/api/track` | نعم | `auth()` اختياري | يُستبدل بأحداث التطبيق | — |

**الصيغ الحالية غير موحّدة**: `{success,data,error}` (`lib/types.ts:6`) · `{ok}` · `{items,hasMore}` · `Response.json({error})`. الكونسول يستعمل `{data}` / `{error:{code,message}}` (`console/lib/mobile-api/http.ts:22-31`). **الحكم:** تطبيق القارئ يأخذ غلاف الكونسول نفسه.

---

## ٤ · عقد الـAPI المقترح — `modonty/app/api/mobile/v1/**`

### ٤٫٠ القواعد العامّة للعقد

| البند | القرار | المرجع |
|---|---|---|
| الغلاف | نجاح `{ data }` · فشل `{ error: { code, message, details? } }` · الرموز: `UNAUTHORIZED 401` `FORBIDDEN 403` `NOT_FOUND 404` `VALIDATION_ERROR 422` `CONFLICT 409` `RATE_LIMITED 429` `INTERNAL_ERROR 500` — نسخة `modonty/lib/mobile-api/http.ts` مطابقة لـ`console/lib/mobile-api/http.ts:3-31` | إعادة استعمال |
| قراءة الجسم | `readBody(request, zodSchema)` — نسخة `console/lib/mobile-api/request.ts:5-8` | — |
| المعرّفات | ObjectId يُفحص قبل القاعدة (`console/lib/mobile-api/params.ts:6,19`) | — |
| المصادقة | `Authorization: Bearer <token>` · التوكن `next-auth/jwt encode` بـsalt خاص `modonty-reader-mobile-v1` ويحمل `sid` لصفّ `ReaderSession` (§٥) | `console/lib/mobile-api/auth.ts:17,38-67` |
| هويّة الجهاز | رأس `X-Device-Id` (UUID يولّده التطبيق مرّة ويخزّنه) · إلزامي على نقاط التتبّع؛ يحلّ مكان `modonty_view_sid` | `view/route.ts:40-50` |
| الترقيم | **cursor** لكل قائمة جديدة (`?cursor=<id>&limit=`) ← يُرجَع `{ items, nextCursor }`؛ الدوال الحالية offset (`getArticles` `skip/take` `article-feed-shapes.ts:194-195`) تبقى كما هي خلف نقاط «الرئيسية» و«الأرشيف» لأن ترتيبها تحريري ومسقوف (٣٠٠) — تُرجَع `{ items, page, hasMore }` | `get-reels-feed-page.ts:91-92,126` نموذج cursor موجود |
| الكاش للقراءة العامّة | النقطة تنادي دالّة `"use cache"` الموجودة (نفس الوسم ونفس `cacheLife`) **و**تضيف `Cache-Control: public, s-maxage=300, stale-while-revalidate=3600` على النقاط العامّة فقط؛ أي نقطة تقرأ Bearer أو `X-Device-Id` → `Cache-Control: private, no-store` | `modonty/health/api/drugs/route.ts:14` نمط موجود |
| الحقول | **نفس** أنواع الويب: `FeedPost` (`lib/types.ts:70-112`) للقوائم · `ArticleResponse` (`:20-59`) للمقال · `ClientListItem` (`get-clients-list.ts:8-30`) للشركاء · `ReelFeedItem` (`reels-feed-shapes.ts:4`) للريلز. لا DTO ثانٍ. | AGENTS.md |
| الرسائل | عربية، بصيغة الويب الحالية حيث وُجدت (مثال `"يجب تسجيل الدخول لطرح سؤال"` `client-faq-actions.ts:29`) | — |
| الحدّ | مثل الكونسول: حدّ دخول في القاعدة ٥/١٥ دقيقة (`console/lib/mobile-api/login-throttle.ts:10-11`) لا في الذاكرة (`api/news/subscribe/is-subscribe-rate-limited.ts` في الذاكرة — لا يصلح على Vercel) | — |

### ٤٫١ المحتوى (قراءة) — عامّة

| # | Method · Path | Request (Zod) | Response `data` | ترقيم | كاش | يغلّف |
|---|---|---|---|---|---|---|
| C1 | `GET /home` | — | `{ articles: FeedPost[], reels: ReelFeedItem[], industries: {…}[], partners: LatestPartner[] }` | — | tags `homepage/articles/reels/settings` hours + CDN 300s | `getHomeFeedArticlesCached` · `getReelsFeedPage()` · `getIndustriesWithCounts` · `getLatestPartners` — نفس `CachedHomePage.tsx:5-11` |
| C2 | `GET /articles?page&category&client&view` | `page:int≥1`, `view∈latest/popular/audio` | `MoreArticlesResult {articles: FeedPost[], hasMore}` | offset | hours + CDN | `getMoreArticles` (`get-more-articles.ts:17`) — **موجودة** كـ`/api/articles`؛ تُعاد تحت `/mobile/v1` بالغلاف الموحّد |
| C3 | `GET /articles/archive?page&sort&time&industry&category&tag&search&modonty` | كما في `articles/api/list/route.ts:16-33` | `{ items: ArchiveArticle[], hasMore, filters? }` | offset (≤٣٠٠) | hours + CDN | `getArticlesArchive` + `filterByReadingTime` (+ `getArticlesFilters` عند `?withFilters=1`) |
| C4 | `GET /articles/:slug` | slug ≤٢٠٠ | `{ article: ArticleResponse+content(sanitized), faqs, related, readMore, cta }` — **نفس** ما ترجعه `getArticlePageData` | — | tag `articles` hours + CDN | `getArticlePageData(slug)` (`get-article-page-data.ts:63-172`) |
| C5 | `GET /articles/:slug/counts` | — | `ArticleLiveCounts {likes,favorites,comments,views}` + (مع Bearer) `{ liked, disliked, favorited }` | — | `no-store` | `getArticleLiveCounts` (`:26`) · `getMyArticleReactions` (`:14`) |
| C6 | `GET /articles/:id/comments` | id ObjectId | `{ comments: Comment[] (APPROVED, شجرة) , likedByMe[] }` | — (الويب بلا سقف · `get-article-comments.ts:24`) → نضيف `take:200` كالريلز | `no-store` | `getArticleComments` + `flattenCommentsWithContext` |
| C7 | `GET /categories?search&sort&page` | — | `CategoryResponse[]` | offset | hours + CDN | `getCategoriesEnhanced` (`get-categories-enhanced.ts:11`) |
| C8 | `GET /categories/:slug?page` | — | `{ category, articles: FeedPost[], partners, hasMore }` | offset | hours + CDN | الدوال الـ`use cache` داخل `categories/[slug]/page.tsx:35-124` **تُستخرج** إلى `categories/[slug]/data/*.ts` (نقل بلا تغيير) |
| C9 | `GET /tags` · `GET /tags/:slug` | — | مثل C7/C8 | offset | hours | `getTagsEnhanced` · `tags/[slug]/page.tsx:46-128` (استخراج مماثل) — V2 |
| C10 | `GET /industries` · `GET /industries/:slug?page` | — | `IndustryListItem[]` · `{ industry, feed: FeedPost[], partners }` | offset | hours | `getIndustriesEnhanced` · `getIndustryFeed` · `getClientsList` |
| C11 | `GET /partners?q&industry&city&sort` | كما `parsePartnersQuery` | `ClientListItem[]` (مفلترة) | offset | tag `clients` hours + CDN | `getClientsList` + `filterPartners` (`clients/helpers/*`) |
| C12 | `GET /partners/:slug` | — | `{ page: ClientPageData, site: PartnerSite, home: CachedHomeData, gallery[], faqs[], stats }` | — | tags `clients`,`client:<slug>` + CDN | `getClientPageData` · `getPartnerSite` · `getCachedHomeData` · `getClientGallery` · `getClientPageFaqs` · `getClientStats` |
| C13 | `GET /partners/:slug/articles?page` · `/reviews?page` · `/followers` | — | `FeedPost[]` · `ClientReview[] (APPROVED)` · followers | offset | hours | `getClientPageData` (مقالات) · `getClientReviews` · `getClientFollowers` — V2 |
| C14 | `GET /reels?cursor&client` | `cursor: ObjectId?` · `client: slug?` | `{ items: ReelFeedItemWithState[], nextCursor }` (الحالة الشخصية مع Bearer) | **cursor** (٦) | tag `reels` hours؛ مع Bearer `no-store` | `getReelsFeedPage(cursor, clientSlug)` + `getUserReelFlags` — نفس `load-more.ts:14-17` |
| C15 | `GET /reels/filters` | — | `ReelClientFilterOption[]` | — | hours + CDN | `getReelClientFilterOptions` |
| C16 | `GET /reels/:slug` | — | `{ reel: ReelWatch, neighbors: {newer, older} }` | — | hours + CDN | `getReelBySlug` · `getReelNeighbors` |
| C17 | `GET /reels/:id/comments` | — | `ReelComment[]` (مع `likedByMe`) | ≤٢٠٠ | `no-store` | `getReelComments(mediaId, userId)` — V2 |
| C18 | `GET /authors/:slug?page` | — | `{ author, articles, hasMore }` | offset | hours | استخراج دوال `authors/[slug]/page.tsx:94-126` — V2 |
| C19 | `GET /audio` · `GET /trending?period` · `GET /news?page` | — | `AudioArticle[]` · `ArticleResponse[]` · `FeedPost[]` | — | hours / حيّ | `getAudioArticles` · `getTrendingArticles` · `getArticles` — V2 |
| C20 | `GET /pages/:key` (`about`,`privacy-policy`,`user-agreement`,`terms`) | key enum | `{ title, html, updatedAt }` | — | tag `pages` hours + CDN | `getContentPageRow` — V2 |

### ٤٫٢ الاكتشاف والبحث — عامّة

| # | Method · Path | Request | Response | ترقيم | كاش | يغلّف |
|---|---|---|---|---|---|---|
| S1 | `GET /search?q&type=articles|partners|all&page&sort` | `q: string.trim().min(2).max(100)` · `safeLiteralSearch` | `{ articles: {items: ArticleResponse[], total}, partners: ClientResponse[] }` | offset | hours (المفتاح يحوي `q`) + CDN 60s | `getArticles({search})` · `getClientsSearch(q, sort, limit)` — نفس `search/page.tsx:4-5` |
| S2 | `GET /search/suggest?q` | — | — | — | — | **جديد — لا يُبنى**: لا يوجد مصدر على الويب؛ V3 لو طُلب |

### ٤٫٣ المصادقة والحساب

| # | Method · Path | Auth | Request (Zod) | Response | أخطاء | أثر | يغلّف |
|---|---|---|---|---|---|---|---|
| A1 | `POST /auth/register` | عامّة | `registerSchema` نفسه (`register-schema.ts:6-31`) + `deviceId` | `{ accessToken, refreshToken, expiresIn, user:{id,name,email,image,hasPassword} }` | `VALIDATION_ERROR` · `CONFLICT "البريد الإلكتروني مستخدم بالفعل"` (`register-actions.ts:45`) | نفس `registerUser`: بريدان · Telegram · Conversion · GA4 | `registerUser(data)` ثم `startReaderSession` |
| A2 | `POST /auth/login` | عامّة | `{ email: email.max(320), password: min(1).max(256) }` | كما A1 | `RATE_LIMITED` (٥/١٥ دقيقة بالقاعدة · `Retry-After`) · `UNAUTHORIZED "البريد الإلكتروني أو كلمة المرور غير صحيحة."` | يسجّل `login_start`؟ لا — الويب لا يسجّل `login_complete` (`login/api/track/route.ts:12`) | **نفس** تحقّق `auth.config.ts:32-47` يُستخرج إلى `lib/auth/verify-credentials.ts` ويُستعمل من الاثنين |
| A3 | `POST /auth/google` | عامّة | `{ idToken: string, deviceId }` | كما A1 | `UNAUTHORIZED "تعذّر التحقّق من حساب جوجل."` | إن أنشأ مستخدماً جديداً: نفس `events.createUser` (`lib/auth.ts:38-49`: Conversion + GA4 `signup_complete{google}`) | **جديد**: `google-auth-library.verifyIdToken({idToken, audience:[webClientId, iosClientId, androidClientId]})` → `email_verified` → `db.account.findUnique({provider:'google', providerAccountId: sub})` وإلا ربط بالبريد (نفس سياسة `allowDangerousEmailAccountLinking` `auth.config.ts:15-18`) |
| A4 | `POST /auth/apple` | عامّة | `{ identityToken, nonce, fullName? }` | كما A1 | — | — | **جديد** (إلزامي iOS — §٥). التحقّق بـJWKS أبل (`jose`) · `Account.provider='apple'` |
| A5 | `POST /auth/refresh` | Bearer (refresh) | — | `{ accessToken, refreshToken, expiresIn }` | `UNAUTHORIZED "انتهت الجلسة. سجّل الدخول مرة أخرى."` | يدوّر `refreshToken` ويحدّث `ReaderSession.expiresAt` | نمط `refreshMobileSession` (`console/lib/mobile-api/auth.ts:70-73`) |
| A6 | `POST /auth/logout` | Bearer | `{ deviceId? }` | `{ signedOut: true }` | — | يلغي صفّ الجلسة **ويعطّل `ReaderDevice`** للجهاز (علاج الخلل ٣ في تدقيق الكونسول) | نمط `endMobileSession` (`:79-87`) |
| A7 | `POST /auth/forgot-password` | عامّة | `{ email }` | `{ sent: true }` دائماً | — | بريد Resend | `forgotPasswordAction` (يقبل FormData اليوم `:13` → غلاف يبني FormData أو يُستخرج جسمه) |
| A8 | `GET /me` | Bearer | — | `{ user:{id,name,email,image,bio,createdAt,hasPassword,phone?}, stats: ProfileStats, unreadNotifications }` | — | — | `db.user.findUnique` select كما `auth.config.ts:100-111` · `getProfileStats` · `getUnreadNotificationCount` |
| A9 | `PATCH /me` | Bearer | `profileSchema` (`settings-schemas.ts`) | `{ user }` | `VALIDATION_ERROR` | `revalidatePath("/users/profile")` كما `settings-actions.ts:40-41` | `updateProfile(userId, data)` بعد استخراج الهويّة |
| A10 | `POST /me/avatar` | Bearer · multipart | ≤٤ ميجا · jpg/png/webp | `{ url }` | كما `avatar/route.ts:69-83` | Bunny | نفس جسم `avatar/route.ts:58-89` بعد استبدال `auth()` — V2 |
| A11 | `POST /me/password` | Bearer | `passwordSchema` | `{ ok }` | `"كلمة المرور الحالية غير صحيحة"` (`:135`) | **يلغي كل جلسات القارئ عدا الحالية** (نمط `revokeAllMobileSessions` `console/lib/mobile-api/auth.ts:90-96`) | `changePassword`/`createPassword` — V2 |
| A12 | `GET/PUT /me/alerts` | Bearer | `{ topics, channels, phone(E.164) }` | `AlertPreferences` | — | — | `readAlertPreferences` + أكشن التنبيهات في `settings-actions.ts` — V2 |
| A13 | `GET /me/favorites?page` · `/me/following?page` · `/me/liked?page` · `/me/comments?page` · `/me/bookings?page` · `/me/reels` | Bearer | `page, limit≤50` | نفس مخرجات `profile-*.ts` | — | — | `getProfileFavorites` · `getProfileFollowing` · `getProfileLiked` · `getProfileComments` · `getProfileBookings` · `getMyReels` |
| A14 | `DELETE /me` | Bearer | `{ password? }` | `{ deleted: true }` | — | — | **جديد — لا يوجد على الويب** · متطلّب متجري (Apple 5.1.1(v)) · قرار لخالد |

### ٤٫٤ التفاعل (كتابة) — Bearer إلا ما ذُكر

| # | Method · Path | Request | Response | أثر (نفس الويب) | يغلّف (بعد استخراج `…As(userId)`) |
|---|---|---|---|---|---|
| E1 | `POST /articles/:id/like` (toggle) | `{ slug }` | `{ liked: boolean, likesCount, dislikesCount }` | `incrementCounters` · `revalidatePath` · Telegram+GA4 عبر `fireEngagement` | `likeArticle` (`like-article.ts:12`) |
| E2 | `POST /articles/:id/dislike` (toggle) | `{ slug }` | `{ disliked, likesCount, dislikesCount }` | كما الويب | `dislikeArticle` — V2 |
| E3 | `POST /articles/:id/favorite` (toggle) | `{ slug }` | `{ favorited, favoritesCount }` | كما الويب | `favoriteArticle` (`favorite-article.ts:12`) |
| E4 | `POST /articles/:id/comments` | `{ slug, content: validateCommentContent }` | `{ comment (status PENDING) }` + رسالة «تعليقك بانتظار موافقة الشريك» | Telegram `commentNew` · GA4 | `submitComment` |
| E5 | `POST /comments/:id/replies` · `POST /comments/:id/like` | `{ slug, content }` | — | — | `submitReply` · `likeComment` — V2 |
| E6 | `POST /articles/:slug/view` | **عامّة** + `X-Device-Id` إلزامي · Bearer اختياري · `{ referrer?, url? }` | `{ counted: boolean, analyticsId, ga4: {...}, clarity }` (نفس `view/route.ts:127-142`) | `ArticleView` · `Analytics` · `$inc` · Telegram `articleView` | جسم `view/route.ts:14-142` مع `sessionId = deviceId` بدل الكوكي |
| E7 | `PATCH /analytics/:id` | عامّة + `X-Device-Id` | `analyticsUpdateSchema` (`analytics/[id]/route.ts:11-17`) | `{ ok }` | يحدّث `Analytics` | نفس الجسم؛ فحص الملكية بـ`deviceId` بدل الكوكي (`:38-53`) |
| E8 | `POST /articles/:slug/share` | عامّة + `X-Device-Id` · `{ platform: SharePlatform }` | `{ ok }` | حدّ ١٠/ساعة/جهاز · `Share` · Telegram · GA4 | جسم `share/route.ts:24-127` |
| E9 | `POST /partners/:slug/follow` · `DELETE …` · `GET …` | — | `{ following, followersCount }` | Telegram `clientFollow` · GA4 `follow_client` | جسم `follow/route.ts:64-193` (يُستخرج `followClientAs(userId, slug)`) · «تابع مدونتي» = نفس النقطة بـslug الأساسي من `GET /home.coreClientSlug` |
| E10 | `POST/DELETE /partners/:slug/favorite` | — | `{ favorited, count }` | — | `favorite/route.ts` — V2 |
| E11 | `POST /partners/:slug/view` · `/share` | عامّة + `X-Device-Id` | `{ ok }` | `ClientView` · Telegram | أجسام `clients/[slug]/api/view|share` |
| E12 | `POST /partners/:slug/reviews` | `ReviewSchema` (`client-review-actions.ts:17`) | `{ status: "PENDING" }` | `revalidatePath` | `postClientReviewAction` — V2 |
| E13 | `POST /partners/:slug/questions` · `POST /articles/:id/questions` | `clientQuestionSchema` / `askClientSchema` | `{ ok }` | سقف ٥ معلّقة · Telegram · GA4 | `submitClientPageQuestion` · `submitAskClient` — V2 |
| E14 | `POST /partners/:id/booking` | **عامّة** (Bearer اختياري) · `bookingSchema` + `{ source, disclaimerAccepted, newsletterOptIn? }` | `{ success }` أو `VALIDATION_ERROR` بنصّ الرفض كما الويب | Push لجوّال الشريك · Notification للأدمن · بريد · Telegram · GA4 · Conversion | `submitBookingRequest(data, ctx)` — **موجودة** خلف `/api/booking`؛ تُعاد بالغلاف |
| E15 | `POST /partners/:id/whatsapp-lead` | عامّة | `{ name?, phone? }` | — | `recordWhatsappLead` (`booking-actions.ts:75`) | V2 |
| E16 | `POST /reels/:id/like` · `/favorite` (toggle) | — | `ToggleResult {likesCount, favoritesCount, active}` | `updateTag("reels")` · GA4 | `toggleReelLike`/`toggleReelFavorite` (`reel-interactions.ts:96-100`) |
| E17 | `POST /reels/:id/view` | عامّة + `X-Device-Id` | `ReelViewGa4Params` | `$inc viewsCount` (الويب بلا dedupe — نضيف dedupe بالجهاز كالمقال) | `trackReelView` (`track-reel-view.ts:31`) |
| E18 | `POST /reels/:id/comments` · `/comments/:id/replies` · `/comments/:id/like` · `POST /reels/:id/share` | — | — | Telegram · GA4 | `submitReelComment` · `submitReelCommentReply` · `toggleReelCommentLike` · `trackReelShareEvent` — V2 |
| E19 | `POST /newsletter` · `POST /partners/:id/subscribe` | عامّة | `{ email }` | `{ message }` | بريد · Telegram · Conversion | أجسام `api/news/subscribe` · `api/subscribers` — V2؛ حدّ IP ينقل من الذاكرة إلى القاعدة |
| E20 | `POST /contact` | Bearer اختياري | كما `contact/api/route.ts:12-25` | — | Telegram `supportMessage` · GA4 | `submitContactMessage` — V2 |

### ٤٫٥ الإشعارات والدفع

| # | Method · Path | Auth | Request | Response | يغلّف |
|---|---|---|---|---|---|
| N1 | `GET /me/notifications?cursor&tab=unread|read` | Bearer | — | `{ items: {id,type,title,body,readAt,createdAt,clientId,relatedId, target: {kind:'article'|'reel'|'contact', href}}[], nextCursor, unreadCount }` | استعلام `users/notifications/page.tsx:78-128` يُستخرج إلى `notifications/data/get-notifications.ts` (نفس التفرّع على `type`) · `getUnreadNotificationCount` |
| N2 | `POST /me/notifications/:id/read` · `POST /me/notifications/read-all` | Bearer | — | `{ ok, unreadCount }` | `markNotificationAsRead` (`notifications-actions.ts:7-15`) · read-all **جديد** (updateMany) |
| N3 | `POST /devices/register` · `DELETE /devices/:id` | Bearer | `{ expoPushToken: /^(Expo|Exponent)PushToken\[/, platform, deviceName?, appVersion?, deviceId }` | `{ device }` | **جديد**: جدول `ReaderDevice {userId, expoPushToken @unique, deviceId, platform, enabled, …}` — نسخة `MobileDevice` (`schema.prisma:5182-5204`) بـ`userId` بدل `clientId` · نمط `console/app/api/mobile/v1/devices/register/route.ts:8-21` |
| N4 | إرسال الدفع للقارئ | — | — | — | **جديد** `shared/lib/push/notify-reader.ts`: يُنادى من **نفس** الأماكن التي تكتب `Notification` للقارئ (الكونسول عند اعتماد تعليق/ردّ سؤال، الأدمن عند ردّ رسالة تواصل). الحمولة: `{ to, title, body, channelId:"default", data:{ type:<lowercase>, notificationId, articleSlug?/reelSlug? } }` — **مفتاح واحد `type`** (لا `event` و`type` معاً — علاج خلل data.event/data.type) · `DeviceNotRegistered` يعطّل الصفّ (`lib/mobile-push.ts:50-58` نمط موجود) · **لا صدى**: لا دفع لمن تسبّب بالحدث |

### ٤٫٦ التحليلات

| # | Method · Path | Auth | Request | يغلّف / الحكم |
|---|---|---|---|---|
| T1 | `POST /track/pageview` | عامّة + `X-Device-Id` | `{ path }` | جسم `api/track/pageview/route.ts:24-76` بـ`sessionId=deviceId`؛ يحذف فحص `BOT_UA` لأن UA التطبيق ثابت (يُستبدل بفحص رأس `X-App-Version`) |
| T2 | `POST /track/cta-click` · `/track/link-click` | عامّة + `X-Device-Id` | `ctaClickSchema` (`cta-click/route.ts:17-26`) | نفس الأجسام — V2 |
| T3 | أحداث GA4 التي يرسلها المتصفّح اليوم (`article_view`, `client_view`, `reel_view`, `outbound_click`, `signup_view`, `signup_start`, `login_start`, `web_vitals` — `ga4-browser.ts:27-36`) | — | — | **لا تُرسل من خادم مدونتي** (قياس ١ أكتوبر: ٩١٪ جلسات Unassigned · `ga4-browser.ts:4-8`). تُرسل من التطبيق بـFirebase Analytics SDK (stream منفصل في نفس خاصية GA4) بنفس الأسماء والمعاملات التي ترجعها E6/E11/E17 (`ga4` object). الأحداث الخادميّة (`signup_complete`, likes, `booking_submit` …) تبقى على `events-registry.ts` كما هي. قرار لخالد §٧ |
| T4 | Clarity | — | — | لا يوجد SDK أصلي رسمي لـClarity على RN — **لا** (مؤشّر) |
| T5 | Web Vitals | — | — | لا ينطبق على التطبيق |

---

## ٥ · المصادقة — التصميم الموصى به لتطبيق القارئ

### ٥٫١ ما يعمل على الويب اليوم

| البند | الواقع | الدليل |
|---|---|---|
| المكتبة | `next-auth@5.0.0-beta.25` · `@auth/prisma-adapter@2.7` · `session.strategy="jwt"` في كوكي | `package.json:50,24` · `lib/auth.ts:20-21` |
| المزوّدون | Credentials (bcrypt) + Google (`allowDangerousEmailAccountLinking`) | `auth.config.ts:11-61` |
| كوكي PKCE/state مضبوطة لسفاري ومتصفّحات داخل التطبيقات | `lib/auth.ts:23-32` |
| القارئ منفصل تماماً عن الموظّفين (`User` ≠ `Staff`) ولا `role` في الجلسة | `auth.config.ts:141-148` · `schema.prisma:203-277` |
| جدول `Account` يحمل `provider/providerAccountId` — يكفي لربط Google/Apple بالتطبيق | `schema.prisma:423-449` |

### ٥٫٢ القرار

| الطبقة | القرار | لماذا | المصدر |
|---|---|---|---|
| توكن الوصول | `next-auth/jwt encode/decode` (A256CBC-HS512 · HKDF من `AUTH_SECRET` · salt `modonty-reader-mobile-v1`) · عمر **١٥ دقيقة** | نفس الأداة التي يملكها المشروع والكونسول؛ decode يتحقّق من exp وkid | Auth.js: «encode … A256CBC-HS512 … derives a 64-byte key using HKDF-SHA256 … decode … validates expiration» (`/websites/deepwiki_nextauthjs_next-auth` · 2.4 JWT and tokens) · `console/lib/mobile-api/auth.ts:40,53` |
| توكن التجديد | سلسلة عشوائية ٣٢ بايت تُخزَّن **هاشاً** في `ReaderSession` · عمر ٣٠ يوماً · تدوير عند كل تجديد (القديم يُلغى؛ إعادة استعماله = إلغاء الجلسة كلّها) | يعالج خلل الكونسول رقم ٤ (توكن ٣٠ يوماً لا يُلغى) ويقصّر نافذة السرقة إلى ١٥ دقيقة | `console-mobile/documentation/html/AUDIT-2026-10-02.html` البند ٤ |
| الإلغاء من الخادم | جدول جديد `ReaderSession { userId, refreshHash @unique, deviceId, expiresAt, revokedAt, revokedReason, lastSeenAt, userAgent }` · كل نقطة Bearer تفحص صفّ الجلسة حيّاً (نفس `mobileSessionFromRequest`) · تغيير كلمة المرور يلغي الكلّ عدا الحالية | نسخة مُجرَّبة من الكونسول | `console/lib/mobile-api/auth.ts:61-67,90-96` · `schema.prisma:5210-5224` |
| حدّ المحاولات | في القاعدة: ٥ فشل/١٥ دقيقة لمفتاح `(email|ip)` → 429 + `Retry-After` · يُعاد استعمال جدول `MobileLoginAttempt` نفسه (المفتاح يميّز) | الذاكرة لا تعمل على Vercel (نسخ متعدّدة) | `console/lib/mobile-api/login-throttle.ts:3-11` |
| Google على الجوّال | التطبيق: `@react-native-google-signin/google-signin` أو `react-native-nitro-google-signin` (Expo يذكرهما؛ development build لازم؛ Android Credential Manager) → `idToken` · الخادم: `google-auth-library` `OAuth2Client.verifyIdToken({ idToken, audience: [...] })` ثم `payload.email_verified` و`sub` | Auth.js لا يملك تدفّق idToken للتطبيقات الأصلية؛ تدفّق redirect/PKCE يعتمد كوكي (`lib/auth.ts:23-32`) | Expo: «You can integrate Google authentication … `react-native-nitro-google-signin` … `@react-native-google-signin/google-signin` … require custom native code … development build» (`/websites/expo_dev` guides/google-authentication) · google-auth-library: `verifyIdToken(options: {idToken, audience?, maxExpiry?}) → LoginTicket.getPayload()` (`/googleapis/google-auth-library-nodejs`) |
| Apple | **إلزامي على iOS** لو عرضنا Google: `expo-apple-authentication.signInAsync({ requestedScopes, nonce, state })` → `identityToken` يُتحقّق بـJWKS أبل · الاسم يصل **أوّل مرّة فقط** فيُخزَّن فوراً | متطلّب App Store | Expo: «Any app that includes third-party authentication options **must** provide Apple authentication … App Store Review guidelines» · «requested scopes will only be provided … the first time» (`/websites/expo_dev` sdk/apple-authentication) |
| التخزين على الجهاز | `expo-secure-store` للتوكنين · **لا** `AsyncStorage` · القيم صغيرة (iOS رفض تاريخياً >٢٠٤٨ بايت — توكن Auth.js المشفّر مع claims قليلة يبقى تحتها؛ يُقاس) | — | Expo: «secure things like access tokens locally using expo-secure-store (this is different from AsyncStorage, which is not secure)» · «some iOS releases refused values above roughly 2048 bytes» (`/websites/expo_dev` sdk/securestore) |
| الربط بحساب الويب | نفس `User` ونفس `Account`؛ لا جدول مستخدمين ثانٍ. Google بنفس البريد لحساب كلمة مرور يُربط (نفس سياسة الويب) | هويّة واحدة = نفس الإعجابات والمتابعات على الويب والتطبيق | `auth.config.ts:15-18` |

### ٥٫٣ ما لا يُنقل من الكونسول (أخطاء مثبتة)

| الخلل في الكونسول | الدليل | ما نفعله هنا |
|---|---|---|
| توكن واحد ٣٠ يوماً بلا تجديد منفصل | `console/lib/mobile-api/auth.ts:18` | توكنان (١٥ دقيقة / ٣٠ يوماً مع تدوير) |
| `logout` ما زال بلا إلغاء رغم وجود `endMobileSession` | `console/app/api/mobile/v1/auth/logout/route.ts:3-4` | A6 يلغي الجلسة والجهاز |
| `refresh` يستورد `issueMobileToken` غير المُصدَّر (لن يُترجم) | `console/app/api/mobile/v1/auth/refresh/route.ts:2` مقابل `auth.ts:38` (بلا `export`) | **خارج النطاق** — يُذكر سطراً لخالد |
| `data.event` و`data.type` معاً في الدفع | `console/lib/mobile-api/push.ts:36-41` | مفتاح واحد `type` |
| دفع «صدى» لفاعل الحدث | التدقيق البند ٢ | N4: لا دفع لـ`actorUserId === recipient` |

---

## ٦ · الأولويات

| المرحلة | النقاط | يعتمد على |
|---|---|---|
| **V1 — تطبيق قراءة يُشحن** (٣٧ سطراً) | C1 C2 C3 C4 C5 C6 C7 C8 C10 C11 C12 C14 C15 C16 · S1 · A1 A2 A3 A4 A5 A6 A7 A8 A13(favorites/following) · E1 E3 E4 E6 E8 E9 E11(view) E14 E16 E17 · N1 N2 · T1 | ١) `modonty/lib/mobile-api/{http,request,params,auth,login-throttle}.ts` ٢) `ReaderSession` + `ReaderDevice` في السكيما ٣) استخراج `…As(userId)` من ٦ أكشنات (like/favorite/comment/follow/reelLike/reelFavorite) ٤) استخراج استعلامات `categories/[slug]/page.tsx` إلى `data/` ٥) `google-auth-library` في `modonty/package.json` |
| **V2** (٢٢) | C9 C13 C17 C18 C19 C20 · A9 A10 A11 A12 A13(بقيّة) · E2 E5 E10 E12 E13 E15 E18 E19 E20 · N3 N4 · T2 | قرار الدفع (§٧ س٣) · الكونسول/الأدمن يناديان `notify-reader` |
| **V3** (٦) | مودو (`/chat` بحصّة جهاز) · قطاعات مدونتي · `/users/:id` · `enableTopicAlert` · A14 حذف الحساب · S2 | تصميم حصّة Cohere بالجهاز بدل الكوكي (`check-anonymous-quota.ts:22-29`) |

---

## ٧ · قرارات تحتاج خالد (نعم/لا)

| # | السؤال | توصيتي |
|---|---|---|
| ١ | ~~هل نعرض دخول Google في التطبيق (وبالتالي **نُلزَم** بـApple على iOS)؟ أم V1 بالبريد فقط؟~~ | **محسوم — خالد ٤ أكتوبر ٢٠٢٦:** V1 (أندرويد) = البريد وكلمة المرور فقط (`auth.config.ts:20`). Google (A3) وApple (A4) على الجوّال يُقرَّران معاً عند الوصول لنسخة App Store. |
| ٢ | هل تُقبل **كتابة نقاط كتابة جديدة** (Route Handlers) تغلّف الأكشنات بعد استخراج `…As(userId)` — أي تعديل تركيبي في ٦ ملفّات أكشن على الويب؟ | **نعم**؛ البديل (تكرار المنطق في النقطة) مرفوض بقاعدة «مصدر واحد». التعديل لا يغيّر سلوك الويب (الأكشن يبقى غلافاً). |
| ٣ | ~~الدفع للقارئ: هل يُبنى `ReaderDevice` + `notify-reader` في V2؟~~ | **محسوم — خالد ٤ أكتوبر ٢٠٢٦: V2، بعد اكتمال V1 كاملة.** السبب: ما يكتب الإشعار للقارئ اليوم هو الكونسول/الأدمن (`users/notifications/page.tsx:87-88`)، فالدفع يحتاج تعديلاً هناك؛ V1 يكتفي بجرس داخل التطبيق (N1/N2). |
| ٤ | GA4 في التطبيق: Firebase Analytics SDK (stream تطبيق في نفس الخاصية) لأحداث العرض؟ أم لا تحليلات عرض في V1؟ | **Firebase SDK**، لأن إرسال `article_view` من الخادم أثبت جلسات Unassigned (`ga4-browser.ts:4-8`). يحتاج مشروع Firebase وربطه بخاصية GA4 — خارج الكود. |
| ٥ | هل نقبل في V1 ترقيم **offset** للأرشيف والرئيسية (كما الويب، سقف ٣٠٠ · ترتيب تحريري) وcursor للريلز والتعليقات والإشعارات فقط؟ | **نعم**؛ تحويل الأرشيف إلى cursor يغيّر ترتيب `HOMEPAGE_ARTICLE_ORDER` ويكسر تطابق الصفحة الأولى بين الويب والتطبيق (`get-more-articles.ts:36-37`). |
| ٦ | حذف الحساب من التطبيق (A14 — غير موجود على الويب؛ متطلّب Apple عند السماح بإنشاء حساب): يُبنى في V1 أم يكفي رابط ويب؟ | **رابط ويب لا يكفي** لمتجر أبل لو وُجد إنشاء حساب داخل التطبيق؛ أقترح A14 في V2 قبل نشر iOS، وV1 أندرويد أوّلاً (جهاز الاختبار أندرويد — `ENGINEERING-RULES.md §٧`). |
| ٧ | خلل الكونسول: `refresh/route.ts:2` يستورد دالّة غير مُصدَّرة — أُصلحه؟ (خارج نطاق هذه المهمّة) | سؤال فقط؛ لا أعمل فيه بلا أمر. |

---

## ٨ · ما لم يُتحقَّق منه («مؤشّر»)

| البند | لماذا غير مقيس |
|---|---|
| حجم توكن Auth.js المشفّر (هل يبقى < ٢٠٤٨ بايت لـSecureStore iOS) | يحتاج تشغيل `encode` فعلياً؛ لم يُشغَّل كود |
| نسبة تسجيلات Google مقابل البريد على الويب | يحتاج قراءة `Account.provider` من القاعدة — لم تُفتح القاعدة |
| هل `getArticlePageData` ترجع `content` مُنقّى (`sanitize-html.ts`) بصيغة تصلح لمحرّك عرض RN (HTML → native)؟ | قُرئت التواقيع لا جسم الدالة بالكامل (`get-article-page-data.ts:63-172`) |
| سلوك `"use cache"` عند استدعاء الدالة من Route Handler مع رأس `Authorization` (هل يُلوّث مفتاح الكاش؟) | يحتاج اختباراً على `next@16.3.4` مع `cacheComponents: true` (`next.config.ts:123`) — قاعدة التصميم أعلاه تفصل العامّ عن الشخصي احتياطاً |
| وجود `GOOGLE_CLIENT_ID` لمنصّتي iOS/Android | لم تُفتح ملفّات البيئة (الهوك يمنع)؛ الموجود اسماً فقط: `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` للويب (`auth.config.ts:13-14`) |
| رقم «٩٥ `use cache`» يشمل تعليقات تحوي النصّ؟ | grep نصّي؛ قد يزيد ١–٣ عن الفعلي |
| Clarity على RN | لا SDK رسمي معروف لي؛ لم أتحقّق من مصدر رسمي |
| إن كان الأدمن/الكونسول يكتبان `Notification.type` بقيم غير التي يقرأها `notifications/page.tsx:97-119` | خارج النطاق (`admin/` · `console/`) |

---

**سطر واحد خارج النطاق:** في الكونسول `app/api/mobile/v1/auth/refresh/route.ts:2` يستورد `issueMobileToken` وهو غير مُصدَّر في `console/lib/mobile-api/auth.ts:38`، و`auth/logout/route.ts` ما زال بلا إلغاء رغم وجود `endMobileSession` — يُفحص بـ`tsc` عند أوّل فرصة.
