# Quality Gate Validator — Official-Source Audit

**التاريخ:** 2026-05-04
**الجلسة:** Session 80+
**السبب:** المالك طلب تحقق صارم من كل اختبار في الـ pre-publish validator مقابل المصادر الرسمية لـ Google + Schema.org. كان فيه شك إن بعض الاختبارات اخترعتها بناءً على third-party SEO blogs بدل Google docs.

---

## 1. الخلفية

الـ Quality Gate في `admin/lib/seo/article-validator-db.ts` كان فيه **27 check** يفرضهم على المقال قبل ما ينتقل من DRAFT إلى AWAITING_APPROVAL.

القاعدة الذهبية للمشروع:
> *"Every article must pass all validation stages at 100% before Request Indexing — perfect for Google."*

عشان "perfect for Google" تكون صادقة، الـ validator يجب أن يطابق Google requirements **بالضبط** — لا أصرم ولا أخف.

---

## 2. منهج التحقق

تم التحقق من المصادر التالية مرتين (re-fetch):

| Source | URL |
|--------|-----|
| Google Title Link docs | `developers.google.com/search/docs/appearance/title-link` |
| Google Snippet docs | `developers.google.com/search/docs/appearance/snippet` |
| Google Helpful Content | `developers.google.com/search/docs/fundamentals/creating-helpful-content` |
| Google Article rich results | `developers.google.com/search/docs/appearance/structured-data/article` |
| Google Search Essentials | `developers.google.com/search/docs/essentials` |
| Google Links Crawlable | `developers.google.com/search/docs/crawling-indexing/links-crawlable` |
| Schema.org Article | via Context7 (`/schemaorg/schemaorg`) |

---

## 3. النصوص الحرفية من Google

### 3.1 Title length
> *"There's no limit on how long a `<title>` element can be, the title link is truncated in Google Search results as needed, typically to fit the device width."*
> — Google Title Link docs

### 3.2 Meta description length
> *"There's no limit on how long a meta description can be, but the snippet is truncated in Google Search results as needed."*
> — Google Snippet docs

### 3.3 Word count
> *"Are you writing to a particular word count because you've heard or read that Google has a preferred word count? **No, we don't.**"*
> — Google Helpful Content guide

### 3.4 Article rich results — required properties
> *"There are no required properties; instead, add the properties that apply to your content."*
> — Google Article structured data docs

### 3.5 Errors vs warnings in structured data
> *"Consider also fixing any non-critical issues that may be flagged in the tool, as they can help improve the quality of your structured data (however, this isn't necessary to be eligible for rich results)."*
> — Google Article docs (Rich Results Test policy)

### 3.6 Internal links count
> *"There's no magical ideal number of links a given page should contain. However, if you think it's too much, then it probably is."*
> — Google Make Your Links Crawlable docs

### 3.7 Article image (the only quantitative requirement)
> *"Images must be at least 50,000 pixels (width × height multiplied)."*
> — Google Article structured data docs

---

## 4. الـ 27 check — Audit Result

### الفئات (Groups):

#### Group 1 — Indexability (2)

| # | Check ID | الفحص | المصدر | Verdict |
|---|----------|------|--------|---------|
| 1 | `status-indexable` | status ≠ WRITING | Internal workflow | ✅ Internal |
| 2 | `slug-valid` | حروف/أرقام/dashes | URL safety | ✅ تحفّظ معقول |

#### Group 2 — Content (5)

| # | Check ID | الفحص | Verdict | السبب |
|---|----------|------|---------|------|
| 3 | `title-length` | 30-60 chars | ❌ **REMOVE** | Google: *"no limit"* |
| 4 | `meta-description` | 120-160 chars | ❌ **REMOVE** | Google: *"no limit"* |
| 5 | `excerpt` | ≥50 chars | ❌ **REMOVE** | اختراع — مفيش مصدر |
| 6 | `word-count` | ≥300 | ❌ **REMOVE** | Google EXPLICIT: *"we don't"* |
| 7 | `article-body-text` | ≥100 chars | ✅ Internal cache | Internal architecture |

#### Group 3 — Author + Publisher (3)

| # | Check ID | الفحص | Verdict |
|---|----------|------|---------|
| 8 | `author-present` | name | ✅ Recommended |
| 9 | `publisher-present` | name | ✅ Recommended |
| 10 | `publisher-logo` | URL + width + height | ✅ Recommended for rich results |

#### Group 4 — Images (4)

| # | Check ID | الفحص | Verdict |
|---|----------|------|---------|
| 11 | `featured-image` | exists | ✅ Recommended |
| 12 | `featured-image-size` | ≥50K pixels | ✅ **يطابق نص جوجل حرفياً** |
| 13 | `featured-image-alt` | non-empty | ✅ Image SEO |
| 14 | `body-image-alt` | all images | ✅ Image SEO |

#### Group 5 — Internal Links (1)

| # | Check ID | الفحص | Verdict |
|---|----------|------|---------|
| 15 | `internal-links-anchors` | لا أحرف عامة | ✅ Recommended (descriptive anchors) |

#### Group 6 — JSON-LD Schema (7)

| # | Check ID | الفحص | Verdict | السبب |
|---|----------|------|---------|------|
| 16 | `jsonld-cache` | populated | ✅ Internal |
| 17 | `jsonld-article` | type Article/News/Blog | ✅ Required for rich results |
| 18 | `jsonld-breadcrumb` | BreadcrumbList | ⚠️ **SOFTEN** | Recommended مش required |
| 19 | `jsonld-adobe-errors` | 0 errors | ✅ Errors block rich results |
| 20 | `jsonld-adobe-warnings` | 0 warnings | ❌ **REMOVE** | Google: warnings DON'T block |
| 21 | `jsonld-custom-errors` | 0 (Modonty rules) | ✅ Internal business rules |
| 22 | `jsonld-cache-fresh` | within 60s tolerance | ✅ Internal |

#### Group 7 — Technical SEO (2)

| # | Check ID | الفحص | Verdict |
|---|----------|------|---------|
| 23 | `canonical` | valid URL | ✅ Recommended |
| 24 | `nextjs-metadata` | cache populated | ✅ Internal |

#### Group 8 — Dates (3)

| # | Check ID | الفحص | Verdict |
|---|----------|------|---------|
| 25 | `date-published` | when PUBLISHED | ✅ Recommended for rich results |
| 26 | `date-modified` | ≥ datePublished | ✅ Schema.org logical |
| 27 | `scheduled-at-future` | when SCHEDULED | ✅ Internal logic |

---

## 5. الإصلاحات المطلوبة

### 5.1 إزالة 5 اختبارات (احتراف Google)

```diff
- title-length (30-60 chars)
- meta-description (120-160 chars)
- excerpt (≥50 chars)
- word-count (≥300)
- jsonld-adobe-warnings = 0
```

**الأسباب:**
- 4 منها يخالفون Google صراحة (Google نشر نصوصاً تنفيها)
- 1 (excerpt) ما له مصدر إطلاقاً

### 5.2 تخفيف 1 اختبار

```diff
- jsonld-breadcrumb (severity: medium → warning, not blocker)
```

**السبب:** Recommended لـ rich results إضافي، مش required للـ Article rich result الأساسي.

### 5.3 الناتج النهائي

- **قبل:** 27 check, كلهم blockers
- **بعد:** **21 check blockers** + 1 informational
- **الفرق:** 5 اختبارات اخترعها الكود، أُزيلت

---

## 6. Sweep — هل نفس المشاكل في validators أخرى؟

### نتائج الـ Sweep

- [x] `admin/lib/seo/article-validator.ts` (post-publish HTML validator) — **CLEANED**
  - أزيل title length check (kept presence only)
  - أزيل meta-description length check (kept presence only)
  - أزيل word-count ≥300 check
  - أزيل internal-links-count ≥2 check
- [x] `admin/lib/seo/pre-publish-audit.ts` — **CLEANED**
  - أزيل WORD_COUNT_LOW warning
- [x] `admin/lib/seo/pipeline-stages.ts` — **UPDATED**
  - Stage 6 (Content): دعم h1 فقط (شيلت word-count من checkIds)
  - Stage 9 (Internal Links): دعم anchor + broken فقط (شيلت internal-links-count)
- [x] `admin/lib/seo/jsonld-validator.ts` — clean (لا يحتوي rules مخترعة)
- [x] `admin/lib/seo/article-validator-db.ts` — **CLEANED in Phase 2**
- [x] `admin/app/(dashboard)/articles/analyzer/` — INFORMATIONAL score only، not a gate. اللي هناك للتقييم البصري فقط، مش يبلوك actions. اتسيب.

### الملفات الباقية مع نفس constants (Informational فقط، ليست gates)
- `admin/app/(dashboard)/articles/analyzer/article-seo-analyzer/analyze-content.ts` — score-only analyzer
- `admin/app/(dashboard)/articles/helpers/seo-guidance-analyzer/analyze-content-quality.ts` — guidance display
- `admin/lib/seo/content-quality-scorer.ts` — quality score (informational)
- `admin/lib/seo/page-validator.ts` — page-level utility (review later if used as gate)

هذه الملفات تعرض scores للأدمن، لا تحجب أي action. آمنة كما هي.

---

## 7. الدرس المستفاد

**القاعدة الجديدة:**
> أي check جديد في validator يجب أن يكون له **نص رسمي حرفي** من Google docs أو Schema.org spec.
> Third-party SEO blogs (Backlinko/Yoast/Ahrefs/SEMrush) **ليست مصادر معتمدة** للـ Quality Gate.
> الفرق بين *"recommended"* و*"required"* يجب أن يُحترم — recommended ≠ blocker.

---

## 8. Timeline

| | |
|---|---|
| Audit triggered | 2026-05-04 — Owner spotted internal-links rule = invented |
| Re-verified twice | Google docs + Context7 (Schema.org) |
| Fixes applied | (pending — after this report) |
| Sweep complete | (pending) |
