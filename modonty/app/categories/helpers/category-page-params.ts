/**
 * The props `/categories` receives from Next. It describes THIS page's URL contract —
 * the query keys the listing reads — so it lives with the page instead of in the app-wide
 * types file, where it sat with a single consumer and no way to tell it apart from the
 * shapes that really are shared.
 */
export interface CategoryPageParams {
  searchParams: Promise<{
    search?: string;
    sort?: "name" | "articles" | "trending" | "recent";
    view?: "grid" | "list";
    featured?: string;
  }>;
}
