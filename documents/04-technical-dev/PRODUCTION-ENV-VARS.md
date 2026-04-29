# Production Environment Variables — Critical Setup

> **READ THIS BEFORE EVERY DEPLOYMENT.**
> These env vars are NOT in git. They must be set manually in Vercel Dashboard for each app.
> Missing any of these = broken features in production.
>
> **Last verified against code:** 2026-04-29

---

## ⚠️ REVALIDATE_SECRET — CRITICAL

**What it does:** Allows the admin app to bust modonty's Next.js `"use cache"` after settings are saved.
Without it → modonty serves stale metadata/JSON-LD for hours after any admin change.

**Must be set in BOTH admin + modonty with the SAME value.**

| App | Vercel Project | Variable Name | Value |
|---|---|---|---|
| Admin | `modonty-admin` | `REVALIDATE_SECRET` | `<same-secret>` |
| Modonty | `modonty` | `REVALIDATE_SECRET` | `<same-secret>` |

**Generate a strong secret:**
```bash
openssl rand -base64 32
```

---

## 🟦 Admin App — `modonty-admin` Vercel project

### Core
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB Atlas production connection string |
| `AUTH_SECRET` | ✅ | NextAuth secret (min 32 chars) |
| `NEXTAUTH_URL` | ✅ | `https://admin.modonty.com` |
| `REVALIDATE_SECRET` | ✅ | Same value as modonty app |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://modonty.com` |

### Cloudinary
| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Cloud name (public-safe) |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | ✅ | `modonty` |
| `CLOUDINARY_API_KEY` | ✅ | Server-side only |
| `CLOUDINARY_API_SECRET` | ✅ | Server-side only |

### Email
| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Email sending |
| `RESEND_FROM` | ✅ | `Modonty <no-reply@admin.modonty.com>` |

### Google Search Console (uses GSC_MODONTY_* names — NOT old GOOGLE_SEARCH_CONSOLE_*)
| Variable | Required | Notes |
|---|---|---|
| `GSC_MODONTY_CLIENT_EMAIL` | ✅ | `gsc-modonty@modonty.iam.gserviceaccount.com` |
| `GSC_MODONTY_KEY_BASE64` | ✅ | base64-encoded service account JSON |
| `GSC_MODONTY_PROPERTY` | ✅ | `sc-domain:modonty.com` |

### PageSpeed (Site Health + CrUX)
| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_PAGESPEED_API_KEY` | ✅ | 25,000/day quota; both PSI + CrUX APIs enabled |

---

## 🟪 Modonty App — `modonty` Vercel project

### Core
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Same MongoDB Atlas production DB |
| `AUTH_SECRET` | ✅ | NextAuth secret |
| `NEXTAUTH_URL` | ✅ | `https://modonty.com` |
| `REVALIDATE_SECRET` | ✅ | Same value as admin app |

### Cloudinary
| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ | Same as admin |
| `CLOUDINARY_API_KEY` | ✅ | Server-side only |
| `CLOUDINARY_API_SECRET` | ✅ | Server-side only |

### Google OAuth Login
| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_CLIENT_ID` | ⚠️ | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | ⚠️ | Google OAuth login |

### Telegram (per-client notifications)
| Variable | Required | Notes |
|---|---|---|
| `TELEGRAM_CLIENT_BOT_TOKEN` | ✅ | Same value as console (per-client bot, NOT admin global bot) |

---

## 🟧 Console App — `modonty-console` Vercel project

### Core
| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | Same MongoDB Atlas production DB |
| `AUTH_SECRET` | ✅ | NextAuth secret — **must match cookie encryption** |
| `NEXTAUTH_URL` | ✅ | `https://console.modonty.com` |

### Email
| Variable | Required | Notes |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Email sending (support replies) |
| `RESEND_FROM` | ✅ | `Modonty <support@modonty.com>` |

### Google Search Console (per-client Site Health)
| Variable | Required | Notes |
|---|---|---|
| `GSC_MODONTY_CLIENT_EMAIL` | ✅ | Same service account as admin |
| `GSC_MODONTY_KEY_BASE64` | ✅ | Same base64 key as admin |
| `GSC_MODONTY_PROPERTY` | ✅ | `sc-domain:modonty.com` |

### PageSpeed (Site Health Dashboard)
| Variable | Required | Notes |
|---|---|---|
| `GOOGLE_PAGESPEED_API_KEY` | ✅ | Same key as admin |

### Telegram (per-client bot — handles webhook + pairing)
| Variable | Required | Notes |
|---|---|---|
| `TELEGRAM_CLIENT_BOT_TOKEN` | ✅ | Bot token from @BotFather |
| `TELEGRAM_BOT_USERNAME` | ✅ | e.g. `ModontyAlertsBot` (without @) — used in pairing UI t.me/ links |
| `TELEGRAM_WEBHOOK_SECRET` | ✅ | Random token; verifies webhook callbacks from Telegram |

**Webhook setup (one-time after deploy):**
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://console.modonty.com/api/telegram/webhook","secret_token":"<SECRET>"}'
```

**Verify:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

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

**Same chain triggered by:** Save & Publish button · Regenerate cache button · Any entity create/update/delete (articles, categories, clients, etc.)

---

## Where Secrets Are Stored (Dev)

| File | Committed? | Contains |
|---|---|---|
| `admin/.env.local` | ❌ NO | All admin secrets above |
| `modonty/.env.local` | ❌ NO | All modonty secrets above |
| `console/.env.local` | ❌ NO | All console secrets above |
| `admin/.env` | ✅ YES | Non-secret defaults only |
| `modonty/.env` | ✅ YES | Non-secret defaults only |

> ⚠️ Never commit `.env.local` files. They are in `.gitignore`.

---

## ⚠️ Known Issues / Gotchas

1. **`admin/.env` (committed) contains LEGACY names** like `GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY` — these are NOT used by current code. Code reads `GSC_MODONTY_KEY_BASE64`. Don't be confused by stale `.env`.

2. **Console JWTSessionError** — if `AUTH_SECRET` doesn't match the secret used to encrypt browser cookies, every request logs `JWTSessionError`. Fix: clear cookies on `console.modonty.com` after rotating `AUTH_SECRET`.

3. **Telegram bot tokens** — there are TWO Telegram bots:
   - **Admin global bot** (`TELEGRAM_BOT_TOKEN`) — older, used for admin-side notifications (legacy)
   - **Per-client bot** (`TELEGRAM_CLIENT_BOT_TOKEN`) — newer, used by console + modonty for client-specific notifications. **Don't mix them.**

4. **PageSpeed API key restrictions** — when creating the API key in Google Cloud Console → Credentials, the key MUST be allowed for BOTH:
   - PageSpeed Insights API
   - Chrome UX Report API
   If only one is enabled, Stage 12 (Performance) breaks with 403.

5. **GSC service account verification** — `gsc-modonty@modonty.iam.gserviceaccount.com` must be added as a **verified owner** in GSC Property Settings → Users and permissions. Without verified ownership, all GSC API calls return 403.

---

## Quick Verification Commands (after deploy)

```bash
# 1. Verify revalidation works
curl -X POST https://modonty.com/api/revalidate/tag \
  -H "Content-Type: application/json" \
  -d '{"tag":"settings","secret":"<REVALIDATE_SECRET>"}'

# Expected: { "success": true, "tag": "settings" }

# 2. Verify Telegram webhook
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
# Expected: pending_update_count: 0, url: "https://console.modonty.com/api/telegram/webhook"

# 3. Verify GSC connectivity (admin pipeline page works)
# Visit https://admin.modonty.com/search-console — should load real data, not "Failed to load sitemaps"
```
