import { TrendingUp, FolderOpen } from "lucide-react";

interface CategoriesHeroProps {
  totalCategories: number;
  totalArticles: number;
}

export function CategoriesHero({ totalCategories, totalArticles }: CategoriesHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
      <div className="container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            استكشف الفئات
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            تصفح مجموعة متنوعة من الفئات والمواضيع. اكتشف المحتوى الذي يهمك واستكشف مقالات جديدة.
          </p>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCategories}</p>
                <p className="text-sm text-muted-foreground">فئة متاحة</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalArticles}</p>
                <p className="text-sm text-muted-foreground">مقال منشور</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 right-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-20 w-40 h-40 bg-primary rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
