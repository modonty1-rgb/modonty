import dotenv from "dotenv";
import path from "path";
import { google } from "googleapis";

dotenv.config({ path: path.join(__dirname, "../.env.local"), override: true });

async function test() {
  const b64 = process.env.GSC_MODONTY_KEY_BASE64;
  if (!b64) { console.error("❌ GSC_MODONTY_KEY_BASE64 not set"); process.exit(1); }

  const creds = JSON.parse(Buffer.from(b64, "base64").toString("utf-8")) as {
    client_email: string;
    private_key: string;
  };

  console.log("✅ Key parsed — client_email:", creds.client_email);

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const gsc = google.webmasters({ version: "v3", auth });

  console.log("→ Calling sites.list ...");
  const res = await gsc.sites.list();
  const sites = res.data.siteEntry ?? [];

  if (sites.length === 0) {
    console.warn("⚠️  No sites found — service account may not be verified yet for modonty.com");
  } else {
    console.log("✅ Sites accessible:");
    sites.forEach((s) => console.log(`   ${s.siteUrl}  [${s.permissionLevel}]`));
  }
}

test().catch((e) => {
  console.error("❌ Error:", (e as Error).message);
  process.exit(1);
});
