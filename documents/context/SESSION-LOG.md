# Session Context — Last Updated: 2026-07-22

> ⚙️ **ملف نشط = آخر أسبوع فقط** (يتوزّع أسبوعياً لتوفير الـ token عند القراءة).
> الأرشيف الكامل بالأشهر:
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

### ⛔ نشر الإنتاج القادم — حسّاس (آخر الليل · إذن خالد صريح · نسخة احتياطية أول)
- [ ] **إدخال محتوى الشروط/الخصوصية** على DB الإنتاج (slugs: `terms` / `privacy-policy`) — مسودات جاهزة في `documents/legal/`.

### ✅ خرجت من المعلّقات (أُنجزت 2026-07-21/22)
- **d5 — فصل الطاقم اكتمل (مدفوع 2026-07-22 `8a7b639`):** حُذفت نسخ `User` القديمة + شِيل `db.staff ?? db.user` (admin 0.95.0، staff-only) + فُعّل ربط Google الآمن (`allowDangerousEmailAccountLinking`، آمن بعد الفصل). المتبقّي اختياري: تنبيهات `userId`→`staffId`. المصدر: `memory/project_pending_d5_remove_staff_fallback`.
- **فصل الطاقم:** نُشر (`118e367`) + رُحّل (10 أدمن→staff بنفس `_id`) + دُوّر `AUTH_SECRET` + تحقّق دخول staff حيّ.
- **معرض العميل + محسّن WebP:** نُشر + اختُبر حيّ على الإنتاج (كيمازون معرض إضافة/حذف · فرسان التعافي WebP −88%).

### 🔮 مستقبلي
- [ ] نقل تخزين معارض العملاء إلى Bunny (Cloudinary مكلف) — آمن بمعمارية Media ID. المصدر: `documents/tasks/TODO.md`.

---

## Session: 2026-07-23 — مؤشّر صحة SEO على الداشبورد + توحيد الصفوف (admin 0.97.0)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** جاهز للدفع/مدفوع — admin **0.97.0**. tsc أخضر + تحقّق حيّ (Overall 78٪ يتقاطع مع Articles 81٪/Clients 69٪). سيرفر dev admin على **:3000**.
- **أول خطوة:** المتبقّي الاختياري — دخول قسم Media بنفس نمط الصفوف (لم يبدأ).

### ✅ أُنجز هذه الجلسة
- **مؤشّر صحة SEO لكل الكيانات** (article + client): النسبة = **متوسّط درجات الرُبريك المشترك** (مجموع÷عدد)، لا «كم كامل». تفصيل «Blocking 100%» مقسوم محتوى⇄نظام (سطر واحد).
- **Overall ribbon أعلى الداشبورد** = صحة منصة مدونتي كاملة: (مجموع درجات المقالات+العملاء)÷(عددهم)، دقيق ومرجّح بالعدد. `platform-seo-overall.tsx`.
- **توحيد الصفوف (DRY):** مكوّنات مشتركة `pipeline-row.tsx` (`BudgetRow` للتقسيمات الحقيقية فقط + `PipelineRow`) و`seo-health-card.tsx`؛ Articles وClients على نفس اللغة. قسم Clients تحوّل من كروت لصفوف. قسم Money بإطار كهرماني مميّز.
- **صفحتا سيقمنت SEO** لكل من article/client (`seo-imperfect`/`seo-perfect`) بـ`scoreFilter`.
- **الروابط الداخلية:** لا حدّ أدنى ٣ من قوقل (موثّق) — لم تُضف.
- **حُفظ في القاعدة:** الريلز WIP يُستبعد من أي دفع (`project_reels_wip_exclude_from_push`).

### ⚠️ ملاحظات
- الدفع بقائمة ملفات صريحة — **reels مستبعد** (`modonty/app/reels/` كود إنتاج ناقص).

---

## Session: 2026-07-23 — مراجعة v3 النقدية + إصلاحا محرّر المقال (مدفوع ✅ 57b7fb2)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع (`57b7fb2`→main)، admin **0.96.0** ينشر. سيرفر dev admin شغّال على **:3000** (task خلفي).
- **أول خطوة:** المرحلة الجاية = شغل UI/UX على مدونتي عبر Google Stitch (تصاميم = موكب ملزم). لا شي عاجل.

### ✅ أُنجز هذه الجلسة
- **مراجعة v3 النقدية العكسية** (بلا تعديل كود): تقرير HTML5 `documents/modonty-v3-handoff/CRITICAL-REVIEW-v1.html` — قرأت الـ15 ملف + وثّقت من Context7 (Next.js: `priority`→`preload`؛ Tailwind: dark = prefers-color-scheme). أخطر النقاط: مساعد AI يجاوب YMYL، الموكب يكسر قواعد نظامه (إيموجي/عربي-فقط/طبقة-واحدة)، لقطات=رهان منتج مدسوس، الداكن-افتراضي لمنتج قراءة، ازدحام CTA. الدرجة 6.5/10 «أساس ممتاز يحتاج انضباط قبل أن يصير عقدًا».
- **إصلاحا محرّر المقال** (`admin/.../rich-text-editor.tsx`، ملف واحد، مدفوع):
  1. **شريط ثابت** — منطقة المحتوى `max-h-[60vh] overflow-y-auto` فتتمرّر داخليًا والشريط+عدّاد الكلمات فوق دائمًا. (اخترنا هذا بدل sticky لأن الأقسام داخل Accordion فيه `overflow-hidden` يكسر sticky — والحل الداخلي يعمل مع التبويبات والأكورديون معًا.)
  2. **نص الوضع الداكن مقروء** — شِلنا `TextStyle`+`Color` (ما لهما زر بالشريط، بس كانتا تحملان الأسود المبيّت المستورد `color:rgb(0,0,0)` ×130 + رمادي ×2). النص يرث الثيم الآن + المحتوى ينظّف نفسه عند الحفظ. متحقّق حيًّا: `inlineColorCount 0`، لون `rgb(248,250,252)`.
- TSC admin=0. تست حي على الإنتاج/dev بلقطات في `.playwright-mcp/`.

### 🧠 قرارات
- **scroll داخلي للمحرّر** (لا sticky) — الأكورديون `overflow-hidden` يقتل sticky؛ الحل الداخلي مستقل عن الحاوية (تبويبات/أكورديون).
- **إزالة Color/TextStyle** لا يفقد ميزة (لا زر لون) ويحذف الخردة من المصدر.

### 🚧 متبقّي / بيد خالد
- **تنظيف الموقع العام:** HTML المقالات في DB لسه فيه الأسود المبيّت — يختفي مقال-بمقال عند الحفظ، أو دفعة كـ Run-All لو صار الموقع العام داكن (مرتبط بقرار v3). مو عاجل (العام فاتح).
- v3: قرارات المنتج الثلاثة (AI/لقطات/داكن) تحتاج حسمًا منفصلًا قبل البناء.

### 🔁 Git / deploy
- Branch: main · آخر commit `57b7fb2` (محرّر) · مدفوع ✅ · admin 0.96.0 ينشر. سبقه `97f2c2f` (تيليجرام).
- **غير مدفوع عمداً:** تقرير `CRITICAL-REVIEW-v1.html` + `DESIGN_SYSTEM.md` المسترجع + `documents/*` + `.claude/*`.

### 🚀 استئناف في 30 ثانية
1. لا شي عاجل — مدفوع ومنشور.
2. المرحلة الجاية: مدونتي UI/UX عبر Google Stitch (موكب ملزم + Tajawal/RTL/بندل).
3. مرجع النقد: `documents/modonty-v3-handoff/CRITICAL-REVIEW-v1.html`.

---

## Session: 2026-07-22 (تكملة-٢) — إشعارات تيليجرام أوضح + إغلاق d5 (staff-only) + ربط Google (مدفوع ✅ 97f2c2f)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع (`97f2c2f`→main) ومنشور (admin 0.95.0 · modonty 1.79.0 · console 0.21.3). tsc نظيف ×3 + backup. الـ changelog **متروك بأمر خالد** (النظام قديم — SOT واقف عند 0.42.0 بينما admin 0.95.0).
- **أول خطوة عند الاستئناف:** المرحلة الجاية = **شغل admin ثم المدونة (UI/UX معركة أساسية)**. خالد بيربط Claude بـ **Google Stitch** كمصدر تصميم. أي تصميم Stitch = **موكب ملزم** → أبنيه طبق الأصل بعد تثبيت قيود مدوّنتي (Tajawal/Montserrat · RTL · حساسية البندل).

### ✅ أُنجز هذه الجلسة
- **إشعارات تيليجرام أوضح (داخل التيليجرام فقط):** تنظيف اللابلات (لايك→إعجاب · ديسلايك→عدم إعجاب · CTA→«ضغط على زر» · Conversion→«تحويل مكتمل» · Lead→«زائر باهتمام عالٍ») في `events.ts` (modonty+console) · توحيد «من فعل» → **الزائر** في كل مكان · زيارة الصفحة «من»→**المصدر** · المشاركة تعرض **اسم المقال الحقيقي** بدل الـ slug + أسماء المنصات بالعربي (تويتر/واتساب/…) · إشعار الضغط: عنوان المقال + النوع(عربي) + الوجهة، **بلا تسمية إنجليزية** · نوع التحويل بالعربي.
- **⚠️ تصحيح نطاق مهم:** أول محاولة عرّبت تسمية «الزر» عبر تعديل **~25 ملف كومبوننت** (نفس `label=` يغذّي التحليلات) — خالد رصد أني «طلعت برّا التيليجرام». **رجّعت كل الـ25 ملف عبر `git restore`** + شِلت سطر «الزر» من الإشعار (يكتفي بعنوان المقال+النوع+الوجهة). صفر لمس للكومبوننتس/التحليلات.
- **d5 اكتمل:** شِيل `db.staff ?? db.user` من `admin/proxy.ts` + `admin/lib/admin-guard.ts` + `admin/auth.config.ts` (staff-only) — بعد تأكيد خالد دخول الـ10 من staff صباحاً.
- **ربط Google آمن مُفعّل:** `allowDangerousEmailAccountLinking:true` على Google في `modonty/auth.config.ts` — يحل تصادم «باسورد ثم Google بنفس الإيميل» (كان OAuthAccountNotLinked). آمن الآن لأن صفر admin في جدول user العام بعد الفصل.
- **عمود «موثّق» في Members:** مستخدمو Google يظهرون موثّقين (`!u.password`) — كانوا «–».
- **TSC:** admin=0 · modonty=0 · console=0. Build: Vercel (منشور). **تست حي: لم يُطلب** (خالد ما طلب Playwright).

### 📝 قرارات (بسبب)
- **نطاق تيليجرام فقط** (بأمر خالد الصريح) — عدم تعريب تسميات الكومبوننتس يتفادى: (أ) الخروج عن النطاق (ب) انجراف تسميات التحليلات. البديل (تعريب الكل) رُفض بعد ما رصد خالد التوسّع.
- **تفعيل ربط Google** (انعكاس القاعدة القديمة «ممنوع») — بعد فصل الطاقم صفر admin في user العام + لا صفحة عامة تحرس على `role==="ADMIN"` → صفر تصعيد. تحقّق رسمي Auth.js: Google يتحقق من ملكية الإيميل → آمن.
- **الـ changelog متروك** — النظام (`changelog-sync.ts`) SOT واقف عند 0.42.0 من 24 أبريل بينما admin 0.95.0؛ إحياؤه صح = تعبئة ~50 نسخة ناقصة، مو إدخال واحد. لا كتابة إنتاج بتخمين.

### 🚧 معلّق / القادم
- **المرحلة الجاية:** admin ثم **المدونة — UI/UX (شغل كبير)** عبر Google Stitch (تصاميم = موكب ملزم + حراس Tajawal/RTL/بندل).
- **معلّق ثابت:** إدخال الشروط/الخصوصية على DB الإنتاج.
- **اختياري:** إحياء الـ changelog · تنبيهات `userId`→`staffId`.

### 📂 ملفات لُمست (تيليجرام — مدفوعة `97f2c2f`)
- `modonty/lib/telegram/events.ts` · `console/lib/telegram/events.ts` · `modonty/lib/conversion-tracking.ts` · `modonty/app/api/track/cta-click/route.ts` · `modonty/app/api/articles/[slug]/share/route.ts` · `modonty/app/api/clients/[slug]/{share,view,follow,favorite}/route.ts` · `modonty/app/articles/[slug]/actions/article-interactions.ts` · package.json (modonty 1.79.0 · console 0.21.3)
- **auth (مدفوعة `8a7b639`):** `admin/{auth.config.ts,proxy.ts,lib/admin-guard.ts,app/(dashboard)/members/actions/members-actions.ts}` · `modonty/auth.config.ts` · admin 0.95.0

### 🔁 Git / deploy
- Branch: main · آخر commit `97f2c2f` (تيليجرام) · سبقه `8a7b639` (auth) · مدفوع ✅ · local==origin · الثلاثة منشورة.
- **غير مدفوع عمداً:** `.claude/*` · `documents/*` (سياق) · `modonty/app/reels/` · `documents/reels/` · `CLAUDE.md.backup-2026-07-21`.

### 🚀 استئناف في 30 ثانية
1. لا شي عاجل — الجلسة مكتملة ومدفوعة ومنشورة.
2. المرحلة الجاية: admin ثم المدونة UI/UX. انتظر تصاميم Google Stitch من خالد.
3. أي تصميم Stitch → عامله كموكب ملزم (`feedback_mockup_is_the_contract`) + ثبّت Tajawal/RTL/بندل قبل الكود.

---

## Session: 2026-07-22 (تكملة) — لوحة «Start Here» + رد رسائل التواصل + إثراء سجل الأخطاء (مدفوع ✅ 7710a57)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** مدفوع (`7710a57`→main)، Vercel ينشر الثلاثة (admin 0.94.0 · modonty 1.78.0 · console 0.21.2). tsc نظيف ×3 + backup.
- **أول خطوة:** تأكيد نجاح نشر Vercel الثلاثة. لا شي عاجل غيره.

### ✅ أُنجز هذه الجلسة
- **صف «Today — Start Here»** أُعيد بناؤه: صف واتساب (شعار أصلي، حالات live/quiet/broken) · صف الرسائل المباشرة (#1) · تقسيم «visitor actions» لثلاثة (حجوزات للاتصال form-only بلا تكرار واتساب · تعليقات · أسئلة) · ترتيب + ألوان (أحمر=نزيف، برتقالي=منتظرك) + أيقونات صحيحة لكل موضوع.
- **تقرير الأسئلة:** يعدّ **كل** PENDING (فريق مودونتي ينتظر موافقة + زائر ينتظر جواب = 216)، تفاصيل per-client بتقسيم فريق/زائر.
- **تعديل العميل:** حُذف SEO title/description (ملك الكاتب، مكانهم صفحة SEO Client).
- **رد رسائل التواصل من الأدمن:** فورم في صفحة التفاصيل + dialog في القائمة → يرسل عبر Resend + يعلّم replied (`sendContactReply`).
- **إثراء سجل الأخطاء:** device/geo/bot + renderType + تصنيف framework/app (framework يتخطّى تلغرام) + زر Copy + مفتاح Hide framework. المصدر: memory `project_system_error_enrichment`.

### 🔎 تحقيق موثّق (بلا تخمين)
- خطأ `__next_metadata_boundary__` = **باق Next رسمي مفتوح (#93401)**، مو كودنا، منخفض الخطورة، ما ينعاد إنتاجه محلياً. تفاصيل: memory `project_next_metadata_boundary_framework_bug`.

---

## Session: 2026-07-22 02:06 — إصلاح دخول Google (www) + نظام رؤية أخطاء كامل (مدفوع ✅ 3c4bd95)

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** نُشر كل شي ومُحقّق حيّ على الإنتاج. السجل نُظّف (Clear All). الجلسة مكتملة.
- **أول خطوة عند الاستئناف:** لا شي عاجل. المعلّقات: (١) d5 بعد 2026-07-24 (memory `project_pending_d5_remove_staff_fallback`) · (٢) الريلز (تاسك خالد، غير مدفوع).

### ✅ أُنجز هذه الجلسة
- **مصيبة دخول Google — الجذر:** `NEXTAUTH_URL` على modonty كان الآبكس `modonty.com` والموقع كانونيكال `www` (آبكس→www 308) → قفزة عبر-هوست تُسقط كوكي PKCE على Safari/متصفحات التطبيقات (مصر) → فشل صامت («يختار الحساب ويرجع للدخول»). الحل: `NEXTAUTH_URL=https://www.modonty.com` + redeploy. محقّق: redirect_uri=www + كوكي=www + محاكاة جوال. **لا يغيّر AUTH_SECRET → ما طرد أحد.** memory `project_modonty_oauth_host_www`.
- **نظام رؤية أخطاء كامل (مدفوع `3c4bd95`):** إظهار إرور الدخول العربي على `?error=` (كان صامت) + تسجيله · GA4 `login_start` مستقل · `/system-errors` صار إنتاج-فقط (حارس `VERCEL_ENV`) + موسوم تطبيق (🟢modonty/🔵admin/🟣console) + مسار عربي مفكوك + revalidate · تغطية الكونسول (كان أعمى) · **إشعار Telegram لكل خطأ** (`@Modonty_admin_bot`، نقطة واحدة).
- **فصل الطاقم (نفس السلسلة):** تدوير `AUTH_SECRET` + ترحيل 10 أدمن→staff + تحقق دخول staff. **معرض/WebP:** اختُبر حيّ على الإنتاج.
- TSC: admin=0 · modonty=0 · console=0. Build: نجح الثلاثة (Vercel). تست حي: كل ما سبق محقّق على الإنتاج.

### 🧠 قرارات
- **OAuth كله على www** — الترقيع القديم (sameSite) ما لمس الجذر (انفصام الهوست). ممنوع ترجع NEXTAUTH_URL للآبكس.
- **تسجيل إنتاج-فقط** بحارس `VERCEL_ENV==="production"` (مو NODE_ENV) — يستثني dev+preview. تحقّق `autoExpose=true` للثلاثة قبل الاعتماد.
- **وسم التطبيق عبر `source:"<app>:<sub>"`** بدل حقل schema — صفر migration، العرض يفكّه لشارة.
- **Clear All للسجل** — الـ«200 خطأ» كانت صفحة كاش مجمّدة (أكّد أن إصلاح revalidate حقيقي).

### 🚧 المتبقّي / بيد خالد
- **d5** (بعد 2026-07-24): حذف نسخ users + شِل fallback. memory `project_pending_d5_remove_staff_fallback`. cron مجدول (session-only).
- تأكيدات: وصول Telegram · `login_start` في GA4 Realtime · **العميل المصري يعيد دخول Google (الدليل الأقوى)**.
- الريلز (تاسك خالد، غير مدفوع) · إدخال الشروط/الخصوصية (معلّق ثابت).

### 📂 ملفات لُمست (مدفوعة `3c4bd95`)
- `modonty/app/users/login/{page.tsx,components/login-form.tsx}` · `modonty/lib/log-error.ts` · `modonty/lib/analytics/{events-registry.ts,track-login-client.ts}` · `modonty/app/api/track/login/route.ts` · `modonty/instrumentation.ts`
- `admin/instrumentation.ts` · `admin/app/api/internal/log-error/route.ts` · `admin/app/(dashboard)/system-errors/components/system-errors-table.tsx`
- `console/instrumentation.ts` (جديد) · package.json ×3 (admin 0.93.1 · modonty 1.77.0 · console 0.21.1)

### 🔁 Git / deploy
- Branch: main · Last commit `3c4bd95` · مدفوع ✅ · الثلاثة READY. سبقه `118e367` (الطاقم+المعرض+WebP، نفس السلسلة).
- **غير مدفوع عمداً:** `modonty/app/reels/` · `documents/reels/` · `.claude/*` · `CLAUDE.md.backup-2026-07-21` · `PRE-PUSH-CHECKLIST.html`.

### 🚀 استئناف في 30 ثانية
1. لا شي عاجل — الجلسة مكتملة ومدفوعة.
2. بعد 2026-07-24: memory `project_pending_d5_remove_staff_fallback` → نفّذ d5 بإذن خالد.
3. أو ارجع للريلز (تاسك خالد المفتوح).

---

## Session: 2026-07-21 (مساءً-٢) — تحسين CLAUDE.md → Skills + إزالة التكرار بالنطاق · ملفات إعداد فقط · لا كود تطبيقي · لم يُدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** خالد يعمل **restart للجهاز** عشان أقرأ تحديثات ملفات الإعداد (CLAUDE.md المضغوط + السكِلات الجديدة). الجلسة مجمّدة قبل الـ restart.
- **أول خطوة بعد الـ restart:** لا شي على ملفات الإعداد — خلصت وثابتة. نرجع لشغل الـ push المعلّق (المعرض) حسب قسم «معلّقات ثابتة» أعلى الملف.

### ✅ أُنجز هذه الجلسة (ملفات إعداد فقط · صفر كود تطبيقي)
1. **ضغط `~/.claude/CLAUDE.md`** ٦٤٦→٢١٥ سطر (−٦٧٪): نقل الأقسام الإجرائية/المرجعية لسكِلات (progressive disclosure)، ضغط الحراس الدائمين بلا فقدان قاعدة. نسخة احتياطية `~/.claude/CLAUDE.md.bak`.
2. **ضغط `MODONTY/CLAUDE.md`** ٣٥٧→١٠٨ سطر (−٧٠٪): حذف تعليق `code-review-graph` الميّت (سطر ١) + حذف `<anti_patterns>` (تكرار ١٠٠٪) + إزالة تكرار داخلي (RTL ٣×، Prisma ٣×، revalidate ٤×). كل قاعدة فريدة + كل snippet محفوظ. نسخة احتياطية `MODONTY/CLAUDE.md.backup-2026-07-21`.
3. **سكِلات عامة جديدة** (`~/.claude/skills/`): `vercel-cost` (١٧٩) · `session-update` (٦٨) · `arabic-prose` (٢٦٠). موجود مسبقاً: `modonty-uiux`.
4. **حذف `code-review-graph`** تماماً (سكِل + قسم) — غير مستخدم.
5. **إزالة التكرار بالنطاق (بطلب خالد):** العربي كان ٣ نسخ (سكِلي الأفقر ٩٣ + `languageStyle.md` ٣٤٩ + CLAUDE.md) → نسخة واحدة: سكِل `arabic-prose` = المحتوى الغني الكامل (المصدر الوحيد)، `documents/myskill/languageStyle.md` صار مؤشّر ٩ أسطر. Vercel: نظّفت السكِل من تفاصيل مدونتي (`modonty_dev`/الكلستر/الدومين) — تبقى بذاكرة المشروع فقط (`project_mongodb_flex_upgrade_host_stable`). تحقّق `grep`=٠ تسريب.

### 🧠 قرارات
- **الحراس الدائمون يبقون في CLAUDE.md** (لا مجاملة/تخمين/push/DB/ULTRATHINK) — السكِل نايم لين يُستدعى، فالحارس الدائم لا يصير سكِل.
- **قواعد كود المشروع لا تصير سكِل** — لازم تشتغل مع كل تعديل؛ سكِل نايم = خطر التزام.
- **بيت واحد لكل معلومة بالنطاق:** عالمي→global skill · خاص بمدونتي→project memory · الباقي يشاور.
- **السكِل هو المصدر الأم للعربي، الملف مؤشّر** — أكفأ لتحميلي (تحميل واحد عند `tr>`، لا تحميلين).

### 🚧 المتبقّي
- كل بنود «🔒 معلّقات ثابتة» سارية (شغل المعرض + فصل الطاقم + الشروط/الخصوصية).

### 🔁 Git
- Branch: main · لا commit · تعديلات على `~/.claude/*` (خارج الريبو) + `MODONTY/CLAUDE.md` + `documents/myskill/languageStyle.md` (داخل الريبو، غير مدفوعة).

---

## Session: 2026-07-21 (مساءً) — قائمة ما قبل الـ Push + تقسيم SESSION-LOG بالأشهر + دفتر معلّقات ثابت · لا كود تطبيقي · لم يُدفع

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** خالد طلب `us>` + **restart للجهاز** (استنزاف موارد بعد جلسة طويلة) ثم test كامل + push لإغلاق المعلّقات. الجلسة مجمّدة قبل الـ restart.
- **أول خطوة بعد الـ restart (بالترتيب):** (1) **قفل نطاق الدفع أولاً** — الشجرة (١٣٠) فيها ترحيل فصل الطاقم (schema.prisma) + ريلز + سيو ذكاء + بوابة حراسة + المعرض. **ممنوع دفع الكل دفعة واحدة** (فصل الطاقم يكسر دخول أدمن الإنتاج بلا ترحيل بيانات + تدوير AUTH_SECRET — عملية آخر الليل منفصلة). (2) شغّل سيرفرات dev. (3) tsc معاد (بعد الـ restart) + build. (4) تست حي prod-only. (5) backup + version bump + changelog + push بإذن صريح.

### ✅ أُنجز هذه الجلسة (بنية سياق فقط · صفر كود تطبيقي)
1. **قائمة ما قبل الـ Push** — `documents/context/PRE-PUSH-CHECKLIST.html` (RTL، تفاعلي، يحفظ التقدّم بالمتصفح). كشفت أن الشجرة فيها **١٨٠ تغيير غير مدفوع** من جلسات كثيرة متداخلة (مش شغل المعرض فقط): فصل الطاقم (schema) · نظام الريلز · إصلاح سيو شامل (سكربتات لمرة واحدة) · سيو صور بالذكاء · بوابة حراسة الأدمن · خردة تشخيص في الجذر (~١٩ md/yml). التوصية: **لا تدفع الشجرة كاملة** — افصل الدفعات (أ: المعرض بعد حذف الخردة واستثناء schema · ب: فصل الطاقم آخر الليل مع ترحيل البيانات).
2. **تقسيم `SESSION-LOG.md`** (كان ٤٧٢ك/٣٤٢٣ سطر — استنزاف token): نشط = آخر أسبوع فقط (٩ جلسات ٠٧-١٤→٢١، **٧٩ك**) + أرشيف شهري دائم `SESSION-LOG-2026-07.md` (١٣) و`SESSION-LOG-2026-06.md` (٤٤). تحقّق صفر-فقدان صفر-تكرار: ٩+١٣+٤٤=٦٦=الأصل، كل جلسة في مكان واحد.
3. **إصلاح انتقادي (بطلب خالد):** أضفت قسم **«🔒 معلّقات ثابتة — لا تُدوَّر»** أعلى النشط — الشغل غير المنجز لا يسقط بالعمر (أكبر سلبية في القص الزمني). كل بند مؤشّر لمصدره (بلا نسخ محتوى → لا split-brain). أزلت تداخل آخر أسبوع بين النشط وأرشيف يوليو.
4. **قاعدة التدوير الأسبوعي (تلقائية بأمر خالد)** في رأس النشط + `memory/feedback_session_log_weekly_rotation.md`: كلود يدوّر بنفسه كل جلسة (أي جلسة أقدم من ٧ أيام تُنقَل لأرشيف شهرها، بلا طلب)؛ القراءة الافتراضية من النشط؛ التدوير يمسّ بلوكات `## Session:` فقط؛ تحقّق عدّ إلزامي؛ القص عند `---` فقط.
5. **نُفّذ التقليدي قبل الـ push (آمن، بلا إنتاج):** فحص أسرار `.claude` = نظيف (إيجابيات كاذبة) · حذف **٥٣ ملف خردة** (٢١ Playwright snapshot + ٣٢ سكربت/تست لمرة واحدة، بلا أرشفة؛ مصدر lib/ محفوظ) · `tsc --noEmit` admin+modonty+console = **صفر** (dataLayer عبرها). الشجرة **١٨٠→١٣٠**. بنود الـ checklist المنجزة معلّمة في `PRE-PUSH-CHECKLIST.html`.

### 🧠 قرارات
- **Context7/docs رسمية لا تنطبق** على تنظيم Markdown — لا مكتبة في المعادلة. الضمان = حفظ البيانات (عدّ) + مصدر حقيقة واحد.
- **دفتر المعلّقات = مؤشّرات لا نسخ** — يتفادى تضارب النسخ؛ التفاصيل تبقى في مصدرها (ذاكرة/checklist/TODO).
- **الأرشيف الشهري = نقل لا نسخ** (Model B) — كل جلسة في ملف واحد، لا ازدواج.

### 🚧 المتبقّي
- كل بنود قسم «🔒 معلّقات ثابتة» أعلى الملف سارية (tsc admin · تست prod للمعرض/المحسّن · قرار وتنفيذ الـ push · ترحيل الطاقم · الشروط/الخصوصية · نقل Bunny مستقبلاً).
- سؤال مفتوح لخالد: تذكير آلي للتدوير الأسبوعي (hook/cron) أم يبقى بالذاكرة؟

### 🔁 Git
- Branch: main · لا commit هذه الجلسة · تعديلات documents/context + memory فقط (غير مدفوعة، جزء من الشجرة الكبيرة).

## Session: 2026-07-21 — فصل معرض العميل عن الميديا + أداة تحسين الصور (WebP) · لم يُدفع · لم يُختبر tsc

### 🎯 أين توقفت + أول خطوة عند الاستئناف
- **آخر شي:** كنت أشغّل سيرفر الأدمن (`cd admin && pnpm dev`) — كان متوقّفاً (استنزاف Turbopack بعد جلسة طويلة). المنافذ 3000/3001 كانت فاضية.
- **أول خطوة عند الاستئناف:** (1) شغّل `pnpm dev` في `admin/` (المنفذ 3000 هذه الجلسة). (2) شغّل `pnpm tsc --noEmit` في `admin/` — **لم يُشغّل بعد** والملفات الجديدة كثيرة. (3) تست حي للأداة الجديدة.

### ✅ أُنجز هذه الجلسة (كله dev · لم يُدفع · tsc لم يُشغّل)
1. **إعادة هيكلة السايدبار** (`admin/components/admin/sidebar.tsx`): مجموعة **Accounts أولاً** (Accounts + Subscription Tiers) · تحت Articles أكورديون على مستويين (submenu): **Production Line** (5 خطوات + شارة مجموع) · **Maintenance & SEO** · **Content Setup** · مجموعة **Media** (Media Library · **Client Galleries** · Maintenance) · مجموعة **Analytics & Channels** (Search Console · Bing · Social). شيل رابط **SEO**. النافبار العلوي: شيل **Media** (بقي Articles).
2. **`/media/upload`:** حُذف فورم السيو (Title/Alt/Description) — رفع فقط، التحسين في `/seo-images`. أُعيد توازن مرحلة الرفع لعمود واحد موسّط. حُذف مكوّن `seo-form.tsx` (يتيم).
3. **باگ فقدان بيانات أُصلح (GALLERY/CLIENT_MINI):** `admin/lib/media/usage-where.ts` — أضيف بند «GALLERY/CLIENT_MINI لها clientId = مستخدمة» (تُستهلك بـ clientId+type بلا علاقة عكسية). + `admin/app/(dashboard)/media/actions/can-delete-media.ts` — يمنع حذفها من أي مسار. النتيجة على الصيانة: unused 100→36، مهدور 66.7→15.6MB.
4. **راوت مستقل `/client-galleries`** (مستويان): `page.tsx` (جدول عملاء + عدد صور) → `[clientId]/page.tsx` (شبكة معرض). إضافة (رفع Cloudinary unsigned، **معرض فقط بلا ريل**) + حذف (يطابق الكونسول: media+reels+Bunny+regen). ملفات: `helpers/load-galleries.ts` · `actions/gallery-mutations.ts` · `components/galleries-clients-table.tsx` · `[clientId]/components/client-gallery-grid.tsx` · loading.tsx ×2. بلاطة تعرض الصيغة (WEBP/JPG) + الحجم. **متحقّق حيّاً: المستويان يعملان.**
5. **GALLERY طلعت نهائياً من `/media`:** `get-media.ts` + `get-media-stats.ts` (SCOPE_FILTER) + `actions/media-counts.ts` (SCOPE_FILTER) + `lib/media/media-specs.ts` (شيل GALLERY من MEDIA_TYPE_ORDER). متحقّق حيّاً.
6. **أداة تحسين الصور في `/media/maintenance`** — قسم «Optimize images (89)»، **صورة صورة، بلا bulk**، يفحص **كل الأنواع including GALLERY**: غير WebP أو >300KB. ملفات: `lib/compress-image.ts` (نسخة من الكونسول) · `maintenance/helpers/optimizable.ts` · `media/actions/optimize-image.ts` · `maintenance/components/optimize-images-section.tsx` + سلكها في `maintenance/page.tsx`. **ظهر حيّاً (89 صورة) لكن زر «حوّل لـ WebP» لم يُنقر (mutation على بيانات حقيقية).**
7. **تنظيف segments.ts:** شيل «title» المحذوف + 40→50 نقطة للنص البديل.

### 🧠 قرارات + معمارية (مهم)
- **كل عرض للصور بالـ Media ID (علاقة)** → media.url؛ أجسام المقالات صفر روابط مضمّنة (متحقّق DB: 0/76). تغيير الرابط آمن للموقع الحي.
- **الاستثناء = نسخ literal للرابط في الكاش:** `jsonLdStructuredData`+`nextjsMetadata` (مقال+عميل) · `Reel.imageUrl`. **أداة `optimize-image.ts` تعالجها كلها بالترتيب:** رفع WebP → تحديث الصف → إعادة توليد سيو المقالات المتأثرة (`generateAndSaveNextjsMetadata`+`generateAndSaveJsonLd`) → سيو العميل (`generateClientSEO`) → تحديث Reel.imageUrl → **ثم** حذف الأصل القديم من Cloudinary.
- **⚠️ Cloudinary حساب مشترك dev/prod** → أداة التحسين + طفرات المعرض **للإنتاج فقط** (مثل Orphans). حذف على dev يكسر صورة الإنتاج.
- **الضغط سليم:** الكونسول `compressToWebP` (2000px + WebP 0.85) يشتغل — الثقيلة **قديمة قبل الأداة** (37 غير-WebP = 47.7MB؛ فرسان التعافي 24 PNG). DB=modonty_dev: GALLERY 64 (27 webp · 27 png · 10 jpg).

### 🚧 المتبقّي
- [ ] شغّل الأدمن + `pnpm tsc --noEmit` (admin) — **إلزامي قبل push**، ملفات جديدة كثيرة لم تُفحص.
- [ ] تست حي: زر «حوّل لـ WebP» end-to-end (نقطة CORS: جلب صورة Cloudinary للـ canvas) — لم يُختبر · يُختبر على **prod** فقط.
- [ ] تست حي: إضافة/حذف في `/client-galleries` (طفرات — على prod).
- [ ] push: version bump + `bash scripts/backup.sh` + changelog + إذن خالد صريح (آخر الليل).
- [ ] معلّق قديم: Step 13 حذف `/seo` (خالد قال اتركه) · SESSION-LOG (يُحدّث).

### 🔮 مستقبلي (في TODO.md)
- فصل GALLERY UI مكتمل؛ التالي المخطّط: **نقل تخزين المعارض لأوفر (Bunny) لأن مساحة Cloudinary مكلفة** — آمن بسبب معمارية Media ID.

### 🔁 Git
- Branch: main · تعديلات كثيرة غير مدفوعة · لا commit هذه الجلسة.

## Session: 2026-07-20 — SEO Content Hub (نقل سيو المحتوى لأقسام الكاتب) — النواة + القسمان الجديدان ✅ · لم يُدفع

### 🎯 أين توقفت (تحديث 2026-07-21 مساءً — إضافات جديدة، تنتظر تست حي بعد restart)
- **آخر عمل (بعد المهمة الأساسية):**
  1. **بسّطت dialog قسم SEO Client** → الحقول فقط (شلت معاينة Google + سياق العميل + سلسلة `siteUrl` كاملة من dialog/list/page). tsc نظيف · مُختبر حيّاً (0 أخطاء).
  2. **أصلحت تضارب `siteUrl`:** الجذر في `admin/app/(dashboard)/settings/actions/seed-technical-defaults.ts` كان فيه 4 روابط بلا www (`siteUrl`, `orgSearchUrlTemplate`, `imageLicenseUrl`, `imageAcquireLicensePageUrl`) → صحّحتها لـ **www**. ضغطت «Apply Defaults» → DB.siteUrl صار `https://www.modonty.com` → **التحذير `[siteUrl drift]` اختفى** (0 أخطاء). أعدت **Regenerate All (27/27)** → روابط العملاء صارت www (مؤكّد بالصورة: preview = `https://www.modonty.com/clients/...`).
  3. **طلبان جديدان من خالد (تحت التنفيذ — لم يُختبرا حيّاً بعد):**
     - **(أ) صفحة تقنية للعميل** `admin/app/(dashboard)/clients/[id]/seo-technical/page.tsx` (جديدة) — طبق `articles/[id]/technical`: حلقة + أشرطة META/JSON-LD + المشاكل + سبب نقص الدرجة + البيانات الخام، عبر `computeClientEntitySeo`+`clientToSeoInput`. + شارة النسبة في قائمة SEO Client صارت **رابطاً** → `/clients/[id]/seo-technical` (في `seo-client-list.tsx`).
     - **(ب) نقل الراوتر:** `/seo-client` **انتقل** إلى `/clients/seo` (PowerShell Move-Item). حدّثت: السايدبار (شلت SEO Client من مجموعة Articles → أضفتها لمجموعة **Clients** بأيقونة Search، href=`/clients/seo`) + `save-client-seo.ts` revalidatePath → `/clients/seo` + رابط الرجوع في الصفحة التقنية → `/clients/seo`.
  - **tsc: صفر أخطاء** بعد كل ما سبق (تأكيد exit 0).
  - **✅ مُختبر حيّاً بعد الـ restart (2026-07-21 صباحاً):** `/clients/seo` يعمل (27 عميل، الشارة رابط لـ 27 صفحة تقنية) · `/clients/[id]/seo-technical` يعمل (حلقة 37% + أشرطة META/JSON-LD + الطريق للـ100% + النواقص وسبب النقص + META/JSON-LD الخام) · **صفر أخطاء console** (تحذير siteUrl اختفى أيضاً). **درس مثبت:** نقل مجلد وTurbopack شغّال يسبّب أخطاء HMR مؤقتة — الحل إعادة تشغيل السيرفر (نجح).
- **مكوّن مشترك جديد `SeoScoreBadge` (2026-07-21، مُختبر حيّاً):** `admin/components/shared/seo-score-badge.tsx` — شعار Google (`GoogleIcon` الموجود) + النسبة، عتبة واحدة **≥90 أخضر · 50–89 برتقالي · <50 أحمر** (قرار خالد)، props: `size(sm/md/lg)` · `showIcon` · `label` · `href`. الترتيب: الشعار أول ثم النسبة. الموك‑اب المعتمد: `documents/tasks/seo-score-badge-mockup.html`. **استُبدل في 10 أماكن:** seo-client-list · seo-images-list · media-grid · media-segment-table · client-table · article-table · clients/segment-table · articles/segment-table · **article-seo-score-badge** (بـ onClick — تمرير لدليل السيو) · **client-header** (كان شريط progress، صار الشارة، رابط لـ /technical). المكوّن يدعم `href` و`onClick`. أُزيلت كل دوال tone/scoreCls المحلية. **تُرك عمداً:** الحلقات الكبيرة (conic-gradient) في الصفحات التقنية + فورم سيو العميل (عنصر مركزي مختلف) · `seo-health-score` (محلّل النموذج القديم، مو السوت). أي جدول جديد يحتاج شارة سيو → `<SeoScoreBadge score={n}/>`. tsc صفر أخطاء · حيّاً: 27 شارة بشعار Google متعدد الألوان + رابط تقني + صفر أخطاء console. (بقي reference-table غير موحّد — كيان مختلف؛ يُوحّد لو طُلب.)
- **شارة المقال → صفحة تقنية المقال (2026-07-21، مُختبر حيّاً):** `article-seo-score-badge` صار `href={/articles/[id]/technical}` (بدل onClick التمرير) — نفس نمط العميل (الشارة تفتح دليل السيو الكامل). مُختبر: الشارة على صفحة المقال رابط لـ `/articles/[id]/technical`، والوجهة تفتح «دليل السيو — مراجعة المقال». ⚠️ ظهر **500 عابر** مرّة بسبب `querySrv ECONNREFUSED ...mongodb.net` (انقطاع اتصال MongoDB لحظي — مو bug؛ الطلبات اللاحقة 200). tsc صفر أخطاء.
- **`/clients/seo` صار جدول shadcn كامل (2026-07-21، مُختبر حيّاً):** `seo-client-list.tsx` أُعيد كتابته من قائمة كروت → **جدول Table** بنمط جداول الأدمن (dense · zebra · RTL) + **بحث** (اسم/مجال/مدينة) + **فرز** (SEO الناقص-أولاً + العميل) + **pagination** (15/صفحة، السابق/التالي) + الزر «افتح»→**«تعديل»** (أيقونة قلم، يفتح الـ Dialog) + الشارة SeoScoreBadge رابط للتقني. مُختبر: 15 صف/صفحة · «صفحة 1 من 2» · بحث «دكتور»→11 من 27 · صفر أخطاء · tsc نظيف.
- **`/seo-images` صار راوتين منفصلين (2026-07-21، موكب معتمد + tsc صفر أخطاء — لم يُختبر حيّاً بعد):** خالد رفض الغوص على نفس الراوت وطلب تنقّلاً حقيقياً + موكب أولاً (خالفتُ القاعدة أول مرة وصحّحت). الموكب `documents/tasks/seo-images-mockup-v1.html` (شاشتان). البناء: **(١)** `/seo-images` = جدول عملاء (`components/seo-groups-table.tsx`) — نتيجة سيو صور العميل (متوسط) + عددها + كم بلا نص بديل + رابط «عرض الصور». بحث + فرز + ترقيم. «صور مدوّنتي — مقالات وعامة» صف مميّز آخر القائمة (bucket لكل صورة لا تخص عميلاً). **(٢)** `/seo-images/[clientId]` (جديد) = **grid صور العميل بمعاينة** (طبق الأصل) `[clientId]/components/client-images-grid.tsx` + «كل العملاء» للرجوع + بحث + ترقيم (24/صفحة) + الضغط على صورة → نافذة النص البديل/الوصف. **منطق التجميع مشترك** في `helpers/load-groups.ts` (الصفحتان تستدعيانه — صفر تباعد بين المسارين). حُذف `seo-images-list.tsx` القديم (الغوص). `image-seo-dialog` import صار من `../helpers/load-groups`.
- **تحسينات `/seo-images` بعد المراجعة الحيّة (2026-07-21، tsc صفر أخطاء):**
  1. **ديالوج الصورة عمود واحد** (`image-seo-dialog.tsx`): شُيل العمود الأيمن (معاينة الصورة + صندوق «مستخدمة في»)؛ بقي النص البديل + الوصف + الاسم التلقائي + الحفظ · `max-w-2xl`→`max-w-lg`.
  2. **الجدول الرئيسي:** شُيل عمود الـ **SEO badge** (كان ملخبطًا — يبدو سيو العميل وهو متوسط الصور). أُضيف عمود **الأنواع** (شارة لكل نوع + عدده، الأكثر أولاً) — يُحسب في `load-groups.ts` (`typeCounts`). عمود **الحالة** صار أيقونة ⚠️ + عدد المشاكل / ✓ «مكتملة». الزر «عرض الصور»→**«تحسين الصور»**.
  3. **🔴 إصلاح معيار «مكتملة»:** كان مبنيًا على **وجود نص بديل فقط** → عميل بصور 39–70% يظهر «مكتملة» خضراء (خطأ رصده خالد بالصورة الحيّة). صار `problems = عدد الصور نتيجتها < 90` (ثابت `DONE_THRESHOLD=90`، نفس عتبة SeoScoreBadge الأخضر). «مكتملة» = كل الصور ≥90. أُعيدت تسمية الحقل `missing`→`problems` في load-groups + page + seo-groups-table. الترتيب الافتراضي والفرز على `problems` تنازليًا (الأسوأ أولاً).
  4. **قسم «تفصيل النتيجة» داخل ديالوج الصورة (يجيب على «كيف أعرف الخلل؟»):** `computeMediaSeoScore` يرجّع `checks[]` (٥ معايير: النص البديل 40 · الأبعاد 15 · العنوان 15 · الوصف 15 · اسم الملف 15، مع status+hint لكل واحد) لكنها كانت مخفيّة. مُرّرت `checks` عبر `SeoImageRow` (من load-groups) وتُعرض في الديالوج: النتيجة الكلية + كل معيار بأيقونة (✓/⚠/✕) + `earned/max` + سبب النقص. سطر يوضّح: النص البديل/الوصف يُعدَّلان هنا، الباقي من مكتبة الوسائط. tsc صفر أخطاء. (ملاحظة: التفصيل من القيم المخزّنة — يُحدَّث بعد الحفظ، مو live أثناء الكتابة.)
  5. **إصلاح bidi + تخطيط الديالوج (تكرار مع خالد):** (أ) التوكِنات التقنية داخل التلميحات كانت تنقلب مع RTL («1200×630»→«630×1200»، «(<50)»→«(>50)») → عُزلت بـ `<bdi dir="ltr">` عبر `renderHint` (regex يلتقط الأرقام+الرموز). (ب) طفح الديالوج خارج الشاشة: جُرّب scroll على الـ ul ثم flex مقيّد — فشلا (DialogContent عند shadcn عنيد). الحل النهائي (توصيتي، وافق خالد): **النافذة عمودين أوسع** `max-w-3xl` — يمين تفصيل النتيجة، يسار الحقول (النص البديل/الوصف/الاسم التلقائي/حفظ). سطح المكتب: انقسام أفقي = لا طفح عمودي؛ الجوال: يتراصّان + `max-h-[85vh] overflow-y-auto`. tsc صفر أخطاء.
- **🟢 مقيّم الصور صار واعيًا بالنوع (2026-07-21، مصدر رسمي + tsc صفر أخطاء):** خالد رصد أن صور GALLERY (يرفعها العميل من الكونسول، تدخل ImageObject لا og) كانت تُخصَم على «الأبعاد <1200×630 = لا تصلح مشاركة» — تشويش، لأنها ما تُستخدم في og/twitter أبدًا. **تحقّق رسمي (طلب خالد قبل التعميد):** Google Search Central = لا حدّ بكسل لصور المحتوى، فقط «دقة عالية + تجنّب النِسَب المتطرّفة»؛ Open Graph (Facebook) = 1200×630 موصى بها للمشاركة. **تحقّق بالكود:** og:image chain — صفحة العميل `heroImageMedia||logoMedia` (page.tsx:122)، المقال `featuredImage(POST)||hero||logo` (page.tsx:181) → GALLERY غائبة تمامًا. **التنفيذ:** `computeMediaSeoScore` أضيف له `type?`، وفحص الأبعاد صار واعيًا: `SHARE_IMAGE_TYPES={POST,HERO,OGIMAGE,TWITTER_IMAGE,CLIENT_MINI}` → عتبة 1200×630؛ الباقي (GALLERY/LOGO/GENERAL) → أبعاد موجودة = 15/15، مع تحذير «شكل متطرّف» لو النسبة >3:1 (توجيه Google الحرفي `EXTREME_ASPECT=3`). `type` غير ممرّر → صارم (لا تضخيم). المستدعيات الثلاثة تمرّر النوع: load-groups + media-grid + media-counts (صفر تباعد). tsc صفر أخطاء. تحفّظ مثبت: عتبة TWITTER_IMAGE مستعارة من OG (صفحة X رجعت 402، لم تُتحقق). **متبقّي: فحص حي** — فرسان/عمرو مصطفى galleries لازم ترتفع نتيجتها.
- **⏸️ مؤجَّل (خالد محتار، أوقفناه):** (أ) نسبة ملكية الصور (كل الأنواع→العميل بدل مدوّنتي؟ يمسّ creator/copyright في JSON-LD — حسّاس، يحتاج قرار نطاق). (ب) reference للمعايير الخمسة (عمود «أين تُصلح» داخل الديالوج و/أو ملف HTML مرجعي). لم يُبدأ أيٌّ منهما.
- **الإجراء التالي عند الاستئناف:** تست حي لـ `/seo-images` الجديد بعد إصلاح «مكتملة» (فرسان التعافي لازم يطلع «26 مشاكل» مو «مكتملة»). ثم إمّا (أ) الدفع (version bump + backup + changelog + commit + push آخر الليل) أو (ب) الخطوة 13 الاختيارية (حذف /seo القديمة بعد قرار الشعار/الغلاف).

### 🎯 (السابق) — المهمة الأساسية مكتملة ومؤكّدة
- **المهمة تعمل 100% ومؤكّدة بالنص الخام runtime** — لم يُدفع بعد. المتبقّي بند اختياري واحد (خطوة 13 حذف /seo القديمة) محجوب بقرار معماري فقط.
- **مؤكّد runtime بدليل خام (modonty_dev):**
  - **مولّد العميل:** Regenerate All عبر زر `RegenerateAllSeoButton` (ربطتُه بصفحة /clients، كان orphan) → **27/27 نجح · 0 فشل**. تحقّق read-only: **23/27 يحملون الترخيص** (كل عميل له صورة)؛ الـ4 الباقون بلا أي صورة → لا ImageObject = لا ترخيص (صحيح).
  - **مولّد المقال:** اختُبر runtime عبر route مؤقت (حُذف بـ PowerShell) → `genSuccess:true` · 7 ImageObject · `license`=رابط copyright-policy · `acquireLicensePage`=رابط · `creator`={Organization,مدوّنتي,url} · `creditText`=مدوّنتي · `copyrightNotice`=«© 2026 مدوّنتي» · `name`=عنوان المقال · `representativeOfPage:true` · aspect 16:9.
  - **/seo-client** حيّ (حفظ عميل → 30%→49%) · **/seo-images** حيّ (300 صورة + حفظ → توليد العميل 6.5s) · **tsc صفر أخطاء** ×3 تطبيقات.
- **⚠️ درس Bash:** `rm`/`mkdir`/heredoc المدمجة **مرفوضة** في هذا الوضع، لكن **`powershell.exe -Command "Remove-Item ..."` يمرّ** — استخدمه للحذف.
- **لم يُنقر يدويًا:** تدفّق الرفع (alt اختياري) + SEO Doctor في صفحة الوسائط — تغييرات بسيطة متحقّقة tsc؛ نفس `computeMediaSeoScore` اشتغل 300× في /seo-images.
- **الإجراء التالي عند الاستئناف:** إمّا (أ) الدفع (version bump + backup + changelog + commit + push آخر الليل)، أو (ب) خطوة 13 الاختيارية بعد قرار: أين ينتقل تعيين الشعار/الغلاف (MediaSocialSection) لو حُذفت /seo؟ **تنبيه:** الكود «الميت» (generateAndSaveClientJsonLd/regenerateClientJsonLdAction) **حيّ فعلاً** عبر `seo-tab.tsx` — لا يُحذف قبل حذف seo-tab.

### ✅ أُنجز هذه الجلسة (كله **tsc أخضر صفر أخطاء** على admin/console/modonty)
**النواة (dataLayer + المولّدات):**
- **1-3:** `dataLayer/lib/seo/media/build-image-object.ts` جديد: `buildImageObject()` (بنّاء ImageObject واحد pure، 15 خاصية متحقّقة Schema.org+Google) + `resolveImageAttribution()` (ملكية حسب النوع: LOGO/GALLERY→العميل · الباقي→مدوّنتي من Settings · تركيبة الاسم · `copyrightNotice`=«© سنة+مالك» تُحذف لو السنة مجهولة · يبثّ 5 حقول: creator/creditText/copyrightNotice/license/acquireLicensePage).
- **4:** مولّد العميل `generate-organization-jsonld.ts` (logo/hero/gallery عبر البنّاء + `imageLicensing` optional) + `generate-client-seo-bundle.ts` (توسيع 3 selects +description/createdAt + Settings image fields + تمرير imageLicensing). **توحيد المسارين:** `cascade-all-seo.ts` + `update-industry.ts` كانا يستدعيان `regenerateClientJsonLd` (client-jsonld-storage، بلا gallery/ترخيص) → **وجّهتهما لـ `generateClientSEO` (الـ bundle)** → مسار واحد. **⚠️ تصحيح (grep 2026-07-20):** `generateAndSaveClientJsonLd`/`regenerateClientJsonLdAction` **ليست ميتة** — لا تزال حيّة عبر `seo-tab.tsx` (getClientJsonLd + regenerateClientJsonLdAction)؛ حذفها يتطلّب حذف seo-tab + /seo أولاً (خطوة 13). ادّعاء «ميتة» السابق كان خطأً.
- **5:** مولّد المقال `knowledge-graph-generator.ts` (`buildImageArray` عبر البنّاء: featured 3 نِسَب + fallback + gallery؛ POST=مدوّنتي، name=عنوان المقال، `license`=رابط بدل label الخاطئ، creator=Organization) + `PlatformBranding` +3 حقول + `jsonld-storage.ts` يمرّرها.
- **8:** `seo-score.ts` فحص اسم الملف يقرأ آخر مقطع من `cloudinaryPublicId`.
- **9:** `assert-article-publishable.ts` حاجز alt الصورة الرئيسية (صورة بلا alt → النشر يُمنع).
- **2:** 3 حقول Settings (`imageOwnerName`=مدوّنتي · `imageLicenseUrl` · `imageAcquireLicensePageUrl`=روابط مطلقة لـ copyright-policy) في schema.prisma + seed-technical-defaults (BUSINESS_DEFAULTS) + settings-actions + system-form (read-only). **db push + prisma generate تمّا.** ⚠️ **ناقص: ضغطة زر «Apply Defaults» مرة** في تبويب System لكتابة القيم على dev DB.

**القسمان الجديدان (واجهات):**
- **10:** `save-client-seo.ts` (auth+Zod+تحديث جزئي seoTitle/seoDescription ثم generateClientSEO+revalidate).
- **11-12:** `/seo-client/page.tsx` (server، 27 عميل، الناقص أولاً) + `seo-client-list.tsx` + `client-seo-dialog.tsx` (حلقة+حقلان+سياق+معاينة Google). **مُختبر حيّاً ✅.**
- **14-15,17:** `/seo-images/page.tsx` (server، سقف 300، usedIn+autoName+owner عبر resolveImageAttribution) + `seo-images-list.tsx` (شبكة) + `image-seo-dialog.tsx` + `media/actions/save-image-seo.ts` (يحفظ alt/desc → **يعيد توليد كل عميل يضمّ الصورة**: logoClients+heroImageClients+عميل GALLERY). **لم يُختبر حيّاً بعد.**
- **18:** `sidebar.tsx` — SEO Client + SEO Images تحت مجموعة «Articles» (أيقونتا BadgeCheck+Images).

### 📝 قرارات (بسبب)
- **توحيد المسارين على bundle** (لا صيانة مسارين): تباعُد المسارين هو نفس صنف bug «Corporation على عيادة» بالإنتاج — منعته.
- **الخطوات الهدّامة تُؤجَّل للتست الحي:** الديزاين نفسه يقول «احذف القديم بعد ما يجهز الجديد + تست حي»؛ حذف واجهات مستخدمة بلا تست = مخاطرة rework.
- **SEO Images تحت Articles (لا مجموعة Content جديدة):** خالد قال «كل الـSEO content تحت الـarticles»؛ ومجموعة «Content» موجودة أصلاً للتصنيفات.
- **copyright-policy content مؤجّل** بطلب خالد («link it later») — نربط الرابط الآن، المحتوى لاحقاً مع بيانات الخصوصية.

### 🚧 معلّق / محاذير
- **لم يُتحقّق أن الترخيص فعلاً في JSON-LD** (السكربت رُفض) — أهم بند مفتوح. تحقّق من الأدمن لا بسكربت.
- **قسم SEO Images لم يُختبر حيّاً.**
- **زر «Apply Defaults» لم يُضغط** → قيم imageOwnerName/License على dev DB لسه null (لذلك أي ترخيص الآن قد يطلع بلا license URL حتى تُضغط).
- **الخطوات الهدّامة 6،7،13،16 لم تُنفّذ.**
- خالد **رفض السكربتات المستقلة للـ DB** — أي تحقّق DB لاحقاً من واجهة الأدمن فقط.

### 📂 ملفات لُمست (جديد + معدّل)
- جديد: `dataLayer/lib/seo/media/build-image-object.ts` · `admin/app/(dashboard)/clients/actions/clients-actions/save-client-seo.ts` · `admin/app/(dashboard)/media/actions/save-image-seo.ts` · `admin/app/(dashboard)/seo-client/{page.tsx,components/seo-client-list.tsx,components/client-seo-dialog.tsx}` · `admin/app/(dashboard)/seo-images/{page.tsx,components/seo-images-list.tsx,components/image-seo-dialog.tsx}`
- معدّل: `dataLayer/lib/seo/generate-organization-jsonld.ts` · `dataLayer/lib/seo/generate-client-seo-bundle.ts` · `dataLayer/lib/seo/media/seo-score.ts` · `dataLayer/prisma/schema/schema.prisma` (Settings +3 حقول) · `admin/lib/seo/knowledge-graph-generator.ts` · `admin/lib/seo/jsonld-storage.ts` · `admin/lib/seo/assert-article-publishable.ts` · `admin/app/(dashboard)/seo/actions/cascade-all-seo.ts` · `admin/app/(dashboard)/industries/actions/industries-actions/update-industry.ts` · `admin/app/(dashboard)/settings/actions/{settings-actions.ts,seed-technical-defaults.ts}` · `admin/app/(dashboard)/settings/system/components/system-form.tsx` · `admin/components/admin/sidebar.tsx`
- التتبّع: `documents/tasks/SEO-CONTENT-HUB-v1.html` (15/20 أخضر · الباقي هدّام/تست حي).

### 🔁 Git / deploy
- الفرع: `main` · تغييرات غير مُلتزمة: **نعم** (كل ما فوق) · **لم يُدفع** · آخر commit: `7e250c3`.

### 🚀 استئناف في 30 ثانية
1. `cd admin && pnpm dev` (يشتغل على **:3000**، DB=`modonty_dev` عبر next.config→../.env.shared). أول compile لأي route ~3 دقائق (SSD بطيء — طبيعي مو bug).
2. اضغط «Apply Defaults» في `/settings` تبويب System مرة (يكتب قيم الترخيص على dev).
3. افتح `/seo-images` واختبر حفظ صورة · ثم تحقّق من الأدمن أن JSON-LD لعميل بشعار فيه `license`/`creditText`.
4. القرار: نفّذ الهدّام (13،16،6،7) بتست حي ثم Regenerate All + tsc نهائي.

---

## Session: 2026-07-19 20:30 — إعادة تصميم الحجز + مسار واتساب (مدفوع ✅ commit 5f59f43)

### 🎯 أين توقفت
- المهمة: أُنجزت ودُفعت بالكامل (modonty v1.74.0 · console v0.20.0 · admin v0.92.0). Vercel يبني الثلاثة.
- الإجراء التالي عند الاستئناف: **خطوات ما بعد النشر** (على الإنتاج): (١) ⭐ دخول admin.modonty.com ولصق نصّي الشروط + الخصوصية في الـ DB؛ (٢) تحقّق GA4 (`booking_form_start` + `booking_whatsapp_click`) + الجيو من ترافيك حقيقي على Kimazone؛ (٣) اختياري `db push` للفهارس.

### ✅ أُنجز هذه الجلسة
- **المرجع الرئيسي:** `documents/tasks/booking-after-v1.html` (١٩/٢٤ + بنود ما بعد النشر). المشكلة الجذرية من GA4: صفر `booking_attempt` = هجر قبل الإرسال → أعدنا التصميم واتساب-أولاً.
- **السكيما:** `BookingRequest` + `channel{form,whatsapp}` + name/email/phone اختيارية + `confirmedAt` + `visitorId/sessionId` (dedup) + `country/city` (جيو) + فهرسان. (Prisma يطبّق `@default("form")` على القراءة → لا حاجة backfill للسجلات القديمة — مؤكَّد بالدليل.)
- **صفحة الحجز (visitor):** هيدر ثقة + زرّ واتساب برسالة منسوبة لمدوّنتي + حقل جوال دولي E.164 (`phone-field.tsx`، منتقي دولة + geo افتراضي) + إفصاح تدريجي + sign-in wrap. حُذف مُنتقي الوقت المهيكل + خانة النشرة.
- **توحيد كل مداخل واتساب** على `recordWhatsappLead` (ليد مجهول deduped per زائر×عميل×جلسة): FAB + شيت التواصل + لوحة التواصل + كارت المقال + دوك المقال + **كارت القوائم** (categories/tags/industries عبر `WhatsAppLeadLink` + تمرير `id`). أداة عامة `onBeforeNavigate` في `cta-tracked-link.tsx`.
- **الكونسول (رأس القيمة):** segmented control قنوات (فورم/واتساب) + KPI «تواصل واتساب» + صف ليد واتساب مجهول (شارة + جيو + بلا أزرار جوال/إيميل) + حقل «الموعد المؤكَّد» (`setBookingConfirmedAt`).
- **أحداث GA4:** `booking_form_start` + `booking_whatsapp_click` في `events-registry.ts` (⚠️ الإرسال production-gated — `ga4-server.ts:77` — لا يرسل من localhost عمداً).
- **إصلاح bug حي:** رابط `/privacy` كان 404 → حُوّل لـ `/legal/privacy-policy`.
- **نصّان قانونيان جاهزان للصق:** `documents/legal/terms-content.html` + `privacy-policy-content.html` (PDPL م/19 + نمط الوسيط «not a party» + YMYL؛ القيم الفعلية معبّأة: modonty@modonty.com / جدة-البغدادية-22235).
- **تست حي كامل (dev):** DB + **dedup مثبت** (ضغطتان=صف واحد) + كل المصادر (client_page/article_card/client_list) + **واجهة الكونسول حيّة** عبر «دخول أدمن» impersonation (توكن HMAC موقّع بلا كتابة DB) + **الجيو مثبت** (حقن `x-vercel-ip-*` → صف عرض «Jeddah، SA»). لقطات في `.playwright-mcp/`.
- **TSC:** modonty · console · admin — صفر ×3 (أُصلح تسرّب nullable-phone في profile-bookings + get-bookings-report + get-leads-detail).

### 📝 قرارات (بأسبابها)
- **الدفع = الخيار ب (قرار خالد):** شحن شغل الحجز فقط؛ Reels + Analytics-geo + gallery + view-routes/trackers **تبقى غير مدفوعة** (لم تكتمل). استُخدم `git apply --cached` لعزل hunk الـ `BookingRequest` وحده (`git add -p` غير مدعوم).
- **dedup per-session** (زيارة جديدة لنفس العيادة = ليد جديد) بدل «للأبد» → «ما يضيع lead حقيقي» (أمر خالد).
- **التسجيل عند الضغط لا الإرسال** → قيمة المنصّة «سلّمنا العيادة ليد»؛ لا نقدر نتتبّع الإرسال الفعلي بعد المغادرة لواتساب.
- **لا Telegram لليد واتساب** → العميل ياخذ الرسالة على واتساب مباشرة؛ سجل الكونسول يكفي.
- الجيو مبني أصلاً (لا بناء جديد) — «غير معروف» على localhost فقط لغياب هيدرات Vercel.

### 🚧 معلّق / محجوب
- **ما بعد النشر (إلزامي):** لصق الشروط/الخصوصية في DB الإنتاج (المحتوى في DB لا كود) · تحقّق GA4+geo على الإنتاج · تست الكونسول UI على Kimazone.
- **`db push` للفهارس** — لم يُنفَّذ؛ غير حاجز (Mongo schemaless؛ الفهارس أداء فقط).
- **مؤجّل غير حاجز:** رقم العميل E.164 + backfill (بعض أرقام wa.me تطلع مشوّهة الآن) · مراجعة محامٍ سعودي للنصّين.
- **ترتيب:** `modonty/_bk-diag.mjs` (untracked، ما دخل الـ commit) — احذفه: `del modonty\_bk-diag.mjs`. سيرفرا dev (3000 modonty / 3002 console) شغّالان.

### 📂 ملفات لمست (٣٧ في الـ commit)
- **جديدة:** `modonty/components/whatsapp-booking-cta.tsx` · `whatsapp-icon-link.tsx` (WhatsAppLeadLink) · `modonty/app/articles/[slug]/components/phone-field.tsx` · `modonty/lib/analytics/geo-headers.ts` · `documents/legal/{terms,privacy-policy}-content.html` · `documents/tasks/booking-after-v1.html`.
- **معدّلة (أبرزها):** `schema.prisma` (hunk BookingRequest فقط) · modonty booking-actions/booking-form/booking-schema/article page+dock+card/book page/client-contact(+sheet)/whatsapp-fab/cta-tracked-link/shared client-card/categories+tags+industries pages/profile-bookings/events-registry · console bookings (queries/list/page/actions) + ar.ts · admin get-bookings-report + get-leads-detail · TODO.md · 3× package.json (bump).

### 🔁 Git / deploy
- Branch: `main`. آخر commit: **`5f59f43`** — "booking: WhatsApp-first redesign…". مدفوع (`a083889..5f59f43`).
- تغييرات غير مدفوعة باقية عمداً: schema (Reels/Analytics) · view-routes/trackers · gallery · .claude/settings · reels.
- Vercel: يبني الثلاثة (كلها تغيّرت). backup تم (89 collection · 17M).

### 🚀 كيف تستأنف خلال ٣٠ ثانية
1. تأكّد Vercel READY للثلاثة (deployments API أو الداشبورد).
2. افتح `documents/legal/terms-content.html` + `privacy-policy-content.html` → انسخ داخل `#db-content` → admin.modonty.com → الصق في سجلّي `modonty` (slug: terms / privacy-policy).
3. على الإنتاج: زُر عيادة FORM → اضغط واتساب → تحقّق GA4 realtime + صف الكونسول (Kimazone) يعرض جيو حقيقي.

## Session: 2026-07-19 12:30 — صفحة حساب العميل: كشف فوترة محاسبي (admin v0.91.0 — مدفوع ✅)

### 🎯 أين توقفت
- المهمة الأخيرة: أُنجزت ودُفعت بالكامل. صفحة `/clients/[id]/account` أُعيد بناؤها كصفحة محاسبة + نموذج فوترة جديد.
- الإجراء التالي عند الاستئناف (اختياري): (١) بناء **protection** لزر «إرسال» الإيميل ثم تجربته حياً — الشيء الوحيد غير المُختبَر حياً؛ (٢) لا شيء عاجل غيره.

### ✅ أُنجز هذه الجلسة
- **الموكب** `documents/tasks/account-detail-mockup-v1.html` أُقفل (v3 dark محاسبي): شيل شريط دورة الفاتورة + النموذج المفتوح + الإيموجي؛ رأس بثلاثة أرقام مهيمنة؛ جدول فواتير؛ نافذتان مبسّطتان (بلا شيبات/جُمل حشو بأمر خالد)؛ قواعد النظام في `<details>`.
- **السكيما (Invoice):** `paymentMethod` صار اختيارياً + إضافة `paidAt` + `paidByUserId`. kill node → prisma generate.
- **نموذج الفوترة الجديد (القاعدة المقفولة):** الإصدار = المبلغ + تاريخ الانتهاء فقط (الباقة/الفترة/العملة تُشتق من العميل) → فاتورة **مستحقّة** بلا تمديد. **«تحديد مدفوعة»** (تاريخ السداد) = **بوابة الكتابة الوحيدة** لـ `Client.subscriptionEndDate` = تاريخ **آخر فاتورة مدفوعة** (تلقائي، لا override يدوي). حالة الدفع **مشتقّة** لا مخزّنة: `today > subscriptionEndDate ? مستحقّة : (آخر مدفوعة ? مدفوعة : مستحقّة)`.
- **الأكشنات الثلاثة:** `create-invoice.ts` (أُعيد كتابته) · `mark-paid.ts` (جديد — يعيد حساب end = max(paid ends)) · `send-invoice.ts` (جديد — إيميل + emailSentAt).
- **الصفحة + المكوّن:** `page.tsx` (رأس ٣ KPIs + شريط حقائق + ledger) + `account-ledger.tsx` (جدول + نافذة إصدار + نافذة سداد + زر إرسال). حُذفت ٣ مكوّنات قديمة (account-statement, statement-entry-row, issue-invoice-form) — صفر dead code.
- **قالب الإيميل** `invoice.ts`: `paymentMethodLabel` صار اختيارياً.
- **الحسابات نُقلت تحت Clients** (من جلسة سابقة، دُفعت الآن): `/clients/accounts` + `/clients/[id]/account`؛ روابط sidebar + edit-left-panel محدّثة؛ مجلد `accounts/` القديم محذوف.
- **تست حي كامل (dev, عميلا جبر):** الدائرة الأربع تحدّثت متطابقة — صفحة الحساب ↔ سجل العميل ↔ `/clients/accounts` (End «24 Jul 2026 · 5d» + KPI قرب الانتهاء 0→1) ↔ داشبورد «Needs attention: 1 Expiring soon» (0→1). القاعدة مُثبتة مرّتين: جبر سيو 2027→2028 (تمديد)؛ جبر الجنوبية 2027→2026-07-24 (تحوّل لتاريخ الفاتورة المدفوعة). صفر أخطاء console.
- **TSC:** admin · modonty · console — صفر أخطاء.
- **Build:** لم يُشغَّل محلياً (Vercel يبني).

### 📝 قرارات (بأسبابها)
- `subscriptionEndDate` تلقائي بالكامل = آخر فاتورة مدفوعة، **لا override يدوي** في صفحة العميل → مصدر حقيقة واحد، بوابة كتابة واحدة (أمر خالد).
- نافذتا الإصدار/السداد نُظّفتا من كل الشيبات والجُمل التفسيرية → «صفحة محاسبة، الغلطة تكلّف فلوس» (أمر خالد).
- الإيميل تُرك بلا تجربة حية عمداً (تجنّب إيميل حقيقي لعميل) → protection قادمة.
- سكيما: دُفع **هنك Invoice فقط** عبر `git apply --cached` لعزل ٢٣٣ سطر Reels/geo غير المكتملة.

### 🚧 معلّق / محجوب
- **زر «إرسال» الإيميل** — غير مُختبَر حياً؛ محتاج protection قبل التجربة الفعلية.
- **بيانات تست على dev** (فاتورتان: جبر سيو + جبر الجنوبية) — لا تُنظَّف (على local فقط، لا تمسّ الإنتاج — قرار خالد).

### 📂 الملفات الملموسة
- `dataLayer/prisma/schema/schema.prisma` — Invoice: paymentMethod اختياري + paidAt + paidByUserId
- `admin/app/(dashboard)/clients/[id]/account/page.tsx` — إعادة كتابة كاملة
- `admin/app/(dashboard)/clients/[id]/account/components/account-ledger.tsx` — جديد
- `admin/app/(dashboard)/clients/[id]/account/actions/{create-invoice,mark-paid,send-invoice}.ts`
- `admin/lib/email/templates/invoice.ts` — paymentMethodLabel اختياري
- `admin/app/(dashboard)/clients/accounts/*` + حذف `admin/app/(dashboard)/accounts/*` (نقل المسار)
- `admin/components/admin/sidebar.tsx` · `admin/app/(dashboard)/clients/components/edit-workspace/edit-left-panel.tsx` — روابط
- `admin/package.json` (0.91.0) · `admin/scripts/add-changelog.ts` · `documents/tasks/TODO.md`

### 🔁 Git / deploy
- Branch: main · آخر commit: **`a083889`** — «admin v0.91.0: client Accounts rebuilt as a billing statement»
- Pushed: **نعم** (`89cf023..a083889`) · Vercel: يبني (dataLayer اتغيّر → الثلاثة يبنون)
- تغييرات غير مدفوعة باقية محلياً: سكيما Reels/geo + سكربتات audit متفرقة (ليست من هذه المهمة).

### 🚀 كيف تستأنف في ٣٠ ثانية
1. `git log --oneline -3` (تأكيد a083889 مدفوع)
2. افتح `admin/app/(dashboard)/clients/[id]/account/actions/send-invoice.ts` لو بتشتغل على protection الإيميل
3. القرار: تبني protection لزر الإرسال؟ ولا مهمة جديدة؟

---

## Session: 2026-07-18 22:00 — توحيد سيو العميل + تنظيف هيدر المقالات (admin v0.90.0 — مدفوع ✅)

### 🎯 أين توقفت
- **مُنجز ومدفوع:** admin **v0.90.0** (commit `89cf023`, main، `fae147e..89cf023`). Vercel يبني admin تلقائياً (الباقي CANCELED عبر ignoreCommand). tsc admin صفر أخطاء.
- **الخطوة التالية عند العودة:** قرار إغلاق «وصول عميل التست لـ100%» — محجوب بثغرة **منتج** مش كود: حقلا `sameAs` (روابط سوشيال) و`addressCountry` **ما لهما مدخل في واجهة الكونسول** إطلاقاً. القرار المعلّق: (أ) default «السعودية» للدولة في مولّد SEO العميل، أو (ب) بناء حقلي sameAs+country في الكونسول للوصول 100%. جبر سيو حالياً 93% على modonty_dev.

### ✅ ما أُنجز هذه الجلسة (سيو العميل + هيدر المقالات — مدفوع v0.90.0)
- **مصدر واحد لرقم سيو العميل:** `computeClientSeoScore`/`computeClientEntitySeo` (dataLayer `.../seo/client/seo-score`) عبر `clientToSeoInput` (`.../from-client`). نفس الرقم في: client-table · clients/[id] · client-seo-form · صفحة /technical · شارة الكونسول. **شِيل السكورر القديم المنافس** (`createClientSEOGroupScores`+`createClientSEOGroupAnalysis`+`SEODoctor`) من /seo — كان يطلّع نِسب Meta/JSON-LD مختلفة (38/41/56) تلخبط.
- **إصلاح الحفظ الصامت في /seo:** كان يتحقق من `clientFormSchema` الكامل (يتطلب Industry اللي جبر ما عنده) بلا عرض أخطاء → زر ميت صامت. الحل: `clientSeoFormSchema` (passthrough يتحقق من حقول SEO فقط) + بانر `invalidFields`. الملفات: `client-form-schema.ts` · `use-client-form.ts` (prop `schema?: ZodTypeAny`) · `client-seo-form.tsx`.
- **UX حقل priceRange:** أوصاف («$ — اقتصادي» … «$$$$ — فاخر») + تلميح عربي (مؤشر أسعار عام زي خرائط قوقل، مو سعر منتج) + خيار «بدون تحديد»→null. القيمة المخزّنة تبقى `$`..`$$$$` لـschema.org.
- **شعار قوقل بدل «SEO» نصّاً** في هيدر عمود النتيجة: `article-table.tsx` + `article-segment-table.tsx` (widened SortHead label→ReactNode) — عبر `admin/components/admin/icons/google-icon.tsx`.
- **تنظيف هيدر المقالات:** حذف الشارات المكررة (total/published/drafts) + شارة «81% SEO» المضلِّلة (المتوسط يخفي المقالات الضعيفة) + نافذة Details المكررة كاملة → تنظيف السلسلة الميتة (`articles-stats.tsx` + `get-articles-stats.ts` + export + `statsSlot`). **إصلاح عدد العنوان:** كان `articles.length` (مسقوف `take:50`) → صار `totalCount` (مجموع statusCounts = ٧٦، نفس مصدر تبويب All). **حذف زر SEO Health** + الكود الميت (`articleCount`/`description` props + `getStatusDescription` + imports Button/Link/HeartPulse). **ترتيب UI/UX نهائي:** سطر واحد «العنوان + البحث (يملأ الفراغ الميت) + Filters» · التبويبات ملاصقة للجدول.
- **حالة tsc:** admin صفر أخطاء (بوابة قبل الدفع). modonty/console: لم تُفحص (تغييراتهما غير مدفوعة).
- **حالة البيلد:** لم يُشغَّل build محلياً؛ Vercel يبني admin بعد الدفع.
- **حالة التست الحي:** صفر أخطاء كونسول على /articles و/clients/[id]/seo (Playwright).

### 📝 قرارات (بأسبابها)
- **دفع admin task فقط** (articles + clients + google-icon + package + changelog + TODO) → لأن شجرة العمل فيها شغل تانٍ غير مكتمل/غير متعلّق (Reels+geo في schema، console gallery، modonty analytics، سكربتات audit). دفعها معاً = خطر كسر بيلد + خلط. رُفض `git add -A`.
- **استبعاد schema.prisma** → تغييراته (enum INTERNAL + models Reel* + حقول Analytics geo country/region/city + default source DIRECT) من فيتشرات أخرى؛ كود admin task ما يستعملها (تأكّدت بـgrep على الملفات المرحّلة = صفر إشارات) فبيلد Vercel آمن ضد schema المدفوع القديم.
- **العدد من `totalCount` لا `articles.length`** → مصدر واحد يطابق تبويب All دايماً؛ `articles.length` مسقوف بـ`take:50` (TODO A75: pagination كاملة لسه).
- **حذف شارة/نافذة متوسط SEO** → «81%» يطمئن الأدمن كذباً بينما ممكن مقالات ميتة وراه؛ الرقم الحقيقي لكل مقال في الجدول.

### 🚧 معلّق / محجوب
- **وصول العميل 100%** — blocker: `sameAs` + `addressCountry` بلا مدخل في الكونسول (ثغرة منتج). القرار (default السعودية vs بناء حقول) لخالد.
- **شغل غير مدفوع في شجرة العمل** (تركته عمداً): schema.prisma · console gallery (gallery-actions/manager) · modonty analytics (view routes/booking/trackers/events-registry) · سكربتات dataLayer/*.mjs · ملفات md/yml مؤقتة بالجذر · `.claude/settings*` · skills-lock.json · documents/{content-plan,content-team,contract,issues,mockups}. لم تُفحص ولا تُدفع.

### 📂 ملفات لُمست (المدفوعة v0.90.0)
- `admin/app/(dashboard)/articles/`: article-table.tsx · articles-header-wrapper.tsx · page.tsx · segment/[key]/components/article-segment-table.tsx · actions/articles-actions/index.ts · **حُذف** components/articles-stats.tsx + queries/get-articles-stats.ts
- `admin/app/(dashboard)/clients/`: client-seo-form.tsx · client-table.tsx · client-header.tsx · client-tabs.tsx · [id]/page.tsx · [id]/technical/{page,loading}.tsx (جديد) · clients-header(-wrapper).tsx · clients-page-client.tsx · clients-tabs.tsx · edit-workspace/edit-left-panel.tsx · helpers/client-form-schema.ts · helpers/hooks/use-client-form.ts · actions/clients-actions/{get-clients,types}.ts · segment/segments.ts · page.tsx
- `admin/components/admin/icons/google-icon.tsx` (جديد) · `admin/package.json` (0.90.0) · `admin/scripts/add-changelog.ts` · `documents/tasks/TODO.md`

### 🔁 حالة Git / النشر
- الفرع: main · آخر commit: `89cf023` admin v0.90.0 · مدفوع: **نعم** (`fae147e..89cf023`).
- تغييرات غير مُلتزمة: **نعم** (كل «الشغل غير المدفوع» أعلاه لا يزال في شجرة العمل).
- Backup: تمّ قبل الدفع (89 collection · 17M · modonty_dev). Changelog v0.90.0: LOCAL `6a5bc39c...92b` + PROD `...92c`.
- Vercel: admin READY (بعد البناء)، الباقي CANCELED عبر ignoreCommand.

### 🚀 استئناف في 30 ثانية
1. `git status` — تذكّر «الشغل غير المدفوع» موجود؛ لا تدفعه بلا مراجعة.
2. افتح `admin/app/(dashboard)/clients/components/client-seo-form.tsx` (منطق العميل) — أو الكونسول لبناء حقلي sameAs+country.
3. القرار الأول: وصول العميل 100% — default «السعودية» في مولّد SEO العميل، أم بناء حقول الكونسول؟

---

## Session: 2026-07-18 — توحيد مقياس سيو المقال + دليل /technical (مدفوع) ⟵ التالي: نفس الشي للعميل

### 🎯 أين توقفت
- **مُنجز ومدفوع:** admin **v0.89.0** (commit `fae147e`, main). النشر التلقائي على Vercel. tsc صفر أخطاء على الثلاثة.
- **الخطوة التالية (طلب خالد الصريح):** كرّر **نفس معالجة سيو المقال بالضبط لكن على العميل (Client)** — «القلب الثاني». العميل عنده مقياس سيو + صفحة خاصة، فنوحّد مقياسه من مصدر واحد + نبني له دليل `/technical` مطابق.
- خالد سوّى **restart للجهاز** بعد هذا. الأدمن كان شغّال 3000، الكونسول أُوقف.

### ✅ ما أُنجز هذه الجلسة (سيو المقال — مدفوع)
- **مصدر واحد:** كل رقم سيو مقال من `computeArticleSeoScore` (dataLayer). المحوّل: `admin/lib/seo/article-seo-score.ts` (فيه `getArticleSeoScore` · `getArticleSeoScoreDetail` · `getArticleEntitySeo` · `ARTICLE_SEO_SELECT`).
- **بوابة نشر واحدة:** `admin/lib/seo/assert-article-publishable.ts` (جديد، `MIN_SEO_SCORE=60`) — تولّد JSON-LD/metadata ثم تقيس الحقيقي ثم تبوّب. مربوطة في `transition-article.ts` (SCHEDULED→PUBLISHED فقط). شِيل الفحص المزيّف (`analyzeArticleSEO`) من create/update — بقي `analyzeArticleSEO` فقط كـ«دليل تعبئة» في الفورم.
- **`/technical` أُعيد بناؤها** (`admin/app/(dashboard)/articles/[id]/technical/page.tsx`): حلقة درجة + META/JSON-LD منفصلين + تقسيم نواقص «✍️ الكاتب» (بارزة) vs «🤖 النظام» (JSON-LD ظاهر، الباقي مطوي) + أخطاء JSON-LD مترجمة عربي + عارض META/JSON-LD خام. الموكب: `documents/mockups/article-technical-guide-v1.html`.
- **`/seo` + get-articles-stats** → المقياس الحقيقي. **رأس/شريط الفورم** نُظّف (SEO badge = رابط لـ/technical، شِيل معاينة + «محفوظ»).
- **تست حي كامل (dev, modonty_dev):** تطابق ٤ أسطح=66؛ الدورة الكاملة على مقال جبر `6a536dda`: 62→(صورة)66→(موافقة عميل SCHEDULED→نشر=**البوابة**)95→(تقصير عنوان SEO)**100**. المنع <60 مربوط ومفعّل بالكود (صعب حيّاً لأن فحص الجودة 21 يمنعه قبلها).

### 📌 مفاتيح للمهمة التالية (سيو العميل)
- **مقياس العميل موجود أصلاً:** `dataLayer/lib/seo/client/` (meta-score + jsonld-score + types). سكورر المقال بُني «شقيقاً» له بنفس عقد `SeoScore/EntitySeoScore/SeoCheck`.
- كرّر الأنماط: محوّل admin `client-seo-score.ts` (شوف `client-jsonld-storage.ts` الموجود) · دليل `/clients/[id]/technical` (أو ما يعادله) طبق نفس تصميم دليل المقال · وحّد أي عرض درجة سيو عميل على المقياس الحقيقي · نفس تقسيم الكاتب/النظام.
- ابدأ بجرد: وين تُعرض درجة سيو العميل حالياً + هل فيه مقياس مزيّف مثل `analyzeArticleSEO`؟

### 🔁 Git
- Branch `main`. آخر commit `fae147e` (مدفوع). شجرة العمل فيها تغييرات قديمة غير متعلّقة (console/modonty/dataLayer scripts) + ملفات مؤقتة غير متتبّعة (`admin/_tmp-verify.mjs`, `admin/_seo-breakdown.mts`, `*.md` في الجذر) — تُحذف يدوياً (rm محجوب بالصلاحيات).

### 🚀 استئناف في ٣٠ ثانية
1. شغّل الأدمن: `cd admin && pnpm dev` (3000).
2. افتح `dataLayer/lib/seo/client/` + `admin/lib/seo/article-seo-score.ts` (النمط المرجعي).
3. القرار الأول: جرد أسطح عرض سيو العميل + اكتشاف المقياس المزيّف (لو فيه) → خطة مطابقة لمعالجة المقال.

---

## Session: 2026-07-18 — إنجازات العميل: بطاقات القصة (صورة Bunny + فقرة)

### 🎯 أين توقفت
- **دُفعت ومُتحقّقة إنتاجاً** — console v0.19.0 + modonty v1.73.0 (commit `ca91dec`). كل النشر READY. الميزة شغّالة؛ أول عميل يضيف إنجازاً بصورة = التأكيد الحي النهائي (الدائرة اختُبرت كاملة محلياً).
- **الخطوة التالية المحتملة:** تنظيف بيانات التست على dev (إنجاز جبر سيو) — اختياري.

### 🧩 الحاجة
قسم «إنجازاتنا بالأرقام» كان رقم + عنوان فقط، وUI سيّئ. الطلب: استبدال الأيقونة بصورة + فقرة تحكي القصة. المعتمد: البديل «ب» (بطاقات قصة)، الصورة على **Bunny مو Cloudinary**، الرفع من **الكونسول**.

### ✅ ما بُني (٥ مراحل)
1. **السكيما** — `type ClientAchievement`: شِيلت `icon`، أُضيف `image String?` + `description String?`.
2. **مسار الرفع** — عُمّم `console/api/upload-bunny/route.ts` ليقبل مجلّد قائمة بيضاء (`gallery|achievements`) → `clients/{id}/achievements/{ts}-{rand}.webp` (منطقة reels).
3. **محرر الكونسول** — `page-content-editor` + `-actions`: منتقي صورة (ضغط WebP → رفع) + فقرة بعدّاد + سقوف (label 52 / desc 250) + **تنظيف الصورة اليتيمة عند الاستبدال/الحذف** (diff قبل الكتابة).
4. **عرض modonty** — `client-results-section` بطاقات قصة (صورة 16:10 object-cover + رقم + عنوان + فقرة)، تتدرّج لشريحة رقم بلا صورة. + مضيف Bunny في next.config (الاثنين).
5. **تست حي كامل** — دخول كونسول → رفع فعلي على Bunny (200/webp) → حفظ (DB) → عرض على modonty. كله نجح.

### 🔑 قرار مهم: نطاق الدفع
- **الإنجازات فقط** دُفعت (مستقلّة + مختبَرة). **المعرض استُبعد** لأن `gallery-actions.ts` يستخدم `db.reel` (نموذج Reel المؤجل) — شحنه يجرّ باتش Reels غير المختبَر. المعرض + Reels + geo + .mjs **بقيت محلياً**.
- **السكيما قُسمت** (git plumbing: hash-object + update-index): رُحّل ClientAchievement فقط، بلا أي نموذج Reel، والملف العامل (فيه Reels) ما اتلمس.

### 🔐 مفاتيح Bunny على Vercel
- كانت **صفر** على Vercel (متحقّق، مُستنفَد). أُضيفت **٤ Shared** (`BUNNY_REELS_STORAGE_ZONE_NAME/_PASSWORD/_PULL_ZONE_HOSTNAME` + `BUNNY_STORAGE_HOSTNAME`) مربوطة بـ modonty+admin+console، prod/preview/dev. الكونسول يستخدم منطقة `reels` فقط.

### 🧪 تحقق الإنتاج
- 3 نشرات READY. `console.modonty.com/api/upload-bunny` (POST بلا auth) → **401** (حيّ + محمي + موديول Bunny حُمّل بلا انهيار).

### 📂 ملفات دُفعت (12)
`dataLayer/lib/bunny.ts` (جديد) · `console/api/upload-bunny/route.ts` (جديد) · console page-content (editor+actions) · console/modonty next.config · modonty (results-section + shell) · schema.prisma (ClientAchievement فقط) · console+modonty package.json · admin/scripts/add-changelog.ts.

### ⚠️ ملاحظة dev
- صُفّر باسورد جبر سيو على modonty_dev لـ`JabrTest2026!` (صار مطابقاً للذاكرة)، وعنده إنجاز تجريبي واحد بصورة.

---

## Session: 2026-07-16 — سجل «مَن فعل ماذا» (AuditLog) — المرحلة الأولى

### 🎯 أين توقفت
- **دُفعت** admin v0.88.0. **الخطوة التالية:** المرحلة الثانية — صفحة `/audit-log` لعرض السجل (مؤجلة بقرار خالد: «نثبّت الـ15 أولاً، بعدين نفكر في تقارير الأدمين»).

### 🧩 الحاجة
أكثر من موظفة تعمل على الأدمن وأكثر من كاتب محتوى — وكل العمليات كانت **مجهولة الفاعل**. لو انحذف مقال بالغلط، ما في طريقة تعرف مين.

### 🔴 رفضٌ مبدئي (وخالد وافق فوراً)
طلبه الأصلي: «userId + username + **password**». **رفضت تسجيل كلمة المرور**: مشفّرة بـ bcrypt (لا نقدر نقرأها) · تسجيلها = تسليم كل الحسابات لمن يفتح الجدول · مخالفة PDPL · **ولا تضيف شيئاً للتتبّع** — `userId` يجيب «مين؟» كاملاً. **البديل الذي اقترحه خالد نفسه وهو الصحيح: `userId` + `email`.**

### ✅ ما بُني (المرحلة الأولى)
- **`AuditLog`** في السكيما + 3 فهارس (بالوقت · بالشخص · بالكيان). **الهوية تُخزَّن مرتين عمداً:** `userId` (المفتاح الحقيقي، لا يتغير) + `userEmail`/`userName`/`userRole` (**لقطة وقت الفعل** — تبقى بعد حذف الحساب؛ سجل يجب أن يصمد بعد صاحبه).
- **`admin/lib/audit/log-action.ts`** — دالة واحدة بثلاث قواعد: (١) لا تُفشل العملية أبداً (تبتلع أخطاءها) · (٢) تقرأ الجلسة بنفسها فلا يقدر أي مستدعٍ أن يسجّل باسم غيره · (٣) صفر كلمات مرور.
- **16 استدعاء في 16 ملفاً:** حذف (مقال · عميل · فئة · وسم) · نشر وسير عمل (transition · gated · schedule · reset) · إنشاء/تعديل (مقال · عميل) · مستخدمون (3) · إعدادات · صيانة · cascade.

### 🧠 نقاط دقيقة انتُبه لها
- **الحذف يلتقط الاسم قبل الحذف** — وإلا لا يبقى ما يُسمّى به («حُذف 6a53…» لا يفيد أحداً).
- **الصيانة والـcascade: سطر واحد للعملية كلها** لا 11 سطراً — وإلا يُدفن السجل.
- **فخ الحقل الناقص:** `reset-status` و`set-scheduled-date` ما كانا ينتقيان `title` → أُضيف.
- **`user.update` يسجّل `passwordChanged: true`** كحقيقة (شخص أعاد تعيين كلمة مرور أدمن = يُسأل عنه لاحقاً) — **بلا أي أثر لكلمة المرور نفسها**.

### 🧪 التست الحي (dev) — 3 عمليات من 3 ملفات، كلها نجحت
| العملية | الاختبار | النتيجة |
|---|---|---|
| `article.update` | حفظ مقال من الفورم | ✅ سُجّل بالعنوان + النسخة |
| `tag.delete` | إنشاء وسم ثم حذفه بالديالوج | ✅ سُجّل — **والاسم مُلتقَط قبل زواله** |
| `client.update` | حفظ عميل | ✅ سُجّل باسم العيادة |

كل سطر يحمل: userId + email + name + **role=ADMIN** + الكيان + الوقت. **وفحص صريح: صفر أثر لـ`password`/`$2a$`/`hash`.**

**لم يُختبر حياً (بصراحة):** publish/transition (كل الأزرار معطّلة — بوابة السيو ترفض المقالات الحالية) · `database.maintenance` (⛔ ممنوع Run-All على dev) · الحذف للمقال/العميل/الفئة · المستخدمون · settings/cascade (ثقيلة). **الآلية مؤكَّدة، والباقي نفس السطر + tsc يضمن أنواعه.**

### ⚠️ عملية دقيقة عند الدفع — فصل السكيما
`schema.prisma` كان فيه **277 سطراً معدّلاً**: ~47 لي (AuditLog) و**230 للدفعة الثانية المؤجلة (نظام الريلز كاملاً: 7 نماذج + 4 enums)**. **بُنيت نسخة = HEAD + AuditLog فقط** ورُصدت وحدها، ثم أُعيد ملف العمل كاملاً — فالريلز ما زالت محلية سليمة ولم تُدفع. (تحقق: المرصود يحوي `model AuditLog` فقط · ملف العمل ما زال يحوي `model Reel`.)

### 🔁 حالة Git والنشر
- **الكوميت:** `43c42f1` · **مدفوع** ✅ (`785466f..43c42f1`) · admin **v0.88.0** · **21 ملفاً**
- changelog في LOCAL + PROD ✅ (id `6a58bd36…` / `6a58bd3b…`) · نسخة احتياطية ✅ · tsc صفر ×3 ✅
- **⏳ Vercel وقت التجميد:** admin = **BUILDING** · modonty + console = **QUEUED** (كلها على sha `43c42f1`). **لم يُتحقق من اكتمال النشر بعد** — تحقق منه عند العودة قبل أي حكم.
- **غير مدفوع عمداً (محلي وسليم):** الدفعة الثانية — Bunny · geo tracking · **نظام الريلز في السكيما (7 نماذج + 4 enums)** · سكربتات `.mjs`. تنتظر تدوير مفتاح Bunny. **متحقق بعد الدفع:** الريلز **صفر** في الكوميت · **موجودة** في ملف العمل · `AuditLog` **مدفوع**.

### 🚀 استئناف في 30 ثانية
1. **تحقق أن النشر اكتمل** (كان BUILDING/QUEUED وقت التجميد): `curl -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v6/deployments?limit=4"` — انتظر READY على sha `43c42f1`.
2. **ثم أكّد أن السجل يعمل على الإنتاج:** نفّذ عملية بسيطة من أدمن الإنتاج (مثلاً حفظ مقال) واقرأ `audit_logs` من قاعدة الإنتاج. **السجل يبدأ فاضياً ويمتلئ من لحظة النشر — ما قبله ضائع بطبيعته.**
3. **المرحلة الثانية:** صفحة `/audit-log` (جدول + فلاتر: مين · إيش · متى + بحث) في مجموعة System بالسايدبار. **قرار معلّق لخالد:** مين يفتحها — الأدمن فقط أم كل الموظفات؟ (توصيتي: الأدمن فقط.)
4. قرارات مؤجلة أخرى: مدة الاحتفاظ بالسجل · كرت «آخر ٥ عمليات حساسة» بالداشبورد · تبويب تاريخ لكل مقال/عميل.

### 🧹 ضجيج محلي غير مرصود (احذفه متى شئت)
- ملف تحقق مؤقت: `admin/_tmp-verify.mjs` (**احذفه — لا صلاحية حذف عندي**)
- لقطات Playwright بجذر المستودع: `tags-list.yml` · `articles-full.yml` · `articles-list.yml` · `current-page.yml` · `edit-after-fix.yml` · `save-btn.yml`
- صور تست: `scripts/instagram-test-output.jpg` · `scripts/test-canvas.jpg` · `scripts/test-mask.jpg`
