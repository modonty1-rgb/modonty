import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { recordOAuthSignup } from "./auth/record-oauth-signup";

// Required for deployment. See: https://authjs.dev/getting-started/deployment
// Set AUTH_SECRET in your deployment env (Vercel, etc.). Generate: pnpm exec auth secret
// Do not change AUTH_SECRET after launch or users may see "no matching decryption secret".
if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required. Set it in .env (local) or your deployment environment (e.g. Vercel). See https://authjs.dev/getting-started/deployment"
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  trustHost: true,
  // Fix: Safari ITP + in-app browsers drop PKCE/state cookies during OAuth redirect.
  // Explicit sameSite:"lax" + secure ensures cookies survive the Google OAuth round-trip.
  cookies: {
    pkceCodeVerifier: {
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true, maxAge: 900 },
    },
    state: {
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: true, maxAge: 900 },
    },
  },
  events: {
    ...authConfig.events,
    // Fires only for adapter-created users (OAuth / Google first sign-in).
    // Credentials users are created in registerUser, which counts its own
    // signup_complete — so there's no double-count here.
    // Body shared with the reader app's Google/Apple sign-in (lib/auth/record-oauth-signup.ts);
    // it never throws, so the auth flow is never blocked.
    async createUser({ user }) {
      if (!user?.id) return;
      await recordOAuthSignup(user.id, "google", "page");
    },
  },
  logger: {
    error(error: Error) {
      /**
       * كتمُ خطأ الكوكي التالف — كوكي وُقِّع بسرٍّ قديم أو تلف، ونتيجته «زائر غير مسجَّل»
       * وهي حالةٌ عاديّة لا عطل.
       *
       * ⚠ الفحص على `name` لا على `message`: كان يفحص الرسالة، ورسالة authjs هي
       * «Read more at https://errors.authjs.dev#jwtsessionerror» — لا تحوي الكلمة أبداً،
       * فما كُتم خطأٌ واحد منذ كُتب الشرط. قيس (١٤ سبتمبر ٢٠٢٦): ٦ أخطاء لكل طلب على
       * `/pay/sa` و٢٤ على الصفحة الرئيسية، بكوكي تالف واحد.
       *
       * ولماذا يصل هذا **صفحة البيع** أصلاً: `app/not-found.tsx` يركّب `SiteShell`،
       * وNext يجهّز صفحة ٤٠٤ مع كل طلب — فجرس الإشعارات يُنفَّذ حتى على صفحةٍ خارج
       * مجموعة `(site)`. فكان سجلّ خادم صفحة بيعٍ لغير المسجَّلين يمتلئ بضجيج مصادقة،
       * وتغرق فيه أخطاء الدفع الحقيقية يوم تقع — وهذا وحده سبب كافٍ.
       *
       * والسبب الجذريّ (`JWEInvalid`) يبقى ظاهراً عند تفعيل `AUTH_DEBUG`.
       */
      const name = error?.name ?? "";
      const msg = error?.message ?? "";
      const isStaleCookie =
        name === "JWTSessionError"
        || msg.includes("JWTSessionError")
        || msg.includes("jwtsessionerror")
        || msg.includes("no matching decryption secret");
      if (isStaleCookie && process.env.AUTH_DEBUG !== "true") return;
      console.error("[auth][error]", error);
    },
    warn(message) {
      console.warn("[auth][warn]", message);
    },
    debug(message) {
      // no-op in production; set AUTH_DEBUG=true to enable
      if (process.env.AUTH_DEBUG === "true") console.debug("[auth][debug]", message);
    },
  },
});
