"use client";

import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { IconUser, IconEmail } from "@/lib/icons";
import { ProfileTabs } from "./components/profile-tabs";
import { ActivityFeed } from "./components/activity-feed";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    commentsCount: 0,
    articleLikesCount: 0,
    commentLikesCount: 0,
    dislikesGiven: 0,
    favoritesCount: 0,
    followingCount: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;

      try {
        setLoadingStats(true);
        const statsRes = await fetch(`/api/users/${session.user.id}/stats`);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          
          if (statsData.success) {
            setStats({
              commentsCount: statsData.data.commentsCount || 0,
              articleLikesCount: statsData.data.articleLikesCount || 0,
              commentLikesCount: statsData.data.commentLikesCount || 0,
              dislikesGiven: statsData.data.dislikesGiven || 0,
              favoritesCount: statsData.data.favoritesCount || 0,
              followingCount: statsData.data.followingCount || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (status === "authenticated") {
      fetchStats();
    }
  }, [session?.user?.id, status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-8">
          <Card>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative ms-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-md" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
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
    <div>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي" },
        ]}
      />
      <div className="container mx-auto max-w-[1128px] px-4 py-8">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <ProfileTabs />
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative ms-6">
                <Avatar className="h-20 w-20 shrink-0">
                  <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
                  <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="sr-only">الملف الشخصي</h1>
                <h2 className="text-xl font-semibold truncate">{session.user.name || "مستخدم"}</h2>
                <p className="text-muted-foreground truncate" title={session.user.email ?? undefined}>{session.user.email}</p>
                {(session.user as { bio?: string }).bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{(session.user as { bio?: string }).bio}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-md">
                <IconUser className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{session.user.name || "غير محدد"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-md">
                <IconEmail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{session.user.email || "غير محدد"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-4">
              {[
                { href: "/users/profile/comments", label: "تعليق", value: stats.commentsCount },
                { href: "/users/profile/liked", label: "إعجاب", value: stats.commentLikesCount },
                { href: "/users/profile/favorites", label: "مقال محفوظ", value: stats.favoritesCount },
                { href: "/users/profile/favorites", label: "إعجاب بمقال", value: stats.articleLikesCount },
                { href: "/users/profile/following", label: "عميل متابَع", value: stats.followingCount },
              ].map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <Link
                    href={stat.href}
                    className="flex flex-col items-center gap-0.5 hover:text-primary transition-colors group"
                  >
                    {loadingStats ? (
                      <Skeleton className="h-7 w-8" />
                    ) : (
                      <span className="text-xl font-bold leading-none">{stat.value}</span>
                    )}
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      {stat.label}
                    </span>
                  </Link>
                  {i < arr.length - 1 && <span className="h-8 w-px bg-border" />}
                </div>
              ))}
            </div>

            {session.user.id && <ActivityFeed userId={session.user.id} />}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                انضم في {new Date((session.user as any).createdAt || Date.now()).toLocaleDateString("ar-SA")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
