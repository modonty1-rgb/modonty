# خطة هجرة Shared Environment Variables — Modonty Monorepo

> **مستند تنفيذي لـ Claude Code**  
> **الهدف**: توحيد إدارة متغيرات البيئة المشتركة بين الـ apps الثلاث (`admin`, `modonty`, `console`) محلياً وعلى Vercel، بنفس النموذج الذهني، بدون كسر أي شيء يعمل حالياً.  
> **المبدأ الحاكم**: التغيير **إضافي** و**قابل للتراجع** و**مُتحقَّق منه** بمصادر رسمية.

---

## 🎯 ملخص تنفيذي

نريد أن يصبح ملف `MODONTY/.env.shared` **محلياً** هو المعادل الفيزيائي لـ **Shared Environment Variables** في Vercel. لما المتغير المشترك يتحدّث، يتحدّث في مكانين فقط (محلياً + Vercel) بدلاً من ٧ ملفات.

**قاعدة الأولوية الموحّدة (محلياً وعلى Vercel)**:

```
.env.local (per-app)   >   .env.shared (root)
Project-level on Vercel  >  Shared on Vercel
```

أي القيم الخاصة بمشروع معيّن تطغى دائماً على القيم المشتركة.

---

## 📚 المراجع الرسمية المعتمدة

كل قرار في هذا المستند مبني على مصدر رسمي. ممنوع الاجتهاد خارج هذه المراجع:

1. **Next.js — Environment Variable Load Order**:  
   https://nextjs.org/docs/app/guides/environment-variables  
   > "Environment variables are looked up in the following places, in order, stopping once the variable is found: process.env → .env.$(NODE_ENV).local → .env.local → .env.$(NODE_ENV) → .env"

2. **dotenv — Override Behavior**:  
   https://github.com/motdotla/dotenv#what-happens-to-environment-variables-that-were-already-set  
   > "By default, we will never modify any environment variables that have already been set. In particular, if there is a variable in your `.env` file which collides with one that already exists in your environment, then that variable will be skipped."

3. **Vercel — Shared Environment Variables**:  
   https://vercel.com/docs/environment-variables/shared-environment-variables  
   > "When a project-level and a Shared Environment Variable share the same key and environment, the project-level environment variable always overrides the Shared Environment Variable."

---

## 🔍 التشخيص الحالي (مُتحقَّق منه)

### بنية الـ Monorepo

```
MODONTY/
├── pnpm-workspace.yaml      ← packages: admin, modonty, console, dataLayer
├── package.json             ← root scripts (dev:admin, dev:modonty, dev:console)
├── .gitignore               ← يغطي .env, .env*.local, .env.production فقط
├── admin/
│   ├── next.config.ts       ← لا يحمّل env مخصص
│   ├── package.json         ← @modonty/admin v0.43.2
│   ├── .env
│   └── .env.local
├── modonty/
│   ├── next.config.ts       ← لا يحمّل env مخصص
│   ├── package.json         ← @modonty/modonty v1.42.0
│   ├── .env
│   └── .env.local
├── console/
│   ├── next.config.ts       ← لا يحمّل env مخصص
│   ├── .env
│   └── .env.local
└── dataLayer/
    ├── package.json         ← @modonty/database (Prisma schema مشترك)
    ├── .env
    └── .env.local
```

### الإصدارات

- Next.js: `^16.1.6` في كل الـ apps
- pnpm: `10.12.3`
- dotenv: `^16.6.1` (موجود في root + admin، **مفقود** في modonty و console)
- TypeScript: `^5` (strict)

### المشكلة الفعلية

- **٧ ملفات `.env*`** متفرقة → نفس القيم مكررة (DATABASE_URL, COHERE_API_KEY, GA4_PRIVATE_KEY, …)
- تحديث أي مفتاح يتطلب تعديل ٣–٤ ملفات يدوياً → خطر بشري
- الـ `.gitignore` يغطي الملفات الحالية بشكل صحيح، لكن **لا يغطي `.env.shared`** (لازم نضيفه)

---

## 🧠 النموذج الذهني الموحّد

| المفهوم | محلياً | على Vercel |
|---------|--------|-----------|
| **القيم المشتركة** | `MODONTY/.env.shared` | تبويب "Shared" في Team Settings |
| **القيم الخاصة بـ app** | `<app>/.env.local` | Project → Environment Variables |
| **قاعدة الأولوية** | local يطغى على shared | Project-level يطغى على Shared |
| **التحميل** | dotenv داخل `next.config.ts` | Vercel يحقن في `process.env` تلقائياً |

**نتيجة**: نفس العقلية، مكانان فيزيائيان مختلفان، صفر تعارض.

---

## ✅ معايير القبول الكلية (Definition of Done)

في نهاية التنفيذ، الكل يجب أن يكون True:

- [ ] `pnpm dev:admin` يشتغل بدون أخطاء env
- [ ] `pnpm dev:modonty` يشتغل بدون أخطاء env
- [ ] `pnpm dev:console` يشتغل بدون أخطاء env
- [ ] `pnpm build:all` ينجح
- [ ] DB يتصل في الـ ٣ apps
- [ ] APIs (Cohere/GA4/Serper) تشتغل في الـ apps اللي تستخدمها
- [ ] `MODONTY/.env.shared` موجود (محلياً، gitignored)
- [ ] `MODONTY/.env.shared.example` موجود (في git، بدون أسرار)
- [ ] `.gitignore` يغطي `.env.shared`
- [ ] على Vercel: المتغيرات المشتركة منقولة لتبويب Shared ومربوطة بالـ ٣ مشاريع
- [ ] على Vercel: نسخ Project-level المكررة محذوفة بعد التحقق
- [ ] الـ ٣ deployments نجحت بعد Redeploy

---

## 🚦 خطة التنفيذ المُرحَّلة (Phased Execution)

> **قاعدة حاكمة**: لا ننتقل لمرحلة قبل ما السابقة تحقق Acceptance Criteria كاملة.  
> لو فشلت أي مرحلة → Rollback فوري للمرحلة السابقة قبل التشخيص.

---

### 📋 Phase 0/4: التحضير

**الهدف**: تحضير البنية بدون لمس أي كود تطبيقي.

#### الملفات المتأثرة
- `MODONTY/.gitignore` (تعديل)
- `MODONTY/.env.shared.example` (إنشاء)
- `MODONTY/.env.shared` (إنشاء — محلياً فقط، بعد ما المستخدم يعبّيه)

#### الخطوات

**0.1 — تحديث `.gitignore`**

أضف السطرين التاليين تحت قسم `# Environment files`:

```diff
  # Environment files
  .env
  .env*.local
  .env.production
+ .env.shared
+ !.env.shared.example
```

السبب: `.env.shared` لازم لا يدخل git (يحتوي أسرار)، بينما `.env.shared.example` لازم يدخل git (قالب بدون أسرار).

**0.2 — إنشاء `MODONTY/.env.shared.example`**

ملف قالب يوضح وش هي المتغيرات المشتركة. لا يحتوي قيم حقيقية.

```env
# ════════════════════════════════════════════════════════════════
# Shared Environment Variables — Modonty Monorepo
# ════════════════════════════════════════════════════════════════
# هذا قالب. انسخه إلى .env.shared (gitignored) واملأ القيم الحقيقية.
# هذي المتغيرات تُحمّل تلقائياً في admin/modonty/console عبر next.config.ts
# قاعدة الأولوية: <app>/.env.local يطغى على هذا الملف
# ════════════════════════════════════════════════════════════════

# ─── Database (Prisma + MongoDB) ───
DATABASE_URL=

# ─── AI Services ───
COHERE_API_KEY=
OPENAI_API_KEY=

# ─── Search / SEO ───
SERPER_API_KEY=

# ─── Analytics ───
GA4_PROPERTY_ID=
GA4_PRIVATE_KEY=
GA4_CLIENT_EMAIL=

# ─── Auth (NextAuth) ───
NEXTAUTH_SECRET=
# NEXTAUTH_URL يبقى Project-level (مختلف لكل app)

# ─── Cloudinary ───
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ─── Email (Resend) ───
RESEND_API_KEY=
```

> **ملاحظة لـ Claude Code**: قائمة المتغيرات أعلاه **مقترحة**. اطلب من المستخدم تأكيد القائمة النهائية قبل إنشاء الملف. لا تنسخ قيم من `.env` الحالية إلى هذا الملف — هذا خطر أمني.

**0.3 — إنشاء `MODONTY/.env.shared`**

ينشئه **المستخدم بنفسه** (مو Claude Code) عبر:
```bash
cp .env.shared.example .env.shared
# ثم يفتحه ويملأ القيم
```

> **ممنوع على Claude Code**: قراءة قيم من `.env` الحالية ونسخها للملف الجديد. الأسرار مسؤولية المستخدم.

#### Acceptance Criteria — Phase 0
- [ ] `.gitignore` يحتوي `.env.shared` و `!.env.shared.example`
- [ ] `MODONTY/.env.shared.example` موجود ومرفوع git
- [ ] `git status` لا يُظهر `.env.shared` كملف untracked (يعني .gitignore يعمل)
- [ ] `git status` يُظهر `.env.shared.example` كملف جديد (تحت control)

---

### 📋 Phase 1/4: Console (التطبيق التجريبي الأول)

**ليش console أولاً؟** أبسط `next.config.ts` (١٨ سطر فقط)، وأقل تأثيراً لو شي صار غريب.

#### الملفات المتأثرة
- `console/next.config.ts` (تعديل)
- `console/package.json` (إضافة dotenv كـ dependency)

#### الخطوات

**1.1 — إضافة dotenv كـ dependency**

```bash
cd console
pnpm add dotenv@^16.6.1
```

> **تحقق**: `console/package.json` يجب أن يحتوي `"dotenv": "^16.6.1"` في `dependencies`.

**1.2 — تعديل `console/next.config.ts`**

أضف ٣ أسطر في الأعلى (قبل `import type`):

```typescript
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

// Load monorepo-level shared env vars.
// override:false (default) → console/.env.local takes precedence.
loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

const nextConfig: NextConfig = {
  // ... باقي الكود زي ما هو
};

export default nextConfig;
```

> **القاعدة**: لا تلمس أي شيء آخر في الملف. فقط أضف الـ ٣ imports + سطر `loadDotenv`.

**1.3 — اختبار**

```bash
cd console
pnpm dev
```

#### Acceptance Criteria — Phase 1
- [ ] `pnpm dev` في console يشتغل بدون أخطاء
- [ ] الصفحات تفتح بنجاح
- [ ] أي feature يستخدم متغير من `.env.shared` يشتغل
- [ ] `pnpm build` في console ينجح
- [ ] تشغيل `console node -e "console.log(process.env.DATABASE_URL?.length || 'undefined')"` (مع dotenv preload) يطبع رقم > 0

#### Rollback — Phase 1

لو فشلت، تراجع كامل:
```bash
cd console
git checkout next.config.ts package.json
pnpm install
```

---

### 📋 Phase 2/4: Modonty (المدونة الرئيسية)

**حساسية عالية**: هذا هو الـ public-facing site الرئيسي. أي خطأ يأثر على SEO و الزوار.

#### الملفات المتأثرة
- `modonty/next.config.ts` (تعديل)
- `modonty/package.json` (إضافة dotenv)

#### الخطوات

**2.1 — إضافة dotenv**

```bash
cd modonty
pnpm add dotenv@^16.6.1
```

**2.2 — تعديل `modonty/next.config.ts`**

نفس النمط بالضبط:

```typescript
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

const nextConfig: NextConfig = {
  // ... باقي الكود زي ما هو (redirects, headers, cacheComponents, إلخ)
};

export default nextConfig;
```

> **حذر**: ملف `modonty/next.config.ts` يحتوي `cacheComponents: true` و `serverExternalPackages: ["cohere-ai"]`. لا تلمسها.

**2.3 — اختبار شامل**

```bash
cd modonty
pnpm dev
```

اختبر يدوياً:
- [ ] الصفحة الرئيسية تفتح
- [ ] تحميل المقالات (DB يشتغل)
- [ ] الـ Chatbot يرد (Cohere API)
- [ ] البحث يشتغل (Serper API لو مستخدم)

ثم:
```bash
pnpm build
```

#### Acceptance Criteria — Phase 2
- [ ] الـ build ينجح
- [ ] Lighthouse score ما تأثر (لا regression)
- [ ] `cacheComponents` لسا شغّال (لا warnings جديدة)

#### Rollback — Phase 2
```bash
cd modonty
git checkout next.config.ts package.json
pnpm install
```

---

### 📋 Phase 3/4: Admin (الأدمن — الأكثر تعقيداً)

**حساسية قصوى**: admin يحتوي auth + Prisma + سكربتات tsx متعددة.

#### الملفات المتأثرة
- `admin/next.config.ts` (تعديل)
- `admin/package.json` (dotenv موجود فعلاً — تحقق فقط)

#### الخطوات

**3.1 — التحقق من dotenv**

```bash
cd admin
grep '"dotenv"' package.json
# يجب أن يطبع: "dotenv": "^16.6.1"
```

لو موجود → تخطّى التثبيت.

**3.2 — تعديل `admin/next.config.ts`**

```typescript
import { config as loadDotenv } from "dotenv";
import path from "node:path";
import type { NextConfig } from "next";

loadDotenv({ path: path.resolve(process.cwd(), "../.env.shared") });

const nextConfig: NextConfig = {
  // ... باقي الكود زي ما هو
};

export default nextConfig;
```

**3.3 — اختبار شامل**

```bash
cd admin
pnpm dev
```

اختبر:
- [ ] صفحة Login تفتح
- [ ] Login فعلي يشتغل (NextAuth + DB)
- [ ] Dashboard يحمّل البيانات
- [ ] رفع صورة لـ Cloudinary يشتغل
- [ ] إرسال إيميل (Resend) يشتغل لو متاح

ثم:
```bash
pnpm build
```

#### Acceptance Criteria — Phase 3
- [ ] الكل في القائمة أعلاه يعمل
- [ ] لا أخطاء `Prisma not generated` (postinstall hook)

#### Rollback — Phase 3
```bash
cd admin
git checkout next.config.ts
```

---

### 📋 Phase 4/4: Production على Vercel

**الهدف**: نقل المتغيرات المشتركة من Project-level إلى Shared، بنفس قاعدة الأولوية المحلية.

> **قاعدة حاكمة**: لا تستخدم الواجهة لحذف أي متغير قبل ما تتأكد إنه موجود في Shared ومربوط.

#### الخطوات

**4.1 — جرد الوضع الحالي**

سجّل دخول لـ Vercel Dashboard:
- لكل من `modonty-admin`, `modonty-modonty`, `modonty-console`:
  - افتح Settings → Environment Variables
  - **خذ نسخة احتياطية**: ⋯ → Download .env file (احفظ ٣ ملفات)

**4.2 — تحديد القائمة النهائية للمتغيرات المشتركة**

قارن الـ ٣ ملفات. متغير = مشترك إذا:
- نفس Key بالضبط (case-sensitive)
- نفس Value في الـ ٣
- نفس Environment (Production/Preview/Development)

**4.3 — إنشاء Shared Variables عبر Import**

في Vercel: Team Settings → Environment Variables → تبويب **Shared** → **Import .env**:
- ارفع نسخة من `.env.shared` المحلي (بعد ما المستخدم يعبّيه)
- اختر Environments: ✅ Production ✅ Preview ✅ Development
- اختر Sensitive: ✅ للـ API keys و DB URLs
- Link to Projects: اختر **الثلاثة**

**4.4 — التحقق من الربط**

في كل مشروع من الثلاثة:
- Settings → Environment Variables → انزل لقسم "Shared Environment Variables"
- تأكد إن كل المتغيرات اللي رفعناها ظاهرة هنا

> **في هذي اللحظة**: Project-level + Shared موجودين بنفس Keys. القاعدة تخلي Project-level يفوز → الـ deployments الحالية ما تتأثر.

**4.5 — حذف النسخ المكررة من Project-level**

لكل متغير مشترك، في كل مشروع:
1. روح القسم العلوي (Project-level) في صفحة Environment Variables
2. ⋯ → Delete → أكّد
3. **مهم**: لا تحذفها من قسم Shared في الأسفل!

> **رتّب الحذف من الأقل خطورة**: SERPER → COHERE → GA4 → NEXTAUTH_SECRET → DATABASE_URL.  
> بعد كل حذف، تحقق من القسم Shared لسا مربوط.

**4.6 — Redeploy**

لكل مشروع:
1. Project → Deployments
2. آخر deployment → ⋯ → **Redeploy**
3. ❌ **شيل علامة** "Use existing Build Cache" (نريد build جديد)
4. اضغط Redeploy

**4.7 — التحقق النهائي على Production**

- [ ] `https://admin.modonty.com` يشتغل (Login + Dashboard)
- [ ] `https://www.modonty.com` يشتغل (المقالات + Chatbot)
- [ ] `https://console.modonty.com` يشتغل
- [ ] Vercel Logs لا تحتوي `undefined env variable` أخطاء

#### Acceptance Criteria — Phase 4
- [ ] الـ ٣ deployments ✅ Ready
- [ ] الـ ٣ دومينات تستجيب 200 OK
- [ ] لا smoke-test failures

#### Rollback — Phase 4

أسوأ سيناريو (deployment فشل بعد الحذف):
1. روح Project → Deployments → اختر آخر deployment ناجح قبل التغيير
2. ⋯ → **Promote to Production** (rollback فوري — ثوانٍ)
3. ثم في Settings → Environment Variables: استرجع المتغيرات المحذوفة من النسخة الاحتياطية (`.env file` اللي حملناه في 4.1)

---

## 🛡️ خطة الأمان الشاملة

### مبادئ غير قابلة للتفاوض

1. **لا حذف قبل تحقق**: ممنوع حذف أي متغير من Project-level قبل ما يكون موجود في Shared ومربوط ومُتحقَّق منه.
2. **النسخ الاحتياطية إلزامية**: قبل أي تغيير على Vercel، نزّل `.env file` من الـ UI لكل مشروع.
3. **التغيير المحلي قابل للتراجع في ١٠ ثواني**: `git checkout <file>` فقط.
4. **التغيير على Vercel قابل للتراجع في دقيقة**: Redeploy لـ deployment قديم.
5. **اختبار قبل المرحلة التالية**: ممنوع نقل phase قبل تحقيق Acceptance Criteria.

### قائمة المخاطر والتخفيف

| الخطر | الاحتمالية | التأثير | التخفيف |
|------|-----------|--------|---------|
| `.env.shared` مرفوع لـ git بالخطأ | منخفض | عالي (تسريب أسرار) | `.gitignore` يغطيه + `.env.shared.example` بدون قيم |
| Override خاطئ → shared يطغى على local | منخفض | متوسط | استخدام `override: false` (افتراضي) |
| نسيت Redeploy على Vercel | متوسط | منخفض | Acceptance Criteria يطلب Redeploy |
| حذف من Project-level قبل Shared | منخفض | عالي (downtime) | الترتيب الإلزامي في Phase 4.4 → 4.5 |
| سكربتات tsx لا تجد المتغيرات | متوسط | متوسط | معالج في "ملاحظات لاحقة" تحت |

### نقاط Rollback السريعة

```bash
# Rollback Phase 0
git checkout .gitignore
rm .env.shared.example .env.shared

# Rollback Phase 1
cd console && git checkout next.config.ts package.json && pnpm install

# Rollback Phase 2
cd modonty && git checkout next.config.ts package.json && pnpm install

# Rollback Phase 3
cd admin && git checkout next.config.ts

# Rollback Phase 4 (Vercel)
# عبر UI فقط: Promote سابق + استرجاع من .env files
```

---

## 📌 ملاحظات لاحقة (خارج النطاق الحالي)

هذي بنود **غير مشمولة** في هذي الخطة، لكن لازم تُعالج في مرحلة ٢ منفصلة:

1. **سكربتات tsx**: مثل `tsx scripts/changelog-sync.ts`. هذي ما تستفيد من `next.config.ts`. الحل المقترح: استخدام `dotenv-cli`:
   ```json
   "changelog:sync": "dotenv -e ../.env.shared -e .env.local -- tsx scripts/changelog-sync.ts"
   ```

2. **Prisma scripts** في `dataLayer`: `prisma generate`, `prisma db push`, إلخ. تحتاج نفس معالجة dotenv-cli.

3. **`@modonty/database` package**: لو يقرأ env مباشرة، يحتاج `import { loadEnvConfig } from '@next/env'` أو dotenv من نفس الموقع.

4. **CI/CD pipeline**: إذا فيه GitHub Actions، يحتاج توفير المتغيرات كـ secrets.

---

## 📋 سجل التحقق النهائي

نسخ هذه القائمة وعلّم عليها أثناء التنفيذ:

### Phase 0
- [ ] `.gitignore` محدّث
- [ ] `.env.shared.example` منشور في git
- [ ] `.env.shared` معبّى محلياً (المستخدم)
- [ ] `git status` نظيف من تسريب

### Phase 1 (console)
- [ ] dotenv مثبّت
- [ ] `next.config.ts` محدّث (٣ أسطر فقط)
- [ ] `pnpm dev` ✅
- [ ] `pnpm build` ✅
- [ ] تحقق يدوي

### Phase 2 (modonty)
- [ ] dotenv مثبّت
- [ ] `next.config.ts` محدّث
- [ ] `pnpm dev` ✅
- [ ] `pnpm build` ✅
- [ ] Chatbot + DB يشتغلون

### Phase 3 (admin)
- [ ] `next.config.ts` محدّث
- [ ] `pnpm dev` ✅
- [ ] `pnpm build` ✅
- [ ] Login + Cloudinary يشتغلون

### Phase 4 (Vercel)
- [ ] Backups محملة من الـ ٣ مشاريع
- [ ] Shared Vars منشأة عبر Import
- [ ] مربوطة بالـ ٣ مشاريع
- [ ] Project-level duplicates محذوفة (بعد التحقق)
- [ ] الـ ٣ Redeploy ناجحة
- [ ] الدومينات الـ ٣ تستجيب

---

## 🎓 قواعد للـ Claude Code أثناء التنفيذ

1. **اتبع الـ phases بالترتيب**. ممنوع تخطّي.
2. **بعد كل phase، شغّل `pnpm tsc --noEmit`** في الـ workspace المتأثر. صفر errors.
3. **لا تعدّل قيم `.env.local`** الموجودة. هذا يخص المستخدم.
4. **لا تنسخ الأسرار** من ملف لآخر. المستخدم يعبّي `.env.shared` بنفسه.
5. **قبل Phase 4 (Vercel)**، تأكد من المستخدم إنه ناوي يدخل Vercel Dashboard ويسوي خطوات UI بنفسه. لا تحاول أتمتة Vercel UI.
6. **لو شي ما واضح**، قف واسأل المستخدم. لا تخمّن.
7. **استخدم TodoWrite** لتتبع تقدمك في الـ phases.

---

## 📚 المصادر النهائية

- [Next.js Environment Variables](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js Config (TypeScript support)](https://nextjs.org/docs/app/api-reference/config/next-config-js)
- [dotenv README](https://github.com/motdotla/dotenv)
- [Vercel Shared Environment Variables](https://vercel.com/docs/environment-variables/shared-environment-variables)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

**تاريخ المستند**: 2026-04-29  
**الإصدار**: 1.0  
**المعدّ**: Claude (Cowork mode) — مُتحقَّق من المصادر الرسمية بنسبة ١٠٠٪