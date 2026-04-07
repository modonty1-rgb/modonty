import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getTermsPageContent() {
  "use cache";
  cacheTag("legal");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "terms" },
    select: {
      title: true,
      content: true,
      updatedAt: true,
    },
  });
}
