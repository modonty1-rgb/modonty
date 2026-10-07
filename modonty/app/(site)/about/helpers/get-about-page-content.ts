import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getAboutPageContent() {
  "use cache";
  cacheTag("pages");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "about" },
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
