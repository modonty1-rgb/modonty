import { getModontyAuthor, getAuthorsStats } from "./actions/authors-actions";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { AuthorForm } from "./components/author-form";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileText, CheckCircle2, Share2 } from "lucide-react";

export default async function AuthorsPage() {
  const [author, stats, settings, siteUrl] = await Promise.all([
    getModontyAuthor(),
    getAuthorsStats(),
    getAllSettings(),
    loadSiteUrl(),
  ]);

  // The org's real channel count lives in Settings (11 platforms), not the author record.
  const channelCount = [
    settings.facebookUrl, settings.twitterUrl, settings.linkedInUrl, settings.instagramUrl,
    settings.youtubeUrl, settings.tiktokUrl, settings.snapchatUrl, settings.pinterestUrl,
    settings.whatsappChannelUrl, settings.telegramChannelUrl, settings.googleBusinessProfileUrl,
  ].filter(Boolean).length;

  if (!author) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error: Modonty author not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <AuthorForm
        initialData={author}
        authorId={author.id}
        settings={settings}
        siteUrl={siteUrl}
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-lg ring-2 ring-primary/20">
                <AvatarImage
                  src={author.image ?? settings.logoUrl ?? settings.orgLogoUrl ?? undefined}
                  alt={author.name}
                  className="object-contain p-1"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold rounded-lg">
                  {author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">{author.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Publisher · Organization</p>
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
                <span className="font-semibold">{channelCount}</span>
                <span className="text-muted-foreground">channels</span>
              </Badge>
            </div>
          </div>
        }
      />
    </div>
  );
}
