import * as dotenv from "dotenv";
import * as path from "path";
import bcrypt from "bcryptjs";

dotenv.config({ path: path.resolve(process.cwd(), "modonty", ".env") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

async function main() {
  const { db } = await import("../modonty/lib/db");
  const testPassword = process.env.DASHBOARD_PASSWORD || "password123";

  const client = await db.client.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, slug: true, email: true, name: true },
  });
  if (!client) {
    console.log("No clients in DB. Seed first: pnpm seed");
    process.exit(1);
  }
  const hashed = await bcrypt.hash(testPassword, 10);
  await db.client.update({
    where: { id: client.id },
    data: { password: hashed },
  });
  console.log("Console test client password set.");
  console.log("Login with:");
  console.log("  Slug:   ", client.slug);
  console.log("  Email:  ", client.email ?? "(none)");
  console.log("  Password:", testPassword);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
