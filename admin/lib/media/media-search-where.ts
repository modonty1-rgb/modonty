import type { Prisma } from "@prisma/client";

/** The media pages' search box: filename, alt text or title, ignoring case. */
export function mediaSearchWhere(search: string): Prisma.MediaWhereInput {
  return {
    OR: [
      { filename: { contains: search, mode: "insensitive" } },
      { altText: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
    ],
  };
}
