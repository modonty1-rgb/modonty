import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";

interface RecentArticle {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  client: { name: string } | null;
  category: { name: string } | null;
  author: { name: string } | null;
}

interface RecentArticlesProps {
  articles: RecentArticle[];
}

export function RecentArticles({ articles }: RecentArticlesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Articles</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Latest 5 articles sorted by creation date
        </p>
      </CardHeader>
      <CardContent>
        {articles.length === 0 ? (
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
              {articles.map((article) => (
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
      </CardContent>
    </Card>
  );
}
