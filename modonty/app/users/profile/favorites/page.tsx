import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconSaved } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { getProfileFavorites } from "../helpers/profile-favorites";

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const favorites = await getProfileFavorites(session.user.id, 20);

  return (
    <>
      <h1 className="sr-only">المحفوظات</h1>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي", href: "/users/profile" },
          { label: "المحفوظات" },
        ]}
      />
      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">الملف الشخصي</CardTitle>
            <div className="pt-4">
              <ProfileTabs />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {favorites.length === 0 ? (
              <EmptyState
                icon={IconSaved}
                title="لا توجد مقالات محفوظة"
                description="لم تقم بحفظ أي مقالات بعد. ابدأ باستكشاف المقالات واحفظ ما تريد قراءته لاحقاً!"
                actionLabel="استكشف المقالات"
                actionHref="/"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    المقالات المحفوظة ({favorites.length})
                  </h3>
                </div>
                <div className="grid gap-4">
                  {favorites.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {article.featuredImage && (
                              <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                                <Image
                                  src={article.featuredImage.url}
                                  alt={article.featuredImage.altText || article.title}
                                  fill
                                  className="object-cover"
                                  sizes="96px"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg line-clamp-2 mb-2">
                                {article.title}
                              </h4>
                              {article.excerpt && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                <span>{article.client.name}</span>
                                {article.category && (
                                  <>
                                    <span>•</span>
                                    <span>{article.category.name}</span>
                                  </>
                                )}
                                {article.datePublished && (
                                  <>
                                    <span>•</span>
                                    <span>{dateFormatter.format(article.datePublished)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
