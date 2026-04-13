# Final Step – Shared Notes

Use this file for notes. We'll both use it when we get to the final step.

## Image & Sharing

- **Social sharing images removed from UI**: No image fields in SEO tab or Social Media tab. OG/Twitter image values still in DB for meta/cards; no UI to edit in Modonty Setting.
  **Where used**: `og:image`, `og:image:secure_url`, `og:image:alt`; `twitter:image`, `twitter:image:alt`; JSON-LD `WebPage.primaryImageOfPage`

- **Optimized Cloudinary URL** (e.g. https://res.cloudinary.com/dfegnpgwx/image/upload/w_auto,f_auto,q_auto/v1769772312/og-image_ueprdl.png) is used for database storage and OG/Twitter card generation.
  **Where used**: DB fields `ogImage`/`socialImage`; meta `og:image`, `og:image:secure_url`; `twitter:image`; JSON-LD `WebPage.primaryImageOfPage`

- **Alt text** for OG/Twitter and hero uses **master image** (Media tab hero image) alt. Single source: Hero Image Alt in Media tab.
  **Where used**: `og:image:alt`; `twitter:image:alt`; hero img `alt` (accessibility); JSON-LD

- **Media-related: 100% covered** per SEO-FULL-COVERAGE-100.md. Page-level: Media tab (Hero URL + Hero Alt) → og:image, twitter:image, primaryImageOfPage. Org logo/image → Organization section

- **OG Title, OG Description, Twitter Title, Twitter Description — SOT = SEO Title, SEO Description**. Single source: SEO tab; no separate OG/Twitter title/description in Social tab.
  **Where used**: `meta title`/`meta description`; `og:title`, `og:description`; `twitter:title`, `twitter:description`; JSON-LD WebPage.name, WebPage.description

- **OG URL (og:url)**: The canonical URL of the page when shared on social. Tells platforms "this is the canonical URL for this content."
  **Recommendation**: **og:url SOT = Canonical URL** (SEO tab). Use same canonical URL for meta canonical, JSON-LD WebPage.url, and og:url. No separate OG URL field in Social tab; at output use canonicalUrl for openGraph.url.

---

## Default Values

Fields moved to Default Value tab — labels only, no input/select. Best practice from official doc.

- **Meta Robots**: index, follow (default). No input; value fixed.
- **Googlebot**: index, follow (default). No input; value fixed.
- **Theme color**: #000000 (hex — meta theme-color). No input; value fixed.
- **Author**: From app singleton (Author schema). No per-page input.
- **Canonical URL**: Main is modonty.com; path per page. Full canonical = base + path. No input; app uses computed value.
- **OG Type**: website (default). No input; value fixed.
- **OG Locale Alternate (SOT)**: Optional; add for multi-language (e.g. en_US or en_US, fr_FR). SOT for og:locale:alternate and Alternate Languages (hreflang). Editable in Technical tab; alternates derived as /lang/path. No separate Alternate Languages (JSON) input.
- **OG Determiner**: auto (grammatical determiner). No input; value fixed.
- **OG Site Name**: Modonty. No input; value fixed.
- **Twitter Card Type**: summary_large_image (default). No input; value fixed.
- **Twitter Site/Creator**: Read from .env: `NEXT_PUBLIC_TWITTER_SITE`, `NEXT_PUBLIC_TWITTER_CREATOR`. No input; meta output uses env with fallback.
- **Sitemap Priority**: 0.5 (0.0 to 1.0). Value fixed.
- **Sitemap Change Frequency**: monthly. Value fixed.
- **OG Locale (SOT)**: ar_SA (language and region). Single source for og:locale, WebPage.inLanguage, Organization.knowsLanguage. **inLanguage** = first part of locale (e.g. ar_SA → ar). No input; value fixed. Organization.knowsLanguage derived from ogLocale on save.
- **Contact type/email/telephone (Organization)**: Read from .env. No input in Organization tab; JSON-LD contactPoint built from env at output.
- **Country code/Postal code (PostalAddress)**: Read from .env. No input in Organization tab; JSON-LD address built from env at output.

---

## Technical Implementation Notes

- Keep FINAL-STEP-NOTES.md in sync with field defaults
- All SOT fields documented with where they're used
- No separate UI inputs for derived or default values
- Environment variables (.env) source for: Twitter, Organization, PostalAddress contact info
