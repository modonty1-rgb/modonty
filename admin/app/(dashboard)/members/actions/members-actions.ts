"use server";

import { db } from "@/lib/db";

export interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  via: "google" | "email";
  verified: boolean;
  createdAt: Date;
}

// Registered visitors (role EDITOR) — the people who signed up via Google or
// email. Distinct from /users (Admins) and /subscribers (newsletter list).
export async function getMembers(): Promise<Member[]> {
  try {
    const rows = await db.user.findMany({
      where: { role: "EDITOR" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true, // used only to derive the signup method; never returned
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      via: u.password ? "email" : "google",
      verified: Boolean(u.emailVerified),
      createdAt: u.createdAt,
    }));
  } catch {
    return [];
  }
}
