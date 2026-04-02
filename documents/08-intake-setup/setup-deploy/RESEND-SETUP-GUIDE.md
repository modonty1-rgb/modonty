# Resend Setup Guide: Localhost & Production

Step-by-step guide for Resend configuration on localhost and modonty.com.

---

## Part 1: Resend Account & API Key

### 1.1 Sign up / Log In

1. Go to [resend.com](https://resend.com) and sign up or log in.
2. Verify your **account email** (e.g., `dreamtoapp@gmail.com`).

### 1.2 Create API Key

1. Open [Resend → API Keys](https://resend.com/api-keys).
2. Click **Create API Key**.
3. Name: e.g., `MODONTY Admin` or `MODONTY Local`.
4. Permission: **Sending access** or Full access.
5. Click **Add**. **Copy the key** (`re_...`) and store securely.

Use **one key** for both local and production, or create separate keys if you want to isolate them.

---

## Part 2: Localhost Testing

Use Resend's **sandbox** (no verified domain needed).

### 2.1 Sandbox Sender

For local testing, send **from** Resend's sandbox domain:
- **From address:** `Resend <onboarding@resend.dev>`

Send **to**:
- Your Resend account email (e.g., `dreamtoapp@gmail.com`), or
- Resend's test addresses (e.g., `delivered@resend.dev`, `bounced@resend.dev`)

See [Resend – Test emails](https://resend.com/docs/dashboard/emails/send-test-emails).

### 2.2 Admin `.env` for Localhost

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM="Resend <onboarding@resend.dev>"

NEXTAUTH_URL=http://localhost:3000
```

### 2.3 Admin User Email for Testing

- Create or use admin user with email = your Resend account email or `delivered@resend.dev`.
- Request "Forgot password" with that email.
- Check inbox/spam for reset email. Links point to `http://localhost:3000/reset-password?token=...`.

### 2.4 Localhost Checklist

- [ ] `RESEND_API_KEY` set in `admin/.env`
- [ ] `RESEND_FROM="Resend <onboarding@resend.dev>"`
- [ ] `NEXTAUTH_URL=http://localhost:3000`
- [ ] Admin user email = Resend account email or `delivered@resend.dev`
- [ ] Run admin app (`pnpm dev`), test forgot-password flow

---

## Part 3: Production (modonty.com)

To send **from** `@modonty.com` (e.g., `no-reply@modonty.com`), **verify** the domain in Resend.

### 3.1 Add Domain in Resend

1. Go to [Resend → Domains](https://resend.com/domains).
2. Click **Add Domain**.
3. Enter **`modonty.com`** (no `www`, no `https://`).
4. Click **Add**.

### 3.2 Add DNS Records

Resend shows exact records. Typical setup:

1. **SPF (TXT)**
   - Host: `send` (or `send.modonty.com`)
   - Value: Resend's SPF string (e.g., `v=spf1 include:amazonses.com ~all`)

2. **DKIM (TXT)**
   - Host: Resend gives (e.g., `resend._domainkey`)
   - Value: Resend's DKIM value (long string)

3. **MX (optional, for bounces)**
   - Host: `send`
   - Value: Resend's MX target

4. **DMARC (recommended)**
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@modonty.com`

Add in your **DNS provider** (Cloudflare, Route 53, Namecheap, etc.). Resend has guides per provider: [Resend – Domains / DNS](https://resend.com/docs/knowledge-base/introduction).

### 3.3 Verify Domain

1. After saving DNS, wait **5–15 minutes**.
2. In Resend → Domains, click **Verify** for `modonty.com`.
3. Once **Verified**, use any `@modonty.com` address as "from".

### 3.4 Production "From" Address

Use a clear sender:
- `Modonty <no-reply@modonty.com>`

### 3.5 Admin `.env` for Production

```env
RESEND_API_KEY=re_your_production_key
RESEND_FROM="Modonty <no-reply@modonty.com>"
NEXTAUTH_URL=https://modonty.com
```

Reset links will use `https://modonty.com`.

### 3.6 Production Checklist

- [ ] Domain `modonty.com` added in Resend → Domains
- [ ] SPF, DKIM (and optionally MX, DMARC) added in DNS
- [ ] Domain shows **Verified** in Resend
- [ ] `RESEND_FROM="Modonty <no-reply@modonty.com>"`
- [ ] `NEXTAUTH_URL=https://modonty.com`
- [ ] Production env has `RESEND_API_KEY`

---

## Part 4: Switching Between Localhost & Production

### Option A: Manual Swap

- **Local:** `RESEND_FROM="Resend <onboarding@resend.dev>"` and `NEXTAUTH_URL=http://localhost:3000`
- **Production:** `RESEND_FROM="Modonty <no-reply@modonty.com>"` and `NEXTAUTH_URL=https://modonty.com`

Remember to switch before deploy.

### Option B: Separate Env Files

- **Local:** `admin/.env.local` (sandbox + localhost)
- **Production:** `admin/.env.production` or host env

Next.js loads `.env.local` in dev and `.env.production` in production.

---

## Part 5: Verify It Works

### Localhost

1. `cd admin && pnpm dev`.
2. Open `http://localhost:3000/forgot-password`.
3. Enter admin email (Resend account or `delivered@resend.dev`).
4. Check inbox/spam for "Reset your admin password".
5. Click link → should open `http://localhost:3000/reset-password?token=...`.

### Production

1. Deploy with production env (modonty.com + `no-reply@modonty.com`).
2. Open `https://modonty.com/forgot-password`.
3. Request reset for admin user.
4. Check mail; link should point to `https://modonty.com/reset-password?token=...`.

### Logs

The `sendResetEmail` helper logs:
- **Success:** `[sendResetEmail] Sent: { id: '...', to: '...' }`
- **Error:** `[sendResetEmail] Resend error: { name, message, statusCode, to }`

Check **server logs** (terminal or hosting logs) when testing.

---

## Reference

- [Resend – Send with Node.js](https://resend.com/docs/send-with-nodejs)
- [Resend – Domains](https://resend.com/domains)
- [Resend – API Keys](https://resend.com/api-keys)
- [Resend – Test emails](https://resend.com/docs/dashboard/emails/send-test-emails)
