import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getCookiePolicyPageContent() {
  "use cache";
  cacheTag("legal");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "cookie-policy" },
    select: {
      title: true,
      content: true,
      updatedAt: true,
    },
  });
}
