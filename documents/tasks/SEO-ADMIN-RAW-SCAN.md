# الملحق الخام — قراءة الأدمن الشاملة (١٧٢ ملفاً · ٦ مجموعات)

> **لمن هذا الملف؟** لكلود. نُقل من لوحة `SEO.html` في ٢٨ أغسطس ٢٠٢٦ بقاعدة خالد: **الـHTML له، والـMD لي**.
> اللوحة تجيب سؤالاً واحداً — «إيش الدور عليّ؟» — وهذا الملحق مادّةُ بحثٍ لا بطاقةُ عمل.
>
> **كان معرّفه على اللوحة:** `SEOADM-RAW` · بند ١٠١. بطاقات `SEOADM-*` الحيّة تشير إلى أرقامه (مثل `G4-#8`) — فمرجعها الآن هنا.
>
> **تحذير استعمال:** هذا ناتج قرّاء، لا دليل. أي بند يُرقّى منه يأخذ بطاقةً مستقلّة بمسار تنفيذ وناتج حالي ومصدر رسمي واختبار إغلاق.

---

**الغرض:** الناتج الخام لستّة قرّاء غطّوا ١٧٢ ملفاً / ٣٨٬٠٥٧ سطراً في `admin/` و`shared/lib/seo` سطراً سطراً (٢٤ أغسطس ٢٠٢٦). بطاقات `SEOADM-*` مجمَّعة بجذر العطل وتشير إلى الأرقام هنا (مثل G4-#8). **ما تحقّقتُ منه بنفسي بالكود الخام:** G1-#1/#2 · G2 assert-article-publishable · G2 tags-actions · G2 build-meta-from-page · G3 settings-actions:962/702 · G3 use-client-form:112 · G3 update-article:296 · G6-F1/F2/F3 · G5 canonical-url-sanitizer:401 · G4 seed-technical-defaults:64 · G4 search-console-api:104 · G4 build-ymyl-jsonld:78 · G5 metadata-generator:200 · G1-#4 · G1-#6 · G4 save-image-seo:98. الباقي تقرير قارئ يُتحقّق منه عند فتح بطاقته.

**G1 — المجموعة ١ (٣٥ ملفاً)**CLEAN: get-jsonld-statistics.ts · section-status.ts · field-labels.ts · clients/jsonld-actions.ts · generate-complete-organization-jsonld.ts · shared/lib/seo/client/from-client.ts · client/types.ts
metadata-storage.ts: known only (defaults spread after article :106)

CRITICAL
1. seed-integration-test.ts:1027,1044 — exported "use server" seed actions with NO auth() gate (every other action has one). Fix: auth() + NODE_ENV guard.
2. seed-integration-test.ts:899-903 — deleteMany({}) with no where on commentLike/commentDislike/comment/articleLike/articleView/clientView/subscriber/contactMessage → wipes ALL rows, not test rows. Fix: scope to test ids.
3. seed-integration-test.ts:213-218,286-287,367-368,439-488,784-804 — deletes live entities that own seed slugs (digital-marketing, seo, ecommerce, nova-electronics…) → indexed URLs 404. Fix: refuse any row not prefixed test-.

HIGH
4. transform-article-to-form-data.ts:9-138 — metaRobots (also inLanguage, sitemapPriority, license, twitterSite/Creator) never loaded into the form → update-article.ts:179-181 resets a manual noindex to "index, follow" on next save. Fix: load stored values.
5. analyze-meta-tags.ts:117 — formData.metaRobots || "index, follow" → SEO panel always says robots pass. Fix: treat undefined as unknown.
6. generate-organization-jsonld.ts:143-156 getCountryCode() — every unrecognised country (incl. Arabic names, Egypt, Jordan) → "SA" written into addressCountry/areaServed. Fix: return undefined + Arabic map.
7. generate-organization-jsonld.ts:126-131 mapLanguageToCode() — substring "ar"/"en" (Mandarin→ar, French→en). Fix: exact map.
8. generate-organization-jsonld.ts:245-246 — logo dims clamped UP to 112. Fix: emit only real dims.
9. generate-organization-jsonld.ts:475 — priceRange: client.priceRange || "$" fabricated. Fix: omit.
10. generate-organization-jsonld.ts:735,740 — VideoObject @id/embedUrl use raw clientPageUrl not absolute; embedUrl = host page. Fix: absolute; drop embedUrl.
11. generate-organization-jsonld.ts:104-113 / build-home-jsonld-from-settings.ts:60-66 — ensureAbsoluteUrl → https://images/logo.png for relative paths; unanchored http→https replace. Fix: new URL(url, siteUrl).
12. build-home-jsonld-from-settings.ts:290,437 — dateModified: new Date() on every regeneration. Fix: newest article updatedAt.
13. build-home-jsonld-from-settings.ts:147-148,398-400 — Organization logo dims invented (1200×630 / 512×512) by which field was filled. Fix: Media row dims.
14. build-home-jsonld-from-settings.ts:240 — String(article.dateModified) → non-ISO date when caller passes string; :234 raw datePublished unvalidated. Fix: new Date(v).toISOString() guarded.
15. hreflang-sync.ts:16-26,87 — seeds 8 locales + x-default with no url → all resolve to the same page. Fix: ar + x-default only, or real per-locale URLs.
16. create-category.ts:61-68 — SEO generation failure swallowed, returns success:true. Fix: surface seoWarning.
17. create-category.ts:59-63 — revalidate BEFORE SEO generation. Fix: revalidate after.
18. create-category.ts:33 vs 41 — slug trimmed for uniqueness check, stored untrimmed/unslugified; parsed result discarded (:27). Fix: use parsed.data + slugify.
19. rebake-client-site-canonicals.ts:33-37 — take:1000 reported as total. Fix: cursor-paginate.
20. rebake-client-site-canonicals.ts:53 — .catch(()=>{}) on canonical write. Fix: collect failures.
21. canonical-sanitizer.ts:196 — regen(id).catch(()=>{}) then successful++. Fix: count regen failures.
22. generate-modonty-page-seo.ts:189-192 — revalidate fetch not awaited, failure swallowed → modonty keeps old metadata. Fix: await + surface.
23. page-renderer.ts:71-77 — dead live page silently falls back to DB-synthesized HTML → validator passes a page that may not render. Fix: never fall back.
24. pre-publish-audit.ts:288-300 — gate reads only report.adobe.errors; ajv/custom errors never block. Fix: block on countReportErrors(report)>0.
25. generate-client-test-data.ts:93 — hardcoded https://modonty.com (non-www) canonical. Fix: loadSiteUrl().
26. seed-integration-test.ts:778-824 — seed articles attached to REAL clients (clients[i % clients.length] over all clients), datePublished now. Fix: restrict to test- clients.

MEDIUM
27. article-server-schema.ts:15 canonicalUrl z.string().max(500) no .url(). 28. :13 seoTitle hard-rejected >60. 29. :44 .passthrough(). 30. category-server-schema.ts:10 same missing .url().
31. get-modonty-author.ts:14,21 hardcoded https://www.modonty.com written into Author.url/canonicalUrl. 32. :30-46 double catch returns null (callers treat as "missing").
33. generate-modonty-page-seo.ts:62 existingMeta.author wins over settings.siteAuthor (stale forever). 34. :108 areaServed fabricated "SA, AE, KW, BH, OM, QA, EG" as one string. 35. :171-182 validation report stored but never gates the write. 36. :190 path not URL-encoded + secret in query string.
37. build-home-jsonld-from-settings.ts:278 vs 213 numberOfItems=totalArticleCount while 20 emitted. 38. :164,415 hoursAvailable ALWAYS_OPEN_24_7 fabricated. 39. :244 author.name || "Modonty". 40. :459 breadcrumb leaf name = full SEO title. 41. :214-216 / generate-organization-jsonld.ts:201,238 / slug-change-otp.ts:115 raw-slug template URLs (Arabic unencoded) — need one buildUrl helper. 42. :255 keywords comma string.
43. slug-change-otp.ts:124-146 — no recordRedirect for old client slug → /clients/ 404s. 44. :124-134 slug write + generateClientSEO + revalidate not one unit, no try/catch, OTP consumed. 45. :124-131 client-site article canonicals not rebaked.
46. client-jsonld-storage.ts:56-68 needsClientRegeneration always true (updatedAt bumped by SEO write).
47. merge-industry-actions.ts:97-105 308 recorded while source page still live. 48. :192-201 finalizeIndustryMerge swallows 3 regen failures. 49. :147-176 phase 2 driven by client loop (tab close = half-merged).
50. word-count-backfill.ts:40-43,89-92 take:1000 as total. 51. :124-125 .catch(()=>false) anonymous failures.
52. generate-organization-jsonld.ts:296-300 fabricated ISO 6523 "0199:" identifier. 53. :309 hardcoded issuer "Ministry of Commerce". 54. :347-350 availableLanguage default ["ar","en"]. 55. :379-388 English words injected into Arabic street address ("Building 1234, Additional 5"). 56. :820-821 WebPage.dateModified = client.updatedAt (bumped by cache write). 57. :690-715 logo used as Organization image.
58. shared/lib/seo/article/jsonld-score.ts:87-96 coverage scored from ROW not stored card (contradicts its header). 59. :94 dateModified check always true (@updatedAt).
60. analyze-meta-tags.ts:23-48,77-102 30-60/120-160 gates with false officialSource. 61. :6-7 falls back to title/excerpt → no-SEO page scores optimal.
62. pre-publish-audit.ts:166-202 30/70 & 120/170 gates. 63. :231-241 image check w. 66. :25 hardcoded host.
67. generate-client-test-data.ts:89 brand spelled "مودونتي". 68. :55 slogan "الابتكار beyond الحدود". 69. :39,57 fabricated VAT/CR. 70. seed-integration-test.ts:329-334,350 temp media rows never deleted.

LOW
71. get-categories.ts:104-107 catch→[]. 72. build-client-seo-data.ts:75-84 unparseable foundingDate silently dropped. 73. create-organization-seo-config.ts:286 maxScore || 200. 74. :129-134,168 unreachable twitterImageAlt/parentOrganization. 75. generate-validators-from-mapping.ts — 324 lines, zero consumers, disagrees with live validators → delete. 76. :71-86 min and max violations both score adequate. 77. head-check.ts:192-207 resolve-only resolvers (deadlock if probe throws). 78. international-seo.ts:214 inLanguage!=="ar" flagged; :244 ja_JA locales; :82 unescaped href; :63-70 no bidirectional guarantee (dead module). 80. seed-integration-test.ts:1006-1021 writeLog swallows failures.

**G2 — المجموعة ٢ (٢٦ ملفاً)**CLEAN: seo-guidance-analyzer/types.ts · get-clients.ts (SEO-wise)

create-article.ts
- :49 vs :150 slug uniqueness on trim(), stored untrimmed → canonical with space. HIGH.
- :151 excerpt: seoDescription || null destroys authored excerpt (description ≡ excerpt forever). MEDIUM.
- :122-124 client-site canonical `${baseUrl}/${slug}` unencoded (modonty branch uses new URL). HIGH.
- :204-205 sanitizeText HTML-escapes FAQ q/a at STORAGE → &#x27; inside JSON-LD strings and double-escaped render. HIGH.
- :173 ogArticleModifiedTime: new Date() on create. MEDIUM.
- :234-246 silent catch around metadata+JSON-LD generation, returns success. MEDIUM.
- :141 sitemapPriority computed, never written (no column). LOW.
analyze-seo-guidance.ts:23-25 dead validateStructuredData option. LOW.
gated-transition.ts:58-61 regenerateJsonLd result ignored → validator runs on stale JSON-LD. MEDIUM. :222-225 catch with no logging. MEDIUM.
generate-client-seo.ts:47-48 no revalidateModontyTag("clients") after regeneration (cascade path does). HIGH. :23-45 validation advisory only — invalid graph still written. MEDIUM.
get-clients.ts:233-236 catch→[]. LOW.
client-field-mapper.ts:59 taxID: data.taxID || data.vatID fabricated (shipped in Organization). HIGH. :38 metaRobots not a Client column → silently dropped. MEDIUM. :39 canonicalUrl from form, never recomputed on slug change. MEDIUM.
client-form-config.ts:158 twitterCard/Title/Description/Site editable but not columns → lost every save. MEDIUM. :233 newsletterCtaText never persisted. LOW. :64 vs :147 organizationType listed twice. LOW.
create-validate-seo-title-and-og.ts:30-31 hasOGUrl uses client's external url. MEDIUM. :16-18,:100 English-only messages. LOW.
validators-advanced.ts:13-58 validateLogo never checks dims (claims 112 min). MEDIUM. :505-591 demands 9-digit postal code (Saudi = 5 + 4 additional) → wrong data into PostalAddress. HIGH. :202-299 twitter validator reads non-existent fields → permanent 0. MEDIUM. :460,479-495 SAUDI_REGIONS English-only → Arabic region invalid. MEDIUM. :611,656-703 contactPoints unreachable. LOW. :738-746,827-845,866 LEGAL_FORMS English-only. LOW. :767-794 early-return chain skips VAT/legal checks. LOW. :985-1030 numberOfEmployees "10-50" string. LOW.
build-categories-page-jsonld.ts:61-64,124-127 fabricated 1200×630 ImageObject. HIGH. :14 https://${u} for relative. HIGH. :94+:99 numberOfItems vs 20 items. MEDIUM. :12 unanchored http→https. MEDIUM. :40-48 @id vs url identity split. LOW. :116-118 breadcrumb item no @type, @id siteUrl no slash. LOW.
build-meta-from-page.ts:101-113 buildHreflangFromOgLocaleAlternate invents /en/about etc. — routes don't exist. CRITICAL. :312-322 og:image 1200×630 + image/jpeg constants. HIGH. :299-300 title.slice(0,57)+"..." mid-word. MEDIUM. :331 twitter creator = site handle. MEDIUM. :254 canonical `${siteUrl}/${slug}` unencoded. MEDIUM. :271-275,310 og:locale:alternate from raw strings. MEDIUM. :343 {...existingMeta,...built} never prunes. LOW. :294-295,338-339 sitemap priority persisted. LOW.
page-schema.ts:51 canonicalUrl any host. MEDIUM. :52 alternateLanguages z.any(). MEDIUM. :22 seoTitle max 51. LOW. :53-54 sitemap fields. LOW. :3-5 metaRobots enum lacks max-image-preview:large. LOW.
cascade-all-seo.ts:88-94 listing regen failure swallowed. MEDIUM. Modonty static pages not cascaded. MEDIUM. :60 per-client failures unlogged. LOW. :26-27 auth() inside after(). LOW.
jsonld-integrity.ts:51-61 drift detection only when apex matches (old/staging host never flagged). MEDIUM. :75-83 PUBLISHED articles only. LOW.
tag-server-schema.ts:9 canonicalUrl no .url(). HIGH. :7-8 200/500 caps. LOW.
tags-actions.ts:178-181 createTag revalidates BEFORE generateAndSaveTagSeo (the bug fixed on update path :252-256). HIGH. :176 db.tag.create({data}) raw unparsed, slug untrimmed. HIGH. :228 same on update. HIGH. :304-305 delete revalidates before listing regen. MEDIUM. :180,254,255,305 failures logged only. MEDIUM.
assert-article-publishable.ts:29-31 datePublished written BEFORE gate, never rolled back. HIGH. :38 robots "index, follow" persisted before gate passes. MEDIUM. :39-41 bare catch. MEDIUM.
auto-fix.ts:124-132 dateModified bumped every run (updatedAt always newer). HIGH. :199-204 writes seo fields without regenerating caches/revalidate. HIGH. :44-51 second word-count algorithm overwrites canonical count. MEDIUM. :92 splits sentences on Arabic comma ، . MEDIUM. :67,83,98 slice+"..." mid-word. MEDIUM. :281-341 preview omits excerpt fix. MEDIUM. :31-39 generateSlug dead. LOW.
content-quality-scorer.ts (dead): :190-194,410-417 FAQ points for retired feature. MEDIUM. :100 Arabic comma sentence split. MEDIUM. :156-173 length bands. LOW. :82 gallery type double array. LOW. :267 citations Json .length. LOW.
jsonld-validator.ts:196 Ajv requires datePublished/dateModified/author/publisher (contradicts :402-405). MEDIUM. :550 validateExtractedData applies Article rules to any page. MEDIUM. :138-151 network failure stored as invalid. MEDIUM. No duplicate-@id / absolute-@id / 

**G3 — المجموعة ٣ (٢٤ ملفاً)**CLEAN: client-seo-group-scores.ts · shared/lib/seo/article/seo-score.ts

update-article.ts:296-308 silent catch → success:true on PUBLISHED edit (stale metadata served). CRITICAL. :207+:152-153 excerpt overwritten by 155-char mid-word description. HIGH. :166-168 client-site canonical raw concat. HIGH. :177+:227 DRAFT→PUBLISHED via this action leaves datePublished null. HIGH. :183 sitemapPriority dead. LOW. :71-81 version snapshot before validation. LOW.
generate-off-page-guidance.ts:11-92 English guidance; gated on ogArticleAuthor. LOW.
get-authors-stats.ts:52-60 catch → averageSEO 0. LOW.
use-author-form.ts:65 canonicalUrl computed once at mount → stale after slug edit. HIGH. :50 jobTitle default "Content Platform" (English into JSON-LD). MEDIUM. :94-98 sameAs rebuilt, drops existing entries. MEDIUM.
get-clients-stats.ts:137-172 4th ad-hoc scoring formula. MEDIUM.
client-form-schema.ts:125 canonicalUrl any absolute URL. HIGH. :116/:314 seoTitle cap 51. MEDIUM. :139 addressCountry free text → addressCountry/areaServed. MEDIUM.
generate-organization-structured-data.ts (SEO Doctor preview ≠ shipped card): whole file no @graph/@id/image. HIGH. :70-75 taxID = vatID. HIGH. :99 areaServed "SA"; :106 ["Arabic","English"]. MEDIUM. :130-137 streetAddress overwritten by building number. MEDIUM. :190-197 parentOrganization @id = ObjectId. HIGH. :45-53 foundingDate UTC day shift. LOW. :24-29/:10 logo no dims check; @type raw. MEDIUM.
use-client-form.ts:112-124 slug re-slugified on every name edit incl. EDIT mode (URL changes, canonical stale, no redirect). CRITICAL. :196 taxID || vatID persisted. HIGH. :192-193 lat/lng 0 → null. LOW.
create-industry.ts:41-44 revalidate before SEO gen (update path fixed, create not). HIGH. :33 raw data persisted, slug untrimmed. HIGH. :43-44 errors swallowed. MEDIUM.
industry-server-schema.ts:9 canonicalUrl no .url(). HIGH. :5 slug no pattern. MEDIUM. :7-8 200/500 caps. LOW.
update-industry.ts:85-99 client cascade bare catch + .catch(()=>null). HIGH. :93-95 sequential unbounded. MEDIUM.
optimize-image.ts:54-73 bunnyUrl only refreshed when new URL is b-cdn → old image served with new dims; old Cloudinary deleted :107-110. HIGH. :64-70 width ?? undefined keeps stale dims. MEDIUM. :91-92,:97 .catch(()=>{}) then Cloudinary delete regardless. HIGH.
generate-home-and-list-page-seo.ts (previewPageSeo IS the write path via listing-page-seo-generator.ts:120-127): :249,306,406,506 maxUpdatedAt ?? new Date(). HIGH. :200-203,284-287,486-489 max over take:20 ordered by name. HIGH. :330-378 trending scored in-memory over take:100; total ≠ 20 emitted. HIGH. :104-109,128-134 undated published articles included. MEDIUM. :163-174 validator block copy-pasted 5×. LOW.
jsonld-normalize.ts:11-14 expand/compact no try/catch. MEDIUM.
modonty-jsonld-validator.ts:179 REQUIRES WebSite node on non-home pages (institutionalises defect). HIGH. :28-35 fetches schema.org at validation; failure stored as invalid. HIGH. :22-27 cache guard split. LOW. :88/:79 rejects array @type / object @context. MEDIUM. :209-250 validateMetaTags dead. LOW.
run-seo-maintenance.ts:67-80 hreflang step ok: true hardcoded. MEDIUM.
settings-actions.ts:962 updateAllSettings — NO auth() (all six save* have it). CRITICAL. :702-705 getAllSettings catch → DEFAULT_SETTINGS (siteUrl null) → generators write hardcoded host. CRITICAL. :957-960+:1235 {...await getAllSettings(), ...data} wipes singleton on failed read. CRITICAL. :969-1142 four non-atomic updates + after() cascade on half-written row. HIGH. saveMediaSettings/saveModontySettings/saveSEOSettings lack after(cascade) → logo/listing titles stale. HIGH. :1183 English brandDescription seeded. MEDIUM. No validation on siteUrl/robots/hreflang/locale; Number(env) NaN. HIGH.
jsonld-validation-action.ts:9-16 per-caller publish bar. LOW.
knowledge-graph-generator.ts:504-541 hardcoded image dims; non-Cloudinary/Bunny URL returns ORIGINAL uncropped still declared 1200×675. CRITICAL. :621 priceRange || "$". HIGH. :752-759 parentOrganization @id = ObjectId. HIGH. :688-691 areaServed "SA" / ["Arabic","English"]. MEDIUM. :168 siteUrl || "https://www.modonty.com". HIGH. :191-197 + url-builders:143 raw slug. HIGH. :872-874 hasCredential plain strings. MEDIUM. :213 ids.primaryImage unused. LOW. :386 isAccessibleForFree hardcoded. LOW. :305-308 vs :391-393 lastReviewed two formats. LOW.
url-builders.ts:125-186 no builder encodes slug. HIGH. :39-41 strips one trailing slash only. MEDIUM.
shared/lib/seo/client/jsonld-score.ts:128-139 no report → status "good". HIGH. :145-152 logo scored on presence. MEDIUM. :82 endsWith("#organization") coupling. MEDIUM.
shared/lib/seo/reference/seo-score.ts:305-313 robots object → "object" → noindex passes as good. HIGH. :251 canonical object form → false "no canonical". MEDIUM. :41,316-338 no x-default/absolute/bidirectional. MEDIUM. :31-34,226-233 length gates + title==name penalty (listing pages). MEDIUM. :93 isAbsolute https only. LOW. :374-377 positions flattened across lists. LOW. No self-referencing canonical check. MEDIUM.

**G4 — المجموعة ٤ (٢٦ ملفاً)**CLEAN: seo-helpers.ts · probe-articles-base-url.ts · shared/lib/seo/client/seo-score.ts

get-articles.ts:201/:232 defaults spread after article (latent). LOW.
seo-generation.ts:41 description substring mid-word. MEDIUM. :59 vs :68 two site-URL resolution orders. MEDIUM. :70 raw concat canonical. MEDIUM.
analyze-technical.ts:20-45 canonical test = startsWith("https://") → cross-domain canonical passes. HIGH. :48-72 sitemapPriority/ChangeFreq "pass" rows. LOW.
transition-article.ts:152-172 PUBLISHED_ON_CLIENT_SITE never revalidates. MEDIUM.
update-category.ts:101-103 bare catch around batch cascade then revalidate. HIGH. :39 not: undefined stripped → slug-keyed update rejected. MEDIUM. :93-99 unbounded. LOW.
update-client-grouped.ts:485 taxID ?? vatID (inert today). MEDIUM. :315/:438 organizationType written by two writers. MEDIUM. :24-39 valuesAreEqual === on objects → always-changed → updatedAt bumps. MEDIUM. :585-588 media-social twitter fields discarded. LOW.
map-initial-data-to-form-data.ts:134 taxID || vatID in form. MEDIUM. :100 ogImageMedia = hero. LOW.
run-all-maintenance.ts — no revalidateModontyTag at all. MEDIUM. :221-234 dims backfill without regeneration. MEDIUM. :196-205 misplaced JSDoc. LOW.
save-image-seo.ts:98-112 Cloudinary rename BEFORE db update, no compensation → 404 images. HIGH. :147-153 regen .catch(()=>null) then revalidate. HIGH. :92-95 inline-use guard searches Article.content only. MEDIUM. :45 Arabic kept in public_id → unencoded URL. MEDIUM. :147-153 sequential awaits. LOW.
build-clients-page-jsonld.ts:310 vs 312-316 20 items vs totalCount. MEDIUM. :14 https://${u}. HIGH. :12 unanchored replace. MEDIUM. :183/:186 @type raw free text. MEDIUM. :255 areaServed "SA" every ContactPoint. MEDIUM. :271-276 parseInt("50-100")→50. LOW. :94/:151 description "". LOW.
generate-modonty-page-jsonld.ts:87-93 bare {"@type":"ContactPoint"}. MEDIUM. :158 dateModified = now fallback. MEDIUM. :67 unencoded slug. MEDIUM. :54/:62 URL join defects. MEDIUM. :186 home crumb "Modonty" Latin. MEDIUM. :154 description "". LOW.
cascade-step-actions.ts — never regenerates Modonty static pages. MEDIUM. :24-27 unbounded findMany. LOW.
seed-technical-defaults.ts:64 defaultOgType "website" feeds ARTICLE og:type (get-article-defaults-from-settings.ts:26). HIGH. :67 image/webp blanket MIME vs image/jpeg elsewhere. MEDIUM. :76-79 sitemap fields seeded. LOW. :42-50 overwrites siteUrl/siteName/orgSearchUrlTemplate; "ar, en". MEDIUM.
alert-system.ts:166-204 sendEmailAlert never sends. MEDIUM. :209-236 dead unescaped HTML. LOW. :301 "undefined/path". LOW.
build-ymyl-jsonld.ts:78 @id `${client.url ?? ""}#organization` → bare "#organization" shared by all; or client's own domain vs platform @id. HIGH. :152 MedicalWebPage @id ≠ main WebPage @id → two page nodes. HIGH. :111 reviewer @id same failure. MEDIUM. :103/:142 English specialty labels. MEDIUM. :87-91 propertyID = display name. LOW.
category-seo-generator.ts:32/:69 identical description template → near-duplicates. MEDIUM. :50/:60/:84 socialImage no absolute normalization. HIGH. :84 alt in description. LOW. :40 self-only hreflang. MEDIUM.
custom-validation-rules.ts (dead): :140-146 rejects logo >600px (AMP-era). :79 inLanguage!=="ar" rule never runs. :160/:302 modonty\.com without www → internal links counted external. :239/:354 width≥1200 error; requires Person node. MEDIUM each.
jsonld-storage.ts:113-118 platform default image injected when no featured image (non-visible). MEDIUM. :170-190 validation computed then ignored — invalid graph stored. MEDIUM. :114 filename exact match. LOW.
page-extractor.ts:45 Array.isArray on object → microdata/rdfa branch never runs. MEDIUM. :98-114 catch discards error. LOW.
pipeline-stages.ts:168-177 empty stageChecks → "ready" (stages 12,13 green without running). MEDIUM.
search-console-api.ts:104-131 fetchStructuredDataErrors always returns [] (fabricated all-clear). HIGH. :198-217 previousCount=0 → 100% trend. MEDIUM. :247-251 mutates Date, dead. LOW.
ymyl-helpers.ts:163-164 forbidden-claims matched on raw HTML. LOW.
generate-client-seo-bundle.ts:237-252 vs :258-259 title/desc truncated but OG not. MEDIUM. :328 type image/jpeg hardcoded. MEDIUM. :283-288 includes("ar") locale detection. MEDIUM. :296-317 every hreflang → same URL. HIGH. :396-410 ratingValue 0; self-hosted reviews. MEDIUM. :404 author "زائر" fabricated. MEDIUM. :221/:234 stored canonical wins, never recomputed. HIGH. :229/:226 URL join. MEDIUM. :233/:244 description "". MEDIUM. :321 "- Organization" alt. LOW. :212 findFirst no orderBy. LOW. :266/:347 twitter.card twice. LOW.

**G5 — المجموعة ٥ (٢٨ ملفاً)**CLEAN: client-site-guard.ts · clients-actions/types.ts · article-seo-score.ts · essential-seo-fields.ts

canonical-url-sanitizer.ts:401-439 rewrites canonicalUrl COLUMN for 7 tables, never regenerates nextjsMetadata/JSON-LD, never revalidates (sibling database/actions/canonical-sanitizer.ts does). CRITICAL. :336-339 detectedBadHosts polluted. LOW. :197-220 7 unbounded findMany. LOW.
metadata-generator.ts:200,225 modifiedTime = ogArticleModifiedTime || new Date(). HIGH. :222 locale = ogLocale || inLanguage ("ar") || "ar_SA" → invalid og:locale. HIGH. :143,213 og:site_name = client name. MEDIUM. :199 publishedTime = datePublished || scheduledAt (future). MEDIUM. :80-101 every alternate → same Arabic canonical. MEDIUM. :121,159 startsWith(siteUrl) host test. LOW.
update-media.ts:98-114 movedBunnyUrl assigned before crop loop; crop failure swallowed → crops 404. HIGH. :144-145 width/height from caller verbatim. MEDIUM. :178 .catch(()=>null) + :187 catch{} loop abandons. MEDIUM.
jsonld-processor.ts:41,47 jsonld.expand fetches schema.org at generation; :66 warn + return un-normalized. HIGH. :93-116 compactJsonLd returns id/type keys (zero callers). MEDIUM. :16-29 fixAtKeywordsDeep renames any id/type. LOW. :122-150 dead. LOW.
build-taxonomy-page-jsonld.ts:80-84,150-157 hardcoded 1200×630. HIGH. :18 https://${u}; :16 unanchored replace. MEDIUM. :121-129 20 vs totalCount. MEDIUM. :59,69 raw slug. MEDIUM. :60-69 url≠@id. MEDIUM. :74-76 alternateName = seoTitle. MEDIUM. :86 identifier = ObjectId. LOW. :127 itemListOrder asserted. LOW.
build-trending-page-jsonld.ts:67-74 Article image 1200×630. HIGH. :50-54 author "Modonty" as Person (vs Organization elsewhere). MEDIUM. :44-49 String(dateModified). MEDIUM. :30-75 full Article nodes with article @id on /trending (duplicate @id). MEDIUM. :99-106 20 vs total. MEDIUM. :16/:14 URL join. MEDIUM. :59 logo bare string. LOW. :103 itemListOrder. LOW.
client-server-schema.ts:36 (+:29,:57,:63) canonicalUrl/url no .url(). HIGH. :33 seoTitle max 51. MEDIUM. :123 .passthrough(). MEDIUM. :83 sameAs unvalidated. MEDIUM.
tag-seo-generator.ts:40 self-only hreflang. HIGH. :32,69 "مقالات بتاج" (تاج = crown; correct: وسم). MEDIUM. :139-148 no revalidateModontyTag. MEDIUM. :76 @id = pageUrl collides when canonical elsewhere. MEDIUM.
save-client-seo.ts:43-66 columns committed before generation; failure leaves split-brain. HIGH. :22-23 caps 120/320 vs 51/160 elsewhere. MEDIUM.
analyze-structured-data.ts:91,104,107 FAQ rich-result advice (retired). MEDIUM. :32-34 dead flags. LOW. :19-27 any non-empty JSON = pass. LOW.
build-faq-page-jsonld.ts:6-8 comment claims FAQ rich result works. MEDIUM. :44-46 vs :50-53 Answer inherits Question's votes/author. MEDIUM. :75 home @id no slash. LOW.
build-modonty-author-seo.ts:116 "Articles by …" English description. MEDIUM. :136 default dims applied to fallback logo. MEDIUM. :119,124,132 concat, trailing-slash/encoding. MEDIUM. :39,43 title = bare brand; description "". MEDIUM.
author-seo-repair.ts:37-48 doesn't write canonicalUrl column; revalidates /authors only. MEDIUM.
article-validator.ts:142-153 noindex check misses googlebot meta + X-Robots-Tag. MEDIUM. :196-213 flags intentional cross-canonical as critical. MEDIUM. :511-517 non-greedy  scope. LOW. :338,348 misdirecting fix text. LOW.
page-seo-analyzer.ts:124-171,356-365 length/wordcount rules. MEDIUM. :465 new URL unguarded. LOW. :64,256 no s flag. LOW. :21-55 "comprehensive" but no hreflang/robots/JSON-LD. LOW.
client-field-mapping.ts:349-391 duplicate heroImageMedia entries (twitter mapping unreachable). MEDIUM. :820-884 documents twitter* Client columns that don't exist. MEDIUM. :341 "Required for Article rich results" stale. MEDIUM. :195-240 truncate:60/160 contract. MEDIUM.
index.ts:86-93 auto-fix re-exports next to dead block. LOW.
seo-validation.ts:18-23,47-52 valid:false for >60/>160. MEDIUM.
intake-seed-definition.ts:434 / ymyl-config.ts:136,222,307 honorifics in Person.name examples. MEDIUM. :280-286 free-text statistics. LOW.
generate-article-ai.ts:60-63,74-77 warn + continue. LOW. :21,90 AI faqs for retired feature. LOW.
field-display-helpers.ts:23,88 substring mid-word (admin display). LOW.
shared/lib/seo/article/meta-score.ts:121-140 OG check certifies fabricated 1200/630. MEDIUM. :156-168 hreflang check can never fail. LOW.
shared/lib/seo/media/seo-score.ts:49-53 ALT_MAX 125 / DESC 50-160 as "Google rules". LOW.
ymyl-config.ts:62,158,244 LocalBusiness subtypes regardless of visible address. LOW.

**G6 — المجموعة ٦ (٣٣ ملفاً)**CLEAN: get-article-jsonld.ts · jsonld-actions/index.ts · get-category-by-id.ts · get-industries.ts · organization-schema-types.ts · hreflang-backfill.ts (known only)

F1 update-client.ts:183-193 update never regenerates /clients listing cache (create/delete/convert do). CRITICAL.
F2 listing-page-seo-generator.ts:277-288 comment asserts /articles doesn't exist — modonty/app/(site)/articles/page.tsx exists, indexable, no generated meta cache. CRITICAL.
F3 page-validator.ts:42-51 render failure swallowed; DB-synthesized HTML (no canonical/robots/hreflang/OG) graded; canPublish computed from it. CRITICAL.
F4 update-client.ts:137 rebakeClientSiteCanonicals .catch(()=>{}) then cascade bakes stale URLs. HIGH.
F5 structured-data.ts:259 parentOrganization @id = ObjectId. HIGH.
F6 use-page-form.ts:45-56 deriveAlternateLanguages invents /en/… URLs → Modonty.alternateLanguages. HIGH.
F7 article-validator-db.ts:399-413 canonical gate checks host only, not path. HIGH.
F8 page-actions.ts:139 + listing-page-seo-generator.ts:29 + industry-seo-generator.ts:116 + structured-data.ts:21,62 hardcoded https://www.modonty.com fallback (5 writers). HIGH.
F9 listing-page-seo-generator.ts:170,200,230,260,358,387 `${siteUrl}/categories` no trailing-slash normalization → //categories. HIGH.
F10 listing-page-seo-generator.ts:90,307 OG 1200×630 fabricated. HIGH.
F11 listing-page-seo-generator.ts:306,319 home locale hardcoded ar_SA; canonical = siteUrl without root slash. HIGH.
F12 update-author.ts:110-120 cascade failure catch {}. MEDIUM. F13 create-client.ts:280 catch {}. MEDIUM. F14 update-client.ts:134 results[13] magic index. MEDIUM. F15 update-client.ts:112-118 success unless ALL 14 writers fail → SEO from half-written row. MEDIUM.
F16 page-actions.ts:95-101 organizationSeo can never be cleared. MEDIUM. F17 :141-149 revalidate URL concat, secret in query, "undefined". MEDIUM.
F18 build-meta-from-settings.ts:110-113 duplicate ar / no x-default. MEDIUM. F19 :105-106 OG dims from defaults. MEDIUM. F20 :92 empty description shipped. MEDIUM. F21 :82-171 preview builder ≠ stored builder (operator approves a card Google never gets). MEDIUM. F22 :87 home canonical honours defaultPathname. MEDIUM.
F23 use-page-form.ts:179-182 useEffect resets edits. MEDIUM. F24 :160 inLanguage ignores defaultOgLocale. MEDIUM.
F25 rename-cloudinary-asset.ts:31-33 publicId unencoded (Arabic) → Media.url → JSON-LD. MEDIUM. F26 :143 format fallback = whole public id → dead URL. MEDIUM. F27 :134-138 console.log full API response. LOW.
F28 industry-seo-generator.ts:40 single ar-SA hreflang no x-default. MEDIUM. F29 :32,69 two description fallbacks. MEDIUM.
F30 article-validator-db.ts:135 slug regex allows /. MEDIUM. F31 :544-547 isInternalHref hardcodes modonty.com (client-site articles). MEDIUM. F32 :229-243 no aspect-ratio check. MEDIUM. F33 :663-664 fetchOk:true fabricated. MEDIUM. F34 :597-610 substring suppression hides real schema errors. MEDIUM.
F35 cwv-monitor.ts:206-212 truncates description mid-word at 200. MEDIUM. F63 :93 "defer/async" for JSON-LD. LOW. F64 :69,167 unreachable parse budget. LOW. F65 :92,140 vs :126 contradictory placement advice. LOW.
F36 page-validator.ts:348-377 fallback HTML omits JSON-LD for client/category/user → NO_STRUCTURED_DATA. MEDIUM. F37 :341 unescaped JSON-LD injection. MEDIUM. F38 :71-75 100-errors*10 score. MEDIUM.
F39 merge-tag-actions.ts:141,164-183 phase 2 client loop. MEDIUM. F40 :107-121 emptied source tag stays indexable. MEDIUM.
F41 build-hreflang-languages.ts:22-31 keys unvalidated (ar_SA underscore invalid). MEDIUM. F42 :14-36 no self-referencing guarantee. MEDIUM. F43 :26-30 every entry without url → same canonical. MEDIUM.
F44 client-jsonld-validator.ts:222-228,272 requireLogo defaults false. MEDIUM. F45 :279-284 logo
