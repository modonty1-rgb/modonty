"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/providers/SessionContext";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconUsers, IconLoading, IconCheck } from "@/lib/icons";

interface ClientFollowButtonProps {
  clientSlug: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  /** Icon only below `md`, with the words kept for screen readers — for the phone's platform bar. */
  compact?: boolean;
}

export function ClientFollowButton({
  clientSlug,
  initialIsFollowing,
  initialFollowersCount,
  variant = "outline",
  size = "default",
  className = "",
  compact = false,
}: ClientFollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const registerHref = `/users/register?callbackUrl=${encodeURIComponent(pathname)}`;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);
  const isPending = useRef(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          const response = await fetch(`/clients/${encodeURIComponent(clientSlug)}/api/follow`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setIsFollowing(data.data.isFollowing);
              setFollowersCount(data.data.followersCount);
            }
          }
        } catch {
          // Silent fail - keep initial state
        }
      }
    };

    fetchFollowStatus();
  }, [clientSlug, session, status]);

  const handleFollow = async () => {
    if (!session?.user) {
      router.push(registerHref);
      return;
    }

    if (isPending.current) return;
    isPending.current = true;

    const previousFollowing = isFollowing;
    const previousCount = followersCount;

    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    setLoading(true);

    try {
      const response = await fetch(`/clients/${encodeURIComponent(clientSlug)}/api/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }

      const data = await response.json();
      
      if (data.success) {
        setIsFollowing(data.data.isFollowing);
        setFollowersCount(data.data.followersCount);
      } else {
        setIsFollowing(previousFollowing);
        setFollowersCount(previousCount);
      }
    } catch (error) {
      setIsFollowing(previousFollowing);
      setFollowersCount(previousCount);
    } finally {
      setLoading(false);
      isPending.current = false;
    }
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? "default" : variant}
      onClick={handleFollow}
      disabled={loading}
      aria-label={compact ? (isFollowing ? "إلغاء المتابعة" : "متابعة") : undefined}
      className={`gap-2 group transition-colors ${compact ? "max-md:size-9 max-md:px-0 max-md:[&_span]:hidden" : ""} ${
        isFollowing
          ? "bg-accent text-accent-foreground border-accent hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
          : ""
      } ${className}`}
    >
      {loading ? (
        <IconLoading className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <IconCheck className="h-4 w-4 group-hover:hidden" />
          <span className="group-hover:hidden">متابَع</span>
          <span className="hidden group-hover:inline">إلغاء المتابعة</span>
        </>
      ) : (
        <>
          <IconUsers className="h-4 w-4" />
          <span>متابعة</span>
        </>
      )}
    </Button>
  );
}
