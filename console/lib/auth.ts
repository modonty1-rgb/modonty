import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET must be set in production");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-only-secret-do-not-use-in-production",
});
