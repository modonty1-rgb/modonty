# JSON-LD Knowledge Graph — Recheck Plan

Deep recheck of the article JSON-LD flow, alignment with schema.org/Google, and `generateAndSaveJsonLd` behavior on **create** vs **edit**. Includes enhancements (semanticKeywords → mentions) and any fixes.

---

## 1. Official docs — schema.org & Google

### 1.1 Schema.org Article

- **Source:** https://schema.org/Article (inherits CreativeWork → Thing).
- **Key properties:** `articleBody`, `articleSection`, `wordCount`, `headline`, `description`, `author`, `publisher`, `datePublished`, `dateModified`, `image`, `mainEntityOfPage`, `about`, `mentions`, `citation`, `license`, `inLanguage`, `isAccessibleForFree`.
- **mentions:** Range **Thing**. “CreativeWork contains a reference to, but is not necessarily about, a concept.” ([schema.org/mentions](https://schema.org/mentions))
- **about:** Range **Thing**. Subject matter of the content.
- **sameAs:** URL(s) that identify the same entity (e.g. Wikipedia, Wikidata). ([schema.org/sameAs](https://schema.org/sameAs))

### 1.2 Google Article rich results

- **Required:** `headline`, `author`, `datePublished`, `image`, `mainEntityOfPage` (WebPage URL).
- **Recommended:** `dateModified`, `publisher` (with `logo`), `description`.
- **Format:** JSON-LD preferred; `@graph` ok for Article + Author + Publisher + WebPage.
- **Validation:** [Rich Results Test](https://search.google.com/test/rich-results).

### 1.3 Best practices (2024)

- Use **absolute URLs** for `@id`, `url`, `image`, `mainEntityOfPage`.
- **mainEntityOfPage** → WebPage that displays the article (same URL as article page).
- **Publisher** → Organization with `logo` (ImageObject or URL).
- **Content parity:** markup must match visible page content.

---

## 2. Current JSON-LD flow

### 2.1 Entry point

- **Create:** [create-article.ts](admin/app/(dashboard)/articles/actions/articles-actions/mutations/create-article.ts) → `db.article.create` → tags, faqs, gallery, relatedArticles → `generateAndSaveNextjsMetadata(article.id)` → **`generateAndSaveJsonLd(article.id)`**.
- **Edit:** [update-article.ts](admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts) → `db.article.update` → delete/recreate tags, faqs, gallery, relatedArticles → `generateAndSaveNextjsMetadata(article.id)` → **`generateAndSaveJsonLd(article.id)`**.

### 2.2 generateAndSaveJsonLd (jsonld-storage.ts)

1. **Fetch:** `fetchArticleForJsonLd(articleId)` → `db.article.findUnique` with `include` (client+logoMedia, author, category, tags+tag, featuredImage, gallery+media, faqs). **All** Article columns (including `semanticKeywords`, `citations`, `seoKeywords`, `inLanguage`, `isAccessibleForFree`) are returned; no `select` on Article.
2. **Plain text:** `extractPlainText(article.content)` → `articleBodyText` (html-to-text).
3. **Graph:** `generateArticleKnowledgeGraph({ ...article, articleBodyText })` → `@graph`: WebPage, Article, Organization, Person, BreadcrumbList, FAQPage (if FAQs).
4. **Validate:** `validateJsonLdComplete(knowledgeGraph, { requirePublisherLogo, requireHeroImage })` → Adobe + business rules. **Does not throw**; returns `ValidationReport`.
5. **Persist:** `stringifyKnowledgeGraph` → save `jsonLdStructuredData`, `articleBodyText`, `jsonLdValidationReport`, version/history to `db.article.update`.

### 2.3 Create vs edit — verification

| Step | Create | Edit |
|------|--------|------|
| Article in DB | Yes, before JSON-LD | Yes, updated before JSON-LD |
| Tags, FAQs, gallery, related | Created before JSON-LD | Deleted then recreated before JSON-LD |
| Fetch by `article.id` | Fetches new article + all relations | Fetches updated article + new relations |
| `articleBodyText` | From current `content` | From current `content` (always regenerated) |
| `semanticKeywords`, etc. | Persisted in create; fetch has them | Persisted in update; fetch has them |

**Conclusion:** `generateAndSaveJsonLd` runs **after** full create/update. Fetch always gets the latest article and relations. **Works correctly for both create and edit.**

### 2.4 Edge cases

- **JSON-LD generation fails:** Caught in create/update; we log and still return `{ success: true, article }`. Article is saved; JSON-LD may be missing. Consider surfacing in UI or retry (optional).
- **Validation errors:** We always persist. Report stored for UI (e.g. SEO validation section). Business rules (e.g. missing `datePublished`, no hero image) do **not** block save.

---

## 3. Article node vs official requirements

### 3.1 Currently emitted

| Property | Source | Google required? |
|----------|--------|-------------------|
| `@type` | "Article" | ✓ |
| `@id` | `{articleUrl}#article` | — |
| `headline` | `article.title` | ✓ |
| `description` | `seoDescription` \|\| `excerpt` | Recommended |
| `author` | `{ "@id": ids.author }` | ✓ |
| `publisher` | `{ "@id": ids.publisher }` | ✓ (with logo) |
| `mainEntityOfPage` | `{ "@id": ids.webPage }` | ✓ |
| `inLanguage` | `article.inLanguage` \|\| "ar" | — |
| `isAccessibleForFree` | `article.isAccessibleForFree ?? true` | — |
| `datePublished` | Only if `article.datePublished` | ✓ |
| `dateModified` | `article.dateModified` | Recommended |
| `articleBody` | `articleBodyText` (when present) | — |
| `wordCount`, `license` | From article | — |
| `articleSection` | Category name | — |
| `about` | Category (single Thing) | — |
| `keywords` | Tags joined | — |
| `citation` | `article.citations` | — |
| `image` | Hero + gallery | ✓ |
| **mentions** | **Not emitted** | — |

### 3.2 Gaps

1. **semanticKeywords** → not used in JSON-LD. Should be emitted as **mentions** (array of Thing with optional `sameAs`).
2. **datePublished:** Only added when set. Drafts often have `null` → no `datePublished` → not eligible for Article rich results until published. **By design.**
3. **image:** Only when hero or gallery. No image → business rule error, but we still save. **By design.**

---

## 4. Enhancement: semanticKeywords → mentions

### 4.1 Design

- **about:** Keep **category only** (single Thing).
- **mentions:** Add **all** `article.semanticKeywords` as array of **Thing**.
- **Shape:** `Array<{ name: string; wikidataId?: string; url?: string }>`.

### 4.2 Logic (in knowledge-graph-generator)

1. Add helper `buildMentionsFromSemanticKeywords(article, articleUrl) -> JsonLdNode[] | undefined`.
2. Normalize: `article.semanticKeywords` → filter items with `name` (string). If empty → `undefined`.
3. For each item, build **Thing:**
   - `@type`: "Thing"
   - `@id`: `"{articleUrl}#mention-{index}"`
   - `name`: `item.name`
   - **sameAs:** If `item.url` and (startsWith `http://` or `https://`) → `[item.url]`; else if `item.wikidataId` → `["https://www.wikidata.org/entity/" + item.wikidataId]`; else omit.
4. In `generateArticleNode`, after `citation` / `image`: if `mentions` array non-empty, set `node.mentions = mentions`.

**Insertion point:** After the `buildImageArray` / `node.image` block, before `return node`.

### 4.3 Files to touch

- [knowledge-graph-generator.ts](admin/lib/seo/knowledge-graph-generator.ts) only. No changes to jsonld-storage, jsonld-validator, or fetch.

---

## 5. Optional fix: clear semanticKeywords on update

### 5.1 Issue

- When user removes **all** semantic keywords, we `updateField("semanticKeywords", undefined)`.
- Update mutation sends `semanticKeywords: data.semanticKeywords != null ? serialize(...) : undefined`.
- Prisma **omits** `undefined` → field not updated → **old value remains**.

### 5.2 Fix

- When intentionally cleared, send **`[]`** (or `null`) instead of `undefined`.
- Example: `semanticKeywords: data.semanticKeywords != null ? serialize(data.semanticKeywords) : []` in update. Ensure create still uses `undefined` when absent (omit), or same `[]` for consistency.

### 5.3 Files to touch

- [update-article.ts](admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts): use `[]` when cleared.

---

## 6. Checklist — 100% alignment

### 6.1 Schema.org

- [x] `@context`: "https://schema.org"
- [x] Article `@type`, `@id`, `headline`, `description`, `author`, `publisher`, `mainEntityOfPage`
- [x] `dateModified` always; `datePublished` when set
- [x] `inLanguage`, `isAccessibleForFree`
- [x] `articleSection`, `about` (category), `keywords` (tags), `citation`
- [x] `image` (hero + gallery when present)
- [ ] **mentions** (semanticKeywords) — to be added
- [x] WebPage ↔ Article bidirectional (`mainEntity` / `mainEntityOfPage`)
- [x] Person, Organization with stable `@id`; sameAs where applicable
- [x] BreadcrumbList, FAQPage when relevant
- [x] Absolute URLs for `@id`, `url`, `image`; `normalizeUrl` for site base

### 6.2 Google Article rich results

- [x] `headline`, `author`, `publisher`, `mainEntityOfPage`
- [x] `image` when hero/gallery exist
- [x] `datePublished` when article is published
- [x] `dateModified`
- [x] Publisher logo (Organization.logo from client.logoMedia)
- [x] Validate with Rich Results Test

### 6.3 generateAndSaveJsonLd

- [x] Create: runs after article + all relations persisted; fetch returns complete data
- [x] Edit: runs after update + relation delete/recreate; fetch returns latest data
- [x] `articleBodyText` always from current `content`; no stale body
- [x] Validation does not block persist
- [x] Fetch includes `semanticKeywords` (all Article fields)

---

## 7. Summary

| Item | Status |
|------|--------|
| **generateAndSaveJsonLd on create** | Works: runs after full create, fetch has full data |
| **generateAndSaveJsonLd on edit** | Works: runs after full update, fetch has latest data |
| **Schema.org Article** | Aligned; add **mentions** from semanticKeywords |
| **Google Article** | Aligned when `datePublished` + `image` present |
| **Enhancement** | Add `buildMentionsFromSemanticKeywords` → `node.mentions` |
| **Optional fix** | Update: send `[]` when semanticKeywords cleared |

---

## 8. Ready to implement — confirmed

**Verdict:** The plan is accurate, matches the codebase, and is **ready to implement.**

- **Enhancement (Section 4):** Add `buildMentionsFromSemanticKeywords` in [knowledge-graph-generator.ts](admin/lib/seo/knowledge-graph-generator.ts); wire `node.mentions` in `generateArticleNode` after the image block (see insertion point in 4.2). No changes to jsonld-storage, jsonld-validator, or fetch.
- **Optional fix (Section 5):** In [update-article.ts](admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts), use `[]` instead of `undefined` when `data.semanticKeywords` is null/cleared so Prisma updates the field.
- **Verification:** Create/edit article with semantic keywords; confirm `mentions` in JSON-LD. Clear all; confirm DB and JSON-LD updated.

Implement **semanticKeywords → mentions** in [knowledge-graph-generator.ts](admin/lib/seo/knowledge-graph-generator.ts), and optionally fix **clear on update** in [update-article.ts](admin/app/(dashboard)/articles/actions/articles-actions/mutations/update-article.ts). No other changes required for “100%” alignment with official docs and correct create/edit behavior.
