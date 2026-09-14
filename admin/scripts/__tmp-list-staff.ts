import { db } from "../lib/db";
async function run() {
  const staff = await db.staff.findMany({ select: { id: true, email: true, role: true, isActive: true } });
  console.log(JSON.stringify(staff, null, 2));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
