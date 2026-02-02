import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Missing credentials");
          return null;
        }

        const email = credentials.email as string;
        console.log("[Auth] Attempting login for:", email);

        try {
          const user = await db.user.findUnique({
            where: { email },
          });

          console.log("[Auth] User lookup result:", {
            found: !!user,
            userId: user?.id,
            hasPassword: !!user?.password,
            role: user?.role,
          });

          if (!user) {
            console.error("[Auth] Login failed: User not found");
            return null;
          }

          if (!user.password) {
            console.error("[Auth] Login failed: User has no password set");
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          console.log("[Auth] Password validation:", {
            isValid: isPasswordValid,
            passwordLength: (credentials.password as string).length,
          });

          if (!isPasswordValid) {
            console.error("[Auth] Login failed: Invalid password");
            return null;
          }

          console.log("[Auth] Login successful for:", email);
          // Only return minimal user data to avoid ERR_RESPONSE_HEADERS_TOO_BIG
          // Do NOT include image/avatar as they can be large data URLs
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("[Auth] Database error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        if (token?.id) {
          session.user.id = token.id as string;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
