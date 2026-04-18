'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { NewsItem } from "./NewsItem";
import { IconChevronDown } from "@/lib/icons";
import type { RightSidebarArticle } from "./types";

interface ModontyCardProps {
  articles: RightSidebarArticle[];
}

const VISIBLE = 3;

export function ModontyCard({ articles }: ModontyCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (articles.length === 0) return null;

  const visible = expanded ? articles : articles.slice(0, VISIBLE);
  const hasMore = articles.length > VISIBLE;

  return (
    <Card
      className="flex-none overflow-x-hidden border-0"
      role="complementary"
      aria-label="جديد مودونتي"
    >
      <CardContent className="p-3 flex flex-col min-w-0 gap-0.5">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="text-xs font-semibold text-foreground">جديد مودونتي</h2>
          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
              aria-expanded={expanded}
            >
              {expanded ? 'أقل' : `المزيد (${articles.length - VISIBLE})`}
              <IconChevronDown className={`h-3 w-3 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
        {visible.map((article) => (
          <NewsItem
            key={article.id}
            title={article.title}
            slug={article.slug}
            showDescription={false}
            showDot
          />
        ))}
      </CardContent>
    </Card>
  );
}
