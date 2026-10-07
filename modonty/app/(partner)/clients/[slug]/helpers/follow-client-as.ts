import "server-only";

import { db } from "@/lib/db";
import { notifyTelegram } from "@/lib/telegram/notify-telegram";
import { trackFollowClient } from "@/lib/analytics/events-registry";
import type { ReaderActor } from "@/lib/users/reader-actor";
import type { ClientFollowResult } from "./get-client-follow-state";
import { fireClientEvent } from "@modonty/shared/lib/mobile-push";

/**
 * Follow a partner (idempotent upsert) for a known reader — the body of
 * `POST /clients/[slug]/api/follow` with the identity passed in. Telegram + GA4 fire only on
 * a NEW follow, exactly as on the web. `requestHeaders` feed the Telegram visitor line.
 */
export async function followClientAs(
  actor: ReaderActor,
  decodedSlug: string,
  requestHeaders: Headers,
): Promise<ClientFollowResult> {
  const client = await db.client.findUnique({
    where: { slug: decodedSlug },
    select: { id: true, slug: true, name: true, industry: { select: { name: true } } },
  });
  if (!client) return { found: false };

  const existing = await db.clientLike.findUnique({
    where: {
      clientId_userId: {
        clientId: client.id,
        userId: actor.id,
      },
    },
    select: { id: true },
  });

  await db.clientLike.upsert({
    where: {
      clientId_userId: {
        clientId: client.id,
        userId: actor.id,
      },
    },
    create: {
      clientId: client.id,
      userId: actor.id,
    },
    update: {},
  });

  const followersCount = await db.clientLike.count({
    where: { clientId: client.id },
  });

  if (!existing) {
    const ip =
      requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() ||
      requestHeaders.get("x-real-ip") ||
      requestHeaders.get("cf-connecting-ip") ||
      null;
    fireClientEvent(client.id, { kind: "follow" });
    notifyTelegram(client.id, "clientFollow", {
      meta: { الزائر: actor.name ?? actor.email ?? "زائر" },
      ipAddress: ip,
      headers: requestHeaders,
    }).catch(() => {});

    void trackFollowClient(
      {
        client_id: client.id,
        client_slug: client.slug,
        client_name: client.name,
        client_industry: client.industry?.name,
      },
      { userId: actor.id },
    );
  }

  return { found: true, isFollowing: true, followersCount };
}
