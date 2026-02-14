import { db } from "@/lib/db";

/**
 * One-off helper to populate fake data for the
 * client with slug "client-3-تسويق-رقمي-الطائف-1768750183960-2"
 * so the client detail page can show all new fields.
 *
 * Can be executed directly with:
 * pnpm --filter @modonty/modonty exec tsx app/clients/[slug]/helpers/seed-client3-test-data.ts
 */
export async function seedClient3TestData() {
  const slug = "client-3-تسويق-رقمي-الطائف-1768750183960-2";

  const client = await db.client.update({
    where: { slug },
    data: {
      businessBrief:
        "وكالة متخصصة في ابتكار وتنفيذ حملات التسويق الرقمي الذكية للعلامات التجارية في الطائف والمملكة، مع تركيز على النتائج القابلة للقياس وزيادة العائد على الاستثمار.",
      targetAudience:
        "أصحاب المشاريع الصغيرة والمتوسطة في الطائف والمنطقة الغربية ممن يبحثون عن شريك تسويق رقمي طويل الأمد.",
      contentPriorities: [
        "حملات إعلانية ممولة على منصات التواصل",
        "تحسين محركات البحث (SEO) للمشاريع المحلية",
        "إدارة المحتوى والباقات الشهرية",
        "تقارير أداء شهرية واضحة وسهلة الفهم",
      ],
      commercialRegistrationNumber: "1010123456",
      addressCity: "الطائف",
      addressRegion: "منطقة مكة المكرمة",
      addressCountry: "المملكة العربية السعودية",
      addressLatitude: 21.4373,
      addressLongitude: 40.5127,
    },
  });

  return client;
}

// Allow running this file directly via `tsx` without affecting imports.
if (process.argv[1]?.includes("seed-client3-test-data")) {
  // eslint-disable-next-line no-console
  seedClient3TestData()
    .then((client) => {
      // eslint-disable-next-line no-console
      console.log("Seeded client test data for:", client.slug);
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to seed client test data:", error);
      process.exit(1);
    });
}


