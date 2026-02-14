## Product Requirements Document (PRD)
### Feature: Facebook Business Page Simulation for Client Detail
### Owner: Product / Marketing
### Status: Draft

---

## 1. Background & Problem

Modonty exposes a rich client detail page (`/clients/[slug]`) for organizations.  
Marketing wants to onboard clients quickly by “mirroring” their existing **Facebook Business Page** so that:

- The client page feels familiar to end users who already know the brand from Facebook.
- The marketing team can follow a clear recipe to configure client data based on the client’s Facebook page fields.
- Social sharing (especially on Facebook) produces high‑quality previews (image, title, description) aligned with the brand.

Today, the platform already supports:

- Hero with cover, logo, CTAs, and stats.
- Tabs (`overview`, `articles`, `about`).
- SEO meta + JSON‑LD for clients.

But there is **no single productized spec** describing how to configure a client so the result is “Facebook‑like” in a predictable, repeatable way.

---

## 2. Goal & Non‑Goals

### Goal

Provide a **repeatable configuration standard** so that any Modonty client (starting with Elmazny Marketing Agency) can have a detail page that:

- Visually and structurally resembles a **Facebook Business Page** (sections, hero, CTAs, info layout).
- Produces correct **Open Graph** meta for Facebook sharing.
- Uses **only existing fields and components** in the client detail page.

### Non‑Goals

- No new components, routes, or backend models.
- No theming/branding changes to copy Facebook UI.
- No new SEO engine or JSON‑LD generators.
- No automatic import/scraping from Facebook (manual configuration only).

---

## 3. Users & Use Cases

### Primary Users

- **Internal Marketing / Ops**: configure client records to match their existing Facebook presence.
- **Client Success / Account Managers**: use the spec as a checklist when onboarding new clients.

### Key Use Cases

1. **Onboard a new client with an existing Facebook Page**
   - Given a public Facebook Business Page (e.g. `https://www.facebook.com/abdelrhmanelmazny`),
   - When the operator fills Modonty client fields according to this spec,
   - Then the resulting `/clients/[slug]` page looks and behaves like a professional Facebook‑style profile.

2. **Ensure share previews match Facebook expectations**
   - When the client page URL is shared on Facebook,
   - Then the OG image, title, and description reflect the configured brand and cover, following Facebook and OGP best practices.

3. **Standardize structure across clients**
   - Different team members can configure clients but always get the same layout logic (hero, tabs, about, contact, social proof) without guesswork.

---

## 4. High‑Level Solution

- Use the **existing client detail page** at `modonty/app/clients/[slug]/` and its components:
  - `client-hero.tsx`
  - `client-about.tsx`
  - `client-contact.tsx`
  - `client-tabs-wrapper.tsx`
  - `share-client-button.tsx`
  - `client-stats.ts`
- Define a **Facebook → Modonty mapping** for:
  - Profile picture, cover image, page name, username/URL.
  - About text, contact info, location.
  - CTA button behavior.
  - Tabs (Home/About/Posts) ↔ `overview` / `articles` / `about`.
  - Social proof (likes/followers, views, content volume).
- Document a **concrete example** for **Elmazny Marketing Agency**.
- Ensure this configuration uses the existing SEO system:
  - `seoTitle`, `seoDescription`, `ogImageMedia`, `logoMedia`, etc.
  - Meta tags defined in `CLIENT-META-TAGS-RESEARCH.md` and related specs.

No code or schema changes are required; the deliverable is a **clear configuration guide and checklist**.

---

## 5. Detailed Requirements

### 5.1 Facebook → Modonty Mapping (Functional)

The system **must** support the following conceptual mapping via configuration:

1. **Profile Picture**
   - Source: Facebook profile image.
   - Modonty field: `logoMedia` (image + alt).
   - Display: Circular logo in `client-hero.tsx` hero area.
   - Also used in Organization JSON‑LD as `logo`.

2. **Cover Photo**
   - Source: Facebook cover/banner.
   - Modonty field: `ogImageMedia` (optional `twitterImageMedia`).
   - Display: Hero background in `client-hero.tsx`.
   - Requirements:
     - Recommended size ≈ `1200x630` (Facebook/OG best practice).
     - Reasonable file size (< 300KB recommended).
     - Alt text explaining brand context.

3. **Page Name & Username**
   - Facebook: Page Name + `@username` / short URL.
   - Modonty:
     - `name` → visible brand name in hero and metadata.
     - `slug` → forms `/clients/[slug]`, behaves like `@username` for URL.
     - `url` → external official website.

4. **About / Page Info**
   - Facebook “About” text, intro, details.
   - Modonty fields:
     - `description` (longer org description)
     - `seoDescription` (short meta)
     - `businessBrief`, `targetAudience`, `contentPriorities`
   - Displayed primarily in `client-about.tsx` and “About” tab.

5. **Contact Info**
   - Facebook: website, phone, email, address, hours.
   - Modonty:
     - `url`, `email`, `phone`, `contactType`
     - Address fields: `addressCity`, `addressRegion`, `addressCountry`, `addressStreet`, `addressPostalCode`
     - Optional: `addressLatitude`, `addressLongitude`
   - Displayed in `client-contact.tsx` and about sections.
   - Used in JSON‑LD `ContactPoint` and `PostalAddress`.

6. **CTA Button (Call To Action)**
   - Facebook: “Call now”, “Contact us”, “Book now”, etc.
   - Modonty:
     - Primary CTA: “Visit Website” in `client-hero.tsx` (uses `url`).
     - Secondary CTAs: Follow / Share (`share-client-button.tsx`).
   - Requirement: Hero must always show a prominent website CTA if `url` exists.

7. **Tabs / Navigation**
   - Facebook tabs: Home, About, Posts, Reviews, etc.
   - Modonty tabs:
     - `overview` → conceptual equivalent of Home.
     - `articles` → conceptual equivalent of Posts.
     - `about` → equivalent of About.
   - Requirement: Content in each Modonty tab must be configurable so it semantically matches the Facebook section.

8. **Social Proof**
   - Facebook: likes, followers, reviews, reactions.
   - Modonty:
     - Followers: `ClientLike` count.
     - Views: `ClientView` count.
     - Content volume: number of `Article` records linked to the client.
   - Display: Stats in `client-hero.tsx` via `client-stats.ts`.

9. **Social Links**
   - Facebook: links to Instagram, website, etc.
   - Modonty:
     - `sameAs` array: includes at least the Facebook Page URL and any other official profiles (LinkedIn, Instagram, X).
   - Usage:
     - JSON‑LD: `Organization.sameAs`.
     - Optional icon links in `client-hero.tsx` or `client-contact.tsx`.

### 5.2 SEO / Meta Requirements

- When the above fields are populated, the existing SEO layer **must**:
  - Generate valid Open Graph tags for Facebook:
    - `og:title`, `og:description`, `og:url`, `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`.
  - Generate Twitter cards:
    - `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`.
  - Generate Organization JSON‑LD with:
    - Name, legal name, URL, logo, sameAs, contactPoint, address, optional VAT/Tax IDs.

- No new SEO code is required; the PRD assumes current behavior already matches `CLIENT-META-TAGS-RESEARCH.md`.

### 5.3 Elmazny Example (Configuration Scenario)

For the client “Elmazny Marketing Agency”:

- Populate all required fields exactly as outlined in the design spec:
  - `name`, `legalName` (if known), `slug`.
  - `logoMedia`, `ogImageMedia` (and optional `twitterImageMedia`).
  - `seoTitle`, `seoDescription`, `description`.
  - `businessBrief`, `targetAudience`, `contentPriorities`.
  - `url`, `email`, `phone`, `contactType`.
  - Address fields for city/region/country (Saudi Arabia defaults where applicable).
  - `sameAs` including `https://www.facebook.com/abdelrhmanelmazny`.

Acceptance criterion: after configuration, the Elmazny client page:

- Has hero + cover + logo strongly resembling their Facebook presence.
- Shows correct brand name, description, contact info, and social links.
- Produces high‑quality Facebook share previews.

---

## 6. UX Requirements (Behavioral)

- Hero layout must remain consistent with current LinkedIn‑style design; the spec **only** constrains *what* goes into each slot.
- Copy (labels, Arabic text) remains as currently implemented; the PRD doesn’t introduce new text strings.
- The configuration guide must be **Arabic‑first** with concise English hints to match the existing documentation style.

---

## 7. Acceptance Criteria

1. **Mapping Coverage**
   - [ ] Every core Facebook Business Page element has a documented Modonty mapping.
   - [ ] Internal teams can configure any new client using that mapping without code changes.

2. **Elmazny Scenario**
   - [ ] With fields populated per the example, `/clients/[elmazny-slug]` presents:
     - Hero with proper logo and cover.
     - Tabs aligned to Home/Posts/About.
     - About + contact + location correctly filled.
     - Social proof stats visible when data exists.
   - [ ] Facebook share preview shows correct OG title/description/image.

3. **Docs**
   - [ ] `FACEBOOK-BUSINESS-PAGE-SIMULATION.md` (design/spec) is up‑to‑date and matches this PRD.
   - [ ] Marketing can follow the checklist without needing engineering support.

---

## 8. Risks & Constraints

- **Data Quality**: If the Facebook page is incomplete or outdated, the mirrored configuration will also be incomplete.
- **Manual Process**: All mapping is manual; incorrect data entry can break the expectation of “identical” behavior.
- **Platform Differences**: Some Facebook concepts (e.g., built‑in reviews) have no direct 1:1 equivalent; Modonty approximates them via stats and articles.

---

## 9. Out of Scope / Future Work

- Automatic import/scraping of Facebook Page data.
- New UI to preview Facebook vs Modonty side‑by‑side.
- Additional client tabs (e.g., Reviews, Photos) as separate features.
- Admin presets or wizards that auto‑fill fields from a single Facebook URL.

