import bcrypt from "bcryptjs";
import { db } from "../lib/db";

async function run() {
  const email = "claude-check-editor@modonty.local";
  const password = "Mdnty-Local-Check-2026!";
  const hash = await bcrypt.hash(password, 10);
  const staff = await db.staff.upsert({
    where: { email },
    create: { email, name: "Claude Local Check (Editor)", password: hash, role: "EDITOR", isActive: true },
    update: { password: hash, role: "EDITOR", isActive: true },
  });
  console.log(JSON.stringify({ id: staff.id, email: staff.email, role: staff.role }));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
