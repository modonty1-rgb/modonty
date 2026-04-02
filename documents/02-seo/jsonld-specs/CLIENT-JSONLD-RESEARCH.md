# Client JSON-LD – Research: Gaps vs. Best Practices

Reference: [generate-complete-organization-jsonld](admin/lib/seo/generate-complete-organization-jsonld.ts), [client-jsonld-validator](admin/app/(dashboard)/clients/helpers/client-seo-config/client-jsonld-validator.ts), and the live preview in SEO & Validation.

**Sources:** [Schema.org Organization](https://schema.org/Organization), [Schema.org ContactPoint](https://schema.org/ContactPoint), [Google – Organization markup / logos](https://webmasters.googleblog.com/2013/05/using-schemaorg-markup-for-organization.html), [IETF BCP 47](https://www.rfc-editor.org/info/bcp47).

---

## 1. Current vs. Ideal

| Area | You have | Official / Best practice | Gap? |
|------|----------|---------------------------|------|
| **@graph** | Organization, WebSite, WebPage | Recommended for knowledge graph | ✓ |
| **Organization @id, name, url** | ✓ | Required for KP; url = official site | ✓ |
| **logo** | ImageObject, 112×112 min | Google: 112×112 min, PNG/SVG preferred | ✓ |
| **description** | ✓ | Recommended for KP | ✓ |
| **sameAs** | ✓, URL-validated | Social + Wikipedia; KP attribution | ✓ |
| **contactPoint** | email, phone, contactType, areaServed, availableLanguage | Recommended for KP | ✓ |
| **address** | PostalAddress | Recommended for KP | ✓ |
| **knowsLanguage** | Raw form values ("Arabic", "English") | **IETF BCP 47** (e.g. "ar", "en") | **Gap** |
| **companyRegistration** | identifier (PropertyValue) | **companyRegistration** (Certification + issuer) | **Gap** |
| **parentOrganization @id** | DB id when present | **Resolvable URL** (e.g. /clients/slug#organization) | **Gap** |
| **geo** | Not on Organization | Optional; useful for local / map | **Gap** |
| **businessActivityCode** | Not output | Optional local classification | **Gap** |
| **WebPage primaryImageOfPage** | OG image only | OG or **logo fallback** when no OG | **Gap** |
| **Live preview** | Minimal Org + WebPage | Full graph only on save | **Note** |

---

## 2. Schema.org Organization – What’s Missing or Off

### 2.1 knowsLanguage (IETF BCP 47)

Schema: *"Use language codes from the IETF BCP 47 standard."*

- **Current:** You push `client.knowsLanguage` as-is (e.g. "Arabic", "English").
- **Ideal:** Use BCP 47 tags (e.g. `"ar"`, `"en"`, `"ar-SA"`). You already map to `ar`/`en` for ContactPoint `availableLanguage`; use the same mapping for `knowsLanguage`.

**Action:** Map knowsLanguage to BCP 47 (e.g. Arabic→ar, English→en) before output. Keep `availableLanguage` in ContactPoint consistent (BCP 47 or natural language per Schema examples; BCP 47 preferred for interoperability).

### 2.2 companyRegistration vs identifier

Schema defines **companyRegistration** as `Certification` (registration number + issuing org). You use **identifier** with `PropertyValue` for CR and ISO6523.

- Both valid. **companyRegistration** is more precise for “official registration + issuer.”
- **Action:** Consider adding `companyRegistration` (Certification with `name`, `issuedBy` e.g. Ministry of Commerce) alongside or instead of CR in `identifier`. Keep ISO6523 in `identifier` if needed.

### 2.3 parentOrganization @id

- **Current:** You use `parentOrganization.id` (DB id) when present.
- **Ideal:** Use a **resolvable URL** (e.g. `{siteUrl}/clients/{parentSlug}#organization`) so it aligns with Schema and KP expectations.

**Action:** When parent is another client, set `@id` to the client page URL. Use `parentOrganization.url` when it’s already a full URL; otherwise derive from parent slug if available.

### 2.4 geo (lat/long)

- **Current:** Not set on Organization.
- **Ideal:** Optional. When you have `addressLatitude` / `addressLongitude`, add **geo** (`GeoCoordinates`) to Organization. Helps local/search and map features.

**Action:** Add `geo` when both lat and long exist. Prefer GeoCoordinates on Organization or on Place if you introduce a separate Place node.

### 2.5 businessActivityCode / naics

- **Current:** You output **isicV4** only. **businessActivityCode** is in the form but not in JSON-LD.
- **Ideal:** Schema has **naics** (North American) and **isicV4** (international). businessActivityCode can map to a local classification.

**Action:** Optional. Output **businessActivityCode** when present (e.g. as custom/local classification). Prefer **isicV4** for international alignment.

### 2.6 Organization image

- **Current:** You have **logo** (ImageObject). Thing also has **image**.
- **Ideal:** For Knowledge Panel, **logo** is primary. **image** is optional extra.

**Action:** Low priority. No change needed unless you want a separate “brand image” distinct from logo.

### 2.7 WebPage primaryImageOfPage

- **Current:** Set only when **ogImageMedia** exists.
- **Ideal:** When there’s no OG image, use **logo** as fallback so the page always has a primary image.

**Action:** Add primaryImageOfPage from OG image; if none, use logo (same fallback logic as meta tags).

### 2.8 legalAddress

- **Current:** Single **address** (PostalAddress).
- **Ideal:** Schema allows **legalAddress** (official registered address) distinct from operational address.

**Action:** Optional. Add only if you model legal vs operational addresses separately.

---

## 3. ContactPoint – What’s Missing or Off

- **contactType, email, telephone, areaServed, availableLanguage:** You have them. ✓
- **areaServed:** Use ISO 3166-1 alpha-2 (e.g. "SA", "AE"). You already do. ✓
- **availableLanguage:** Schema examples use "English"/"French"; you use "ar"/"en". Both allowed. BCP 47 preferred for **knowsLanguage**; **availableLanguage** can stay as-is or align with BCP 47 for consistency.

**Optional:** **contactOption** (e.g. TollFree, HearingImpairedSupported), **hoursAvailable**, **email** / **telephone** per contact type. Add only if you capture this data.

---

## 4. Google Knowledge Panel – Recap

- **Required:** name, url. ✓
- **Recommended:** logo (112×112 min), sameAs, contactPoint, description, address. ✓
- **Logo:** 112×112 min; you enforce. PNG/SVG preferred—document for content authors; no schema change.

---

## 5. Checklist for “Perfect” Client JSON-LD

| Item | Priority | Action |
|------|----------|--------|
| **knowsLanguage** BCP 47 | High | Map form values to BCP 47 (e.g. ar, en, ar-SA) before output. |
| **parentOrganization @id** | High | Use resolvable URL (client page or parent url), not DB id. |
| **companyRegistration** | Medium | Add Certification (number + issuer) when CR exists; keep identifier for ISO6523 if needed. |
| **WebPage primaryImageOfPage** fallback | Medium | Use logo when no OG image. |
| **geo** | Medium | Add GeoCoordinates when addressLatitude + addressLongitude exist. |
| **businessActivityCode** | Low | Output when present (local classification). |
| **legalAddress** | Low | Add only if you distinguish legal vs operational address. |
| **Live preview** | Note | Clarify in UI: “Preview is minimal; full JSON-LD generated on save.” |

---

## 6. Suggested JSON-LD Shape (Organization node, summary)

```text
Organization
├── @type, @id, name, url
├── legalName, alternateName, slogan
├── logo (ImageObject, 112×112 min)
├── description
├── foundingDate
├── knowsLanguage (BCP 47: ["ar", "en"])
├── identifier (PropertyValue: CR, ISO6523)
├── companyRegistration (Certification, optional)
├── vatID, taxID
├── contactPoint (email, phone, contactType, areaServed, availableLanguage)
├── areaServed (country code)
├── address (PostalAddress)
├── geo (GeoCoordinates, when lat/long exist)
├── isicV4, businessActivityCode (optional)
├── numberOfEmployees (QuantitativeValue)
├── parentOrganization (@id = resolvable URL)
├── sameAs (valid URLs)
├── mainEntityOfPage (WebPage @id)
├── keywords, knowsAbout
└── (optional: image, legalAddress, faxNumber)
```

---

## 7. Live Preview vs. Stored JSON-LD

- **Preview (SEO & Validation):** Minimal @graph (Organization + WebPage). No WebSite, many Org fields omitted. Good for quick checks; not full output.
- **Stored:** Full graph from **generate-complete-organization-jsonld** (Org + WebSite + WebPage).

**Action:** Add a **critical note** in SEO & Validation (e.g. in JSON-LD or Summary tab): “Preview is minimal; full JSON-LD with WebSite, ContactPoint, address, etc. is generated on save.”

---

## 8. Summary

**Must fix for “perfect” JSON-LD:**

1. **knowsLanguage:** Use IETF BCP 47 codes (ar, en, ar-SA, etc.), not raw labels.
2. **parentOrganization @id:** Use resolvable URL (client page or parent url), not DB id.
3. **WebPage primaryImageOfPage:** Fallback to logo when no OG image.

**Nice to have:**

- **companyRegistration** as Certification (plus issuer) when CR exists.
- **geo** when lat/long available.
- **businessActivityCode** when present.
- **Critical note** in UI: preview is minimal; full JSON-LD on save.

Implementing the "Must fix" items in **generate-complete-organization-jsonld** (and in any live preview pipeline that produces JSON-LD) will align client JSON-LD with Schema.org and Google's Organization/knowledge-panel guidance.


---

## 9. Implemented

- **knowsLanguage:** Mapped to IETF BCP 47 (e.g. ar, en) in generator and live JSON-LD preview.
- **parentOrganization @id:** Resolvable URL (slug or parent url); slug in parent select.
- **WebPage primaryImageOfPage:** OG image else logo fallback.
- **companyRegistration:** Certification (name, certificationIdentification, issuedBy) when CR exists.
- **geo:** GeoCoordinates when lat/long exist.
- **businessActivityCode:** Output when present.
- **Live preview (JSON-LD tab):** BCP 47, geo, businessActivityCode, parent @id, primaryImageOfPage. Critical notes block.