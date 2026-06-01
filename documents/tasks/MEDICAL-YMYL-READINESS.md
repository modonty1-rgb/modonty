# Medical YMYL Readiness — Action Plan for modonty.com

> **Document version:** 2026-05-22 (round 4 — expert-reviewer-ready)
> **Author:** internal audit + Schema.org + Google Search Central + Saudi regulators
> **Reviewer note:** every factual claim carries an inline link to the official source it was verified against. All Schema.org pages and Google docs cited below were re-fetched on the document version date listed above. Document is intended to be read independently by an external SEO/healthcare-compliance reviewer.

---

## 0. How an external reviewer can verify this document

Every Schema.org property name, expected type, and inheritance chain stated here is followed by a direct link to its `schema.org/<Property>` definition page. To independently verify any claim:

1. Click the linked source.
2. Compare the property name and expected type quoted here against what schema.org shows live.
3. If the live page diverges (Schema.org occasionally updates), this document needs a re-check.

For Google guidance, links go to `developers.google.com/search/...` only — never to SEO blog opinion.

For Saudi regulatory rules, links go to `sfda.gov.sa`, `moh.gov.sa`, or `scfhs.org.sa` only.

A summary table of all source URLs used is at the bottom of this document (§9).

---

## 1. Goal & context

modonty.com is about to onboard **7 healthcare clinic clients** as paying subscribers. Medical content is in Google's flagship YMYL ("Your Money or Your Life") category, meaning the same content errors that would lightly affect an unrelated site can permanently damage trust signals on a YMYL site. The goal of this plan is to bring modonty.com's data model, JSON-LD output, editorial workflow, and public render to a state where each healthcare client's content can be ingested by Google as trusted medical content from day one.

---

## 2. YMYL framework — Google's official language

> *"For pages on topics where the quality of information matters more, such as topics that could significantly impact a person's life, health, financial stability, or safety, we use Search systems that place even more emphasis on signals about expertise, authoritativeness, and trustworthiness."* — Google Search Central, [Creating Helpful, Reliable, People-First Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)

YMYL is operationalized through **E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness). The fourth E (Experience) was added in December 2022 — [official announcement](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t). Trust sits at the apex of the pyramid in the [Search Quality Rater Guidelines (September 2025 PDF)](https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf).

For medical content specifically, Google's [structured data Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article) does NOT include medical-specific requirements; the medical depth comes from using the Schema.org medical types directly (next section).

**Important:** per Google's [Article structured data documentation](https://developers.google.com/search/docs/appearance/structured-data/article), the three types `Article` / `NewsArticle` / `BlogPosting` are equally valid for general content. Google does not currently recommend one over the others for medical content. Our recommendation to use Schema.org medical types (`MedicalWebPage`, `MedicalScholarlyArticle`, `Physician`, `MedicalClinic`) is based on the Schema.org spec providing richer medical semantics that Google can read via JSON-LD even though it does not require them.

---

## 3. Schema.org medical types — verified field references

All types and properties below have been confirmed live on schema.org on the document version date. Each row links to its definitive Schema.org page.

### 3.1 MedicalWebPage — the page wrapper for medical content

[`schema.org/MedicalWebPage`](https://schema.org/MedicalWebPage) — subclass of `WebPage` → `CreativeWork` → `Thing`.

**Direct properties:**
- `medicalAudience` — expected type `MedicalAudience`. [`schema.org/medicalAudience`](https://schema.org/medicalAudience)
- `specialty` — expected type `Specialty`. [`schema.org/specialty`](https://schema.org/specialty)

**Key inherited properties from `WebPage`:**
- `lastReviewed` (Date) — *"Date on which the content on this web page was last reviewed for accuracy and/or completeness."* [`schema.org/lastReviewed`](https://schema.org/lastReviewed)
- `reviewedBy` (Organization | Person) — *"People or organizations that have reviewed the content on this web page for accuracy and/or completeness."* [`schema.org/reviewedBy`](https://schema.org/reviewedBy)
- `mainContentOfPage` (WebPageElement) — supersedes the older `aspect` property
- `breadcrumb` (BreadcrumbList | Text)

**Inherited from `CreativeWork`:**
- `about` (Thing — typically `MedicalCondition` here)
- `audience` (Audience — generic)
- `citation` (CreativeWork | Text)

**Reviewer note:** `reviewedBy` and `lastReviewed` are properties of `WebPage`, NOT of `Article` or `MedicalScholarlyArticle`. To attach a reviewer and last-reviewed date to a medical article correctly, the page wrapper must be `MedicalWebPage` (or `WebPage`), and the Article goes inside as `mainEntity`.

### 3.2 MedicalScholarlyArticle — the medical article type

[`schema.org/MedicalScholarlyArticle`](https://schema.org/MedicalScholarlyArticle) — subclass of `Article` → `CreativeWork` → `Thing`.

**Direct property:**
- `publicationType` (Text) — *"The type of the medical article, taken from the US NLM MeSH publication type catalog."* Values include `Patient Education`, `Review`, `Case Report`, `Clinical Trial`, `Editorial`, `Guideline`.

**Inherited from `Article`:** `headline`, `articleBody`, `articleSection`, `wordCount`. ([`schema.org/Article`](https://schema.org/Article))
**Inherited from `CreativeWork`:** `author`, `datePublished`, `dateModified`, `publisher`, `image`, `citation`, `mainEntityOfPage`, `about`.

**Reviewer note:** `MedicalScholarlyArticle` does NOT carry `reviewedBy`, `lastReviewed`, or `medicalAudience` (those are WebPage properties). The medical author + medical credential signaling lives on the linked `author` (a `Person` or `Physician`).

### 3.3 MedicalClinic — for clinic-type clients

[`schema.org/MedicalClinic`](https://schema.org/MedicalClinic) — subclass of `MedicalOrganization` → `Organization` (also a `MedicalBusiness`).

**Direct properties:**
- `availableService` (MedicalProcedure | MedicalTest | MedicalTherapy)
- `medicalSpecialty` (MedicalSpecialty)

**Inherited from `MedicalOrganization`:** `isAcceptingNewPatients`, `healthPlanNetworkId`. ([`schema.org/MedicalOrganization`](https://schema.org/MedicalOrganization))
**Inherited from `LocalBusiness`:** `openingHoursSpecification`, `currenciesAccepted`, `paymentAccepted`, `priceRange`.
**Inherited from `Place`:** `address`, `telephone`, `hasMap`, `geo`.
**Inherited from `Organization`:** `sameAs`, `logo`, `legalName`, `vatID`, `taxID`.

### 3.4 Hospital — for larger institutions

[`schema.org/Hospital`](https://schema.org/Hospital) — subclass of `MedicalOrganization`.

**Direct properties:** `availableService`, `healthcareReportingData` (CDCPMDRecord | Dataset), `medicalSpecialty`.
**Inherited:** same as `MedicalClinic`.

### 3.5 Physician — for doctor authors

[`schema.org/Physician`](https://schema.org/Physician) — subclass of `MedicalOrganization`.

**Direct properties:**
- `availableService` (MedicalProcedure | MedicalTest | MedicalTherapy)
- `hospitalAffiliation` (Hospital)
- `medicalSpecialty` (MedicalSpecialty)
- `occupationalCategory` (Text | CategoryCode)
- `usNPI` (Text) — 10-digit US National Provider Identifier

**Inherited from `Organization`:** `hasCredential`, `knowsAbout`, `address`, `telephone`, `email`, `sameAs`.
**Subtypes available:** `IndividualPhysician`, `PhysiciansOffice`.

### 3.6 MedicalAudience — audience targeting

[`schema.org/MedicalAudience`](https://schema.org/MedicalAudience) — direct properties: `audienceType` (Text), `healthCondition` (MedicalCondition), `suggestedAge`, `suggestedGender`.

**Reviewer note:** `audienceType` is plain Text, NOT an enumerated property — Schema.org does not enforce specific values. However, `Patient` exists as a specialized **subtype** of `MedicalAudience` ([`schema.org/Patient`](https://schema.org/Patient)). So the cleaner form is `"@type": "Patient"` rather than `"@type": "MedicalAudience", "audienceType": "Patient"`. Both are valid; the subtype form is more semantic.

### 3.7 MedicalCondition — for condition-explainer articles

[`schema.org/MedicalCondition`](https://schema.org/MedicalCondition) — direct properties include `code` (MedicalCode), `signOrSymptom`, `possibleTreatment`, `riskFactor`, `primaryPrevention`, `secondaryPrevention`.

`MedicalCode` accepts `code` (Text — e.g. `"E11"`) and `codingSystem` (Text — e.g. `"ICD-10"`).

### 3.8 EducationalOccupationalCredential — for structured author credentials

[`schema.org/EducationalOccupationalCredential`](https://schema.org/EducationalOccupationalCredential) — subclass of `CreativeWork`.

**Direct properties:** `competencyRequired`, `educationalLevel`.

**Inherited (from `Credential` and ancestors):** `credentialCategory`, `recognizedBy`, `validIn`, `dateCreated`, `url`, `name`, `description`.

**Reviewer note:** when the document recommends `credentialCategory`, `recognizedBy`, and `validIn` on a credential, these are inherited (not direct) — but they are perfectly valid and recommended by Google for `hasCredential` on a `Person`. See [`schema.org/hasCredential`](https://schema.org/hasCredential).

### 3.9 Drug — for pharmaceutical content (P2 scope)

[`schema.org/Drug`](https://schema.org/Drug) — subclass via two hierarchies: `Thing > Product > Drug` AND `Thing > MedicalEntity > Substance > Drug`.

Key properties: `activeIngredient` (Text), `dosageForm` (Text), `prescriptionStatus` (DrugPrescriptionStatus | Text), `drugClass`, `manufacturer` (Organization), `warning` (Text | URL), `doseSchedule` (DoseSchedule).

**Reviewer note:** any drug-related medical article from a clinic client will need to align with SFDA advertising rules (§7.1 below).

---

## 4. Current state of modonty.com — what's already there and what's missing

Every file:line citation in this section has been read directly with the codebase open. JSON-LD emissions are confirmed by reading the generator functions themselves.

### 4.1 DB schema — `dataLayer/prisma/schema/schema.prisma`

#### Article model (lines 786-916) — already-present medical-relevant fields

| Field | Line | Type | Status today |
|-------|------|------|--------------|
| `lastReviewed` | 818 | `DateTime?` | ✅ stored ✅ emitted in JSON-LD (at line 236-238) on the **Article** node — incorrect location per [schema.org/lastReviewed](https://schema.org/lastReviewed) which says domain is `WebPage`. Move target: `MedicalWebPage` node. |
| `dateModified` | 817 | `DateTime @updatedAt` | ✅ |
| `datePublished` | 816 | `DateTime?` | ✅ |
| `mainEntityOfPage` | 819 | `String?` | ✅ emitted as @id reference |
| `breadcrumbPath` | 839 | `Json?` | ✅ emitted as `BreadcrumbList` |
| `citations` | 861 | `String[]` | ✅ emitted as `citation: [url, url]` (URL strings — schema.org accepts Text [per spec](https://schema.org/citation), but a richer form is wrapping each as `ScholarlyArticle`) |
| `articleBodyText` | 855 | `String?` | ✅ |
| `semanticKeywords` | 858 | `Json?` | ✅ emitted as `mentions[]` |
| `jsonLdStructuredData` | 850 | `String @db.String` | ✅ cached |
| `revisionNotes` | 813 | `String?` | ✅ exists for NEEDS_REVISION |

#### Author model (lines 629-686) — already-present credential fields

| Field | Line | Type | Status in JSON-LD |
|-------|------|------|-------------------|
| `firstName`, `lastName` | 635-636 | `String?` | ✅ emitted as `givenName`/`familyName` |
| `jobTitle` | 639 | `String?` | ✅ |
| `worksFor` | 640 | FK to Client | ✅ emitted as `worksFor: {@type: Organization}` |
| `bio`, `image` | 641-642 | `String?` | ✅ |
| `email` | 645 | `String?` | NOT emitted (privacy — OK per [Google E-E-A-T author best practices](https://developers.google.com/search/docs/appearance/structured-data/article)) |
| `linkedIn`, `twitter`, `facebook`, `sameAs[]` | 648-651 | mixed | ✅ all merged into `sameAs[]` |
| `credentials` | 654 | `String[]` | ✅ emitted as `hasCredential: ["string1", "string2"]` — flat strings; needs upgrade to structured `EducationalOccupationalCredential` objects for medical credibility |
| `qualifications` | 655 | `String[]` | ❌ NOT in current JSON-LD |
| `expertiseAreas` | 656 | `String[]` | ✅ emitted as `knowsAbout` |
| `experienceYears` | 657 | `Int?` | ❌ NOT in current JSON-LD |
| `verificationStatus` | 658 | `Boolean` | ❌ NOT in current JSON-LD and no public render |
| `memberOf` | 659 | `String[]` | ✅ emitted as `memberOf[].@type: Organization` |
| `education` | 662 | `Json?` | ❌ NOT in current JSON-LD (target: `alumniOf` per [`schema.org/alumniOf`](https://schema.org/alumniOf)) |

#### Client model (lines 291-481) — already-present medically-relevant fields

| Field | Line | Notes |
|-------|------|-------|
| `organizationType` | 362 | **Already dynamic** — `@type` in JSON-LD comes from this field (line 106 in [generate-complete-organization-jsonld.ts](admin/lib/seo/generate-complete-organization-jsonld.ts)). Setting `organizationType = "MedicalClinic"` immediately changes JSON-LD output. No code change needed. |
| `licenseNumber`, `licenseAuthority` | 353-354 | Exists but generic (regulated sectors) — separate from medical license |
| `intake` (JSON) | 430 | Contains `ymylReviewer` placeholder — proves the platform was always intended to support medical reviewing |
| `complianceConstraints` (JSON) | 441 | `{ industry?, restrictedClaims?, needsReview? }` |
| `forbiddenKeywords` | 443 | `String[]` — exists but NOT currently wired into validator |
| `forbiddenClaims` | 444 | `String[]` — same as above |

#### Industry model (lines 756-784)

Generic fields only. **No `isMedical` flag** — needs adding (§5.1).

#### Models that do not exist (confirmed via grep)

- ❌ `SfdaBannedTerm` (model for SFDA-banned terms — safe to add)
- ❌ `MedicalReview`
- ❌ Any model name containing `Medical`, `Health`, `Doctor`, `NPI`, `SCFHS`, `MOH`

### 4.2 JSON-LD generators — what they emit today

#### Article node — [admin/lib/seo/knowledge-graph-generator.ts:215-279](admin/lib/seo/knowledge-graph-generator.ts#L215)

```jsonc
{
  "@type": "Article",
  "@id": "...#article",
  "url": "...",
  "headline": article.title,
  "description": "seoDescription or excerpt",
  "author": { "@id": "...#person" },
  "publisher": { "@id": "...#organization" },
  "mainEntityOfPage": { "@id": "...#webpage" },
  "inLanguage": "ar",                    // hard-coded
  "isAccessibleForFree": true,
  "datePublished": "...",                // when set
  "dateModified": "...",                 // always
  "lastReviewed": "...",                 // when set — ⚠️ wrong schema location; belongs on WebPage
  "wordCount": <int>,
  "articleSection": "<category name>",
  "about": { "@type": "Thing", ... },    // ⚠️ generic — for medical, should be MedicalCondition
  "keywords": "tag1, tag2",
  "citation": ["url1", "url2"],          // ✅ already emitted — strings (valid per spec, could be richer)
  "image": [...],                        // 3 aspect ratios (16:9, 4:3, 1:1) per Google requirements
  "mentions": [...]
}
```

#### Person node — [admin/lib/seo/knowledge-graph-generator.ts:660-717](admin/lib/seo/knowledge-graph-generator.ts#L660)

```jsonc
{
  "@type": "Person",                     // ⚠️ for doctors, should swap to Physician
  "name": "...",
  "givenName": "...",
  "familyName": "...",
  "jobTitle": "...",
  "worksFor": { "@type": "Organization", "@id": "...", "name": "..." },
  "knowsAbout": [...],
  "hasCredential": ["string1", "string2"],  // ⚠️ flat strings; upgrade to EducationalOccupationalCredential objects
  "memberOf": [{"@type":"Organization","name":"..."}],
  "sameAs": ["linkedIn", "twitter", "facebook", ...sameAs]
}
```

The same Person shape is also emitted by [admin/lib/seo/structured-data.ts:72-101](admin/lib/seo/structured-data.ts#L72).

#### Organization node — [admin/lib/seo/generate-complete-organization-jsonld.ts:106](admin/lib/seo/generate-complete-organization-jsonld.ts#L106)

```jsonc
{
  "@type": "<client.organizationType || 'Organization'>",   // ✅ ALREADY DYNAMIC
  "name": "...",
  "legalName": "...",
  "address": { "@type": "PostalAddress", "streetAddress", "addressLocality", "addressRegion", "addressCountry", "postalCode", "addressNeighborhood", "buildingNumber", "additionalNumber" },  // ✅ full Saudi National Address
  "geo": { "@type": "GeoCoordinates", "latitude", "longitude" },
  "telephone": "...",
  "openingHoursSpecification": [...],
  "contactPoint": [...],
  "vatID": "...", "taxID": "...",
  "identifier": [...],  // includes CR Number
  "companyRegistration": { "@type": "Certification", "issuedBy": { "@type": "Organization", "name": "..." } },
  "sameAs": [...]
  // For medical: append `medicalSpecialty`, `isAcceptingNewPatients`, MOH facility URL in sameAs
}
```

The validator at [admin/lib/seo/jsonld-validator.ts:413,444](admin/lib/seo/jsonld-validator.ts#L413) already recognizes `MedicalOrganization` as a valid Organization @type — so swapping won't fail validation.

#### Validator — exactly 25 checks

[admin/lib/seo/article-validator.ts](admin/lib/seo/article-validator.ts) and its DB twin both contain exactly **25** `checks.push()` calls. New medical gates are appended at the end of this array, automatically participating in [gated-transition.ts](admin/app/(dashboard)/articles/workflow/actions/gated-transition.ts) which calls the validator.

### 4.3 Public render — verified

Article footer [modonty/app/articles/[slug]/components/article-footer.tsx:41-45](modonty/app/articles/[slug]/components/article-footer.tsx#L41) renders:
```html
{lastReviewed && (
  <p>آخر مراجعة: <RelativeTime date={lastReviewed} /></p>
)}
```

So `lastReviewed` IS publicly visible, just buried in the footer with no reviewer name. Medical UX standard ([healthline.com](https://www.healthline.com), [mayoclinic.org](https://www.mayoclinic.org)) is "Reviewed by Dr. X on YYYY-MM-DD" prominently above the title.

---

## 5. Required changes — P0 (blocking before any clinic client publishes)

### 5.1 DB migration — Prisma

Estimated 3 hours. Sequence per project rule: kill Node, `pnpm prisma:generate`, `pnpm prisma db push`, restart.

- [ ] `Article.reviewedById` — `String? @db.ObjectId` with `reviewer Author? @relation("ArticleReviewer", fields: [reviewedById], references: [id])`
- [ ] `Article.medicalDisclaimerShown` — `Boolean @default(false)`
- [ ] `Article.requiresMedicalReview` — `Boolean @default(false)`
- [ ] `Article.publicationType` — `String?` (NLM MeSH values: Patient Education / Review / Case Report / Clinical Trial / Editorial / Guideline — per [`schema.org/MedicalScholarlyArticle`](https://schema.org/MedicalScholarlyArticle))
- [ ] `Article.medicalAudienceType` — `String? @default("Patient")` — kept as text per [`schema.org/audienceType`](https://schema.org/audienceType) (Text, not enum)
- [ ] `Author.scfhsLicenseNumber` — `String?` (Saudi Commission for Health Specialties practitioner license number)
- [ ] `Author.medicalLicenseType` — new enum `MedicalLicenseType { MD, DDS, MBBS, PharmD, RN, PT, OTHER }`
- [ ] `Author.medicalSpecialty` — `String?` (specialty per SCFHS classification hierarchy — [SCFHS Professional Classification](https://scfhs.org.sa/en/professional-classification-requirements))
- [ ] `Author.licenseExpiryDate` — `DateTime?`
- [ ] `Client.mohFacilityNumber` — `String?` (Saudi MOH facility registration number — per [Saudi MOH facility licensing](https://www.moh.gov.sa/en/Ministry/Rules/Documents/Law-of-Practicing-Healthcare-Professions.pdf))
- [ ] `Client.accreditations` — `String[]` (codes such as JCI, CBAHI, CLIA, ISO9001)
- [ ] `Client.medicalSpecialty` — `String?`
- [ ] `Client.numberOfPhysicians` — `Int?`
- [ ] `Industry.isMedical` — `Boolean @default(false)` — set true for industries: Healthcare, Dentistry, Pharmacy, Mental Health, Veterinary
- [ ] New model `SfdaBannedTerm`:
  ```prisma
  model SfdaBannedTerm {
    id        String   @id @default(auto()) @map("_id") @db.ObjectId
    term      String   @unique
    severity  String   // "hard" | "soft"
    category  String?
    createdBy String?
    createdAt DateTime @default(now())
    @@map("sfda_banned_terms")
  }
  ```

**Initial seed for SfdaBannedTerm** — derived from [SFDA Advertising Guidance MDS-G-027](https://www.sfda.gov.sa/sites/default/files/2025-08/MDS-G027.pdf) prohibitions against unverifiable medical claims:
- hard: الأفضل · الأقوى · الوحيد · 100% فعالية · يشفي · يضمن النتيجة · معجزة · شفاء كامل · بدون آثار جانبية · آمن تماماً
- soft: الأكثر فعالية · الأسرع

### 5.2 JSON-LD generator updates

Estimated 6 hours across these files: [admin/lib/seo/knowledge-graph-generator.ts](admin/lib/seo/knowledge-graph-generator.ts), [admin/lib/seo/generate-complete-organization-jsonld.ts](admin/lib/seo/generate-complete-organization-jsonld.ts), [admin/lib/seo/structured-data.ts](admin/lib/seo/structured-data.ts).

#### Article generator

- [ ] **Around line 191 (WebPage emission):** When `article.client.industry.isMedical === true` OR `article.requiresMedicalReview === true`, swap `"@type": "WebPage"` → `"@type": "MedicalWebPage"` and append:
  - `reviewedBy: { "@id": "...#reviewer-person" }` from `article.reviewer` (a Person/Physician node also added to @graph)
  - `lastReviewed: toSaudiISOString(article.lastReviewed)` (per [`schema.org/lastReviewed`](https://schema.org/lastReviewed) — date format)
  - `audience: { "@type": "Patient" }` OR `medicalAudience: { "@type": "Patient" }` — both valid per [`schema.org/MedicalAudience`](https://schema.org/MedicalAudience). Use `medicalAudience` for clarity.
- [ ] **Lines 236-238 (Article node):** REMOVE `lastReviewed` emission from the Article node (it's the wrong schema location). The MedicalWebPage emission covers it.
- [ ] **Around line 222:** When `article.publicationType !== null`, swap `"@type": "Article"` → `"@type": "MedicalScholarlyArticle"` and add `publicationType: article.publicationType`.
- [ ] **Lines 261-264 (citation array):** For medical articles, wrap each citation URL as `{ "@type": "ScholarlyArticle", "url": "<url>" }`. Optionally detect trusted-source domain (pubmed.ncbi.nlm.nih.gov, who.int, moh.gov.sa, sfda.gov.sa, medlineplus.gov, cdc.gov, nih.gov, mayoclinic.org) and add a `publisher` name.

#### Person generator (line 660-717)

- [ ] When `author.medicalLicenseType !== null`:
  - Swap `"@type": "Person"` → `"@type": "Physician"`
  - Append `medicalSpecialty: author.medicalSpecialty` (per [`schema.org/medicalSpecialty`](https://schema.org/medicalSpecialty))
  - Append `hospitalAffiliation: { "@id": publisherId }` from `author.worksFor`
- [ ] **Upgrade `hasCredential` (line 692-694)** from flat strings to structured objects for medical authors:
  ```jsonc
  hasCredential: [{
    "@type": "EducationalOccupationalCredential",
    "credentialCategory": "medical license",
    "name": "<author.medicalLicenseType>",
    "recognizedBy": { "@type": "Organization", "name": "SCFHS", "url": "https://scfhs.org.sa" },
    "validIn": { "@type": "Country", "name": "Saudi Arabia" }
  }, ...rest_from_credentials_array]
  ```
  Per [`schema.org/EducationalOccupationalCredential`](https://schema.org/EducationalOccupationalCredential), `credentialCategory`, `recognizedBy`, and `validIn` are inherited from the parent `Credential` type — all valid.
- [ ] Prepend the SCFHS practitioner home page or directly-accessible profile URL (when the practitioner has one) to `sameAs[]` when `author.scfhsLicenseNumber !== null`. SCFHS does not currently expose a public verification API ([SCFHS Mumaris+ portal](https://portal.scfhs.org.sa/) is for practitioners themselves), so this is an informational link only.

#### Organization generator

- [ ] **No @type code change needed** (line 106 already reads `client.organizationType` dynamically — verified).
- [ ] When `client.industry.isMedical === true`, append:
  - `medicalSpecialty: client.medicalSpecialty` ([`schema.org/medicalSpecialty`](https://schema.org/medicalSpecialty))
  - `isAcceptingNewPatients: true` (default, admin toggle in P1) ([`schema.org/isAcceptingNewPatients`](https://schema.org/isAcceptingNewPatients))
  - Append the MOH facility public listing URL to `sameAs[]` when `client.mohFacilityNumber !== null`
- [ ] When `client.numberOfPhysicians >= 10` AND `organizationType === "MedicalClinic"` — emit a validation warning suggesting `Hospital` ([`schema.org/Hospital`](https://schema.org/Hospital)). Don't auto-change.

### 5.3 Admin UI — 4 forms + 1 helper

Estimated 10 hours.

#### Article form — new section "Medical Review" (visible when `client.industry.isMedical === true`)
Files: [admin/app/(dashboard)/articles/components/sections/](admin/app/(dashboard)/articles/components/sections/)

- [ ] Reviewer picker — Author select filtered to `medicalLicenseType !== null`; validation error if same as author
- [ ] Last-reviewed date picker (defaults to today on first set)
- [ ] Publication type select — Patient Education (default) · Review · Case Report · Clinical Trial · Editorial · Guideline
- [ ] Medical audience select — Patient (default) · Medical Professional
- [ ] Medical disclaimer checkbox (auto-checked when medical category; uncheck requires confirmation)
- [ ] Requires medical review checkbox (auto-checked; admin override only)

#### Citations section — [admin/app/(dashboard)/articles/components/sections/citations-section.tsx](admin/app/(dashboard)/articles/components/sections/citations-section.tsx)

- [ ] Detect trusted-source URLs and show "Trusted source" badge for: `pubmed.ncbi.nlm.nih.gov`, `who.int`, `moh.gov.sa`, `sfda.gov.sa`, `medlineplus.gov`, `cdc.gov`, `mayoclinic.org`, `nih.gov`
- [ ] Show counter `<n>/2 trusted` — red when below 2 for medical articles

#### Author form — [admin/app/(dashboard)/authors/components/author-form.tsx](admin/app/(dashboard)/authors/components/author-form.tsx)
- [ ] Add fields: `medicalLicenseType` (select), `scfhsLicenseNumber` (text), `medicalSpecialty` (text), `licenseExpiryDate` (date)
- [ ] Auto-prepend `https://scfhs.org.sa/en/practitioner` to `sameAs[]` when `medicalLicenseType !== null`

#### Client form — new "Medical Profile" section (visible when `industry.isMedical === true`)
Files: [admin/app/(dashboard)/clients/components/form-sections/](admin/app/(dashboard)/clients/components/form-sections/)

- [ ] Fields: `medicalSpecialty` (text), `mohFacilityNumber` (text), `accreditations` (multi-tag), `numberOfPhysicians` (number)
- [ ] Helper card suggesting `organizationType` value: Dentistry → `Dentist`, Pharmacy → `Pharmacy`, otherwise `MedicalClinic` (`Hospital` if `numberOfPhysicians >= 10`)

#### Industry form

- [ ] Add `isMedical` toggle. Pre-seed `true` for the 5 medical industries.

### 5.4 Validator gates — 5 checks appended

Estimated 3 hours. File: [admin/lib/seo/article-validator.ts](admin/lib/seo/article-validator.ts) — append after the existing 25 checks.

For articles where `article.requiresMedicalReview === true`:

1. `article.reviewedById !== null && article.reviewedById !== article.authorId` AND reviewer's `medicalLicenseType !== null` AND `scfhsLicenseNumber !== null`
2. `article.lastReviewed !== null && (now − lastReviewed) <= 365 days` (per industry consensus — see e.g. [Healthwise editorial policy](https://www.healthwise.org/specialpages/editorial-policy.aspx) for typical 1-year cadence)
3. `article.citations.length >= 2` AND at least 1 URL matches the trusted-source regex
4. `article.medicalDisclaimerShown === true`
5. SFDA banned-words scan on (title + excerpt + content) = 0 hard matches against `SfdaBannedTerm[]` (severity = "hard") + `client.forbiddenClaims[]` + `client.forbiddenKeywords[]`

These run inside the existing `validateArticleFromDb` pipeline that is called from [gated-transition.ts](admin/app/(dashboard)/articles/workflow/actions/gated-transition.ts), so the gating story is unchanged at the transition layer.

### 5.5 Public render — 4 new pieces

Estimated 5 hours.

- [ ] `MedicalReviewBadge` component — placed above article title. Shows: reviewer avatar + "Reviewed by Dr. X — last reviewed 2026-05-20" + link to reviewer's author page. Renders when `article.reviewedBy !== null`.
- [ ] `MedicalDisclaimer` component — placed at article footer:
  > "هذا المحتوى لأغراض تثقيفية فقط ولا يُغني عن استشارة طبيب مُرخّص."

  Renders when `article.medicalDisclaimerShown === true`. Arabic-first per the Saudi audience.
- [ ] Promote citations from sidebar to a numbered footer reference list for medical articles (sidebar variant stays for non-medical).
- [ ] On author page: render `author.credentials[]` as visible badges; render `scfhsLicenseNumber` as "License: <number> (SCFHS)"; render `medicalSpecialty` badge.
- [ ] On client page: visible `medicalSpecialty` + `accreditations` badges; MOH facility link.

- [ ] Create new page [modonty/app/legal/editorial-policy/page.tsx](modonty/app/legal/editorial-policy/) covering: medical review process, approved sources (WHO, MOH, SFDA, PubMed, NIH), 12-month review cadence (6 months for high-stakes topics), correction policy. This satisfies Google's "Who/How/Why" framework — see [Creating Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
- [ ] Update privacy policy with PDPL Saudi compliance + statement that modonty.com does not collect PHI; content is educational only.

### 5.6 Console approval guard

Estimated 2 hours. File: [console/app/(dashboard)/dashboard/articles/actions/article-actions.ts](console/app/(dashboard)/dashboard/articles/actions/article-actions.ts).

- [ ] `approveArticle` — when target article has `requiresMedicalReview === true`, verify the medical gate was already satisfied on admin side (article reached AWAITING_APPROVAL only through gate). If somehow it bypassed, return error.

### 5.7 Seed + live test

Estimated 3 hours.

- [ ] Seed `Industry.isMedical = true` for the 5 medical industries.
- [ ] Seed initial `SfdaBannedTerm` rows.
- [ ] Live test: create a medical client + a doctor author + a test medical article. Verify:
  1. Medical review badge visible above title
  2. Medical disclaimer block visible at footer
  3. JSON-LD includes `MedicalWebPage` wrapper with `reviewedBy` + `lastReviewed`
  4. JSON-LD swaps `Person` → `Physician` for the doctor author
  5. JSON-LD swaps `Organization` → `MedicalClinic` for the clinic publisher
  6. Article passes [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Negative test: try to publish a medical article missing a reviewer → gate fails with clear message
- [ ] Negative test: try to publish with `الأفضل` in the content → gate fails

**Phase 1 total: ~32 hours = 4 working days for a senior dev.**

---

## 6. P1 (next 2 sprints) and P2 (later)

### P1 — Strongly recommended

- New ArticleStatus value `AWAITING_MEDICAL_REVIEW` (pre-state for clinical content before AWAITING_APPROVAL)
- AI-use disclosure field on Article + render in byline (per Google's [How was this created? guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content))
- 12-month review cadence queue in admin (filter `lastReviewed > 365 days ago`)
- `/corrections` page
- "About our Medical Board" section on /about
- Promote `Author.credentials[]` from flat strings to structured `{ name, recognizedBy, validFrom, validUntil }` rows
- `Article.about: MedicalCondition` with ICD-10 `code` for condition explainers (per [`schema.org/MedicalCondition`](https://schema.org/MedicalCondition))
- Heading hierarchy validator
- Reading-level indicator (Arabic Flesch-Kincaid equivalent)
- Inline citation superscripts (¹, ², ³) in addition to reference list
- Image `altText` non-empty validation at publish time
- Render `Author.verificationStatus` as a "Verified Author" UI badge

### P2 — Nice-to-have

- ORCID integration · multilingual medical articles (`inLanguage` per article) · patient testimonials with disclaimer · video transcripts · SFDA-compliant medical newsletter · Saudi Unified Medical Dictionary auto-suggest in editor · compliance audit export · PubMed API for citation validation

---

## 7. Saudi regulatory compliance — verified sources

### 7.1 SFDA — advertising rules

[Saudi Food & Drug Authority — Medical Device Advertising Guidance MDS-G-027 (August 2025)](https://www.sfda.gov.sa/sites/default/files/2025-08/MDS-G027.pdf) prohibits:
- Superlative/comparative claims that are not "based on scientific grounds"
- Advertising of medical devices/drugs that haven't been approved by SFDA
- Claims promising specific medical outcomes

These are operationalized in our `SfdaBannedTerm` model + the validator gate (§5.4).

General SFDA advertising regulation overview: [CMS Expert Guide — Saudi Arabia advertising of medicines and devices](https://cms.law/en/int/expert-guides/cms-expert-guide-to-advertising-of-medicines-and-medical-devices/saudi-arabia).

### 7.2 MOH — facility licensing

[Saudi MOH — Law of Practicing Healthcare Professions](https://www.moh.gov.sa/en/Ministry/Rules/Documents/Law-of-Practicing-Healthcare-Professions.pdf) sets the framework for healthcare facility licensing. Each MOH-registered facility has a number — we surface it on the clinic profile + link in `sameAs[]`.

### 7.3 SCFHS — practitioner licensing

[SCFHS Professional Classification Requirements](https://scfhs.org.sa/en/professional-classification-requirements) defines practitioner categories (Bachelor, Physician, Higher Diploma, Master, PhD, Fellowship/Board Certified, Consultant).

[SCFHS practitioner registry homepage](https://scfhs.org.sa/en/practitioner) — SCFHS publishes the framework but does not currently expose a public API for license-number verification. Practitioners use [Mumaris+ portal](https://portal.scfhs.org.sa/) for self-service. Our flow stores the license number and the admin manually verifies via Mumaris+ before marking an author as `verificationStatus = true`.

### 7.4 PDPL — Saudi personal data protection law

Privacy policy must reference Saudi PDPL compliance. modonty.com does not collect Protected Health Information (PHI); all content is educational. The privacy policy will be updated accordingly (§5.5).

---

## 8. Open questions for the external reviewer

These items are not factual gaps but interpretation choices we want a second opinion on:

1. **`MedicalScholarlyArticle` vs `Article` default** — should every medical article default to `MedicalScholarlyArticle`, or only when admin explicitly sets `publicationType`? Current plan: only when explicitly set, because `MedicalScholarlyArticle` semantically implies scholarly rigor that not all patient-education content meets.
2. **`MedicalWebPage` for every medical article, or only for ones with a reviewer?** Current plan: every medical article, because `MedicalWebPage` enables `medicalAudience` and `about: MedicalCondition` which are valuable even without a reviewer assigned.
3. **`Patient` subtype vs `medicalAudience.audienceType: "Patient"`** — both valid per Schema.org. Current plan: emit `medicalAudience: { "@type": "Patient" }` (cleaner semantic, recognized by Google).
4. **Saudi reviewer-credential requirement** — should we hard-require an SCFHS license number for ANY author publishing under a medical client, or only for the reviewer of medical articles? Current plan: only required for the reviewer, not all authors. Non-medical writers can still write educational content for medical clients as long as a credentialed reviewer signs off.
5. **12-month review cadence** — industry standard (e.g. Healthwise) but not a Google/regulator rule. Current plan: 12 months default, 6 months for high-stakes categories (oncology, pediatrics, cardiology, drug interactions, mental health crisis). Reviewer can challenge these defaults.

---

## 9. Source verification table

Every external link used in this document. Re-fetch any of these if validating this document later.

### Schema.org
- [MedicalWebPage](https://schema.org/MedicalWebPage)
- [MedicalScholarlyArticle](https://schema.org/MedicalScholarlyArticle)
- [MedicalClinic](https://schema.org/MedicalClinic)
- [Hospital](https://schema.org/Hospital)
- [MedicalOrganization](https://schema.org/MedicalOrganization)
- [Physician](https://schema.org/Physician)
- [MedicalAudience](https://schema.org/MedicalAudience)
- [Patient](https://schema.org/Patient)
- [MedicalCondition](https://schema.org/MedicalCondition)
- [Drug](https://schema.org/Drug)
- [reviewedBy](https://schema.org/reviewedBy)
- [lastReviewed](https://schema.org/lastReviewed)
- [medicalSpecialty](https://schema.org/medicalSpecialty)
- [isAcceptingNewPatients](https://schema.org/isAcceptingNewPatients)
- [audienceType](https://schema.org/audienceType)
- [citation](https://schema.org/citation)
- [EducationalOccupationalCredential](https://schema.org/EducationalOccupationalCredential)
- [hasCredential](https://schema.org/hasCredential)
- [alumniOf](https://schema.org/alumniOf)
- [Article (for the Article structured data section)](https://schema.org/Article)

### Google Search Central
- [Search Quality Rater Guidelines — Sept 2025 (PDF)](https://static.googleusercontent.com/media/guidelines.raterhub.com/en//searchqualityevaluatorguidelines.pdf)
- [E-E-A-T announcement — Dec 2022](https://developers.google.com/search/blog/2022/12/google-raters-guidelines-e-e-a-t)
- [Creating Helpful, Reliable, People-First Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Quality Rater Guidelines update — Nov 2023](https://developers.google.com/search/blog/2023/11/search-quality-rater-guidelines-update)
- [Rich Results Test](https://search.google.com/test/rich-results)

### Saudi authorities
- [SFDA Advertising Guidance MDS-G-027 (Aug 2025) — PDF](https://www.sfda.gov.sa/sites/default/files/2025-08/MDS-G027.pdf)
- [Saudi MOH Law of Practicing Healthcare Professions](https://www.moh.gov.sa/en/Ministry/Rules/Documents/Law-of-Practicing-Healthcare-Professions.pdf)
- [SCFHS Professional Classification Requirements](https://scfhs.org.sa/en/professional-classification-requirements)
- [SCFHS Practitioner Registry homepage](https://scfhs.org.sa/en/practitioner)
- [SCFHS Mumaris+ portal](https://portal.scfhs.org.sa/)
- [CMS Expert Guide — Saudi Arabia advertising of medicines and devices](https://cms.law/en/int/expert-guides/cms-expert-guide-to-advertising-of-medicines-and-medical-devices/saudi-arabia)

### Industry references
- [Healthwise editorial policy (example of 12-month cadence)](https://www.healthwise.org/specialpages/editorial-policy.aspx)

---

## 10. Critical "do NOT do"

- Do **not** implement HONcode — Health On the Net Foundation discontinued the certification on December 15, 2022. ([Health On the Net Foundation — discontinuation reference](https://en.wikipedia.org/wiki/Health_On_the_Net_Foundation))
- Do **not** host third-party medical content under modonty.com — Google now classifies this as "site reputation abuse" / parasite SEO and penalizes the host domain.
- Do **not** allow AI-only medical content — every medical paragraph requires a human SME (Subject Matter Expert) review. AI involvement must be disclosed per Google's "How was this created?" guidance.
- Do **not** collect PHI in any medical article form (no symptom checkers without explicit PDPL review).
- Do **not** promise specific medical outcomes — SFDA prohibits.

---

## 11. Tooling & environment (verified)

- **Prisma** v6.19.1, MongoDB provider — use `pnpm prisma db push` for schema changes; kill Node before `pnpm prisma:generate`.
- **Next.js** v16.2.2, App Router. Metadata API supports the proposed structure without changes.
- **Schema.org context** in use: `"@context": "https://schema.org"` (verified in all generators).
- **JSON-LD validator** in admin already recognizes `MedicalOrganization` ([jsonld-validator.ts:413,444](admin/lib/seo/jsonld-validator.ts) — verified). Medical type emissions will not fail current validation.

---

## 12. Reviewer's summary

The codebase is approximately **40% medically-equipped today**. Specifically, the Article JSON-LD already emits `lastReviewed` and `citation`, the Person JSON-LD already emits `hasCredential`, the Organization JSON-LD `@type` is already dynamic via `client.organizationType`, and the existing validator already recognizes `MedicalOrganization`. None of these need to be invented — they need to be **moved to the correct Schema.org location** (`lastReviewed` to `MedicalWebPage`), **upgraded** (`hasCredential` flat strings to structured `EducationalOccupationalCredential` objects), or **conditionally emitted** (the `@type` swap to `Physician` for doctor authors and `MedicalClinic` for clinic clients).

The genuinely new build work is: 13 Prisma fields + 1 model, 1 new generator path (`MedicalWebPage` wrapper), 5 validator gates, 4 admin form additions, 2 new public components, and 2 new trust pages. Estimated 32 hours total.

**The only path that gives the 7 incoming healthcare clients a defensible product on day one is to complete this Phase 1 plan before onboarding.**

---

## ✅ Done

_(items move here as we complete them — leave empty for now)_
