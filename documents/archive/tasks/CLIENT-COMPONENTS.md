# Client Components — modonty
> آخر تحديث: 2026-04-19 (Session 47)

كل component هنا فيه `use client`. الهدف: نعرف أيها يمكن تحسينه.

---

## ✅ تم تحسينها (Session 47)

**ScrollProgress** — كان يُحمَّل مرتين. الآن يُحمَّل مرة واحدة كسول بعد scroll.

**MobileMenu** — كان في الـ bundle من أول تحميل. الآن يُنزَّل فقط عند أول ضغطة على القائمة.

**FollowCard social icons** — كانت 7 أيقونات SVG في الـ client bundle. الآن في Server Component — صفر JS للأيقونات.

**FollowCardClient.tsx** — ملف قديم لا يستخدمه أحد. حُذف.

---

## 🟡 ممكن تحسينه مستقبلاً

**ModontyCard** (`components/layout/RightSidebar/ModontyCard.tsx`)
يعرض قائمة مقالات مع زر "المزيد" للتوسيع. استخدم `useState` للزر فقط.
الفرصة: القائمة تصير Server Component، وزر التوسيع فقط Client صغير.
الأولوية: منخفضة — في الـ sidebar وليس على الـ hot path.

---

## ❌ لازمة Client — لا يمكن تغييرها

**Navbar:**
- `UserMenu` — يتحقق من جلسة المستخدم (useSession)
- `DesktopUserAreaClient` — يلف UserMenu + Chat + زر CTA بـ onClick
- `ChatTriggerButton` — onClick
- `MobileMenu` / `MobileFooter` — يحتاجان usePathname لمعرفة الصفحة الحالية

**Sidebar:**
- `DiscoveryCard` — Radix Tabs. تحويله لـ URL سيكسر الـ cache على الهوم بيج.
- `FollowCardInteractive` — newsletter form + expand/collapse
- `FeedDeferredUI` — يحمّل BackToTop + ScrollProgress بعد scroll (orchestrator)
- `InfiniteArticleList` — IntersectionObserver للتحميل عند الـ scroll

**صفحة المقال:**
- `client-lazy.tsx` — حاوية كل الـ dynamic(ssr:false) imports. النمط صحيح.
- `ArticleTableOfContents` — يقرأ الـ headings من DOM ويتتبع موقع القراءة
- `ArticleMobileLayout` / `ArticleMobileEngagementBar` — like، save، share
- `ShareButtons` — Web Share API لا تعمل إلا في المتصفح
- `CommentForm` / `NewsletterCTA` — forms

**صفحة العميل:**
- `ClientTabsNav` — يعرف الـ tab الحالي بـ useSelectedLayoutSegment + sticky scroll بـ IntersectionObserver

**الباقي:**
- Auth components — useSession
- 7× `error.tsx` — Next.js يشترطها Client لـ error boundaries
- كل الـ forms — useState + handleSubmit
