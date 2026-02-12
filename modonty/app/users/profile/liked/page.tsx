"use client";

import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart, Building2, FileText, MessageSquare } from "lucide-react";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { formatRelativeTime } from "@/lib/utils";
import Link from "@/components/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface LikedItem {
  id: string;
  type: "client" | "article" | "comment";
  likedAt: Date;
  item: {
    id: string;
    name?: string;
    title?: string;
    slug: string;
    description?: string;
    excerpt?: string;
    image?: string;
    imageAlt?: string;
    client?: {
      name: string;
      slug: string;
    };
  };
}

export default function LikedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<LikedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLikedItems = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        console.log('[Liked Page] Fetching liked items for user:', session.user.id);
        const response = await fetch(`/api/users/${session.user.id}/liked?limit=20`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Liked Page] API error:', response.status, errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('[Liked Page] Received:', { success: data.success, count: data.data?.length });
        
        if (data.success) {
          const parsedItems = data.data.map((item: any) => ({
            ...item,
            likedAt: new Date(item.likedAt),
          }));
          setItems(parsedItems);
          console.log('[Liked Page] Parsed items:', parsedItems.length);
        } else {
          setError(data.error || "Failed to load liked items");
        }
      } catch (err) {
        console.error("[Liked Page] Error fetching liked items:", err);
        setError("Failed to load liked items");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchLikedItems();
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
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
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
          { label: "الإعجابات" },
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
            ) : items.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="لا توجد إعجابات"
                description="لم تعجبك أي محتوى بعد. ابدأ بالإعجاب بالعملاء والمقالات والتعليقات!"
                actionLabel="استكشف المحتوى"
                actionHref="/"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    الإعجابات ({items.length})
                  </h3>
                </div>
                <div className="grid gap-4">
                  {items.map((item) => {
                    switch (item.type) {
                      case "client":
                        return <ClientLikeCard key={item.id} item={item} />;
                      case "article":
                        return <ArticleLikeCard key={item.id} item={item} />;
                      case "comment":
                        return <ClientLikeCard key={item.id} item={item} />;
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function TypeBadge({ type }: { type: "client" | "article" | "comment" }) {
  const config = {
    client: {
      icon: Building2,
      label: "عميل",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    article: {
      icon: FileText,
      label: "مقالة",
      color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    comment: {
      icon: MessageSquare,
      label: "تعليق",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
  };

  const { icon: Icon, label, color } = config[type];

  return (
    <Badge variant="secondary" className={`gap-1 ${color}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs">{label}</span>
    </Badge>
  );
}

function ClientLikeCard({ item }: { item: LikedItem }) {
  const clientUrl = `/clients/${item.item.slug}`;

  return (
    <Link href={clientUrl}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.item.image ? (
              <img
                src={item.item.image}
                alt={item.item.imageAlt || item.item.name}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarFallback className="text-xl">
                  {item.item.name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-lg">{item.item.name}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TypeBadge type={item.type} />
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                </div>
              </div>
              {item.item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.item.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                أعجبك {formatRelativeTime(item.likedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ArticleLikeCard({ item }: { item: LikedItem }) {
  const articleUrl = `/articles/${item.item.slug}`;

  return (
    <Link href={articleUrl}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.item.image ? (
              <img
                src={item.item.image}
                alt={item.item.imageAlt || item.item.title}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarFallback className="text-xl">
                  <FileText className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg line-clamp-1">{item.item.title}</h4>
                  {item.item.client && (
                    <p className="text-xs text-muted-foreground">
                      {item.item.client.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TypeBadge type={item.type} />
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                </div>
              </div>
              {item.item.excerpt && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.item.excerpt}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                أعجبك {formatRelativeTime(item.likedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
