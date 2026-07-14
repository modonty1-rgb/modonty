/**
 * Run before every push: pnpm changelog
 * Updates entries below — writes to LOCAL + PROD instantly.
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

// ─── UPDATE THESE BEFORE EVERY PUSH ──────────────────────────────────────────
const entries = [
  {
    version: "0.87.1 (admin)",
    title: "The cascade was about to overwrite every client card — and two of our medical types do not exist on schema.org",
    items: [
      { type: "fix" as const, text: "Trigger Full Cascade would have rewritten all 27 client cards with the WRONG type — it builds through a path that never saw the new rule, so a clinic would have gone back to being a 'Corporation'. The rule now lives inside the card builder itself, so every path — cascade, save, new client, console — produces the same card. Caught on dev before it ever ran in production." },
      { type: "fix" as const, text: "The cascade was also stripping opening hours and price range from every client it touched: its own query never asked for those fields, and a field you do not read is a field the client appears not to have. It now goes through the shared generator, so a cascade and a save produce identical cards." },
      { type: "fix" as const, text: "Two schema.org types we hand Google were wrong. A physiotherapy clinic was typed 'PhysicalTherapy' — which is a medical PROCEDURE, not a business, so the clinic was announcing itself as a treatment. And a nutrition clinic was typed 'Dietitian', a type that does not exist on schema.org at all (404). Corrected to Physiotherapy and DietNutrition." },
      { type: "fix" as const, text: "Three different lists decided which businesses may carry an address, coordinates and opening hours — the builder knew 16 types, the SEO score knew 9, and neither knew Optician. So two eye clinics were given the medical type and then denied the address that type exists to carry, and a hospital was scored as if its address did not matter. One list now, shared." },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

// Hardcoded PROD DB URL (user decision 2026-04-29) — to avoid env juggling.
// ⚠️ Trade-off: URL credentials are in git history. Rotate Atlas password = update all 3 changelog scripts.
const PRODUCTION_DATABASE_URL = "mongodb+srv://modonty-admin:2053712713@modonty-cluster.tgixa8h.mongodb.net/modonty?retryWrites=true&w=majority&appName=modonty-cluster";

const localDb = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
const prodDb = new PrismaClient({ datasources: { db: { url: PRODUCTION_DATABASE_URL } } });

async function run() {
  if (!process.env.DATABASE_URL) { console.error("❌ DATABASE_URL missing"); process.exit(1); }

  for (const entry of entries) {
    const [local, prod] = await Promise.all([
      localDb.changelog.create({ data: entry }),
      prodDb.changelog.create({ data: entry }),
    ]);
    console.log(`✅ v${entry.version} — LOCAL: ${local.id}  PROD: ${prod.id}`);
  }

  console.log(`\nDone. ${entries.length} entries added to both databases.`);
  await Promise.all([localDb.$disconnect(), prodDb.$disconnect()]);
}

run().catch((e) => { console.error(e); process.exit(1); });
