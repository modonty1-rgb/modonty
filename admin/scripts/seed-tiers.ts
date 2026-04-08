import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty_dev?retryWrites=true&w=majority&appName=modonty-cluster",
    },
  },
});

const tiers = [
  { tier: "BASIC" as const,    name: "Basic",    articlesPerMonth: 2,  price: 1200, isActive: true,  isPopular: false, description: "للشركات الناشئة" },
  { tier: "STANDARD" as const, name: "Standard", articlesPerMonth: 4,  price: 2400, isActive: true,  isPopular: false, description: "للشركات المتوسطة" },
  { tier: "PRO" as const,      name: "Pro",      articlesPerMonth: 8,  price: 4800, isActive: true,  isPopular: true,  description: "للشركات الكبيرة" },
  { tier: "PREMIUM" as const,  name: "Premium",  articlesPerMonth: 16, price: 9600, isActive: true,  isPopular: false, description: "للمؤسسات الكبرى" },
];

async function main() {
  for (const t of tiers) {
    const existing = await prisma.subscriptionTierConfig.findUnique({ where: { tier: t.tier } });
    if (existing) {
      console.log(`⏭  ${t.name} already exists`);
      continue;
    }
    await prisma.subscriptionTierConfig.create({ data: t });
    console.log(`✅ Created: ${t.name}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
