import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      hasPassword?: boolean;
      role?: string;
      createdAt?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
    hasPassword?: boolean;
    role?: string;
    createdAt?: string;
    accessToken?: string;
    provider?: string;
  }
}
