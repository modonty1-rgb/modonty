# خطة تطبيق MOB2–MOB6 على الـ Production Article Page

> **المرجع:** design-preview page — تم التحقق منه 100% بتاريخ 2026-04-20
> **القاعدة الذهبية:** Server Component افتراضياً — Client Component فقط عند الحاجة

---

## ✅ الـ Architecture الحالية (مهم — لا تعدّل ما هو شغّال)

```
page.tsx (Server)
  ├─ imports static: ArticleHeader, ArticleFeaturedImage, ArticleTags, ...
  └─ imports dynamic (ssr:false) من client-lazy.tsx:
       ├─ GTMClientTracker, ArticleViewTracker, ArticleBodyLinkTracker
       ├─ ArticleMobileLayout ← موجود ومغلّف بـ dynamic() ✅ لا تحتاج تغييره
       └─ NewsletterCTA
```

**قاعدة ذهبية:** أي Client Component جديد يُضاف إلى `client-lazy.tsx` — ليس في `page.tsx` مباشرة.

---

## الـ IDs الصحيحة في الـ production (مهم جداً)

| القسم | الـ ID الصحيح |
|-------|--------------|
| التعليقات | `article-comments` |
| الأسئلة الشائعة | `article-faq` |

⚠️ الخطة الأولى كانت خاطئة (`comments-section`, `faq-section`) — هذه IDs الـ design preview فقط.

---

## Phase 1 — MOB4: عدد الأسئلة في الـ Header (Server Component)

**ملفات:** `article-header.tsx` + `page.tsx`

- [x] **`article-header.tsx`**
  - أضف `questionsCount?: number` للـ props interface
  - في meta row: استبدل الـ `<span>` الحالي للـ questions بـ `<a href="#article-faq">` (لا event handler — Server Component)
  - استخدم `href="#article-faq"` — نفس scroll behavior بدون client JS
  - الأيقونة: `IconHelp` موجود في `@/lib/icons`
  - ⚠️ لا `onClick` لأن `article-header.tsx` Server Component ← لا تضيف 'use client'

- [x] **`page.tsx`**
  - مرر `questionsCount={article._count.faqs}` إلى `<ArticleHeader>`

- [x] **`ArticleEngagementMetrics` — احذف من mobile view**
  - في `page.tsx` احذف `<div className="lg:hidden mb-4"><ArticleEngagementMetrics .../></div>`
  - المبرر: questionsCount أصبح في الـ header، والـ bar يعرض comments count
  - ⚠️ احذفه من الـ import في `components/index.ts` إذا لم يُستخدَم في مكان آخر

**Verify:** ✓ عدد الأسئلة يظهر في الـ header كـ link، يـscroll لـ FAQ section ✅ TSC: zero errors

---

## Phase 2 — MOB5: Newsletter Overlay على الصورة

**ملفات:** `article-featured-image.tsx` + ملف جديد + `client-lazy.tsx` + `page.tsx`

- [x] **`article-featured-image.tsx`**
  - أضف `children?: React.ReactNode` للـ props
  - حوّل الـ outer div إلى `<div className="relative w-full ...">` (أضف `relative` إن لم تكن موجودة)
  - ارندر `{children}` داخل الـ relative wrapper في الآخر

- [x] **أنشئ:** `article-featured-image-newsletter.tsx` — Client Component
  ```
  'use client'
  Props: clientId: string, clientName: string, articleId?: string
  يرندر: div absolute inset-x-0 bottom-0 + gradient scrim + text + button
  الـ Dialog يستخدم shadcn Dialog مع NewsletterCTA بداخله
  ```
  - gradient: `bg-gradient-to-t from-black/85 via-black/50 to-transparent`
  - text: `جديد {clientName} في بريدك 🔔`
  - button: `اشترك الآن ←` → يفتح Dialog
  - Dialog يحتوي: `<NewsletterCTA clientId={clientId} articleId={articleId} />`
  - تأكد أن Newsletter Dialog يغلق بعد الاشتراك

- [x] **`client-lazy.tsx`**
  - أضف export جديد:
    ```ts
    export const ArticleFeaturedImageNewsletter = dynamic(
      () => import("./article-featured-image-newsletter").then(m => ({ default: m.ArticleFeaturedImageNewsletter })),
      { ssr: false }
    );
    ```

- [x] **`page.tsx`**
  - في الـ import من `client-lazy.tsx`: أضف `ArticleFeaturedImageNewsletter`
  - في الـ JSX:
    ```tsx
    <ArticleFeaturedImage image={article.featuredImage} title={article.title}>
      {article.client && (
        <ArticleFeaturedImageNewsletter
          clientId={article.clientId}
          clientName={article.client.name}
          articleId={article.id}
        />
      )}
    </ArticleFeaturedImage>
    ```

**Verify:** ✓ الصورة تُرندر من الـ server، الـ overlay يظهر client-side فقط، النشرة تعمل

---

## Phase 3 — MOB2 + MOB3: إعادة تصميم Mobile Bar

**ملفات:** `article-mobile-engagement-bar.tsx` + `article-mobile-layout.tsx` + `page.tsx`

### 3A — إضافة `useHideOnScroll` hook
- [x] أضف في أعلى `article-mobile-engagement-bar.tsx`:
  ```ts
  function useHideOnScroll() {
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    useEffect(() => {
      const update = () => {
        const curr = window.scrollY;
        setVisible(curr < lastScrollY.current || curr < 80);
        lastScrollY.current = curr;
      };
      window.addEventListener("scroll", update, { passive: true });
      return () => window.removeEventListener("scroll", update);
    }, []);
    return visible;
  }
  ```

### 3B — Props الجديدة للـ bar
- [x] **`article-mobile-engagement-bar.tsx`** — interface جديدة:
  ```ts
  interface ArticleMobileEngagementBarProps {
    // موجودة — لا تحذف:
    title: string;
    articleId: string;
    articleSlug: string;
    clientId?: string;
    userId?: string | null;
    likes: number;
    dislikes: number;
    favorites: number;
    userLiked: boolean;
    userDisliked: boolean;
    userFavorited: boolean;
    onOpenSidebar?: () => void;
    // جديدة:
    client?: {
      slug: string;
      name: string;
      logoUrl?: string | null;
    } | null;
    commentsCount?: number;
    onOpenNewsletter?: () => void;
    askClientProps?: {
      articleId: string;
      clientId: string;
      articleTitle?: string;
      user: { name: string | null; email: string | null } | null;
    } | null;
  }
  ```

### 3C — Layout الجديد للـ bar
- [x] غيّر الـ outer div:
  - من: `fixed bottom-20 inset-x-0 z-40 border-t p-4`
  - إلى: `sticky top-14 z-[45] border-b px-3 py-1.5` مع `transition-transform duration-300` + `barVisible ? "translate-y-0" : "-translate-y-full"`

- [x] Zone 1 (يمين في RTL):
  ```tsx
  {client?.logoUrl ? (
    <Link href={`/clients/${client.slug}`} className="shrink-0">
      <Image src={client.logoUrl} alt={client.name} width={32} height={32}
        className="h-8 w-8 rounded-full object-contain ring-2 ring-border bg-background" />
    </Link>
  ) : client ? (
    <Link href={`/clients/${client.slug}`} className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
      {client.name[0]}
    </Link>
  ) : null}

  {askClientProps && <AskClientButton {...askClientProps} />}
  ```

- [x] Separator: `<div className="w-px h-5 bg-border/60 mx-1 shrink-0" />`

- [x] Zone 2 (engagement + newsletter + share + burger):
  - `ArticleInteractionButtons` (compact, hideLoginHint) — موجود وشغّال ✅
  - Comments button: `<button onClick={() => document.getElementById('article-comments')?.scrollIntoView({behavior:'smooth',block:'start'})}>`
    - يعرض: `<IconComment /> {commentsCount}`
  - Newsletter bell: `<button onClick={onOpenNewsletter}>`
  - Share: `ArticleShareButtons` المبسّط — أو `navigator.share`
  - Burger: `onOpenSidebar` — موجود ✅ + `ms-auto`

- [x] **AskClientButton** — component صغير داخل نفس الملف:
  ```tsx
  function AskClientButton({ articleId, clientId, articleTitle, user }: {...}) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-primary text-primary-foreground text-xs font-semibold py-1.5 px-3 whitespace-nowrap">
          اسأل العميل
        </button>
        {open && (
          <AskClientDialog
            articleId={articleId} clientId={clientId} articleTitle={articleTitle}
            user={user} open={open} onOpenChange={setOpen}
          />
        )}
      </>
    );
  }
  ```
  - استورد `AskClientDialog` بالـ lazy import داخل نفس الملف — لا static import

### 3D — تحديث `article-mobile-layout.tsx`
- [x] أضف props جديدة:
  ```ts
  barProps: {
    // ... الموجودة +
    client?: { slug: string; name: string; logoUrl?: string | null } | null;
    commentsCount?: number;
    askClientProps?: { articleId: string; clientId: string; articleTitle?: string; user: {...} | null } | null;
  }
  ```
- [x] أضف state: `const [newsletterOpen, setNewsletterOpen] = useState(false)`
- [x] مرر `onOpenNewsletter={() => setNewsletterOpen(true)}` للـ bar
- [x] أضف NewsletterDialog في الـ JSX:
  ```tsx
  {newsletterOpen && barProps.client && (
    <ArticleNewsletterDialog
      clientId={barProps.clientId!}
      clientName={barProps.client.name}
      articleId={barProps.articleId}
      onClose={() => setNewsletterOpen(false)}
    />
  )}
  ```
  - `ArticleNewsletterDialog` = نفس component من Phase 2 (`ArticleFeaturedImageNewsletter`) أو wrapper مشترك
  - ⚠️ استوردها بـ lazy import داخل الملف (`const Dialog = dynamic(...)`) أو استخدم نفس الـ export من `client-lazy.tsx`

### 3E — تحديث `page.tsx` — barProps
- [x] أضف في `barProps`:
  ```ts
  client: article.client
    ? { slug: article.client.slug, name: article.client.name, logoUrl: article.client.logoMedia?.url ?? null }
    : null,
  commentsCount: article._count.comments,
  askClientProps: article.client
    ? { articleId: article.id, clientId: article.clientId, articleTitle: article.title, user: session?.user ? { name: session.user.name ?? null, email: session.user.email ?? null } : null }
    : null,
  ```
- [x] غيّر `pb-40 lg:pb-8` إلى `pb-20 lg:pb-8`
  - المبرر: pb-40 كان للـ fixed bar (44px) + bottom nav (64px). الآن الـ bar أصبح sticky فوق، نحتاج فقط clearance للـ bottom nav (64px → pb-20 = 80px كافي)

**Verify:** ✓ Bar أعلى الصفحة، hide-on-scroll شغّال، كل الـ zones تعمل، AskClientDialog يفتح

---

## Phase 4 — MOB6: إعادة ترتيب الـ Sheet

**ملف:** `article-mobile-sidebar-sheet.tsx`

### 4A — Props الجديدة
- [x] أضف `platformSocialLinks` (موجود) — استخدمه في Modonty branding
- [x] تأكد وجود `articleSlug` للـ share URL (موجود)

### 4B — الترتيب الجديد
- [x] **يُحذف** من الـ sheet:
  - `ArticleAuthorBio` — موجودة في desktop sidebar، غير ضرورية موبايل
  - `CommentFormDialog` — المستخدم يـscroll للـ inline form في الـ body

- [x] **الترتيب الجديد بالضبط:**
  1. `ArticleClientCard` + askClientProps ✅ (موجود — يبقى أول شيء)
  2. separator `<div className="h-px bg-border/40" />`
  3. `NewsletterCTA` ✅ (موجود)
  4. separator
  5. `ArticleTableOfContents` ✅ (موجود)
  6. separator
  7. **جديد: Share section**
     ```tsx
     <div>
       <p className="text-xs font-semibold text-muted-foreground mb-3">شارك المقال</p>
       <ArticleShareButtons title={sheetProps.title} url={`/articles/${articleSlug}`} articleId={articleId} clientId={clientId} />
     </div>
     ```
     - `title` يأتي كـ prop جديد — أضف للـ interface
     - استخدم `ArticleShareButtons` الموجود مسبقاً
  8. separator
  9. **جديد: Modonty branding**
     ```tsx
     <div className="flex items-center justify-between gap-3">
       <Link href="/about" onClick={() => setOpen(false)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
         <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">M</div>
         <div>
           <p className="text-sm font-semibold">مدونتي</p>
           <p className="text-xs text-muted-foreground">منصة المحتوى العربي</p>
         </div>
       </Link>
       {platformSocialLinks.length > 0 && (
         <nav className="flex items-center gap-1" aria-label="وسائل التواصل مدونتي">
           {/* social icons — reuse FollowCard pattern */}
         </nav>
       )}
     </div>
     ```
  10. separator
  11. `ArticleCitations` ✅ (يبقى في الآخر — لكن احذف الـ `citations.length > 0` check الحالي وارندره دائماً مع guard داخله)

- [x] أضف prop `title: string` لأن الـ `ArticleShareButtons` يحتاجه
- [x] في `article-mobile-layout.tsx`: مرر `title: sheetProps.title` أو أضفه للـ sheetProps

### 4C — تحديث `page.tsx` — sheetProps
- [x] أضف `title: article.title` في `sheetProps`

**Verify:** ✓ Sheet يفتح بالترتيب الصحيح، AuthorBio اختفى، CommentForm اختفى، Share شغّال، Branding يظهر، Citations في الآخر

---

## Phase 5 — TSC + QA الكامل ✅ 2026-04-20

- [x] `pnpm tsc --noEmit` — صفر أخطاء
- [x] اختبار live 375px:
  - [x] Bar أعلى الصفحة — يختفي عند scroll down — يرجع عند scroll up
  - [x] Zone 1: client logo (يـlink للـ client page) + "اسأل العميل" (يفتح dialog)
  - [x] Zone 2: likes+count ✓، favorites+count ✓، comments button → scroll إلى `#article-comments` ✓
  - [x] Newsletter bell → يفتح Newsletter dialog ✓
  - [x] Share button → native share / copy ✓
  - [x] Burger → يفتح sheet ✓
  - [x] Questions count في header → link إلى `#article-faq` ✓
  - [ ] Featured image newsletter overlay → يظهر + يفتح النشرة (⚠️ dev articles have no featured image — code is wired, untestable in dev)
  - [x] Sheet: client → newsletter → TOC → share → branding → citations ✓
  - [x] لا author bio في الـ sheet ✓
  - [x] لا comment form في الـ sheet ✓
  - [x] Desktop (1280px): لا تغيير بصري — lg:hidden يحمي كل شيء ✓
  - [x] مقال بدون client → initial letter fallback ✓
  - [x] مقال بدون citations → sheet بدون citations section ✓
- [ ] `pnpm build` — zero errors (pending push)

---

## ملخص الملفات المتأثرة

| الملف | نوع التغيير | Phase |
|-------|------------|-------|
| `article-header.tsx` | + questionsCount prop + href link | 1 |
| `page.tsx` | + questionsCount + overlay children + barProps جديدة + pb-20 | 1,2,3,4 |
| `article-featured-image.tsx` | + children slot | 2 |
| `article-featured-image-newsletter.tsx` | **ملف جديد** (Client + Dialog) | 2 |
| `client-lazy.tsx` | + ArticleFeaturedImageNewsletter export | 2 |
| `article-mobile-engagement-bar.tsx` | إعادة تصميم كاملة + AskClientButton + useHideOnScroll | 3 |
| `article-mobile-layout.tsx` | + newsletter state + props جديدة | 3 |
| `article-mobile-sidebar-sheet.tsx` | إعادة ترتيب + حذف + إضافة + title prop | 4 |

**لا تُمس:** desktop sidebar components, article-body, article-comments, article-faq, article-footer

---

## ⚠️ نقاط خطر — راجعها دائماً

1. **IDs للـ scroll:** `article-comments` و `article-faq` — ليس `comments-section` أو `faq-section`
2. **ArticleMobileLayout** موجود بالفعل في `client-lazy.tsx` بـ `dynamic(ssr:false)` — لا تعدّله
3. **AskClientDialog** في الـ bar: lazy import فقط (لا static) — يُحمَّل فقط عند الضغط
4. **client logo fallback:** إذا `logoUrl = null` → اعرض initial letter من اسم العميل
5. **pb-20 وليس pb-8:** bottom nav لا يزال موجوداً على موبايل — يحتاج clearance
6. **ArticleEngagementMetrics:** احذف من mobile view في `page.tsx` (أصبح مكرراً)

---

> بعد Phase 5 اجتياز كامل → bump v1.36.0 → backup → push
