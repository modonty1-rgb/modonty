import { db } from '@/lib/db';
import { SocialPlatform, SocialPostStatus } from '@prisma/client';

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

async function saveSocialPost(data: {
  articleId: string;
  platform: SocialPlatform;
  status: SocialPostStatus;
  platformPostId?: string;
  caption?: string;
  imageUrl?: string;
  errorMessage?: string;
}) {
  try {
    await db.socialPost.create({ data });
  } catch (err) {
    console.error('[Meta] Failed to save social post record:', err);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ArticleMetaParams {
  articleId: string;
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
 * Saves a SocialPost record to DB for every attempt (success or failure).
 * Fire-and-forget safe — never throws.
 */
export async function publishArticleToMeta(params: ArticleMetaParams): Promise<void> {
  const pageId   = process.env.META_PAGE_ID!;
  const igUserId = process.env.META_IG_USER_ID!;
  const link     = `https://www.modonty.com/articles/${params.slug}`;
  const hashtags = buildHashtags(params.tags ?? []);

  // ── Facebook ────────────────────────────────────────────────────────────────
  try {
    const fbCaption = `${params.seoTitle}\n\n${params.seoDescription}\n\n${CTA_FB} ${link}${hashtags ? '\n\n' + hashtags : ''}`;

    if (params.imageUrl) {
      // Step 1: upload photo staged (not published standalone)
      const upload = await graphPost(`${pageId}/photos`, {
        url:       params.imageUrl,
        alt_text:  params.seoTitle,
        published: 'false',
      });

      if (!upload.id) {
        await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption: fbCaption, imageUrl: params.imageUrl ?? undefined, errorMessage: upload.error?.message ?? 'Photo upload failed' });
        console.error('[Meta] Facebook photo upload failed:', upload.error?.message);
      } else {
        // Step 2: post to feed with attached photo
        const fb = await graphPost(`${pageId}/feed`, {
          message:        fbCaption,
          attached_media: JSON.stringify([{ media_fbid: upload.id }]),
        });
        if (fb.id) {
          await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.PUBLISHED, platformPostId: fb.id, caption: fbCaption, imageUrl: params.imageUrl ?? undefined });
          console.info(`[Meta] Facebook photo post → ${fb.id}`);
        } else {
          await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption: fbCaption, imageUrl: params.imageUrl ?? undefined, errorMessage: fb.error?.message ?? 'Feed post failed' });
          console.error('[Meta] Facebook feed post failed:', fb.error?.message);
        }
      }
    } else {
      // Fallback: text-only post when no image
      const fbCaption = `${params.seoTitle}\n\n${params.seoDescription}\n\n${CTA_FB} ${link}`;
      const fb = await graphPost(`${pageId}/feed`, { message: fbCaption, link });
      if (fb.id) {
        await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.PUBLISHED, platformPostId: fb.id, caption: fbCaption });
        console.info(`[Meta] Facebook text post → ${fb.id}`);
      } else {
        await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption: fbCaption, errorMessage: fb.error?.message ?? 'Post failed' });
        console.error('[Meta] Facebook post failed:', fb.error?.message);
      }
    }
  } catch (err) {
    console.error('[Meta] Facebook error:', err);
    await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, errorMessage: String(err) });
  }

  // ── Instagram ───────────────────────────────────────────────────────────────
  if (!params.imageUrl) {
    await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.SKIPPED, errorMessage: 'No image' });
    console.info('[Meta] Instagram skipped — no image');
    return;
  }

  try {
    const igCaption = [params.seoTitle, '', params.seoDescription, '', CTA_IG, hashtags].filter(Boolean).join('\n');

    const container = await graphPost(`${igUserId}/media`, {
      image_url: params.imageUrl,
      caption:   igCaption,
    });

    if (!container.id) {
      await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.FAILED, caption: igCaption, imageUrl: params.imageUrl ?? undefined, errorMessage: container.error?.message ?? 'Container creation failed' });
      console.error('[Meta] Instagram container failed:', container.error?.message);
      return;
    }

    const published = await graphPost(`${igUserId}/media_publish`, { creation_id: container.id });
    if (published.id) {
      await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.PUBLISHED, platformPostId: published.id, caption: igCaption, imageUrl: params.imageUrl ?? undefined });
      console.info(`[Meta] Instagram post → ${published.id}`);
    } else {
      await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.FAILED, caption: igCaption, imageUrl: params.imageUrl ?? undefined, errorMessage: published.error?.message ?? 'Publish failed' });
      console.error('[Meta] Instagram publish failed:', published.error?.message);
    }
  } catch (err) {
    console.error('[Meta] Instagram error:', err);
    await saveSocialPost({ articleId: params.articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.FAILED, imageUrl: params.imageUrl ?? undefined, errorMessage: String(err) });
  }
}
