import { Card, CardContent } from "@/components/ui/card";
import { Tag, BarChart3, Heart, MessageCircle, TrendingUp } from "lucide-react";
import Link from "@/components/link";
import { getCategoriesWithCounts } from "@/app/api/helpers/category-queries";
import { getCategoryAnalytics } from "@/app/api/helpers/category-queries";
import { db } from "@/lib/db";

interface LeftSidebarProps {
  currentCategorySlug?: string;
}

export async function LeftSidebar({ currentCategorySlug }: LeftSidebarProps) {
  const categories = await getCategoriesWithCounts();
  
  // Get current category analytics if category slug provided
  let stats = { totalBlogs: 0, totalReactions: 0, averageEngagement: 0 };
  if (currentCategorySlug) {
    const category = await db.category.findUnique({
      where: { slug: currentCategorySlug },
      select: { id: true },
    });
    if (category) {
      stats = await getCategoryAnalytics(category.id);
    }
  } else if (categories.length > 0) {
    // Use first category as default
    stats = await getCategoryAnalytics(categories[0].id);
  }

  return (
    <aside className="hidden lg:block w-[240px] sticky top-[3.5rem] self-start max-h-[calc(100vh-4rem)] overflow-y-auto will-change-transform scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
      <div className="space-y-4">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 className="text-xs font-semibold text-foreground">
              تحليلات الفئات
            </h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  المقالات
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {stats.totalBlogs}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  التفاعلات
                </span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {stats.totalReactions.toLocaleString('ar-SA')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">
                  متوسط التفاعل
                </span>
              </div>
              <span className="text-sm font-bold text-primary">
                {stats.averageEngagement}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
            الفئات
          </h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryLink
                key={category.id}
                label={category.name}
                count={category.articleCount}
                slug={category.slug}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase">
            نصائح وحيل
          </h2>
          <div className="space-y-2">
            <TipItem title="حسّن محتواك لمحركات البحث" />
            <TipItem title="استخدم عناوين جذابة" />
            <TipItem title="أضف عناصر بصرية" />
            <TipItem title="انشر بانتظام" />
          </div>
        </CardContent>
      </Card>
      </div>
      <div className="sticky bottom-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none -mt-16" />
    </aside>
  );
}

function CategoryLink({ label, count, slug }: { label: string; count: number; slug: string }) {
  return (
    <Link
      href={`/categories/${slug}`}
      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm group"
    >
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="group-hover:text-primary transition-colors">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
        {count}
      </span>
    </Link>
  );
}

function TipItem({ title }: { title: string }) {
  return (
    <Link
      href="#"
      className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 group"
    >
      <span className="text-primary mt-0.5">•</span>
      <span className="group-hover:underline">{title}</span>
    </Link>
  );
}

