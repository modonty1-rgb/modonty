"use server";

import { db } from "@/lib/db";

function esc(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function fmtDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function toCsv(headers: string[], rows: string[][]): string {
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ─── Subscribers ───
export async function exportSubscribersToCSV(): Promise<string> {
  const data = await db.subscriber.findMany({
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Name", "Email", "Client", "Subscribed", "Subscribed Date", "Unsubscribed Date", "Consent Given"],
    data.map((s) => [
      esc(s.name),
      esc(s.email),
      esc(s.client?.name),
      s.subscribed ? "Yes" : "No",
      fmtDate(s.subscribedAt),
      fmtDate(s.unsubscribedAt),
      s.consentGiven ? "Yes" : "No",
    ])
  );
}

// ─── News Subscribers ───
export async function exportNewsSubscribersToCSV(): Promise<string> {
  const data = await db.newsSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Name", "Email", "Subscribed", "Subscribed Date", "Unsubscribed Date", "Consent Given"],
    data.map((s) => [
      esc(s.name),
      esc(s.email),
      s.subscribed ? "Yes" : "No",
      fmtDate(s.subscribedAt),
      fmtDate(s.unsubscribedAt),
      s.consentGiven ? "Yes" : "No",
    ])
  );
}

// ─── Contact Messages ───
export async function exportContactMessagesToCSV(): Promise<string> {
  const data = await db.contactMessage.findMany({
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Name", "Email", "Subject", "Message", "Status", "Client", "Reply", "Date"],
    data.map((m) => [
      esc(m.name),
      esc(m.email),
      esc(m.subject),
      esc(m.message),
      esc(m.status),
      esc(m.client?.name),
      esc(m.replyBody),
      fmtDate(m.createdAt),
    ])
  );
}

// ─── Conversions ───
export async function exportConversionsToCSV(): Promise<string> {
  const data = await db.conversion.findMany({
    include: {
      article: { select: { title: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Type", "Article", "Client", "Value", "Currency", "UTM Source", "UTM Medium", "UTM Campaign", "Date"],
    data.map((c) => [
      esc(c.type),
      esc(c.article?.title),
      esc(c.client?.name),
      (c.value ?? "").toString(),
      esc(c.currency),
      esc(c.utmSource),
      esc(c.utmMedium),
      esc(c.utmCampaign),
      fmtDate(c.createdAt),
    ])
  );
}

// ─── Lead Scoring ───
export async function exportLeadScoringToCSV(): Promise<string> {
  const data = await db.leadScoring.findMany({
    include: {
      user: { select: { name: true, email: true } },
      client: { select: { name: true } },
    },
    orderBy: { engagementScore: "desc" },
  });

  return toCsv(
    ["Name", "Email", "Client", "Score", "Level", "Qualified", "Pages Viewed", "Time Spent (s)", "Interactions", "Conversions", "Last Activity"],
    data.map((l) => [
      esc(l.user?.name),
      esc(l.user?.email || l.email),
      esc(l.client?.name),
      l.engagementScore.toString(),
      esc(l.qualificationLevel),
      l.isQualified ? "Yes" : "No",
      l.pagesViewed.toString(),
      l.totalTimeSpent.toFixed(0),
      l.interactions.toString(),
      l.conversions.toString(),
      fmtDate(l.lastActivityAt),
    ])
  );
}

// ─── Shares ───
export async function exportSharesToCSV(): Promise<string> {
  const data = await db.share.findMany({
    include: {
      article: { select: { title: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Platform", "Article", "Client", "Date"],
    data.map((s) => [
      esc(s.platform),
      esc(s.article?.title),
      esc(s.client?.name),
      fmtDate(s.createdAt),
    ])
  );
}

// ─── Campaign Tracking ───
export async function exportCampaignsToCSV(): Promise<string> {
  const data = await db.campaignTracking.findMany({
    include: {
      article: { select: { title: true } },
      client: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return toCsv(
    ["Campaign", "Type", "Article", "Client", "UTM Source", "UTM Medium", "Cost", "Impressions", "Clicks", "Conversions", "Date"],
    data.map((c) => [
      esc(c.campaignName),
      esc(c.type),
      esc(c.article?.title),
      esc(c.client?.name),
      esc(c.utmSource),
      esc(c.utmMedium),
      (c.cost ?? "").toString(),
      (c.impressions ?? "").toString(),
      (c.clicks ?? "").toString(),
      (c.conversions ?? "").toString(),
      fmtDate(c.createdAt),
    ])
  );
}
