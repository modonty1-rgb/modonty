---
name: admin-entity-standard
description: معيار موحّد لكل كيانات الأدمن (article · category · tag · author · industry · client). طبّقه تلقائياً عند بناء/مراجعة أي صفحة قائمة أو تفصيل كيان في الأدمن — نفس التقنية، نفس السكورر، نفس دقّة العدّادات، نفس الكانونيكال. Trigger: أي عمل على admin/app/(dashboard)/{categories,tags,authors,industries,clients,articles}, أو لفظ «معيار الكيانات» / «entity standard».
---

# 🎯 معيار كيانات الأدمن (Admin Entity Standard)

> **الغرض:** كل كيان في الأدمن (article · category · tag · author · industry · client) يُعامَل **بنفس المعيار التقني** — لا فرق في المعالجة بين مقال وتصنيف ووسم. خالد (2026-07-26): «هذا standard of work — نفس الـ batch ونفس الـ technical».

---

## ⚙️ كيف يُستخدم هذا السكيل
1. **يُطبَّق تلقائياً** عند أي بناء/مراجعة/تعديل لصفحة كيان في الأدمن — بلا طلب صريح.
2. **الإضافة:** حين يقول خالد **«skill»** → البند الذي قبله (أو الذي يحدّده) يُضاف فوراً لسجلّ المعايير أدناه، مرقّماً.
3. **قبل تسليم أي صفحة كيان:** مرّ على السجلّ بند-بند كـ checklist. أي بند مخالف = يُصلَح قبل القول «تمّ».

## 🥇 الأسبقية (تفادي التعارض)
هذا السكيل **لا ينسخ** القواعد الذهبية — يشير لمصدرها الموثوق. عند أي تعارض:
**كلام خالد المباشر ← الميموري ← هذا السكيل ← الافتراضات.**
مصادر مرتبطة (لا تُكرَّر هنا): `feedback_seo_audit_reference_standard` · `feedback_admin_table_density` · `feedback_admin_language` · `feedback_admin_ui_business_focus` · `modonty-uiux` (Track A) · `project_jsonld_is_code_responsibility`.

## 📦 النطاق (الكيانات المشمولة)
`article` · `category` · `tag` · `author` · `industry` · `client`.
أي كيان له: قائمة (list) + تفصيل (detail/view) + تعديل (edit) + سيو مخزّن (nextjsMetadata/jsonLd) + سكور سيو.

---

## 📋 سجلّ المعايير (Standards Registry)

> يُضاف كل بند بأمر «skill». صيغة كل بند: **الرقم · القاعدة · لماذا · كيف تتحقق (الكود/الملف)**.

<!-- القوالب:
### N. عنوان القاعدة
- **القاعدة:** …
- **لماذا:** …
- **التحقق:** `path/to/file` — …
- **ثُبِّت:** التاريخ (خالد)
-->

### 1. توجل الفلترة/الحالة = pill بجزئين (label | count)
- **القاعدة:** أي شريط فلترة/حالة على أي كيان (article/category/tag/…) يستخدم **نفس** نمط الـ pill: زر `rounded-full` بجزئين — مقطع النص + مقطع العدّاد، بينهما فاصل (`border-s`). أول زر **«All»** بالإجمالي، ثم زر لكل قيمة مع عدّادها. النشط: مقطع النص يعكس لونه (`bg-primary text-primary-foreground`) والعدّاد يعكس (`bg-primary-foreground text-primary`). العدّاد `tabular-nums font-bold`. النقر على النشط = يلغي الفلتر. مدفوع بـ URL param.
- **لماذا:** توحيد بصري + العدّاد يُقرأ فوراً بجانب كل خيار (لا dropdown يخفي الأعداد).
- **التحقق (المصدر الوحيد للحقيقة):** `admin/app/(dashboard)/articles/components/articles-header-wrapper.tsx` → مكوّن `CountTab` (≈سطر 13-50). **أعد استخدامه، لا تُعِد بناءه.** إن لزم كيان آخر → ارفع `CountTab` لمكوّن مشترك بدل النسخ.
- **الـ skeleton الملزم:**
  ```tsx
  <button type="button" onClick={onClick}
    className={cn("inline-flex items-center overflow-hidden rounded-full border text-xs font-medium transition-colors",
      active ? "border-primary" : "border-border hover:bg-accent")}>
    <span className={cn("px-2.5 py-1", active ? "bg-primary text-primary-foreground" : "text-foreground")}>{label}</span>
    <span className={cn("border-s px-2 py-1 font-bold tabular-nums",
      active ? "border-primary-foreground/30 bg-primary-foreground text-primary"
             : "border-border bg-muted text-muted-foreground")}>{count}</span>
  </button>
  // الصف: «All» (الإجمالي) أولاً، ثم map على القيم. النشط يُشتق من searchParams.
  ```
- **ثُبِّت:** 2026-07-26 (خالد — صورة توجل حالات المقالات).

### 2. SEO Score = `SeoScoreBadge` فقط (Google G + نسبة)
- **القاعدة:** أي عرض لسكور السيو على أي كيان (article/category/tag/author/industry/client) — سواء في جدول أو صفحة تفصيل — يستخدم **`SeoScoreBadge` حصراً**. شكل واحد: `rounded-full` + شعار Google «G» + النسبة `%`، واللون حسب الطبقة. **ممنوع** أي عرض بديل (دائرة «50% · 50/100» أو نص خام) — أي عرض سيو غير هذه الشريحة = مخالفة تُصلَح.
- **الطبقات (مقفلة مع خالد 2026-07-21):** ≥90 أخضر · 50-89 كهرماني · <50 أحمر. عتبة واحدة، شكل واحد — تتغيّر من الكومبوننت فيتغيّر كل مكان.
- **بلا كلمة طبقة على شريحة التفصيل (خالد 2026-07-26):** الشريحة الرئيسية (حجم `lg` في صفحة التفصيل) = **نسبة + شعار G فقط**، بلا «سليم/متوسط/ناقص» (`label={false}` — الرقم واللون يكفيان). كلمة الطبقة اختيارية لسياقات ضيّقة فقط.
- **الشريحة زرّ قابل للنقر → صفحة technical (خالد 2026-07-26):** شريحة سكور التفصيل **إلزامي** أن تكون `href` تفتح صفحة `[id]/technical` للكيان — حيث تُعرض **مشاكل السيو والتفصيل field-by-field**. نمط قائم: `articles/[id]/technical` · `clients/[id]/technical`. أي كيان بلا صفحة technical → تُبنى (تُعيد استخدام تفصيل `calculateSEOScore`/`SEOHealthGauge`). شريحة داخل الجدول (حجم `sm`) تبقى عرضاً؛ الوصول للـ technical عبر عمود/أكشن الصف.
- **لماذا:** شعار Google يعرّف السكور كـ«سيو/بحث» فوراً؛ توحيد اللون والعتبة يمنع تضارب التقييم بين الكيانات.
- **التحقق (المصدر الوحيد):**
  - **الـ UI:** `admin/components/shared/seo-score-badge.tsx` — أعد استخدامه، لا تبنِ بديلاً. أحجام `sm|md|lg`، خيارات `showIcon/label/href/onClick`.
  - **السكورر (التقني):** الرقم يأتي من السكورر المشترك للكيان في `dataLayer/lib/seo/<entity>/seo-score.ts` (مقال: `getArticleSeoScore` عبر `article/seo-score.ts` · عميل: `client/seo-score.ts` … إلخ). كل كيان يمرّر حقوله الخمسة الكاملة للسكورر (nextjsMetadata · jsonLd · إلخ) وإلا يسجّل الكل نفس الرقم المنخفض خطأً.
- **ثُبِّت:** 2026-07-26 (خالد — صورة شريحة G + 62%). **تبعة مباشرة:** صفحة تفصيل الـ category تعرض حالياً «50% · 50/100» دائرة غير معيارية → تُستبدل بـ`SeoScoreBadge`.

### 3. الجدول = `DataTable` المشترك (shadcn) + ألوان دلالية
- **القاعدة:** كل جدول كيان في الأدمن يُبنى بـ**`DataTable`** المشترك — لا يُبنى `<Table>` يدوياً ولا pagination/سورت يدوي. منه تجي مجاناً: البحث، الفرز ٣-حالات (asc→desc→off)، الـ pagination، حالة الفراغ. الأعمدة عبر `Column<T>{ key, header, render, sortable, sortFn }`.
- **🔒 ارتفاع الصف مقفل = `40px` (best practice، خالد 2026-07-26):** رأس **40px** (`[&_th]:!h-10`) + صف الجسم **40px** (`h-10` على `<TableRow>`) مع `[&_td]:!py-0`. **المصدر:** Material Design 3 (كثافة −3 الأكثف = 40px) · Carbon «md» = 40px · Ant «small» ≈ 39px — الرقم المتقارب للجدول الكثيف. مضبوط **مرّة واحدة داخل `DataTable`** — **ممنوع** override لكل جدول، ممنوع `py` مختلف. + رؤوس `text-[11px] uppercase muted` · فواصل أعمدة `border-e border-border/50` · زيبرا `[&>tr:nth-child(even)]:bg-muted/20` · `text-[13px] whitespace-nowrap`. كله في `DataTable` فيسري على كل الجداول.
- **تمييز الألوان (دلالي، صيغة موحّدة `bg-<tone>-500/15 text-<tone>-600 dark:text-<tone>-400`):**
  - 🟢 `emerald` = نشط / مدفوع / سليم (ACTIVE · PAID)
  - 🟡 `amber` = بانتظار / تحذير / «بلا مقال بعد» (PENDING · notActivated)
  - 🔴 `red` = مستحقّات / متأخّر / حرج (OVERDUE · unpaid) · `rose` = منتهٍ
  - ⚪ `slate` = غير نشط / خامل / منتهي محايد
  - 🟣 `violet` = Pro/Premium / خاص (قرب الانتهاء) · 🔵 `blue` = Annual/info · `muted` = لا شيء / «—»
- **العروض (cell render):** كل خلية حالة = شارة بلون دلالي؛ الأرقام/التواريخ `tabular-nums`؛ الفارغ = «—» بلون `muted`؛ أعمدة الأكشن (زر Statement/View/Edit) في آخر عمود.
- **لماذا:** جدول واحد = صيانة واحدة (تغيّر الكثافة/الـ pagination من مكان واحد)؛ اللون الدلالي يُقرأ الحالة قبل قراءة النص.
- **التحقق (المصادر):** `admin/components/admin/data-table.tsx` (الجدول) · `admin/app/(dashboard)/clients/accounts/components/accounts-table.tsx` (مرجع الألوان + الشارات الحيّة).
- **ثُبِّت:** 2026-07-26 (خالد — صورة جدول الحسابات). **تبعة مفتوحة:** `ArticleTable` (المستخدَم في `/articles` وجدول مقالات الـ category بعد التوحيد) لسه يدوي بلا كثافة `[&_th]:!h-10` → ترحيله لـ`DataTable` يصلح كل مستهلكيه مرة واحدة.

### 4. كرت KPI = أيقونة + رقم صغير + وصف بجانبه (صف أفقي)
- **القاعدة:** كل كرت KPI/إحصائية بنفس المقاس والتصميم: **أفقي** — مربّع أيقونة صغير ملوّن (`h-6 w-6 rounded` + `Icon h-3.5 w-3.5`) ثم **الرقم** (`text-base font-bold tabular-nums`) ثم **الوصف** بجانبه (`text-[11px] text-muted-foreground truncate`). الحاوية `rounded-lg border bg-card px-2.5 py-2`. لون الأيقونة دلالي (نفس أعراف معيار #3). النشط = `ring-2 <tone-ring> border-transparent`.
- **مبدأ إلزامي — الكرت هو الفلتر:** **تعريف واحد لكل مفتاح** يقود *العدّاد على الكرت* و*الصفوف التي يُظهرها الجدول* معاً — يستحيل أن يُعلن الكرت عدداً يخالف ما يظهر عند الضغط. (يمنع نفس صنف خطأ 58≠50.)
- **لماذا:** توحيد بصري + الأيقونة الملوّنة تُقرأ الحالة فوراً + ربط العدّاد بالفلتر يضمن صدق الرقم.
- **التحقق (المصدر):** `admin/app/(dashboard)/clients/accounts/components/accounts-table.tsx` → `KpiToggle` (≈سطر 185-224) + `KPI_META`/`kpiTests` (تعريف واحد للعدّاد + الفلتر). **أعد استخدامه؛ إن لزم كيان آخر ارفعه لمكوّن مشترك.**
- **الـ skeleton الملزم:**
  ```tsx
  <div className={cn("flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2 transition-all",
    active && `ring-2 ${ring} border-transparent`)}>
    <button type="button" onClick={onClick} aria-pressed={active}
      className="flex min-w-0 flex-1 items-center gap-2 text-start active:scale-[0.98]">
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded", tone)}>
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-base font-bold tabular-nums leading-none">{value}</span>
      <span className="truncate text-[11px] leading-tight text-muted-foreground">{label}</span>
    </button>
  </div>
  ```
- **ثُبِّت:** 2026-07-26 (خالد — صورة صفّ KPI الحسابات).

### 5. صفحة technical للسيو = تصميم موحّد كامل (المرجع الحرفي: صفحة المقال)
> **المرجع الوحيد المُلزِم:** `admin/app/(dashboard)/articles/[id]/technical/page.tsx`. **اقرأه كاملاً قبل بناء أي صفحة technical** — لا تلخيص ولا تخمين. الأقسام أدناه كلها إلزامية بنفس الترتيب.

**الحاوية:** `<div dir="rtl" className="mx-auto max-w-4xl px-4 sm:px-6 pt-4 sm:pt-6 pb-24 space-y-4">`.

**الأقسام (بالترتيب):**
1. **هيدر:** زر رجوع ghost `size="icon" h-8 w-8` (`ArrowRight rtl:rotate-180`) → صفحة تفصيل الكيان + «دليل السيو — مراجعة الـ<الكيان>» (`text-lg font-bold`) + اسم/عنوان الكيان (`text-sm text-muted-foreground truncate`).
2. **بطاقة الدرجة** (`rounded-2xl border bg-card p-5`): **جيج SVG** 132×132 (`r=58 strokeWidth=12`, `-rotate-90`, حلقة خلفية `stroke-slate-200 dark:stroke-slate-800` + حلقة ملوّنة `strokeDasharray={dash} {CIRC}` حيث `CIRC=2π·58`) بالنسبة (`text-3xl font-extrabold`) + «درجة السيو». لون الحلقة/الرقم بـ`tone()` (≥80 emerald · ≥60 amber · <60 red). + «النور اللي يوريك وين الخلل» + **رسالة «مصدر واحد»**. + **شريطا `ScoreBar`** (META وسوم البحث · JSON-LD البيانات المنظّمة) لمن عنده الوجهان.
3. **بطاقة الطريق** (`rounded-2xl border bg-blue-50 dark:bg-blue-950/30`): «الطريق من X% إلى 100%» + عدّ **يحتاج عملك أنت** مقابل **النظام يتكفّل**. (أو بطاقة emerald «مكتمل 100%» إن لا فجوات.)
4. **✍️ يحتاج عملك** — `GapCard`s لفجوات الكاتب (شارة عدد amber).
5. **🤖 مشكلة الـ JSON-LD** — `GapCard`s للأعطال البنيوية (تبقى أمام الكاتب مع «النظام يصلحها عند النشر»).
6. **🤖 نواقص فنية أخرى** — `<details>` قابل للطي (باقي فجوات النظام، «تنحل تلقائياً»).
7. **مكتمل** — `<details>` (البنود السليمة، لكلٍّ `{earned}/{max} · {side}`).
8. **🥇 «البيانات الفعلية للصفحة — اللي يشوفه قوقل فعلاً» (إلزامي، كان ناقصاً):**
   - **🏷️ META JSON** (`<details open>` + `ScorePill` + `CodeBlock` من `nextjsMetadata` مُنسّق) — «وسوم البحث والمشاركة».
   - **🧩 JSON-LD** (`<details open>` + `ScorePill` + `CodeBlock` من `jsonLdStructuredData` مُنسّق) — «البيانات المنظّمة (النتائج الغنية)».

**المكوّنات الفرعية الأربعة (أعد استخدامها كما هي من المرجع، لا تبنِ بدائل):**
- `ScoreBar{label,score}` — عنوان + % + شريط تقدّم ملوّن بـtone.
- `ScorePill{score}` — شارة % صغيرة ملوّنة بـtone (تضيف «· سليم» عند good).
- `GapCard{check,gain,details,owner}` — أيقونة ✕/! + label + شارة side + hint + تفاصيل الخطأ + `{earned} من {max}` + `+gain على الإجمالي`.
- `CodeBlock{text,empty}` — `<pre dir="ltr" bg-slate-950 max-h-[420px] overflow-auto font-mono text-[12.5px]>` أو رسالة فراغ.

- **🥇 ملكية الفجوات (جوهر):** «يحتاج عملك أنت» (محتوى: title/description/image) مقابل «النظام يتكفّل» (canonical/dates/author/publisher/JSON-LD مولّدة تلقائياً — الكاتب لا يُنذَر بها، [[project_jsonld_is_code_responsibility]]). **رسائل عربية مبسّطة** لكل خطأ (`plainJsonLdError`-style)، لا jargon validator خام.
- **السكورر:** مدفوعة بسكورر الكيان المشترك (`getArticleEntitySeo`/`computeClientEntitySeo` → `{meta, jsonLd, overall}` + `SeoCheck[]`). كيان بلا سكورر (category/tag/author) → يُبنى سكورر dataLayer (خيار B) **أو** يُكيَّف بنفس الأقسام على بيانات فحصه — **لكن قسم ٨ (META+JSON-LD الخام) إلزامي دائماً** لأن كل كيان عنده `nextjsMetadata`+`jsonLdStructuredData`.
- **ثُبِّت:** 2026-07-26 (خالد — «ادرس الصفحة كاملة، الميتا+JSON-LD ينعرضوا زي الرئيسية، ممنوع تخمين»).

---

## ✅ Checklist ما قبل التسليم (يُشتق من السجلّ أعلاه)
- [ ] توجل الفلترة/الحالة = `CountTab` (pill بجزئين، «All» أولاً) — معيار #1.
- [ ] كرت KPI = أيقونة + رقم + وصف أفقي (`KpiToggle`)، والكرت هو الفلتر (تعريف واحد للعدّاد والصفوف) — معيار #4.
- [ ] العدّادات دقيقة — عدّاد الرأس/الكرت = عدّاد الجدول (لا `_count` مقابل قائمة مقيّدة بـ`take`).
- [ ] سكور السيو = `SeoScoreBadge` فقط (Google G + نسبة، طبقات ≥90/50/<50) — معيار #2. لا عرض بديل.
- [ ] الجدول مبني بـ`DataTable` المشترك (كثافة + بحث + فرز + pagination) + ألوان دلالية موحّدة — معيار #3. لا جدول يدوي.
- [ ] صفحة `[id]/technical` تتبع تصميم المقال (RTL · جيج · «مصدر واحد» · طريق · ملكية writer/system · عربي مبسّط) — معيار #5.
- [ ] الكانونيكال موحّد (www، ذاتي، بلا ترميز مزدوج).
- [ ] لغة الواجهة إنجليزي / المحتوى عربي (`feedback_admin_language`).
- [ ] لا jargon تقني في نصوص الأدمن (`feedback_admin_ui_business_focus`).

> **ملاحظة:** هذا الـ checklist يتوسّع تلقائياً مع كل بند يُضاف للسجلّ.
