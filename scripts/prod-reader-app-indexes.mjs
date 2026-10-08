// فهارس تطبيق القارئ على قاعدة الإنتاج — يشغّله خالد بنفسه مرّة واحدة قبل نشر الـAPI:
//   node scripts/prod-reader-app-indexes.mjs
//
// بدل `prisma db push` الكامل: الدفعة الكاملة تعيد بناء فهرس client_sites_subdomain_key العادي
// الذي استُبدل بفهرس جزئيّ (scripts/prod-db-push.mjs)، فتفشل أو تكسر النطاقات الفرعية.
// هذا السكربت ينشئ فهارس الجداول الأربعة الجديدة وحدها، بأسماء Prisma نفسها، ولا يحذف ولا يعدّل شيئاً.
// createIndex بنفس المواصفات لا يفعل شيئاً إن كان الفهرس موجوداً.
//
// يقرأ رابط الإنتاج من السطر المعلَّق في `.env.shared`، ويطبع اسم القاعدة قبل أي كتابة،
// ويتوقّف إن لم تكن `modonty`.
import fs from "node:fs";
import dns from "node:dns";
import { createRequire } from "node:module";

const ROOT = "c:/Users/w2nad/Desktop/dreamToApp/MODONTY";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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
console.log("═".repeat(52));

const INDEXES = [
  ["reader_devices", { expoPushToken: 1 }, { name: "reader_devices_expoPushToken_key", unique: true }],
  ["reader_devices", { userId: 1, enabled: 1 }, { name: "reader_devices_userId_enabled_idx" }],
  ["reader_devices", { deviceId: 1 }, { name: "reader_devices_deviceId_idx" }],
  ["reader_push_tickets", { ticketId: 1 }, { name: "reader_push_tickets_ticketId_key", unique: true }],
  ["reader_push_tickets", { createdAt: 1 }, { name: "reader_push_tickets_createdAt_idx" }],
  ["reader_sessions", { userId: 1 }, { name: "reader_sessions_userId_idx" }],
  ["mobile_login_attempts", { key: 1, createdAt: 1 }, { name: "mobile_login_attempts_key_createdAt_idx" }],
  ["mobile_login_attempts", { createdAt: 1 }, { name: "mobile_login_attempts_createdAt_idx" }],
];

const require = createRequire(`${ROOT}/shared/package.json`);
const { MongoClient } = require("mongodb");
const client = new MongoClient(prodUrl);
await client.connect();
const db = client.db(dbName);

let failed = 0;
for (const [collection, keys, options] of INDEXES) {
  try {
    await db.collection(collection).createIndex(keys, options);
    console.log("  ✓", collection, "·", options.name);
  } catch (error) {
    failed += 1;
    console.error("  ⛔", collection, "·", options.name, "—", error.message);
  }
}
await client.close();
console.log("\n" + (failed ? `⛔ ${failed} فهرس لم يُنشأ — أبلغ كلود بالناتج كاملاً.` : "✅ الفهارس الثمانية جاهزة."));
