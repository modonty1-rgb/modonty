# مراجعة workflow العميل الكاملة (Client Workflow Review)

> **تاريخ الإنشاء:** 2026-05-29
> **الحالة:** مفتوح — مهمة كبيرة، نرتّبها واحدة واحدة
> **الفكرة:** نبني workflow واضح للعميل **زي workflow المقال** (مراحل بحالات واضحة + انتقالات + أزرار)، بدل الحالات المتفرّقة الحالية.

---

## 🎯 الهدف

العميل حالياً عنده حقول حالة متفرّقة (`subscriptionStatus` + `paymentStatus`) تُعرض بمنطق مختلط يربك المستخدم. نبغى دورة حياة واضحة للعميل بمراحل محدّدة، مثل ما عملنا للمقال (WRITING → DRAFT → ... → PUBLISHED).

---

## 🐛 المشاكل المرصودة (نرتّبها واحدة واحدة)

### 1. badge الحالة يخلط الاشتراك بالدفع → "Pending" بعد التفعيل ⏳ حل مؤقت مطبّق (2026-05-29)
- **الوصف:** بعد ضغط "Activate"، الاشتراك يصير ACTIVE لكن الـ badge يفضل يعرض "Pending" أصفر لأن `paymentStatus` لسه PENDING.
- **السبب:** منطق `getStatusBadge()` في `client-table.tsx` يقرأ الحالتين مع بعض:
  - ACTIVE + PAID → "Active"
  - ACTIVE + OVERDUE → "Overdue"
  - ACTIVE + (غير مدفوع) → "Pending" أصفر ← المربك
- **الحل المؤقت (مطبّق):** `activateClientAction` صار يضبط `paymentStatus = PAID` مع `subscriptionStatus = ACTIVE` → البادج يصير "Active". الملف: `admin/app/(dashboard)/clients/actions/activate-client.ts`.
- **الحل الصحيح (ضمن الـ workflow):** فصل عرض حالة الاشتراك عن حالة الدفع، أو دمجهما في دورة حياة واحدة واضحة بمراحل.

### (المزيد — يُضاف لاحقاً)
- _نضيف هنا كل مشكلة عميل نرصدها، واحدة واحدة._

---

## 🧭 الرؤية المقترحة (للنقاش لاحقاً)

دورة حياة العميل المقترحة (مبدئياً — تُناقَش):
`LEAD/مشترك jbrseo` → `تحويل` → `PENDING (onboarding)` → `تفعيل` → `ACTIVE` → (`EXPIRED` / `CANCELLED`)

مع لوحة workflow في `/clients` تعرض عدد العملاء في كل مرحلة (زي لوحة workflow المقال على الـ dashboard).

---

> **ملاحظة:** هذا الملف هو الـ backlog لكل تحسينات workflow العميل. نشتغل عليه بعد ما نخلّص feature التحويل الحالية (push).
