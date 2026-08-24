"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  IconUser,
  IconSaved,
  IconUsers,
  IconComment,
  IconLike,
  IconCalendar,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

export function ProfileTabs() {
  const pathname = usePathname();

  const tabs = [
    {
      value: "overview",
      label: "نظرة عامة",
      href: "/users/profile",
      icon: IconUser,
    },
    {
      value: "comments",
      label: "تعليقاتي",
      href: "/users/profile/comments",
      icon: IconComment,
    },
    {
      value: "liked",
      label: "الإعجابات",
      href: "/users/profile/liked",
      icon: IconLike,
    },
    {
      value: "favorites",
      label: "المحفوظات",
      href: "/users/profile/favorites",
      icon: IconSaved,
    },
    {
      value: "bookings",
      label: "حجوزاتي",
      href: "/users/profile/bookings",
      icon: IconCalendar,
    },
    {
      value: "following",
      label: "المتابعون",
      href: "/users/profile/following",
      icon: IconUsers,
    },
  ];

  const activeTab = pathname === "/users/profile"
    ? "overview"
    : pathname.includes("/settings")
    ? "settings"
    : pathname.includes("/comments")
    ? "comments"
    : pathname.includes("/liked")
    ? "liked"
    : pathname.includes("/favorites")
    ? "favorites"
    : pathname.includes("/bookings")
    ? "bookings"
    : pathname.includes("/following")
    ? "following"
    : "overview";

  return (
    <div className="w-full">
      {/* الجوّال: رقائق سكرول أفقي ٤٤px — نفس نمط قائمة أقسام الشريك. غريد ٣×٢ كان يضغط
          الستّة في شاشتين من الأزرار الصغيرة (بند PROFILEMOB). الديسكتوب على غريده كما هو. */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <Link
              key={`m-${tab.value}`}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-[13px] font-bold transition-colors",
                isActive
                  ? "border-transparent bg-primary/[0.08] text-primary"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="w-full hidden lg:grid grid-cols-3 md:grid-cols-6 gap-2 p-1 bg-muted rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.href}
              className="flex-1"
            >
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "w-full gap-2 justify-center transition-colors",
                  isActive && "bg-secondary text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground",
                  !isActive &&
                    "text-muted-foreground hover:bg-background hover:text-foreground"
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
