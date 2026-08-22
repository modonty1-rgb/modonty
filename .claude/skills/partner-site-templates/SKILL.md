---
name: partner-site-templates
description: |
  How partner sites on modonty get TEMPLATES (themes) the way Shopify, Salla, Wix and
  WordPress do it — template = code + a settings SCHEMA · the partner stores only VALUES
  and CHOICES in the DB · a catalog table makes free/premium templates a business, not a
  rewrite. Use whenever touching: partner site templates/themes, the console «موقعي»
  screen, PageTemplate / Client.templateId / themeSettings, template previews, premium
  templates, section toggles, or the modonty partner-site renderer under
  app/(partner)/clients/[slug]. Triggers in Arabic: «قوالب» · «ثيم» · «قالب بريميوم» ·
  «موقعي» في الكونسول · «Site Builder» · «مفاتيح الأقسام». Decided with Khalid 2026-08-17.
---

# قوالب مواقع الشركاء — كيف تشتغل المنصّات الكبيرة، وكيف نبنيها على مدونتي

> **الأصل:** خالد (١٧ أغسطس ٢٠٢٦): «نفكّر بمنطق Site Builder … بكرة نعمل قوالب بريميوم زي
> الشركات الكبيرة، أبغى أبني الأساس من الآن». وقبلها: «نبدأ من الكونسول» · «الأداء همّه مدونتي
> (الزائر) فقط» · «التصميم يخدم كل الفئات، لا دكتور فقط» · «النظام ذكي مع نقص البيانات».

---

## ١. النموذج المشترك عند الكبار (من التوثيق الرسمي)

الأربعة كلهم يفصلون **ثلاث طبقات** — وهذا هو الأساس اللي نبني عليه:

| الطبقة | Shopify | Salla (Twilight) | Wix Studio | WordPress (block themes) |
|---|---|---|---|---|
| **القالب = كود** | ملفات Liquid: `layout` · `templates` · `sections` · `blocks` · `snippets` | مكوّنات القالب + `twilight.json` | تصميم في محرّر الاستوديو | ملفات القالب + `theme.json` |
| **السكيما = ماذا يقدر التاجر يغيّر** | `settings_schema.json` (خيارات عامّة: خطوط · ألوان) + `schema` داخل كل section/block | `settings` + `features` + `components[].fields` (`id · type · format · required`) | لوحة Site Styles (ألوان · خطوط · عرض) + مكتبة أقسام | `theme.json` يعرّف الأنماط والإعدادات |
| **القيم = ما اختاره التاجر** | `settings_data.json` → كائن `current` + `presets` · قوالب JSON للصفحات (`templates/*.json`) تحدّد الأقسام وترتيبها | القيم تُدخل من لوحة التاجر وتتغلّب على افتراضيات المطوّر | يُحفظ في الموقع نفسه | تُحفظ في القاعدة (`wp_global_styles`) وتتغلّب على `theme.json` |

**نصوص مفتاحية (Shopify):**
- «A theme controls the organization, features, and style of a merchant's online store.»
- «JSON templates function as wrappers for sections» — الصفحة = قائمة أقسام مرتّبة، لا HTML.
- `settings_data.json`: `current` = «all of the setting values that are currently saved in the theme editor»؛ و`presets` = تصاميم بديلة «each object is in the same format as current». عند اختيار preset: «only values from presentational settings are updated» — الألوان والخطوط والمفاتيح تتبدّل، **ومحتوى التاجر لا يُمسّ**.

**نصوص مفتاحية (Salla):**
- `twilight.json` في جذر القالب يحمل: معلومات المالك والإصدار · `settings` (قيم عامّة) · `features` (مكوّنات جاهزة مسبقاً مثل `component-featured-products`) · `components` (مكوّنات يبنيها المطوّر لصفحة البداية) بحقول `fields[]` لكل منها.
- بوّابة الشركاء تدير «basic information, screenshots, settings, features, custom components, and **price**» — يعني **الكتالوج والسعر بيانات، والقالب كود**.

**Wix Studio:** الأقسام «building blocks of every page»؛ Site Styles = مكان واحد للخطوط والألوان؛ سوق القوالب يبيع قوالب الاستوديو (نطاق ٢٩–٨٠ دولاراً للقالب في السوق).

**الخلاصة الصناعية:** لا أحد يخزّن CSS أو HTML للتاجر في القاعدة. المخزَّن: (١) **أي قالب** (٢) **قيم إعدادات** يعرّفها القالب (٣) **ترتيب/تشغيل الأقسام**. والكتالوج جدول فيه السعر والإصدار والمعاينة.

---

## ٢. النموذج على مدونتي (يُطبَّق كما هو)

### ٢.١ ثلاث طبقات

```
كود مدونتي            app/(partner)/clients/[slug]/templates/<key>/   ← القالب: مكوّنات سيرفر
                       + template.schema.ts                          ← السكيما: الحقول التي يقدر الشريك يغيّرها
القاعدة (Prisma)       PageTemplate  (الكتالوج: key · اسم · وصف · معاينة · tier · price · version · isActive)
                       Client.templateId · Client.themeSettings (Json قيم) · Client.sections (Json ترتيب+تشغيل)
الكونسول «موقعي»       يختار القالب · يقلب المفاتيح · يملأ الإعدادات · يعاين بنفس المكوّنات · يحفظ → revalidateTag("clients")
```

### ٢.٢ السكيما المقترحة (Prisma)

```prisma
enum PageTemplateTier { FREE PREMIUM }

model PageTemplate {
  id           String  @id @default(auto()) @map("_id") @db.ObjectId
  key          String  @unique   // يطابق مجلّد المكوّن: "storefront" | "office" | ...
  name         String            // «المتجر»
  description  String?
  previewImage String?           // لقطة للكتالوج
  tier         PageTemplateTier @default(FREE)
  price        Float?            // للبريميوم — بعملة الفوترة الحالية
  version      String  @default("1.0.0")
  isActive     Boolean @default(true)
  sortOrder    Int     @default(0)
  features     String[]          // نقاط تسويقية تُعرض في الكونسول
  clients      Client[]
}

// على Client
templateId    String?  @db.ObjectId
template      PageTemplate? @relation(fields: [templateId], references: [id])
themeSettings Json?    // القيم: { primaryColor?, heroVariant?, ... } — مفاتيحها من template.schema.ts
sections      Json?    // { about:true, services:true, ... } — التشغيل فقط؛ الترتيب من القالب
```

**قواعد السكيما:** حقل جديد على مجموعة قائمة = تعبئة إلزامية (`project_prisma_push_backfill_rule`): الموجودون → القالب المجاني الافتراضي، `sections` = الترتيب الافتراضي كله مفعَّل. قتل السيرفرات قبل `prisma generate`.

### ٢.٣ عقد القالب في الكود

```ts
// templates/registry.ts — الحَكَم الوحيد
export const TEMPLATES = {
  storefront: { component: StorefrontTemplate, schema: storefrontSchema, defaultSections: [...] },
  office:     { component: OfficeTemplate,     schema: officeSchema,     defaultSections: [...] },
} as const;
export const DEFAULT_TEMPLATE_KEY = "storefront";

// template.schema.ts — نفس فكرة settings_schema.json / twilight fields
export const storefrontSchema = {
  primaryColor: { type: "color", label: "اللون الأساسي", default: null },   // null = لون مدونتي
  heroVariant:  { type: "select", options: ["cover-band", "cover-bleed"], default: "cover-band" },
} as const;
```

- **الرندر:** `getPartnerSite()` يجيب البيانات + `template.key` + `themeSettings` + `sections` → `TEMPLATES[key] ?? TEMPLATES[DEFAULT]` → المكوّن يرسم الأقسام المفعَّلة بترتيبها، ويُسقط أي قسم بياناته فاضية ولو كان مفعَّلاً.
- **الاحتياط:** قالب محذوف/موقوف/بريميوم انتهى استحقاقه → الافتراضي المجاني، بلا كسر.
- **السيو خارج القالب:** `generateMetadata` · JSON-LD · canonical · h1 لا تقرأ القالب أبداً. اختبار قبول: `curl | grep ld+json` متطابق لأي قالب.
- **اللون:** قيمة واحدة (`primaryColor`) تصير متغيّر CSS على حاوية الموقع بعد فحص تباين؛ الباقي من نظام مدونتي (`DESIGN-SYSTEM.md`).

### ٢.٤ شاشة «موقعي» في الكونسول (نبدأ منها — قرار خالد)

1. **القالب:** بطاقات من `PageTemplate` (معاينة · اسم · وصف · شارة FREE/PREMIUM · سعر) — البريميوم مقفول بزرّ شراء يربط بنظام الباقات.
2. **الأقسام:** قائمة الأقسام المتاحة في القالب بمفاتيح تشغيل فقط (الترتيب من القالب — لا سحب)؛ بجانب كل قسم **حالة بياناته** («ناقص: فيديو تعريفي — يرفع الثقة» · «جاهز»). نسبة اكتمال إجمالية.
3. **الإعدادات:** نموذج يُولَّد من `schema` القالب (لون · متغيّرات) — لا حقول مكتوبة يدوياً لكل قالب.
4. **المعاينة:** تستورد **نفس مكوّنات القالب** من مدونتي بنفس البيانات — لا نسخة ثانية (قاعدة خالد).
5. **الحفظ:** `revalidateTag("clients")` — الموقع يتغيّر خلال ثوانٍ.
6. الكونسول = Track A (وضوح ووظيفة، لا قيود أداء).

### ٢.٥ البريميوم بعد سنة — بلا تغيير سكيما

- الأدمن يضيف صفّاً في `PageTemplate` (اسم · سعر · معاينة · `PREMIUM` · `isActive`) + مجلّد قالب جديد بنفس `key`.
- الاستحقاق: `Client.templateId` يُسمح به فقط لو `tier=FREE` أو الشريك دفع (سجلّ شراء/باقة) — يُفحص عند الحفظ وعند الرندر (وإلا → الافتراضي).
- الإصدارات: `version` على الكتالوج؛ تحديث القالب لا يلمس `themeSettings` — لو أضاف القالب حقلاً جديداً يأخذ الافتراضي من السكيما (نفس مبدأ Shopify: presets تغيّر «presentational» فقط ومحتوى التاجر ثابت).

---

## ٣. قواعد لا تُكسر

- **لا HTML ولا CSS في القاعدة** — قرارات وقيم فقط.
- **قالب واحد يخدم كل المجالات:** عناوين وأقسام محايدة («تعرّف عليه» · «ماذا يقدّم» · «قالوا عنه»…)؛ الفرق من بيانات الشريك ولونه.
- **ذكي مع النقص:** كل قسم يختفي أو يتكيّف بلا فراغ؛ القائمة والفوتر من نفس مصدر الأقسام.
- **الأداء لمدونتي فقط:** مكوّنات القالب سيرفر، الجافاسكربت في أضيق حدّ؛ الكونسول والأدمن بلا قيود.
- **مصدر الحقيقة = الكونسول** — الشريك يملك محتواه وقراراته؛ مدونتي تقرأ وترسم.
- **الشريك ليس تقنياً (خالد، ١٧ أغسطس):** كل شيء يشتغل بالافتراضي من أوّل ثانية؛ قالب بضغطة · مفتاح تشغيل/إيقاف لا سحب وترتيب (الترتيب من القالب) · لوحة ألوان جاهزة مفحوصة التباين لا حقل هيكس · معاينة بضغطة · «انشر» بضغطة · لغة عادية بلا مصطلحات. أي خيار لا يخدم غير التقني يُحذف.
- **الأسماء بسيطة وتقول نطاقها** (`PageTemplate` · `templateId` · `themeSettings` · `sections`).

---

## ٤. المصادر الرسمية (اقرأها قبل تعديل النموذج)

- Shopify — Theme architecture: https://shopify.dev/docs/storefronts/themes/architecture
- Shopify — `settings_data.json` (current · presets): https://shopify.dev/docs/storefronts/themes/architecture/config/settings-data-json
- Salla — Twilight `twilight.json`: https://docs.salla.dev/421921m0 · Setup themes: https://docs.salla.dev/421879m0 · Develop a theme: https://docs.salla.dev/421878m0
- Wix Studio — Site Styles: https://support.wix.com/en/article/studio-editor-about-site-styles · Sections: https://support.wix.com/en/article/studio-editor-adding-and-managing-sections · Buying templates: https://support.wix.com/en/article/wix-studio-buying-studio-templates-in-the-wix-marketplace
- Next.js — Multi-tenant guide (للنطاق الفرعي لاحقاً): `node_modules/next/dist/docs/` → multi-tenant.md

## ٥. المرجع الداخلي
- ملف الفكرة والقرارات: `documents/HTML/الشركاء/فكرة-صفحة-الشريك.html` (§٤ القوالب · §٥ النطاق الفرعي)
- الموقع الحالي: `modonty/app/(partner)/clients/[slug]/` (كروم + رئيسية + صفحات داخلية — قالب واحد اليوم بلا جدول)
- نظام التصميم: `documents/design/DESIGN-SYSTEM.md` · مهارة `modonty-uiux`
