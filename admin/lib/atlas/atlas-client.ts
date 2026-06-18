import "server-only";
import crypto from "node:crypto";

// MongoDB Atlas Administration API (v2) read-only client.
// Auth = HTTP Digest (RFC 2617) using an Org API key — public key = username,
// private key = password. Atlas API keys are IP-access-list-restricted, so these
// calls succeed only from an allowed IP (locally = Khalid's IP); from Vercel's
// dynamic IPs they return 401 → every helper degrades to null (no crash).

const BASE = "https://cloud.mongodb.com/api/atlas/v2";
const TIMEOUT_MS = 8000;

function md5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex");
}

function parseChallenge(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  const body = header.replace(/^Digest\s+/i, "");
  const re = /(\w+)=(?:"([^"]*)"|([^,]*))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    out[m[1]] = m[2] !== undefined ? m[2] : (m[3] ?? "");
  }
  return out;
}

// Performs a digest-authenticated GET and parses JSON, or returns null on any failure.
async function digestGet<T>(pathWithQuery: string, version: string): Promise<T | null> {
  const pub = process.env.ATLAS_PUBLIC_KEY;
  const priv = process.env.ATLAS_PRIVATE_KEY;
  if (!pub || !priv) return null;

  const url = `${BASE}${pathWithQuery}`;
  const accept = `application/vnd.atlas.${version}+json`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const first = await fetch(url, {
      headers: { Accept: accept },
      signal: controller.signal,
      cache: "no-store",
    });

    if (first.ok) return (await first.json()) as T;
    if (first.status !== 401) return null;

    const wwwAuth = first.headers.get("www-authenticate");
    if (!wwwAuth) return null;

    const c = parseChallenge(wwwAuth);
    const realm = c.realm ?? "MMS Public API";
    const nonce = c.nonce ?? "";
    const qop = c.qop ?? "auth";
    const algorithm = c.algorithm ?? "MD5";
    const parsed = new URL(url);
    const uri = parsed.pathname + parsed.search;
    const nc = "00000001";
    const cnonce = crypto.randomBytes(8).toString("hex");

    const ha1 = md5(`${pub}:${realm}:${priv}`);
    const ha2 = md5(`GET:${uri}`);
    const response = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);

    let authz =
      `Digest username="${pub}", realm="${realm}", nonce="${nonce}", uri="${uri}", ` +
      `qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}", algorithm=${algorithm}`;
    if (c.opaque) authz += `, opaque="${c.opaque}"`;

    const second = await fetch(url, {
      headers: { Accept: accept, Authorization: authz },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!second.ok) return null;
    return (await second.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Atlas API response shapes (only the fields we read) ──────────────────────
interface FlexCluster {
  name: string;
  mongoDBVersion?: string;
  stateName?: string;
  providerSettings?: { backingProviderName?: string; regionName?: string };
  backupSettings?: { enabled?: boolean };
}
interface FlexClustersResponse {
  results?: FlexCluster[];
}
interface PendingInvoice {
  amountBilledCents?: number;
  startDate?: string;
  endDate?: string;
}
interface Invoice {
  startDate?: string;
  endDate?: string;
  statusName?: string;
  amountBilledCents?: number;
}
interface InvoicesResponse {
  results?: Invoice[];
}
interface SnapshotsResponse {
  totalCount?: number;
  results?: Array<{ createdAt?: string; snapshotTimeUtc?: string }>;
}

// ── Public report shape consumed by the UI ───────────────────────────────────
export interface AtlasReport {
  cluster: {
    name: string;
    provider: string;
    region: string;
    version: string;
    state: string;
    backupEnabled: boolean;
  } | null;
  billing: {
    pendingUsd: number;
    periodStart: string;
    periodEnd: string;
    history: Array<{ start: string; end: string; status: string; usd: number }>;
  } | null;
  backups: { count: number; latest: string | null } | null;
}

// Flex pricing (verified from Atlas docs 2026-06): $8/mo base incl. 5GB + 100 ops/sec, $30/mo hard cap.
export const FLEX_BASE_USD = 8;
export const FLEX_CAP_USD = 30;
export const FLEX_INCLUDED_STORAGE_MB = 5120; // 5 GB included in the base fee

export async function getAtlasReport(): Promise<AtlasReport | null> {
  const org = process.env.ATLAS_ORG_ID;
  const proj = process.env.ATLAS_PROJECT_ID;
  const clusterName = process.env.ATLAS_CLUSTER_NAME ?? "modonty-cluster";
  if (!process.env.ATLAS_PUBLIC_KEY || !org || !proj) return null;

  const [flex, pending, invoices, snaps] = await Promise.all([
    digestGet<FlexClustersResponse>(`/groups/${proj}/flexClusters`, "2024-11-13"),
    digestGet<PendingInvoice>(`/orgs/${org}/invoices/pending`, "2023-11-15"),
    digestGet<InvoicesResponse>(`/orgs/${org}/invoices?itemsPerPage=3`, "2023-11-15"),
    digestGet<SnapshotsResponse>(
      `/groups/${proj}/flexClusters/${clusterName}/backup/snapshots?itemsPerPage=1`,
      "2024-11-13",
    ),
  ]);

  // All calls failed (e.g. IP-blocked in production) → signal "unavailable".
  if (!flex && !pending && !invoices && !snaps) return null;

  const c = flex?.results?.[0];
  const cluster = c
    ? {
        name: c.name,
        provider: c.providerSettings?.backingProviderName ?? "—",
        region: c.providerSettings?.regionName ?? "—",
        version: c.mongoDBVersion ?? "—",
        state: c.stateName ?? "—",
        backupEnabled: Boolean(c.backupSettings?.enabled),
      }
    : null;

  const billing = pending
    ? {
        pendingUsd: (pending.amountBilledCents ?? 0) / 100,
        periodStart: pending.startDate ?? "",
        periodEnd: pending.endDate ?? "",
        history: (invoices?.results ?? []).map((i) => ({
          start: i.startDate ?? "",
          end: i.endDate ?? "",
          status: i.statusName ?? "",
          usd: (i.amountBilledCents ?? 0) / 100,
        })),
      }
    : null;

  const backups = snaps
    ? {
        count: snaps.totalCount ?? 0,
        latest: snaps.results?.[0]?.createdAt ?? snaps.results?.[0]?.snapshotTimeUtc ?? null,
      }
    : null;

  return { cluster, billing, backups };
}
