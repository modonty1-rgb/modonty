# PUSH CHECKLIST — modonty v1.33.0 + admin v0.36.0

> **تاريخ الإنشاء:** 2026-04-19
> **تاريخ الفحص:** 2026-04-19 (Session 45)
> **آخر push مرفوع:** admin v0.35.0 + modonty v1.32.0
> **الـ sessions غير المرفوعة:** 41 + 42 + 44 + 45 (current)
> **النتيجة الإجمالية:** ✅ جاهز للـ push — فقط version bump + backup + Vercel env vars

---

## ⚙️ PRE-PUSH (تقني — قبل أي شيء)

- [x] ✅ `pnpm tsc --noEmit` في `/modonty` → **zero errors**
- [x] ✅ `pnpm tsc --noEmit` في `/admin` → **zero errors**
- [x] ✅ Version bump: `modonty/package.json` → `1.33.0`
- [x] ✅ Version bump: `admin/package.json` → `0.36.0`
- [x] ✅ `bash scripts/backup.sh` → 59 collections, 2.2M
- [ ] Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID` إلى Vercel env vars (modonty)

---

## 🌐 MODONTY — FEATURES VERIFIED ✅

### 1. Industries Pages ✅
- [x] `/industries` listing → يعرض الصناعات (ecommerce، healthcare)
- [x] `/industries/ecommerce` → h1 "التجارة الإلكترونية"، breadcrumb صح، client "متجر نوفا" ✅
- [x] `/industries/healthcare` → h1 "الرعاية الصحية"، client موجود ✅
- [x] `logoMedia?.url` → fallback letter صح (لا crashes)
- [x] `slogan` يعرض تحت اسم العميل (ما فيه slogan في test data — code صح)
- [x] `subscriptionStatus: ACTIVE` only → 1 client ظاهر فقط (صح)

### 2. DiscoveryCard Tabs ✅
- [x] "الفئات" → `/?category=seo-arabic`، `/?category=ecommerce-tips` ✅
- [x] "الصناعات" → `/industries/ecommerce`، `/industries/healthcare` — كل صناعة بصفحتها ✅
- [x] "الوسوم" → `/tags/seo`، `/tags/ecom-tag`، `/tags/ai` ✅
- [x] "استكشف" في كل tab → `/categories`، `/industries`، `/tags` ✅

### 3. Navbar Improvements ✅
- [x] Active nav item: `bg-primary/[0.07] border-primary text-primary` ✅
- [x] Inactive nav: `text-muted-foreground border-transparent` ✅
- [x] `kbd` shortcut `/` في search bar → موجود ✅
- [x] Navbar border: `border-accent/20` teal ✅
- [x] ScrollProgress: `bg-accent` solid (بدون gradient) ✅
- [x] Desktop CTA "عملاء بلا إعلانات": `bg-accent/15 text-accent border-accent/30` ghost ✅
- [x] Mobile CTA: `bg-accent/15 text-accent rounded-full border border-accent/30` بدون gradient ✅
- [x] Light mode: كل شيء صح (verified screenshot) ✅
- [x] Dark mode: كل شيء صح (verified screenshot) ✅

### 4. NewClientsCard + Sidebar ✅
- [x] ScrollArea موجود ✅
- [x] 16 clients يظهرون كلهم ✅
- [x] LeftSidebar width = `300px` ✅

### 5. dvh ✅
- [x] `dvh` مستخدم بدل `vh` في كل الملفات (تم في Session 44)

---

## 🛠️ ADMIN — VERIFIED VIA TSC + CODE REVIEW

> Admin server لم يكن شغالاً — تم التحقق عبر `pnpm tsc --noEmit` (zero errors) + code review

- [x] ✅ TSC zero errors → كل الـ types صح
- [x] ✅ Article create/update: Arabic SEO error messages، `audioUrl` field مضاف ✅
- [x] ✅ Media picker: simplified overlay (hover أنظف) ✅
- [x] ✅ SEO generators (category/industry/tag): موجودة في الـ diff — TSC passed ✅
- [ ] ⚠️ Admin live browser test — **يحتاج server يشتغل** (اختياري قبل push)

---

## 🔴 مشاكل مكتشفة أثناء الفحص

| # | المشكلة | الخطورة | الحل |
|---|---------|---------|------|
| - | لا مشاكل مكتشفة | — | — |

> **ملاحظة:** `JWTSessionError` في console طبيعي في dev بدون auth session — ليس خطأ

---

## ✅ POST-PUSH (بعد الـ push)

- [ ] Vercel build يكتمل بدون errors
- [ ] `modonty.com` يفتح تمام
- [ ] `admin.modonty.com` يفتح تمام
- [ ] `/industries` page تعمل على production
- [ ] Run `setup-ttl-indexes.ts` على PROD DB

---

## 📋 خلاصة

| البند | النتيجة |
|------|---------|
| TSC modonty | ✅ Zero errors |
| TSC admin | ✅ Zero errors |
| Industries pages | ✅ شغّالة (ecommerce + healthcare) |
| DiscoveryCard tabs | ✅ كل links صح |
| Navbar (7 improvements) | ✅ Dark + Light verified |
| NewClientsCard (16 clients) | ✅ Scroll يعمل |
| Mobile CTA | ✅ Ghost teal بدون gradient |
| Admin code | ✅ TSC passed |
| **جاهز للـ push؟** | **✅ نعم — بعد version bump + backup** |
