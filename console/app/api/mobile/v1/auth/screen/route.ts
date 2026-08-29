import { ok } from "@/lib/mobile-api/http";

/**
 * Copy for the login screen (S01). Public by design: it is read before any
 * session exists, so it is the one mobile endpoint without an auth guard.
 * It carries no client data — only the words the screen renders.
 */
export function GET() {
  return ok({
    title: "أهلًا بك",
    subtitle: "تابع نموك من مكان واحد.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "name@company.com",
    passwordLabel: "كلمة المرور",
    showPasswordLabel: "إظهار كلمة المرور",
    hidePasswordLabel: "إخفاء كلمة المرور",
    submitLabel: "دخول إلى حسابي",
    submittingLabel: "جارٍ الدخول…",
    missingFieldsMessage: "اكتب البريد وكلمة المرور.",
    forgotPasswordLabel: "نسيت كلمة المرور؟",
    // No password-reset route exists in the console yet, so the link says the
    // truth instead of opening an invented screen.
    forgotPasswordUnavailableMessage: "استعادة كلمة المرور ما زالت غير متاحة في التطبيق. كلّم الدعم وهم يضبطونها لك.",
  });
}
