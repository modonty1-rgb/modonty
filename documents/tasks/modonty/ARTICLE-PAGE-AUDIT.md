# Article Page — Full Audit & Polish
> Created: 2026-04-11
> Goal: صفحة المقال 100% — كروت compact + كل functionality مُتحقَّق من backend

---

## القاعدة

- كل كرت/سيكشن: compact + احترافي (نفس أسلوب `ArticleSidebarEngagement`)
- كل functionality: متحقَّق من الكود + DB — لا افتراضات
- ننتهي من هذا الملف ← نرجع لـ `MODONTY-PUBLIC-TODO.md`

---

## 🔴 UI — الكروت (compact & polish)

- [x] **C1 — ArticleClientCard** (sidebar يسار) ✅ (2026-04-11)
  Hero image + logo + description + AskClient button — مناسب للـ client branding

- [x] **C2 — ArticleAuthorBio** (sidebar يمين) ✅ (2026-04-11)
  أعيد تصميمه: avatar أفقي h-10 + compact header `bg-muted/40`

- [x] **C3 — ArticleTableOfContents** (sidebar يمين) ✅ (2026-04-11)
  compact header + removed redundant sticky + text-xs

- [x] **C4 — NewsletterCTA** (sidebar يمين) ✅ (2026-04-11)
  compact header `bg-muted/40` + border-b + functional: `/api/subscribers` POST ✅

- [x] **C5 — CommentFormDialog** (sidebar يمين) ✅ (2026-04-11)
  compact header `bg-muted/40` + border-b + dialog trigger button

- [x] **C6 — ArticleFaq** (body) ✅ verified (2026-04-11)
  Functional: fetchArticleFaqs + fetchPendingFaqsForArticle — PENDING FAQs show with "قيد المراجعة" badge

- [x] **C7 — ArticleComments** (body) ✅ (2026-04-11)
  English labels removed, approve button removed, dead code removed, "رداً على" fixed

- [x] **C8 — MoreFromAuthor** (body) ✅ (2026-04-11)
  Dead hidden dislike span removed — fetches from `getRelatedArticlesByAuthor` ✅

- [x] **C9 — MoreFromClient** (body) ✅ (2026-04-11)
  Dead hidden dislike span removed — fetches from `getRelatedArticlesByClient` ✅

- [x] **C10 — RelatedArticles** (body) ✅ (2026-04-11)
  Dead hidden dislike span removed — fetches by category/tags with fallback to recent ✅

- [x] **C11 — ArticleFooter** (body) ✅ (2026-04-11)
  License URL rendered as clickable link

---

## 🟠 Functionality — تحقق backend/DB

- [x] **F1 — Like / Dislike / Favorite** ✅ verified (2026-04-11)
  auth required, optimistic UI, check-exists-first pattern, revalidatePath ✅

- [x] **F2 — Comments** ✅ verified (2026-04-11)
  submitComment → PENDING → approved-only in prod, router.refresh() on success, dialog shows "سيظهر بعد المراجعة" ✅

- [x] **F3 — FAQ / اسأل العميل** ✅ verified (2026-04-11)
  submitAskClient → ArticleFAQ PENDING, user sees pending with "قيد المراجعة" badge ✅

- [x] **F4 — Newsletter CTA** ✅ verified (2026-04-11)
  POST /api/subscribers, handles already-subscribed, pre-fills email from session ✅

- [x] **F5 — View Tracking** ✅ verified (2026-04-11)
  POST /api/articles/{slug}/view on mount, tracks scroll depth + bounce on leave ✅

- [x] **F6 — Share Tracking** ✅ verified (2026-04-11)
  POST /api/articles/{slug}/share after share + CTA analytics ✅

- [x] **F7 — Reading Progress Bar** ✅ verified (2026-04-11)
  Applied in page.tsx, correct scroll implementation, top-14 fixed position ✅

- [x] **F8 — "اسأل العميل" (AskClientDialog)** ✅ verified (2026-04-11)
  submitAskClient, same FAQ flow, rate-limited (max 5 pending), sanitized ✅

---

## 🟡 Skeleton / Loading States

- [x] **S1 — ArticleInteractionButtons** ✅ (2026-04-11)
  skeleton للـ like/dislike/favorite قبل hydration

- [x] **S2 — باقي الكروت** ✅ verified (2026-04-11)
  MoreFromAuthor/Client/Related: skeleton components موجودة ✅ | ArticleFaq: collapsed by default (no flash) ✅ | ArticleComments: fetches on open ✅

---

## ✅ مكتمل

- [x] **ArticleSidebarEngagement** — compact, one-row stats + share (ghost icons)
- [x] **Article Header** — views icon في meta row
- [x] **ArticleInteractionButtons skeleton** — بدل div فارغ (2026-04-11)
- [x] **AskClientDialog** — ديناميكي `اسأل {clientName} مباشرةً` + لون amber
- [x] **الكروت C1–C11** — compact headers + dead code removed (2026-04-11)
- [x] **الوظائف F1–F8** — كل functionality مُتحقَّق من الكود + DB (2026-04-11)
- [x] **الـ Skeletons S1–S2** — لا flash ولا layout jump (2026-04-11)

---

## 🏁 AUDIT COMPLETE — 2026-04-11
جميع البنود منتهية. ارجع لـ `MODONTY-PUBLIC-TODO.md` للمرحلة التالية.

---

## ترتيب التنفيذ المقترح

1. Screenshot لكل الصفحة → تحديد كل ما يلفت النظر
2. C1 → C11 بالترتيب (UI polish)
3. F1 → F8 (functional verification)
4. S2 (skeleton sweep)
5. ✅ اعتماد → رجوع لـ `MODONTY-PUBLIC-TODO.md`
