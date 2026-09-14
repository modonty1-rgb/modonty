import { db } from "../lib/db";
async function run() {
  const industries = await db.industry.findMany({ select: { id: true, name: true }, take: 3 });
  const staff = await db.staff.findMany({ where: { role: { in: ["SALES", "ADMIN"] }, isActive: true }, select: { id: true, name: true, email: true, role: true }, take: 5 });
  console.log("industries:", JSON.stringify(industries));
  console.log("staff:", JSON.stringify(staff));
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
