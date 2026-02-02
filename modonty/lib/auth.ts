import NextAuth from "next-auth";
import { authConfig } from "../auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

if (!process.env.AUTH_SECRET) {
  throw new Error(
    "AUTH_SECRET environment variable is required. Please set it in your .env file."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  trustHost: true,
});
