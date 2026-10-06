# حالة تنفيذ صور Console Mobile المعتمدة

هذا الملف هو لوحة التنفيذ، لا ذاكرة محادثة. يحدّث بعد كل تغيير مرئي أو وظيفي. الحالة الثنائية فقط: `PASS` أو `BLOCKED` وفق بوابة الصفر انحراف في `documents/mobile/UIUX-RULES.md`.

## لقطة التقدم — ٢٩ أغسطس ٢٠٢٦

التقرير الكامل: `TEST-REPORT-2026-08-29.md`. الجهاز `SM-A217F` · `720×1600` · `tsc` صفر في `console-mobile` و`console` (بالبرنامج المباشر لا عبر pnpm).

**١٠ PASS · ٨ BLOCKED · ١٥ لقطة جهاز فعلي · ١٢ endpoint بـHTTP 200.**

| الشاشة | عقد الصورة | عقد البيانات الفعلي | الحالة | الدليل / الحاجز | الفعل التالي الواحد |
|---|---|---|---|---|---|
| S00 | `S00-foundations.png` | theme/tokens | PASS | قياس بكسلي: الألوان الستّة والأرقام تطابق `tokens.ts` حرفياً | مقفول — يبقى التحقق داخل كل شاشة |
| S01 | `S01-login.png` | `auth/screen` · `auth/login` | BLOCKED | النصوص الحيّة تطابق الصورة (HTTP 200)، لكن لا لقطة جهاز — الالتقاط يحتاج تسجيل خروج | التقط S01 بعد تسجيل خروج مقصود |
| S02 | `S02-home.png` | `dashboard` | PASS | `evidence/S02-home-device.png` — التسمية والأرقام العارية وصفوف الصفر والتابات | — |
| S03 | `S03-referral-message.png` | `referral` | BLOCKED | `evidence/S03-referral-device.png` — البنية كاملة، وفعل الإرسال معطّل: لا نموذج إحالة في السكيما | قرار خالد على نموذج `ReferralLead` |
| S04 | `S04-subscription.png` | `subscription` | BLOCKED | `evidence/S04-subscription-device.png` — كل الأقسام مطابقة؛ صفّ السعر محذوف لأن `pricing` فارغ | قرار خالد على مصدر السعر ودلالة `pricing.yr` |
| S05 | `S05-decision-articles.png` | `articles?scope=decision` | PASS | `evidence/S05-decision-device.png` — الرأس والتابات وشريط العدّاد والبطاقة | — |
| S06 | `S06-review-hub.png` | `articles/[id]` | BLOCKED | `evidence/S06-reviewhub-device.png` — بطاقتان من ثلاث؛ الاستشهادات غائبة (`isYmyl:false`) | اختبر بحساب YMYL من الـ٢٧ على dev |
| S07-article | `S07-article.png` | `articles/[id]` | PASS | `evidence/S07-article-device.png` — الصورة والشارة والمحتوى HTML والشريط السفلي | — |
| S07-questions | `S07-questions.png` | `articles/[id]` + قرارات FAQ | BLOCKED | `evidence/S07-questions-device.png` — «تعديل السؤال» صار «رفض»: لا مسار كتابة؛ وسطر السبب لا حقل له | قرار خالد: حقل `reason` و endpoint تعديل؟ |
| S07-citations | `S07-citations.png` | `Article.citations` | BLOCKED | لا لقطة — `citations` روابط نصّية فقط، وأربعة حقول في الصورة بلا مقابل | اعتماد نموذج استشهاد قبل التنفيذ |
| S08 | `S08-audience.png` | `audience` | PASS | `evidence/S08-audience-device.png` — التبويبان وبطاقات القرّاء | — |
| S08-reply | `S08-audience-reply.png` | `audience/questions/[faqId]` | PASS | `evidence/S08-audience-reply-device.png` — الهوية والسؤال والعدّاد والزرّ المانع للضغط المزدوج | — |
| S09 | `S09-videos.png` | `videos` | PASS | `evidence/S09-videos-device.png` — الحالة والتاريخ والمدة والمصغّرة | — |
| S10 | `S10-video-upload.png` | `videos.upload` | BLOCKED | `evidence/S10-video-upload-device.png` — `available:false`: لا endpoint كتابة ولا ingest ولا كاميرا/معرض مثبّتان | اعتماد مسار الرفع |
| S11 | `S11-published-articles.png` | `articles?scope=published` | BLOCKED | `evidence/S11-published-device.png` — البطاقة صُحّحت؛ رابط «عرض على موقعك» لا يظهر لأن `siteUrl` فارغ | اختبر بعميل له مقالات على موقعه |
| S12 | `S12-notifications.png` | `notifications` | PASS | `evidence/S12-notifications-device.png` — الشارة والحدود والوسوم، والعدّاد صار حقيقياً | — |
| S13 | `S13-account.png` | `me` · `me/notifications` | PASS | `evidence/S13-account-device.png` — الوردمارك والرجوع والمفاتيح التي تُحفظ فعلاً | — |
| S14 | `S14-support.png` | `support` | PASS | `evidence/S14-support-device.png` — النموذج والزرّ المانع للضغط المزدوج | — |
