"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type GscRequestType = "REMOVAL" | "INDEXING";

interface ActionResponse {
  ok: boolean;
  error?: string;
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

/** Step 1: user clicked the deep-link button — record the intent. Does NOT mark as done. */
export async function markManualOpenedAction(
  url: string,
  type: GscRequestType,
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    await db.gscManualRequest.upsert({
      where: { url_type: { url, type } },
      create: { url, type, openedByUserId: userId },
      update: { openedAt: new Date(), openedByUserId: userId },
    });
    revalidatePath("/search-console");
    revalidatePath(`/search-console/pipeline`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Step 2: user explicitly confirmed they submitted in GSC — mark as done. */
export async function markManualDoneAction(
  url: string,
  type: GscRequestType,
): Promise<ActionResponse> {
  try {
    const userId = await requireUserId();
    await db.gscManualRequest.upsert({
      where: { url_type: { url, type } },
      create: {
        url,
        type,
        openedByUserId: userId,
        doneAt: new Date(),
        doneByUserId: userId,
      },
      update: { doneAt: new Date(), doneByUserId: userId },
    });
    revalidatePath("/search-console");
    revalidatePath(`/search-console/pipeline`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

/** Undo "done" — useful if user clicked Mark done by mistake. */
export async function unmarkManualDoneAction(
  url: string,
  type: GscRequestType,
): Promise<ActionResponse> {
  try {
    await requireUserId();
    await db.gscManualRequest.update({
      where: { url_type: { url, type } },
      data: { doneAt: null, doneByUserId: null },
    });
    revalidatePath("/search-console");
    revalidatePath(`/search-console/pipeline`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export interface ManualTrackState {
  url: string;
  type: GscRequestType;
  openedAt: Date;
  doneAt: Date | null;
}

/** Bulk read for the queue — single query, indexed by URL + type. */
export async function getManualTrackStates(
  urls: string[],
  type: GscRequestType,
): Promise<Map<string, ManualTrackState>> {
  if (urls.length === 0) return new Map();
  const rows = await db.gscManualRequest.findMany({
    where: { url: { in: urls }, type },
    select: { url: true, type: true, openedAt: true, doneAt: true },
  });
  const map = new Map<string, ManualTrackState>();
  for (const r of rows) {
    map.set(r.url, { ...r, type: r.type as GscRequestType });
  }
  return map;
}

/** Single-URL read — for the pipeline page (one article at a time). */
export async function getManualTrackState(
  url: string,
  type: GscRequestType,
): Promise<ManualTrackState | null> {
  const row = await db.gscManualRequest.findUnique({
    where: { url_type: { url, type } },
    select: { url: true, type: true, openedAt: true, doneAt: true },
  });
  if (!row) return null;
  return { ...row, type: row.type as GscRequestType };
}

// ───── Backward-compatible async wrappers (old names — Next.js requires async fn exports) ─────
export type RemovalTrackState = ManualTrackState;

export async function markRemovalOpenedAction(url: string): Promise<ActionResponse> {
  return markManualOpenedAction(url, "REMOVAL");
}
export async function markRemovalDoneAction(url: string): Promise<ActionResponse> {
  return markManualDoneAction(url, "REMOVAL");
}
export async function unmarkRemovalDoneAction(url: string): Promise<ActionResponse> {
  return unmarkManualDoneAction(url, "REMOVAL");
}
export async function getRemovalTrackStates(
  urls: string[],
): Promise<Map<string, ManualTrackState>> {
  return getManualTrackStates(urls, "REMOVAL");
}
