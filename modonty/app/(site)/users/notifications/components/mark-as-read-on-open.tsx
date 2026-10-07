"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markNotificationAsRead } from "../actions/mark-notification-as-read";

export function MarkAsReadOnOpen({ notificationId }: { notificationId: string | null }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (!notificationId || done.current) return;
    done.current = true;
    markNotificationAsRead(notificationId).then(() => router.refresh());
  }, [notificationId, router]);

  return null;
}
