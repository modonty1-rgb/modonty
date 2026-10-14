# meta-landing-page — ١٣ أكتوبر ٢٠٢٦

## وقفنا عند

GTM مركّب ومتحقَّق حيّاً على الإنتاج لصفحتين من ثلاث. التالي: الميديا باير تبني تاجز
البكسل/CAPI جوا الحاويتين (مش شغلنا). لسه ناقص: صفحة `/search-growth` (start3.html)
بلا حاوية GTM.

## الصفحات الثلاث (كودكس غيّر الأسامي من start/start2/start3)

| الرابط الحي | الملف الفعلي | حاوية GTM | الحالة |
|---|---|---|---|
| `modonty.com/business-presence` | `modonty/public/landing-pages/start.html` | GTM-NQR2D23C | مركّب + Connected (live test) |
| `modonty.com/search-visibility` | `modonty/public/landing-pages/start2.html` | GTM-KGMQ7L26 | مركّب + Connected (live test) |
| `modonty.com/search-growth` | `modonty/public/landing-pages/start3.html` | — غير موجودة | لا GTM بعد |

## المنجز هذه الجلسة

- حاويتا GTM كانتا بصلاحية **Read** فقط لـ`modonty1@gmail.com` (أماني عندها Publish) —
  رفعتها لـPublish/Approve/Edit على الحاويتين.
- غيّرت اسم الحاويتين في GTM ليطابق الرابط الحي الفعلي (كانتا بأسامي قديمة `start`/`start2`،
  وواحدة فيها لاحقة " --" زايدة).
- ركّبت سنيبت GTM (head script + body noscript) في `start.html` (GTM-NQR2D23C) و
  `start2.html` (GTM-KGMQ7L26) — ما كان فيه أي سنيبت قبل كده، رغم وجود `dataLayer.push`
  داخلي (`landing_view`, `whatsapp_click`) بلا حاوية تستقبله.
- بوش لـmain (كوميت `7f52674a`) شامل: سنيبت GTM + سكيما `Campaign`/`CampaignSubmission`
  (فورم الحملة → قاعدة البيانات → واتساب، شغل خالد اليوم) + نقطة API
  `modonty/app/api/campaign-submissions/route.ts` + قواعد AGENTS.md الأربعة.
- ديبلوي فيرسيل أخذ ~٥ دقائق للبناء (مونوريبو كبير) — طبيعي، مش عطل.
- Live test حقيقي بعد الديبلوي: `curl` على `www.modonty.com` رجّع ٢٠٠ + معرّف الحاوية
  الصحيح في كل صفحة، ثم GTM Preview/Tag Assistant أكّد "Connected" + التريغرز اشتغلت
  (`Consent Init → Init → Container Loaded → DOM Ready → Window Loaded`، وعلى
  business-presence ظهر حدث `landing_view` كمان).

## الحاويتان فاضيتان من التاجز عمداً

"You don't have any tags yet" في الاثنتين — متوقَّع، مش خطأ. البكسل/الـCAPI شغل
الميديا باير (أماني، عندها Publish أصلاً) — خالد أكّد صراحة: "البكسل والكلام هذا كله
أماني حتسويه... أنا أبغى أجهز لها الأمور من عندي".

## أسامي أُرسلت لخالد ليبعتها للميديا باير (بدون next.config.ts — ما يخصها)

```
Business Presence — https://www.modonty.com/business-presence — GTM-NQR2D23C
Search Visibility — https://www.modonty.com/search-visibility — GTM-KGMQ7L26
```

## معلّق بقرار خالد

- هل يركّب GTM لصفحة `search-growth`/start3.html قبل لا الميديا باير تحتاجها؟
- الـPixel ID + Conversions API token لسه من الميديا باير (ما توصل).

## Git

- فرع `main`، آخر كوميت `7f52674a` (مدفوع ومنشور ومتحقَّق على الإنتاج).
- محلي = origin (فحصت `git fetch` قبل البوش، فرق صفر).
