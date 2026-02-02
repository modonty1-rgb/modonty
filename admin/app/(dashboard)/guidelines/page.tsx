import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Image as ImageIcon,
  FileText,
  User,
  Building2,
  FolderTree,
  Tag,
  Briefcase,
  Mail,
  BarChart3,
  BookOpen,
  ArrowRight,
  Code2,
} from "lucide-react";

const guidelineSections = [
  {
    id: "media",
    title: "Media Guidelines",
    description: "Image optimization, formats, dimensions, and SEO best practices for logos, OG images, featured images, and profile photos",
    icon: ImageIcon,
    href: "/guidelines/media",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/10",
    borderColor: "border-blue-200",
  },
  {
    id: "articles",
    title: "Article Guidelines",
    description: "Content creation, SEO optimization, structured data, and best practices for blog posts and articles",
    icon: FileText,
    href: "/guidelines/articles",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/10",
    borderColor: "border-green-200",
  },
  {
    id: "authors",
    title: "Author Guidelines",
    description: "E-E-A-T requirements, profile optimization, credentials, and author page SEO best practices",
    icon: User,
    href: "/guidelines/authors",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/10",
    borderColor: "border-purple-200",
  },
  {
    id: "clients",
    title: "Client Guidelines",
    description: "Organization setup, branding, logo requirements, GTM integration, and Schema.org Organization optimization",
    icon: Building2,
    href: "/guidelines/clients",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/10",
    borderColor: "border-orange-200",
  },
  {
    id: "categories",
    title: "Category Guidelines",
    description: "Category creation, hierarchy, SEO optimization, and organization best practices",
    icon: FolderTree,
    href: "/guidelines/categories",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/10",
    borderColor: "border-indigo-200",
  },
  {
    id: "tags",
    title: "Tag Guidelines",
    description: "Tag creation, usage strategies, SEO best practices, and content organization",
    icon: Tag,
    href: "/guidelines/tags",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/10",
    borderColor: "border-pink-200",
  },
  {
    id: "industries",
    title: "Industry Guidelines",
    description: "Industry classification, SEO requirements, and industry-specific optimization",
    icon: Briefcase,
    href: "/guidelines/industries",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/10",
    borderColor: "border-cyan-200",
  },
  {
    id: "subscribers",
    title: "Subscriber Guidelines",
    description: "Subscriber management, GDPR compliance, email marketing best practices, and consent handling",
    icon: Mail,
    href: "/guidelines/subscribers",
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950/10",
    borderColor: "border-teal-200",
  },
  {
    id: "analytics",
    title: "Analytics Guidelines",
    description: "Performance tracking, Core Web Vitals optimization, engagement metrics, and monitoring best practices",
    icon: BarChart3,
    href: "/guidelines/analytics",
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/10",
    borderColor: "border-amber-200",
  },
  {
    id: "gtm",
    title: "GTM Guidelines",
    description: "Google Tag Manager setup, client tracking configuration, GA4 integration, and multi-client analytics",
    icon: Code2,
    href: "/guidelines/gtm",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/10",
    borderColor: "border-red-200",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto max-w-[1128px] space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Guidelines & Best Practices</h1>
        <p className="text-muted-foreground">
          Comprehensive guides for SEO, Marketing, and Design teams. Select a section to view detailed guidelines.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guidelineSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.id} href={section.href}>
              <Card className={`h-full transition-all hover:shadow-lg cursor-pointer ${section.bgColor} ${section.borderColor} border-2`}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${section.bgColor} border ${section.borderColor}`}>
                        <Icon className={`h-6 w-6 ${section.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{section.title}</h3>
                        <p className="text-sm text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                      <span>View Guidelines</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">About These Guidelines</h3>
              <p className="text-sm text-muted-foreground">
                These guidelines are based on the latest SEO best practices (2024-2025), Schema.org structured data requirements,
                and industry standards. They are designed to help SEO, Marketing, and Design teams optimize content for maximum
                visibility, engagement, and ROI. Each section includes specific requirements, best practices, and actionable checklists.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
