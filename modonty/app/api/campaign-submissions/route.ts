import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  campaignDefinitions,
  campaignSubmissionSchema,
} from "@/lib/campaigns/campaign-submission-schema";
import { isCampaignSubmissionRateLimited } from "./is-campaign-submission-rate-limited";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",") ?? [];
  return forwarded[forwarded.length - 1]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function normalizePhone(raw: string): string {
  const value = raw.replace(/[\s-]/g, "");
  if (/^05\d{8}$/.test(value)) return `+966${value.slice(1)}`;
  return value.startsWith("+") ? value : `+${value}`;
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ success: false, error: "طلب غير مسموح." }, { status: 403 });
  }

  const ipAddress = clientIp(request);
  if (isCampaignSubmissionRateLimited(ipAddress, Date.now())) {
    return NextResponse.json(
      { success: false, error: "محاولات كثيرة. جرّب بعد شوي." },
      { status: 429 }
    );
  }

  const parsed = campaignSubmissionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "تحقق من البيانات." },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const definition = campaignDefinitions[input.campaignKey];

  try {
    // The configured key creates this campaign once in development/first deployment;
    // later submissions only refresh its display metadata and preserve its status.
    const campaign = await db.campaign.upsert({
      where: { key: input.campaignKey },
      create: {
        key: input.campaignKey,
        name: definition.name,
        landingPath: definition.landingPath,
      },
      update: {
        name: definition.name,
        landingPath: definition.landingPath,
      },
      select: { id: true, status: true },
    });

    if (campaign.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "هذه الحملة غير متاحة حاليًا." },
        { status: 410 }
      );
    }

    const replayedSubmission = await db.campaignSubmission.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      select: { id: true },
    });
    if (replayedSubmission) {
      return NextResponse.json({
        success: true,
        data: { submissionId: replayedSubmission.id, replayed: true },
      });
    }

    const phone = normalizePhone(input.phone);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const repeated = await db.campaignSubmission.count({
      where: { campaignId: campaign.id, phone, createdAt: { gte: oneHourAgo } },
    });
    if (repeated > 0) {
      return NextResponse.json({ success: true, data: { duplicated: true } });
    }

    const submission = await db.campaignSubmission.create({
      data: {
        campaignId: campaign.id,
        formKey: input.formKey,
        idempotencyKey: input.idempotencyKey,
        businessName: input.businessName,
        email: input.email,
        phone,
        sector: input.sector,
        landingPath: input.landingPath,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmContent: input.utmContent,
        utmTerm: input.utmTerm,
        referrer: input.referrer,
        ipAddress,
        userAgent: request.headers.get("user-agent"),
        whatsappHandoffAt: new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, data: { submissionId: submission.id } });
  } catch (error) {
    // Two retries with the same key can race at the database unique index.
    // Returning the first write makes that retry safe instead of creating a second lead.
    if (typeof error === "object" && error && "code" in error && error.code === "P2002") {
      const idempotencyKey = parsed.data.idempotencyKey;
      const replayedSubmission = await db.campaignSubmission.findUnique({
        where: { idempotencyKey },
        select: { id: true },
      });
      if (replayedSubmission) {
        return NextResponse.json({
          success: true,
          data: { submissionId: replayedSubmission.id, replayed: true },
        });
      }
    }

    console.error("[campaign-submissions] Failed to persist campaign lead", error);
    return NextResponse.json(
      { success: false, error: "تعذّر حفظ طلبك. حاول مرة ثانية." },
      { status: 500 }
    );
  }
}
