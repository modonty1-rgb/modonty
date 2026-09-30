// Create (or refresh) N labelled test subscribers on modonty_dev. Idempotent: re-running resets
// their password and name, never duplicates. Usage: node <skill>/scripts/seed-subscribers.mjs --count 20
import { db, bcrypt, TEST_EMAIL, TEST_PASSWORD, arg } from "./_db.mjs";

const count = Number(arg("count", "20"));
const hash = await bcrypt.hash(TEST_PASSWORD, 10);
const out = [];
for (let n = 1; n <= count; n++) {
  const email = TEST_EMAIL(n);
  const name = `[تجربة] مشترك ${String(n).padStart(2, "0")}`;
  const u = await db.user.upsert({
    where: { email },
    update: { password: hash, name, emailVerified: new Date() },
    create: { email, name, password: hash, emailVerified: new Date() },
    select: { id: true, email: true },
  });
  out.push(u);
}
console.log(`seeded ${out.length} test subscribers · password: ${TEST_PASSWORD}`);
for (const u of out) console.log(`  ${u.email}  ${u.id}`);
await db.$disconnect();
