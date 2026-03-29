"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/providers/SessionContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IconUsers, IconLoading, IconCheck } from "@/lib/icons";

interface ClientFollowButtonProps {
  clientSlug: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ClientFollowButton({
  clientSlug,
  initialIsFollowing,
  initialFollowersCount,
  variant = "outline",
  size = "default",
  className = "",
}: ClientFollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          const response = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/follow`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setIsFollowing(data.data.isFollowing);
              setFollowersCount(data.data.followersCount);
            }
          }
        } catch (error) {
          // Silent fail - keep initial state
        }
      }
    };

    fetchFollowStatus();
  }, [clientSlug, session, status]);

  const handleFollow = async () => {
    if (!session?.user) {
      router.push("/users/login");
      return;
    }

    const previousFollowing = isFollowing;
    const previousCount = followersCount;
    
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    setLoading(true);

    try {
      const response = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/follow`, {
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
    }
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? "default" : variant}
      onClick={handleFollow}
      disabled={loading}
      className={`gap-2 ${className}`}
    >
      {loading ? (
        <IconLoading className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <IconCheck className="h-4 w-4" />
      ) : (
        <IconUsers className="h-4 w-4" />
      )}
      {isFollowing ? "متابع" : "متابعة"}
    </Button>
  );
}
