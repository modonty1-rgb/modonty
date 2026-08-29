# سجل تغييرات المشروع — console-mobile

هذا السجل إلزامي لكل إعداد أو تبعية أو بناء أو قرار تقني يخص المشروع. المرجع هو الملف والحالة الفعلية على الجهاز، لا الذاكرة.

## 2026-08-29 — بدء تنفيذ الصور المعتمدة: S00 والأسطح ذات العقد الحقيقي

- **أمر المالك:** تنفيذ جميع صور Console Mobile المعتمدة أثناء غيابه، من دون ملء حقول أو أسطح ببيانات وهمية.
- **S00:** `console-mobile/src/theme/tokens.ts` صار يطابق ألوان Modonty المعتمدة (`primary` للأفعال و`accent` للحالة والأيقونة) وسلّم UIUX النهائي للطباعة واللمس والهيدر والفوتر.
- **المكونات المشتركة:** `PrimaryButton.tsx` و`MobileUI.tsx` و`BottomNavigation.tsx` و`AppShell.tsx` بدأت الهجرة إلى التوكنز؛ الفعل الأساسي أزرق البراند والحالة النشطة/الماسة تركواز.
- **فحص TypeScript:** `pnpm --filter @modonty/console-mobile exec tsc --noEmit` → 0 أخطاء بعد هذا التغيير.
- **لوحة التنفيذ:** أضيف `console-mobile/documentation/md/IMPLEMENTATION-STATUS.md`؛ يربط كل S00–S14 بعقد الصورة وعقد البيانات والحاجز والفعل التالي.
- **حاجز صريح:** S02/S03 تتضمنان إشارة الإحالة لكن `/dashboard` لا يقدم عقدها، وS04 تحتاج endpoint تفاصيل اشتراك مستقلاً. لا يُنفذ أي منهما بنص ثابت أو بيانات مخترعة.

## 2026-08-29 — فصل منافذ Console Mobile عن خدمات الوكلاء الأخرى

- **القرار الثابت:** `8081` لـMetro و`3100` لـConsole Mobile API؛ المنفذ `3000` خارج نطاق التطبيق ولا يُستخدم من Console Mobile.
- **السبب والدليل:** كان `3000` مشغولاً بتطبيق `MODONTY\\modonty` آخر وأعاد `POST /api/mobile/v1/auth/login` كود `404` بدل عقد الموبايل؛ لذلك علِق تسجيل الدخول على الهاتف.
- **الملف:** `console-mobile/.env.local` صار يشير إلى `http://127.0.0.1:3100/api/mobile/v1`.
- **المرجع التشغيلي الدائم:** أضيف قسم «منافذ التطوير المحجوزة» إلى `console-mobile/documentation/md/working-agreement.md`؛ يجب أن يبدأ منه أي وكيل قبل تشغيل خادم.
- **الحالة:** يلزم تشغيل `console` على `3100` وإعادة تشغيل Metro حتى يحمل التطبيق العنوان الجديد، ثم إعادة اختبار الدخول.

## 2026-08-29 — دخول فعلي وإصلاح ظهور نموذج S01 مع لوحة المفاتيح

- **المشكلة:** عند تركيز حقل كلمة المرور كانت لوحة مفاتيح Android تغطي الجزء السفلي من نموذج الدخول.
- **التصحيح:** `console-mobile/src/routes/auth/LoginRoute.tsx` يستخدم الآن `KeyboardAvoidingView` بسلوك النظام المناسب، مع `ScrollView` القابل للسحب لإخفاء لوحة المفاتيح؛ لا توجد أرقام تصميم جديدة.
- **دليل الجهاز:** `console-mobile/documentation/evidence/2026-08-29-login-keyboard-avoiding.png` — حقل كلمة المرور ظاهر كاملاً فوق الكيبورد في Samsung `SM_A217F`.
- **فحص TypeScript:** `pnpm --filter @modonty/console-mobile exec tsc --noEmit` → 0 أخطاء.
- **تصحيح مسار الدخول:** شغّل `console` على `http://localhost:3100`، و`POST /api/mobile/v1/auth/login` أعاد `200` محلياً. بعد `adb reverse tcp:3100 tcp:3100` وتحميل Metro من جديد، تم الدخول فعلياً من الهاتف.
- **دليل النجاح:** `console-mobile/documentation/evidence/2026-08-29-login-success-3100.png` — الرئيسية الفعلية لحساب الاختبار على Samsung.
- **غير متحقق:** اختبار تسجيل الخروج واستعادة الجلسة وحالات شاشة الدخول الأربع؛ لم تُشغّل في هذه الجولة.

## 2026-08-28 — مشروع Expo مستقل للكونسول وتحديثاته

- **القرار:** مشروع Expo مستقل `@modontys-team/modonty-console` → يفصل Console Mobile عن مشروع `@modontys-team/modonty` ويمنع تعارض الـslug الذي أوقف البناء الأول.
- **ربط Expo:** `console-mobile/app.json` يحتوي `extra.eas.projectId: 6cc8b8ea-cc0c-46e9-bb4f-56810fed5616` و`owner: modontys-team` و`slug: modonty-console`.
- **دليل الرابط:** `npx eas-cli@latest project:info --json` أعاد `@modontys-team/modonty-console` بالمعرّف نفسه.
- **تبعيات أصلية:** أُضيفت `expo-dev-client ~6.0.21` و`expo-updates ~29.0.20` في `console-mobile/package.json` عبر `npx expo install ... --pnpm`.
- **EAS Update:** `npx eas-cli@latest update:configure --non-interactive` أضاف `updates.url` و`runtimeVersion.policy: appVersion` في `app.json`، وقناة `development` في `eas.json`. لم يُنشر OTA.
- **البناء:** لم يبدأ بناء جديد بعد؛ محاولة البناء السابقة على المشروع القديم فشلت بتعارض slug.

## 2026-08-28 — ملف بناء EAS

- **ملف:** `console-mobile/eas.json`.
- **الملفات:** `development` = `developmentClient: true` و`distribution: internal`؛ `production` = قناة `production`.
- **الحالة:** جاهز لبدء بناء Android؛ لم يبدأ بناء على مشروع `modonty-console` بعد.

## 2026-08-28 — مرجع أسعار Expo والإشعارات

- **Free:** `$0` — حتى 15 بناء Android و15 بناء iOS شهرياً، و1,000 مستخدم نشط شهرياً لتحديثات OTA.
- **Starter:** `$19` شهرياً + استخدام إضافي — `$45` رصيد بناء و3,000 مستخدم نشط شهرياً لتحديثات OTA.
- **Production:** `$199` شهرياً + استخدام إضافي — `$225` رصيد بناء و50,000 مستخدم نشط شهرياً لتحديثات OTA.
- **Enterprise:** سعر مخصص — يبدأ برصيد بناء `$1,000` و1,000,000+ مستخدم تحديثات OTA.
- **الإشعارات:** Expo Push Service مجاني؛ حد الإرسال 600 إشعار/ثانية/مشروع. Development Build مطلوب لاختبار Push Notifications؛ Expo Go لا يدعمها في الإصدارات الحديثة.
- **قرار المرحلة:** نبقى على Free؛ البناء التجريبي الجاري يستهلك حصة Android فقط، ولا نشر OTA.
- **المصادر الرسمية:** https://expo.dev/pricing · https://docs.expo.dev/push-notifications/faq/ · https://docs.expo.dev/push-notifications/what-you-need-to-know/

## 2026-08-28 — محاولة بناء Android Development Build

- **الأمر:** `npx eas-cli@latest build --profile development --platform android --non-interactive`.
- **النتيجة:** فشل قبل بدء الرفع أو إنشاء رابط بناء.
- **سبب EAS:** `android.package` مطلوب في إعداد التطبيق عند البناء غير التفاعلي.
- **الأثر:** لا APK ولا اختبار جهاز ولا دليل على استهلاك حصة بناء؛ يلزم قرار اسم الحزمة قبل إعادة المحاولة.

## 2026-08-28 — هوية Android المعتمدة

- **قرار خالد:** `android.package = com.modonty.console`.
- **الملف:** `console-mobile/app.json`.
- **الغرض:** هوية Android ثابتة مطلوبة لبناء EAS غير التفاعلي، ولإعداد FCM/Push Notifications لاحقاً.

## 2026-08-28 — استثناء أدوات الوكلاء من أرشيف EAS

- **المشكلة:** محاولة البناء الثانية وصلت إلى رفع الأرشيف ثم فشلت عند symlink محلي في `.agents/skills/shadcn`.
- **الحل:** أضيف `MODONTY/.easignore`، مطابق لقواعد `.gitignore` الجذري ويستثني `.agents/` و`.claude/` من أرشيف EAS، مع إبقاء `console-mobile/assets/**` في الرفع.
- **السبب:** EAS يرفع المستودع الموحّد للبناء في monorepo؛ أدوات الوكلاء محلية وليست اعتماداً لتطبيق الموبايل.
- **المصدر الرسمي:** https://docs.expo.dev/build-reference/easignore/ · https://docs.expo.dev/build-reference/build-with-monorepos/
- **الحالة:** أحتاج موافقة خالد الصريحة قبل إعادة محاولة بناء Android، وفق قاعدة عدم إعادة البناء بلا إذن.

## 2026-08-28 — بناء Android Development Build الجاري

- **الرابط:** https://expo.dev/accounts/modontys-team/projects/modonty-console/builds/5a6fefe2-ce80-4b36-8062-8324210d1923
- **الحالة:** نجح (`FINISHED`) في 2026-08-28 20:42:17 UTC.
- **دليل الرفع:** `Uploaded to EAS 3m 7s` ثم أعاد EAS رابط البناء أعلاه.
- **ملف التثبيت:** https://expo.dev/artifacts/eas/y3sUhcGEkg92mRC_0aJGg2zemrIL1X6AFiQb4Bm8puo.apk
- **الهوية:** `com.modonty.console` · النسخة `1.0.0` · التوزيع `internal`.
- **تنبيه أداء غير حاجز:** حجم الأرشيف 244MB؛ يُراجع لاحقاً لتقليل زمن الرفع، ولا يغيّر كود التطبيق أو نتيجة البناء الحالية.

## 2026-08-29 — تثبيت وتشغيل Development Build على جهاز Android فعلي

- **الجهاز:** Samsung `SM_A217F` عبر USB؛ تحقّق `adb devices -l` أعاد الحالة `device`.
- **التثبيت:** APK ثُبّت عبر ADB بالناتج `Success`.
- **Metro:** خادم واحد يعمل محلياً على `http://localhost:8081` عبر `pnpm start -- --clear --dev-client`.
- **الاتصال:** `adb reverse tcp:8081 tcp:8081` ثم فُتح الـDevelopment Build بعنوان `localhost`؛ Metro أعاد `Android Bundled 50541ms console-mobile\\index.js (1564 modules)`.
- **دليل الجهاز:** `console-mobile/documentation/evidence/2026-08-29-development-build-login.png` — شاشة الدخول الفعلية بعد تحميل الحزمة.
- **الحالة:** البناء والتثبيت وتشغيل Metro نجحت. لم يُختبر تسجيل الدخول أو API في هذه الخطوة.

## 2026-08-29 — تصحيح موضع S01 شاشة الدخول

- **النطاق:** `console-mobile/src/routes/auth/LoginRoute.tsx` فقط.
- **المشكلة المرئية:** التنفيذ الفعلي رفع كتلة الدخول للأعلى وترك فراغاً كبيراً تحتها، مخالفاً صورة `S01-login.png` المعتمدة.
- **التصحيح:** جعلت حاوية المحتوى القابلة للتمرير تتمدد ثم توزّع كتلة الشعار والنصوص والفورم عمودياً في المنتصف، باستخدام tokens الموجودة فقط.
- **دليل الجهاز:** `console-mobile/documentation/evidence/2026-08-29-login-centered.png` — لقطة Samsung `SM_A217F` بعد Fast Refresh.
- **TypeScript:** `pnpm --filter @modonty/console-mobile exec tsc --noEmit` → 0 أخطاء.
- **غير متحقق:** حالات شاشة الدخول الأربع وتدفق تسجيل الدخول؛ لم يتغيرا في هذا التصحيح.
