"use server";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/csv/format-date";
import { escapeCsv } from "../helpers/escape-csv";

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
      escapeCsv(s.name),
      escapeCsv(s.email),
      escapeCsv(s.client?.name),
      s.subscribed ? "Yes" : "No",
      formatDate(s.subscribedAt),
      formatDate(s.unsubscribedAt),
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
      escapeCsv(s.name),
      escapeCsv(s.email),
      s.subscribed ? "Yes" : "No",
      formatDate(s.subscribedAt),
      formatDate(s.unsubscribedAt),
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
      escapeCsv(m.name),
      escapeCsv(m.email),
      escapeCsv(m.subject),
      escapeCsv(m.message),
      escapeCsv(m.status),
      escapeCsv(m.client?.name),
      escapeCsv(m.replyBody),
      formatDate(m.createdAt),
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
      escapeCsv(c.type),
      escapeCsv(c.article?.title),
      escapeCsv(c.client?.name),
      (c.value ?? "").toString(),
      escapeCsv(c.currency),
      escapeCsv(c.utmSource),
      escapeCsv(c.utmMedium),
      escapeCsv(c.utmCampaign),
      formatDate(c.createdAt),
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
      escapeCsv(l.user?.name),
      escapeCsv(l.user?.email || l.email),
      escapeCsv(l.client?.name),
      l.engagementScore.toString(),
      escapeCsv(l.qualificationLevel),
      l.isQualified ? "Yes" : "No",
      l.pagesViewed.toString(),
      l.totalTimeSpent.toFixed(0),
      l.interactions.toString(),
      l.conversions.toString(),
      formatDate(l.lastActivityAt),
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
      escapeCsv(s.platform),
      escapeCsv(s.article?.title),
      escapeCsv(s.client?.name),
      formatDate(s.createdAt),
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
      escapeCsv(c.campaignName),
      escapeCsv(c.type),
      escapeCsv(c.article?.title),
      escapeCsv(c.client?.name),
      escapeCsv(c.utmSource),
      escapeCsv(c.utmMedium),
      (c.cost ?? "").toString(),
      (c.impressions ?? "").toString(),
      (c.clicks ?? "").toString(),
      (c.conversions ?? "").toString(),
      formatDate(c.createdAt),
    ])
  );
}
