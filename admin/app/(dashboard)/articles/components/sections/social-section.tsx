'use client';

import { useArticleForm } from '../article-form-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function SocialSection() {
  const { formData, categories, clients, tags } = useArticleForm();

  const selectedClient = clients.find((c) => c.id === formData.clientId);
  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const tagNames = (formData.tags?.length ? tags.filter((t) => formData.tags?.includes(t.id)).map((t) => t.name) : []) || [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://modonty.com';
  const ogUrlDisplay = formData.canonicalUrl
    ? (formData.canonicalUrl.startsWith('http') ? formData.canonicalUrl : `${siteUrl}${formData.canonicalUrl.startsWith('/') ? formData.canonicalUrl : `/${formData.canonicalUrl}`}`)
    : `${siteUrl}/articles/${formData.slug || '…'}`;

  const primaryLang = formData.inLanguage || 'ar';
  const altLangs = Array.isArray(formData.alternateLanguages)
    ? formData.alternateLanguages.map((a) => (a.hreflang ?? '').trim()).filter(Boolean)
    : [];
  const languageDisplay = [primaryLang, ...altLangs].filter(Boolean).join(', ') || primaryLang;

  const canonicalDisplay = formData.canonicalUrl?.trim()
    ? (formData.canonicalUrl.startsWith('http') ? formData.canonicalUrl : `${siteUrl}${formData.canonicalUrl.startsWith('/') ? formData.canonicalUrl : `/${formData.canonicalUrl}`}`)
    : `${siteUrl}/articles/${formData.slug || '…'}`;

  const rows: { name: string; sot: string; value: string }[] = [
    { name: 'Canonical URL', sot: 'Article slug', value: canonicalDisplay },
    // Social / OG / Twitter (derived from article)
    { name: 'OG Title', sot: 'SEO title', value: formData.seoTitle || formData.title || '—' },
    { name: 'OG Description', sot: 'SEO description', value: formData.seoDescription || formData.excerpt || '—' },
    { name: 'OG URL', sot: 'Canonical URL', value: ogUrlDisplay },
    { name: 'OG Site Name', sot: 'Client name', value: selectedClient?.name || 'مودونتي' },
    { name: 'OG Article Section', sot: 'Category', value: selectedCategory?.name || '—' },
    { name: 'OG Article Tags', sot: 'Article tags', value: tagNames.length > 0 ? tagNames.join(', ') : '—' },
    { name: 'Twitter Title', sot: 'SEO title', value: formData.seoTitle || formData.title || '—' },
    { name: 'Twitter Description', sot: 'SEO description', value: formData.seoDescription || formData.excerpt || '—' },
    // Settings (read-only)
    { name: 'Language', sot: 'Settings', value: languageDisplay },
    { name: 'Content format', sot: 'Settings', value: formData.contentFormat || 'rich_text' },
    { name: 'OG Type', sot: 'Settings', value: formData.ogType || 'website' },
    { name: 'OG Locale', sot: 'Settings', value: formData.ogLocale || 'ar_SA' },
    { name: 'Twitter Card', sot: 'Settings', value: formData.twitterCard || 'summary_large_image' },
    { name: 'Twitter Site', sot: 'Settings', value: formData.twitterSite ? (formData.twitterSite.startsWith('@') ? formData.twitterSite : `@${formData.twitterSite}`) : '—' },
    { name: 'Twitter Creator', sot: 'Settings', value: formData.twitterCreator ? (formData.twitterCreator.startsWith('@') ? formData.twitterCreator : `@${formData.twitterCreator}`) : '—' },
    { name: 'Accessible for free', sot: 'Settings', value: (formData.isAccessibleForFree ?? true) ? 'Yes' : 'No' },
    { name: 'License', sot: 'Settings', value: formData.license || '—' },
    { name: 'Meta Robots', sot: 'Settings', value: formData.metaRobots || 'index, follow' },
    { name: 'Sitemap Priority', sot: 'Settings', value: String(formData.sitemapPriority ?? 0.5) },
    { name: 'Sitemap Change Freq', sot: 'Settings', value: formData.sitemapChangeFreq || 'weekly' },
  ];

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>SEO Metadata Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Name</TableHead>
              <TableHead className="w-[140px]">SOT</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium text-muted-foreground">{row.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.sot}</TableCell>
                <TableCell className="break-words">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
