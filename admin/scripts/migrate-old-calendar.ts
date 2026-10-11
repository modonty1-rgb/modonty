/**
 * Migrate the OLD content calendar (jbr-content · ContentEntry) into Social Calendar — calendars + posts
 * (Khalid, 11 Oct 2026: «تجرب اول حاجه على اللوكل … بعدين نجربه على البرودكشن»).
 *
 *   pnpm tsx scripts/migrate-old-calendar.ts                  ← dry run on modonty_dev (default): reads, maps, reports, writes NOTHING
 *   pnpm tsx scripts/migrate-old-calendar.ts --apply          ← writes to modonty_dev
 *   pnpm tsx scripts/migrate-old-calendar.ts --prod [--apply] ← target `modonty` (production) — only on Khalid's explicit order
 *
 * Source: OLD_CALENDAR_DATABASE_URL (the old app's DATABASE_URL). Opened READ-ONLY — only `find`.
 * Target: DATABASE_URL (default ../shared/.env). Refuses unless the database is modonty_dev, or `modonty` with --prod.
 *
 * One old client → one calendar (the type comes from the old `Client.type`):
 *   article → CONTENT. Mapped to a Modonty client → that client's content calendar (the one activation opens);
 *             not mapped → a content calendar named like the old client.
 *   social  → SOCIAL calendar named like the old client, not linked to a client — «جبر السعودية» and «جبر مصر»
 *             stay two calendars instead of folding into one client name.
 *   archived old client → its calendar is created archived (hidden, posts kept). An old client with no posts → skipped.
 * The client map is `scripts/social-calendar-client-map.json` — { oldClientId: { slug } }, resolved by slug on the
 * target so the same file serves dev and production. Rebuilt 11 Oct 2026 from the approved dev copy (39 of 47).
 *
 * Idempotent: posts upsert on `legacyEntryId`; calendars are found again by (kind, client) or (kind, name);
 * a post's legacy assets are replaced as a set. Asset URLs are kept as they are (no file moves).
 * Mapping notes: documents/context/sessions/social-calendar-parity.md.
 */
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";
import { PrismaClient, Prisma, type SocialCalendarKind } from "@prisma/client";

// Node on Windows refuses the SRV lookup of mongodb+srv (measured 11 Oct 2026: querySrv ECONNREFUSED).
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const APPLY = process.argv.includes("--apply");
const PROD = process.argv.includes("--prod");
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
const targetDb = dbNameOf(targetUrl);
if (PROD ? targetDb !== "modonty" : targetDb !== "modonty_dev") {
  throw new Error(`Refusing: target database is "${targetDb}" — expected ${PROD ? "modonty (--prod)" : "modonty_dev"}`);
}
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

type OldClient = { _id: ObjectId; name?: string; slug?: string; type?: string; archived?: boolean };
type CalendarPlan = { oldId: string; kind: SocialCalendarKind; name: string; clientId: string | null; archived: boolean; reviewNote: string | null; entries: OldEntry[] };

/**
 * النوع القديم يخالف الاسم أحياناً («د. خالد الدخاخني | مقالات» مسجّل سوشيال). يُنقل كما هو ويُعلَّم
 * «محتاج مراجعة» على كرته — خالد يقرّر من إعدادات الكاليندر (١١ أكتوبر ٢٠٢٦).
 */
function reviewNoteOf(kind: SocialCalendarKind, name: string): string | null {
  if (kind === "SOCIAL" && /مقالات|مقال|blog|article/i.test(name)) return "نوعه في التطبيق القديم سوشيال، واسمه يقول مقالات — راجِع النوع";
  if (kind === "CONTENT" && /سوشيال|\bSM\b|social/i.test(name)) return "نوعه في التطبيق القديم مقالات، واسمه يقول سوشيال — راجِع النوع";
  return null;
}

const NOT_LINKED: Prisma.SocialCalendarWhereInput = { OR: [{ clientId: null }, { clientId: { isSet: false } }] };

function postData(e: OldEntry, report: { unknownStatus: number }): Omit<Prisma.SocialPostUncheckedCreateInput, "calendarId"> | null {
  const scheduledFor = scheduledForOf(e);
  if (!scheduledFor) return null;
  const status = STATUS[e.status] ?? "IN_PRODUCTION";
  if (!STATUS[e.status]) report.unknownStatus++;
  return {
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
}

(async () => {
  const src = new MongoClient(sourceUrl, { readPreference: "secondaryPreferred" });
  await src.connect();
  const sdb = src.db(dbNameOf(sourceUrl) || undefined);
  const prisma = new PrismaClient();

  const oldClients = (await sdb
    .collection("Client")
    .find({}, { projection: { name: 1, slug: 1, type: 1, archived: 1 } })
    .toArray()) as unknown as OldClient[];
  const entries = (await sdb.collection("ContentEntry").find({}).toArray()) as OldEntry[];

  const clientMap: Record<string, { slug: string }> = JSON.parse(fs.readFileSync(path.join(__dirname, "social-calendar-client-map.json"), "utf8"));
  const slugs = [...new Set(Object.values(clientMap).map((m) => m.slug))];
  const targets = await prisma.client.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const idBySlug = new Map(targets.map((c) => [c.slug, c.id]));
  const missingSlugs = slugs.filter((s) => !idBySlug.has(s));

  const entriesOf = new Map<string, OldEntry[]>();
  for (const e of entries) {
    const k = String(e.clientId ?? "");
    entriesOf.set(k, [...(entriesOf.get(k) ?? []), e]);
  }

  const plans: CalendarPlan[] = [];
  const skippedEmpty: string[] = [];
  for (const oc of oldClients) {
    const own = entriesOf.get(String(oc._id)) ?? [];
    const name = (oc.name || oc.slug || "بدون اسم").trim();
    if (own.length === 0) {
      skippedEmpty.push(name);
      continue;
    }
    const kind: SocialCalendarKind = oc.type === "social" ? "SOCIAL" : "CONTENT";
    const mappedId = idBySlug.get(clientMap[String(oc._id)]?.slug ?? "") ?? null;
    plans.push({ oldId: String(oc._id), kind, name, clientId: kind === "CONTENT" ? mappedId : null, archived: !!oc.archived, reviewNote: reviewNoteOf(kind, name), entries: own });
  }
  const knownOld = new Set(oldClients.map((c) => String(c._id)));
  const orphanEntries = entries.filter((e) => !knownOld.has(String(e.clientId ?? ""))).length;

  async function existingCalendar(p: CalendarPlan): Promise<string | null> {
    const where: Prisma.SocialCalendarWhereInput = p.clientId
      ? { kind: p.kind, clientId: p.clientId }
      : { AND: [{ kind: p.kind, name: p.name }, NOT_LINKED] };
    return (await prisma.socialCalendar.findFirst({ where, select: { id: true } }))?.id ?? null;
  }

  const report = {
    oldClients: oldClients.length,
    calendars: plans.length,
    content: plans.filter((p) => p.kind === "CONTENT").length,
    contentLinked: plans.filter((p) => p.clientId).length,
    social: plans.filter((p) => p.kind === "SOCIAL").length,
    archivedCalendars: plans.filter((p) => p.archived).length,
    needsReview: plans.filter((p) => p.reviewNote).map((p) => p.name),
    calendarsToCreate: 0,
    entries: entries.length,
    postsPlanned: 0,
    skippedBadDate: 0,
    orphanEntries,
    unknownStatus: 0,
    assets: 0,
    calendarsCreated: 0,
    postsWritten: 0,
  };

  const lines: string[] = [];
  for (const p of plans) {
    const calendarId = await existingCalendar(p);
    if (!calendarId) report.calendarsToCreate++;
    let n = 0;
    for (const e of p.entries) {
      if (postData(e, { unknownStatus: 0 })) n++;
      else report.skippedBadDate++;
      report.assets += assetsOf(e).length;
    }
    report.postsPlanned += n;
    lines.push(`${p.kind === "SOCIAL" ? "سوشيال" : "محتوى"} | ${p.name} | ${p.clientId ? "مربوط بعميل" : "بلا عميل"}${p.archived ? " | مؤرشف" : ""} | ${n} منشور | ${calendarId ? "موجود" : "جديد"}`);
  }

  if (APPLY) {
    for (const p of plans) {
      let calendarId = await existingCalendar(p);
      if (!calendarId) {
        calendarId = (
          await prisma.socialCalendar.create({
            data: { kind: p.kind, name: p.clientId ? null : p.name, clientId: p.clientId, archivedAt: p.archived ? new Date() : null, reviewNote: p.reviewNote },
            select: { id: true },
          })
        ).id;
        report.calendarsCreated++;
      }
      for (const e of p.entries) {
        const base = postData(e, report);
        if (!base) continue;
        const data = { ...base, calendarId };
        const post = await prisma.socialPost.upsert({
          where: { legacyEntryId: String(e._id) },
          create: data,
          update: { ...data, legacyEntryId: undefined },
          select: { id: true },
        });
        const assets = assetsOf(e);
        await prisma.socialPostAsset.deleteMany({ where: { postId: post.id, legacyAssetId: { not: null } } });
        if (assets.length) {
          await prisma.socialPostAsset.createMany({
            data: assets.map((a, i) => ({
              postId: post.id,
              kind: a.type === "video" ? "VIDEO" : "IMAGE",
              url: a.url!,
              label: a.label ?? null,
              order: i,
              legacyAssetId: a.id ? String(a.id) : `idx-${i}`,
            })),
          });
        }
        report.postsWritten++;
      }
    }
  }

  // PRD §٧ step 6: a sample of 20 asset URLs must answer 200.
  const sample = entries.flatMap((e) => assetsOf(e).map((a) => a.url!)).filter((_, i, all) => i % Math.max(1, Math.floor(all.length / 20)) === 0).slice(0, 20);
  const codes: Record<string, number> = {};
  for (const u of sample) {
    const code = await fetch(u, { method: "HEAD" }).then((r) => r.status).catch(() => 0);
    codes[code] = (codes[code] ?? 0) + 1;
  }

  await prisma.$disconnect();
  await src.close();
  console.log(lines.sort().join("\n"));
  console.log(
    JSON.stringify(
      { mode: APPLY ? "APPLY" : "DRY-RUN", source: dbNameOf(sourceUrl), target: targetDb, ...report, skippedEmptyClients: skippedEmpty, missingMappedSlugs: missingSlugs, assetSampleHttp: codes },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error("failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
