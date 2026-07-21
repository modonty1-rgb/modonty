import { LoginForm } from "./components/login-form";
import { logError } from "@/lib/log-error";

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

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl: rawCallback } = await searchParams;
  const callbackUrl = rawCallback?.startsWith("/") ? rawCallback : "/";

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
