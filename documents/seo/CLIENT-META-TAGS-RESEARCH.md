# Client Meta Tags – Research: Gaps vs. Best Practices

Reference: your current meta preview (e.g. from SEO & Validation) and [generate-client-seo](admin/app/(dashboard)/clients/actions/clients-actions/generate-client-seo.ts).

**Sources:** [Open Graph Protocol (ogp.me)](https://ogp.me/), [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices/), [X Twitter Cards](https://developer.x.com/en/docs/twitter-for-websites/cards/overview/markup), [Google Search Central – Snippet](https://developers.google.com/search/docs/appearance/snippet).

---

## 1. Current vs. Ideal

| Field | You have | Official / Best practice | Gap? |
|-------|----------|---------------------------|------|
| **title** | ✓ | 50–60 chars (Google). Keep under 60. | Truncate >60 in generator; already done. |
| **description** | ✓ | 120–158 chars (Google). Max 160. | Truncate >160; already done. |
| **robots** | ✓ | index/follow, noindex, etc. | ✓ |
| **author** | ✓ | Google does **not** use meta author. Optional. | OK to keep for display. |
| **canonical** | ✓ | Absolute URL. | ✓ |
| **openGraph** | Partial | See below. | **Gaps** |
| **twitter** | Partial | See below. | **Gaps** |

---

## 2. Open Graph – What’s Missing

**Required (ogp.me):** `og:title`, `og:type`, `og:image`, `og:url`.

You have: title, type, url, description, siteName, locale. **Missing: `og:image`** when there’s no OG image.

### 2.1 `og:image` and image sub-properties

- **`og:image`** – Required per OGP. If no OG image, use **logo as fallback** so every share has an image.
- **`og:image:secure_url`** – HTTPS version. Use when you have `og:image`.
- **`og:image:type`** – MIME (e.g. `image/jpeg`). Recommended.
- **`og:image:width`** – Pixels. **1200** recommended (Facebook).
- **`og:image:height`** – Pixels. **630** recommended (1.91:1).
- **`og:image:alt`** – “If the page specifies an og:image it **should** specify og:image:alt” (ogp.me). Important for accessibility.

**Action:** When no OG image, add `openGraph.images` from **logo** (same structure: url, secure_url, type, width, height, alt). When OG image exists, keep current logic and ensure all sub-properties above are set.

### 2.2 Optional OG

- **`og:locale:alternate`** – Other locales (e.g. `ar_SA`, `en_US`) when you have multiple languages (e.g. from `knowsLanguage`). Add as array.
- **`og:determiner`** – Optional (a, an, the, "", auto). Low priority.

---

## 3. Twitter – What’s Missing

**For `summary_large_image`:** You use title, description, site. Missing:

- **`twitter:image`** – Image URL. Required for large-image card. If no Twitter image, **fallback to OG image** (or logo), per X docs.
- **`twitter:image:alt`** – Alt text (max 420 chars). Recommended for accessibility.
- **`twitter:creator`** – @username of content creator. For org pages, often same as **`twitter:site`** or main brand handle. Add when you have a creator handle.

**Action:**

1. Always set **`twitter:image`** when using `summary_large_image` (use OG image or logo if no Twitter image).
2. Set **`twitter:image:alt`** whenever you set `twitter:image`.
3. Set **`twitter:creator`** when available (e.g. from a “Twitter creator” field or same as site).

---

## 4. Other Meta (Already or Should Be Handled)

- **theme-color** – generate-client-seo has it. Keep for UI/branding.
- **format-detection** – telephone, email, address. You have it. Good for mobile.
- **viewport, charset** – Usually page-level. Not part of “meta tags” JSON; ensure layout still sets them.
- **language / content-language** – Optional. `og:locale` already carries locale; OK as-is.

---

## 5. Checklist for “Perfect” Client Meta

| Item | Priority | Action |
|------|----------|--------|
| **og:image** when no OG image | High | Use **logo** as fallback in `openGraph.images`. |
| **og:image:width, og:image:height** | High | Always 1200×630 (or actual dimensions) when image present. |
| **og:image:alt** | High | Always set when `og:image` is set. |
| **og:image:secure_url, og:image:type** | Medium | Set when image present. |
| **twitter:image** for summary_large_image | High | Use OG image or logo if no Twitter image. |
| **twitter:image:alt** | High | Set whenever `twitter:image` is set. |
| **twitter:creator** | Medium | Add when you have creator handle (e.g. = site or separate field). |
| **og:locale:alternate** | Low | Add when multi-language (e.g. from `knowsLanguage`). |
| **meta author** | Low | Optional; Google ignores. Keep or remove. |

---

## 6. Suggested Meta Structure (Complete)

```json
{
  "title": "...",
  "description": "...",
  "robots": "index, follow",
  "author": "...",
  "canonical": "https://modonty.com/clients/...",
  "openGraph": {
    "title": "...",
    "description": "...",
    "type": "website",
    "url": "https://...",
    "siteName": "Modonty",
    "locale": "ar_SA",
    "localeAlternate": ["en_US"],
    "images": [{
      "url": "https://...",
      "secure_url": "https://...",
      "type": "image/jpeg",
      "width": 1200,
      "height": 630,
      "alt": "..."
    }]
  },
  "twitter": {
    "card": "summary_large_image",
    "title": "...",
    "description": "...",
    "image": "https://...",
    "imageAlt": "...",
    "site": "@...",
    "creator": "@..."
  }
}
```

**Rules:**

1. **Images:** OG image → else logo. Twitter image → else OG image → else logo.
2. **Dimensions:** 1200×630 default; use actual if larger.
3. **Alt:** Always when image exists.
4. **creator:** Optional; use when available.

---

## 7. Next.js Metadata Mapping

Your [clients/[id]/page.tsx](admin/app/(dashboard)/clients/[id]/page.tsx) already maps:

- `openGraph.images` → `{ url, width, height, alt }`.
- `twitter.image` → `images`, and `creator` / `site`.

**Ensure:**

- `twitter.images` is set whenever you have `twitter.image` (you already use single image).
- If Next.js supports `alt` for Twitter images, pass it (currently you have `imageAlt` in metaTags; confirm mapping).

---

## 8. Summary

**Must fix for “perfect” meta:**

1. **Fallback images:** Logo when no OG image; OG (or logo) when no Twitter image and `summary_large_image`.
2. **OG image:** Always `width`, `height`, `alt`, `secure_url`, `type` when `og:image` is set.
3. **Twitter:** Always `twitter:image` + `twitter:image:alt` for `summary_large_image`; add `twitter:creator` when you have it.

**Nice to have:**

- `og:locale:alternate` for multi-language.
- Keep or drop `author`; no SEO impact.

---

## 9. Implemented

- **OG image:** `ogImageMedia` else **logo** fallback. Always `width`, `height`, `alt`, `secure_url`, `type`.
- **Twitter:** `twitter:image` + `twitter:imageAlt` from `twitterImageMedia` else OG image fallback when `summary_large_image`. `twitter:creator` = `twitter:site` when set.
- **Twitter card:** `summary_large_image` when any image (Twitter, OG, or logo) exists; else `summary`.
- **og:locale:alternate:** Added when `knowsLanguage` has multiple (e.g. Arabic + English).
- **Critical notes (SEO & Validation → Meta tab):** Lists missing OG/logo, missing Twitter image, OG/logo fallback usage, missing Twitter site, and missing logo (JSON-LD + fallbacks). Critical items in red; notes in muted.
