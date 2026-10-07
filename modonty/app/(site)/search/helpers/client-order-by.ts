import type { Prisma } from "@prisma/client";

/** ترتيب قائمة الشركاء في البحث — تُقرأ من `?sort=` ولا يستعملها غير هذا المسار. */
export type ClientSortOption =
  | "name-asc"
  | "name-desc"
  | "articles-desc"
  | "articles-asc"
  | "newest"
  | "oldest";

export function clientOrderBy(sortBy: ClientSortOption): Prisma.ClientOrderByWithRelationInput {
  switch (sortBy) {
    case "name-desc":
      return { name: "desc" };
    case "articles-desc":
      return { articles: { _count: "desc" } };
    case "articles-asc":
      return { articles: { _count: "asc" } };
    case "newest":
      return { createdAt: "desc" };
    case "oldest":
      return { createdAt: "asc" };
    default:
      return { name: "asc" };
  }
}
