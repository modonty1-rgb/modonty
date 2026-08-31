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

/** One stored file: its path inside the zone and its size. */
interface WalkedFile {
  path: string;
  bytes: number;
}

async function walkZone(cfg: ZoneCfg): Promise<{ items: WalkedFile[]; bytes: number }> {
  const items: WalkedFile[] = [];
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
        // Per-file size is kept (not just the running total) so the folder map below can be
        // built from the SAME walk — the walk is the expensive part, and doing it twice for
        // the same numbers would double a page load that already takes seconds.
        items.push({ path: full, bytes: e.Length ?? 0 });
        bytes += e.Length ?? 0;
      }
    }
  }
  return { items, bytes };
}

const mb = (bytes: number) => Math.round((bytes / 1048576) * 10) / 10;

/** A folder in the storage map. `children` is the second level only — see buildTree. */
export interface FolderNode {
  name: string;
  files: number;
  megabytes: number;
  children: FolderNode[];
}

export interface ZoneTree {
  zone: "clients" | "assets" | "reels";
  /** The real storage-zone name on Bunny, so the page names what it is showing. */
  storageZone: string;
  files: number;
  megabytes: number;
  folders: FolderNode[];
}

/**
 * Group a zone's files into a two-level folder map.
 *
 * Two levels and no more, because that is exactly the depth the locked layout uses —
 * `/{type}/{owner}/{file}` (shared/lib/bunny.ts) — so level 1 answers "which kind of
 * media" and level 2 answers "whose". A deeper tree would add rows without adding an
 * answer. Files sitting at the zone root are collected under `/` rather than dropped.
 */
function buildTree(items: WalkedFile[]): FolderNode[] {
  const top = new Map<string, { files: number; bytes: number; kids: Map<string, { files: number; bytes: number }> }>();
  for (const it of items) {
    const parts = it.path.split("/");
    const l1 = parts.length > 1 ? parts[0] : "/";
    const l2 = parts.length > 2 ? parts[1] : null;
    const node = top.get(l1) ?? { files: 0, bytes: 0, kids: new Map() };
    node.files++;
    node.bytes += it.bytes;
    if (l2) {
      const kid = node.kids.get(l2) ?? { files: 0, bytes: 0 };
      kid.files++;
      kid.bytes += it.bytes;
      node.kids.set(l2, kid);
    }
    top.set(l1, node);
  }
  const bySize = (a: FolderNode, b: FolderNode) => b.files - a.files;
  return [...top]
    .map(([name, n]) => ({
      name,
      files: n.files,
      megabytes: mb(n.bytes),
      children: [...n.kids].map(([kn, k]) => ({ name: kn, files: k.files, megabytes: mb(k.bytes), children: [] })).sort(bySize),
    }))
    .sort(bySize);
}

export interface MediaReport {
  cardsTotal: number;
  cardsOnBunny: number;
  cardsPending: number;
  clients: { originals: number; crops: number; megabytes: number } | null;
  assets: { protectedFiles: number; migrated: number; megabytes: number } | null;
  reels: { files: number; megabytes: number } | null;
  totalMegabytes: number;
  /** The storage map — same walk as the counts above, grouped by folder. */
  tree: ZoneTree[];
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

  const walked = [
    { zone: "clients" as const, cfg: clientsCfg, res: cz },
    { zone: "assets" as const, cfg: assetsCfg, res: az },
    { zone: "reels" as const, cfg: reelsCfg, res: rz },
  ];
  const tree: ZoneTree[] = walked
    .filter((w): w is typeof w & { cfg: ZoneCfg; res: { items: WalkedFile[]; bytes: number } } => !!w.cfg && !!w.res)
    .map((w) => ({
      zone: w.zone,
      storageZone: w.cfg.name,
      files: w.res.items.length,
      megabytes: mb(w.res.bytes),
      folders: buildTree(w.res.items),
    }));

  return {
    cardsTotal,
    cardsOnBunny,
    cardsPending: cardsTotal - cardsOnBunny,
    clients: cz
      ? {
          originals: cz.items.filter((f) => !isCrop(f.path)).length,
          crops: cz.items.filter((f) => isCrop(f.path)).length,
          megabytes: mb(cz.bytes),
        }
      : null,
    assets: az
      ? {
          protectedFiles: az.items.filter((f) => !f.path.startsWith("migrated/")).length,
          migrated: az.items.filter((f) => f.path.startsWith("migrated/")).length,
          megabytes: mb(az.bytes),
        }
      : null,
    reels: rz ? { files: rz.items.length, megabytes: mb(rz.bytes) } : null,
    totalMegabytes: mb((cz?.bytes ?? 0) + (az?.bytes ?? 0) + (rz?.bytes ?? 0)),
    tree,
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
