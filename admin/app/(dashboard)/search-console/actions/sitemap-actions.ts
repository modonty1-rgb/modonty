"use server";

import { listSitemaps } from "@/lib/gsc/sitemaps";

import type { GscSitemap } from "@/lib/gsc/types";
import { requireAuth } from "@/lib/require-auth";

interface ActionResponse {
  ok: boolean;
  error?: string;
  sitemaps?: GscSitemap[];
}

export async function listSitemapsAction(): Promise<ActionResponse> {
  try {
    await requireAuth();
    const sitemaps = await listSitemaps();
    return { ok: true, sitemaps };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to list sitemaps" };
  }
}
