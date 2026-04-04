import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  Image as ImageIcon,
  FileText,
  Pen,
  Building2,
  Folder,
  Tag,
  Factory,
  Mail,
  BarChart3,
  BookOpen,
  ChevronLeft,
  Code2,
} from "lucide-react";

const guidelineSections = [
  {
    id: "media",
    title: "Media & Image Standards",
    description: "مقاسات الصور المعتمدة، الصيغ المطلوبة، وأفضل الممارسات للتصميم والمحتوى المرئي",
    icon: ImageIcon,
    href: "/guidelines/media",
    color: "text-blue-500",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/[0.03]",
  },
  {
    id: "articles",
    title: "Articles",
    description: "دليل إنشاء المقالات — الخطوات، حقول المحتوى، SEO، والنشر",
    icon: FileText,
    href: "/guidelines/articles",
    color: "text-emerald-500",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/[0.03]",
  },
  {
    id: "authors",
    title: "Authors",
    description: "إعداد ملف الكاتب، المصداقية، والربط مع المقالات",
    icon: Pen,
    href: "/guidelines/authors",
    color: "text-violet-500",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/[0.03]",
  },
  {
    id: "clients",
    title: "Clients",
    description: "إعداد بيانات العملاء، الشعار، المعلومات التجارية، والربط مع المقالات",
    icon: Building2,
    href: "/guidelines/clients",
    color: "text-orange-500",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/[0.03]",
  },
  {
    id: "categories",
    title: "Categories",
    description: "تنظيم المحتوى بالفئات، التسلسل الهرمي، وأفضل ممارسات التصنيف",
    icon: Folder,
    href: "/guidelines/categories",
    color: "text-indigo-500",
    borderColor: "border-indigo-500/20",
    bgColor: "bg-indigo-500/[0.03]",
  },
  {
    id: "tags",
    title: "Tags",
    description: "استخدام الوسوم لربط المحتوى المتشابه وتحسين التصفح",
    icon: Tag,
    href: "/guidelines/tags",
    color: "text-pink-500",
    borderColor: "border-pink-500/20",
    bgColor: "bg-pink-500/[0.03]",
  },
  {
    id: "industries",
    title: "Industries",
    description: "تصنيف العملاء حسب القطاع الصناعي والمجال التجاري",
    icon: Factory,
    href: "/guidelines/industries",
    color: "text-cyan-500",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/[0.03]",
  },
  {
    id: "subscribers",
    title: "Subscribers",
    description: "إدارة المشتركين، قوائم البريد، وسياسة الخصوصية",
    icon: Mail,
    href: "/guidelines/subscribers",
    color: "text-teal-500",
    borderColor: "border-teal-500/20",
    bgColor: "bg-teal-500/[0.03]",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "متابعة الأداء، المقاييس المهمة، وتقارير الزوار",
    icon: BarChart3,
    href: "/guidelines/analytics",
    color: "text-amber-500",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/[0.03]",
  },
  {
    id: "gtm",
    title: "Google Tag Manager",
    description: "إعداد تتبع الزوار، ربط التحليلات، وقياس الأداء",
    icon: Code2,
    href: "/guidelines/gtm",
    color: "text-red-500",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/[0.03]",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Guidelines</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          دليل شامل لفريق العمل — المقاسات المعتمدة، طريقة الاستخدام، وأفضل الممارسات لكل قسم
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guidelineSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className={`h-full transition-all hover:shadow-md cursor-pointer ${section.borderColor} ${section.bgColor}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${section.bgColor} border ${section.borderColor}`}>
                      <Icon className={`h-5 w-5 ${section.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">{section.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-1 rtl:rotate-0 ltr:rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
