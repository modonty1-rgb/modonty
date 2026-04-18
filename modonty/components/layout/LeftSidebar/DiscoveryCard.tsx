'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from '@/components/link';
import { cn } from '@/lib/utils';
import { IconCategory, IconIndustry, IconChevronLeft } from '@/lib/icons';
import type { CategoryResponse } from '@/lib/types';

interface Industry { id: string; name: string; slug: string; clientCount: number; socialImage?: string | null }
interface Tag      { id: string; name: string; slug: string; articleCount: number; socialImage?: string | null }

interface DiscoveryCardProps {
  categories: CategoryResponse[];
  currentCategorySlug?: string;
  totalArticlesAll: number;
  industries: Industry[];
  tags: Tag[];
}

const rowClass = "flex min-w-0 items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors group cursor-pointer";

const triggerClass = "flex-1 text-[11px] h-6 gap-1 data-[state=active]:text-accent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:bg-transparent";

export function DiscoveryCard({ categories, currentCategorySlug, totalArticlesAll, industries, tags }: DiscoveryCardProps) {
  const activeCategories = [...categories.filter(c => c.articleCount > 0)].sort((a, b) => b.articleCount - a.articleCount);
  const sortedIndustries = [...industries].sort((a, b) => b.clientCount - a.clientCount);
  const sortedTags       = [...tags].sort((a, b) => b.articleCount - a.articleCount);

  return (
    <Card className="flex-none">
      <CardContent className="p-3">
        <Tabs defaultValue="categories">
          <TabsList className="w-full mb-3 h-7">
            <TabsTrigger value="categories" className={triggerClass}><IconCategory className="h-3 w-3 shrink-0" />الفئات</TabsTrigger>
            <TabsTrigger value="industries" className={triggerClass}><IconIndustry className="h-3 w-3 shrink-0" />الصناعات</TabsTrigger>
            <TabsTrigger value="tags"       className={triggerClass}><span className="font-bold">#</span>الوسوم</TabsTrigger>
          </TabsList>

          {/* ─── الفئات ─── */}
          <TabsContent value="categories" className="mt-0">
            <div className="flex items-center justify-between mb-2">
              <Link href="/categories" className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
              <Link
                href="/"
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  !currentCategorySlug
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                الكل
                <span className={cn('text-[10px]', !currentCategorySlug ? 'opacity-70' : '')}>{totalArticlesAll}</span>
              </Link>
            </div>
            {/* offset = navbar(3.5) + Analytics(7.6) + gap(1) + card-header(4.5) + jami3-row(2) = 18.6 + delta(FollowCard-Analytics=1.4) = 20rem */}
            <ScrollArea className="h-[calc(100dvh-21.5rem)]" dir="rtl">
              <div className="flex flex-col gap-0.5 pe-2 pb-4">
                {activeCategories.map((c) => (
                  <Link key={c.id} href={`/?category=${c.slug}`} className={cn(rowClass, currentCategorySlug === c.slug && 'bg-primary/10')}>
                    <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                      <Avatar className="h-5 w-5 shrink-0 rounded-sm">
                        <AvatarImage src={c.socialImage} alt={c.name} className="object-cover" />
                        <AvatarFallback className="rounded-sm text-[9px] font-medium bg-muted text-muted-foreground">{c.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className={cn("min-w-0 truncate text-sm text-right transition-colors group-hover:text-primary", currentCategorySlug === c.slug && 'text-primary font-medium')}>{c.name}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">{c.articleCount}</span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ─── الصناعات ─── */}
          <TabsContent value="industries" className="mt-0">
            <div className="flex items-center justify-between mb-2">
              <Link href="/industries" className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                الكل
                <span className="text-[10px]">{sortedIndustries.length.toLocaleString('ar-SA')}</span>
              </span>
            </div>
            {sortedIndustries.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد صناعات</p>
            ) : (
              <ScrollArea className="h-[calc(100dvh-19.5rem)]" dir="rtl">
                <div className="flex flex-col gap-0.5 pe-2 pb-4">
                  {sortedIndustries.map((ind) => (
                    <Link key={ind.id} href={`/industries/${ind.slug}`} className={rowClass}>
                      <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <Avatar className="h-5 w-5 shrink-0 rounded-sm">
                          <AvatarImage src={ind.socialImage ?? undefined} alt={ind.name} className="object-cover" />
                          <AvatarFallback className="rounded-sm text-[9px] font-medium bg-muted text-muted-foreground">{ind.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate text-sm text-right group-hover:text-primary transition-colors">{ind.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">{ind.clientCount}</span>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* ─── الوسوم ─── */}
          <TabsContent value="tags" className="mt-0">
            <div className="flex items-center justify-between mb-2">
              <Link href="/tags" className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0">
                <IconChevronLeft className="h-3.5 w-3.5" aria-hidden />
                استكشف
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                الكل
                <span className="text-[10px]">{sortedTags.length.toLocaleString('ar-SA')}</span>
              </span>
            </div>
            {sortedTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">لا توجد وسوم</p>
            ) : (
              <ScrollArea className="h-[calc(100dvh-19.5rem)]" dir="rtl">
                <div className="flex flex-col gap-0.5 pe-2 pb-4">
                  {sortedTags.map((tag) => (
                    <Link key={tag.id} href={`/tags/${tag.slug}`} className={rowClass}>
                      <span className="inline-flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                        <Avatar className="h-5 w-5 shrink-0 rounded-sm">
                          <AvatarImage src={tag.socialImage ?? undefined} alt={tag.name} className="object-cover" />
                          <AvatarFallback className="rounded-sm text-[9px] font-bold bg-muted text-muted-foreground">#</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate text-sm text-right group-hover:text-primary transition-colors">{tag.name}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground group-hover:text-primary transition-colors">{tag.articleCount}</span>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
