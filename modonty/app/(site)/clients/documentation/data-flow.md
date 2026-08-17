# مسار البيانات — `/clients`

آخر تحديث: ١٦ أغسطس ٢٠٢٦.

## من القاعدة إلى البطاقة

```
db.client.findMany            shared/prisma/schema/schema.prisma → model Client
  ↓  where subscriptionStatus = ACTIVE ، take 500 ، select فقط
getClientsList()              app/clients/data/get-clients-list.ts
  ↓  "use cache" · cacheTag("clients") · cacheLife("hours")
ClientListItem[]              كل الشركاء النشطين، مرّة واحدة لكل الزوّار
  ↓
PageLayout                    app/clients/components/page-layout/PageLayout.tsx
  ├─ filterPartners(بلا مجال) → countIndustries → صفوف قائمة التصفية + عدّاد «الكل»
  └─ filterPartners(بالكامل) → sortPartners → البطاقات المعروضة
```

## الحقول التي تصل البطاقة

| الحقل | مصدره في القاعدة | أين يظهر |
|---|---|---|
| `name` · `slug` | `Client.name` · `Client.slug` | العنوان والرابط |
| `logo` | `Client.logoMedia` عبر `mediaSrc` | الأفاتار (٤٤ بكسل) |
| `description` | `Client.description` ثم `seoDescription` | سطران تحت الاسم |
| `industry` · `city` | `Client.industry` · `Client.addressCity` | سطر البيانات + قائمة التصفية |
| `articleCount` | `_count.articles` (منشورة وتاريخها ماضٍ) | «١٢ مقالاً» |
| `reelCount` | `_count.media` (`inReels` + `PUBLISHED` + صورة) | «٣ طلّات» — نفس شروط `/reels` |
| `lastPublishedAt` | أحدث `Article.datePublished` | «آخر نشر منذ يومين» |
| `isFeatured` | `Client.isFeatured` (مفتاح الأدمن) | لون الإطار + «شريك مميّز» + التقدّم في الترتيب |
| `ctaMode` · `ctaLabel` · `ctaUrl` | حقول الـCTA على العميل | زرّ «احجز» (FORM) أو «تسوّق» (LINK) |

## ما لا يُقرأ هنا

- **لا استعلام مجالات منفصل.** `getIndustriesWithCounts()` لم يعد يُستدعى من هذه الصفحة —
  الأعداد مشتقّة من نفس القائمة، فلا يمكن أن يختلف الرقمان.
- **لا إحصاءات GA4.** `getClientsGA4Stats()` كان يغذّي ترتيب «الأكثر مشاهدة» في التصميم القديم؛
  التصميم المعتمد يرتّب بثلاثة خيارات من القاعدة نفسها (مقالات · أحدث نشراً · أبجدي).
- **لا مجاميع مشاهدات/إعجابات.** الاستعلام القديم `getClientsWithCounts` كان يجلب كل صفوف مقالات
  كل شريك ليجمعها في الذاكرة؛ البطاقة الجديدة لا تعرضها، فالاستعلام لا يجلبها.

## إبطال الكاش

`cacheTag("clients")` — أي حفظ عميل من الأدمن أو الكونسول يستدعي `revalidateTag("clients")`،
فيسقط هذا الاستعلام ويُعاد بناؤه عند أول زيارة. ما لم يُختبر بعد في هذه الجلسة: أن الحفظ من
الأدمن ينعكس على هذه الصفحة خلال ثوانٍ (**غير متحقَّق**).
