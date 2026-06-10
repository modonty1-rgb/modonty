import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verifyConsoleAccessToken } from "@/lib/admin-access";

export const authConfig = {
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or client slug", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }
        const id = String(credentials.identifier).trim();
        const password = String(credentials.password);

        try {
          const isEmail = id.includes("@");
          const client = isEmail
            ? await db.client.findFirst({ where: { email: id } })
            : await db.client.findUnique({ where: { slug: id } });

          if (!client || !client.password) {
            return null;
          }

          const valid = await bcrypt.compare(password, client.password);
          if (!valid) return null;

          return {
            id: client.id,
            email: client.email ?? undefined,
            name: client.name,
            clientId: client.id,
            clientSlug: client.slug,
            clientName: client.name,
          };
        } catch {
          return null;
        }
      },
    }),
    // Admin impersonation — opens the client's console AS the client via a signed,
    // expiring ticket from the admin app. No password; the ticket's signature +
    // expiry are the gate (verifyConsoleAccessToken).
    Credentials({
      id: "admin-impersonation",
      name: "Admin Access",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const verified = verifyConsoleAccessToken(String(credentials?.token ?? ""));
        if (!verified) return null;
        try {
          const client = await db.client.findUnique({ where: { id: verified.clientId } });
          if (!client) return null;
          return {
            id: client.id,
            email: client.email ?? undefined,
            name: client.name,
            clientId: client.id,
            clientSlug: client.slug,
            clientName: client.name,
            impersonated: true,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.clientId = (user as { clientId?: string }).clientId;
        token.clientSlug = (user as { clientSlug?: string }).clientSlug;
        token.clientName = (user as { clientName?: string }).clientName;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.impersonated = (user as { impersonated?: boolean }).impersonated ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { email?: string }).email = token.email as string;
        (session.user as { name?: string }).name = token.name as string;
        (session as { clientId?: string }).clientId = token.clientId as string;
        (session as { clientSlug?: string }).clientSlug =
          token.clientSlug as string;
        (session as { clientName?: string }).clientName =
          token.clientName as string;
        (session as { impersonated?: boolean }).impersonated =
          (token.impersonated as boolean) ?? false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
