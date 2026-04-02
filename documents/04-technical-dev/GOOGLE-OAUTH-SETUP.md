# Google OAuth Setup - Fix "OAuth client not found" (401 invalid_client)

## Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

## Step 2: Choose or Create Project

1. Click project dropdown at top
2. Select existing project or click **New Project**
3. Name it (e.g. "Modonty")
4. Click **Create**

## Step 3: Enable Google+ API

1. Go to **APIs & Services** → **Library**
2. Search for **Google+ API** or **People API**
3. Click **Enable**

## Step 4: Create OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (any Google account) or **Internal** (organization only)
3. Click **Create**
4. Fill in:
   - **App name**: Modonty
   - **User support email**: your email
   - **Developer contact**: your email
5. Click **Save and Continue**
6. Skip **Scopes** or add `email`, `profile`, `openid`
7. Click **Save and Continue**
8. Add **Test users** if in testing mode (your Google email)
9. Click **Save and Continue**

## Step 5: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: e.g. **Modonty Web Client**
5. **Authorized JavaScript origins**:
   - `http://localhost:3000` (local dev)
   - `https://modonty.com` (production)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://modonty.com/api/auth/callback/google`
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

## Step 6: Update `.env` File

```env
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
NEXTAUTH_URL=http://localhost:3000           # Local
NEXTAUTH_URL=https://modonty.com            # Production
```

## Step 7: Restart and Test

1. Stop dev server (Ctrl+C)
2. Start: `pnpm dev`
3. Go to login page
4. Click **Sign in with Google**

## Troubleshooting

| Issue | Action |
|-------|--------|
| OAuth client not found | Create new client (Step 5) |
| Redirect URI mismatch | Add exact URLs to **Authorized redirect URIs** |
| Access blocked (testing) | Add your email in OAuth consent screen → Test users |
| Works on localhost but not prod | Add production URL and callback URI |

## Quick Checklist

- [ ] OAuth consent screen configured
- [ ] Web application OAuth client created
- [ ] `http://localhost:3000/api/auth/callback/google` in redirect URIs
- [ ] `https://modonty.com/api/auth/callback/google` in redirect URIs
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- [ ] Dev server restarted
