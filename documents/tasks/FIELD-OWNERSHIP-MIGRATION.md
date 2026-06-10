# نقل ملكية الحقول — سجل التتبّع

> **الهدف**: إدخال واحد لكل حقل. الحقول التي توثّقها مودونتي (admin-owned) تُزال خاناتها من الكونسول وتُعرض read-only، والأدمن هو مصدر الإدخال في **الإنشاء والتعديل** معًا.

**آخر تحديث**: 2026-06-10
**الحالة**: ✅ **انحلّ + تأكّد بالدليل (DBG + إعادة تحميل).** كان فيه **بَقّان منفصلان** منعا حفظ حقول الأدمن:
1. **silent-drop في التوجيه (حقيقي، أُصلح):** `client-form-config.ts` كانت مجموعات contact/address/legal `fields:[]` فاضية، فكل الحقول تُخرَّط لـ«required» و`updateRequiredFields` يكتب 9 حقول بس. **الإصلاح:** عبّيت `contact.fields=[url,phone,contactType,sameAs]` · `address.fields=[addressCountry]` · `legal.fields=[legalForm]` وشِلتها من «required» → الدوال المخصّصة (`updateContactFields`/`updateAddressFields`/`updateLegalFields`) تشتغل بتطبيعاتها. **بحقولها فقط** (الدولة في address، الشكل في legal) فحقول الكونسول (vatID/تفاصيل العنوان) تبقى سليمة.
2. **validation block (سبب فشل اختباراتي):** جبر سيو عنده `industryId=null`، والـ `clientFormSchema` يطلبه string → «Expected string, received null» → الـ form ما يُرسل أصلاً (الـ callback الثاني). أي عميل بـ industryId فاضي ما ينحفظ من الأدمن — **بَق منفصل** (إما نخلّي industryId nullable أو نلزم تعيينه). حلّيته لجبر سيو بتعيين صناعة.

**دليل قاطع (DBG logs):** بعد تعيين صناعة، الحفظ اشتغل → `groupedData.address={"addressCountry":"SA"}` · `results: address fieldsUpdated:1` · `legal fieldsUpdated:1` (Sole Proprietorship) · `contact fieldsUpdated:0` (url/phone بلا تغيير = ما مُسحت). إعادة تحميل = الدولة «السعودية (SA)» باقية بصرياً. **tsc نظيف · DBG logs أُزيلت.**

**✅ مدفوع 2026-06-10** — commit `b00e804` · admin v0.75.0 · console v0.16.0 (مع إعادة تصميم بروفايل الكونسول). tsc admin+console = 0 · أمان نظيف · الدائرة مقفلة (الكونسول ReadonlyRow ↔ admin inputs).

**✅ تابع (محلي، غير مدفوع) 2026-06-10 — إزالة تاب Settings من فورم تعديل العميل:** شِلت أكورديون Settings + فصلت `subscriptionStatus`/`paymentStatus` عن كل المجموعات في `client-form-config.ts` (groupFieldsByTab يُسقط أي حقل بلا مجموعة → حفظ التعديل ما يلمسهم). ملكيتهم صارت للـ Activate/Suspend بالسايدبار حصراً (التفعيل يخلّي status=ACTIVE + payment=PAID). الملفات: `client-form.tsx` · `client-form-config.ts`. tsc admin=0 · مؤكّد حيّاً (الأقسام 6، Settings اختفى). تعليم `OVERDUE` يدوياً ينتظر workflow الفوترة.

**✅ تابع (محلي، غير مدفوع) 2026-06-10 — قفل دائرة SEO للكونسول + حذف قسم SEO Validation:**
- **قفل الدائرة (الكونسول):** اكتُشف بالتحقيق إن الذاكرة قديمة — `updateProfile` **يستدعي `regenerateClientSeo`** أصلاً (نفس مولّد الأدمن). الناقص الوحيد = كاش مودونتي العام. أُضيف `console/lib/revalidate-modonty-tag.ts` + نداء `revalidateModontyTag("clients")` في `updateProfile`. يعتمد على `REVALIDATE_SECRET` بـ env الكونسول. **فرق متبقّي:** cascade مقالات العميل (الأدمن يعمله، الكونسول لا) — للنقاش.
- **حذف قسم SEO Validation من فورم التعديل:** شِلت أكورديون "SEO Validation" + import + `siteUrl` (صار يتيم) من `client-form.tsx` + `loadSiteUrl`/`siteUrl` من صفحة التعديل + مجموعة `seo-validation` من الإعداد. **ملف المكوّن `client-seo-validation-section.tsx` باقٍ عمداً** — صفحة `/clients/[id]/seo` (`client-seo-form.tsx`) تستخدمه = صفر dead code. tsc admin+console=0 · مؤكّد حيّاً (5 أقسام).

### 🔚 آخر بند قبل اكتمال الـ task (خالد 2026-06-10)
**cascade مقالات العميل من الكونسول.** الأدمن `updateClient` بعد حفظ بيانات العميل يعيد توليد JSON-LD/metadata **لكل مقالات العميل** + `revalidateModontyTag("articles")`. الكونسول `updateProfile` لا يفعل — يكتفي بـ `regenerateClientSeo` (صفحة العميل) + `revalidateModontyTag("clients")`.
- **الخطر:** لو بيانات العميل (اسم/شعار/publisher) مُضمّنة **فعلياً** داخل JSON-LD المقالات (مش `@id` مرجعي)، فتعديل العميل من الكونسول يترك مقالاته بـ JSON-LD قديم.
- **الخطوة:** نتحقّق من مولّد JSON-LD للمقال (هل يُضمّن client data أم يرجعه بـ @id)؛ لو مُضمَّن → نضيف نفس الـ cascade للكونسول (مع مراعاة الأداء: إعادة توليد كل المقالات عند كل حفظ بروفايل). + نتأكد `REVALIDATE_SECRET` موجود بـ env الكونسول على Vercel.
- **الحالة:** معلّق — هذا آخر شي ننفّذه ثم نقفل الـ task.

**متبقّي (غير حاجز، لدفعات لاحقة):**
1. **dataLayer**: دمج `addressNeighborhood` في `streetAddress` (تنظيف Schema.org PostalAddress).
2. **قرار industryId**: عملاء بـ `industryId=null` ما ينحفظون من الأدمن (`clientFormSchema` يطلب string) — إما nullable أو نلزم تعيينه.
3. **معلّق (خالد 2026-06-10) — تنظيف فورم الأدمن من حقول الكونسول:** جرد (قراءة فقط) كشف 3 حقول يعدّلها الكونسول وما زال الأدمن فيه خانة لها:
   - `description` (وصف المنظمة، قسم SEO) → **يُكتب فعلاً** بـ `updateSEOFields` = خطر دهس قيمة العميل → نشيله/read-only.
   - `slogan` (Basic Info → BusinessBrief) → **inert** (ما يكتبه أي writer، خانة زومبي مضلّلة) → نشيله.
   - `name` → مشترك (الأدمن يحتاجه عند الإنشاء + الكونسول يعدّله) → **قرار معلّق**: يبقى أم read-only في الأدمن edit.
   - الباقي نظيف أصلاً (legalName/foundingDate/العنوان/vatID/taxID/CR/ساعات — الأدمن يراقبها بلا خانة).
   - ملاحظة جانبية للفحص: `keywords` + `knowsLanguage` (قسم SEO) يبدو إنهم ما يُحفظون من أي writer.

## ✅ تحقّق السلامة النهائي (2026-06-09) — صفر تأثير على function/save/JSON-LD
1. **`updateProfile`**: كل حقل محميّ بـ `if (data.X !== undefined)` → الحقول المنقولة للـ read-only تصل `undefined` فلا تُكتب → قيمة الأدمن تبقى. (دليل كود + تست حيّ: بعد حفظ فعلي، كل القيم الموثّقة بقيت سليمة).
2. **`regenerateClientSeo`**: يقرأ **كل الحقول من DB** (مش من حمولة الكونسول) ويبني الـ JSON-LD عبر نفس مولّد الأدمن `generateCompleteOrganizationJsonLd`. حذف حقول من الحمولة = صفر أثر على الـ JSON-LD.
3. **بطاقة جاهزية SEO بعد الحفظ**: بيانات مهيكلة مولّدة ✅ · صحة البنية بلا أخطاء ✅ · بلا تحذيرات ✅ · التواصل/sameAs/ضريبي/سجل/الهوية كلها ✅. النسبة 82% ثابتة (صفر regression).
4. tsc نظيف · console المتصفح صفر errors · الحفظ نجح end-to-end.
5. **build إنتاج** `pnpm build:console` = EXIT 0 (✓ Compiled · ✓ TypeScript · ✓ static pages 7/7) · الـ route `/dashboard/verification` اختفى من قائمة الـ routes (حذف نظيف، صفر مرجع).
6. **الـ JSON-LD الخام الفعلي** (من الصفحة العامة modonty `/clients/[slug]`، `<script ld+json>`): `@type:LocalBusiness` + `url` + `sameAs` + `vatID`+`taxID`(mirror مصر) + `address` كامل (streetAddress+الحي+المدينة+المنطقة+EG+postalCode) + `contactPoint`(contactType+email+telephone) + `openingHoursSpecification` (البنية الجديدة dayOfWeek/opens/closes) + aggregateRating. **كل الحقول المنقولة موجودة + يعكس منطق تعديلاتي (taxID=vatID، ساعات بنية جديدة) = regenerate نجح فعليًا.**
   - (الـ 5 console errors على الصفحة العامة = `JWTSessionError` من تضارب JWT cookie لتشغيل modonty+console على نفس port 3000 محليًا — مش من التعديلات ولا JSON-LD؛ منفصلان بالإنتاج.)

---

## 📱 مراجعة responsive للكونسول كامل (2026-06-09) — تمّت
فحص آلي (overflow أفقي `scrollWidth>clientWidth`) + بصري على **موبايل 375px** (كل الصفحات) + عيّنة **تابلت 768px**.
- **مشكلة واحدة وُجدت وأُصلحت**: `site-health` — دائرة الـ score الإجمالية كانت **مقصوصة** عند الحافة على الموبايل + الرابط الطويل يدفع التخطيط. الإصلاح في `score-hero.tsx`: `flex w-full min-w-0 ... sm:w-auto` + `min-w-0 flex-1` للنص + `truncate` للرابط. تأكّد: صفر overflow بعدها.
- **24+ صفحة نظيفة** (ovPx=0): dashboard · profile · articles + المحرّر + المعاينة · leads · subscribers · bookings · gallery · media · seo+intake/keywords/competitors · settings · analytics · questions · content · faqs · page-content · page-faq · campaigns · support · comments · client-comments · client-reviews · الموبايل drawer (badge YMYL يعمل + verification محذوف).
- **offenders مقبولة (مش مشاكل، ovPx=0)**: جداول المقالات تتمرّر داخليًا (v1.57.1) · عناصر زخرفية `pointer-events-none absolute` مقصوصة بـ overflow-hidden · tabs في شريط أفقي scrollable.
- tsc نظيف.
- **bug تمرير الـ drawer**: `mobile-sidebar` كان الـ `SheetContent` بلا `flex flex-col`، فالـ `nav` (`flex-1 overflow-y-auto`) ما يشتغل → القائمة الطويلة ما تتمرّر. أُصلح بإضافة `flex flex-col` للـ SheetContent. تأكّد: nav scrollable (672>538)، تسجيل الخروج ثابت.
- **bug اتجاه الـ Sheet (RTL)**: `sheet.tsx` كان يخلط موضع logical (`end-0`/`start-0`) مع حركة physical (`slide-from-right`/`left`) → الـ drawer يستقر عكس ما ينزلق. أُصلح بجعل الموضع physical متطابقًا (`right-0`+`border-l` / `left-0`+`border-r`). النتيجة: الموبايل drawer (side=right) صار يجي من **اليمين** ✅ (مؤكّد بصريًا)، و8 detail panels (side=left) صارت متّسقة (يسار). tsc نظيف.

## 🔒 السياسة (مقفولة 2026-06-09)

1. **لا agents خلفية على الأدمن.** كل تعديل أدمن يصير في الـ foreground وخالد شايفه.
2. خالد يعطي اسم الحقل + المالك. أنا أنفّذ.
3. **«شيل من الكونسول»** = شيل الخانة (الإدخال) + اعرضه read-only في كرت «بيانات موثّقة من مودونتي»، **مش حذف نهائي**.
4. لكل حقل يُزال من الكونسول: (أ) شيل الـ input، (ب) شيله من حالة الفورم ومن حمولة `updateProfile` (الكونسول ما يدوس قيمة الأدمن)، (ج) اعرضه read-only، (د) حدّث عدّاد الاكتمال وعدّادات الأقسام.
5. **نقطة أمان**: ما يُزال إدخال أي حقل من الكونسول إلا بعد تأكيد أن الأدمن يُدخله في الإنشاء **و**التعديل.
6. ما في `push` إلا بعد: `tsc` للتطبيقين + تست حيّ + موافقة خالد.

---

## 📋 جدول الحقول

| الحقل | المفتاح | المالك | الكونسول | الأدمن | تحقّق حيّ | ملاحظات |
|---|---|---|---|---|---|---|
| القطاع | `industryId` | admin | ✅ أُزيل الإدخال + read-only | ✅ موجود أصلًا (إنشاء+تعديل) | ⬜ | — |
| نوع المنظمة | `organizationType` | admin | ✅ أُزيل الإدخال + read-only | ✅ في `basic-info` (تعديل) + أُصلح bug الحفظ · **تكرار `seo-section` أُزيل 2026-06-10** | ✅ | إدخال واحد نظيف الآن |
| الرابط الأساسي | `canonicalUrl` | admin/نظام | ✅ أُزيل الإدخال · أُزيل القسم ٦ (ترقيم ٧→٦) · يُعرض **بارز في الـ header مع زر نسخ** (`profile-url-bar.tsx`) | ✅ موجود في `seo-section` + أداة `canonical-sanitizer` | ⬜ | رابط صفحته الحيّة — للعرض/النسخ فقط |
| الشكل القانوني | `legalForm` | **admin** | ✅ أُزيل الإدخال + read-only في كرت «بيانات موثّقة» (مع القطاع ونوع المنظمة) · `optionSelect` المحذوف · `legalFormLabel` للعرض | ✅ **مفعّل** (2026-06-10): `Select` من `LEGAL_FORMS` في `create-client-form` (إنشاء) + `basic-info-section` (تعديل). **لم** نرندر `LegalSection` اليتيمة (فيها vatID console-owned). | ✅ | تحقّق حيّ: القائمة تعرض الأشكال السبعة + البايندنغ |
| البريد الإلكتروني | `email` | **admin** | ✅ أُزيل الإدخال + read-only **في كرت «بيانات موثّقة»** (ملاحظة «معرّف الدخول») · `ReadonlyRow` عُمّم (`hint`+`ltr`) | ✅ موجود في `basic-info-section` (إنشاء+تعديل) + `create-client:108` + فحص تكرار | ⬜ | **معرّف الدخول** — `auth.config.ts:25-28` يطابق الدخول على `Client.email`؛ تعديله من البروفايل يكسر دخول العميل. الأدمن يُدخله أصلًا → **لا blocker** |
| الموقع الإلكتروني | `url` | **admin** | ✅ أُزيل + read-only في كرت «بيانات موثّقة» | ✅ موجود في `basic-info-section:192` (إنشاء+تعديل) + create/update | ⬜ | الأدمن يُدخله أصلًا → **لا blocker** |
| الحسابات الاجتماعية | `sameAs` | **admin** | ✅ أُزيل + read-only في كرت «بيانات موثّقة» (join بـ «، ») | ✅ **مفعّل** (2026-06-10): `SocialProfilesInput` (كان يتيماً) مرندَر في `basic-info-section` (تعديل) — كشف منصّة تلقائي + chips + «Auto-detects». backend (`create:107`/`update:320`) يحفظه. **الإنشاء مينيمال بقرار خالد** (يُضاف بالتعديل). | ✅ | تحقّق حيّ: LinkedIn+YouTube كُشفا تلقائياً |
| الدولة | `addressCountry` | **admin** | ✅ أُزيل + read-only في الكرت · `isSaudi` صار من `initial.addressCountry` (يتحكّم بالضرائب + الرقم الإضافي) · `countrySelect` المحذوف · `countryName` للعرض | ✅ **مفعّل** (2026-06-10): `Select` من `getActiveCountries()` (SA/EG/AE) في `create-client-form` (إنشاء، افتراضي SA) + `basic-info-section` (تعديل، بلا افتراضي صامت). **لم** نرندر `AddressSection` اليتيمة (باقي العنوان console-owned). countries تمرّ عبر `edit/page → ClientForm → BasicInfoSection`. | ✅ | تحقّق حيّ: السعودية انحدّدت + البايندنغ |
| نوع جهة الاتصال | `contactType` | **admin** | ✅ أُزيل + read-only في كرت «بيانات موثّقة» | ✅ موجود في `basic-info-section:177` (إنشاء+تعديل) + create/update | ⬜ | الأدمن يُدخله أصلًا → **لا blocker**. ملاحظة: القسم 2 «التواصل» صار حقل واحد (phone) — مرشّح للدمج لاحقًا |
| الهاتف | `phone` | **admin** | ✅ أُزيل + read-only في الكرت (مجموعة الموقع والتواصل) | ✅ موجود في `basic-info-section:167` (إنشاء+تعديل) + create:109 | ⬜ | الأدمن يُدخله أصلًا → **لا blocker**. القسم 2 رجع «العنوان» فقط (6/6 مصري · 7/7 سعودي) |
| تاريخ التأسيس | `foundingDate` | **console** | ✅ نُقل للقسم 1 «المعلومات الأساسية» · الروابط الاجتماعية نُقلت للقسم 2 «التواصل» · أُلغي القسم 5 (6→5 أقسام) | ✅ **لا إدخال أدمن أصلاً** (تحقّق 2026-06-10: `foundingDate` يُقرأ فقط في `watch`/seo-validation، صفر `name="foundingDate"` كحقل إدخال). الـ ledger السابق كان غلط. console-owned صح. | ✅ | عكس الاتجاه — لا شيء يُحذف. الـ schema + مولّدات SEO تبقى |

> العمود «الأدمن» للحقول اللي عدّلها الـ agent بالخلفية = **محتاجة مراجعة مشتركة مع خالد** قبل اعتمادها (السياسة الجديدة).

---

## 🐛 ما اكتشفه الـ agent (للمراجعة المشتركة)

**`organizationType` كان يُهمَل بصمت في تعديل الأدمن**: الحقل يُوجَّه لمجموعة `seo` في `client-form-config.ts`، لكن `updateSEOFields` في `update-client-grouped.ts` ما كان يقرأه/يكتبه → أي تعديل للعميل من الأدمن يضيع.
- **الإصلاح**: أُضيف `organizationType` للـ select + للكتابة (`update-client-grouped.ts:364, 382-385`) + تطبيع `normalizeOrganizationType`.
- **أُضيف إدخال الإنشاء**: `basic-info-section.tsx:216-235` (لم يكن له إدخال في وضع الإنشاء أصلًا) + تطبيع في `create-client.ts:171-178`.

---

## ❓ قرارات معلّقة

1. **تكرار `organizationType` في الأدمن (وضع التعديل)**: صار يظهر مرتين — في `basic-info-section` (الجديد، إنشاء+تعديل) وفي `seo-section` (القديم، تعديل فقط). الاثنان مربوطان بنفس حقل RHF. **التوصية**: إزالة نسخة `seo-section`، إبقاء `basic-info-section` فقط → إدخال واحد نظيف.

2. **`foundingDate` — إزالة الإدخال من الأدمن (سوا)**: نشيل الخانة من `basic-info-section.tsx` + الـ validation schemas + الكتابة في `create-client`/`update-client-grouped`. **لا نلمس** `schema.prisma` ولا مولّدات الـ SEO (`generate-organization-structured-data.ts`, `structured-data.ts`, `knowledge-graph-generator.ts`) — القيمة تبقى تُقرأ من الـ DB ويدخلها العميل من الكونسول. النتيجة: عميل جديد يُنشأ بدون تاريخ تأسيس، والعميل يضيفه من الكونسول.

3. **مكان `foundingDate` في الكونسول** — معلّق قرار خالد (انظر التوصية بالشات).

---

## 📂 الملفات الملموسة

### الكونسول (تم — أنا)
- `console/app/(dashboard)/dashboard/profile/components/profile-form.tsx` — أُزيل إدخال `industryId` + `organizationType`، أُضيف كرت read-only «بيانات موثّقة من مودونتي» + مكوّن `ReadonlyRow`، نُظّفت حالة الفورم وحمولة `updateProfile`.
- `console/app/(dashboard)/dashboard/profile/page.tsx` — أُزيل الحقلان من `COMPLETENESS_SECTIONS`.

### إعادة هيكلة أقسام الكونسول (تنظيم بصري — ليس نقل ملكية)
> بطلب خالد لتبسيط الفورم. الأقسام نزلت **من 6 إلى 4**:
- **القسم 1 «البيانات الأساسية»**: استقبل `foundingDate` (من القسم 5) + كل «السجلات الرسمية» `commercialRegistrationNumber`/`vatID`/`taxID`/`legalForm` (من القسم 4) تحت فاصل رفيع «السجلات الرسمية» داخل نفس الكرت.
- **القسم 2 «التواصل»**: استقبل `sameAs` (الروابط الاجتماعية، من القسم 5).
- أُلغي القسم 5 «النشاط التجاري» والقسم 4 «السجلات الرسمية». `legalKeys`/`businessKeys` أُدمجت.
- **بعد نقل email/contactType/sameAs للـ read-only**: القسم 2 «التواصل» بقي فيه `phone` فقط → **دُمج `phone` في القسم «العنوان»** (أول حقل) وأُلغي قسم التواصل. الأقسام الآن **3**: (1) البيانات الأساسية + السجلات، (2) العنوان والتواصل (phone+address)، (3) ساعات العمل. عدّاد الترويسة `step/3`. `phone` في `addressKeys`. `Phone` icon أُزيل من الاستيراد. عدّادات `COMPLETENESS_SECTIONS` في `page.tsx` تُطابق.

### التوثيق المهني (YMYL) — نُقل من الـ sidebar للبروفايل (تم — الكونسول)
- `YmylSection` (مستقل بحفظه الخاص `updateYmylData`، يحمي نفسه: `if(!isYmyl) return null`) صار يُعرض **داخل صفحة البروفايل** بعد الترويسة (gate بارز) + banner amber التحذيري — **فقط للعملاء YMYL**.
- `page.tsx`: select += `isYmyl`/`ymylCategory`/`ymylData`؛ جلب `licensingAuthority` (لو YMYL).
- أُزيل رابط «التوثيق المهني» من `sidebar.tsx` + `mobile-sidebar.tsx`. `/dashboard/verification` → redirect لـ `/dashboard/profile` (للروابط القديمة).
- الـ route القديم `/dashboard/verification` **حُذف نهائيًا** (صفر روابط تشير له بعد التحقق) + المفتاح الميت `ar.nav.verification`.
- **badge YMYL** (نص «YMYL» + نقطة حمراء نابضة `animate-ping` + لون destructive) يظهر للعملاء YMYL في **مكانين**: ترويسة صفحة البروفايل + جنب رابط «بيانات نشاطك» في الـ sidebar (desktop + mobile). `SidebarNavItem` اكتسب `badgeVariant: "default"|"danger"`. `isYmyl` رجع للسلسلة (مستخدم فعليًا الآن للـ badge). tsc نظيف.

### التصميم النهائي — site survey + polish (تم — الكونسول)
- إصلاح وصف القسم 1 (كان يذكر «الموقع» المنقول للأدمن) → «اسم نشاطك، شعارك، وصفك، وسجلاتك الرسمية».
- القسم 2 عنوانه «العنوان والتواصل» (بدل «العنوان» وحده، لأنه يضم الهاتف).
- كرت «بيانات موثّقة»: accent **أخضر** (ShieldCheck) ليتميّز كـ«مقفل/موثّق» عن أقسام التحرير (primary)؛ ترتيب الحقول مجمّع منطقيًا (هوية رقمية → تصنيفات → موقع/تواصل).
- أيام العمل: **chips** (label/checkbox داخل بطاقة بـ `has-[:checked]` تتلوّن primary) بدل checkboxes عارية.
- **العدّادات مضبوطة**: القسم 1 = 8 · العنوان = 7 (مصري)/8 (سعودي) · ساعات العمل = workDays/7. اكتمال الملف 100% على عميل التست.
- **الترتيب الشجري** (معتمد عبر mockup v2): الكرت = هوية رقمية → تصنيف → تواصل وموقع (الهاتف←نوع الاتصال←الدولة). القسم 1 = أسماء→تاريخ التأسيس→الشعار(full)→الوصف→السجلات. القسم 2 = المدينة→المنطقة→الحي→الشارع→رقم المبنى→[الرقم الإضافي سعودي]→الرمز البريدي. `field` يدعم `full` الآن.
- **الحي (`addressNeighborhood`)**: ⏸️ **توصية معلّقة (dataLayer سوا)** — Schema.org/Google لا يعترفان بـ `addressNeighborhood` (المولّد `generate-organization-jsonld.ts:306-308` يكتبها كخاصية غير قياسية → `UNKNOWN_FIELD` محتمل). الإصلاح: دمجها في `streetAddress` (مثل رقم المبنى) بدل خاصية مستقلة. يبقى محرّرًا بالكونسول، الإصلاح في المولّد.

### ساعات العمل — تبسيط الإدخال (تم — الكونسول)
> بدل 14 حقل (7 أيام × فتح/إغلاق): **وقت فتح موحّد + وقت إغلاق موحّد + checkboxes للأيام**. default = الأحد–الخميس عمل (السبت+الجمعة إجازة).
- `buildHours`+`OpeningHoursSpec` استُبدلا بـ `readHours` (يقرأ المصفوفة المخزّنة → نموذج بسيط). الحفظ يبني `openingHoursSpecification` من **أيام العمل فقط** (`DAY_ORDER.filter(workDays).map({dayOfWeek,opens,closes,closed:false})`).
- **JSON-LD مؤكّد بالدليل** (محاكاة منطق المولّد `generate-organization-jsonld.ts:362-370`): أيام العمل تخرج بأوقات صحيحة، **أيام الإجازة غائبة تمامًا** (= مغلق في Schema.org). يُصلح bug قائم: المولّد يتجاهل `closed`، فالأيام المغلقة سابقًا (بأوقات افتراضية) كانت **تتسرّب مفتوحة**. العرض في modonty (`client-hours.tsx`/`client-open-now-badge.tsx`) robust مع الأيام الغائبة.

### الحقول الضريبية حسب الدولة (تم — الكونسول)
> **بحث مؤكّد**: السعودية = رقمان منفصلان (VAT 15 خانة + TIN 10 أرقام، هيئة الزكاة والضريبة والجمارك). مصر وغيرها = **رقم واحد** (9 أرقام، الرقم الضريبي = رقم القيمة المضافة، مصلحة الضرائب المصرية). تأكيد من Schema.org الرسمي: `vatID`="value-added Tax ID with national prefix" · `taxID`="Tax/Fiscal ID e.g. TIN".
- `addressCountry === "SA"` → حقلان موضّحان: «رقم ضريبة القيمة المضافة (VAT)» (+ تلميح «15 رقم يبدأ وينتهي بـ 3») + «الرقم المميز / المعرّف الضريبي (TIN)».
- غير السعودية → **حقل واحد** «الرقم الضريبي» يُكتب في `vatID`، ويُعكس على `taxID` في الـ submit (`taxID: isSaudi ? form.taxID : form.vatID`) — مطابق لسلوك الأدمن `legal-section.tsx:42`.
- **أثر الـ JSON-LD = صفر** (مؤكّد بالكود): المولّد `generate-organization-jsonld.ts:229-233` يكتب كل حقل مستقلاً (`if`)، وعدّاد الجودة `jsonld-score.ts:173` يقبل `vatID || taxID`. العرض الذكي = أي حقل يُملأ فقط.
- التسميات حُدّثت في `lib/ar.ts` (`vatID`/`taxID`/`vatIDHint`/`taxNumber` جديد). كلمة «(زاتكا)» أُزيلت (محايدة للبلدين). `taxID` خرج من عدّادات الاكتمال (يتجنّب ازدواج العدّ مع الـ mirror).
- **الرقم الإضافي (`addressAdditionalNumber`)**: سعودي بحت (العنوان الوطني، 4 أرقام). صار **يظهر للسعودي فقط** (`isSaudi`)، اسمه أوضح «الرقم الإضافي (العنوان الوطني)» + تلميح. عدّاد العنوان في الفورم ديناميكي (`addressKeys` يضمّه فقط لو سعودي)، و`page.tsx` يستثنيه من الاكتمال لغير السعودي → يُصلح مشكلة احتساب حقل سعودي لعميل مصري. `isSaudi` نُقل لأعلى الكومبوننت (يخدم الضرائب + العنوان معًا).

> **للأدمن (سوا لاحقاً)**: نفس المنطق الذكي حسب الدولة يُطبّق في `admin/legal-section.tsx` (حالياً يعكس vatID→taxID للكل + تسمية «VAT ID (ZATCA)» سعودية بحتة).

### الأدمن (سوّاه agent — محتاج مراجعة مشتركة)
- `admin/app/(dashboard)/clients/components/form-sections/basic-info-section.tsx` — أُضيف `organizationType` FormSelect.
- `admin/app/(dashboard)/clients/actions/clients-actions/create-client.ts` — تطبيع + import.
- `admin/app/(dashboard)/clients/actions/clients-actions/update-client-grouped.ts` — إصلاح حفظ `organizationType` + import.
