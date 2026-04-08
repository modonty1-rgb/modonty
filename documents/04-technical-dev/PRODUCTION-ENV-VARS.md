# Production Environment Variables — Critical Setup

> **READ THIS BEFORE EVERY DEPLOYMENT.**
> These env vars are NOT in git. They must be set manually in Vercel Dashboard for each app.
> Missing any of these = broken features in production.

---

## REVALIDATE_SECRET — CRITICAL ⚠️

**What it does:** Allows the admin app to bust modonty's Next.js `"use cache"` after settings are saved.
Without it → modonty serves stale metadata/JSON-LD for hours after any admin change.

**Must be set in BOTH apps with the SAME value.**

| App | Vercel Project | Variable Name | Value |
|---|---|---|---|
| Admin | `modonty-admin` | `REVALIDATE_SECRET` | `<same-secret>` |
| Modonty | `modonty` | `REVALIDATE_SECRET` | `<same-secret>` |

**How to generate a strong secret:**
```bash
openssl rand -base64 32
```

**Flow when working:**
1. Admin saves settings → calls `POST https://modonty.com/api/revalidate/tag`
2. Modonty verifies secret → calls `revalidateTag("settings", "max")`
3. Modonty re-reads fresh `homeMetaTags` + `jsonLdStructuredData` from DB
4. Next visitor sees updated title, description, JSON-LD

**Dev setup (`.env.local` — never commit):**
```
# admin/.env.local
REVALIDATE_SECRET=modonty-dev-revalidate-2024
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# modonty/.env.local
REVALIDATE_SECRET=modonty-dev-revalidate-2024
```

---

## NEXT_PUBLIC_SITE_URL — Admin App Only

**What it does:** Tells admin which URL to call for modonty cache revalidation.

| Environment | Value |
|---|---|
| Development | `http://localhost:3001` |
| Production | `https://modonty.com` |

> In production, if not set, admin falls back to DB `siteUrl` field which should already be `https://modonty.com`.
> Set it explicitly in Vercel to avoid any ambiguity.

---

## Full Vercel Env Var Checklist

### Admin App (`modonty-admin` Vercel project)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB Atlas production connection string |
| `AUTH_SECRET` | ✅ | NextAuth secret (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | `https://admin.modonty.com` |
| `REVALIDATE_SECRET` | ✅ | Same value as modonty app |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://modonty.com` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ✅ | `modonty` |
| `CLOUDINARY_API_KEY` | ✅ | Server-side only |
| `CLOUDINARY_API_SECRET` | ✅ | Server-side only |
| `RESEND_API_KEY` | ✅ | Email sending |
| `RESEND_FROM` | ✅ | `Modonty <no-reply@admin.modonty.com>` |
| `GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL` | ⚠️ | GSC API access |
| `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` | ⚠️ | GSC API access |
| `GOOGLE_SEARCH_CONSOLE_SITE_URL` | ⚠️ | `https://modonty.com` |

### Modonty App (`modonty` Vercel project)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Same MongoDB Atlas production DB |
| `AUTH_SECRET` | ✅ | NextAuth secret |
| `NEXTAUTH_URL` | ✅ | `https://modonty.com` |
| `REVALIDATE_SECRET` | ✅ | Same value as admin app |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ✅ | Server-side only |
| `CLOUDINARY_API_SECRET` | ✅ | Server-side only |
| `GOOGLE_CLIENT_ID` | ⚠️ | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Google OAuth login |

---

## How Cache Invalidation Works (Full Chain)

```
Admin user clicks "Save & Publish"
        ↓
saveModontySettings() — saves to DB
        ↓
revalidateModontyTag("settings")
        ↓
POST https://modonty.com/api/revalidate/tag
  body: { tag: "settings", secret: REVALIDATE_SECRET }
        ↓
modonty verifies secret ✅
        ↓
revalidateTag("settings", "max")
        ↓
getHomePageSeo() cache invalidated
        ↓
Next request → reads fresh homeMetaTags from DB
        ↓
Visitor sees updated SEO ✅
```

**Same chain triggered by:**
- Save & Publish button (settings page)
- Regenerate cache button (settings page)
- Any entity create/update/delete (articles, categories, clients, etc.)

---

## Where Secrets Are Stored (Dev)

| File | Committed? | Contains |
|---|---|---|
| `admin/.env.local` | ❌ NO | DB_URL, AUTH_SECRET, REVALIDATE_SECRET, NEXT_PUBLIC_SITE_URL |
| `modonty/.env.local` | ❌ NO | DB_URL, AUTH_SECRET, REVALIDATE_SECRET |
| `admin/.env` | ✅ YES | Non-secret defaults only |
| `modonty/.env` | ✅ YES | Non-secret defaults only |

> Never commit `.env.local` files. They are in `.gitignore`.
