"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Archive, Edit, Calendar } from "lucide-react";
import { format } from "date-fns";

// TODO: DEV REMINDER - Articles Overview Component
// This component combines Articles by Status and Recent Articles in one card.
// Consider splitting into separate components if the card becomes too large or if
// individual sections need to be reused elsewhere. Monitor performance with large
// article lists and consider pagination if needed.

interface StatusBreakdown {
  writing: number;
  draft: number;
  scheduled: number;
  published: number;
  archived: number;
  total: number;
}

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  client: { name: string } | null;
  category: { name: string } | null;
  author: { name: string } | null;
}

interface ArticlesOverviewProps {
  breakdown: StatusBreakdown;
  recentArticles: RecentArticle[];
}

export function ArticlesOverview({ breakdown, recentArticles }: ArticlesOverviewProps) {
  const percentage = (value: number) => {
    if (breakdown.total === 0) return 0;
    return (value / breakdown.total) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Articles Overview</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Status breakdown and recent article activity
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Link href="/articles?status=WRITING" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-primary" />
                <span className="underline">Writing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{breakdown.writing}</span>
                <span className="text-muted-foreground text-xs">
                  ({percentage(breakdown.writing).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${percentage(breakdown.writing)}%` }}
              />
            </div>
          </Link>

          <Link href="/articles?status=DRAFT" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="underline">Draft</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{breakdown.draft}</span>
                <span className="text-muted-foreground text-xs">
                  ({percentage(breakdown.draft).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-muted-foreground h-full transition-all"
                style={{ width: `${percentage(breakdown.draft)}%` }}
              />
            </div>
          </Link>

          <Link href="/articles?status=SCHEDULED" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="underline">Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{breakdown.scheduled}</span>
                <span className="text-muted-foreground text-xs">
                  ({percentage(breakdown.scheduled).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary/70 h-full transition-all"
                style={{ width: `${percentage(breakdown.scheduled)}%` }}
              />
            </div>
          </Link>

          <Link href="/articles?status=PUBLISHED" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="underline">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{breakdown.published}</span>
                <span className="text-muted-foreground text-xs">
                  ({percentage(breakdown.published).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all"
                style={{ width: `${percentage(breakdown.published)}%` }}
              />
            </div>
          </Link>

          <Link href="/articles?status=ARCHIVED" className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-muted-foreground" />
                <span className="underline">Archived</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{breakdown.archived}</span>
                <span className="text-muted-foreground text-xs">
                  ({percentage(breakdown.archived).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-muted-foreground h-full transition-all"
                style={{ width: `${percentage(breakdown.archived)}%` }}
              />
            </div>
          </Link>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-4">Recent Articles</h3>
          {recentArticles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No articles yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <Link
                        href={`/articles/${article.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {article.title}
                      </Link>
                    </TableCell>
                    <TableCell>{article.client?.name || "-"}</TableCell>
                    <TableCell>{article.category?.name || "-"}</TableCell>
                    <TableCell>{article.author?.name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={article.status === "PUBLISHED" ? "default" : "secondary"}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(article.createdAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
