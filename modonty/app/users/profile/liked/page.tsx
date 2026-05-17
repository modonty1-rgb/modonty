import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconLike, IconClients, IconArticle, IconMessage } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { formatRelativeTime } from "@/lib/utils";
import Link from "@/components/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { getProfileLiked, type LikedItem, type LikedItemType } from "../helpers/profile-liked";

export default async function LikedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const items = await getProfileLiked(session.user.id, 20);

  return (
    <>
      <h1 className="sr-only">الإعجابات</h1>
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
            {items.length === 0 ? (
              <EmptyState
                icon={IconLike}
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
                    if (item.type === "article") {
                      return <ArticleLikeCard key={item.id} item={item} />;
                    }
                    return <ClientLikeCard key={item.id} item={item} />;
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

function TypeBadge({ type }: { type: LikedItemType }) {
  const config = {
    client: { icon: IconClients, label: "عميل" },
    article: { icon: IconArticle, label: "مقالة" },
    comment: { icon: IconMessage, label: "تعليق" },
  } as const;

  const { icon: Icon, label } = config[type];

  return (
    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
      <Icon className="h-3 w-3" />
      <span className="text-xs">{label}</span>
    </Badge>
  );
}

function ClientLikeCard({ item }: { item: LikedItem }) {
  return (
    <Link href={`/clients/${item.item.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.item.image ? (
              <Image
                src={item.item.image}
                alt={item.item.imageAlt || item.item.name || ""}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                sizes="64px"
              />
            ) : (
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                  {item.item.name?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-lg">{item.item.name}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TypeBadge type={item.type} />
                  <IconLike className="h-5 w-5 text-destructive fill-destructive" />
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
  return (
    <Link href={`/articles/${item.item.slug}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.item.image ? (
              <Image
                src={item.item.image}
                alt={item.item.imageAlt || item.item.title || ""}
                width={64}
                height={64}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                sizes="64px"
              />
            ) : (
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                  <IconArticle className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-lg line-clamp-1">{item.item.title}</h4>
                  {item.item.client && (
                    <p className="text-xs text-muted-foreground">{item.item.client.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TypeBadge type={item.type} />
                  <IconLike className="h-5 w-5 text-destructive fill-destructive" />
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
