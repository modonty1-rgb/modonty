"use client";

import { useState } from "react";
import Link from "next/link";
import { Facebook, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  imageUrl: string | null;
  tags: string[];
  clientName: string | null;
  datePublished: string | null;
};

export type PublishedRow = {
  id: string;
  platformPostId: string | null;
  postedAt: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  imageUrl: string | null;
  clientName: string | null;
};

type Stats = { pending: number; thisMonth: number; total: number; failed: number };

type Tab = "pending" | "published";

export default function FacebookPageClient({
  articles,
  publishedPosts,
  stats,
}: {
  articles: ArticleRow[];
  publishedPosts: PublishedRow[];
  stats: Stats;
}) {
  const [tab, setTab] = useState<Tab>("pending");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-[#1877F2] flex items-center justify-center shrink-0">
          <Facebook className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Facebook</h1>
          <p className="text-xs text-muted-foreground">Manage and publish articles to Facebook Page</p>
        </div>
        <div className="ms-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          Connected · Modonty
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Posts</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Published This Month</p>
            <p className="text-3xl font-bold mt-1 text-green-400">{stats.thisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Published</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Failed</p>
            <p className={`text-3xl font-bold mt-1 ${stats.failed > 0 ? "text-red-400" : ""}`}>{stats.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Table */}
      <Card>
        <CardHeader className="pb-0 flex-row items-center justify-between space-y-0">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("pending")}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                tab === "pending"
                  ? "bg-background border border-b-background text-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pending
              <Badge variant="secondary" className="ms-2 text-xs">{articles.length}</Badge>
            </button>
            <button
              onClick={() => setTab("published")}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${
                tab === "published"
                  ? "bg-background border border-b-background text-foreground -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Published
              <Badge variant="secondary" className="ms-2 text-xs">{publishedPosts.length}</Badge>
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {tab === "pending" && (
            articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Facebook className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">All articles have been posted 🎉</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[54px]"></TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} className="cursor-pointer hover:bg-muted/40 transition-colors">
                      <TableCell>
                        {article.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={article.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Facebook className="h-4 w-4 text-muted-foreground opacity-30" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm max-w-[360px] truncate" title={article.title}>
                          {article.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[360px]">
                          modonty.com/articles/{article.slug}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {article.clientName ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {article.datePublished
                          ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(article.datePublished))
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button asChild size="sm" className="bg-[#1877F2] hover:bg-[#1565d8] text-white text-xs h-7 px-3">
                          <Link href={`/social/facebook/${article.id}`}>
                            <Facebook className="h-3 w-3 me-1" />
                            Review
                            <ChevronRight className="h-3 w-3 ms-1" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}

          {tab === "published" && (
            publishedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Facebook className="h-10 w-10 mb-3 opacity-20" />
                <p className="text-sm">No posts published yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[54px]"></TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Posted On</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedPosts.map((post) => (
                    <TableRow key={post.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        {post.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <Facebook className="h-4 w-4 text-muted-foreground opacity-30" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm max-w-[360px] truncate" title={post.articleTitle}>
                          {post.articleTitle}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[360px]">
                          modonty.com/articles/{post.articleSlug}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {post.clientName ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(post.postedAt))}
                      </TableCell>
                      <TableCell>
                        {post.platformPostId && (
                          <a
                            href={`https://www.facebook.com/${post.platformPostId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#1877F2] hover:underline"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
