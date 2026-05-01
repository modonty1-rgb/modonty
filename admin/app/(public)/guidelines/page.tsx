import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Image as ImageIcon,
  FileText,
  Pen,
  Building2,
  Folder,
  BookOpen,
  ChevronLeft,
  XCircle,
  Search,
} from "lucide-react";



// ─── All sections grid ────────────────────────────────────────────────────────
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
    id: "prohibitions",
    title: "الممنوعات — Modonty Prohibitions",
    description: "المرجع الموحّد لكل ممنوعات الفريق — SEO · Brand · Video — في صفحة واحدة (60+ مخالفة)",
    icon: XCircle,
    href: "/guidelines/prohibitions",
    color: "text-red-500",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/[0.03]",
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
    id: "organization",
    title: "Content Organization",
    description: "الفئات والوسوم والقطاعات — كيف ينظّم النظام المحتوى والعملاء",
    icon: Folder,
    href: "/guidelines/organization",
    color: "text-indigo-500",
    borderColor: "border-indigo-500/20",
    bgColor: "bg-indigo-500/[0.03]",
  },
  {
    id: "seo-visual",
    title: "معاينة البحث والمشاركة",
    description: "كيف يظهر موقعك في نتائج جوجل وعند المشاركة على WhatsApp / X / LinkedIn — SERP · Rich Result · OG Image",
    icon: Search,
    href: "/guidelines/seo-visual",
    color: "text-sky-500",
    borderColor: "border-sky-500/20",
    bgColor: "bg-sky-500/[0.03]",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Guidelines</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          دليل شامل لفريق العمل — المقاسات المعتمدة، طريقة الاستخدام، وأفضل الممارسات لكل قسم
        </p>
      </div>

      {/* ── Visual SEO Course — teaser card ─────────────────────────────────── */}
      <Link href="/guidelines/seo-visual">
        <Card className="border-sky-500/30 bg-sky-500/[0.02] hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 shrink-0">
                  <Search className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">معاينة البحث والمشاركة — كيف يظهر موقعك في جوجل والمنصات؟</span>
                    <Badge variant="outline" className="border-sky-500/30 text-sky-400 text-[10px]">للجميع</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    تصور بصري كامل: نتيجة جوجل · البطاقة المُحسَّنة · قبل وبعد · معاينة WhatsApp / LinkedIn / X — كل عنصر ومصدره في الأدمن
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    {["SERP", "Rich Result", "OG Image", "Social Share"].map((tag) => (
                      <span key={tag} className="text-[10px] border border-sky-500/25 text-sky-400 rounded px-2 py-0.5">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </CardContent>
        </Card>
      </Link>


      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">جميع الأقسام</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* ── All Sections Grid ─────────────────────────────────────────────────── */}
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
