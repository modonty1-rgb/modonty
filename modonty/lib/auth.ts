import NextAuth from "next-auth";
import { ConversionType } from "@prisma/client";
import { authConfig } from "../auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { createConversion } from "./conversion-tracking";
import { trackSignupComplete } from "./analytics/events-registry";

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
  events: {
    ...authConfig.events,
    // Fires only for adapter-created users (OAuth / Google first sign-in).
    // Credentials users are created in registerUser, which counts its own
    // signup_complete — so there's no double-count here.
    async createUser({ user }) {
      if (!user?.id) return;
      try {
        await createConversion({ type: ConversionType.SIGNUP, userId: user.id });
        void trackSignupComplete(
          { signup_method: "google", signup_source: "page" },
          { userId: user.id },
        );
      } catch {
        // never block the auth flow
      }
    },
  },
  logger: {
    error(error: Error) {
      // Suppress JWTSessionError in console (e.g. no matching decryption secret / stale cookie)
      const msg = error?.message ?? "";
      if (msg.includes("JWTSessionError") || msg.includes("no matching decryption secret")) return;
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
