"use server";

import { revalidatePath } from "next/cache";

import { deleteBunnyUrl } from "@modonty/database/lib/bunny";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";

const LABEL_MAX = 52;
const DESC_MAX = 250;

type Result = { success: true } | { success: false; error: string };

export interface ServiceInput {
  title: string;
  description?: string | null;
  icon?: string | null;
}
export interface TeamMemberInput {
  name: string;
  role?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
}
export interface AchievementInput {
  value: string;
  label: string;
  image?: string | null;
  description?: string | null;
}
export interface CredentialInput {
  name: string;
  authority?: string | null;
  year?: string | null;
  url?: string | null;
}

export interface PageContentInput {
  services: ServiceInput[];
  teamMembers: TeamMemberInput[];
  achievements: AchievementInput[];
  credentials: CredentialInput[];
  introVideoUrl: string | null;
}

async function getClientId(): Promise<string | null> {
  const session = await auth();
  return (session as { clientId?: string })?.clientId ?? null;
}

function clean(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

export async function updatePageContent(data: PageContentInput): Promise<Result> {
  const clientId = await getClientId();
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  // Trim + drop rows missing their required field.
  const services = (data.services ?? [])
    .map((s) => ({ title: (s.title ?? "").trim(), description: clean(s.description), icon: clean(s.icon) }))
    .filter((s) => s.title.length > 0);
  const teamMembers = (data.teamMembers ?? [])
    .map((m) => ({ name: (m.name ?? "").trim(), role: clean(m.role), bio: clean(m.bio), photoUrl: clean(m.photoUrl) }))
    .filter((m) => m.name.length > 0);
  const achievements = (data.achievements ?? [])
    .map((a) => ({
      value: (a.value ?? "").trim(),
      label: (a.label ?? "").trim().slice(0, LABEL_MAX),
      image: clean(a.image),
      description: clean(a.description)?.slice(0, DESC_MAX) ?? null,
    }))
    .filter((a) => a.value.length > 0 && a.label.length > 0);
  const credentials = (data.credentials ?? [])
    .map((c) => ({ name: (c.name ?? "").trim(), authority: clean(c.authority), year: clean(c.year), url: clean(c.url) }))
    .filter((c) => c.name.length > 0);
  const introVideoUrl = clean(data.introVideoUrl);

  // Read current achievement images BEFORE the write, to delete the ones dropped.
  const existing = await db.client.findUnique({
    where: { id: clientId },
    select: { achievements: { select: { image: true } } },
  });
  const oldImages = (existing?.achievements ?? [])
    .map((a) => a.image)
    .filter((u): u is string => Boolean(u));

  try {
    await db.client.update({
      where: { id: clientId },
      data: {
        services: { set: services },
        teamMembers: { set: teamMembers },
        achievements: { set: achievements },
        credentials: { set: credentials },
        introVideoUrl,
      },
    });

    // Orphan cleanup: delete Bunny images no longer referenced (best-effort).
    const keptImages = new Set(achievements.map((a) => a.image).filter(Boolean));
    for (const url of oldImages) {
      if (!keptImages.has(url)) {
        try {
          await deleteBunnyUrl("reels", url);
        } catch {
          /* best-effort — a failed delete must not fail the save */
        }
      }
    }
    // These feed JSON-LD (OfferCatalog / employee Person[] / hasCredential / VideoObject).
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort — save must succeed even if SEO regen fails */
    }
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
