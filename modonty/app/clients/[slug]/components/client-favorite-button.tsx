"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/components/providers/SessionContext";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Bookmark, Loader2, BookmarkCheck } from "lucide-react";

interface Props {
  clientSlug: string;
  initialIsFavorited?: boolean;
  initialCount?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ClientFavoriteButton({
  clientSlug,
  initialIsFavorited = false,
  initialCount = 0,
  variant = "outline",
  size = "default",
  className = "",
}: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const registerHref = `/users/register?callbackUrl=${encodeURIComponent(pathname)}`;
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const isPending = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;
    fetch(`/api/clients/${encodeURIComponent(clientSlug)}/favorite`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) {
          setIsFavorited(d.data.isFavorited);
          setCount(d.data.count);
        }
      })
      .catch(() => {});
  }, [clientSlug, session, status]);

  const handleToggle = async () => {
    if (!session?.user) {
      router.push(registerHref);
      return;
    }
    if (isPending.current) return;
    isPending.current = true;

    const prevFav = isFavorited;
    setIsFavorited(!isFavorited);
    setLoading(true);

    try {
      const res = await fetch(`/api/clients/${encodeURIComponent(clientSlug)}/favorite`, {
        method: isFavorited ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data?.success) {
        setIsFavorited(data.data.isFavorited);
        setCount(data.data.count);
      } else {
        setIsFavorited(prevFav);
      }
    } catch {
      setIsFavorited(prevFav);
    } finally {
      setLoading(false);
      isPending.current = false;
    }
  };

  return (
    <Button
      size={size}
      variant={isFavorited ? "default" : variant}
      onClick={handleToggle}
      disabled={loading}
      className={`gap-2 ${
        isFavorited
          ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 hover:border-amber-600"
          : ""
      } ${className}`}
      title={isFavorited ? "إزالة من المفضلة" : "حفظ في المفضلة"}
      aria-label={isFavorited ? "إزالة من المفضلة" : "حفظ في المفضلة"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFavorited ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          <span>مُضافة</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span>مفضّلة</span>
        </>
      )}
    </Button>
  );
}
