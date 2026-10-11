// سكربت Edge على بني: يستقبل ملفاً من المتصفح مباشرة ويكتبه في التخزين — الملف لا يمرّ على Vercel.
//
// الأمان: السيرفر (الأدمن أو الكونسول) يوقّع تذكرة لمسار واحد وحجم أقصى ومدّة قصيرة؛ هذا السكربت يتحقّق منها
// ثم يكتب بكلمة سرّ المنطقة المحفوظة عنده سرّاً (bunny.net/docs/scripting/secrets) — المتصفح لا يراها.
// التوقيع: HMAC-SHA256(UPLOAD_SIGNING_SECRET, `${zone}|${path}|${exp}|${max}`) — نفس `shared/lib/bunny-upload-ticket.ts`.
//
// يُنشر بـ `node admin/scripts/bunny-edge/deploy-upload-script.cjs`، والأسرار تُضبط من هناك.
import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk";
import process from "node:process";

const enc = new TextEncoder();
const MAX_ALLOWED = 50 * 1024 * 1024;
const MAX_TTL_SECONDS = 15 * 60;
const ZONES = {
  clients: ["CLIENTS_ZONE", "CLIENTS_KEY"],
  assets: ["ASSETS_ZONE", "ASSETS_KEY"],
  reels: ["REELS_ZONE", "REELS_KEY"],
};

async function hmacHex(key, data) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", k, enc.encode(data));
  return [...new Uint8Array(s)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function corsHeaders(origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return { Vary: "Origin" };
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
  };
}

function reply(status, body, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

BunnySDK.net.http.serve(async (req) => {
  const cors = corsHeaders(req.headers.get("origin") || "");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "PUT") return reply(405, { error: "method" }, cors);

  const q = new URL(req.url).searchParams;
  const zone = q.get("zone") || "";
  const path = q.get("path") || "";
  const exp = Number(q.get("exp") || 0);
  const max = Number(q.get("max") || 0);
  const sig = q.get("sig") || "";
  const now = Math.floor(Date.now() / 1000);

  if (!ZONES[zone]) return reply(400, { error: "zone" }, cors);
  if (!path || path.startsWith("/") || path.includes("..") || path.length > 512) return reply(400, { error: "path" }, cors);
  if (!exp || exp < now || exp > now + MAX_TTL_SECONDS) return reply(403, { error: "expired" }, cors);
  if (!max || max > MAX_ALLOWED) return reply(400, { error: "max" }, cors);
  if ((await hmacHex(process.env.UPLOAD_SIGNING_SECRET, `${zone}|${path}|${exp}|${max}`)) !== sig) {
    return reply(403, { error: "signature" }, cors);
  }

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > max) return reply(413, { error: "too large" }, cors);
  const body = await req.arrayBuffer();
  if (!body.byteLength) return reply(400, { error: "empty" }, cors);
  if (body.byteLength > max) return reply(413, { error: "too large" }, cors);

  const [zoneVar, keyVar] = ZONES[zone];
  const host = process.env.STORAGE_HOST || "storage.bunnycdn.com";
  const res = await fetch(`https://${host}/${process.env[zoneVar]}/${path}`, {
    method: "PUT",
    headers: { AccessKey: process.env[keyVar], "Content-Type": req.headers.get("content-type") || "application/octet-stream" },
    body,
  });
  if (!res.ok) return reply(502, { error: "storage", status: res.status }, cors);
  return reply(201, { path, bytes: body.byteLength }, cors);
});
