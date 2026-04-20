# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-20 (Session 59)
> **الإصدار الحالي:** admin v0.39.0 | modonty v1.40.0 | console v0.2.0
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

# ⚠️ إجراءات يدوية

- [ ] Verify `admin.modonty.com` live and accessible

---

# 🌐 MODONTY

## 🔴 HIGH — سرعة التحميل

- [ ] **PERF-003** — Legacy JavaScript 14 KiB — vendor polyfills غير ضرورية — يحتاج `ANALYZE=true pnpm build`
- [ ] **PERF-004** — Unused JavaScript 24-27 KiB في صفحات clients/industries
- [ ] **PERF-006** — Denormalize interaction counts في Article document — أضف `likesCount/commentsCount/viewsCount` مباشرة على Article
  - **Impact:** HTML stream 2.8s → ~300ms
- [ ] **PERF-007** — ISR للـ homepage — category/page filter لـ client-side + `revalidate = 300`
  - **Impact:** LCP فوري من edge cache
- [ ] **PERF-008** — Article page TBT 250ms — Forced reflow من JS أثناء الـ render

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
