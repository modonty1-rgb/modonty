import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";

const AUTH_ERROR_CODES = {
  missingPassword: "NO_PASSWORD_SET",
} as const;

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
          // The admin panel authenticates against `staff` only.
          const staffRow = await db.staff.findUnique({ where: { email } });
          const user = staffRow
            ? {
                id: staffRow.id,
                email: staffRow.email,
                name: staffRow.name,
                password: staffRow.password,
                role: staffRow.role as string,
                isActive: staffRow.isActive,
              }
            : null;

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
            throw new Error(AUTH_ERROR_CODES.missingPassword);
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

          // Employment gate: a staff member who has left (isActive === false) keeps
          // their record + history but can no longer sign in. Absent/null = active.
          if (user.isActive === false) {
            console.error("[Auth] Login rejected: account is inactive —", email);
            return null;
          }

          // The panel authenticates against `staff` only, so any successful login
          // is a real team member. Access is by employment status (above), not role —
          // roles (Admin/Editor/Creative/Social/Sales) classify the work, they don't
          // gate the door. Granular per-role permissions are a separate feature.

          console.log("[Auth] Login successful for:", email);
          // Only return minimal user data to avoid ERR_RESPONSE_HEADERS_TOO_BIG
          // Do NOT include image/avatar as they can be large data URLs
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === AUTH_ERROR_CODES.missingPassword
          ) {
            throw error;
          }

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
        // Persist role in the signed token so the proxy (network boundary) can
        // enforce ADMIN before any route renders — no DB read at the edge.
        token.role = (user as { role?: string }).role;
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
        if (token?.role) {
          (session.user as { role?: string }).role = token.role as string;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
