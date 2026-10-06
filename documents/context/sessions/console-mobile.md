# الجلسة الحاليّة

**٥ أكتوبر ٢٠٢٦: تطبيق الكونسول — جسر الإشعارات (كل أحداث مدونتي والأدمن) · بانر التحميل · الاستعداد لدفع ٧ مساءً**

## وقفنا عند

نسخة الرفع جاهزة ومبنيّة، تنتظر أمر خالد «ادفع» بعد ٧ مساءً (نهاية Techne).
**الخطوة الجاية الواحدة:** عند «ادفع» → من `C:\Users\w2nad\Desktop\dreamToApp\MODONTY-console-deploy`:
`git fetch origin && git rev-list --left-right --count origin/main...HEAD` (يجب `0 5`) ثم `git push origin deploy/console-mobile:main`.

## بعد الدفع مباشرة (بالترتيب)

1. فحص الإنتاج: `console.modonty.com/api/mobile/v1/auth/screen` فيه «البريد الإلكتروني أو اسم الحساب» · دخول 200 · `/android` 302.
2. ضبط `ANDROID_APK_URL` على Vercel (مشروع console) = `https://modonty-asset.b-cdn.net/apps/android/modonty-console-2026-10-05-v2.apk` (الجديد: «بوابة مدونتي» · ٦٣ م.ب · EAS `6597b3bc`) ← يظهر البانر.
3. تحديث OTA لقناة `production` (فيه `live-refresh.ts`) — لا يحتاج APK جديد.
4. جوال خالد عليه الآن **نسخة التطوير** (dev build) مربوطة بالسيرفر المحلي ← أرجع نسخة الإنتاج (من رابط Bunny) وجرّب الدخول والتنبيه والتطبيق مقفول.
5. قرار خالد: `prisma db push` لفهارس `mobile_sessions` و`mobile_login_attempts` على الإنتاج.
6. حذف نسخة الرفع `MODONTY-console-deploy` (فيها نسخ `.env` و`.env.shared` غير متتبَّعة).

## المنجز اليوم

- **جسر الإشعارات** `shared/lib/mobile-push/` (`notify-client-event.ts` · `client-events.ts` · `preference-groups.ts` منقول من console · `index.ts`): صفّ في صندوق العميل + دفعة Expo، `fireClientEvent` عبر `after()`.
- **التفضيلات:** المفتاح الغائب = مفعّل (`isGroupOn`)، وصفحة إعدادات الويب `settings-form.tsx` تعرضه مفعّلاً.
- **موصول في مدونتي:** `submit-ask-client.ts` · `ask-partner-from-chat.ts` · `submit-reply.ts` · `fire-engagement.ts` (إعجاب/حفظ) · `client-faq-actions.ts` · `client-review-actions.ts` · `api/favorite` · `api/share` · `api/subscribers` · ريلز (`submit-reel-comment*`) · `booking-actions.ts` (حجز + واتساب، بدل `lib/mobile-push.ts` القديم) · ملفات القارئ `lib/*-as.ts`. وفي نسخة الرفع ما يقابلها في الإنتاج: `submit-comment.ts` · `api/follow` · `api/share` المقال · `reel-interactions.ts`.
- **موصول في الأدمن:** `gated-transition.ts` (مقال ينتظر قرارك) · `lib/articles/publish-article.ts` (نُشر مقالك).
- **الكونسول:** حذف دفع ميت من `lib/telegram/notify.ts`؛ `lib/push/notify-client.ts` صار إعادة تصدير.
- **التطبيق:** `console-mobile/src/services/live-refresh.ts` (تحديث عند وصول تنبيه/الرجوع من الخلفية، بتأخير لاحق 1.5ث — بدونه كانت الدفعة والتطبيق مفتوح تُسقط إشعارات: مهلة ٣ ثوانٍ في expo-notifications SDK ≤57) · `App.tsx` · `use-engagement-resource.ts`.
- **إصلاحان من الاختبار:** `modonty/components/cta/cta-tracked-link.tsx` يسجّل تواصل واتساب لروابط wa.me · `client-faq-actions.ts` الاسم اختياري فعلاً.
- **بانر تطبيق الأندرويد** في الكونسول: `console/app/android/route.ts` · `(dashboard)/components/android-app-banner.tsx` · `public/android-qr.svg` · `(dashboard)/layout.tsx` (يظهر فقط مع `ANDROID_APK_URL`).
- **APK الإنتاج** (EAS `0136d2a7`، ١١٢ م.ب) على Bunny: `apps/android/modonty-console-2026-10-05.apk`.
- **اختبار حيّ كامل** على جوال خالد (جبر سيو · modonty_dev): ١٥ حدثاً من الواجهات وصلت، والضغط يفتح المقال، والرئيسية تتحدّث وحدها. بيانات [QA TEST] حُذفت والعدّادات أُعيدت.
- **تنظيف console-mobile:** حذف كود/صور قالب غير مستخدمة · نقل وثائق أغسطس إلى `console-mobile/documentation/archive/2026-08`.
- **الوثيقة المرجع:** `console-mobile/documentation/html/CONSOLE-MOBILE-HISTORY.html` (واقف · متعطّل · باقٍ · منجز · تاريخ · ملفات زايدة) — محدّثة.

## إضافات بعد الظهر (في نسخة الرفع)

- قرار التعليقات (مقال/ريل) والتقييمات من «الجمهور» · خطوة حالة طلب التواصل · بطاقة «زوّارك آخر ٢٨ يوماً» · إشعار الحساب في الاشتراك · الرد على أسئلة صفحة العميل · اسم «بوابة مدونتي» وAPK أخفّ. كلها مقيسة على جوال خالد وبياناتها حُذفت.
- tsc ×4 = EXIT 0 · console build EXIT 0 (مُتحقَّق بعد آخر كوميت). modonty/admin بُنيا قبل تغيير نصّ واحد في `client-events.ts`.

## قرارات وموانع قائمة

- لا دفع قبل ٧ مساءً وبلا «ادفع» صريحة. الدفع يعيد نشر الكونسول ومدونتي والأدمن معاً (تغيّر `shared/`).
- ثلاث ملفات قديمة بلا مستورد، الحذف مرفوض بالصلاحيات: `modonty/lib/mobile-push.ts` · `console/lib/mobile-api/push.ts` · (`console/app/api/mobile/v1/me/preference-groups.ts` في نسخة الرفع صار إعادة تصدير).
- بقايا adb على جوال خالد (`/sdcard/u.xml` · `/sdcard/n.xml` · `/data/local/tmp/cp.apk`) — الحذف مرفوض.
- Google Play: ينتظر رقم D-U-N-S (أُرسل ٤ أكتوبر).
- مفتوح: فتح المقال من تنبيه والتطبيق مقفول تماماً لم يُجرَّب على نسخة الإنتاج · الحجز وسؤال مودو لم يُقادا من الواجهة. (الاسم والحجم أُصلحا في APK الجديد.)

## Git

- **النسخة الرئيسية:** فرع `main` · آخر كوميت `3aa3211` · ٤٦٢ ملفاً غير مُودَع (فيها شغل جلسات أخرى — لا تُودَع جماعياً).
- **نسخة الرفع:** worktree `MODONTY-console-deploy` · فرع `deploy/console-mobile` · ٥ كوميتات حتى `7e47a5d` · `origin/main...HEAD = 0 5`.

## حالة البناء والاختبار

- tsc في نسخة الرفع: console · admin · modonty · console-mobile = EXIT 0 (مُتحقَّق هذه الجلسة).
- build في نسخة الرفع: console و admin EXIT 0 قبل آخر إصلاحين (لم يلمساهما) · modonty EXIT 0 بعدهما (مُتحقَّق).
- الإنتاج: لم يُدفع شيء — `/android` على الإنتاج 404 حتى الدفع.
- سيرفرات محلية شغّالة: modonty 3000 · admin 3001 · console 3002 · Metro 8081 · ملفات 8090 و8790.
