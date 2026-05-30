"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { revalidateModontyTag } from "@/lib/revalidate-modonty-tag";
import { sendEmailWithRetry } from "@/lib/email/resend-client";
import { clientWelcomeEmail } from "@/lib/email/templates/client-welcome";
import { generateClientSEO } from "./clients-actions/generate-client-seo";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";

const CONSOLE_URL = "https://console.modonty.com";
// Temp password sent in the welcome email — the client changes it from the console.
const TEMP_PASSWORD = "admin123";

interface ConvertParams {
  subscriberId: string;
  slug: string;
  industryId?: string;
}

interface ConvertResult {
  ok: boolean;
  clientId?: string;
  warning?: string;
  error?: string;
}

export async function convertSubscriberToClientAction(
  params: ConvertParams
): Promise<ConvertResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const slug = params.slug?.trim();
  if (!slug) return { ok: false, error: "السلَج مطلوب" };

  try {
    // 1. Subscriber exists + not already converted
    const subscriber = await db.jbrseoSubscriber.findUnique({
      where: { id: params.subscriberId },
    });
    if (!subscriber) return { ok: false, error: "المشترك غير موجود" };
    if (subscriber.convertedToClientId) {
      return { ok: false, error: "هذا المشترك تم تحويله مسبقاً" };
    }

    // 2. Slug uniqueness
    const slugTaken = await db.client.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (slugTaken) return { ok: false, error: "السلَج مستخدم بالفعل" };

    // 3. Tier config by plan name (single source of truth — synced from jbrseo)
    const tierConfig = await db.subscriptionTierConfig.findFirst({
      where: { name: subscriber.planName },
      select: { id: true, tier: true, articlesPerMonth: true },
    });
    if (!tierConfig) {
      return {
        ok: false,
        error: `الباقة "${subscriber.planName}" غير معروفة — شغّل مزامنة الباقات أولاً`,
      };
    }

    // 4. Build client (temp password, status PENDING)
    const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

    const createData: Prisma.ClientCreateInput = {
      name: subscriber.businessName || subscriber.contactName || subscriber.email,
      slug,
      email: subscriber.email,
      phone: subscriber.phone,
      password: hashedPassword,
      subscriptionTier: tierConfig.tier,
      subscriptionTierConfig: { connect: { id: tierConfig.id } },
      articlesPerMonth: tierConfig.articlesPerMonth,
      subscriptionStatus: "PENDING",
      paymentStatus: "PENDING",
    };

    if (params.industryId) {
      const industry = await db.industry.findUnique({
        where: { id: params.industryId },
        select: { id: true },
      });
      if (!industry) return { ok: false, error: "القطاع المختار غير موجود" };
      createData.industry = { connect: { id: industry.id } };
    }

    const client = await db.client.create({ data: createData });

    // 5. Mark subscriber as converted
    await db.jbrseoSubscriber.update({
      where: { id: subscriber.id },
      data: { convertedToClientId: client.id, convertedAt: new Date() },
    });

    // 6. Welcome email (real send — non-blocking)
    let warning: string | undefined;
    try {
      const email = clientWelcomeEmail({
        clientName: client.name,
        email: subscriber.email,
        password: TEMP_PASSWORD,
        consoleUrl: CONSOLE_URL,
      });
      await sendEmailWithRetry({
        from: process.env.RESEND_FROM || "",
        to: subscriber.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
        // Tags surface in Resend webhooks so we can track delivered/opened per client.
        tags: [
          { name: "emailType", value: "client-welcome" },
          { name: "clientId", value: client.id },
        ],
      });
    } catch {
      warning = "تم إنشاء العميل، لكن فشل إرسال إيميل الترحيب.";
    }

    // 7. SEO + revalidate
    try {
      await generateClientSEO(client.id);
    } catch {
      warning = warning
        ? warning + " كذلك فشل توليد بيانات SEO."
        : "تم إنشاء العميل، لكن فشل توليد بيانات SEO.";
    }

    revalidatePath("/clients");
    await revalidateModontyTag("clients");
    try {
      const { regenerateClientsListingCache } = await import(
        "@/lib/seo/listing-page-seo-generator"
      );
      await regenerateClientsListingCache();
    } catch {}

    return { ok: true, clientId: client.id, warning };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "فشل تحويل المشترك إلى عميل";
    return { ok: false, error: message };
  }
}
