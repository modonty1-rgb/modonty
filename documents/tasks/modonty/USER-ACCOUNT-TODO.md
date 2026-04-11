# User Account System — TODO
> Last Updated: 2026-04-11
> Scope: `modonty/app/users/` · `modonty/app/api/` · `modonty/components/auth/`

---

## ⏸ مؤجل — نُقل للـ MASTER-TODO

> جميع البنود المتبقية نُقلت لـ MASTER-TODO بتاريخ 2026-04-11.
> ابحث عن: USR-R1 · USR-R2 · USR-R3 · USR-L1 · USR-L2 · USR-N1

---

## ✅ Done

- [x] **USR-B3** — Bio: حقل `bio` في schema + action + JWT session + عرض في الملف الشخصي — مكتمل ومختبر ✓
- [x] **USR-U4** — Badge الإشعارات stale: أُضيف `BellRevalidateTrigger` في notifications page → يعيد render الـ bell عند كل زيارة ✓
- [x] **USR-B1** — Bug: المظهر + التفضيلات يعرضان نفس الـ component — دُمجا: case "appearance" فقط → `PreferencesSettings`
- [x] **USR-U1** — Settings tabs مبسَّطة من 7 إلى 4 (الملف الشخصي · الأمان · المظهر · الحساب)
- [x] **USR-B5** — تاب "غير المعجبة" حُذف من profile-tabs.tsx نهائياً، الـ grid من 6 إلى 5
- [x] **USR-BUG** — `replyToQuestion` في الكونسل ما كانت تنشئ إشعار للمستخدم — أُضيفت notification creation بعد الرد عبر `submittedByEmail` → `faq_reply` notification ✓
