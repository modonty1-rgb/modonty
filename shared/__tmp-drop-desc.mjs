import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const count = async () =>
  (await db.$runCommandRaw({ count: "commercial_plans", query: { description: { $exists: true } } })).n;
console.log("صفوف فيها description قبل:", await count());
const res = await db.$runCommandRaw({
  update: "commercial_plans",
  updates: [{ q: {}, u: { $unset: { description: "" } }, multi: true }],
});
console.log("عُدِّل:", res.nModified);
console.log("صفوف فيها description بعد:", await count());
await db.$disconnect();
