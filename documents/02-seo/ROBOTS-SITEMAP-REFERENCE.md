# Robots.txt & Sitemap — Reference Guide
> **Last Updated:** 2026-04-17
> **File:** `modonty/app/robots.ts` · `modonty/app/sitemap.ts`

---

## robots.txt — Live at `modonty.com/robots.txt`

### Structure

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /users/login/
Disallow: /users/profile/
```

### Why each `Disallow`

| Path | Reason |
|---|---|
| `/api/` | Raw JSON endpoints — no landing page, wastes crawl budget on machine data |
| `/admin/` | Admin lives at `admin.modonty.com` — block in case any route leaks to public domain |
| `/users/login/` | Functional page, not indexable content, no SEO value |
| `/users/profile/` | Private user data — must not be indexed |

### Allow + Disallow together
`Allow: /` opens everything by default. `Disallow` carves out exceptions.
Without `Allow: /`, some bots default to blocking everything.

---

## AI Bot Strategy

```
OAI-SearchBot  → Allow    ChatGPT Search citations  — WANT (visibility in AI answers)
PerplexityBot  → Allow    Perplexity answers         — WANT (visibility in AI answers)

GPTBot         → Disallow OpenAI training crawler    — BLOCK (trains GPT, no benefit to us)
Google-Extended→ Disallow Google Gemini training     — BLOCK (does NOT affect Google Search rank)
CCBot          → Disallow Common Crawl dataset       — BLOCK (trains many AI companies)
ClaudeBot      → Disallow Anthropic training         — BLOCK
anthropic-ai   → Disallow Anthropic training         — BLOCK
Bytespider     → Disallow ByteDance training         — BLOCK
```

**Rule of thumb:**
- Search/answer bots (cite your content publicly) → **Allow**
- Training bots (silently add your content to model datasets) → **Block**

---

## Sitemap — Live at `modonty.com/sitemap.xml`

### Current entry count (2026-04-17)

| Type | Count |
|---|---|
| Articles (published) | 26 |
| Categories | 5 |
| Clients | 5 |
| Tags | 6 |
| Authors | 1 |
| Static pages | 13 |
| **Total** | **56** |

### Image sitemap
Articles with a `featuredImage` automatically include an `images[]` entry:
```xml
<image:image>
  <image:loc>https://res.cloudinary.com/...</image:loc>
</image:image>
```
Currently 0 because seeded test articles have no images. Production articles will populate this automatically.

---

## Infinite Scroll SEO (homepage pagination)

### How Google crawls paginated content

| URL | SSR renders | rel links |
|---|---|---|
| `/` | 10 articles (page 1) | `rel="next" → /?page=2` |
| `/?page=2` | 20 articles (pages 1+2) | `rel="prev" → /` · `rel="next" → /?page=3` |
| `/?page=3` | 26 articles (all) | `rel="prev" → /?page=2` · no next |

**Key rules:**
- `/?page=1` canonical = `/` (no `?page=1` in URL)
- `/?page=N` canonical = `/?page=N`
- `rel="next"` is only emitted when `currentPage < pagination.totalPages` — **verified fix 2026-04-17**
- Crawlable prev/next links are hidden (`aria-hidden`, `class="hidden"`) — for bots only

### SEO-INF1: Why SSR renders N×10 articles on `/?page=N`
If Google bookmarks `/?page=2`, it should see articles 1–20 in the HTML (not just articles 11–20). This ensures full context for the crawler regardless of which page URL it follows.

---

## Sitemap location in robots.txt

```
Sitemap: https://www.modonty.com/sitemap.xml
```
This line tells ALL crawlers where the sitemap is, regardless of their individual Allow/Disallow rules.
