"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Eye,
  Image as ImageIcon,
  FileText,
  Pen,
  Building2,
  Folder,
  BarChart3,
  BookOpen,
  Sparkles,
  Lock,
  Megaphone,
  Award,
  Users,
} from "lucide-react";

type IconComponent = React.ComponentType<{ className?: string }>;

interface SidebarItem {
  icon: IconComponent;
  label: string;
  href: string;
  isAnchor?: boolean;
  isComingSoon?: boolean;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

const groups: SidebarGroup[] = [
  {
    title: "الأدلة العملية",
    items: [
      { icon: Eye, label: "معاينة البحث والمشاركة", href: "/guidelines/seo-visual" },
      { icon: ImageIcon, label: "دليل الوسائط", href: "/guidelines/media" },
      { icon: FileText, label: "المقالات", href: "/guidelines/articles" },
      { icon: Pen, label: "الكتّاب", href: "/guidelines/authors" },
      { icon: Building2, label: "العملاء", href: "/guidelines/clients" },
      { icon: Folder, label: "تنظيم المحتوى", href: "/guidelines/organization" },
    ],
  },
  {
    title: "قريباً",
    items: [
      { icon: BookOpen, label: "عن Modonty", href: "#", isComingSoon: true },
      { icon: Sparkles, label: "البراند", href: "#", isComingSoon: true },
      { icon: Users, label: "العملاء المثاليون", href: "#", isComingSoon: true },
      { icon: Megaphone, label: "دليل المبيعات", href: "#", isComingSoon: true },
      { icon: BarChart3, label: "استراتيجية التسويق", href: "#", isComingSoon: true },
      { icon: Sparkles, label: "تأهيل الفريق", href: "#", isComingSoon: true },
      { icon: Award, label: "القواعد الذهبية", href: "#", isComingSoon: true },
    ],
  },
];

export function HubSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-[260px] shrink-0 h-[calc(100vh-49px)] sticky top-[49px] overflow-y-auto border-e bg-card/40 backdrop-blur-sm">
      <nav className="p-4 space-y-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2 px-2">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  !item.isAnchor &&
                  !item.isComingSoon &&
                  (pathname === item.href ||
                    pathname?.startsWith(item.href + "/"));

                if (item.isComingSoon) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-muted-foreground/60 cursor-not-allowed"
                      title="قريباً"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate flex-1">{item.label}</span>
                      <Lock className="h-3 w-3 shrink-0 opacity-50" />
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
