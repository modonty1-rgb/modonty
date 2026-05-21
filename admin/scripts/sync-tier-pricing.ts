/**
 * One-shot: write `pricing` JSON onto SubscriptionTierConfig rows.
 * Pricing source: JBRSEO landing-{sa,eg}.ts (the canonical pricing surface).
 * Run once: pnpm tsx scripts/sync-tier-pricing.ts
 */
import dotenv from "dotenv";
import path from "path";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: path.join(__dirname, "../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env.shared") });

// Mirrored from JBRSEO/antigravitty-jbrseo/app/content/landing/landing-{sa,eg}.ts
// mo = monthly subscription · yr = monthly equivalent of annual plan
const PRICING_BY_NAME: Record<string, { jbrseoId: string; SA: { mo: number; yr: number }; EG: { mo: number; yr: number } }> = {
  "مجاني":       { jbrseoId: "free",    SA: { mo: 0,    yr: 0    }, EG: { mo: 0,    yr: 0    } },
  "الانطلاقة":   { jbrseoId: "starter", SA: { mo: 499,  yr: 399  }, EG: { mo: 1499, yr: 1199 } },
  "الزخم":       { jbrseoId: "growth",  SA: { mo: 1299, yr: 1039 }, EG: { mo: 3999, yr: 3199 } },
  "الريادة":     { jbrseoId: "scale",   SA: { mo: 2999, yr: 2399 }, EG: { mo: 8999, yr: 7199 } },
};

const db = new PrismaClient();

async function main() {
  const tiers = await db.subscriptionTierConfig.findMany({ select: { id: true, name: true } });
  console.log(`Found ${tiers.length} tiers in DB`);

  for (const t of tiers) {
    const cfg = PRICING_BY_NAME[t.name];
    if (!cfg) {
      console.warn(`⏭  No mapping for tier "${t.name}" — skipped`);
      continue;
    }
    await db.subscriptionTierConfig.update({
      where: { id: t.id },
      data: {
        jbrseoId: cfg.jbrseoId,
        pricing: { SA: cfg.SA, EG: cfg.EG },
        syncedAtSA: new Date(),
        syncedAtEG: new Date(),
      },
    });
    console.log(`✅ ${t.name} — SA ${cfg.SA.mo}/${cfg.SA.yr} · EG ${cfg.EG.mo}/${cfg.EG.yr}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
