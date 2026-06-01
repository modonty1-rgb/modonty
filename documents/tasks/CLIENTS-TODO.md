# Clients + Articles — Active TODO

> **آخر تحديث:** 2026-05-03 (تنظيف كامل من المنجز)
> **النطاق:** Schema migration للعميل + ArticleStatus enum + code refactor + UI workflow.
> **ملف منفصل لـ Article Schema perfection:** [ARTICLE-SCHEMA-PERFECTION-TODO.md](ARTICLE-SCHEMA-PERFECTION-TODO.md)
> **ملف منفصل لـ Article Form polish:** [NEW-ARTICLE-FORM-TODO.md](NEW-ARTICLE-FORM-TODO.md)
> **مرجع المخططات:** `documents/diagrams/01-client-creation-flow.png` · `02-database-schema-er.png` · `03-jbrseo-conversion-sequence.png` · `04-article-lifecycle-workflow.png`
> **القاعدة الذهبية للتسعير:** `memory/project_pricing_no_discount.md` — لا خصم، فقط مكافآت يدوية بتعميد إدارة.

---

## 🔴 Active (added 2026-06-01)

### ✅ Client SEO score — VERIFIED END-TO-END to 99% (admin = console parity)
Live test 2026-06-01 (devnadish), every step via Playwright + verified on BOTH surfaces:
- empty client = **55%** (honest baseline; the old fake scorer showed 70%)
- 26 text fields (console profile) + hreflang-from-Settings fix → **65%** (11/15 green)
- **client activated** (PENDING → ACTIVE) so the media library unlocks (admin uploaded logo + hero via
  `/media/upload` → picked them in the logo/hero modals → Update Client) → **99%** 🎉
- **admin SEO page = console profile = 99%**, 14/15 checks green on BOTH. صحّة البنية (structural validity)
  turned ✓ automatically once the logo existed + a full save regenerated the JSON-LD.
- ONLY remaining 1%: ○ **Local SEO** (`addressLatitude`/`addressLongitude` + `priceRange` + `gbpPlaceId`) —
  optional local-business fields on the admin SEO page. A client without a physical storefront legitimately
  caps at 99%; that's correct, not a bug.
- **CONCLUSION:** the scorer is honest + accurate + identical across admin/console. A fully-onboarded client
  (text + logo + hero) reaches 99% automatically. 100% needs the 3 Local SEO fields.
- Earlier TODO drafts guessed 78→88→97% BEFORE verifying — those were wrong. Real verified path:
  55 → 65 (text) → 99 (logo+hero). Recorded straight from the live UI.
- **Image upload prerequisite (important for tomorrow's 10-client onboarding):** the client must be
  **ACTIVE** before its media library accepts uploads — a PENDING client shows "No media available" and
  can't get a logo. So the onboarding order is: create → **activate** → upload logo+hero → Update Client.

### ✅ DONE this session (2026-06-01 cont.) — three small items closed
- ✅ **Activation email** — `admin/.../actions/activate-client.ts` `activateClientAction` now calls
  `sendClientWelcome(clientId)` (best-effort try/catch) after activating, so a PENDING→ACTIVE client gets
  their login creds + console URL by email. Toast reports whether the mail went out. TSC admin=0.
- ✅ **Twitter orphan cleanup** — removed the 4 dead Twitter fields (card/title/site/description) from the
  edit form: `form-sections/seo-section.tsx` (UI + hints + error aggregate), `client-form-schema.ts`
  (zod fields + twitterSiteSchema + twitterCardSchema), `hooks/use-client-form.ts` (submitData),
  `generate-client-test-data.ts` (test seed). They were never Client columns (generated from Settings +
  hero image). TSC admin=0.
  - NOTE (low-priority leftover): display-only tabs still reference `client.twitter*` —
    `[id]/components/tabs/{details-tab,seo-tab,media-social-tab}.tsx` + `client-seo-config/*` +
    `build-client-seo-data.ts` + `client-field-mapping.ts` (docs). All render behind `client.x && (...)`
    so they show nothing (DB value is always null). Harmless; clean up if/when touching those tabs.
- ✅ **`hasMap` schema.org warning** — FIXED in `dataLayer/lib/seo/generate-organization-jsonld.ts`:
  Place-only props (geo/hasMap/openingHours/priceRange) now emitted ONLY for LocalBusiness sub-types
  (new `isLocalBusinessType`). Generic `Organization` no longer triggers the UNKNOWN_FIELD warning; GBP
  link still rides in `sameAs`. PROVEN by a direct generator unit-test (Organization→omitted,
  Dentist→present). ⏳ awaiting one VISUAL confirm on the live page after servers restart + re-regen.

### ✅ Already correct (TODO was stale) — logo/hero DO regenerate SEO
- `updateClientLogo` + `updateClientHero` already call `generateClientSEO(clientId)` (line 35 of each).
  The earlier TODO claim that they don't was wrong — that's why "صحّة البنية" flipped ✓ automatically when
  the logo was uploaded in the live test. No action needed.

### 🐛 UX GAP (open) — logo/hero upload opens a new tab instead of an in-modal uploader
The logo modal's MediaPicker shows existing media + "Select Media", but a fresh client with NO media has only
an "Upload" button that navigates to `/media/upload?clientId=...` in a NEW TAB. So onboarding a new client is:
new tab → upload → come back → reopen modal → Select Media → Save. Heavy for the most common step.
- [ ] Decide: add an inline drag-drop uploader inside the logo/hero modal (best UX), OR keep the two-step
  flow (works, just slow). Low priority — the flow works for tomorrow's 10-client onboarding.

### Earlier session fixes (kept for history)
- ✅ FIXED + LIVE-VERIFIED this session: console `regenerate-client-seo.ts` hreflang now falls back to Settings (`defaultAlternateLanguages` → `defaultHreflang` → `inLanguage` → `"ar-SA"`). Was wiping admin-generated hreflang on every console save → score dropped each time. After fix + console save: hreflang ✓ on BOTH surfaces, score 57→65%, admin=console=65% parity. TSC console = 0.
- ✅ DONE + LIVE-VERIFIED this session: admin `/clients/[id]/edit` header now shows the UNIFIED SEO chip ("SEO 65%") via `computeClientSeoScore(clientToSeoInput(initialData))` — was reading the OLD `createClientSEOGroupScores` system (different number from every other surface). Removed dead code (SEODoctor header node + buildClientSeoData memo + group-score config + getSEOSettings fetch + seoFieldsKey + clientFormSections/getVisibleFieldCount imports). Media widget redesigned: status dots (logo missing = amber "مطلوب لظهور المنظمة في Google"; present = green) + clearer Arabic labels + "يغذّيان جاهزية SEO مباشرةً" hint. TSC admin = 0.

---

## 🎯 ملخّص القرارات النهائية

### العميل (Client)
- ✅ حقل واحد موحّد `status` يحلّ محل `subscriptionStatus` و `paymentStatus`
- ✅ حقل `origin` لتتبّع مصدر العميل (٥ خيارات)
- ✅ لقطة سعرية على العميل (snapshot) — السعر ثابت لا يتغيّر بتغيّر إعدادات الباقة
- ✅ شاشة موحّدة لتأسيس العميل مع منتقي المصدر
- ✅ لا حقول مكافآت — البونص يدوي عبر `articlesPerMonth` و `subscriptionEndDate` الموجودين

### المقال (Article)
- ✅ إضافة حالتين جديدتين على enum الموجود: `AWAITING_APPROVAL` و `NEEDS_REVISION`
- ✅ سير عمل واضح: WRITING → DRAFT → AWAITING_APPROVAL → (وافق العميل) → SCHEDULED أو PUBLISHED · أو (طلب تعديلات) → NEEDS_REVISION → WRITING

---

## 🔵 التصميم النهائي للـ Schema

### نموذج `Client` — الحقول الجديدة

```prisma
enum ClientStatus {
  NEW           // أُنشئ توّاً (افتراضي)
  VERIFYING     // قيد التوثيق (بيانات + سجل تجاري)
  PUBLISHED     // ظاهر على موقع مدونتي + دافع منتظم
  OVERDUE       // ظاهر + متأخّر في الدفع (فترة سماح)
  EXPIRED       // انتهى — مخفي
  ARCHIVED      // مؤرشف (حذف منطقي)
}

enum ClientOrigin {
  JBRSEO
  DIRECT
  REFERRAL
  ADVERTISING
  OTHER
}

model Client {
  // ... الحقول الموجودة

  // 🆕 حقل المرحلة الموحّد (يحلّ محل subscriptionStatus + paymentStatus)
  status              ClientStatus    @default(NEW)
  publishedAt         DateTime?       // متى دخل PUBLISHED أوّل مرة
  expiredAt           DateTime?       // متى انتقل لـ EXPIRED

  // 🆕 لقطة سعرية (locked at subscribe time)
  subscribedCountry        String?    // "SA" | "EG"
  subscribedMonthsPaid     Int?       // 1, 3, 6, 12, 24
  subscribedPricePerMonth  Float?     // السعر القياسي (لا خصم)
  subscribedAt             DateTime?  // متى تم التثبيت

  // 🆕 مصدر العميل (للتحليلات)
  origin                ClientOrigin?
  jbrseoSubscriberId    String?       // ربط بمشترك جبر سيو
  referralClientId      String?       @db.ObjectId  // ربط بالعميل المُحيل
  originNote            String?       // ملاحظات (لو origin = OTHER)

  // ❌ حقول تُحذف:
  // subscriptionStatus  → دُمج في status
  // paymentStatus       → دُمج في status
}
```

### نموذج `Article` — الحالات الجديدة

```prisma
enum ArticleStatus {
  WRITING              // (موجود) كتابة
  DRAFT                // (موجود) مسودة جاهزة
  AWAITING_APPROVAL    // 🆕 في انتظار موافقة العميل
  NEEDS_REVISION       // 🆕 يحتاج تعديلات (العميل رفض/طلب تغيير)
  SCHEDULED            // (موجود) مجدول للنشر
  PUBLISHED            // (موجود) منشور
  ARCHIVED             // (موجود) مؤرشف
}
```

---

## 🔴 المهام المعلّقة (Pending)

### المرحلة ١ — جرد تأثير التعديل في الكود (Code Impact Audit)

> قبل أي تعديل في الـ schema، نحتاج جرد كامل لكل ملف يستخدم الحقول المتغيّرة، عشان نعدلها بنفس الـ commit.

#### 1.1 — جرد `subscriptionStatus` (٤١ ملف)

**في `admin/` (تعديل مطلوب):**
- [ ] `clients/actions/clients-actions/create-client.ts` — حذف `subscriptionStatus` من allowedFields، استخدام `status` بدالها
- [ ] `clients/actions/clients-actions/update-client-grouped.ts` — تحديث منطق الـ status
- [ ] `clients/actions/clients-actions/client-server-schema.ts` — تحديث schema validation
- [ ] `clients/actions/clients-actions/get-clients.ts` + `get-clients-stats.ts` + `export-actions.ts`
- [ ] `clients/helpers/client-form-config.ts` + `client-form-schema.ts` + `map-initial-data-to-form-data.ts` + `client-field-mapper.ts` + `hooks/use-client-form.ts` + `business-metrics.ts` + `generate-client-test-data.ts`
- [ ] `clients/components/client-table.tsx` + `business-analytics.tsx` + `form-sections/settings-section.tsx`
- [ ] `clients/[id]/components/client-header.tsx` + `client-view.tsx` + `client-tabs.tsx` + `client-delivery-metrics.tsx` + `client-analytics.tsx`
- [ ] `clients/[id]/components/tabs/details-tab.tsx` + `subscription-tab.tsx` + `settings-tab.tsx` + `required-tab.tsx` + `overview-tab.tsx`
- [ ] `actions/dashboard-actions.ts` + `components/client-health-overview.tsx` + `components/alerts-section.tsx`
- [ ] `lib/types/form-types.ts` + `lib/messages/ar.ts` + `lib/messages/en.ts` + `lib/messages/types.ts`
- [ ] `settings/actions/seed-integration-test.ts`

**في `console/` (تعديل مطلوب):**
- [ ] `dashboard/settings/page.tsx` — قراءة `status` بدل `subscriptionStatus`
- [ ] `dashboard/settings/components/subscription-card.tsx` — عرض `status`
- [ ] `dashboard/helpers/dashboard-queries.ts` — تحديث الفلاتر

**في `modonty/` (تعديل مطلوب):**
- [ ] `app/api/helpers/client-queries.ts` — `getClientsWithCounts` تضيف `where: { status: { in: ["PUBLISHED", "OVERDUE"] } }`
- [ ] `app/api/helpers/client-queries.ts` — نفس الفلتر في `searchClients` و `getClientsForSidebar`
- [ ] `app/api/helpers/industry-queries.ts` — تحديث الفلتر لو يستخدم subscriptionStatus

#### 1.2 — جرد `paymentStatus` (٣٧ ملف)

تقاطع كبير مع subscriptionStatus — نفس الملفات أعلاه + console subscription-card. كل المراجع تُستبدل بـ `status` أو تُحذف.

#### 1.3 — جرد `ArticleStatus` (٦٠+ ملف)

> نضيف فقط حالتين جديدتين (`AWAITING_APPROVAL` و `NEEDS_REVISION`) — ما نحذف القديمة، فالتأثير محدود.

**النقاط الحرجة (تتطلب مراجعة):**
- [ ] `modonty/app/api/helpers/article-queries.ts` — تأكّد أن الفلتر `status: PUBLISHED` لا يتأثر
- [ ] `modonty/app/sitemap.ts` + `image-sitemap.xml/route.ts` — يعرض `PUBLISHED` فقط ✅
- [ ] `admin/app/(dashboard)/articles/actions/publish-action/*` — منطق الانتقال للحالات الجديدة
- [ ] `admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts` — السماح بالحالات الجديدة
- [ ] `admin/components/articles/sections/meta-section.tsx` + `steps/settings-step.tsx` — UI للاختيار من الحالات الجديدة
- [ ] `console/app/(dashboard)/dashboard/articles/components/article-card.tsx` — عرض الحالات الجديدة
- [ ] `console/.../articles/components/article-preview-client.tsx`
- [ ] أيقونات + ألوان للحالات الجديدة في كل المكوّنات

**خطّة موجزة:**
1. إضافة الحالتين في schema → إعادة توليد Prisma
2. تحديث الواجهات لعرضهم
3. تحديث منطق الانتقالات (workflow) في صفحة المقال

---

### المرحلة ٢ — Migration Script لتحديث العملاء الحاليين

> **في قاعدة البيانات الحالية: عميلين فقط (per user).** نحتاج script صغير يحدّث بياناتهم للـ schema الجديدة.

#### 2.1 — كتابة Script

`admin/scripts/migrate-clients-to-new-schema.ts`:

```ts
import dotenv from "dotenv";
import path from "path";
import { PrismaClient, ClientStatus, ClientOrigin } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

const db = new PrismaClient();

async function migrate() {
  const clients = await db.client.findMany();
  console.log(`Found ${clients.length} clients to migrate`);

  for (const client of clients) {
    // قاعدة الترحيل: العملاء الحاليين كلهم منشورين على الموقع → status=PUBLISHED
    const newStatus: ClientStatus =
      client.subscriptionStatus === "EXPIRED" ? "EXPIRED" :
      client.subscriptionStatus === "CANCELLED" ? "ARCHIVED" :
      "PUBLISHED";

    // اللقطة السعرية من البيانات الحالية
    const tier = await db.subscriptionTierConfig.findUnique({
      where: { id: client.subscriptionTierConfigId ?? "" },
      select: { price: true, pricing: true },
    });
    const country = client.addressCountry?.toUpperCase().includes("EG") ? "EG" : "SA";
    const pricing = (tier?.pricing as Record<string, { mo: number; yr: number }> | null) ?? null;
    const monthlyPrice = pricing?.[country]?.mo ?? tier?.price ?? null;

    await db.client.update({
      where: { id: client.id },
      data: {
        status: newStatus,
        publishedAt: newStatus === "PUBLISHED" ? client.createdAt : null,
        subscribedCountry: country,
        subscribedPricePerMonth: monthlyPrice,
        subscribedAt: client.subscriptionStartDate ?? client.createdAt,
        subscribedMonthsPaid: 12,  // افتراضي سنوي — نراجع كل عميل يدوياً بعدين
        origin: "DIRECT",  // كل العملاء الحاليين قبل التكامل = مباشر
      },
    });

    console.log(`✅ Migrated: ${client.name} → status=${newStatus}, country=${country}, price=${monthlyPrice}`);
  }

  console.log(`\nDone. ${clients.length} clients migrated.`);
  await db.$disconnect();
}

migrate().catch((e) => { console.error(e); process.exit(1); });
```

#### 2.2 — تشغيل وفحص

- [ ] **2.2.1** فحص يدوي قبل التشغيل — التأكد من `DATABASE_URL` في `.env.local` يشير لـ `modonty_dev` فقط (مش الإنتاج)
- [ ] **2.2.2** نسخة احتياطية للقاعدة الحالية (`bash scripts/backup.sh`)
- [ ] **2.2.3** تشغيل الـ script على DEV أولاً → فحص يدوي بـ Prisma Studio
- [ ] **2.2.4** بعد التحقّق، تشغيل على الإنتاج (تعديل `DATABASE_URL` مؤقتاً + استعادة فوراً)
- [ ] **2.2.5** حذف الـ script بعد الترحيل (one-shot)

---

### المرحلة ٣ — تعديل Schema + Prisma Generate

- [ ] **3.1** قتل كل عمليات Node (`taskkill //F //IM node.exe`)
- [ ] **3.2** تعديل `dataLayer/prisma/schema/schema.prisma`:
  - إضافة `enum ClientStatus`
  - إضافة `enum ClientOrigin`
  - إضافة الحقول الجديدة على `model Client`
  - إضافة `AWAITING_APPROVAL` و `NEEDS_REVISION` على `enum ArticleStatus`
- [ ] **3.3** `pnpm prisma:validate`
- [ ] **3.4** `pnpm prisma:generate`
- [ ] **3.5** `pnpm prisma:db:push` (MongoDB لا تحتاج migrations)
- [ ] **3.6** إعادة تشغيل السيرفرات

> **ملاحظة هامّة:** لا نحذف `subscriptionStatus` و `paymentStatus` في نفس التعديل — نتركهم مؤقتاً عشان الكود ما يكسر، ثم نحذفهم بعد ما نحدّث كل المراجع (المرحلة ١).

---

### المرحلة ٤ — تطبيق فلتر موقع مدونتي

- [ ] **4.1** `modonty/app/api/helpers/client-queries.ts: getClientsWithCounts`:
  ```ts
  where: { status: { in: ["PUBLISHED", "OVERDUE"] } }
  ```
- [ ] **4.2** نفس الفلتر في `searchClients` و `getClientsForSidebar`
- [ ] **4.3** اختبار حي: عميل بحالة NEW أو VERIFYING → لا يظهر في `/clients`
- [ ] **4.4** تنظيف كاش (`revalidateTag("clients")`)

---

### المرحلة ٥ — إعادة هيكلة السايدبار للمقال

- [ ] **5.1** `admin/components/admin/sidebar.tsx`:
  - إنشاء مجموعة جديدة "Articles" (بعد مجموعة Clients)
  - نقل عنصر "Articles" من مجموعة Content
  - إضافة ٧ روابط: All / Writing / Draft / Awaiting Approval / Needs Revision / Scheduled / Published
- [ ] **5.2** صفحة `/articles` — دعم فلتر `?status=...` query param
- [ ] **5.3** اختبار حي لكل رابط

---

### المرحلة ٦ — شاشات السير الجديد

- [ ] **6.1** صفحة `/clients/verify` (قائمة العملاء بحالة VERIFYING + شاشة استكمال البيانات)
- [ ] **6.2** صفحة `/clients/publish` (قائمة العملاء بحالة VERIFYING الجاهزة + زر "نشر" يحوّلهم لـ PUBLISHED)
- [ ] **6.3** صفحة `/articles/awaiting-approval` (قائمة المقالات في انتظار موافقة العميل)
- [ ] **6.4** صفحة `/articles/needs-revision` (قائمة المقالات اللي طلب العميل تعديلها)

---

## 📊 الترتيب المنطقي للتنفيذ

| الأولوية | المهمة | المدة المتوقّعة |
|---------|--------|-----------------|
| 1 | جرد كامل (المرحلة ١) | ٣٠ دقيقة |
| 2 | Migration Script (المرحلة ٢) | ٤٠ دقيقة |
| 3 | تعديل Schema (المرحلة ٣) | ١٥ دقيقة |
| 4 | تنفيذ الـ Migration على DEV | ٢٠ دقيقة |
| 5 | تحديث الكود في كل التطبيقات (٤١+ ملف) | ٣ ساعات |
| 6 | فلتر موقع مدونتي (المرحلة ٤) | ١٥ دقيقة |
| 7 | السايدبار للمقالات (المرحلة ٥) | ٢٠ دقيقة |
| 8 | شاشات السير الجديد (المرحلة ٦) | ٤ ساعات |
| 9 | Migration الإنتاج | ١٠ دقائق |

**الإجمالي:** ~٩ ساعات عمل مركّز.

---

## ⚠️ تحذيرات قبل التنفيذ

- 🛑 **PROD database:** لا تشغّل أي script على الإنتاج بدون تأكيد صريح
- 🛑 **Prisma changes:** قتل كل عمليات `node` قبل `pnpm prisma:generate` (Windows file locks)
- 🛑 **Phased deletion:** لا تحذف `subscriptionStatus` و `paymentStatus` في نفس commit إضافة `status` — تنتظر تحديث كل المراجع أولاً
- 🛑 **Snapshot pricing:** السعر اللقطة لا يُعدّل تلقائياً — فقط عند التأسيس أو التجديد الصريح
- 🛑 **القاعدة الذهبية:** أي خصم في الـ admin form يجب أن يُرفض (validation rule) — راجع `memory/project_pricing_no_discount.md`

---

## ✅ مُنجز بالفعل (لا تكرار)

> القرارات المعمارية + المخططات + قواعد التسعير + تنظيم السايدبار + إصلاحات MongoDB connection + اتفاقية الـ ArticleStatus enum — كلها مُنجزة وموثّقة في commit `ba85296` وما قبلها.
> **المتبقي فقط:** المراحل ١ → ٦ المذكورة أعلاه (Schema migration + code refactor + UI screens).
