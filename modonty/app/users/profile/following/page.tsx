import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers, IconClients } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { ClientFollowButton } from "@/app/clients/[slug]/components/client-follow-button";
import { getProfileFollowing } from "../helpers/profile-following";

export default async function FollowingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const following = await getProfileFollowing(session.user.id, 20);

  return (
    <>
      <h1 className="sr-only">المتابعون</h1>
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
            {following.length === 0 ? (
              <EmptyState
                icon={IconUsers}
                title="لا تتابع أحداً"
                description="تابع الشركاء للحصول على توصيات محتوى مخصصة والبقاء على اطلاع بأحدث مقالاتهم."
                actionLabel="تصفح الشركاء"
                actionHref="/clients"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    الشركاء المتابعون ({following.length})
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
                                <Image
                                  src={client.logo}
                                  alt={client.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                                <IconClients className="h-8 w-8 text-muted-foreground" />
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
