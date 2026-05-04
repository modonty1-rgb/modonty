# Article Form — Active TODO

> **آخر تحديث:** 2026-05-03
> **النطاق:** الفورم الخاص بإنشاء/تعديل المقال (`/articles/new` + `/articles/[id]/edit`).
> **ملف منفصل للـ Schema.org perfection:** [ARTICLE-SCHEMA-PERFECTION-TODO.md](ARTICLE-SCHEMA-PERFECTION-TODO.md)

---

## 🚀 Pre-Push Checklist (المرحلة الحالية)

- [ ] `pnpm tsc --noEmit` على admin (final gate)
- [ ] backup script (`bash scripts/backup.sh`)
- [ ] version bump 0.49.0 → 0.50.0
- [ ] changelog DB entry
- [ ] commit + push
- [ ] حذف المقال التجريبي بعد الانتهاء (`69f72ee6df533d533b45f48b`)

---

## ✅ ما أُنجز في الجلسة (الفورم 95% perfect)

### الهيكل المعماري
- ✅ حذف Publish tab بالكامل (status/schedule عبر workflow pages)
- ✅ تنظيم 6 tabs: Basic · Content · Media · SEO · FAQs · Related (split منفصل لتفادي confusion)
- ✅ Tabs أفقية sticky في الأعلى (بدل sidebar 256px)
- ✅ Sticky save bar في الأسفل (SEO badge · progress · word count · status · Preview · Save)
- ✅ Header العلوي محذوف بالكامل (تجربة فورم نقية)
- ✅ Technical Review كـ workspace مستقل في sidebar (`/articles/technical`) — separation of personas (writer ↔ technical reviewer)

### Tabs polish (sections + headers + descriptions)
- ✅ **Basic:** 3 sections (العميل والتصنيف · محتوى التعريفي · خيارات النشر)
- ✅ **Content:** SectionHeader + Editor + AI (شيل Stats card + Quick SEO Check duplicates)
- ✅ **Media:** 3 sections (صورة الغلاف · النسخة الصوتية · معرض الصور) + drop zones + recommended dimensions
- ✅ **SEO:** 4 sections (Meta + Search Preview · Keywords/Citations · Health · رابط للـ Technical Review)
- ✅ **FAQs:** SectionHeader + accordion-style + 3-layer validation gate (UI add-disable + visual + server filter)
- ✅ **Related:** SectionHeader + max 5 + counter `0/5` + bug fix (excludeArticleId) + tooltip

### UX components
- ✅ Action bar (sticky bottom) — يجمع كل الـ chrome
- ✅ Preview button (mode-aware)
- ✅ Autosave + indicator (4 states)
- ✅ TipTap toolbar 4 groups (نص · بنية · وسائط · تخطيط) + localStorage persist
- ✅ SEO Health 0% on empty form (بدل 18% misleading)
- ✅ SEO Health categories في صف واحد
- ✅ Status labels human-readable (Awaiting Approval / Needs Revision)
- ✅ Image Gallery: badge counter + grid responsive + position numbers + Add tile + drop zone
- ✅ FAQ Builder: accordion + 3-layer validation gate (UI gate + visual + server filter)
- ✅ Related Articles: max 5 + counter + bug fix + tooltip

---

## 🔮 ما تبقى (راجع الملفات المنفصلة)

**للـ Schema.org perfection:** [ARTICLE-SCHEMA-PERFECTION-TODO.md](ARTICLE-SCHEMA-PERFECTION-TODO.md)
- Tier 1 — Critical (6 items)
- Tier 2 — High Value (5 items)
- Tier 3 — Nice-to-have (8 items)

**للـ Client + Article workflow:** [CLIENTS-TODO.md](CLIENTS-TODO.md)
