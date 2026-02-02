import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { generateMetadataFromSEO, generateStructuredData, generateAuthorStructuredData } from "@/lib/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "@/components/link";
import { User, Mail, Calendar } from "lucide-react";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  try {
    const { id } = await params;

    // Try to find user
    const user = await db.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        image: true,
      },
    });

    // If not found, try author
    if (!user) {
      const author = await db.author.findUnique({
        where: { slug: id },
        select: {
          name: true,
          firstName: true,
          lastName: true,
          bio: true,
          image: true,
          seoTitle: true,
          seoDescription: true,
          twitter: true,
        },
      });

      if (author) {
        return generateMetadataFromSEO({
          title: author.seoTitle || author.name,
          description: author.seoDescription || author.bio || `ملف شخصي لـ ${author.name}`,
          image: author.image || undefined,
          url: `/users/${id}`,
          type: "profile",
          firstName: author.firstName || undefined,
          lastName: author.lastName || undefined,
          twitterCreator: author.twitter ? author.twitter.replace(/^@/, "") : undefined,
        });
      }

      return {
        title: "مستخدم غير موجود - مودونتي",
      };
    }

    return generateMetadataFromSEO({
      title: user.name || "مستخدم",
      description: `ملف شخصي لـ ${user.name || user.email}`,
      image: user.image || undefined,
      url: `/users/${id}`,
      type: "profile",
    });
  } catch {
    return {
      title: "الملف الشخصي - مودونتي",
    };
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  try {
    // Try to find user
    let user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    let author = null;
    let articles: unknown[] = [];

    // If user not found, try author
    if (!user) {
      author = await db.author.findUnique({
        where: { slug: id },
        include: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              datePublished: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            orderBy: {
              datePublished: "desc",
            },
            take: 20,
          },
        },
      });

      if (!author) {
        notFound();
      }

      articles = author.articles;
    } else {
      // For regular users, check if they have linked author
      // Note: Author model doesn't have userId field, checking by email match
      author = await db.author.findFirst({
        where: { email: user.email || undefined },
        include: {
          articles: {
            where: {
              status: ArticleStatus.PUBLISHED,
            },
            select: {
              id: true,
              title: true,
              slug: true,
              excerpt: true,
              datePublished: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
            orderBy: {
              datePublished: "desc",
            },
            take: 20,
          },
        },
      });

      if (author) {
        articles = author.articles;
      }
    }

    const profileData = author || user;
    if (!profileData) {
      notFound();
    }

    const initials = (author?.name || user?.name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    // Use generateAuthorStructuredData if author exists, otherwise use generateStructuredData
    const structuredData = author
      ? generateAuthorStructuredData(author)
      : generateStructuredData({
          type: "Person",
          name: user?.name || "مستخدم",
          description: undefined,
          image: user?.image || undefined,
          url: `/users/${id}`,
        });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <Breadcrumb
          items={[
            { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
            { label: author?.name || user?.name || "مستخدم" },
          ]}
        />
        <div className="container mx-auto max-w-[1128px] px-4 py-8">
            <section aria-labelledby="profile-heading">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={author?.image || user?.image || undefined}
                        alt={author?.name || user?.name || "مستخدم"}
                      />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 id="profile-heading" className="text-2xl mb-2">
                        {author?.name || user?.name || "مستخدم"}
                      </h1>
                    {author?.jobTitle && (
                      <p className="text-sm text-muted-foreground">{author.jobTitle}</p>
                    )}
                    {author?.bio && (
                      <p className="text-muted-foreground mt-2">{author.bio}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {(user?.createdAt || author?.createdAt) && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        انضم في{" "}
                        {new Date(
                          (user?.createdAt || author?.createdAt) as Date
                        ).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  )}
                  {articles.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{articles.length} مقال</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </section>

            {articles.length > 0 && (
              <section aria-labelledby="articles-heading">
                <h2 id="articles-heading" className="text-2xl font-bold mb-6">المقالات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(articles as Array<{
                    id: string;
                    title: string;
                    slug: string;
                    excerpt: string | null;
                    datePublished: Date | null;
                    client: { id: string; name: string; slug: string };
                  }>).map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {article.excerpt}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <Link
                              href={`/clients/${article.client.slug}`}
                              className="hover:text-primary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {article.client.name}
                            </Link>
                            {article.datePublished && (
                              <span>
                                {new Date(article.datePublished).toLocaleDateString("ar-SA")}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    ))}
                </div>
              </section>
            )}
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
