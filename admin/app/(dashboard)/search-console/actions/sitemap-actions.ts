"use server";

import { revalidateTag } from "next/cache";

import { auth } from "@/lib/auth";
import { listSitemaps, submitSitemap } from "@/lib/gsc/sitemaps";

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

export async function submitSitemapAction(feedpath: string): Promise<ActionResponse> {
  try {
    await requireAuth();
    const normalized = feedpath.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      return { ok: false, error: "Sitemap URL must start with http:// or https://" };
    }
    await submitSitemap(normalized);
    revalidateTag("gsc-dashboard", "max");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to submit sitemap" };
  }
}
