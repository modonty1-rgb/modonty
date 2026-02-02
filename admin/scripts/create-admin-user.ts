/**
 * Script to create an admin user
 * Usage: npx tsx admin/scripts/create-admin-user.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = "nadis@gmail.com";
    const password = "123456";
    const name = "Nadis Admin";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`❌ User with email ${email} already exists!`);
      console.log(`User ID: ${existingUser.id}`);
      console.log(`Role: ${existingUser.role}`);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "ADMIN",
        emailVerified: new Date(), // Mark email as verified
        clientAccess: [], // Admin can access all clients
      },
    });

    console.log("✅ Admin user created successfully!");
    console.log("\n📧 Login Credentials:");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`\n👤 User Details:`);
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Created At: ${user.createdAt}`);
    console.log("\n⚠️  Remember to change the password after first login!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log("\n✨ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
