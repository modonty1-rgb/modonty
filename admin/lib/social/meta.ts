const API = 'https://graph.facebook.com/v25.0';

const CTA_FB = 'شاركها مع من يحتاجها 🔗';
const CTA_IG = 'رابط في البايو 👆';

function token(): string {
  return process.env.META_PAGE_ACCESS_TOKEN!;
}

async function graphPost(path: string, params: Record<string, string>): Promise<{ id?: string; error?: { message: string } }> {
  const body = new URLSearchParams({ access_token: token(), ...params });
  const res  = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  return res.json() as Promise<{ id?: string; error?: { message: string } }>;
}

function buildHashtags(tags: string[]): string {
  return tags
    .slice(0, 5)
    .map(t => `#${t.replace(/\s+/g, '_')}`)
    .join(' ');
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ArticleMetaParams {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  imageUrl?: string | null;
  tags?: string[];
}

/**
 * Posts an article to the Modonty Facebook Page and Instagram account.
 * Facebook: 2-step photo post (upload staged → attach to feed).
 * Instagram: image container → publish with caption + hashtags.
 * Fire-and-forget safe — never throws.
 */
export async function publishArticleToMeta(params: ArticleMetaParams): Promise<void> {
  const pageId   = process.env.META_PAGE_ID!;
  const igUserId = process.env.META_IG_USER_ID!;
  const link     = `https://www.modonty.com/articles/${params.slug}`;
  const hashtags = buildHashtags(params.tags ?? []);

  // ── Facebook ────────────────────────────────────────────────────────────────
  try {
    const fbMessage = `${params.seoTitle}\n\n${params.seoDescription}\n\n${CTA_FB} ${link}`;

    if (params.imageUrl) {
      // Step 1: upload photo staged (not published standalone), with alt text for FB search
      const upload = await graphPost(`${pageId}/photos`, {
        url:       params.imageUrl,
        alt_text:  params.seoTitle,
        published: 'false',
      });

      if (!upload.id) {
        console.error('[Meta] Facebook photo upload failed:', upload.error?.message);
      } else {
        // Step 2: post to feed with attached photo
        const fb = await graphPost(`${pageId}/feed`, {
          message:        fbMessage,
          attached_media: JSON.stringify([{ media_fbid: upload.id }]),
        });
        if (fb.id) {
          console.info(`[Meta] Facebook photo post → ${fb.id}`);
        } else {
          console.error('[Meta] Facebook feed post failed:', fb.error?.message);
        }
      }
    } else {
      // Fallback: text-only post when no image
      const fb = await graphPost(`${pageId}/feed`, { message: fbMessage, link });
      if (fb.id) {
        console.info(`[Meta] Facebook text post → ${fb.id}`);
      } else {
        console.error('[Meta] Facebook post failed:', fb.error?.message);
      }
    }
  } catch (err) {
    console.error('[Meta] Facebook error:', err);
  }

  // ── Instagram ───────────────────────────────────────────────────────────────
  if (!params.imageUrl) {
    console.info('[Meta] Instagram skipped — no image');
    return;
  }

  try {
    const igCaption = [
      params.seoTitle,
      '',
      params.seoDescription,
      '',
      CTA_IG,
      hashtags,
    ].filter(Boolean).join('\n');

    const container = await graphPost(`${igUserId}/media`, {
      image_url: params.imageUrl,
      caption:   igCaption,
    });

    if (!container.id) {
      console.error('[Meta] Instagram container failed:', container.error?.message);
      return;
    }

    const published = await graphPost(`${igUserId}/media_publish`, {
      creation_id: container.id,
    });

    if (published.id) {
      console.info(`[Meta] Instagram post → ${published.id}`);
    } else {
      console.error('[Meta] Instagram publish failed:', published.error?.message);
    }
  } catch (err) {
    console.error('[Meta] Instagram error:', err);
  }
}
