import NextAuth from "next-auth";
import { authConfig } from "../auth.config";

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required. Please set it in your .env file."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  secret: process.env.AUTH_SECRET,
});
