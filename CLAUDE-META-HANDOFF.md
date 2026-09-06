# تسليم Claude — ربط Meta للإعلانات في MODONTY

## الهدف

إكمال ربط Meta Ads في لوحة الأدمين، بحيث تقرأ المنصة بيانات الحملات من حسابَي **مدونتي** و**جبر SEO**. لا نريد إنشاء حملات أو تشغيل إعلانات الآن؛ المطلوب قراءة وتقارير فقط.

الدليل اليدوي الكامل داخل Meta موجود في:

- [`META-ADVERTISING-SETUP.md`](./META-ADVERTISING-SETUP.md)

## ما تم معرفته من Meta

| الكيان | مدونتي | جبر SEO |
| --- | --- | --- |
| Business Portfolio | Dreamtoapp 1 | Jbr Seo |
| Business ID | `545582405315442` | `1593662981776462` |
| Ad Account | ammwag | Jbrseo SA |
| Ad Account ID | `790007510859024` | `1260508182300304` |
| العملة | — | SAR |

**لا تستخدم** `Jbrseo-EG` أو `EG account`: الحساب المصري متوقف وليس ضمن الربط الحالي.

## تطبيق Meta المشترك

- الاسم: `modonty`
- App ID: `2634180453617692`
- التطبيق مملوك لـDreamtoapp 1.
- تم طلب وصول `Jbr Seo` إلى التطبيق من Meta، وتمت الموافقة تلقائيًا لأن المستخدم Admin للتطبيق.

لا تكتب App Secret أو Access Tokens في أي ملف، git، أو رسالة. المالك يريدها ظاهرة وقابلة للتعديل داخل الأدمين فقط.

## ما تم تنفيذه في Meta

### مدونتي

- Marketing API أُضيف إلى تطبيق `modonty`.
- System User موجود: `Conversions API System User` (ID `61583458896568`).
- حساب `ammwag` أُسنِد له بصلاحية **View performance** فقط.
- التطبيق أُسنِد له بصلاحية كاملة على التطبيق.
- تم إنشاء توكن سابق، لكنه ظهر في محادثة فلا يعتمد للإنتاج؛ يجب تدويره.

### جبر SEO

- System User موجود: `Conversions API System User` (ID `61592645941942`).
- حساب `Jbrseo SA` أُسنِد له بصلاحية **View performance** فقط.
- وصول Business جبر لتطبيق `modonty` تمّت الموافقة عليه.
- التطبيق أُضيف إلى أصول System User بصلاحية `Develop app`، بحيث يصبح زر Generate token متاحًا.
- تم اختبار توكن جبر مرة عبر Meta Graph API بنجاح: وصل إلى `act_1260508182300304`، واسم الحساب `Jbrseo SA` والعملة `SAR`.
- لا تعتمد أي توكن تم لصقه في المحادثة؛ يجب إصدار توكن جديد وحفظه مباشرة في الأدمين.

## حالة حسابات الإعلانات

- `Jbrseo SA` موقوف حاليًا بسبب وسيلة الدفع (`account_status` أعادت القيمة `3` عبر Graph API).
- هذا يمنع تشغيل حملات جديدة، لكنه لا يمنع تجهيز الربط أو اختبار صلاحية القراءة عند وجود توكن صحيح.

## تغييرات الكود المنفذة

المسار الأساسي:

`admin/app/(dashboard)/settings/advertising-platforms/`

- `advertising-platforms-form.tsx`
  - بطاقتا مدونتي وجبر SEO تعرضان فقط Ad Account ID وBusiness Manager ID.
  - كرت مستقل باسم **إعدادات Meta المشتركة** يعرض:
    - Meta App ID
    - Meta App Secret
    - System User Access Token
    - حفظ المفاتيح
    - زر اختبار مدونتي وزر اختبار جبر SEO.
  - توجد defaults لجبر من seed JSON.

- `actions.ts`
  - `testMetaConnection` يستدعي Meta Graph API من الخادم ويعيد اسم الحساب/العملة فقط، بدون إعادة التوكن.
  - حفظ Meta credentials عُدّل ليخزن `meta` مباشرة في JSON لأن المالك يريدها مكشوفة في لوحة الأدمين.
  - الحقول الفارغة في TikTok/Snap/Google كانت تولّد `undefined` وتكسر Prisma/Mongo؛ تم إصلاح `protect()` بحيث يحذف القيم الفارغة قبل الحفظ.

- `admin/lib/settings/advertising-platforms.seed.json`
  - يحتوي defaults غير السرية:
    - مدونتي: Ad Account ID وBusiness ID
    - جبر SEO: Ad Account ID `1260508182300304` وBusiness ID `1593662981776462`

## المشكلة المتبقية التي يجب على Claude حلها

المستخدم أبلغ أن Meta App Secret وSystem User Token لا يستمران بعد الضغط على الحفظ وإعادة التحميل.

### المطلوب التشخيصي

1. افتح `http://localhost:3001/settings/advertising-platforms` كـAdmin.
2. أدخل قيم اختبار غير حساسة في App Secret وSystem Token.
3. اضغط **حفظ مفاتيح ميتا**.
4. أعد تحميل الصفحة وتأكد أن القيم بقيت ظاهرة.
5. راقب toast وserver logs وبيان `Settings.adPlatformAccounts` في Mongo.
6. لا تدّع النجاح قبل اختبار save + refresh فعلي.

### ملاحظة هيكلية مهمة

App ID وApp Secret مشتركان، لكن الـSystem User Token ليس بالضرورة مشتركًا:

- يعمل توكن واحد للحسابين فقط إذا كان **System User نفسه** لديه `View performance` على الحسابين.
- الوضع الحالي يحتوي System User منفصلًا لكل Business Portfolio.
- إذا بقي هذا التصميم، يجب تعديل schema/UI لتخزين توكن منفصل لكل علامة، مع إبقاء App ID/App Secret مشتركين.
- لا تضع توكن جبر في الحقل المشترك إن كان سيستبدل توكن مدونتي.

## توصية التنفيذ التالية

1. أصلح اختبار الحفظ أولًا.
2. عدّل JSON إلى شكل واضح مثل:

```ts
{
  meta: {
    appId: string,
    appSecret: string,
    accounts: {
      modonty: { adAccountId, businessId, systemUserToken },
      jbrseo: { adAccountId, businessId, systemUserToken },
    }
  }
}
```

3. اعرض App ID وApp Secret مرة واحدة في كرت مشترك، واعرض Token داخل كل بطاقة حساب أو في قسم Tokens منفصل.
4. اجعل زر اختبار كل حساب يستخدم التوكن الخاص به.
5. بعد النجاح، ابدأ API endpoint لسحب campaigns/insights فقط (`ads_read`) واحفظ بيانات التقارير في Mongo.
