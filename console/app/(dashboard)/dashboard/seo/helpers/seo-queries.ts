import { db } from "@/lib/db";

/**
 * Fetch competitors + target keywords for the SEO tab subpages (keywords/competitors).
 * The intake form has its own page (/dashboard/seo/intake) that reads `client.intake` directly.
 */
export async function getClientSeoData(clientId: string) {
  const [client, competitors, keywords] = await Promise.all([
    db.client.findUnique({
      where: { id: clientId },
      select: {
        slug: true,
        url: true,
        sameAs: true,
      },
    }),
    db.clientCompetitor.findMany({
      where: { clientId },
      orderBy: { order: "asc" },
    }),
    db.clientKeyword.findMany({
      where: { clientId },
      orderBy: [{ priority: "desc" }, { keyword: "asc" }],
    }),
  ]);

  return { client, competitors, keywords };
}
