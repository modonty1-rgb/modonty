# JBRSEO ↔ MODONTY Integration — Plan

> **آخر تحديث:** 2026-05-02 (✅ كل صفحات guideline منجزة — 33 موضع في 7 صفحات تقرأ من DB · 100% live tested)
> **الحالة:** Subscribers ✅ live · Schema Step A ✅ deployed · DEV Sync button ✅ tested · **التالي: Pricing**
> **الإصدار:** admin v0.48.0 (production)

---

## 🔴 المهام المتبقية (PENDING)

### 🥇 Step 3 — Pricing Sync + Display Consumers

> **استراتيجية:** كل sub-task صغير + قابل للاختبار مستقل · نمسكها واحدة واحدة لتجنّب المخاطرات.

#### 3a — TypeScript Types + Static Fallback

- [ ] **3.1.1** أنشئ `admin/lib/pricing/jbrseo-types.ts`:
  - `interface JbrseoPlan { id, name, persona, price: { mo, yr }, articles, ... }`
  - `interface JbrseoLandingSectionData { PLANS: JbrseoPlan[]; ... }`
  - مصدر: `JBRSEO/jbrseo.com/app/content/landing/price-section-types.ts`
- [ ] **3.1.2** أنشئ `admin/lib/pricing/jbrseo-fallback.ts`:
  - one-time copy لـ `PLANS[]` من jbrseo `landing-sa.ts` (4 plans للسعودية)
  - one-time copy لـ `PLANS[]` من jbrseo `landing-eg.ts` (لو موجود — اختياري)
- [ ] **3.1.3** Verify: `pnpm tsc --noEmit` zero errors

#### 3b — Helpers

- [ ] **3.2.1** أنشئ `admin/lib/pricing/parse-arabic-num.ts`:
  - يحوّل `"٨ مقالات / شهر"` → `8` (Int)
  - يدعم الأرقام العربية (٠-٩) والإنجليزية (0-9)
- [ ] **3.2.2** Test cases (manual): "٨ مقالات / شهر" → 8 · "١٢ مقال" → 12 · "١ مقال هدية" → 1

#### 3c — Reader (jbrseo MongoDB → Plans[])

- [ ] **3.3.1** أنشئ `admin/lib/pricing/read-from-jbrseo.ts`:
  - يستخدم `getJbrseoDb()` الموجود
  - يقرأ `LandingSection.findOne({ country, section: 'pricing' })`
  - يستخرج `data.PLANS`
  - fallback لـ `jbrseo-fallback.ts` لو row فاضي
  - يرجّع `{ plans: JbrseoPlan[]; source: 'db' | 'static' }`
- [ ] **3.3.2** Test: استدعاء يدوي عبر script → طباعة الـ plans

#### 3d — Sync Server Action

- [ ] **3.4.1** أنشئ `admin/app/(dashboard)/pricing-mirror/actions/sync-pricing.ts`:
  - auth check (admin only)
  - يستدعي `readFromJbrseo(country)`
  - يبني `articleCounts: { name: count }` global object
  - upsert per plan: `db.subscriptionTierConfig.upsert({ where: { jbrseoId } })`:
    - يكتب على Step A: `name`, `articlesPerMonth`, `price`
    - يكتب على New: `pricing[country]`, `articleCounts`, `syncedAtSA/EG`
  - revalidateTag(`tier-pricing-${country}`)
  - يرجّع `{ ok, country, source, upserted }`
- [ ] **3.4.2** TSC verify

#### 3e — Read API + Cache

- [x] **3.5.1** ✅ `admin/lib/pricing/get-tier-pricing.ts` (2026-05-02):
  - `getTierPricing(jbrseoId, country)` + `getAllTiersPricing(country)`
  - `unstable_cache` ساعة + tag `tier-pricing`
  - **Smart fallback:** يقرأ `pricing[country].mo` لو موجود · fallback لـ `tier.price` لو فاضي

#### 3f — Admin UI: Pricing Mirror Page

- [ ] **3.6.1** أنشئ `admin/app/(dashboard)/pricing-mirror/page.tsx` (server component):
  - Header (DollarSign icon + title + subtitle)
  - يفتح `db.subscriptionTierConfig.findMany()` للحالة الحالية
- [ ] **3.6.2** أنشئ `pricing-mirror/components/country-card.tsx`:
  - شخصية كارت لكل بلد (SA + EG)
  - يعرض: 4 plans + الأسعار + Last synced
  - زر "Sync SA from jbrseo" / "Sync EG from jbrseo"
- [ ] **3.6.3** أنشئ `pricing-mirror/components/sync-pricing-button.tsx`:
  - Confirmation dialog قبل التنفيذ
  - Loading state أثناء التنفيذ
  - Toast feedback (نجح / فشل)
- [ ] **3.6.4** أنشئ `pricing-mirror/components/tier-row.tsx`:
  - عرض tier واحد: name + jbrseoId + articles + mo/yr
- [ ] **3.6.5** أضف sidebar link في admin — مجموعة "System" → "Pricing Mirror"

#### 3g — Consumers Migration (Console)

- [ ] **3.7.1** عدّل `console/dashboard/settings/page.tsx`:
  - يمرّر `country` من `client.addressCountry` للـ subscription-card
- [ ] **3.7.2** عدّل `console/.../subscription-card.tsx`:
  - يقرأ `tier.pricing?.[country]?.mo` بدل `tier.price`
  - fallback لـ `tier.price` لو `pricing` فاضي (Step A compat)
- [ ] **3.7.3** Live test: افتح `/dashboard/settings` على Kimazone client (PROD) → السعر يظهر من `pricing.SA.mo`

#### 3h — Helper for Guidelines

- [x] **3.8.1** ✅ `admin/lib/pricing/format-for-guideline.ts` (2026-05-02):
  - `formatPriceForGuideline(jbrseoId, country)` → `{ monthly, yearly, monthlyAr, yearlyAr, articles, name }`
  - `getMomentumPrice()` و `getLeadershipPrice()` convenience wrappers
  - يستخدم `Intl.NumberFormat("ar-SA")` + `"en-GB"` للأرقام

#### 3i — Guideline Pages Migration (6 pages)

> كل صفحة: استبدال hardcoded → استخدام `formatPriceForGuideline()` + live test مستقل

- [x] **3.9.1** ✅ `admin/app/(public)/guidelines/brand/page.tsx` (2026-05-02):
  - 5 مواضع استُبدلت بـ `getMomentumPrice("SA")`
  - Page converted to async + 4 placeholders + resolved arrays
  - Live test passed: كل الأسعار تظهر صحيح · صفر placeholder leaks
  - WordPress comparison math live (savings = wordpress - momentum)
- [x] **3.9.2** ✅ `golden-rules/page.tsx` — 9 مواضع (الباقات + WordPress table + ROI pre + الفرق النفسي) · live tested
- [x] **3.9.3** ✅ `icps/page.tsx` — 2 مواضع (pain solution + Discovery question) · live tested
- [x] **3.9.4** ✅ `positioning/page.tsx` — 3 مواضع (modontyEdge + rivalCost + footnote) · live tested
- [x] **3.9.5** ✅ `sales-playbook/page.tsx` — 13 موضع (Q&A + WP math + الباقات + ROI calc + Hero + pricing fix + Calc pre block) · live tested
- [x] **3.9.6** ✅ `team-onboarding/page.tsx` — 1 موضع (ROI Calculator) · live tested
- [x] **3.9.7** ✅ `marketing-strategy/page.tsx` — لا أرقام، فقط اسم "Momentum" — لا يحتاج تعديل

#### 3j — Verification

- [ ] **3.10.1** TSC zero × admin
- [ ] **3.10.2** TSC zero × modonty
- [ ] **3.10.3** TSC zero × console
- [ ] **3.10.4** Live test: sync SA → افتح pricing-mirror → 4 tiers ظاهرة بأسعار صحيحة
- [ ] **3.10.5** Live test: افتح كل صفحة guideline من 6 + تأكد السعر يظهر من DB
- [ ] **3.10.6** Live test: console subscription-card على Kimazone client → 1,299 SAR ظاهر

#### 3k — Push admin v0.49.0

- [ ] **3.11.1** Backup قاعدة البيانات (`bash scripts/backup.sh`)
- [ ] **3.11.2** Bump `admin/package.json` 0.48.0 → 0.49.0
- [ ] **3.11.3** أضف v0.49.0 entry لـ `add-changelog.ts`
- [ ] **3.11.4** Run changelog script (LOCAL + PROD)
- [ ] **3.11.5** Stage selected files (تجنّب `.claude/settings.json`)
- [ ] **3.11.6** Commit + Push
- [ ] **3.11.7** انتظار Vercel deploy
- [ ] **3.11.8** **Production Live Cast:** افتح https://admin.modonty.com/pricing-mirror → sync → تحقق

**الإجمالي:** ~37 sub-task صغيرة قابلة للتتبع

---

### 🟠 Step B — Refactor 52 files (يُنفَّذ في session منفصلة بعد Step 3)

> الهدف: حذف الحقول القديمة من `SubscriptionTierConfig` بعد ما الـ consumers تتحوّل للحقول الجديدة.

**ما يُحذف نهائياً:**
- `tier: SubscriptionTier @unique`
- `price: Float`
- `articlesPerMonth: Int`
- `name: String`
- `isActive`, `isPopular`, `description`, `createdAt`
- `enum SubscriptionTier`
- `Client.subscriptionTier`

**Files to migrate (مفصّل في "📋 Reference — Files Inventory" أدناه):**
- 32 ملف admin
- 5 ملفات console
- 10 ملفات modonty public
- 4 ملفات scripts
- 1 schema cleanup

**Final cleanup:**
- [ ] حذف enum + boilerplate fields من schema
- [ ] حذف `Client.subscriptionTier`
- [ ] prisma:validate + prisma:generate
- [ ] TSC zero × 3 apps
- [ ] Push admin v0.50.0

---

## 📋 Reference — Schemas + Files Inventory

### Schema الحالية (Step A — deployed على PROD + DEV)

```prisma
model SubscriptionTierConfig {
  id              String          @id @default(auto()) @map("_id") @db.ObjectId

  // Step A compat (تُحذف Step B — للـ 52 ملف)
  tier            SubscriptionTier @unique
  price           Float
  articlesPerMonth Int
  name            String
  isActive        Boolean         @default(true)
  isPopular       Boolean         @default(false)
  description     String?
  createdAt       DateTime        @default(now())

  // Jbrseo integration ✨
  jbrseoId        String?         @unique          // "free"|"starter"|"growth"|"scale"
  pricing         Json?                            // { SA: {mo,yr}, EG: {mo,yr} }
  articleCounts   Json?                            // { اسم الباقة: عدد المقالات }
  syncedAtSA      DateTime?
  syncedAtEG      DateTime?

  updatedAt       DateTime        @updatedAt
  clients         Client[]        @relation("ClientTierConfig")

  @@map("subscription_tier_configs")
}

model JbrseoSubscriber {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  jbrseoId        String   @unique
  contactName     String?
  email           String
  phone           String
  businessName    String?
  businessType    String?
  planName        String
  planIndex       Int?
  country         String
  isAnnual        Boolean
  jbrseoCreatedAt DateTime
  syncedAt        DateTime @default(now())

  @@index([country])
  @@index([jbrseoCreatedAt])
  @@map("jbrseo_subscribers")
}
```

### Mapping (jbrseo → modonty enum)

| jbrseo `id` | modonty `tier` | name (Arabic) | articles | price (SA) |
|------------|----------------|---------------|----------|------------|
| `free` | BASIC | مجاني | 1 | 0 |
| `starter` | STANDARD | الانطلاقة | 4 | 499/mo |
| `growth` | PRO | الزخم | 8 | 1,299/mo |
| `scale` | PREMIUM | الريادة | 12 | 2,999/mo |

### Files Inventory (52 ملف للـ Step B refactor)

**Admin (32):**
- Subscription Tiers UI (5): page, tier-cards, tier-table, tier-form, tier-actions
- Clients module (22): client-form, client-table, [id]/* tabs, helpers, actions/*, etc.
- Dashboard widgets (4): subscription-tier-chart, delivery-progress, alerts-section, dashboard-actions
- Guidelines (1): guidelines/clients/page.tsx
- Lib + i18n (3): form-types, messages/ar, messages/en

**Console (5):**
- dashboard-queries, settings/page, subscription-card, campaigns/page, content/page

**Modonty public (10):**
- types, client-queries, clients-section, clients-content, featured-client-card, featured-clients, client-card, client-list-item, use-client-filters, SearchResults

**Scripts (4):**
- seed-tiers, seed-ui-test-data, seed-integration-test, generate-client-test-data

---

## 🎯 Decisions Log

| # | السؤال | القرار |
|---|--------|--------|
| Q1 | Architecture (mirror vs API) | **Mirror + Sync** — modonty SOT في runtime |
| Q2 | Scope per plan | name + price{mo,yr} + articles فقط (4 → 3 fields) |
| Q3 | Country handling | `pricing: Json` على نفس الـ row (مش row-per-country) |
| Q4 | articles location | global في `articleCounts: Json` (مش inside each plan) |
| Q5 | Schema strategy | **Extend existing** `SubscriptionTierConfig` (لا جدول جديد) |
| Q6 | Refactor strategy | **Option B — Gradual** (Step A compat ← الآن، Step B cleanup ← لاحقاً) |
| Q7 | Subscribers scope | Pure mirror — display only · صفر workflow |
| Q8 | Env scope | `JBRSEO_DATABASE_URL` في `.env.shared` + Vercel Team Shared |
| Q9 | DB target | PROD + DEV متزامنين (الـ user يشتغل على PROD) |

---

## ⚠️ Risks + Mitigations

| Risk | Mitigation |
|------|-----------|
| jbrseo schema يتغير | الـ data في Json — sync يلتقط الجديد بدون code change |
| Connection ينقطع | try/catch + Toast + UI fallback لآخر sync ناجح |
| نفس الإيميل في jbrseo + Client | UI link لاحقاً (out of scope حالياً) |
| تعديل manual في PricingPlans ثم re-sync | preview/diff قبل overwrite |
| تعديل manual في JbrseoSubscriber ثم re-sync | re-sync يحدّث mirror fields فقط (workflow محفوظ — مش موجود حالياً) |

---

## ✅ Done (المنجز)

### Phase 0 — Environment Setup ✅ (2026-05-02)
- [x] **0.1** Connection string لـ jbrseo MongoDB (نفس cluster + database = `modonty` PROD)
- [x] **0.2** `JBRSEO_DATABASE_URL` أُضيف لـ `.env.shared`
- [x] **0.3** `.env.shared.example` placeholder
- [x] **0.4** Vercel Team Shared Env (`env_aBMoni0fA5YXFS1lo5Lcz4zX`) — مرتبط بـ admin/modonty/console · production+preview+development · encrypted
- [x] **0.5** kill node processes قبل أي prisma generate

### Step A.1 — Schema Migration ✅ (2026-05-02)
- [x] أُضيف على `SubscriptionTierConfig`: `jbrseoId String? @unique` + `pricing Json?` + `articleCounts Json?` + `syncedAtSA/EG DateTime?`
- [x] أُضيف `model JbrseoSubscriber` (mirror حرفي · صفر workflow)
- [x] أُبقي للـ compatibility (يُحذفون Step B): `tier`, `price`, `articlesPerMonth`, `name`, `isActive`, `isPopular`, `description`, `createdAt`, `enum SubscriptionTier`, `Client.subscriptionTier`
- [x] `pnpm prisma:validate` → schema valid
- [x] `pnpm prisma:generate` → Prisma Client v6.19.2

### Step A.2-A.5 — DB Push + Backfill + Live Test ✅ (2026-05-02)
- [x] DB push على PROD (`modonty`) + DEV (`modonty_dev`) — نجح بعد backfill
- [x] Backfill `jbrseoId` على 4 صفوف existing:
  - BASIC → `"free"` · STANDARD → `"starter"` · PRO → `"growth"` · PREMIUM → `"scale"`
- [x] Admin local server شغّال على http://localhost:3000
- [x] Playwright: Dashboard يحمّل 200 · صفر console errors

### Phase 4 — jbrseo Subscribers Mirror ✅ (2026-05-02)
- [x] `admin/app/(dashboard)/jbrseo-subscribers/actions/sync-subscribers.ts` — server action
- [x] `admin/app/(dashboard)/jbrseo-subscribers/page.tsx` — صفحة عرض كاملة
- [x] 4 KPI cards (Total · SA · EG · Annual/Monthly)
- [x] Table مع Search + Filter pills (country/billing)
- [x] Sidebar link في مجموعة "Audience"
- [x] `admin/lib/jbrseo-client.ts` — singleton MongoClient connection
- [x] `mongodb@^6.20.0` package مضاف لـ admin
- [x] **Live test على PROD passed:**
  - سجّلت اشتراك حقيقي على https://www.jbrseo.com/sa/signup?plan=scale
  - بيانات: فاطمة الدليلة · scale tier · monthly
  - Sync من admin.modonty.com → ظهر مع كل الحقول صحيحة
  - End-to-end على Production مؤكّد 100%

### Phase 2.5 — DEV-only Sync Local from PROD Button ✅ (2026-05-02)
- [x] `admin/app/api/dev/sync-local-from-prod/route.ts` — API route streaming (NDJSON)
- [x] `admin/components/admin/sync-local-button.tsx` — زر + Dialog مع progress UI
- [x] **Safety:** يرفض الكتابة لو DATABASE_URL لا يحتوي `modonty_dev`
- [x] **DEV-only:** الزر مخفي في production (inlined في الـ build)
- [x] Filter system collections (`system.*` + `_*`)
- [x] Record-by-record insert + نسخ indexes من PROD
- [x] **Bug fixed:** `unique: null`/`sparse: null` في الـ index spec — أُصلح بفلترة null/undefined
- [x] **Live test passed:** 64/64 جدول · 1,242 وثيقة · 137.3s · LOCAL = PROD identical

### Push admin v0.48.0 ✅ (2026-05-02)
- [x] Backup (60 collections, 702K, kept 10/10)
- [x] TSC zero × 3 apps
- [x] Changelog v0.48.0 (LOCAL + PROD DBs)
- [x] Commit `7501e41` (initial)
- [x] Vercel build failed (`isActive` reference in `create-client.ts:50`)
- [x] **Hotfix `01302ac`:** restored boilerplate fields + ObjectId typing fix
- [x] Vercel build passed (second attempt)
- [x] **Production Live Cast PASSED:** https://admin.modonty.com/jbrseo-subscribers مع subscriber حي

### Lessons Learned
- ⚠️ Deep scan فات `create-client.ts:50` — Step A يجب يبقى **كل** الحقول القديمة، حتى اللي قلنا "زائد"
- ⚠️ MongoDB يرفض `unique: null` و `sparse: null` — لازم filter قبل createIndexes
- ⚠️ `dataLayer/.env` له priority على `.env.shared` للـ Prisma CLI — راجع كل ملفات env قبل أي DB action
