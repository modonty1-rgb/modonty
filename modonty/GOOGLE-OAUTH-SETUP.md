# Google OAuth Setup Guide – Fix "OAuth client not found" (401 invalid_client)

Use this guide to fix the **Access blocked: Authorization Error** when signing in with Google.

---

## Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (e.g. `dreamtoapp@gmail.com`)

---

## Step 2: Choose or Create a Project

1. Click the project dropdown at the top (next to "Google Cloud")
2. If you have an existing project, select it
3. To create one:
   - Click **New Project**
   - Name it (e.g. "Modonty" or "DreamToApp")
   - Click **Create**

---

## Step 3: Enable Google+ API (if needed)

1. Go to **APIs & Services** → **Library**
2. Search for **Google+ API** or **People API**
3. Open it and click **Enable** (if not already enabled)

---

## Step 4: Create OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (for any Google account) or **Internal** (organization only)
3. Click **Create**
4. Fill in:
   - **App name:** Modonty (or your app name)
   - **User support email:** dreamtoapp@gmail.com
   - **Developer contact:** your email
5. Click **Save and Continue**
6. Skip **Scopes** (or add `email`, `profile`, `openid` if needed)
7. Click **Save and Continue**
8. Add **Test users** if the app is in "Testing" mode (your Google email)
9. Click **Save and Continue**

---

## Step 5: Create OAuth 2.0 Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: e.g. **Modonty Web Client**
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local dev)
   - `https://modonty.com` (for production)
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://modonty.com/api/auth/callback/google`
7. Click **Create**
8. A popup will show your **Client ID** and **Client Secret** – keep them

---

## Step 6: Update Your `.env` File

1. Open `.env` in the `modonty` folder (or your env file)
2. Set:

```
GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET_HERE
```

3. For local dev, ensure `NEXTAUTH_URL` is correct:
   - Local: `NEXTAUTH_URL=http://localhost:3000`
   - Production: `NEXTAUTH_URL=https://modonty.com`

---

## Step 7: Restart and Test

1. Stop your dev server (Ctrl+C)
2. Start it again: `pnpm dev`
3. Go to your login page and click **Sign in with Google**

---

## Troubleshooting

| Issue | Action |
|-------|--------|
| OAuth client not found | Client ID wrong or deleted – create a new client (Step 5) |
| Redirect URI mismatch | Add exact URLs to **Authorized redirect URIs** (Step 5.6) |
| Access blocked (testing) | Add your email in OAuth consent screen → Test users |
| Works on localhost but not prod | Add production URL and callback to the OAuth client |

---

## Quick Checklist

- [ ] OAuth consent screen configured
- [ ] Web application OAuth client created
- [ ] `http://localhost:3000/api/auth/callback/google` in redirect URIs
- [ ] `https://modonty.com/api/auth/callback/google` in redirect URIs (if using prod)
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- [ ] Restarted dev server
