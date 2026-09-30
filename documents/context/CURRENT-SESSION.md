# الجلسة الحاليّة

**٣٠ سبتمبر ٢٠٢٦: أرقام جوجل في الكونسول وتقرير Looker وقسم KPI في الأدمن**

## وقفنا عند

رفعنا صفحة KPI › Content (`94a805b`) وقرأنا أرقامها على الإنتاج. سألنا خالد عن ٨ عملاء بلا كاتب في كرت «Unassigned»، ظهورهم كله ٣ مرات، ولم يجب بعد.

**الخطوة التالية:** ننتظر جوابه عن تعيين كتّاب لهؤلاء العملاء، ثم صفحات KPI القادمة (Graphics وSales) في نفس القسم.

## ما أُنجز ورُفع (الأحدث أولاً)

| الكوميت | العمل |
|---|---|
| `94a805b` | الأدمن: قسم KPI فيه صفحة Content. كرت لكل كاتب (EDITOR عبر `Client.editorId`)، مرتّب بالنقرات. فيه: الظهور والنقرات ونسبة النقر والترتيب، والتغيّر عن الفترة السابقة، وكم مقال ظهر، وأقوى مقال، والظهور حسب الدولة، وأعلى دولة لكل عميل. الفلتر ٧ / ٢٨ / ٩٠ يوماً وAll time (١٦ شهراً). للأدمن فقط. |
| `502a6ef` | الكونسول: بطاقة Google Analytics كانت تسقط بخطأ 400. حذفنا طلب Realtime، لأن جوجل ترفض فيه `customEvent:client_id`. التقارير صارت `allSettled`، والرسالة بالعربي. |
| `c2f29b1` | الكونسول: زرّ «تأكّد من أرقامك في تقرير جوجل»، ونقلنا شعار جوجل إلى `shared/components/icons/google-icon.tsx`. |
| `a916915` | الكونسول: لوحة جديدة بأرقام سيرش كونسل للعميل (فلتر فترة، وشريط انتباه ثابت، ورسوم)، ومعها الرابط `/api/google-report`. |

**الملفّات الأساسية:**
- **الأدمن:**
  - `admin/app/(dashboard)/kpi/content/`: `page`، `loading`، `components/writer-card`، `helpers/get-content-kpis`، `helpers/country-name`.
  - `admin/components/admin/sidebar.tsx`: مجموعة «KPI».
- **المشترك:**
  - `shared/lib/google/query-modonty-search.ts`: استعلام سيرش كونسل، يستعمله الأدمن والكونسول.
  - `shared/lib/google/get-google-service-token.ts`.
- **الكونسول:**
  - `console/lib/google/`: `sign-` و`verify-google-report-key` (HMAC بـ`ADMIN_CONSOLE_ACCESS_SECRET` وبادئة `google-report:`)، و`get-client-page-paths`، و`get-client-search-rows`، و`get-google-report-url`.
  - `console/app/api/google-report/route.ts`، ومعه `looker-connector/Code.gs` و`appsscript.json`، وهما نسخة مطابقة لما هو منشور في Google.
  - `console/lib/analytics/ga4-data-api.ts` و`dashboard/analytics/components/ga4-realtime-card.tsx`.

## تقرير Google (Looker Studio)

- **الموصّل:** مشروع Apps Script اسمه «Modonty — Google Report Connector» في حساب modonty1، والنشر Head Deployment `AKfycbzlCwNQYq_oBTB01dvEZTrgEoChK4JYMGGff8paC3k`.
- **مصدر البيانات:** «مدونتي — أداء جوجل» `68f34f4b-…`، والمعامل `ds0.key` قابل للتعديل من الرابط.
- **التقرير:** `bac9ee3d-7004-422f-8ddf-ed158b823fe3`، مشارك Unlisted للمشاهدة فقط.
- **تقرير صفحة `/analytics` في مدونتي:** «تحاليل مدوّنتي» `e2a0618d`، رابطه القصير `s/nBnyGkiUdGw`. **لا يُمسّ.**
- **إذا عدّلنا `Code.gs`:** نلصق التعديل في مشروع Apps Script عبر monaco، ثم نحفظ.

## قرارات خالد السارية

- **KPI الكتّاب:** المقياس هو جوجل فقط.
- **لا نستبعد أي عميل من KPI:** «مدونتي» تُحسب لكاتبها طارق.
- **لا Google Sheet:** التقرير واحد لكل العملاء، والمفتاح موقَّع، ولا يوجد إدخال يدوي.

## قيود مقيسة

- **تقسيم الصفحات حسب الدولة يُسقط الظهور المحجوب للخصوصية:**
  - على الموقع كله: ٣٩١٬٠٢٨ ظهوراً بالصفحة، مقابل ٢٠٤٬٤٣٠ بالصفحة والدولة.
  - الكرت يكتب النسبة المغطّاة.
- **Realtime في GA4:** لا يدعم الأبعاد من نوع event-scoped.
- **فتح الكونسول من الأدمن عبر Playwright:** نافذة الزرّ أحياناً تفتح خارج سيطرة Playwright. الحلّ أن نفتح `console.modonty.com/...` مباشرة، لأن جلسة آخر عميل تبقى.

## الفحوص (هذه الجلسة، مقيسة)

- **tsc:** الأدمن والكونسول ومدونتي كلها exit 0 قبل كل دفع.
- **عيّنة ١٠ عملاء عشوائيين من ٤٦:** دخلنا من الأدمن عبر «Open Client Console». أرقام الكونسول والرابط `/api/google-report` وتقرير Looker (بمتصفّح غير مسجَّل) تطابقت في العشرة. المفتاح المعدَّل يرجع 401.
- **Vercel:** الكونسول Ready لـ`c2f29b1` و`502a6ef`. صفحة KPI تعمل على `admin.modonty.com`.

## Git

- الفرع `main`، ومتزامن مع origin (0 0). آخر كوميت `94a805b`.
- **غير مثبّت:** `documents/tasks/*` (TASK، والأرشيف، و`task-data.json`)، مع هذا الملف.
- **غير متتبَّع، لا يُثبَّت:** `docs/`، و`documents/HTML/modonty-registration.html`، و`documents/remotion-assets/`، و`modonty/scratch-flow-db.mjs`.

## معلّق

- **تذكير:** أرقام واتساب من الإعلانات (CTWA)، والسؤال: هل الرقم على التطبيق أم على API؟
- **لقطات الكونسول للجوال لـRemotion:** أوقفها خالد، ولم تُستأنف.
- **تنظيف بيانات تجربة على `modonty_dev`:** qa-sub-01..99 والتعليقات والمتابعات، ويحتاج إذن خالد (`cleanup.mjs --apply`).

## ملاحظات تشغيل

- **سيرفرات dev:** مدونتي 3000، والأدمن 3001، والكونسول 3002.
- **حسابات الفحص:**
  - أدمن محلّي: `claude-check@modonty.local`.
  - كونسول dev: `شركة-جبر-سيو`.
- **الحذف:** بـPowerShell فقط، لأن `rm` مرفوض.
- **tsc:** لا يُشغَّل إلا مع `push>`، وهذا حاجز hook.
