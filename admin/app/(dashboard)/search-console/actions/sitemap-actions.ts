"use server";

import { auth } from "@/lib/auth";
import { listSitemaps } from "@/lib/gsc/sitemaps";

import type { GscSitemap } from "@/lib/gsc/types";

interface ActionResponse {
  ok: boolean;
  error?: string;
  sitemaps?: GscSitemap[];
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user;
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
