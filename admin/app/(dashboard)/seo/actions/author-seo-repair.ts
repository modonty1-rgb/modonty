"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getModontyAuthor } from "@/app/(dashboard)/authors/actions/authors-actions/get-modonty-author";
import { buildModontyAuthorSeo } from "@/app/(dashboard)/authors/helpers/build-modonty-author-seo";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";

export interface AuthorSeoRepairResult {
  ok: boolean;
  /** true when the stored JSON-LD was NOT already the Organization entity (i.e. a real fix). */
  changed: boolean;
  detail?: string;
}

// The Modonty author must resolve to the Organization entity everywhere. A stored JSON-LD
// that still carries "@type":"Person" (the legacy shape) is the drift this repairs.
function isOrgJsonLd(stored: string | null | undefined): boolean {
  if (!stored) return false;
  return /"@type"\s*:\s*"Organization"/.test(stored);
}

/**
 * Rebuild the Modonty author's stored SEO cache (JSON-LD + Next.js metadata) as the
 * Organization entity and revalidate the public /authors page. Idempotent — safe to run
 * repeatedly; reports whether it actually changed anything.
 */
export async function regenerateModontyAuthorSeo(): Promise<AuthorSeoRepairResult> {
  const author = await getModontyAuthor();
  if (!author) return { ok: false, changed: false, detail: "Modonty author not found" };

  const wasOrg = isOrgJsonLd(author.jsonLdStructuredData);
  const settings = await getAllSettings();
  const { jsonLd, metadata } = buildModontyAuthorSeo(author, settings);

  await db.author.update({
    where: { id: author.id },
    data: {
      jsonLdStructuredData: JSON.stringify(jsonLd),
      jsonLdLastGenerated: new Date(),
      nextjsMetadata: JSON.parse(JSON.stringify(metadata)),
      nextjsMetadataLastGenerated: new Date(),
    },
  });

  revalidatePath("/authors");
  await revalidateModontyTag("authors");

  return { ok: true, changed: !wasOrg };
}

/** Health probe for the /seo attention count — is the stored author JSON-LD still stale? */
export async function getModontyAuthorSeoHealth(): Promise<{ stale: boolean }> {
  const author = await getModontyAuthor();
  return { stale: !author || !isOrgJsonLd(author.jsonLdStructuredData) };
}
