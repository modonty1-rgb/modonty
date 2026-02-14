import { db } from "../../../../lib/db";

/**
 * Seeds fake test data for the client with slug
 * "client-1-برمجية-جدة-1768750183959-0" so the client detail page,
 * about page (map), hero, and tabs can be tested with full data.
 *
 * Run from repo root:
 *   pnpm --filter @modonty/modonty exec tsx app/clients/[slug]/helpers/seed-client1-test-data.ts
 *
 * Or from modonty directory:
 *   pnpm run seed:client1
 */
const CLIENT_SLUG = "client-1-برمجية-جدة-1768750183959-0";

export async function seedClient1TestData() {
  const client = await db.client.findUnique({
    where: { slug: CLIENT_SLUG },
    select: { id: true, name: true },
  });

  if (!client) {
    throw new Error(`Client not found with slug: ${CLIENT_SLUG}. Create the client first in the admin.`);
  }

  await db.client.update({
    where: { slug: CLIENT_SLUG },
    data: {
      businessBrief:
        "شركة برمجية رائدة في جدة متخصصة في تطوير الحلول البرمجية والتحول الرقمي للشركات في المملكة والمنطقة.",
      description:
        "نقدم خدمات تطوير الويب والتطبيقات، استشارات التحول الرقمي، وحلول السحابة. فريقنا يعمل مع أفضل الممارسات لضمان جودة عالية وتسليم في الوقت المحدد.",
      targetAudience:
        "الشركات الصغيرة والمتوسطة، المؤسسات الحكومية، والشركات الناشئة في منطقة مكة المكرمة والمملكة.",
      contentPriorities: [
        "أخبار التقنية والبرمجة",
        "دليل استخدام المنتجات",
        "قصص نجاح العملاء",
        "نصائح التحول الرقمي",
      ],
      commercialRegistrationNumber: "1010987654",
      legalForm: "شركة ذات مسؤولية محدودة",
      numberOfEmployees: "25-50",
      addressStreet: "طريق الملك عبدالعزيز",
      addressCity: "جدة",
      addressRegion: "منطقة مكة المكرمة",
      addressCountry: "المملكة العربية السعودية",
      addressPostalCode: "23442",
      addressLatitude: 21.5433,
      addressLongitude: 39.1728,
      url: "https://example-jeddah-dev.com",
      sameAs: [
        "https://www.linkedin.com/company/example-jeddah",
        "https://twitter.com/example_jeddah",
        "https://www.facebook.com/examplejeddah",
      ],
      seoTitle: "برمجية جدة | حلول برمجية وتطوير تطبيقات في جدة",
      seoDescription:
        "شركة برمجية في جدة تقدم تطوير مواقع وتطبيقات، استشارات تحول رقمي، وحلول سحابية للشركات في المملكة.",
      foundingDate: new Date("2019-06-01"),
    },
  });

  const updated = await db.client.findUnique({
    where: { slug: CLIENT_SLUG },
    select: {
      name: true,
      slug: true,
      addressCity: true,
      addressLatitude: true,
      addressLongitude: true,
      url: true,
      sameAs: true,
    },
  });

  return updated;
}

if (process.argv[1]?.includes("seed-client1-test-data")) {
  seedClient1TestData()
    .then((client) => {
      // eslint-disable-next-line no-console
      console.log("Seeded test data for client:", client?.name, "(", client?.slug, ")");
      // eslint-disable-next-line no-console
      console.log("Map coords:", client?.addressLatitude, client?.addressLongitude);
      process.exit(0);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Failed to seed client test data:", error);
      process.exit(1);
    });
}
