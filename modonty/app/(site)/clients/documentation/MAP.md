# خريطة `/clients` — دليل الشركاء

آخر تحديث: ١٦ أغسطس ٢٠٢٦ · الفرع `modonty-ui` · بُنيت على موكب اعتُمد ١٦ أغسطس
(اعتمده خالد: «اعتمد التصميم هذا») بهيكل الرئيسية نفسه.

## الشكل

ثلاثة أعمدة بنفس مقاسات الرئيسية — ٣٠٠ · ٦٠٠ · ٣٠٠ داخل `max-w-[1128px]`:

| العمود | يظهر من | ما فيه |
|---|---|---|
| اليمين (أوّل في الـDOM) | `min-[1240px]` | بطاقة «شركاء موثوقون» (١٩٠ب) · قائمة تصفية المجالات · «الطلّات» · «استمع» |
| الوسط | دائماً | شريط البحث · `<h1>` + العدّاد · بطاقات الشركاء · روابط الصفحات |
| اليسار (آخر في الـDOM) | `lg` | بطاقة الحساب (تُمرَّر من `page.tsx`) · «احجز» · «تسوّق» · «صِر شريكاً» |

## الملفات

```
app/clients/
  page.tsx                      ميتاداتا + JSON-LD + فتات الخبز + تمرير بطاقة الحساب
  loading.tsx                   هيكل عظمي بنفس الأعمدة والارتفاعات
  error.tsx                     (كما كان)
  TASK.md                       المفتوح على هذه الصفحة
  api/                          فارغ — لا نقطة نهاية لهذه الصفحة (.gitkeep)
  data/
    get-clients-list.ts         الاستعلام الوحيد للصفحة — `"use cache"` + `cacheTag("clients")`
  helpers/
    parse-partners-query.ts     يقرأ الرابط إلى شكل موثوق (q · industry · page)
    build-partners-href.ts      يبني الرابط التالي مع الحفاظ على بقية الشروط
    filter-partners.ts          تصفية بالمجال + البحث الحرّ
    sort-partners.ts            ترتيب واحد ثابت: المميّز، ثم الأكثر مقالات، ثم الاسم
    count-industries.ts         صفوف قائمة التصفية وأعدادها
    format-arabic-count.ts      «مقال واحد» · «مقالان» · «٥ مقالات» · «١٢ مقالاً»
  components/
    page-layout/PageLayout.tsx  القشرة: يصفّي ويرتّب ثم يوزّع على الأعمدة
    right-sidebar/RightSidebar.tsx
    left-sidebar/LeftSidebar.tsx
    trust-card/TrustCard.tsx
    industries-filter/IndustriesFilter.tsx
    partners-bar/PartnersBar.tsx
    partners-list/PartnersList.tsx
    partner-card/PartnerCard.tsx
    partner-invite-card/PartnerInviteCard.tsx
```

## من خارج الصفحة

| المصدر | الاستخدام |
|---|---|
| `@/components/shared/sticky-rail/StickyRail` | الرِيلان — رُقّي من الرئيسية ١٦ أغسطس |
| `@/components/shared/user-card/UserCard` | بطاقة الحساب — رُقّيت من الرئيسية |
| `@/components/shared/commerce-actions/CommerceActions` | «احجز» و«تسوّق» — رُقّيت من الرئيسية |
| `@/components/shared/link-card/LinkCard` | «الطلّات» · «استمع» |
| `@/components/cta/cta-tracked-link` | زرّ الشريك الخارجي + بطاقة «صِر شريكاً» (تسجيل نقرات) |
| `@/lib/seo/get-listing-page-seo` | ميتاداتا الصفحة من إعدادات الأدمن |

## قواعد ثبّتها البناء

- **الرابط هو الحالة كلّها.** البحث والتصفية والصفحة في الـURL — لا حالة في المتصفّح، فالنتيجة
  قابلة للمشاركة وتصمد بعد الريفرش، والصفحة لا تشحن جافاسكربت لأيّ منها (نموذج `GET` وروابط).
- **لا شريحة ترتيب** (خالد، ١٦ أغسطس): ترتيب واحد ثابت — المميّز، ثم الأكثر مقالات، ثم الاسم.
- **استعلام واحد.** كل شيء — البطاقات وأعداد المجالات والعدّاد — من `getClientsList()` المخزَّن.
  أعداد المجالات تُحسب من نفس القائمة، فيستحيل أن يخالف الرقم ما يظهر عند الضغط.
- **الكانونيكال ثابت** `/clients` مهما كانت الشروط — العرض المصفَّى هو الدليل نفسه لا صفحة جديدة.
- **المميّز يتقدّم في كل ترتيب**، وعلامته لون الإطار وكلمة واحدة — لا بطاقة أكبر تزيح الباقين.
