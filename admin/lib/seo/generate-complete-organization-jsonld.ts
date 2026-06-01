// Re-export shim. The generator now lives in the shared package so admin +
// console share ONE source of truth. Existing admin imports keep working via this path.
export { generateCompleteOrganizationJsonLd } from "@modonty/database/lib/seo/generate-organization-jsonld";
