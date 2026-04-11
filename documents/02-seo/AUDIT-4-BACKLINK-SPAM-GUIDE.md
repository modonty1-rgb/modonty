# AUDIT-4 — Backlink Spam من linkbooster.agency
> دليل خطوة بخطوة — اقرأه كاملاً قبل أي إجراء

---

## الوضع الآن

SEMrush و Ahrefs رصدا روابط واردة (backlinks) من موقع `linkbooster.agency` يشيران لـ modonty.com.
هذا النوع يُسمى **Negative SEO** — جهة خارجية ترسل روابط سبام لموقعك بقصد الإضرار بترتيبه.
Google عادةً تتجاهله، لكن في بعض الحالات يستوجب تدخلاً.

---

## الخطوة 1 — تحقق من الوضع في Google Search Console (أول شيء)

**ادخل على:** [search.google.com/search-console](https://search.google.com/search-console)

### 1.1 تحقق من Manual Actions
- من القائمة الجانبية: **Security & Manual Actions → Manual Actions**
- إذا ظهرت رسالة "No issues detected" → ✅ Google لم تعاقبك، لا داعي للإجراء الفوري
- إذا ظهر أي تحذير عن "Unnatural links" → 🚨 اتخذ الإجراء فوراً (انتقل للخطوة 3)

### 1.2 تحقق من Links Report
- من القائمة الجانبية: **Links**
- اضغط **Top linking sites**
- ابحث عن `linkbooster.agency` في القائمة
- إذا لم يظهر → Google لم ترصده أصلاً، لا داعي لأي شيء
- إذا ظهر → دوّن عدد الروابط وتاريخها

---

## الخطوة 2 — راقب الأداء (Performance Report)

**ادخل على:** GSC → **Performance → Search results**

- اضبط الفترة: **آخر 3 أشهر**
- انظر على رسم الـ clicks و impressions
- هل في انخفاض مفاجئ في تاريخ محدد؟

**إذا لم يكن في انخفاض → Google تجاهلت الروابط السبام، لا تفعل شيئاً.**

---

## الخطوة 3 — رفع Disavow File (فقط عند الحاجة)

> ⚠️ لا ترفع الملف إلا إذا تحقق واحد أو أكثر من الشروط التالية:
> - ظهر Manual Action في GSC
> - انخفض ترتيب كلماتك المفتاحية الرئيسية 10%+ خلال أسبوعين
> - رصدت Ahrefs / SEMrush 100+ رابط جديد من `linkbooster.agency`

### الملف جاهز هنا:
```
documents/02-seo/disavow-linkbooster.txt
```

محتواه:
```
domain:linkbooster.agency
```

### خطوات الرفع:
1. افتح هذا الرابط المباشر:
   `https://search.google.com/search-console/disavow-links?resource_id=sc-domain:modonty.com`
2. اضغط **Upload disavow list**
3. ارفع الملف `disavow-linkbooster.txt`
4. اضغط **Submit**
5. Google تأخذ من أسبوعين لشهر لتطبيقه

---

## الخطوة 4 — المتابعة الشهرية

كل أول الشهر، افتح GSC وتحقق من:

| ما تتحقق منه | أين تجده في GSC |
|---|---|
| Manual Actions | Security & Manual Actions → Manual Actions |
| روابط جديدة من linkbooster | Links → Top linking sites |
| أداء الكلمات المفتاحية | Performance → Search results |

---

## ملخص القرار

```
هل في Manual Action في GSC؟
├── نعم → ارفع disavow-linkbooster.txt فوراً
└── لا ↓
    هل في انخفاض ranking 10%+ غير مفسر؟
    ├── نعم → ارفع disavow-linkbooster.txt
    └── لا → لا تفعل شيئاً، Google تجاهلتهم ✅
```

---

## المرجع الرسمي من Google

- [دليل Disavow Links الرسمي](https://developers.google.com/search/docs/monitor-debug/links/disavow-links)
- نص Google الرسمي: *"If you don't have a manual action or algorithmic issue, you probably don't need to worry about these links."*

---

> الملف جاهز، الخطوات واضحة — افتح GSC أولاً وتأكد من عدم وجود Manual Action.
> إذا لم يكن في شيء، لا داعي لأي إجراء. ✅
