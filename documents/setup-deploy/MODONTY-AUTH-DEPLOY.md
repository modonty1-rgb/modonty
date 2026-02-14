# Modonty — Auth.js deployment (avoid JWT errors)

So you **don’t face** `JWTSessionError` / **no matching decryption secret** on deployment, follow the [Auth.js Deployment](https://authjs.dev/getting-started/deployment) guide.

## 1. Set `AUTH_SECRET` in deployment

- **Required.** Auth.js uses it to encrypt cookies and JWT. At least 32 characters.
- **Local:** set in `modonty/.env` or `modonty/.env.local`.
- **Production:** set in your host’s env (e.g. Vercel → Project → Settings → Environment Variables).

Generate a secret:

```bash
pnpm exec auth secret
# or
openssl rand -base64 33
```

Add it as `AUTH_SECRET` in your deployment environment (Production, and Preview if you use auth there).

## 2. Keep `AUTH_SECRET` consistent

- **Do not change** `AUTH_SECRET` after you have real users. Changing it invalidates existing JWTs and causes **“no matching decryption secret”** when decrypting old cookies.
- If you use **preview deployments** with OAuth, use the **same** `AUTH_SECRET` for the stable deployment and previews (see [Securing a preview deployment](https://authjs.dev/getting-started/deployment#securing-a-preview-deployment)).

## 3. Behind a reverse proxy (e.g. Vercel)

Modonty already sets `trustHost: true` in `lib/auth.ts`. If you rely on `X-Forwarded-Host`, you can also set:

```env
AUTH_TRUST_HOST=true
```

(Vercel/Cloudflare are auto-detected; this is for other hosts.)

## 4. Checklist before deploying modonty

- [ ] `AUTH_SECRET` is set in the **deployment** environment (not only locally).
- [ ] `AUTH_SECRET` is strong (e.g. from `pnpm exec auth secret` or `openssl rand -base64 33`).
- [ ] You have **not** changed `AUTH_SECRET` after going live (or you accept that existing sessions will be invalid until users clear cookies / sign in again).

## References

- [Auth.js — Deployment](https://authjs.dev/getting-started/deployment)
- [Auth.js — Environment variables](https://authjs.dev/guides/environment-variables)
