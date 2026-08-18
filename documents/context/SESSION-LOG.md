# Session Context — Last Updated: 2026-08-19

> ⚙️ **ملف نشط = آخر أسبوع فقط** (يتوزّع أسبوعياً لتوفير الـ token عند القراءة).
> الأرشيف الكامل بالأشهر:
> - 🗄️ [أغسطس 2026](./SESSION-LOG-2026-08.md)
> - 🗄️ [يوليو 2026](./SESSION-LOG-2026-07.md)
> - 🗄️ [يونيو 2026](./SESSION-LOG-2026-06.md)
> - 🗄️ [ما قبل يونيو 2026](./SESSION-LOG-archive-until-2026-06-01.md)
>
> 🔄 **تدوير تلقائي أسبوعي** (كلود يسوّيه بنفسه كل جلسة، بلا طلب): أي بلوك `## Session:` أقدم من ٧ أيام من تاريخ اليوم → يُنقَل تلقائياً إلى أرشيف شهره (`SESSION-LOG-YYYY-MM.md`، يُنشأ إن لم يوجد؛ نقل لا نسخ). الجلسات الجديدة تُلحق أعلى قسم الجلسات. الأرشيف الشهري هو السجل الدائم؛ هذا الملف يبقى دائماً ≈ آخر ٧ أيام فقط.
>
> ⛔ **التدوير يمسّ بلوكات `## Session:` فقط.** قسم «معلّقات ثابتة» أدناه **لا يُدوَّر أبداً** — يبقى مهما قدُم عمره حتى يُقفل صراحةً (الشغل غير المنجز هو أهم ما يُحمَل، ولا يجوز أن يسقط بالعمر).
>
> ✅ **تحقّق إلزامي عند كل تدوير (صفر فقدان):** عدّ `grep -c '^## Session:'` في النشط قبل التدوير = (المنقول إلى الأرشيف) + (المتبقّي في النشط). لا تقصّ إلا عند فاصل `---` بين بلوكين، ولا تقطع وسط بلوك.

---

## 🔒 معلّقات ثابتة — لا تُدوَّر (تبقى حتى تُقفل صراحةً)

> هذا القسم **مستثنى من التدوير الأسبوعي**. كل بند = مؤشّر لمصدره الموثوق (لتفادي تضارب النسخ، لا نسخ المحتوى هنا). يُشطب فقط عند إنجازه فعلاً على الإنتاج.

### ✅ خرجت من المعلّقات (أُنجزت 2026-08-08) — 🖼️ ريفاكتور مكوّن الصور اكتمل بالكامل، ودُفع للإنتاج
- **الفرع `image-component` انضمّ لـ`main` ودُفع** (`ce1c85b`، fast-forward صفر تعارض). لا فرع منفصل بعد اليوم — الموضوع كلّه على `main`.
- **`MI2` (مودونتي) + `MI9` (الأدمن والكونسول) + `BL2`/`BL2C` + `GALJUST`** — كل الأقسام أُقفلت. صفر `next/image` مباشر في المستودع كلّه، صفر `<img>` خام إلا استثناءات `.svg` موثَّقة في مكانها.
- **٩ أعطال `fill`/`relative` كشفها التست الحيّ بعد التحويل الآلي في الأدمن** — أخطرها معرض بريف العميل (`briefs/[clientId]/page.tsx`، تصميم masonry بلا نسبة أبعاد حقيقية، مصلَّح بـ`tileAspectRatio`/`shouldContainTile`). أُصلحت التسعة كلّها بدليل حيّ (Playwright على `modonty_dev`) قبل الدفع. التفاصيل الكاملة في بلوك جلسة اليوم أدناه.
- **نشر الإنتاج تحقّق بدليل خام:** `vercel inspect` أظهر deployment جديد Ready على `admin.modonty.com` مبنياً من `main` (alias `-git-main-`)، و`git rev-list --left-right --count origin/main...main` = **صفر/صفر**.
- **رقم إصدار الأدمن صار ظاهراً في القائمة الجانبية** (كان مدفوناً داخل قائمة "M" المنسدلة) — بطلب خالد، عشان يعرف الفريق أي نسخة شغّالة وقت التنسيق.

### 🚧 لا يزال معلّقاً — لم يُلمس اليوم
- **بانِي موقع الشريك (2026-08-18) — مبنيّ ومتحقَّق على `modonty_dev` · ٧٧ ملفاً غير مثبَّت على فرع `modonty-site-groups` · لم يُدفع · لم يُدمج.** بند «٦ — الدفع» بانتظار نقاش خالد (tsc×3 · build · `prisma db push` على الإنتاج بيد خالد). المصدر الموثوق: بلوك جلسة 2026-08-18 أدناه.
- **`SUBDOM` — النطاق الفرعي للشريك (HIGH، مؤجَّل بقرار خالد 2026-08-18)** — منطقة DNS لـ`modonty.com` في حساب Vercel آخر (dreamtoapp)؛ الخطوات الخمس مكتوبة على `TASK.html:1373`.
- **«مقالات العملاء» (المشروع الحالي)** — خدمة نشر مقالات على موقع العميل نفسه. التصميم مكتمل على اللوحة و**صفر كود**. أربعة قرارات تنتظر خالد (المشاهد ٢ · ٤ · ١٠ · ١١). المصدر الموثوق: TASK.html بورد ca.
- **`IMGDIM` (خطوة صيانة الأبعاد داخل Run-All)** — جاهزة بالكود ومُختبَرة على dev، **بانتظار ضغطة خالد على Run-All بالإنتاج** (المتوقَّع `29 fixed`).
- **`DIMWRONG`** — ٣ صفوف تخزّن أبعاداً تخالف الملفّ الذي تخدمه.
- **`BNOPT`** — محسّن بني عبر `images.loaderFile`، محجوب بثلاث بوّابات (تأكيد التفعيل · قياس السعر · قياس السرعة) — بلا تغيير اليوم.

### ✅ خرجت من المعلّقات (أُنجزت 2026-08-07)
- **`prisma db push` على الإنتاج** — نُفِّذ ضمن النشر الكبير (push `78e6a27`): ٩٥ مجموعة، فهرس `redirects_section_fromSlug_key` انبنى بعد فحص تكرار نظيف، صفر حذف. التفاصيل في بلوك جلسة 2026-08-07 + بند 45 على TASK.html.

### ✅ خرجت من المعلّقات
- **إدخال محتوى الشروط/الخصوصية (أُقفل 2026-08-06):** خالد يتولّاه بنفسه. النصّان في `documents/legal/`، يُلصقان من الأدمن على `/modonty/pages/terms` و`/modonty/pages/privacy-policy` على الإنتاج.

### ✅ خرجت من المعلّقات (أُنجزت 2026-07-21/22)
- **d5 — فصل الطاقم اكتمل (مدفوع 2026-07-22 `8a7b639`):** حُذفت نسخ `User` القديمة + شِيل `db.staff ?? db.user` (admin 0.95.0، staff-only) + فُعّل ربط Google الآمن (`allowDangerousEmailAccountLinking`، آمن بعد الفصل). المتبقّي اختياري: تنبيهات `userId`→`staffId`. المصدر: `memory/project_pending_d5_remove_staff_fallback`.
- **فصل الطاقم:** نُشر (`118e367`) + رُحّل (10 أدمن→staff بنفس `_id`) + دُوّر `AUTH_SECRET` + تحقّق دخول staff حيّ.
- **معرض العميل + محسّن WebP:** نُشر + اختُبر حيّ على الإنتاج (كيمازون معرض إضافة/حذف · فرسان التعافي WebP −88%).

### ✅ خرجت من المعلّقات (أُنجزت 2026-08-07) — 🐇 ترحيل Bunny اكتمل على الإنتاج
- **Epic INV كامل:** ذيل A2 (`B1`) · S1 (`B6`) · V1 (`B10`) — الثلاثة أُقفلت بقياس حيّ. و**P3-5 تشغيل الترحيل على الإنتاج** تمّ.
- **الحصيلة المقيسة:** مكتبة الوسائط **٥٩١ صفاً · بلا `bunnyUrl`: صفر** · الموقع الحيّ **١٥٦ صورة على ٨ أنواع صفحات كلها `b-cdn.net`، صفر مكسورة** · القاعدة: **صفر رابط Cloudinary في أي حقل يُقدَّم**.
- **خط سير النشر: ٣٩/٣٩.** التفاصيل في بلوك جلسة 2026-08-07 وبورد «خط سير النشر» في TASK.html.
- **`T9` (إطفاء Cloudinary) مؤجَّل عمداً لا معلَّق** — الحساب مجاني، و٥٣٣ رابط أصل يبقون شبكة رجوع بلا تكلفة. يُراجَع ≈ نوفمبر ٢٠٢٦.
- **معارض العملاء على Bunny** — أُنجزت ضمن الترحيل (نطاق `cloudinary-scopes.ts` يشمل `GALLERY`؛ البند القديم `B5` حُذف كمكرَّر).

### 🔮 مستقبلي
- [ ] **`ADM-AUTH-IMG`** — الأدمن بلا حقل لصورة الكاتب؛ اضطررنا لكتابتها بسكربت.

---

## Session: 2026-08-18 (مساءً) → 2026-08-19 (فجراً) — 🤖 **مودو أُقفل بالكامل**: النطاق صار المجال · محرّك واحد · الزائر يجرّب بلا تسجيل · يتعلّم ويتذكّر · دورة السؤال اكتملت (فرع `modonty-ui` · **٢٢ كوميت لم تُدفع** · **لا merge**)

### 🎯 أين وقفت
- **مودو: صفر بند مفتوح.** ٤٠ بنداً على اللوحة + الفجوات الستّ التي حدّدها خالد. الرحلة كاملة ومقيسة حيّاً: زائر بلا حساب يسأل ٣ أسئلة → جواب من محتوانا أو من جواب شريك منشور → بطاقة شريك بزرّ حجز → يقيّم الجواب → يرجع فيتذكّره مودو.
- **الفعل التالي:** `prisma db push` على الإنتاج **بيد خالد** (نُفِّذ على `modonty_dev` وأنشأ الفهارس الثلاثة)، ثم إذن الدفع — والدفع على `modonty-ui` = نشر على `test.modonty.com`.

### ✅ أُنجز هذه الجلسة

**النطاق: من التصنيف إلى المجال** (`MD-52`…`MD-58`)
- الشاشة والـAPI والسجلّ كلها على `industrySlug`. السياحة العلاجية **٢١ شريكاً** ولا تصنيف لها، فالتصنيف كان يخفي الشركاء عن مودو.
- عمودا `industrySlug`/`industryId` في `chatbot_messages` — قبلها كل دور يُحفظ `scopeType:"category"` بمعرّف فارغ، فلا نعرف أي مجال يحوّل.
- `api/suggest-industry` بدل `suggest-category`: «تجميل أنف في مصر» صار يصل للمجال الصحيح بدل تصنيف محتوى.

**`MD-12` — المحرّك الواحد**
- ثلاث قطع مشتركة: `guard-chat-request` · `resolve-web-fallback` · `stream-answer-response`. مسار المقال ربح بها حماية إلغاء البثّ، وفشل بحث صادق، وحذف حفظ مكرّر كان يسجّل السؤال مرّتين.

**الفجوات الستّ (بأمر خالد «أبغى task منتهي»)**
1. **الزائر المجهول ٣ أسئلة** — كوكي HttpOnly موقَّع بـHMAC. مقيس: `طلب 1-3 → 404 + cookie` · `طلب 4 → 401 needsSignIn` · الجسم الخاطئ لا يأكل حصّة (كان يأكلها، فنُقل الصرف إلى ما بعد التحقّق).
2. **الواجهة** — `docHeight 894 → 601` · `documentScrolls: false`. الفوتر أُخفي بـ`data-fullscreen-pane`، والارتفاع بالفلكس بدل `100dvh-3.5rem` (الهيدر ٥٧ لا ٥٦، فكان يبقى بكسل يمرّر).
3. **الجوّال** — `fontSize 14 → 16px` (آيفون يكبّر الصفحة قسراً تحت ١٦) · `height 44` · صفر تمرير أفقي.
4. **معايرة العتبة** — `RERANK_MIN_SCORE 0.3 → 0.7` على ٣٥ سؤالاً حقيقياً. الفجوة المقيسة بين «يفترض يجيب» (`0.8578`+) و«ما يفترض» (`0.5151`-). الأداة باقية: `scripts/calibrate-modo.mjs` + `api/calibrate` (تطوير فقط، تقف عند الاسترجاع فلا تدفع ثمن توليد).
5. **يتعلّم** — 👍/👎 لكل جواب في `ChatbotMessage.wasHelpful` (المعرّف يصل العميل في إطار `done`، والحفظ صار قبله لا بعده) · ذاكرة عبر المحادثات (`api/memory`) تعرض «آخر مرة كنت تسأل في…».
6. **دورة السؤال** — `publishFaqAnswer` واحدة للشاشتين · `askPartnerFromChat` يحوّل سؤال مودو لصندوق الشريك بـ`source:"chatbot"` · مودو يقرأ الأجوبة المنشورة: **`chunks 153 → 193`**.

**أعطال كشفها التست الحيّ وأُصلحت**
- **استشهادات كوهير** تُولَّد بعد النصّ: `afterLastDeltaMs: 39308` · `citation-start@40221ms` · `message-end@70679ms` — الطلب ٦٣ث يتخطّى `maxDuration=60` فيموت قبل إطار `done`. بعد `citationOptions:{mode:"OFF"}`: **٩٫٠ث**. يفيد كل إجابات مودو لا مسار المقال وحده.
- **مسار المقال كان بلا مدخل** — صفر رابط يولّد `?article=` في الموقع كلّه، أي كود لا يصله زائر. أُضيفت بطاقة «اسأل مودو» تحت عنوان المقال.
- سؤال تجميل أنف كان يرجّع ٣ عيادات علاج ألم · سؤال «مدة التعافي» يرجّع مقالات سلس البول وتكميم المعدة — حدود دنيا للصلة في ثلاثة مواضع.
- الصورة ملأت الشاشة (`fill` بلا أب `relative`) — حُصّن `ModoCharacter` بغلاف نسبي داخلي فلا يتكرّر.
- إفصاح الذكاء الاصطناعي تحت كل مُدخل (EU AI Act المادة ٥٠) + شعار مودو في الترحيب بدل صورة المستخدم الفارغة.
- شارة التوثيق كانت **أربع أيقونات مختلفة** لمعنى واحد → `VerifiedBadge` مشترك. وسكرولر الموقع كلّه صار بلون البراند.
- حُذف ٤٢١ سطراً ميتاً (`clients-section` → `clients-content` → `client-list-item`) + `api/topics` + `suggest-category` + `retrieve-from-chunks` + `LoginCard`.

**`creative/` — مجلد جديد** لأصول الإعلانات: `modonty-icon.svg` · `modonty-trust-shield.svg` (درع التوثيق — كان في `public/images/homepage/` ولم أجده أول مرة فاخترعت بديلاً) · برومبت فيسبوك بصيغة JSON + `fixes.json` بـ١١ تصحيحاً.

- **TSC:** modonty `0` · console `0` · admin `0`
- **Build:** لم يُشغَّل
- **تست حيّ:** نعم — الحصّة المجهولة · الواجهة · الجوّال · المعايرة · أجوبة الشركاء في الاسترجاع · مسار المقال من طرف لطرف

### 📝 قرارات وتصحيحات
- **`main` لا يُلمس إطلاقاً** (خالد): لا دفعاً ولا سحباً. حُدِّثت `feedback_never_merge_without_explicit_confirmation`.
- **`modonty-ui` = فرع النشر التجريبي** على `test.modonty.com` — وصفته «فرعاً ميتاً» استنتاجاً من `git rev-list` وهذا خطأ: رقم git لا يقول ما المعلَّق على الفرع. حُفظت `project_modonty_ui_is_the_test_deploy_branch`.
- **العتبة الأعلى عند التعادل**: عند `0.08` و`0.7` نفس الإصابة (١٤/١٥)، لكن الخطأ يختلف — الأولى تجيب من مقطع ضعيف، والثانية تصمت. على محتوى طبّي الصمت أفضل، والصمت ينزل لبطاقة شريك لا لطريق مسدود.
- **لا fine-tuning**: المحتوى يتغيّر أسبوعياً فالتدريب يتقادم؛ التدريب يعلّم الأسلوب لا الحقائق.
- **`kind` اختياري** في `article_chunks`: في مونجو الحقل الغائب لا يُطابَق بقيمة، فالاختياري يسمح بـ`isSet` بدل تعبئة الكاش كلّه.
- **أخطائي المتكرّرة هذه الجلسة كلها من نمط واحد:** بحث ضيّق النطاق ثم حكم قاطع («صفر إيميل» · «صفر تقييم» · «فرع ميت» · «لا يوجد درع»). الغياب لا يُثبَت بمجلد واحد.

### 🚧 معلّق / بيد خالد
- **`prisma db push` على الإنتاج** — ثلاث إضافات اختيارية (`industrySlug`/`industryId` · `wasHelpful` · `kind`)، والفهارس لا تُنشأ بدونه. الأمر في `modo-chat/TASK.md`.
- **إذن الدفع** — ٢٢ كوميت على `modonty-ui`؛ الدفع نشر على `test.modonty.com`.
- **أربعة قرارات في `ask-partner-loop.html`** (أ·ب·ج·د) — الدورة تشتغل بالافتراضات وردّه يضبطها.
- **١٤ قراراً في `modo-decisions.html`**.
- **غير معطِّل:** عتبة بوّابة المقال `0.52` لم تُعايَر · ٤ أخطاء `JWTSessionError` سابقة لشغل مودو ولم تُشخَّص · `ChatList.tsx` ٦٣٧ سطراً يستحقّ تقسيماً · `/articles` يرجع **404** والنّاف يشير له (لا `page.tsx`).

### 📂 أهمّ الملفات
- `modonty/app/(site)/modo-chat/` — المسار كلّه: `data/` (١٨ ملفاً) · `components/` · `api/` (٨ نقاط)
- `modonty/app/(site)/modo-chat/documentation/` — `MAP.md` · `modo-decisions.html` (١٨ قراراً) · `ask-partner-loop.html` · `calibration-questions.md`
- `console/lib/faq/publish-faq-answer.ts` — الردّ الموحَّد للشاشتين
- `shared/prisma/schema/schema.prisma` — `wasHelpful` · `kind` · أعمدة المجال
- `shared/components/modo-character/` · `shared/components/verified-badge/`
- `scripts/calibrate-modo.mjs` · `creative/`

### 🔁 حالة Git
- **الفرع: `modonty-ui`** (انتقلنا إليه بأمر خالد؛ `modonty-site-groups` مطابق تماماً)
- آخر كوميت: `11c8892` — اللوحة: مودو صفر بند مفتوح
- **٢٢ كوميت غير مدفوعة** · **لم يُدفع** · **لا merge**
- غير مثبَّت (مقصود): شغل `categories` من جلسة أخرى · `admin/` · `settings*.json` · `.mcp.json` · مؤقّتات

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd modonty && npm run dev` ثم `http://localhost:3000/modo-chat`
2. افتح `file:///C:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/idea/reels-and-seo-findings.html` — صندوق «المطلوب منك» أوّل الصفحة
3. القرار الأول: `prisma db push` على الإنتاج + إذن الدفع؟ أو نمسك قرارات دورة السؤال الأربعة؟

---


## Session: 2026-08-18 (ظهراً) — 📦 كوميت ودفع بانِي موقع الشريك على `modonty-site-groups` (بأمر خالد «COMMIT AND PUSH TO THE CURRENT BRANCH» · لا merge)

### 🎯 أين توقفت
- `hh>` ثم أمر خالد بالكوميت والدفع للفرع الحالي. نُفِّذ طقس الدفع: **tsc صفر أخطاء على الثلاثة** (modonty `EXIT:0` · console `EXIT:0` · admin `EXIT:0`) · باكب الإنتاج `PROD-2026-08-18_13-53` (٩٥ مجموعة · ٦٦ م.ب) · رفع الإصدارات: modonty 1.92.0→**1.93.0** · console 0.27.0→**0.28.0** · shared 0.2.4→**0.3.0** (الأدمن بلا تغيير محتوى — ملفّا Run-All فرقهما نهايات أسطر فقط، `git diff --stat` فارغ، لم يُبمَّب ولم يُضَف).
- **الخطوة التالية:** بند ٦ الباقي: `pnpm build` مدونتي · `prisma db push` على الإنتاج بيد خالد · ثم قرار الدمج بأمره الصريح. البنود المعلّقة الأخرى (`SUBDOM` · بلوك الفيديو · تحديث `partner-site-builder.html`) كما في البلوك السابق.

### 🚧 مستثنى من الكوميت عمداً
- `.pnpm-store/` · `img-reqs.txt` · `mobile-uiux-mockup.html` · `.claude/settings*.json` · `.mcp.json` · ملفّا الأدمن (EOL فقط).
- تسجيل changelog في القاعدة (`createChangelog`) **لم يُنفَّذ** — دفع فرع ميزة لا نشر إنتاج؛ يُسجَّل عند الدمج/النشر.

---

## Session: 2026-08-17 (مساءً) → 2026-08-18 (فجراً) — 🧱 بانِي موقع الشريك: كونسول «موقعك» + جدول `ClientSite` + مكوّنات مشتركة + رِندَر مطابق على مدونتي (فرع `modonty-site-groups` · **٧٧ ملفاً غير مثبَّت** · **لم يُدفع** · **لا merge**)

> خالد في نهاية الجلسة: حصّة موديل Fable الأسبوعية عند ٩٥٪ → جمّد الجلسة (`us>`) وقد يكمّل بموديل آخر. **الجلسة الجاية تبدأ بـ`hh>`** ثم إمّا كوميت محلّي للـ٧٧ ملفاً (عرضتُه، لم يقرّر) أو نقاش بند «٦ — الدفع».

### 🎯 أين توقفت
- **آخر تاسك:** بانِي موقع الشريك — البنود ١ (تحسين التصميم) · ٢ (الجوّال) · ٤ (الفيديو) · ٥ (التنظيف) **أُنجزت**. البند ٣ (النطاق الفرعي) **أُجّل بقرار خالد** إلى بطاقة `SUBDOM` على اللوحة (HIGH). البند ٦ (الدفع/النشر) **لم يُناقَش**.
- **الخطوة التالية عند الرجوع:** `hh>` → اسأل خالد: (أ) كوميت محلّي بلا دفع للـ٧٧ ملفاً؟ (ب) نبدأ بند ٦ (`tsc` على الثلاثة · `pnpm build` مدونتي · خطة `prisma db push` على الإنتاج بيد خالد)؟ — لا تُنفَّذ إلا بأمره.

### ✅ المنجز هذه الجلسة (بعد ضغط سياقي؛ الأقدم في ملخّص الجلسة داخل المحادثة)
- **السكيما (`shared/prisma/schema/schema.prisma`):** حُذف `PageTemplate` وحقول القوالب من `Client`؛ أُضيف `model ClientSite` (1:1 مع `Client`: `headerTemplate` · `footerTemplate` · `primaryColor?` · `hiddenSections[]` · `subdomain? @unique` — السطر 726) + `site ClientSite?` على `Client`. **دُفعت إلى `modonty_dev` فقط** (`pnpm prisma:push -- --skip-generate` بأمر خالد الصريح «you do it»؛ الناتج `[+] Collection client_sites`). ⚠️ `db push` أسقط ٣ فهارس TTL — Run-All يعيدها.
- **المكوّنات المشتركة `shared/components/partner-site/`:** ٥ هيدرات (`free/header/{classic,centered,utility,transparent,pill}-header.tsx` + سجلّ `HEADER_TEMPLATES`) · ٤ فوترات (`free/footer/{columns,simple,brand,centered}-footer.tsx` + `FOOTER_TEMPLATES`) · بلوكات الرئيسية والصفحات (`free/{hero,trust,about,services,stats,testimonials,gallery,team,video,faq,blog,contact,cta,newsletter,booking}/…` بسجلّات `HOME_BLOCKS` · `ABOUT_BLOCKS` · `SERVICES_BLOCKS` · `GALLERY_BLOCKS` · `FAQ_BLOCKS` · `CONTACT_BLOCKS` · `BLOG_BLOCKS` · `BOOKING_BLOCKS` · `REVIEWS_BLOCKS`؛ كل بلوك `{key,name,toggleable,isEmpty(data),Component}`) · أجزاء `parts/{brand-logo,whatsapp-button}` · `social-links.tsx`.
- **المكتبة المشتركة `shared/lib/partner-site/`:** `get-home-data.ts` (استعلامات Prisma → `HomeData` واحد) · `partner-site-palette.ts` (٨ ألوان WCAG) · `hex-to-hsl-triplet.ts` · `detect-social-platform.ts` · `validate-subdomain.ts:44` · `index.ts`.
- **الكونسول:** مجموعة تنقّل «موقعك» أوّلاً (`nav-config.ts` · `site-pages.ts` ٩ صفحات) · `/dashboard/my-site` (راديو هيدر/فوتر بمعاينة كاملة العرض `dir="rtl"` · لوحة ألوان · حقل النطاق الفرعي؛ حفظ = upsert `ClientSite` + `revalidateModontyTag("clients")`) · `/dashboard/site-pages/[page]` (مفتاح إظهار/إخفاء لكل بلوك = حفظ فوري) · «محتوى الموقع» مرتَّب بالصفحة · تبديل الوضع الداكن (`next-themes` من الجذر) · شريط تمرير جانبي · خط القائمة `font-normal` · حزم: `zod` + `next-themes` في `console/package.json`.
- **مدونتي `app/(partner)/clients/[slug]/`:** `layout.tsx` يقرأ `client.site` → هيدر/فوتر من السجلّات + `--primary` · `components/page-blocks.tsx` (يرشّح المخفيّ والفارغ) · الرئيسية + ٨ صفحات داخلية `(inner)/{about,services,photos,faq,contact,articles,reviews,book}` كلها `PageBlocks` · `(inner)/(plain)/{reels,followers,likes,mentions}` منقولة (بيانات الزائر لا الشريك) · **حُذفت ١٨ ملفاً ميّتاً** (هيرو/تيزرات/أقسام/هيدر/فوتر القديمة). قائمة المستخدم: `hint` prop لإخفاء فقاعة «مزاياك هنا» في شريط الشريك.
- **الأدمن:** خطوات القوالب أُزيلت من Run-All (رجع لأصله). **اللوحة:** بطاقة `SUBDOM` (HIGH) على `TASK.html:1373` بأثر تحقّق (ملف:سطر + ناتج Vercel API + توثيق رسمي).
- **TSC:** ⚠️ **لم يُشغَّل هذه الجلسة على أي تطبيق** (قاعدة «ممنوع tsc إلا بطلب») — **غير متحقَّق**. **Build:** لم يُشغَّل. **تست حيّ:** ✅ على `modonty_dev` — جبر سيو (`support@jbrseo.com` / `JbrSeo2026!` كلمة تست أُعيد ضبطها بسكربت dev): الكونسول يحفظ (هيدر pill · فوتر brand · لون teal `175 77% 26%` · النشرة مخفيّة) → مدونتي ترسم نفس المكوّنات؛ ٨ صفحات داخلية 200 بمعرّفات الأقسام المتوقَّعة؛ ٦ عملاء آخرون يرسمون الافتراضي. **بلوك الفيديو غير مختبَر بصرياً** (لا عميل dev عنده فيديو Bunny).

### 📝 قرارات (بالسبب)
- **جدول منفصل `ClientSite` صف واحد لكل عميل بمفاتيح مكوّنات** (فكرة خالد، وافقتُ) بدل كتالوج `PageTemplate` الأوّل → أبسط وأسرع؛ الصف الغائب = افتراضيات؛ الكتالوج القديم كان معقّداً («الفكرة اللي عملتها أول كانت معقدة»).
- **قالب واحد لكل بلوك الآن + مفتاح إظهار/إخفاء** → «الشريك ليس تقنياً»: بلا سحب، لوحة ألوان جاهزة، افتراضيات تشتغل.
- **النطاق الفرعي = ميزة بريميوم اختيارية لا افتراضية، ومؤجَّل** → منطقة DNS مملوكة في حساب Vercel آخر (`domain_already_exists` · `GET /v6/domains?teamId → []` · records `forbidden`)؛ الـwildcard يشترط نيم سيرفرات Vercel (توثيق رسمي).
- **حُذف الريلز/المتابعون/الإعجابات/الإشارات من قائمة صفحات الشريك** → بيانات يولّدها الزائر لا يديرها الشريك (خالد: «إيوة، شيلها»).
- **`year` يُمرَّر في `FooterData` و`getCopyrightYear()` تحت `use cache`** → `new Date()` ممنوع في الـprerender مع `cacheComponents`.
- **سجلّ البلوكات لا يُمرَّر من صفحة سيرفر إلى مكوّن عميل** → «Functions cannot be passed to Client Components»؛ يُمرَّر مفتاح الصفحة نصّاً والخريطة تعيش في العميل.

### 🚧 معلّق / محجوب
- **بند ٦ — الدفع/النشر:** لم يُناقَش. يتطلّب: `tsc` على admin/console/modonty · `pnpm build` مدونتي · `prisma db push` على الإنتاج **بيد خالد** (سيُنشئ `client_sites` ويُسقط `page_templates`+حقول القوالب — تأكّد أنّ لا بيانات إنتاج فيها قبل الحذف) · لا Run-All مطلوب.
- **`SUBDOM`** — بانتظار خالد/مريم: نقل `modonty.com` من حساب dreamtoapp إلى فريق `modonty` على Vercel، ثم بقية الخطوات على البطاقة.
- **بلوك الفيديو** — تست بصري بعد رفع فيديو حقيقي على Bunny من الكونسول.
- **ملفات ميّتة قديمة تُركت بقرار خالد** (client-discussions-section · client-results-section · client-review-form · gallery-interactive · seed-client1-test-data · client-bottom-bar · client-footer-cta · client-newsletter-card · client-whatsapp-fab · related-clients).
- **`documents/idea/partner-site-builder.html`** — §7/§8 محدَّثان لكن الملف ما زال يصف كتالوج `PageTemplate` المهجور في صفوف المرحلتين ١/٢ — يحتاج تحديثاً.
- **ملفات خارج الشغل على الشجرة:** `.pnpm-store/` · `img-reqs.txt` · `mobile-uiux-mockup.html` · `.claude/settings*.json` · `.mcp.json` — **لا تُضاف لأي كوميت**.

### 📂 الملفات (٧٧ = `git status --porcelain | wc -l`) — الأهم
- `shared/prisma/schema/schema.prisma` · `shared/components/partner-site/**` (جديد) · `shared/lib/partner-site/**` (جديد)
- `console/app/(dashboard)/dashboard/my-site/**` · `console/app/(dashboard)/dashboard/site-pages/**` (جديدان) · `console/app/(dashboard)/dashboard/page-content/{page,components/page-content-editor}.tsx` · `console/app/(dashboard)/components/{nav-config,site-pages,theme-toggle,dashboard-header,sidebar,sidebar-nav,sidebar-groups}.tsx` · `console/app/components/providers/theme-provider.tsx` · `console/app/{layout.tsx,globals.css}` · `console/lib/ar.ts` · `console/package.json` · `pnpm-lock.yaml`
- `modonty/app/(partner)/clients/[slug]/{layout,page}.tsx` · `…/components/page-blocks.tsx` · `…/components/chrome/platform-bar.tsx` · `…/helpers/{get-partner-site,build-chrome-data,get-cached-home-data,get-copyright-year}.ts` · `…/(inner)/**` (٨ صفحات + `(plain)/`) · `modonty/app/layout/components/user-menu/{UserMenu,LoginButton,MobileAccountBenefitsMenu}.tsx` · **٢٧ ملفاً محذوفاً** تحت `…/clients/[slug]/`
- `admin/app/(dashboard)/database/{actions/run-all-maintenance.ts,components/auto-maintenance-panel.tsx}` (رجوع لأصله)
- `documents/tasks/TASK.html` (+٨ أسطر: `SUBDOM`) · `documents/idea/partner-site-builder.html`

### 🔁 Git / النشر
- **الفرع:** `modonty-site-groups` · **آخر كوميت:** `3f8f766` (تجميد ١٧ أغسطس) · **غير مثبَّت:** نعم — ٧٧ ملفاً · **مدفوع:** لا · **merge:** لا (ممنوع بلا تأكيد صريح) · **Vercel:** لا شيء نُشر؛ `*.modonty.com` مُضاف للمشروع فقط (pending verification، بلا أثر حيّ). · **القاعدة:** الإنتاج لم يُلمس؛ كل شيء على `modonty_dev`.

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `hh>` — ثم `git status --porcelain | wc -l` (المتوقَّع ٧٧) و`git log -1` (المتوقَّع `3f8f766`).
2. افتح `documents/tasks/TASK.html:1373` (`SUBDOM`) و`shared/prisma/schema/schema.prisma:700-735` (`ClientSite`).
3. قرار خالد: كوميت محلّي الآن؟ ثم بند ٦ (الدفع) أم إكمال تصميم/بلوكات؟

---

## Session: 2026-08-17 (نهاراً → مساءً) — 🏬 موقع الشريك على مجموعات المسار `(site)/(partner)` + بانِي الموقع (دراسة) + جرد الكونسول (فرع `modonty-site-groups` · **٥ كوميتات لم تُدفع** · **لا merge**)

> خالد في نهاية الجلسة: «خلصنا الـtask هذا — ٨٠٪ من الشغل، باقي صفحتان أو ثلاث» · و«التاسك الجاي كبير ومحتاج تركيز ١٠٠٪، الغلطة فيه مصيبة» → الجلسة الجاية تبدأ **نظيفة** بـ`hh>` ثم تنتظر تعريفه للتاسك.

### 🎯 أين توقفت
- **موقع الشريك** (`modonty/app/(partner)/clients/[slug]/`) مبنيّ ومتحقَّق حيّاً على الديسكتوب (فرسان التعافي مقياساً): كروم (شريط مدونتي + هيدر الشريك + فوتر) · رئيسية بترتيب الزائر (تعرّف عليه → أرقامه → خدماته → آراؤه → معرضه → فين وكيف → مقالاته → نداء) · صفحات داخلية `(inner)` (about · services · contact · articles · faq · photos · reels · reviews · book · followers · likes · mentions). خالد يعتبره **٨٠٪** — المتبقّي «صفحتان أو ثلاث» (لم يسمّها؛ مرشَّحات: تحسين الصفحات الداخلية القديمة المنقولة photos/reels/reviews بنفس نظام التصميم — **مؤشّر لا قرار**).
- **بانِي الموقع (Site Builder)** — ملف نقاش `documents/idea/partner-site-builder.html` (v2) ينتظر قرارات خالد الثمانية (§٨). **صفر كود** فيه.
- **الخطوة التالية عند الرجوع:** `hh>` → خالد يعرّف «التاسك الكبير» → قبل أي سطر: تصنيفه (محدود/معماري) + خطة مراحل + قراءة الكود المعني كاملاً (`feedback_pre_task_code_review`).

### ✅ المنجز هذه الجلسة (بعد الضغط السياقي — التفاصيل الأقدم في كوميتات الفرع)
- **`b016aed`** الهيرو وعد واحد وسطر واحد (`clip()` على slogan/description) · «تعرّف عليه» نافذة تمرير رفيعة `max-h-60` · الفوتر `line-clamp-3`.
- **`ad4d572`** مهارة `.claude/skills/partner-site-templates/SKILL.md` — نموذج القوالب (Shopify settings_schema · Salla twilight.json · Wix) → كتالوج `PageTemplate` + `Client.templateId/themeSettings/sections`.
- **`65d4d14` + `0857e2c`** ملف الفكرة `partner-site-builder.html`: سكيما · تدفّق · شاشة «موقعي» · بريميوم · مراحل · قرارات · قاعدة «الشريك ليس تقنياً» (مفاتيح لا سحب · ٨ ألوان جاهزة · افتراضيات تشتغل).
- **`7fb99da`** قسم **٠.٥ «الوضع الحالي في الكونسول»** (بطلب خالد «المفروض تسويه بدون ما أقول لك»): خريطة القائمة الجانبية (`console/app/(dashboard)/components/nav-config.ts`) · كل قسم في الموقع ← شاشته ← مالكه · ما يشتغل صح (الحفظ → `regenerateClientSeo` → `revalidateModontyTag("clients")` في ٨ أكشنات) · ٦ فجوات · ٧ تحسينات مرتّبة P0/P1/P2 · **قرار ٨**: نقل ملكية الغلاف/الشعار/زرّ الطلب/اللون للشريك (اليوم أدمن فقط: `admin/.../form-sections/cta-section.tsx` و`media-section.tsx`).
- **سكيلز:** نُزّلت ثم **استُخلصت وحُذفت** (بأمر خالد «ما نبغى ضجيج»): superpowers ×١٤ + task-observer + find-skills → ٨ بنود جديدة في `~/.claude/CLAUDE.md` قسم «🧪 منهجية الشغل — مستخلَص» (الأسطر 225–248). `impeccable` v4.0.4 كانت موجودة وبقيت. `claude-mem` بلَغن — **خالد ينزّله بنفسه** (`/plugin marketplace add thedotmack/claude-mem` → `/plugin install claude-mem`).
- **ذاكرة جديدة:** `feedback_study_current_state_before_proposing` (أي دراسة تبدأ بالوضع الحالي المقيس) + `feedback_deliverable_docs_html_not_md`.
- **TSC:** لم يُشغَّل هذه الجلسة (تعديلات المرحلة الأخيرة وثائق فقط) — آخر tsc صفر أخطاء كان بعد نقل المجموعات (**غير متحقَّق الآن**). **Build:** لم يُشغَّل بعد `b016aed`. **تست حي:** الرئيسية والصفحات الداخلية على `http://localhost:3000/clients/مؤسسة-فرسان-التعافي` (ديسكتوب ١٢٨٠×٨٠٠) قبل الضغط السياقي — **الجوّال لم يُختبر عمداً** (قاعدة «الديسكتوب أوّلاً»).

### 📝 قرارات
- **الشريك = موقع كامل داخل مدونتي بشريط منصّة رفيع** (لا صفحة داخلية) — نُفّذ بمجموعتَي مسار `(site)` (٢٦ مسار + SiteShell) و`(partner)`؛ الروابط والسيو لم يتغيّرا (routes 99=99، render modes مطابقة — من جرد `documents/tasks/PARTNER-SITE-MOVE-INVENTORY.html`).
- **الفرع `modonty-site-groups` يُدفع وحده، ولا merge إلى `modonty-ui` إلا بأمر خالد بعد تسته** (`feedback_never_merge_without_explicit_confirmation`).
- **بانِي الموقع:** القالب كود، القاعدة قيم وقرارات، الكونسول محرّر، مدونتي ترسم؛ الشريك ليس تقنياً؛ الأداء همّ مدونتي وحدها.
- **الدراسة تبدأ بالوضع الحالي** — قاعدة جديدة بعد ملاحظة خالد.

### 🚧 معلّق / بانتظار خالد
- **قرارات بانِي الموقع (٨)** في `partner-site-builder.html §٨` — أهمّها **٨** (الملكية) و**١** (النشر الذاتي) و**٤** (قالبان في الإطلاق).
- **دفع الفرع** `modonty-site-groups` (٥ كوميتات محلية: `b016aed` `ad4d572` `65d4d14` `0857e2c` `7fb99da`) — بأمر خالد فقط.
- **ملفّان ميّتان بانتظار حذف خالد:** `modonty/app/(partner)/clients/[slug]/components/home/credentials-strip.tsx` · `modonty/app/(partner)/clients/[slug]/helpers/get-client-identity.ts` (الحذف رُفض لي).
- **بطاقات TASK.html:** `GALPNG` (صور معرض PNG قديمة ١.٧ م.ب على بني ← محسّن الصور 500) · `PREV` · `83d`. النطاق الفرعي مؤجَّل.
- **محمول من بلوك `/modonty` (الفرع `modonty-ui`):** عطل hydration على الرايل الأيمن — **لم يُلمس هذه الجلسة، حالته غير متحقَّقة**.
- **ملفّات غير متتبَّعة بجذر المستودع ليست منّي في هذه الجلسة:** `img-reqs.txt` · `mobile-uiux-mockup.html` · `.pnpm-store/` — لا تُضاف للكوميت حتى يقرّر خالد.

### 📂 ملفّات لُمست (هذه الجلسة بعد الضغط)
- `documents/idea/partner-site-builder.html` — v2 + §٠.٥ + قرار ٨ · `documents/idea/README.md` — سطر الفهرس.
- `.claude/skills/partner-site-templates/SKILL.md` — قواعد «ليس تقنياً».
- `~/.claude/CLAUDE.md` — قسم «🧪 منهجية الشغل — مستخلَص» · `~/.claude/skills/` (حذف ١٦ سكيل مستخلَصة).
- الذاكرة: `feedback_study_current_state_before_proposing.md` + سطر في `MEMORY.md`.

### 🔁 Git / النشر
- الفرع: `modonty-site-groups` (= `modonty-ui` عند `bf8f51a` + ١٣ كوميت؛ `modonty-ui` صفر كوميت أمامه).
- غير مثبَّت: `.claude/settings*.json` · `.mcp.json` (مستثناة دائماً) + الثلاثة غير المتتبَّعة أعلاه.
- آخر كوميت: `7fb99da` · **مدفوع: لا** (`origin/modonty-site-groups` عند `c4bb848`، ٥ خلفه).
- فيرسل: لا نشر من هذا الفرع (لا preview مطلوب حتى الآن).

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `hh>` — ثم `git status` و`git log --oneline -6` على `modonty-site-groups`.
2. افتح `documents/idea/partner-site-builder.html` (§٠.٥ و§٨) لو التاسك الجاي هو البانِي — وإلا انتظر تعريف خالد للتاسك الكبير.
3. قبل أي كود في التاسك الكبير: تصنيف + خطة مراحل + قراءة كاملة للكود المعني + `pnpm tsc --noEmit` كخط أساس.

---

## Session: 2026-08-17 (ليلاً، حتى ≈ 03:00) — 🏛️ صفحة `/modonty` الرائدة: ثلاثة أعمدة مشتركة + درج→Popover + هيرو «النقطة» + جاليري الفريق (فرع `modonty-ui` · محلي فقط · **لم يُدفع** · **عطل hydration مفتوح**)

### 🎯 أين توقفت
- **آخر تاسك (مفتوح، عطل حقيقي):** بعد تحريك «قصة الشعار» إلى الرايل الأيمن + إضافة جاليري الفريق، ظهر **hydration mismatch** على `/modonty`: بعد ≈٤ ثوانٍ من التحميل، الرايل الأيمن («قصة مدونتي») يفقد بطاقاته الخمس كلها على العميل (`aside.innerHTML` = العنوان `<p>` فقط)، والرايل الأيسر (جاليري + «آراء شركائنا») سليم. **الدليل الخام:** HTML السيرفر (`curl`) فيه `aria-haspopup="dialog"` ×٦ · بعد الهيدريشن `document.querySelectorAll('aside button[aria-haspopup]').length` = **1** · حزمة RSC (`curl -H "RSC: 1"`) فيها كل العناوين الخمسة (`كيف بدأنا: 1` إلخ) و`StoryPopover: 2`. آخر خطوة كنت أحاول قراءة سياق العناوين داخل حزمة RSC (نسخ `/tmp/m.rsc` رُفض) — لم أصل للسبب الجذري بعد.
- **فرضيتان لم تُختبَرا:** (أ) `StoryCardTrigger` مكوّن سيرفر بـ`forwardRef` يُمرَّر كـ`trigger` لمكوّن عميل — يعمل SSR لكن قد يفشل بالعميل عند خمس نسخ (اليسار نسخة واحدة تعمل)؛ (ب) شيء في `RIGHT_TOPICS`/`ModontyMark` يعطّل فكّ الحزمة. **الاختبار الأسرع:** انقل بطاقة «آراء شركائنا» إلى اليمين مؤقتاً أو انقل «قصة الشعار» لليسار وشوف مَن يكسر — بيسكشن سطر واحد.
- **الخطوة التالية عند الرجوع:** (١) `hh>` (٢) افتح `http://localhost:3000/modonty`، انتظر ٤ ثوانٍ، عدّ الأزرار (٣) بيسكشن العطل ثم أصلحه (٤) بعدها قرار خالد على صفحة الموظف (أدناه).

### ✅ المنجز هذه الجلسة
- **`ThreeColumnLayout` + `TwoColumnLayout` + `StickyRail` صارت مشتركة عبر التطبيقات** في `shared/components/column-layout/` و`shared/components/sticky-rail/` (بطلب خالد الصريح: «وديه في الـshared الرئيسي») — واستُبدلت في `/` و`/clients` و`/industries` و`/modonty`. موثَّق في `.claude/rules/folder-structure.md` (قسم «Existing cross-app shells»).
- **قاعدة «كل نصّ عربي من `messages/ar.json`»** أُضيفت لـ`.claude/skills/modonty-uiux/SKILL.md` §0 ومرآتها في `memory/feedback_uiux_standards.md`.
- **`/modonty` رجعت ثلاثة أعمدة** بعد حذف `AboutCard` (self-link)؛ الرايلان = ٨ مواضيع من `/story` (نصّ مختصر مُعاد كتابته بلا تشكيل) في `messages.modonty.story.*`.
- **درج (Sheet) → Popover:** خالد رفض الدرج حيّاً («فكرة فاشلة»). ثُبّت `@radix-ui/react-popover` في `shared/package.json` وأُنشئ `shared/components/ui/popover.tsx` (مأخوذ عبر `npx shadcn@latest view popover` ومكيَّف لنمط الريبو). `story-drawer/` حُذف. الأزرار موحّدة (`StoryCardTrigger` = بطاقة أيقونة+عنوان+وصف، `forwardRef`).
- **تدقيق `apple-design` skill** (ثُبّت من `emilkowalski/skills` إلى `.claude/skills/apple-design/`) → إصلاحان على `shared/ui`: `motion-safe:active:scale-[0.97]` على `Button`/`StoryCardTrigger`، و`motion-reduce:` (فيد بدل سلايد/زوم) في `sheet.tsx` و`popover.tsx`.
- **الصفحة الرائدة — مفهوم «النقطة»** (خالد: «أبهرني» ثم «do»): هيرو صورة ٦:١ + شبكة نقاط ٨٪ + شعار ٨٠px يركب الحافة + زرّ جدة (رابط خرائط بإحداثيات المقر) + العدّادات caption · `AccentHeading` (شرطة تركواز) موحّد · معرض فسيفساء · ظهور منسّق واحد (`helpers/reveal.ts`) · `loading.tsx` مطابق.
- **جاليري الفريق** (`components/team-gallery/TeamGalleryCard.tsx`): مربّعات، القيادة ٢×٢، فسيفساء زغزاغ (L L s s / L L s s / s s L L / s s L L / s s s ·) مع بلاطة براند تسدّ الخلية الأخيرة (١٣ = عدد أوّلي). البيانات نُقلت من `app/story/TeamCarousel.tsx` إلى `lib/team/team-members.ts` (مستهلكان → lib التطبيق)، و`TeamCarousel` يستوردها.
- **حذف «شركاؤنا الأوائل»** (كود + نصّ) بطلب خالد · «قصة الشعار» انتقلت لليمين (اليمين = «قصة مدونتي» ٥ · اليسار = «الفريق والشركاء») · دوران السهم استُبدل بانزلاق+تلاشٍ.
- **TSC (modonty):** آخر تشغيل `TSC_EXIT:0` بعد جاليري الفريق. **Build:** لم يُشغَّل. **تست حيّ:** الهيرو/المعرض/الحركة/الـPopover تحقّقت فاتح+داكن ١٢٨٠×٨٠٠ **قبل** آخر تغييرين؛ العطل أعلاه ظهر بعدها.

### 📝 قرارات
- **الفريق ليس في القاعدة** — خالد قال «حتلاقيها في جدول السيو»؛ قِيس على `modonty_dev` (المفعَّل في `shared/.env`): `Author` = صفّ واحد (مدونتي نفسها) · `Staff` = ١٢ صفاً كلها بلا صورة وأسماء لا تطابق الـ١٣. **لا، غلط — أُبلغ.** الإنتاج لم يُفحص (ممنوع سكربت عليه بلا كلمته).
- **توصيتي لصفحة الموظف (لم تُنفَّذ، تنتظر خالد):** استعمال `Author` (نموذج Person/E-E-A-T بصفحة عامة جاهزة `/authors/[slug]`) + `staffId?` + `isPublic`، لا حقول على `Staff` (جدول دخول فيه باسوردات). التواصل عبر إيميل الشركة من `Settings` فقط. الإدخال من الأدمن (١٣ سجلاً + صور بني).
- الـPopover لا الدرج · Popover مو Accordion (الأكورديون يغيّر ارتفاع الرايل الـsticky).

### 🚧 معلّق
- 🔴 **عطل hydration الرايل الأيمن** (أعلاه) — لازم يُقفل قبل أي دفع.
- ⚠️ `ahmed.png` على بني حجمه **1.45 MB** (`curl` → `SIZE:1452594`) — أول تحميل عبر محسّن Next تأخّر وظهرت الصورة مكسورة لحظة؛ يحتاج ضغطاً على بني (بيانات لا كود).
- شرائح الخدمات لا تظهر على `/modonty` — `services` فاضي بالقاعدة (استنتاج من الرسم، لم يُقَس مباشرة).
- توزيع المواضيع بين الرايلين لم يؤكّده خالد نهائياً · صفحة الموظف تنتظر قراره · V10 الجوّال · باقي معلّقات البلوكات السابقة.
- تحذير مكرّر بالكونسول على كل صفحة: `[auth][error] JWTSessionError` ×٢ (`MobileNotificationBadge` · `NotificationsBell`) — موجود قبل الجلسة على `/` أيضاً، ليس من شغل اليوم.

### 📂 الملفات
- `shared/components/column-layout/{ThreeColumnLayout,TwoColumnLayout}.tsx` · `shared/components/sticky-rail/StickyRail.tsx` · `shared/components/ui/popover.tsx` (جديدة) · `shared/components/ui/{button,sheet}.tsx` (motion) · `shared/package.json` (+popover) · `.claude/rules/folder-structure.md` · `.claude/skills/modonty-uiux/SKILL.md` · `.claude/skills/apple-design/SKILL.md` (جديد).
- `modonty/app/modonty/**` (page · loading · TASK.md · components/{profile-hero,gallery,articles-feed,right-rail,left-rail,story-popover,team-gallery,accent-heading} · helpers/reveal.ts) · `modonty/messages/ar.json` (namespace `modonty`) · `modonty/lib/team/team-members.ts` (جديد) · `modonty/app/story/{TeamCarousel.tsx,_constants.ts}` · `modonty/components/shared/about-card/AboutCard.tsx` (رابط `/modonty`) · صفحات `/`,`/clients`,`/industries` (استبدال القشرة).

### 🔁 Git
- الفرع `modonty-ui` · آخر كوميت **`339b369`** «الرئيسية: كرت مدونتي بارتفاع كرت الحساب…» (وقبله `b45b307` — كلاهما بعد `1e79b3c` المسجّل في البلوك السابق؛ **حالة دفعهما غير متحقَّقة**، افحص `git status -sb`).
- **غير مثبَّت: كثير جداً** — كل شغل اليوم + شغل سابق (انظر `git status`؛ ≈ ٤٠ ملفاً معدَّلاً + عشرات المجلّدات الجديدة تحت `modonty/app/{clients,industries,modonty,about}` و`modonty/components/shared/*` و`modonty/messages` و`shared/components/*`).
- **لم يُدفع.** فيرسل بلا تغيير.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم `git status -sb` (هل `339b369` مدفوع؟).
2. شغّل مودونتي، افتح `/modonty`، انتظر ٤ ثوانٍ، نفّذ في الكونسول: `document.querySelectorAll('aside button[aria-haspopup]').length` — لو ≠ 6 فالعطل قائم → بيسكشن (انقل بطاقة واحدة بين الرايلين).
3. بعد الإصلاح: قرار خالد على نموذج بيانات الفريق (`Author` + `isPublic`) قبل أي سكيما.

---

## Session: 2026-08-16 (صباحاً) — 🛠️ إصلاح فشل بناء فيرسل بعد `c71cb61` (`1e79b3c` · modonty 1.90.1 · فرع `modonty-ui` · مدفوع · `test.modonty.com` أخذ التعديلات)

### 🎯 أين توقفت
- **آخر شيء:** خالد سأل «ليش ما تأثر النطاق الفرعي بالتعديلات؟» + لقطة فيرسل: نشر `c71cb61` **Error 39s**. شخّصت من سجلّ البناء، أصلحت، بنيت محلياً (٢٨٢/٢٨٢)، دفعت `1e79b3c` بأمره «push»، وتحقّقت: النشر الجديد **Ready** و`test.modonty.com` يخدم الرئيسية الجديدة (200، النصوص الأربعة موجودة في الـHTML الحيّ).
- **الخطوة التالية عند الرجوع:** خالد يقرّر — الجوّال (V10) أو مراجعة الرئيسية الحيّة على `test.modonty.com` (ريفرش على `/page/3` + الرِيلان). الدمج بأمره الصريح فقط.

### ✅ المنجز هذه الجلسة
- **السبب الجذري (سببان من نقل الهيدر إلى القشرة الثابتة في `c71cb61`):** لمّا شِلت `<Suspense>` القديم حول الهيدر (كان في `TopNavWithFavorites`)، صار جوّاه مكوّنان يقرأان بيانات الطلب بلا حدّ → `Uncached data was accessed outside of <Suspense>` وقت التصيير المسبق:
  1. `UserMenu` → `useSession()` (يعلّق على وعد الجلسة) — أول فشل على `/tags/[slug]` (سجلّ فيرسل: `UserMenu.tsx:13`).
  2. `DesktopNavLinks` → `usePathname()` — الثاني على `/page/[pageNumber]` (أثر `--debug-prerender` → `TopNavDesktop`). التوثيق الرسمي `node_modules/next/dist/docs/.../use-pathname.md:8`: مع `cacheComponents` يحتاج `Suspense` على أي مسار له باراميتر ديناميكي.
- **الإصلاح:** حدّان صغيران بدل حدّ واحد حول الهيدر كلّه (الهدف الأصلي — الهيدر في القشرة — محفوظ): `UserMenu` تحت حدّ بحجم زرّ «دخول» (ديسكتوب `h-9 w-16`، جوّال `h-11 w-11`) · القائمة فُصلت إلى `DesktopNavList` عرضية، الحدّ يبثّ علامة «النشط» فقط والبديل هو نفس الروابط بلا علامة — صفر إزاحة، الروابط تبقى في القشرة.
- **`loading.tsx` لـ`/page/[pageNumber]`** كان ناقصاً (قاعدة المشروع) — يعيد تصدير هيكل الرئيسية. (لم يكن هو سبب الفشل — جرّبته أوّلاً وفشل البناء ثانيةً؛ سُجّل هنا كي لا يُعاد التخمين).
- **الحالة:** `next build` محلياً = `✓ 282/282` · EXIT 0 (TypeScript ضمنه) · فيرسل `ak9hx2l0j` **● Ready** · `curl test.modonty.com` = 200 ويحوي «اسأل مودو · استكشف المجالات · الطلّات · شركاء موثوقون».

### 📝 قرارات
- الحدود على المستهلكين (UserMenu · روابط القائمة) لا على الهيدر كلّه → لأن حدّاً حول الهيدر يعيد المشكلة المقيسة يوم ١٥ أغسطس (الهيدر آخر ما يصل). البديل المرفوض: `generateStaticParams` على `/page/n` (يجعل الحدّ اختيارياً لكنه يثبّت أرقام صفحات تتغيّر مع كل مقال).

### 🚧 معلّق
- ⚠️ ملاحظة جانبية من `--debug-prerender` فقط: `USE_CACHE_TIMEOUT` من `getClientsGA4Stats` (`lib/analytics/ga4.ts:208`) على `/clients/[slug]` — لم يظهر في البناء العادي ولا على فيرسل؛ مرشّح للمراجعة، ليس عطلاً مثبتاً.
- كل معلّقات البلوك السابق كما هي: V10 الجوّال · V3 صور/وصف المجالات (بيانات) · T3 (`loading.tsx` + sitemap لـ/booking و/shop) · T6 · «الطلّات» الوهمية dev-only في `CachedHomePage.tsx` · `IconVerified` في `ClientsCardMobile` · ملفان تجريبيان في الجذر (`img-reqs.txt` · `mobile-uiux-mockup.html`).
- الدمج إلى `main` — بأمر خالد الصريح فقط.

### 📂 الملفات
- `modonty/app/layout/components/nav/DesktopUserAreaClient.tsx` — Suspense حول `UserMenu` (بديل بحجم زرّ دخول).
- `modonty/app/layout/components/nav/TopNav.tsx` — نفسه للجوّال (44px).
- `modonty/app/layout/components/nav/NavLinksClient.tsx` — `DesktopNavList({pathname})` عرضية + `DesktopNavLinks` تقرأ `usePathname`.
- `modonty/app/layout/components/nav/TopNavDesktop.tsx` — `<Suspense fallback={<DesktopNavList pathname={null}/>}>`.
- `modonty/app/(homepage)/page/[pageNumber]/loading.tsx` — جديد، يعيد تصدير `(homepage)/loading`.
- `modonty/package.json` — 1.90.0 → 1.90.1.

### 🔁 Git
- الفرع `modonty-ui` · آخر كوميت `1e79b3c` «إصلاح فشل بناء فيرسل…» · **مدفوع** (`c71cb61..1e79b3c`) · محلي = بعيد ٠/٠ · غير مثبَّت: `settings.local.json` · `.mcp.json` · `.pnpm-store/` · الملفان التجريبيان.
- فيرسل: `modonty-modonty` نشر `ak9hx2l0j` Ready (Preview من الفرع) · `test.modonty.com` حيّ عليه.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `test.modonty.com` بريفرش قاسٍ وقارن مع `.playwright-mcp/review4-desktop.png`.
2. اختبر على التست: `/page/3` ريفرش + عجلة → `/page/4`، والرِيلان.
3. قرار خالد: الجوّال (V10) أو الدمج.

---

## Session: 2026-08-16 (فجراً) — 🖥️ إعادة بناء الرئيسية على الديسكتوب اكتملت ودُفعت (`c71cb61` · modonty 1.90.0 · shared 0.2.3 · فرع `modonty-ui`)

### 🎯 أين توقفت
- **آخر شيء:** دفعت كوميت واحد كبير `c71cb61` (كل شغل ١٥–١٦ أغسطس) إلى `origin/modonty-ui` — الفرع المحلي = البعيد (٠/٠). خالد قال «خلصنا الديسكتوب بهذا».
- **الخطوة التالية عند الرجوع:** خالد نفسه قال إن **الجوّال له شغل ثانٍ لاحقاً** (لم يبدأ) — أول مقال على الجوّال عند y≈٧٩٨ من ٨٤٤ (بند V10). ثم قرار الدمج/النشر لـ`test.modonty.com` (الفرع يخدم نطاق التست تلقائياً بعد الدفع — يُتحقّق منه أولاً).

### ✅ المنجز هذه الجلسة (كلّه مقيس، اللقطات في `.playwright-mcp/review*.png`)
**بنية الرئيسية (ديسكتوب):**
- الرِيل الأيمن (يظهر من ١٠٢٤): كرت الحساب (سيرفر، فتحة تمريرية عبر `use cache`) + كرت مدونتي. الرِيل الأيسر (من ١٢٤٠): «شركاء موثوقون» → «احجز/تسوّق» (أيقونات لا صور) → «استكشف المجالات» (صفوف: صورة مربّعة + اسم + وصف من القاعدة، ٦ ظاهرة والباقي سكرول داخلي بتدرّج، بلا رابط «كل المجالات»).
- عمود المقالات: شريط مودو (رابط بشكل حقل «Start a post») → طلّات (٤ مربّعات، عنوان للآلة فقط، أيقونة تشغيل وسطية ٣٢) → المقالات. **أول مقال عند y=٣٢٠ من ٨٠٠** (كان ٥٣٧).
- `StickyRail` (مكوّن عميل صغير): الرِيل الأقصر من الشاشة يثبت تحت الهيدر، الأطول يتحرّك حتى يظهر آخره ثم يثبت — بلا سكرول داخلي للرِيل. الرِيلان ٦٥٣/٦٩٠ < ٧٠٤.
- «المزايا» حُذفت من القائمة مع سلسلتها الميتة (٣ ملفات) + `TopNavWithFavorites` و`get-favorites-count` (كانا يحجبان الهيدر لعدّاد لا يُعرض) + `SectionLink` + `services-card` + `ask-modo` القديم.
- القائمة العلوية: الرئيسية · الرائجة · الشركاء · الطلّات · استمع · عن مدونتي (بعلامة مدونتي M). الفوتر: «الصناعات»→«المجالات» + التصنيفات + الطلّات + الأسئلة الشائعة (`/help/faq`) + تواصل معنا.
- مبدّل المظهر (فاتح/داكن/حسب الجهاز، shadcn فوق next-themes) في مجموعة أدوات الهيدر (ديسكتوب + جوّال)، لونه باهت وقائمته بلون الهيدر. حقل البحث بيضاوي بلا شارة `/`. الشعار: ارتفاع ثابت وعرض حرّ (كان محشوراً ٤٠×١٠).
**الأداء:**
- الهيدر ثابت في القشرة (كان آخر ما يصل، +٣٫٣ ث بعد القشرة) — الجرس وشارة التنبيهات وحدهما يُبثّان في حدود صغيرة. كرت الحساب: هيكل ١٩٠ = الكرت (كان ٢٢٠ → قفزة ٣٠). قِست: `auth()` ٢٥–٥٧ مللي، القاعدة ٣٠ — التأخير الملحوظ = وضع التطوير.
- LCP: البطلان (تغذية الديسكتوب · كرت مدونتي جوّال) `eager` + `fetchPriority="high"` بدل `preload`/lazy، و`sizes` صادقة تعطي التوأم المخفيّ 16w. مقيس بارد على DPR 3: طلب واحد ≥640w، ١٨٨ كيلو للرئيسية.
- البلور (LQIP) رجع لكل بطاقات التغذية (`imageBlur` على `FeedPost` — إضافة فقط، عقد `/api/articles` لم يتغيّر). صورة بطاقة المقال 5:2 بدل 16:9.
- حذف نمط تسخين صور الصفحة التالية (NextFaster) بعد فحص المصادر — ليس رسمياً (`project_preload_hero_removed`).
**نظام التصميم:** `--link` للنصّ الأزرق (الليلي #7070FF — النصوص الفاشلة ٣→٠) · ثلاثة أوزان 400/500/700 (§٣.١ صُحّح: 500 محمَّل أصلاً) · قاعدة الزرّ المشتركة `rounded-full`+`font-bold` (مدونتي ماستر) · علامة التوثيق (الدرع مع M) مكوّن مشترك `shared/components/icons/modonty-trust-mark.tsx` + `modonty-mark.tsx`.
**النصوص:** ٢٧ نصّاً بلهجة سعودية بسيطة («مدونتي أحلى بحسابك» · «إنشاء حساب» · «نجيب لك المزيد…») · «عملاء»→«شركاء» في ١١ موضعاً بمعنى الشركاء (تُركت ١٥ بمعنى زبائن الشريك عمداً).
**الحالة:** tsc = 0 (عدا ضجيج `.next/dev/types/validator.ts`) · build لم يُعَد بعد الكوميت · تست حيّ Playwright ديسكتوب مكتمل · الجوّال غير مراجَع.

### 📝 قرارات
- الجوّال يُترك لجلسة لاحقة (خالد). · الحجز/التسوّق تبقى بطاقة مستقلّة (قيمة بزنس للشريك) لا أزراراً داخل شريط مودو. · لا سكرول داخلي في الرِيل؛ سكرول داخلي مقبول في كرت المجالات فقط. · «عملاء» بمعنى زبائن الشريك تبقى.

### 🚧 معلّق
- V10 الجوّال (أول مقال خارج القشرة) · V3 صور المجالات = بيانات (`socialImage` = الشعار الافتراضي للثمانية؛ تفريغها بيد خالد على dev ثم prod) + وصف المجالات فارغ في dev · T3 (`loading.tsx` + sitemap لـ/booking و/shop) · T6 (`data-scroll-behavior`) · «الطلّات» وهمية في dev (٣ من المقالات، `NODE_ENV=development` فقط في `CachedHomePage.tsx`) — تُحذف قبل الدمج أو تبقى لأنها dev-only (قرار).
- شارة `IconVerified` ما زالت في `ClientsCardMobile` (الجوّال) — تُستبدل بعلامة التوثيق مع شغل الجوّال.
- ملفان تجريبيان في الجذر غير مثبَّتين: `img-reqs.txt` · `mobile-uiux-mockup.html`.

### 📂 أبرز الملفات (٩٩ ملفاً في الكوميت)
`app/(homepage)/components/{page-layout/CachedHomePage,shared/StickyRail,home-actions,commerce-actions,industries-card,clients-card,reels-card,left-sidebar,right-sidebar}` · `app/layout/components/nav/{TopNav,TopNavDesktop,ThemeToggle,LogoNav,SearchLink,NavLinksClient}` · `app/layout/helpers/nav-config.ts` · `shared/components/{infinite-list,use-mount-on-approach,icons/modonty-mark,icons/modonty-trust-mark,ui/button}` · `app/globals.css` (`--link`) · `documents/design/DESIGN-SYSTEM.md` · `app/(homepage)/documentation/HOMEPAGE-BOARD.html`.

### 🔁 Git
- الفرع `modonty-ui` · آخر كوميت `c71cb61` · **مدفوع** (`ed121af..c71cb61`) · محلي = بعيد · غير مثبَّت: `settings.local.json` · `.mcp.json` · `.pnpm-store/` · الملفان التجريبيان.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `.playwright-mcp/review4-desktop.png` واللوحة `HOMEPAGE-BOARD.html`.
2. تحقّق أن `test.modonty.com` أخذ الكوميت (الفرع يغذّيه) واختبر الريفرش على `/page/3` والرِيلين هناك.
3. ابدأ الجوّال (V10) لو قال خالد، أو الدمج بأمره الصريح فقط.

---

## Session: 2026-08-15 (ليلاً) — ♾️ التمرير اللانهائي اكتمل ١٠٠٪ (IS1–IS6) + فحص ختامي ضدّ توثيق جوجل الحيّ + رجوع Next إلى 16.2.9 (فرع `modonty-ui` · محلي فقط · **لم يُدفع**)

### 🎯 أين توقفت
- **آخر شيء أنجزته:** الفحص الختامي للتمرير اللانهائي — كل شروط جوجل السبعة (مجلوبة اليوم من التوثيق الحيّ لا من الذاكرة) انقاست ونجحت بدليل خام. الحكم: **نهائي على بيئة التطوير، صفر فجوات، صفر بطاقات جديدة**.
- **الخطوة التالية عند الرجوع:** قرار خالد — إمّا دفع الفرع (٦٨ ملفاً غير مثبَّت، طقس الدفع الكامل) وبعده فحص URL Inspection في Search Console، أو مواصلة بطاقات اللوحة المفتوحة (D1 · V3 · V4 · T1 · T2 · T3).

### ✅ المنجز هذه الجلسة

**١ — رجوع Next.js إلى `16.2.9` بأمر خالد** — ترقية 16.3.1 فشل تحقّقها (`tsc` انهار مرّتين بنفاد الذاكرة حتى مع 8GB؛ جُرّب TS 7.0.2 فقرأ أنواع Prisma خطأ). بعد الرجوع: `pnpm build` ✓ 279/279.

**٢ — كنسة use-client على الرئيسية: من ١٦ ملف عميل إلى ٣** (المتبقّية بمبرّر مقيس: `MoreArticles` · `MoreArticlesOnScroll` · `UserCard`):
- `AskModo` سيرفر (الكرت كله رابط لـ`/modo-chat`) · `ModontyCard` سيرفر (بطل + ٣ مصغّرات) · `IndustriesCard` على `Scroller` المشترك الجديد (صفر JS، `scrollbar-rail` في globals.css).
- أشرطة الجوال أُعيد بناؤها سيرفراً بنفس التصميم الأول حرفياً: `ServiceBar` + `DiscoveryBar` + `BottomBar`؛ حُذفت الأوراق المنزلقة والأزرار العائمة وملفات بياناتها (−٤ استعلامات DB من الرئيسية). صفحتا `/booking` و`/shop` أُنشئتا.
- `ScrollButtons` صار سيرفر-فقط بأنيميشن CSS مقاد بالتمرير (`animation-timeline: scroll(root block)` + `animation-range: 800px 900px` + `fill both`) — ثلاثة أعطال حُلّت وموثَّقة على اللوحة: Link يبتلع نفس الهاش (→ `<a>` خام) · السهم الظاهر مع motion-reduce (→ حذف الحركة من الكيفريم) · النسبة المئوية تنزاح مع التمرير اللانهائي (→ عتبات بكسل).
- `buttonVariants` بدل `<Button asChild>` في ٥ مواضع (تصحيح خالد من توثيق shadcn الرسمي).

**٣ — التمرير اللانهائي IS1–IS6 كلّه أُقفل** (خطة اللوحة بند-بند، كل بند بقياس):
- **IS1** سلسلة `/page/n` (لا `?page=n` — حماية القشرة الثابتة؛ `searchParams` ممنوعة داخل `use cache`): صفحة خارجية `FeedPage` تمرّر الرقم لـ`CachedFeedPage` بـ`use cache` + كانونيكال ذاتي + عنوان فريد + روابط سابقة/تالية `<a>`. الحالات عبر `proxy.ts` (القشرة تنطلق قبل `notFound()` فالـ404 من البروكسي) + `publishedFeedTotalPages` في `archive-cache.ts`.
- **IS2** القراءة من `GET /api/articles` لا سيرفر أكشن (الأكشنات تصطفّ واحداً-واحداً) · **IS3** `ArticlesList` سيرفر + حذف فلاتر `?client=/?category=` الميتة (تصحيح مسجَّل: «ازدواج ١٥٦ كيلو» لم يثبت) · **IS4** حذف `content` من `FeedPost` والمنتجين الثلاثة والمستهلكين · **IS5** `content-visibility:auto` + `contain-intrinsic-size` على بطاقتي المقال.
- **IS6 بقرار خالد: المحرّك في حزمة `shared/` الجذرية** (سيخدم الكونسول والأدمن؛ تجاوز واعٍ لقاعدة «لا ترقية عند أول استخدام»، شرطه: صفر معرفة منتج): `shared/components/infinite-list.tsx` (مراقِب + جلب + منع تكرار بالمفتاح + pushState اختياري + render props تمرّر البيانات للأعلى — عقد جوجل موثَّق في رأسه) + `shared/components/use-mount-on-approach.ts` (بوّابة تأجيل التحميل). `MoreArticles` صار جِلداً بنفس الواجهة حرفياً.

**٤ — الفحص الختامي ضدّ جوجل (طلب خالد «perfect 100%»):** التوثيق جُلب حيّاً (lazy-loading + pagination). القياسات الخام: `/page/2..12` حتمية (md5 متطابق بين تحميلين) · تداخل صفر (رئيسية∩ص٢=٠ · ص٢∩ص٣=٠) · الأخيرة (١٢) بلا «تالية» و`hasMore:false` · `abc/0/02/13+/99999`→404 و`/page/1`→308 · كل دفعة مرسومة سيرفراً (curl بلا JS) · حيّ بالمتصفح بعد استخراج IS6: التمرير `/`←`/page/2`←`3`←`4` مع التقاط `GET /api/articles?page=n` · زر الرجوع يرجّع الرابط ويبقي المحتوى (النمط الصحيح) · بلا noindex + كانونيكال ذاتي.
- **حالة التحقّق:** tsc مودونتي = ٠ (بعد IS6) · build لم يُعَد بعد IS4–IS6 · تست حيّ للتمرير = نجح كاملاً.

### 📝 قرارات
- **الرجوع لـ16.2.9** → OOM بيئي على هذا الجهاز، وخالد أوقف الملاحقة → البقاء على 16.3.1 رُفض.
- **`/page/n` لا `?page=n`** → حماية القشرة الثابتة (١١٧ كيلو) → قراءة searchParams رُفضت.
- **الحالات من البروكسي** → soft-404 مقيس (القشرة 200 قبل notFound) — نفس نمط بقيّة الأقسام.
- **IS6 في `shared/` الجذرية بقرار خالد** → الكونسول والأدمن سيستهلكانه → إبقاؤه داخل مدونتي رُفض.
- **ترقيم مطلق مع منع تكرار بالمفتاح** → جوجل تمنع العناصر النسبية (`?date=yesterday`) → تثبيت النافذة بختم زمني رُفض.

### 🚧 معلّق
- **قرارات اللوحة:** D1 (أسئلة النيّة الثلاثة — يحجب V1·V2·V5) · D2 (قاعدة button.tsx المشتركة) · D3 (إرجاع تثبيت featured في ModontyCard).
- **جاهز للتنفيذ:** V3 (صور الروبوت المتكرّرة) · V4 (انهيار العمود الأيمن حين ReelsCard يرجع null) · T1 (قصّ أسماء المجالات عند 1128px) · T2 (١٣ لون rgba يدوي) · T3 (loading.tsx + sitemap لـ/booking و/shop).
- **فحص Search Console (URL Inspection) للسلسلة المرقّمة** — لا يتمّ إلا على الإنتاج بعد الدفع.
- **تحسين اختياري خارج شروط جوجل:** `aria-live` لإعلان الدفعات الجديدة لقارئ الشاشة.
- أخطاء كونسول `JWTSessionError` في النافبار (جلسة قديمة بمتصفح التست) — خارج نطاق التمرير، لم تُعالج.

### 📂 أبرز الملفات (٦٨ غير مثبَّت — القائمة الكاملة في `git status`)
- `shared/components/infinite-list.tsx` + `shared/components/use-mount-on-approach.ts` — **جديدان**: محرّك التمرير المشترك وبوّابته.
- `modonty/app/(homepage)/page/[pageNumber]/page.tsx` — **جديد**: السلسلة المرقّمة.
- `modonty/proxy.ts` · `modonty/lib/archive-cache.ts` — حالات السلسلة (308/404) + عدّ الصفحات.
- `modonty/app/(homepage)/components/articles-list/{ArticlesList,MoreArticles,MoreArticlesOnScroll}.tsx` — سيرفر + جِلد المحرّك + البوّابة.
- `modonty/lib/types.ts` + المنتجون الثلاثة + `MobilePostCard`/`PostCardBody`/`DesktopPostCard` — حذف `content` + content-visibility.
- `modonty/app/(homepage)/components/mobile-bottom-bar/{BottomBar,ServiceBar,DiscoveryBar}.tsx` · `scroll-buttons/ScrollButtons.tsx` · `components/shared/scroller/Scroller.tsx` — إعادة البناء سيرفراً.
- `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — **العقد المرجعي**: IS1–IS6 خضراء بقياساتها + التصحيحات + المفتوح.

### 🔁 Git
- الفرع: `modonty-ui` · آخر كوميت: `ed121af` (مدفوع) · **٦٨ ملفاً غير مثبَّت — لم يُدفع شيء بعده** · لا دفع بلا إذن صريح جديد.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — الحالة كلها فيه.
2. لو القرار «ندفع»: طقس الدفع الكامل (backup · tsc الثلاثة · version bump · كوميت بمسارات محدّدة يستثني الريلز و`.mcp.json`/`settings.local.json`).
3. لو القرار «نكمل اللوحة»: ابدأ بقرار D1 أو ببنود جاهز-للتنفيذ.

---

## Session: 2026-08-15 (مساءً) — 🌐 نطاق التست `test.modonty.com` حيّ + كنسة نظام التصميم على الرئيسية + ترقية Next 16.3.1 **غير محقَّقة**

### 🎯 أين توقفت
- **آخر شيء كنت أعمله:** التحقّق من ترقية Next.js إلى `16.3.1` — `tsc` انهار مرّتين بنفاد الذاكرة (`FATAL ERROR: Ineffective mark-compacts near heap limit`)، وخالد أوقف المحاولة الثالثة (بذاكرة ٨ جيجا) وطلب تجميد الجلسة وإعادة التشغيل.
- **الخطوة الأولى عند الرجوع:** `cd modonty && NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit` — بجهاز مُعاد تشغيله. لو نظيف، `pnpm build`. لو انهار مرّة أخرى فالسبب الجهاز لا الترقية، والقرار: نبقى أو نرجّع لـ`16.2.9`.
- **خالد قال صراحةً:** «موضوع التسليم ذا تشيل همه» — يعني لا نستعجل ولا نرجّع الترقية بحجّة الوقت.

### ✅ المنجز هذه الجلسة

**١ — نطاق التست حيّ ويعمل: `https://test.modonty.com`**
- أُضيف للمشروع عبر `POST /v10/projects/{id}/domains` مع `gitBranch: modonty-ui` (الـCLI ٥٩٫١٫٣ لا يملك أمراً لنطاقات المشروع — لا وجود لـ`vercel project domains`).
- احتاج سجلّ `TXT` على `_vercel.modonty.com` (نمط الحساب: سجلّ لكل نطاق فرعي — خمسة موجودة أصلاً). خالد أضافه، والتوثيق نجح.
- **الفحص القاسي مقيس خاماً:** `test.modonty.com` → `200` + `X-Robots-Tag: noindex, nofollow` · `www.modonty.com` → `200` بلا الرأس · قاعدة البيانات `target:["preview"] → modonty_dev` · `/` `/clients` `/reels` `/trending` `/about` = ٢٠٠ · صفحة مفقودة = ٤٠٤ · `misconfigured: false`.
- `/articles` يرجع ٤٠٤ **عن قصد** — مشروح في `next.config.ts:17-23`.

**٢ — كوميت واحد دُفع: `ed121af`** (٩٣ ملفاً · ١١٩١ سطراً · النسخة `1.89.0`)
- إعادة هيكلة الرئيسية كاملة (كانت **غير مثبَّتة أصلاً**، لا مجرّد غير مدفوعة — صحّحت ادّعائي السابق).
- رأس `X-Robots-Tag: noindex` على أي نشر ليس إنتاجاً، مفتاحه `VERCEL_ENV`.
- **عطل في الطريق:** أول بناء فشل — الكاش المستعاد يحمل روابط خطّ Montserrat قديمة وجوجل ترجع `404` عليها. تحقّقت بنفسي (القديم ٤٠٤ · الحيّ ٢٠٠)، فأعدت النشر بلا كاش عبر `VERCEL_FORCE_NO_BUILD_CACHE=1` مؤقتاً ثم حذفته.

**٣ — كنسة نظام التصميم على `app/(homepage)/` (غير مثبَّتة)**
| البند | قبل | بعد |
|---|---|---|
| ظلّ في التدفّق | ٩ `shadow-sm` + ٧ مخصّص | صفر (٣ باقية على عناصر تطفو فوق صور — مسموحة) |
| `ring-1` | ١ | ٢١ |
| أوزان ممنوعة | ١٤ `semibold` + ١١ `medium` | صفر |
| نصف القطر | ٧ مقاسات | ٣ (`lg` حاوية · `full` تحكّم · `sm` مصغّرة) |
| عرض الحاوية | `1280px` | `1128px` |
| جهات فيزيائية | ٣ | صفر |

**٤ — كل عناصر التحكّم صارت shadcn** — كانت ١٠ `<button>` خام + `<input>` خام. المقيس بعدها: **صفر عنصر خام** في المسار. وأسهم الكاروسيل صارت قرصاً ٣٢ داخل هدف لمس ٤٨ (§٧ · WCAG 2.5.5).

**٥ — لوحة مرجعية جديدة:** `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — بطلب خالد، وهي **المرجعية المتّفق عليها للرئيسية**. أربعة أقسام: جرد الأزرار · التقرير البصري · تدقيق نظام التصميم · المفتوح.

**٦ — الترقية (غير محقَّقة):** `next` ١٦٫٢٫٩ ← **١٦٫٣٫١** في مدونتي والأدمن والكونسول · `react`/`react-dom` ١٩٫٢٫٤ ← **١٩٫٢٫٨**. `pnpm install` مرّ.

**حالات التحقّق:** `tsc` نظيف قبل الترقية · **بعدها: انهار بنفاد ذاكرة (غير معروف)** · بناء: لم يُشغَّل · تست حيّ: الرئيسية ترسم على ١٦٫٢٫٩ فقط.

### 📝 قرارات بأسبابها
- **نطاق تست دائم بدل الاكتشاف على الإنتاج** → صار قاعدة ذهبية بأمر خالد: التست محلياً وعلى النطاق الفرعي، والإنتاج هدف نشر لا مكان اكتشاف. البدائل المرفوضة: Vercel Authentication (خالد رفضها — «الموظف عادي حيدخل على الدومين») · النطاق البديل بالـwildcard (يحتاج نقل الـDNS كاملاً لـVercel).
- **`X-Robots-Tag` وحده بلا `Disallow` في robots.txt** → لأن الـ`Disallow` يمنع الزاحف من جلب الصفحة فلا يقرأ الـ`noindex` أصلاً. المصدر: Google Search Central.
- **المفتاح `VERCEL_ENV` لا `NEXT_PUBLIC_SITE_URL`** → الفحص على Vercel أثبت أن الأخير يحمل نفس القيمة في البيئات الثلاث فالشرط ما كان بيتحقّق أبداً.
- **الظلّ يبقى على ما يطفو فوق الصور** (سهما الكاروسيل · شارة الريل) → حلقة ١px تختفي فوق صورة عشوائية. حكم لا تطبيق أعمى للقاعدة.
- **UI/UX senior صار قاعدة ذهبية** بنصّ خالد، وشِقّها الثاني «التدريب»: أسمّي المبدأ ومصدره وأرفض الحلّ المبتدئ صراحةً. سُجّلت في `memory/feedback_uiux_standards.md`.

### 🚧 معلّق / محجوب
- **ترقية `16.3.1`** — محجوبة بفحص `tsc` الذي ينهار بنفاد الذاكرة. الجهاز في جلسة طويلة (القاعدة المعروفة: استنزاف الـheap بعد كثرة العمليات).
- **مهارة `next-dev-loop`** — `npx skills add vercel/next.js --skill next-dev-loop` خرج بصفر لكن **لم ينزل شيء على القرص**. لم تُشخَّص بعد. تحتاج `agent-browser@^0.27`. لا تحتاج Playwright — متصفّح مستقلّ، فخالد يشتغل على Chrome بلا تصادم.
- **قاعدة الزرّ المشتركة تخالف النظام** — `shared/components/ui/button.tsx` فيها `rounded-md` و`font-medium`. **قرار خالد:** نصلّح القاعدة مرّة (ونفحص الأدمن) أم نُبقي الأصناف الزائدة في نداءات مدونتي؟
- **انحدار أحدثته:** تضييق الحاوية لـ`1128px` يقصّ أسماء بلاطات «استكشف المجالات» (`calc((100%-1.5rem)/3)`).
- **الألوان اليدوية `rgba(` ×١٣** في ٨ ملفات — لم تُكنس.
- **الأسئلة الثلاثة** — تحجب أي تعديل بصري على الرئيسية. لم يُجب على أيٍّ منها.
- **`ignoreCommand` في `modonty/vercel.json`** — كوميت لا يلمس `modonty/` يتخطّى البناء، فالنطاق قد يعرض نشراً قديماً. لم يُعالَج.
- **تبعيات `@tiptap/*` في الأدمن** — تحذير أقران غير محلول (`core@3.19.0` مقابل `^3.22.2` المطلوب). سابق للترقية.

### 📂 ملفات مسّت (غير مثبَّتة)
- `modonty/app/(homepage)/components/**` — ١٧ ملفاً: حلقات بدل ظلال · أوزان · أقطار · shadcn بدل الخام
- `modonty/app/(homepage)/loading.tsx` · `components/page-layout/PageLayout.tsx` — الحاوية `1128px`
- `modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html` — جديد، اللوحة المرجعية
- `modonty/package.json` · `admin/package.json` · `console/package.json` — `next: 16.3.1`
- `shared/package.json` — `react: ^19.2.8` · `pnpm-lock.yaml`
- `C:/Users/w2nad/.claude/projects/…/memory/feedback_uiux_standards.md` + `MEMORY.md`

### 🔁 حالة الجيت والنشر
- الفرع: `modonty-ui` · آخر كوميت **`ed121af`** · **مدفوع** (`origin/modonty-ui` متطابق، ahead = 0)
- غير مثبَّت: ٣٠ مدخلاً (١٧ ملف واجهة + ٤ ملفات حزم + `pnpm-lock.yaml` + اللوحة الجديدة + `img-reqs.txt` و`mobile-uiux-mockup.html` و`.mcp.json` و`settings.local.json` — الأربعة الأخيرة **تُستبعد من أي كوميت**)
- Vercel: نشر `dpl_5QvNHup…` **Ready** من `ed121af` على `test.modonty.com` · الإنتاج على `main` لم يُمسّ إطلاقاً
- السيرفر المحلي: **مقفول** (`taskkill node` قبل الترقية)

### 🚀 الاستئناف في ٣٠ ثانية
1. أعد تشغيل الجهاز أولاً (الـheap مستنزف) ثم: `cd modonty && NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit`
2. لو نظيف: `pnpm build` ثم `pnpm dev` وافتح `http://localhost:3000` — والقياس المرجعي في `HOMEPAGE-BOARD.html`
3. القرار الأول: قاعدة الزرّ المشتركة — نصلّحها مرّة أم نُبقي الأصناف الزائدة؟
4. اللوحة: `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/modonty/app/(homepage)/documentation/HOMEPAGE-BOARD.html`

---

## Session: 2026-08-15 — 🗄️ يوم «مصدر الحقيقة»: الكيان القانوني واسم الموقع وhreflang كلّها من القاعدة + خمس بطاقات SOT أُقفلت (فرع `modonty-ui` · ٤ كوميتات حتى `12c3dea` · **دُفعت ضمن `ed121af`**)

### 🎯 أين توقفت
- **كل صفحات الموقع أُقفلت على hreflang** — تسع عشرة صفحة من كل نوع، تسع لغات لكلٍّ منها، مقيسة خاماً. لا بقيّة لهذا البند.
- الخطوة الأولى عند الرجوع: **قرار خالد** — نطلب إذن الدفع للكوميتات الأربعة، ولّا نفتح بنداً جديداً على اللوحة؟

### ✅ المنجز هذه الجلسة

**خمس بطاقات أُقفلت على اللوحة: SOT2 · SOT4 · SOT3 · SOT5 · SOT6.**

- **SOT2 — الكيان القانوني من القاعدة:** كائن `LEGAL` (١٧ قيمة ثابتة في `constants/brand.ts`) حُذف بالكامل. `/trust` و`/story` صارتا تقرآن من `Settings` عبر اشتقاق واحد (`to-legal-entity-display.ts`). ثمانية من تسعة حقول كانت **تخالف** ما في القاعدة.
  - عطل كشفه سؤال خالد «متأكد ١٠٠٪؟»: الحالة كانت `active: true` مثبَّتة، فسجلّ تجاري منتهٍ كان سيظهر أخضر بدرع توثيق على صفحة اسمها «الموثوقية». صار `isRegistrationActive` مشتقّاً — أُثبت بضبط القاعدة على «منتهي» وإعادة القياس.
  - `Intl.DateTimeFormat("ar-SA")` كان يطبع التاريخ **هجرياً** (الافتراضي أم القرى). صار `ar-SA-u-ca-gregory`.
- **SOT5 — اسم الموقع من القاعدة:** `SITE_NAME = "مودونتي"` (إملاء خاطئ) صار `SITE_NAME_FALLBACK = "Modonty"`، و`knowledge-graph-generator.ts:170` صار يقرأ `settings.siteName` الذي كان يستلمه ويتجاهله. وأُصلح `${siteUrl}#website` → `${siteUrl}/#website` — كان كياناً ثانياً يزاحم الأول في نظر جوجل.
- **اسم البراند كان يتكرّر ثلاث مرات في العنوان:** قالب `layout.tsx:35` + لاحقة البنّاء + النص المخزَّن. المقيس على `/about`: «منصة مدونتي… - مدونتي | مدونتي». كُنس على السبع صفحات.
- **hreflang من القاعدة (طلب خالد صراحةً):** `Settings.defaultAlternateLanguages` يحمل **تسع** لغات، والصفحات كانت تعلن **أربعاً**. `build-hreflang-languages.ts` رُفع من مسار المقال ليخدم الجميع. خمسة أسواق خليجية (الإمارات · الكويت · قطر · البحرين · عُمان) تصل جوجل لأول مرة.
- **`get-page-seo-defaults.ts` — الحلقة المفقودة:** السلسلة الصحيحة `عمود الصفحة → افتراضي Settings → نصّ في الكود`. كل الصفحات عدا المقال كانت تقفز فوق الحلقة الوسطى.
- **بنّاء ميتاداتا واحد لتسع صفحات:** `build-metadata-from-page-row.ts`. **حُذف ٤٦٣ سطراً وأُضيف ٥٤**. وحُذفت ٤ استيرادات ميتة في كل ملف.
- **SOT4 وSOT6 — إنذاران كاذبان:** البطاقتان كانتا تصفان مشكلة **محلولة أصلاً**. أُقفلتا بدليل لا بشغل. اللوحة كانت تحمل إنذارات قديمة.
- **`og:image:width/height` حُذفا من نموذج الأدمن** — اختياريان في مواصفة ogp.me، والقيمتان تُحقنان في الكود (1200×630).
- **الأدمن:** `/trust` و`/story` صارتا قابلتين للتحرير سيوياً فقط (`seoOnly: true` — بلا محرّر نصّ)، وأُضيفتا للقائمة الجانبية ولوحة فحص السيو (صارت ١٦ صفحة).

### 🌍 كنسة hreflang الكاملة (الكوميت الرابع — بعد قياس كشف أن العلّة أوسع)

القياس الأول أظهر ٢–٤ لغات على الصفحات القوائمية، فتتبّعت المصدر ووجدت **خمسة كتّاب
مستقلّين** لنفس القيمة، كل واحد يكتب قائمته بيده:

| المصدر | كان يكتب | المصاب |
|---|---|---|
| `buildHreflang` في مولّد الأدمن | لغتان | الرئيسية والست القوائمية |
| `build-alternates.ts` في مودونتي | أربع | صفحة الكاتب (المسار الاحتياطي) |
| `buildModontyAuthorSeo` في الأدمن | **واحدة** | صفحة الكاتب (المخزَّن) |
| صفحة الشريك | لغتان، مكتوبتان مرّتين في نفس الملف | كل صفحات الشركاء |
| `app/page.tsx` | أربع، تدهس ما يرجعه القارئ | الرئيسية |

- **`build-hreflang-languages.ts` صعد إلى `shared/lib/seo/`** — الأدمن ومدونتي يكتبان نفس
  القيمة، فقراءتهما من ملفين هي بعينها آليّة الانحراف. و**`build-alternates.ts` حُذف نهائياً**
  (صفر مستهلك بعده).
- **مدونتي تقرأ hreflang حيّاً لا من البطاقة المخزَّنة.** هذي أهم نقطة معمارية في البند: إصلاح
  المولّد وحده كان يترك الصفحات غلط حتى يضغط أحدٌ «إعادة توليد» على كل واحدة. البطاقة كاش،
  وhreflang سياسة موقع لا محتوى صفحة، فتُقرأ عند العرض.

### 📏 القياس الحيّ النهائي (خام، `curl` على `localhost:3000`)

**تسع عشرة صفحة، تسع لغات لكلٍّ منها:** الرئيسية · الست القوائمية · التسع التحريرية ·
صفحة الكاتب · صفحة مقال · صفحة شريك. صفر استثناء. و`canonical` لم يتغيّر على أيٍّ منها
(فُحص صراحةً بعد التعديل).

قبل اليوم: أربع لغات في أحسن الحالات، ولغة واحدة على صفحة الكاتب، وبلا `x-default` على
الصفحات القوائمية أصلاً.

`pnpm tsc --noEmit` على مودونتي: **صفر أخطاء**. البناء: **لم يُشغَّل**.

### 📝 القرارات المتّخذة
- **الثابت يُهبَط إلى «احتياطي» لا يُصحَّح** → اقترحتُ أول مرة تصحيح إملاء الثابت فقط. غلط: نسختان تتّفقان اليوم تختلفان غداً. الصحيح حذف النسخة الثانية أو تسميتها `_FALLBACK` صراحةً.
- **لا عمود جديد على `Settings` لاسم الموقع** → خالد أوقفني: «راجع ملف الـsettings، أنا متأكد إنه اسم الـsite موجود». كان محقّاً — `jsonld-storage.ts:131` يمرّر `settings.siteName` أصلاً، والمولّد كان يتجاهله. صارت مشكلة بيانات لا مشكلة كود.
- **صفّ غائب = صفّ فارغ، لا مسار كود ثانٍ** → أول نسخة من البنّاء كانت ترجع مبكّراً عند غياب الصفّ فتُسقط `og:` و`robots` بالكامل. `const row = page ?? {}` يمرّر الغائب على نفس السلسلة.
- **لا لاحقة براند في البنّاء** → القالب في `layout.tsx` يضيفها؛ إضافتها مرّة ثانية تنتج «… \| مدونتي \| مدونتي».
- **البنّاء المشترك في `shared/` لا في `modonty/`** → لأن للقيمة كاتبَين: الأدمن يولّدها في البطاقة، ومدونتي تعرضها. كاتبان لقيمة واحدة من ملفين = الانحراف نفسه الذي شغلَنا اليوم كلّه.
- **hreflang يُقرأ عند العرض لا يُورَث من البطاقة** → البطاقة كاش كتبه الأدمن وقت الحفظ؛ وhreflang سياسة موقع لا محتوى صفحة. الاكتفاء بإصلاح المولّد كان يعلّق الصحّة على ضغطة «إعادة توليد» لكل صفحة.
- **حذف `build-alternates.ts` لا تصحيحه** → لو بقي، بقي مصدرٌ ثانٍ للقيمة. صفر مستهلك = يُحذف.

### 🚧 المعلّق / المحجوب
- **`prisma db push`** — لم يُنفَّذ على أي قاعدة (الأعمدة الاختيارية على `Settings`).
- **بانتظار خالد (إدخال بيانات، لا كود):**
  - فتح `/modonty/pages/trust` و`/modonty/pages/story` في الأدمن والحفظ — الحفظ هو ما يُنشئ الصفّين.
  - القيم الحقيقية للسجلّ التجاري في `/settings/business` + الإحداثيات `21.502370834350586` / `39.1859245300293` لإرجاع خريطة `/trust`.
  - **زرّ إعادة توليد بطاقات ١١٧ مقالاً** — المقيس: «مقالات منشورة: ١١٧ \| بطاقتها المخزَّنة تكتب مودونتي: ١١٧».
  - قرار على ٣٧ موضعاً تكتب «مودونتي» في قوالب البريد و`admin/lib/messages/ar.ts`.
  - قرار: هل تبقى صورة الشهادة ظاهرة حين لا توجد بيانات سجلّ؟
- **`MEDIA1`** — الريلز والصوت وModo-chat، مؤجَّل لما بعد ريفاكتور مودونتي.

### 📂 الملفات التي لُمست
**جديدة:** `modonty/lib/seo/build-metadata-from-page-row.ts` · `shared/lib/seo/build-hreflang-languages.ts` (نشأ في مودونتي ثم صعد لـ`shared`) · `modonty/lib/seo/to-legal-entity-display.ts` · `modonty/lib/settings/get-page-seo-defaults.ts` · `modonty/lib/settings/get-site-language.ts` · `modonty/constants/legal.ts` · `modonty/app/{trust,story}/helpers/*-metadata.ts`
**معدَّلة:** `modonty/constants/brand.ts` (حذف `LEGAL`) · `modonty/app/{trust,story}/page.tsx` + مكوّنات القصّة · `modonty/app/layout.tsx` (`lang` من القاعدة) · سبع صفحات محتوى (`about` · `contact` · `terms` + الأربع القانونية) · `admin/lib/constants/site-name.ts` + ١١ مستهلكاً · `admin/lib/seo/knowledge-graph-generator.ts` · `admin/…/setting/helpers/page-config.ts` + `components/page-form.tsx` · `admin/…/actions/listing-pages-seo-audit.ts` · `admin/components/admin/sidebar.tsx` · `admin/…/settings/system/components/system-form.tsx` · `documents/tasks/TASK.html`
**كنسة hreflang (الكوميت الرابع):** `admin/lib/seo/listing-page-seo-generator.ts` · `admin/…/authors/helpers/build-modonty-author-seo.ts` · `modonty/app/page.tsx` · `modonty/app/authors/[slug]/page.tsx` · `modonty/app/clients/[slug]/page.tsx` · `modonty/lib/seo/get-listing-page-seo.ts` · `modonty/lib/seo/index.ts` · **محذوف:** `modonty/lib/seo/build-alternates.ts`

### 🔁 حالة Git والنشر
- **الفرع:** `modonty-ui`
- **أربعة كوميتات هذه الجلسة، كلها على الفرع:**
  - `9c2f34a` — «بيانات الشركة واسم الموقع من القاعدة، لا من ثوابت في الكود»
  - `6ee14fd` — «بنّاء ميتاداتا واحد لتسع صفحات، وhreflang من القاعدة لا من الكود» (١٢ ملفاً · **+٥٢١ / −٨٣٢**)
  - `df021a1` — تجميد الجلسة
  - `12c3dea` — «hreflang من القاعدة في كل صفحة، وحذف المصادر الخمسة المتنافسة» (١٠ ملفات · **+١٠٦ / −٥٥**)
- **الشجرة نظيفة** إلا المستبعَد عمداً: `.claude/settings.local.json` · `.mcp.json` · `img-reqs.txt` · `mobile-uiux-mockup.html`.
- **`tsc`:** صفر أخطاء على **مودونتي والأدمن** معاً (شُغِّل بعد الكوميت الرابع).
- **البناء:** لم يُشغَّل. **مدفوع:** **لا** — الأربعة محليّون. الدفع يحتاج إذناً صريحاً جديداً.
- **النشر:** لا شيء. `main` لم تُمسّ.

### 🚀 الاستئناف في ٣٠ ثانية
1. `git log --oneline -4` — توقّع `12c3dea` على رأس `modonty-ui`، والشجرة نظيفة إلا الأربعة المستبعَدة.
2. `cd modonty && pnpm exec next dev -p 3000` ثم `curl -s http://localhost:3000/categories | grep -c hreflang` — توقّع ٩. (لو ظهر رقم قديم فهو كاش `"use cache"`: أوقف السيرفر وشغّله من جديد.)
3. القرار الأول: نطلب إذن الدفع للأربعة، ولّا نفتح بنداً جديداً على اللوحة؟

---

## Session: 2026-08-14 — 🧹 دمج قرّاء سيو الصفحات في دالّة واحدة + قتل الاستعلام المكرّر في صفحتَي الشريك والمقال (فرع `modonty-ui` · محلي فقط · **لم يُدفع**)

### 🎯 أين توقفت
- آخر بند: **SOT7 وSOT8 نُفِّذا وأُقفلا** — صفحة الشريك وصفحة المقال ما عادتا تسألان القاعدة مرّتين عن نفس الوثيقة.
- الخطوة الأولى عند الرجوع: **قرار خالد على الخطأين الباقيين في `tsc`** — `/trust` و`/story` يستوردان `ORGANIZATION_JSONLD` وهو محذوف. خياران: (أ) توصيلهما بـ`getLegalEntity()` القارئة من القاعدة، (ب) إرجاع الثابت.

### ✅ المنجز هذه الجلسة
- **مزامنة الإنتاج → المحلي:** خالد ضغط Sync بنفسه. القاعدة المحلية `modonty_dev` صارت نسخة الإنتاج. القيم القانونية الـ١٤ اللي كانت معبّأة على التطوير انمسحت (متوقَّع — الإنتاج ما عنده الأعمدة الجديدة).
- **إقفال كل سيرفرات node** (١٥ عملية) لتوفير موارد الجهاز.
- **دمج سبعة قرّاء سيو في ملف واحد** — `modonty/lib/seo/get-page-seo.ts` (٩١ سطراً) بدل ٣١٠ أسطر موزّعة على سبعة ملفات متطابقة إلا في اسم الحقل. كل صفحة تنادي `getPageSeo("tags")`. قراءة واحدة مخبّأة (`readSettingsSeoColumns`) تخدم السبع صفحات: الرئيسية · الفئات · الشركاء · الصناعات · الوسوم · الرائج · الأسئلة.
  - **عطل جانبي انحلّ بالدمج:** `faq-page-seo.ts` كان ناقصه `"use cache"` — كان يضرب القاعدة في كل طلب.
  - `getB2bPanelSettings` نُقل لملفه المستقلّ (بلا مستهلك واحد في الكود — لم يُحذف).
- **كلمة `fallback` في كل بنّاء احتياطي** (بطلب خالد، عشان يتميّز عن المصدر الأساسي): `buildFallbackJsonLd` في الفئات والصناعات والوسوم والأسئلة.
- **SOT7 — صفحة الشريك:** حُذف `db.client.findUnique` العاري من `Promise.all`؛ الحقل `jsonLdStructuredData` كان جاي أصلاً مع `include` في `client-page-data.ts:22`. استعلام واحد بدل اثنين.
- **SOT8 — صفحة المقال:** `generateMetadata` صار ينادي `getArticleContentBySlug` (نفس الدالّة المخبّأة اللي يناديها جسم الصفحة) بدل `getArticleForMetadata`. حُذف `article-metadata.ts`. ضربة واحدة على القاعدة بدل اثنتين.
- **بطاقتان جديدتان على لوحة Task:** SOT7 وSOT8 في بورد «مصدر بيانات السيو» — أُضيفتا ثم نُفِّذتا في نفس الجلسة.
- **حالة `tsc` على مودونتي:** خطآن فقط، وهما سابقان لهذه الجلسة (`/trust:11` و`/story:4`). الدمج والتعديلات لم تضف ولا خطأ.
- **البناء:** لم يُشغَّل. **التست الحيّ:** لم يُشغَّل (السيرفرات مقفولة بطلب خالد).

### 📝 القرارات المتّخذة
- **دمج قرّاء `Settings` نعم، ودمج قارئ المقال والشريك لا** → السبعة تقرأ من صفّ واحد بنفس الشكل، فالدمج ربح صافٍ. أما المقال والشريك فحقولهما تجي ضمن قراءة الصفحة الكبرى، فدالّة مشتركة كانت ستعني استعلاماً ثانياً — وهو بالضبط العطل اللي كنّا نصلحه.
- **`get-page-seo.ts` لا يحمل كلمة `fallback` في اسمه** → هو المصدر الأساسي (يقرأ ما خزّنه الأدمن)، والاحتياطي هو ما يُبنى حيّاً داخل الصفحات. تسميته «احتياطي» تقلب المعنى.
- **قراءة الأعمدة الأربعة عشر كلها في استعلام واحد بلا وسيط** → عشان تُخزَّن نسخة واحدة في الكاش تخدم السبع صفحات، بدل سبع نسخ. كلها تُبطَل معاً على `cacheTag("settings")` أصلاً.

### 🚧 المعلّق / المحجوب
- **الخطآن في `tsc`** — بانتظار قرار خالد (أ أو ب). هذا يمنع البناء.
- **تعديل السكيما** — ثمانية أعمدة اختيارية على `Settings` (`git diff --stat` = `+11`). `pnpm prisma:validate` و`generate` تمّا؛ **`prisma db push` لم يُنفَّذ على أي قاعدة**. غير مدفوع.
- **`LE1`** — إدخال بيانات الكيان القانوني على إنتاج الأدمن بعد النشر.
- **SOT3 · SOT5** — بانتظار قرار خالد (لا شغل كود).
- **SOT6 · PG4** — تحتاج فحص صفحة صفحة قبل أي رأي.
- **عدّ مقالات الإنتاج الناقصة `jsonLdStructuredData`** — محجوب: لا يوجد `DATABASE_URL` للإنتاج مفعَّل في المستودع (`MODONTY_PROD_DATABASE_URL` موجود باسم منفصل، لا يُقرأ افتراضياً).

### 📂 الملفات التي لُمست
- `modonty/lib/seo/get-page-seo.ts` — **جديد** · الدالّة الموحّدة `getPageSeo(page)` + القراءة المخبّأة الواحدة
- `modonty/app/clients/helpers/get-b2b-panel-settings.ts` — **جديد** · نُقل من `clients-page-seo.ts` قبل حذفه
- محذوفة (٧): `categories-page-seo.ts` · `clients-page-seo.ts` · `faq-page-seo.ts` · `industries-page-seo.ts` · `tags-page-seo.ts` · `trending-page-seo.ts` · `home-page-seo.ts`
- محذوف: `modonty/app/articles/[slug]/actions/article-metadata.ts`
- `modonty/app/{page,categories,clients,industries,tags,trending,help/faq}/page.tsx` — توصيل `getPageSeo` + تسمية البنّاء الاحتياطي
- `modonty/app/clients/[slug]/page.tsx` — حذف الاستعلام المكرّر · القراءة من `client.jsonLdStructuredData`
- `modonty/app/articles/[slug]/page.tsx` — `generateMetadata` على `getArticleContentBySlug`
- `modonty/app/articles/[slug]/actions/article-data.ts` — تصدير `getArticleContentBySlug`
- `modonty/app/articles/[slug]/actions/index.ts` — تحديث البرميل
- `documents/tasks/TASK.html` — بطاقتا SOT7 وSOT8

### 🔁 حالة Git والنشر
- **الفرع:** `modonty-ui`
- **آخر كوميت:** `3f2432b` — «الأيقونات من السجلّ وحده، وتوازٍ في موضعين»
- **تعديلات غير مدفوعة:** نعم — عشرات الملفات في `modonty/` + `shared/prisma/schema/schema.prisma` + `documents/tasks/TASK.html` + `.claude/rules/modonty-scope.md` (غير متعقَّب)
- **مدفوع:** لا
- **النشر:** لا شيء. `main` لم تُمسّ.

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd modonty && pnpm tsc --noEmit` — لازم يظهر الخطآن نفسهما فقط (`/trust:11` و`/story:4`).
2. افتح `modonty/lib/seo/organization-jsonld.ts` — شوف `getLegalEntity()` الموجودة.
3. القرار الأول: (أ) نوصّل `/trust` و`/story` بـ`getLegalEntity()` من القاعدة، ولّا (ب) نرجّع ثابت `ORGANIZATION_JSONLD` ونؤجّل؟

---

## Session: 2026-08-13 (تكملة) — 🚪 دليل الكونسول: زرّ رجوع للوحة (مدفوع `a28a2b4` · console 0.27.1)

### 🎯 أين وقفت
- **آخر ما جرى:** دُفع `a28a2b4` على `main`، والمحلي = البعيد. لا شغل ناقص في يد.
- **الخطوة التالية عند الاستئناف:** لا شيء معلّق من هذا البند. أقرب فحص اختياري: دخول الكونسول كعميل وتجربة اللفة من نافذة الترحيب («ابدأ الجولة» → `/help` → «رجوع للوحة») — لم تُجرَّب مسجَّلَ الدخول.

### ✅ أُنجز في هذه الجلسة
- **المشكلة كما وصفها خالد:** العميل أول زيارة تظهر له نافذة ترحيب تدلّه على الدليل، وحين يدخل الدليل **ما يلقى زرّاً يرجّعه للكونسول**.
- **التأكد من الكود قبل أي تعديل (طلب خالد صراحةً):** `grep "/dashboard"` في كل `console/app/help/` = **صفر نتائج** · `find app/help -name "layout*"` = **لا يوجد** · جذر التخطيط `console/app/layout.tsx:29` = `<Providers>{children}</Providers>` بلا هيدر · `HelpClient.tsx:34` رابطه الوحيد خارجي · `ConsoleTourClient.tsx:130` يرجّع لـ`/help` لا للوحة. المشكلة مؤكَّدة بالكود لا بالانطباع.
- **الحل:** ملف واحد جديد `console/app/help/layout.tsx` — شريط علوي ثابت فيه «رجوع للوحة» → `/dashboard`، يغطّي الصفحات الثلاث (`/help` · `/help/general` · `/help/console`) دفعةً واحدة.
- **تست حيّ على ٣٩٠ عرضاً** (الكونسول محلياً على `3002`): الشريط `top = 0` عند `scrollY = 4000` · اختبار الإصابة على مركز الرابط يرجع `href="/dashboard"` · **ضغطة حقيقية** من `/help/general` مُمرَّراً ٣٠٠٠ انتقلت فعلاً لـ`/dashboard` · الشريطان لا يتراكبان (رجوع `0→45`، أدوات `44→97`) · قائمة المحتويات تبدأ ١١٢ > ٩٧٫٧ · صفر تمرير أفقي · **صفر أخطاء كونسول**.
- **على سطح المكتب (١١٠٠):** الشريطان ينتهيان عند ١٠٣٫٧ وقائمة المحتويات المثبّتة عند ١١٢ — تُخلي بـ٨ بكسل. لقطة سليمة: `.playwright-mcp/help-bar-final.png`.
- **حالة `tsc`:** console = **صفر أخطاء** (`TSC_EXIT_CODE=0`، مخرج فاضي). admin/modonty لم تُمَسّا.
- **البناء:** لم يُشغَّل. **الدفع:** تمّ (`push>` — بلا نسخة احتياطية عمداً).

### 📝 قرارات وأسبابها
- **`fixed` لا `sticky`** → `html`/`body` في الكونسول عندهما `overflow-x: hidden`، وهذا يجعل الجسم حاوية تمرير خاصة به فينكسر أي التصاق علوي. **مُثبَت حيّاً:** جرّبت `sticky` أولاً وسقط الشريط عند التمرير على ٣٩٠. المرفوض: تعديل `overflow` في `globals.css` — أثر عام على كل التطبيق مقابل مشكلة محلية.
- **الحشوة العلوية على جذر الصفحة لا على غلاف المحتوى** → على الجوّال تُرسم قائمة المحتويات في السياق الطبيعي **قبل** المحتوى، فلو كانت الحشوة على الغلاف لبدأت القائمة تحت الشريطين. المرفوض: حشوة على الغلاف (الأبسط ظاهرياً، ويُخفي القائمة).
- **شريطان متراصّان (٩٧ بكسل) لا شريط واحد مدموج** → دمج أدوات الصفحات (مشغّل الصوت، زرّ إعادة الجولة) في شريط التخطيط يتطلّب سياقاً أو منفذاً من العميل للتخطيط — إعادة هيكلة كبيرة مقابل مكسب ٥٠ بكسل. المرفوض أيضاً: إلغاء تثبيت أشرطة الصفحات (يفقد مشغّل الصوت وصوليته الدائمة).
- **ارتفاع الشريط ٤٤ بكسل** → الحد الأدنى لهدف اللمس، وأقلّ ما يمكن اقتطاعه من شاشة الجوّال.
- **«رجوع للوحة» لا «رجوع للوحة التحكم»** → أقصر وأسهل على ٣٩٠ بكسل، وبلا اختصار على الجوّال (وسم «مركز المساعدة» وحده هو المخفي دون `sm`).
- **لم أمسّ رابط «رجوع لمركز المساعدة» في صفحة الجولة** → يعمل ولم يكن جزءاً من الطلب.

### 🚧 معلّق / محجوب
- **اللفة كاملةً مسجَّلَ الدخول** — لم تُجرَّب. السبب: كوكي جلسة قديمة من الأدمن على نفس `localhost` كسرت المصادقة (`JWTSessionError: no matching decryption secret`)، ثم علّق سيرفر التطوير وأُعيد تشغيله. **الخطر منخفض ومُبرَّر:** صفحات `/help` الثلاث لا تقرأ الجلسة إطلاقاً (`grep` لـ`auth()`/`session` داخل `app/help/` = صفر) ولا يوجد `proxy.ts`/`middleware.ts` في الكونسول — فما اختُبر مجهولاً هو **نفس الترميز** الذي يراه العميل.
- **سجلّ التغييرات `1.17.0` + إدخال نسخة الكونسول `0.27.1`** — من شاشة الأدمن، بيد خالد (يعيش في القاعدة).

### 📂 الملفات
- `console/app/help/layout.tsx` — **جديد**: شريط «رجوع للوحة» المشترك للصفحات الثلاث.
- `console/app/help/HelpClient.tsx` — شريط الأدوات نزل لـ`top-11`؛ الحشوة `pt-28` انتقلت لجذر الصفحة.
- `console/app/help/console/ConsoleTourClient.tsx` — نفس التعديلين.
- `console/app/help/HelpLanding.tsx` — `pt-11` على الجذر (لا شريط أدوات لهذه الصفحة).
- `console/app/help/components/v2/TocSidebarV2.tsx` — `md:top-4` → `md:top-28` لتخلي الشريطين على سطح المكتب.
- `console/package.json` — `0.27.0` → `0.27.1`.

### 🔁 حالة الجيت
- الفرع: `main` · آخر كوميت: `a28a2b4` «دليل الكونسول: زرّ رجوع للوحة — العميل كان يدخل الدليل ولا يلقى مخرجاً» · **مدفوع ✅** (`16edaba..a28a2b4`، المحلي = البعيد).
- غير مدفوع عمداً: `.claude/settings*.json` · `.mcp.json` · سجلّات الجلسة · `mobile-uiux-mockup.html` · `documents/archive/tasks/UIUX-CLARITY-FINDINGS-v1.html` · `documents/context/BUSINESS-MODEL-REFERENCE.md`.
- فرع `modonty-ui` (شغل Codex في مجلّد منفصل): لم يُمَسّ.

### ⚠️ ملاحظة بيئة
- **لقطات Playwright على الجوّال غير موثوقة في هذه الجلسة:** Edge المرئي يرسم سطحاً أصغر من المنفذ المفروض (`setViewportSize(390,844)` ينتج منفذاً ٤٨٧×١٠٥٥ و`devicePixelRatio = 0.8`) فتختفي العناصر المثبّتة **من الصورة لا من الصفحة**. لقطة سطح المكتب سليمة. البديل الموثوق: قياس الهندسة و`elementFromPoint` عبر `browser_evaluate`.
- سيرفران يعملان معاً (أدمن `3001` + كونسول `3002`) خالف قاعدة «سيرفر واحد»، والكونسول علّق فعلاً واحتاج إعادة تشغيل.

### 🚀 استئناف في ٣٠ ثانية
1. `git log --oneline -1` → المتوقَّع `a28a2b4`، وما بعده يعني شغلاً جديداً.
2. افتح `console/app/help/layout.tsx` — نقطة الدخول لأي تعديل على شريط الدليل.
3. القرار: هل نجرّب اللفة مسجَّلَ الدخول (نحتاج مسح كوكي `localhost` أولاً)، أم ننتقل لبند جديد؟

---

## Session: 2026-08-13 — 🖼️ اسم الصورة من نصّها البديل + حارس بني + دليل الفريق وثيقةً واحدة + حدّ طلبات جبر سيو (مدفوع: `16edaba` مودونتي · `eb9da64` جبر سيو)

### 🎯 أين وقفت
- **آخر ما جرى:** دُفع المستودعان. لا شغل ناقص في يد.
- **الخطوة التالية عند الاستئناف:** افتح `TASK.html` ← البند `IMGRENAME`. تنفيذه **يعتمد على إكمال ترحيل الصور إلى بني أوّلاً** (٣٠٢ من ٣٢٩ صورة مدوّنتي ما زالت على كلاود إيناري).

### ✅ أُنجز هذي الجلسة

**١. إعادة تسمية الصور — الخلل الأصلي وإصلاحه**
- الحفظ كان يخاطب **كلاود إيناري**: مع صور بني الجديدة لا يفعل شيئاً بصمت (`cloudinaryPublicId` فارغ)، ومع المهاجَرة يعيد تسمية نسخة لا يخدمها أحد بينما اللوحة تعطي ١٥/١٥ كاذبة.
- صار ينقل الملف على بني بمنطقته الصحيحة (`clients` أو `reels` — تُستنتج من الرابط لا تُفترض)، وينقل القصّات الثلاث، ويستدعي `syncEntityImageUrls`، ويبطّل كاش الوسوم والتصنيفات.
- **ثلاثة أخطاء في كودي كشفها التست الحيّ قبل أن تلمس ملفاً:** منطقة خاطئة · الرابط أحياناً في `url` لا `bunnyUrl` · كلمة `upload` قُرئت كمفتاح تفرّد.

**٢. الاسم يُشتقّ من النصّ البديل (فكرة طارق)**
- `dataLayer/lib/seo/media/alt-to-filename.ts` — دالّة نقيّة، السقف `MAX_FILE_BASE=125` مطابق لـ`sanitizeBunnyBase`.
- منع تكرار النصّ البديل داخل العميل الواحد، ورسالة تسمّي الصورة المتعارضة.
- **قاعدة «مرّة واحدة»:** لا يُعاد التسمية بعد أوّل مرّة — كل تغيير رابط يُبطل ما جمعته الصورة عند جوجل.
- معاينة حيّة للاسم مع كل حرف، بنفس دالّة الخادم.

**٣. حارس بني** — `devPrefix()` و`assertWritable()` في `dataLayer/lib/bunny.ts`: خارج الإنتاج كل رفع في `_dev/`، وحذف أو نقل أي مسار إنتاج **مرفوض بخطأ صريح**. الإنتاج بلا أي تغيير (`VERCEL_ENV=production` يخرج فوراً).

**٤. دليل الفريق** — `/guidelines` صار وثيقة واحدة (١٩ قسماً · ٨٩٩ سطراً) بدل ستّ عشرة صفحة. أُضيفت أقسام لم تكن موثّقة: بوّابة النشر · سيو الصور · الريلز · مقالات العملاء · البريفات. حُذفت صفحة `about` بعد نقل محتواها. الأسعار تُقرأ حيّة من نظام الباقات.

**٥. تصحيحات أرقام كانت تكذب**
- عدّاد «عنوان السيو» كان يسمح بـ**٦٠** والحفظ يرفض فوق **٥١** → صار ٥١.
- «كلاود إيناري» في صفحتَي الوسائط والممنوعات → بني.
- «٨ مقالات» مكتوبة يدوياً في أربعة مواضع → تُقرأ من الباقة.

**٦. جدول المقالات** — كان يجلب ٥٠ صفّاً فقط (٥ صفحات مهما كان العدد) → رُفع القيد، صار ١٤ صفحة.

**٧. معيار المقالات المرتبطة** (شكوى طارق) — بُني كبُعد ثالث بوزن ١٠٪، وكشف باقاً أقدم: المحرّر يقرأ الاتجاه المعاكس فيفتح فارغاً و**يمحو القائمة** عند الحفظ التالي. مُصلَح ومُختبَر (٠→٥٦ · ١→٦٠ · ٣→٦٦).

**٨. جبر سيو** — حدّ الطلبات ٣٠→١٢٠/دقيقة مع استثناء طلبات التنقّل والزواحف وصفحة عربية بدل النصّ البرمجي؛ ومدّة تخزين مقالات مودونتي ٣٦٠٠→٦٠ ثانية.

**الحالة:** `tsc` صفر على أدمن ومدوّنتي وكونسول وجبر سيو · نسخة احتياطية `PROD-2026-08-13` (٩٥ مجموعة · ٥٩ ميجا) · تست حيّ كامل للفة الصورة (رفع → `_dev/` → إعادة تسمية → القصّات الثلاث → صفر تسرّب للإنتاج).

### 📝 قرارات (بسببها)
- **الاسم من النصّ البديل** لا من مولّد عامّ → وصف واحد يكتبه الكاتب فيخرج منه الاسم. رُفض إبقاء المولّد: يعطي «كيما زون — صورة» وهو أعمّ من النصّ البديل.
- **السقف ١٢٥ لا ٨٠** → قصُّنا يضيّع كلمات للأبد، وقصّ جوجل في العرض تجميليّ. Bunny يسمح بـ٦٬٠٠٠ وجوجل بلا حدّ رقميّ.
- **العربي في اسم الملف يبقى** → جوجل يوصي به صراحةً («استخدم كلمات بلغة جمهورك»)، وموقعا «موضوع» و«المرسال» يفعلانها على نطاق واسع. **لم يُحسم** شكل عرضه في بطاقة بحث الصور — جوجل يحجب المعاينة الآلية ولا توثيق يذكره.
- **الدقيقة بدل الإشعار الفوري** لجبر سيو → تحلّ ٩٥٪ من الشكوى بلا سرّ مشترك ولا نداء من مودونتي. **حُذف** مسار الإشعار بعد القرار (لا كود ميت).
- **الحارس بدل زون تطوير منفصل** → الزون وحده لا يحمي، لأن صفوف قاعدة التطوير تشير لمسارات الإنتاج.

### 🚧 معلّق
- **`IMGRENAME`** (على اللوحة) — إعادة التسمية الجماعية. **محجوبة** حتى يكتمل ترحيل الصور إلى بني: ٣٠٢ من ٣٢٩ «خارج بني».
- **٢٣ صورة بلا نصّ بديل** — شغل تحريري لطارق لا شغل كود.
- **سجلّ الإصدارات `1.17.0`** — يُضاف من شاشة الأدمن (يعيش في القاعدة).
- **`pending` من محدّد المعدّل في جبر سيو** لا يُمرَّر لـ`waitUntil` — يمسّ دقّة تحليلات المحدّد لا الحماية.

### 📂 ملفّات مسّتها
- `dataLayer/lib/seo/media/alt-to-filename.ts` — **جديد**: النصّ البديل ← اسم ملف.
- `dataLayer/lib/bunny.ts` — حارس `_dev/` · `bunnyZoneOfUrl` · `bunnyRenamedPath` · `extractBunnyUniqueKey` · `sanitizeBunnyBase`.
- `dataLayer/lib/seo/media/seo-score.ts` — يقيس اسم الرابط المخدوم (`servedUrl` إلزامي).
- `dataLayer/lib/seo/article/links-score.ts` — **جديد**: معيار الربط الداخلي.
- `admin/app/(dashboard)/media/actions/save-image-seo.ts` — النقل على بني · منع التكرار · «مرّة واحدة».
- `admin/app/(dashboard)/seo-images/**` — خطّة الأسماء معروضة داخل الشاشة.
- `admin/app/(public)/guidelines/**` — الوثيقة الواحدة + الأقسام الجديدة.
- `admin/app/(dashboard)/articles/**` — عدّاد ٥١ · رفع قيد الجدول · شريط الربط في الصفحة التقنية.
- `JBRSEO/jbrseo.com/{proxy.ts,lib/rate-limit.ts,lib/modonty-articles.ts}`.

### 🔁 حالة الجيت
- **مودونتي:** `main` · مدفوع `16edaba` · غير المحفوظ: إعدادات و`.mcp.json` وسجلّات وملفّات موكاب (مستبعدة عمداً).
- **جبر سيو:** `main` · مدفوع `eb9da64`.
- **Codex:** `origin/modonty-ui` عند `5c317ba` — لا دمج، والدمج آخر مرحلة بيدي.

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd admin && pnpm exec next dev --port 3001` (المنفذ ٣٠٠٠ لسيرفر Codex — و`NEXTAUTH_URL` في `admin/.env.local` مضبوط على ٣٠٠١).
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/TASK.html` ← البند `IMGRENAME`.
3. القرار الأول: نبدأ ترحيل الـ٣٠٢ صورة إلى بني، أم نمسك شيئاً آخر؟
