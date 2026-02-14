import Link from "@/components/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitleWithIcon } from "@/components/ui/card-title-with-icon";
import { Heart, Users, FileText, Bookmark } from "lucide-react";

interface ClientLikesPreviewProps {
  followersCount: number;
  favoritesCount: number;
  articleLikesCount: number;
  clientSlug: string;
  clientName: string;
  showEmptyState?: boolean;
}

export function ClientLikesPreview({
  followersCount,
  favoritesCount,
  articleLikesCount,
  clientSlug,
  clientName,
  showEmptyState = false,
}: ClientLikesPreviewProps) {
  const hasAny = followersCount > 0 || favoritesCount > 0 || articleLikesCount > 0;

  if (!hasAny && !showEmptyState) return null;

  if (!hasAny) {
    return (
      <Card>
        <CardHeader>
          <CardTitleWithIcon title="الإعجابات" icon={Heart} />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد تفاعلات إعجاب كافية بعد لعرضها. عند زيادة متابعي {clientName} وتفاعلهم مع المقالات، ستظهر الإحصاءات هنا.
          </p>
          <Link
            href={`/clients/${encodeURIComponent(clientSlug)}/likes`}
            className="inline-block mt-3 text-sm text-primary hover:underline"
          >
            عرض الإعجابات
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitleWithIcon title="الإعجابات" icon={Heart} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              متابعو الصفحة
            </span>
            <span className="text-sm font-semibold">{followersCount.toLocaleString("ar-SA")}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bookmark className="h-4 w-4" />
              المفضّلة
            </span>
            <span className="text-sm font-semibold">{favoritesCount.toLocaleString("ar-SA")}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              إعجابات المقالات
            </span>
            <span className="text-sm font-semibold">{articleLikesCount.toLocaleString("ar-SA")}</span>
          </div>
        </div>
        <Link
          href={`/clients/${encodeURIComponent(clientSlug)}/likes`}
          className="inline-block mt-4 text-sm text-primary hover:underline"
        >
          عرض تفاصيل الإعجابات
        </Link>
      </CardContent>
    </Card>
  );
}
