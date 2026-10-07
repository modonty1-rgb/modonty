/**
 * Wire types for the reader API's account group A — social sign-in, push devices, logout body and
 * account deletion: `modonty/app/api/mobile/v1/{auth/google,auth/apple,auth/logout,devices/**,me}`.
 *
 * Same conventions as `api-types.ts` (kept standalone — no imports):
 *  - `Date` on the server → ISO `string` here.
 *  - `null` stays `null`; `field?:` = may be absent.
 *  - Each `…Data` type is the `data` of the `{ data }` envelope.
 */

type IsoDate = string;

/** modonty/lib/mobile-api/reader-profile.ts — same shape as `ReaderProfile` in api-types.ts. */
export interface SocialAuthUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  createdAt: IsoDate;
  hasPassword: boolean;
  phone: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A3 / A4 — POST /auth/google · POST /auth/apple (public)
// ─────────────────────────────────────────────────────────────────────────────────────────────

/** POST /auth/google — the Google ID token from `@react-native-google-signin`. */
export interface GoogleSignInBody {
  idToken: string;
  /** `^[A-Za-z0-9-]{8,64}$`; falls back to the X-Device-Id header when absent. */
  deviceId?: string;
}

/** POST /auth/apple — from `expo-apple-authentication.signInAsync`. */
export interface AppleSignInBody {
  identityToken: string;
  /** The nonce passed to `signInAsync` (raw, or the value whose SHA-256 hex was passed). 8–256 chars. */
  nonce?: string;
  /** Only present on the first authorization — send it then; stored only for a new/nameless account. */
  fullName?: { givenName?: string | null; familyName?: string | null } | null;
  deviceId?: string;
}

/**
 * Both routes → 200 (existing account) or 201 (account just created).
 * Errors: 401 UNAUTHORIZED (token rejected · Google email unverified · Apple gave no email),
 * 422 VALIDATION_ERROR, 500 INTERNAL_ERROR (provider not configured on the server).
 */
export interface SocialAuthData {
  accessToken: string;
  refreshToken: string;
  /** Seconds (900). */
  expiresIn: number;
  user: SocialAuthUser;
  isNewUser: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A6 — POST /auth/logout (body addition)
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface LogoutBody {
  /** When the access token has expired. */
  refreshToken?: string;
  /** This phone's X-Device-Id — its push registrations are disabled with the session. */
  deviceId?: string;
}

export interface LogoutData {
  signedOut: true;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// N3 — POST /devices/register · DELETE /devices/:idOrToken (Bearer)
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface DeviceRegisterBody {
  /** `^(Expo|Exponent)PushToken\[.+\]$` */
  expoPushToken: string;
  platform: "ios" | "android";
  /** The X-Device-Id value. */
  deviceId: string;
  deviceName?: string | null;
  appVersion?: string | null;
}

/** modonty/lib/push/reader-device-shape.ts — the token itself is never echoed. */
export interface Device {
  id: string;
  deviceId: string;
  platform: string;
  deviceName: string | null;
  appVersion: string | null;
  enabled: boolean;
  lastSeenAt: IsoDate;
  createdAt: IsoDate;
}

/** POST /devices/register → 200 · DELETE /devices/:idOrToken → 200 (404 NOT_FOUND if not yours). */
export interface DeviceData {
  device: Device;
}

/**
 * The `data` of every push this API sends (Expo message `data`). ONE key `type` = the
 * notification's own type (`comment_*` · `reel_comment_*` · `faq_reply` · anything else = contact reply).
 */
export interface ReaderPushData {
  type: string;
  notificationId: string;
  articleSlug?: string;
  reelSlug?: string;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// A14 — DELETE /me (Bearer)
// ─────────────────────────────────────────────────────────────────────────────────────────────

export interface DeleteAccountBody {
  /** Required when `user.hasPassword`. */
  password?: string;
  /** Must be exactly "حذف". */
  confirm: string;
}

/**
 * 200 → the account is gone; clear tokens locally. Errors: 401, 403 FORBIDDEN (wrong password),
 * 422 (confirm word / missing password), 429 RATE_LIMITED (+ Retry-After).
 */
export interface DeleteAccountData {
  deleted: true;
}
