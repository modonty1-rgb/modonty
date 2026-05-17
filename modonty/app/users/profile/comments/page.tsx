import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconComment, IconChevronLeft, IconChevronRight } from "@/lib/icons";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import Link from "@/components/link";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { CommentCard } from "../components/comment-card";
import { getProfileComments } from "../helpers/profile-comments";

interface CommentsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CommentsPage({ searchParams }: CommentsPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/users/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const { comments, pagination } = await getProfileComments(session.user.id, page, 10);

  const showPagination = pagination.totalPages > 1;
  const hasPrev = pagination.page > 1;
  const hasNext = pagination.page < pagination.totalPages;

  return (
    <>
      <h1 className="sr-only">تعليقاتي</h1>
      <Breadcrumb
        items={[
          { label: "الرئيسية", href: "/", icon: <BreadcrumbHome /> },
          { label: "الملف الشخصي", href: "/users/profile" },
          { label: "تعليقاتي" },
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
            {comments.length === 0 ? (
              <EmptyState
                icon={IconComment}
                title="لا توجد تعليقات"
                description="لم تكتب أي تعليقات بعد. ابدأ بقراءة المقالات وشارك برأيك!"
                actionLabel="استكشف المقالات"
                actionHref="/"
              />
            ) : (
              <div className="space-y-4" id="comments">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    تعليقاتي ({pagination.total})
                  </h3>
                </div>
                <div className="grid gap-4">
                  {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>

                {showPagination && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    {hasPrev ? (
                      <Link
                        href={`/users/profile/comments?page=${pagination.page - 1}#comments`}
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        <IconChevronRight className="h-4 w-4" />
                        السابق
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm opacity-50 cursor-not-allowed">
                        <IconChevronRight className="h-4 w-4" />
                        السابق
                      </span>
                    )}

                    <div className="text-sm text-muted-foreground">
                      صفحة {pagination.page} من {pagination.totalPages}
                    </div>

                    {hasNext ? (
                      <Link
                        href={`/users/profile/comments?page=${pagination.page + 1}#comments`}
                        className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        التالي
                        <IconChevronLeft className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-background text-sm opacity-50 cursor-not-allowed">
                        التالي
                        <IconChevronLeft className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
