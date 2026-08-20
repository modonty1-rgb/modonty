# الأدوات المطلوبة لمرحلة «عدّة مستخدمين» (`phase: multi-user`)

كل ما تحتاجه هذه المرحلة موجود في المستودع أصلاً. لا حزمة جديدة.
(مقيس من `package.json` في الجذر و`modonty/package.json`، ٢٠ أغسطس ٢٠٢٦.)

## ١ · تشغيل عدّة مستخدمين مسجَّلين في نفس اللحظة

**الأداة: `@playwright/test@^1.62.1`** — موجودة في `devDependencies` بالجذر.

الآلية: `browser.newContext()` يعطي كل مستخدم **حاوية كوكيز مستقلّة**. أربع حاويات =
أربع جلسات `authjs.session-token` متوازية في نفس العملية، بلا تداخل. الشكل:

```ts
const ctxA = await browser.newContext({ storageState: "documents/qa/state/qa-a.json" });
const ctxB = await browser.newContext({ storageState: "documents/qa/state/qa-b.json" });
const [pageA, pageB] = await Promise.all([ctxA.newPage(), ctxB.newPage()]);
```

ملفات `storageState` تُولَّد مرّة واحدة عبر تسجيل دخول حقيقي من واجهة
`app/(site)/users/login/page.tsx`، ثم يعاد استعمالها في كل تشغيل.

**ليش لا `mcp__playwright`؟** خادم بلاي رايت المعدّ في هذا الجهاز يشغّل Edge بمتصفّح
واحد مرئي (قاعدة `project_playwright_settings`) — ممتاز للتحقّق البصري، عاجز عن التوازي
الحقيقي. المرئي يُستعمل للقطة الإثبات؛ `@playwright/test` يُستعمل للتوازي.

## ٢ · التحقّق من الصفوف في القاعدة مباشرةً

**الأداة: `tsx` (في `modonty/devDependencies`) + عميل بريزما من `@modonty/shared`.**

سبب اختيارها: مسار الكتابة نفسه يمرّ على `modonty/lib/db.ts`، فالقراءة بنفس العميل
تقرأ نفس القاعدة بنفس السكيما — صفر انزياح.

**الحاجز الإلزامي قبل أي تشغيل:** اطبع `DATABASE_URL` وتأكّد أنّه ليس الإنتاج
(قاعدة `feedback_check_datalayer_env` — `dataLayer/.env` يشير للإنتاج). كل سكربت تحقّق
يبدأ بطباعة اسم قاعدة البيانات في أول سطر من ناتجه، ويكون **قراءة فقط**
(`findMany` · `count` · `aggregate`) بلا استثناء.

**`pnpm prisma:studio`** للفحص اليدوي البصري لصفّ واحد عند التحقيق، لا كدليل في التقرير —
الدليل ناتج نصّي يمكن لصقه.

**ملاحظة على القاعدة:** لا سكربتات قاعدة منفصلة تبقى في المستودع
(`feedback_no_standalone_db_scripts`). سكربتات التحقّق تعيش تحت
`documents/qa/scripts/` وتُوسم قراءة-فقط، أو تُدمَج في Run-All لاحقاً.

## ٣ · محاكاة انقطاع الشبكة والبطء

**الأداة: `page.route()` من بلاي رايت** — لا حزمة إضافية.

- **قطع تام وسط الأكشن:** `page.route("**/articles/**", r => r.abort("failed"))`
  ثم الضغط — يختبر مسار `catch` في
  `app/(site)/articles/[slug]/components/interaction-buttons/InteractionButtons.tsx`.
- **بطء مقصود لفتح نافذة السباق:** `await new Promise(r => setTimeout(r, 1200))` داخل
  الـ`route` قبل `r.continue()` — يوسّع الفجوة بين قراءة `existing` وكتابة العدّاد في
  `like-article.ts` حتى يظهر السباق بثبات بدل أن يظهر مرّة كل عشرين.
- **انتهاء الجلسة وسط الأكشن:** `ctx.clearCookies()` بين الضغط والاستجابة.

**لا `sleep` عشوائي في التوكيد** — الانتظار على شرط (`expect.poll` / `waitForResponse`)،
لا على مهلة. الـ`setTimeout` أعلاه أداة حقن تأخير في الشبكة، لا انتظار على نتيجة.

## ٤ · توليد حِمل متزامن

**الأداة: `autocannon@^8.0.0`** — موجودة في `devDependencies` بالجذر.

الاستعمال: قصف مسارات الكتابة المفتوحة بطلبات متوازية للتأكّد أنّ العدّاد يصمد ولا
يخترع صفوفاً:

```
npx autocannon -c 50 -a 500 -m POST \
  -H "Cookie: modonty_view_sid=qa-load-001" \
  http://localhost:3000/articles/<slug>/api/view
```

`-c` عدد الاتّصالات المتوازية · `-a` إجمالي الطلبات — الرقمان يُثبَّتان في التقرير
ليكون التوكيد قابلاً لإعادة التشغيل.

**للأكشنات (Server Actions) لا يصلح autocannon** لأنّ نداءها يحمل معرّف أكشن مولّد
عند البناء. التوازي عليها يتمّ بـ`Promise.all` على عدّة `page.click()` من حاويات
بلاي رايت مختلفة — نفس الطريق الذي يسلكه المستخدم الحقيقي، وهو الدليل الأنظف.

## ٥ · لقطات الإثبات

تُحفظ تحت `.playwright-mcp/` حصراً (قاعدة `feedback_playwright_screenshots_location`)،
ولا تُحفظ في جذر المستودع.

## الخلاصة: صفر حزم جديدة

| الحاجة | الأداة | موجودة؟ |
|---|---|---|
| عدّة مستخدمين متوازين | `@playwright/test` + `newContext` | ✅ الجذر |
| قراءة الصفوف | `tsx` + بريزما من `@modonty/shared` | ✅ |
| فحص يدوي لصفّ | `pnpm prisma:studio` | ✅ الجذر |
| فشل/بطء الشبكة | `page.route()` | ✅ ضمن بلاي رايت |
| حِمل متزامن | `autocannon` | ✅ الجذر |
| فحص إتاحة أثناء التست | `@axe-core/playwright` | ✅ الجذر |
