import { getModontyAuthor, getAuthorsStats } from "./actions/authors-actions";
import { AuthorProfileStats } from "./components/author-profile-stats";
import { AuthorForm } from "./components/author-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function AuthorsPage() {
  const [author, stats] = await Promise.all([
    getModontyAuthor(),
    getAuthorsStats(),
  ]);

  if (!author) {
    return (
      <div className="container mx-auto max-w-[1128px] space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error: Modonty author not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold leading-tight">Modonty Author Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage the unified Modonty author profile. All articles are automatically attributed to this author.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {author.url && (
            <Link href={author.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </Link>
          )}
          <Link href={`/articles?authorId=${author.id}`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              View Articles
            </Button>
          </Link>
        </div>
      </div>

      <AuthorProfileStats
        author={author}
        stats={{
          totalArticles: stats.totalArticles,
          publishedArticles: stats.publishedArticles,
          draftArticles: stats.draftArticles || 0,
          archivedArticles: stats.archivedArticles || 0,
          seoScore: stats.averageSEO,
          socialProfilesCount: stats.socialProfilesCount || 0,
          eetatSignalsCount: stats.eetatSignalsCount || 0,
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Author Profile</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Update author profile information, social links, and SEO settings.
          </p>
        </CardHeader>
        <CardContent>
          <AuthorForm
            initialData={author}
            authorId={author.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
