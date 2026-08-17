"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function BellRevalidateTrigger({ justMarkedAsRead }: { justMarkedAsRead: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (justMarkedAsRead) {
      router.refresh();
    }
  }, [justMarkedAsRead, router]);

  return null;
}
