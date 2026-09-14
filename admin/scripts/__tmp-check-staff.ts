import { db } from "../lib/db";
async function run() {
  const staff = await db.staff.findUnique({ where: { email: "claude-check@modonty.local" }, select: { id: true, email: true, role: true, isActive: true } });
  console.log(JSON.stringify(staff));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
