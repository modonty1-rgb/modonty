import { createHmac } from 'crypto';

// ── OAuth 1.0a ────────────────────────────────────────────────────────────────

function pct(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function buildOAuthHeader(method: string, url: string, bodyParams: Record<string, string> = {}): string {
  const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const ts = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: process.env.TWITTER_API_KEY!,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: ts,
    oauth_token: process.env.TWITTER_ACCESS_TOKEN!,
    oauth_version: '1.0',
  };

  // For x-www-form-urlencoded body params are included in signature; for JSON/multipart they're not
  const sigParams = { ...bodyParams, ...oauthParams };

  const paramString = Object.entries(sigParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pct(k)}=${pct(v)}`)
    .join('&');

  const baseString = `${method.toUpperCase()}&${pct(url)}&${pct(paramString)}`;
  const sigKey = `${pct(process.env.TWITTER_API_SECRET!)}&${pct(process.env.TWITTER_ACCESS_TOKEN_SECRET!)}`;
  const sig = createHmac('sha1', sigKey).update(baseString).digest('base64');

  const allOauth = { ...oauthParams, oauth_signature: sig };
  const headerStr = Object.entries(allOauth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${pct(k)}="${pct(v)}"`)
    .join(', ');

  return `OAuth ${headerStr}`;
}

// ── Media upload (v1.1 — multipart, OAuth sig has NO body params) ─────────────

async function uploadMedia(imageUrl: string): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;

    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg';

    // Max 5MB for simple upload
    if (buffer.length > 5 * 1024 * 1024) return null;

    const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
    const auth = buildOAuthHeader('POST', uploadUrl); // multipart → no body params in sig

    const form = new FormData();
    form.append('media', new Blob([buffer], { type: mimeType }), 'media.jpg');

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: { Authorization: auth },
      body: form,
    });

    if (!res.ok) {
      console.error('[Twitter] Media upload failed:', await res.text());
      return null;
    }

    const data = await res.json() as { media_id_string: string };
    return data.media_id_string;
  } catch (err) {
    console.error('[Twitter] uploadMedia error:', err);
    return null;
  }
}

// ── Post tweet (v2 — JSON body, OAuth sig has NO body params) ────────────────

async function postTweet(text: string, mediaId?: string): Promise<string> {
  const url = 'https://api.twitter.com/2/tweets';
  const auth = buildOAuthHeader('POST', url); // JSON body → not in sig

  const body: Record<string, unknown> = { text };
  if (mediaId) body.media = { media_ids: [mediaId] };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[Twitter] postTweet failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json() as { data: { id: string } };
  return data.data.id;
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ArticleTweetParams {
  seoDescription: string;
  slug: string;
  imageUrl?: string | null;
}

/**
 * Publishes an article to Twitter (@modonty).
 * Returns the tweet ID on success, null on failure (never throws — fire-and-forget safe).
 */
export async function publishArticleToTwitter(params: ArticleTweetParams): Promise<string | null> {
  try {
    const link = `https://www.modonty.com/articles/${params.slug}`;
    // 280 total — URL counts as 23 (t.co), keep text ≤ 256
    const text = `${params.seoDescription.slice(0, 256)}\n${link}`;

    const mediaId = params.imageUrl ? await uploadMedia(params.imageUrl) ?? undefined : undefined;

    const tweetId = await postTweet(text, mediaId);
    console.info(`[Twitter] Article posted → tweet ${tweetId}`);
    return tweetId;
  } catch (err) {
    console.error('[Twitter] publishArticleToTwitter error:', err);
    return null;
  }
}
