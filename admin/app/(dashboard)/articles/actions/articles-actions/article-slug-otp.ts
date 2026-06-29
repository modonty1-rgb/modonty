"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { randomInt } from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RATE_LIMIT = 3;
const TELEGRAM_API = "https://api.telegram.org";

function generateOtp(): string {
  return randomInt(1000, 10000).toString();
}

async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram credentials not configured");

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
  if (!res.ok) throw new Error("Failed to send Telegram message");
}

// ─── Step 1: Request OTP ─────────────────────────────────────────────────────
export async function requestArticleSlugOtp(
  articleId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const article = await db.article.findUnique({
    where: { id: articleId },
    select: { id: true, title: true, slug: true },
  });
  if (!article) return { success: false, error: "Article not found" };

  const windowStart = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000);
  const recentCount = await db.articleSlugOtp.count({
    where: { articleId, createdAt: { gt: windowStart } },
  });
  if (recentCount >= OTP_RATE_LIMIT) {
    return { success: false, error: "Too many OTP requests. Wait 10 minutes." };
  }

  await db.articleSlugOtp.updateMany({
    where: { articleId, used: false },
    data: { used: true },
  });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.articleSlugOtp.create({
    data: { articleId, code, expiresAt },
  });

  await sendTelegramMessage(
    `🔐 <b>Article Slug Change</b>\n\nTitle: <b>${article.title}</b>\nCurrent slug: <code>${article.slug}</code>\n\nOTP: <b>${code}</b>\nExpires in: ${OTP_EXPIRY_MINUTES} minutes`
  );

  return { success: true };
}

// ─── Step 2: Verify OTP + Execute Slug Change ────────────────────────────────
export async function verifyAndChangeArticleSlug(
  articleId: string,
  otp: string,
  newSlugRaw: string
): Promise<{ success: boolean; newSlug?: string; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const newSlug = slugify(newSlugRaw.trim());
  if (!newSlug) return { success: false, error: "Invalid slug value" };

  const record = await db.articleSlugOtp.findFirst({
    where: {
      articleId,
      code: otp.trim(),
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!record) return { success: false, error: "Invalid or expired OTP" };

  const existing = await db.article.findFirst({
    where: { slug: newSlug, id: { not: articleId } },
    select: { id: true },
  });
  if (existing) return { success: false, error: "Slug already in use by another article" };

  const oldArticle = await db.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  if (!oldArticle) return { success: false, error: "Article not found" };

  const oldSlug = oldArticle.slug;

  await db.articleSlugOtp.update({
    where: { id: record.id },
    data: { used: true },
  });

  await db.article.update({
    where: { id: articleId },
    data: { slug: newSlug },
  });

  revalidatePath(`/articles/${oldSlug}`);
  revalidatePath(`/articles/${newSlug}`);

  await sendTelegramMessage(
    `✅ <b>Article Slug Changed</b>\n\nOld: <code>${oldSlug}</code>\nNew: <code>${newSlug}</code>`
  ).catch(() => {});

  return { success: true, newSlug };
}
