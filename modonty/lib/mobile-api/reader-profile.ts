import "server-only";

import { db } from "@/lib/db";

/**
 * The signed-in reader as the app shows them — the same fields the web session carries
 * (`auth.config.ts` jwt callback: name · email · picture = image || avatar · bio · createdAt ·
 * hasPassword), read fresh from the row.
 */
export async function readerProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, avatar: true, bio: true, createdAt: true, password: true, phone: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image || user.avatar || null,
    bio: user.bio ?? null,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
    phone: user.phone ?? null,
  };
}
