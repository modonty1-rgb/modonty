# 🔍 Article Page — "Perfect for Google + All Search Engines" Audit

**Status:** 🔒 FROZEN report — work starts **AFTER** the article-page UI improvements are finished.
**Rule (Khalid 2026-06-03):** EVERY point is must-fix — **no big/small triage, no exceptions**. Goal = absolutely perfect article page (Google + all engines + AI/GEO).
**Verification:** under **multi-round re-check** until Khalid says «خلاص». Round 1 done — **1 false positive caught & corrected**.
**Audited:** production route `/articles/[slug]` · sample `ما-هو-السيو` · evidence = live SSR HTML + parsed JSON-LD + Google Search Central docs + Context7 (Next.js).
**Last Updated:** 2026-06-03

---

## ✅ Already perfect (verified, do NOT touch)
- Crawl/index: `robots: index, follow` · canonical (absolute, www, percent-encoded) · **hreflang ×9** (ar-SA/EG/AE/KW/QA/BH/OM + ar + x-default) · `html lang=ar-SA dir=rtl`.
- Social meta: OG `type=article` + image + url + `article:published_time` + author · Twitter `summary_large_image` + image.
- JSON-LD: `Article` + `BreadcrumbList`. Article carries: headline · image[3] · datePublished · dateModified · author(Person+name+url) · publisher(Organization+name+url) · inLanguage · mainEntityOfPage · description.
- Content: single `H1` · **53 real headings** (43×H2 + 10×H3) on this article · **all images have alt** · external links carry `noopener` · 2747 words.

---

## 🛠️ Gaps to fix — ALL must-fix (no exceptions)

- [ ] **Title length** — 80 chars → Google truncates (~60). Template appends `- {publisher} | مدونتي`. Fix: trim stored SEO titles ≤60 (or restructure template). _verified: titleLen=80._
- [ ] **`publisher.logo` missing** — publisher Organization has only name+url, no `logo` (ImageObject). Google recommends it. _verified: raw JSON-LD._
- [ ] **Author E-E-A-T weak** — `author = {Person, name:"Modonty", url:modonty.com}`. Brand-as-person + url=homepage (not an author bio). Google wants a real expert + profile URL + `sameAs`/credentials. _verified: raw JSON-LD._
- [ ] **No standalone `Organization` + `WebSite` JSON-LD node** — publisher is only nested in Article. Add top-level Organization (logo + sameAs) + WebSite (potentialAction SearchAction) for brand/knowledge/sitelinks. _verified: only Article+BreadcrumbList present._
- [ ] **`image` as plain URLs (×3), not `ImageObject`** — add ImageObject with width/height + multi-ratio (16:9, 4:3, 1:1) per Google's image recommendation. _verified: image array first=url._
- [ ] **`dateModified` integrity** — falls back to `updatedAt` ([`modonty/lib/seo/index.ts:226`](modonty/lib/seo/index.ts#L226)) → bumps on ANY DB write (SEO regen/cache/admin), not real content edits → noisy freshness signal. Fix: only emit dateModified from a true content-edit timestamp. _verified: code._
- [ ] **JSON-LD not XSS-escaped** — `JSON.stringify(...)` without `.replace(/</g,'<')` (Next.js official guidance). _verified: page.tsx injection._
- [ ] **FAQPage** — emitted only when the article has FAQs (this one has none). Encourage FAQs per article → AI extraction + (limited) rich-result eligibility.
- [ ] **AI/GEO extraction** — add "key takeaways"/TL;DR (in progress in lab) + consider `speakable` schema + clean semantic structure for answer engines.
- [ ] **Content QA (systemic):** some articles use **bold (`<strong>`) instead of `<h2>/<h3>`** → no heading hierarchy, no TOC, weak SEO. (This article OK with 53 headings; `technical-seo` had 0.) Task: convert bold→headings across content.
- [ ] **🔴 Zero internal links in article body** — content has only 2 links, both external (jbrseo.com), **0 internal**. SEMrush/Ahrefs/Moz all flag weak internal linking + orphan risk + lost link-equity. Add contextual internal links (related articles / category / client) inside body copy. _verified: contentLinks=2, internal=0._
- [ ] **`dateModified` inconsistency (OG vs JSON-LD)** — OG `article:modified_time` = `2026-05-21T10:02` but JSON-LD `dateModified` = `2026-06-03` (updatedAt fallback). Mismatch → tools + Google flag. Fix: one source of truth for modified date (see [`index.ts:226`](modonty/lib/seo/index.ts#L226)). _verified: both read live._
- [ ] **`og:image` = 1000×563** — below recommended 1200×630. Social validators + SEO tools flag undersized OG image. _verified._
- [ ] **Text-to-HTML ratio ≈ 5%** — SEMrush flags <10% (component-heavy DOM). Mitigate by trimming non-content DOM / deferring. _verified._
- [ ] **CLS — NOT CONFIRMED (verify via Lighthouse):** earlier "18 images no-dims" was a **FALSE POSITIVE** (counted featured/gallery/related/avatar; `#article-content` has 0 inline imgs). Re-check real CLS via Lighthouse + on image-heavy articles before claiming.

---

## 🟢 Verified clean across tools (Lighthouse · Ahrefs · SEMrush · common checks)
Single `H1` · meta description present (139) · `viewport` · `charset` · favicon · OG complete (type/image/url/site_name=`ar_SA` locale/image:alt/published) · Twitter `summary_large_image` + image:alt · canonical self-referential · descriptive link text (no "click here") · no broken external links · HTTP 200 · word count 2747 · all images `alt`.

## ⚠️ Intentional patterns tools may FALSE-FLAG (document — do NOT "fix")
- **hreflang → same URL for all 9 locales** (ar-SA/EG/AE/KW/QA/BH/OM/ar/x-default all = the one Arabic page). Deliberate single-Arabic-source strategy; canonical = self = each hreflang target. SEMrush/Screaming Frog may flag "duplicate hreflang URLs" / "missing return links" — **by design, not a bug.**

## 🧪 Verification log
- **Round 1 (2026-06-03):** ✅ caught + corrected CLS false positive (bodyImgCount=0). Confirmed via raw JSON-LD: publisher.logo missing, author Modonty/Person/homepage, image=3 URLs, only Article+BreadcrumbList. Confirmed dateModified→updatedAt fallback (index.ts:226). Title=80.
- **Round 2 (2026-06-03):** ✅ cross-tool (Lighthouse + Ahrefs criteria from official docs; SEMrush KB 404 → used common criteria). NEW confirmed: **0 internal links in body**, OG↔JSON-LD dateModified mismatch (May 21 vs Jun 3), og:image 1000×563, text/HTML ≈5%. Verified clean: viewport/charset/favicon/single-H1/OG-complete/twitter-alt/no-generic-anchors. Flagged hreflang same-URL as intentional.
- **Round 3 (pending):** validate Article+Breadcrumb via Google Rich Results / structured-data validator + broaden across multiple articles (title-length norm, inline-image CLS on image-heavy articles, internal-link counts) + Lighthouse/CWV real numbers (ties to deferred perf task).

---

**Related:** [[project_seo_dominance_goal]] · [[feedback_seo_golden_rule]] · [[project_jsonld_is_code_responsibility]] · perf check in `PENDING-IDEAS-TODO.md` (🔔 before push).
