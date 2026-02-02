import { db } from "@/lib/db";

export interface ClientContext {
  client_id: string;
  client_slug: string;
  client_name: string;
}

export async function getClientContext(clientId: string): Promise<ClientContext | null> {
  try {
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (!client) {
      return null;
    }

    return {
      client_id: client.id,
      client_slug: client.slug,
      client_name: client.name,
    };
  } catch (error) {
    console.error("Error fetching client context:", error);
    return null;
  }
}

export async function extractClientFromArticle(articleSlug: string): Promise<ClientContext | null> {
  try {
    const article = await db.article.findFirst({
      where: { slug: articleSlug },
      include: {
        client: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!article || !article.client) {
      return null;
    }

    return {
      client_id: article.client.id,
      client_slug: article.client.slug,
      client_name: article.client.name,
    };
  } catch (error) {
    console.error("Error extracting client from article:", error);
    return null;
  }
}

export async function extractClientFromSlug(clientSlug: string): Promise<ClientContext | null> {
  try {
    const client = await db.client.findUnique({
      where: { slug: clientSlug },
      select: {
        id: true,
        slug: true,
        name: true,
      },
    });

    if (!client) {
      return null;
    }

    return {
      client_id: client.id,
      client_slug: client.slug,
      client_name: client.name,
    };
  } catch (error) {
    console.error("Error extracting client from slug:", error);
    return null;
  }
}
