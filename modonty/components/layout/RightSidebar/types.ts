export interface RightSidebarArticle {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  client: { name: string };
}
