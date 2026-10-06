/**
 * «يظهر في» — fills `Client.listedOn` for the clients that existed before the field (Khalid, 3 Oct 2026).
 *
 * /booking used to list every client whose button is a booking form (ctaMode FORM). After the field,
 * it lists only the clients the admin put there — so without this backfill the page goes empty on
 * deploy. Every FORM client gets BOOKING, which keeps /booking exactly as it was. Nobody gets SHOP:
 * the old /shop showed any LINK (WhatsApp included), and which client is a real store is the admin's
 * call now (Rawan's task).
 *
 * Touches only clients whose listedOn is empty, so it is safe to re-run and never undoes an admin's choice.
 *
 *   npx tsx shared/scripts/backfill-client-listed-on.ts            dry run (prints, writes nothing)
 *   npx tsx shared/scripts/backfill-client-listed-on.ts --apply    writes
 *
 * Runs against shared/.env DATABASE_URL (modonty_dev locally). For production, run it once at the push.
 */
import { db } from "../lib/db";

async function main() {
  const apply = process.argv.includes("--apply");
  const formClients = await db.client.findMany({
    where: { ctaMode: "FORM" },
    select: { id: true, name: true, listedOn: true },
  });
  const todo = formClients.filter((c) => (c.listedOn ?? []).length === 0);

  console.log(`FORM clients: ${formClients.length} · without listedOn: ${todo.length} · mode: ${apply ? "APPLY" : "dry run"}`);
  for (const c of todo) console.log(" -", c.name.trim());

  if (apply && todo.length) {
    const res = await db.client.updateMany({
      where: { id: { in: todo.map((c) => c.id) } },
      data: { listedOn: { set: ["BOOKING"] } },
    });
    console.log(`updated: ${res.count}`);
  }
  await db.$disconnect();
}

main();
