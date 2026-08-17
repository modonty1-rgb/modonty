# مفتوح على `/industries` و`/industries/[slug]`

خالد صحّح الاتجاه مرّتين (١٦ أغسطس): الأعمدة الثلاثة تبدأ من `/industries` نفسها —
«هذه الصفحة الرئيسية التي يكون فيها التقسيم» — لا من صفحة مجال واحد بعدها. البناء الأول
كان على `/industries/[slug]` فقط ونُقل بعدها إلى القاعدة المشتركة `app/industries/{data,components}/`
حتى تخدم الصفحتين معاً (`/industries` بلا فلترة، `/industries/[slug]` مفلترة على مجال واحد).

## قرارات تنتظر خالد

- **`components/client/client-card.tsx` (الكرت القديم) لسّه يخدم صفحتين لم تُلمسا:**
  `categories/[slug]` و`tags/[slug]`. لم يُحذف.
- **الرِيلان يختفيان تحت `lg`/`1240px`** — نفس سلوك `/clients`، الجوّال بلا قائمة مجالات
  ولا رايل شركاء. يُعالَج في مرحلة الجوّال.
- **مكوّنات القائمة القديمة صارت بلا مستهلك من `/industries`:** `components/listing/{ListingHero,
  EntitySearchForm, EntitySortFilter, InfiniteEntityGrid}` — لم تُحذف، لأنها لسّه تخدم
  `categories/page.tsx` و`tags/page.tsx`. لا تُلمس إلا لو صار قرار توحيد تلك الصفحتين أيضاً.
- **`app/industries/actions.ts` (`loadMoreIndustries`) صار بلا مستدعٍ** — كان يغذّي
  `InfiniteEntityGrid` في القائمة القديمة. لم يُحذف.

## 🔖 مؤجَّل — بعد اكتمال الريفاكتور (نفس دفعة `/clients`)

مقيسة بنفس منطق `.claude/skills/seo-listing-pages/`، غير منفَّذة عمداً:

| # | ما هو | القاعدة |
|---|---|---|
| ١ | كانونيكال واحد لكل صفحات `?page=n` على `/industries` (الصفحة ١ فقط) | «give each page its own canonical URL» |
| ٢ | `?page=n` بلا قيود زحف في `robots.ts` | نفس البند المؤجَّل في `/clients` |

## ملاحظات بناء

- `app/industries/data/get-industry-feed.ts` — `getIndustryFeed(industryId?)`: بلا معامل
  يرجّع فيد كل المجالات مجتمعة (`/industries`)، ومع معامل يرجّع فيد مجال واحد
  (`/industries/[slug]`). استعلام واحد يخدم الحالتين.
- `PartnersRail` تقدّم الشركاء المميّزين أولاً قبل القصّ على ٦ — بلا هذا الترتيب، شريك
  مميّز قد يسقط من رايل ٣٠ شريكاً بسبب الترتيب الأبجدي وحده.
- فيد المقالات لا يستورد من `(homepage)/data/home-feed-shapes.ts` عمداً — ذاك الملف
  موسوم «لا يقرأه غير ملفَّي الرئيسية». تكرار صغير للمحوّل (Article → FeedPost)، مرشَّح
  للترقية المشتركة لاحقاً لو ظهر مستهلك ثالث.
