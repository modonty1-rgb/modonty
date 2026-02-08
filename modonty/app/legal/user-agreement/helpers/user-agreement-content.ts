import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";

export async function getUserAgreementPageContent() {
  "use cache";
  cacheTag("legal");
  cacheLife("hours");

  return db.modonty.findUnique({
    where: { slug: "user-agreement" },
    select: {
      title: true,
      content: true,
      updatedAt: true,
    },
  });
}
