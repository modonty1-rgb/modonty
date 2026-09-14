import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const before = await db.commercialPlan.findMany({ orderBy: { displayOrder: "asc" }, select: { name: true, highlights: true } });
before.forEach((p) => console.log("قبل:", p.name.padEnd(10), p.highlights.length, "سطر"));
await db.commercialPlan.updateMany({ data: { highlights: [] } });
const after = await db.commercialPlan.findMany({ orderBy: { displayOrder: "asc" }, select: { name: true, highlights: true } });
after.forEach((p) => console.log("بعد:", p.name.padEnd(10), p.highlights.length, "سطر"));
await db.$disconnect();
