# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-20 (Session 59 — QAUDIT-C1 ✅)
> **الإصدار الحالي:** admin v0.39.0 | modonty v1.40.0 | console v0.2.0
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

---

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
