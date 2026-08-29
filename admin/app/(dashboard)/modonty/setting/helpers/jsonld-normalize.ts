/**
 * Normalize Modonty JSON-LD via expand + compact (standalone, no admin/lib/seo).
 */

import * as jsonld from "jsonld";

import { schemaOrgDocumentLoader } from "@/lib/seo/schema-org-document-loader";

const DEFAULT_CONTEXT = {
  "@context": "https://schema.org",
};

// The schema.org context is served from disk, not fetched. Without this the two calls below
// each dereference https://schema.org over the network while a page's SEO is being generated,
// so an outage there fails the save (see schema-org-document-loader.ts).
const LOADER = { documentLoader: schemaOrgDocumentLoader };

export async function normalizeModontyJsonLd(jsonLd: object): Promise<object> {
  const expanded = await jsonld.expand(jsonLd, LOADER);
  const compacted = await jsonld.compact(expanded, DEFAULT_CONTEXT, LOADER);
  return compacted as object;
}
