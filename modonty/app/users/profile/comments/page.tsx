"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "../components/empty-state";
import { ProfileTabs } from "../components/profile-tabs";
import { CommentCard } from "../components/comment-card";
import { Breadcrumb, BreadcrumbHome } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserComment {
  id: string;
  content: string;
  createdAt: Date;
  status: "PENDING" | "APPROVED" | "REJECTED";
  article: {
    id: string;
    title: string;
    slug: string;
    client: {
      name: string;
      slug: string;
    };
  };
  likesCount: number;
  dislikesCount: number;
  repliesCount: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CommentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/users/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/users/${session.user.id}/comments?page=${currentPage}&limit=10`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        
        if (data.success) {
          const parsedComments = data.data.map((comment: any) => ({
            ...comment,
            createdAt: new Date(comment.createdAt),
          }));
          setComments(parsedComments);
          setPagination(data.pagination);
        } else {
          setError(data.error || "Failed to load comments");
        }
      } catch (err) {
        setError("Failed to load comments");
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchComments();
    }
  }, [session?.user?.id, status, currentPage]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-[1128px] px-4 py-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
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
            {error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : comments.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="لا توجد تعليقات"
                description="لم تكتب أي تعليقات بعد. ابدأ بقراءة المقالات وشارك برأيك!"
                actionLabel="استكشف المقالات"
                actionHref="/"
              />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    تعليقاتي ({pagination?.total || comments.length})
                  </h3>
                </div>
                <div className="grid gap-4">
                  {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
                
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="h-4 w-4 ml-2" />
                      السابق
                    </Button>
                    
                    <div className="text-sm text-muted-foreground">
                      صفحة {pagination.page} من {pagination.totalPages}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      التالي
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    </Button>
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
