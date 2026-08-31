"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";
import type { TeamMemberInput } from "../helpers/page-content-types";

type Result = { success: true } | { success: false; error: string };

function clean(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

/**
 * حفظ الفريق وحده — نفس نمط الاعتمادات والإنجازات: الحوار يحفظ ما فُتح لأجله فقط.
 * الأعضاء يغذّون `employee` في JSON-LD، فيُعاد توليد السيو بعد كل تغيير.
 */
export async function updateTeam(teamMembers: TeamMemberInput[]): Promise<Result> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId ?? null;
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const rows = (teamMembers ?? [])
    .map((m) => ({
      name: (m.name ?? "").trim(),
      role: clean(m.role),
      bio: clean(m.bio),
      photoUrl: clean(m.photoUrl),
    }))
    .filter((m) => m.name.length > 0);

  try {
    await db.client.update({
      where: { id: clientId },
      data: { teamMembers: { set: rows } },
    });
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort */
    }
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
