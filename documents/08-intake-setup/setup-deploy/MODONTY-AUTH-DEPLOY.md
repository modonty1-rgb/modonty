# Modonty – Auth.js Deployment (Avoid JWT Errors)

Follow the [Auth.js Deployment](https://authjs.dev/getting-started/deployment) guide to prevent `JWTSessionError` / "no matching decryption secret" on deployment.

## 1. Set `AUTH_SECRET` in Deployment

**Required.** Auth.js uses it to encrypt cookies and JWT. Min 32 characters.

**Local:** Set in `modonty/.env` or `modonty/.env.local`.
**Production:** Set in host env (e.g., Vercel → Project → Settings → Environment Variables).

Generate:
```bash
pnpm exec auth secret
# or
openssl rand -base64 33
```

## 2. Keep `AUTH_SECRET` Consistent

**Do not change** `AUTH_SECRET` after deployment with real users. Changing it invalidates existing JWTs and causes "no matching decryption secret" when decrypting old cookies.

For **preview deployments** with OAuth, use **same** `AUTH_SECRET` as production (see [Securing a preview deployment](https://authjs.dev/getting-started/deployment#securing-a-preview-deployment)).

## 3. Behind a Reverse Proxy (e.g., Vercel)

Modonty already sets `trustHost: true` in `lib/auth.ts`. For other hosts, optionally set:

```env
AUTH_TRUST_HOST=true
```

## 4. Deployment Checklist

- [ ] `AUTH_SECRET` is set in **deployment** environment (not only locally).
- [ ] `AUTH_SECRET` is strong (from `pnpm exec auth secret` or `openssl rand -base64 33`).
- [ ] **Not** changed after going live (or accept that existing sessions become invalid).

## References

- [Auth.js — Deployment](https://authjs.dev/getting-started/deployment)
- [Auth.js — Environment variables](https://authjs.dev/guides/environment-variables)
