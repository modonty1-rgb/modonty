# ما هو موجود في المستودع

مقيس ١٦ أكتوبر ٢٠٢٦.

| الحاجة | الموجود | المرجع |
|---|---|---|
| سرّ السيرفر | الهيدر `x-radar-secret` = `RADAR_INGEST_SECRET`، وإلا 401 | `admin/app/api/idea-bank/ingest/route.ts:41-44` |
| نفس السر في نقطة ثانية | الكورة | `admin/app/api/football/ingest/route.ts:50` |
| التحقق من المدخلات | Zod `safeParse` ← 400 مع أول ٥ مشاكل | `admin/app/api/idea-bank/ingest/route.ts:46-49` |
| الريلز | ليست جدولاً مستقلاً: صفوف `Media` بـ`inReels` · `reelStatus` · `reelArticleId` · `bunnyVideoId` | `shared/prisma/schema/schema.prisma:2503-2521` |
| حالات الريل | `DRAFT · PENDING_APPROVAL · APPROVED · PUBLISHED · REJECTED · ARCHIVED` | `shared/prisma/schema/schema.prisma:5406` |
| رفع Bunny المباشر | شغّال على الإنتاج (متغيرات فيرسيل منذ ١١ أكتوبر) | ذاكرة «الرفع المباشر لبني» |
| إشعار العميل عند نشر ريل | `fireClientEvent(reel_published)` | `shared/lib/mobile-push/client-events.ts` |
| صفحات الأدمن الجدولية | «Advanced Table» (DataTable + renderExpanded + FilterRow + KpiToggle) | `admin/app/(dashboard)/campaigns/components/campaigns-table.tsx` |

## ملاحظات تأثير

- **ريلز مدونتي (M13):** اعتماد شورت للريلز = صف `Media` جديد بـ`inReels=true` و`bunnyVideoId` و`reelArticleId` = مقالة الفيديو. نشره يطلق إشعار العميل الحالي — قرار: نريده أم لا؟ (Q9).
- **مسار السر:** نفس الهيدر يعني أحمد ما يحتاج سرّاً جديداً على السيرفر.
