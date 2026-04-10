# Settings UI — Removed Fields Reference

**Location:** Admin → Settings → Modonty Tab  
**Last updated:** 2026-04-08  
**Related file:** `admin/app/(dashboard)/settings/components/settings-form-v2.tsx`  
**Seed file:** `admin/app/(dashboard)/settings/actions/seed-technical-defaults.ts`

---

## Why Fields Were Removed

These fields are **auto-seeded** on first system load via `applyTechnicalDefaults()`. They are correct, stable values based on official standards — the admin does not need to see or edit them in the UI. They are still:

- ✅ **Saved in the database** (Settings table)
- ✅ **Used in all JSON-LD and meta tag generation**
- ✅ **Visible in System tab** (read-only reference with source links)
- ✅ **Resettable** via System tab → "Apply Defaults" button

---

## Removed Fields

### Site Identity Section

| Field | DB Column | Default Value | Standard / Source | Reason Removed |
|---|---|---|---|---|
| Site Name | `siteName` | `Modonty` | Business | Fixed brand name, never changes |
| Site URL | `siteUrl` | `https://modonty.com` | Business | Fixed production URL, never changes |
| Default Author | `siteAuthor` | `Modonty Team` | Business | System-level default, not user-facing |
| Content Language | `inLanguage` | `ar-SA` | ISO 639-1 | Arabic-only platform, never changes |
| Area Served | `orgAreaServed` | `SA` | ISO 3166-1 | Seeded default, adjustable via System tab |

### Contact & Location Section

| Field | DB Column | Default Value | Standard / Source | Reason Removed |
|---|---|---|---|---|
| Contact Type | `orgContactType` | `customer service` | Schema.org | Standard value, auto-seeded |
| Contact Option | `orgContactOption` | `TollFree` | Schema.org | Technical field, not business-relevant |

### Analytics & Search Section

| Field | DB Column | Default Value | Standard / Source | Reason Removed |
|---|---|---|---|---|
| Site Search URL | `orgSearchUrlTemplate` | `https://modonty.com/search?q={search_term_string}` | Schema.org SearchAction | Fixed URL pattern, auto-seeded |

---

## What Remains in the UI (Modonty Tab)

Only fields the admin genuinely needs to fill in or customize:

### Site Identity
- `brandDescription` — Arabic description used in JSON-LD Organization schema

### Branding & Images
- `logoUrl` — Site logo (square, min 112×112px)
- `orgLogoUrl` — Org logo for JSON-LD (falls back to Main Image → Logo)
- `ogImageUrl` — Main OG image (1200×630)
- `altImage` — Image alt text

### Homepage SEO
- `modontySeoTitle` — SEO title for homepage
- `modontySeoDescription` — SEO description for homepage

### Social Presence
- All 8 social profile URLs (Twitter, LinkedIn, Facebook, Instagram, YouTube, TikTok, Pinterest, Snapchat)
- Twitter/X card handles and IDs

### Contact & Location
- `orgContactEmail`, `orgContactTelephone`, `orgContactHoursAvailable`
- Full address (street, city, region, postal code, country)
- Geo coordinates (latitude, longitude)

### Analytics & Search
- GTM container ID + enabled toggle
- Hotjar site ID + enabled toggle

---

## How to Change a Removed Field

1. Go to **Settings → System tab**
2. Find the field in the relevant table (Business Defaults / Technical Defaults)
3. Click **"Apply Defaults"** to reset all seeded values, OR
4. Edit the value directly in `seed-technical-defaults.ts` → `BUSINESS_DEFAULTS` object → redeploy

---

## Auto-Seed Logic

On every Settings page load, `useEffect` checks:

```ts
if (!data.siteName || !data.inLanguage || !data.defaultCharset) {
  await applyTechnicalDefaults();  // seeds all defaults silently
  return getAllSettings();          // reloads with fresh values
}
```

This runs once on first load (empty DB) and is a no-op on subsequent loads.
