"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import Link from "@/components/link";

interface ClientFollowersListProps {
  clientSlug: string;
}

interface Follower {
  id: string;
  userId: string | null;
  name: string;
  image: string | null;
  followedAt: string;
}

export function ClientFollowersList({ clientSlug }: ClientFollowersListProps) {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/followers`);

        if (!response.ok) {
          throw new Error("Failed to load followers");
        }

        const data = await response.json();

        if (data.success) {
          setFollowers(
            data.data.map((f: any) => ({
              ...f,
              followedAt: f.followedAt,
            }))
          );
        } else {
          setError(data.error || "تعذر تحميل المتابعين");
        }
      } catch {
        setError("تعذر تحميل المتابعين");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [clientSlug]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المتابعون
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المتابعون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (followers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المتابعون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            لا يوجد متابعون بعد. عند بدء متابعة هذا العميل، ستظهر الحسابات هنا.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            المتابعون
          </span>
          <span className="text-xs text-muted-foreground">
            {followers.length} من أحدث المتابعين
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {followers.map((follower) => (
          <div
            key={follower.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-muted/40 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {follower.image ? (
                  <AvatarImage src={follower.image} alt={follower.name} />
                ) : (
                  <AvatarFallback>
                    {follower.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[160px] md:max-w-xs">
                  {follower.name}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  متابع لهذا العميل
                </span>
              </div>
            </div>
            {follower.userId && (
              <Link
                href={`/users/profile/${follower.userId}`}
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                عرض الملف
              </Link>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

