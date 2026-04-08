import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("=== Users in dev database ===");
  users.forEach(user => {
    console.log(`📧 ${user.email} (Role: ${user.role})`);
  });
  console.log(`\nTotal: ${users.length} users`);
}

main().finally(() => prisma.$disconnect());
