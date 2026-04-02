# Admin .env – Deploy-Ready Checklist

Verify `.env` configuration before deploying admin to production (e.g., admin.modonty.com).

---

## 1. Missing (Add for Deploy)

| Variable | Production Value | Why |
|----------|------------------|-----|
| **NEXTAUTH_URL** | `https://admin.modonty.com` | **Required.** NextAuth uses it for callbacks. `send-reset-email` uses it for reset links; without it, falls back to NEXT_PUBLIC_SITE_URL (wrong for admin). |

**Action:** Add `NEXTAUTH_URL=https://admin.modonty.com` to production `.env`.

---

## 2. Remove (Unused)

| Variable | Reason |
|----------|--------|
| **RESEND_EMAIL_LOGO_URL** | Not read by admin |
| **NEXT_PUBLIC_PHONE_NUMBER** | Not referenced in admin |
| **NEXT_PUBLIC_WHATSAPP_NUMBER** | Not referenced in admin |

**Action:** Delete these three lines from `.env`.

---

## 3. Fix / Verify

| Variable | Issue | Action |
|----------|-------|--------|
| **GOOGLE_SEARCH_CONSOLE_SITE_URL** | Trailing space: `https://modonty.com ` | Use `https://modonty.com` (no trailing space) |
| **OPENAI_API_KEY** | Should be full `sk-proj-...` or `sk-...` key. May be truncated. | Confirm in [OpenAI API keys](https://platform.openai.com/api-keys). Seed/AI gen will fail if invalid. |

---

## 4. Present & OK (Keep)

- DATABASE_URL (MongoDB)
- CLOUDINARY_* (URL, CLOUD_NAME, UPLOAD_PRESET, API_KEY, API_SECRET)
- RESEND_API_KEY, RESEND_FROM
- REVALIDATE_SECRET
- GOOGLE_SEARCH_CONSOLE_* (after trimming SITE_URL)
- OPENAI_API_KEY, OPENAI_MODEL, OPENAI_TEMPERATURE (after verifying key)
- UNSPLASH_ACCESS_KEY, NEWS_API_KEY
- NEXT_PUBLIC_SITE_URL
- AUTH_SECRET

---

## 5. Optional (Add Only If Used)

| Variable | When |
|----------|------|
| **NEXT_PUBLIC_GTM_CONTAINER_ID** | GTM. Use container ID (e.g., `GTM-P43DC5FM`), not `GTM_ID`. |
| **NEXT_PUBLIC_MODONTY_URL** | Modonty base URL for revalidate. Defaults to `NEXT_PUBLIC_SITE_URL`. |

---

## Pre-Deploy Checklist

- [ ] **NEXTAUTH_URL** = `https://admin.modonty.com`
- [ ] **NEXT_PUBLIC_SITE_URL** = `https://modonty.com`
- [ ] **RESEND_FROM** = verified domain in Resend (e.g., `Modonty <no-reply@modonty.com>`)
- [ ] **DATABASE_URL** = MongoDB (e.g., Atlas)
- [ ] Removed: RESEND_EMAIL_LOGO_URL, NEXT_PUBLIC_PHONE_NUMBER, NEXT_PUBLIC_WHATSAPP_NUMBER
- [ ] **GOOGLE_SEARCH_CONSOLE_SITE_URL** has no trailing space
- [ ] **OPENAI_API_KEY** is full key from OpenAI dashboard
- [ ] No `your_...` placeholders; all production values
- [ ] **AUTH_SECRET** is strong (e.g., `openssl rand -base64 32`)
- [ ] In Vercel: set same vars in Project → Settings → Environment Variables (Production)

---

## Minimal Production .env (admin.modonty.com)

```env
# Required
DATABASE_URL=mongodb+srv://...
AUTH_SECRET=...
NEXTAUTH_URL=https://admin.modonty.com
NEXT_PUBLIC_SITE_URL=https://modonty.com

# Cloudinary
CLOUDINARY_URL=cloudinary://...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=modonty
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM="Modonty <no-reply@modonty.com>"

# Modonty revalidate
REVALIDATE_SECRET=...

# GSC, OpenAI, Unsplash, News API
GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL=...
GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY="..."
GOOGLE_SEARCH_CONSOLE_SITE_URL=https://modonty.com
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.2
UNSPLASH_ACCESS_KEY=...
NEWS_API_KEY=...
```

Replace `...` with real production values. Do not commit `.env`; use host env (Vercel, etc.) for production.
