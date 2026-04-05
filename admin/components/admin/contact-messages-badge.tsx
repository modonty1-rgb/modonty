"use client";

import { useEffect, useState } from "react";
import { getNewContactMessagesCount } from "@/app/(dashboard)/contact-messages/actions/contact-messages-actions";

export function ContactMessagesBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCount() {
      const newCount = await getNewContactMessagesCount();
      setCount(newCount);
    }
    fetchCount();

    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === null || count === 0) {
    return null;
  }

  return (
    <span className="absolute -top-0.5 -end-0.5 flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
