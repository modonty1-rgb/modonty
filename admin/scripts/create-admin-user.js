/**
 * Script to create an admin user
 * Usage: node admin/scripts/create-admin-user.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = "nadis@gmail.com";
    const password = "123456";
    const name = "Nadis Admin";

    console.log("🔄 Creating admin user...\n");

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
    console.log("🔐 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    console.log("👤 Creating user in database...");
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

    console.log("\n✅ Admin user created successfully!");
    console.log("\n" + "=".repeat(50));
    console.log("📧 LOGIN CREDENTIALS");
    console.log("=".repeat(50));
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log("=".repeat(50));
    console.log("\n👤 USER DETAILS");
    console.log("=".repeat(50));
    console.log(`ID:         ${user.id}`);
    console.log(`Name:       ${user.name}`);
    console.log(`Role:       ${user.role}`);
    console.log(`Created At: ${user.createdAt.toISOString()}`);
    console.log("=".repeat(50));
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("\n🌐 You can now login at:");
    console.log("   Admin Panel: http://localhost:3001/login");
    console.log("   Frontend:    http://localhost:3000/login");
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log("\n✨ Script completed successfully!\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error.message);
    process.exit(1);
  });
