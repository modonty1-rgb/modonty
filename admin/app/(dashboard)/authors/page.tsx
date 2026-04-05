import { getModontyAuthor, getAuthorsStats } from "./actions/authors-actions";
import { getSEOSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { AuthorForm } from "./components/author-form";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileText, CheckCircle2, Share2 } from "lucide-react";

export default async function AuthorsPage() {
  const [author, stats, seoSettings] = await Promise.all([
    getModontyAuthor(),
    getAuthorsStats(),
    getSEOSettings(),
  ]);

  if (!author) {
    return (
      <div className="px-6 py-6 max-w-[1200px] mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error: Modonty author not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">
      <AuthorForm
        initialData={author}
        authorId={author.id}
        seoSettings={seoSettings}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={author.image ?? undefined} alt={author.name} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">{author.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {author.jobTitle || "Author Profile"}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
                <FileText className="h-3 w-3 text-violet-500" />
                <span className="font-semibold">{stats.totalArticles}</span>
                <span className="text-muted-foreground">articles</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="font-semibold">{stats.publishedArticles}</span>
                <span className="text-muted-foreground">published</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5 font-normal">
                <Share2 className="h-3 w-3 text-blue-500" />
                <span className="font-semibold">{stats.socialProfilesCount}</span>
                <span className="text-muted-foreground">social</span>
              </Badge>
            </div>
          </div>
        }
      />
    </div>
  );
}
