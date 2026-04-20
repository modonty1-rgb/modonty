# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-20 (Session 57 — Database Health Tools ✅ — pushed)
> **الإصدار الحالي:** admin v0.38.0 | modonty v1.40.0 | console v0.2.0
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

# ⚠️ إجراءات يدوية باقية

- [ ] Verify `admin.modonty.com` live and accessible
- [x] ~~Run `setup-ttl-indexes.ts` on PROD DB~~ — replaced by "Create" button in `/database` page

---

# 🌐 MODONTY

## 🔴 HIGH — سرعة التحميل

- [ ] **PERF-003** — Legacy JavaScript 14 KiB — vendor polyfills غير ضرورية — يحتاج `ANALYZE=true pnpm build`
- [ ] **PERF-004** — Unused JavaScript 24-27 KiB في صفحات clients/industries
- [ ] **PERF-008** — Article page TBT 250ms — Forced reflow من JS يقرأ layout properties أثناء الـ render
  - Likely source: article body renderer أو TOC component
  - Fix: `requestAnimationFrame` لتأجيل layout reads

## 🔴 HIGH — بطء الـ Homepage

> Root cause: `getArticles()` يشغّل `_count` aggregation على 5 collections — يبطّئ HTML stream لـ 2.8s

- [ ] **PERF-006** — Denormalize interaction counts في Article document مباشرة
  - أضف `likesCount`, `dislikesCount`, `favoritesCount`, `commentsCount`, `viewsCount` على Article
  - **Impact:** HTML stream 2.8s → ~300ms

- [ ] **PERF-007** — ISR للـ homepage `/`
  - نقل category/page filter لـ client-side URL state + `export const revalidate = 300`
  - **Impact:** LCP فوري من edge cache


---

# 🛠️ ADMIN

## 🟡 MEDIUM — متفرقات

- [ ] **EMAIL-PREVIEW-1** — صفحة `/modonty/emails` — preview + Send Test لكل قوالب الإيميل
- [ ] **SEMR-7b** — `defaultDescription` في Settings
- [ ] **"Featured" label** — "Cover Image" + "Highlight on Homepage"

---

# 📊 CONSOLE

## 🟡 MEDIUM — QA (قبل أول عميل)

- [ ] **QAUDIT-C1** — مراجعة شاملة لكل queries
  - Dashboard: C1–C5 · Analytics: C7/C10–C12/C14 · Leads: C15–C17 · Moderation: C22–C30

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
