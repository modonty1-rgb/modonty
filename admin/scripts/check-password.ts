import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "modonty@modonty.com" },
  });
  
  if (!user) {
    console.log("User not found");
    return;
  }
  
  console.log("User found:");
  console.log(`  Email: ${user.email}`);
  console.log(`  Name: ${user.name}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Has password: ${!!user.password}`);
  console.log(`  Password hash: ${user.password?.substring(0, 20)}...`);
  
  // Test if password matches
  const testPassword = "Modonty123!";
  const isValid = await bcrypt.compare(testPassword, user.password!);
  console.log(`\n  Test password "${testPassword}" matches: ${isValid}`);
}

main().finally(() => prisma.$disconnect());
