import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "./lib/db";
import bcrypt from "bcryptjs";

export const authConfig = {
  pages: {
    signIn: "/users/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image || user.avatar,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Initial sign-in: Store user data from any provider
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        // Fetch password status from database
        try {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { password: true },
          });
          token.hasPassword = !!dbUser?.password;
        } catch (error) {
          token.hasPassword = false;
        }
      }

      // OAuth provider (Google): Use profile data for accuracy
      if (account?.provider === "google") {
        if (profile) {
          token.email = profile.email;
          token.name = profile.name;
          // Google uses 'picture'
          token.picture = (profile as any).picture;
        }
        // Store access token for revocation on logout
        if (account.access_token) {
          token.accessToken = account.access_token;
          token.provider = account.provider;
        }
      }

      // Token refresh: Fetch fresh user data from database
      if (token.id && !user) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              avatar: true,
              role: true,
              createdAt: true,
              password: true,
            },
          });

          if (dbUser) {
            token.email = dbUser.email;
            token.name = dbUser.name;
            token.picture = dbUser.image || dbUser.avatar;
            token.role = dbUser.role;
            token.createdAt = dbUser.createdAt.toISOString();
            token.hasPassword = !!dbUser.password;
          }
        } catch (error) {
          // Silent fail - use existing token data
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching user data:", error);
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Enrich session with data from JWT token
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        // Add hasPassword flag
        (session.user as any).hasPassword = token.hasPassword as boolean;
        // Add role if available (for authorization)
        if (token.role) {
          (session.user as any).role = token.role;
        }
        // Add createdAt for "joined date" display
        if (token.createdAt) {
          (session.user as any).createdAt = token.createdAt;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow all sign-ins for now
      // Add custom logic here if needed (e.g., email domain verification)
      return true;
    },
  },
  events: {
    async signOut() {
      // OAuth token revocation would need to be handled differently in NextAuth v5
      // The token is not available in the signOut event
      // Token revocation could be implemented in a custom signOut function if needed
    },
  },
} satisfies NextAuthConfig;
