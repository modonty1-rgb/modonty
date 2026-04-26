/**
 * Debug: call notifyDeleted directly (same function the server action uses).
 * Shows the FULL result object including success/error.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { notifyDeleted, getRemovalMetadata } from "../lib/gsc/indexing";

const TARGET_URL =
  "https://www.modonty.com/articles/النموذج-الأولي-الأول-من-kosmera-سيعرض-عالميًا-في-ces-2026،-مع-إعادة-تعريف-سيارة-السوبر-الكهربائية-الذكية-البوابة-39";

async function main() {
  console.log("─── pre-check getMetadata ───");
  const before = await getRemovalMetadata(TARGET_URL);
  console.log("Before:", before);

  console.log("\n─── calling notifyDeleted ───");
  const result = await notifyDeleted(TARGET_URL);
  console.log("Result:", JSON.stringify(result, null, 2));

  console.log("\n─── post-check getMetadata ───");
  const after = await getRemovalMetadata(TARGET_URL);
  console.log("After:", after);
}

main().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});
