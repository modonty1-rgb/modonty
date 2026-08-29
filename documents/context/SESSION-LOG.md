# Session Context — Last Updated: 2026-08-28

> ⚙️ **ملف نشط = آخر أسبوع فقط** (يتوزّع أسبوعياً لتوفير الـ token عند القراءة).
> الأرشيف الكامل بالأشهر:
> - 🗄️ [أغسطس 2026](./SESSION-LOG-2026-08.md)
> - 🗄️ [يوليو 2026](./SESSION-LOG-2026-07.md)
> - 🗄️ [يونيو 2026](./SESSION-LOG-2026-06.md)
> - 🗄️ [ما قبل يونيو 2026](./SESSION-LOG-archive-until-2026-06-01.md)
>
> 🔄 **تدوير تلقائي أسبوعي** (كلود يسوّيه بنفسه كل جلسة، بلا طلب): أي بلوك `## Session: 2026-08-28 — 🔒 **جرد الهارد كود صار تبويباً حيّاً على اللوحة** · 🏷️ **اسم الماركة خرج من الكود إلى القاعدة لأوّل مرّة** · ✅ **٦ بطاقات سيو أُغلقت** (فرع `modonty-ui` · `01f37a3` **مدفوع ٠/٠** · **٧٣ ملفاً غير مثبَّت — كل شغل اليوم غير مدفوع**)

### 🎯 أين توقفت
- **المهمّة الجارية:** المرحلة ٣ من خطّة الهارد كود (٢٠٨ قيمة في ٩٥ ملفّ واجهة) — **لم تبدأ**، تنتظر أمرك.
- **الفعل التالي عند الاستئناف:** اكتب **«تحقّق»** ليُشغَّل `tsc` على الثلاثة بعد آخر أربعة تعديلات (لم يُشغَّل بعدها)، ثم قرار الدفع.

### ✅ المنجز في هذه الجلسة

**أ · ست بطاقات سيو أُغلقت — أربعٌ سقطت بالقياس، وواحدة عطلٌ حقيقي أُصلح**

| البطاقة | الحصيلة |
|---|---|
| `SEOFAQ` | **عطل حقيقي أُصلح.** `accordion.tsx:103` كان `return null` — الإجابة **محذوفة من الـDOM** لا مخفيّة، والصفحة تشحن `FAQPage` يسمّيها. جوجل: «Don't mark up content that is not visible to readers». |
| `SEOMETATAGS-DEAD` | سقطت — الوضع تغيّر بعد كتابتها: `build-metadata-from-page-row.ts:63` يقرأ `nextjsMetadata` فعلاً، و`content-page-seo-generator.ts:4` يكتبه، و**١١ من ١١** صفّاً مملوء. |
| `SLUG-ARABIC-QMARK` | سقطت — «؟» العربية (`U+061F`) تُشفَّر مثل الألف، وليست `?` الإنجليزية. القياس: `HTTP 200` · canonical مطابق · ١٥ «؟» في الخريطة بلا كسر. |
| `PUBDATE-BACKFILL-13` | سقطت — الكود يبصم التاريخ في الأبواب الثلاثة، والصفوف على `modonty_dev` **بيانات تجربة تُمحى** بأوّل مزامنة (`sync-local-from-prod`). |
| `SEOADM-APPLY-DEFAULTS-OVERWRITE` | سقطت — الخطر يفترض محرّراً غير موجود: الاثنا عشر حقلاً في `system-form.tsx:39-52` **جدول عرض بلا حقل إدخال**. |
| `BRAND-PROD-APPLY` | **بطاقة جديدة** (🏁 قبل الدمج) — الاسم على الإنتاج بيد خالد بعد الدمج. |

**ب · تبويب «🔒 هارد كود» — جرد آليّ مقيس على القاعدة لا على قائمة مكتوبة بيد**

`documents/tasks/scan-hardcoded.mjs` يقرأ صفّ `Settings` بأعمدته الـ١٦٤، يأخذ ٥٨ قيمة نصّية مميّزة، ويبحث عن كل واحدة حرفياً في ١٬٠٩١ ملفّ `.ts/.tsx`. **أي عمود يُضاف غداً يدخل الجرد وحده.** يلتقط شكلين: قيمة مطابقة · احتياط بعد `||`.

```
الشغل: 236 قيمة في 103 ملفاً   (الخام 321 — الفرق لغة تنسيق أرقام، ليست بيانات)
    7  المرحلة ٢ — ما يصل جوجل        5 ملفاً    ← كانت 15، أُنجز 95٪
  208  المرحلة ٣ — ما يراه الزائر    95 ملفاً    ← لم تبدأ
   21  المرحلة ٤ — البريد والفريق     3 ملفاً    ← لم تبدأ
```

**ج · الاحتياطات سقطت إلى صفر** — الصنف الأخطر، لأن `settings?.x || "قيمة"` يجعل فراغ العمود **لا يُكتشف أبداً**:

```
احتياط بعد ||   20 → 0   في 8 ملفات
generate-client-seo-bundle.ts · generate-organization-jsonld.ts · lib/seo/index.ts
get-article-defaults-from-settings.ts · get-page-seo-defaults.ts
build-content-page-metadata.ts · build-listing-page-metadata.ts · build-metadata-from-page-row.ts
```

**د · اسم الماركة خرج من الكود إلى القاعدة — أوّل مرّة**

```
schema.prisma      + alternateName   (prisma:generate ✅ بعد إيقاف السيرفرات)
Settings (dev)     siteName "Modonty" → "مدونتي"  ·  alternateName = "Modonty"
organization-jsonld.ts   BRAND_AR/BRAND_EN → القاعدة

القياس الحيّ /trust  HTTP 200:
  Organization  name: "مدونتي"  alternateName: "Modonty"
```

**هـ · اللوحة نُظِّفت بثلاث خطوات بأمر خالد**
- **تبويب «لا شغل فيها» أُلغي** — ثلاث بطاقات نُقلت إلى `TECH-NOTES.md` و`SEO-ADMIN-RAW-SCAN.md` (٣٥ ألف محرف)، و**٣٨ بطاقة** أُعيد توجيه مرجعها.
- **تبويب «تقارير» أُلغي** — جرد hreflang قديم (يصف `build-alternates.ts` وقد حُذف الملفّ) نُقل إلى `TECH-NOTES.md`.
- **خمس بطاقات مؤجَّلة أُغلقت** بأسبابها (`13` · `25` · `SEO52` · `GEOAEO` · `SEOAGENT-READY`).

```
اللوحة الآن:  ① قرارك 4  ·  ② دوري 1  ·  🔒 هارد كود 236  ·  ✅ خلص 111
```

### 📝 القرارات وأسبابها

- **اسم الموقع = «مدونتي» عربياً + `Modonty` كـ`alternateName`** → جوجل تنصّ: «Make sure whatever you use as the site name in structured data is consistent with how you refer to your site in other sources on your home page». والمقيس: «مدونتي» **٢٣ مرّة** في النصّ المرئي على الرئيسية، و`Modonty` **صفر** — بينما البيانات المنظَّمة كانت تقول `Modonty`. ورُفض `مُدَوَّنَتِي` **للبيانات وحدها** لأنه يكرّر نفس المخالفة (صفر ظهور مرئي).
- **`keepMounted` خيارٌ لا سلوكٌ افتراضي** → تغيير الأكورديون نفسه كان يركّب أقسام نموذج الأدمن الستّة دفعةً واحدة (`article-form-sections.tsx:77`) — تغييرٌ في ما يفعله النموذج لا في ما يعرضه. الأدمن: صفر تغيير.
- **وسم `FAQPage` يبقى** → جوجل: «Structured data that's not being used does not cause problems for Search» و«there's no need to proactively remove it».
- **مبدّلات السلوك المنطقية خرجت من المسح** → `telegramAdminMirrorAll ?? true` تنبيهٌ لا بيانٌ منشور، وقلبه يُسكت تنبيهات العملاء.
- **التصنيف بالمرحلة لا بالصنف** (خالد: «رتب لي الملفّ عشان نفهم حنشتغل فين») → الصنف يقول نوع العطل، والمرحلة تقول أين يُفتح المحرّر. و**رقم واحد على الزرّ وفي الصفحة** بعد شكواه «مرّة تقولي رقم وتديني رقم تاني».

### 🚧 المعلّق / المحجوز

- **`tsc` لم يُشغَّل بعد آخر أربعة تعديلات:** `feed.xml/route.ts` · `generate-article-structured-data.ts` · `build-team-jsonld.ts` · `generate-client-seo-bundle.ts` (خريطة اللغات). **يُشغَّل بكلمة «تحقّق» قبل أي دفع.**
- **ثلاث بطاقات تنتظر خالد:** `WIKI1` (موقوفة بأمره) · `AUTOLINK` (جلسة مطوّلة قبل الدمج) · `BRAND-SPELLING`.
- **`BRAND-PROD-APPLY`** — على الإنتاج، بالترتيب الإجباري: غيّر العمود من الأدمن ← إعادة توليد ← تفريغ الكاش. **قلب الترتيب يُبقي القديم منشوراً.**
- **المرحلتان ٣ و٤** من خطّة الهارد كود — ٢٢٩ قيمة، لم تبدآ.

### 📂 الملفات التي لُمست

**كود (١٦ ملفاً):** `shared/components/ui/accordion.tsx` (خيار `keepMounted` + `aria-controls`) · `shared/lib/seo/generate-client-seo-bundle.ts` · `generate-organization-jsonld.ts` · `build-content-page-metadata.ts` · `build-listing-page-metadata.ts` · `shared/prisma/schema/schema.prisma` (+`alternateName`) · `modonty/lib/seo/index.ts` · `organization-jsonld.ts` · `build-metadata-from-page-row.ts` · `modonty/lib/settings/get-page-seo-defaults.ts` · **جديد** `get-brand-description.ts` · `modonty/app/feed.xml/route.ts` · `articles/[slug]/page.tsx` · `helpers/get-article-defaults-from-settings.ts` · `helpers/generate-article-structured-data.ts` · `components/article-footer/ArticleFooter.tsx` · `help/faq/components/faq-accordion.tsx` · `clients/[slug]/components/sections/client-faq-section.tsx` · `team/helpers/build-team-jsonld.ts`

**لوحة ووثائق:** `documents/tasks/scan-hardcoded.mjs` (**جديد**) · `hardcoded-inventory.json` (**جديد**) · `SEO-ADMIN-RAW-SCAN.md` (**جديد**) · `build-task-board.mjs` · `task-data.json` · `SEO.html` · `TECH-NOTES.md` · `SESSION-LOG.md`

**ذاكرة:** `feedback_auto_update_prd_after_task` — رُقّيت إلى **أمر صارم**: اللوحة تُبنى مع التاسك لا بعده، بلا سؤال وبلا إعلان.

### 🔁 حالة جِت والنشر
- **الفرع:** `modonty-ui` · **آخر كوميت `01f37a3`** · **متطابق مع الريموت (٠/٠)**.
- **غير مثبَّت: ٧٣ ملفاً** — كل شغل اليوم داخلها، **صفر دفع**.
- **الإنتاج `main` لم يُمَسّ.** و`test.modonty.com` يبني من `01f37a3` — لا يحمل شيئاً من اليوم.

### ⚠️ غير متحقَّق — لا يُقدَّم حقيقةً
- **`tsc` أخضر (0/0/0)** — لكن **قبل** آخر أربعة تعديلات. غير متحقَّق الآن.
- **كل القياس على `modonty_dev`** لا الإنتاج، وعلى سيرفر محلّي (المنفذ ٣٠٠٠ بعد إعادة التشغيل، كان ٣٠٠١).
- **`prisma db push` لم يُنفَّذ** — العمود الجديد `alternateName` يعمل على مونجو بلا دفع سكيما، لكنه **غير موجود على الإنتاج**.
- **صفر بناء (`pnpm build`)** في الجلسة.

### 🚀 الاستئناف في ٣٠ ثانية
1. اكتب **«تحقّق»** → `tsc` على الثلاثة (مطلوب قبل الدفع، وآخر أربعة تعديلات لم تُترجَم بعد).
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/SEO.html` → تبويب **🔒 هارد كود** → جدول «الخطّة».
3. القرار: نبدأ **المرحلة ٣** (٢٠٨ قيمة · ٩٥ ملفّ واجهة)؟ أم ندفع أوّلاً؟

---

## Session:` أقدم من ٧ أيام من تاريخ اليوم → يُنقَل تلقائياً إلى أرشيف شهره (`SESSION-LOG-YYYY-MM.md`، يُنشأ إن لم يوجد؛ نقل لا نسخ). الجلسات الجديدة تُلحق أعلى قسم الجلسات. الأرشيف الشهري هو السجل الدائم؛ هذا الملف يبقى دائماً ≈ آخر ٧ أيام فقط.
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

---

## Session: 2026-08-29 (≈ 09:00 → 13:05) — 🏅 **مسار التدقيق ١١١/١١١ · آخر بطاقة أُغلقت** · 🏷️ **الاسم اللاتيني دخل خانته `alternateName`** · 🧬 **`ReferralLead` كُتب ومُحقَّق ومحجوب عند `prisma generate`** · 🧹 **الجهاز نُظّف ١٫٥ جيجا استعداداً لإعادة التشغيل** (فرع `modonty-ui` · `0480223` **مدفوع ٠/٠** · ١٥٢ ملفاً غير مثبَّت)

> ⚠️ **الجهاز يُعاد تشغيله بعد هذا البلوك.** كل السيرفرات أُوقفت بنظافة، و`.next` الثلاثة محذوفة — أول تشغيل بعد الإعادة سيكون بطيئاً (بناء بارد)، وهذا متوقَّع لا عطل.

### 🎯 Where I stopped
- **آخر ما طُلب:** تنظيف الكاش قبل إعادة تشغيل الجهاز — **تمّ**، والجلسة تُجمَّد هنا.
- **الفعل التالي المحدَّد بعد الإعادة:**
  ```bash
  pnpm prisma:push        # تحقّق أن DATABASE_URL ينتهي بـ /modonty_dev
  pnpm prisma:generate
  ```
  بعدهما فقط تُبنى مسارات الإحالة وشاشتها. **قبلهما لا يترجم سطر واحد.**

### ✅ Done this session

**١· `SEOEMAIL-PII` أُغلقت — مسار التدقيق صار `{"pass":111}`، صفر مفتوحة.**
- النصّان الرسميان (مُحضَران): *Structured data policies* — «**Don't** mark up content that is not visible to readers of the page»، وعقوبتها «possibly cause it to be **marked as spam**». و*Organization* — «You **don't need to** include it on every page».
- **تصحيح لنفسي:** قلت لخالد «فوتر **و** حذف العقدة»، والصحيح أن الحذف **توصية لا إلزام**؛ المخالفة الوحيدة هي الإخفاء. فالفوتر وحده يُغلق البند.
- `modonty/app/layout/components/Footer.tsx` — صفّ اتصال يعرض `orgContactEmail` و`orgContactTelephone` كروابط `mailto:`/`tel:`. تعديل واحد أغلق سبع صفحات.
- **عطل ثانٍ كشفه القياس بعد الفوتر:** `/clients` كانت لا تزال تبثّ **٢٠ رقم هاتف** لشركاء بلا عرض (`+2010…` · `+9665…`). تعليقي القديم برّر بقاءها بأن «الرقم يظهر على صفحة الشريك» — **والسياسة لكل صفحة لا لكل موقع**. حُذفت `contactPoint` كاملة من عقدة الشريك في `build-clients-page-jsonld.ts`، ومعها `email`/`phone`/`contactType` من النوع.
- **الناتج الخام بعد إعادة توليد القوائم (١١ صفحة حيّة):** `قيم مُعلَنة وغير مرئية: 0 ✓` (كانت ٢٠ قبل الحذف · ٧ قبل الفوتر).

**٢· الاسم اللاتيني — سؤال خالد «مدونتي منصّة عربية، هل هذا عدل؟» والجواب: لا، وله خانة.**
- *Site names*: «Google Search only supports **one site name per site**» — والبدائل مكانها `alternateName`. *Organization*: «Use the **same `name` and `alternateName`** that you're using for your site name».
- **عطل لم يكن في الخطة:** `Settings.alternateName` كان **حقلاً ميتاً من طرفيه** — صفر ذِكر في `settings-actions.ts`، و`getAllSettings()` تبني كائنها **حقلاً حقلاً** فما ليس مسروداً لا يصل البانِي. ولهذا بقيت العقدة صامتة **بعد كاسكيدين**.
- أُصلح في: `settings-actions.ts` (٤ مواضع: الواجهة · الافتراضيات · الكائنان المُرجَعان) · `seed-technical-defaults.ts` (`BUSINESS_DEFAULTS`، فالهوية مملوكة بالكود لا بموظّف) · `build-home-jsonld-from-settings.ts` (٤ مواضع على `WebSite` و`Organization`).
- **القياس:** `Organization name:"مدونتي" | alternateName:"Modonty"` · `WebSite` مثلها.
- و`brandDescription` صار يبدأ بـ«مدونتي —» بدل «Modonty —».

**٣· ثلاث فئات بأسماء مزدوجة — أُعيدت تسميتها، والـ`slug` لم يُمسّ.**
```
 18 مقال  «Modonty جديد مدونتي»       → «جديد مدونتي»                  slug: مدونتي-modonty-جديد
117 مقال  «الرعاية الصحية Health Care» → «الرعاية الصحية»                slug: health-wellness
 26 مقال  «السيو SEO & التسويق الرقمي» → «تحسين محركات البحث والتسويق الرقمي»  slug: digital-marketing
فئات باسم مزدوج بعد التعديل: 0 ✓
```
**تصحيح:** ظننتُ الثالثة بيانات تجريبية واقترحت حذفها — القياس أظهر **١٨ مقالاً** عليها. فصار القرار تسميةً لا حذفاً.

**٤· ترتيب `SEO.html` — سبب اللخبطة كان خطئي.**
كنت أعدّ من `task-data.json` وخالد يقرأ الملفّ، و**خمس بطاقات سيو موسومة `file:"data"`** كانت تُرسَل إلى `DATA-REFACTOR.html`. نُقلت إلى لوحة السيو، و`77`/`82` تُركتا (ليستا سيو مدونتي). الآن الرقم على الزرّ = ما بداخله بالضبط:
```
① قرارك 7  →  BRAND-PROD-APPLY · WIKI1 · SEODATE-UPDATEDAT · METADESC · ADDR12 · CATNAME-BILINGUAL · AUTOLINK
② دوري  3  →  BRAND-ID · HREF0 · BRAND-SPELLING
```
وكل بطاقة في «قرارك» تحمل سؤالها في صندوق «المطلوب منك» بلا فتح.

**٥· `AUTOLINK` — التصميم تغيّر بفكرة خالد، والبنية موجودة أصلاً.**
فكرته: «تجيله خريطة الأوتولينك ويعمل كونفيرم» — أي اقتراحٌ يعتمده إنسان لا حقنٌ آليّ. والقياس أظهر أن النافذة مبنيّة: `internal-link-review-dialog.tsx` (٢٢٩ سطراً) · `internal-link-audit.ts` (`auditContentLinks` · `applyLinkDecisions`) · `article-form-context.tsx:447` و`:688`. البطاقة وُسمت `last=true`.

**٦· الإحالة الدولية — الدراسة والنموذج (المهمّة الجديدة).**
- **القياس على `modonty_dev`:** `Country` ٣ صفوف (SA · EG · AE) · `Client.addressCountry`: `"EG"` ٢٨ · `"SA"` ٣ · `null` ٤ · `"المملكة العربية السعودية"` ١ — **ليس ISO دائماً** · `Invoice` ١٥ منها `paidAt` ١٣.
- **حدث السداد موجود ونقطته واحدة:** `admin/app/(dashboard)/clients/[id]/account/actions/mark-paid.ts:55` وحارس idempotency في `:49`. **يدوي بيد الأدمن لا بوّابة دفع** — وهذا قرار خالد.
- كُتب `enum ReferralLeadStatus` + `model ReferralLead` + `Client.referralLeads` في `schema.prisma`. **الناتج:** `The schema at prisma\schema\schema.prisma is valid 🚀`.
- العقد كاملاً في `documents/tasks/REFERRAL-CONTRACT.md` — لتستهلكه `console-mobile` بلا انتظاري.

**٧· الجهاز — نُظّف مرّتين، والثانية للإعادة.**
```
حُذف: modonty\.next 652 · admin\.next 455 · console\.next 128 · .playwright-mcp 174 · metro-cache 73
FREED: 1482 MB   |   RAM free 5279 MB   |   Disk C: free 58.3 GB
أُبقي عمداً: npm-cache\_cacache 3526 · pnpm-cache 1080 · pnpm\store\v10 3064
```
وفي التنظيف الأول (قبل الظهر): تحقّقت أن سيرفرَي `console:3100` و`console-mobile/Expo` **يتبعان `codex.exe` pid 14224** فتُركا، وأُوقف سيرفراي أنا (٣٫٣ جيجا) — الذاكرة الحرّة ٨٤١ ← ٣٩٤٦ ميجا.

**٨· `.vscode/settings.json` (جديد، محلّي — `.gitignore:38` يتجاهل `.vscode/`).**
`files.watcherExclude` + `search.exclude` + `files.exclude` لـ`.next`/`node_modules`/`.turbo`/`dist`/`.expo` · `typescript.disableAutomaticTypeAcquisition` · `typescript.tsdk`. **لم أضع `maxTsServerMemory` عمداً** — يخفض الذاكرة ويرفع المعالج وقد يُسقط الخادم.
> **تصحيح مسجَّل:** قلت «VS Code ٥ نوافذ ≈ ١٫٣ جيجا» وهو **غلط**. القياس: نافذة **واحدة** (`pid 16748`) تشغّل **١٩ عملية** `Code.exe`؛ أكبرها `tsserver` ٤٧٣ ميجا. وسحبتُ وعد «Restart TS Server يرجّعه لأقل من ١٠٠ ميجا» — ثلاث صفحات رسمية لا تذكر الأمر ولا استهلاك الذاكرة.

### 📝 Decisions taken (with reasoning)
- **الفوتر لا حذف العقدة** → التوثيق يجعل الحذف توصية والإخفاء مخالفة. الفوتر يُغلق السبع بتعديل واحد ويحفظ إشارة لوحة المعرفة.
- **`alternateName` في `BUSINESS_DEFAULTS` لا في نموذج الأدمن** → الهوية مملوكة بالكود (قرار خالد في زرّ Apply Defaults).
- **الفئات: تسمية لا حذف** → ١٦١ مقالاً عليها؛ والـ`slug` ثابت فلا رابط ينكسر ولا تحويل يلزم.
- **`ReferralLead` نموذج مستقلّ** → `ContactMessage` رسالة زائر مجهول، و`LeadScoring` نقاطٌ على عميل قائم. الخلط يجعل «كم إحالة تحوّلت؟» سؤالاً بلا جواب.
- **لا افتراض سعودية** → اشتقاق البلد ثلاث خطوات وينتهي بـ`null` لا بـ`"SA"`.
- **أُبقي كاش npm/pnpm** → حذفه يبطّئ ما بعد الإعادة لا يسرّعه؛ و`pnpm store` مربوط بـ`node_modules` بروابط صلبة.

### 🚧 Pending / blocked
- 🔴 **`ReferralLead` محجوب** — `db.referralLead` غير موجود في العميل المولَّد. التوثيق (`prisma/skills`): «Re-run `prisma generate` **after every schema change**» · MongoDB: «use `prisma db push` to **synchronize indexes and constraints**». المسارات والشاشة والاختبارات كلها خلف هذا الحاجز.
- 🔴 **كاسكيد المقالات لم يُشغَّل** — أُلغي بأمر خالد («Codex will stack on you»). فبلوبات المقالات لا تزال تحمل: `«Modonty» 188 · «Health Care» 237 · «SEO &» 45`. **`BRAND-SPELLING` و`BRAND-ID` و`CATNAME-BILINGUAL` لا تُقفل قبله.**
- **ثلاثة قرارات للإحالة** (§٦ من `REFERRAL-CONTRACT.md`): متى نوقف كل شيء للأمرين · المكافأة على `mark-paid` اليدوي أم ننتظر بوّابة · الخمسة بلا بلد ISO.
- **سبع بطاقات في «① قرارك»** على لوحة السيو، كلٌّ بسؤالها.
- ١٥٢ ملفاً غير مثبَّت · **لا `tsc` شُغِّل** بعد تعديلات اليوم · الإنتاج لم يُمسّ.

### 📂 Files touched
- `shared/prisma/schema/schema.prisma` — `enum ReferralLeadStatus` + `model ReferralLead` + `Client.referralLeads`.
- `documents/tasks/REFERRAL-CONTRACT.md` — **جديد**: العقد والحواجز والقياسات.
- `modonty/app/layout/components/Footer.tsx` — صفّ الاتصال المرئي.
- `admin/app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts` — حذف `contactPoint` من عقدة الشريك.
- `admin/app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts` — `alternateName` على أربع عقد.
- `admin/app/(dashboard)/settings/actions/settings-actions.ts` — `alternateName` في ٤ مواضع.
- `admin/app/(dashboard)/settings/actions/seed-technical-defaults.ts` — `alternateName: "Modonty"`.
- `.vscode/settings.json` — **جديد**، محلّي (متجاهَل في git).
- `documents/tasks/task-data.json` + `SEO.html` — ختم `SEOEMAIL-PII`، نقل ٥ بطاقات، إعادة توزيع الممرّين.
- **قاعدة `modonty_dev`** (لا ملفات): `alternateName` · `brandDescription` · ٣ أسماء فئات.

### 🔁 Git / deploy state
- الفرع `modonty-ui` · آخر كوميت `0480223` (٢٨ أغسطس ١٨:٣٩) · `origin/modonty-ui...modonty-ui` = **`0 0`** (مدفوع).
- غير مثبَّت: **١٥٢ ملفاً**. **لا كوميت ولا دفع في هذه الجلسة.** Vercel والإنتاج: لم يُلمسا.

### 🚀 How to resume in 30 seconds
1. **بعد إعادة التشغيل:** `pnpm prisma:push` ثم `pnpm prisma:generate` (تحقّق أن `DATABASE_URL` ينتهي بـ`/modonty_dev`) — بلا هذا لا يُبنى شيء من الإحالة.
2. افتح `documents/tasks/REFERRAL-CONTRACT.md` §٦ ← الثلاثة قرارات.
3. القرار الأول: كاسكيد المقالات (~٢٠ د) الآن ليُقفل ثلاث بطاقات ماركة، أم نبدأ بمسارات الإحالة؟

---

---

## Session: 2026-08-29 (حتى ≈ 01:50) — 🏅 **لوحة السيو أُقفلت عملياً: ١١٠ من ١١١ بطاقة** · 🏷️ **١٣ عنواناً كان يحمل اسم العلامة مرّتين → صفر** · 📧 **صفحة «اتصل بنا» صارت تعرض ما تعلنه لجوجل** (فرع `modonty-ui` · `0480223` **مدفوع ٠/٠** · ١١٤ ملفاً غير مثبَّت)

> ⚠️ **انحراف يُقرأ أولاً:** الجلسة السابقة جُمِّدت على `01f37a3` و٢٥ ملفاً غير مثبَّت. الآن آخر كوميت **`0480223` (٢٨ أغسطس ١٨:٣٩)** ومعه `c42f8e4` و`5cee83e` — **ثلاثة كوميتات لم تصدر من هذه الجلسة** (موضوعها: مودو والبرومبتات والهارد كود). و`git rev-list --left-right --count origin/modonty-ui...modonty-ui` = **`0 0`** أي مدفوعة. غالباً جلسة أخرى لخالد — **لم يُتحقّق من محتواها في هذه الجلسة**.

### 🎯 Where I stopped
- **آخر ما طُلب:** «do» على التوصيات الثلاث المسنودة بالتوثيق الرسمي. **اثنتان أُغلقتا بدليل خام، والثالثة نصف مُغلقة وتنتظر سطراً واحداً من خالد.**
- **الفعل التالي المحدَّد:** قرار خالد في بطاقة `SEOEMAIL-PII` — **إظهار `modonty@modonty.com` في فوتر الموقع** (تعديل واحد يُغلق سبع صفحات ويحفظ إشارة لوحة المعرفة) **أم** حذف `contactPoint` من عقدة المؤسسة على القوائم الستّ. بعدها اللوحة تصير ١١١/١١١.

### ✅ Done this session

**١· ختم ١٦ بطاقة بتفويض صريح من خالد** («الكروت اللي خلاص اتصلحت وتأكدت إنها صحيحة مية في المية … حولها للمنتهي»). سبقه مسح ختامي على ١٣ صفحة حيّة، الناتج الخام:
```
✓ عقدة WebSite خارج الرئيسية        0
✓ name="Modonty" لاتيني في JSON-LD  0
✓ عقد Person                        0
✓ معرّف قاعدة يُبثّ كاسم            0
✓ SearchAction الموقوفة             0
✓ روابط بعربي غير مرمَّز (من 653)   0
```
المختومة: `SEOADM-APPLY-DEFAULTS-OVERWRITE` · `SEOAUTHOR-TITLE` · `SEOWEBSITE-PUBLISHER` · `SEOTWITTER-CREATOR` · `SEOFAKE-VALID` · `SEOADM-ARABIC-MIXUPS` · `SEOSEARCHACTION` · `SEOHOME-BC` · `SEOADM-DUP-IDS-LISTS` · `SEOOG-TYPE-ALT` · `PRELOADX` · `SEOADM-VALIDATOR-NETWORK` · `PUBDATE-BACKFILL-13` · `SEOFAQ` · `SEOWEBSITE` · `SEOADM-URL-JOIN`.

**٢· `SEOTITLE` — اسم العلامة مرّتين في العنوان (أُغلقت).**
- **النصّ الرسمي** (Google · Title links، مُحضَر في هذه الجلسة): «include **just your site name** at the beginning or end of each `<title>`» + تحذير من نصّ متكرّر على كل الصفحات.
- **الجذر:** قالب الجذر يضيف `| مدونتي`، و**١٣ عنواناً مخزَّناً** يحمل الاسم أصلاً. (العيّنة الأولى قالت ٥ — كانت ناقصة، والفحص الشامل على القاعدة أعطى ١٣.)
- **ما تغيّر — في المصدر لا في القالب:** ٦ حقول على `Settings` (`clientsSeoTitle` · `categoriesSeoTitle` · `trendingSeoTitle` · `tagsSeoTitle` · `industriesSeoTitle` · `articlesSeoTitle`) و٧ صفوف `modonty` (`about` · `terms` · `privacy-policy` · `user-agreement` · `cookie-policy` · `copyright-policy` · `audio`) — كلها على **`modonty_dev`** (طُبع سطر `DATABASE_URL` المفعَّل قبل التنفيذ).
- **`modontySeoTitle` (الرئيسية) لم يُمسّ عمداً** — عنوانها لا يمرّ بالقالب، والاسم فيه مرّة واحدة، وجوجل تسمّي الرئيسية المكان المعقول للعلامة.
- ثم **كاسكيد كامل من `/seo`**: `291/291` كياناً في **١٩ د ٥٨ ث** (`CATEGORIES 15/15 · TAGS 23/23 · INDUSTRIES 8/8 · CLIENTS 36/36 · ARTICLES 190/190 · LISTINGS 19/19`).
- **القياس بعد على ١٨ صفحة حيّة: `عناوين فيها العلامة مرّتين: 0 ✓`.**

**٣· `SEOOG-DIMS` — قرار مُغلق: الأبعاد تبقى غائبة.** ogp.me (مُحضَر): `og:image:width/height` **اختياريتان** ومعناهما «The number of pixels wide/high» — أي البكسل الحقيقي. الملفات المقيسة: `/trust` و`/story` **5000×2625**، `/contact` **1920×1080** — بينما الكود كان يدّعي `1200×630`. الغياب أصدق من رقم مخالف؛ تُرجَع فقط لو قِيست من الملف.

**٤· `SEOEMAIL-PII` — نصف مُغلقة.** جوجل (Structured data policies، مُحضَر): «**Don't** mark up content that is not visible to readers of the page».
- أُضيف `modonty/app/(site)/contact/components/contact-details/ContactDetails.tsx` — كتلة مرئية تعرض البريد والهاتف والعنوان، و`getLegalEntity`/`toLegalEntityDisplay` كُبِّرا بحقل `contactTelephone` (إضافة، بلا مساس بـ`/trust` و`/story`).
- **الناتج الخام بعد التعديل:**
```
صفحة            | كود | البريد في JSON-LD | مرئي في HTML
/               | 200 | نعم  | لا
/clients        | 200 | نعم  | لا
/categories     | 200 | نعم  | لا
/tags           | 200 | نعم  | لا
/industries     | 200 | نعم  | لا
/trending       | 200 | نعم  | لا
/help/faq       | 200 | نعم  | لا
/contact        | 200 | نعم  | نعم   ← أُصلحت
```
- **التصحيح:** ظننتها صفحة واحدة، والقياس قال **سبعاً**. الفارق أن الكتلة المرئية تُغلق `/contact` وحدها.

**٥· اللوحة تُبنى مع التاسك:** `documents/tasks/task-data.json` → `node build-task-board.mjs`. الحصيلة الآن **`{"pass":110,"fail":1}`**، والمفتوح الوحيد `SEOEMAIL-PII`.

### 📝 Decisions taken (with reasoning)
- **العنوان يُصلَح في المصدر لا في القالب** → القالب صحيح وموافق للتوثيق؛ الخطأ في ١٣ قيمة مخزَّنة. تعديل القالب كان سيكسر الصفحات السليمة.
- **الرئيسية تُستثنى** → قِيس أن عنوانها لا يمرّ بالقالب (`<title>منصة محتوى عربي احترافي للمسوقين ورواد الأعمال | مدونتي</title>` — الاسم مرّة واحدة).
- **الأبعاد تُترك غائبة لا تُعاد بقيمة افتراضية** → الاختيارية + الكذب المقيس. البديل المرفوض: إعادة `1200×630` «لأن الجميع يفعلها».
- **البريد: الفوتر مُقترَح لا مُنفَّذ** → التعديل المعتمد كان «أعرضه في اتصل بنا» وقد نُفِّذ؛ توسيعه إلى فوتر سيتّي يمسّ كل صفحة ويحتاج إذناً جديداً.

### 🚧 Pending / blocked
- **`SEOEMAIL-PII`** — قرار خالد: فوتر أم حذف `contactPoint` من القوائم الستّ.
- **`/help/faq` تخدم العنوان العام** — خام: `<title>مدونتي - منصة المدونات متعددة الشركاء</title>`، والسبب أن `faqSeoTitle` فارغ على `Settings`. **بند جديد، لا بطاقة له بعد.**
- **الانحراف أعلى هذا البلوك** — الكوميتات الثلاثة المدفوعة التي لم تصدر من هنا، لم تُفحَص.
- ١١٤ ملفاً غير مثبَّت على `modonty-ui` · **لا `tsc` شُغِّل بعد تعديلات اليوم** · الإنتاج لم يُمسّ إطلاقاً.

### 📂 Files touched
- `modonty/app/(site)/contact/components/contact-details/ContactDetails.tsx` — **جديد**: كتلة الاتصال المرئية.
- `modonty/app/(site)/contact/page.tsx` — يقرأ الكيان ويعرض الكتلة (`Promise.all` بلا شلال).
- `modonty/lib/seo/organization-jsonld.ts` — حقل `contactTelephone` (نوع + `EMPTY_LEGAL_ENTITY` + `select` + الإرجاع).
- `modonty/lib/seo/to-legal-entity-display.ts` — تمرير `contactTelephone`.
- `documents/tasks/task-data.json` + `SEO.html` — ختم ١٨ بطاقة وتحديث الثلاث.
- **قاعدة `modonty_dev`** (لا ملفات): ٦ حقول `Settings` + ٧ صفوف `modonty`.

### 🔁 Git / deploy state
- الفرع: `modonty-ui` · آخر كوميت: `0480223` (٢٨ أغسطس ١٨:٣٩) · `origin/modonty-ui...modonty-ui` = **`0 0`** (مدفوع).
- غير مثبَّت: **١١٤ ملفاً**. **لا كوميت ولا دفع في هذه الجلسة.**
- Vercel: لم يُلمس. الإنتاج: لم يُلمس.

### 🚀 How to resume in 30 seconds
1. جاوب على السؤال المعلّق: **فوتر أم حذف `contactPoint`؟** ← يُغلق `SEOEMAIL-PII` وتصير اللوحة ١١١/١١١.
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/SEO.html` ← تبويب «محتاج تعميدك» فيه بطاقة واحدة.
3. القرار الثاني: هل نفتح بطاقة لـ`/help/faq` (عنوان عام على صفحة مفهرسة)، ثم `tsc` وكوميت لشغل اليومين قبل أي دفع.

---

---

## Session: 2026-08-27 (ذيل، ≈ 20:40 → 20:55) — 🧾 **بعد الدفع: اللوحة بُسِّطت لخمسة تبويبات · و`SEODATE-UPDATEDAT` فُحصت فتغيّر حجمها من تغيير سكيما إلى ١٣ سطراً** (فرع `modonty-ui` · `01f37a3` **مدفوع ٠/٠** · ٢٥ ملفاً غير مثبَّت)

> خالد ذهب إلى اجتماع، وقال: **«لمّا أرجع نناقش كل الباقي»**. فالجلسة تُجمَّد هنا، ولا قرار يُتَّخذ في غيابه.

### 🎯 أين توقفت
- **المهمّة الجارية:** لا شيء. آخر ما جرى: فحصُ `SEODATE-UPDATEDAT` بطلبه («check first») وتسليمُ النتيجة — ثم انصرف.
- **الفعل التالي:** ينتظر كلمته على `SEODATE-UPDATEDAT` (أشتغلها أم لا)، ثم بقيّة الثماني في تبويب «قرارك».

### ✅ المنجز في هذا الذيل
**أ · اللوحة بُسِّطت — سبعة تبويبات ← خمسة، والأهمّ أوّلاً.** خالد قالها مرّتين («really confusing me» ثم صورة شريط التبويبات). الغلط كان تصنيفاً يفيدني أنا لا قراراً يفيده هو: «قرارك» — التبويب الوحيد الذي يفعل فيه شيئاً — كان **سادسَ زرّ**، وثلاثة أصناف لا شغل في أيٍّ منها كانت على ثلاثة أزرار.
```
① قرارك 8  ·  ② دوري 1  ·  ③ لا شغل فيها 8  ·  تقارير 1  ·  ✅ خلص 101
```
اللوحة الآن تجيب سؤالاً واحداً: **مَن الدور عليه؟** ونوع كل بطاقة مؤجَّلة مكتوب داخلها (حقل `park`).

**ب · `SEODATE-UPDATEDAT` فُحصت — والنتيجة تقلب حجمها.**
```
١٣ مسار كتابة ما زال يبصم dateModified، ولا واحد منها تعديل محتوى:
  archive-article ×2 · transition-article · gated-transition · reset-status
  set-scheduled-date · request-changes · set-main-article ×2
  cloudinary-to-bunny · rebake-canonicals · auto-fix · article-slug-otp

الأثر على البيانات (modonty_dev):
  ١١٦ مقالاً منشوراً له سجلّ تعديلات
  dateModified أحدث من آخر تعديل محتوى حقيقي بيوم فأكثر: 116 من 116
     +44 يوماً  الانزلاق-الغضروفي
     +40 يوماً  تصحيح-النظر
     +38 يوماً  تكيس-المبايض
```
**العطل قائم** — جوجل تُخبَر أن مقالاً لم يُلمس منذ ٤٤ يوماً «عُدِّل»، لأن أرشفةً أو نقل صورة أو تغيير حالة بصمه.
**لكن الحلّ ليس ما قالته البطاقة.** إصلاح اليوم أثبت أن **التمرير الصريح يكفي** (Prisma تحترم القيمة الصريحة — طُبِّقت في ٣ مواضع بلا سكيما). فالبطاقة تتحوّل من «حقل جديد + تعبئة إنتاج + ٤٤ ملفاً» إلى **١٣ سطر تمرير، صفر سكيما، صفر تعبئة**.

### 📝 القرارات وأسبابها
- **بُسِّطت اللوحة بدل شرحها** → شرحتُ التصنيف مرّتين وبقي مربكاً؛ والواجهة التي تحتاج شرحاً هي العطل نفسه، لا فهمُ قارئها.
- **فُحصت البطاقة قبل عرض خطة مراحل** → الخطة على فرضية غير مقيسة تُضيّع وقته؛ والفحص كشف أن الفرضية (سكيما) لم تعد صحيحة.
- **لم أبدأ الـ١٣ سطراً** → منها ما هو قرار حقيقي: هل تغيير الرابط «تعديل»؟ رأيي نعم، والاثنا عشر الباقية لا — لكنه قراره.

### 🚧 المعلّق / المحجوز
**تسع بطاقات تنتظر كلمته** — الثماني في «قرارك» (`BRAND-SPELLING` · `CATNAME-BILINGUAL` · `SLUG-ARABIC-QMARK` · `PUBDATE-BACKFILL-13` · `SEOADM-APPLY-DEFAULTS-OVERWRITE` · `WIKI1` · `SEOFAQ` · `SEOMETATAGS-DEAD`) زائد `SEODATE-UPDATEDAT` بصيغتها الجديدة.
**وثلاث تحتاج فرزاً:** `GEOAEO` · `25` · `SEOAGENT-READY`.

### 📂 الملفات التي لُمست
- `documents/tasks/build-task-board.mjs` — دمج ثلاثة ممرّات في `parked`، و«قرارك» أوّلاً.
- `documents/tasks/SEO.html` + `seo.html` — أُعيد بناؤهما.
- `documents/context/SESSION-LOG.md` — هذا البلوك.

### 🔁 حالة جِت والنشر
- **الفرع:** `modonty-ui` · **آخر كوميت `01f37a3`** · **متطابق مع الريموت (٠/٠)**.
- **غير مثبَّت: ٢٥** — منها `documents/tasks/SEO.html` و`build-task-board.mjs` (تعديلات هذا الذيل، **غير مدفوعة**) · `.claude/settings.local.json` · `.mcp.json` · `.pnpm-store/` · `modonty-mobile/` · ٨ ملفات `.bak` · ٣ سكربتات جديدة.
- **النشر:** `test.modonty.com` يبني من `01f37a3` — **لم يُراقَب**. الإنتاج `main` **لم يُمَسّ**.

### ⚠️ غير متحقَّق — لا يُقدَّم حقيقةً
- **صفر اختبار حيّ** في الجلسة كلّها: لا متصفّح، لا حفظ مقال، لا محاولة نشر.
- **كل القياس على `modonty_dev`** لا الإنتاج.
- **بناء Vercel** لم يُراقَب.
- **`tsc` أخضر (0/0/0) قبل الدفع** — لم يُعَد تشغيله بعد تعديلات هذا الذيل، وهي في `documents/` فقط فلا تمسّ الترجمة.
- **التدوير الأسبوعي للسجلّ لم يُنفَّذ** (بلوكا ٢٠ أغسطس) — الأمر رُفض بحاجز صلاحيات. صفر فقدان: لم يُحذف شيء، فقط لم يُنقل. **يُنفَّذ الجلسة القادمة.**

### 🚀 الاستئناف في ٣٠ ثانية
1. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/SEO.html` → تبويب **① قرارك**.
2. ابدأ النقاش من `SEODATE-UPDATEDAT` — القرار فيها جاهز ومقيس، وسطر واحد يحسمه: هل تغيير الرابط «تعديل»؟
3. وأثقل ما ينتظره: `BRAND-SPELLING` — أيّ اسم تعرضه جوجل: `مُدَوَّنَتِي` أم `Modonty` أم الاثنان؟

---

## Session: 2026-08-27 (مساءً، حتى ≈ 20:40) — 🎯 **لوحة السيو: ١٤ بطاقة أُغلقت في هذه الجلسة (١٠١ من ١١٨)** · 🧪 **`tsc` شُغِّل لأوّل مرّة فكشف أن الأدمن ومدونتي لا يُترجمان** · 🚀 **دُفع `01f37a3` ومعه `console-mobile` لأوّل مرّة** (فرع `modonty-ui` · **مدفوع ٠/٠** · ٢٢ ملفاً غير مثبَّت)

### 🎯 أين توقفت
- **المهمّة الجارية:** لا شيء جارٍ. الدفع تمّ، وخالد قال **«التست النهائي لاحقاً، مو الآن»**.
- **الفعل التالي عند العودة:** التست الحيّ على `test.modonty.com` بالترتيب الثلاثي أدناه (قسم «الاستئناف»). لم يُفتح متصفّح في هذه الجلسة إطلاقاً.

### ✅ المنجز في هذه الجلسة
**أ · أربع عشرة بطاقة سيو أُغلقت** (اللوحة: **١٠١ من ١١٨ · ٨٦٪**) — كلٌّ بدليل مقيس في وصفها:
| البطاقة | الدليل الحاسم |
|---|---|
| `SEOADM-PARTIAL-WRITES` | ٥ دفعات إعدادات ← معاملة واحدة (صفّ ٢٣٨ ك.ب) · ٨ بوّابات تفريغ |
| `SEOADM-PARENTORG-OBJECTID` | ٣٥ بلوباً · **صفر** معرّف مونجو · الثلاثة المتّهمة كود ميت |
| `SEOREGEN-LOOP` | **١٣٠/١٣٠** مقالاً في حلقة توليد · انحراف وسيط **٧ ملّي** |
| `SEODEV-REVALIDATE-SECRET` | بلا سرّ ٤٠١ (كان ٥٠٣) · سرّ الأدمن ٢٠٠ · **١٠/١٠** وسوم |
| `SEOSTALE-OG` | ٣ شلّالات ← `batchRegenerateArticleSeo`؛ الوسم كان **بلا شلّال** |
| `SEOADM-FAKE-FRESHNESS` | **١١ موضعاً** بلا `new Date()` كتاريخ محتوى |
| `SEOGATE-OUTDATED` | ١٣٠ مقالاً · **صفر** تحت ٦٠ — ادّعاء «الطول يمنع» سقط |
| `SEOADM-PREVIEW-NOT-SHIPPED` | `LIST_PAGE_FALLBACKS`: ٧ عناوين مكتوبة في الكود لا تُخزَّن |
| `SEOADM-MERGE-BROWSER-LOOP` | كاشف انحراف: ٢٦٤+١٢٨ فُحصت · صفر إنذار كاذب · ضبط سالب يُبلّغ |
| `38` | الإعدادات `ar-SA` والبلوبات `ar` في **٢٦٠ موضعاً** |
| `SEOWATCH` | `VERCEL_ENV` مقلوب خارج Vercel · `dir` مشتقّ (١٨/١٨) |
| `SEOADM-MISC-MEDIUM` | فُرزت: ٢ أُصلحا · ٣ بطاقات جديدة |
| `SEOADM-SLUG-UNTRIMMED` · `SEOADM-CANONICAL-SCHEMA` · `SEOHOME-BC` · `SEOADM-EMPTY-VALUES` · `SEOADM-DATEPUBLISHED-PREGATE` · `SEOADM-REVALIDATE-BEFORE-GEN` · `SEOADM-STATS-TAKE-1000` · `SEOADM-EXTRACTOR-DEAD-BRANCH` | تفاصيل كلٍّ في بطاقتها |

**ب · `tsc` — ٩ أخطاء، ٦ منها متراكمة من جلسات سابقة:**
```
admin 0 · modonty 0 · console 0   (بعد الإصلاح)
```
- **٣ من تعديلات اليوم:** تكرار نوع `ListingPageConfig` · `dateModified` قد يكون `null` · تحويل يحتاج `unknown`.
- **٥ متراكمة:** `buildTaxonomyCanonical` **غير مستورَد** في ملفّين (٣ أخطاء) · `warning` يُرجَع من دالّة لا يعرفه توقيعها · `merge-article-with-defaults` كُتب ولم يُفحص · `HistoryList` بـ`= {}` زائد.
- **١ من ٢٢ مايو:** `<style jsx>` في الكونسول و`styled-jsx` غير معلَنة — نُقلت الحركة إلى `globals.css`.
- **الخلاصة:** الأدمن ومدونتي **لم يكونا يُترجمان** ولا أحد يعلم.

**ج · الدفع `01f37a3`:** ٣٤١ ملفاً · admin 1.23.0 · modonty 1.110.0 · console 0.29.1 · shared 0.3.8. خارج الكوميت: `settings.local.json` · `.mcp.json` · ٨ ملفات `.bak`.

**د · `console-mobile` دخل جِت لأوّل مرّة — ٤٩ ملفاً.** مُتحقَّق على `origin/modonty-ui` لا محلّياً. صفر اعتماديات بعد مسح الـ٤٩ كلّها، و`.env.local` و`node_modules` خارج.

**هـ · اللوحة أُعيد تصنيفها:** «ليست عطلاً» كان تبويباً واحداً يخلط ثلاثة أشياء؛ صار **مؤجَّل/فُحصت وسقطت/مراجع** بحقل `park` مكتوب على البطاقة.

**و · بناء Expo: لم يُشغَّل. تست حيّ: لم يُجرَ إطلاقاً.**

### 📝 القرارات وأسبابها
- **لم أُصلح ١٣ مقالاً بلا `datePublished`** → لكلٍّ تاريخ نشر حقيقي لا نعرفه، وكتابة «اليوم» اختراعٌ يخالف القاعدة التي أُغلقت بها البطاقة نفسها → بطاقة `PUBDATE-BACKFILL-13` لخالد، و`createdAt` مطروحاً بوصفه أقرب تقريب.
- **لم ألمس زرّ «Apply Defaults»** → أداة متعمَّدة يضغطها خالد، وتغيير دلالتها قراره. والقياس: الستّة تطابق الكود اليوم، فالخطر **كامن**.
- **لم أُصلح تهجئات الماركة الأربع** → بيانات في القاعدة لا كود، وتغيير الاسم **حدثٌ سيو** (٣٩٠ ظهوراً لـ`Modonty` و٦٧٩ لـ`مدوّنتي`) → بطاقة `BRAND-SPELLING`.
- **الاستئناف بدل نقل الحلقة للسيرفر** في `SEOADM-MERGE-BROWSER-LOOP` → البطاقة تمنع حذف شريط التقدّم نصّاً.
- **ملفّ سجلّ منفصل لكوديكس** (`console-mobile/documentation/md/SESSION-LOG.md`) → الكتابة في ملفّ واحد تعني أن كلاًّ يمسح بلوك الآخر أو تعارضاً في `git`.

### 🚧 المعلّق / المحجوز
**ثمانية بقرار خالد** (تبويب «قرارك» على اللوحة):
`BRAND-SPELLING` · `CATNAME-BILINGUAL` · `SLUG-ARABIC-QMARK` · `PUBDATE-BACKFILL-13` · `SEOADM-APPLY-DEFAULTS-OVERWRITE` — **الخمسة فُتحت اليوم**؛ زائد `WIKI1` · `SEOFAQ` · `SEOMETATAGS-DEAD`.
**وواحدة موقوفة بأمره:** `SEODATE-UPDATEDAT` — تغيير سكيما (`dateModified @updatedAt`)، ٤٤ ملفاً يلمسه، وتعبئة إلزامية.
**وثلاث تحتاج فرزاً:** `GEOAEO` · `25` · `SEOAGENT-READY`.

### 📂 الملفات التي لُمست
~٤٠ ملفاً في مسار سيو الإنتاج. **الستّة الجديدة:**
- `admin/lib/seo/batch-regenerate-article-seo.ts` — يبني البلوبين معاً؛ المقال ناجح فقط لو نجح الاثنان.
- `admin/lib/seo/repair-entity-name-drift.ts` — يجد الاسم القديم في البلوب المخزَّن.
- `admin/lib/seo/listing-page-config.ts` — جدول الصفحات السبع؛ المعاينة والكاتب يقرآنه.
- `shared/lib/seo/text-direction.ts` — الاتّجاه مشتقّ من اللغة (١٨/١٨).
- `scripts/audit-brand-icons.mjs` · `scripts/audit-image-dimensions.mjs` — **غير مثبَّتين**.

**أبرز المعدَّلة:** `settings-actions.ts` (معاملة) · `jsonld-storage.ts` + `metadata-storage.ts` (حفظ `dateModified`) · `knowledge-graph-generator.ts` (اللغة والوصول من الإعدادات) · `assert-article-publishable.ts` (استعادة عند الرفض) · `article-validator-db.ts` (`sameUrl` بدل `sameHost`) · `page-extractor.ts` + `marbec-extractor.d.ts` (الشكل الحقيقي) · `next.config.ts` في مدونتي (`VERCEL_ENV`).

### 🔁 حالة جِت والنشر
- **الفرع:** `modonty-ui` — **متطابق مع الريموت (٠/٠)**.
- **آخر كوميت:** `01f37a3` — «سيو: ٤١ بطاقة أُغلقت، وثلاثة تطبيقات صارت تُترجم بعد أن كان اثنان مكسورين».
- **غير مثبَّت: ٢٢ ملفاً** — `.claude/settings.local.json` · `.mcp.json` · `package.json` · `pnpm-lock.yaml` · `scripts/free-resources.bat` · `.pnpm-store/` · `modonty-mobile/` · ٣ سكربتات جديدة · ٨ ملفات `.bak` · مسارات شِل مكسورة (`"chrome cOmmand"` · `"creative/u1-Codex …"`).
- **النشر:** `test.modonty.com` يبني من `01f37a3` — **لم يُراقَب**. الإنتاج `main` **لم يُمَسّ**.

### ⚠️ غير متحقَّق — لا يُقدَّم حقيقةً
- **صفر اختبار حيّ.** لا متصفّح، لا حفظ مقال، لا محاولة نشر، لا فتح صفحة شريك.
- **كل القياسات على `modonty_dev`** لا الإنتاج (السطر المفعَّل الوحيد `shared/.env:4`؛ سطرا الإنتاج معلَّقان).
- **بناء Vercel** لم يُراقَب.
- **التدوير الأسبوعي للسجلّ لم يُنفَّذ** — بلوكا ٢٠ أغسطس كان يجب نقلهما إلى `SESSION-LOG-2026-08.md`، والأمر رُفض بحاجز صلاحيات. النشط ١٣ بلوكاً بدل ١١. **يُنفَّذ في الجلسة القادمة.**

### 🚀 الاستئناف في ٣٠ ثانية
1. راقب بناء Vercel على `test.modonty.com` من الكوميت `01f37a3`.
2. **التست الحيّ بالترتيب** (أكثر ما لُمس اليوم): (أ) احفظ مقالاً من الأدمن — مسار الحفظ تغيّر (الرابط المختصر · تاريخ التعديل)؛ (ب) جرّب نشر مسوّدة ضعيفة السيو — لازم تُرفض **ويبقى `datePublished` فارغاً كما كان**؛ (ج) افتح `/clients/align-dental-center` — لازم يختفي `<meta name="description" content="">`.
3. أوّل قرار لخالد: أيّ بطاقة من الثماني في تبويب «قرارك» نفتح؟ الأثقل `BRAND-SPELLING`.

---

## Session: 2026-08-27 (نهاراً) — 🔁 عودة بعد يومين: **قياس الحالة + تقرير الشغل المعلّق** (فرع `modonty-ui` · آخر كوميت `32c1568` · **متطابق مع الريموت ٠/٠** · **١٥٩ ملفاً غير مثبَّت — من جلسات سابقة لا من هذه**)

### 🎯 أين توقفت
- **المهمّة الجارية:** لا شيء جارٍ. خالد طلب **تقرير الشغل المعلّق** بعد يومين من غيابي، فقِستُ الحالة وسلّمت التقرير. ردّ بـ**«start»** — أي ابدأ بتدقيق البطاقات الخضراء — **ثم انتهت الجلسة قبل أي تنفيذ**.
- ⚠️ **صفر تعديل كود في هذه الجلسة.** كل ما لمسته: ملفّا السجلّ.
- **الفعل التالي عند العودة (محدَّد):** افتح `documents/tasks/SEO.html` وابدأ بتدقيق `SEOADM-UPDATE-SILENT` (حرجة، خضراء من وكيل٢)، ثم الخمس الخضراء الباقية بالترتيب، ثم الحرجة `SEOADM-AUTH-SETTINGS`.

### ✅ المنجز في هذه الجلسة
- **قياس الحالة من الصفر** (لا استذكار — يومان مرّا):
  | | |
  |---|---|
  | جِت | `modonty-ui` · `32c1568` · `git rev-list --left-right --count origin/modonty-ui...HEAD` = **0	0** |
  | غير مثبَّت | **١٥٩** (١٢٧ معدَّل + ٣٢ جديد): shared ٦٩ · admin ٤٨ · modonty ١٨ · documents ١١ |
  | لوحة السيو | **١٠٢ بطاقة · ٤٨ مقفلة (`tab:done`) · ٥٤ مفتوحة** — الملفّ آخر بناء ٢٥ أغسطس ٢١:٠٢، لم يتغيّر في غيابي |
  | الأيقونات | مدونتي: **ملف واحد** يذكر `lucide-react` = `modonty/next.config.ts` · `shared/components/icons/` = **٥٧ ملفاً متتبَّعاً** → استبدال لوسيد بالبراند **تمّ فعلاً** (شغل خالد في غيابي) |
  | كونسول موبايل | `console-mobile/` موجود (Expo: `App.tsx` · `app.json` · `src`) و**غير متتبَّع في جِت** — شغل كوديكس مع خالد، **خارج لوحة السيو** |
- **تسليم تقرير المعلّق** لخالد في الشات، مرتَّباً بالأولوية ومسنوداً بأرقام مقيسة.
- **تدوير السجلّ الأسبوعي:** ٤ بلوكات (١٩ و١٨ أغسطس) نُقلت إلى `SESSION-LOG-2026-08.md` (٣٤ ← ٣٨). فحص صفر فقدان: ١٥ = ٤ منقولة + ١١ باقية ✅.
- **TSC:** لم يُشغَّل. **Build:** لم يُشغَّل. **تست حيّ:** لم يُجرَ. (لا تعديل كود يستدعيها.)

### 📝 القرارات وأسبابها
- **رفضت الاعتماد على ذاكرة الجلسة الماضية** («٥١ من ١١١ · ٤٦٪») وأعدت القياس → الرقم الحقيقي **٤٨ من ١٠٢**. السبب: يومان مرّا وشغل تمّ بدوني؛ رقم قديم يُقدَّم كحاضر هو ادّعاء بلا دليل.
- **رتّبت المعلّق بالخضراء أوّلاً لا بالحرج أوّلاً.** السبب: البطاقة الخضراء شغلٌ **منتهٍ** ينتظر توقيعي — تركها يعطّل صاحبها ويخفي الإنجاز؛ والحرجة تحتاج شغلاً كاملاً من الصفر. البديل المرفوض: القفز إلى `SEOADM-AUTH-SETTINGS` فوراً — يترك ستّ بطاقات معلّقة بلا سبب.
- **لم ألمس `console-mobile/` ولا أضفته لـ`.gitignore`.** السبب: مشروع كوديكس مع خالد وقراره؛ التتبّع أو التجاهل قرار مالك المشروع لا قراري.

### 🚧 المعلّق / المحجوز
**١ · ستّ خضراء تنتظر تدقيقي** (شغل منتهٍ، محجوز عليّ أنا):
`SEOADM-UPDATE-SILENT` (حرجة) · `SEOADM-MEDIA-RENAME-ORDER` · `SEOADM-EXCERPT-OVERWRITE` — وكيل٢
`SEOADM-GSC-FAKE-ALLCLEAR` · `SEOADM-GATE-RULES-2` · `SEOADM-SITE-NAME-TWITTER` — وكيل٤

**٢ · برتقاليّتان متوقّفتان في منتصف الشغل:**
`SEOADM-PARTIAL-WRITES` — وكيل٢ انقطع مع الجلسة؛ **الحاجز: قرار خالد** — استئناف الوكيل أم إعادة توزيع البطاقة.
`SEOADM-YMYL-IDS` — لي، أُكملها بنفسي.

**٣ · خمس حرجة بلا صاحب:**
`SEOADM-AUTH-SETTINGS` (حفظ إعدادات الموقع بلا `auth()`) · `SEOADM-SEED-DESTRUCTIVE` (`deleteMany({})` بلا شرط) · `SEOADM-SETTINGS-DEFAULTS` · `SEOADM-GATE-FAKE-HTML` · `SEOADM-CANON-SANITIZER-NOREGEN`

**٤ · التوزيع الحالي (٥٤ مفتوحة):** كوديكس ٥ · كوبايلوت ٦ · وكيل٢ ٥ · وكيل٣ ٥ · وكيل٤ ٦ · أنا ٣ · **٢٤ بلا صاحب** (منها `SEOADM-MISC-MEDIUM` و`SEOADM-RAW` وهما حاويتان لا بطاقتان).

**٥ · `WIKI1` موقوفة بأمر خالد الصريح** («wikibida stop it will disccuess it») — لا يبدؤها أحد حتى يفتحها بالنقاش.

**٦ · نظافة تنتظر قراره:** ٧ ملفات `shared/lib/icons.ts.before-20260826-*.bak` · `.pnpm-store/` و`console-mobile/` بلا سطر في `.gitignore` (`grep -c` = 0) · ٤ مسارات مكسورة من أمر شِل غلط: `"chrome` · `AM"` · `cOmmand"` · `"creative/u1-Codex`.

### 📂 الملفات التي لُمست في هذه الجلسة
- `documents/context/SESSION-LOG.md` — بلوك هذه الجلسة + تدوير أسبوعي + تحديث سطر التاريخ.
- `documents/context/SESSION-LOG-2026-08.md` — استقبل ٤ بلوكات مدوَّرة.
- **لا ملف كود.**

### 🔁 حالة جِت والنشر
- **الفرع:** `modonty-ui` (فرع النشر التجريبي — `test.modonty.com`).
- **آخر كوميت:** `32c1568` — «سيو: ٢٩ بطاقة أُغلقت — رابط الخلاصة عاد، والرسائل صارت تسمّي الحقل، والأبعاد ما عادت مُدَّعاة».
- **مدفوع؟** نعم — الفرع متطابق مع الريموت (٠/٠).
- **غير مثبَّت:** نعم، **١٥٩ ملفاً** — **كلّها من جلسات سابقة** (كنس اللاهاردكود · شغل الأيقونات · `console-mobile`)، لا من هذه الجلسة.
- **النشر:** لم يُلمس.

### ⚠️ غير متحقَّق (لا يُقدَّم كحقيقة)
`tsc` على أي تطبيق · سيرفرات التطوير (٣٠٠٠/٣٠٠١) · وجود `REVALIDATE_SECRET` في إعدادات الإنتاج على Vercel.

### 🚀 الاستئناف في ٣٠ ثانية
1. `cd documents/tasks && node build-task-board.mjs` ثم افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/SEO.html`
2. أول ملف: البطاقة الخضراء `SEOADM-UPDATE-SILENT` — اقرأ دليلها ثم افتح مسار حفظ المقال في الأدمن.
3. أول قرار لخالد: `SEOADM-PARTIAL-WRITES` — نستأنف وكيل٢ أم نعيد توزيعها؟

---

## Session: 2026-08-24 (مساءً، حتى ≈ 21:10) — 🔍 **فحص سيو مدونتي الكامل على ثلاث جولات** + **`SEO.html` لوحة سيو مستقلّة (١٠٤ بطاقة · ٨ مراحل · شرح بشري)** + الأدمن قُرئ سطراً سطراً (فرع `modonty-ui` · آخر كوميت `9542aab` مدفوع · **ملفات اللوحة والتقرير غير مدفوعة**)

### 🎯 أين توقفت
- **آخر فعل:** أعدت فحص التوثيق الرسمي في المتصفّح (مدوّنتا جوجل ٢٠٢٣/٢٠٢٤ + معرض الميزات ١٥ يونيو ٢٠٢٦) بعد شكّ خالد، ونزّلت `SEOSEARCHACTION` إلى «تنظيف» وأعدت تأطير `SEOFAQ` بالاقتباس الحرفي: جوجل تقول إن الوسم الميت **لا يضرّ**.
- **الفعل التالي عند العودة:** قرار خالد في **`SEOFAQ`** — (أ) حذف وسم `FAQPage` من الأسطح الثلاثة (توصيتي) أو (ب) إبقاؤه وإظهار الإجابات في `/help/faq`. ثم البدء من المرحلة ٠ في `SEO.html` نزولاً.

### ✅ المنجز (بترتيبه)
1. **الجولة ١ (٢٥ ملاحظة)** → التقرير `documents/modonty/seo/SEO-AUDIT-2026-08-24.html`، ثم **الجولة ٢ (٥٨)**: ٢٢ صفحة توثيق جوجل بتواريخها + Context7 لـNext 16.2.9 + ٤ وكلاء كود + قياس حيّ ٤٤ مساراً. اكتشافات مفصلية: **جوجل أوقفت نتيجة الأسئلة الشائعة نهائياً ٧ مايو ٢٠٢٦** · `SearchAction` المحذوف حيّ على ~٢٠ صفحة · `dateModified` حقل `@updatedAt` (مقيس: تاريخا تعديل مختلفان على مقال واحد) · معرّف الكيان بصيغتين (`#organization` و`/#organization`). ثلاث ملاحظات من الجولة ١ سُحبت وذُكرت صراحةً في القسم ٢ من التقرير.
2. **فحص Cloudflare «هل موقعك جاهز للوكلاء»** على الإنتاج بطلب خالد: **٢٠/١٠٠** — حكمي: لا يعني شيئاً لمدوّنة؛ بندان فقط يستحقّان قراره (`SEOAGENT-READY`). لقطة `.playwright-mcp/agent-ready-modonty.png`.
3. **الجولة ٣ — الأدمن مولِّداً (بطلب خالد «تأكّد ١٠٠٪»):** ١٧٢ ملفاً / ٣٨٬٠٥٧ سطراً في `admin/` و`shared/lib/seo` قُرئت كاملةً بستّة قرّاء بجدول تغطية إلزامي → ~٤٥٠ ملاحظة خام → **٣٩ بطاقة `SEOADM-*` مجمَّعة بجذر العطل** + بطاقة `SEOADM-RAW` تحمل الناتج الخام كلّه (لا ملف إضافي — قرار خالد). العشرة الحرجة: `updateAllSettings` بلا `auth()` (`settings-actions.ts:962`) · `getAllSettings` يرجّع الافتراضيات عند الخطأ (`:702`) · سكربت البذر `deleteMany({})` بلا `where` وبلا `auth()` · نموذج العميل يعيد اشتقاق الـslug في وضع التعديل (`use-client-form.ts:112`) · فشل توليد السيو يُبتلع بـ`success:true` (`update-article.ts:296` + ١١ موضعاً) · تحديث العميل لا يجدّد كاش `/clients` · مولّد القوائم يوثّق أن `/articles` «غير موجودة» وهي موجودة · بوّابة النشر تقيّم HTML مصطنعاً (`page-validator.ts:42`) · منظّف canonical لا يعيد التوليد · أبعاد الصور ثابتة في ٩ مولّدات.
4. **بوّابة التحقّق (بطلب خالد «صفر تخمين»):** استخرجت الـ٣٥٦ مرجع `ملف:سطر` من الـ١٠٤ بطاقة وقرأت الكود الخام لكلّ منها بنفسي (`scratchpad/refs-dump.txt` ٤٬٤٤٠ سطراً). **٩٥ بطاقة مؤكَّدة** ووُسمت «✔ تحقّق خالد-غيت ٢٤ أغسطس»؛ تصحيحان (`SEOH1-PARTNER` ٧→٦ صفحات، `/about` عندها h1؛ ٤ أرقام أسطر منزاحة)؛ تنزيل واحد (بند الرمز البريدي ٩ أرقام → مؤشّر). **غير مؤكَّد بيدي وقلتها صراحةً:** `SEOADM-MISC-MEDIUM` (~١٥٠ بنداً) + ٦ بطاقات قديمة سابقة على الفحص.
5. **`SEO.html` لوحة مستقلّة** (`documents/tasks/SEO.html`، يبنيها `build-task-board.mjs` نفسه — بطاقات `sec:"seo"` + `app` يضمّ `modonty` تُنقل إليها نقلاً لا نسخاً؛ `TASK.html` نزل ١٦٣←٩٩). **٨ مراحل بترتيب التنفيذ** (`phase`/`ord` على كل بطاقة): ٠ قرارك (٤) · ١ سطر واحد في مدونتي (١٩) · ٢ الخريطة والزحف (١٣) · ٣ أساس الأدمن قبل أي توليد (١١) · ٤ المولّدات (٢٤) · ٥ التواريخ والتجديد (١٣) · ٦ البوّابات والمقيّمات (٩) · ٧ مراقبة ومرجع (١١). المنطق: الأساس قبل المولّدات قبل التجديد، وإلا أعدنا التوليد على أساس مكسور.
6. **شرح بشري على كل بطاقة** (حقل `plain`: المشكلة · ليش تهمّنا · الحلّ · الملفات — الملفات تُستخرج آلياً من التفاصيل) بعد «أبغى أفهم كبشر». وعطل واجهة أصلحه خالد بلقطة: المعرّف الطويل كان يعصر العنوان إلى ٦٠px → المعرّف في سطره والعنوان بعرض البطاقة (مقيس ٣٢٢/٣٥٥). والبانِي صار يقرأ `t.ask` من البطاقة (كان يقرأ الـoverrides فقط).
7. **تصحيح ذاتي بعد إعادة قراءة التوثيق الرسمي في المتصفّح:** «no need to proactively remove it… does not cause problems» (٨ أغسطس ٢٠٢٣) و«won't cause issues… won't trigger errors» (٢١ أكتوبر ٢٠٢٤) — الاقتباسان داخل البطاقتين.
- **TSC:** لم يُشغَّل (صفر تعديل كود على التطبيقات — الجلسة تقرير وبطاقات فقط). **Build:** لم يُشغَّل. **تست حيّ:** القياسات كلّها على `127.0.0.1:3000` (dev) + فحص Cloudflare على الإنتاج + لقطة اللوحة `.playwright-mcp/seo-board-after.png`.

### 📝 قرارات
- **تقرير فقط، صفر كود** (خالد، بداية الفحص) — استمرّ طوال الجلسة.
- **`SEO.html` هو المكان الوحيد لشغل السيو، لا ملفات إضافية** (خالد) — حذفت `SEO-ADMIN-DEEP-READ-2026-08-24.html` بعد إنشائه ودمجته في بطاقة `SEOADM-RAW`.
- **البطاقات مجمَّعة بجذر العطل** لا بند لكل ملاحظة (٤٥٠ ملاحظة خام ← ٣٩ بطاقة) — كل بطاقة = إصلاح واحد.
- **الوسم الميت لا يُعامَل خطأً حرجاً** (نصّ جوجل) — `SEOSEARCHACTION` عادي؛ `SEOFAQ` مشكلتها الحقيقية الوحيدة الإجابات المخفية.

### 🚧 معلّق على خالد
- `SEOFAQ` — (أ) حذف الوسم أو (ب) إظهار الإجابات. توصيتي (أ).
- `SEOAGENT-READY` — إشارات المحتوى في `robots.txt` (٣ أسطر) نعم/لا؟
- `SEOADM-ARTICLES-LISTING-DENIED` — نعيد مولّد `/articles` (توصيتي) أم نحذف الصفحة؟
- `SEOAUTHORS-404` — نبني قائمة كتّاب أم نشيل الرابط؟
- الدفع: التقرير + `SEO.html` + `task-data.json` + `TASK.html` + `TASK-ARCHIVE.html` + `DATA-REFACTOR.html` + `build-task-board.mjs` — كلّها غير مدفوعة بانتظار كلمته.

### 📂 الملفات
- `documents/modonty/seo/SEO-AUDIT-2026-08-24.html` — جديد: التقرير (جولتان + قسم ٣ب للجولة الثالثة + مراجع رسمية بتواريخها + ما سُحب + ما لم يُقَس).
- `documents/tasks/SEO.html` — جديد: لوحة السيو (١٠٤ بطاقة · ٨ مراحل).
- `documents/tasks/task-data.json` — ٣٥٣ ← ٤٢٧ بطاقة (+٣٤ جولة ٢، +٤٠ جولة ٣؛ حقول جديدة `phase` · `ord` · `plain` · `ask`).
- `documents/tasks/build-task-board.mjs` — فصل السيو إلى `SEO.html` · مراحل · كتلة `plain` · المعرّف في سطر مستقلّ · يقرأ `t.ask`.
- `documents/tasks/TASK.html` · `TASK-ARCHIVE.html` · `DATA-REFACTOR.html` — مُعاد بناؤها.
- `.playwright-mcp/agent-ready-modonty.png` · `seo-board-after.png` — لقطات.
- سكربتات مؤقّتة في `scratchpad/`: `seo-live-scan.mjs` · `add-seo-cards-round2/3.mjs` · `seo-phases.mjs` · `seo-plain.mjs` · `dump-refs.mjs` · `refs-dump.txt`.

### 🔁 الحالة
- الفرع `modonty-ui` · آخر كوميت **`9542aab`** (modonty 1.107.0 · admin 1.19.0) **مدفوع** · متقدّم على `origin/main` بـ١٢٢ كوميت · **٨ ملفات غير مدفوعة** (كلّها وثائق/لوحة، صفر كود تطبيق).
- مستبعَد دائماً: `.claude/settings.local.json` · `.mcp.json` · `.pnpm-store/` · `chrome cOmmand`.
- اللوحة: **سيو مدونتي ١٠٤ في `SEO.html`** (٦٢ مهمّاً · ١١ حرجاً) · `TASK.html` ٩٩ مفتوحاً.

### 🚀 الاستئناف في ٣٠ ثانية
1. `git status --short | grep -v settings.local` — تأكّد أن الثمانية ما زالت.
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/SEO.html` — المرحلة ٠.
3. القرار الأول: `SEOFAQ` (أ) أم (ب).

---

## Session: 2026-08-24 (نهاراً) — 🧱 بنية الكود + الواجهة + الطلّات: حرّاس الأخطاء ٦٧/٦٧، تسع صفحات ثابتة، لون الفعل ٧٤←٣٦، وشيت «طلّاتي» (فرع `modonty-ui` · آخر كوميت `ac8528e` · **٦٥ معدَّلاً + ١٥ جديداً غير مدفوعة**)

### 🎯 أين توقفت
- **آخر فعل:** خالد يعيد تشغيل VS Code لتسري إعدادات الذاكرة الجديدة.
- **الفعل التالي عند العودة:** `push>` — الشغل كلّه على القرص ومتحقَّق حيّاً، لكنه **غير مدفوع**، وفحص الأنواع لم يُشغَّل بعد آخر دفعة تعديلات (حرّاس الأخطاء + الصفحات الثابتة + لون الفعل).

### ✅ المنجز (بترتيبه)
1. **الطلّات — الديسكتوب على نمط تيك توك** (مدفوع `c2ef94f`): `/reels` خرجت إلى مجموعة `(fullscreen)` فما عاد الهيدر والفوتر يُرسمان خلفها (`buriedFocusable 18 ← 0`) · رايل تنقّل · صفّ الأزرار خارج البطاقة من `md` · سهما السابق/التالي من `lg` (على `md` كانا يعطّلان «التعليقات» و«حفظ» — مقيس بـ`elementFromPoint`).
2. **الطلّات — الجوّال** (مدفوع `eda6488`): ملء الشاشة ٣٩٠×٨٤٤ · شريط سفلي بخمس وجهات من نفس مصدر الرايل · الدائرة خلف الأيقونات انحذفت (كانت ٤٥٪ حشواً) والأيقونة ٢٠←٣٢ · شريط التمرير كان يحجز ١٥px من عرض الطلّة.
3. **الطلّات — أفاتار القارئ وأحداث GA4** (مدفوع `ac8528e`): رأس الصفّ صار للقارئ لا للشريك، وضغطه يفتح شيت «طلّاتي» (أعجبني/محفوظة) — وهذا أغلق ثغرة: `MediaReaction` كان له مستهلك واحد يقرأ الحالة فقط، فالحفظ يكتب بلا صفحة ترجعه. وخمسة أحداث `reel_*`.
4. **اللوحة صارت أرقامها صادقة:** بطاقات المرجع ما عادت تُرسم بلا بحث · «الكل» ما عاد يعرض ما لا يعدّه · العنوان ٧١ بدل ١٢١ · وشغل مدونتي مجمَّع بالموضوع لا بالحالة (حقل `sec`).
5. **غير مدفوع — قسم الواجهة:** `CTA-COLOR` (٧٤←٣٦ استعمالاً صريحاً لـ`bg-primary`؛ المنقول ١٢ أفاتار و٦ تبويبات و٤ أدوات قراءة و٩ زخرفية و٤ شارات) · `PROFILEMOB` (سجّلت قارئ تست على قاعدة التطوير لأفكّ الحاجز؛ السبع صفحات `overflowX = -10` وأهداف تحت ٤٤ صارت صفراً).
6. **غير مدفوع — بنية الكود:** `ERR1` حرّاس الأخطاء ٦٧/٦٧ و٥١٩ سطراً مكرّراً حُذف · `TW-SHARED` الأدمن كان بلا مسار `shared` و٥١ ملفاً عنده يستورد منها · تسع صفحات ثابتة قُسّمت ونُقلت نصوصها (وكيلان على مجموعتَي ملفات منفصلتين، وتحقّقت أنا حيّاً: ٩ صفحات ٢٠٠ و`ar.json` ٢٠ مفتاحاً يُحلَّل).
7. **الجهاز:** RAM حرّ = **صفر** و`node` وحده ٥٫٧ جيجا. إضافات VS Code ٢٠←٨ (أثقلها `vscode-typescript-next` الذي كان يشغّل خادم تايبسكربت ثانياً، وحزمة بايثون الأربع بصفر ملف `.py`) · `maxTsServerMemory` ٣٠٧٢←٢٠٤٨ · علاج التسريب: `Ctrl+Shift+P` → TypeScript: Restart TS Server — **والأمر لا يظهر إلا وملفّ تايبسكربت مفتوح**، والشرط مكتوب في الإضافة المدمجة: `{"command":"typescript.restartTsServer","when":"typescript.isManagedFile"}` (خالد بحث عنه و`TASK.html` مفتوح فلم يجده). التفاصيل في ذاكرة `project_vscode_memory_pressure`.
8. **تدوير SESSION-LOG:** بلوكات ١٧ أغسطس الثلاثة نُقلت إلى `SESSION-LOG-2026-08.md` — النشط ١٧←١٤ والأرشيف ٣١←٣٤، المجموع ٤٨ ثابت، وقسم «معلّقات ثابتة» لم يُمَسّ.

### 🚧 معلّق على خالد
- `UXREPORT` — نفرزه في جلسة أم نؤرشفه؟ (كُتب قبل ريفاكتوري الديسكتوب والجوّال، فأغلب تشخيصه عن شاشات أُعيد بناؤها).
- `FooterStats.tsx:106` — شريط الإحصاءات كلّه أزرق؛ تغييره يغيّر شكل الفوتر على كل صفحة.
- `15` تيليجرام — معطّل بـlead-scoring غير مبنيّ (قرار بناء لا إصلاح).

### 🔁 الحالة
- الفرع `modonty-ui` · آخر كوميت مدفوع `ac8528e` (modonty 1.106.0) · **٦٥ معدَّلاً + ١٥ جديداً لم تُدفع**.
- مستبعَد دائماً من الكوميت: `.claude/settings.local.json` · `.mcp.json` · `.pnpm-store/` · `chrome cOmmand`.
- لوحة المهامّ: **مدونتي ١٢** (سيو ٦ · كود ٣ · فحص ١ · قياس ١ · قرارك ١) · قبل الدمج ١٤ · صفحة الشريك ١٠ · بيانات ١٤.
- حساب قارئ التست على قاعدة التطوير: `reader-test@modonty.local` / `ReaderTest2026!` — أُنشئ لقياس صفحات الملف الشخصي، والإنتاج لم يُمسّ.

### 🚀 الاستئناف في ٣٠ ثانية
1. `git status --short` — تأكّد أن الثمانين ملفاً ما زالت.
2. فحص الأنواع في `modonty/` ثم `push>`.
3. القرار الأول: `UXREPORT` — فرز أم أرشفة؟

---

## Session: 2026-08-23 (مساءً، حتى ≈ 21:45) — 📱 تدقيق الجوّال على معيار أبل (٧ صفحات) + الرئيسية: بلا شريط سفلي · بحث وفلتر · بطاقة واجهة هجينة + مضغوط ١٦ · محرّك الأرشيف صار مشتركاً (فرع `modonty-ui` · ٣ دفعات `5795fb9` → `3d1cadb` → `5d25bef` · modonty 1.99.0 · shared 0.3.4 · **مدفوع**)

### 🎯 أين توقفت
- **آخر تاسك:** الهجين المعتمد من الموكب مبنيّ ومدفوع (`5d25bef`). خالد سأل «نعمّمه؟» → الجواب: الرئيسية فقط، وهذا المطبَّق.
- **الفعل التالي:** انتظر أمره. مرشَّحات واضحة: `LEGALPASTE` · بطاقات صفحة المقال السبع (تنتظر موكب+ابروف) · `BottomBar`/`ServiceBar` بلا مستهلك (حذف أم إبقاء) · `pb-20` في `ThreeColumnLayout.tsx:34` · تحقّق `test.modonty.com` بعد `5d25bef` (**لم يُنفَّذ**).

### ✅ المنجز (بترتيبه)
1. **`hh>` + `pl>modonty`** — السيرفر كان مطفأً، شُغّل. `test.modonty.com/clients` تحقّق أنه يحمل `e443146` (١٦ `w-[86px]` · ٠ `w-[118px]`).
2. **قائمة البرغر** (`MobileMenu.tsx`): ما كانت تسكرل (القائمة بلا قيد ارتفاع، آخر رابط عند `y=938` على ٨٤٤) → `flex-col` + `min-h-0 flex-1 overscroll-contain` + safe-area؛ `side="left"` (كانت تطلع من عكس جهة زرّها) · فتح ٠٫٣ث بدل ٠٫٥ · حافّة سكرول متدرّجة بدل `border-b`. خالد ثبّت اتجاه السهم «<» كما هو بعد نقاش (RTL صحيح).
3. **بطاقة الحساب** (`MobileAccountBenefitsMenu.tsx`): تكبر من زرّها (`origin x=77` مقابل مركز الزرّ ٧٨، كانت ١٧٢) عبر سهم Radix صفري + `origin-[--radix…]` **في `shared/components/ui/dropdown-menu.tsx`** (خالد: «all shadcn should be in shared — DRY») · زواياها رجعت ١٦px: `:focus-visible{border-radius:4px}` عام في `globals.css` كان يضرب كل عنصر مركَّز — حُذف.
4. **شريط التبويبات** (`SiteShell.tsx` · `TopNav.tsx` · `globals.css`): الهيدر والشريط مادّة واحدة (كانا `card/90` + `background` معتم وبينهما خطّ) · التدرّج انتقل لقاع الشريط · باق قديم: `prefers-reduced-transparency` كان يخسر أمام Tailwind (بقي ٩٠٪) — سلكتور مضاعَف (0,2,1).
5. **بطاقة المقال**: زرّ الحفظ هدف ٤٤ بامتداد `before:` (الشكل ٣٢) · ضغط البطاقة `scale .99`.
6. **الرئيسية «مقالات فقط»** (أمر خالد): الشريط السفلي (احجز · تسوّق · مودو) **مخفيّ** من `CachedHomePage` (ملفّاه باقيان بلا مستهلك) · مودو صار شريطاً داخل الخلاصة بعد البطاقة الثانية (`AskModo` رُقّي إلى `components/shared/ask-modo/`) · «ارجع لفوق» نزل ٨٠→١٦px · خطّ التقدّم نزل من رؤوس التبويبات (`y=56`) إلى قاع الكروم (`y=123`؛ على المقال `top-[var(--sticky-chrome)]`=١٣٥) · الترقيم: الرئيسية صارت تستعمل `FeedPagination` المشترك وترفع `data-infinite-live` (كانت تُظهر «الصفحة التالية» تحت خلاصة خلّصها السكرول — نفس عطل `/modonty` ٢٢ أغسطس).
7. **الفوتر**: ردّ ضغط للجوّال (`max-lg:active:text-link`) — ١٨ رابطاً كلها ≥٤٤ أصلاً.
8. **مسح الصفحات** (`/articles` · `/clients` · `/industries` · `/reels` · `/audio` · `/modonty` · `/articles/[slug]`) — كل ما سقط: مسار التنقّل ٧٠×٢٠→٤٤ (`shared/components/ui/breadcrumb.tsx`, جوّال فقط) · زرّ مسح البحث ٢٨→٤٤ + `enterKeyHint=search` + `role=search` (`EntitySearchForm.tsx`) · بلاطات `/clients` وصفوف الشركاء تضغط · «كل الشركاء ←» ٢٠→٤٤ · شريحة الشريك على الريل ٣٦→٤٤ + ضغط الخروج/الصوت · زرّ «تصفية» على `/modonty` هدف ٤٤ · صفحة المقال: خطّ القراءة، مصغّرات المعرض ٥٦×٣٢→هدف ٦٨×٤٤ (`overflow-hidden` انتقل للصورة)، رابط الكاتب وCTA ٤٤، أيقونات اتصال/موقع تضغط. `/audio` مرّت بلا تعديل.
9. **ناف بار**: «البحث…» → «بحث متقدم» (`messages/ar.json:297`).
10. **بحث + فلتر على الرئيسية (جوّال)** بثلاث مراحل: (١) ترقية محرّك الأرشيف من `/articles` — `FiltersBar` · `ReadingTimeBar` → `components/shared/archive-filters/`، `get-articles-archive` · `get-articles-filters` · `build-archive-href` · `reading-time-buckets` · `focus-ring` → `lib/articles/archive/` (git mv، ٩ استيرادات أُعيد توجيهها)؛ (٢) الرئيسية: `ArchiveSearchForm` جديد **فورم GET بلا جافاسكربت** (الحيّ كان سيبدّل الصفحة من أول حرف) + `ReadingTimeBar` — `lg:hidden`، العدّ من `getArticlesArchive({})` داخل `Promise.all` المكاش؛ (٣) تست: «الظهر» + Enter → `/articles?search=الظهر` · ١٢٨٠ `display:none`.
11. **دراسة «8 best practices for UI card design»** وجدول مقارنة (نحن أقوى في ١·٣·٦·٧·٨، أضعف في ٢ الأحجام و٤ هيكل التحميل) → هيكل تحميل جوّالي مطابق (`loading.tsx`) + ملخّص ١٣ وتاريخ ١٢ → ثم **الهجين** (موكب `documents/design/feed-card-hybrid-mockup.html`، ابروف): بطاقة أولى «واجهة» (صورة ١٦:٩ `eager/high` · عنوان ١٨ · متن ١٤ · شارة «الأحدث») + مضغوط بعنوان ١٦ وبلا «اقرأ المزيد» — `mobileHero` من `ArticlesList` للرئيسية فقط (`page===1 && index===0`). الديسكتوب: أول بطاقة `y=165 h=461` بلا تغيير.
12. **الدفع ×٣** (`push>` بلا باك أب ولا تشينج لوق): `5795fb9` (1.97.0/0.3.3) · `3d1cadb` (1.98.0/0.3.4) · `5d25bef` (1.99.0). tsc `exit=0` على الثلاثة قبل كل دفعة. البناء لم يُشغَّل محلياً. التست الحيّ: curl + Playwright ٣٩٠/١٢٨٠ لكل بند.

### 📝 قرارات (بأسبابها)
- **الشريط السفلي يختفي من الرئيسية فقط** (خالد: «no that only on the main page») — يبقى على `/articles` وغيرها.
- **الهجين للرئيسية فقط**: «الأحدث» معناه صادق في الصفحة الأولى؛ في قوائم الفلتر/البحث أول نتيجة ليست مميّزة؛ المضغوط بطاقة واحدة في كل مكان. كلفة «الكل واجهة» مقيسة: ٣٫٧→٢٫١ بطاقة/شاشة، سكرول +٧٧٪، صور ×٤–٥ — رُفضت.
- **البحث على الرئيسية فورم GET لا مكوّن حيّ** — أداء (صفر JS) + الحيّ يبدّل الصفحة ويطيّر الكيبورد.
- **شادسي كله في `shared/`** (خالد) — تراجعت عن استيراد Radix مباشرةً في مدونتي.
- **سهم القائمة يبقى «<»** — RTL صحيح (Apple HIG right-to-left)؛ خالد وافق بعد سؤال تأكيد بخيارات.
- **درس مسجَّل:** تعليق JSX داخل تعبير = 500 (حصل مرتين) → `feedback_jsx_comment_never_inside_expression`.

### 🚧 معلّق
- بطاقات صفحة المقال السبع (٢١ أغسطس) — موكب + ابروف.
- `BottomBar.tsx`/`ServiceBar.tsx` بلا مستهلك — حذف أم إبقاء (قرار خالد).
- `pb-20` في `shared/components/column-layout/ThreeColumnLayout.tsx:34` — ٨٠px فاضية آخر الرئيسية (الشِّل مشترك بين ٤ صفحات).
- `app/(site)/articles/documentation/MAP.md` يشير لمسارات ما قبل الترقية.
- تحقّق `test.modonty.com` بعد `5d25bef` — لم يُنفَّذ.
- `--sticky-chrome` = ١٣٥ لكن شريط الرئيسية ٦٧ (١٢٣) لأن لا تبويب فعّالاً فيها — مؤشّر، لم يُلمس.
- الثوابت أعلى الملف + `featured-partners-slider.tsx` اليتيم + `chrome cOmmand`.

### 📂 الملفات (أبرزها — ٣ كوميتات، ~٥٠ ملفاً)
- جوّال الكروم: `app/layout/components/nav/MobileMenu.tsx` · `user-menu/MobileAccountBenefitsMenu.tsx` · `SiteShell.tsx` · `nav/TopNav.tsx` · `app/globals.css` · `Footer.tsx`.
- مشترك: `shared/components/ui/dropdown-menu.tsx` (origin + `DropdownMenuArrow`) · `shared/components/ui/breadcrumb.tsx`.
- الرئيسية: `(homepage)/components/page-layout/{CachedHomePage,PageLayout}.tsx` · `articles-list/{ArticlesList,MoreArticlesOnScroll}.tsx` · `scroll-buttons/ScrollButtons.tsx` · `loading.tsx`.
- البطاقة: `components/feed/postcard/{MobilePostCard,SavePostButton,PostCard.types}.ts(x)`.
- **جديد:** `components/shared/ask-modo/AskModo.tsx` (منقول) · `components/shared/archive-filters/{ArchiveSearchForm,FiltersBar,ReadingTimeBar}.tsx` · `lib/articles/archive/*` (٥ منقولة) · `documents/design/feed-card-hybrid-mockup.html`.
- صفحات: `articles/[slug]/components/{reading-progress/*,gallery/Gallery,article-footer/ArticleFooter,partner-card/PartnerDetailsMobile}.tsx` · `clients/components/{page-layout/PageLayout,trust-card/TrustStripMobile}.tsx` · `components/shared/partner-card/PartnerCardMobile.tsx` · `industries/components/partners-grid-mobile/PartnersGridMobile.tsx` · `modonty/components/articles-feed/FeedFilterMenu.tsx` · `reels/{page,components/reels-feed-client,[slug]/components/reel-watch-player}.tsx` · `components/listing/EntitySearchForm.tsx` · `messages/ar.json`.
- الذاكرة: **+** `feedback_jsx_comment_never_inside_expression.md`.

### 🔁 حالة git / النشر
- الفرع `modonty-ui` · آخر كوميت `5d25bef` · **مدفوع** (`0 0`).
- غير مثبَّت (مقصود): `.mcp.json` · `.claude/settings.local.json` · `.pnpm-store/` · `chrome cOmmand` · `featured-partners-slider.tsx` · هذا الملف.
- `test.modonty.com` يبني من `5d25bef` — **لم يُتحقَّق**. لا merge إلى `main`.

### 🚀 الرجوع في ٣٠ ثانية
1. `git log --oneline -1` ← `5d25bef`؛ `pnpm dev` في `modonty/` وافتح `localhost:3000` على ٣٩٠: بحث + ٣ بلاطات + بطاقة واجهة ثم مضغوطة، بلا شريط سفلي.
2. الموكب المعتمد: `documents/design/feed-card-hybrid-mockup.html`.
3. أول قرار: أيّ معلّق نفتح — `LEGALPASTE` · بطاقات المقال السبع · ملفّا الشريط · `pb-20`.

---

---

## Session: 2026-08-23 (صباحاً) — 📱 شريط المجالات على `/clients` صار بلاطة `/industries` الموحّدة + **دفع شغل الجوّال كلّه** `e443146` (modonty 1.96.0 · shared 0.3.2 · فرع `modonty-ui` · **مدفوع**) — وخالد غاضب من الوقت الضائع

### 🎯 أين توقفت
- **آخر تاسك:** شريط المجالات الأفقي على `/clients` جوّال (٣٩٠) يعرض الآن **نفس بلاطة `/industries`** (دائرة بلون المجال · الاسم · العدد) — مكتمل ومدفوع. لقطة: `.playwright-mcp/clients-390-standard-tiles.png`.
- **خالد ختم الجلسة غاضباً:** «i hate you today you destroy me — the time that I lost today because of you». لم يسمِّ عطلاً؛ الغضب على الوقت الضائع (تخمينا ليلة ٢٢–٢٣ ثم تنفيذ «use standard card» بلا تأكيد). **لا شيء مكسور معلوم.**
- **الفعل التالي:** انتظر أمره. لو ذكر شيئاً مكسوراً → رجوع فوري (النسخة القديمة للشريط في `git show 1e5a62f:modonty/components/shared/industry-cards/IndustryCards.tsx` + برَب `hideAllCard`؛ أو `git revert e443146`).

### ✅ المنجز
1. **`hh>` + `pl>modonty`:** السيرفر كان مطفأ → شُغّل (`pnpm dev` في `modonty/`، Ready 2.5s). الرئيسية 200، ٤٠٤ واحد على صورة بني `post/مختبرات-الأطباء/webp-fvyag5tve.webp` (أصلٌ مفقود، نفس ملاحظة ٢٢ أغسطس).
2. **بلاطة المجال الموحّدة** (أمر خالد مع لقطة من `/clients`: «use standard card in the industry page»):
   - **جديد** `modonty/components/shared/industry-tile/IndustryTile.tsx` — البلاطة الواحدة مستخرجة حرفياً من `IndustryGrid` (h-108 · دائرة size-11 بلون `toneForSlug` · الاسم · العدد).
   - `IndustryGrid.tsx` صار يستهلكها (الشبكة على `/industries`) — **HTML `/industries` مطابق بايت ببايت قبل/بعد** (`diff` على `<nav aria-label="تصفّح المجالات">` = ٠ سطر).
   - `IndustryCards.tsx` (الشريط الأفقي على `/clients`) أُعيدت كتابته: قائمة سحب أفقي من `IndustryTile` بعرض `w-[86px]` (= عرض بلاطة الشبكة على ٣٩٠)؛ حُذفت البرَبات الميتة `allHref` · `hideAllCard` · `featured` · `countKind`.
   - **جديد** `modonty/lib/industry-artwork.ts` — `industryArtwork()` يرجّع `null` للشعار الافتراضي `platform-default-logo` (كان مكرَّراً داخل `IndustriesCards`؛ الآن يستعمله `IndustriesCards` و`PartnersFilterBar`) → **شعار الروبوت المكرّر اختفى من شريط `/clients`**، وبطاقة «الأنشط» والشريط العلوي الملوّن راحا معه.
   - `PartnersFilterBar.tsx`: `clearHref` (البلاطة المضاءة ترجع للكل) بدل `allHref`/`hideAllCard`.
   - **الدليل:** `/clients` 200 · ١٦ بلاطة `w-[86px]` · صفر `w-[118px]` · صفر `platform-default-logo` داخل الشريط · صفر `الأنشط` · صفر أخطاء كونسول · لقطة ٣٩٠.
3. **الدفع (بأمر «ready to push» ثم «without backup»):**
   - `tsc` **exit=0** على modonty · admin · console (ناتج طازج).
   - النسخة: modonty `1.95.0 → 1.96.0` · shared `0.3.1 → 0.3.2`.
   - تشينج لوق `1.96.0 (modonty)` أُدخل للقاعدتين عبر `admin/scripts/add-changelog.ts` (محلي `modonty_dev` — متحقَّق من السطر المفعَّل في `.env.shared:19` — وإنتاج `modonty`): LOCAL `6a8a3f4b16784a8e81390430` · PROD `6a8a3f4b16784a8e81390431`.
   - **باك أب: لم يُنفَّذ** بأمر خالد.
   - الكوميت `e443146` «جوّال مدونتي والشركاء: سكرول لانهائي وأيقونات البراند وبلاطة المجال الموحّدة» — **١٢١ ملفاً** (كل شغل ٢١–٢٣ أغسطس غير المثبَّت: سكرول لانهائي `/modonty` · ٣٨ أيقونة · بلاطات `/clients` · ريلز أيقونات · الوثائق).
   - **مُستبعَد عمداً:** `.mcp.json` · `.claude/settings.local.json` · `.pnpm-store/` · `chrome cOmmand` (ملف مجهول بالجذر) · **`featured-partners-slider.tsx`** (يتيم معدَّل).
   - `git push origin modonty-ui` → `1e5a62f..e443146` · `rev-list --left-right --count` = **0 0**.
- **البناء:** لم يُشغَّل محلياً (فيرسل يبنيه من الفرع). **التست الحي:** curl + Playwright ٣٩٠ على `/clients`، وHTML `/industries` قبل/بعد.

### 📝 قرارات (بأسبابها)
- **الريلز دخلت الدفع** — ملفّاها المعدَّلان جزء من تمرير الأيقونات (ماركات بدل لوسيد · ألوان توكن بدل hex · أعداد عربية)، والريلز مثبَّتة في git من ٢٠ أغسطس (`a6aa328`). ذاكرة «الريلز WIP يُستثنى من الدفع» (٢٣ يوليو) **قديمة وحُذفت** من الذاكرة والفهرس. سطر «الريلز تُستثنى» في بلوك الفجر كان صدى لها.
- **البلاطة مكوّن واحد لا نسختان** — الشبكة والشريط يختلفان في التخطيط فقط؛ `IndustryTile` يمنع انحراف النسختين (نفس مبدأ «use the same component» ٢١ أغسطس).
- **`IndustryCards` بقي اسمه ومكانه** (مستهلك واحد `/clients`) — إعادة كتابة لا حذف، لتفادي لمس الاستيرادات بلا داعٍ.
- **🔴 درس الجلسة (سُجّل في الذاكرة `feedback_confirm_page_and_element_before_building`):** أمر واجهة قصير يحتمل قراءتين (أي صفحة · أي عنصر · أي اتجاه) → **سطر تأكيد واحد ثم انتظار** قبل أول سطر كود. ليلة ٢٢–٢٣ ضاعت على تخمينين، واليوم نفّذت «use standard card» بلا تأكيد. الرجوع أغلى من السؤال.

### 🚧 معلّق / محجوب
- **`featured-partners-slider.tsx`** — يتيم معدَّل، خارج الكوميت — حذف أم إبقاء؟ قرار خالد.
- **`chrome cOmmand`** — ملف مجهول في جذر المستودع، غير مثبَّت؛ ما فتحته. يُسأل عنه.
- توحيد عرض البلاطات الثلاث على `/clients` (تقصير «شركاء موثوقون») — ما رُدّ عليه.
- بند TASK.md: سكيلتون أثناء بحث المقالات — لم يُلمس.
- تحقّق `test.modonty.com` بعد بناء `e443146` — **لم يُنفَّذ**.
- المعلّقات الثابتة كما هي (أعلى الملف).

### 📂 الملفات
- `modonty/components/shared/industry-tile/IndustryTile.tsx` — **جديد**، البلاطة الموحّدة.
- `modonty/components/shared/industry-grid/IndustryGrid.tsx` — يستهلك `IndustryTile`؛ ناتجه مطابق.
- `modonty/components/shared/industry-cards/IndustryCards.tsx` — شريط أفقي من `IndustryTile`، برَبات مبسَّطة.
- `modonty/lib/industry-artwork.ts` — **جديد**، فلتر الشعار الافتراضي.
- `modonty/app/(site)/industries/components/industries-cards/IndustriesCards.tsx` · `modonty/app/(site)/clients/components/partners-filter-bar/PartnersFilterBar.tsx` — يستعملان الهيلبر؛ الثاني يمرّر `clearHref`.
- `modonty/package.json` (1.96.0) · `shared/package.json` (0.3.2) · `admin/scripts/add-changelog.ts` (بند 1.96.0).
- الذاكرة: **+** `feedback_confirm_page_and_element_before_building.md` · **−** `project_reels_wip_exclude_from_push.md`.

### 🔁 حالة git / النشر
- الفرع `modonty-ui` · آخر كوميت `e443146` · **مدفوع** (`0 0`).
- غير مثبَّت (مقصود، ٥): `.mcp.json` · `.claude/settings.local.json` · `.pnpm-store/` · `chrome cOmmand` · `modonty/app/(site)/clients/components/featured-partners-slider.tsx`.
- `test.modonty.com` يبني من `e443146` — **لم يُتحقَّق**. لا merge إلى `main`.

### 🚀 الرجوع في ٣٠ ثانية
1. `git log --oneline -1` ← `e443146`؛ `git status --porcelain | wc -l` ← ٥.
2. افتح `.playwright-mcp/clients-390-standard-tiles.png` — الحالة الأخيرة لشريط `/clients`.
3. **أوّل شيء:** اسأل خالد هل فيه شيء مكسور يبيه يرجع؛ وإلا انتظر أمره — ولا تنفّذ أي أمر واجهة مبهم بلا سطر تأكيد.

---

---

## Session: 2026-08-23 (فجراً) — 📱 `/clients` جوّال: صفّ البلاطات الثلاث (موثوقون · كل الشركاء · المميّزون) بعد ليلة تصحيحات متتالية؛ و`/industries` رجعت كما كانت حرفياً (فرع `modonty-ui` · **١٢٩ ملفاً غير مثبَّت** · **لم يُدفع**)

### 🎯 أين توقفت
- **آخر حالة مقبولة على `/clients` جوّال (٣٩٠):** صفّ ثلاث بلاطات ممتدة بالتساوي فوق شريط المجالات الأفقي — «شركاء موثوقون / كيف نتأكّد؟» (الدرع، تفتح `/about`) · «كل الشركاء / ٢٩ شريكاً» (`ModontyPartnerMark` الـM بالماسة، على `bg-primary`، ترجع للدليل الكامل) · «المميّزون / نخبة الشركاء» (النجمة على كهرماني فاتح `amber-100→200`، نفس فلتر `?featured`) — أيقونة كل بلاطة بجانب نصّها بسطر واحد، حشوة `py-2`. آخر لقطة: `.playwright-mcp/clients-390-tiles-inline.png`.
- **الفعل التالي:** خالد لمّح لتوحيد عرض البلاطات (بلاطة الدرع أعرض بصرياً لطول نصّها — اقتراحي: تقصير عنوانها) — **ما ردّ بعد**. أو يكمل على صفحة أخرى.
- ⚠️ **لا شيء مثبَّت** — ١٢٩ ملفاً، وHEAD تقدّم إلى `1e5a62f` (كوميت تنظيف الأفكار).

### ✅ المنجز هذه الجلسة (بترتيبها الزمني — الليلة كانت تصحيحات متتالية)
1. **سوء فهم مزدوج انحلّ برجوع كامل:** «the industray make vertical» فُهمت غلط مرّتين — بنيت ريل رأسي مشترك على `/industries` (خالد: «Return it as it was. We are always talking about the clients») ثم سلايدر رأسي تلقائي على `/clients` (خالد: «no no... beside each other, I can scroll with my hand» ثم «make it as it was before»). **النتيجة النهائية:** `/industries` رجعت لما قبل أي لمسة (الشبكة الرباعية + «اختر من فوق»)، و`/clients` رجعت لنسخة الكوميت (`IndustryCards` الشريط الأفقي + `PartnersFilterBar`) — تحقّق بـ`git diff` صفر أسطر على `PageLayout` و`page.tsx` قبل تعديلات البلاطات اللاحقة.
2. **ملفات التجارب حُذفت كلّها:** `components/shared/industries-rail/` · `clients/components/industries-rail-mobile/` · `clients/components/industries-slider-mobile/` · `industries/components/industries-rail-nav/` — صفر بقايا (`grep` = لا نتائج). `IndustryGrid` المشترك حُذف ثم **أُعيد** مع رجوع `/industries`، و`IndustryCards` أُعيد من الكوميت مع إصلاح سطرَي الاستيراد فقط (`@/lib/format-counts` و`@/lib/industry-tones` — الهيلبرز انتقلت لـ`lib/` قبل الرجوع).
3. **سلايدر المميّزين (الصور) انشال من `/clients`** بأمر «remove image slider» — ملفه `featured-partners-slider.tsx` باقٍ على القرص معدَّلاً (صار رأسياً) **بلا أي مستهلك**؛ قرار حذفه النهائي عند خالد.
4. **بلاطة الثقة:** نصّها الكامل → أيقونة فقط → الوجهة صارت `/about` بدل `/trust` → ثم رجعت عنوان+كلمة مع التمدد (تسلسل أوامر خالد). `TrustStripMobile.tsx` الآن: درع + «شركاء موثوقون» + «كيف نتأكّد؟».
5. **«المميّزون» و«الكل» خرجتا من الشريط لصفّ البلاطات:** `IndustryCards` كسب برَب `hideAllCard` (البطاقة الكبيرة `h-[136px] w-[104px]` اختفت من HTML — grep = 0)، وبطاقة المميّزون الكهرمانية ما عادت تُمرَّر. كونتراست نجمة المميّزون أُصلح بطلب خالد (`amber-400→500` كانت تبلع العلامة → `amber-100→200`).
6. **أيقونة «الكل» صارت `ModontyPartnerMark`** (الـM بالماسة التركوازية) بأمر «use this icon» — الماسة `hsl(var(--accent))` على البنفسجي، مطابقة لقاعدة «الماسة دائماً أكسنت».
- **حالة tsc:** لم يُشغَّل (قاعدة «ممنوع tsc إلا بطلب»). **البناء:** لم يُشغَّل. **التست الحي:** كل خطوة تحقّقت بـcurl خام (200 + grep على الـHTML) ولقطات Playwright ٣٩٠ في `.playwright-mcp/` (آخرها `clients-390-tiles-inline.png`).

### 📝 قرارات اتُّخذت
- **«دائماً نتكلم عن العملاء»** — أي أمر واجهة مبهم في هذه الموجة نطاقه `/clients`، لا `/industries`. (السبب المباشر لضياع ساعة الليلة.)
- **الرجوع الحرفي يتم من git لا من الذاكرة** — `git show HEAD:` ثم كتابة الملف، مع إصلاح مسارات الاستيراد التي تغيّرت بعد الكوميت فقط. (`git checkout --` محجوب صلاحيةً على هذا الجهاز.)
- **الضغط في متصفح Playwright وخالد يتصفّح فيه = تلويث** — ضغطة «السياحة العلاجية» هبطت على صفحته المفتوحة `/clients` وأربكت التشخيص. ما دام يتصفّح بنفس النافذة: قراءة فقط، والتحقّق بـcurl.

### 🚧 معلّق / محجوب
- توحيد عرض البلاطات الثلاث (اقتراح تقصير «شركاء موثوقون») — بانتظار ردّ خالد.
- `featured-partners-slider.tsx` معدَّل ويتيم — حذف أم إبقاء؟ قرار خالد.
- بند TASK.md المفتوح: سكيلتون أثناء بحث المقالات — لم يُلمس الليلة.
- الدفع: ١٢٩ ملفاً بانتظار أمر صريح (الريلز تُستثنى من أي دفع — WIP).

### 📂 أبرز الملفات الملموسة (نهاية الليلة)
- `modonty/app/(site)/clients/components/page-layout/PageLayout.tsx` — صفّ البلاطات الثلاث (فرقه عن الكوميت: الصفّ الجديد + `hideAllCard`).
- `modonty/app/(site)/clients/components/trust-card/TrustStripMobile.tsx` — درع + عنوان + «كيف نتأكّد؟»، تفتح `/about`، `flex-1`.
- `modonty/app/(site)/clients/components/partners-filter-bar/PartnersFilterBar.tsx` — بلا برَب `featuredCount`، يمرّر `hideAllCard`.
- `modonty/components/shared/industry-cards/IndustryCards.tsx` — نسخة الكوميت + مسارا استيراد `lib/` + برَب `hideAllCard`.
- `modonty/app/(site)/industries/**` — رجعت كما في الكوميت (الشبكة والنص القديم)، والهيلبرز في `lib/` كما كانت قبل الجلسة.

### 🔁 حالة git / النشر
- الفرع: `modonty-ui` · آخر كوميت: `1e5a62f` «إقفال التنظيف: الفكرة صارت بطاقة لا ملف» · **غير مدفوع** · ١٢٩ ملفاً غير مثبَّت.
- `test.modonty.com` يتغذّى من الفرع — آخر ما عليه هو آخر دفعة سابقة، **لا شيء من شغل اليوم**.

### 🚀 الرجوع في ٣٠ ثانية
1. `hh>` ثم افتح `.playwright-mcp/clients-390-tiles-inline.png` — هذي الحالة المعتمدة الأخيرة.
2. شغّل `pnpm dev` (إن ما كان شغّالاً) وافتح `localhost:3000/clients` على ٣٩٠.
3. أول قرار: توحيد عرض البلاطات الثلاث أم الانتقال لصفحة أخرى — اسأل خالد.

---

---

## Session: 2026-08-22 23:45 — 📱 **`/modonty` على الجوّال أُقفلت**: سكرول لانهائي (وعطلٌ في المحرّك المشترك) · ٣٨ أيقونة معتمدة استُخرجت · حفظ يطلب حساباً · «تابع مدونتي» بدل «صِر شريكاً» (فرع `modonty-ui` · **١٠٥ ملفات غير مثبَّتة** · **لم يُدفع**)

### 🎯 أين توقفت
- **الصفحة مقفولة** — البنود الخمسة التي عدّدها خالد أُغلقت كلّها.
- **الفعل التالي:** خالد قال «let's move to the other page» — اختر الصفحة، أو ثبّت وادفع الـ١٠٥ ملفاً أولاً.
- **⚠️ لا شيء مثبَّت.** كل شغل اليوم في مساحة العمل فقط.

### ✅ المنجز

**١· سكرول لانهائي على `/modonty` + عطلٌ حقيقيّ في المحرّك المشترك:**
- بنيت `MoreModontyArticles.tsx` + `MoreModontyArticlesOnScroll.tsx` فوق `shared/components/infinite-list` — نفس المحرّك الذي تشغّله الرئيسية و`/articles`، لا تطبيق ثالث.
- **العطل:** `IntersectionObserver` يبلّغ عن **الانتقال** لا الحالة. حدثُ تقاطع يصل والجلبُ جارٍ يصطدم بحارس `loadingRef` ويخرج — **والحدث يُبتلع بلا تعويض**؛ فإن بقي الحسّاس على الشاشة لحظة وصول الردّ، لا انتقال جديد أبداً → القائمة تتجمّد للأبد.
- مقيس على `/articles`: سكرول متدرّج يعمل، لكن **القفز الفوري للأسفل جمّدها عند ٤٠ بطاقة — ستّ جولات، صفر جلب**، والحسّاس عند `top: 57` داخل الشاشة. سحبة الجوّال السريعة (fling) تنتج نفس التسلسل.
- **الإصلاح** في `shared/components/infinite-list.tsx`: بعد كل جلب يستقرّ، المحرّك يسأل الحسّاس أين هو بدل أن ينتظر أن يُخبَر (نفس هامش الـ`100px`).
- **بعد الإصلاح:** `20 → 40 → 60 → 80 → 100 → 117` وينتهي بـ«خلصت المقالات — ١١٧ مقالاً» · صفر مكرّر · جلب واحد لكل صفحة.
- **اختبار عنيف مرّ:** سكرول متدرّج · قفزات فورية متكرّرة · سحب ×٤٠ · هبوط مباشر على `?page=2` · العروض المفلترة.

**٢· ٣٨ أيقونة معتمدة استُخرجت من المرجع** (`documents/design/modonty_icon_system_MASTER_COMPLETE.html`):
- الملف الأول (`_MASTER_REFERENCE.html`) **وثيقة حَوكمة بلا رسم واحد** — ثلاث مطابقات كلّها نصّ. الثاني يحمل ٣٨ عنصر `<svg>` مع `data-icon-id`.
- ١١ ماركة **استُبدلت** بالأصل المعتمد (`booking · bookmark · comment · home · like · login · logout · question · reels · search · shopping`) و**٢٧ جديدة**.
- **الماسة موحَّدة على ٢٦ ماركة**: كانت بتسعة أحجام (٨ · ١٠ · ١٢ · ١٤ · ١٦ · ١٧ · ١٨ · ٢٠ · ٦٠) ← صارت **١٤×١٤ · rx 2 · ٤٥°** ومركزها هو مركز الدوران.
- **الماسة أكسنت افتراضياً** في ٤٣ ملفّاً: `hsl(var(--accent))` بدل `currentColor`.
- أربع ماركات بنيتها بيدي بالمعيار نفسه لعدم وجود معتمد: `arrow` · `calendar` · `audio` · `articles`. و`reels` أُعيد رسمها لأن المعتمد ينهار عند ٢٠px.
- **صفر أيقونة لوسيد** في واجهة الجوّال التسعة كلّها.

**٣· الاحتفاظ بالمشترك:**
- زرّ **حفظ** في كل بطاقة يفتح نافذة الدخول لغير المسجَّل (`action="save"`)، ولا يتفاءل بالامتلاء لأنه لا يعرف الجلسة — يعتمد جواب السيرفر.
- **«تابع مدونتي»** أخذ الزرّ الأساسي في الشريط السفلي، و**«صِر شريكاً» نزل ثانوياً** — ٦٥px من كل شاشة كانت تسوق قارئاً إلى موقع بيع.
- `AuthPrompt` تعلّم `action="follow"`.

**٤· الشريط الجانبي «تعرّف علينا» أُخفي على الجوّال** — الصفحة **٣٧٩٤ ← ٣٠٩٦** بكسل. (ينقض قرار ٢١ أغسطس بأمر خالد.)

**٥· البنود الخمسة الأخيرة:**
- صور بني: **سحبت الإنذار** — العشرة ترجع `200` في `0.1–0.4s`؛ الـ٦٫٤ ثانية كانت حافة باردة لا عطلاً.
- `--sticky-chrome` توكن واحد: `8.4375rem` جوّال · `3.5rem` من ١٠٢٤ فوق. والشريطان الآخران (`articles/[slug]` · `AudioTabs`) ارتبطا به بدل `top-14`.
- **الفلترة صارت تسكرل**: `sortBy: "popular"` جديد (يرتّب بـ`viewsCount` بلا `featured`) و`view=audio` يفلتر `hasAudio`.
- `metadata.pagination` أُضيف — `<link rel="prev|next">` مقيس على الصفحتين.

**٦· الترقيم كان منسوخاً في خمسة ملفّات** وقد تفرّق (ثلاثة بهدف ٤٤px واثنان بلا) ← مكوّن واحد `components/shared/pagination/FeedPagination.tsx` يستعمله ثلاثة.

**٧· حالة الفحص:** `pnpm tsc --noEmit` على مدونتي **exit=0** · البناء **لم يُشغَّل** · خمسة مسارات ترد **200**: `/modonty` · `?view=popular` · `?view=audio` · `/articles` · `/audio`.

### 📝 قرارات (بأسبابها)
- **🔴 سحبت اقتراحي بحذف `industries` و`partner`** — فتحت `shared/assets/brand/README.md` قبل الحذف فوجدتهما **علامتين رسميّتين معتمدتين بعقد دمج مكتوب**، ورسمهما مطابق حرفياً لمكوّناتنا. رجّعت التبديل في أربعة ملفّات و`git diff --stat` عليها فاضٍ. **لولا فتح المجلّد لمُسحت علامتان معتمدتان.**
- **رفضت السكرول اللانهائي أوّلاً بحجّة «١٢ مقالاً فقط» — وكان خطأً.** خالد: «it's not fixed twelve article». العدد لقطة لناشرٍ ينشر؛ التصميم على لقطة ينكسر بصمت يوم تتغيّر.
- **«المقالات» غمّقته بلا قياس ثم رجّعته** — على لقطة خالد في الوضع الفاتح، `162/72/26` بجنب `186/95/24` قُرئا لوناً واحداً. رجع إلى `--action-listen` (٢٨° و١٨ نقطة إضاءة).
- **«الطلّات» وحده احتاج توكناً خاصاً** (`--tab-reels: 186 95% 24%`) لأن بلاطته كانت **هي** `--accent` حرفياً — أكسنت على أكسنت يختفي.
- **السكرول والروابط معاً لا أحدهما.** نصّ Next الرسمي: «content that requires user interaction… will not be visible to crawlers that do not execute JavaScript». الروابط تختفي بصرياً بـ`data-infinite-live` (تُضاف في المتصفّح فقط) وتبقى في الـHTML الخام — مُتحقَّق بـ`curl`.
- **حجم الصفحة ١٠ صحيح** — الكرت ١٧٣px، الشاشة الصافية ٦٤٤ ← ٣٫٧ كرت/شاشة ← ١٠ = **٢٫٧ شاشة**. والحمولة ١٣ كيلوبايت للجلبة.
- **سطر الهيرو كان عرضاً بيعياً لقارئ** — فُصل عن `description` في القاعدة إلى `messages.modonty.readerPromise`: «مقالات تستاهل وقتك — من أهل التخصص.»

### 🚧 معلّق
- **الدفع** — ١٠٥ ملفات غير مثبَّتة، ولا كوميت واحد اليوم. ينتظر أمر خالد.
- **غير مُختبَر:** جهاز لمس حقيقي · شبكة بطيئة ومسار إعادة المحاولة · عرض الديسكتوب بعد تغييرات اليوم.
- **٤٠٤ في صور `/articles`** أثناء السكرول — ظهرت في الكونسول، خارج نطاق صفحة مدونتي، لم تُفحص.
- **`--tab-articles`** حُذف من التوكنات (صار ميتاً بعد التراجع) — تأكّد أنه ما بقي له أثر.

### 📂 أهمّ الملفات
- `shared/components/infinite-list.tsx` — **إصلاح تجمّد السكرول** (إعادة فحص بعد كل جلب).
- `shared/components/icons/` — ٣٨ مستخرَجة + ٤ مبنيّة + توحيد الماسة (٤٣ ملفّاً).
- `modonty/app/(site)/modonty/components/articles-feed/` — `MoreModontyArticles` · `MoreModontyArticlesOnScroll` · `FeedFilterMenu` · `feed-views` · `ModontyArticlesFeed`.
- `modonty/components/shared/pagination/FeedPagination.tsx` — جديد، يستعمله ثلاثة.
- `modonty/components/feed/postcard/MobilePostCard.tsx` + `SavePostButton.tsx` — الكرت المعتمد + الحفظ.
- `modonty/components/shared/mobile-cta-bar/` — `FollowCtaButton.tsx` جديد + `primarySlot`.
- `modonty/lib/articles/` — `favorite-article` وحارساه رُفعوا خارج مجلّد المسار.
- `modonty/app/globals.css` · `tailwind.config.ts` — `--sticky-chrome` · `--tab-reels` · إخفاء الترقيم.
- `documents/design/DESIGN-SYSTEM.md` — معيارا أحجام الأيقونات (جوّال/ديسكتوب) + قاعدة التلوين.

### 🔁 حالة جِت
- **الفرع:** `modonty-ui` · **آخر كوميت:** `1e5a62f` · **مطابق للريموت** (`0 0`).
- **غير مثبَّت: ١٠٥ ملفات** (٦٠ معدَّل · ٤٠ جديد · ١ محذوف `MobileNavDestinations.tsx` · ٤ منقولة).
- **لم يُدفع · لا merge.**

### 🚀 الاستئناف في ٣٠ ثانية
1. `git status --porcelain | wc -l` ← لازم ١٠٥.
2. افتح `modonty/app/(site)/modonty/components/articles-feed/ModontyArticlesFeed.tsx`.
3. القرار: نثبّت وندفع شغل اليوم، ولّا ننتقل لصفحة ثانية ونتركه في مساحة العمل؟

---

---

## Session: 2026-08-22 (مساءً) — 🗂️ **تنظيف الوثائق كلّها**: ٨٧ ملف HTML ← واحد · شغلها المفتوح صار ١٩ بطاقة على اللوحة (فرع `modonty-ui` · `7118af1` · **مدفوع**)

### 🎯 أين توقفت
- **الشغل خلص ودُفع.** `git rev-list --left-right --count origin/modonty-ui...modonty-ui` = **0 0**.
- **الفعل التالي:** خالد قال «عندنا تاسك ثاني» — اختر بنداً من `TASK.html`.

### ✅ المنجز
- **`documents/HTML`: ٨٧ ملفاً متفرّقاً ← `وثائق-مدونتي.html` واحد** (ستّ وثائق بقائمة جانبية وإطار معزول لكل واحدة، ومرساة لكل وثيقة `#terms` … `#writers`). الطريق: جمع كل الـHTML المتفرّق ← تسمية عربية ومجلّدات بالموضوع ← نقل الشغل المفتوح بنوداً ← حذف المستهلَك ← دمج الباقي.
- **`documents/tasks`: ١١ مدخلاً ← أربعة** (`TASK.html` · `TECH-NOTES.md` · `CLAUDE.md` · `TODO.md`).
- **الأرشيف: ١١٥ ملفاً ← ١٥** — بقيت مصادر البراند وحدها (براند بوك رسمي PDF ١٦٫٨ ميجا + شعارات SVG + مصادر `SYNTHESIS.md`).
- **`documents/README.md`** صار خريطة واحدة: «أبحث عن… ← المكان» + كل مجلّد وهل يُكتب فيه + أربع قواعد ثابتة + قسم «معلوم ومقصود» لأربعة مسارات ميتة مذكورة في ملفّات قديمة.
- **١٩ بطاقة جديدة على اللوحة** (٣١١ بطاقة · صفر مكرّر): `SEC15` · `PRODDATA` · `CONTENTTEAM` · `QA7` · `SEO52` · `CAMERGE` · `LEGALPASTE` · `PARTNERPAGE` · `PARTNERSITE` · `PREV`(محدَّثة) · `REELS56` · `GEOAEO` · `HEALTHCHK` · `I18NSHARED` · `SMALLCODE` · `PENDDEC` · `BUNNYWH` · `BUNNYDASH` · `SCROLLATTR` · `UXREPORT` · `WHEEL` · `UX`(محدَّثة) + بورد **«📚 وثائق»** بستّ بطاقات.

### 🔧 أعطال أُصلحت أثناء التنظيف
- **صور دليل بوابة العملاء كانت مكسورة من قبل اليوم** — الدليل يطلب `img/01-dashboard.png` وهي في `console/mockups/console-guide/img/`. نُقلت الستّ عشرة إلى `HTML/img/` وأُضيفت بـ`git add -f` (تجاوز `.gitignore:66 *.png`) وإلا ما تظهر بعد `clone`.
- **خمسة أسطر تصف Cloudinary** في `admin/references/{UI-UX-STANDARD-PATTERN,CRUD-SEO-CACHE-FLOW}.md` — صارت `MediaImageField` + `MediaPickerDialog` + «الصورة تبقى في مكتبة الوسائط»، ولكل ملف بانر تحديث.
- **ثلاث إشارات صارت مكسورة بفعل الحذف** — `ModontyLeftRail.tsx` · `schema.prisma` · `TASK.html` — اكتُشفت بفتح `git diff` لا بعدّ `git status`، وأُصلحت.

### 📝 قرارات (بأسبابها)
- **🔴 رفضت اقتراحي أنا مرّتين بعد فتح المحتوى:** (١) اقترحت حذف ملفّات «الشركاء» الأربعة ثم فتحتها فوجدت موكباً بصرياً ونصّ جوجل الحرفي لا تحملهما اللوحة — قلت «اقتراحي كان غلط»، وخالد أمر بالحذف فنُفِّذ بعد التنبيه. (٢) اقترحت إفراغ الأرشيف ثم فتحته فوجدت الـ٢٠ ميجا **ملفاً واحداً**: براند بوك مودونتي الرسمي — فحُذف كل شيء عداه.
- **لم أنقل مجلّدات `documents/`** رغم إغراء التوحيد: قِسْت **٤٠+ إشارة** تعتمد على مساراتها. الترتيب البصري لا يستحق أربعين رابطاً مكسوراً — الخريطة تعطي الوضوح بلا كسر.
- **قاعدة «ملف لكل فكرة» أُلغيت** — الفكرة تُكتب بطاقةً على بورد «أفكار» مباشرة، ومجلّد `idea/` حُذف. (كان قرار خالد ١٧ أغسطس، ونُقض اليوم بأمره «ملف تاسك واحد».)
- **«شغل الفريق مش هنا» نُقض كذلك** — كان فصلاً ثبّته خالد ٦ أغسطس؛ صار بند `CONTENTTEAM` وذيل اللوحة حُدِّث.
- **لا رفع نسخة ولا تشينج لوق** — الكوميت وثائق وتعليقات فقط، صفر منطق وصفر سكيما.

### 🚧 معلّق بقرار خالد
- **`LEGALPASTE` 🔴** — الإنتاج يعرض نصّاً قانونياً **أقصر** من مسوّدتنا. مقيس بالجلب الحيّ: `/terms` ينقصه «طبيعة المنصّة» و«إخلاء المسؤولية» و«الحجز ونقل الطلب» و«حدود المسؤولية» · `/legal/privacy-policy` ينقصه «جهة التحكّم» و«الأساس النظامي» و«خصوصية الأطفال» و«إتلاف البيانات». الناقص هو ما يحمي مدونتي كوسيط. **بعد اللصق والتحقّق تُحذف الوثيقتان من الملف الموحّد.**
- بقيّة البنود الثمانية عشرة على اللوحة.

### 🔁 حالة جِت
- **الفرع:** `modonty-ui` · **آخر كوميت:** `7118af1` — ٢٥١ ملفاً · ٨٩١ إضافة · ٦٥١٩٦ حذفاً.
- **مدفوع:** ✅ `bfd1e68..7118af1` · التطابق **0 0**.
- **بوّابة الصحّة:** `pnpm tsc --noEmit` على الأدمن ومدونتي — **exit=0** على الاثنين.
- **غير مثبَّت (مقصود):** `.mcp.json` · `.claude/settings.local.json` · `.pnpm-store/`.

### 🚀 الاستئناف في ٣٠ ثانية
1. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/TASK.html` — كل شيء فيها.
2. الوثائق: `documents/HTML/وثائق-مدونتي.html` · الخريطة: `documents/README.md`.
3. أعلى بند ينتظر خالد: `LEGALPASTE`.

---

---

## Session: 2026-08-22 — 📱 **مرحلة الجوّال أُقفلت**: اسمع · القصّة · موقع الشريك · الرئيسية — ودُفعت (فرع `modonty-ui` · `bfd1e68` · **مدفوع ومنشور على test.modonty.com**)

### 🎯 أين توقفت
- **آخر بند: الدفع تمّ والنشرة تحقّقت.** لا شغل جوّال مفتوح.
- **الفعل التالي عند الرجوع:** اختر بنداً من `TASK.html` بورد «To Do» — السبعة المنقولة اليوم: `HOMEMOB` (high) · `PARTNERMOB` (high) · `MOBCHROME` · `ABOUTCARD` · `PROFILEMOB` · `I18NAUDIOSTORY` · `MOBSWEEP`.
- **قرار واحد ينتظر خالد:** «احجز/تسوّق» على الرئيسية — نصّ الزرّين ووجهتهما لم يُحسما (على `/modonty` حُسما: صِر شريكاً · عن مدونتي). داخل بند `HOMEMOB`.

### ✅ المنجز هذه الجلسة

**١· صفحة «اسمع» `/audio` — المقالات كانت مدفونة تحت القرآن**
- القياس قبل: «المقالات المسموعة» تبدأ عند **١٦٤٥٥ بكسل** على ٣٩٠ — الشاشة الخامسة والعشرين. زائر الجوّال لا يصلها أبداً.
- بُني `components/audio-tabs/AudioTabs.tsx` (سياق + شريط تبويبين لاصق + لوحة) — **«متعة الروح» · «زاد العقل»** (خالد سمّاهما). `AudioPanel` **يصير** العنصر ولا يضيف واحداً، لأن لفّ الرايل بـ`div` يكسر `lg:w-[300px]` على الديسكتوب.
- القارئ صار قرار جلسة في شريط واحد بدل زرّ يكرّر الاسم ١١٤ مرّة — واختيار السورة الواحدة بقي كاستثناء بزرّ حرف (خالد ٢٠ أغسطس: يسمع قرّاءً مختلفين لسور مختلفة).
- صفّ سور سريعة (الفاتحة · البقرة · الكهف · يس · الرحمن · الملك) · **«كمّل من وين وقفت»** في `localStorage` يُكتب كل ٥ ثوانٍ بعد أول نصف دقيقة · البطاقة ١٢٩ ← ٦٥ بكسل.
- **الناتج:** طول الصفحة **١٧٥٨٩ ← ٩٣١٢** · المقالات **١٦٤٥٥ ← ٢٧٤** · الديسكتوب `pageH 6041 · بطاقة 252×129 عند 397 · أعمدة "252px 252px 252px"` مطابق حرفياً.
- **مُختبَر حيّاً:** «الكهف» شغّلت `afs/018.mp3` · تبديل القارئ العام غيّر الـ١١٤ وأعاد السورة بصوت `maher/018.mp3` · البوكمارك رجع على `maher/002.mp3` عند الثانية ١٣٩٩.

**٢· صفحة القصّة `/story` — نُفِّذت بوكيل، وتُحقِّقت مستقلّاً**
- عطلان: ترتيب الأعمدة كان يعرض فهرس الفصول قبل العنوان (`<h1>` عند **١٢٠٥**)، وشعار مودونتي في أول فصل يُرسم **بارتفاع صفر** (`h-full` بنسبة لعنصر فليكس محكوم بـ`min-height`) — البطاقة الافتتاحية فاضية على كل جوّال.
- **الناتج:** `<h1>` **١٢٠٥ ← ٨٨** · أهداف < ٤٤ داخل المقال **٢٤ ← ٠** · شريط التقديم ٦ ← ٤٤ بكسل · الديسكتوب `pageH 1094` مطابق.
- **تحقّق مستقلّ بعد تسليم الوكيل:** ٣٩٠ → `pageH 2449 · h1 top 88 · smallInArticle 0 · overflow 0` — مطابق لتقريره.

**٣· موقع الشريك — خالد شكّك في توصيفي، وكان محقّاً**
- **«٤٢ عرضاً ثابتاً» كان أثر grep:** النمط يلقط `max-w-`/`min-w-` كمان. الحقيقة: ٩ `max-w-` · ٣ `min-w-` · **٢٤ أحجام أيقونات** · وعرض ثابت حقيقي **واحد** (`w-[210px]`).
- **الكسر الحقيقي سطران:** `gridTemplateColumns` مكتوبة **inline style** في `columns-footer.tsx:24` و`brand-footer.tsx:42` — فلا breakpoint يمسّها. على ٣٩٠: عمود ١٢٢ بكسل يطلع خارج الشاشة عند `left:-135` → **١٣٥ بكسل تمرير أفقي على كل صفحة لكل شريك** (الفوتر في الليآوت).
- **الحل:** القيمة انتقلت لخاصّية مخصّصة `--partner-footer-cols` وصنف `md:[grid-template-columns:var(...)]` صار يملك الخاصّية.
- **أهداف اللمس ٢٠ ← ٠** (المسح الكامل للجسم لا `<main>` وحده) في تسعة ملفّات مشتركة.
- **الناتج:** `m390 overflow 135 ← 0` على أربعة مسارات · `small 0` · الديسكتوب `pageH 2256` مطابق.

**٤· الرئيسية — الأعطال المقيسة أُغلقت**
- المسح أعطى ٢٢ هدفاً، **١٤ منها إيجابيات كاذبة** (عناوين المقالات تحمل `after:inset-0`، فالهدف الفعلي البطاقة كلها). الحقيقي سبعة.
- «الصفحة التالية» ٩٨×**٢٠** ← ١١٤×**٤٤** · ستّة روابط فوتر عرضها ٣١–٤٣ ← كلها ٤٤.
- **غلطة صحّحتها:** طبّقت `min-h-11` بلا نطاق فرفعت الارتفاع على الديسكتوب — قيّدتها بـ`max-lg:` وتأكّدت أن الديسكتوب رجع ٩٨×٢٠ بالضبط.

**٥· شريط الجوّال العلوي + القوائم**
- ثلاثة أعمدة والأوسط الواسع · الطلّات و«اسمع» صار لهما مدخل (ما كان لهما رابط في واجهة الجوّال كلها) · `/articles` أُضيف لقائمة الشيت · الحساب انتقل جنب البرغر · `aria-current` · ضغطة مرتدّة · `ModontyAudioMark` اكتملت بها عائلة الأيقونات.
- **مادّة الهيدر:** `backdrop-filter: blur(20px) saturate(180%)` للجوّال وحده + `prefers-reduced-transparency: reduce` يجعله معتماً. وانكشف أن **`@media` داخل `@media` تُسقَط بصمت** في هذا البناء.

**٦· `safe-area-inset`** — مشغّل «اسمع» كان بلا حماية (زرّ التشغيل تحت شريط الهوم) · وزرّا واتساب الشريك والتمرير في الرئيسية أخذا `env(safe-area-inset-bottom)`.

**٧· حالة الفحوص:** `tsc` صفر على **الثلاثة** (modonty · admin · console) — ناتج طازج قبل الدفع. صفر خطأ جافاسكربت في كل القياسات. **تست خالد على جهازه الحقيقي: أوكي.**

### 📝 قرارات وتصحيحات (بأسبابها)
- **🔴 تصحيح جوهري — «سلسلة `backdrop-blur` ميتة في هذا البناء» كان غلطاً.** القياس على ثلاث صفحات: فهرس المقال `blur(24px) saturate(1.5)` · اسمع والطلّات `blur(8px)` · و`backdrop-blur-sm` على `/about` يحسب `blur(4px)`. السلسلة تشتغل. الـ`none` سببه **واحد**: شفافية ويندوز مطفأة عند خالد فـ`prefers-reduced-transparency: reduce` يتحقّق. وبناءً على التشخيص الغلط كنتُ حذفت `backdrop-blur-sm` من الهيدر **فأسقطتُ التمويه عن الديسكتوب** — أُعيد الصنف. **وشريط فهرس المقال سليم، لا عطل فيه.**
- **التبويبان بدل تكديس على الجوّال** → نيّتان مستقلّتان (قرآن · مقالات مدونتي)، وأيّهما تحت الأخرى يُدفن. الديسكتوب بقي عمودين (قرار خالد ٢٠ أغسطس «عمودان لا تبويبان») — ما نُقض، فُصل بالمقاس.
- **القارئ العام لم يُلغِ اختيار السورة** → قرار خالد المسجّل في التعليقات يبقى؛ العام صار الافتراضي والخاصّ استثناء.
- **لوحة الجوّال حُذفت بعد إفراغها** → ملف بلا بند مفتوح ضجيج. البنود السبعة ونصّها الكامل + قائمة الثلاثين مساراً + قياسات الرئيسية نُقلت داخل `TASK.html` (متحقَّق: `stillReferencingOldFile: []`).
- **`caveman` سكيل ثُبِّت** (`~/.claude/skills/caveman/`، ٤٥٠ ألف تثبيت) بطلب خالد. لا يظهر كـ`/caveman` حتى إعادة تشغيل كلود كود؛ يشتغل بالكلام «caveman mode».

### 🚧 معلّق
- **قرار «احجز/تسوّق» على الرئيسية** — بند `HOMEMOB` في `TASK.html`، ينتظر خالد.
- **نقل نصوص `/audio` و`/story` إلى `messages/ar.json`** — بند `I18NAUDIOSTORY`. العقبة: المكوّنان `"use client"`، والقصّة سلسلتها ثلاث طبقات.
- **`brand-footer` — عطل مجاور أُصلح** (كان يرسم ثلاثة أعمدة والمسارات اثنان حين الخدمات فارغة).

### 📂 الملفّات (٨٥ في الكوميت — أبرزها)
- `modonty/app/(site)/audio/components/audio-tabs/AudioTabs.tsx` — **جديد**: سياق + شريط تبويبين + لوحة
- `modonty/app/(site)/audio/components/quran-player/QuranPlayer.tsx` — قارئ عام · سور سريعة · بوكمارك · بطاقة صفّ واحد · safe-area
- `modonty/app/(site)/audio/page.tsx` · `components/listen-queue/ListenQueue.tsx`
- `modonty/app/(site)/story/{SalesPitchPage,LogoSpotlight,TestimonialPlayer}.tsx`
- `shared/components/partner-site/free/footer/{columns-footer,brand-footer,centered-footer}.tsx` + `parts/{link-column,contact-column,legal-bar}.tsx`
- `shared/components/partner-site/free/header/{centered,classic,pill,transparent}-header.tsx` + `parts/mobile-menu.tsx` · `free/hero/cover-hero.tsx` · `free/contact/contact-cards.tsx` · `parts/whatsapp-button.tsx`
- `modonty/app/layout/components/nav/{TopNav,MobileMenu,MobileMenuClient,MobileNavDestinations}.tsx` · `helpers/nav-config.ts` · `components/Footer.tsx`
- `modonty/app/(site)/(homepage)/components/{page-layout/PageLayout,scroll-buttons/ScrollButtons}.tsx`
- `modonty/app/(partner)/clients/[slug]/components/{chrome/platform-bar,client-whatsapp-fab}.tsx`
- `shared/components/icons/modonty-audio-mark.tsx` — **جديد**
- `modonty/app/globals.css` · `modonty/messages/ar.json` · `modonty/package.json` (1.94.0 → **1.95.0**)
- `documents/tasks/TASK.html` — **٧ بنود جديدة** · `documents/tasks/MOBILE-UI-PAGES-2026-08-21.html` — **حُذف**

### 🔁 حالة جِت والنشر
- **الفرع:** `modonty-ui`
- **آخر كوميت:** `bfd1e68` — «واجهة الجوّال اكتملت: اسمع والقصّة وموقع الشريك والرئيسية»
- **مدفوع:** ✅ `5114b1c..bfd1e68` · `git rev-list --left-right --count origin/modonty-ui...modonty-ui` = **0 0**
- **غير مثبَّت (مقصود):** `.mcp.json` · `.claude/settings.local.json` · `.pnpm-store/` · `img-reqs.txt` · `mobile-uiux-mockup.html`
- **النشر:** ✅ `test.modonty.com/audio` = 200 ويحمل «متعة الروح» ×٢ · «زاد العقل» ×٢ · `<h1 class="sr-only">اسمع` · ونصّ النسخة القديمة «استمع إلى المقالات» = **٠**. البناء الذي كان متأخّراً أربع كوميتات لحق.
- **لا merge إلى `main`** — الفرع تجريبي على `test.modonty.com`.

### 🚀 الاستئناف في ٣٠ ثانية
1. `git log --oneline -3` — توقّع `bfd1e68` على الرأس، والشجرة نظيفة إلا الخمسة المستبعَدة.
2. افتح `file:///c:/Users/w2nad/Desktop/dreamToApp/MODONTY/documents/tasks/TASK.html` ← بورد «To Do» ← البنود السبعة.
3. القرار الأول: أيّ بند نبدأ — `HOMEMOB` (قرار الزرّين، ينتظرك) ولّا `PARTNERMOB` (ريفاكتور كامل، الأكبر)؟

---
