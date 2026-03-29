import { IconTrending, IconFolder } from "@/lib/icons";

interface CategoriesHeroProps {
  totalCategories: number;
  totalArticles: number;
}

export function CategoriesHero({ totalCategories, totalArticles }: CategoriesHeroProps) {
  return (
    <div className="relative overflow-hidden border-b bg-primary">
      <div
        className="pointer-events-none absolute inset-0 z-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:18px_18px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-0 z-0 h-32 w-32 rounded-full bg-accent/20 blur-2xl"
        aria-hidden
      />
      <div className="relative z-10 container mx-auto max-w-[1128px] px-4 py-12 md:py-16">
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            استكشف الفئات
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mb-8">
            تصفح مجموعة متنوعة من الفئات والمواضيع. اكتشف المحتوى الذي يهمك واستكشف مقالات جديدة.
          </p>

          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                <IconFolder className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalCategories}</p>
                <p className="text-sm text-white/70">فئة متاحة</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                <IconTrending className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalArticles}</p>
                <p className="text-sm text-white/70">مقال منشور</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
