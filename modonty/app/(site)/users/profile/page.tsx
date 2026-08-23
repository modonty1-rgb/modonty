import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { IconUser, IconEmail, IconSettings } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
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

  // بطاقات الجوّال الست (بند PROFILEMOB): الخمسة أعلاه + الحجوزات. الديسكتوب يبقى على صفّه
  // الخمسة كما هو — الجوّال إضافة لا تغيير.
  const mobileStats = [
    ...statsEntries,
    { href: "/users/profile/bookings", label: "حجز", value: stats.bookingsCount },
  ];
  const hasAnyActivityNumbers = mobileStats.some((s) => s.value > 0);
  const arabicCount = new Intl.NumberFormat("ar-SA");
  const joinedText = new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(stats.joinedAt);

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
              <div className="relative ms-6 max-lg:ms-0">
                <Avatar className="h-20 w-20 shrink-0 max-lg:h-16 max-lg:w-16">
                  <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                  <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="sr-only">الملف الشخصي</h1>
                {/* على الجوّال الاسم أولاً — ولو ناقص نرحّب بدل «مستخدم / غير محدد» (عقد PROFILEMOB). */}
                <h2 className="text-xl font-semibold truncate max-lg:hidden">{user.name || "مستخدم"}</h2>
                <h2 className="hidden text-lg font-bold truncate max-lg:block">{user.name || "أهلاً بك 👋"}</h2>
                <p className="text-muted-foreground truncate max-lg:text-xs" title={user.email ?? undefined}>
                  {user.email}
                </p>
                {user.name ? (
                  <p className="hidden text-xs text-muted-foreground mt-0.5 max-lg:block">انضم في {joinedText}</p>
                ) : (
                  <Link
                    href="/users/profile/settings"
                    className="hidden text-xs font-bold text-primary mt-0.5 max-lg:inline-block"
                  >
                    أكمل ملفك — أضف اسمك ›
                  </Link>
                )}
                {bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bio}</p>
                )}
              </div>
              {/* باب الإعدادات — على الجوّال فقط؛ الديسكتوب يوصلها من مكانها المعتاد. */}
              <Link
                href="/users/profile/settings"
                aria-label="الإعدادات"
                className="hidden size-11 shrink-0 place-items-center rounded-xl border border-border max-lg:grid"
              >
                <IconSettings className="size-5 text-muted-foreground" aria-hidden />
              </Link>
            </div>

            {/* صندوقا الاسم/البريد يكرّران الرأس — يختفيان على الجوّال فقط (عقد PROFILEMOB). */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-lg:hidden">
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

            {/* الجوّال: بطاقات ٣×٢ هدف كلٍّ منها ≥٦٤px بدل صفٍّ أهدافه ٣٨px — ولو الأرقام كلها
                صفر تحلّ محلّها دعوة تعطي القارئ الجديد أول خطوة بدل ستة أصفار. */}
            {hasAnyActivityNumbers ? (
              <div className="hidden grid-cols-3 gap-2 max-lg:grid">
                {mobileStats.map((stat) => (
                  <Link
                    key={`m-${stat.label}`}
                    href={stat.href}
                    className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card p-2"
                  >
                    <span className="text-lg font-bold leading-none">{arabicCount.format(stat.value)}</span>
                    <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="hidden rounded-2xl border border-dashed border-border p-5 text-center max-lg:block">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">رحلتك تبدأ بمقال واحد.</span>
                  <br />
                  كل ما تقرأ وتحفظ وتعلّق، صفحتك هذي تتعبّى — تعليقاتك، محفوظاتك، والعملاء اللي
                  تتابعهم، كلهم هنا.
                </p>
                <Link
                  href="/articles"
                  className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground"
                >
                  تصفّح المقالات
                </Link>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-t pt-4 max-lg:hidden">
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

            {/* على الجوّال تاريخ الانضمام صار في الرأس — هذا السطر للديسكتوب وحده. */}
            <div className="pt-4 border-t max-lg:hidden">
              <p className="text-sm text-muted-foreground mb-4">انضم في {joinedText}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
