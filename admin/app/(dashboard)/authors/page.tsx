import { getModontyAuthor, getAuthorsStats } from "./actions/authors-actions";
import { getAllSettings } from "@/app/(dashboard)/settings/actions/settings-actions";
import { loadSiteUrl } from "@/lib/seo/site-url";
import { AuthorForm } from "./components/author-form";
import { AuthorSeoTechnical } from "./components/author-seo-technical";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SeoScoreBadge } from "@/components/shared/seo-score-badge";
import { FileText, CheckCircle2, Share2 } from "lucide-react";

export default async function AuthorsPage() {
  const [author, stats, settings, siteUrl] = await Promise.all([
    getModontyAuthor(),
    getAuthorsStats(),
    getAllSettings(),
    loadSiteUrl(),
  ]);

  if (!author) {
    return (
      <div className="mx-auto max-w-[1200px] py-12 text-center">
        <p className="text-muted-foreground">Error: Modonty author not found</p>
      </div>
    );
  }

  const channelCount = [
    settings.facebookUrl, settings.twitterUrl, settings.linkedInUrl, settings.instagramUrl,
    settings.youtubeUrl, settings.tiktokUrl, settings.snapchatUrl, settings.pinterestUrl,
    settings.whatsappChannelUrl, settings.telegramChannelUrl, settings.googleBusinessProfileUrl,
  ].filter(Boolean).length;

  const metric = "flex items-center gap-1.5 text-xs text-muted-foreground";

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header — identity + the one SEO score + quick stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 rounded-lg ring-2 ring-primary/20">
            <AvatarImage
              src={settings.logoUrl ?? settings.orgLogoUrl ?? author.image ?? undefined}
              alt={author.name}
              className="object-contain p-1"
            />
            <AvatarFallback className="rounded-lg bg-primary font-bold text-primary-foreground">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold leading-tight">{settings.siteName || author.name}</h1>
            <p className="mt-0.5 text-xs text-muted-foreground">Publisher · Organization</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={metric}><FileText className="h-3.5 w-3.5 text-violet-500" /><b className="text-foreground">{stats.totalArticles}</b> articles</span>
          <span className={metric}><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /><b className="text-foreground">{stats.publishedArticles}</b> published</span>
          <span className={metric}><Share2 className="h-3.5 w-3.5 text-blue-500" /><b className="text-foreground">{channelCount}</b> channels</span>
          <SeoScoreBadge score={stats.averageSEO} size="lg" />
        </div>
      </div>

      {/* Editor — search snippet (editable) + everything else (from Settings, read-only) */}
      <AuthorForm initialData={author} authorId={author.id} settings={settings} siteUrl={siteUrl} />

      {/* Technical — raw JSON-LD + meta this record emits (same page, one record) */}
      <AuthorSeoTechnical
        nextjsMetadata={author.nextjsMetadata}
        jsonLdStructuredData={author.jsonLdStructuredData}
      />
    </div>
  );
}
