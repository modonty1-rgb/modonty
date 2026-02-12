"use client";

import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Bookmark, Users, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
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
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
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
    <>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي" },
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
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name || ""} />
                <AvatarFallback className="text-2xl">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{session.user.name || "مستخدم"}</h2>
                <p className="text-muted-foreground">{session.user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-md">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{session.user.name || "غير محدد"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-md">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{session.user.email || "غير محدد"}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">إحصائياتك</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/users/profile/comments">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-500/10 p-3">
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">التعليقات</p>
                          {loadingStats ? (
                            <Skeleton className="h-6 w-12 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold">{stats.commentsCount}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/profile/liked">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/10 p-3">
                          <ThumbsUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الإعجابات</p>
                          {loadingStats ? (
                            <Skeleton className="h-6 w-12 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold">{stats.commentLikesCount}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/profile/favorites">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-500/10 p-3">
                          <ThumbsUp className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">إعجابات المقالات</p>
                          {loadingStats ? (
                            <Skeleton className="h-6 w-12 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold">{stats.articleLikesCount}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/profile/disliked">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-500/10 p-3">
                          <ThumbsDown className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">عدم الإعجاب</p>
                          {loadingStats ? (
                            <Skeleton className="h-6 w-12 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold">{stats.dislikesGiven}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/profile/favorites">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-yellow-500/10 p-3">
                          <Bookmark className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">المقالات المحفوظة</p>
                          {loadingStats ? (
                            <Skeleton className="h-6 w-12 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold">{stats.favoritesCount}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/users/profile/following">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-purple-500/10 p-3">
                          <Users className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">العملاء المتابعون</p>
                          {loadingStats ? (
                            <Skeleton className="h-6 w-12 mt-1" />
                          ) : (
                            <p className="text-2xl font-bold">{stats.followingCount}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
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
    </>
  );
}
