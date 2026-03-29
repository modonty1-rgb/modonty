"use client";

import Link from "@/components/link";
import { formatRelativeTime } from "@/lib/utils";
import { IconComment, IconLike, IconSaved, IconUsers } from "@/lib/icons";

interface ActivityItemProps {
  type: "comment" | "like_comment" | "favorite_article" | "follow_client";
  content: string;
  link?: string;
  timestamp: Date;
}

export function ActivityItem({ type, content, link, timestamp }: ActivityItemProps) {
  const icons = {
    comment: <IconComment className="h-5 w-5 text-blue-500" />,
    like_comment: <IconLike className="h-5 w-5 text-green-500" />,
    favorite_article: <IconSaved className="h-5 w-5 text-yellow-500" />,
    follow_client: <IconUsers className="h-5 w-5 text-purple-500" />,
  };

  const icon = icons[type];

  const itemContent = (
    <div className="flex gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{content}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeTime(timestamp)}
        </p>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{itemContent}</Link>;
  }

  return itemContent;
}
