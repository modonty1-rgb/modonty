"use server";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { format, startOfDay, endOfDay } from "date-fns";

export async function getViewsTrendData(filters?: {
  clientId?: string;
  articleId?: string;
  startDate?: Date;
  endDate?: Date;
  groupBy?: "day" | "week" | "month";
}) {
  try {
    const where: Prisma.AnalyticsWhereInput = {};
    if (filters?.clientId) where.clientId = filters.clientId;
    if (filters?.articleId) where.articleId = filters.articleId;
    
    const defaultStartDate = startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const defaultEndDate = endOfDay(new Date());
    const groupBy = filters?.groupBy || "day";
    
    const startDate = filters?.startDate ? startOfDay(filters.startDate) : defaultStartDate;
    const endDate = filters?.endDate ? endOfDay(filters.endDate) : defaultEndDate;
    
    where.timestamp = {
      gte: startDate,
      lte: endDate,
    };

    const analytics = await db.analytics.findMany({
      where,
      select: {
        timestamp: true,
        sessionId: true,
      },
      orderBy: { timestamp: "asc" },
    });

    const grouped = analytics.reduce((acc, record) => {
      const date = new Date(record.timestamp);
      let key: string;

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!acc[key]) {
        acc[key] = { views: 0, sessions: new Set<string>() };
      }
      acc[key].views++;
      if (record.sessionId) {
        acc[key].sessions.add(record.sessionId);
      }
      return acc;
    }, {} as Record<string, { views: number; sessions: Set<string> }>);

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date: formatDate(date, groupBy),
        views: data.views,
        sessions: data.sessions.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error fetching views trend:", error);
    return [];
  }
}

function formatDate(dateStr: string, groupBy: "day" | "week" | "month"): string {
  const date = new Date(dateStr);
  if (groupBy === "day") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (groupBy === "week") {
    return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
}

