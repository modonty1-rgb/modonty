"use client";

import { SortableValue } from "@/lib/types";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { ArticleStatus } from "@prisma/client";
import { getStatusLabel, getStatusVariant } from "../../../articles/helpers/status-utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { ArticleRowActions } from "@/app/(dashboard)/articles/components/article-row-actions";

interface Article {
  id: string;
  title: string;
  status: ArticleStatus;
  createdAt: Date;
  datePublished: Date | null;
  scheduledAt: Date | null;
  views: number;
  category: { name: string } | null;
  author: { name: string } | null;
  client: { name: string } | null;
}

interface CategoryArticlesProps {
  articles: Article[];
  categoryId: string;
}

type SortDirection = "asc" | "desc" | null;

export function CategoryArticles({ articles, categoryId }: CategoryArticlesProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const pageSize = 10;

  const filteredData = useMemo(() => {
    let result = articles.filter((article) => {
      const searchTerm = search.toLowerCase();
      return (
        article.title.toLowerCase().includes(searchTerm) ||
        article.client?.name.toLowerCase().includes(searchTerm) ||
        article.author?.name.toLowerCase().includes(searchTerm)
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
        } else if (sortKey === "author") {
          aValue = a.author?.name || "";
          bValue = b.author?.name || "";
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
  }, [articles, search, sortKey, sortDirection]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const getSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="ml-1 h-4 w-4" />;
    }
    return <ArrowDown className="ml-1 h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Articles</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/articles?categoryId=${categoryId}`}>View All Articles</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-medium">No articles found</p>
                        <p className="text-xs">Try adjusting your search terms</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <Link
                          href={`/articles/${article.id}`}
                          className="font-medium hover:underline"
                        >
                          {article.title}
                        </Link>
                      </TableCell>
                      <TableCell>{article.client?.name || "-"}</TableCell>
                      <TableCell>{article.author?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(article.status)}>
                          {getStatusLabel(article.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{article.views.toLocaleString()}</TableCell>
                      <TableCell>
                        {article.datePublished
                          ? format(new Date(article.datePublished), "MMM d, yyyy")
                          : article.scheduledAt
                            ? `Scheduled: ${format(new Date(article.scheduledAt), "MMM d, yyyy")}`
                            : "-"}
                      </TableCell>
                      <TableCell>
                        <ArticleRowActions articleId={article.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}{" "}
                articles
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
