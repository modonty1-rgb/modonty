import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkToken() {
  const user = await prisma.user.findUnique({
    where: { email: "dreamtoapp@gmail.com" },
    select: {
      id: true,
      email: true,
      role: true,
      passwordResetToken: true,
      passwordResetExpires: true,
    },
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("\n=== USER RESET TOKEN INFO ===");
  console.log("Email:", user.email);
  console.log("Role:", user.role);
  console.log("Token in DB:", user.passwordResetToken);
  console.log("Expires:", user.passwordResetExpires?.toISOString());
  console.log("Is Expired:", user.passwordResetExpires ? user.passwordResetExpires < new Date() : "No expiry set");
  console.log("==============================\n");

  await prisma.$disconnect();
}

checkToken().catch(console.error);
