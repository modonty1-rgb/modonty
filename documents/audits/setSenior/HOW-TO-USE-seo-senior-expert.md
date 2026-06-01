# 📘 طريقة استخدام `seo-senior-expert` في VS Code

> ملف واحد فيه كل اللي تحتاجه: التثبيت، التحقق، الـ prompt الجاهز، أمثلة.

---

## 🔧 الجزء 1: التثبيت (مرة وحدة)

### الخطوات

```bash
# 1. حمّل seo-senior-expert.tar.gz لمجلد Modonty
cd ~/path/to/modonty

# 2. فك الضغط
tar -xzf seo-senior-expert.tar.gz

# 3. حضّر المجلد المخصص للمهارات
mkdir -p .claude/skills

# 4. انقل المهارة لمكانها الصحيح
mv seo-senior-expert .claude/skills/

# 5. تحقق من البنية
ls .claude/skills/seo-senior-expert/
# لازم تشوف: SKILL.md, INSTALL.md, references/

ls .claude/skills/seo-senior-expert/references/
# لازم تشوف 11 ملف .md

# 6. commit للريبو (عشان فريقك يحصل نفس السلوك)
git add .claude/skills/seo-senior-expert/
git commit -m "feat(skills): add seo-senior-expert skill for SEO audits"
```

### البنية النهائية المتوقعة

```
modonty/
├── .claude/
│   └── skills/
│       └── seo-senior-expert/
│           ├── SKILL.md
│           ├── INSTALL.md
│           └── references/
│               ├── arabic-rtl-seo.md
│               ├── content-quality-checks.md
│               ├── core-web-vitals.md
│               ├── crawlability-indexability.md
│               ├── external-audit-tools-mapping.md
│               ├── hreflang-international-seo.md
│               ├── images-seo.md
│               ├── jsonld-article-schema.md
│               ├── meta-tags-reference.md
│               ├── modonty-cached-seo-architecture.md
│               └── pre-publish-checklist.md
├── app/
├── prisma/
└── ...باقي ملفات المشروع
```

---

## ✅ الجزء 2: التحقق إن المهارة محمّلة

1. افتح Modonty في VS Code
2. افتح Claude Code panel (الأيقونة في الـ sidebar أو `Cmd/Ctrl+Shift+P` → اكتب "Claude")
3. ابدأ session جديد
4. اكتب في الـ prompt:

   ```
   /skills list
   ```

5. لازم تشوف `seo-senior-expert` في القائمة

لو ما ظهرت → تأكد إن المسار صحيح (`.claude/skills/seo-senior-expert/SKILL.md`) و أعد فتح VS Code.

---

## 🚀 الجزء 3: الـ Kickoff Prompt (الأهم)

> **هذا الـ prompt تنسخه وتلصقه في Claude Code panel أول مرة في الـ session.**
> هو يخبر Claude إنه في وضع "Senior SEO Engineer" ويحدد له القواعد.

### انسخ من هنا 👇

```
أنا خالد، مطور full-stack لـ Modonty (منصة SaaS عربية للمدونات والـ SEO).
الـ stack: Next.js App Router، React 19، TypeScript strict، tRPC،
Prisma + MongoDB، next-intl (ar/en)، shadcn/ui، Tailwind، Vercel + Turbopack.

عندك مهارة مثبّتة اسمها `seo-senior-expert` في
`.claude/skills/seo-senior-expert/`.

من الحين، أي شغل عندي يخص SEO (ميتا تاجز، JSON-LD، canonical،
hreflang، sitemap، robots، Core Web Vitals، Open Graph، Twitter Card،
generateMetadata، Prisma ArticleSEO schema، أي route handler يخص
المقالات) لازم تشتغل عليه كـ Senior SEO Engineer حسب هذه المهارة.

القواعد الإلزامية وأنت تشتغل:

1. اقرأ `.claude/skills/seo-senior-expert/SKILL.md` أول شيء قبل أي رد
2. اقرأ الملف المناسب من `references/` حسب نوع المهمة (الجدول موجود في SKILL.md)
3. زيرو تخمين — كل قاعدة لها مصدر رسمي (Google Search Central، Schema.org،
   Semrush KB، Ahrefs Help، web.dev)
4. خذ بعين الاعتبار معمارية cached-SEO في Modonty:
   كل بيانات السيو محسوبة ومخزنة في DB في جدول ArticleSEO،
   ووقت طلب الزائر فقط SELECT من الـ DB — لا حسابات وقت الطلب
5. للأكواد: TypeScript strict (لا any ولا unknown)، Server Components افتراضياً،
   simple + SOLID، feature-based structure، Prettier + ESLint clean
6. تنسيق الرد:
   - ✅ اللي تمام (مع المصدر)
   - ⚠️ يحتاج تعديل (مع السبب من Semrush/Ahrefs/Lighthouse + الإصلاح)
   - 🛑 مرفوض (مع البديل)
   - 📚 المراجع المستخدمة في الرد

بدل ما تجاوبني بمعلومات عامة، اقرأ المهارة وطبّق قواعدها.

أكد لي إنك قرأت SKILL.md وفهمت معمارية Modonty، وبعدها انتظر مهمتي الأولى.
```

### اللصق في VS Code

1. افتح Claude Code panel
2. ابدأ session جديد (مهم: session جديد لكل يوم شغل عادةً)
3. الصق الـ prompt اللي فوق
4. Claude لازم يرد بشيء مثل: "قرأت SKILL.md... فهمت معمارية Modonty cached-SEO... جاهز للمهمة الأولى."
5. الحين شغّله على أي مهمة SEO

---

## 💡 الجزء 4: أمثلة على الاستخدام اليومي

### مثال 1 — مراجعة كود `generateMetadata`

```
راجع لي هذا الـ generateMetadata:

[الصق الكود هنا]

أبي أتأكد إنه يتبع معمارية cached-SEO و يمر على كل فحوصات
Semrush و Lighthouse.
```

**ما يتوقع من Claude:**
- يقرأ `references/meta-tags-reference.md` و `references/modonty-cached-seo-architecture.md`
- يفحص الكود ضد 9 categories
- يطلع لك ✅ / ⚠️ / 🛑 مع المصادر

### مثال 2 — حل خطأ من Semrush

```
Semrush طلع لي هذا الـ error:
"Issues with hreflang values"

كيف أصلح هذا من جذره في الكود بحيث ما يرجع؟
```

**ما يتوقع من Claude:**
- يقرأ `references/external-audit-tools-mapping.md` (فيه هذا الـ error بالظبط)
- يقرأ `references/hreflang-international-seo.md`
- يقترح: assertion في `resolveHreflangVariants` + Zod schema + test يفشل لو القيم غلط

### مثال 3 — تصميم Prisma schema لـ ArticleSEO

```
صمم لي الـ Prisma model للـ ArticleSEO. أبي يغطي كل بيانات
السيو اللي نحتاجها لمقالة (meta tags + OG + Twitter + JSON-LD +
hreflang + sitemap metadata).
```

**ما يتوقع من Claude:**
- يقرأ `references/modonty-cached-seo-architecture.md` (فيه الـ schema الكامل)
- يعطيك الـ schema جاهز مع الـ indices الصحيحة

### مثال 4 — بناء JSON-LD builder

```
أبي أبني builder لـ BlogPosting JSON-LD في
app/lib/seo/jsonld/article.ts.
لازم يكون type-safe، مع Zod validation، ويستخدم schema-dts.
```

**ما يتوقع من Claude:**
- يقرأ `references/jsonld-article-schema.md`
- يعطيك الـ builder كامل مع assertions على headline ≤ 110 char،
  ISO 8601 dates، publisher.logo ImageObject، إلخ

### مثال 5 — تحسين Core Web Vitals

```
PageSpeed طلع LCP عندي 3.8s على صفحة المقالة. كيف أنزله تحت 2.5s؟
```

**ما يتوقع من Claude:**
- يقرأ `references/core-web-vitals.md`
- يفحص hero image، fonts، TTFB، ISR config
- يعطيك خطة محددة مع code patches

### مثال 6 — Pre-publish checklist

```
بنزل feature جديدة تخص SEO. اعطني الـ checklist اللي لازم
أتأكد إنها كلها passing قبل ما أعمل merge.
```

**ما يتوقع من Claude:**
- يقرأ `references/pre-publish-checklist.md`
- يطلع لك الـ 12 sections مع كل البنود

---

## 🔁 الجزء 5: تجديد الـ Kickoff كل session

كل ما تفتح Claude Code panel **session جديد**، الصق نفس الـ kickoff prompt
في البداية. هذا يضمن:
- Claude يقرأ `SKILL.md` فوراً
- الـ context الخاص بـ Modonty حاضر
- Response format موحد

**نصيحة:** احفظ الـ kickoff prompt في snippet في VS Code (`Cmd/Ctrl+Shift+P` →
"Snippets: Configure Snippets") عشان تلصقه بسرعة.

---

## 🛠 الجزء 6: تحديث المهارة لاحقاً

لو في قاعدة جديدة، خطأ مَطلع، أو تعديل في المعمارية:

```bash
# عدّل الملف المعني
code .claude/skills/seo-senior-expert/references/external-audit-tools-mapping.md

# Claude Code يلتقط التغيير في الـ session التالية (مش لازم restart)

# commit
git add .claude/skills/seo-senior-expert/
git commit -m "fix(skill): add new Semrush error to mapping"
```

---

## ⚠️ الجزء 7: ملاحظات مهمة

1. **المهارة project-level**: أي شخص يفتح Modonty repo بـ VS Code +
   Claude Code Extension يحصل نفس السلوك تلقائياً.

2. **CLAUDE.md عندك**: المهارة لا تتعارض مع `CLAUDE.md`.
   - `CLAUDE.md` → قواعد عامة كل session (TypeScript، no any، إلخ)
   - المهارة → تعليمات SEO المفصلة، تنشّط حسب السياق

3. **الـ Kickoff Prompt اختياري لكن موصى به**: نظرياً Claude Code يفعّل
   المهارة تلقائياً حسب الـ description. لكن الـ kickoff يضمن إنه يدخل
   "mode" واضح من أول رسالة.

4. **لا تنسخ كود من Stack Overflow وتلصقه**: المهارة كتبت عشان تمنع هذا.
   اطلب من Claude يكتب الكود، هو يطبق القواعد من المصادر الرسمية.

5. **لو لاحظت قاعدة ناقصة**: قول لي الخطأ اللي طلع من Semrush/Ahrefs،
   وأضيفها لـ `references/external-audit-tools-mapping.md`.

---

## 📋 الجزء 8: Cheat Sheet للنسخ السريع

### الـ Kickoff (انسخ والصق في بداية كل session)

```
طبّق مهارة seo-senior-expert من .claude/skills/. اقرأ SKILL.md
وأكّد فهمك لمعمارية Modonty cached-SEO. ثم انتظر مهمتي.
```

(نسخة قصيرة للاستخدام السريع — لكن الطويلة فوق أكمل وأضمن)

### الطلبات الشائعة

| المهمة | الـ prompt |
|--------|------------|
| مراجعة generateMetadata | `راجع generateMetadata في [file path] حسب seo-senior-expert` |
| حل خطأ Semrush | `Semrush طلع: "[error name]" — كيف أصلحها من الكود؟` |
| فحص JSON-LD | `افحص JSON-LD اللي يولده الـ builder في [file path]` |
| Pre-merge gate | `طبّق pre-publish-checklist على هذا الـ PR` |
| تحسين CWV | `LCP عندي [X]s، حسب core-web-vitals.md كيف أنزله؟` |

---

## 🎯 الجزء 9: إيش تتوقع بعد التطبيق

بعد أسبوعين من الاستخدام:
- ✅ صفر errors جديدة في Semrush Site Audit
- ✅ كل المقالات الجديدة تمر Rich Results Test من أول مرة
- ✅ Lighthouse SEO score = 100 على كل مقالة جديدة
- ✅ وقت الـ audit الشهري نزل من 8 ساعات لساعة واحدة
- ✅ زيرو re-work على ميتا تاجز

لو ما حدث هذا → في gap في المهارة، قولي أحدّثها.

---

**جاهز؟** نزّل المهارة، الصق الـ kickoff prompt، وابدأ مهمتك الأولى.
