import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { OptimizedImage, asMedia } from "@modonty/shared/components/optimized-image";
import { MEDIA_SPECS } from "@/lib/media/media-specs";
import { FeaturedTile } from "./article-upload";

interface ArticleBoxProps {
  article: {
    id: string;
    title: string;
    clientId: string;
    clientName: string;
    featured: { id: string; src: string | null } | null;
    galleryCount: number;
  };
}

/** The picked article: its featured image (upload / replace in place) and a way into the editor. */
export function ArticleBox({ article }: ArticleBoxProps) {
  const spec = MEDIA_SPECS.POST;
  const src = article.featured?.src ?? null;
  return (
    <section aria-label={`${article.title} featured image`} className="flex flex-wrap items-start gap-4 rounded-lg border bg-card p-4">
      <div className="w-full max-w-sm space-y-1.5">
        <FeaturedTile
          target={{ clientId: article.clientId, clientName: article.clientName, role: "POST", contextLabel: article.title, refId: article.id, replacesId: article.featured?.id }}
          filled={!!src}
        >
          {src ? <OptimizedImage media={asMedia(src)} alt={article.title} fill className="object-cover" sizes="384px" /> : null}
        </FeaturedTile>
        <p className="text-[10px] text-muted-foreground">Featured image · {spec.ratioLabel} · {spec.width}×{spec.height}</p>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <h2 className="text-sm font-semibold leading-snug">{article.title}</h2>
        <p className="text-xs text-muted-foreground">
          {article.clientName} · {src ? "featured image set" : "no featured image"} · {article.galleryCount} in its gallery
        </p>
        <Link
          href={`/articles/${article.id}/edit`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Open in editor <ExternalLink className="h-3 w-3" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
