"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messages } from "@/lib/messages";
import { regenerateClientSeo } from "../../profile/actions/regenerate-client-seo";
import type { CredentialInput } from "../helpers/page-content-types";

type Result = { success: true } | { success: false; error: string };

function clean(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length ? t : null;
}

/**
 * حفظ الاعتمادات وحدها — لا بقيّة محتوى الصفحة.
 *
 * الحوار يحفظ ما فُتح لأجله فقط (خالد ٣١ أغسطس): لو مرّ على `updatePageContent` لكتب معه
 * الخدمات والفريق والإنجازات كما هي في الشاشة تلك اللحظة، فيثبت تعديلٌ لم يطلب الشريك
 * تثبيته. `set` يستبدل المصفوفة كاملةً، فتُرسَل القائمة النهائية لا الفرق.
 */
export async function updateCredentials(credentials: CredentialInput[]): Promise<Result> {
  const session = await auth();
  const clientId = (session as { clientId?: string })?.clientId ?? null;
  if (!clientId) return { success: false, error: messages.error.unauthorized };

  const rows = (credentials ?? [])
    .map((c) => ({
      name: (c.name ?? "").trim(),
      authority: clean(c.authority),
      year: clean(c.year),
      url: clean(c.url),
    }))
    .filter((c) => c.name.length > 0);

  try {
    await db.client.update({
      where: { id: clientId },
      data: { credentials: { set: rows } },
    });
    // تغذّي `hasCredential` في JSON-LD — بلا إعادة التوليد يبقى ما يقرأه قوقل قديماً.
    try {
      await regenerateClientSeo(clientId);
    } catch {
      /* best-effort — الحفظ ينجح ولو تعثّر توليد السيو */
    }
    revalidatePath("/dashboard/page-content");
    return { success: true };
  } catch {
    return { success: false, error: messages.error.serverError };
  }
}
