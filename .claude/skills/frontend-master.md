---
name: frontend-master
description: |
  الملف الموحّد والمعتمد لكل شغل الـ Frontend — تصميم، تطوير، مراجعة، وجودة.
  يغطي: التفكير التصميمي، بناء Design Systems، 100+ قاعدة UI audit، WCAG 2.1 accessibility كامل، وshadcn/ui patterns.
  يتفعّل عند: بناء صفحات، components، landing pages، dashboards، تطبيقات SaaS، مراجعة UI/UX، audit accessibility، تصميم forms، اختيار ألوان/خطوط، أو أي مهمة frontend.
  التقنيات: Next.js App Router، React 19، TypeScript، Tailwind CSS، shadcn/ui، Radix UI، Zod، React Hook Form.
---

# Frontend Master — الدليل الموحّد المعتمد

> هذا الملف هو المرجع الوحيد لكل قرارات الـ Frontend: من التصميم للتطوير للمراجعة للجودة.

---

# ═══════════════════════════════════════════
# الجزء 1: التفكير التصميمي والهوية البصرية
# ═══════════════════════════════════════════

## 1.1 قبل أي كود — اتخذ قرار تصميمي واضح

قبل كتابة أي سطر، حدد:
- **الهدف**: أي مشكلة تحلها هذه الواجهة؟ من يستخدمها؟
- **النبرة**: اختر اتجاه واضح: minimalism حاد، maximalist chaos، retro-futuristic، organic/natural، luxury/refined، playful، editorial/magazine، brutalist/raw، art deco، soft/pastel، industrial — الخيارات لا تنتهي
- **القيود**: framework، performance targets، accessibility level
- **التميّز**: ما الشيء الواحد اللي يخلي المستخدم يتذكر هذا التصميم؟

**قاعدة ذهبية**: اختر اتجاه واضح ونفّذه بدقة. الـ bold maximalism والـ refined minimalism كلهم يشتغلون — المفتاح هو القصد (intentionality) مو الكثافة.

## 1.2 الجماليات — القواعد الأساسية

### Typography
- اختر خطوط مميزة وجميلة — تجنب Inter, Roboto, Arial, system fonts
- اجمع بين display font مميز + body font أنيق
- لا تكرر نفس الاختيار بين المشاريع — كل مشروع له شخصية

### Color & Theme
- التزم بنظام ألوان متماسك — CSS variables للاتساق
- لون dominant مع accents حادة أفضل من توزيع متساوي خجول
- تجنب: purple gradients on white (أشهر كليشيه AI)

### Motion & Animation
- أولوية: CSS-only للـ HTML، Motion library للـ React
- ركّز على لحظات عالية التأثير: page load مع staggered reveals
- scroll-triggering و hover states مفاجئة
- micro-interactions بين 150–300ms
- spring physics للإحساس الطبيعي
- **دائماً** احترم `prefers-reduced-motion`

### Spatial Composition
- layouts غير متوقعة — asymmetry، overlap، diagonal flow
- grid-breaking elements
- negative space سخي أو density محكومة

### Backgrounds & Visual Details
- اصنع عمق وأجواء بدل الألوان الصلبة
- gradient meshes، noise textures، geometric patterns
- layered transparencies، dramatic shadows، grain overlays

### ممنوعات بشكل قاطع
- خطوط مستهلكة: Inter, Roboto, Arial, system fonts
- ألوان مكررة: purple gradients on white
- layouts متوقعة بدون شخصية
- تصميم cookie-cutter بدون سياق

---

# ═══════════════════════════════════════
# الجزء 2: بناء الـ Design System
# ═══════════════════════════════════════

## 2.1 التحليل قبل البناء

حدد هذي المعطيات أولاً:
- **نوع المنتج**: SaaS، e-commerce، portfolio، dashboard، landing page، blog، admin panel، mobile app
- **الصناعة**: tech، healthcare، finance، education، food، beauty، real estate
- **الجمهور**: B2B enterprise، B2C consumer، developers، عام
- **النبرة**: professional، playful، luxury، minimal، bold، trustworthy، innovative
- **كثافة المحتوى**: sparse (marketing) → moderate (app) → dense (dashboard/admin)

## 2.2 Design Tokens

```
DESIGN SYSTEM
═════════════
Product: [الاسم]
Type: [نوع المنتج]
Style: [النمط المختار]

COLORS
──────
Primary:     [hex] — لون العلامة/الأكشن الرئيسي
Secondary:   [hex] — لون مساعد
Accent:      [hex] — highlights, badges, notifications
Background:  [hex] — خلفية الصفحة
Surface:     [hex] — cards, modals, الأسطح المرتفعة
Text:        [hex] — نص رئيسي
Text Muted:  [hex] — نص ثانوي/مساعد
Border:      [hex] — dividers, حدود inputs
Success:     [hex]
Warning:     [hex]
Error:       [hex]

TYPOGRAPHY
──────────
Display:  [font] — عناوين hero
Heading:  [font] — عناوين أقسام
Body:     [font] — نص الفقرات
Mono:     [font] — code, بيانات
Scale:    12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60
Weight:   400 / 500 / 600 / 700

SPACING (8px base)
──────────────────
xs: 4px | sm: 8px | md: 16px | lg: 24px | xl: 32px | 2xl: 48px | 3xl: 64px

RADIUS
──────
sm: 4px | md: 6px | lg: 8px | xl: 12px | 2xl: 16px | full: 9999px

SHADOWS
───────
sm:  0 1px 2px rgba(0,0,0,0.05)
md:  0 4px 6px rgba(0,0,0,0.07)
lg:  0 10px 15px rgba(0,0,0,0.1)
xl:  0 20px 25px rgba(0,0,0,0.1)
```

## 2.3 كتالوج الأنماط

| النمط | الأنسب لـ | السمات |
|-------|----------|--------|
| **Minimalism** | SaaS, portfolios, luxury | مساحة بيضاء، خطوط نظيفة، ظلال خفيفة |
| **Glassmorphism** | تطبيقات حديثة، dashboards | زجاج مجمد، blur، شفافية |
| **Neumorphism** | واجهات متخصصة، settings | ظلال ناعمة، مظهر embossed |
| **Brutalism** | وكالات إبداعية، علامات جريئة | خطوط خام، تباين حاد |
| **Bento Grid** | Dashboards, عرض ميزات | بطاقات شبكية بأحجام متنوعة |
| **Dark Mode** | أدوات مطورين، ميديا | خلفيات داكنة، accents مضيئة |
| **Flat Design** | Enterprise, حكومي | بدون ظلال/تدرجات، ألوان صلبة |
| **Editorial** | مدونات، مجلات، محتوى | هرمية خطوط قوية، grid layouts |
| **Organic** | صحة، طعام، بيئة | منحنيات ناعمة، ألوان أرضية |

## 2.4 Font Pairing Guide

**SaaS / Tech**
- Display: Space Grotesk / Body: DM Sans
- Display: Sora / Body: Inter
- Display: Cabinet Grotesk / Body: Satoshi

**Arabic-First (المشاريع العربية)**
- Display: Tajawal Bold / Body: Tajawal Regular
- Display: IBM Plex Sans Arabic / Body: Noto Sans Arabic
- Display: Cairo Bold / Body: Almarai
- Mono: IBM Plex Mono

**Luxury / Premium**
- Display: Playfair Display / Body: Lora
- Display: Cormorant Garamond / Body: Montserrat

**Creative / Bold**
- Display: Clash Display / Body: General Sans
- Display: Unbounded / Body: Work Sans

## 2.5 Color Palettes by Industry

| الصناعة | Primary | Accent | السبب |
|---------|---------|--------|-------|
| Tech/SaaS | `#2563EB` blue | `#8B5CF6` violet | ثقة + ابتكار |
| Healthcare | `#059669` emerald | `#0EA5E9` sky | صحة + هدوء |
| Finance | `#1E3A5F` navy | `#10B981` green | استقرار + نمو |
| E-commerce | `#EA580C` orange | `#0D9488` teal | طاقة + توازن |
| Education | `#7C3AED` purple | `#F59E0B` amber | حكمة + انتباه |

## 2.6 Section Patterns

**Hero Section**: full-width أو contained → H1 + subtitle + primary CTA + optional secondary CTA → trust indicators أسفل CTA (logos, stats)

**Features Grid**: 3 أعمدة (desktop), عمود واحد (mobile) → icon + title + description per feature → icon style متسق

**Social Proof**: testimonials مع صورة + اسم + دور + شركة → star ratings أو metrics → company logos للـ B2B

**Pricing**: 3 tiers (anchor effect) → highlight الخطة المقترحة → annual/monthly toggle → feature comparison أسفلها → CTA على كل بطاقة

**FAQ**: accordion pattern → تجميع حسب الموضوع → JSON-LD schema للـ SEO → "عندك سؤال؟" CTA في الأسفل

**Footer**: روابط مصنفة + بيانات تواصل + روابط قانونية + newsletter (اختياري) + language selector

---

# ═══════════════════════════════════════════════
# الجزء 3: قواعد مراجعة الـ UI — 100+ قاعدة
# ═══════════════════════════════════════════════

## 3.1 Accessibility (أساسي)
- Icon-only buttons تحتاج `aria-label`
- Form controls تحتاج `<label>` أو `aria-label`
- العناصر التفاعلية تحتاج keyboard handlers (`onKeyDown`/`onKeyUp`)
- `<button>` للأفعال، `<a>`/`<Link>` للتنقل — مو `<div onClick>`
- الصور تحتاج `alt` (أو `alt=""` لو decorative)
- الأيقونات الزخرفية تحتاج `aria-hidden="true"`
- التحديثات async (toasts, validation) تحتاج `aria-live="polite"`
- استخدم semantic HTML قبل ARIA
- ترتيب العناوين `<h1>`–`<h6>` بدون قفز
- `scroll-margin-top` على heading anchors

## 3.2 Focus States
- العناصر التفاعلية تحتاج focus مرئي: `focus-visible:ring-*`
- **أبداً** `outline-none` بدون بديل focus
- استخدم `:focus-visible` بدل `:focus`
- `focus-within` للـ compound controls

## 3.3 Forms
- كل input يحتاج `autocomplete` و `name` صحيح
- استخدم `type` الصحيح (`email`, `tel`, `url`, `number`) و `inputmode`
- **أبداً** تمنع paste (`onPaste` + `preventDefault`)
- Labels قابلة للنقر (`htmlFor` أو wrapping)
- `spellCheck={false}` على emails, codes, usernames
- Checkboxes/radios: label + control يشتركون في hit target واحد
- Submit button يبقى enabled حتى يبدأ الـ request — spinner أثناء الطلب
- الأخطاء inline بجانب الحقل — focus أول خطأ عند submit
- Placeholders تنتهي بـ `…` وتعرض مثال
- تحذير قبل التنقل مع تغييرات غير محفوظة

## 3.4 Animation
- **دائماً** احترم `prefers-reduced-motion`
- حرّك `transform`/`opacity` فقط (compositor-friendly)
- **أبداً** `transition: all` — حدد properties
- SVG: transforms على `<g>` wrapper مع `transform-box: fill-box; transform-origin: center`
- Animations قابلة للمقاطعة — تستجيب للـ input أثناء الحركة

## 3.5 Typography
- `…` مو `...`
- Curly quotes `"` `"` مو straight `"`
- Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`
- Loading states تنتهي بـ `…`: `"Loading…"`, `"Saving…"`
- `font-variant-numeric: tabular-nums` لأعمدة الأرقام
- `text-wrap: balance` أو `text-pretty` على العناوين

## 3.6 Content Handling
- Text containers تتعامل مع المحتوى الطويل: `truncate`, `line-clamp-*`, أو `break-words`
- Flex children تحتاج `min-w-0` للسماح بالـ truncation
- Empty states مصممة — لا تعرض UI مكسور للـ arrays/strings الفارغة
- User-generated content: توقّع القصير والمتوسط والطويل جداً

## 3.7 Images
- `<img>` تحتاج `width` و `height` صريحين (يمنع CLS)
- صور تحت الـ fold: `loading="lazy"`
- صور حرجة فوق الـ fold: `priority` أو `fetchpriority="high"`

## 3.8 Performance
- قوائم كبيرة (>50 عنصر): virtualize (`virtua`, `content-visibility: auto`)
- لا layout reads في render (`getBoundingClientRect`, `offsetHeight`)
- اجمع DOM reads/writes — لا تخلطهم
- فضّل uncontrolled inputs
- `<link rel="preconnect">` لـ CDN/asset domains
- خطوط حرجة: `<link rel="preload" as="font">` مع `font-display: swap`

## 3.9 Navigation & State
- URL يعكس الحالة — filters, tabs, pagination في query params
- Links تستخدم `<a>`/`<Link>` (يدعم Cmd+click, middle-click)
- Deep-link كل UI stateful (لو تستخدم `useState` فكّر في URL sync مثل nuqs)
- Destructive actions تحتاج confirmation أو undo — أبداً فوري

## 3.10 Touch & Interaction
- `touch-action: manipulation` (يلغي تأخير double-tap zoom)
- `overscroll-behavior: contain` في modals/drawers/sheets
- أثناء drag: عطّل text selection
- `autoFocus` بحذر — desktop فقط، input واحد رئيسي

## 3.11 Safe Areas & Layout
- Full-bleed layouts تحتاج `env(safe-area-inset-*)` للـ notches
- تجنب scrollbars غير مطلوبة: `overflow-x-hidden`
- Flex/grid أفضل من JS measurement

## 3.12 Dark Mode & Theming
- `color-scheme: dark` على `<html>` (يصلح scrollbar, inputs)
- `<meta name="theme-color">` يطابق خلفية الصفحة
- Native `<select>`: حدد `background-color` و `color` صريحاً (Windows)

## 3.13 Locale & i18n
- تواريخ/أوقات: `Intl.DateTimeFormat` مو formats مكتوبة يدوياً
- أرقام/عملات: `Intl.NumberFormat`
- اكتشف اللغة عبر `Accept-Language` / `navigator.languages` مو IP

## 3.14 Hydration Safety
- Inputs مع `value` تحتاج `onChange` (أو استخدم `defaultValue`)
- عرض التاريخ/الوقت: احمِ من hydration mismatch
- `suppressHydrationWarning` فقط وين مطلوب فعلاً

## 3.15 Content & Copy
- Active voice: "ثبّت التطبيق" مو "سيتم تثبيت التطبيق"
- أرقام للعدّ: "8 مقالات" مو "ثمانية مقالات"
- أزرار محددة: "حفظ الإعدادات" مو "متابعة"
- رسائل الخطأ تتضمن الحل/الخطوة التالية
- Hover states على كل button/link

## 3.16 Anti-Patterns Checklist (مخالفات يجب الإبلاغ عنها)
- `user-scalable=no` أو `maximum-scale=1` — تعطيل zoom
- `onPaste` مع `preventDefault` — منع paste
- `transition: all` — حدد properties
- `outline-none` بدون `focus-visible` replacement
- `<div>` أو `<span>` مع click handlers — يجب أن تكون `<button>`
- صور بدون dimensions
- `.map()` على arrays كبيرة بدون virtualization
- Form inputs بدون labels
- Icon buttons بدون `aria-label`
- تنسيقات تاريخ/أرقام مكتوبة يدوياً — استخدم `Intl.*`
- `autoFocus` بدون مبرر واضح

## 3.17 Audit Output Format
عند المراجعة، جمّع النتائج حسب الملف. صيغة `file:line`. كن مختصراً:
```
## src/Button.tsx
src/Button.tsx:42 — icon button missing aria-label
src/Button.tsx:18 — input lacks label

## src/Modal.tsx
src/Modal.tsx:12 — missing overscroll-behavior: contain

## src/Card.tsx
✓ pass
```

---

# ═══════════════════════════════════════════
# الجزء 4: Accessibility — WCAG 2.1 كامل
# ═══════════════════════════════════════════

## 4.1 Semantic HTML

```html
<!-- ❌ -->
<div class="nav">
  <div class="nav-item" onclick="go('/home')">Home</div>
</div>
<div class="content">
  <div class="title">Page Title</div>
</div>

<!-- ✅ -->
<nav aria-label="Main navigation">
  <a href="/home">Home</a>
</nav>
<main>
  <h1>Page Title</h1>
</main>
```

القواعد:
- `<button>` للأفعال، `<a>` للتنقل — أبداً `<div onClick>`
- استخدم landmarks: `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>`, `<section>`
- `<h1>`–`<h6>` بترتيب صحيح — لا تقفز مستويات
- `<ul>`/`<ol>` للقوائم، `<table>` للبيانات الجدولية
- `<fieldset>` + `<legend>` لمجموعات الفورم
- `<label>` لكل form control

## 4.2 Keyboard Navigation

كل الميزات يجب أن تعمل بدون ماوس:
- كل العناصر التفاعلية focusable
- ترتيب focus منطقي — أبداً `tabindex > 0`
- Focus indicator مرئي دائماً
- Skip links لتجاوز التنقل المتكرر
- أنماط لوحة المفاتيح المتوقعة:
  - `Enter`/`Space` — تفعيل buttons
  - `Escape` — إغلاق modals/dropdowns
  - `Arrow keys` — التنقل داخل widgets
  - `Tab` — التنقل بين العناصر
  - `Home`/`End` — القفز لأول/آخر عنصر

### Focus Trap Pattern
```tsx
function useFocusTrap(ref: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive || !ref.current) return;
    const focusable = ref.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    ref.current.addEventListener('keydown', handleKeyDown);
    first?.focus();
    return () => ref.current?.removeEventListener('keydown', handleKeyDown);
  }, [isActive, ref]);
}
```

## 4.3 ARIA Patterns الأساسية

| Pattern | ARIA |
|---------|------|
| Modal Dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` |
| Dropdown Menu | `role="menu"`, `role="menuitem"`, `aria-expanded`, `aria-haspopup` |
| Tabs | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Alert/Toast | `role="alert"` أو `aria-live="polite"` |
| Loading State | `aria-busy="true"`, `aria-live="polite"` |
| Toggle | `aria-pressed` (toggle button) أو `aria-checked` (switch) |
| Breadcrumb | `<nav aria-label="Breadcrumb">`, `aria-current="page"` |
| Icon Button | `aria-label="وصف الإجراء"` |
| Decorative Icon | `aria-hidden="true"` |

## 4.4 Color & Contrast — WCAG 2.1 AA

- نص عادي (< 18px): **4.5:1** minimum
- نص كبير (≥ 18px bold أو ≥ 24px): **3:1** minimum
- UI components: **3:1** minimum
- Focus indicators: **3:1** ضد الألوان المجاورة
- **أبداً** تنقل معلومات باللون وحده — ارفق أيقونات أو نص
- اختبر مع simulators (protanopia, deuteranopia, tritanopia)

## 4.5 Accessible Form Pattern
```tsx
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    name="email"
    autoComplete="email"
    aria-describedby="email-error email-help"
    aria-invalid={!!errors.email}
    aria-required="true"
  />
  <p id="email-help">We'll never share your email</p>
  {errors.email && (
    <p id="email-error" role="alert">{errors.email.message}</p>
  )}
</div>
```

## 4.6 Accessible Modal Pattern
```tsx
function AccessibleModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title"
      aria-describedby="modal-desc" ref={modalRef} tabIndex={-1}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="modal-overlay" onClick={onClose} aria-hidden="true" />
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        <div id="modal-desc">{children}</div>
        <button onClick={onClose} aria-label="Close modal">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
  );
}
```

## 4.7 A11y Anti-Patterns
- ❌ `outline: none` بدون بديل focus-visible
- ❌ `<div onClick>` بدل `<button>` أو `<a>`
- ❌ `tabindex > 0`
- ❌ لون وحده للمعلومات (أحمر للأخطاء بدون أيقونة/نص)
- ❌ صور بدون `alt`
- ❌ Form inputs بدون `<label>`
- ❌ Placeholder كالـ label الوحيد
- ❌ Autoplaying media بدون controls
- ❌ Infinite scroll بدون بديل keyboard
- ❌ Time limits بدون خيار تمديد

## 4.8 Testing

### Automated (axe-core + Jest)
```ts
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('no a11y violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Checklist
- [ ] تنقل الصفحة بالكامل بلوحة المفاتيح فقط
- [ ] اختبر مع screen reader (VoiceOver / NVDA)
- [ ] كبّر 200% — الـ layout لا ينكسر
- [ ] تحقق من color contrast
- [ ] عطّل CSS — المحتوى لا يزال مقروء ومرتب
- [ ] اختبر مع `prefers-reduced-motion` مفعّل

---

# ═══════════════════════════════════════
# الجزء 5: shadcn/ui Patterns
# ═══════════════════════════════════════

## 5.1 مفهوم أساسي

shadcn/ui ليست npm package تقليدية — Components تُنسخ لمشروعك وأنت تملك الكود. مبنية على Radix UI primitives للـ accessibility الكامل.

## 5.2 التثبيت والـ CLI
```bash
npx shadcn@latest init                    # تهيئة المشروع
npx shadcn@latest add button input form   # إضافة components
npx shadcn@latest search                  # بحث عن components
npx shadcn@latest docs <component>        # وثائق + أمثلة
npx shadcn@latest add --diff              # معاينة التغييرات
```

## 5.3 Styling Rules (حرجة)

- استخدم ألوان semantic: `bg-primary`, `text-muted-foreground` — **أبداً** `bg-blue-500`
- `className` لـ layout فقط — لا تتجاوز styles الـ component
- **أبداً** تتجاوز ألوان أو typography الـ component مباشرة
- استخدم `flex` مع `gap-*` — **أبداً** `space-x-*` أو `space-y-*`
- `size-*` لما width = height: `size-10` مو `w-10 h-10`
- `truncate` shorthand لـ text overflow
- استخدم built-in variants قبل custom styles: `variant="outline"`, `size="sm"`

## 5.4 Composition Patterns
```
Settings page  = Tabs + Card + form controls
Dashboard      = Sidebar + Card + Chart + Table
Auth page      = Card + Form + Button
List page      = DataTable + DropdownMenu + Dialog
Detail page    = Card + Tabs + Sheet
```

قبل كتابة UI جديد:
1. `npx shadcn@latest search` — تحقق من الموجود
2. تحقق من community registries
3. ركّب components موجودة قبل بناء جديد

## 5.5 Form Pattern مع React Hook Form + Zod
```tsx
"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form, FormControl, FormDescription,
  FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  username: z.string().min(2, "الاسم لازم يكون حرفين على الأقل"),
  email: z.string().email("أدخل بريد إلكتروني صحيح"),
})

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", email: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FormField control={form.control} name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المستخدم</FormLabel>
              <FormControl><Input placeholder="أدخل الاسم…" {...field} /></FormControl>
              <FormDescription>اسمك العام</FormDescription>
              <FormMessage />
            </FormItem>
          )} />
        <Button type="submit">حفظ</Button>
      </form>
    </Form>
  )
}
```

## 5.6 Dialog, Dropdown, Sheet — Quick Patterns

### Dialog
```tsx
<Dialog>
  <DialogTrigger asChild><Button>فتح</Button></DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>العنوان</DialogTitle>
      <DialogDescription>الوصف</DialogDescription>
    </DialogHeader>
    {/* المحتوى */}
    <DialogFooter><Button type="submit">حفظ</Button></DialogFooter>
  </DialogContent>
</Dialog>
```

### DropdownMenu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>تعديل</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">حذف</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Sheet
```tsx
<Sheet>
  <SheetTrigger asChild><Button variant="outline">فتح</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>الإعدادات</SheetTitle>
      <SheetDescription>خصّص تفضيلاتك</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
```

## 5.7 Charts (Recharts)
```tsx
"use client"
import { Bar, BarChart, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  revenue: { label: "الإيراد", color: "hsl(var(--primary))" },
}

<ChartContainer config={chartConfig} className="h-[300px]">
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip content={<ChartTooltipContent />} />
    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
  </BarChart>
</ChartContainer>
```

## 5.8 Toast
```tsx
import { toast } from "sonner"

toast.success("تم الحفظ بنجاح")
toast.error("حدث خطأ")
toast.loading("جاري الحفظ…")
toast.promise(saveData(), {
  loading: "جاري الحفظ…",
  success: "تم!",
  error: "فشل الحفظ",
})
```

## 5.9 Next.js App Router Integration

- **Server Components (الافتراضي)**: Card, Table تشتغل كـ server
- **Client Components**: Dialog, Dropdown, Form تحتاج `"use client"`
- **Pattern**: Server يجيب البيانات → يمررها لـ Client component

```tsx
// page.tsx (Server)
import { getUsers } from "@/lib/data"
import { UserTable } from "./user-table"

export default async function UsersPage() {
  const users = await getUsers()
  return <UserTable data={users} />
}
```

## 5.10 cn() Helper
```ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  "flex items-center gap-2 rounded-lg border p-4",
  isActive && "border-primary bg-primary/5",
  isDisabled && "pointer-events-none opacity-50"
)} />
```

---

# ═══════════════════════════════════════
# الجزء 6: UX Best Practices — 40 قاعدة
# ═══════════════════════════════════════

### Layout & Hierarchy
1. Visual hierarchy: size > color > position > contrast
2. F-pattern للصفحات النصية، Z-pattern للتسويقية
3. المحتوى الأهم فوق الـ fold
4. Group العناصر المرتبطة — proximity + whitespace
5. alignment متسق — اختر واحد والتزم
6. أقصى 3 مستويات hierarchy بصرية لكل section
7. Card-based layouts للمحتوى القابل للفحص
8. Hero sections كامل العرض للتأثير، عرض محدود للقراءة

### Navigation
9. أقصى 7±2 عناصر في التنقل الرئيسي
10. مؤشر الصفحة الحالية مرئي دائماً
11. Breadcrumbs للهرميات العميقة (>2 مستويات)
12. Sticky header للصفحات الطويلة
13. Back-to-top بعد 2 viewport scrolls
14. Mobile: hamburger menu مع إغلاق واضح

### Buttons & CTAs
15. CTA أساسي واحد لكل viewport
16. أزرار تصف الإجراء: "حفظ التغييرات" مو "إرسال"
17. Touch target أقل شيء: 44×44px
18. Loading state على الأزرار أثناء async
19. Destructive actions تحتاج confirmation
20. CTA contrast > 4.5:1

### Forms
21. فورم عمود واحد تحوّل أفضل من multi-column
22. Labels فوق inputs (مو داخلها كـ placeholders)
23. Inline validation على blur، مو كل keystroke
24. رسائل خطأ واضحة مع اقتراح الحل
25. Progress indicator لـ multi-step forms
26. Smart defaults لتقليل جهد المستخدم

### Content
27. أقصى طول سطر: 60–80 حرف للقراءة
28. تباعد الفقرات > تباعد الأسطر
29. Left-align (LTR) / Right-align (RTL) — أبداً justify
30. استخدم محتوى حقيقي مو Lorem Ipsum في الإنتاج

### Performance UX
31. Skeleton loaders أفضل من spinners
32. Optimistic updates للاستجابة الفورية
33. Infinite scroll أو pagination — مو الاثنين
34. Lazy load المحتوى تحت الـ fold
35. Prefetch on hover للتنقل الفوري

### Mobile
36. Bottom navigation للأفعال الرئيسية (thumb zone)
37. Swipe gestures للتفاعل الطبيعي
38. لا وظائف تعتمد على hover
39. Responsive images مع `srcset`
40. تباعد touch-friendly بين العناصر التفاعلية

---

# ═══════════════════════════════════════
# الجزء 7: Pre-Delivery Checklist
# ═══════════════════════════════════════

قبل تسليم أي UI:

### Visual Quality
- [ ] Spacing متسق من الـ scale المحدد — لا magic numbers
- [ ] Typography hierarchy واضحة
- [ ] ألوان تطابق الـ design system — لا hex مكتوبة يدوياً
- [ ] Hover/active/focus states على كل عنصر تفاعلي
- [ ] Empty states مصممة (مو بس "لا بيانات")
- [ ] Loading states لكل محتوى async
- [ ] Error states مع recovery actions

### Responsive
- [ ] يشتغل على 320px, 768px, 1024px, 1440px
- [ ] لا horizontal scroll على أي breakpoint
- [ ] Touch targets ≥ 44×44px على mobile
- [ ] نص مقروء بدون zoom على mobile
- [ ] صور لا تتجاوز containers

### Accessibility
- [ ] Contrast ratio ≥ 4.5:1 للنص
- [ ] كل العناصر التفاعلية keyboard accessible
- [ ] Screen reader يقرأ المحتوى صحيح
- [ ] Focus order منطقي
- [ ] ARIA attributes حيث مطلوب

### Performance
- [ ] لا CLS — صور عندها dimensions
- [ ] Above-fold يحمّل في < 2.5s (LCP)
- [ ] Interactions تستجيب في < 100ms (INP)
- [ ] Fonts preloaded مع display swap
- [ ] Below-fold content lazy loaded

### Next.js Specific
- [ ] Server Components بالافتراضي — client فقط وين مطلوب
- [ ] next/image مع width/height أو fill + sizes
- [ ] next/link للـ internal، `<a>` للـ external
- [ ] Metadata API لـ SEO
- [ ] Dynamic imports لـ below-fold heavy components

---

# References
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com)
- [A11y Project](https://www.a11yproject.com/)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
