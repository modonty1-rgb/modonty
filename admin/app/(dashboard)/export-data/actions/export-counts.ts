"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getExportCounts() {
  try {
    const [articles, clients, categories, tags, industries, authors, subscribers, newsSubscribers, contactMessages, conversions, leads, shares, campaigns] = await Promise.all([
      db.article.count({ where: { status: { in: [ArticleStatus.WRITING, ArticleStatus.DRAFT, ArticleStatus.SCHEDULED, ArticleStatus.PUBLISHED, ArticleStatus.ARCHIVED] } } }),
      db.client.count(),
      db.category.count(),
      db.tag.count(),
      db.industry.count(),
      db.author.count(),
      db.subscriber.count(),
      db.newsSubscriber.count(),
      db.contactMessage.count(),
      db.conversion.count(),
      db.leadScoring.count(),
      db.share.count(),
      db.campaignTracking.count(),
    ]);

    return {
      articles,
      clients,
      categories,
      tags,
      industries,
      authors,
      analytics: articles,
      subscribers,
      newsSubscribers,
      contactMessages,
      conversions,
      leads,
      shares,
      campaigns,
    };
  } catch {
    return {
      articles: 0, clients: 0, categories: 0, tags: 0, industries: 0, authors: 0, analytics: 0,
      subscribers: 0, newsSubscribers: 0, contactMessages: 0, conversions: 0, leads: 0, shares: 0, campaigns: 0,
    };
  }
}
