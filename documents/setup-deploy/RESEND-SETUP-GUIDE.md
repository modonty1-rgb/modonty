# Resend Setup Guide: modonty.com + localhost

Step-by-step guide to configure Resend for **production** (modonty.com) and **local testing** (localhost). Replace `modonty.com` with your actual domain if different.

---

## Part 1: Resend account and API key

### 1.1 Sign up / log in

1. Go to [resend.com](https://resend.com) and sign up or log in.
2. Verify your **account email** (e.g. `dreamtoapp@gmail.com`). You’ll use it for local testing.

### 1.2 Create an API key

1. Open [Resend → API Keys](https://resend.com/api-keys).
2. Click **Create API Key**.
3. **Name:** e.g. `MODONTY Admin` or `MODONTY Local`.
4. **Permission:** **Sending access** (or Full access if you prefer).
5. Click **Add**. **Copy the key** (`re_...`) and store it securely. You won’t see it again.

Use **one key** for both local and production, or create separate keys (e.g. `MODONTY Local` / `MODONTY Prod`) if you want to isolate them.

---

## Part 2: Localhost testing

Use Resend’s **sandbox** so you don’t need a verified domain locally.

### 2.1 Use Resend’s sandbox sender

For local testing you **must** send **from** Resend’s sandbox domain:

- **From address:** `Resend <onboarding@resend.dev>`

You can send **to**:

- Your **Resend account email** (e.g. `dreamtoapp@gmail.com`), or  
- Resend’s test addresses, e.g. `delivered@resend.dev` (always “delivered”), `bounced@resend.dev`, `complained@resend.dev`.  
  See [Resend – Test emails](https://resend.com/docs/dashboard/emails/send-test-emails).

### 2.2 Admin `.env` for localhost

In `admin/.env` (or your root env if admin reads from there):

```env
# Resend – localhost testing
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM="Resend <onboarding@resend.dev>"

# Base URL for reset links (must match where you run the app)
NEXTAUTH_URL=http://localhost:3000
# or
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`sendResetEmail` uses `NEXTAUTH_URL` or `NEXT_PUBLIC_SITE_URL` to build the reset link. On localhost, that should be `http://localhost:3000` (or your dev port).

### 2.3 Admin user email for testing

- Create or use an admin user whose email is **your Resend account email** or **`delivered@resend.dev`**.
- Request “Forgot password” with that email.
- Check inbox (and spam) for the reset email. Links will point to `http://localhost:3000/reset-password?token=...`.

### 2.4 Quick checklist (localhost)

- [ ] `RESEND_API_KEY` set in `admin/.env`
- [ ] `RESEND_FROM="Resend <onboarding@resend.dev>"`
- [ ] `NEXTAUTH_URL` or `NEXT_PUBLIC_SITE_URL` = `http://localhost:3000`
- [ ] Admin user email = Resend account email or `delivered@resend.dev`
- [ ] Run admin app (`pnpm dev` in admin), open `/forgot-password`, submit email, check mail

---

## Part 3: Production (modonty.com)

To send **from** `@modonty.com` (e.g. `no-reply@modonty.com`), you must **verify** the domain in Resend.

### 3.1 Add domain in Resend

1. Go to [Resend → Domains](https://resend.com/domains).
2. Click **Add Domain**.
3. Enter **`modonty.com`** (no `www`, no `https://`).
4. Click **Add**.

### 3.2 Add DNS records

Resend will show the exact records to add. Typical setup:

1. **SPF (TXT)**  
   - **Host:** `send` (or `send.modonty.com` depending on Resend’s UI).  
   - **Value:** Resend’s SPF string, e.g. `v=spf1 include:amazonses.com ~all`.

2. **DKIM (TXT)**  
   - **Host:** Resend gives you a name (e.g. `resend._domainkey` or similar).  
   - **Value:** Resend’s DKIM value (long string).

3. **MX (optional, for bounces)**  
   - **Host:** `send` (or as shown).  
   - **Value:** Resend’s MX target (e.g. `feedback-smtp.region.amazonses.com`).

4. **DMARC (recommended)**  
   - **Host:** `_dmarc`.  
   - **Value:** e.g. `v=DMARC1; p=none; rua=mailto:dmarc@modonty.com`  
   Use your real email for `rua`.

Add these in your **DNS provider** (Cloudflare, Route 53, Namecheap, etc.). Resend has guides per provider: [Resend – Domains / DNS](https://resend.com/docs/knowledge-base/introduction).

### 3.3 Verify domain

1. After saving DNS, wait **5–15 minutes** (sometimes longer).
2. In Resend → Domains, click **Verify** for `modonty.com`.
3. Once **Verified**, you can use any `@modonty.com` address as “from”.

### 3.4 Production “from” address

Use a clear sender, e.g.:

- `Modonty <no-reply@modonty.com>`

### 3.5 Admin `.env` for production

```env
RESEND_API_KEY=re_your_production_key
RESEND_FROM="Modonty <no-reply@modonty.com>"

NEXTAUTH_URL=https://modonty.com
# or
NEXT_PUBLIC_SITE_URL=https://modonty.com
```

Reset links will use `https://modonty.com`.

### 3.6 Quick checklist (production)

- [ ] Domain `modonty.com` added in Resend → Domains
- [ ] SPF, DKIM (and optionally MX, DMARC) added in DNS
- [ ] Domain shows **Verified** in Resend
- [ ] `RESEND_FROM="Modonty <no-reply@modonty.com>"`
- [ ] `NEXTAUTH_URL` / `NEXT_PUBLIC_SITE_URL` = `https://modonty.com`
- [ ] Production env has `RESEND_API_KEY`

---

## Part 4: Switching between localhost and production

### Option A: One `.env`, manual swap

- **Local:** use `RESEND_FROM="Resend <onboarding@resend.dev>"` and `NEXTAUTH_URL=http://localhost:3000`.
- **Production:** use `RESEND_FROM="Modonty <no-reply@modonty.com>"` and `NEXTAUTH_URL=https://modonty.com`.  
Remember to switch before deploy.

### Option B: Separate env files

- **Local:** `admin/.env.local` with sandbox + localhost URLs.
- **Production:** `admin/.env.production` or your host’s env (Vercel, etc.) with modonty.com + production `RESEND_FROM`.

Next.js loads `.env.local` in development and `.env.production` in production, so you can keep both configured.

---

## Part 5: Verify it works

### Localhost

1. `cd admin && pnpm dev`.
2. Open `http://localhost:3000/forgot-password`.
3. Enter the admin email (Resend account or `delivered@resend.dev`).
4. Check inbox/spam for “Reset your admin password”.
5. Click link → should open `http://localhost:3000/reset-password?token=...`.

### Production

1. Deploy with production env (modonty.com + `no-reply@modonty.com`).
2. Open `https://modonty.com/forgot-password` (or your real URL).
3. Request reset for an admin user.
4. Check mail; link should point to `https://modonty.com/reset-password?token=...`.

### Logs

The `sendResetEmail` helper logs:

- **Success:** `[sendResetEmail] Sent: { id: '...', to: '...' }`
- **Error:** `[sendResetEmail] Resend error: { name, message, statusCode, to }`

Check the **server** logs (terminal or hosting logs) when testing.

---

## Reference

- [Resend – Send with Node.js](https://resend.com/docs/send-with-nodejs)
- [Resend – Domains](https://resend.com/domains)
- [Resend – API Keys](https://resend.com/api-keys)
- [Resend – Test emails](https://resend.com/docs/dashboard/emails/send-test-emails)
