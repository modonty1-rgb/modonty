# Modonty × Google Stitch — دليل البرومبتات الكامل

> كل برومبتات إعادة تصميم مدونتي في مكان واحد، بالترتيب الصحيح للتنفيذ.
> مبنية على Design System v3: داكن افتراضي، إنديجو #4D4DFF، Tajawal، RTL كامل، أرقام مشرقية.

---

## طريقة الاستخدام (مهم — لا تتجاوزها)

1. افتح stitch.withgoogle.com → مشروع جديد → وضع **Web**.
2. **شاشة واحدة لكل برومبت.** لا تطلب كل الشاشات دفعة واحدة — هذا سبب النتائج السيئة.
3. ابدأ ببرومبت الدراسة (0) مع إرفاق لقطات الموقع الحالي عبر زر **+**، وانتظر رده قبل أي تصميم.
4. بعد توليد الشاشة الأولى وإعجابك بها: **ثبّت الثيم من الشريط الجانبي** (Primary ‎#4D4DFF، زوايا 8px، خط Tajawal إن توفر) قبل توليد بقية الشاشات — حتى تخرج كلها متسقة.
5. التصحيحات الصغيرة عبر **Annotate** (ارسم على العنصر واكتب الملاحظة) — أسرع وأدق من إعادة التوليد.
6. أعد استخدام عبارة "same Modonty indigo dark system" في كل برومبت لاحق.

---

## Prompt 0 — الدراسة أولًا (أرفق معه لقطات الموقع الحالي)

```
Do NOT design anything yet. First, study the attached screenshots of the current
Modonty (مدونتي) mobile web app — an Arabic RTL content platform for Saudi business
clients. Analyze and tell me:

1. The current visual language: colors, typography, card style, spacing, header
   and navigation patterns — so we can keep the brand identity recognizable.
2. What works well and must be preserved (single-column feed, RTL structure,
   trust badges like "موثّق من مدونتي", digital-impact stats, WhatsApp presence).
3. The weaknesses you observe, and check them against these audit findings:
   - stacked floating layers (bottom bar + WhatsApp button + chat bubble) covering content
   - sticky header + sticky actions + bottom bar eating ~18% of screen height
   - touch targets as small as 14-26px (footer links, tags, social icons)
   - labels at 9-11px, too small for Arabic
   - mixed Latin/Arabic text breaking (e.g. "MEPالعمود الفقري")
   - inconsistent numerals (٢٠٢٦ vs 2022 in the same page)
   - overly long article page with 9+ related-article cards
   - no category filter on mobile homepage

Summarize your understanding before we redesign. Wait for my confirmation.
```

---

## Prompt 1 — الرئيسية (الشاشة الأم — تُبنى عليها كل الشاشات)

```
Design the homepage of "Modonty" (مدونتي) — an Arabic RTL content publishing
platform for Saudi businesses. Study the attached screenshots of the current
site first to understand the brand, then redesign with these exact rules.

THEME (strict):
- Dark mode by default: deep navy background (not pure black), slightly
  lighter navy cards for depth
- Primary color: vivid indigo #4D4DFF (buttons, links, active states)
- Font: Tajawal. Body 16px, no text below 12px, no interactive label below 13px
- Arabic-Indic numerals (٠١٢٣) for all dates and counts
- Full RTL, every single UI string in Arabic — zero English words
- Touch targets minimum 44x44px, 8px gaps. Subtle shadows only, 8px card radius
- Maximum ONE floating/sticky layer besides the header

STRUCTURE (top to bottom):
1. Compact sticky header 56px: logo, nav (الرئيسية · الصناعات · الرائجة ·
   جديد مدونتي ⭐ · بحث), subscribe button "اشترك مجاناً"
2. Horizontally scrollable industry chips (40px tall, pill shape, icon + name:
   الرعاية الصحية، المقاولات، العقارات، التجارة الإلكترونية، التعليم، الموضة)
3. Reels entry: horizontal circles row "لقطات" with indigo gradient rings
   (Stories-style), under the industry chips
4. FEATURED BLOCK "من مدونتي ⭐": a wide distinctive card with indigo border
   and soft indigo-tinted background, badge "الناشر الرسمي", showing the
   platform's own latest 3 articles — visually elevated above everything else
5. Article feed: single column cards — 16:9 image, client name + blue
   verification badge "موثّق ✓", Arabic title max 2 lines, one-line excerpt,
   meta row (٢٢ يوليو ٢٠٢٦ · ٧ دقائق) that never wraps
6. Digital impact stats strip: ٩٥١٨٦ نشاط · ١٨٨١١ زيارة (Arabic-Indic numerals,
   labels 13px minimum)
7. Footer: grouped links with 44px touch targets, no dead white space above it

Do NOT include: a partners/clients sidebar list, emoji as icons, any stacked
floating buttons. This is a premium, calm, editorial design — LinkedIn-quality
polish with Modonty's indigo dark identity.
```

---

## Prompt 2 — صفحة القطاع (المزيج الذكي)

```
Screen 2 — Industry page "الرعاية الصحية" (same Modonty indigo dark system):
sector hero with a large sector icon, Arabic title, and counters
(٢٤ مقالًا · ٨ شركاء). Then the smart mix, top to bottom:
1. Top 3 clients of this sector as large cards: logo, Arabic name, city,
   verified badge "موثّق ✓", articles count — these sell the platform
2. Latest 4 articles of the sector (standard article cards)
3. Remaining clients as a compact 2-column grid
4. Remaining articles feed
5. CTA card "انضم كعميل في هذا القطاع" with one indigo button
Sticky sub-header shows the sector name when scrolling. Mobile-first 390px,
RTL, Arabic-Indic numerals, 44px touch targets.
```

---

## Prompt 3 — صفحة العميل

```
Screen 3 — Client profile page (same Modonty indigo dark system): hero with
cover image, logo, Arabic client name, industry + Arabic city (الرياض),
verified badge, Google stats pill. Tabs: المقالات · التقييمات · الأسئلة · عن.
ONE bottom action bar only (64px): primary indigo button "احجز الآن" (correct
Arabic spelling with آ), green WhatsApp icon button, follow + save as icons —
all labels 13px minimum, and the page content must have bottom padding so the
bar NEVER covers any section. About section shows legal info as Arabic labels
with a "موثّق ضريبيًا ✓" badge instead of raw tax numbers. Include a "لقطات
العميل" horizontal reels row and an FAQ section with a simple ask form.
Nothing floats above the bottom bar.
```

---

## Prompt 4 — صفحة المقال

```
Screen 4 — Article page (same Modonty indigo dark system): breadcrumb, Arabic
H1, ONE compact meta row (Modonty · ٢٢ يوليو ٢٠٢٦ · ٦ دقائق · ١٠٢٣ كلمة) that
never wraps, verified client card, article body 16px with 1.9 line-height and
comfortable paragraph spacing. Engagement actions (like, save, comment, share)
live in ONE auto-hiding bottom bar (hides on scroll down, reappears on scroll
up) with 13px labels — no sticky top action bar. After the article body:
FAQ accordion "أسئلة شائعة", sources list, then an inline conversion card
"تريد محتوى يجذب لك عملاء من جوجل؟" with a WhatsApp CTA, then comments with a
VISIBLE input field ("اكتب تعليقك…"), then author bio in Arabic, then only
3 related-article cards + "عرض المزيد" button. Keep the page short.
```

---

## Prompt 5 — عارض اللقطات (Reels)

```
Screen 5 — "لقطات" Reels viewer (mobile, same Modonty indigo dark system):
full-screen vertical snap-scroll video feed, 9:16. Overlay bottom: client logo +
Arabic name + verified badge "موثّق ✓", one-line Arabic description, ONE prominent
indigo CTA button "اقرأ المقال". Right-side vertical action rail: like, share,
save icons 44px with Arabic-Indic counters (٢٤). Muted autoplay with sound toggle,
thin progress bar on top. Show a second variant of the screen: an image-based
"لقطة" (photo with subtle zoom) with the same overlay system.
```

---

## Prompt 6 — نسخة الديسكتوب (بعد اعتماد كل شاشات الموبايل)

```
Now create the desktop version (1280px) of the approved homepage, keeping the
exact same theme and content order: header with full nav, industry chips row,
"من مدونتي ⭐" featured block spanning the content column, article feed in the
center column (max 720px), and a right sidebar containing ONLY the digital
impact stats and the reels "لقطات" entry — no partners list. Same indigo dark
system, RTL.
```

---

## برومبتات Annotate جاهزة (للتصحيحات السريعة)

انسخ حسب الحاجة بعد رسم دائرة على العنصر:

- `كبّر هدف اللمس لهذا العنصر إلى 44px`
- `وحّد الأرقام هنا إلى المشرقية ٠١٢٣`
- `هذا النص أصغر من 13px — كبّره`
- `أزل هذا الزر العائم وادمجه في الشريط السفلي`
- `اجعل هذا الصف لا ينكسر لسطرين`
- `بدّل الإيموجي بأيقونة SVG بسيطة`

---

## بعد التصميم

- التصدير: Export → Figma للتسليم، أو HTML/CSS كمرجع للفرونت (لا يُنسخ كما هو — يُعاد بناؤه بـ shadcn/Tailwind حسب Design System v3).
- راجع كل شاشة ضد قائمة «Mobile Rules» و«Known Bugs» في DESIGN_SYSTEM_V3.md قبل الاعتماد.
