import { db } from "@/lib/db";
import type { Metadata } from "next";

export interface ClientSeo {
  metadata: Metadata | null;
  jsonLd: string | null;
}

// Minimal client SEO helper.
// Uses Client SEO fields only; JSON-LD can be wired in later when cached in DB.
export async function getClientSeo(slug: string): Promise<ClientSeo> {
  const client = await db.client.findUnique({
    where: { slug },
    select: {
      name: true,
      seoTitle: true,
      seoDescription: true,
    },
  });

  if (!client) {
    return { metadata: null, jsonLd: null };
  }

  const metadata: Metadata = {
    title: client.seoTitle || client.name,
    description: client.seoDescription || undefined,
  };

  return { metadata, jsonLd: null };
}

