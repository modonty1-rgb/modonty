import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

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
