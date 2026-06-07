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
import { getProfileDisliked, type DislikedItem, type DislikedItemType } from "../helpers/profile-disliked";

export default async function DislikedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const items = await getProfileDisliked(session.user.id, 20);

  return (
    <>
      <h1 className="sr-only">غير المعجبة</h1>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي", href: "/users/profile" },
          { label: "غير المعجبة" },
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
                iconWrapperClassName="hidden"
                title="لا توجد عناصر غير معجبة"
                description="لم تعبر عن عدم إعجابك بأي محتوى بعد. ابدأ بالتفاعل مع الشركاء والمقالات والتعليقات!"
                actionLabel="استكشف المحتوى"
                actionHref="/"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    غير المعجبة ({items.length})
                  </h3>
                </div>
                <div className="grid gap-4">
                  {items.map((item) => {
                    if (item.type === "article") return <ArticleDislikeCard key={item.id} item={item} />;
                    if (item.type === "comment") return <CommentDislikeCard key={item.id} item={item} />;
                    return <ClientDislikeCard key={item.id} item={item} />;
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

function TypeBadge({ type }: { type: DislikedItemType }) {
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

function ClientDislikeCard({ item }: { item: DislikedItem }) {
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
                </div>
              </div>
              {item.item.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.item.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                لم يعجبك {formatRelativeTime(item.dislikedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ArticleDislikeCard({ item }: { item: DislikedItem }) {
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
                </div>
              </div>
              {item.item.excerpt && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.item.excerpt}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                لم يعجبك {formatRelativeTime(item.dislikedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CommentDislikeCard({ item }: { item: DislikedItem }) {
  const articleUrl = `/articles/${item.item.article?.slug}#comment-${item.item.id}`;

  return (
    <Link href={articleUrl}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.item.author?.image ? (
              <Image
                src={item.item.author.image}
                alt={item.item.author.name || "User"}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                sizes="40px"
              />
            ) : (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="font-semibold bg-primary text-primary-foreground">
                  {item.item.author?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {item.item.author?.name || "مستخدم"}
                  </p>
                  {item.item.article && (
                    <p className="text-xs text-muted-foreground">
                      على: {item.item.article.title}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TypeBadge type={item.type} />
                </div>
              </div>
              {item.item.content && (
                <p className="text-sm text-foreground mt-2 line-clamp-3">
                  {item.item.content}
                </p>
              )}
              {item.item.article?.client && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.item.article.client.name}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                لم يعجبك {formatRelativeTime(item.dislikedAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
