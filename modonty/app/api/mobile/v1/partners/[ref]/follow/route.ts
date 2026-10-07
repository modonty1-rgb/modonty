import { getClientFollowState, type ClientFollowResult } from "@/lib/clients/get-client-follow-state";
import { followClientAs } from "@/lib/clients/follow-client-as";
import { unfollowClientAs } from "@/lib/clients/unfollow-client-as";
import { readerFromRequest } from "@/lib/mobile-api/auth";
import { fail, handle, MESSAGES, ok } from "@/lib/mobile-api/http";
import { decodeSlug } from "@/lib/mobile-api/params";

type Ctx = { params: Promise<{ ref: string }> };

function answer(result: ClientFollowResult) {
  if (!result.found) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return ok({ following: result.isFollowing, followersCount: result.followersCount });
}

/**
 * E9 — GET · POST · DELETE /api/mobile/v1/partners/:slug/follow · Bearer.
 * The web follow route's logic (`lib/clients/*`): follow = idempotent upsert, Telegram + GA4 on a
 * new follow. «تابع مدونتي» is this endpoint with `coreClientSlug` from `GET /home`.
 */
export const GET = handle("partner-follow-state", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return answer(await getClientFollowState(reader.id, slug));
});

export const POST = handle("partner-follow", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return answer(await followClientAs(reader, slug, request.headers));
});

export const DELETE = handle("partner-unfollow", async (request: Request, { params }: Ctx) => {
  const reader = await readerFromRequest(request);
  if (!reader) return fail("UNAUTHORIZED", MESSAGES.unauthorized);
  const slug = decodeSlug((await params).ref);
  if (!slug) return fail("NOT_FOUND", MESSAGES.partnerNotFound);
  return answer(await unfollowClientAs(reader.id, slug));
});
