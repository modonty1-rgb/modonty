import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const getFavoritesCountForNav = cache(async (): Promise<number | undefined> => {
  const session = await auth();
  if (session?.user?.id == null) return undefined;
  return db.articleFavorite.count({ where: { userId: session.user.id } });
});
