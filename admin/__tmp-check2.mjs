import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
dotenv.config({ path: "../.env.shared" });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const email = "ui-ux-temp-tester@modonty.local";
const password = "Temp-UiUx-2026!";
const hash = await bcrypt.hash(password, 10);

const existing = await db.staff.findUnique({ where: { email } });
if (existing) {
  await db.staff.update({ where: { email }, data: { password: hash, role: "ADMIN", isActive: true } });
  console.log("updated existing", existing.id);
} else {
  const created = await db.staff.create({ data: { email, name: "UI UX Temp Tester", password: hash, role: "ADMIN", isActive: true } });
  console.log("created", created.id);
}
await db.$disconnect();
