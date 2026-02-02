'use client';

import { useArticleForm } from './article-form-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Globe, 
  Twitter, 
  Facebook, 
  Search, 
  Eye, 
  X,
  Smartphone,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

interface ArticleFormPreviewSidebarProps {
  onClose: () => void;
}

export function ArticleFormPreviewSidebar({ onClose }: ArticleFormPreviewSidebarProps) {
  const { formData, clients, categories, authors, seoScore } = useArticleForm();
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  const effectiveTitle = formData.seoTitle || formData.title || 'عنوان المقال سيظهر هنا';
  const effectiveDescription = formData.seoDescription || formData.excerpt || 'وصف المقال سيظهر هنا بشكل مختصر لجذب القراء من محركات البحث...';
  const selectedClient = clients.find(c => c.id === formData.clientId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  const displayUrl = `${siteUrl.replace('https://', '')} › articles › ${formData.slug || 'slug'}`;

  return (
    <div className="w-full h-full flex flex-col bg-background border-l shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm">Live SEO Preview</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-none"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-none"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Health Summary */}
        <div className="p-3 rounded-lg border bg-gradient-to-br from-muted/50 to-background">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">SEO Health Score</span>
            <Badge 
              variant={seoScore >= 80 ? 'default' : seoScore >= 60 ? 'secondary' : 'destructive'}
              className={cn(
                "text-[10px] h-4",
                seoScore >= 80 && "bg-emerald-500",
                seoScore >= 60 && "bg-amber-500 text-white",
              )}
            >
              {seoScore}%
            </Badge>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000",
                seoScore >= 80 ? "bg-emerald-500" : seoScore >= 60 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${seoScore}%` }}
            />
          </div>
        </div>

        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="google" className="text-[10px] gap-1">
              <Search className="h-3 w-3" /> Google
            </TabsTrigger>
            <TabsTrigger value="social" className="text-[10px] gap-1">
              <Facebook className="h-3 w-3" /> Social
            </TabsTrigger>
            <TabsTrigger value="x" className="text-[10px] gap-1">
              <Twitter className="h-3 w-3" /> X
            </TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="mt-4 space-y-4">
            <div className={cn(
              "border rounded-xl p-4 bg-white dark:bg-zinc-900 shadow-sm transition-all",
              device === 'mobile' ? "max-w-[360px] mx-auto" : "w-full"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                  M
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium leading-none">{selectedClient?.name || 'مودونتي'}</span>
                  <span className="text-[10px] text-zinc-500 leading-none truncate">{displayUrl}</span>
                </div>
              </div>
              <h4 className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg hover:underline cursor-pointer leading-tight mb-1 font-arial">
                {effectiveTitle}
              </h4>
              <p className="text-[#4d5156] dark:text-[#bdc1c6] text-sm leading-snug line-clamp-2">
                {effectiveDescription}
              </p>
            </div>
            
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                <strong>Pro Tip:</strong> Google titles should be between 50-60 characters. Your current title is {effectiveTitle.length} characters.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <div className="border rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
              <div className="aspect-video bg-muted flex items-center justify-center border-b">
                <span className="text-xs text-muted-foreground">Featured Image Preview</span>
              </div>
              <div className="p-3 bg-[#f0f2f5] dark:bg-zinc-800">
                <div className="text-[11px] text-[#65676b] dark:text-zinc-400 uppercase font-medium mb-0.5">
                  {siteUrl.replace('https://', '').toUpperCase()}
                </div>
                <div className="text-sm font-bold text-[#050505] dark:text-white line-clamp-1 mb-1">
                  {effectiveTitle}
                </div>
                <div className="text-xs text-[#65676b] dark:text-zinc-400 line-clamp-2 leading-tight">
                  {effectiveDescription}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="x" className="mt-4">
            <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
              <div className="aspect-video bg-muted flex items-center justify-center border-b">
                <span className="text-xs text-muted-foreground">Featured Image Preview</span>
              </div>
              <div className="p-3">
                <div className="text-[11px] text-zinc-500 mb-0.5">
                  {siteUrl.replace('https://', '')}
                </div>
                <div className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-1 mb-0.5">
                  {effectiveTitle}
                </div>
                <div className="text-[11px] text-zinc-500 line-clamp-2 leading-tight">
                  {effectiveDescription}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Checklist</h4>
          <div className="space-y-2">
            <CheckItem label="Title includes target keyword" checked={effectiveTitle.includes(formData.slug || '')} />
            <CheckItem label="Meta description length (120-160)" checked={effectiveDescription.length >= 120 && effectiveDescription.length <= 160} />
            <CheckItem label="Slug is SEO friendly" checked={!!formData.slug && formData.slug.length > 3} />
            <CheckItem label="Featured image added" checked={!!formData.featuredImageId} />
            <CheckItem label="Categories & Tags assigned" checked={!!formData.categoryId && (formData.tags?.length || 0) > 0} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-3.5 w-3.5 rounded-full flex items-center justify-center border transition-colors",
        checked ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-muted border-muted-foreground/30 text-muted-foreground/30"
      )}>
        {checked && <Eye className="h-2 w-2 stroke-[4]" />}
      </div>
      <span className={cn("text-[11px] font-medium", checked ? "text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}
