# EntityCard + Listing Pages — مرجع التنفيذ الموحّد

**الإصدار:** 2.1 (يحل محل v1.0 — صحّح مصدر «الأثر الرقمي» من GSC إلى GA4 + أزال Accent Strip بالكامل)
**تاريخ الاعتماد:** 2026-07-04
**نطاق العمل:** Industry → Category → Tag (بنفس الترتيب، نفس التنفيذ يتكرر بلا نقاش جديد)
**المراجع البصرية:**
- `documents/mockups/entity-page-layout-v1.html` — الـ layout الكامل (Hero + Toolbar + Grid)، 3 تبويبات (Category/Industry/Tag)
- `documents/mockups/entity-card-pattern-system-v1.html` — تشريح الكرت + قبل/بعد
- `documents/mockups/categories-card-redesign-v3.html` — الكرت المفرد بتفاصيل الـ footer

---

## 1. المنطق التجاري (السبب وراء كل هذا)

الشريك المدفوع (`subscriptionStatus: ACTIVE`) يظهر كـ **معاينة (avatar teaser)** في كل صفحة listing ذات صلة به (الفئة/الصناعة/الوسم اللي مقالاته تنتمي لها) → الزائر يضغط على الكرت → صفحة التفاصيل تعرض **كروت العملاء الكاملة** (شعار + تقييمات + الأثر الرقمي + رقم الجوال).

الـ avatar group مو تزيين — إنه navigation teaser وظيفي: يعرض بالضبط الشركاء اللي بيشوفهم الزائر لو ضغط.

---

## 2. ترتيب التنفيذ (مُعتمَد — عُدِّل 2026-07-04)

| المرحلة | الكيان | الحالة |
|---------|--------|--------|
| 1 | **Tag** | ✅ **مكتمل ومُختبر** (junction table + previews + pagination + infinite scroll + بحث/فرز) |
| 2 | **Category** | ✅ **مكتمل ومُختبر** (نفس النمط + مكوّنات البحث/الفرز صارت shared) |
| **3 (التالي)** | **Industry** | آخر كيان — أبسط: علاقة `Client.industryId` مباشرة (بدون junction ولا Article hop) |

**مكوّنات مشتركة جاهزة (تُعاد استخدامها مباشرة في Industry):**
- `components/shared/EntityCard.tsx` · `EntityPlaceholder.tsx` · `InfiniteEntityGrid.tsx`
- `components/shared/EntitySearchForm.tsx` (props: `basePath`, `placeholder`, `defaultValue`) · `EntitySortFilter.tsx` (props: `basePath`, `options`, `currentSort`)
- `lib/entity-utils.ts` (`getEntityIcon`) · `getClientsGA4Stats()` (يجمع GA4 + تفاعل DB)

**القاعدة:** كل الحلول التقنية اتثبتت في Tag + Category — تتكرر حرفياً في Industry بدون نقاش. **إلزامي:** `key={search|sort}` على `InfiniteEntityGrid` · `title.absolute` في `generateMetadata` · قراءة `getIndustriesPageSeo` (يحتاج إنشاء، نفس نمط `tags-page-seo.ts`) · `Promise.all` للـ query + GA4 (لا waterfall) · توكنز دلالية (لا ألوان حرفية) · **3 أعمدة** (Industry) لا 4.

---

## 3. التحقق من الـ Schema/الكود (حقائق مثبّتة، تم فحصها فعلياً)

| الكيان | مصدر معاينات الشركاء | الحالة الحالية للاستعلام | فجوة للوصول للهدف |
|--------|----------------------|---------------------------|---------------------|
| **Industry** | `Client.industryId` (علاقة مباشرة) | `getIndustriesWithCounts()` — يرجع `clientCount` فقط، بدون previews، بدون `take` ([industry-queries.ts](../../modonty/app/api/helpers/industry-queries.ts)) | يحتاج: batch query لمعاينات الشركاء (نفس نمط Category) + `skip`/`take` |
| **Category** | `Article.clientId` | `getCategoriesEnhanced()` **جاهزة فعلاً** — batch query، ACTIVE فقط، حد 3 previews + `clientCount`، بدون N+1 ([category-queries.ts:324-378](../../modonty/app/api/helpers/category-queries.ts#L324-L378)) | يحتاج فقط: `skip`/`take` (حالياً تجيب الكل بدون limit) |
| **Tag** | `ArticleTag → Article.clientId` (junction table) | `getTagsWithCounts()` — يرجع `articleCount` فقط، بدون previews، بدون `take` ([tag-queries.ts](../../modonty/app/api/helpers/tag-queries.ts)) | يحتاج: batch query لمعاينات الشركاء (نفس نمط Category عبر الـ junction) + `skip`/`take` |

**صفحات التفاصيل — تحقّق مباشر (لا فجوة فيها):**
- `/industries/[slug]` — `getIndustryBySlug()` يرجع كل عملاء ACTIVE بالفعل ✅
- `/categories/[slug]` — يعرض العملاء عبر المقالات ✅
- `/tags/[slug]` — **يعرض `<ClientCard>` grid كامل بالفعل** (شعار + GA4 + تقييمات) — لا فجوة، أي ملاحظة سابقة عن "فجوة تنفيذ" كانت خاطئة ✅

---

## 4. Page Layout — Hero + Toolbar + Grid (من المكب المعتمد)

```
┌────────────────────────────────────────────┐
│ Breadcrumb                                  │
├────────────────────────────────────────────┤
│ ① HERO (bg-zinc-950, dot-grid + glow)       │
│   badge pill · h1 · وصف · 3 إحصائيات        │
│   + mosaic preview (desktop only, lg:grid)  │
├────────────────────────────────────────────┤
│ ② TOOLBAR                                    │
│   بحث · فرز (select) · تبديل شبكة/قائمة      │
├────────────────────────────────────────────┤
│ ③ GRID — EntityCard × N                     │
│   (4 أعمدة Category/Tag · 3 أعمدة Industry)  │
│   + ④ Infinite Scroll sentinel               │
└────────────────────────────────────────────┘
```

الفرق الوحيد بين الكيانات: الأيقونة (`getEntityIcon`) ونص الـ badge (Industry يعرض "N شركة" بدل "رائج"). **لا يوجد شريط لون علوي (accent strip) على الكرت** — أُزيل بالكامل 2026-07-04 (راجع قسم 5)؛ الـ Hero وحده يحمل هوية اللون لكل كيان.

**⚠️ قاعدة الألوان — 3 ألوان براند فقط (لا اختراع):** مودونتي عنده 3 ألوان رسمية بس (`app/globals.css` — `--brand-navy #0E065A` · `--brand-blue #3030FF` · `--brand-teal #00D8D8`). **ممنوع أي لون خارج هذي الثلاثة** (كان فيه بنفسجي/purple مُخترع بالغلط في أول تنفيذ لصفحة Tags — تصحّح 2026-07-04). التوزيع المعتمد:
- **Category → أزرق** (`--brand-blue`)
- **Industry → تركواز** (`--brand-teal`)
- **Tag → كحلي** (`--brand-navy`) — اللون الثالث المتبقي؛ الأزرق يُستخدم كـ accent/glow ثانوي لأن الكحلي والأزرق من نفس عائلة "الألوان الغامقة" بالبراند (تباين الكحلي وحده ضعيف كنص على خلفية `bg-zinc-950` الغامقة)

---

## 5. EntityCard — التشريح (آخر تحديث 2026-07-04)

> **قرار خالد 2026-07-04:** الشريط اللوني العلوي (accent strip) كان hash-based عشوائي — **حُذف بالكامل**، لا يُعاد إضافته في Industry/Category.
> **قرار خالد 2026-07-04 (ثانٍ):** «الأثر الرقمي» (الـ Google block) **مخفي مؤقتاً** لحد ما الأرقام تكبر مع الـ organic — التفاصيل قسم 6 تحت.

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │  ① Badge رائج (start)             │  │  ← Image flush بحواف الكرت العلوية (rounded-t-2xl, 16:10)
│  │            ② Badge عدد (end)      │  │
│  │           ③ EntityPlaceholder SVG  │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  ④ Title (font-extrabold, clamp-2)     │
├─────────────────────────────────────────┤
│  ⑤ Avatar Group + N شريك (100% العرض)   │  ← Footer — الأثر الرقمي مخفي حالياً
└─────────────────────────────────────────┘
```

| العنصر | القيمة |
|--------|--------|
| Image | **flush بحواف الكرت العلوية** (لا padding/inset — `rounded-t-2xl` مباشرة) + `aspect-[16/10]` + `<EntityPlaceholder type={type}>` لو ما فيه `socialImage` (SVG مسطّح بألوان البراند — قسم 8) |
| Badge رائج | `top-2 start-2` — يظهر لو `recentArticleCount > 0` (آخر 7 أيام) |
| Badge عدد | `top-2 end-2` — يظهر دائماً (📄 للمقالات، 🏬 للشركات في Industry) |
| Title | `p-4` · `text-[15px] font-extrabold line-clamp-2` · **`text-card-foreground`** (توكن دلالي، لا `text-zinc-900` حرفي — dark mode) |
| Footer (شركاء، 100% العرض) | avatar `h-8 w-8 ring-2 ring-card -ms-2 overlap`، fallback = `bg-primary/10 text-primary` + أول حرف، حد 3 + `+N`، نص `{count} شريك` (`text-muted-foreground`)، أو `لا شركاء بعد` |
| ~~الأثر الرقمي~~ | **مخفي من الواجهة حالياً** — `digitalImpact` يبقى محسوب في طبقة البيانات (`EntityCardProps.digitalImpact`) بس ما يُعرض. راجع قسم 6 |

**قاعدة إلزامية (كل المراحل):** أي لون في الكرت يجب أن يكون توكن دلالي (`bg-card`/`text-card-foreground`/`border-border`/`bg-muted`/`text-muted-foreground`/`ring-card`) لا قيمة حرفية (`bg-white`/`text-zinc-*`/`border-zinc-*`) — يكسر dark mode. راجع `globals.css` للتوكنز المتاحة.

---

## 6. مصدر «الأثر الرقمي» — ✅ مُصحَّح: **GA4**، ليس GSC

> **⚠️ حالة العرض (2026-07-04):** الرقم **مخفي من EntityCard حالياً** بقرار خالد — الأرقام الحقيقية صغيرة (تحقّقت مباشرة: سقف مجموع كل العملاء ٨٬٦٥١، مو ٧٩٬٩٠٣ رقم الفوتر site-wide) وممكن تأثر بالمبيعات. **الحساب نفسه صحيح 100% ومُختبر** (راجع تحت) — بس ينتظر نمو organic قبل ما يُعرض. `digitalImpact` يبقى محسوب بالكامل في `getClientsGA4Stats`/`getTagsEnhanced`، فقط غير معروض بـ`EntityCard.tsx`.
>
> **تحسين إضافي مُطبَّق:** `getClientsGA4Stats()` صار يجمع GA4 + تفاعل DB الحقيقي لكل عميل (`viewsCount+likesCount+commentsCount+favoritesCount` من مقالاته المنشورة) — رقم واحد نهائي أشمل وأصح، بدون أي اختلاق (قاعدة خالد الثابتة).

### الخطأ السابق (تم تصحيحه 2026-07-04)
اقتُرح سابقاً تخزين `gscImpressions` + cron يومي من Google Search Console. **هذا خطأ:**
- GSC غير موجود في تطبيق modonty إطلاقاً (موجود في `admin/` فقط)
- يخالف نمط الكود القائم بالكامل (live fetch، لا cron في أي مكان بمودونتي)

### المصدر الصحيح — موجود ومُستخدم فعلاً
`modonty/lib/analytics/ga4.ts` — اتصال حي بـ **GA4 Data API** (service account، مش GSC)، مُستخدم فعلاً في:

| الاستخدام الحالي | الدالة | الآلية |
|------------------|--------|--------|
| فوتر الموقع | `getGa4FooterStats()` | إجمالي الموقع، cache دقيقة |
| **كرت العميل (list) — نفس الحاجة المطلوبة هنا** | `getClientsGA4Stats()` | يفلتر `pagePath` يبدأ بـ `/clients/{slug}` و`/articles/{slug}` (مربوطة بالعميل عبر DB) → يجمع `pageViews+sessions+activeUsers+events` = `total` | cache ساعة |
| هيرو صفحة العميل | `getClientDigitalImpact(slug)` | يعيد استخدام نفس الـ cache أعلاه، بدون استهلاك quota إضافي |

### ⚠️ تصحيح جوهري ثانٍ (2026-07-04) — التعريف الصحيح لـ«الأثر الرقمي» على كرت الكيان

**محاولة أولى خاطئة:** بناء `getEntityGA4Stats(entityPath)` يفلتر `pagePath BEGINS_WITH '/tags/'` (أو `/categories/`, `/industries/`) — أي **زيارات صفحة الكيان نفسها**. خالد صحّح: هذا غلط، رقم شبه صفري وبلا معنى. **حُذفت الدالة بالكامل** (dead code، صفر مراجع).

**التعريف الصحيح:** «الأثر الرقمي» لكيان (Category/Industry/Tag) = **مجموع** الأثر الرقمي (GA4 `total`) لكل عميل `ACTIVE` مرتبط بهذا الكيان — نفس الرقم المعروض على كرت العميل نفسه، مجمّع.

**التنفيذ (مُطبَّق في Tag، يتكرر حرفياً لـ Industry/Category):**
1. عند بناء batch query لمعاينات الشركاء (قسم 3)، اجمع **كل** الـ client slugs المرتبطة بكل عنصر (لا تكتفِ بالـ 3 المعروضين بالـ avatar)
2. استدعِ `getClientsGA4Stats()` الموجودة أصلاً (نفس الدالة اللي تغذّي كرت العميل) — مرة وحدة، بدون GA4 quota إضافي
3. لكل عنصر (تاق/فئة/صناعة): `digitalImpact = sum(clientGA4[slug]?.total ?? 0)` لكل الـ slugs المرتبطة فيه
4. أضف `digitalImpact: number` كحقل على نوع القائمة (`TagListItem`/`CategoryListItem`/`IndustryListItem`) — يُحسب داخل دالة الاستعلام نفسها، مو في الصفحة

**بدون حقل DB جديد، بدون cron، بدون استعلام GA4 منفصل للكيان** — إعادة استخدام كاملة لـ `getClientsGA4Stats()` الموجودة. العرض بنفس تصميم `HeroGoogleStat`/`FooterStats` (Google G + رقم + "الأثر الرقمي" + ✓).

---

## 7. Infinite Scroll — إلزامي على الثلاثة (قرار 2026-07-04)

**السبب:** الداتا (عدد الفئات/الصناعات/الوسوم) في نمو مستمر، والاستعلامات الحالية تجيب **كل** الصفوف بدون `take` — عيب موجود بالفعل بمعزل عن هذا القرار.

**النمط المُعتمَد للإعادة الاستخدام** — موجود ومُثبَت فعلاً في فيد المقالات:
- `modonty/components/feed/infiniteScroll/InfiniteArticleList.tsx` (Client Component) — IntersectionObserver sentinel + state (`posts`, `page`, `hasMore`, `loading`, `error`) + مزامنة الرابط (`?page=`)
- `modonty/app/actions/article-actions.ts` → `loadMoreArticles(page, ...)` (Server Action)

**القرار:** بدل تكرار نفس المكوّن 3 مرات، نبني **مكوّن واحد عام** `InfiniteEntityGrid` (Client Component) يستقبل:
```typescript
interface InfiniteEntityGridProps {
  initialItems: EntityCardProps[];
  loadMoreAction: (page: number) => Promise<{ items: EntityCardProps[]; hasMore: boolean }>;
  columns: 3 | 4; // Industry=3, Category/Tag=4
}
```
نفس فلسفة "pattern واحد" المطبّقة على الكرت تُطبّق هنا على آلية التمرير.

**🚨 قاعدة إلزامية (باگ اكتُشف وأُصلح في Tag 2026-07-04):** `InfiniteEntityGrid` يستخدم `useState(initialItems)` — و`useState` **ما يعيد التهيئة** لما الـ prop يتغيّر (مبدأ React). عند البحث/الفرز (تنقّل ناعم `router.push`)، السيرفر يعيد رندر بنتائج مفلترة جديدة، لكن المكوّن يبقى على الحالة القديمة → يعرض نتائج غير مفلترة. **الحل الإلزامي:** مرّر `key={`${search ?? ""}|${sortBy}`}` للمكوّن في الصفحة → يجبر remount عند تغيّر الفلتر. **كل من Industry/Category لازم يمرّر نفس الـ key.** (المكوّن الأصلي `InfiniteArticleList` كان يحل هذا بـ`useEffect` يصفّر الحالة — نحن نستخدم `key` بدلاً منه، أنظف).

**التبعية:** إضافة `skip`/`take` لكل من `getIndustriesWithCounts`, `getCategoriesEnhanced`, `getTagsWithCounts` — جزء من هذا العمل، مو خطوة منفصلة.

---

## 8. Props Interface

```typescript
interface EntityCardProps {
  type: 'category' | 'industry' | 'tag';
  name: string;
  slug: string;
  imageUrl?: string;
  articleCount: number;          // Category/Tag: عدد المقالات · Industry: عدد الشركات
  recentArticleCount?: number;   // لبادج "رائج" — Category/Tag فقط
  clientPreviews: { id: string; name: string; logoUrl?: string }[];
  clientCount: number;
  digitalImpact?: number;        // من GA4 — راجع قسم 6
  preload?: boolean;
}
```

---

## 9. خارج النطاق (Out of Scope)

- الصفحة الرئيسية (Homepage) — لا تتأثر بهذا العمل
- ترتيب Google الموضعي (position ranking) — لا يُعرض إطلاقاً، فقط "الأثر الرقمي" الإجمالي
- أي لون مبني على قيمة رقم (لا أخضر/أصفر/أحمر حسب الأداء)
- أي استخدام لـ GSC داخل تطبيق modonty

---

## 10. خطة الملفات — المرحلة 1 (Tag)

| الملف | الإجراء |
|-------|---------|
| `modonty/components/shared/EntityCard.tsx` | إنشاء — المكوّن الموحّد (Server Component) |
| `modonty/lib/entity-utils.ts` | إنشاء — تعميم `generateGradient`/`getIcon` من `category-utils.ts` |
| `modonty/components/shared/InfiniteEntityGrid.tsx` | إنشاء — wrapper عام (Client Component) |
| `modonty/app/api/helpers/tag-queries.ts` | تعديل — إضافة batch query لمعاينات الشركاء عبر `ArticleTag` junction (نفس نمط `getCategoriesEnhanced`) + `skip`/`take` |
| `modonty/lib/analytics/ga4.ts` | تعديل — إضافة دالة GA4 stats للكيانات (فلترة `pagePath`)، تُستخدم من الثلاثة |
| `modonty/app/actions/tag-actions.ts` | إنشاء — `loadMoreTags(page)` server action |
| `modonty/app/tags/page.tsx` | تعديل — يستبدل الـ pills بالكامل: Hero جديد + Toolbar + `InfiniteEntityGrid` |

**لا تغيير على `/tags/[slug]/page.tsx`** — صفحة التفاصيل تعرض `<ClientCard>` grid كامل بالفعل (تحقّق قسم 3).

**بعد اعتماد Tag ونجاحه:** نفس الخطوات بالضبط لـ Industry (المرحلة 2) ثم Category (المرحلة 3) — بدون إعادة نقاش على القرارات أعلاه.

---

*آخر تحديث: 2026-07-04*
