"use client";

import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2 } from "lucide-react";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { ClientFollowButton } from "@/app/clients/[slug]/components/client-follow-button";

interface FollowedClient {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  articleCount: number;
  followedAt: string;
  industry: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export default function FollowingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState<FollowedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${session.user.id}/following?limit=20`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch following");
        }

        const data = await response.json();
        
        if (data.success) {
          setFollowing(data.data);
        } else {
          setError(data.error || "Failed to load following");
        }
      } catch (err) {
        setError("Failed to load following");
        console.error("Error fetching following:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchFollowing();
    }
  }, [session?.user?.id, status]);

  const handleUnfollow = (clientSlug: string) => {
    setFollowing((prev) => prev.filter((client) => client.slug !== clientSlug));
  };

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
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-16 w-16 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-10 w-24" />
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
          { label: "المتابعون" },
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
            ) : following.length === 0 ? (
              <EmptyState
                icon={Users}
                title="لا تتابع أحداً"
                description="تابع العملاء للحصول على توصيات محتوى مخصصة والبقاء على اطلاع بأحدث مقالاتهم."
                actionLabel="تصفح العملاء"
                actionHref="/clients"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    العملاء المتابعون ({following.length})
                  </h3>
                </div>
                <div className="grid gap-4">
                  {following.map((client) => (
                    <Card key={client.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Link href={`/clients/${client.slug}`} className="flex-shrink-0">
                            {client.logo ? (
                              <div className="relative w-16 h-16 rounded overflow-hidden bg-muted">
                                <img
                                  src={client.logo}
                                  alt={client.name}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link href={`/clients/${client.slug}`}>
                              <h4 className="font-semibold text-lg hover:text-primary transition-colors">
                                {client.name}
                              </h4>
                            </Link>
                            {client.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {client.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 flex-wrap">
                              {client.industry && (
                                <>
                                  <span>{client.industry.name}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{client.articleCount} مقال</span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <ClientFollowButton
                              clientSlug={client.slug}
                              initialIsFollowing={true}
                              initialFollowersCount={0}
                              variant="default"
                              size="sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
