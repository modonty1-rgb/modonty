// دفعة السكيما إلى قاعدة الإنتاج + فهرس النطاق الفرعي — خطوتان بالترتيب.
//
// يُنفَّذ مرّة واحدة بعد وصول الكود إلى الإنتاج:  node scripts/prod-db-push.mjs
//
// يقرأ رابط الإنتاج من السطر المعلَّق في `.env.shared` بنفسه، فلا تُعدَّل ملفّات env
// ولا يبقى الرابط مفعَّلاً بعد الانتهاء. يطبع اسم القاعدة قبل أن يكتب بايتاً واحداً،
// ويتوقّف فوراً إن لم تكن `modonty`.
//
// الفهرس في الخطوة ٢ ليس رفاهية: `@unique` في سكيما مونجو يبني فهرساً عادياً، ومونجو
// يفهرس الحقل الغائب على أنه null — فصفٌّ واحد فقط يُسمح له بلا نطاق فرعي، والشريك
// الثاني الذي يحفظ شكل موقعه يأخذ P2002 على حقل لم يلمسه. الفهرس الجزئيّ يفهرس
// النصوص الحقيقية وحدها، فيتعايش الجميع ويُرفض المكرَّر وحده.
import fs from "node:fs";
import dns from "node:dns";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

const ROOT = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ── رابط الإنتاج من السطر المعلَّق ─────────────────────────────────────────────
const lines = fs.readFileSync(`${ROOT}/.env.shared`, "utf8").split(/\r?\n/);
let prodUrl = null;
for (const l of lines) {
  const m = l.match(/^\s*#?\s*DATABASE_URL\s*=\s*"([^"]+)"/);
  if (!m) continue;
  if ((m[1].match(/net\/([A-Za-z0-9_-]+)/) || [])[1] === "modonty") { prodUrl = m[1]; break; }
}
if (!prodUrl) { console.error("⛔ لم أجد رابط الإنتاج في .env.shared"); process.exit(1); }

const dbName = (prodUrl.match(/net\/([A-Za-z0-9_-]+)/) || [])[1];
if (dbName !== "modonty") { console.error("⛔ القاعدة ليست الإنتاج:", dbName); process.exit(1); }

console.log("═".repeat(52));
console.log("  القاعدة المستهدَفة :", dbName, "(الإنتاج)");
console.log("  الرابط            :", prodUrl.replace(/:\/\/[^@]+@/, "://***@").split("?")[0]);
console.log("═".repeat(52));

// ── ١ · دفعة السكيما ──────────────────────────────────────────────────────────
console.log("\n→ ١/٢  prisma db push …\n");
try {
  execSync(`npx prisma db push --schema=./prisma/schema/schema.prisma --skip-generate`, {
    cwd: `${ROOT}/shared`,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: prodUrl },
  });
} catch {
  console.error("\n⛔ فشلت الدفعة — توقّف هنا ولا تكمل. أبلغ كلود بالناتج كاملاً.");
  process.exit(1);
}

// ── ٢ · الفهرس الجزئيّ ────────────────────────────────────────────────────────
console.log("\n→ ٢/٢  فهرس النطاق الفرعي …\n");
const require = createRequire(`${ROOT}/shared/package.json`);
const { MongoClient } = require("mongodb");

const client = new MongoClient(prodUrl);
await client.connect();
const col = client.db(dbName).collection("client_sites");

const before = await col.indexes().catch(() => []);
const plain = before.find((i) => i.name === "client_sites_subdomain_key");
if (plain) {
  await col.dropIndex("client_sites_subdomain_key");
  console.log("  حُذف الفهرس العادي: client_sites_subdomain_key");
}

await col.createIndex(
  { subdomain: 1 },
  {
    unique: true,
    name: "client_sites_subdomain_partial_unique",
    partialFilterExpression: { subdomain: { $type: "string" } },
  },
);

const after = await col.indexes();
console.log("\n  فهارس client_sites بعد التنفيذ:");
for (const ix of after) {
  console.log(
    "   ·", ix.name,
    "| unique:", ix.unique === true,
    "| partial:", ix.partialFilterExpression ? JSON.stringify(ix.partialFilterExpression) : "لا",
  );
}
const ok = after.some((i) => i.name === "client_sites_subdomain_partial_unique");
console.log("\n" + (ok ? "✅ الخطوتان تمّتا." : "⛔ الفهرس لم يُنشأ — أبلغ كلود."));
await client.close();
