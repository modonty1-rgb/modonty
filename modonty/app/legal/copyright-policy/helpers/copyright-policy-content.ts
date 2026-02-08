import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getCopyrightPolicyPageContent() {
  "use cache";
  cacheTag("legal");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "copyright-policy" },
    select: {
      title: true,
      content: true,
      updatedAt: true,
    },
  });
}
