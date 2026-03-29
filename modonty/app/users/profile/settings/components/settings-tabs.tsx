"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  IconUser,
  IconShield,
  IconLock,
  IconBell,
  IconTheme,
  IconDelete,
  IconFilters,
} from "@/lib/icons";
import { cn } from "@/lib/utils";

export function SettingsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const section = searchParams.get("section") || "profile";

  const tabs = [
    { value: "profile", label: "الملف الشخصي", icon: IconUser },
    { value: "security", label: "الأمان", icon: IconShield },
    { value: "notifications", label: "الإشعارات", icon: IconBell },
    { value: "appearance", label: "المظهر", icon: IconTheme },
    { value: "preferences", label: "التفضيلات", icon: IconFilters },
    { value: "privacy", label: "الخصوصية", icon: IconLock },
    { value: "account", label: "الحذف", icon: IconDelete },
  ];

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", value);
    router.push(`/users/profile/settings?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1.5 p-1.5 bg-muted rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = section === tab.value;
          return (
            <Button
              key={tab.value}
              type="button"
              variant="ghost"
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "w-full flex flex-col items-center justify-center gap-0.5 md:flex-row md:justify-start md:gap-2 px-2 py-2 transition-colors min-h-[3.25rem] md:min-h-0",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                !isActive && "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-[11px] leading-none mt-0.5 max-sm:not-sr-only sr-only sm:not-sr-only md:sr-only">
                {tab.label}
              </span>
              <span className="hidden md:inline text-sm">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
