import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * Read-only data for the Bunny report page (media inventory + cost + runway).
 * Self-contained on purpose — nothing outside `app/(dashboard)/bunny/` imports from here,
 * and it never imports from the temporary `bunny-migration` route (which will be deleted).
 */

const STORAGE_HOST = process.env.BUNNY_STORAGE_HOSTNAME || "storage.bunnycdn.com";

interface ZoneCfg {
  name: string;
  key: string;
}

function zoneCfg(zone: "clients" | "assets" | "reels"): ZoneCfg | null {
  const name =
    zone === "clients"
      ? process.env.BUNNY_STORAGE_ZONE_NAME
      : zone === "assets"
        ? process.env.BUNNY_ASSETS_STORAGE_ZONE_NAME
        : process.env.BUNNY_REELS_STORAGE_ZONE_NAME;
  const key =
    zone === "clients"
      ? process.env.BUNNY_STORAGE_READONLY_PASSWORD || process.env.BUNNY_STORAGE_PASSWORD
      : zone === "assets"
        ? process.env.BUNNY_ASSETS_STORAGE_READONLY_PASSWORD || process.env.BUNNY_ASSETS_STORAGE_PASSWORD
        : process.env.BUNNY_REELS_STORAGE_READONLY_PASSWORD || process.env.BUNNY_REELS_STORAGE_PASSWORD;
  return name && key ? { name, key } : null;
}

interface BunnyEntry {
  ObjectName: string;
  IsDirectory: boolean;
  Length: number;
}

async function walkZone(cfg: ZoneCfg): Promise<{ files: string[]; bytes: number }> {
  const files: string[] = [];
  let bytes = 0;
  const queue: string[] = [""];
  let visited = 0;
  while (queue.length && visited < 5000) {
    const dir = queue.shift() as string;
    visited++;
    const res = await fetch(`https://${STORAGE_HOST}/${cfg.name}/${dir}`, {
      headers: { AccessKey: cfg.key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) continue;
    const entries = (await res.json()) as BunnyEntry[];
    for (const e of entries) {
      const full = `${dir}${e.ObjectName}`;
      if (e.IsDirectory) queue.push(`${full}/`);
      else {
        files.push(full);
        bytes += e.Length ?? 0;
      }
    }
  }
  return { files, bytes };
}

const mb = (bytes: number) => Math.round((bytes / 1048576) * 10) / 10;

export interface MediaReport {
  cardsTotal: number;
  cardsOnBunny: number;
  cardsPending: number;
  clients: { originals: number; crops: number; megabytes: number } | null;
  assets: { protectedFiles: number; migrated: number; megabytes: number } | null;
  reels: { files: number; megabytes: number } | null;
  totalMegabytes: number;
}

export async function getMediaReport(): Promise<MediaReport | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const [cardsTotal, cardsOnBunny, clientsCfg, assetsCfg, reelsCfg] = await Promise.all([
    db.media.count(),
    db.media.count({ where: { bunnyUrl: { not: null } } }),
    Promise.resolve(zoneCfg("clients")),
    Promise.resolve(zoneCfg("assets")),
    Promise.resolve(zoneCfg("reels")),
  ]);

  const [cz, az, rz] = await Promise.all([
    clientsCfg ? walkZone(clientsCfg) : null,
    assetsCfg ? walkZone(assetsCfg) : null,
    reelsCfg ? walkZone(reelsCfg) : null,
  ]);

  const isCrop = (f: string) => /__(16x9|1x1|4x3)\./.test(f);
  return {
    cardsTotal,
    cardsOnBunny,
    cardsPending: cardsTotal - cardsOnBunny,
    clients: cz
      ? { originals: cz.files.filter((f) => !isCrop(f)).length, crops: cz.files.filter(isCrop).length, megabytes: mb(cz.bytes) }
      : null,
    assets: az
      ? {
          protectedFiles: az.files.filter((f) => !f.startsWith("migrated/")).length,
          migrated: az.files.filter((f) => f.startsWith("migrated/")).length,
          megabytes: mb(az.bytes),
        }
      : null,
    reels: rz ? { files: rz.files.length, megabytes: mb(rz.bytes) } : null,
    totalMegabytes: mb((cz?.bytes ?? 0) + (az?.bytes ?? 0) + (rz?.bytes ?? 0)),
  };
}

export interface BillingReport {
  balance: number;
  thisMonthCharges: number;
  monthlyBandwidthBytes: number;
  /** Newest first. `kind` mapped from Bunny's record type: 2 = deposit, 3 = charge. */
  records: Array<{ date: string; amount: number; kind: "deposit" | "charge" | "other" }>;
  /** Months left assuming Bunny's $1 minimum monthly charge keeps being the real cost. */
  runwayMonths: number;
}

interface RawBillingRecord {
  Timestamp?: string;
  Amount?: number;
  Type?: number;
}

export async function getBillingReport(): Promise<BillingReport | { error: string }> {
  const gate = await requireAdmin();
  if ("error" in gate) return { error: gate.error };

  const key = process.env.BUNNY_API_KEY;
  if (!key) return { error: "BUNNY_API_KEY is not configured" };

  try {
    const res = await fetch("https://api.bunny.net/billing", {
      headers: { AccessKey: key, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { error: `Bunny billing API failed (${res.status})` };
    const b = (await res.json()) as {
      Balance?: number;
      ThisMonthCharges?: number;
      MonthlyBandwidthUsed?: number;
      BillingRecords?: RawBillingRecord[];
    };
    const balance = b.Balance ?? 0;
    return {
      balance,
      thisMonthCharges: b.ThisMonthCharges ?? 0,
      monthlyBandwidthBytes: b.MonthlyBandwidthUsed ?? 0,
      records: (b.BillingRecords ?? [])
        .slice(-6)
        .reverse()
        .map((r) => ({
          date: (r.Timestamp ?? "").slice(0, 10),
          amount: r.Amount ?? 0,
          kind: r.Type === 2 ? "deposit" : r.Type === 3 ? "charge" : "other",
        })),
      runwayMonths: Math.floor(balance / 1),
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message.split("\n")[0] : String(e) };
  }
}
