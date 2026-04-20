# MASTER TODO — MODONTY
> **آخر تحديث:** 2026-04-21 (Session 62 — PERF-006 article-data.ts fix ✅ + full live test ✅)
> **الإصدار الحالي:** admin v0.40.0 | modonty v1.41.0 | console v0.2.0
> المهام المنجزة في → [🏆 MASTER-DONE.md](🏆%20MASTER-DONE.md)

---

# ⚠️ إجراءات يدوية

- [ ] Verify `admin.modonty.com` live and accessible

---

# 🌐 MODONTY

## 🔴 HIGH — سرعة التحميل

- [ ] **PERF-003** — Legacy JavaScript 14 KiB — vendor polyfills غير ضرورية — يحتاج `ANALYZE=true pnpm build`
- [ ] **PERF-008** — Article page TBT 250ms — Forced reflow من JS أثناء الـ render
  - ⚠️ يحتاج Chrome DevTools Performance trace أولاً (Reload + record → Long Tasks)
  - Radix CollapsibleContent مستبعد (يستخدم ResizeObserver async)
  - المشتبه بهم: ArticleInteractionButtons (eager + 3 useEffects)، hydration cost للـ content
  - لا تنفذ أي تعديل قبل الـ trace

---

> 🟢 LOW items → [💡 NICE-TO-HAVE.md](💡%20NICE-TO-HAVE.md)
