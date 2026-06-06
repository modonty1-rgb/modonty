import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCalendar, IconClients } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { getProfileBookings } from "../helpers/profile-bookings";

const dateFormatter = new Intl.DateTimeFormat("ar-SA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Visitor-friendly status labels (warmer than the internal new/contacted/done/archived).
const STATUS_META: Record<string, { label: string; classes: string }> = {
  new: { label: "بانتظار التواصل", classes: "bg-primary/10 text-primary ring-primary/30" },
  contacted: { label: "تم التواصل معك", classes: "bg-amber-500/10 text-amber-600 ring-amber-500/30" },
  done: { label: "مكتمل", classes: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30" },
  archived: { label: "مؤرشف", classes: "bg-muted text-muted-foreground ring-border" },
};

export default async function ProfileBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const bookings = await getProfileBookings(session.user.id, 20);

  return (
    <>
      <h1 className="sr-only">حجوزاتي</h1>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي", href: "/users/profile" },
          { label: "حجوزاتي" },
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
            {bookings.length === 0 ? (
              <EmptyState
                icon={IconCalendar}
                title="ما عندك حجوزات بعد"
                description="لما تطلب حجزاً من أي شركة على مدوّنتي، تلاقيه هنا مع حالته."
                actionLabel="استكشف الشركات"
                actionHref="/clients"
              />
            ) : (
              <div className="space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">طلبات الحجز ({bookings.length})</h3>
                </div>
                <div className="grid gap-4">
                  {bookings.map((booking) => {
                    const status = STATUS_META[booking.status] ?? STATUS_META.new;
                    return (
                      <Card key={booking.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border">
                              {booking.client.logo ? (
                                <Image
                                  src={booking.client.logo}
                                  alt={booking.client.name}
                                  fill
                                  className="object-contain p-1"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="grid h-full place-items-center">
                                  <IconClients className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <Link
                                  href={`/clients/${booking.client.slug}`}
                                  className="font-semibold text-foreground transition-colors hover:text-primary"
                                >
                                  {booking.client.name}
                                </Link>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${status.classes}`}
                                >
                                  {status.label}
                                </span>
                              </div>

                              {booking.article?.title && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  من مقال:{" "}
                                  <Link
                                    href={`/articles/${booking.article.slug}`}
                                    className="hover:text-primary hover:underline"
                                  >
                                    {booking.article.title}
                                  </Link>
                                </p>
                              )}

                              {booking.message && (
                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                  {booking.message}
                                </p>
                              )}

                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                <span>أُرسل في {dateFormatter.format(booking.createdAt)}</span>
                                {booking.preferredAt && (
                                  <>
                                    <span>•</span>
                                    <span>الموعد المفضّل: {dateFormatter.format(booking.preferredAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
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
