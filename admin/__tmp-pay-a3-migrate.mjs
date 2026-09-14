import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

const raw = await db.$runCommandRaw({ find: 'commercial_plan_terms', limit: 1000 });
const docs = raw.cursor?.firstBatch ?? [];

const distinct = new Map();
for (const d of docs) {
  const key = `${d.paidMonths}:${d.bonusServiceMonths}`;
  if (!distinct.has(key)) distinct.set(key, { paidMonths: d.paidMonths, bonusServiceMonths: d.bonusServiceMonths });
}
const rows = [...distinct.values()].sort((a, b) => a.paidMonths - b.paidMonths);
console.log('distinct policy rows to create:', rows);

for (const row of rows) {
  await db.commercialTermPolicy.create({ data: { paidMonths: row.paidMonths, bonusServiceMonths: row.bonusServiceMonths, displayOrder: row.paidMonths } });
}

const created = await db.commercialTermPolicy.findMany({ orderBy: { displayOrder: 'asc' } });
console.log('created commercial_term_policies:', JSON.stringify(created, null, 2));

const dropResult = await db.$runCommandRaw({ drop: 'commercial_plan_terms' });
console.log('drop old collection result:', JSON.stringify(dropResult));

await db.$disconnect();
