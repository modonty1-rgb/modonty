// ينشر سكربت الرفع المباشر على Bunny Edge Scripting ويضبط أسراره — من واجهة بني الرسمية:
// POST /compute/script · POST /compute/script/{id}/code · PUT /compute/script/{id}/secrets · POST /compute/script/{id}/publish
//
// الاستعمال: node admin/scripts/bunny-edge/deploy-upload-script.cjs
//   - يقرأ المفاتيح من .env.shared (BUNNY_API_KEY · BUNNY_STORAGE_* · BUNNY_ASSETS_STORAGE_* · BUNNY_REELS_STORAGE_* · BUNNY_UPLOAD_*).
//   - إن لم يوجد BUNNY_UPLOAD_SCRIPT_ID ينشئ السكربت ويطبع المعرّف والرابط لإضافتهما إلى .env.shared وVercel.
//   - لا يطبع أي سرّ.
const fs = require("fs");
const path = require("path");
require("dns").setServers(["8.8.8.8", "1.1.1.1"]);

const ROOT = path.resolve(__dirname, "../../..");
const env = {};
for (const line of fs.readFileSync(path.join(ROOT, ".env.shared"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\r\n]*)"?\s*$/);
  if (m) env[m[1]] = m[2];
}
const need = (k) => {
  if (!env[k]) throw new Error(`missing ${k} in .env.shared`);
  return env[k];
};
const API = "https://api.bunny.net";
const headers = { AccessKey: need("BUNNY_API_KEY"), "Content-Type": "application/json", Accept: "application/json" };
const call = async (method, p, body) => {
  const r = await fetch(API + p, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} → ${r.status} ${t.slice(0, 300)}`);
  return t ? JSON.parse(t) : null;
};

(async () => {
  const code = fs.readFileSync(path.join(__dirname, "upload-script.js"), "utf8");
  let id = env.BUNNY_UPLOAD_SCRIPT_ID;
  if (!id) {
    const s = await call("POST", "/compute/script", {
      Name: "modonty-upload",
      Code: code,
      ScriptType: 1,
      CreateLinkedPullZone: true,
      LinkedPullZoneName: "modonty-upload",
    });
    id = String(s.Id);
    console.log(`created script ${id} · host ${s.SystemHostname || s.DefaultHostname}`);
    console.log("→ add to .env.shared and Vercel (admin): BUNNY_UPLOAD_SCRIPT_ID=" + id + " · BUNNY_UPLOAD_EDGE_URL=" + (s.SystemHostname || s.DefaultHostname));
  } else {
    await call("POST", `/compute/script/${id}/code`, { Code: code });
    console.log(`updated code of script ${id}`);
  }
  const secrets = {
    CLIENTS_ZONE: need("BUNNY_STORAGE_ZONE_NAME"),
    CLIENTS_KEY: need("BUNNY_STORAGE_PASSWORD"),
    ASSETS_ZONE: need("BUNNY_ASSETS_STORAGE_ZONE_NAME"),
    ASSETS_KEY: need("BUNNY_ASSETS_STORAGE_PASSWORD"),
    REELS_ZONE: need("BUNNY_REELS_STORAGE_ZONE_NAME"),
    REELS_KEY: need("BUNNY_REELS_STORAGE_PASSWORD"),
    STORAGE_HOST: env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com",
    UPLOAD_SIGNING_SECRET: need("BUNNY_UPLOAD_SIGNING_SECRET"),
    ALLOWED_ORIGINS: env.BUNNY_UPLOAD_ALLOWED_ORIGINS || "https://admin.modonty.com,https://console.modonty.com,http://localhost:3001,http://localhost:3002",
  };
  for (const [Name, Secret] of Object.entries(secrets)) await call("PUT", `/compute/script/${id}/secrets`, { Name, Secret });
  console.log(`secrets set: ${Object.keys(secrets).join(", ")}`);
  await call("POST", `/compute/script/${id}/publish`, { Note: "deploy-upload-script" });
  console.log("published");
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
