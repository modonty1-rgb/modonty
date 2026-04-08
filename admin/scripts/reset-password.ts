import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!email || !newPassword) {
    console.log("Usage: pnpm exec tsx scripts/reset-password.ts <email> <password>");
    process.exit(1);
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log(`✅ Password reset for ${user.email}`);
}

main().finally(() => prisma.$disconnect());
