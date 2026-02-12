"use client";

import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";

interface FavoritedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  datePublished: Date | null;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  client: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  author: {
    id: string;
    name: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  favoritedAt: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoritedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${session.user.id}/favorites?limit=20`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await response.json();
        
        if (data.success) {
          setFavorites(data.data);
        } else {
          setError(data.error || "Failed to load favorites");
        }
      } catch (err) {
        setError("Failed to load favorites");
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchFavorites();
    }
  }, [session?.user?.id, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-24 w-24 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  return (
    <>
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
            {error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : favorites.length === 0 ? (
              <EmptyState
                icon={Bookmark}
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
                                <img
                                  src={article.featuredImage.url}
                                  alt={article.featuredImage.altText || article.title}
                                  className="object-cover w-full h-full"
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
                                    <span>
                                      {new Date(article.datePublished).toLocaleDateString("ar-SA")}
                                    </span>
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
