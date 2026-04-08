import { db } from "../lib/db";
import { generateAndSaveJsonLd } from "../lib/seo/jsonld-storage";
import { generateAndSaveNextjsMetadata } from "../lib/seo/metadata-storage";

const id = "69d163ea4e8bf3f470aff0ee";

async function main() {
  console.log("=== Regenerating SEO data ===");

  try {
    await generateAndSaveJsonLd(id);
    console.log("JSON-LD: regenerated");
  } catch (e: unknown) {
    console.error("JSON-LD error:", e instanceof Error ? e.message : e);
  }

  try {
    await generateAndSaveNextjsMetadata(id, { robots: "index, follow" });
    console.log("Metadata: regenerated");
  } catch (e: unknown) {
    console.error("Metadata error:", e instanceof Error ? e.message : e);
  }

  const after = await db.article.findFirst({
    where: { id },
    select: {
      status: true,
      jsonLdLastGenerated: true,
      nextjsMetadataLastGenerated: true,
      jsonLdStructuredData: true,
      nextjsMetadata: true,
    },
  });

  console.log("\n=== Results ===");
  console.log("Status:", after?.status);
  console.log("JSON-LD generated:", after?.jsonLdLastGenerated);
  console.log("Metadata generated:", after?.nextjsMetadataLastGenerated);

  const j = (after?.jsonLdStructuredData as string) || "";
  console.log("\nJSON-LD validation:");
  console.log("  Has Author (Person):", j.includes('"Person"'));
  console.log("  Has Publisher (Organization):", j.includes('"Organization"'));
  console.log("  Has datePublished:", j.includes("datePublished"));
  console.log("  Has Article:", j.includes('"Article"'));
  console.log("  Length:", j.length, "chars");

  const m = after?.nextjsMetadata as Record<string, unknown> | null;
  console.log("\nMetadata validation:");
  console.log("  Title:", m?.title);
  console.log("  Has OG:", !!m?.openGraph);

  await db.$disconnect();
}

main();
