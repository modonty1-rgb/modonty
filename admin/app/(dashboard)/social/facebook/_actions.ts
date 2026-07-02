"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SocialPlatform, SocialPostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const API = "https://graph.facebook.com/v25.0";

// ── Cloudinary helpers ───────────────────────────────────────────────────────

function extractCloudinaryPublicId(url: string): string | null {
  // e.g. https://res.cloudinary.com/abc/image/upload/v123/modonty/social/xyz.jpg → modonty/social/xyz
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
  return match ? match[1] : null;
}

async function uploadUrlToCloudinary(
  sourceUrl: string
): Promise<{ url: string; publicId: string } | { error: string }> {
  try {
    const cloudinary = await getCloudinary();
    if (!cloudinary) return { error: "Cloudinary not configured" };
    const result = await cloudinary.uploader.upload(sourceUrl, {
      folder: "modonty/social",
      format: "jpg",
      overwrite: false,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    return { error: String(err) };
  }
}

interface CloudinaryUploader {
  config: (opts: Record<string, string>) => void;
  uploader: { upload: (src: string, opts: Record<string, unknown>) => Promise<{ secure_url: string; public_id: string }> };
}

async function getCloudinary(): Promise<CloudinaryUploader | null> {
  let cloudName: string | undefined;
  let apiKey: string | undefined;
  let apiSecret: string | undefined;
  const url = process.env.CLOUDINARY_URL;
  if (url?.startsWith("cloudinary://")) {
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) { apiKey = m[1]; apiSecret = m[2]; cloudName = m[3]; }
  }
  cloudName = cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  apiKey = apiKey || process.env.CLOUDINARY_API_KEY;
  apiSecret = apiSecret || process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  const mod = (await import("cloudinary")) as { v2: CloudinaryUploader };
  mod.v2.config({ cloud_name: cloudName.trim(), api_key: apiKey.trim(), api_secret: apiSecret.trim() });
  return mod.v2;
}

// ── Sharp: crop cover to 4:5 + blur → upload to Cloudinary ─────────────────

async function generateInstagramDefaultImage(
  coverImageUrl: string
): Promise<{ url: string } | { error: string }> {
  try {
    const res = await fetch(coverImageUrl);
    if (!res.ok) return { error: `Failed to fetch cover image: ${res.status}` };
    const inputBuffer = Buffer.from(await res.arrayBuffer());

    const { default: sharp } = await import("sharp");
    const processed = await sharp(inputBuffer)
      .resize(1080, 1350, { fit: "cover", position: "center" })
      .blur(18)
      .jpeg({ quality: 88 })
      .toBuffer();

    const cloudinary = await getCloudinary();
    if (!cloudinary) return { error: "Cloudinary not configured" };

    const dataURI = `data:image/jpeg;base64,${processed.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "modonty/social",
      format: "jpg",
      overwrite: false,
    });
    return { url: result.secure_url };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function generateInstagramDefaultPreview(
  articleId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  const article = await db.article.findUnique({ where: { id: articleId }, select: { featuredImage: { select: { url: true } } } });
  if (!article?.featuredImage?.url) return { success: false, error: "No cover image on this article" };
  const result = await generateInstagramDefaultImage(article.featuredImage.url);
  if ("error" in result) return { success: false, error: result.error };
  return { success: true, url: result.url };
}

async function graphPost(
  path: string,
  params: Record<string, string>
): Promise<{ id?: string; error?: { message: string } }> {
  const body = new URLSearchParams({
    access_token: process.env.META_PAGE_ACCESS_TOKEN!,
    ...params,
  });
  const res = await fetch(`${API}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return res.json() as Promise<{ id?: string; error?: { message: string } }>;
}

async function generateInstagramImage(
  seoTitle: string,
  seoDescription: string
): Promise<{ url: string } | { error: string }> {
  try {
    // Step 1: Gemini converts Arabic title+description → English image prompt
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const geminiRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert at writing English prompts for FLUX AI image generation.

Given this Arabic business article, write a vivid English image prompt for a high-quality professional photograph.

Structure: [main subject] + [environment/setting] + [lighting] + [mood] + [photographic style]
Requirements:
- Natural English sentences (not comma lists) — FLUX understands natural language
- Use specific photography language: "shot on Canon R5", "shallow depth of field", "golden hour lighting", "studio lighting", "editorial style", "bokeh background"
- Always include: "photorealistic", "professional photography", "no text", "no words in the image"
- 2-3 sentences max, 60 words max
- If the scene includes people: they must look Saudi Arabian (Gulf Arab appearance, traditional or modern Saudi attire)
- If the scene includes a city or urban environment: it must be a Saudi city — Riyadh, Jeddah, Dammam, Mecca, or Medina. Never use a generic or Western city
- Never mention Arabic or any language

Return JSON only: { "imagePrompt": "..." }

Article title: ${seoTitle}
Article description: ${seoDescription}`,
      config: { responseMimeType: "application/json" },
    });

    const parsed = JSON.parse(geminiRes.text ?? "{}") as { imagePrompt?: string };
    const imagePrompt = parsed.imagePrompt?.trim();
    if (!imagePrompt) return { error: "Gemini did not return a prompt" };

    // Step 2: FLUX 1.1 Pro text-to-image, 4:5 portrait for Instagram
    const { default: Replicate } = await import("replicate");
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt: imagePrompt,
        aspect_ratio: "4:5",
        output_format: "jpg",
        output_quality: 95,
        safety_tolerance: 4,
      },
    });

    const item = Array.isArray(output) ? output[0] : output;
    if (item && typeof (item as { url: () => unknown }).url === "function") {
      return { url: String((item as { url: () => unknown }).url()) };
    }
    if (typeof item === "string") return { url: item };
    return { error: "No output from Replicate" };
  } catch (err) {
    return { error: String(err) };
  }
}

export async function postArticleToFacebook(
  articleId: string,
  caption: string,
  imageUrl: string | null
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const pageId = process.env.META_PAGE_ID!;

  try {
    if (imageUrl) {
      const upload = await graphPost(`${pageId}/photos`, { url: imageUrl, published: "false" });
      if (!upload.id) {
        await db.socialPost.create({
          data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption, imageUrl, errorMessage: upload.error?.message ?? "Photo upload failed" },
        });
        return { success: false, error: upload.error?.message ?? "Photo upload failed" };
      }
      const feed = await graphPost(`${pageId}/feed`, {
        message: caption,
        attached_media: JSON.stringify([{ media_fbid: upload.id }]),
      });
      if (feed.id) {
        await db.socialPost.create({
          data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.PUBLISHED, platformPostId: feed.id, caption, imageUrl },
        });
        revalidatePath("/social/facebook");
        return { success: true, postId: feed.id };
      }
      await db.socialPost.create({
        data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption, imageUrl, errorMessage: feed.error?.message ?? "Feed post failed" },
      });
      return { success: false, error: feed.error?.message ?? "Feed post failed" };
    } else {
      const feed = await graphPost(`${pageId}/feed`, { message: caption });
      if (feed.id) {
        await db.socialPost.create({
          data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.PUBLISHED, platformPostId: feed.id, caption },
        });
        revalidatePath("/social/facebook");
        return { success: true, postId: feed.id };
      }
      await db.socialPost.create({
        data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption, errorMessage: feed.error?.message ?? "Post failed" },
      });
      return { success: false, error: feed.error?.message ?? "Post failed" };
    }
  } catch (err) {
    await db.socialPost.create({
      data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.FAILED, caption, errorMessage: String(err) },
    });
    return { success: false, error: String(err) };
  }
}

export async function generateInstagramPreview(
  articleId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };
  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { seoTitle: true, title: true, seoDescription: true },
  });
  const seoTitle = article?.seoTitle || article?.title || "";
  const seoDescription = article?.seoDescription || "";
  const result = await generateInstagramImage(seoTitle, seoDescription);
  if ("error" in result) return { success: false, error: result.error };
  return { success: true, url: result.url };
}

export async function postArticleToInstagram(
  articleId: string,
  caption: string,
  preGeneratedUrl?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const igUserId = process.env.META_IG_USER_ID!;

  try {
    let igImageUrl: string;
    let imagePublicId: string | null = null;

    if (preGeneratedUrl) {
      if (preGeneratedUrl.includes("res.cloudinary.com")) {
        // Already on Cloudinary (default Sharp or existing media)
        igImageUrl = preGeneratedUrl;
        imagePublicId = extractCloudinaryPublicId(preGeneratedUrl);
      } else {
        // FLUX/Replicate URL — upload to Cloudinary for permanent storage
        const uploaded = await uploadUrlToCloudinary(preGeneratedUrl);
        if ("error" in uploaded) return { success: false, error: uploaded.error };
        igImageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      }
    } else {
      // Default: Sharp crops article cover to 4:5 + blur
      const article = await db.article.findUnique({
        where: { id: articleId },
        select: { featuredImage: { select: { url: true } } },
      });
      if (!article?.featuredImage?.url) return { success: false, error: "No cover image — cannot generate default Instagram image" };
      const result = await generateInstagramDefaultImage(article.featuredImage.url);
      if ("error" in result) return { success: false, error: result.error };
      igImageUrl = result.url;
      imagePublicId = extractCloudinaryPublicId(result.url);
    }

    const container = await graphPost(`${igUserId}/media`, {
      image_url: igImageUrl,
      caption,
    });

    if (!container.id) {
      await db.socialPost.create({
        data: { articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.FAILED, caption, imageUrl: igImageUrl, imagePublicId, errorMessage: container.error?.message ?? "Container creation failed" },
      });
      return { success: false, error: container.error?.message ?? "Container creation failed" };
    }

    const published = await graphPost(`${igUserId}/media_publish`, { creation_id: container.id });

    if (published.id) {
      await db.socialPost.create({
        data: { articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.PUBLISHED, platformPostId: published.id, caption, imageUrl: igImageUrl, imagePublicId },
      });
      revalidatePath("/social/facebook");
      revalidatePath("/social/instagram");
      return { success: true, postId: published.id };
    }

    await db.socialPost.create({
      data: { articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.FAILED, caption, imageUrl: igImageUrl, imagePublicId, errorMessage: published.error?.message ?? "Publish failed" },
    });
    return { success: false, error: published.error?.message ?? "Publish failed" };
  } catch (err) {
    await db.socialPost.create({
      data: { articleId, platform: SocialPlatform.INSTAGRAM, status: SocialPostStatus.FAILED, caption, errorMessage: String(err) },
    });
    return { success: false, error: String(err) };
  }
}

export async function generateFacebookBodyAI(
  seoTitle: string,
  seoDescription: string
): Promise<{ success: boolean; body?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `أنت كاتب محتوى سعودي محترف متخصص في منشورات فيسبوك.

اكتب نص قصير لمنشور فيسبوك — جملتان أو ثلاث فقط، بدون شرح إضافي، بدون إيموجي.

عنوان المقال: ${seoTitle}
وصف المقال: ${seoDescription}

القواعد:
- اكتب باللهجة السعودية الخليجية (مثل: "وش"، "كيف تسوي"، "عشان"، "بتلاقي"، "الشغل")
- قدّم قيمة فعلية مباشرة لصاحب العمل السعودي
- أسلوب محادثة حقيقي وعملي
- لا تطلب من القارئ أي شيء (بدون CTA)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const body = response.text?.trim();
    if (!body) return { success: false, error: "No response from AI" };

    return { success: true, body };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function generateFacebookHookAI(
  seoTitle: string,
  seoDescription: string
): Promise<{ success: boolean; hook?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `أنت كاتب محتوى سعودي محترف متخصص في منشورات فيسبوك.

اكتب hook جذاب للسطر الأول من منشور فيسبوك. السطر الأول فقط، بدون شرح إضافي، بدون إيموجي.

عنوان المقال: ${seoTitle}
وصف المقال: ${seoDescription}

القواعد:
- اكتب باللهجة السعودية الخليجية (مثل: "وش"، "كيف تسوي"، "عشان"، "بتلاقي"، "الشغل")
- يطرح مشكلة أو سؤالاً يلمس صاحب العمل السعودي مباشرة
- بين 8-15 كلمة
- أسلوب محادثة حقيقي وجذاب`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const hook = response.text?.trim();
    if (!hook) return { success: false, error: "No response from AI" };

    return { success: true, hook };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function generateInstagramBodyAI(
  seoTitle: string,
  seoDescription: string
): Promise<{ success: boolean; body?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `أنت كاتب محتوى سعودي محترف متخصص في منشورات Instagram.

اكتب نص قصير لمنشور Instagram — فقرتان أو ثلاث، كل فقرة سطران بحد أقصى. بدون إيموجي.

عنوان المقال: ${seoTitle}
وصف المقال: ${seoDescription}

القواعد:
- أسلوب بصري وحسي — "تخيّل"، "شوف كيف"، "لما تشوفه"
- اكتب باللهجة السعودية الخليجية
- يقدّم قيمة فعلية ومباشرة لصاحب العمل السعودي
- أقصر من Facebook — Instagram يحتاج سرعة وإيجاز
- لا تطلب من القارئ أي شيء (بدون CTA)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const body = response.text?.trim();
    if (!body) return { success: false, error: "No response from AI" };
    return { success: true, body };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function generateInstagramHashtagsAI(
  seoTitle: string,
  seoDescription: string,
  existingTags: string[]
): Promise<{ success: boolean; hashtags?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `أنت خبير في Instagram hashtags للسوق السعودي.

اكتب 3 إلى 5 hashtags عربية مناسبة لمنشور Instagram عن هذا المقال. لا أكثر من 5.

عنوان المقال: ${seoTitle}
وصف المقال: ${seoDescription}
الوسوم الموجودة: ${existingTags.join(", ")}

القواعد:
- بالعربية فقط (بدون إنجليزي)
- مخصصة للسوق السعودي والخليجي
- ذات صلة مباشرة بالمحتوى
- ابدأ كل واحد بـ #
- ضعها في سطر واحد مفصولة بمسافات

أعطني الـ hashtags فقط، بدون شرح.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const hashtags = response.text?.trim();
    if (!hashtags) return { success: false, error: "No response from AI" };
    return { success: true, hashtags };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function postArticleToTwitter(
  articleId: string,
  hook: string,
  body: string
): Promise<{ success: boolean; tweetId?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const article = await db.article.findUnique({ where: { id: articleId }, select: { slug: true } });
  if (!article) return { success: false, error: "Article not found" };

  const url = `https://www.modonty.com/articles/${article.slug}`;
  const text = `✨ ${hook}\n\n${body}\n\n${url}`;

  try {
    const { TwitterApi } = await import("twitter-api-v2");
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
    });

    const tweet = await client.v2.tweet(text);

    await db.socialPost.create({
      data: {
        articleId,
        platform: SocialPlatform.TWITTER,
        status: SocialPostStatus.PUBLISHED,
        platformPostId: tweet.data.id,
        caption: text,
      },
    });

    revalidatePath("/social/facebook");
    return { success: true, tweetId: tweet.data.id };
  } catch (err) {
    await db.socialPost.create({
      data: {
        articleId,
        platform: SocialPlatform.TWITTER,
        status: SocialPostStatus.FAILED,
        caption: text,
        errorMessage: String(err),
      },
    });
    return { success: false, error: String(err) };
  }
}

export async function skipArticleFacebook(articleId: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session) return { success: false };
  await db.socialPost.create({
    data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.SKIPPED },
  });
  revalidatePath("/social/facebook");
  return { success: true };
}
