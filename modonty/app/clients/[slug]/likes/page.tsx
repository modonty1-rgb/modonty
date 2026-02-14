import { notFound } from "next/navigation";
import { getClientEngagementBySlug } from "../helpers/client-engagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, FileText } from "lucide-react";

interface ClientLikesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ClientLikesPage({ params }: ClientLikesPageProps) {
  const { slug } = await params;

  const data = await getClientEngagementBySlug(slug);

  if (!data) {
    notFound();
  }

  const { client, followersCount, favoritesCount, articleLikesCount } = data;

  const hasAny = followersCount > 0 || favoritesCount > 0 || articleLikesCount > 0;

  if (!hasAny) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            الإعجابات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا توجد تفاعلات إعجاب كافية بعد لعرضها. عند زيادة متابعي {client.name} وتفاعلهم مع المقالات، ستظهر الإحصاءات هنا.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-primary" />
            متابعو الصفحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">
            {followersCount.toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            عدد المستخدمين الذين تابعوا {client.name}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-4 w-4 text-red-500" />
            المفضّلة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">
            {favoritesCount.toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            عدد المستخدمين الذين أضافوا {client.name} إلى المفضّلة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            إعجابات المقالات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">
            {articleLikesCount.toLocaleString("ar-SA")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            إجمالي الإعجابات على مقالات هذا العميل
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
