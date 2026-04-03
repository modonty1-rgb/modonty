"use server";

import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

interface TableInfo {
  name: string;
  label: string;
  count: number;
  group: string;
}

interface DatabaseHealth {
  tables: TableInfo[];
  totalRecords: number;
  lastChecked: string;
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const [
    users,
    clients,
    articles,
    publishedArticles,
    draftArticles,
    categories,
    tags,
    industries,
    authors,
    subscribers,
    newsSubscribers,
    contactMessages,
    comments,
    media,
    articleViews,
    articleLikes,
    articleFavorites,
    shares,
    conversions,
    leads,
    campaigns,
    settings,
    subscriptionTiers,
  ] = await Promise.all([
    db.user.count(),
    db.client.count(),
    db.article.count(),
    db.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    db.article.count({ where: { status: { in: [ArticleStatus.WRITING, ArticleStatus.DRAFT] } } }),
    db.category.count(),
    db.tag.count(),
    db.industry.count(),
    db.author.count(),
    db.subscriber.count(),
    db.newsSubscriber.count(),
    db.contactMessage.count(),
    db.comment.count(),
    db.media.count(),
    db.articleView.count(),
    db.articleLike.count(),
    db.articleFavorite.count(),
    db.share.count(),
    db.conversion.count(),
    db.leadScoring.count(),
    db.campaignTracking.count(),
    db.settings.count(),
    db.subscriptionTierConfig.count(),
  ]);

  const tables: TableInfo[] = [
    { name: "users", label: "Admins", count: users, group: "Core" },
    { name: "clients", label: "Clients", count: clients, group: "Core" },
    { name: "articles", label: "All Articles", count: articles, group: "Content" },
    { name: "published", label: "Published", count: publishedArticles, group: "Content" },
    { name: "drafts", label: "Drafts & Writing", count: draftArticles, group: "Content" },
    { name: "categories", label: "Categories", count: categories, group: "Content" },
    { name: "tags", label: "Tags", count: tags, group: "Content" },
    { name: "authors", label: "Authors", count: authors, group: "Content" },
    { name: "industries", label: "Industries", count: industries, group: "Content" },
    { name: "media", label: "Media Files", count: media, group: "Content" },
    { name: "subscribers", label: "Client Subscribers", count: subscribers, group: "Audience" },
    { name: "newsSubscribers", label: "Newsletter Subscribers", count: newsSubscribers, group: "Audience" },
    { name: "contactMessages", label: "Contact Messages", count: contactMessages, group: "Audience" },
    { name: "comments", label: "Comments", count: comments, group: "Audience" },
    { name: "views", label: "Article Views", count: articleViews, group: "Analytics" },
    { name: "likes", label: "Likes", count: articleLikes, group: "Analytics" },
    { name: "favorites", label: "Favorites", count: articleFavorites, group: "Analytics" },
    { name: "shares", label: "Shares", count: shares, group: "Analytics" },
    { name: "conversions", label: "Conversions", count: conversions, group: "Analytics" },
    { name: "leads", label: "Leads", count: leads, group: "Analytics" },
    { name: "campaigns", label: "Campaigns", count: campaigns, group: "Analytics" },
    { name: "settings", label: "Settings", count: settings, group: "System" },
    { name: "subscriptionTiers", label: "Subscription Plans", count: subscriptionTiers, group: "System" },
  ];

  const totalRecords = tables.reduce((sum, t) => sum + t.count, 0);

  return {
    tables,
    totalRecords,
    lastChecked: new Date().toISOString(),
  };
}
