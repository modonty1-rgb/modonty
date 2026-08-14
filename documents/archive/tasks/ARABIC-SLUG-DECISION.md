# ✅ ARABIC SLUG — RESOLVED 2026-05-27

> **Created:** 2026-05-27 morning
> **Resolved:** 2026-05-27 16:13 PM
> **Final fix:** Upgraded modonty to `next@16.3.0-canary.17` (contains PR #93601)
> **Verification:** GSC Live Test confirmed Arabic article URL → "URL is available to Google" (4:15 PM)
> **Cleanup status:** ✅ all test entities deleted from PROD DB + test scripts removed from repo

---

## 🚨 CRITICAL CLEANUP RULE — لا استثناءات

**كل شيء يُنشَأ لأغراض الـ test (مقال إنجليزي، category، author، tags، أي data) سيُحذَف بعد التحقق.**

### قائمة المتابعة (TEST CLEANUP REGISTRY)

تُحدَّث فورًا عند أي إنشاء، وتُمسح كلها بعد القرار:

| Type | Slug | ID | Created | Status |
|---|---|---|---|---|
| Article | `__test-cc-ascii-only-cache-components-bug-isolation` | `6a16e192df59c68eb7405ede` | 2026-05-27 15:19 | ✅ DELETED 16:18 |
| Category | `__test-cc-category` | `6a16e165cb585e6a5860de86` | 2026-05-27 15:19 | ✅ DELETED 16:18 |
| Author | `__test-cc-author` | `6a16e166cb585e6a5860de87` | 2026-05-27 15:19 | ✅ DELETED 16:18 |

**Linked client (NOT deleted, only borrowed):** `شركة جبر سيو` (id `69d5ec61e2087dee91fe99a1`)

**Test URL:** `https://www.modonty.com/articles/__test-cc-ascii-only-cache-components-bug-isolation`

**Cleanup script:** `pnpm tsx admin/scripts/test-cache-components-cleanup.ts`

### 🛑 CLEANUP HOLD — pending owner GSC live test

**Status:** Owner requested HOLD on cleanup. Will perform GSC Live Test on the English URL first.
**Cleanup runs ONLY after explicit owner approval.**
**Created:** 2026-05-27 15:19 · Hold-until: explicit "احذف" / "delete" from owner.

---

## 🎯 SCIENTIFIC RESULTS — 2026-05-27

### Test execution
- Created pure-ASCII article in PROD (slug + title + content + category + author — all English)
- Waited 5 minutes for proxy in-memory cache TTL refresh
- Ran 15 sequential requests as Googlebot smartphone UA

### Results

| URL Type | Slug Example | 200 | 410 | 500 | Verdict |
|---|---|---|---|---|---|
| **English ASCII** | `__test-cc-ascii-only-...` | **14/15** | 1/15 (stale proxy) | **0/15** | ✅ Renders fine |
| Arabic | `دليلك-الشامل-...` | 0/15 from origin (cache=MISS) | 0/15 | 15/15 | ❌ ERR_INVALID_CHAR |

### Conclusion

**Confirmed:** Next.js 16 `cacheComponents` (Cache Components feature) throws `TypeError: Invalid character in header content ["x-next-cache-tags"]` (code `ERR_INVALID_CHAR`) **specifically and only** when the dynamic route slug contains non-ASCII (Arabic) characters.

- Same Vercel deployment
- Same page handler code
- Same DB queries
- Same `'use cache'` directives
- Only difference: slug encoding
- → **Bug is in Next.js, not in our code**

### 🏆 DEFINITIVE PROOF FROM GOOGLE — 2026-05-27 15:31

Owner ran GSC Live Test (`URL Inspection → TEST LIVE URL`) on the English-only test article.

**Test URL:** `https://www.modonty.com/articles/__test-cc-ascii-only-cache-components-bug-isolation`

**GSC verdict:**
- ✅ "URL is available to Google"
- ✅ "Page can be indexed"
- Tested on: May 27, 2026, 3:31 PM

**Comparison (same property, same deployment, same hour):**

| URL | GSC Live Test verdict | Source of difference |
|---|---|---|
| `/__test-cc-ascii-only-...` (English) | ✅ **URL is available to Google** | Slug = ASCII |
| `/دليلك-الشامل-...` (Arabic) | ❌ Page fetch: Failed — Not found (404) | Slug = non-ASCII |

**This is verified by Google itself — independent confirmation from outside our infrastructure.**

### Implications

1. This is a real Next.js 16 bug worth filing as GitHub issue (with reproduction).
2. Until Next.js patches it, we need a workaround at OUR end (since Arabic slugs are non-negotiable for SEO).
3. Workaround candidates (to discuss):
   - Refactor 24 files to remove `'use cache'` → revert to `unstable_cache` (Next.js 15 era)
   - Or: skip cache layer specifically for `/articles/[slug]` route via custom cache handler
   - Or: wait for Next.js fix + monitor

### Cleanup Script (يُحضَّر مع كل إنشاء)
كل سكربت create يجب أن يكون له سكربت delete مقابل **محفوظ ومجهَّز**.
لا نعتمد على الذاكرة بعد الـ test — السكربت موجود من البداية.

### قاعدة ذهبية
**ممنوع** الـ test data يبقى في PROD أكثر من 1 ساعة بعد التحقق.

---

## المشكلة الأساسية في سطر واحد

`/articles/{arabic-slug}` → Next.js 16 يحاول يحط الـ URL في HTTP header → HTTP لا يقبل عربي → **500 على كل المقالات**.

---

## الحالة الحالية (2026-05-27 ~15:10)

- ❌ كل المقالات down
- ❌ 6 محاولات pushes اليوم ما حلّوا
- ❌ Vercel rollback API ما اشتغل برمجيًا (يحتاج Dashboard يدوي)
- ❌ السبب الجذري الدقيق في Next.js source ما حُدّد بعد

---

## الأسئلة المفتوحة (للتفكير المشترك)

### Q1 — هل العربي ضروري في الـ slug؟
- الـ SEO الحالي مبني على slugs عربية
- 134 URL في sitemap كلها عربية
- Google indexing لـ 5 أيام بناءً على عربي

### Q2 — هل في خيار بدون تغيير slugs ولا تغيير next.config؟
- ممكن نلتقط الـ response في middleware/proxy ونشيل الـ header؟
- ممكن نستخدم Vercel rewrite rules؟
- ممكن نضيف رد header مخصّص يتجاوز Next.js؟

### Q3 — لو رجعنا للسلوك القديم (بدون cacheComponents)
- نخسر `'use cache'` directive (24 ملف يستخدمها)
- نرجع لـ `unstable_cache` (موجود من زمان، يشتغل)
- يحتاج refactor — كم يأخذ؟

### Q4 — لو خلّينا articles route dynamic فقط
- جميع المقالات تُولَّد عند الطلب من DB
- لا cache = لا cache tag header = لا مشكلة
- DB load أعلى لكن مقبول لـ 25 مقال
- باقي الموقع (homepage, clients) يحتفظ بـ PRERENDER

### Q5 — ما هي الأولويات؟
- استرجاع الموقع بسرعة؟
- الحفاظ على SEO ranking؟
- تقليل تكلفة Vercel؟
- استدامة طويلة الأمد؟

---

## الخيارات المتاحة

| # | الخيار | المكسب | الخسارة | الوقت |
|---|---|---|---|---|
| 1 | **Rollback يدوي عبر Dashboard** | الموقع يرجع لحالة أمس (بعض مقالات تشتغل) | نفس الـ bug الجزئي | 3 دقايق |
| 2 | **تحويل slugs لإنجليزي** | يحل المشكلة 100% | كارثة SEO | يوم |
| 3 | **تعطيل cacheComponents + refactor 24 ملف** | يحل 100% + سيطرة كاملة | refactor كبير | يوم كامل |
| 4 | **dynamic-only للـ articles route** | يحل المشكلة + يحافظ SEO | DB load أعلى | ساعتين |
| 5 | **انتظار Next.js يصلح الـ bug** | لا تعديل عندنا | غير محدد | غير معروف |

---

## الأسئلة منك للتفكير المشترك

### Q (2026-05-27): Cache Components هي المشكلة، أم الـ slug العربي؟
**A:** Cache Components هي المشكلة. الـ slug العربي صحيح بمعايير الويب. الـ bug في Cache Components إنه ما يـ percent-encode الـ non-ASCII chars قبل ما يحطها في `x-next-cache-tags` header. لذلك:
- ✅ Cache Components بدون عربي = شغّال
- ✅ عربي بدون Cache Components = شغّال (Next.js 15)
- ❌ التركيبة الحالية = مكسور

**الخلاصة:** الحل يجب أن يفصل بينهم، مش يغيّر الـ slugs.

---

## القرار النهائي ✅ APPLIED

**Pinned:** `next@16.3.0-canary.17` (modonty app only)

### Why canary.17 specifically (not canary.30 / not 16.2.7)
- Contains the fix (PR #93601 merged May 7, in this canary)
- BEFORE the new defaults enabled in canary.24-26 (rootParams, varyParams, optimisticRouting, cachedNavigations)
- Site was down — couldn't wait for 16.2.7 stable (release date unknown)

### Verification
1. ✅ Curl 10/10 on previously-failing Arabic URL (was 0/10 before)
2. ✅ Curl 5/5 on safe Arabic URL
3. ✅ GSC Live Test on `/articles/دليلك-الشامل-...` returns "URL is available to Google" (4:15 PM)
4. ✅ Origin renders fresh (cache=MISS) without ERR_INVALID_CHAR

### Follow-up tasks (LOW priority)
- When `next@16.2.7` ships stable: switch from canary to stable
- Submit "Request Indexing" manually in GSC for the 17 articles that were marked 404 last week
- Monitor GSC over next 48h for crawl status improvement

### Lesson learned (saved as memory rule)
**Saved as:** `feedback_discuss_complex_bugs_first.md`
**Rule:** For complex framework/cache/infra bugs, discuss with Khalid FIRST. Solo guessing wasted 5 hours today. Collaborative thinking + parallel agent research solved it in 15 minutes.

---

## ملاحظات تقنية للمتابعة

- الـ Next.js error: `TypeError: Invalid character in header content ["x-next-cache-tags"]` (`ERR_INVALID_CHAR`)
- Stack trace: `onCacheEntryV2` في `opt/rust/nodejs.js` — كود Vercel Rust runtime
- Source في الـ logs: `serverless-middleware` (طبقة الـ function)
- Reproducible: 10/10 طلبات بـ Googlebot smartphone UA على origin
- Working URLs أمس: كانت تُخدم من PRERENDER cache (مش origin) — لذلك تجاوزت الـ bug
