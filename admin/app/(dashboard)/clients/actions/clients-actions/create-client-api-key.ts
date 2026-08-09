"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logAction } from "@/lib/audit/log-action";

import { generateApiKey } from "../../helpers/api-key";
import { probeArticlesBaseUrl } from "./probe-articles-base-url";

export interface CreateApiKeyResult {
  success: boolean;
  apiKey?: string;
  apiKeyCreatedAt?: Date;
  error?: string;
}

/**
 * Creates the client's read key — an EXPLICIT act with its own button, saved on its
 * own, not folded into the big form save.
 *
 * Why not generate it silently when the form is saved: a credential is not a form
 * field. The admin should press something and see the key appear, the same way the
 * suspend switch acts on its own. Hiding it inside a save that touches fourteen
 * unrelated groups makes "does this client have a key?" a question nobody can answer
 * without reloading the page.
 *
 * WHEN the button that calls this appears is decided in the UI (Khalid 2026-08-08):
 * publishing ticked AND the domain check came back 200. So by the time we get here the
 * address has been proven to answer — this action persists it together with the key in
 * ONE act, which is why the admin does not have to press the global save first.
 *
 * Idempotent: if a key is already there, it is returned untouched. There is no
 * regeneration path, so this can never invalidate the key sitting in the client's
 * env var.
 */
export async function createClientApiKey(
  clientId: string,
  articlesBaseUrl: string
): Promise<CreateApiKeyResult> {
  try {
    const session = await auth();
    if (!session) return { success: false, error: "Unauthorized" };

    // The UI decides WHEN the button shows; the server decides whether the address is
    // acceptable. Re-run the same check here — a client-side gate is a hint, never a
    // guarantee, and this action writes the string every canonical URL is built from.
    const probe = await probeArticlesBaseUrl(articlesBaseUrl);
    if (!probe.ok || !probe.normalizedUrl) {
      return {
        success: false,
        error:
          probe.structureError ??
          probe.articlesError ??
          "The articles address did not pass the check",
      };
    }

    const baseUrl = probe.normalizedUrl;

    const client = await db.client.findUnique({
      where: { id: clientId },
      select: { name: true, apiKey: true, apiKeyCreatedAt: true },
    });

    if (!client) return { success: false, error: "Client not found" };

    if (client.apiKey) {
      return {
        success: true,
        apiKey: client.apiKey,
        apiKeyCreatedAt: client.apiKeyCreatedAt ?? undefined,
      };
    }

    const apiKey = generateApiKey();
    const apiKeyCreatedAt = new Date();

    // Permission + address are written HERE too: the key and the two fields that make
    // it meaningful must never exist apart from each other.
    await db.client.update({
      where: { id: clientId },
      data: {
        canPublishToOwnSite: true,
        articlesBaseUrl: baseUrl,
        apiKey,
        apiKeyCreatedAt,
      },
    });

    await logAction("client.update", {
      entity: "Client",
      entityId: clientId,
      summary: client.name,
      metadata: { action: "api-key-created" },
    });

    revalidatePath(`/clients/${clientId}/edit`);

    return { success: true, apiKey, apiKeyCreatedAt };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create the key";
    return { success: false, error: message };
  }
}
