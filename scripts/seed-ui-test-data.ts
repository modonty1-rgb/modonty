/**
 * Seed script: adds fake categories, industries, tags, and clients
 * for UI stress-testing the sidebar DiscoveryCard + NewClientsCard.
 *
 * Run: npx tsx scripts/seed-ui-test-data.ts
 * Remove: npx tsx scripts/seed-ui-test-data.ts --clean
 */

import { PrismaClient, SubscriptionTier } from "@prisma/client";

const db = new PrismaClient();
const SEED_TAG = "__ui_test__";

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "التسويق الرقمي",      slug: "digital-marketing-test" },
  { name: "تحسين محركات البحث",  slug: "seo-test" },
  { name: "إدارة وسائل التواصل", slug: "social-media-test" },
  { name: "تصميم المواقع",       slug: "web-design-test" },
  { name: "التجارة الإلكترونية", slug: "ecommerce-test" },
  { name: "ريادة الأعمال",       slug: "entrepreneurship-test" },
  { name: "إدارة المشاريع",      slug: "project-management-test" },
  { name: "الذكاء الاصطناعي",    slug: "ai-test" },
  { name: "البرمجة وتطوير التطبيقات", slug: "dev-test" },
  { name: "التسويق بالمحتوى",    slug: "content-marketing-test" },
];

const INDUSTRIES = [
  { name: "الرعاية الصحية",        slug: "healthcare-test" },
  { name: "التجارة الإلكترونية",   slug: "ecommerce-ind-test" },
  { name: "التعليم والتدريب",       slug: "education-test" },
  { name: "العقارات",               slug: "real-estate-test" },
  { name: "المطاعم والضيافة",       slug: "hospitality-test" },
  { name: "التمويل والاستثمار",     slug: "finance-test" },
  { name: "الترفيه والإعلام",       slug: "media-test" },
  { name: "السيارات",               slug: "automotive-test" },
  { name: "الموضة والأزياء",        slug: "fashion-test" },
  { name: "التكنولوجيا والبرمجيات", slug: "tech-test" },
];

const TAGS = [
  { name: "SEO",               slug: "seo-tag-test" },
  { name: "تسويق",             slug: "marketing-tag-test" },
  { name: "محتوى",             slug: "content-tag-test" },
  { name: "تصميم",             slug: "design-tag-test" },
  { name: "برمجة",             slug: "coding-tag-test" },
  { name: "ذكاء اصطناعي",      slug: "ai-tag-test" },
  { name: "ريادة",             slug: "startup-tag-test" },
  { name: "إنتاجية",           slug: "productivity-tag-test" },
  { name: "Google",            slug: "google-tag-test" },
  { name: "أدوات",             slug: "tools-tag-test" },
  { name: "تحليلات",           slug: "analytics-tag-test" },
  { name: "إعلانات",           slug: "ads-tag-test" },
];

const CLIENTS = [
  { name: "مطعم البيت السعودي",   slug: "saudi-home-restaurant-test",  city: "الرياض",  email: "saudi-home@test.modonty" },
  { name: "عيادات الشفاء",        slug: "shifa-clinics-test",           city: "جدة",     email: "shifa@test.modonty" },
  { name: "متجر نور",             slug: "noor-store-test",              city: "الدمام",  email: "noor@test.modonty" },
  { name: "أكاديمية المستقبل",    slug: "future-academy-test",          city: "الرياض",  email: "future-academy@test.modonty" },
  { name: "شركة الأفق العقاري",   slug: "horizon-realty-test",          city: "مكة",     email: "horizon@test.modonty" },
  { name: "مركز الإبداع",         slug: "creativity-center-test",       city: "الرياض",  email: "creativity@test.modonty" },
  { name: "وكالة النجاح",         slug: "success-agency-test",          city: "جدة",     email: "success@test.modonty" },
  { name: "تقنيات الغد",          slug: "tomorrow-tech-test",           city: "الرياض",  email: "tomorrow@test.modonty" },
  { name: "مجموعة الأمل",         slug: "amal-group-test",              city: "الدمام",  email: "amal@test.modonty" },
  { name: "Al Bayt Café Test",    slug: "al-bayt-cafe-test",            city: "الرياض",  email: "albayt@test.modonty" },
  { name: "مختبر البيانات",       slug: "data-lab-test",                city: "جدة",     email: "datalab@test.modonty" },
  { name: "استوديو الحرف",        slug: "craft-studio-test",            city: "الرياض",  email: "craft@test.modonty" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(s: string) { return s.trim().toLowerCase().replace(/\s+/g, "-"); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding UI test data...\n");

  // Categories
  let catCount = 0;
  for (const cat of CATEGORIES) {
    const exists = await db.category.findUnique({ where: { slug: cat.slug } });
    if (!exists) {
      await db.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: `${SEED_TAG} — فئة تجريبية لاختبار الـ UI`,
        },
      });
      catCount++;
    }
  }
  console.log(`✅ Categories: ${catCount} added`);

  // Industries
  let indCount = 0;
  for (const ind of INDUSTRIES) {
    const exists = await db.industry.findUnique({ where: { slug: ind.slug } });
    if (!exists) {
      await db.industry.create({
        data: {
          name: ind.name,
          slug: ind.slug,
          description: `${SEED_TAG} — صناعة تجريبية`,
        },
      });
      indCount++;
    }
  }
  console.log(`✅ Industries: ${indCount} added`);

  // Tags
  let tagCount = 0;
  for (const tag of TAGS) {
    const exists = await db.tag.findUnique({ where: { slug: tag.slug } });
    if (!exists) {
      await db.tag.create({
        data: {
          name: tag.name,
          slug: tag.slug,
          description: `${SEED_TAG} — وسم تجريبي`,
        },
      });
      tagCount++;
    }
  }
  console.log(`✅ Tags: ${tagCount} added`);

  // Clients — need an industry + user for FK
  const firstIndustry = await db.industry.findFirst();
  const firstUser     = await db.user.findFirst();

  if (!firstUser) {
    console.warn("⚠️  No user found — skipping clients. Create at least one user first.");
  } else {
    let cliCount = 0;
    for (const cli of CLIENTS) {
      const exists = await db.client.findUnique({ where: { slug: cli.slug } });
      if (!exists) {
        await db.client.create({
          data: {
            name:             cli.name,
            slug:             cli.slug,
            email:            cli.email,
            description:      `${SEED_TAG} — عميل تجريبي`,
            subscriptionTier: SubscriptionTier.BASIC,
            industryId:       firstIndustry?.id,
            addressCity:      cli.city,
            addressCountry:   "SA",
          },
        });
        cliCount++;
      }
    }
    console.log(`✅ Clients: ${cliCount} added`);
  }

  console.log("\n🎉 Done! Run with --clean to remove test data.");
}

async function clean() {
  console.log("🧹 Removing UI test data...\n");

  const catSlugs = CATEGORIES.map(c => c.slug);
  const indSlugs = INDUSTRIES.map(i => i.slug);
  const tagSlugs = TAGS.map(t => t.slug);
  const cliSlugs = CLIENTS.map(c => c.slug);

  const { count: cc } = await db.category.deleteMany({ where: { slug: { in: catSlugs } } });
  const { count: ic } = await db.industry.deleteMany({ where: { slug: { in: indSlugs } } });
  const { count: tc } = await db.tag.deleteMany({ where: { slug: { in: tagSlugs } } });
  const { count: clc } = await db.client.deleteMany({ where: { slug: { in: cliSlugs } } });

  console.log(`🗑  Categories removed: ${cc}`);
  console.log(`🗑  Industries removed: ${ic}`);
  console.log(`🗑  Tags removed:       ${tc}`);
  console.log(`🗑  Clients removed:    ${clc}`);
  console.log("\n✅ Clean done.");
}

// ─── Entry ────────────────────────────────────────────────────────────────────

const isClean = process.argv.includes("--clean");
(isClean ? clean() : seed())
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
