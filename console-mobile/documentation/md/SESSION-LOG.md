# Session Log — console-mobile

## Session: 2026-08-29 21:00 — سطح المقال · بطاقة المنشور · الهدرات · الهياكل · حلقة الديسكتوب

### 🎯 وين وقفت
- آخر تاسك: أربعة أعطال في **سطح المقال** (`ArticleSurface.tsx`) — انتهت ومقيسة حيّاً.
- **الفعل التالي الواحد:** الشاشات غير المراجَعة: S08 الجمهور · S08-رد · S09 الفيديوهات · S10 الرفع · S12 التنبيهات · S13 الحساب (الهدر وحده انتهى) · S14 الدعم.

### ✅ اللي خلص

**سطح المقال — أربعة أعطال بدليل قبل/بعد:**
- **المتن كان خارج خطّ الماركة:** ٢٨٤ عقدة نصّية من ٢٩٥ بـ`-apple-system`. السبب من التوثيق الرسمي: «Any `fontFamily` used must be registered with `systemFonts`» — و`baseStyle` يطلب Tajawal بلا تسجيل فتُسقطه المكتبة صامتة. بعد `systemFonts`: **٢٢٨/٢٢٨ عقدة مرسومة بـTajawal**.
- **`h2` و`h3` نمط واحد:** ١٦ عنوان قسم و٣١ فرعياً متطابقة في مقال ٢٠٬٠٠٨ حرفاً. صارا ١٨px/700 و١٦px/700 — والعدّ المقيس طابق عدّ الوسوم بالضبط.
- **الروابط لوناً بلا تسطير** (WCAG 1.4.1) → ٤ روابط مسطَّرة، كانت صفراً.
- **الاقتباس يُرسم فقرة** → شريط `3dp` + ميل + `muted`.
- ومخالفة ثانية في نفس التوثيق أُصلحت: «Do NOT use the `StyleSheet` API to create those styles» → أنماط الـHTML صارت كائنات صريحة.
- **التباين في الوضعين:** داكن ١٩٫٦٨ / ١٦٫٧٧ / ٩٫٦١ / ١١٫٠٧ · فاتح ١٤٫٧٠ / ١٤٫٧٠ / ٥٫٠٥ / ٦٫١٠ (المتن · العنوان · الاقتباس · الرابط). الفاتح مُقاس حيّاً ومطابق للمحسوب.

**S11 المقالات المنشورة — من بطاقة جامدة إلى بوّابة للموقع:**
- `siteUrl` كان يُبنى من `client.articlesBaseUrl` — عنوان **قاعدة** واحد للعميل كلّه لا رابط مقال، و`null` لكل من ينشر على مدونتي (وهم الأغلب) فتخرج البطاقات كلها **بلا رابط**. صار من `canonicalUrl` لكل مقال، فتفتح المتصفّح على المقال نفسه.
- `PublishedArticleCard` بطاقة مستقلّة عن بطاقة S05 عمداً: صورة كاملة 16:9 · عنوان بلا قصّ · نبذة · `siteHost` تحت الفعل ليعرف العميل أين يذهب قبل الضغط · `role="link"`.

**الهدرات والهياكل:** ٨ شاشات وُحِّدت على `ScreenHeader` واحد (الرجوع يميناً) وحُذف `ReviewScreenHeader`؛ ومراجعة الهياكل عبر الشاشات كلها.

**الحوار الموحَّد:** `Alert` في react-native-web **صنف فارغ** (`static alert() {}`) — لا يعرض شيئاً. استُبدل بـ`ConfirmProvider`/`useConfirm()` على مستوى التطبيق (٣ نداءات `Alert.alert` أُزيلت).

**الرئيسية:** كانت تُحمَّل مرة عند استعادة الجلسة ولا تتحدّث أبداً — «رد على طلبات التواصل ٠» وفيها بيانات. أُصلح بـ`RefreshControl` + `useFocusEffect`. وبطاقات الصفر تختفي بدل أن تُعلن صفراً.

**الحجوزات (S15):** عرضٌ فقط بأمر خالد — لا أزرار ولا تغيير حالة؛ الإجراء يتمّ من عند العميل.

**حلقة الديسكتوب:** `expo start --web` على نفس Metro + CORS محروس بحارسين في `console/proxy.ts` + `mobile-session.web.ts` (لأن `expo-secure-store` على الويب `export default {}`). دورة التعديل→الرؤية من ≈٢٥–٣٥ث إلى ≈٢–٣ث.

### 📝 القرارات وأسبابها
- **`articleContent.quoteBarWidth: 3` توكن جديد** → الشريط كان يستعير `control.inputBorderWidth` وهو موثَّق في نفس الملفّ بأنه «حدّ الحقل يعرّف الحقل»، وعند ١ لا يُفرَّق عن فاصل شعريّ → رُفض إبقاء الاستعارة.
- **`borderRight` فيزيائيّ في الاقتباس عن قصد** → التطبيق لا يعمل تحت `I18nManager.forceRTL`، فـ`borderStart` يُحسب يساراً — الطرف الخطأ من نصّ عربي. نفس سبب `textAlign: 'right'` في الملفّ كلّه.
- **بطاقتان للمقال لا بطاقة بمفاتيح** → طابور القرارات يُمسح بالعين (مصغّرة ٨٠dp)، والمنشور يُعرض ليُفتح (صورة كاملة). وظيفتان مختلفتان.

### ⚠️ غير متحقَّق — لا يُدَّعى
- `expo build` ما شُغّل · RTL لا يزال بالأنماط لا بـ`I18nManager` · الوضع الفاتح لم يُلتقط على عدّة شاشات (محسوب لا مُصوَّر) · هندسة الهياكل على الشاشات الثماني.

### 🔒 يحتاج قرار خالد
- **الفهرس الفريد للإحالة غير موجود على الإنتاج** — أُنشئ على dev بـ`createIndexes` خام. بلاه يقبل النظام إحالتين لنفس الرقم من نفس المُحيل، وحارس `POST` لا يمنع سباق طلبين متزامنين. (رفعتها جلسة `modonty-a6` وأتبنّاها.)
- مصدر سعر الاشتراك ودلالة `pricing.yr` · ماسة الأيقونة تبقى `accent` عند 1.66:1 فاتحاً · مسار كتابة رفع الفيديو S10 · نموذج الاستشهادات S07.

### 🧪 بيانات تست متروكة على `modonty_dev` عمداً
- المقال `6a0d728436302513c9b8df83` **مُعاد إلى `AWAITING_APPROVAL`** للوصول إلى شاشة المراجعة — يُستعاد لحالته الحقيقية عند انتهاء العمل عليها.
- صفّا حجز: «سارة المصري» و«ندى حسن» · ١٠ صفوف `referral_leads`.

---

## Session: 2026-08-29 16:00 — S03 الإحالة كاملة · هوك واجهة عربية · صقل S01 وS02 وS04

### 🎯 وين وقفت
- آخر تاسك: صقل S04 «تفاصيل الاشتراك» — انتهى ومتحقَّق بلقطة جهاز.
- **الفعل التالي الواحد:** قرار خالد على مصدر سعر الاشتراك ودلالة `pricing.yr` (الحاجز الوحيد المتبقّي في S04). بعده: صقل S05 أو ما يختاره خالد.

### ✅ اللي خلص

**S03 الإحالة — كاملة من الإضافة إلى العرض:**
- الدورة تعمل من الجهاز: اسم + رقم → كتابة في `modonty_dev` → ظهور في «إحالاتي».
- **الفهرس الفريد أُنشئ على dev** بأمر `createIndexes` واحد (لا `db push` ولا `migrate`): `referrerClientId_phoneE164_key` unique + فهرسا `status_createdAt` و`referrerClientId_createdAt`. الفهارس ١ → ٤. أُثبت بإدخال نسخة مطابقة: رُفضت بـ`P2002` والعدد بقي ٥.
- **دورة الحالة السبع** مُشيت على صفّ واحد: كل حالة ترجع تسميتها الصحيحة والختم الزمني يُكتب ويبقى بعد الرجوع إلى `NEW`.
- حقل **الاسم** أُضيف وصار **إلزامياً في الـAPI** (لا في السكيما — تشديدها يحتاج `db push`).
- **١١ حالة وظيفية** كلها بأكوادها الصحيحة: 201 · 409 · 422×5 · 401×2 · 422.

**الهوك — بوّابة الواجهة العربية:**
- `.claude/hooks/arabic-mobile-uiux.mjs` مسجَّل على `PostToolUse` (Edit|Write|MultiEdit) في `.claude/settings.json`.
- يوقف ٨ خروق صلبة (hex · أرقام خطّ/مسافة · نصّ عربي في الشاشة · `Text`/`Image` من react-native · `catch {}` · `json()` بلا `ok`) وينبّه على ٥.
- مُختبَر على ملفّ سيّئ متعمَّد: مسك ١٣. **وهو من كشف أخطر عطل في الجلسة** (نصوص `AppShell`).

**الصقل — ثلاث شاشات:**
- **S01:** حدّ الحقلين 1.51/1.33:1 → 3.31/3.39:1 · مفتاح إظهار كلمة المرور كان بلا حالة مرئية → رمادي↔تركوازي + `role="switch"` · انتقال `Next`/`Go` · تسمية الهيكل كانت «حاول مرة ثانية».
- **S02:** `AppShell` فيه **٧ نصوص عربية مكتوبة** و**٤ أرقام مباشرة** — نُقلت إلى `dashboard.shell` والتوكنز · ١٢ ضاغطاً بلا أثر ضغط · `flexDirection: 'row'` في رأس عربي · شارات `Sxx` حُذفت نهائياً مع مكوّنها · **شارة التنبيهات أُصلحت من الجذر** (`unreadNotifications` في `/dashboard`، والعددان متطابقان ٢ و٢).
- **S04:** الشريط كان يقيس **المستهلَك** والرقم يقول **المتبقّي** — فارغ عند «٨ من ٨» أي عكس المعنى → `remainingPercent` · شريحة الحالة ورقم الاستخدام كانا 1.58:1 فاتحاً → محدَّدة و`textInteractive` · مسار الشريط 1.21/1.06:1 → حدّ 3.02:1. **رسوب التباين ٥ → ٠.**

**التباين على مستوى التوكنز:** ٩ حالات رسوب أُصلحت في `theme/tokens.ts` وحدها (`inputPlaceholder` · `muted` الفاتح في ٦ مواضع · `warning` الفاتح)، وأُضيفت `inputSurface` · `inputBorder` · `checkedFill` · `checkedMark` · `statusProgress` · `control.inputBorderWidth`.

- **tsc:** صفر في `console-mobile` و`console` (بالبرنامج المحلّي المباشر لا عبر pnpm).
- **بناء Expo:** ما شُغّل. **حزمة Metro:** HTTP 200 في كل جولة.
- **تست جهاز:** نجح — **٣٧ لقطة** في `documentation/evidence/`.

### 📝 القرارات وأسبابها
- **الفهرس بـ`createIndexes` لا `db push`** → المطلوب فهرس واحد تعلنه السكيما أصلاً، و`db push` ممنوع ويُسقط سيرفرات شغّالة → رُفض الانتظار ورُفض `db push`.
- **الاسم إلزامي في الـAPI لا في السكيما** → صفوف سابقة بلا اسم تبقى صحيحة، وتشديد العمود يحتاج `db push` → رُفض تعديل السكيما.
- **القوسان اختياريان في الهاتف** → لوحة `phone-pad` على أندرويد **بلا قوسين** (مقيس بلقطة)، فالصيغة كانت غير قابلة للكتابة → رُفض إبقاء عقد يستحيل إدخاله.
- **شريحة الحالة محدَّدة لا ممتلئة** → التعبئة التركوازية ترسب 1.58:1 في الفاتح، والمحدَّدة تعبر في الوضعين وتطابق نمط S12 وS13 → رُفض توكن تعبئة رابع.
- **`FlashList` مرفوضة لصفوف المهام** → أربعة عناصر ثابتة من العقد لا قائمة تنمو → حدس في الهوك لا خرق.

### 🚧 معلّق ومحجوز
- **سعر الاشتراك (S04)** — `pricing` فارغ في الباقات الأربع على dev، و`SubscriptionTierConfig.price` سعر **شهري** بحسب مصدر الأسعار الموثوق. القرار: ما مصدر السعر وما دلالة `pricing.yr`؟
- **الفهرس الفريد على الإنتاج** — موجود على dev فقط. حتى يُنفَّذ `db push` هناك، الحارس الوحيد هو فحص الكود وهو غير ذرّي.
- **لا مسار لتغيير حالة الإحالة في المنتج** — غيّرتُها من القاعدة للاختبار. المطلوب شاشة أدمن وربط `PAID → REWARDED` بـ`mark-paid` (REFERRAL-CONTRACT §٥).
- **رفع الفيديو (S10)** · **نموذج الاستشهادات (S07)** · **تعديل السؤال** — حواجز قديمة بلا تغيير.
- **العين في S01** أصغر من الصورة المعتمدة (٢٤dp مقابل ≈٢٨) لأن UIUX §١ تثبّت ٢٤ — يحتاج استثناءً صريحاً أو يبقى.

### 📂 الملفات التي لُمست
- `console-mobile/src/routes/referral/ReferralRoute.tsx` · `auth/LoginRoute.tsx` · `home/HomeRoute.tsx` · `subscription/SubscriptionRoute.tsx` · `support/SupportRoute.tsx` · `audience/AudienceReplyRoute.tsx`
- `console-mobile/src/components/navigation/AppShell.tsx` · `BottomNavigation.tsx` · `src/components/ui/MobileUI.tsx` · `src/theme/tokens.ts` · `App.tsx`
- `console-mobile/src/services/account-api.ts` · `articles-api.ts` · `mobile-api.ts`
- **حُذف:** `src/components/ui/DevScreenReference.tsx`
- `console/app/api/mobile/v1/referral/route.ts` · `dashboard/route.ts` · `subscription/route.ts` · `articles/route.ts`
- `.claude/hooks/arabic-mobile-uiux.mjs` (جديد) · `.claude/settings.json` (تسجيل الهوك)
- `console-mobile/documentation/md/LIVE-WORK.md` · `TEST-REPORT-2026-08-29.md` · `IMPLEMENTATION-STATUS.md`

### 🔁 جِت
- الفرع: `modonty-ui` · آخر كوميت: `0480223` · **مدفوع؟ لا** (`origin/modonty-ui...modonty-ui` = صفر/صفر).
- غير مثبَّت: **١٥٢ مدخلاً** في المستودع، منها **٦٩ في نطاق الموبايل**.

### ⚠️ غير متحقَّق
- **حالة الخطأ (٥٠٠)** لم تُحدَث حيّاً — مُتحقَّق منها بالكود فقط.
- **أفعال الكتابة الحسّاسة** لم تُنفَّذ: اعتماد مقال · رفض · طلب تعديل · قرار FAQ. المسار مبنيّ والضغطة لخالد.
- **الوضع الفاتح لم يُصوَّر على الجهاز** — كل قياساته حسابية من التوكنز.
- **الملاحظة العربية في S03** لم تُكتب من لوحة الجهاز (`adb input text` يرمي NPE على العربية — عطل أداة).
- `expo build` لم يُشغَّل. **RTL** ما زال من الأنماط لا من `I18nManager` — انحراف معلن.

### 🚀 الاستئناف في ٣٠ ثانية
1. افتح `console-mobile/documentation/md/LIVE-WORK.md` — فيه تفصيل كل دفعة بأدلّتها.
2. افتح `console-mobile/documentation/md/TEST-REPORT-2026-08-29.md` — جدول الشاشات الأربع عشرة.
3. القرار الأول: مصدر سعر الاشتراك ودلالة `pricing.yr`.

---

## Session: 2026-08-29 13:04 — تصحيح رأس S03 وتثبيت نظام النصوص الموحد

### 🎯 وين وقفت
- آخر تاسك شغّال: مراجعة S03 «الإحالة» على جهاز أندرويد؛ صحّح ترتيب عنوان الرأس وسهم الرجوع ليطابق الصورة المعتمدة.
- الفعل التالي عند العودة: انتظار إتمام خالد/Claude لعقد وخلفية الإحالة ثم مراجعة S03 كاملة مقابل الصورة المعتمدة.

### ✅ اللي خلص
- `console-mobile/src/routes/referral/ReferralRoute.tsx` — السهم صار يمين عنوان «الإحالة» في RTL، لا منفصلاً عنه ولا على يساره.
- `console-mobile/src/components/ui/AppText.tsx` — مكوّن النص الموحد يثبت `maxFontSizeMultiplier` من token واحد.
- `console-mobile/src/theme/tokens.ts` — أضيف token واحد لمضاعف خط الواجهة.
- `console-mobile/src/components/navigation/AppShell.tsx` — استبدلت قيم النص المرئية بـtokens.
- tsc: غير متحقّق في هذه الجلسة.
- بناء Expo: ما شُغّل.
- تست على جهاز أندرويد فعلي: نجح — لقطة S03 بعد تصحيح الرأس في `C:\\Users\\w2nad\\AppData\\Local\\Temp\\modonty-s03-header-contract-2026-08-29.png`.

### 📝 القرارات وأسبابها
- السهم في يمين العنوان ضمن مجموعة واحدة → الصورة المعتمدة S03 تتطلبه في بداية القراءة العربية → رُفض وضعه يسار العنوان أو كسهم مستقل.
- لا نكمل حقل بلد الهاتف أو إرسال الإحالة بتخمين → الخلفية الحالية ترجع السعودية ثابتة والإرسال معطّل → رُفض اختراع اختيار بلد أو عقد API قبل اكتمال تنفيذ Claude.
- توحيد النص عبر `AppText` → يمنع اختلاف تكبير الخط بين الشاشات → رُفض ترك كل شاشة تضبطه منفردة.

### 🚧 معلّق ومحجوز
- S03 الإحالة الحقيقي — الحاجز: نموذج `ReferralLead` وعقد GET/POST والخلفية بيد Claude؛ لا تُدمج واجهة البلد/الإرسال قبل استلام الدليل.
- المراجعة الكاملة للشاشات S00–S14 — الحاجز: خالد يفتح كل شاشة بالمرجع Sxx ويعطي ملاحظته؛ لا تغييرات مرئية أخرى دون ملاحظة محددة.

### 📂 الملفات التي لُمست
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\routes\\referral\\ReferralRoute.tsx` — ترتيب رأس S03 وهيكل Skeleton الإحالة.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\components\\ui\\AppText.tsx` — مكوّن النص الموحد الجديد.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\theme\\tokens.ts` — token مقياس النص.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\documentation\\md\\LIVE-WORK.md` — حالة العمل الحية وحاجز الإحالة.

### 🔁 جِت
- الفرع: `modonty-ui`
- آخر كوميت: `0480223` — `مودو: «مين أنت؟» كانت تُجاب «ما عندي جواب موثّق» — والإنجليزية ما اشتغلت يوماً`
- مدفوع؟ لا
- ملفات غير مثبَّتة: 151 — 83 متتبَّعاً معدّلاً و68 مدخلاً جديداً؛ أكثر من عشرة، لذا لم تُسرد هنا.

### ⚠️ غير متحقَّق
- tsc بعد تعديل رأس S03 و`AppText`.
- بناء Expo بعد التعديلات.
- المطابقة الكاملة للقطات S00–S14 بالصور المعتمدة.
- إرسال إحالة حقيقي أو اختيار بلد الهاتف؛ العقد الخلفي لم يكتمل.

### 🚀 الاستئناف في ٣٠ ثانية
1. افتح `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\documentation\\md\\LIVE-WORK.md`.
2. افتح `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\routes\\referral\\ReferralRoute.tsx`.
3. انتظر من خالد نتيجة Claude لعقد الإحالة، ثم قرّر دمج واجهة البلد والإرسال الحقيقية.

---

## Session: 2026-08-29 12:25 — تنفيذ S00→S14 بثلاثة وكلاء، ترحيل التنقّل، و١٥ لقطة جهاز

### 🎯 وين وقفت
- كل ما يمكن تنفيذه من S00 إلى S14 نُفِّذ ودُمج وتُحقّق منه على جهاز أندرويد فعلي. التقرير الكامل: `console-mobile/documentation/md/TEST-REPORT-2026-08-29.md`.
- الفعل التالي عند العودة: قرار خالد على تسعة حواجز — أهمّها نموذج `ReferralLead` · مسار رفع الفيديو · نموذج الاستشهادات · مصدر سعر الاشتراك.

### ✅ اللي خلص
- **١٠ شاشات PASS و٨ BLOCKED** — التفصيل في `IMPLEMENTATION-STATUS.md`.
- **١٥ لقطة جهاز فعلي** في `documentation/evidence/` (S02→S14، عدا S01 وS07-citations).
- **١٢ endpoint كلها HTTP 200** على `localhost:3100`، منها ستّ جديدة: `auth/screen` · `subscription` · `referral` · `support` · `me/notifications` · `audience/questions/[faqId]`.
- **ترحيل التنقّل إلى `@react-navigation/native-stack`** بعد أن أثبت الجهاز أن زرّ الرجوع كان يخرج من التطبيق بدل أن يعود خطوة.
- **إصلاح فخّ مونجو** في `notifications/route.ts`: `null` لا يساوي حقلاً غائباً. القياس الخام: `clientId` وحده ٣ صفوف · مع `userId:null` صفر · مع `isSet:false` ٣.
- **S00 أُقفل بقياس بكسلي** — ألوان الصورة المعتمدة الستّة تطابق `tokens.ts` حرفياً. الحاجز القديم كان مبنيّاً على `DESIGN-SYSTEM.md` وهو نظام الويب الفاتح ولا يحكم تطبيقاً داكناً.
- **طبقة غلاف مزدوجة** — `PushedScreen` بلا رأس ولا تابات، و`ChromeScreen` بهما، لأن الصور تفرّق بينهما.
- **رأس مُعلَّم مشترك** `BrandHeading` لـS10 وS13 وS14 كما في صورها.
- **بطاقة S11 صُحّحت** — التصنيف والتاريخ كانا يتقاطعان في سطر واحد؛ فُصلا وحُذفت النبذة.
- **شارة التنبيهات** كانت رقماً وهمياً من `client-fixtures.ts`؛ رُبطت بالعدد الحقيقي وحُذف ملفّ الفكسترز.
- حُذف الكود الميت: `client-fixtures.ts` · `ArticlesRoute` · `ArticleReviewRoute` · `UpdatesRoute` · `UpdateCard` · `AudienceRoute`.
- **tsc: صفر** في `console-mobile` و`console`، بالبرنامج المباشر `./node_modules/.bin/tsc`.

### 📝 القرارات وأسبابها
- **المكدّس أصلي والتابات مكتوبة بالجافاسكربت** → `react-native-bottom-tabs` يأخذ `ImageSource`/SF Symbol ولا يرسم مكوّنات SVG، والصور المعتمدة تفرض أيقونات `ModontyIcon` → رُفض كسر الصورة إرضاءً لقاعدة الهندسة؛ و`UIUX-RULES` هو الحاكم عند التعارض.
- **الحقل الغائب يُحذف من الشاشة ولا يُملأ** → صفّ السعر في S04 ورابط «عرض على موقعك» في S11 غائبان لأن البيانات غائبة → رُفض التخمين.
- **`upload.available:false` مع سبب مكتوب** بدل زرّين ميّتين → الزرّ الذي لا يفعل شيئاً يعلّم العميل أن التطبيق مكسور.
- **إعادة ضبط كلمتَي مرور التست على `modonty_dev`** بعد التحقق من اسم القاعدة قبل كل أمر → مزامنة سابقة محتهما، وبدون دخول لا دليل جهاز أصلاً.

### 🚧 معلّق ومحجوز
تسعة حواجز مفصّلة في `TEST-REPORT-2026-08-29.md` قسم «حواجز مفتوحة»: نموذج الإحالة · رفع الفيديو · نموذج الاستشهادات · تعديل السؤال · مصدر السعر · شارة التنبيهات عند الدخول · حساب YMYL للاختبار · افتراضي مفاتيح S13 · وعطل في كونسول الويب خارج نطاق الموبايل: `console/app/(dashboard)/dashboard/settings/components/subscription-card.tsx:41` يعرض سعراً شهرياً موسوماً «per year».

### 📂 الملفات التي لُمست
`git diff --stat` على نطاق الموبايل: **٣٣ ملفاً · ٢٢٤٠ إضافة · ٦٤٧ حذفاً**، ومعها ٢٢ ملفاً/مجلّداً جديداً غير متتبَّع — وحدات خدمات النطاقات الثلاث (`account-api` · `articles-api` · `engagement-api`)، ومكوّنات المقالات والجمهور والفيديوهات والتنبيهات، وستّ نقاط نهاية جديدة، و`console/lib/mobile-api/arabic-format.ts`.

### 🔁 جِت
- الفرع: `modonty-ui` · آخر كوميت: `0480223` · مدفوع؟ **لا** · غير مثبَّت في نطاق الموبايل: ٦٨ مدخلاً.

### ⚠️ غير متحقَّق
- **S01 بلا لقطة جهاز** — نصوص `auth/screen` الحيّة تطابق الصورة حرفياً، لكن الالتقاط يحتاج تسجيل خروج ولم أخاطر بالجلسة.
- **S07-citations بلا لقطة** — محجوبة بالسكيما، وكيما زون `isYmyl:false` فالسطح لا يظهر أصلاً.
- **أفعال الكتابة لم تُنفَّذ**: اعتماد مقال · رفض · طلب تعديل · قرار FAQ · إرسال رد · إرسال دعم. المسار مبنيّ والضغطة لخالد.
- **الحالات الأربع** اختُبرت بالكود لا بقطع الشبكة فعلياً على الجهاز.
- `expo build` لم يُشغّل.
- **RTL ما زال من الأنماط لا من `I18nManager`** — انحراف معلن؛ تفعيله يقلب كل شاشة.
- **`pnpm --filter … exec tsc` غير موثوق** — أعاد `Command "tsc" not found` مع خروج `0` كاذب مرّتين. اعتمد البرنامج المحلّي المباشر.

### 🚀 الاستئناف في ٣٠ ثانية
1. افتح `console-mobile/documentation/md/TEST-REPORT-2026-08-29.md`.
2. افتح `console-mobile/documentation/md/IMPLEMENTATION-STATUS.md`.
3. خذ من خالد قراراً على الحواجز التسعة، وابدأ بالإحالة ثم رفع الفيديو.

---

## Session: 2026-08-28 22:45 — اعتماد صور S00–S14 وتهيئة Development Build للأندرويد

### 🎯 وين وقفت
- آخر تاسك شغّال: تجهيز Expo Development Build للأندرويد؛ الربط والتبعيات وملف البناء جاهزة، لكن أمر البناء رسب بسبب تعارض slug مشروع Expo.
- الفعل التالي عند العودة: قرار خالد الواحد: هل slug التطبيق يصبح `modonty` أم يُنشأ/يُربط مشروع Expo جديد باسم `modonty-console`؟

### ✅ اللي خلص
- `documents/design/assets/console-mobile/approved/` — اعتمدت صور S00 إلى S14 ولوحة `SCREEN-SCAN.png` المجمعة.
- `console-mobile/app.json` — رُبط المشروع بـExpo: `extra.eas.projectId` ومالك الفريق `modontys-team`.
- `console-mobile/package.json` — أضيفت `expo-dev-client ~6.0.21` و`expo-updates ~29.0.20`.
- `console-mobile/eas.json` — أضيف profile `development` الداخلي وprofile `production`.
- `console-mobile/documentation/md/PROJECT-CHANGE-LOG.md` — سجل إعدادات Development Build بدليل الأوامر.
- `documents/mobile/MOBILE-APP-WORKFLOW.md` — أضيفت قاعدة «الملف يحكم، لا الذاكرة» كـHook إلزامي.
- tsc: غير متحقّق — لم يُشغّل في هذه الجلسة.
- بناء Expo: فشل — تعارض `extra.eas.projectId` لمشروع slug `modonty` مع slug التطبيق `modonty-console`.
- تست على جهاز أندرويد فعلي: ما تمّ — Development Build لم يُنتج بعد.

### 📝 القرارات وأسبابها
- Expo Development Build للأندرويد → أسرع حل بعد بناء واحد، ولا يتطلب Android Studio → رُفض الاعتماد على Expo Go كبيئة تسليم نهائية.
- الصور المعتمدة انتقلت إلى `approved/` بلا نسخ نشطة مكررة → العقد البصري يحتاج مصدرًا واحدًا → رُفض إبقاء صورة معتمدة في `in-review/`.
- ملفات المشروع هي مصدر الحقيقة → تمنع قرارات الذاكرة والتلخيص الخاطئة → رُفضت الذاكرة كمرجع تشغيلي.

### 🚧 معلّق ومحجوز
- Android Development Build — الحاجز: قرار خالد حول تعارض slug `modonty` / `modonty-console` في Expo.
- إعداد EAS Update — الحاجز: `eas update:configure --non-interactive` لم يكتب إعدادًا قابلًا للتحقق؛ لا نشر OTA تم.
- تنفيذ الشاشات المعتمدة ثم لقطة Android وdiff — الحاجز: لا يبدأ قبل حل Development Build وعقود API لكل شاشة.

### 📂 الملفات التي لُمست
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\app.json` — ربط EAS وowner الفريق.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\package.json` — تبعيات Development Build.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\eas.json` — profiles البناء.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\documentation\md\PROJECT-CHANGE-LOG.md` — سجل تغييرات المشروع.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\mobile\MOBILE-APP-WORKFLOW.md` — قاعدة الملفات والحفظ الإلزامي.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\design\assets\console-mobile\approved\` — صور التصميم المعتمدة ولوحة التجميع.

### 🔁 جِت
- الفرع: `modonty-ui`
- آخر كوميت: `0480223` — مودو: «مين أنت؟» كانت تُجاب «ما عندي جواب موثّق» — والإنجليزية ما اشتغلت يوماً
- مدفوع؟ لا
- ملفات غير مثبَّتة: 80

### ⚠️ غير متحقَّق
- إعداد EAS Update الفعلي في `app.config.ts`.
- إنشاء رابط بناء Android أو تثبيت APK على الجهاز.
- تشغيل Metro عبر Development Build.
- `pnpm --filter @modonty/console-mobile exec tsc --noEmit`.
- المطابقة الفعلية للصور المعتمدة على جهاز Android.

### 🚀 الاستئناف في ٣٠ ثانية
1. افتح `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\app.json` و`eas.json`.
2. افتح `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\documentation\md\PROJECT-CHANGE-LOG.md`.
3. خذ قرار خالد: هل نغيّر slug إلى `modonty` أم ننشئ مشروع Expo لـ`modonty-console`؟

---

## Session: 2026-08-28 15:22 — ربط مراجع MCP الرسمية والتحقق من قابلية استخدامها

### 🎯 وين وقفت
- آخر تاسك شغّال: رُبط Expo MCP بحساب فريق `modontys-team` وسُجّل دخوله بنجاح، وسُجّلت إعدادات Context7 وMUI؛ لكن المهمة المتفرعة الحالية لا تعرض أدواتها كأدوات قابلة للاستدعاء بعد.
- الفعل التالي عند العودة: أعد فتح تطبيق Codex Desktop ثم افتح هذه المهمة وافحص أسماء أدوات `expo` و`context7` و`mui` في قائمة الأدوات قبل أي عمل UI.

### ✅ اللي خلص
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\components\\articles\\ArticleCard.tsx` — أُنشئت بطاقة مقال قابلة لإعادة الاستخدام بصورة علوية 16:9 من بيانات API الحقيقية.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\routes\\articles\\ArticlesApiRoute.tsx` — تستخدم بطاقة المقال الموحدة لقوائم المنشور والقرار.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console\\app\\api\\mobile\\v1\\articles\\route.ts` — يعيد عنوان المقالات المنشورة وتاريخ النشر العربي وبيانات البطاقة.
- Expo MCP — `Successfully logged in to MCP server 'expo'.`
- Context7 وMUI MCP — الإعدادان `enabled: true` في Codex.
- tsc: غير متحقّق — لم يُشغّل في هذه الجلسة.
- بناء Expo: ما شُغّل.
- تست على جهاز أندرويد فعلي: لم يتمّ في هذه الجلسة.

### 📝 القرارات وأسبابها
- استخدام `modontys-team` لتفويض Expo MCP → حساب الفريق يطابق مشروع Modonty المشترك → رُفض اختيار الحساب الشخصي `modonty` بلا سبب مشروع.
- عدم إضافة MCP طرف ثالث لـReact Native → لا يوجد MCP رسمي من Meta/React Native، وأدوات الأطراف الثالثة تغيّر إعدادات المشروع → رُفضت كمصدر حقيقة؛ Context7 مرجع التوثيق الحالي.
- عدم إنشاء Development Build → برومبت Expo قُرئ كمرجع فقط ولم يمنح موافقة بناء سحابي → رُفض تنفيذ build أو تعديل `eas.json` أو إضافة `expo-dev-client`.

### 🚧 معلّق ومحجوز
- تفعيل أدوات MCP داخل سياق Codex الجديد — الحاجز: ثبتت الإعدادات محلياً، لكن قائمة أدوات المهمة لم تتحدّث بعد حتى بعد fork؛ تحتاج إعادة فتح Codex Desktop.
- اختبار قائمة `article-decisions` على جهاز أندرويد — الحاجز: لم يُستأنف بعد؛ دليل لقطة الجهاز ما زال ناقصاً.
- التست الكامل للنقاط الأربع عشرة — الحاجز: لم تكتمل التغطية أو تقرير الاختبار.

### 📂 الملفات التي لُمست
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\components\\articles\\ArticleCard.tsx` — بطاقة المقال الموحدة.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\routes\\articles\\ArticlesApiRoute.tsx` — استهلاك البطاقة في القوائم.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\src\\services\\mobile-api.ts` — عقد بيانات بطاقة المقال.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console\\app\\api\\mobile\\v1\\articles\\route.ts` — حقول بطاقة المقال والعنوان من API.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\documents\\mobile\\UIUX-RULES.md` — معيار صورة المقال 16:9 وقاعدة التحقق بلقطة جهاز.
- `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\documentation\\md\\SESSION-LOG.md` — أضيف بلوك التجميد الحالي فقط.

### 🔁 جِت
- الفرع: `modonty-ui`
- آخر كوميت: `01f37a3` — سيو: ٤١ بطاقة أُغلقت، وثلاثة تطبيقات صارت تُترجم بعد أن كان اثنان مكسورين
- مدفوع؟ نعم
- ملفات غير مثبَّتة: ١٢٢

### ⚠️ غير متحقَّق
- قابلية استدعاء Expo وContext7 وMUI MCP من هذه المهمة؛ الإعدادات مفعّلة لكن أسماء أدواتها لم تظهر في قائمة أدواتها.
- بناء Expo و`tsc` في هذه الجلسة.
- لقطة Android لمسار `article-decisions` بعد الفصل.
- المطابقة البصرية النهائية بين لقطة الجهاز وصورة بطاقة المقال المعتمدة.

### 🚀 الاستئناف في ٣٠ ثانية
1. أغلق تطبيق Codex Desktop وافتحه، ثم افتح هذه المهمة.
2. افتح `C:\\Users\\w2nad\\Desktop\\dreamToApp\\MODONTY\\console-mobile\\documentation\\md\\SESSION-LOG.md`.
3. خذ من خالد قراراً: هل نتابع تحقق MCP أولاً أم نعود فوراً لاختبار `article-decisions` على جهاز أندرويد؟

---

## Session: 2026-08-28 02:17 — فصل قرارات المقالات عن المقالات المنشورة وتحسين رئيسية الموبايل

### 🎯 وين وقفت
- آخر تاسك شغّال: مسار «اتخذ قرارًا بشأن المقالات» صار منفصلاً برمجيًا عن تاب المقالات المنشورة؛ التحقق النهائي من ضغطه على جهاز سامسونج لم يكتمل لأن ADB توقف عن إنشاء اللقطات في آخر المحاولات.
- الفعل التالي عند العودة: شغّل `C:\Users\w2nad\AppData\Local\Microsoft\WinGet\Packages\Genymobile.scrcpy_Microsoft.Winget.Source_8wekyb3d8bbwe\scrcpy-win64-v4.1\adb.exe devices -l` ثم افتح مهمة «اتخذ قرارًا بشأن المقالات» والتقط لقطة لمسار `article-decisions`.

### ✅ اللي خلص
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\home\HomeRoute.tsx` — بطاقة الاشتراك صارت بعنوان خارجي «تفاصيل الاشتراك»؛ السهم بجانب الأيام؛ قائمة المهام صارت أفعالًا واضحة وتخفي الصفوف ذات القيمة صفر.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console\app\api\mobile\v1\dashboard\route.ts` — نصوص الرئيسية من API؛ عدّ أسئلة القراء صار يقتصر على `user` و`chatbot` ولا يخلط أسئلة فريق المحتوى.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console\app\api\mobile\v1\articles\route.ts` — نطاقان صريحان: `published` للمقالات المنشورة و`decision` لمقالات `AWAITING_APPROVAL`.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\App.tsx` — مسار `article-decisions` مستقل؛ بعد اتخاذ القرار يعود إلى قائمة القرارات ويعيد تحميل الرئيسية.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\articles\ArticlesApiRoute.tsx` — قائمة عامة تعتمد النصوص والحالات القادمة من API للمقالات المنشورة أو قرارات المقالات.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\mobile\UIUX-RULES.md` و`C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\mobile\ENGINEERING-RULES.md` — أضيفت قاعدة اللقطة من الجهاز قبل الادعاء أو العرض.
- tsc: صفر أخطاء
- بناء Expo: ما شُغّل
- تست على جهاز أندرويد فعلي: فشل — لقطات الرئيسية السابقة نجحت، لكن اختبار ضغط مسار `article-decisions` لم يكتمل؛ ADB لم ينشئ لقطة في آخر المحاولات.

### 📝 القرارات وأسبابها
- فصل `article-decisions` عن تاب `articles` → العميل أكد أن تاب المقالات يخص المنشور فقط وأن القرار يحتاج قائمة مستقلة → رُفض تحويل بطاقة القرار إلى تاب المقالات أو عرض المنشور مع المقالات المعلقة في قائمة واحدة.
- عدّ أسئلة القراء بـ`source=user|chatbot` فقط → المخطط ومسار الجمهور يفرّقانها عن أسئلة المحتوى `manual|null` → رُفض الاحتفاظ بالعدّ العام لأنه كان يضلل العميل بعدد لا يخصه.
- إخفاء المهام ذات العدد صفر → المهمة الصفرية ليست إجراء مطلوبًا → رُفض إبقاء «راجع الفيديوهات 0» كضوضاء في الرئيسية.
- نصوص واجهة الرئيسية وقوائم المقالات من API → قاعدة صفر هارد كود للنص المرئي → رُفضت تسميات الحالات والنصوص الافتراضية داخل شاشة المقالات الجديدة.

### 🚧 معلّق ومحجوز
- اختبار مسار قرارات المقالات على الجهاز — الحاجز: ADB/scrcpy لم يرجعا لقطة أو قائمة أجهزة في آخر المحاولات؛ لا دليل لقطة نهائي بعد الفصل.
- التست الكامل للنقاط الأربع عشرة — الحاجز: لم تكتمل التغطية أو تقرير `TEST-REPORT-2026-08-28.md`؛ لا يُدّعى اكتماله.
- تحسينات واجهة إضافية — الحاجز: مراجعة خالد للّقطة الفعلية التالية لمسار القرارات بعد عودة ADB.

### 📂 الملفات التي لُمست
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\App.tsx` — تحميل قوائم المنشور والقرارات ومسار العودة الصحيح.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\route-types.ts` — أضيف `article-decisions`.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\home\HomeRoute.tsx` — بطاقات اشتراك ومهام أوضح وروابط الوجهة الصحيحة.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\articles\ArticlesApiRoute.tsx` — عرض القائمتين بحسب بيانات API.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\services\mobile-api.ts` — عقد `MobileArticleCollection` ونطاق تحميل المقالات.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console\app\api\mobile\v1\articles\route.ts` — ترشيح المنشور أو المعلّق ونسخ API.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console\app\api\mobile\v1\dashboard\route.ts` — مهمة القرار وعداد أسئلة القراء الصحيح.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\mobile\UIUX-RULES.md` — قاعدة التسليم الذهبيّة للّقطة الفعلية.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\mobile\ENGINEERING-RULES.md` — دليل لقطة الجهاز قبل الادعاء.

### 🔁 جِت
- الفرع: `modonty-ui`
- آخر كوميت: `01f37a3` — سيو: ٤١ بطاقة أُغلقت، وثلاثة تطبيقات صارت تُترجم بعد أن كان اثنان مكسورين
- مدفوع؟ لا
- ملفات غير مثبَّتة: ٧٠

### ⚠️ غير متحقَّق
- لقطة جهاز أندرويد فعلي لمسار `article-decisions` بعد الضغط على «اتخذ قرارًا بشأن المقالات».
- فتح مقال من قائمة القرار ثم الموافقة أو طلب التعديل والعودة للقائمة على الجهاز.
- بناء Expo للإنتاج.
- الحالات الأربع لكل شاشة ومسار التست الكامل للنقاط الأربع عشرة.

### 🚀 الاستئناف في ٣٠ ثانية
1. شغّل `C:\Users\w2nad\AppData\Local\Microsoft\WinGet\Packages\Genymobile.scrcpy_Microsoft.Winget.Source_8wekyb3d8bbwe\scrcpy-win64-v4.1\adb.exe devices -l`.
2. افتح `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\App.tsx`.
3. خذ من خالد قرارًا: هل لقطة قائمة «مقالات بانتظار قرارك» بعد اختبارها مطابقة للـUX المتوقع أم تحتاج مراجعة شكل قبل الانتقال للتست الكامل؟

---

## Session: 2026-08-27 20:28 — تنفيذ مراجعة المقال من هيكل كونسل الويب

### 🎯 وين وقفت
- آخر تاسك شغّال: تدفق «مراجعة المقال» على الموبايل؛ شاشة المراجعة والأسئلة تعملان على جهاز أندرويد بحساب كيما زون، والمصادر مشروطة بعميل YMYL ومراجع فعلية.
- الفعل التالي عند العودة: افتح `console-mobile/src/routes/articles/ArticleReviewApiRoute.tsx` وراجع قرار إضافة تأكيد/طلب تعديل مستقل لكل سؤال مع خالد.

### ✅ اللي خلص
- `console-mobile/src/routes/articles/ArticleReviewApiRoute.tsx` — صفحة مراجعة للمقال تفتح المقال HTML والأسئلة والمصادر الحقيقية وتبقي اعتماد المقال مع نافذة تأكيد.
- `console-mobile/src/services/mobile-api.ts` — نوع بيانات المقال صار يشمل الأسئلة والمصادر وبيانات صفحة المراجعة.
- `console/app/api/mobile/v1/articles/[articleId]/route.ts` — يعيد الأسئلة والمراجع ويخفي المصادر عندما لا يكون العميل YMYL.
- `console-mobile/src/theme/tokens.ts` — token لصورة المقال المستخدمة مع Skeleton التحميل.
- `console-mobile/package.json` و`pnpm-lock.yaml` — أضيف `@native-html/render` لعرض HTML كمكوّنات React Native.
- `documents/mobile/ENGINEERING-RULES.md` — أضيف إجراء scrcpy وADB المعتمد للاختبار على الجهاز الحقيقي.
- tsc: صفر أخطاء
- بناء Expo: ما شُغّل
- تست على جهاز أندرويد فعلي: نجح — تسجيل دخول KiMa Zone، صفحة مراجعة المقال، عرض HTML، و5 أسئلة حقيقية؛ زر اعتماد المقال لم يُضغط.

### 📝 القرارات وأسبابها
- مطابقة أقسام الكونسل الحالية (المقال، الأسئلة، المصادر) → البيانات والبنية موجودة أصلاً في `Article.faqs` و`Article.citations` → رُفض إنشاء `ArticleReviewDecision` لأنه كان سيخترع مسار بيانات جديداً.
- إظهار المصادر لعملاء YMYL فقط عندما توجد citations → طلب خالد السابق يجعل citation إلزامية لـYMYL، وقاعدة الموبايل تحذف الحقل الفارغ → رُفض عرض بطاقة مصادر فارغة أو عدّاد وهمي.
- استخدام `@native-html/render` مع `expo-image` → محتوى المقال مخزن HTML ويجب عرضه بتنسيقه → رُفض نزع التاقات إلى نص عادي ورفض WebView.

### 🚧 معلّق ومحجوز
- اختبار صفحة المصادر — الحاجز: KiMa Zone غير مصنّف YMYL ولا يملك حالة اختبار مناسبة للمصادر.
- موافقة أو طلب تعديل لكل سؤال مستقلاً — الحاجز: الكونسل الحالي يعرض الأسئلة للمراجعة فقط ولا يملك قراراً مستقلاً لكل FAQ؛ يحتاج قرار خالد إن كان مطلوباً كسلوك جديد.
- طلب تعديل المقال من الموبايل — الحاجز: API الويب موجود، لكن زر ومسار الإدخال لم ينقلا بعد إلى صفحة المراجعة.

### 📂 الملفات التي لُمست
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\articles\ArticleReviewApiRoute.tsx` — مراجعة المقال، HTML، Skeleton، والأسئلة والمصادر.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\services\mobile-api.ts` — عقد API للمراجعة.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console\app\api\mobile\v1\articles\[articleId]\route.ts` — بيانات مراجعة المقال للموبايل.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\theme\tokens.ts` — token لصورة المقال.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\package.json` — اعتماد HTML native renderer.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\pnpm-lock.yaml` — قفل الاعتمادية.
- `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\documents\mobile\ENGINEERING-RULES.md` — إجراء scrcpy وADB.

### 🔁 جِت
- الفرع: `modonty-ui`
- آخر كوميت: `01f37a3` — سيو: ٤١ بطاقة أُغلقت، وثلاثة تطبيقات صارت تُترجم بعد أن كان اثنان مكسورين
- مدفوع؟ لا
- ملفات غير مثبَّتة: ٢٩ — ١٢ تعديلاً متتبَّعاً و١٧ ملفاً غير متتبَّعاً قبل إضافة هذا السجل؛ توجد تعديلات أخرى للمستخدم خارج نطاق الموبايل.

### ⚠️ غير متحقَّق
- بناء Expo للإنتاج لم يُشغّل.
- صفحة المصادر لم تختبر على حساب YMYL فعلي.
- مسار طلب تعديل المقال من شاشة الموبايل لم ينفّذ.
- اعتماد المقال لم يُختبر في هذه الجولة لأن خالد يحتفظ بضغطة الاعتماد النهائية.

### 🚀 الاستئناف في ٣٠ ثانية
1. شغّل `git -C C:\Users\w2nad\Desktop\dreamToApp\MODONTY status --porcelain`.
2. افتح `C:\Users\w2nad\Desktop\dreamToApp\MODONTY\console-mobile\src\routes\articles\ArticleReviewApiRoute.tsx`.
3. خذ من خالد قراراً: هل يريد تأكيد/طلب تعديل مستقلين لكل سؤال، أم يبقى الفلو مطابقاً للكونسل الحالي بمراجعة الأسئلة ثم قرار المقال النهائي؟
