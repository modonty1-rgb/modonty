# JBRSEO ↔ MODONTY Integration — Plan

> **آخر تحديث:** 2026-05-02 (Step 1 + Step 2 ✅ DONE — End-to-end live test passed · subscriber synced from jbrseo.com → admin)
> **الحالة:** المرحلتين الأولى والثانية مكتملين 100% · جاهز لـ Step 3 (Pricing — sync + 8 consumers)
>
> **القرارات النهائية:**
> - **Pricing:** Refactor `SubscriptionTierConfig` (Option B تدريجي — 70 task across ~52 ملف) · Step A compatibility · Step B cleanup
> - **Subscribers:** New `JbrseoSubscriber` (mirror حرفي · صفر workflow · صفحة عرض في admin)
> - **Deep scan results:** Admin (32) · Console (5) · Modonty public (10) · Scripts (4) · Schema (1) = **~52 ملف**
> **المنطقة:** dataLayer + admin + modonty + console
> **النمط المعتمد:** **Mirror + Sync** — modonty تخزن نسخة مطابقة، تتزامن من jbrseo عند الطلب

---

## 1. خلفية القرار

### المشكلتان اللي نحلّها

1. **الأسعار + المزايا التسويقية** هاردكود في 8+ صفحات guideline (admin) + subscription card (console). أي تعديل = touch 8+ files. + خطر drift بين jbrseo وmodonty.
2. **Sales leads** اللي يسجّلوا في jbrseo (من حملات إعلانية) ما تظهر في admin لا للمتابعة ولا للتحويل.

### القرارات المعتمدة (مع المستخدم)

- ✅ **modonty = Source of Truth في runtime** — لا cross-app DB read، لا API live coupling
- ✅ **النمط: Mirror + Sync** — schemas في modonty تطابق jbrseo (1:1) + script يُملأ بضغطة زر
- ✅ **`.env.shared`** للـ connection string (شغّال محلي + Vercel)
- ✅ **MongoDB driver `mongodb@^6.0.0`** موجود في `dataLayer/package.json` — لا install
- ✅ **Billing داخلي يبقى منفصل** — `SubscriptionTier` enum + `SubscriptionTierConfig` ما نلمسهم (يستخدمهم `Client.subscriptionTier` للـ feature-gating)
- ✅ **عرض تسويقي = جديد** — `PricingPlans` model (mirror jbrseo `LandingSection where section="pricing"`)
- ✅ **Leads = جديد** — `JbrseoLead` model (mirror jbrseo `Subscriber` + workflow في modonty)

---

## 2. Site Survey — أين تُستهلك البيانات حالياً؟

### 2.1 الأسعار (hardcoded اليوم — يحتاج migration)

| الموقع | المحتوى | يحتاج |
|--------|---------|------|
| `admin/app/(public)/guidelines/brand/page.tsx` | 4 ذكر للسعر (1,299) في do/customer/rightTone/example | يقرأ من `PricingPlans` |
| `admin/app/(public)/guidelines/golden-rules/page.tsx` | جدول الباقات + ROI Pitch + الفرق النفسي (Rules 5/11/12) | يقرأ من `PricingPlans` |
| `admin/app/(public)/guidelines/icps/page.tsx` | 2 ذكر (Momentum 1,299 + WordPress 18,000) | يقرأ من `PricingPlans` |
| `admin/app/(public)/guidelines/positioning/page.tsx` | modontyEdge + footnote | يقرأ من `PricingPlans` |
| `admin/app/(public)/guidelines/sales-playbook/page.tsx` | 8+ ذكر (Elevator/Discovery/ROI Calc/جدول الباقات) | يقرأ من `PricingPlans` |
| `admin/app/(public)/guidelines/team-onboarding/page.tsx` | ROI Calculator في checklist الموظف الجديد | يقرأ من `PricingPlans` |
| `console/app/(dashboard)/dashboard/settings/components/subscription-card.tsx` | يقرأ `tier.price` من `SubscriptionTierConfig` حالياً | switch لـ `PricingPlans` للعرض |
| `console/app/(dashboard)/dashboard/settings/page.tsx` | يستخرج tier للـ subscription-card | يحدّث بناءً على ما فوق |

### 2.2 Sales Leads (لا يوجد — feature جديد)

| الموقع | الحالة |
|--------|-------|
| `admin/app/(dashboard)/campaigns/leads/` | موجود — ينمذج `CampaignInterest`. **النمط نفسه نطبّقه على JbrseoLead** |
| `admin/app/(dashboard)/jbrseo-leads/` (جديد) | لا يوجد — ننشئه |

### 2.3 Schema الموجود (يبقى كما هو، لا تعديل)

- `dataLayer/prisma/schema/schema.prisma`:
  - `enum SubscriptionTier { BASIC, STANDARD, PRO, PREMIUM }` ← billing internal
  - `model SubscriptionTierConfig` ← Client.tierConfigId مربوط فيه ← billing internal
- `admin/app/(dashboard)/subscription-tiers/` ← admin UI لإدارة الـ billing tiers ← يبقى

---

## 3. Schemas الجديدة المقترحة

### 3.1 `SubscriptionTierConfig` — Step A (CURRENT) + Step B (TARGET)

#### ✅ Step A — Current schema (deployed 2026-05-02)

```prisma
model SubscriptionTierConfig {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId

  // ─── Step A compat (للـ 52 ملف اللي يقرأوا الـ enum/Int) — تُحذف Step B ───
  tier            SubscriptionTier @unique         // Client.subscriptionTier FK + 15 ملف
  price           Float                            // 5 ملفات تستخدمها
  articlesPerMonth Int                             // 39 ملف يستخدمها
  name            String                           // dashboard + UI لازمها

  // ─── Jbrseo integration (Round 6) — الجديد ───
  jbrseoId        String?         @unique          // "free" | "starter" | "growth" | "scale"
  pricing         Json?                            // { SA: { mo, yr }, EG: { mo, yr } }
  articleCounts   Json?                            // global mapping: { اسم الباقة: عدد المقالات }
  syncedAtSA      DateTime?
  syncedAtEG      DateTime?

  updatedAt       DateTime        @updatedAt
  clients         Client[]        @relation("ClientTierConfig")

  @@map("subscription_tier_configs")
}
```

**يُحذف فعلاً (Step A):** `isActive`, `isPopular`, `description`, `createdAt`, `@@index([isActive])` — boilerplate صفر قيمة

#### 🎯 Step B — Target schema (بعد refactor الـ 52 ملف)

```prisma
model SubscriptionTierConfig {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  jbrseoId        String   @unique
  pricing         Json?
  articleCounts   Json?
  syncedAtSA      DateTime?
  syncedAtEG      DateTime?
  updatedAt       DateTime @updatedAt
  clients         Client[] @relation("ClientTierConfig")

  @@map("subscription_tier_configs")
}
```

**يُحذف في Step B:** `tier` enum + `price` + `articlesPerMonth` + `name` + `enum SubscriptionTier` + `Client.subscriptionTier`

**Schema changes timeline:**

| الحقل | قبل (الأصلي) | Step A (الآن ✅) | Step B (الهدف) |
|-------|---|---|---|
| `tier: SubscriptionTier @unique` | موجود | يبقى (compat) | ❌ يُحذف |
| `price: Float` | موجود | يبقى (compat) | ❌ يُحذف |
| `articlesPerMonth: Int` | موجود | يبقى (compat) | ❌ يُحذف |
| `name: String` | "Basic"... | يبقى (compat) | ❌ يُحذف |
| `isActive` | موجود | ❌ حُذف | (already gone) |
| `isPopular` | موجود | ❌ حُذف | (already gone) |
| `description` | موجود | ❌ حُذف | (already gone) |
| `createdAt` | موجود | ❌ حُذف | (already gone) |
| `jbrseoId: String? @unique` | غير موجود | ✅ أُضيف | ✅ موجود (يصير required) |
| `pricing: Json?` | غير موجود | ✅ أُضيف | ✅ موجود |
| `articleCounts: Json?` | غير موجود | ✅ أُضيف | ✅ موجود |
| `syncedAtSA/EG: DateTime?` | غير موجود | ✅ أُضيف | ✅ موجود |
| `Client.subscriptionTier` | موجود | يبقى (compat) | ❌ يُحذف |
| `enum SubscriptionTier` | 4 قيم | يبقى (compat) | ❌ يُحذف |

**Read pattern (Step A — consumers اليوم):**
```ts
const tier = await db.subscriptionTierConfig.findUnique({ where: { tier: "PRO" } });
const articles = tier.articlesPerMonth;      // 8 (legacy Int)
const price = tier.price;                    // 1299 (legacy Float)
```

**Read pattern (Step B — consumers بعد refactor):**
```ts
const tier = await db.subscriptionTierConfig.findUnique({ where: { jbrseoId: "growth" } });
const saPriceMo = tier.pricing?.SA?.mo;          // 1299
const articles = tier.articleCounts?.["الزخم"];  // "8" (from JSON)
```

**Scope decisions (cumulative across rounds 1-6):**

| Round | القرار |
|-------|--------|
| 1 | mirror approach |
| 2 | 4 حقول من Plan (drop UI/sections/highlights/styling) |
| 3 | per-country fields في singleton row |
| 4 | articles عالمي |
| 5 | extend بدل create new table |
| **6 FINAL** | **REFACTOR كامل** — drop enum + zero boilerplate + data-driven · 5 fields فقط (jbrseoId/name/articles/pricing/sync metadata) |

**Migration impact (production):**
- 4 rows موجودة في DB حالياً (BASIC/STANDARD/PRO/PREMIUM) — نحتاج migration:
  1. backfill `jbrseoId` بناءً على `articlesPerMonth` mapping (4→starter, 8→growth, 12→scale, 2→? قد يُحذف لو ما له مقابل)
  2. حذف `price`/`tier`/`isActive`/`isPopular`/`description`/`createdAt`
  3. حذف `Client.subscriptionTier` (مع backfill `tierConfigId` لو فيه clients ما لهم tierConfigId)

**⚠️ Code ripple effect:** أي مكان يقرأ `client.subscriptionTier === "PRO"` لازم يتعدّل ليقرأ `client.tierConfig.jbrseoId === "growth"`. حجم التأثير يُقاس بـ grep قبل التنفيذ.

**Scope decision (Session 76 — rounds 2+4):** نأخذ **3 حقول فقط** من كل plan لقاعدة modonty: `name + price{mo,yr}`. الـ `articles` ينفصل في field global (`articleCounts`). الباقي (id, persona, highlights, sections, badge, featured, guarantee, cta, styling) — out of scope.

**Plan structure (price-only mirror):**
```ts
interface JbrseoPlanPrice {
  name: string;            // "مجاني" | "الانطلاقة" | "الزخم" | "الريادة"
  price: { mo: number; yr: number };   // SA: 0/0 · 499/399 · 1299/1039 · 2999/2399
}

// Stored separately in PricingPlans.articleCounts (global):
type ArticleCounts = Record<string, string>;
// { "مجاني": "١ مقال هدية", "الانطلاقة": "٤ مقالات / شهر", "الزخم": "٨ مقالات / شهر", "الريادة": "١٢ مقال / شهر" }
```

**نتيجة الـ scope tightening (round 2 + 4):**
- 2 types: `JbrseoPlanPrice[]` per country + `ArticleCounts` global
- Sync logic: `const articleCounts = {}; const plansSA = PLANS.map(p => { articleCounts[p.name] = p.articles; return { name: p.name, price: p.price }; })` — 3 أسطر transformation
- لا تكرار · لا drift · single source of truth للـ articles
- الـ identification في الـ consumers = match by `name`

### 3.2 `JbrseoSubscriber` (PURE MIRROR — Session 76 round 6 FINAL)

**القرار:** Mirror فقط. صفر workflow. صفر status. صفحة عرض في admin.

```prisma
model JbrseoSubscriber {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId

  // Mirror حرفي لـ jbrseo Subscriber model
  jbrseoId        String   @unique          // _id الأصلي من jbrseo
  contactName     String?
  email           String
  phone           String
  businessName    String?
  businessType    String?
  planName        String                    // الباقة اللي اختارها العميل
  planIndex       Int?
  country         String                    // "SA" | "EG"
  isAnnual        Boolean
  jbrseoCreatedAt DateTime                  // الـ createdAt الأصلي من jbrseo

  // Sync metadata (modonty-only)
  syncedAt        DateTime @default(now())

  @@index([country])
  @@index([jbrseoCreatedAt])
  @@map("jbrseo_subscribers")
}
```

**يُحذف من الخطة الأصلية (over-engineering):**
- ❌ `enum JbrseoLeadStatus` (لا workflow)
- ❌ `status, assignedTo, notes, contactedAt, scheduledAt, convertedAt, lostAt, lostReason, convertedClientId, lastContactedAt`
- ❌ Detail Sheet drawer مع status buttons / mark contacted / convert / lost
- ❌ KPI cards بـ 5 statuses
- ❌ ADMIN role gating (read-only data — أي admin يقدر يشوف)

**الـ admin UI الجديد (lean):**
- جدول واحد يعرض كل الـ subscribers
- Search (name/email/phone)
- Filter (country/plan/isAnnual)
- زر "Sync from jbrseo"
- خلاص.

**الحماية من الـ duplicates:** `jbrseoId @unique` فقط (نشيل `email @unique` لأن user الواحد ممكن يسجّل مرتين بإيميلات مختلفة، أو نفس الإيميل في SA + EG).

---

## 4. Plan تنفيذي مرتّب — 5 phases

### Phase 0 — Pre-flight (الإطار)

- [x] **0.1** Connection string جاهز — `mongodb+srv://modonty-admin:...@modonty-cluster.../modonty` (jbrseo + modonty يتشاركون نفس الـ cluster + database)
- [x] **0.2** أُضيف لـ `.env.shared` بـ key `JBRSEO_DATABASE_URL` (سطر بعد DATABASE_URL في section 1)
- [x] **0.3** أُضيف لـ `.env.shared.example` كـ placeholder
- [x] **0.4** أُضيف لـ Vercel Team Shared Env (id `env_aBMoni0fA5YXFS1lo5Lcz4zX` · مرتبط بـ 3 projects: admin/modonty/console · production+preview+development · encrypted)
- [ ] **0.5** kill all node processes قبل أي prisma generate (Windows file-locks) — يُنفَّذ في Phase 2

### Phase 1 — Shared Infrastructure (utility lib مشترك)

- [ ] **1.1** ملف `dataLayer/lib/jbrseo-client.ts` — singleton `MongoClient` للـ jbrseo (شبه `prisma.ts` pattern)
  - Cache في `globalThis` لـ HMR
  - `getJbrseoDb()` يرجّع `Db` instance
  - `closeJbrseoConnection()` للـ cleanup
- [ ] **1.2** ملف `dataLayer/lib/jbrseo-types.ts` — TypeScript interfaces (scope-tightened rounds 2+4):
  - `JbrseoPlanPrice` — 2 حقول: `name`, `price: { mo, yr }`
  - `ArticleCounts` — `Record<string, string>` (global plan metadata)
  - `JbrseoSubscriber` (للـ leads — كل الحقول من Subscriber model)
  - **مصدر:** `JBRSEO/jbrseo.com/app/content/landing/price-section-types.ts` + `prisma/schema.prisma`
  - ❌ **لا نحتاج:** `JbrseoSection` · `JbrseoTrustItem` · `JbrseoBottomCta` · `JbrseoPricingUI` · `JbrseoPricingPlans` · أي حقول persona/highlights/sections/badge/featured/guarantee/cta/styling من الـ Plan الأصلي
- [ ] **1.3** unit-test الـ connection: script `admin/scripts/test-jbrseo-connection.ts` يقرأ `db.collection('subscribers').countDocuments()` ويطبع النتيجة (read-only)

### Phase 2 — Schema migrations

- [ ] **2.1** تعديل `dataLayer/prisma/schema/schema.prisma`:
  - **REFACTOR** `model SubscriptionTierConfig`:
    - ➕ `jbrseoId String @unique`
    - ➕ `pricing Json?`
    - ➕ `syncedAtSA DateTime?` + `syncedAtEG DateTime?`
    - ❌ حذف: `tier`, `price`, `isActive`, `isPopular`, `description`, `createdAt`
  - ❌ حذف `enum SubscriptionTier` بالكامل
  - ❌ حذف `Client.subscriptionTier` field
  - **Pre-migration grep:** ابحث في 3 apps عن usages للـ enum + `client.subscriptionTier` (حجم الـ ripple)
  - إضافة `model JbrseoSubscriber` (mirror حرفي — لا enum status، لا workflow)
- [ ] **2.2** kill node processes
- [ ] **2.3** `pnpm prisma:validate`
- [ ] **2.4** `pnpm prisma:generate`
- [ ] **2.5** restart dev servers
- [ ] **2.6** verify: types المحدّثة تظهر في `db.subscriptionTierConfig.pricing` + `db.jbrseoLead`

### Phase 3 — Pricing Mirror feature (admin + consumers)

#### 3a — Sync layer

- [ ] **3.1** `admin/lib/pricing/sync-from-jbrseo.ts` — server action:
  - يقرأ من `jbrseo.collection('LandingSection').findOne({ country, section: 'pricing' })`
  - **Step A — write to BOTH legacy + new fields:**
    ```ts
    // Build global articleCounts JSON (collected once, written to all 4 rows)
    const articleCounts: Record<string, string> = {};
    for (const p of PLANS) articleCounts[p.name] = p.articles;

    for (const jbrseoPlan of PLANS) {
      const existing = await db.subscriptionTierConfig.findUnique({
        where: { jbrseoId: jbrseoPlan.id }
      });
      const currentPricing = (existing?.pricing as any) ?? {};
      const articlesInt = parseArabicNum(jbrseoPlan.articles);

      await db.subscriptionTierConfig.upsert({
        where: { jbrseoId: jbrseoPlan.id },
        update: {
          // Legacy fields (compat — Step B يحذفهم)
          name: jbrseoPlan.name,
          articlesPerMonth: articlesInt,
          // New fields ✨
          pricing: {
            ...currentPricing,
            [country]: { mo: jbrseoPlan.price.mo, yr: jbrseoPlan.price.yr }
          },
          articleCounts,
          ...(country === "SA"
            ? { syncedAtSA: new Date() }
            : { syncedAtEG: new Date() })
        },
        create: {
          jbrseoId: jbrseoPlan.id,
          tier: ...,                   // ⚠️ يحتاج mapping للـ enum (Step A فقط)
          price: jbrseoPlan.price.mo,  // legacy compat
          name: jbrseoPlan.name,
          articlesPerMonth: articlesInt,
          pricing: { [country]: { mo: jbrseoPlan.price.mo, yr: jbrseoPlan.price.yr } },
          articleCounts,
          ...(country === "SA"
            ? { syncedAtSA: new Date() }
            : { syncedAtEG: new Date() })
        }
      });
    }
    ```
  - fallback: لو row جبر ناقص، نقرأ من static في `dataLayer/lib/jbrseo-pricing-fallback.ts`
  - Helper مطلوب: `parseArabicNum(s)` لتحويل "٨ مقالات / شهر" → 8
  - يرجّع `{ ok: true, country, source: 'db' | 'static', upserted: N }`
- [ ] **3.2** `admin/lib/pricing/get-pricing.ts` — read API:
  - `getTierPricing(jbrseoId: string, country: "SA" | "EG"): Promise<{ name; articlesPerMonth; mo; yr } | null>`
  - يقرأ من `db.subscriptionTierConfig.findUnique({ where: { jbrseoId } })`
  - يفك `pricing[country]` ويرجّع shape موحّد للـ consumers
  - مع `unstable_cache` ساعة + tag `tier-pricing-${jbrseoId}-${country}`
  - Helper: `getAllTiersPricing(country)` للـ guideline pages اللي تعرض كل الباقات

#### 3b — Admin UI

- [ ] **3.3** صفحة جديدة `admin/app/(dashboard)/pricing-mirror/page.tsx`:
  - Header + شرح موجز
  - Card per country (SA, EG): يعرض الـ data الحالي (لو موجود) + آخر sync + زر "Sync from jbrseo"
  - زر يفتح confirmation dialog يعرض diff (إن أمكن)
  - Toast: "Synced X plans for SA"
- [ ] **3.4** أضف link في sidebar (admin) — مجموعة "Settings" أو "Integrations"

#### 3c — Consumers migration

- [ ] **3.5** تحديث `console/app/(dashboard)/dashboard/settings/components/subscription-card.tsx`:
  - **حالياً:** يقرأ `tier.price` من `SubscriptionTierConfig` (موجود)
  - **التحديث:** يقرأ `tier.pricing[client.country].mo` (per-country)
  - الـ component نفسه يبقى — مجرد تغيير حقل القراءة
- [ ] **3.6-3.13** تحديث 8 صفحات guideline لقراءة من `SubscriptionTierConfig.pricing` بدل hardcoded:
  - [ ] 3.6 `brand/page.tsx`
  - [ ] 3.7 `golden-rules/page.tsx`
  - [ ] 3.8 `icps/page.tsx`
  - [ ] 3.9 `positioning/page.tsx`
  - [ ] 3.10 `sales-playbook/page.tsx`
  - [ ] 3.11 `team-onboarding/page.tsx`
  - **استراتيجية:** ننشئ helper `lib/pricing/format-price-for-guideline.ts` يقبل `tier` (enum) + `country` + يرجع formatted Arabic string من `SubscriptionTierConfig.pricing[country]`

### Phase 3.5 — Pricing Refactor: Gradual Strategy (Option B) — ~52 ملف

> **القرار (Session 76):** Refactor تدريجي شامل · الـ apps تظل تشتغل في كل خطوة.

#### Step A — Compatibility layer (Phase 3 يبدأ هنا)

- [x] **A.1** Schema migration ✅ DONE (2026-05-02):
  - ➕ أُضيف على `SubscriptionTierConfig`: `jbrseoId String? @unique` + `pricing Json?` + `articleCounts Json?` + `syncedAtSA/EG DateTime?`
  - ➕ أُضيف `model JbrseoSubscriber` (mirror حرفي · صفر workflow)
  - ❌ حُذف من `SubscriptionTierConfig`: `isActive`, `isPopular`, `description`, `createdAt`, `@@index([isActive])` (boilerplate)
  - ✅ أُبقي للـ compatibility (يُحذفون Step B): `tier`, `price`, `articlesPerMonth`, `name`, `enum SubscriptionTier`, `Client.subscriptionTier`
  - ✅ Killed all node processes
  - ✅ `pnpm prisma:validate` → schema valid 🚀 (×2 runs)
  - ✅ `pnpm prisma:generate` → Prisma Client v6.19.2 generated
  - ✅ Types verified في Prisma client (db.jbrseoSubscriber + كل الحقول الجديدة)
- [x] **A.2** DB Push ✅ DONE (2026-05-02):
  - ✅ `prisma db push` على PROD (`modonty`) — نجح بعد backfill
  - ✅ `prisma db push` على DEV (`modonty_dev`) — نجح بعد backfill
  - ⚠️ ملاحظة: `dataLayer/.env` كان موجّه لـ PROD (مش `.env.shared` للـ DEV). يستخدم Prisma CLI من dataLayer.
- [x] **A.3** Backfill `jbrseoId` ✅ DONE على القاعدتين:
  - BASIC → `"free"` (مجاني · 1 مقال · 0 ريال)
  - STANDARD → `"starter"` (الانطلاقة · 4 مقال · 499 ريال)
  - PRO → `"growth"` (الزخم · 8 مقال · 1299 ريال)
  - PREMIUM → `"scale"` (الريادة · 12 مقال · 2999 ريال)
  - الـ unique constraint اتطبّق بنجاح بعد الـ backfill
- [x] **A.4** Admin dev server ✅ شغّال على `http://localhost:3000`:
  - Next.js 16.2.4 (Turbopack)
  - Ready in 3.4s · GET / 200
  - Title: "Modonty Admin - Dashboard"
- [x] **A.5** Live verification (Playwright) ✅:
  - Dashboard يحمّل بدون أخطاء
  - Search Console widget شغّال (5 clicks · 11 impressions · CTR 45.5%)
  - Sidebar كامل (Search Console / SEO Overview / Content / Modonty Pages / Audience / System)
  - Screenshot: `.playwright-mcp/admin-after-step1.png`
  - 0 console errors
  - الحقول الجديدة على `SubscriptionTierConfig` ما كسرت أي شيء قائم
- [ ] **A.2** Sync action يكتب على القديم + الجديد معاً:
  - `pricing.SA.mo` + يحدّث `price` (الأقل من mo) للتوافق
  - `articlesPerMonth` (موجود)
  - `name` (يحدّث للعربي)
  - الـ apps تبقى تعرض الـ tier القديم بدون كسر
- [ ] **A.3** Console subscription-card يقرأ من `pricing[country].mo` لو موجود، fallback لـ `price`
- [ ] **A.4** 8 صفحات guideline تقرأ من `pricing[country]` بدل hardcoded
- [ ] **A.5** TSC zero × 3 apps + Live test شامل
- [ ] **A.6** Push للـ production · sync يجري على prod

#### Step B — Cleanup (يُنفَّذ بعد Step A مستقر — session منفصلة موصى بها)

**🔴 Files to migrate (32 admin):**

Subscription Tiers UI:
- [ ] B.1 `admin/app/(dashboard)/subscription-tiers/page.tsx`
- [ ] B.2 `admin/app/(dashboard)/subscription-tiers/components/tier-cards.tsx`
- [ ] B.3 `admin/app/(dashboard)/subscription-tiers/components/tier-table.tsx`
- [ ] B.4 `admin/app/(dashboard)/subscription-tiers/components/tier-form.tsx`
- [ ] B.5 `admin/app/(dashboard)/subscription-tiers/actions/tier-actions.ts`

Clients module:
- [ ] B.6 `admin/app/(dashboard)/clients/components/client-form.tsx`
- [ ] B.7 `admin/app/(dashboard)/clients/components/client-table.tsx`
- [ ] B.8 `admin/app/(dashboard)/clients/components/subscription-tier-cards.tsx`
- [ ] B.9 `admin/app/(dashboard)/clients/components/form-sections/subscription-section.tsx`
- [ ] B.10 `admin/app/(dashboard)/clients/[id]/components/client-tabs.tsx`
- [ ] B.11 `admin/app/(dashboard)/clients/[id]/components/client-view.tsx`
- [ ] B.12 `admin/app/(dashboard)/clients/[id]/components/client-header.tsx`
- [ ] B.13 `admin/app/(dashboard)/clients/[id]/components/client-delivery-metrics.tsx`
- [ ] B.14 `admin/app/(dashboard)/clients/[id]/components/client-analytics.tsx`
- [ ] B.15 `admin/app/(dashboard)/clients/[id]/components/tabs/details-tab.tsx`
- [ ] B.16 `admin/app/(dashboard)/clients/[id]/components/tabs/subscription-tab.tsx`
- [ ] B.17 `admin/app/(dashboard)/clients/[id]/components/tabs/overview-tab.tsx`
- [ ] B.18 `admin/app/(dashboard)/clients/[id]/components/tabs/required-tab.tsx`
- [ ] B.19 `admin/app/(dashboard)/clients/helpers/client-form-config.ts`
- [ ] B.20 `admin/app/(dashboard)/clients/helpers/client-form-schema.ts`
- [ ] B.21 `admin/app/(dashboard)/clients/helpers/client-display-utils.ts`
- [ ] B.22 `admin/app/(dashboard)/clients/helpers/client-field-mapper.ts`
- [ ] B.23 `admin/app/(dashboard)/clients/helpers/get-tier-config.ts`
- [ ] B.24 `admin/app/(dashboard)/clients/helpers/business-metrics.ts`
- [ ] B.25 `admin/app/(dashboard)/clients/helpers/map-initial-data-to-form-data.ts`
- [ ] B.26 `admin/app/(dashboard)/clients/helpers/hooks/use-client-form.ts`
- [ ] B.27 `admin/app/(dashboard)/clients/helpers/generate-client-test-data.ts`
- [ ] B.28 `admin/app/(dashboard)/clients/actions/clients-actions/create-client.ts`
- [ ] B.29 `admin/app/(dashboard)/clients/actions/clients-actions/update-client.ts`
- [ ] B.30 `admin/app/(dashboard)/clients/actions/clients-actions/update-client-grouped.ts`
- [ ] B.31 `admin/app/(dashboard)/clients/actions/clients-actions/get-clients.ts`
- [ ] B.32 `admin/app/(dashboard)/clients/actions/clients-actions/get-client-by-id.ts`
- [ ] B.33 `admin/app/(dashboard)/clients/actions/clients-actions/get-clients-stats.ts`
- [ ] B.34 `admin/app/(dashboard)/clients/actions/clients-actions/client-server-schema.ts`
- [ ] B.35 `admin/app/(dashboard)/clients/actions/clients-actions/types.ts`
- [ ] B.36 `admin/app/(dashboard)/clients/actions/export-actions.ts`

Dashboard widgets:
- [ ] B.37 `admin/app/(dashboard)/components/subscription-tier-chart.tsx`
- [ ] B.38 `admin/app/(dashboard)/components/delivery-progress.tsx`
- [ ] B.39 `admin/app/(dashboard)/components/delivery-progress-chart.tsx`
- [ ] B.40 `admin/app/(dashboard)/components/alerts-section.tsx`
- [ ] B.41 `admin/app/(dashboard)/actions/dashboard-actions.ts`

Lib + i18n:
- [ ] B.42 `admin/lib/types/form-types.ts`
- [ ] B.43 `admin/lib/messages/ar.ts`
- [ ] B.44 `admin/lib/messages/en.ts`

Guidelines (يستخدم string literals "BASIC"/"STANDARD"/"PRO"/"PREMIUM"):
- [ ] B.45 `admin/app/(public)/guidelines/clients/page.tsx`

**🟡 Files to migrate (5 console):**
- [ ] B.46 `console/app/(dashboard)/dashboard/helpers/dashboard-queries.ts`
- [ ] B.47 `console/app/(dashboard)/dashboard/settings/page.tsx`
- [ ] B.48 `console/app/(dashboard)/dashboard/settings/components/subscription-card.tsx`
- [ ] B.49 `console/app/(dashboard)/dashboard/campaigns/page.tsx`
- [ ] B.50 `console/app/(dashboard)/dashboard/content/page.tsx`

**🟡 Files to migrate (10 modonty public):**
- [ ] B.51 `modonty/lib/types.ts`
- [ ] B.52 `modonty/app/api/helpers/client-queries.ts`
- [ ] B.53 `modonty/app/clients/components/clients-section.tsx`
- [ ] B.54 `modonty/app/clients/components/clients-content.tsx`
- [ ] B.55 `modonty/app/clients/components/featured-client-card.tsx`
- [ ] B.56 `modonty/app/clients/components/featured-clients.tsx`
- [ ] B.57 `modonty/app/clients/components/client-card.tsx`
- [ ] B.58 `modonty/app/clients/components/client-list-item.tsx`
- [ ] B.59 `modonty/app/clients/helpers/use-client-filters.ts`
- [ ] B.60 `modonty/app/search/components/SearchResults.tsx`

**🟢 Scripts to rewrite (4):**
- [ ] B.61 `admin/scripts/seed-tiers.ts` (rewrite بـ jbrseoId)
- [ ] B.62 `scripts/seed-ui-test-data.ts`
- [ ] B.63 `admin/app/(dashboard)/settings/actions/seed-integration-test.ts`
- [ ] B.64 `admin/app/(dashboard)/clients/helpers/generate-client-test-data.ts`

**🔴 Final cleanup (Step B end):**
- [ ] B.65 حذف `enum SubscriptionTier` من `dataLayer/prisma/schema/schema.prisma`
- [ ] B.66 حذف `Client.subscriptionTier` من `Client` model
- [ ] B.67 حذف `tier`, `price`, `isActive`, `isPopular`, `description`, `createdAt` من `SubscriptionTierConfig`
- [ ] B.68 prisma:validate + prisma:generate
- [ ] B.69 TSC zero × 3 apps + full Playwright regression test
- [ ] B.70 Push النهائي

---

### Phase 4 — jbrseo Subscribers Mirror ✅ DONE (2026-05-02)

#### 4a — Sync layer ✅

- [x] **4.1** `admin/app/(dashboard)/jbrseo-subscribers/actions/sync-subscribers.ts` ✅:
  - يقرأ من collection اسمه `Subscriber` (PascalCase) في jbrseo MongoDB
  - لكل doc: upsert في `db.jbrseoSubscriber` by `jbrseoId` (= `_id.toString()`)
  - يرجّع `{ ok, total, created, updated, durationMs }`
  - auth check: يرجّع 401 لو ما في session

#### 4b — Admin UI ✅

- [x] **4.2** صفحة `admin/app/(dashboard)/jbrseo-subscribers/page.tsx` ✅:
  - Header (Users icon + title + subtitle)
  - 4 KPI cards (Total · SA · EG · Annual/Monthly)
  - Search bar + filter pills (country: All/SA/EG · billing: All/Annual/Monthly)
  - Table: Date · Name · Email · Phone · Business · Plan · Country · Billing
  - Empty state: "No subscribers yet — click 'Sync from jbrseo' to import"
  - Pagination implicit (`take: 500`)
- [x] **4.3** Sidebar link ✅: مجموعة "Audience" → "jbrseo Subscribers" (Users2 icon)
- [x] **4.4** Sync button component ✅: spinner + result badge + sonner-style toasts
- [x] **4.5** Helper: `admin/lib/jbrseo-client.ts` — singleton MongoClient connection
- [x] **4.6** Package: `mongodb@^6.20.0` installed in admin

#### 4c — Verified live ✅

- [x] TSC admin: zero errors
- [x] Playwright: page loads at `/jbrseo-subscribers` · 0 console errors
- [x] Sync button clicked → "0 total" badge with green check (initial)
- [x] **End-to-end LIVE TEST passed** ✅:
  - سجّلت اشتراك حقيقي على https://www.jbrseo.com/sa/signup?plan=growth (الزخم سنوي)
  - بيانات الاختبار: محمد التجريبي · test-modonty-sync@example.com · 555123456 · متجر تجريبي للاختبار
  - أرجعت لصفحة admin · ضغطت Sync from jbrseo
  - النتيجة: KPIs Total=1 · SA=1 · Annual=1 · المشترك ظهر في الجدول بكل الحقول الصحيحة
  - Plan: "الزخم" (عربي من jbrseo) · Country: SA · Billing: Annual · Phone: +966555123456 (مع تنسيق تلقائي)
- [x] Screenshots: `jbrseo-subscribers-page.png` · `jbrseo-pricing-sa.png` · `jbrseo-signup-form.png` · `jbrseo-after-real-sync.png`

#### 4d — ما لم نبنيه (out of scope)

- ❌ Detail drawer · Status workflow · Notes/assignedTo/convertedClientId · Cron auto-sync

### Phase 5 — Testing + Rollout

- [ ] **5.1** TSC zero × 3 apps (admin · modonty · console)
- [ ] **5.2** Live test sync — Pricing:
  - تشغيل sync من admin
  - verify الـ data في DB
  - فتح صفحة guideline → السعر يظهر من DB
  - تعديل سعر في jbrseo (manual في admin jbrseo) → re-sync → التغيير يظهر
- [ ] **5.3** Live test sync — Leads:
  - sync أولي → عدد الـ leads مطابق لـ jbrseo
  - تغيير status من admin → notes تحفظ → KPIs تتحدّث
  - re-sync (الـ workflow data ما تنمسح) → mirror fields تتحدّث فقط
- [ ] **5.4** Backup قبل push
- [ ] **5.5** Bump versions (admin v0.48.0?)
- [ ] **5.6** Changelog entry في DB (admin/scripts/add-changelog.ts)
- [ ] **5.7** Push (بعد تأكيد المستخدم)
- [ ] **5.8** Verify على production (admin.modonty.com) بعد Vercel deploy

---

## 5. Decisions Log (نحتاج إجابات قبل التنفيذ)

| # | السؤال | الخيارات | افتراضي مقترح |
|---|--------|----------|---------------|
| Q1 | Free tier (jbrseo فيه `id: "free"`) | (a) نضيف FREE للـ enum (b) نتجاهل في الـ display (c) نتركه في PricingPlans.PLANS بدون mapping للـ enum | **(c)** — `PricingPlans.data.PLANS` يخزّن كل شيء، الـ enum يبقى للـ billing فقط |
| Q2 | Read-only user عند jbrseo MongoDB | (a) ننشئ user جديد read-only (b) نستخدم نفس الـ existing user | **(a)** — أقل خطر |
| Q3 | sync trigger | (a) manual button فقط (b) cron auto كل ساعة (c) كلاهما | **(c)** لكن phase 5 — نبدأ بـ (a) |
| Q4 | Static fallback لـ pricing | (a) نسخ data من jbrseo TS إلى modonty static (b) نطلب من jbrseo إنشاء endpoint عام للـ static | **(a)** — أسهل، أقل dependencies |
| Q5 | preview قبل overwrite في pricing | نعرض diff (هذي الحقول حتتغير) ثم confirm؟ | نعم — أكثر senior |
| Q6 | sidebar grouping | jbrseo-leads داخل مجموعة "Audience" أو "Sales"؟ + pricing-mirror داخل "Integrations" أو "Settings"؟ | نقاش لاحق |
| Q7 | data privacy للـ leads | role-gate ADMIN فقط؟ أو CONTENT_MANAGER يقدر يشوف بدون edit؟ | **ADMIN-only** للبداية |

---

## 6. Files to Create/Modify (الملخّص)

### New files (admin)
- `admin/app/(dashboard)/pricing-mirror/page.tsx`
- `admin/app/(dashboard)/pricing-mirror/components/sync-card.tsx`
- `admin/app/(dashboard)/pricing-mirror/actions/pricing-actions.ts`
- `admin/app/(dashboard)/jbrseo-leads/page.tsx`
- `admin/app/(dashboard)/jbrseo-leads/components/leads-table.tsx`
- `admin/app/(dashboard)/jbrseo-leads/components/lead-drawer.tsx`
- `admin/app/(dashboard)/jbrseo-leads/components/sync-button.tsx`
- `admin/app/(dashboard)/jbrseo-leads/actions/leads-actions.ts`
- `admin/app/(dashboard)/jbrseo-leads/actions/sync-action.ts`
- `admin/lib/pricing/sync-from-jbrseo.ts`
- `admin/lib/pricing/get-pricing.ts`
- `admin/lib/pricing/format-price-for-guideline.ts`
- `admin/scripts/test-jbrseo-connection.ts`

### New files (dataLayer)
- `dataLayer/lib/jbrseo-client.ts`
- `dataLayer/lib/jbrseo-types.ts`
- `dataLayer/lib/jbrseo-pricing-fallback.ts` (one-time copy of TS data)

### Modified files (schema)
- `dataLayer/prisma/schema/schema.prisma` (add 1 enum + 2 models)

### Modified files (env)
- `.env.shared` (add `JBRSEO_DATABASE_URL`)
- `.env.shared.example` (add placeholder)

### Modified files (consumers)
- `console/app/(dashboard)/dashboard/settings/components/subscription-card.tsx`
- `console/app/(dashboard)/dashboard/settings/page.tsx`
- `admin/app/(public)/guidelines/brand/page.tsx`
- `admin/app/(public)/guidelines/golden-rules/page.tsx`
- `admin/app/(public)/guidelines/icps/page.tsx`
- `admin/app/(public)/guidelines/positioning/page.tsx`
- `admin/app/(public)/guidelines/sales-playbook/page.tsx`
- `admin/app/(public)/guidelines/team-onboarding/page.tsx`
- `admin/components/admin/sidebar.tsx` (sidebar links)

---

## 7. Risks + Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| jbrseo schema يتغير (يضاف حقل في `Plan`) | الـ sync يفشل أو data ناقصة | الـ `data: Json` يخزّن أي شكل · types نحدّثها يدوياً وقت الحاجة |
| Connection لـ jbrseo MongoDB ينقطع | sync action يفشل | try/catch + Toast واضح + UI fallback لآخر sync ناجح |
| نفس الإيميل في jbrseo Subscriber + modonty Client | confusion | `JbrseoLead.convertedClientId` يربط · admin UI يعرض link |
| تعديل manual في PricingPlans ثم re-sync = ضياع | بيانات تروح | preview/diff قبل overwrite + warning لو الـ source = "manual" |
| تعديل manual في JbrseoLead workflow (status, notes) ثم re-sync | الـ workflow ما يضيع | re-sync **يحدّث mirror fields فقط**، ما يلمس workflow |
| `JBRSEO_DATABASE_URL` يوصل modonty/console (مش admin فقط) | exposure غير ضروري | نقصره على admin فقط (نضعه في `admin/.env.local` بدلاً من `.env.shared`) — **decision pending** |

> **Q8 إضافي:** الـ env key نحطه في `.env.shared` (3 apps يقرأوه) أو `admin/.env.local` (admin فقط)؟
> الـ leads + pricing sync كلاهما يشتغل من admin فقط — فلا يحتاج modonty/console يقرأوا الـ jbrseo DB.
> **مقترح:** `.env.shared` لأن المستخدم طلبها صراحة + ما يضر شي + يبسّط الـ Vercel deployment.

---

## 8. Definition of Done

- [ ] schema جديد deployed لـ production
- [ ] sync from jbrseo يعمل live بنجاح (pricing × 2 country + leads)
- [ ] 8 صفحات guideline تقرأ من DB (لا hardcoded)
- [ ] subscription-card في console يقرأ من DB
- [ ] admin يقدر يشوف + يحدّث lead status بدون errors
- [ ] TSC zero × 3 apps
- [ ] Live test full circle (modonty ↔ admin ↔ console)
- [ ] Backup ناجح قبل push
- [ ] Changelog entry في LOCAL + PROD DBs
- [ ] Vercel deploy ناجح
- [ ] أول sync على production يعمل
