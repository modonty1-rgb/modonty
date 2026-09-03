"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateImageSeoDraft } from "@/lib/ai/generate-image-seo-draft";

/**
 * STAGE ONE of the image-SEO repair: let the model write the missing `altText` and
 * `description` for a handful of a client's images, and mark what it wrote.
 *
 * Deliberately narrow, and the boundaries are the point:
 *
 *  • It writes to the DATABASE ONLY. Not one Bunny call, not one file moved — which is
 *    what makes it safe to run against a local database. Renaming is stage two, it
 *    happens on Bunny, and Bunny has no dev copy (measured: the zones are
 *    `modonty-clients` / `modonty-asset`, one set for every environment).
 *  • It only fills an EMPTY alt. A row a human already described is never overwritten,
 *    so running the batch twice cannot undo anyone's writing.
 *  • Every row it touches gets `seoDraftedByAiAt`, which both shows the 🤖 badge and
 *    LOCKS the image out of renaming until a person edits the text.
 *
 * A CHUNK, not the whole client: the caller passes a slice and calls again, which is
 * what draws the progress bar and keeps one long request from timing out mid-client.
 */

/** Bounded so a caller cannot turn one request into a hundred model calls. */
const MAX_PER_CALL = 5;

const CLIENT_CTX = {
  id: true,
  name: true,
  addressCity: true,
  businessBrief: true,
  targetAudience: true,
  keywords: true,
  services: true,
  industry: { select: { name: true } },
} as const;

const ARTICLE_CTX = { title: true, excerpt: true, content: true } as const;

/** Strip HTML tags/entities from stored article content → plain text for the prompt. */
function toPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DraftBatchResult {
  /** Rows written in this call. */
  written: number;
  /** Rows that could not be drafted, with the reason — never silently dropped. */
  failed: { id: string; error: string }[];
  /** Rows skipped because a human had already written their alt. */
  skipped: number;
}

export async function draftImageSeoBatch(
  ids: string[],
): Promise<{ success: true; result: DraftBatchResult } | { success: false; error: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "غير مصرّح" };

  if (!Array.isArray(ids) || ids.length === 0) return { success: false, error: "لا صور محدَّدة" };
  if (ids.length > MAX_PER_CALL) return { success: false, error: `الحد ${MAX_PER_CALL} صور في النداء` };
  if (!ids.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) return { success: false, error: "معرّف غير صالح" };

  const result: DraftBatchResult = { written: 0, failed: [], skipped: 0 };

  // Alt texts already taken, per owner, so the model is never asked to invent blind.
  // Filled lazily on first use and ADDED TO as this run writes — otherwise the five
  // images of one slice would each be written against the same starting list and could
  // still land on the same sentence.
  const takenByOwner = new Map<string, string[]>();

  for (const id of ids) {
    try {
      const media = await db.media.findUnique({
        where: { id },
        select: {
          id: true,
          type: true,
          altText: true,
          clientId: true,
          client: { select: CLIENT_CTX },
          logoClients: { select: CLIENT_CTX, take: 1 },
          heroImageClients: { select: CLIENT_CTX, take: 1 },
          featuredArticles: { select: ARTICLE_CTX, take: 1 },
          articleGallery: { select: { article: { select: ARTICLE_CTX } }, take: 1 },
        },
      });
      if (!media) {
        result.failed.push({ id, error: "الصورة غير موجودة" });
        continue;
      }

      // Never overwrite a person. The screen offers this button for empty rows only,
      // but the action is reachable without the screen.
      if ((media.altText ?? "").trim()) {
        result.skipped++;
        continue;
      }

      const articleRow = media.featuredArticles[0] ?? media.articleGallery[0]?.article ?? null;
      const article = articleRow
        ? { title: articleRow.title, excerpt: articleRow.excerpt, body: toPlainText(articleRow.content) }
        : null;
      const client = media.client ?? media.logoClients[0] ?? media.heroImageClients[0] ?? null;

      if (!client && !article) {
        result.failed.push({ id, error: "لا مقال ولا عميل مرتبط — لا مصدر للتوليد" });
        continue;
      }

      // 1-based position among the client's gallery, so the model varies the angle
      // instead of describing twenty photos the same way.
      let galleryIndex: number | null = null;
      if (media.type === "GALLERY" && media.clientId) {
        const gallery = await db.media.findMany({
          where: { clientId: media.clientId, type: "GALLERY" },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        const pos = gallery.findIndex((g) => g.id === id);
        if (pos >= 0) galleryIndex = pos + 1;
      }

      // Owner key mirrors how the screen groups: a client if one owns the image,
      // otherwise the shared مدوّنتي bucket — so a logo is compared against its own
      // client's texts, not against every article image in the system.
      const ownerKey = client?.id ?? "__modonty__";
      if (!takenByOwner.has(ownerKey)) {
        const siblings = client
          ? await db.media.findMany({
              where: {
                OR: [
                  { clientId: client.id },
                  { logoClients: { some: { id: client.id } } },
                  { heroImageClients: { some: { id: client.id } } },
                ],
                NOT: [{ altText: null }, { altText: "" }],
              },
              select: { altText: true },
              take: 200,
            })
          : [];
        takenByOwner.set(ownerKey, siblings.map((s) => s.altText!).filter(Boolean));
      }
      const taken = takenByOwner.get(ownerKey)!;

      const draft = await generateImageSeoDraft(
        {
          clientName: client?.name ?? null,
          industry: client?.industry?.name ?? null,
          city: client?.addressCity ?? null,
          businessBrief: client?.businessBrief ?? null,
          targetAudience: client?.targetAudience ?? null,
          services: client?.services?.map((s) => s.title).filter(Boolean) ?? [],
          keywords: client?.keywords ?? [],
          galleryIndex,
          article,
        },
        { takenAlts: taken },
      );

      await db.media.update({
        where: { id },
        data: {
          altText: draft.altText,
          description: draft.description,
          // Written in the SAME update as the text it describes: a draft stored without
          // its mark is an unmarked machine text, which is the thing this exists to stop.
          seoDraftedByAiAt: new Date(),
        },
      });
      // The text this run just wrote is taken from now on — for the next image in the
      // very same slice, not only for the next request.
      taken.push(draft.altText);
      result.written++;
    } catch (e) {
      result.failed.push({ id, error: e instanceof Error ? e.message : "فشل التوليد" });
    }
  }

  // No modonty cache tag here on purpose: alt text and description are read from the
  // media row at render time, and stage two (the rename) is what changes a public URL.
  if (result.written > 0) {
    revalidatePath("/seo-images");
    revalidatePath("/media");
  }

  return { success: true, result };
}
