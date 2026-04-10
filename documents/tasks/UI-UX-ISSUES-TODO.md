# UI/UX Issues — Fix TODO
**Last Updated:** 2026-04-10
**Scope:** modonty — صفحة المقال + الرئيسية
**Tested on:** Desktop (1280px) + Mobile (390px) — Live Playwright

---

## القسم 1 — صفحة المقال (ديسكتوب)

### 🔴 حرج

- [ ] **A1 — نص المقال في المنتصف**
  النص والعناوين داخل المقال محاذاتها `text-center` — صعب القراءة جداً.
  **Fix:** `modonty/app/articles/[slug]/components/` — article body → `text-right` أو `prose-rtl`. العناوين `h2/h3/h4` → `text-right`.

- [ ] **A2 — التعليقات ومقالات ذات صلة مخفية في صناديق مطوية**
  المستخدم يقرأ المقال ثم يجد 5 أقسام مغلقة — يخرج ولا يتفاعل.
  **Fix:** `modonty/app/articles/[slug]/` (bottom sections):
  - "مقالات قد تهمك" → مفتوحة دائماً (grid cards)
  - "التعليقات" → مفتوحة دائماً
  - "الأسئلة الشائعة" → مقبولة مطوية
  - "المزيد من MODONTY" + "المزيد من [العميل]" → دمجهما في section واحدة

### 🟠 عالي

- [ ] **A3 — ترتيب عناصر الـ Sidebar الأيمن خاطئ**
  جدول المحتويات يظهر في الأسفل بعد النشرة وصندوق التعليقات.
  **Fix:** الترتيب الصح: Author (compact Modonty card) → TOC → Newsletter.

- [ ] **A4 — الـ Sidebars تختفي وتترك مساحة فارغة**
  عند الوصول لأسفل المقال الجانبان يفرغان.
  **Fix:** sticky حتى نهاية المحتوى أو يستبدل بـ Author card موسّع.

- [ ] **A5 — زر CTA العميل في الـ Sidebar مبهم**
  **Fix:** `تواصل مع {client.name}` ديناميكي بدل نص ثابت.

### 🟡 متوسط

- [ ] **A6 — لا يوجد شريط تقدم للقراءة** ← ✅ موجود في الموكب، ناقص في الحقيقي
  **Fix:** `ReadingProgressBar` component موجود — تأكد من تطبيقه.

- [ ] **A7 — Badge "نسخة صوتية" بدون مشغل واضح**
  **Fix:** لو `article.audioUrl` موجود → audio player تحت العنوان مباشرة.

- [ ] **A8 — TOC لا يُبرز القسم الحالي**
  **Fix:** Intersection Observer → active class على الـ TOC item.

### 🔵 UX / Accessibility

- [ ] **A9 — زر "اقرأ المزيد" بدون aria-label**
  **Fix:** `aria-label={`اقرأ المزيد: ${article.title}`}`

---

## القسم 2 — الصفحة الرئيسية

### 🟠 عالي

- [ ] **HP1 — صفحة `/articles` تعطي 404**
  **Fix:** إنشاء `modonty/app/articles/page.tsx` أو `redirect` لـ `/`.

- [ ] **HP2 — لا يوجد تعريف للمنصة للزائر الجديد**
  **Fix:** strip بسيط فوق الـ feed: "منصة المحتوى العربي" — سطران فقط.

### 🟡 متوسط

- [ ] **HP3 — قسم "جديد مودونتي" يظهر فارغاً**
  **Fix:** `if (!posts.length) return null`

- [ ] **HP4 — بطاقات المقالات غير متناسقة (بصورة وبدون)**
  **Fix:** placeholder ثابت `bg-muted` + icon لو لا توجد `featuredImage`.

---

## القسم 3 — الموبايل (Article Bar) — مكتمل في الموكب ✅

> هذا القسم يصف ما تم تصميمه في الموكب (`design-preview/page.tsx`) وينتظر التطبيق على الحقيقي.

### البار النهائي (الموكب)
```
[☰] [🔔] [4 ✏️] [31 🔖] [48 👍] [اسأل العميل] [🖼 Avatar]
sticky top-14 — تحت البريدكرم مباشرة
```

### الـ Sheet (☰) — المحتوى
1. كارت العميل الكامل (hero + logo + اسم + وصف + "اسأل العميل")
2. النشرة الإخبارية (email + اشترك)
3. جدول المحتويات (TOC)
4. شارك المقال + نسخ الرابط
5. كارت مدونتي + social icons

### Newsletter Overlay على الصورة
```
[صورة المقال]
▓▓▓ scrim gradient ▓▓▓
جديد [client.name] في بريدك 🔔  اشترك الآن ←   ← يفتح Dialog
```

### Meta Row (تحت العنوان)
```
Modonty • قبل يوم • ⏱️ 6 دقيقة • 📝 ١٬٢٤٠ كلمة
👁 ٢٬١٤٠  •  ❓ 3 (ضغط → scroll للـ FAQ)
```

### مهام التطبيق على الحقيقي (مرحلة ثانية)
- [ ] **MOB1 — نقل البار من `fixed bottom-16` إلى `sticky top-14`**
- [ ] **MOB2 — إضافة أفاتار العميل + "اسأل العميل" في Zone 1**
- [ ] **MOB3 — إضافة 🔔 Newsletter trigger في البار**
- [ ] **MOB4 — إضافة 👁 المشاهدات + ❓ الأسئلة في الـ meta row**
- [ ] **MOB5 — Newsletter overlay على الصورة المميزة**
- [ ] **MOB6 — تحديث الـ Sheet بالمحتوى الكامل (TOC + newsletter + Modonty card)**
- [ ] **MOB7 — توحيد نص CTA: "اسأل العميل" في كل مكان**

---

## القسم 4 — الموبايل (نواقص أخرى)

### 🔴 حرج

- [ ] **M1 — البريدكرم على الموبايل سطرين**
  الرئيسية › العملاء › [اسم العميل] › [عنوان المقال] — مزدحم جداً على 390px.
  **Fix:** على الموبايل → الرئيسية › ... › [عنوان مختصر] فقط. أو زر Back فقط.

### 🟠 عالي

- [ ] **MB1 — نص النشرة ثابت وغير قابل للتخصيص**
  **Fix:** حقل `newsletterCtaText` في إعدادات العميل (admin).
  - قيمة افتراضية: `"اشترك الآن"`
  - schema: `client.newsletterCtaText: String? @default("اشترك الآن")`

---

## القسم 5 — عامة

### 🟠 عالي

- [ ] **G1 — JWTSessionError في الـ Console**
  **Fix:** تجديد `AUTH_SECRET` في `.env.local`.

### 🟡 متوسط

- [ ] **G2 — Footer روابط قانونية فقط**
  **Fix:** إضافة quick links: الرئيسية / الرائجة / العملاء / عن مدونتي.

- [ ] **G3 — النشرة بدون رسالة تأكيد**
  **Fix:** success/error state مرئي بعد الإرسال.

---

## 📐 التصور الكامل — Article Page (ديسكتوب)

```
┌─────────────────────────────────────────────────────────┐
│  Reading Progress Bar (fixed top, h-1, primary color)   │
├─────────────────────────────────────────────────────────┤
│  Nav (sticky)  |  Breadcrumb                            │
├──────────────┬──────────────────────────┬───────────────┤
│ LEFT SIDEBAR │   ARTICLE BODY           │ RIGHT SIDEBAR │
│ (sticky)     │                          │ (sticky)      │
│              │  العنوان — text-right    │               │
│ Client Card  │  Excerpt — text-right    │  Modonty card │
│ (full)       │  Meta row                │  (compact)    │
│              │  Featured Image          │               │
│ Engagement   │  + Newsletter Overlay    │  TOC          │
│ (👍🔖💬👁)  │  Tags                    │  (highlights  │
│              │                          │   current)    │
│              │  ── Body ──              │               │
│              │  text-right / justify    │  Newsletter   │
│              │  ── End of Body ──       │  (compact)    │
│              │                          │               │
│              │  مقالات قد تهمك (OPEN)  │               │
│              │  التعليقات (OPEN)        │               │
│              │  الأسئلة الشائعة ▼       │               │
├──────────────┴──────────────────────────┴───────────────┤
│  Article Footer: نشر بواسطة + تاريخ + رخصة             │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Done — الموكب (design-preview)

- ✅ Reading Progress Bar
- ✅ Article Bar (sticky top-14) — Zone 1: Avatar + "اسأل العميل" | Zone 2: 👍 🔖 ✏️ 🔔 ☰
- ✅ Newsletter overlay على الصورة — trigger فقط (lazy dialog)
- ✅ Meta row — views 👁 + questions ❓ (clickable → scroll to FAQ)
- ✅ Modonty branding card (compact) — logo + name + 4 social icons
- ✅ TOC مع active section highlight
- ✅ Bottom Sheet (☰) — client card + newsletter + TOC + share + Modonty card
- ✅ Newsletter Dialog (lazy — only mounts on demand)
- ✅ توحيد نص CTA: "اسأل العميل" في كل مكان
- ✅ أيقونة الكتابة ✏️ لزر التعليق
- ✅ FAQ section مع id للـ scroll
