"use client";

import { useEffect, useState } from "react";
import { getNewContactMessagesCount } from "@/app/(dashboard)/contact-messages/actions/contact-messages-actions";
import { Badge } from "@/components/ui/badge";

export function ContactMessagesBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const newCount = await getNewContactMessagesCount();
      setCount(newCount);
    }
    fetchCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === null || count === 0) {
    return null;
  }

  return (
    <Badge
      variant="destructive"
      className="ml-1 h-5 min-w-5 flex items-center justify-center px-1.5 text-xs"
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
