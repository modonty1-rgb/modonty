"use client";

import { SortableValue } from "@/lib/types";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { getStatusLabel, getStatusVariant } from "../helpers/status-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Eye, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeArticleSEO } from "../analyzer";
import type { Article as ArticleViewType } from "../[id]/helpers/article-view-types";

type Article = ArticleViewType & {
  views: number;
};

function ArticleTableSEOScore({ article }: { article: ArticleViewType }) {
  const scoreResult = useMemo(() => analyzeArticleSEO(article), [article]);
  const score = scoreResult.percentage;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  return (
    <Badge className={cn('px-2 py-0.5 text-xs font-semibold', getScoreColor(score))}>
      {score}%
    </Badge>
  );
}

interface ArticleTableProps {
  articles: Article[];
  search?: string;
}

type SortDirection = "asc" | "desc" | null;

export function ArticleTable({ articles, search: externalSearch }: ArticleTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    const searchTerm = (externalSearch || "").toLowerCase();
    let result = articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(searchTerm) ||
        article.client?.name.toLowerCase().includes(searchTerm) ||
        article.category?.name.toLowerCase().includes(searchTerm) ||
        "modonty".includes(searchTerm)
      );
    });

    if (sortKey && sortDirection) {
      result = [...result].sort((a, b) => {
        let aValue: SortableValue;
        let bValue: SortableValue;

        if (sortKey === "title") {
          aValue = a.title;
          bValue = b.title;
        } else if (sortKey === "datePublished") {
          aValue = a.datePublished || a.scheduledAt || null;
          bValue = b.datePublished || b.scheduledAt || null;
        } else if (sortKey === "createdAt") {
          aValue = a.createdAt;
          bValue = b.createdAt;
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return aValue.localeCompare(bValue);
        }
        if (aValue instanceof Date && bValue instanceof Date) {
          return aValue.getTime() - bValue.getTime();
        }
        return String(aValue).localeCompare(String(bValue));
      });

      if (sortDirection === "desc") {
        result.reverse();
      }
    }

    return result;
  }, [articles, externalSearch, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="ms-1.5 h-3.5 w-3.5 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ms-1.5 h-3.5 w-3.5 text-primary" />;
    }
    return <ArrowDown className="ms-1.5 h-3.5 w-3.5 text-primary" />;
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Article
                  {getSortIcon("title")}
                </div>
              </TableHead>
              <TableHead className="w-[70px]">SEO</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead
                className="w-[110px] cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("datePublished")}
              >
                <div className="flex items-center">
                  Date
                  {getSortIcon("datePublished")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium">No articles found</p>
                    <p className="text-xs">Try adjusting your filters or search terms</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((article) => (
                <TableRow
                  key={article.id}
                  className="cursor-pointer group"
                  onClick={() => {
                    window.location.href = `/articles/${article.id}`;
                  }}
                >
                  {/* Article info — title + client + category */}
                  <TableCell>
                    <div className="space-y-0.5">
                      <Link
                        href={`/articles/${article.id}`}
                        className="font-medium hover:text-primary line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {article.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {article.client?.name && (
                          <span>{article.client.name}</span>
                        )}
                        {article.client?.name && article.category?.name && (
                          <span>·</span>
                        )}
                        {article.category?.name && (
                          <span className="flex items-center gap-0.5">
                            <FolderOpen className="h-3 w-3" />
                            {article.category.name}
                          </span>
                        )}
                        {article.views > 0 && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-0.5">
                              <Eye className="h-3 w-3" />
                              {article.views.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* SEO score */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <ArticleTableSEOScore article={article} />
                  </TableCell>

                  {/* Status */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Badge variant={getStatusVariant(article.status)}>
                      {getStatusLabel(article.status)}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell>
                    <div className="text-sm">
                      {article.datePublished
                        ? format(new Date(article.datePublished), "MMM d, yyyy")
                        : (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(article.createdAt), "MMM d, yyyy")}
                          </span>
                        )}
                    </div>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of{" "}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
