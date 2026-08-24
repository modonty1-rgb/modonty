import { LoginForm } from "./components/login-form";
import { logError } from "./helpers/log-error";

// NextAuth redirects a failed sign-in back to this page (pages.signIn) with
// ?error=<type> (client-safe types per Auth.js: OAuthCallbackError,
// OAuthAccountNotLinked, AccessDenied, Verification, MissingCSRF, CredentialsSignin;
// anything unsafe collapses to Configuration). Map each to Arabic so the failure
// is no longer silent — the exact symptom that hid the www/apex OAuth-callback bug.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthCallbackError: "تعذّر إكمال الدخول عبر Google — انقطع الاتصال أثناء العودة. جرّب مرة ثانية.",
  OAuthSignin: "تعذّر بدء الدخول عبر Google. حاول مرة ثانية.",
  OAuthAccountNotLinked: "هذا البريد مسجّل بطريقة دخول أخرى. سجّل الدخول بنفس الطريقة السابقة.",
  AccountNotLinked: "هذا البريد مسجّل بطريقة دخول أخرى. سجّل الدخول بنفس الطريقة السابقة.",
  AccessDenied: "تم رفض الوصول. تأكد من السماح لمدوّنتي بالوصول لحسابك على Google.",
  Verification: "انتهت صلاحية رابط التحقق. اطلب رابطاً جديداً.",
  MissingCSRF: "انتهت الجلسة. حدّث الصفحة وحاول مجدداً.",
  CredentialsSignin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
  Configuration: "حدث خطأ غير متوقع أثناء الدخول. حاول مرة ثانية.",
};

// The post-login redirect target arrives in the query string, so a mailed
// /users/login?callbackUrl=… link decides where a visitor lands the moment they
// authenticate — a phisher points it at a look-alike domain and collects the
// trust of a real sign-in. Only a same-origin path is allowed through:
// "//evil.com" and "/\evil.com" start with a slash but browsers resolve them
// protocol-relative to another host, and tab/CR/LF are stripped during URL
// parsing, so "/<tab>/evil.com" would collapse into one of those after the check.
function toSafeCallbackUrl(raw: string | undefined): string {
  if (!raw) return "/";
  const cleaned = raw.replace(/[\t\r\n]/g, "");
  if (!cleaned.startsWith("/")) return "/";
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return "/";
  return cleaned;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl: rawCallback } = await searchParams;
  const callbackUrl = toSafeCallbackUrl(rawCallback);

  let initialError: string | undefined;
  if (error) {
    initialError = AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.Configuration;
    // Surface the otherwise-silent OAuth failure in admin /system-errors.
    await logError({
      message: `Login failed: ${error}`,
      path: "/users/login",
      source: "modonty:auth-oauth",
    });
  }

  return <LoginForm callbackUrl={callbackUrl} initialError={initialError} />;
}
