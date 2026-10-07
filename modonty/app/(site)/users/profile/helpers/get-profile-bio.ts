import { db } from "@/lib/db";

export async function getProfileBio(userId: string): Promise<string | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { bio: true },
  });
  return user?.bio ?? null;
}
