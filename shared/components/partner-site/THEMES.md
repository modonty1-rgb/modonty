# دليل ثيمات مواقع الشركاء — من الألف إلى الياء

> **المرجع الوحيد** لبناء أي ثيم لموقع شريك على مدونتي وتركيبه — لفريق مدونتي ولأي مطوّر خارجي (فريلانسر).
> آخر تحديث: ٤ أكتوبر ٢٠٢٦ · الثيمات: `free` «الأساسي» · `creative` «إبداعي» (المثال العملي لهذا الدليل).
> النموذج نفسه عند Shopify وسلة: **الثيم كود · محتوى الشريك بيانات · اختياراته قيم.**

---

## ٠. الخلاصة في خمسة أسطر

1. الثيم = مجلد في `shared/components/partner-site/<key>/` فيه `theme.ts` يصدّر كائناً واحداً من نوع `PartnerTheme`.
2. الثيم **يستقبل** بيانات الشريك جاهزة (`HomeData`) ويرسمها — لا يقرأ قاعدة البيانات ولا يكتب فيها، ولا يكتب سيو.
3. الثيم يحدّد: **الشكل** (متغيّرات CSS) · **أقسام كل صفحة** من العشر وترتيبها · **أشكال الهيدر والفوتر** · **الإعدادات** التي يختارها الشريك.
4. التسجيل سطر واحد في `theme/registry.ts`؛ الفحص الآلي `npx tsx scripts/check-themes.ts`؛ الفحص البصري بمهارة `modonty-uiux`.
5. البيع: صفّ في جدول `PartnerThemeCatalog` (الاسم · النوع · السعر). ثيم مدفوع لا يُعرض لشريك لم يشتره.

---

## ١. المفاهيم والقواعد الذهبية

| الطبقة | ما هي | أين | من يغيّرها |
|---|---|---|---|
| **البيانات** | كل ما يعرضه الموقع: الاسم، الخدمات، الصور، الآراء… | `free/home/home-data.ts` (`HomeData`)، يملؤه `shared/lib/partner-site/get-home-data.ts` | الشريك من الكونسول، والأدمن |
| **الثيم** | الأقسام، الهيدرات، الفوترات، الشكل، الترتيب | `shared/components/partner-site/<key>/` | مدونتي أو مطوّر معتمد (كود) |
| **القيم** | اختيارات الشريك: الثيم، اللون، شكل الهيدر/الفوتر، الأقسام المخفية لكل صفحة | جدول `ClientSite` | الشريك من «تصميم الموقع» |

**القواعد الذهبية — كسر واحدة = رفض الثيم:**
1. **الثيم لا يقرأ قاعدة البيانات ولا يكتب فيها.** كل ما يحتاجه في `HomeData`. يحتاج حقلاً جديداً؟ §١٢.
2. **السيو خارج الثيم.** `generateMetadata` و JSON-LD و canonical تكتبها صفحات مدونتي — تغيير الثيم لا يمسّها.
   لكن الثيم مسؤول عن: `h1` واحد يحمل اسم الشريك، تسلسل العناوين، و`alt` للصور.
3. **قسم بلا بيانات لا يظهر.** `isEmpty` صادقة لكل قسم — لا عنوان فوق صندوق فارغ، ولا زرّ بلا وجهة.
4. **المعاينة = الموقع.** الكونسول يرسم نفس مكوّناتك بـ`preview={true}`: الروابط خاملة، ولا إرسال نماذج.
5. **عربي أولاً، RTL أولاً، فصحى.** خط Tajawal الموجود · خصائص منطقية (`ps/pe/ms/me/start/end`) لا `left/right` · علامات «».
6. **أداء الزائر مقدَّس.** مكوّنات سيرفر افتراضياً؛ `"use client"` فقط لما يحتاج تفاعلاً، ويستقبل أقلّ props ممكنة (لا `HomeData` كاملة).

---

## ٢. البنية

```
shared/components/partner-site/
├── THEMES.md                 ← هذا الدليل
├── theme/                    ← طبقة الثيمات (لا تُعدَّل لإضافة ثيم إلا سطر في registry.ts)
│   ├── theme-contract.ts     PartnerTheme · PartnerPageKey · ThemeHeader/Footer · ThemeSetting
│   ├── theme-tokens.ts       ThemeTokens + themeTokensCss()
│   ├── registry.ts           THEMES · getTheme · resolvePartnerTheme · getThemePage/Header/Footer
│   └── index.ts
├── parts/                    ← قطع مشتركة لكل الثيمات (§٨)
├── free/                     ← الثيم الأول «الأساسي» — مصدر الأقسام التي تعيد الثيمات استعمالها
│   ├── theme.ts
│   ├── home/ about/ services/ gallery/ testimonials/ blog/ faq/ contact/ booking/ reels/
│   │                           ← كل مجلد: index.ts بقائمة أقسام صفحته + مكوّنات الأقسام
│   ├── header/ footer/        ← ٥ أشكال هيدر · ٤ أشكال فوتر
│   └── hero/ stats/ team/ trust/ video/ cta/ newsletter/ …
└── creative/                 ← الثيم الثاني «إبداعي»
    ├── theme.ts              يمدّ free ويغيّر الشكل والرئيسية والهيدر/الفوتر الافتراضيين
    ├── home.ts               ترتيب الرئيسية: الأرقام والخدمات قبل القصّة
    └── hero/split-hero.tsx   غلاف مقسوم؛ البانر العريض (> ١٫٨:١) يمتدّ تحت النص بلا قصّ
```

**من يقرأ الثيم (لا تعدّلها):**
- **مدونتي:** `modonty/app/(partner)/clients/[slug]/layout.tsx` (الهيدر والفوتر والشكل) و`components/page-blocks.tsx` (أقسام كل صفحة).
- **الكونسول:** `console/app/(preview)/site-preview/page.tsx` و`console/lib/my-site/page-blocks.ts`.
- كلّها تختار الثيم بـ`resolvePartnerTheme(site.themeKey)` — فالمعاينة = الموقع.

---

## ٣. عقد البيانات — `HomeData`

كل حقل قد يكون فارغاً. **صمّم لحالة الفراغ قبل حالة الامتلاء.**

| الحقل | النوع | ملاحظة للمصمّم |
|---|---|---|
| `clientId` · `name` | string | الاسم قد يطول (٥٠+ حرفاً، عربي وإنجليزي مختلط) — `text-balance` أو `truncate`، لا عرض ثابت |
| `isYmyl` | boolean | نشاط صحي/مالي: تنبيهات إضافية في النماذج |
| `primaryColor` | string \| null | لون الشريك — لا تستعمله مباشرة (§٧) |
| `whatsappHref` · `phone` | string \| null | بلا رقم = لا زرّ. في المعاينة `#whatsapp` (خامل) |
| `booking` | `{ mode: NONE\|FORM\|LINK, label, url }` | زرّ الطلب الذي اختاره الأدمن — استعمل `HeroActions` و`bookingLabel()` |
| `hero` | slogan · description · coverUrl · coverWidth/Height · logoUrl · industry · city · foundingYear | الغلاف قد يكون بانراً عريضاً فيه نصّ (لا تقصّه) أو صورة عادية أو لا شيء |
| `trust` | verified · credentials[] | الاعتمادات قد تكون ٠ |
| `about` | description · legalName | فقرات تفصلها سطور فارغة؛ قد تصل ٣٠٠٠+ حرف |
| `services` | `{ title, description, icon? }[]` | ٠–٢٠+ · الأيقونة بـ`serviceIcon(title, icon)` |
| `stats` | `{ value, label }[]` | القيمة قد تكون جملة لا رقماً |
| `testimonials` | `{ rating, comment, author }[]` | |
| `gallery` | `{ url, alt, width, height }[]` | النسب مختلفة جداً |
| `team` | `{ name, role, photoUrl }[]` | أغلبهم بلا صورة |
| `video` | `{ url, posterUrl, title, width?, height? }` \| null | قد يكون طولياً (جوال) |
| `faqs` | `{ question, answer }[]` | الإجابة قد تحوي سطوراً (`whitespace-pre-line`) |
| `posts` | `{ title, href, imageUrl, date, excerpt, category }[]` | مقال بلا صورة ممكن (`PostCover` يعالجه) |
| `reels` | `{ title, href, imageUrl }[]` | |
| `contact` | address · email · mapHref · mapEmbedSrc · hours[] | الساعات نصّ عربي جاهز («مغلق» لليوم المغلق) |
| `*Href` | blogHref · bookHref · reelsHref · servicesHref · reviewsHref · photosHref · faqHref | روابط الصفحات الداخلية لأزرار «عرض الكل» |

التواريخ تصل ميلادية جاهزة (`SITE_LOCALE_GREGORIAN`) — لا تنسّقها في الثيم.

---

## ٤. عقد الثيم — `PartnerTheme`

```ts
export const myTheme: PartnerTheme = {
  key: "my-theme",            // = اسم المجلد · إنجليزي صغير بشرطات · لا يتغيّر أبداً بعد النشر
  name: "اسم عربي",           // يظهر للشريك في الكتالوج
  description: "سطر واحد يبيع الثيم",
  version: "1.0.0",           // semver — ارفعه عند أي تغيير مرئي
  tier: "free",               // أو "premium" (لا يُعرض إلا لمن اشتراه)
  previewImage: "/themes/my-theme.png", // لقطة 1280×800 للكتالوج
  tokens: { radiusCard: "1rem", radiusControl: "0.75rem", sectionY: "3rem", sectionYDesktop: "5rem" },
  pages: { home, about, services, photos, reviews, articles, faq, contact, book, reels }, // العشر كلّها إلزامية
  headers: [...], footers: [...],
  defaultHeader: "classic", defaultFooter: "columns",
  settings: [...],            // ما يختاره الشريك — الكونسول يبني نموذجه منها
};
```

`settings` نوعان: `{ key, type: "color", label, default }` أو `{ key, type: "choice", label, default, options: [{ value, label }] }`.

**الطريقة الموصى بها:** امدد الثيم المجاني وغيّر ما يختلف فقط — كما في `creative/theme.ts`:

```ts
export const creativeTheme: PartnerTheme = {
  ...freeTheme,
  key: "creative", name: "إبداعي", version: "1.0.0", tier: "free",
  description: "غلاف مقسوم بصورة كبيرة، زوايا ناعمة، ومساحات أوسع — يبدأ بالأرقام والخدمات.",
  tokens: { radiusCard: "1.25rem", radiusControl: "0.875rem", sectionY: "3.5rem", sectionYDesktop: "6rem" },
  pages: { ...freeTheme.pages, home: CREATIVE_HOME_BLOCKS },
  defaultHeader: "pill", defaultFooter: "brand",
  settings: freeTheme.settings.map(/* الافتراضيان الجديدان */),
};
```

---

## ٥. كتابة قسم — `HomeBlock`

كل صفحة = قائمة أقسام بالترتيب:

```ts
{ key: "services", name: "خدماتنا", toggleable: true, isEmpty: (d) => d.services.length === 0, Component: ServicesGrid }
```

| الحقل | القاعدة |
|---|---|
| `key` | من `HomeBlockKey`: hero · trust · about · services · stats · testimonials · gallery · reels · team · video · faq · blog · contact · cta · newsletter · map · lead-form · booking. **لا تخترع مفتاحاً** — إخفاء الأقسام يُحفظ به (`page:key`) |
| `name` | الاسم العربي الذي يراه الشريك |
| `toggleable` | `false` فقط للغلاف والنداء الأخير |
| `isEmpty` | صادقة: `true` حين لا يكفي المحتوى لقسم يستحقّ الظهور |
| `Component` | `({ data, preview }) => JSX` |

**إعادة ترتيب أقسام الثيم المجاني** (من `creative/home.ts`):

```ts
const ORDER = ["hero", "stats", "services", "trust", "about", /* … */ "cta"] as const;
const byKey = new Map(HOME_BLOCKS.map((b) => [b.key, b]));
export const CREATIVE_HOME_BLOCKS = ORDER.map((key) => {
  const block = byKey.get(key);
  if (!block) throw new Error(`creative theme: home block «${key}» does not exist`);
  return key === "hero" ? { ...block, name: "الغلاف المقسوم", Component: SplitHero } : block;
});
```

**قالب مكوّن قسم جديد:**

```tsx
import { Section } from "../../free/home/parts/section";
import type { HomeData } from "../../free/home/home-data";

export function MyServices({ data }: { data: HomeData; preview?: boolean }) {
  return (
    <Section id="services" eyebrow="ماذا نقدّم" heading="خدماتنا" tone="muted">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.services.slice(0, 6).map((s) => (
          <li key={s.title} className="rounded-[var(--ps-radius-card,0.5rem)] bg-background p-6 ring-1 ring-border">…</li>
        ))}
      </ul>
    </Section>
  );
}
```

- `Section` يعطي الحاوية (١١٢٨px)، الحشوة من متغيّرات الثيم، نمط العنوان (h2)، وتناوب الخلفيات (`tone`) تلقائياً.
- `id` القسم = مفتاحه غالباً — روابط داخلية تعتمد `#contact` و`#about`.
- **إعادة الاستعمال أولاً:** خذ القسم من `free/` كما هو إن لم تغيّر شكله.

---

## ٦. الهيدر والفوتر

- `ThemeHeader = { key, name, tier, Component: ({ data: HeaderData, preview? }) => JSX }` — `free/header/header-data.ts`:
  name · tagline · logoUrl · homeHref · phone · email · whatsappHref · links[] · primaryColor · verified.
- `ThemeFooter = { key, name, tier, Component: ({ data: FooterData, preview? }) => JSX }` — `free/footer/footer-data.ts`:
  name · tagline · logoUrl · homeHref · phone · email · address · whatsappHref · services[] · pages[] · socialLinks[] · registrationNumber · year · primaryColor.
- استعمل أشكال `free` (`HEADER_TEMPLATES` · `FOOTER_TEMPLATES`) أو أضف شكلك بنفس العقد.
- **إلزامي في أي هيدر:** `<nav aria-label>` و`aria-current="page"` (`NavLinks`) · قائمة جوال (`MobileMenu`) · ٨ روابط بلا انكسار (`navFit`) · شعار لا يُقصّ (`BrandLogo`/`PartnerAvatar`).
- **تنبيه:** `ClientSite.headerTemplate/footerTemplate` لهما `@default` في السكيما، فكل صفّ يحمل قيمة. افتراضي ثيمك يصل فقط حين يختار الشريك ثيمك من المنتقي (الذي يعيد ضبط الاثنين — §١٣ البند ٤).

---

## ٧. الشكل والألوان

**متغيّرات الثيم** (المكوّنات تقرؤها بقيمة احتياطية = الثيم المجاني):

| المتغيّر | يتحكّم في | الأساسي | إبداعي |
|---|---|---|---|
| `--ps-radius-card` | الكروت والصور وصناديق الأقسام | `0.5rem` | `1.25rem` |
| `--ps-radius-control` | الأزرار والحقول والكبسولات | `9999px` | `0.875rem` |
| `--ps-section-y` | حشوة القسم على الجوال | `3rem` | `3.5rem` |
| `--ps-section-y-md` | نفسها من `md` | `4rem` | `6rem` |

- في الكود: `rounded-[var(--ps-radius-card,0.5rem)]` · `py-[var(--ps-section-y,3rem)] md:py-[var(--ps-section-y-md,4rem)]`. **لا** `rounded-lg` ولا `py-12` في قسم.
- دوائر الأيقونات والصور الشخصية تبقى `rounded-full` (شكل، لا ذوق ثيم).
- متغيّر جديد يضاف إلى `ThemeTokens` **فقط** حين يحتاج ثيم أن يختلف فيه فعلاً، وبقيمة احتياطية للمجاني.

**الألوان — لا ألوان مكتوبة يدوياً:**
- تعبئة بلون الشريك: `bg-primary` + `text-primary-foreground`.
- نصّ بلون الشريك: `text-[hsl(var(--primary-ink,var(--primary)))]` — `--primary-ink` يقرأ ≥ ٤٫٥:١ في الفاتح والداكن.
- غير ذلك من نظام التصميم: `foreground` · `muted-foreground` · `background` · `muted` · `border`.
- لون الشريك ليس متغيّر ثيم — هو قيمته (`primaryColor`).
- **الوضع الليلي إلزامي:** كل نصّ ≥ ٤٫٥:١.

---

## ٨. القطع المشتركة — استعملها ولا تكرّرها

| القطعة | المسار | لماذا |
|---|---|---|
| `Section` | `free/home/parts/section.tsx` | الحاوية والعنوان والإيقاع |
| `SiteLink` | `parts/site-link.tsx` | رابط داخلي بلا إعادة تحميل؛ الخارجي و`#` و`tel:` يبقى `<a>` |
| `PageFrame` · `PARTNER_PAGE_TITLE_PREFIX` | `parts/page-frame.tsx` | عنوان الصفحات الداخلية ومسارها |
| `HeroActions` | `free/hero/parts/hero-actions.tsx` | أزرار الغلاف: زرّ الأدمن أولاً ثم واتساب (أو اتصال) — زرّان لا ثلاثة |
| `bookingLabel` | `free/booking/booking-label.ts` | نصّ زرّ الطلب |
| `WhatsAppButton` | `parts/whatsapp-button.tsx` | خامل في المعاينة، غائب بلا رقم |
| `BrandLogo` · `PartnerAvatar` | `parts/brand-logo.tsx` · `shared/components/partner-avatar/` | الشعار بلا قصّ |
| `VerifiedBadge` | `parts/verified-badge.tsx` | شارة «موثَّق» — فقط حين `verified` |
| `OptimizedImage` + `asMedia` | `shared/components/optimized-image.tsx` | كل صورة، مع `sizes` صحيح |
| `ViewAllLink` | `free/home/parts/view-all-link.tsx` | «عرض الكل» حين يُقصّ القسم |
| `PostCover` | `free/blog/parts/post-cover.tsx` | غلاف مقال (أو شعار الشريك بلا صورة) |
| `serviceIcon` | `free/services/parts/service-icon.tsx` | أيقونة الخدمة |
| `Stars` | `free/testimonials/parts/stars.tsx` | نجوم يقرؤها قارئ الشاشة |
| `NavLinks` · `MobileMenu` · `navFit` | `free/header/parts/` | قائمة الهيدر والجوال |

---

## ٩. بناء ثيم من الألف إلى الياء

1. **الفكرة قبل الكود:** سطران — لمن الثيم (عيادة؟ متجر؟ مكتب خدمات؟) وما يميّزه بصرياً عن الموجود. تُعتمد من فريق مدونتي.
2. **المجلد:** `shared/components/partner-site/<key>/` — `key` إنجليزي صغير، فريد، لا يتغيّر.
3. **ما يختلف فقط:** مكوّناتك الجديدة داخل مجلدك (`hero/`، `home.ts`…)، وما لا تغيّره تستورده من `free/`.
4. **`theme.ts`:** امدد `freeTheme` (§٤) وغيّر `tokens` و`pages` و`defaultHeader/Footer` و`settings`.
5. **التسجيل:** سطر في `theme/registry.ts` داخل `THEMES`.
6. **الفحص الآلي:**
   ```bash
   cd shared && npx tsx scripts/check-themes.ts
   # ✓ 3 theme(s) OK: free@1.0.0 (10 pages, 5 headers, 4 footers) · creative@1.0.0 (…) · my-theme@1.0.0 (…)
   ```
   يرفض: مفتاح مكرّر · مجلد ناقص · صفحة ناقصة · قسم بلا `isEmpty` أو مكرّر · افتراضي هيدر/فوتر غير موجود · إعداد افتراضيه خارج خياراته · متغيّر فارغ · نسخة ليست x.y.z.
7. **جرّبه على الشريك التجريبي** (`modonty_dev` فقط — لا بيانات عميل حقيقي):
   - الشريك: «تجريبي — عيادة النخبة لطب الأسنان» (slug `تجريبي-عيادة-النخبة`)، كامل البيانات. يُنشأ بـ`scratch/dev-create-test-partner.ts`.
   - اضبط ثيمه بنسخة من `scratch/dev-assign-creative-theme.ts` (غيّر `"creative"` إلى مفتاحك)، والسكربت يرفض العمل خارج `modonty_dev`.
   - افتح `http://localhost:3000/clients/تجريبي-عيادة-النخبة` والصفحات التسع الأخرى.
8. **الفحص البصري والرقمي:** §١٠.
9. **صفّ الكتالوج:** `PartnerThemeCatalog` (key = اسم المجلد) — بلا صفّ لا يظهر في المنتقي. على dev: `scratch/dev-seed-theme-catalog.ts`.
10. **التسليم:** §١١.

---

## ١٠. معايير القبول — قبل أن يُدمج أي ثيم

**بالأرقام** — `.claude/skills/modonty-uiux/scripts/audit-page.js` (طريقة تشغيله في المهارة §٥)، على الصفحات العشر عند **٣٦٠ · ٣٩٠ · ١٢٨٠**:

| المعيار | المطلوب |
|---|---|
| تمرير جانبي | ٠ |
| نصّ على الجوال | ≥ ١٤px (١٢ للبيانات الثانوية فقط) |
| أهداف اللمس على الجوال | ≥ ٤٤px (الروابط داخل جملة مستثناة — WCAG 2.5.8) |
| `h1` | واحد في كل صفحة، ويحمل اسم الشريك |
| تسلسل العناوين | بلا قفز (h1 ← h2 ← h3) |
| الصور | لكلٍّ `alt` أو زخرفية صراحةً · الملف ≤ ٢٫٥× عرضه المعروض |
| كلمة يتيمة في عنوان | ٠ |
| التباين في الفاتح والداكن | كل نصّ ≥ ٤٫٥:١ |

**بالعين** (لقطة كاملة لكل صفحة على ١٢٨٠ و٣٩٠): شريك ممتلئ وشريك شبه فارغ · اسم طويل · غلاف بانر عريض وغلاف صورة وبلا غلاف · فيديو طولي · بلا واتساب · زرّ الطلب بأنواعه الثلاثة (FORM · LINK · NONE).

**بالسلوك:** معاينة الكونسول (`localhost:3002/site-preview?p=<page>`) تطابق الموقع · الروابط حيّة على الموقع وخاملة في المعاينة · الحركة داخل `motion-safe:`.

**بالكود:** `tsc` نظيف في `modonty` و`console` · لا `"use client"` بلا حاجة · لا اعتماديات npm جديدة.

---

## ١١. للمطوّر الخارجي (الفريلانسر) — الحدود والتسليم

**مسموح:**
- إنشاء مجلد ثيمك وكل ما بداخله.
- سطر واحد في `theme/registry.ts`.
- صورة المعاينة للكتالوج.

**ممنوع** (يحتاج طلباً لفريق مدونتي — §١٢):
- تعديل أي ملف في `free/` أو `parts/` أو `theme/` (غير سطر التسجيل) — يستعملها كل الشركاء الحاليين.
- تعديل `HomeData` أو أي شيء في `modonty/` أو `console/` أو `admin/` أو قاعدة البيانات.
- مكتبة npm جديدة، أو خطوط جديدة، أو CSS عام.
- أي بيانات عميل حقيقي — الاختبار على الشريك التجريبي فقط.

**التسليم:** فرع git باسم `theme/<key>` + طلب دمج يحوي:
- لقطات الصفحات العشر (١٢٨٠ و٣٩٠، فاتح وداكن).
- ناتج `check-themes.ts`.
- جدول §١٠ بالأرقام.
- سطر الوصف والسعر المقترح.

**المراجعة:** فريق مدونتي يعيد الفحص كاملاً، ثم يدمج ويضيف صفّ الكتالوج. لا يصل ثيم لشريك قبل ذلك.

---

## ١٢. تحتاج شيئاً غير موجود؟

| تحتاج | الطريق |
|---|---|
| حقل بيانات جديد (مثلاً «سنوات الخبرة») | طلب لفريق مدونتي: يُضاف للسكيما والكونسول و`HomeData` — لكل الثيمات |
| مفتاح قسم جديد | يضاف إلى `HomeBlockKey` في `free/home/index.ts` بموافقة (يُحفظ في إخفاء الأقسام) |
| متغيّر شكل جديد | يضاف إلى `ThemeTokens` بقيمة احتياطية للمجاني |
| إعداد جديد للشريك | يُعرَّف في `settings` ثيمك؛ تخزين قيمته يحتاج حقلاً (طلب) |

---

## ١٣. الكتالوج والبيع

**المنفَّذ (٤ أكتوبر ٢٠٢٦):**
- السكيما (`shared/prisma/schema/schema.prisma`): `ClientSite.themeKey String?` (فارغ = free) و`model PartnerThemeCatalog`
  (key فريد = اسم المجلد · name · description · previewImage · tier `FREE|PREMIUM` · price · version · isActive · sortOrder) و`enum ThemeTier`.
  الكود هو الثيم، والصفّ هو التجارة.
- `resolvePartnerTheme(themeKey, { ownsPremium })` — **الطريقة الوحيدة** لاختيار ثيم الشريك. PREMIUM بلا استحقاق ← free؛
  ولا نموذج شراء بعد، فمفتاح بريميوم خُزّن خطأً لا يعطي ثيماً مجاناً.
- على `modonty_dev`: صفّا الكتالوج `free` و`creative`، والشريك التجريبي على `creative`، وفهرس
  `client_sites_subdomain_partial_unique` صُحّح (كان عادياً فمنع شريكاً ثانياً بلا نطاق فرعي من الحفظ).

**الباقي قبل بيع أول ثيم:**
1. `prisma db push` على dev ثم الإنتاج — ينشئ الفهرس الفريد على `partner_theme_catalog.key` (يُشغَّل بيد خالد).
2. صفّ كتالوج `free` على الإنتاج (بموافقة).
3. نموذج الشراء ← يُمرَّر كـ`ownsPremium` (عبر منظومة الفوترة الحالية — مصدر واحد للمال).
4. منتقي الثيم في «تصميم الموقع»: كروت الكتالوج · حفظ `themeKey` · إعادة ضبط الهيدر/الفوتر لافتراضي الثيم · نموذج إعدادات مولَّد من `theme.settings`.
5. شاشة أدمن للكتالوج (اسم · سعر · تفعيل).

---

## ١٤. ممنوعات

- HTML أو CSS في قاعدة البيانات.
- السحب والإفلات للشريك (الشريك غير تقني — الترتيب من الثيم).
- ثيم يقرأ القاعدة، أو يكتب ميتا/JSON-LD.
- رابط ميت · زرّ بلا وجهة · قسم بعنوان وبلا بيانات · وعد لا يتحقّق («نردّ خلال دقيقة»).
- إيموجي في الواجهة — الأيقونات من `shared/lib/icons.ts` أو lucide.
- لهجة عامية في نصوص موقع الشريك.

---

## ١٥. أخطاء وقعت — لا تعدها

| الخطأ | ما حدث | الصحيح |
|---|---|---|
| نصّ أبيض على زرّ أبيض | زرّ النداء الأخير ظهر فارغاً | لون نصّ صريح لكل زرّ على خلفية ملوّنة |
| `inline-block` لاسم طويل | الفوتر سحب الصفحة ٨٥px جانبياً | `flex w-fit max-w-full` + `truncate` |
| ٨ روابط في صفّ واحد | الكلمات انكسرت على ١٢٨٠ | `navFit` — صفّ ثانٍ أو قائمة جوال |
| `object-cover` لشعار أو بانر | قُصّ اسم الشريك من صورته | `object-contain` للشعار والبانر العريض |
| `dateStyle` مع `ar-SA` | تاريخ هجري مبهم | التواريخ تصل جاهزة من `HomeData` |
| مكوّن عميل يستقبل `HomeData` | كل بيانات الصفحة شُحنت للمتصفّح | مكوّن سيرفر يمرّر حقلين أو ثلاثة فقط |
| إيقاع مكتوب داخل القسم | ثيم لا يستطيع تغيير المساحات | `Section` ومتغيّرات `--ps-section-y` |
