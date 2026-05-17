import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconUser, IconEmail } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { ProfileTabs } from "./components/profile-tabs";
import { ActivityFeed } from "./components/activity-feed";
import { getProfileStats, getProfileBio } from "./helpers/profile-stats";
import { getProfileActivity } from "./helpers/profile-activity";

interface ProfilePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const user = session.user;
  const userId = user.id!;

  const { page: pageParam } = await searchParams;
  const activityPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const [stats, bio, activity] = await Promise.all([
    getProfileStats(userId),
    getProfileBio(userId),
    getProfileActivity(userId, activityPage, 10),
  ]);

  const statsEntries = [
    { href: "/users/profile/comments", label: "تعليق", value: stats.commentsCount },
    { href: "/users/profile/liked", label: "إعجاب", value: stats.commentLikesCount },
    { href: "/users/profile/favorites", label: "مقال محفوظ", value: stats.favoritesCount },
    { href: "/users/profile/favorites", label: "إعجاب بمقال", value: stats.articleLikesCount },
    { href: "/users/profile/following", label: "عميل متابَع", value: stats.followingCount },
  ];

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
                  <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                  <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="sr-only">الملف الشخصي</h1>
                <h2 className="text-xl font-semibold truncate">{user.name || "مستخدم"}</h2>
                <p className="text-muted-foreground truncate" title={user.email ?? undefined}>
                  {user.email}
                </p>
                {bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bio}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-md">
                <IconUser className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-medium">{user.name || "غير محدد"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-md">
                <IconEmail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-medium">{user.email || "غير محدد"}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-4">
              {statsEntries.map((stat, i, arr) => (
                <div key={stat.label} className="flex items-center gap-6">
                  <Link
                    href={stat.href}
                    className="flex flex-col items-center gap-0.5 hover:text-primary transition-colors group"
                  >
                    <span className="text-xl font-bold leading-none">{stat.value}</span>
                    <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      {stat.label}
                    </span>
                  </Link>
                  {i < arr.length - 1 && <span className="h-8 w-px bg-border" />}
                </div>
              ))}
            </div>

            <div id="activity">
              <ActivityFeed activities={activity.activities} pagination={activity.pagination} />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                انضم في{" "}
                {new Intl.DateTimeFormat("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(stats.joinedAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
