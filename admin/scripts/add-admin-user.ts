import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as readline from "readline";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env file manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../.env");

try {
  const envFile = readFileSync(envPath, "utf-8");
  envFile.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");
      process.env[key.trim()] = value;
    }
  });
} catch (error) {
  console.warn("Warning: Could not load .env file:", error);
}

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function addAdminUser() {
  try {
    console.log("=== Add Admin User ===\n");

    // Check for command line arguments
    const args = process.argv.slice(2);
    let name: string;
    let email: string;
    let password: string;

    if (args.length === 3) {
      // Use command line arguments
      [name, email, password] = args;
      console.log(`Creating admin user: ${name} (${email})\n`);
    } else {
      // Interactive mode
      name = await question("Name: ");
      email = await question("Email: ");
      password = await question("Password: ");
    }

    if (!name || !email || !password) {
      console.error("❌ All fields are required!");
      console.error("Usage: pnpm add-admin <name> <email> <password>");
      process.exit(1);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format!");
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`❌ User with email ${email} already exists!`);
      process.exit(1);
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    console.log("Creating admin user...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
    });

    console.log("\n✅ Admin user created successfully!");
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt.toISOString()}`);
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

addAdminUser();
