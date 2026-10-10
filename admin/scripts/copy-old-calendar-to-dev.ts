/**
 * Copy the OLD content calendar (jbr-content-calendar · contentClaender) into the new Social Calendar
 * collections of **modonty_dev only** — a realistic data set to test the new admin with.
 *
 *   pnpm tsx scripts/copy-old-calendar-to-dev.ts            ← dry run (default): reads, maps, reports, writes NOTHING
 *   pnpm tsx scripts/copy-old-calendar-to-dev.ts --apply    ← writes to modonty_dev
 *
 * Source: OLD_CALENDAR_DATABASE_URL (the old app's DATABASE_URL). Opened READ-ONLY — only `find`.
 * Target: DATABASE_URL from ../shared/.env. Refuses to run unless the target database is `modonty_dev`.
 * Idempotent: posts upsert on `legacyEntryId`, so re-running updates instead of duplicating; a post's
 * legacy assets are replaced as a set.
 *
 * Mapping notes (see documents/context/sessions/social-calendar-parity.md):
 * - old month is a 3-letter key without a year → the year is the entry's createdAt year (the old app
 *   ran Apr–Oct 2026; earlier months in it are back-filled 2026 entries, not next year's plans).
 * - clients match by slug, then by normalised name. Unmatched clients are reported and skipped.
 * - creativeAssigneeId / createdById / publishedById stay empty: the old app had no staff accounts.
 */
import fs from "node:fs";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";
import { PrismaClient, Prisma } from "@prisma/client";

const APPLY = process.argv.includes("--apply");
const ROOT = path.resolve(__dirname, "..", "..");

function readEnv(file: string, key: string): string | undefined {
  if (!fs.existsSync(file)) return undefined;
  const m = fs.readFileSync(file, "utf8").match(new RegExp(`^${key}="?([^"\\r\\n]+)"?`, "m"));
  return m?.[1];
}
const dbNameOf = (url: string) => new URL(url.replace(/^mongodb(\+srv)?:/, "https:")).pathname.slice(1);

const targetUrl = process.env.DATABASE_URL || readEnv(path.join(ROOT, "shared", ".env"), "DATABASE_URL");
const sourceUrl = process.env.OLD_CALENDAR_DATABASE_URL;
if (!targetUrl) throw new Error("DATABASE_URL (target) not found");
if (!sourceUrl) throw new Error("Set OLD_CALENDAR_DATABASE_URL to the old calendar's DATABASE_URL (read-only use).");
if (dbNameOf(targetUrl) !== "modonty_dev") throw new Error(`Refusing: target database is "${dbNameOf(targetUrl)}", not modonty_dev`);
if (sourceUrl === targetUrl) throw new Error("Refusing: source and target are the same database");
process.env.DATABASE_URL = targetUrl;

const MONTH = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const STATUS: Record<string, Prisma.SocialPostCreateInput["status"]> = {
  "قيد الإنتاج": "IN_PRODUCTION",
  "جاهز للمراجعة": "READY_FOR_REVIEW",
  "جاهز للنشر": "READY_TO_PUBLISH",
  "تم النشر": "PUBLISHED",
};
const FORMAT: Record<string, "VIDEO" | "CAROUSEL" | "POST" | "STORY" | "REEL"> = { vid: "VIDEO", video: "VIDEO", carousel: "CAROUSEL", post: "POST", story: "STORY", reel: "REEL" };
const STAGE: Record<string, "AWARENESS" | "ENGAGEMENT" | "LEADS" | "CONVERSION"> = { awareness: "AWARENESS", engagement: "ENGAGEMENT", leads: "LEADS", conversion: "CONVERSION" };
const CHANNEL: Record<string, "INSTAGRAM" | "TIKTOK" | "X" | "FACEBOOK" | "YOUTUBE" | "LINKEDIN" | "SNAPCHAT" | "THREADS"> = {
  instagram: "INSTAGRAM", tiktok: "TIKTOK", x: "X", facebook: "FACEBOOK", youtube: "YOUTUBE", linkedin: "LINKEDIN", snapchat: "SNAPCHAT", threads: "THREADS",
};

const norm = (s: string) => s.normalize("NFKC").replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^\p{L}\p{N}]+/gu, "").toLowerCase();

type OldEntry = Record<string, any> & { _id: ObjectId };
type OldAsset = { id?: string; url?: string; type?: string; label?: string };

function scheduledForOf(e: OldEntry): Date | null {
  const mi = MONTH.indexOf(String(e.month || "").toLowerCase());
  const day = Number(e.day);
  if (mi < 0 || !Number.isInteger(day) || day < 1 || day > 31) return null;
  const created = e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt || Date.now());
  // The year of creation, never shifted: measured on jbr-content (10 Oct 2026), entries created in Apr–Jun
  // 2026 for jan/feb/mar are a 2026 back-fill (Excel import), not plans for 2027.
  const year = created.getUTCFullYear();
  const d = new Date(Date.UTC(year, mi, day));
  return d.getUTCMonth() === mi ? d : null; // e.g. 31 in a 30-day month → invalid
}

function publishAtOf(e: OldEntry): Date | null {
  if (!e.scheduledDate) return null;
  const base = new Date(e.scheduledDate);
  const t = /^(\d{1,2}):(\d{2})$/.exec(String(e.scheduledTime || ""));
  if (!t) return base;
  // scheduledTime is Riyadh wall-clock (UTC+3).
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), Number(t[1]) - 3, Number(t[2])));
}

function assetsOf(e: OldEntry): OldAsset[] {
  const list: OldAsset[] = Array.isArray(e.assets) ? e.assets : [];
  if (!list.length && e.assetLink) list.push({ id: "assetLink", url: e.assetLink, type: /\.(mp4|mov|webm)(\?|$)/i.test(e.assetLink) ? "video" : "image" });
  return list.filter((a) => typeof a?.url === "string" && a.url.length > 0);
}

(async () => {
  const src = new MongoClient(sourceUrl, { readPreference: "secondaryPreferred" });
  await src.connect();
  const sdb = src.db(dbNameOf(sourceUrl) || undefined);
  const prisma = new PrismaClient();

  const oldClients = await sdb.collection("Client").find({}, { projection: { name: 1, slug: 1, archived: 1 } }).toArray();
  const entries = (await sdb.collection("ContentEntry").find({}).toArray()) as OldEntry[];
  const newClients = await prisma.client.findMany({ select: { id: true, name: true, slug: true } });

  const bySlug = new Map(newClients.map((c) => [c.slug, c.id]));
  const byName = new Map(newClients.map((c) => [norm(c.name || ""), c.id]));
  // CLIENT_MAP_FILE: an approved { oldClientId: newClientId } table (old names rarely match exactly,
  // e.g. «دكتور أحمد شيخ العرب/ عيون» vs «دكتور احمد شيخ العرب لطب وجراحة العيون»). It wins over guessing.
  const approved: Record<string, string> = process.env.CLIENT_MAP_FILE ? JSON.parse(fs.readFileSync(process.env.CLIENT_MAP_FILE, "utf8")) : {};
  const newIds = new Set(newClients.map((c) => c.id));
  const clientMap = new Map<string, string>();
  const unmatched: string[] = [];
  for (const oc of oldClients) {
    const mapped = approved[String(oc._id)];
    if (mapped && !newIds.has(mapped)) throw new Error(`CLIENT_MAP_FILE points ${oc.name} to unknown client ${mapped}`);
    const id = mapped || (process.env.CLIENT_MAP_FILE ? undefined : bySlug.get(oc.slug) || byName.get(norm(oc.name || "")));
    if (id) clientMap.set(String(oc._id), id);
    else unmatched.push(`${oc.name} (${oc.slug})`);
  }

  const report = { entries: entries.length, mapped: 0, skippedNoClient: 0, skippedBadDate: 0, unknownStatus: 0, assets: 0, written: 0 };
  const plans: { legacyEntryId: string; data: Prisma.SocialPostUncheckedCreateInput; assets: OldAsset[] }[] = [];

  for (const e of entries) {
    const clientId = e.clientId ? clientMap.get(String(e.clientId)) : undefined;
    if (!clientId) { report.skippedNoClient++; continue; }
    const scheduledFor = scheduledForOf(e);
    if (!scheduledFor) { report.skippedBadDate++; continue; }
    const status = STATUS[e.status] ?? "IN_PRODUCTION";
    if (!STATUS[e.status]) report.unknownStatus++;
    const data: Prisma.SocialPostUncheckedCreateInput = {
      clientId,
      scheduledFor,
      status,
      statusUpdatedAt: e.statusUpdatedAt ? new Date(e.statusUpdatedAt) : new Date(),
      productionStartedAt: e.productionStartedAt ? new Date(e.productionStartedAt) : null,
      productionCompletedAt: e.productionCompletedAt ? new Date(e.productionCompletedAt) : null,
      publishedAt: e.publishedAt ? new Date(e.publishedAt) : null,
      format: FORMAT[e.contentType] ?? null,
      funnelStages: (e.customerStage || []).map((s: string) => STAGE[s]).filter(Boolean),
      channels: (e.channels || []).map((c: string) => CHANNEL[String(c).toLowerCase()]).filter(Boolean),
      idea: e.idea || "",
      text: e.text ?? null,
      hook: e.hook ?? null,
      cta: e.cta ?? null,
      scriptUrl: e.script ?? null,
      voiceTone: e.voiceTone ?? null,
      inspiration: e.inspiration ?? null,
      notes: e.notes ?? null,
      rejectionNote: e.rejectionNote ?? null,
      paidKind: e.orgPaid === "sponsored" ? "SPONSORED" : e.orgPaid === "organic" ? "ORGANIC" : null,
      budget: typeof e.budget === "number" ? e.budget : null,
      currency: e.currency ?? null,
      adDurationDays: typeof e.adDuration === "number" ? e.adDuration : null,
      publishAt: publishAtOf(e),
      channelLinks: e.channelLinks ?? undefined,
      archivedAt: e.archived ? new Date(e.updatedAt || Date.now()) : null,
      legacyEntryId: String(e._id),
    };
    const assets = assetsOf(e);
    report.assets += assets.length;
    report.mapped++;
    plans.push({ legacyEntryId: String(e._id), data, assets });
  }

  if (APPLY) {
    for (const p of plans) {
      const post = await prisma.socialPost.upsert({
        where: { legacyEntryId: p.legacyEntryId },
        create: p.data,
        update: { ...p.data, legacyEntryId: undefined },
        select: { id: true },
      });
      await prisma.socialPostAsset.deleteMany({ where: { postId: post.id, legacyAssetId: { not: null } } });
      if (p.assets.length) {
        await prisma.socialPostAsset.createMany({
          data: p.assets.map((a, i) => ({
            postId: post.id,
            kind: a.type === "video" ? "VIDEO" : "IMAGE",
            url: a.url!,
            label: a.label ?? null,
            order: i,
            legacyAssetId: a.id ? String(a.id) : `idx-${i}`,
          })),
        });
      }
      report.written++;
    }
  }

  await prisma.$disconnect();
  await src.close();
  console.log(JSON.stringify({ mode: APPLY ? "APPLY" : "DRY-RUN", source: dbNameOf(sourceUrl), target: "modonty_dev", oldClients: oldClients.length, matchedClients: clientMap.size, unmatchedClients: unmatched, ...report }, null, 2));
})().catch((e) => { console.error("failed:", e instanceof Error ? e.message : e); process.exit(1); });
