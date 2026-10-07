import { db } from "@/lib/db";

/** The two reads `generateMetadata` makes — a member by id, or (when none) an author by slug. */
export async function getUserForMetadata(id: string) {
  // Try to find user
  const user = await db.user.findUnique({
    where: { id },
    select: {
      name: true,
      image: true,
    },
  });

  // If not found, try author
  if (!user) {
    const author = await db.author.findUnique({
      where: { slug: id },
      select: {
        name: true,
        firstName: true,
        lastName: true,
        bio: true,
        image: true,
        seoTitle: true,
        seoDescription: true,
        twitter: true,
      },
    });
    return { user: null, author };
  }

  return { user, author: null };
}
