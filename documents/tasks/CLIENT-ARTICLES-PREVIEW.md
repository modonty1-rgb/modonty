# مقالات العملاء — بيانات المعاينة وما بقي قبل الدمج

> آخر تحديث: ٩ أغسطس ٢٠٢٦ · الفرع `client-articles` · الكوميت `deb8452`

---

## روابط المعاينة (لطارق)

| التطبيق | الرابط |
|---|---|
| الأدمن | `https://modonty-admin-ld8cvhktp-modonty-72c2a2ca.vercel.app` |
| الكونسول | `https://modonty-console-nmdyr41dc-modonty-72c2a2ca.vercel.app` |
| مودونتي | `https://modonty-modonty-fx1y27zxa-modonty-72c2a2ca.vercel.app` |

الثلاثة محميّة بتسجيل دخول Vercel — يفتحها من عنده حساب على الفريق.

**تنبيه:** كل نشرة جديدة على الفرع تعطي روابط جديدة. حدِّث هذا الملف عند كل دفعة.

---

## القاعدة — متحقَّق منها بقياس

المعاينات الثلاث تقرأ `modonty_dev`، والإنتاج لم يُلمَس.

```
admin   | preview     | db: modonty_dev      ← أُضيف ٩ أغسطس
console | preview     | db: modonty_dev      ← أُضيف ٩ أغسطس
modonty | preview     | db: modonty_dev      ← كان موجوداً
modonty | production  | db: (مشفَّر — لم يُمَسّ)
```

**الدليل النهائي:** نداء عنوان المعاينة رجّع `count=1` والمقال `client-site-jsonld-test-2` —
وهو موجود في `modonty_dev` وحدها.

---

## عنوان القراءة

| البند | القيمة |
|---|---|
| العنوان العام (بعد الدمج) | `https://api.modonty.com/v1/articles` |
| العنوان على المعاينة | `<رابط معاينة الكونسول>/v1/articles` |
| مفتاح جبر سيو | `mdk_GBa2hnrE2ogpgmI3OOXSsd4vXqwGlanrhTpXTEeRAUI` |
| مفتاح تجاوز الحماية (معاينة فقط) | `c6CyLBo1tun2qz7usqjW2kw9FxeG3Ig4` |

مثال السحب من المعاينة:

```bash
curl -H "Authorization: Bearer mdk_GBa2hnrE2ogpgmI3OOXSsd4vXqwGlanrhTpXTEeRAUI" \
     -H "x-vercel-protection-bypass: c6CyLBo1tun2qz7usqjW2kw9FxeG3Ig4" \
     https://modonty-console-nmdyr41dc-modonty-72c2a2ca.vercel.app/v1/articles
```

**مفتاح التجاوز للمعاينة فقط** — بعد الدمج يشتغل `api.modonty.com` بلا حاجة إليه، ويُحذف.

---

## النطاق `api.modonty.com`

أُضيف لمشروع الكونسول وتحقّق ٩ أغسطس:

```
verify  => verified: true
config  => configuredBy: CNAME · misconfigured: false
سجلّا Namecheap:  TXT _vercel = vc-domain-verify=api.modonty.com,da573e7105c7eb863fcc
                  CNAME api   = cname.vercel-dns.com.
```

يخدم **الإنتاج**، فلا يرد على كود الفرع قبل الدمج. وتحويل `/v1/*` ← `/api/v1/*` مضاف في
`console/next.config.ts` ومُختبَر محلياً.

---

## اعتماديات التجربة

| الجهة | الدخول |
|---|---|
| الأدمن | `modonty@modonty.com` · `Modonty123!` |
| كونسول جبر سيو | `support@jbrseo.com` · `JbrSeo2026!` |

**فخّ:** الأدمن والكونسول على `localhost` يتقاسمان كوكي الجلسة — الدخول على واحد يُخرجك من الثاني.
لا ينطبق على المعاينة (نطاقان مختلفان).

---

## ما بقي قبل الدمج

- [ ] طارق يجرّب الرحلة كاملة على المعاينة ويعطي موافقته.
- [ ] `prisma db push` للفهارس: `@@index([clientId, status, updatedAt])` و`@@index([apiKey])` — غير موجودة بعد.
- [ ] تشغيل خطوة **Client-Site Flag** في Run-All على الإنتاج بعد الدمج (شُغّلت على dev: ١٣٤ مقالاً).
- [ ] بند ٣٫٣: منتقي الروابط الداخلية بُني ولم يُختبَر حيّاً بمقالين منشورين على موقع العميل.
- [ ] بعد الدمج: تحديث عنوان السحب عند جبر سيو من رابط المعاينة إلى `api.modonty.com/v1`، وحذف مفتاح التجاوز.
- [ ] المشهد ١١ (انتهاء الاشتراك) — قرار إداري مؤجَّل.

---

## ملاحظات ظهرت أثناء التجربة

- `www.modonty.com/articles` يرجّع ٤٠٤ بينما `‎/articles/<سلَق>` يرجّع ٢٠٠ — لا توجد صفحة قائمة
  على مودونتي نفسها. لذلك صار الفحص يرسب على **التحويل** لا على رمز الحالة.
- موقع جبر سيو فيه بادئة دولة `‎/sa`، ومسار `‎/articles` على الجذر يحوّل إلى `‎/sa`. العنوان المعتمد
  حالياً `https://www.jbrseo.com/sa/articles`، ولو نقلوا المقالات للجذر يتغيّر العنوان مرة واحدة
  ويُعاد خبز الروابط تلقائياً.
- مصحّح الروابط الأساسية في الصيانة كان سيرجّع رابط مقال العميل إلى مودونتي — استُثني.
- الترجيع من «منشور على موقع العميل» إلى مسودّة يُبطل البطاقة المخزَّنة، فيلزم إعادة حفظ قبل
  إرساله للموافقة من جديد (رسالة البوّابة تقولها صراحةً).
