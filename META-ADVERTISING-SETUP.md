# ربط حسابات Meta للإعلانات — خطوات العمل اليدوية

هذا الدليل يربط حسابَي **مدونتي** و**جبر SEO** بغرض قراءة بيانات الإعلانات فقط. لا يمنح صلاحية إنشاء أو تشغيل حملات.

## البيانات الثابتة

| العنصر | مدونتي | جبر SEO |
| --- | --- | --- |
| اسم الـBusiness Portfolio | Dreamtoapp 1 | Jbr Seo |
| Business Portfolio ID | `545582405315442` | `1593662981776462` |
| Ad Account ID | `790007510859024` | `1260508182300304` |
| اسم الحساب الإعلاني | ammwag | Jbrseo SA |

التطبيق المشترك هو **modonty** ومعرّف التطبيق `2634180453617692`.

## 1. افتح إعدادات Meta الصحيحة

1. افتح [Meta Business Settings](https://business.facebook.com/latest/settings/).
2. من أعلى الصفحة، اختر الـBusiness Portfolio المطلوب قبل أي تعديل:
   - `Dreamtoapp 1` لمدونتي.
   - `Jbr Seo` لجبر SEO.
3. لا تستخدم `Jbrseo-EG` أو حساب `EG account`؛ هذا الحساب المصري متوقف وليس ضمن الربط الحالي.

## 2. تجهيز مستخدم النظام لكل حساب

كرر الخطوات داخل كل Business Portfolio:

1. اذهب إلى **Users → System users**.
2. اختر مستخدم النظام `Conversions API System User`، أو أنشئ واحدًا جديدًا إذا لم يكن موجودًا.
3. من قائمة المستخدم اختر **Assign assets**.
4. اختر **Ad accounts** ثم الحساب الإعلاني الصحيح.
5. فعّل فقط **View performance**.
6. لا تفعّل `Manage campaigns (ads)` ولا `Manage ad accounts` لأننا نريد القراءة فقط.
7. اضغط **Assign assets** ثم **Done**.

## 3. إتاحة تطبيق modonty لجبر SEO

هذه الخطوة مطلوبة لجبر فقط لأن التطبيق مملوك لـDreamtoapp 1:

1. داخل `Jbr Seo` اذهب إلى **Accounts → Apps**.
2. اختر **Add → Request access to an app ID**.
3. أدخل App ID: `2634180453617692`.
4. أرسل الطلب. إذا كنت Admin للتطبيق ستتم الموافقة تلقائيًا؛ وإلا وافق على الطلب من مالك التطبيق في Dreamtoapp 1.
5. ارجع إلى **Users → System users → Conversions API System User → Assign assets**.
6. اختر **Apps → modonty** ثم فعّل **Develop app** فقط واضغط **Assign assets**.

## 4. توليد System User Access Token

نفّذ الخطوات لكل Business Portfolio:

1. افتح **Users → System users** واختر `Conversions API System User`.
2. اضغط **Generate token**.
3. اختر تطبيق `modonty`.
4. عند **Token expiration** اختر **Never**.
5. عند الصلاحيات اختر **ads_read** فقط.
6. اضغط **Generate token**.
7. انسخ التوكن مرة واحدة واحفظه مباشرة في الأدمين. لا ترسله في محادثة أو رسالة.

## 5. إدخال البيانات في الأدمين

افتح:

`http://localhost:3001/settings/advertising-platforms`

1. في بطاقة **مدونتي**، تأكد من Ad Account ID وBusiness Manager ID.
2. في بطاقة **جبر SEO**، تأكد من Ad Account ID وBusiness Manager ID.
3. في كرت **إعدادات Meta المشتركة** أدخل:
   - Meta App ID
   - Meta App Secret
   - System User Access Token
4. اضغط **حفظ مفاتيح ميتا**.
5. اضغط **اختبار اتصال مدونتي** ثم **اختبار اتصال جبر SEO**.

## مهم: هل نستخدم توكنًا واحدًا أم اثنين؟

- استخدم **توكنًا واحدًا** فقط إذا كان System User نفسه يملك `View performance` على الحسابين.
- استخدم **توكنين منفصلين** إذا كان لكل Business Portfolio System User مختلف — وهذا هو الوضع الحالي الأكثر وضوحًا لمدونتي وجبر SEO.
- App ID وApp Secret يمكن أن يكونا مشتركين، لكن التوكن يعتمد على System User وصلاحياته.

## التحقق النهائي

نجاح الاختبار يعني أن API تقرأ اسم الحساب والعملة والحالة. الحساب قد يظل متوقفًا بسبب الدفع، لكن ذلك لا يمنع تجهيز التكامل أو محاولة قراءة البيانات التاريخية عند توفر الصلاحية.
