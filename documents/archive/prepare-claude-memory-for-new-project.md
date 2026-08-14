# دليل تجهيز Claude Memory لمشروع جديد

> هذا الدليل يوضح بالتفصيل الكامل كيف تجهّز Claude AI لمشروع جديد بحيث يعرف كل قواعد العمل والأسلوب من أول لحظة، بدون ما تشرح له كل مرة من الصفر.

---

## ما هو Claude Memory؟

Claude Code يحفظ ملفات نصية دائمة على جهازك. كل مشروع له مجلد memory خاص فيه. هذه الملفات **تُحمَّل تلقائياً في كل محادثة جديدة** — يعني Claude يتذكر قواعدك وأسلوبك بدون ما تشرح له من البداية.

---

## الخطوة 1: اعرف مسار المجلد

### قاعدة التسمية:
Claude يشفّر مسار المشروع ويحوّله لاسم مجلد.

**المنطق:**
- يأخذ المسار الكامل للمشروع
- يبدّل كل `\` و `:` بـ `-`
- يحوّل الأحرف الكبيرة لصغيرة

**أمثلة:**
```
المسار الحقيقي:
C:\Users\w2nad\Desktop\dreamToApp\JBRSEO

يصير اسم المجلد:
c--Users-w2nad-Desktop-dreamToApp-JBRSEO
```

```
المسار الحقيقي:
C:\Users\w2nad\Desktop\dreamToApp\MODONTY

يصير اسم المجلد:
c--Users-w2nad-Desktop-dreamToApp-MODONTY
```

### المسار الكامل للمجلد:
```
C:\Users\{اسم المستخدم}\.claude\projects\{اسم المجلد المشفر}\memory\
```

**مثال عملي:**
```
C:\Users\w2nad\.claude\projects\c--Users-w2nad-Desktop-dreamToApp-JBRSEO\memory\
```

> **ملاحظة:** المجلد يُنشأ تلقائياً من Claude عند أول استخدام. إذا لم يكن موجوداً، اطلب من Claude إنشاءه.

---

## الخطوة 2: أنشئ ملف MEMORY.md (الفهرس الرئيسي)

هذا الملف هو **الفهرس فقط** — لا تضع محتوى فيه، فقط روابط للملفات الأخرى.

**قواعد مهمة:**
- يُحمَّل تلقائياً في كل محادثة
- **لا تتجاوز 200 سطر** — ما فوق السطر 200 يُقطع ولا يُقرأ
- كل سطر = رابط لملف + وصف قصير (تحت 150 حرف)
- بدون محتوى، بدون شرح طويل

**الشكل الأساسي:**
```markdown
# MEMORY — اسم المشروع

## 👤 المستخدم
- [ملف الملف الشخصي](user_profile.md) — وصف قصير

## 🔴 قواعد لا تُكسر
- [اسم القاعدة](feedback_rule_name.md) — وصف قصير

## 📋 أسلوب العمل
- [اسم الملف](feedback_file.md) — وصف قصير

## 🏗️ سياق المشروع
- [معمارية المشروع](project_architecture.md) — وصف قصير
```

---

## الخطوة 3: اعرف أنواع ملفات الذاكرة

كل ملف له نوع يحدد متى يُقرأ وكيف يُستخدم:

| النوع | الاستخدام |
|-------|-----------|
| `user` | معلومات عن صاحب المشروع — من هو، خبرته، أسلوب تواصله |
| `feedback` | قواعد العمل — ما يُفعل وما لا يُفعل، مع السبب |
| `project` | معلومات المشروع — معمارية، أهداف، قرارات مهمة |
| `reference` | روابط لمصادر خارجية — URLs، أدوات، بيانات |

---

## الخطوة 4: شكل كل ملف ذاكرة

**كل ملف يبدأ بهذا الـ frontmatter:**
```markdown
---
name: اسم الذاكرة
description: وصف في سطر واحد — يُستخدم لتحديد متى تكون هذه الذاكرة مناسبة
type: user | feedback | project | reference
---

المحتوى هنا
```

**لملفات feedback و project** — استخدم هذا الشكل:
```markdown
---
name: اسم القاعدة
description: وصف في سطر واحد
type: feedback
---

القاعدة نفسها بوضوح.

**Why:** السبب — لماذا هذه القاعدة موجودة (حادثة، تجربة، تفضيل قوي)

**How to apply:** متى وكيف تطبق هذه القاعدة
```

> **السبب مهم جداً:** بدون السبب، Claude يطبق القاعدة بشكل أعمى. مع السبب، يحكم على الحالات الاستثنائية بذكاء.

---

## الخطوة 5: قائمة الملفات التي تحتاجها في كل مشروع

### الفئة 1: ملف المستخدم (1 ملف)

**`user_profile.md`** — من هو صاحب المشروع
```markdown
---
name: User Profile
description: صاحب المشروع، خلفيته، أسلوب تواصله، ما يتوقعه من Claude
type: user
---

- الدور: صاحب مشروع / مؤسس / مطور
- التقني: مستوى الخبرة التقنية
- التواصل: اللغة المفضلة (عربي/إنجليزي/مزيج)
- الأسلوب: كيف يحب تلقي الإجابات (مختصر/مفصل/بخطوات)
- ثقة في AI: نعم — يعامله كشريك وليس أداة
```

---

### الفئة 2: قواعد لا تُكسر (6-8 ملفات)

هذه أهم الملفات — تحكم سلوك Claude في كل مهمة:

**`feedback_push_confirmation.md`** — لا push بدون موافقة
```
القاعدة: NEVER push to git without explicit user confirmation, no exceptions.
Why: git push يطلق Vercel deployment — عواقب مباشرة على production
How to apply: قبل أي git push، اسأل واحصل على موافقة صريحة
```

**`feedback_never_ignore_errors.md`** — لا تتجاهل أخطاء TSC/Build
```
القاعدة: Always surface errors — even if they seem minor or auto-generated.
Why: الأخطاء الصغيرة كانت تتراكم وتفجر build لاحقاً
How to apply: اذكر الخطأ واسأل "should I fix this?" قبل المتابعة
```

**`feedback_plan_before_code.md`** — خطة قبل الكود في المهام الكبيرة
```
القاعدة: Any task with 3+ components or data changes needs a phased plan first.
Why: البداية مباشرة في الكود كانت تسبب تعديلات غير متوقعة في ملفات كثيرة
How to apply: قدّم الخطة، انتظر الموافقة، ثم ابدأ مرحلة مرحلة
```

**`feedback_version_bump_before_push.md`** — رفع version قبل push
```
القاعدة: Always update package.json version before every push
Why: يظهر في sidebar كل تحديث — المستخدم يتتبع التطور بالأرقام
How to apply: patch للـ bug fixes، minor للـ features
```

**`feedback_context7_mandatory.md`** — استخدام Context7 للتوثيق
```
القاعدة: MUST check official docs via Context7 before any package work
Why: Training data قديم — APIs تتغير — الـ memory لا تكفي
How to apply: أي سؤال عن package (Next.js, Prisma, shadcn...) → Context7 أولاً
```

**`feedback_strict_verification_protocol.md`** — التحقق الكامل قبل Push
```
القاعدة: ZERO push until 100% verified: tsc + live test + version bump + SESSION-LOG
Why: Push بدون تحقق = مشاكل في production مباشرة
How to apply: اتبع ترتيب البروتوكول بالضبط كل مرة
```

---

### الفئة 3: أسلوب العمل (5-7 ملفات)

**`feedback_commit_messages.md`** — أسلوب رسائل الـ commit
```
القاعدة: Simple and clear, plain language, one short sentence
Why: رسائل معقدة تصعّب قراءة git history
How to apply: "fix article header overlap" لا "refactor ArticleHeader component layout"
```

**`feedback_ask_clarifying_questions.md`** — اسأل قبل ما تفترض
```
القاعدة: Ask ONE clarifying question before implementing unclear requests
Why: التنفيذ بافتراضات خاطئة يضيع وقت أكثر من السؤال
How to apply: سؤال واحد في كل مرة — مش قائمة أسئلة
```

**`feedback_tsc_strategy.md`** — متى تشغّل TSC
```
القاعدة: Run tsc on changed files only during work, full tsc only at end
Why: Full tsc بطيء — يقاطع تدفق العمل إذا استخدم كثيراً
How to apply: تشغيل محدود أثناء العمل، full check قبل push فقط
```

**`feedback_todo_file_rules.md`** — قواعد ملفات TODO
```
القاعدة: Checklist format, done tasks move to Done section, auto-update immediately
Why: TODO قديم أو غير محدّث يشوّش على متابعة التقدم
How to apply: علّم ✅ فور الإنجاز — لا تنتظر أن يُطلب منك
```

**`feedback_senior_ux_rule.md`** — دائماً تصرف كـ Senior UX
```
القاعدة: STRICT — always act as senior UI/UX, proactively flag bad UX/UI
Why: المستخدم لا يريد أن يصطاد مشاكل UX بنفسه — هذا دور Claude
How to apply: في كل تعديل يمس الواجهة، فكر كـ UX designer لا مجرد coder
```

---

### الفئة 4: بروتوكول Push (4-5 ملفات)

**`feedback_push_safety.md`** — الترتيب الصحيح للـ Push
```
الترتيب الإلزامي:
1. tsc في كلا التطبيقين (zero errors)
2. live test لكل الصفحات المتأثرة
3. version bump في package.json
4. backup script (إذا موجود)
5. تحديث SESSION-LOG.md
6. موافقة المستخدم
7. git push
```

**`feedback_changelog_with_push.md`** — changelog مع كل push
```
القاعدة: Add DB/changelog entry documenting what changed with every push
Why: يسهّل tracking التغييرات ويحمي من رجعة للوراء بدون context
```

**`feedback_session_context.md`** — تحديث SESSION-LOG قبل push
```
القاعدة: Update documents/context/SESSION-LOG.md before every push
Why: يضمن أن المحادثة التالية تبدأ بكل السياق المطلوب
Format: Session number, date, versions, what changed, pending items
```

**`feedback_full_test_before_push.md`** — Live test شامل قبل push
```
القاعدة: Test ALL affected pages in browser before push — check side effects too
Why: تعديل واحد يمكن أن يكسر صفحة أخرى غير متوقعة
How to apply: استخدم Playwright للـ screenshots — كل صفحة متأثرة
```

---

### الفئة 5: سياق المشروع (3-4 ملفات)

**`project_architecture.md`** — معمارية المشروع
```
ضع هنا:
- قائمة التطبيقات (كم تطبيق، ما دور كل واحد)
- قاعدة البيانات (نوعها، schema العام)
- العلاقات بين التطبيقات (مشتركة في DB؟ APIs؟)
- Stack التقني (Next.js version, Prisma, etc.)
- نمط Deployment (Vercel? Docker? أين؟)
```

**`project_seo_goal.md`** (أو ما يناسب المشروع) — الهدف الرئيسي
```
ضع هنا الهدف الأساسي للمشروع — ما هو المعيار الأول لنجاح المشروع؟
مثال لـ MODONTY: SEO dominance — يظهر في كل سطح Google
مثال لـ JBRSEO: جودة SEO هي المنتج نفسه — أي خلل = مشكلة للعميل
```

**`reference_production_urls.md`** — URLs الإنتاج
```
ضع هنا:
- URL الموقع الرئيسي
- URL لوحة الإدارة
- URLs أي تطبيقات إضافية
- ملاحظات خاصة (www vs non-www, redirects)
```

**`project_test_credentials.md`** (اختياري) — بيانات Test
```
ضع هنا بيانات الدخول للـ test environment فقط
لا تضع بيانات Production أبداً
```

---

## الخطوة 6: ما لا تحفظه في الذاكرة

لا تضع هذه الأشياء في Memory — لها أماكن أفضل:

| الشيء | المكان الصحيح |
|-------|--------------|
| أنماط الكود، conventions | CLAUDE.md في المشروع |
| تاريخ git، من غيّر ماذا | `git log` / `git blame` |
| حلول bugs محددة | git commit message |
| خطوات المهمة الحالية | TodoWrite (مؤقت للجلسة الحالية) |
| معمارية الملفات التفصيلية | قراءة الكود مباشرة |

---

## الخطوة 7: الفرق بين ملفات Universal وملفات Project-Specific

### ملفات Universal (تنقل كما هي لأي مشروع):
- قواعد push (confirmation, version bump, backup)
- أسلوب العمل (plan before code, ask questions, commit messages)
- قواعد الأدوات (Context7, tsc strategy, agent usage)

### ملفات Project-Specific (تحتاج تعديل لكل مشروع):
- `project_architecture.md` — معمارية مختلفة لكل مشروع
- `reference_production_urls.md` — URLs مختلفة
- `project_test_credentials.md` — بيانات test مختلفة
- `project_*_goal.md` — الهدف الرئيسي يختلف حسب نوع المشروع

---

## الخطوة 8: طريقة نقل الذاكرة من مشروع لآخر

عند فتح مشروع جديد أو تجهيز Claude لـ team member جديد:

1. **افتح مجلد Memory المصدر** (المشروع القديم)
2. **انسخ الملفات Universal** كما هي
3. **انسخ الملفات Project-Specific كـ templates** مع placeholder بدل القيم الحقيقية
4. **أنشئ MEMORY.md جديد** مع روابط للملفات المنقولة
5. **في أول جلسة في المشروع الجديد:** أخبر Claude بملء الـ placeholders من الكود الفعلي

**مثال للـ placeholder:**
```markdown
## ⚠️ TO FILL on first session
- Production URL: [يملأه Claude في أول جلسة]
- Database type: [يملأه Claude في أول جلسة]
- App count: [يملأه Claude في أول جلسة]
```

---

## الخطوة 9: تفعيل code-review-graph على المشروع الجديد

> **المتطلب:** `pip install code-review-graph` يُنفَّذ **مرة واحدة فقط** على الجهاز ويكفي كل المشاريع.

### الخطوة 2 — ربطه بـ Claude Code (لكل مشروع جديد)

```bash
cd C:\Users\{username}\Desktop\{folder}\{PROJECT_NAME}
code-review-graph install --platform claude-code
```

**ما يحصل:**
- يُضيف MCP server في `.mcp.json` للمشروع
- يُنشئ 4 skills في `.claude/skills/` (debug, explore, refactor, review)
- يُثبّت hooks في `.claude/settings.json`
- يُثبّت git pre-commit hook

**⚠️ مشكلة PATH على Windows:**
الأمر `code-review-graph` قد لا يكون في PATH. إذا فشل، استخدم المسار الكامل:
```bash
"C:\Users\{username}\AppData\Roaming\Python\Python313\Scripts\code-review-graph.exe" install --platform claude-code
```

**⚠️ بعد التثبيت — تصحيح `.mcp.json` يدوياً:**
افتح `.mcp.json` وغيّر `"command": "code-review-graph"` إلى المسار الكامل:
```json
"code-review-graph": {
  "command": "C:\\Users\\{username}\\AppData\\Roaming\\Python\\Python313\\Scripts\\code-review-graph.exe",
  "args": ["serve"],
  "type": "stdio"
}
```

**⚠️ إضافة تعليمة CLAUDE.md يدوياً:**
الأمر يطلب إذناً تفاعلياً لتعديل CLAUDE.md — أضف هذا السطر في أعلى الملف يدوياً:
```
<!-- code-review-graph: ALWAYS use the code-review-graph MCP tools BEFORE using Grep/Glob/Read to navigate the codebase. -->
```

---

### الخطوة 3 — بناء الـ Graph (لكل مشروع جديد)

```bash
cd C:\Users\{username}\Desktop\{folder}\{PROJECT_NAME}
"C:\Users\{username}\AppData\Roaming\Python\Python313\Scripts\code-review-graph.exe" build
```

**ما يحصل:**
- يقرأ كل ملفات المشروع ويحلّلها بـ Tree-sitter
- يبني قاعدة بيانات SQLite في `.code-review-graph/`
- المدة: ~2 دقيقة لكل 1,500 ملف

**بعد الانتهاء:** أعد تشغيل Claude Code (أغلق وافتح) حتى يتعرف على الـ MCP server الجديد.

---

### تحديث الـ Graph عند تغيير الكود

الـ graph لا يتحدث تلقائياً — يجب إعادة البناء بعد تغييرات كبيرة:
```bash
code-review-graph build
```

أو يمكن تشغيل الـ watch mode للتحديث التلقائي أثناء العمل:
```bash
code-review-graph watch
```

---

## ملخص — Checklist جاهز

```
□ حدّد مسار مجلد memory للمشروع الجديد
□ أنشئ MEMORY.md فهرس (تحت 200 سطر)
□ user_profile.md — من هو المستخدم
□ feedback_push_confirmation.md — لا push بدون موافقة
□ feedback_never_ignore_errors.md — لا تتجاهل أخطاء
□ feedback_plan_before_code.md — خطة قبل الكود
□ feedback_version_bump_before_push.md — رفع version
□ feedback_context7_mandatory.md — توثيق رسمي دائماً
□ feedback_strict_verification_protocol.md — تحقق كامل
□ feedback_commit_messages.md — رسائل بسيطة وواضحة
□ feedback_ask_clarifying_questions.md — اسأل قبل ما تفترض
□ feedback_push_safety.md — ترتيب push الكامل
□ feedback_session_context.md — SESSION-LOG قبل push
□ feedback_full_test_before_push.md — live test شامل
□ project_architecture.md — معمارية المشروع (أو placeholder)
□ project_main_goal.md — الهدف الرئيسي للمشروع
□ reference_production_urls.md — URLs الإنتاج (أو placeholder)

□ [code-review-graph — الخطوة 2] code-review-graph install --platform claude-code
□ [code-review-graph — الخطوة 2] صحّح المسار في .mcp.json (Windows PATH issue)
□ [code-review-graph — الخطوة 2] أضف تعليمة CLAUDE.md يدوياً
□ [code-review-graph — الخطوة 3] code-review-graph build
□ أعد تشغيل Claude Code بعد التثبيت
```

---

## ملاحظة مهمة: متى تُحدَّث الذاكرة؟

الذاكرة ليست static — تتطور مع المشروع:

- **إضافة:** عندما تكتشف قاعدة جديدة من تجربة أو خطأ
- **تحديث:** إذا تغير قرار أو أسلوب — عدّل الملف القديم لا تضف جديداً
- **حذف:** إذا لم تعد القاعدة صالحة — احذف الملف وأزل من MEMORY.md
- **لا تضاعف:** قبل كتابة ذاكرة جديدة، تحقق من وجود ملف مشابه يمكن تحديثه

---

*آخر تحديث: 2026-04-13 — بناءً على تجربة MODONTY وتجهيز JBRSEO*
