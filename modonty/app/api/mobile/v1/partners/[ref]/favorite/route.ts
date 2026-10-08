import { getClientFavoriteState, type ClientFavoriteResult } from "@/lib/clients/get-client-favorite-state";
import { favoriteClientAs } from "@/lib/clients/favorite-client-as";
import { unfavoriteClientAs } from "@/lib/clients/unfavorite-client-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

type Ctx = { params: Promise<{ ref: string }> };

function answer(result: ClientFavoriteResult) {
  if (!result.found) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return ok({ favorited: result.isFavorited, count: result.count });
}

/**
 * E10 — GET · POST · DELETE /api/mobile/v1/partners/:slug/favorite · Bearer.
 * The web favorite route's logic (`lib/clients/*favorite*`): save = idempotent, partner push +
 * Telegram + GA4 on a NEW save only; remove = deleteMany. Both answer the fresh count.
 */
export const GET = handle("partner-favorite-state", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return answer(await getClientFavoriteState(reader.id, slug));
});

export const POST = handle("partner-favorite", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return answer(await favoriteClientAs(reader, slug, request.headers));
});

export const DELETE = handle("partner-unfavorite", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return answer(await unfavoriteClientAs(reader.id, slug));
});
