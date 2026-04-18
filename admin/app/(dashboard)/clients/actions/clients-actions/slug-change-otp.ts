"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { generateClientSEO } from "./generate-client-seo";
import { randomInt } from "crypto";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RATE_LIMIT = 3; // max requests per window
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

// ─── Step 1: Request OTP ──────────────────────────────────────────────────────
export async function requestSlugChangeOtp(clientId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, slug: true },
  });
  if (!client) return { success: false, error: "Client not found" };

  // Rate limit: max 3 requests per 10-minute window
  const windowStart = new Date(Date.now() - OTP_EXPIRY_MINUTES * 60 * 1000);
  const recentCount = await db.slugChangeOtp.count({
    where: { clientId, createdAt: { gt: windowStart } },
  });
  if (recentCount >= OTP_RATE_LIMIT) {
    return { success: false, error: "Too many OTP requests. Please wait 10 minutes before trying again." };
  }

  // Invalidate any previous unused OTPs for this client
  await db.slugChangeOtp.updateMany({
    where: { clientId, used: false },
    data: { used: true },
  });

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.slugChangeOtp.create({
    data: { clientId, code, expiresAt },
  });

  await sendTelegramMessage(
    `🔐 <b>Slug Change Request</b>\n\nClient: <b>${client.name}</b>\nCurrent slug: <code>${client.slug}</code>\n\nOTP: <b>${code}</b>\nExpires in: ${OTP_EXPIRY_MINUTES} minutes`
  );

  return { success: true };
}

// ─── Step 2: Verify OTP + Execute Slug Change ─────────────────────────────────
export async function verifyAndChangeSlug(
  clientId: string,
  otp: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session) return { success: false, error: "Unauthorized" };

  const newNameTrimmed = newName.trim();
  if (!newNameTrimmed) return { success: false, error: "New name is required" };

  const newSlug = slugify(newNameTrimmed);
  if (!newSlug) return { success: false, error: "Could not generate a valid slug from this name" };

  // Verify OTP
  const record = await db.slugChangeOtp.findFirst({
    where: {
      clientId,
      code: otp.trim(),
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!record) return { success: false, error: "Invalid or expired OTP" };

  // Check slug uniqueness
  const existing = await db.client.findFirst({
    where: { slug: newSlug, id: { not: clientId } },
    select: { id: true },
  });
  if (existing) return { success: false, error: "This slug is already in use by another client" };

  const oldClient = await db.client.findUnique({
    where: { id: clientId },
    select: { slug: true, canonicalUrl: true },
  });
  if (!oldClient) return { success: false, error: "Client not found" };

  const oldSlug = oldClient.slug;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modonty.com";
  const newCanonicalUrl = `${siteUrl}/clients/${newSlug}`;

  // Mark OTP as used
  await db.slugChangeOtp.update({
    where: { id: record.id },
    data: { used: true },
  });

  // Update client — slug + name + canonicalUrl
  await db.client.update({
    where: { id: clientId },
    data: {
      slug: newSlug,
      name: newNameTrimmed,
      canonicalUrl: newCanonicalUrl,
    },
  });

  // Regenerate JSON-LD + metadata (contains embedded slug)
  await generateClientSEO(clientId);

  // Revalidate old + new paths
  revalidatePath(`/clients/${oldSlug}`);
  revalidatePath(`/clients/${newSlug}`);
  revalidatePath("/clients");
  await revalidateModontyTag("clients");

  // Notify via Telegram
  await sendTelegramMessage(
    `✅ <b>Slug Changed Successfully</b>\n\nOld slug: <code>${oldSlug}</code>\nNew slug: <code>${newSlug}</code>\nNew name: <b>${newNameTrimmed}</b>`
  ).catch(() => {}); // non-blocking

  return { success: true };
}
