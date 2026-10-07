import { db } from "@/lib/db";

interface ClientPagePaths {
  name: string;
  /** `/clients/<encoded slug>` — the partner page; its sub-pages sit under it. */
  clientPath: string;
  /** Published articles, each with the encoded path Google reports it under. */
  articles: { id: string; title: string; path: string }[];
  pathOf: (url: string) => string;
  /** Whether a modonty.com URL (full URL or path) is one of this client's pages. */
  isMine: (url: string) => boolean;
  /** Article title for an article URL; the client's name for the partner page. */
  titleOf: (url: string) => string;
}

const pathOf = (url: string) => {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
};

/**
 * Which modonty.com pages belong to a client: his partner page (and its sub-pages) and his
 * published articles. Read from our own database on every call — a new article counts the moment
 * it is published, with no list to keep in sync anywhere else. Google reports Arabic paths
 * percent-encoded, hence encodeURIComponent on the slugs.
 */
export async function getClientPagePaths(clientId: string): Promise<ClientPagePaths | null> {
  const [client, rows] = await Promise.all([
    db.client.findUnique({ where: { id: clientId }, select: { slug: true, name: true } }),
    db.article.findMany({ where: { clientId, status: "PUBLISHED" }, select: { id: true, slug: true, title: true } }),
  ]);
  if (!client) return null;

  const clientPath = `/clients/${encodeURIComponent(client.slug)}`;
  const articles = rows.map((a) => ({ id: a.id, title: a.title, path: `/articles/${encodeURIComponent(a.slug)}` }));
  const titleByPath = new Map(articles.map((a) => [a.path, a.title]));
  return {
    name: client.name,
    clientPath,
    articles,
    pathOf,
    isMine: (url) => {
      const p = pathOf(url);
      return p === clientPath || p.startsWith(`${clientPath}/`) || titleByPath.has(p);
    },
    titleOf: (url) => titleByPath.get(pathOf(url)) ?? client.name,
  };
}
