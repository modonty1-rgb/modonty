import "server-only";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackClientFavorite } from "@/lib/analytics/events-registry";
import type { ReaderActor } from "@/lib/users/reader-actor";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";
import type { ClientFavoriteResult } from "./get-client-favorite-state";

/**
 * Save a partner (idempotent) for a known reader — the body of `POST /clients/[slug]/api/favorite`
 * with the identity passed in. Partner push + Telegram + GA4 fire only on a NEW save, exactly as
 * on the web. `requestHeaders` feed the Telegram visitor line.
 */
export async function favoriteClientAs(
  actor: ReaderActor,
  decodedSlug: string,
  requestHeaders: Headers,
): Promise<ClientFavoriteResult> {
  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true, slug: true, name: true, industry: { select: { name: true } } },
  });
  if (!client) return { found: false };

  const existing = await db.clientFavorite.findUnique({
    where: { clientId_userId: { clientId: client.id, userId: actor.id } },
    select: { id: true },
  });

  if (!existing) {
    await db.clientFavorite.create({
      data: { clientId: client.id, userId: actor.id },
    });

    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
      requestHeaders.get("x-real-ip") ||
      requestHeaders.get("cf-connecting-ip") ||
      null;
    fireClientEvent(client.id, { kind: "favorite" });
    notifyTelegram(client.id, "clientFavorite", {
      title: client.name,
      meta: { الزائر: actor.name ?? actor.email ?? "زائر" },
      ipAddress: ip,
      headers: requestHeaders,
    }).catch((e: unknown) => console.error("[favoriteClientAs] telegram", e));

    void trackClientFavorite(
      {
        client_id: client.id,
        client_slug: client.slug,
        client_name: client.name,
        client_industry: client.industry?.name,
      },
      { userId: actor.id },
    );
  }

  const count = await db.clientFavorite.count({ where: { clientId: client.id } });
  return { found: true, isFavorited: true, count };
}
