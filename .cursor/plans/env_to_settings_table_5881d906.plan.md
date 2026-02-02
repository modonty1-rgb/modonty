---
name: Env to Settings Table
overview: "Identify which admin .env variables can be moved to the Settings table: keep secrets and infra in .env; move non-secret, editable site/organization config into the existing Settings singleton (with schema in dataLayer and UI in admin/settings)."
todos: []
isProject: false
---

# Move .env Variables to Settings Table

## Current state

- **Settings table** ([dataLayer/prisma/schema/schema.prisma](dataLayer/prisma/schema/schema.prisma) `Settings` model): singleton storing SEO limits, GTM (gtmContainerId, gtmEnabled), HOTjar, and social URLs. Admin reads/writes via [admin/app/(dashboard)/settings/actions/settings-actions.ts](admin/app/(dashboard)/settings/actions/settings-actions.ts).
- **.env** ([admin/.env](admin/.env)): 40+ variables across DB/auth, GTM, Cloudinary, Google Search Console, Resend, site config, OpenAI, external APIs, and a block explicitly labeled "Default Value tab (Modonty setting)" (lines 98–133).

---

## Recommendation: Keep in .env (do not move)

These are secrets, infra, or build-time and must stay in `.env`:


| Category                  | Variables                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **DB & Auth**             | `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `NEXTAUTH_URL`                                            |
| **Cloudinary (server)**   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_URL`                    |
| **Google Search Console** | `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL`, `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY`, `GOOGLE_SEARCH_CONSOLE_SITE_URL` |
| **Resend**                | `RESEND_API_KEY`, `RESEND_FROM`                                                                             |
| **OpenAI**                | `OPENAI_API_KEY`                                                                                            |
| **External APIs**         | `UNSPLASH_ACCESS_KEY`, `NEWS_API_KEY`                                                                       |
| **Other**                 | `REVALIDATE_SECRET` (if used), `NODE_ENV`                                                                   |


**Rationale:** API keys, private keys, and connection strings must not live in the DB or be editable in the UI. They stay in env.

---

## Already backed by Settings (env as fallback only)

- **NEXT_PUBLIC_GTM_CONTAINER_ID** — Settings already has `gtmContainerId`; [getGTMSettings.ts](admin/helpers/gtm/getGTMSettings.ts) uses DB first, then env. You can stop setting this in .env once the value is in the settings UI/DB.

---

## Good candidates to move to Settings table

All are **non-secret**, **editable site/organization config**, and many are already documented in .env as "Default Value tab (Modonty setting)". Moving them allows editing from the admin Settings UI and a single source of truth (DB) with optional .env fallback for initial/seed values.

**NEXT_PUBLIC_SITE_URL:** Move to Settings as `siteUrl` for the admin UI and DB-backed getters, but **keep a copy in .env** — it is used in other places (e.g. other apps, build-time, modonty/console). Resolution: use Settings `siteUrl` first, then fall back to `process.env.NEXT_PUBLIC_SITE_URL`.


| .env variable                         | Purpose                               | Suggested Settings field         |
| ------------------------------------- | ------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                | Canonical site URL (keep in .env too) | `siteUrl` (String?)              |
| `NEXT_PUBLIC_SITE_NAME`               | Site/brand name                       | `siteName` (String?)             |
| `NEXT_PUBLIC_BRAND_DESCRIPTION`       | Organization/WebSite description      | `brandDescription` (String?)     |
| `NEXT_PUBLIC_TWITTER_SITE`            | twitter:site                          | `twitterSite` (String?)          |
| `NEXT_PUBLIC_TWITTER_CREATOR`         | twitter:creator                       | `twitterCreator` (String?)       |
| `NEXT_PUBLIC_TWITTER_SITE_ID`         | twitter:site:id                       | `twitterSiteId` (String?)        |
| `NEXT_PUBLIC_TWITTER_CREATOR_ID`      | twitter:creator:id                    | `twitterCreatorId` (String?)     |
| `NEXT_PUBLIC_ORG_CONTACT_TYPE`        | ContactPoint contactType              | `orgContactType` (String?)       |
| `NEXT_PUBLIC_ORG_CONTACT_EMAIL`       | ContactPoint email                    | `orgContactEmail` (String?)      |
| `NEXT_PUBLIC_ORG_CONTACT_TELEPHONE`   | ContactPoint telephone                | `orgContactTelephone` (String?)  |
| `NEXT_PUBLIC_ORG_AREA_SERVED`         | ContactPoint areaServed               | `orgAreaServed` (String?)        |
| `NEXT_PUBLIC_ORG_STREET_ADDRESS`      | PostalAddress streetAddress           | `orgStreetAddress` (String?)     |
| `NEXT_PUBLIC_ORG_ADDRESS_LOCALITY`    | addressLocality                       | `orgAddressLocality` (String?)   |
| `NEXT_PUBLIC_ORG_ADDRESS_REGION`      | addressRegion                         | `orgAddressRegion` (String?)     |
| `NEXT_PUBLIC_ORG_ADDRESS_COUNTRY`     | addressCountry                        | `orgAddressCountry` (String?)    |
| `NEXT_PUBLIC_ORG_POSTAL_CODE`         | postalCode                            | `orgPostalCode` (String?)        |
| `NEXT_PUBLIC_ORG_GEO_LATITUDE`        | Geo latitude                          | `orgGeoLatitude` (Float?)        |
| `NEXT_PUBLIC_ORG_GEO_LONGITUDE`       | Geo longitude                         | `orgGeoLongitude` (Float?)       |
| `NEXT_PUBLIC_ORG_SEARCH_URL_TEMPLATE` | WebSite SearchAction                  | `orgSearchUrlTemplate` (String?) |
| `NEXT_PUBLIC_ORG_LOGO_URL`            | Organization logo (if used)           | `orgLogoUrl` (String?)           |
| `NEXT_PUBLIC_SITE_AUTHOR`             | Default author (if used)              | `siteAuthor` (String?)           |
| `NEXT_PUBLIC_THEME_COLOR`             | theme-color meta (if used)            | `themeColor` (String?)           |


**Note:** `NEXT_PUBLIC_*` vars are currently read at build/runtime in many places (modonty setting actions, get-live-preview-seo, build-meta-from-page, lib/seo, etc.). After moving to Settings, those call sites must be updated to use a **getter that reads from DB** (and optionally falls back to env for migration or seed). Because Next.js inlines `NEXT_PUBLIC_*` at build time, values stored only in the DB cannot be used in client components unless exposed via an API or server-rendered props.

---

## Optional / later

- **OPENAI_MODEL**, **OPENAI_TEMPERATURE** — Non-secret; could be moved to Settings as "AI defaults" if you want them editable in the admin UI. Today they are read in [lib/openai-article-generator.ts](admin/lib/openai-article-generator.ts) and [lib/openai-seed.ts](admin/lib/openai-seed.ts).
- **NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME**, **NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET** — Public but used in many places (client upload, server utils). Moving to DB would require a way to expose them (e.g. API or server-only config). Usually kept in .env for simplicity.

---

## Implementation notes (if you implement the move)

1. **Schema** — Add the new optional fields to the `Settings` model in [dataLayer/prisma/schema/schema.prisma](dataLayer/prisma/schema/schema.prisma). The schema is in the shared `dataLayer` package; changing it is a cross-package change.
2. **Admin settings only (your scope)** — In admin: extend [settings-actions.ts](admin/app/(dashboard)/settings/actions/settings-actions.ts) (interfaces + DEFAULT_SETTINGS + getAllSettings/updateAllSettings), add UI in [settings-form.tsx](admin/app/(dashboard)/settings/components/settings-form.tsx) for the new fields (e.g. "Site & organization" section).
3. **Consumers** — Replace `process.env.NEXT_PUBLIC_*` with a server-side getter that loads Settings and falls back to env (e.g. `siteUrl = settings.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL`). Keep `NEXT_PUBLIC_SITE_URL` in .env for use elsewhere. Update:
  - [get-live-preview-seo.ts](admin/app/(dashboard)/modonty/setting/actions/get-live-preview-seo.ts)
  - [generate-modonty-page-seo.ts](admin/app/(dashboard)/modonty/setting/actions/generate-modonty-page-seo.ts)
  - [build-meta-from-page.ts](admin/app/(dashboard)/modonty/setting/helpers/build-meta-from-page.ts)
  - Other libs under [admin/lib/seo](admin/lib/seo) and any route that uses these env vars.
4. **Public vs server** — Values that must be available in the browser (e.g. for meta tags rendered on client) need to be passed from server (e.g. layout/page data or a small API) if they come only from DB.

---

## Summary


| Action                            | Variables                                                                                                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Keep in .env**                  | DB, Auth, Cloudinary server, GSC, Resend, OpenAI key, Unsplash, News, REVALIDATE_SECRET                                                                                                  |
| **Already in Settings**           | GTM container ID (env is fallback only)                                                                                                                                                  |
| **Move to Settings (candidates)** | Site URL/name/brand, Twitter handles/IDs, Org contact/address/geo/search URL/logo, optional site author and theme color. Keep `NEXT_PUBLIC_SITE_URL` in .env as a copy for other places. |
| **Optional / later**              | OPENAI_MODEL/TEMPERATURE, Cloudinary public vars                                                                                                                                         |


If you want to proceed with the move, the next step is to add the new fields to the Settings schema and then extend the admin settings UI and actions, and finally switch consumers to the DB-backed getter with env fallback.