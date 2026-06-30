"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SocialPlatform, SocialPostStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

const API = "https://graph.facebook.com/v25.0";

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
      const upload = await graphPost(`${pageId}/photos`, {
        url: imageUrl,
        published: "false",
      });
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

export async function generateFacebookBodyAI(
  seoTitle: string,
  seoDescription: string
): Promise<{ success: boolean; body?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `أنت خبير تسويق رقمي متخصص في كتابة محتوى فيسبوك للجمهور العربي.

اكتب نص قصير لمنشور فيسبوك باللغة العربية — جملتان أو ثلاث فقط، بدون شرح إضافي، بدون إيموجي.

عنوان المقال: ${seoTitle}
وصف المقال: ${seoDescription}

النص يجب أن:
- يقدّم قيمة فعلية مباشرة لصاحب العمل السعودي
- يكون واضحاً وعملياً
- لا يطلب من القارئ أي شيء (بدون CTA — الـ CTA موجود خارج هذا النص)`;

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
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `أنت خبير تسويق رقمي متخصص في كتابة محتوى فيسبوك للجمهور العربي.

اكتب hook جذاب للسطر الأول من منشور فيسبوك باللغة العربية. السطر الأول فقط، بدون شرح إضافي، بدون إيموجي.

عنوان المقال: ${seoTitle}
وصف المقال: ${seoDescription}

الـ hook يجب أن:
- يطرح مشكلة أو سؤالاً يلمس صاحب العمل السعودي
- بين 8-15 كلمة
- أسلوب مباشر وعملي`;

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

export async function skipArticleFacebook(articleId: string): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session) return { success: false };
  await db.socialPost.create({
    data: { articleId, platform: SocialPlatform.FACEBOOK, status: SocialPostStatus.SKIPPED },
  });
  revalidatePath("/social/facebook");
  return { success: true };
}
