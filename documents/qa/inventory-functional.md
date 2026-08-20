# جرد سطح الاختبار — `modonty/` فقط

مقيس من الكود بتاريخ ٢٠ أغسطس ٢٠٢٦ على فرع `modonty-ui`.
النطاق: مجلّد `modonty/` وحده (قاعدة `.claude/rules/modonty-scope.md`).
`shared/prisma/schema/schema.prisma` مذكور كمصدر للسكيما لا كنطاق فحص.

الأرقام الخام:
- `page.tsx` = **66**
- `route.ts` = **36**
- ملفات فيها `"use server"` = **28** (منها ٣ ملفات `data/` و`helpers/` ليست أكشنات كتابة)
- دوال مصدَّرة قابلة للاستدعاء من المتصفّح كـ Server Action = **41**

---

## ١ · مسارات `route.ts` — العنوان والميثودات

### أ) مسارات التفاعل على صفحة الشريك — `app/(partner)/clients/[slug]/api/`

| الملف | العنوان | الميثودات | الحراسة |
|---|---|---|---|
| `favorite/route.ts` | `/clients/[slug]/api/favorite` | GET · POST · DELETE | `auth()` على POST/DELETE؛ GET يرجع `false/0` للزائر |
| `follow/route.ts` | `/clients/[slug]/api/follow` | GET · POST · DELETE | `auth()` على الثلاثة (GET يرجع 401) |
| `share/route.ts` | `/clients/[slug]/api/share` | POST | مفتوح |
| `view/route.ts` | `/clients/[slug]/api/view` | POST | مفتوح |

### ب) مسارات المقال — `app/(site)/articles/`

| الملف | العنوان | الميثودات | الحراسة |
|---|---|---|---|
| `[slug]/api/view/route.ts` | `/articles/[slug]/api/view` | POST | مفتوح — يكتب `ArticleView` + `Analytics` + `viewsCount++` |
| `[slug]/api/share/route.ts` | `/articles/[slug]/api/share` | POST | مفتوح — حدّ ١٠/ساعة **فقط لو الكوكي موجود** |
| `[slug]/api/analytics/[id]/route.ts` | `/articles/[slug]/api/analytics/[id]` | PATCH | كوكي `modonty_view_sid` — والحارس يُتخطّى لو الكوكي غائب |
| `api/list/route.ts` | `/articles/api/list` | GET | مفتوح |
| `api/track/article-link-click/route.ts` | `/articles/api/track/article-link-click` | POST | مفتوح |

### ج) الصفحة الرئيسة والبحث

| الملف | العنوان | الميثودات |
|---|---|---|
| `app/(site)/(homepage)/api/articles/route.ts` | `/api/articles` (تحت مجموعة المسار) | GET |

### د) مودو شات — `app/(site)/modo-chat/api/`

| الملف | العنوان | الميثودات | ملاحظة |
|---|---|---|---|
| `chat/route.ts` | `/modo-chat/api/chat` | POST | `guardChatRequest` + `maxDuration = 60` · يستهلك رصيد نموذج خارجي |
| `article/[slug]/route.ts` | `/modo-chat/api/article/[slug]` | POST | |
| `calibrate/route.ts` | `/modo-chat/api/calibrate` | POST | |
| `conversation/route.ts` | `/modo-chat/api/conversation` | GET | |
| `history/route.ts` | `/modo-chat/api/history` | GET | |
| `industries/route.ts` | `/modo-chat/api/industries` | GET | |
| `memory/route.ts` | `/modo-chat/api/memory` | GET | |
| `suggest-industry/route.ts` | `/modo-chat/api/suggest-industry` | POST | |

### هـ) المستخدم — `app/(site)/users/`

| الملف | العنوان | الميثودات | الحراسة |
|---|---|---|---|
| `profile/api/avatar/route.ts` | `/users/profile/api/avatar` | POST (`runtime` مصدَّر) | رفع ملف |
| `profile/settings/api/[id]/route.ts` | `/users/profile/settings/api/[id]` | GET · PUT | `session.user.id !== id` → 401 |
| `profile/settings/api/[id]/accounts/route.ts` | `/users/profile/settings/api/[id]/accounts` | GET | نفس الحارس |
| `login/api/track/route.ts` | `/users/login/api/track` | POST | مفتوح |
| `register/api/track/route.ts` | `/users/register/api/track` | POST | مفتوح |

### و) مسارات النظام — `app/api/`

| الملف | العنوان | الميثودات | الحراسة |
|---|---|---|---|
| `auth/[...nextauth]/route.ts` | `/api/auth/*` | يصدّر `handlers` | NextAuth v5 — عقد خارجي، لا يُنقل |
| `news/subscribe/route.ts` | `/api/news/subscribe` | POST | مفتوح · تحقّق البريد = `includes("@")` فقط |
| `subscribers/route.ts` | `/api/subscribers` | POST | مفتوح |
| `revalidate/route.ts` | `/api/revalidate?path=&secret=` | POST | `REVALIDATE_SECRET` |
| `revalidate/tag/route.ts` | `/api/revalidate/tag` | POST | سرّ |
| `revalidate/article/route.ts` | `/api/revalidate/article` | POST | سرّ **أو أي جلسة مستخدم عادي** |
| `track/cta-click/route.ts` | `/api/track/cta-click` | POST | مفتوح |
| `track/pageview/route.ts` | `/api/track/pageview` | POST | مفتوح · فلترة `BOT_UA` |
| `track/web-vitals/route.ts` | `/api/track/web-vitals` | POST | مفتوح |
| `contact/api/route.ts` (تحت `(site)/contact`) | `/contact/api` | POST | مفتوح |

### ز) ملفات محتوى ثابتة

| الملف | العنوان | الميثود |
|---|---|---|
| `app/feed.xml/route.ts` | `/feed.xml` | GET |
| `app/image-sitemap.xml/route.ts` | `/image-sitemap.xml` | GET |
| `app/llms.txt/route.ts` | `/llms.txt` | GET |

---

## ٢ · ملفات `"use server"` والدوال المصدَّرة منها

### أكشنات كتابة تلمس القاعدة

| الملف | الدوال | جلسة مطلوبة؟ |
|---|---|---|
| `app/(site)/articles/[slug]/actions/like-article.ts` | `likeArticle` | نعم |
| `app/(site)/articles/[slug]/actions/dislike-article.ts` | `dislikeArticle` | نعم |
| `app/(site)/articles/[slug]/actions/favorite-article.ts` | `favoriteArticle` | نعم |
| `app/(site)/articles/[slug]/actions/like-comment.ts` | `likeComment` | نعم |
| `app/(site)/articles/[slug]/actions/submit-comment.ts` | `submitComment` | نعم |
| `app/(site)/articles/[slug]/actions/submit-reply.ts` | `submitReply` | نعم |
| `app/(partner)/clients/[slug]/actions/client-faq-actions.ts` | `submitClientPageQuestion` | نعم |
| `app/(partner)/clients/[slug]/actions/client-review-actions.ts` | `postClientReviewAction` | نعم |
| `app/(site)/reels/actions/reel-interactions.ts` | `toggleReelLike` · `toggleReelFavorite` | نعم |
| `app/(site)/users/register/actions/register-actions.ts` | `registerUser` | لا (تسجيل) |
| `app/(site)/users/forgot-password/actions/forgot-password-action.ts` | `forgotPasswordAction` | لا |
| `app/(site)/users/reset-password/actions/reset-password-action.ts` | `resetPasswordAction` | لا (توكن) |
| `app/(site)/users/notifications/actions/notifications-actions.ts` | `markNotificationAsRead` | نعم |
| `app/(site)/users/profile/settings/actions/settings-actions.ts` | `updateProfile` · `createPassword` · `changePassword` · `updatePrivacySettings` · `updateNotificationSettings` · `updatePreferences` · `disconnectOAuthProvider` · `exportUserData` · `deleteAccount` | نعم (٩ دوال) |
| `app/(site)/contact/actions/contact-actions.ts` | `submitContactMessage` | لا |
| `app/(site)/help/faq/actions/faq-feedback-actions.ts` | `submitFAQFeedback` · `checkExistingFeedback` | لا |
| `app/(site)/modo-chat/data/ask-partner-from-chat.ts` | `askPartnerFromChat` | — |
| `app/(site)/modo-chat/data/rate-answer.ts` | `rateAnswer` | — |
| `components/shared/booking-form/booking-actions.ts` | `trackBookingBlocked` · `recordWhatsappLead` · `trackBookingFormStartAction` · `submitBookingRequest` | لا |
| `components/client/submit-ask-client.ts` | `submitAskClient` | — |

### أكشنات قراءة فقط (مصنَّفة `"use server"` لكنها لا تكتب)

| الملف | الدوال |
|---|---|
| `app/(site)/articles/[slug]/data/fetch-article-comments.ts` | `fetchArticleComments` |
| `app/(site)/articles/[slug]/data/get-pending-faqs-for-current-user.ts` | `getPendingFaqsForCurrentUser` |
| `app/(site)/categories/actions.ts` | `loadMoreCategories` |
| `app/(site)/industries/actions.ts` | `loadMoreIndustries` |
| `app/(site)/tags/actions.ts` | `loadMoreTags` |
| `app/(site)/reels/actions/load-more.ts` | `loadMoreReels` |
| `app/(site)/help/faq/actions/faq-actions.ts` | `getActiveFAQs` |
| `app/(site)/help/faq/helpers/session-helper.ts` | `getOrCreateSessionId` · `getClientIp` · `getUserAgent` |

---

## ٣ · صفحات تكتب أو تشترط جلسة

### تشترط جلسة صريحة (تُعيد التوجيه أو تخفي المحتوى)

- `app/(site)/users/profile/page.tsx`
- `app/(site)/users/profile/settings/page.tsx`
- `app/(site)/users/profile/favorites/page.tsx`
- `app/(site)/users/profile/liked/page.tsx`
- `app/(site)/users/profile/disliked/page.tsx`
- `app/(site)/users/profile/comments/page.tsx`
- `app/(site)/users/profile/following/page.tsx`
- `app/(site)/users/profile/bookings/page.tsx`
- `app/(site)/users/notifications/page.tsx`

### صفحات دخول/خروج/استرجاع

- `app/(site)/users/login/page.tsx` — مزوّد `Credentials` + Google · `pages.signIn = "/users/login"`
- `app/(site)/users/register/page.tsx`
- `app/(site)/users/forgot-password/page.tsx`
- `app/(site)/users/reset-password/page.tsx` — `?token=`
- `app/(site)/users/verify-email/page.tsx` — `?token=`

### صفحات تستضيف عناصر كتابة (الأكشن يُستدعى من مكوّن عميل داخلها)

| الصفحة | ما تكتبه |
|---|---|
| `app/(site)/articles/[slug]/page.tsx` | إعجاب · عدم إعجاب · مفضّلة · تعليق · ردّ · إعجاب تعليق · مشاهدة · مشاركة · طلب حجز |
| `app/(partner)/clients/[slug]/page.tsx` وفروعها `(inner)/*` | متابعة · مفضّلة · مراجعة · سؤال · مشاهدة · مشاركة · حجز |
| `app/(site)/reels/page.tsx` | إعجاب ريل · مفضّلة ريل |
| `app/(site)/contact/page.tsx` | رسالة تواصل |
| `app/(site)/help/faq/page.tsx` | تقييم إجابة |
| `app/(site)/news/subscribe/page.tsx` · `subscribe/page.tsx` | اشتراك نشرة |
| `app/(site)/modo-chat/page.tsx` | رسائل المحادثة + تقييم الإجابة |
| `app/(site)/booking/page.tsx` | طلب حجز |

---

## ٤ · طبقة الكاش — ما هو مكشوف لخطر تسرّب حالة شخصية

`"use cache"` مستعمَل في **٤٠+** ملفاً. أهمّ الوسوم:

| الوسم | يغطّي |
|---|---|
| `articles` | `get-article-content-by-slug.ts` · `get-articles-archive.ts` · `home-feed-shapes.ts` · `get-industry-feed.ts` · `get-modonty-articles.ts` · `client-page-data.ts` |
| `clients` | كل `app/(partner)/clients/[slug]/helpers/*` |
| `homepage` · `settings` | `CachedHomePage.tsx` |
| `categories` · `authors` · `legal` · `pages` · `faqs` · `reels` | صفحاتها |

الحدّ الفاصل الذي يجب أن يصمد في الاختبار:
- **مكشوف للكاش:** محتوى المقال (`getArticleContentBySlug`).
- **يجب أن يبقى خارج الكاش:** `getArticleLiveCounts` و`getMyArticleReactions` في
  `app/(site)/articles/[slug]/data/get-article-by-slug-minimal.ts` — هذا الملف هو
  الفاصل الوحيد بين «صفحة مشتركة» و«حالة شخصية».

---

## ٥ · فهارس السكيما ذات الصلة (من `shared/prisma/schema/schema.prisma`)

| الموديل | القيود الفريدة | الفهارس |
|---|---|---|
| `ArticleLike` (١٨١٩) | `[articleId,userId]` · `[articleId,sessionId]` | `articleId` · `userId` |
| `ArticleDislike` (١٨٤٢) | `[articleId,userId]` · `[articleId,sessionId]` | `articleId` · `userId` |
| `ArticleFavorite` (١٨٦٣) | `[articleId,userId]` | `articleId` · `userId` |
| `CommentLike` (١٨٨١) | `[commentId,userId]` · `[commentId,sessionId]` | `commentId` · `userId` |
| `Comment` (١٧٨١) | — | `[articleId,createdAt]` · `authorId` · `parentId` · `status` |
| `ArticleView` (١٩٢٣) | — | `[articleId,createdAt]` · `userId` · `sessionId` |
| `Analytics` (١٦٢٠) | — | `[articleId,timestamp]` · `[clientId,timestamp]` · `timestamp` |
| `Share` (٢١٨٦) | — | `[articleId,createdAt]` · `[clientId,createdAt]` · `[platform,createdAt]` · `userId` |
| `ClientLike` (٢٠٨٠) | `[clientId,userId]` | `[clientId,sessionId]` · `clientId` · `userId` |
| `ClientFavorite` (٢١٢٢) | `[clientId,userId]` | `clientId` · `userId` |
| `Account` (٢٧٥) | `[provider,providerAccountId]` | `userId` |
| `Notification` (٢٨٦٢) | — | `userId` · `staffId` · `clientId` · `readAt` |

فجوة مقيسة: `ArticleView` مفهرس على `sessionId` وحده، بينما
`app/(site)/articles/[slug]/api/view/route.ts` يستعلم
`findFirst({ where:{sessionId}, orderBy:{createdAt:"desc"} })` — يحتاج فهرساً مركّباً
`[sessionId, createdAt]` وإلّا يفرز في الذاكرة على كل مشاهدة.

---

## ٦ · العدّادات المزدوجة — مصدرا حقيقة لنفس الرقم

هذه هي جذور معظم حالات فقد البيانات في الخطة:

| العدّاد المخزَّن على `Article` | جدول الصفوف المقابل | مَن يزامنهما |
|---|---|---|
| `likesCount` | `ArticleLike` | `like-article.ts` يدوياً (`increment`/`decrement`) |
| `dislikesCount` | `ArticleDislike` | `dislike-article.ts` |
| `favoritesCount` | `ArticleFavorite` | `favorite-article.ts` |
| `viewsCount` | `ArticleView` | `api/view/route.ts` |
| `commentsCount` | `Comment` | لا شيء في `modonty/` — يُكتب من خارج النطاق |
| `Media.likesCount` / `favoritesCount` | `MediaReaction` | `reel-interactions.ts` |

بالمقابل، هذه المسارات تحسب بـ`count()` حيّاً ولا تخزّن عدّاداً:
`like-comment.ts` · `clients/[slug]/api/follow/route.ts` · `clients/[slug]/api/favorite/route.ts`.
اختلاف الأسلوبين نفسه بند اختبار.
