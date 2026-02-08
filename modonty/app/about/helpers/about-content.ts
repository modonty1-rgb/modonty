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
      content: true,
      heroImage: true,
      heroImageAlt: true,
    },
  });
}
