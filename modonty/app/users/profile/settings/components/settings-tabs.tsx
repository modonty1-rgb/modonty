"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Shield, Lock, Bell, Palette, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const section = searchParams.get("section") || "profile";

  const tabs = [
    {
      value: "profile",
      label: "الملف الشخصي",
      icon: User,
    },
    {
      value: "security",
      label: "الأمان",
      icon: Shield,
    },
    {
      value: "privacy",
      label: "الخصوصية",
      icon: Lock,
    },
    {
      value: "notifications",
      label: "الإشعارات",
      icon: Bell,
    },
    {
      value: "preferences",
      label: "التفضيلات",
      icon: Palette,
    },
    {
      value: "account",
      label: "الحساب",
      icon: Trash2,
    },
  ];

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", value);
    router.push(`/users/profile/settings?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-2 p-1 bg-muted rounded-md">
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
                "w-full gap-2 justify-start",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
