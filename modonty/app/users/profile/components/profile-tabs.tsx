"use client";

import Link from "@/components/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Bookmark, Users, MessageCircle, ThumbsUp, ThumbsDown, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      value: "overview",
      label: "نظرة عامة",
      href: "/users/profile",
      icon: User,
    },
    {
      value: "comments",
      label: "تعليقاتي",
      href: "/users/profile/comments",
      icon: MessageCircle,
    },
    {
      value: "liked",
      label: "الإعجابات",
      href: "/users/profile/liked",
      icon: ThumbsUp,
    },
    {
      value: "disliked",
      label: "غير المعجبة",
      href: "/users/profile/disliked",
      icon: ThumbsDown,
    },
    {
      value: "favorites",
      label: "المحفوظات",
      href: "/users/profile/favorites",
      icon: Bookmark,
    },
    {
      value: "following",
      label: "المتابعون",
      href: "/users/profile/following",
      icon: Users,
    },
  ];

  const activeTab = pathname === "/users/profile" 
    ? "overview" 
    : pathname.includes("/settings")
    ? "settings"
    : pathname.includes("/comments") && !pathname.includes("/liked") && !pathname.includes("/disliked")
    ? "comments"
    : pathname.includes("/liked") && !pathname.includes("/disliked")
    ? "liked"
    : pathname.includes("/disliked")
    ? "disliked"
    : pathname.includes("/favorites") 
    ? "favorites" 
    : pathname.includes("/following")
    ? "following"
    : "overview";

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-2 p-1 bg-muted rounded-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <Link key={tab.value} href={tab.href} className="flex-1">
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "w-full gap-2 justify-center",
                  isActive && "bg-primary text-accent hover:bg-primary hover:text-primary-foreground",
                  !isActive && "text-foreground hover:bg-muted-foreground/10 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="inline">{tab.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
