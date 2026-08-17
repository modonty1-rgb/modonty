import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

/**
 * The editable body of the contact page — heading, intro copy and the stored JSON-LD.
 * The form itself stays in code; only the words around it come from the DB.
 */
export async function getContactPageContent() {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "contact" },
    select: {
      title: true,
      // The admin-generated card — the page prefers it and only builds live as a fallback.
      jsonLdStructuredData: true,
      content: true,
      heroImage: true,
      heroImageAlt: true,
    },
  });
}
