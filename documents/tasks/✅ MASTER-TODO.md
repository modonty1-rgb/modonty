# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-26 (Session 68 — /search-console: SC-UI-01 sitemap drill-down · SC-UI-02 filter pills · OBS-052 robots path tester · OBS-053 image sitemap card · OBS-054 GSC verdict column · OBS-055 one-click submit image sitemap)
> **🎯 Master plan:** [Perfect-SEO-Plan.md](Perfect-SEO-Plan.md) — 108 task across 13 phases · ~33 يوم عمل · يستبدل **الجزء الميكانيكي** من SEO Specialist (95%) · لا يستبدل الـ Strategy/Content/Backlinks (الـ 80% من النجاح الفعلي) · راجع قسم "Reality Check" في الملف للحقيقة الكاملة
> **خطة Dashboard rebuild:** [Dashboard-Action-Plan.md](Dashboard-Action-Plan.md) · [Mockup v2](../../admin/public/dashboard-mockup-v2.html)
> **خطة URL Lifecycle & Coverage:** [URL-Lifecycle-Plan.md](URL-Lifecycle-Plan.md) — 22 task across 3 phases
> **الإصدار الحالي:** admin v0.42.0 | modonty v1.41.1 | console v0.2.0
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)

---

## 🛠️ Search Console — UI Enhancements

### SC-UI-01 ✅ DONE (2026-04-26) — Sitemap "URLs" count clickable → drill-down dialog
- [x] **Where:** `/search-console` → Sitemaps card → "URLs" column
- [x] **What:** Number is now a clickable button. On click → dialog opens listing ALL URLs in that sitemap.
- [x] **Built:**
  - `admin/lib/gsc/parse-sitemap.ts` — fetch + regex parse `<url><loc><lastmod>` blocks (server-only, no extra dep)
  - `admin/app/(dashboard)/search-console/actions/sitemap-urls-action.ts` — auth-checked server action
  - `admin/app/(dashboard)/search-console/components/sitemap-urls-dialog.tsx` — searchable dialog with type filter chips (Articles/Categories/Tags/Authors/Clients/Industries/Static/Home/Other), per-row last-modified, opens in new tab on click
- [x] Wired into `sitemap-manager.tsx` — count is now a blue clickable button with hover state

### SC-UI-02 ✅ DONE + REVISED (2026-04-26) — Coverage & Tech Health filter pills inside table card
- [x] **First attempt (reverted):** clicked stats scroll to table. User feedback: "bad UX — يضيّعني في الصفحة"
- [x] **Final design:** stats reverted to plain display (no clicks). Filter pills now live INSIDE the coverage table card header, right where the table is — no scroll, no disorientation.
- [x] **Filter pills row:** All · Live · Archived · Missing | Canonical · Robots · Mobile · Soft 404. Each pill shows live count and is color-coded by tone (emerald/amber/red). Disabled state when count = 0.
- [x] **Active state:** filled solid color background with white text. Click again to clear.
- [x] **URL state:** `?filter=KEY` (no anchor) — `scroll={false}` on Link prevents page jump.
- [x] **Built:** `FilterPill` component with tone variants; `filterHref()` helper.
- [x] **File:** `admin/app/(dashboard)/search-console/page.tsx`

---

## 🔍 Google Search Console Integration
> الخطة الكاملة في: `Claude-cowroker/gsc-admin-roadmap.md`
> الـ Library جاهزة في: `admin/lib/gsc/` ✅
> الاتصال: `gsc-modonty@modonty.iam.gserviceaccount.com` — Verified Owner ✅
> **آخر تحديث:** 2026-04-24 — اكتشاف Indexing API v3 + PageSpeed API + CrUX API

---

### 📋 كل ما نقدر نعمله من الـ Admin مع GSC

#### ✅ متاح الآن (Service Account جاهز)

**Analytics & Performance**
- عرض إجمالي Clicks / Impressions / CTR / متوسط الترتيب لأي فترة
- رسم بياني يومي للأداء (7 / 28 / 90 يوم)
- أفضل الكلمات المفتاحية (queries) مرتبة بالـ clicks
- أفضل الصفحات أداءً
- تقسيم الأداء حسب الدولة (السعودية / مصر / الإمارات / غيرها)
- تقسيم الأداء حسب الجهاز (موبايل / ديسك توب / تابلت)
- مقارنة فترة بفترة (هذا الشهر vs الشهر اللي فات)
- فلترة بيانات صفحة معينة أو كلمة معينة

**URL Inspection**
- فحص أي صفحة: مفهرسة / غير مفهرسة / السبب
- آخر مرة زار فيها Googlebot الصفحة
- هل robots.txt يسمح بالفهرسة؟
- هل الـ canonical صح؟ (ما نحدده vs ما Google يراه)
- حالة Mobile Usability لكل صفحة
- هل الصفحة موجودة في الـ Sitemap؟
- سبب عدم الفهرسة بالتفصيل (Soft 404 / Duplicate / Blocked / إلخ)

**Sitemaps**
- عرض كل الـ sitemaps المسجلة مع إحصائياتها
- عدد URLs مرفوعة vs مفهرسة لكل sitemap
- رفع sitemap جديد بضغطة زر من الأدمن
- حذف sitemap قديم أو خاطئ
- Auto-submit تلقائياً عند كل Vercel deploy

**Automation & Alerts**
- تنبيه Telegram لو الـ clicks انخفضت >20% (cron يومي)
- تقرير أسبوعي تلقائي (clicks / impressions / top query)
- Auto-submit sitemap عند نشر محتوى جديد

---

#### ✅ متاح الآن أيضاً — اكتشافات جديدة (2026-04-24)

**Indexing API v3 — بدون OAuth**
- طلب فهرسة أي صفحة فوراً من الـ service account مباشرة (verified owner = يكفي)
- زر "Request Indexing" على كل مقال عند النشر
- Auto-request indexing تلقائي عند نشر مقال جديد
- Batch indexing لصفحات متعددة دفعة واحدة
- `URL_DELETED` notification عند حذف مقال

**PageSpeed Insights API — مجاني بدون auth**
- Performance score (0-100) لأي URL — موبايل + ديسك توب
- Core Web Vitals: LCP / CLS / FID لكل صفحة
- badge الأداء على كل مقال في الأدمن

**Chrome UX Report API (CrUX)**
- بيانات حقيقية من مستخدمي Chrome الفعليين على موقعنا
- LCP / CLS / INP من real users (مش simulation)
- مقارنة أداء الموقع بالوقت الحقيقي

#### ⏳ يحتاج OAuth فقط لـ:

**Removals**
- طلب حذف URL من نتائج Google مؤقتاً (6 أشهر)
- طلب حذف cached version لصفحة
- عرض قائمة الـ removals النشطة

---

#### ❌ غير متاح من الـ API (قيود Google)

- تعديل محتوى الصفحة مباشرة من GSC
- رؤية بيانات المنافسين
- بيانات الـ Ads (هذه Google Ads API منفصلة)

---

### 💡 لماذا هذا مهم؟

الآن كل شغل GSC يتم **يدوياً** من الـ SEO Specialist:
- يفتح GSC كل يوم → يشوف الأداء يدوياً
- كل مقال ينشره → يروح GSC → يطلب فهرسة بيده
- كل مشكلة indexing → يفتح GSC → يفحص URL بيد
- Sitemap → يرفعه يدوياً مع كل تحديث
- التقارير → يسحبها يدوياً ويرسلها

**بعد البناء في الأدمن:**
- الأداء يظهر جنب المحتوى مباشرة — صفر تنقل
- ينشر مقال → الفهرسة تطلب تلقائياً
- كل مقال عنده badge: مفهرس / غير مفهرس + السبب
- Sitemap يترفع تلقائياً مع كل deploy
- تقرير أسبوعي يجي على Telegram تلقائياً

**النتيجة:** توفير ~70-80% من الوقت اليدوي + صفر أخطاء بشرية (نسيان فهرسة، نسيان sitemap).

> ⚠️ الكود **لم يبدأ بعد** — هذا ملف تخطيط. يبدأ التنفيذ بعد اعتماد الخطة.

---

### المرحلة 1 — Dashboard (الأولوية القصوى)
- [ ] إنشاء صفحة `/seo` في الأدمن (route + layout)
- [ ] Performance tab: إجمالي clicks/impressions/CTR/position + رسم بياني يومي
- [ ] Top Queries tab: أفضل 50 كلمة مفتاحية مع clicks/impressions
- [ ] Top Pages tab: أفضل 50 صفحة أداءً
- [ ] Sitemaps tab: قائمة الـ sitemaps + زر Submit + Delete
- [ ] رفع `https://www.modonty.com/sitemap.xml` (فاضية حالياً!)

### المرحلة 2 — URL Inspection في المقالات
- [ ] زر "Inspect" على كل مقال في صفحة Articles في الأدمن
- [ ] عرض: مفهرسة / غير مفهرسة / السبب / آخر crawl / mobile status
- [ ] Cache نتيجة الـ inspection في DB (حد 2,000/يوم)

### المرحلة 3 — Indexing API (بدون OAuth — service account يكفي ✅)
- [ ] بناء `lib/gsc/indexing.ts` — `URL_UPDATED` + `URL_DELETED`
- [ ] ربط الـ indexing بـ Server Action النشر في المقالات
- [ ] زر "Request Indexing" يدوي على كل مقال

### المرحلة 3b — PageSpeed + CrUX (مجاني، بدون auth)
- [ ] بناء `lib/gsc/pagespeed.ts` — Performance score + CWV
- [ ] badge أداء على كل مقال في الأدمن
- [ ] CrUX data للموقع كله

### المرحلة 4 — OAuth (للـ Removals فقط)
- [ ] إنشاء OAuth2 Client ID في Google Cloud Console
- [ ] تشغيل setup script للحصول على refresh token
- [ ] حفظ credentials في Vercel

### المرحلة 4 — Automation
- [ ] Auto-submit sitemap عند كل Vercel deploy (webhook)
- [ ] Auto-request indexing عند نشر مقال جديد
- [ ] تنبيه Telegram لو الـ clicks انخفضت >20% (cron job يومي)
- [ ] تقرير أسبوعي تلقائي (clicks / impressions / top query)
