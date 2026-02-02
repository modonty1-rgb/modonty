import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function createTestUser() {
  try {
    console.log("Creating test user...");

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: "test@modonty.com" },
    });

    if (existingUser) {
      console.log("✅ Test user already exists!");
      console.log("Email: test@modonty.com");
      console.log("Password: Test123456!");
      console.log("User ID:", existingUser.id);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("Test123456!", 10);

    // Create test user
    const user = await db.user.create({
      data: {
        email: "test@modonty.com",
        name: "Test User",
        password: hashedPassword,
        role: "CLIENT",
        emailVerified: new Date(),
      },
    });

    console.log("✅ Test user created successfully!");
    console.log("==========================================");
    console.log("Email: test@modonty.com");
    console.log("Password: Test123456!");
    console.log("User ID:", user.id);
    console.log("==========================================");
    console.log("You can now login with these credentials");
  } catch (error) {
    console.error("❌ Error creating test user:", error);
  } finally {
    await db.$disconnect();
  }
}

createTestUser();
