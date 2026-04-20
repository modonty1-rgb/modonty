# CP-15–25 — Client Page UX/UI Overhaul Plan
> **Created:** 2026-04-20 (Session 51)
> **Target:** modonty v1.37.0
> **Pages affected:** `modonty/app/clients/[slug]/`
> **Priority:** 🔴 HIGH — صفحة العميل هي الـ landing page الأساسية لكل عميل

---

## الهدف

تحويل صفحة العميل من صفحة عرض بيانات → **landing page تحويلية** تشجع الزائر على:
1. التواصل مع العميل مباشرة (اسأل العميل)
2. متابعة العميل
3. الاشتراك في النشرة
4. قراءة المقالات

---

## الوضع الحالي — ملخص المشاكل

| # | المشكلة | الأثر | الأولوية |
|---|---------|-------|----------|
| 1 | لا يوجد Primary CTA "اسأل العميل" في Hero | فقدان conversion رئيسي | 🔴 |
| 2 | Stats مكررة (Hero + Left Sidebar) | redundancy + ضوضاء بصرية | 🔴 |
| 3 | Right sidebar كله empty state cards | انطباع سلبي عن العميل | 🔴 |
| 4 | Hero cover fallback = dark/empty | أول انطباع سلبي | 🟡 |
| 5 | Social links صغيرة جداً في Hero | trust signals مخفية | 🟡 |
| 6 | لا يوجد Featured Article | كل المقالات بنفس الوزن | 🟡 |
| 7 | لا يوجد Newsletter CTA في الصفحة | فقدان lead capture | 🟡 |
| 8 | Left sidebar: نبذة بعد إحصائيات | أولوية محتوى خاطئة | 🟢 |
| 9 | Tab nav: لا indicator للـ hidden tabs | UX issue على mobile | 🟢 |
| 10 | لا يوجد sticky contact button على mobile | فقدان mobile CTA | 🟡 |

---

## Phase 1 — Hero CTA + Primary Actions
> **الهدف:** إضافة "اسأل العميل" كـ primary CTA في الـ hero
> **Files:** `hero-cta.tsx` · `ask-client-dialog.tsx` (import من article)
> **Verify:** زر "اسأل العميل" يظهر في Hero، dialog يفتح بشكل صحيح

### التفاصيل:
- في `HeroCta` → أضف `AskClientDialog` بجانب `ClientFollowButton`
- `triggerLabel="اسأل العميل"` + `triggerOnly`
- Button style: `variant="default"` (primary, filled) — أبرز من Follow
- ترتيب الأزرار: **اسأل العميل** (primary) | متابعة (outline) | مشاركة (ghost)
- يظهر فقط لو `client.id` موجود (دايماً true على صفحة العميل)

```
[ اسأل العميل ]  [ + متابعة ]  [ ↗ ]  [ 🔗 الموقع ]
```

---

## Phase 2 — Left Sidebar Cleanup
> **الهدف:** إزالة redundancy + إعادة ترتيب الأولويات
> **Files:** `client-page-left.tsx`
> **Verify:** Left sidebar يبدأ بـ "نبذة" مباشرة، لا stats card

### التفاصيل:
- **احذف** Stats Card بالكامل من `ClientPageLeft` (مكررة مع Hero)
- **أعد الترتيب:**
  1. نبذة عن العميل (description/seoDescription) — أولاً
  2. Newsletter subscription card — ثانياً (جديد — Phase 3)
  3. معلومات الشركة (legalName, industry, foundingDate, employees)
  4. تواصل معنا (ClientContact)
  5. ClientAbout (إن وُجد)

---

## Phase 3 — Right Sidebar: Conditional Empty States
> **الهدف:** إخفاء cards الفارغة — لا تعرض empty state إلا لو في data
> **Files:** `client-page-right.tsx` · `client-followers-preview.tsx` · `client-reviews-preview.tsx` · `client-likes-preview.tsx`
> **Verify:** لما followers=0 و reviews=0، الـ right sidebar يعرض فقط Related Clients

### التفاصيل:
- `ClientFollowersPreview`: أضف prop `hideIfEmpty?: boolean` — لو true + followers.length===0 → return null
- `ClientReviewsPreview`: نفس النهج
- `ClientLikesPreview`: نفس النهج
- في `ClientPageRight`: مرّر `hideIfEmpty` لكل واحدة
- **استثناء:** `RelatedClients` يظهر دايماً (مهم لـ internal linking + SEO)

---

## Phase 4 — Hero Cover Fallback
> **الهدف:** branded fallback عوض الـ dark/empty background
> **Files:** `hero-cover.tsx`
> **Verify:** لما ما في cover image، يظهر gradient جميل مع pattern

### التفاصيل:
- لو `coverImage === null`: اعرض `div` بـ gradient بدل `next/image`
- Gradient: `bg-gradient-to-br from-primary/20 via-background to-muted`
- أضف subtle pattern: `opacity-10` grid أو dots pattern بـ CSS
- نفس الـ `h-48 sm:h-56 md:h-64` dimensions
- لا `<Image>` عند غياب الـ src — يزيل console warning

---

## Phase 5 — Newsletter Card في Left Sidebar
> **الهدف:** lead capture مباشر من صفحة العميل
> **Files:** `client-page-left.tsx` + component جديد `client-newsletter-card.tsx`
> **Verify:** Card تظهر في left sidebar، subscribe يعمل بشكل صحيح

### التفاصيل:
- Component: `ClientNewsletterCard` — Card مع input email + button "اشترك"
- يظهر بعد "نبذة عن العميل" مباشرة
- reuse نفس server action الـ newsletter الموجود
- يظهر فقط لو `client.hasNewsletter` أو دايماً (قرار تصميمي)
- Pre-fill email لو المستخدم logged in

---

## Phase 6 — Featured First Article (Hero Card)
> **الهدف:** المقال الأول يظهر بـ card أكبر وأبرز
> **Files:** `client-page-feed.tsx` + `article-list.tsx`
> **Verify:** أول مقال يظهر بـ featured style (صورة كبيرة + excerpt أطول)

### التفاصيل:
- في `article-list.tsx`: أول `PostCard` يستقبل prop `featured={true}`
- `PostCard` مع `featured`: `col-span-full` + صورة أكبر + excerpt يظهر
- باقي المقالات: النمط العادي
- لو مقال واحد فقط: يظهر featured بشكل تلقائي

---

## Phase 7 — Mobile Sticky "اسأل العميل" Button
> **الهدف:** CTA دايماً في متناول اليد على mobile
> **Files:** component جديد `client-mobile-cta.tsx` + `page.tsx`
> **Verify:** زر sticky يظهر على mobile فقط، يختفي لو Hero CTA في الـ viewport

### التفاصيل:
- `<div className="fixed bottom-20 start-4 z-40 lg:hidden">` (فوق bottom nav)
- زر دائري (FAB): `rounded-full h-12 w-12` بـ icon فقط (IconMessage)
- أو: pill button `"اسأل العميل"` إذا عرض الشاشة يسمح
- `IntersectionObserver` على Hero CTA: يخفي الـ FAB لو Hero مرئي
- `dynamic(ssr:false)` — client component

---

## Phase 8 — Tab Nav Fade Indicator
> **الهدف:** إعلام المستخدم بوجود tabs خارج الـ view على mobile
> **Files:** `client-tabs-nav.tsx`
> **Verify:** على mobile، fade gradient يظهر على حافة الـ scroll container

### التفاصيل:
- Wrap الـ tabs في `relative overflow-hidden`
- أضف `::after` pseudo أو `<div>` بـ `bg-gradient-to-l from-background to-transparent` على اليسار
- يختفي بـ JS لو scroll وصل للآخر

---

## ترتيب التنفيذ المقترح

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → (تحقق + تيست)
Phase 5 → Phase 6 → Phase 7 → Phase 8 → (تحقق + push)
```

**Phase 1–4**: تحسينات فورية — لا data جديدة، لا API
**Phase 5–8**: تحسينات محتوى وتجربة — تحتاج قرارات تصميمية

---

## Checklist قبل Push

- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] Desktop 1280px: Hero CTA ظاهر وشغال
- [ ] Mobile 375px: sticky FAB فوق bottom nav
- [ ] left sidebar: لا stats card، نبذة أولاً
- [ ] right sidebar: لا empty cards
- [ ] Hero cover: fallback gradient جميل
- [ ] Newsletter card: subscribe يعمل
- [ ] Console: 0 errors

---

## الـ IDs في MASTER-TODO

- [ ] **CP-15** — Hero: "اسأل العميل" primary CTA
- [ ] **CP-16** — Hero Cover: branded fallback gradient
- [ ] **CP-17** — Hero Social Links: أكبر + label
- [ ] **CP-18** — Left Sidebar: حذف Stats Card المكررة
- [ ] **CP-19** — Right Sidebar: hide empty state cards
- [ ] **CP-20** — Left Sidebar: إعادة ترتيب (نبذة أولاً)
- [ ] **CP-21** — Feed: Featured first article card
- [ ] **CP-22** — Left Sidebar: Newsletter subscription card
- [ ] **CP-23** — Mobile: Sticky "اسأل العميل" FAB
- [ ] **CP-24** — Tab Nav: fade gradient indicator
