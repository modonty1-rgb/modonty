import { getProfileData } from "@/app/(site)/users/[id]/data/get-profile-data";
import { fail, handle, ok, PUBLIC_CACHE } from "@/lib/mobile-api/http";
import { CONTENT_MESSAGES } from "@/lib/mobile-api/messages-content";
import { rejectMalformedIds } from "@/lib/mobile-api/params";

/**
 * V3 — GET /api/mobile/v1/users/:id · public.
 * What `/users/[id]` renders, from `getProfileData` (moved out of the page unchanged): the
 * member's name, avatar and join date, and — when an author row shares the member's email — the
 * author's title, bio and up to 20 published articles.
 *
 * Public fields only. The email never leaves: the web shows it to the profile's owner alone
 * (`components/owner-email.tsx`), and this response is the same for every caller. An author slug
 * passed as the id is not resolved here — the web 308s it to `/authors/[slug]`, which is
 * `GET /authors/:slug` for the app; a non-ObjectId is a 404.
 */
export const GET = handle("user", async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const malformed = rejectMalformedIds([id], CONTENT_MESSAGES.userNotFound);
  if (malformed) return malformed;

  const profile = await getProfileData(id);
  const { user, author } = profile;
  if (profile.matchedBySlug || !user) return fail("NOT_FOUND", CONTENT_MESSAGES.userNotFound);

  return ok(
    {
      user: {
        id: user.id,
        name: author?.name || user.name || null,
        image: author?.image || user.image || null,
        createdAt: user.createdAt,
      },
      author: author
        ? {
            slug: author.slug,
            name: author.name,
            jobTitle: author.jobTitle ?? null,
            bio: author.bio ?? null,
            image: author.image ?? null,
          }
        : null,
      articles: (author?.articles ?? []).map((a) => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt ?? null,
        datePublished: a.datePublished,
        client: { id: a.client.id, name: a.client.name, slug: a.client.slug },
      })),
    },
    PUBLIC_CACHE,
  );
});
