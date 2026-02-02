# Admin .env — Deploy-ready checklist

Recheck of your `.env` (lines 2–34) vs codebase + [NextAuth deployment](https://next-auth.js.org/deployment), [Vercel env](https://vercel.com/docs/projects/environment-variables). Use this before deploying admin (e.g. admin.modonty.com).

---

## 1. Missing (add for deploy)

| Variable | Value (production) | Why |
|----------|--------------------|-----|
| **NEXTAUTH_URL** | `https://admin.modonty.com` | **Required.** NextAuth uses it for callbacks (`/api/auth/callback/...`). [Docs](https://next-auth.js.org/deployment#nextauth_url). send-reset-email uses it for reset links; without it, falls back to NEXT_PUBLIC_SITE_URL (modonty.com), which is wrong for admin. |

**Action:** Add `NEXTAUTH_URL=https://admin.modonty.com` to your production .env (or Vercel env).

---

## 2. Remove (unused)

| Variable | Reason |
|----------|--------|
| **RESEND_EMAIL_LOGO_URL** | Not read by admin. send-reset-email uses plain HTML only. |
| **NEXT_PUBLIC_PHONE_NUMBER** | Not referenced in admin. |
| **NEXT_PUBLIC_WHATSAPP_NUMBER** | Not referenced in admin. |

**Action:** Delete these three lines from `.env`.

---

## 3. Fix / verify

| Variable | Issue | Action |
|----------|--------|--------|
| **GOOGLE_SEARCH_CONSOLE_SITE_URL** | Trailing space `https://modonty.com ` | Use `https://modonty.com` (no trailing space). |
| **OPENAI_API_KEY** | Should be full `sk-proj-...` or `sk-...` key. Yours may be truncated. | Confirm in [OpenAI API keys](https://platform.openai.com/api-keys). Seed/AI gen will fail if invalid. |

---

## 4. Present & OK (keep)

| Variable | Status |
|----------|--------|
| DATABASE_URL | MongoDB ✓ |
| CLOUDINARY_URL, NEXT_PUBLIC_CLOUDINARY_*, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | ✓ |
| RESEND_API_KEY, RESEND_FROM | ✓ |
| REVALIDATE_SECRET | ✓ |
| GOOGLE_SEARCH_CONSOLE_* | ✓ (trim SITE_URL) |
| OPENAI_API_KEY, OPENAI_MODEL, OPENAI_TEMPERATURE | ✓ (verify key) |
| UNSPLASH_ACCESS_KEY, NEWS_API_KEY | ✓ |
| NEXT_PUBLIC_SITE_URL | ✓ |
| AUTH_SECRET | ✓ |

---

## 5. Optional (add only if used)

| Variable | When to add |
|----------|-------------|
| **NEXT_PUBLIC_GTM_CONTAINER_ID** | GTM. Use container ID (e.g. `GTM-P43DC5FM`). Not `GTM_ID`. |
| **NEXT_PUBLIC_MODONTY_URL** | Modonty base URL for revalidate. Defaults to `NEXT_PUBLIC_SITE_URL`. |

---

## 6. Deploy checklist (run before deploy)

- [ ] **NEXTAUTH_URL** = `https://admin.modonty.com` (admin app URL; no trailing slash)
- [ ] **NEXT_PUBLIC_SITE_URL** = `https://modonty.com` (main site; single definition, no duplicate)
- [ ] **RESEND_FROM** = verified domain in Resend (e.g. `Modonty <no-reply@modonty.com>`)
- [ ] **DATABASE_URL** = MongoDB (e.g. Atlas `mongodb+srv://...`)
- [ ] Removed: RESEND_EMAIL_LOGO_URL, NEXT_PUBLIC_PHONE_NUMBER, NEXT_PUBLIC_WHATSAPP_NUMBER
- [ ] **GOOGLE_SEARCH_CONSOLE_SITE_URL** has no trailing space
- [ ] **OPENAI_API_KEY** is full key from OpenAI dashboard (if using AI/seed)
- [ ] All keys are production values; no `your_...` placeholders
- [ ] **AUTH_SECRET** is strong (e.g. `openssl rand -base64 32` or equivalent)
- [ ] In Vercel: set same vars in Project → Settings → Environment Variables (Production)

---

## 7. Official references

- [NextAuth deployment](https://next-auth.js.org/deployment) — NEXTAUTH_URL, AUTH_SECRET
- [Vercel env vars](https://vercel.com/docs/projects/environment-variables)
- [Resend send with Node](https://resend.com/docs/send-with-nodejs) — RESEND_API_KEY, RESEND_FROM, domain verification

---

## 8. Minimal production .env (admin.modonty.com)

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

Replace `...` with your real values. Do not commit `.env`; use Vercel (or host) env for production.
