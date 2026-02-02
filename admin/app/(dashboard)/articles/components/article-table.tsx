"use client";

import { SortableValue } from "@/lib/types";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel, getStatusVariant } from "../helpers/status-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, Stethoscope, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { analyzeArticleSEO } from "../analyzer";
import type { Article as ArticleViewType } from "../[id]/helpers/article-view-types";

type Article = ArticleViewType & {
  views: number;
};

// Small component to display SEO score in table
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
  onSelectionChange?: (selectedIds: string[]) => void;
  search?: string;
}

type SortDirection = "asc" | "desc" | null;

export function ArticleTable({ articles, onSelectionChange, search: externalSearch }: ArticleTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
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

        if (sortKey === "views") {
          aValue = a.views;
          bValue = b.views;
        } else if (sortKey === "title") {
          aValue = a.title;
          bValue = b.title;
        } else if (sortKey === "client") {
          aValue = a.client?.name || "";
          bValue = b.client?.name || "";
        } else if (sortKey === "category") {
          aValue = a.category?.name || "";
          bValue = b.category?.name || "";
        } else if (sortKey === "author") {
          aValue = "Modonty";
          bValue = "Modonty";
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
        if (typeof aValue === "number" && typeof bValue === "number") {
          return aValue - bValue;
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
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-2 h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const allSelected = paginatedData.length > 0 && paginatedData.every((article) => selectedIds.has(article.id));
  const someSelected = paginatedData.some((article) => selectedIds.has(article.id));

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      paginatedData.forEach((article) => newSelected.add(article.id));
    } else {
      paginatedData.forEach((article) => newSelected.delete(article.id));
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const handleSelectOne = (articleId: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedIds(newSelected);
    onSelectionChange?.(Array.from(newSelected));
  };

  const getStatusBadge = (status: ArticleStatus) => {
    return <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
              <TableHead className="w-[70px]">
                <Stethoscope className="h-4 w-4 text-primary" />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("title")}
              >
                <div className="flex items-center">
                  Title
                  {getSortIcon("title")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("client")}
              >
                <div className="flex items-center">
                  Client
                  {getSortIcon("client")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {getSortIcon("category")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("author")}
              >
                <div className="flex items-center">
                  Author
                  {getSortIcon("author")}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("views")}
              >
                <div className="flex items-center">
                  Views
                  {getSortIcon("views")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("datePublished")}
              >
                <div className="flex items-center">
                  Published
                  {getSortIcon("datePublished")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  Created
                  {getSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Preview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
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
                  className="cursor-pointer"
                  onClick={() => {
                    window.location.href = `/articles/${article.id}`;
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(article.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectOne(article.id, e.target.checked);
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <ArticleTableSEOScore article={article} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/articles/${article.id}`}
                      className="font-medium hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {article.title}
                    </Link>
                  </TableCell>
                  <TableCell>{article.client?.name || "-"}</TableCell>
                  <TableCell>{article.category?.name || "-"}</TableCell>
                  <TableCell>Modonty</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {getStatusBadge(article.status)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{article.views.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {article.datePublished
                      ? format(new Date(article.datePublished), "MMM d, yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>{format(new Date(article.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/articles/preview/${article.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview
                    </Link>
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
