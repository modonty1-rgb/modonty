import { db } from "@/lib/db";
import { ArticleStatus, CommentStatus, SubscriptionStatus } from "@prisma/client";
import { cacheTag, cacheLife } from "next/cache";

export interface FooterStats {
  articles: number;
  views: number;
  interactions: number;
  likes: number;
  comments: number;
  partners: number;
}
