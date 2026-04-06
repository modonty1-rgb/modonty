# Admin UI/UX — Standard Pattern

> المرجع الموحد لكل الأقسام المتشابهة: Categories, Tags, Industries
> آخر تحديث: 2026-04-04

---

## الفلسفة

- الأدمن يحتاج **معلومات واضحة** قدام عينه — ما يدور عليها
- كل قسم يتبع **نفس الـ pattern** — الأدمن يتعلم مرة ويطبق في كل مكان
- **بساطة** — لا ميزات ما لها فايدة عملية
- **أمان** — لا حذف جماعي، تأكيد قبل كل حذف

---

## 1. صفحة القائمة (List Page)

```
┌─────────────────────────────────────────────────────┐
│  [Title]                    [Revalidate All SEO] [+ New]  │
│  Manage all [entity] in the system                        │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ 15       │  │ 3        │  │ 0        │                │
│  │ Total    │  │ Have X   │  │ Missing  │                │
│  │ [Entity] │  │          │  │ SEO      │                │
│  └──────────┘  └──────────┘  └──────────┘                │
├─────────────────────────────────────────────────────┤
│  Name ↕ │ [Relation] ↕ │ Count ↕ │ SEO │ Created ↕ │ ⚡  │
│  ────────┼──────────────┼─────────┼─────┼───────────┼──── │
│  Item 1  │ Parent       │ 5       │ ✅  │ Apr 4     │ 👁✏🗑│
│  Item 2  │ -            │ 0       │ ✅  │ Apr 3     │ 👁✏🗑│
├─────────────────────────────────────────────────────┤
│  Showing 1 to 10 of 15        ◀ Page 1 of 2 ▶           │
└─────────────────────────────────────────────────────┘
```

### المكونات المطلوبة:

| Component | وظيفة | ملاحظات |
|-----------|-------|---------|
| `[entity]-stats.tsx` | 3 بطاقات إحصائيات | Total + With Relations + Missing SEO |
| `[entity]-page-client.tsx` | Wrapper يعرض تنبيه SEO ناقص + Table | بدون bulk actions |
| `[entity]-table.tsx` | جدول sortable + pagination | 10 per page, `useRouter().push()` للنقر |
| `[entity]-row-actions.tsx` | 3 أزرار: View + Edit + Delete | `aria-label` على كل زر |
| `revalidate-all-seo-button.tsx` | إعادة توليد SEO للكل | في الـ header |
| `export-button.tsx` | تصدير CSV | اختياري |

### القواعد:

- **لا checkboxes** — لا حذف جماعي
- **لا bulk-actions-toolbar** — خطر على البيانات
- Row click → `useRouter().push()` (مو `window.location.href`)
- Date format → `Intl.DateTimeFormat`
- Sort icons → `ms-2` (مو `ml-2`)
- SEO status → ✅ Generated / ⚠️ Pending
- Empty state → "No [entity] found"

---

## 2. صفحة الإنشاء / التعديل (New / Edit Page)

### Layout: 2-column grid (3 cols: 2 left + 1 right)

```
┌──────────────────────────────────────┬────────────────────┐
│  ● Basic Information                  │  ◈ Social Image    │
│  ┌───────────────┬──────────────┐    │  Image URL         │
│  │ Name *        │ Parent Cat   │    │  [cloudinary url]  │
│  └───────────────┴──────────────┘    │  ✅ Optimized      │
│  Slug: auto-generated                │                    │
│  Description (2 rows + counter)      │  Alt Text          │
│                                      │  [describe image]  │
├──────────────────────────────────────┤                    │
│  ◉ SEO                    (blue)     │  [preview]         │
│  ┌───────────────┬──────────────┐    ├────────────────────┤
│  │ SEO Title     │ SEO Desc     │    │  ◆ Actions (green) │
│  └───────────────┴──────────────┘    │  [💾 Create/Update]│
│                                      │  [← Cancel]        │
└──────────────────────────────────────┴────────────────────┘
```

### الألوان لكل Card:

| Card | نقطة اللون | Border | Background |
|------|-----------|--------|------------|
| Basic Information | `bg-primary` | default | default |
| SEO | `bg-blue-500` | `border-blue-500/20` | `bg-blue-500/[0.02]` |
| Social Image | `bg-violet-500` | `border-violet-500/20` | `bg-violet-500/[0.02]` |
| Actions | — | `border-emerald-500/20` | `bg-emerald-500/[0.02]` |

### العمود الأيمن:

- `lg:sticky lg:top-4 lg:self-start` — يثبت مع الـ scroll
- Social Image card + Actions card
- الأزرار full width مع أيقونات (Save + ArrowLeft)

### Image Input (CloudinaryImageInput):

- Input field لرابط Cloudinary (مو file upload)
- Auto-optimize on blur: يضيف `w_1200,h_630,c_fill,q_auto,f_auto`
- مؤشر حالة: ✅ Optimized (أخضر) / Will optimize (أصفر) / External (رمادي)
- Alt Text input منفصل
- Preview مع error handling
- زر حذف `X` مع `aria-label`

### القواعد:

- **2-column layout** — `grid-cols-1 lg:grid-cols-3` (2+1)
- Name + Parent/Relation في **صف واحد** `md:grid-cols-2`
- SEO Title + SEO Description في **صف واحد** `md:grid-cols-2`
- CardHeader: `pb-3` + `text-base` (compact)
- CardContent: `space-y-3` + `gap-3` (مو `gap-6`)
- Description: `rows={2}` (مو 3)
- Slug: auto-generated in create, locked in edit مع تحذير
- Character counter على Description + SEO Description
- Submit: `"Create [Entity]"` / `"Update [Entity]"` / loading: `"Saving & Generating SEO…"`
- Cancel: variant outline, يظهر فقط في edit mode
- بعد الإنشاء → redirect to list

### المرجع: `admin/app/(dashboard)/categories/components/category-form.tsx`

---

## 3. صفحة التفاصيل (Detail Page)

```
┌─────────────────────────────────────────────────────┐
│  [Entity Name]              [Revalidate SEO] [🗑 Delete] │
├─────────────────────────────────────────────────────┤
│  ▼ Basic Information                                     │
│  ├── Name: التسويق الرقمي                                │
│  ├── Slug: digital-marketing                             │
│  ├── Description: ...                                    │
│  ├── [Relation]: Parent Name (link)                      │
│  ├── [Count]: 5 articles (link)                          │
│  ├── Created: Apr 4, 2026                                │
│  └── Updated: Apr 4, 2026                                │
│                                                          │
│  ▼ SEO                                                   │
│  ├── SEO Title: ...                                      │
│  ├── SEO Description: ...                                │
│  ├── Social Image: [preview]                             │
│  ├── SEO Cache: Generated at ...                         │
│  ├── JSON-LD: { ... }                                    │
│  └── Meta Tags: { ... }                                  │
│                                                          │
│  ▼ Related [Items] (5)                                   │
│  ├── [Sortable table with search]                        │
│  └── [View All link]                                     │
│                                                          │
│  [← Back]  [✏ Edit]                                      │
└─────────────────────────────────────────────────────┘
```

### القواعد:

- Collapsible sections (default open)
- Delete button → `AlertDialog` (مو `Dialog`)
- Revalidate SEO button
- Related items table مع search + sort + pagination
- Back + Edit buttons في الأسفل

---

## 4. صفحة التعديل (Edit Page)

```
┌─────────────────────────────────────────────────────┐
│  ← Edit [Entity]            [Revalidate SEO] [🗑 Delete] │
│    Update [entity] information                           │
├─────────────────────────────────────────────────────┤
│  [Same form as Create — with initialData]                │
│                                                          │
│  Slug: digital-marketing  ⚠️ لا يتغير بعد النشر         │
│                                                          │
│  ┌─ SEO Cache ──────────────────────────────────┐        │
│  │ ✅ Last generated: Apr 4, 2026 12:00         │        │
│  │ ┌─ JSON-LD ─────┐  ┌─ Meta Tags ────┐       │        │
│  │ │ { ... }       │  │ { ... }        │       │        │
│  │ └───────────────┘  └────────────────┘       │        │
│  └──────────────────────────────────────────────┘        │
│                                                          │
│                     [Cancel]  [Update [Entity]]          │
└─────────────────────────────────────────────────────┘
```

### القواعد:

- Same form as Create + initialData
- Slug read-only مع تحذير
- SEO Cache preview (JSON-LD + Meta Tags) — إذا موجود
- Delete + Revalidate SEO في الـ header
- Cancel + Update buttons

---

## 5. حذف (Delete Flow)

```
User clicks Delete → AlertDialog opens:
┌──────────────────────────────────────┐
│  Are you sure?                       │
│  This action cannot be undone.       │
│  This will permanently delete        │
│  this [entity].                      │
│                                      │
│           [Cancel]  [Delete]         │
└──────────────────────────────────────┘
```

### القواعد:

- **دائماً `AlertDialog`** — في كل مكان (row actions + detail page)
- فحص العلاقات قبل الحذف (articles, children, clients)
- رفض الحذف لو فيه عناصر مرتبطة
- حذف الصورة من Cloudinary قبل الحذف
- Toast notification بعد النجاح/الفشل

---

## 6. قواعد عامة (RTL + A11y + UX)

### RTL
- `me-` بدل `mr-`
- `ms-` بدل `ml-`
- `start/end` بدل `left/right`
- `ps-/pe-` بدل `pl-/pr-`

### Accessibility
- Icon buttons → `aria-label` (مو `title`)
- Row navigation → `useRouter().push()` (مو `window.location.href`)
- Delete confirmation → `AlertDialog` (مع keyboard support)

### UX
- Date format → `Intl.DateTimeFormat`
- Loading states → "Saving..." / "Deleting..." / "Generating..."
- Toast → success/error بعد كل عملية
- Empty state → مصمم (مو بس نص)

---

## 7. الفجوات الحالية

### Tags — يحتاج:
- [ ] شيل bulk-actions-toolbar + checkboxes (زي Categories)
- [ ] شيل bulk-delete-tags من actions
- [ ] RTL fixes (mr → me, ml → ms)
- [ ] Icon buttons: title → aria-label
- [ ] Row click: window.location → useRouter().push()
- [ ] Date format → Intl.DateTimeFormat
- [ ] Delete dialog → توحيد AlertDialog
- [ ] إضافة SEO cache preview في Edit page

### Industries — يحتاج:
- [ ] شيل bulk-actions-toolbar + checkboxes (زي Categories)
- [ ] شيل bulk-delete-industries من actions (خلاص الـ listing cache اتضاف)
- [ ] RTL fixes
- [ ] Icon buttons: title → aria-label
- [ ] Row click: window.location → useRouter().push()
- [ ] Date format → Intl.DateTimeFormat
- [ ] Delete dialog → توحيد AlertDialog
- [ ] إضافة SEO cache preview في Edit page
