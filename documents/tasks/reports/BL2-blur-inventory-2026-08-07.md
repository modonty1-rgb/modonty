# تقرير BL2 — جرد المواضع التي تُسقط blurDataURL

**المصدر:** `pnpm tsc --noEmit` بعد جعل `blurDataURL` مفتاحاً إلزامياً في `dataLayer/lib/media-src.ts:33`.
**التاريخ:** ٧ أغسطس ٢٠٢٦ · **الفرع:** `image-component`

> هذا التقرير هو **الكاشف** — كل سطر فيه موضع كان يُسقط الضبابة صامتاً. لا يُعتمد على العين في الجرد.

## الملخّص

| التطبيق | أخطاء | ملفات |
|---|---|---|
| modonty | 99 | 47 |
| admin | 83 | 41 |
| console | 0 | 0 |

## modonty

```
      9 app/api/helpers/client-queries.ts
      8 app/api/helpers/article-queries.ts
      5 app/articles/[slug]/page.tsx
      4 app/clients/[slug]/page.tsx
      4 app/api/helpers/category-queries.ts
      3 app/clients/[slug]/components/shell-hero/client-hero-v2.tsx
      3 app/articles/[slug]/components/sidebar/article-client-card.tsx
      3 app/articles/[slug]/components/article-lab-client-card.tsx
      2 app/users/profile/helpers/profile-liked.ts
      2 app/users/profile/helpers/profile-favorites.ts
      2 app/users/profile/helpers/profile-disliked.ts
      2 app/tags/[slug]/page.tsx
      2 app/sitemap.ts
      2 app/reels/helpers/reels-feed.ts
      2 app/industries/[slug]/page.tsx
      2 app/image-sitemap.xml/route.ts
      2 app/clients/[slug]/components/client-photos-preview.tsx
      2 app/clients/[slug]/components/client-page/client-page-shell.tsx
      2 app/categories/[slug]/page.tsx
      2 app/categories/[slug]/components/category-article-list-item.tsx
      2 app/categories/[slug]/components/category-article-card.tsx
      2 app/articles/[slug]/components/related-articles.tsx
      2 app/articles/[slug]/components/more-from-client.tsx
      2 app/articles/[slug]/components/more-from-author.tsx
      2 app/articles/[slug]/components/article-manual-related.tsx
      2 app/articles/[slug]/components/article-lab-read-more.tsx
      2 app/api/users/[id]/liked/route.ts
      2 app/api/users/[id]/favorites/route.ts
      2 app/api/users/[id]/disliked/route.ts
      1 app/users/profile/helpers/profile-following.ts
      1 app/users/profile/helpers/profile-bookings.ts
      1 app/users/profile/favorites/page.tsx
      1 app/clients/[slug]/reels/page.tsx
      1 app/clients/[slug]/components/sections/gallery-lightbox-overlay.tsx
      1 app/clients/[slug]/components/sections/client-gallery-section.tsx
      1 app/clients/[slug]/components/related-clients.tsx
      1 app/clients/[slug]/components/hero/utils.tsx
      1 app/clients/[slug]/components/hero/hero-avatar.tsx
      1 app/clients/[slug]/components/article-list.tsx
      1 app/clients/[slug]/book/page.tsx
      1 app/authors/[slug]/page.tsx
      1 app/articles/[slug]/components/article-lab-mobile-identity.tsx
      1 app/articles/[slug]/components/article-image-gallery.tsx
      1 app/api/users/[id]/following/route.ts
      1 app/api/helpers/tag-queries.ts
      1 app/api/helpers/industry-queries.ts
      1 ../dataLayer/lib/platform-defaults.ts
```

## admin

```
      6 app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx
      6 app/(dashboard)/clients/components/client-form.tsx
      5 app/(dashboard)/clients/[id]/components/client-view.tsx
      4 lib/seo/structured-data.ts
      4 app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx
      4 app/(dashboard)/clients/[id]/components/client-header.tsx
      3 app/(dashboard)/articles/workflow/[transition]/page.tsx
      3 ../dataLayer/lib/seo/generate-organization-jsonld.ts
      3 ../dataLayer/lib/seo/generate-client-seo-bundle.ts
      2 lib/seo/metadata-generator.ts
      2 lib/health/article-health.ts
      2 components/shared/media-picker-dialog.tsx
      2 app/(dashboard)/reels/helpers/load-reels.ts
      2 app/(dashboard)/modonty/setting/helpers/build-trending-page-jsonld.ts
      2 app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts
      2 app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts
      2 app/(dashboard)/media/components/unused-media-list.tsx
      2 app/(dashboard)/media/components/media-grid.tsx
      2 app/(dashboard)/clients/helpers/client-seo-config/validators-advanced.ts
      2 app/(dashboard)/client-galleries/helpers/load-galleries.ts
      2 app/(dashboard)/articles/components/sections/basic-section.tsx
      2 app/(dashboard)/articles/components/article-table.tsx
      1 app/(dashboard)/settings/defaults/actions/defaults-actions.ts
      1 app/(dashboard)/seo-images/helpers/load-groups.ts
      1 app/(dashboard)/media/maintenance/helpers/optimizable.ts
      1 app/(dashboard)/media/[id]/edit/edit-media-form.tsx
      1 app/(dashboard)/clients/helpers/hooks/use-media-preview.ts
      1 app/(dashboard)/clients/helpers/client-seo-config/generate-organization-structured-data.ts
      1 app/(dashboard)/clients/components/client-table.tsx
      1 app/(dashboard)/briefs/helpers/load-briefs.ts
      1 app/(dashboard)/briefs/helpers/load-brief-detail.ts
      1 app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx
      1 app/(dashboard)/articles/workflow/maintenance/page.tsx
      1 app/(dashboard)/articles/workflow/actions/gated-transition.ts
      1 app/(dashboard)/articles/helpers/article-form-helpers/transform-article-to-form-data.ts
      1 app/(dashboard)/articles/components/steps/metatag-preview-step.tsx
      1 app/(dashboard)/articles/components/image-gallery-manager.tsx
      1 app/(dashboard)/articles/components/gallery-item-edit-dialog.tsx
      1 app/(dashboard)/articles/[id]/page.tsx
      1 app/(dashboard)/articles/[id]/components/article-view-gallery.tsx
      1 app/(dashboard)/actions/media-counts.ts
```

## الأخطاء الخام — modonty

```
../dataLayer/lib/platform-defaults.ts(40,37): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; filename: string; }' is not assignable to parameter of type 'MediaSrcInput'.
app/api/helpers/article-queries.ts(119,21): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/article-queries.ts(130,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/article-queries.ts(142,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/api/helpers/article-queries.ts(282,21): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/article-queries.ts(288,26): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/article-queries.ts(474,21): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/article-queries.ts(487,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/article-queries.ts(499,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/api/helpers/category-queries.ts(378,31): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/category-queries.ts(531,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/category-queries.ts(542,24): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/category-queries.ts(550,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/api/helpers/client-queries.ts(125,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(126,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(242,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(243,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(342,20): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(343,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(399,24): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/client-queries.ts(449,27): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; }' is not assignable to parameter of type 'MediaSrcInput'.
app/api/helpers/client-queries.ts(450,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/industry-queries.ts(90,29): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/helpers/tag-queries.ts(135,31): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/users/[id]/disliked/route.ts(111,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/users/[id]/disliked/route.ts(125,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/users/[id]/favorites/route.ts(128,29): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/api/users/[id]/favorites/route.ts(136,26): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/users/[id]/following/route.ts(91,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/users/[id]/liked/route.ts(79,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/api/users/[id]/liked/route.ts(93,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-image-gallery.tsx(28,31): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; caption: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/components/article-lab-client-card.tsx(92,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-lab-client-card.tsx(94,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-lab-client-card.tsx(94,59): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-lab-mobile-identity.tsx(21,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-lab-read-more.tsx(43,78): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-lab-read-more.tsx(48,35): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/components/article-manual-related.tsx(66,82): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/article-manual-related.tsx(110,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/components/more-from-author.tsx(58,82): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/more-from-author.tsx(98,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/components/more-from-client.tsx(66,82): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/more-from-client.tsx(108,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/components/related-articles.tsx(58,82): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/related-articles.tsx(98,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/components/sidebar/article-client-card.tsx(38,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/sidebar/article-client-card.tsx(40,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/components/sidebar/article-client-card.tsx(40,59): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/page.tsx(184,16): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/page.tsx(185,16): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/page.tsx(186,16): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/articles/[slug]/page.tsx(304,23): error TS2345: Argument of type '{ bunnyUrl: string | null; id: string; url: string; filename: string; width: number | null; height: number | null; altText: string | null; caption: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/articles/[slug]/page.tsx(657,41): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/authors/[slug]/page.tsx(345,41): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/categories/[slug]/components/category-article-card.tsx(17,38): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | undefined; } | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/categories/[slug]/components/category-article-card.tsx(18,40): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | undefined; } | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/categories/[slug]/components/category-article-list-item.tsx(15,38): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | undefined; } | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/categories/[slug]/components/category-article-list-item.tsx(16,40): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | undefined; } | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/categories/[slug]/page.tsx(198,37): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/categories/[slug]/page.tsx(199,37): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/book/page.tsx(75,33): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/article-list.tsx(158,35): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | null | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/clients/[slug]/components/client-page/client-page-shell.tsx(149,21): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/client-page/client-page-shell.tsx(374,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/client-photos-preview.tsx(20,63): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/client-photos-preview.tsx(60,31): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/hero/hero-avatar.tsx(18,25): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/clients/[slug]/components/hero/utils.tsx(17,19): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/related-clients.tsx(56,48): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/sections/client-gallery-section.tsx(42,31): error TS2345: Argument of type 'ClientGalleryImage' is not assignable to parameter of type 'MediaSrcInput'.
app/clients/[slug]/components/sections/gallery-lightbox-overlay.tsx(141,25): error TS2345: Argument of type 'ClientGalleryImage' is not assignable to parameter of type 'MediaSrcInput'.
app/clients/[slug]/components/shell-hero/client-hero-v2.tsx(89,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width?: number | null | undefined; height?: number | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/components/shell-hero/client-hero-v2.tsx(95,43): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/clients/[slug]/components/shell-hero/client-hero-v2.tsx(96,16): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/clients/[slug]/page.tsx(124,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/page.tsx(124,60): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/page.tsx(280,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/page.tsx(280,53): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/clients/[slug]/reels/page.tsx(61,35): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/image-sitemap.xml/route.ts(75,18): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/image-sitemap.xml/route.ts(76,42): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/industries/[slug]/page.tsx(135,35): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/industries/[slug]/page.tsx(136,35): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/reels/helpers/reels-feed.ts(80,24): error TS2345: Argument of type '{ bunnyUrl: string | null; client: { name: string; slug: string; logoMedia: { bunnyUrl: string | null; url: string; } | null; } | null; id: string; title: string | null; url: string; description: string | null; ... 4 more ...; reelSlug: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/reels/helpers/reels-feed.ts(87,29): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/sitemap.ts(75,18): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/sitemap.ts(75,64): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/tags/[slug]/page.tsx(198,37): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/tags/[slug]/page.tsx(199,37): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/favorites/page.tsx(75,49): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/users/profile/helpers/profile-bookings.ts(53,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/helpers/profile-disliked.ts(108,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/helpers/profile-disliked.ts(122,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/helpers/profile-favorites.ts(68,27): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/users/profile/helpers/profile-favorites.ts(74,24): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/helpers/profile-following.ts(51,20): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/helpers/profile-liked.ts(77,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/users/profile/helpers/profile-liked.ts(91,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
```

## الأخطاء الخام — admin

```
app/(dashboard)/actions/media-counts.ts(181,19): error TS2345: Argument of type 'RawMedia' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/[id]/components/article-view-gallery.tsx(33,33): error TS2345: Argument of type '{ id: string; url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/[id]/page.tsx(148,35): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/components/article-table.tsx(90,21): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/components/article-table.tsx(92,29): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/components/gallery-item-edit-dialog.tsx(88,31): error TS2345: Argument of type '{ id: string; url: string; bunnyUrl: string | null; altText?: string | null | undefined; width?: number | null | undefined; height?: number | null | undefined; filename: string; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/components/image-gallery-manager.tsx(159,35): error TS2345: Argument of type '{ id: string; url: string; bunnyUrl: string | null; altText?: string | null | undefined; width?: number | null | undefined; height?: number | null | undefined; filename: string; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/components/sections/basic-section.tsx(33,39): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width?: number | null | undefined; height?: number | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/components/sections/basic-section.tsx(251,44): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width?: number | null | undefined; height?: number | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/components/steps/metatag-preview-step.tsx(349,23): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width?: number | null | undefined; height?: number | null | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/helpers/article-form-helpers/transform-article-to-form-data.ts(86,31): error TS2345: Argument of type '{ id: string; url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; filename: string; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/workflow/[transition]/page.tsx(121,37): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/workflow/[transition]/page.tsx(197,27): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/workflow/[transition]/page.tsx(200,35): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/workflow/actions/gated-transition.ts(144,33): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/articles/workflow/maintenance/page.tsx(79,39): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/articles/workflow/quality-check/[articleId]/page.tsx(148,31): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/briefs/helpers/load-brief-detail.ts(228,23): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; type: MediaType; filename: string; fileSize: number | null; width: number | null; height: number | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/briefs/helpers/load-briefs.ts(100,27): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/client-galleries/helpers/load-galleries.ts(33,25): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/client-galleries/helpers/load-galleries.ts(87,21): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-header.tsx(52,27): error TS2345: Argument of type '{ id?: string | undefined; url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-header.tsx(83,31): error TS2345: Argument of type '{ id?: string | undefined; url: string; bunnyUrl: string | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-header.tsx(161,34): error TS2345: Argument of type '{ id?: string | undefined; url: string; bunnyUrl: string | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/[id]/components/client-header.tsx(168,34): error TS2345: Argument of type '{ id?: string | undefined; url: string; bunnyUrl: string | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/[id]/components/client-view.tsx(118,29): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-view.tsx(190,37): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-view.tsx(471,37): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-view.tsx(479,38): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/client-view.tsx(484,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx(317,45): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx(364,49): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx(439,37): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/[id]/components/tabs/media-social-tab.tsx(498,39): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/components/client-form.tsx(52,14): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/client-form.tsx(55,14): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/client-form.tsx(62,32): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/client-form.tsx(63,16): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/client-form.tsx(66,32): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/client-form.tsx(67,16): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; width: number | null; height: number | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/client-table.tsx(450,41): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; width: number | null; height: number | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx(105,29): error TS2345: Argument of type '{ url?: string | undefined; bunnyUrl: string | null; altText?: string | undefined; width?: number | undefined; height?: number | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx(144,32): error TS2345: Argument of type '{ url?: string | undefined; bunnyUrl: string | null; altText?: string | undefined; width?: number | undefined; height?: number | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx(154,32): error TS2345: Argument of type '{ url?: string | undefined; bunnyUrl: string | null; altText?: string | undefined; width?: number | undefined; height?: number | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx(209,50): error TS2345: Argument of type '{ url?: string | undefined; bunnyUrl: string | null; altText?: string | undefined; width?: number | undefined; height?: number | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx(211,50): error TS2345: Argument of type '{ url?: string | undefined; bunnyUrl: string | null; altText?: string | undefined; width?: number | undefined; height?: number | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/components/form-sections/client-seo-validation-section.tsx(240,43): error TS2345: Argument of type '{ url?: string | undefined; bunnyUrl: string | null; altText?: string | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/clients/helpers/client-seo-config/generate-organization-structured-data.ts(22,28): error TS2345: Argument of type 'MediaRelation' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/helpers/client-seo-config/validators-advanced.ts(21,28): error TS2345: Argument of type 'MediaRelation' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/helpers/client-seo-config/validators-advanced.ts(95,31): error TS2345: Argument of type 'MediaRelation' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/clients/helpers/hooks/use-media-preview.ts(26,33): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/media/[id]/edit/edit-media-form.tsx(440,43): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/media/components/media-grid.tsx(113,26): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/media/components/media-grid.tsx(154,76): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/media/components/unused-media-list.tsx(81,77): error TS2345: Argument of type 'UnusedItem' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/media/components/unused-media-list.tsx(82,42): error TS2345: Argument of type 'UnusedItem' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/media/maintenance/helpers/optimizable.ts(69,21): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; type: MediaType; client: { name: string; } | null; scope: MediaScope; clientId: string | null; filename: string; mimeType: string; fileSize: number | null; width: number | null; height: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts(178,28): error TS2345: Argument of type '{ url?: string | null | undefined; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/modonty/setting/helpers/build-clients-page-jsonld.ts(180,28): error TS2345: Argument of type '{ url?: string | null | undefined; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts(217,31): error TS2345: Argument of type '{ url?: string | null | undefined; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/modonty/setting/helpers/build-home-jsonld-from-settings.ts(219,33): error TS2345: Argument of type '{ url?: string | null | undefined; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/modonty/setting/helpers/build-trending-page-jsonld.ts(25,29): error TS2345: Argument of type '{ url?: string | null | undefined; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/modonty/setting/helpers/build-trending-page-jsonld.ts(27,31): error TS2345: Argument of type '{ url?: string | null | undefined; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/reels/helpers/load-reels.ts(106,56): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; id: string; title: string | null; createdAt: Date; client: { name: string; logoMedia: { bunnyUrl: string | null; url: string; } | null; } | null; ... 10 more ...; durationSec: number | null; }' is not assignable to parameter of type 'MediaSrcInput'.
app/(dashboard)/reels/helpers/load-reels.ts(119,31): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/seo-images/helpers/load-groups.ts(169,19): error TS2345: Argument of type 'SeoImageMediaRow' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
app/(dashboard)/settings/defaults/actions/defaults-actions.ts(44,31): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; filename: string; }' is not assignable to parameter of type 'MediaSrcInput'.
components/shared/media-picker-dialog.tsx(105,21): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
components/shared/media-picker-dialog.tsx(126,26): error TS2345: Argument of type 'Media' is not assignable to parameter of type 'MediaSrcInput'.
lib/health/article-health.ts(186,32): error TS2345: Argument of type '{ url: string | null; bunnyUrl: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/health/article-health.ts(227,28): error TS2345: Argument of type '{ url: string | null; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/seo/metadata-generator.ts(193,14): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/seo/metadata-generator.ts(194,14): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/seo/structured-data.ts(30,21): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; altText?: string | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/seo/structured-data.ts(42,20): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/seo/structured-data.ts(42,97): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
lib/seo/structured-data.ts(127,23): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width?: number | null | undefined; height?: number | null | undefined; }' is not assignable to parameter of type 'MediaSrcInput'.
../dataLayer/lib/seo/generate-client-seo-bundle.ts(266,22): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; createdAt: Date; description: string | null; width: number | null; height: number | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
../dataLayer/lib/seo/generate-client-seo-bundle.ts(334,28): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; createdAt: Date; description: string | null; width: number | null; height: number | null; altText: string | null; } | null' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
../dataLayer/lib/seo/generate-client-seo-bundle.ts(412,19): error TS2345: Argument of type '{ bunnyUrl: string | null; url: string; createdAt: Date; description: string | null; width: number | null; height: number | null; altText: string | null; }' is not assignable to parameter of type 'MediaSrcInput'.
../dataLayer/lib/seo/generate-organization-jsonld.ts(240,28): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width: number | null; height: number | null; altText: string | null; description?: string | null | undefined; createdAt?: string | Date | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
../dataLayer/lib/seo/generate-organization-jsonld.ts(690,34): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width: number | null; height: number | null; altText: string | null; description?: string | null | undefined; createdAt?: string | Date | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
../dataLayer/lib/seo/generate-organization-jsonld.ts(826,29): error TS2345: Argument of type '{ url: string; bunnyUrl: string | null; width: number | null; height: number | null; altText: string | null; description?: string | null | undefined; createdAt?: string | Date | null | undefined; } | null | undefined' is not assignable to parameter of type 'MediaSrcInput | null | undefined'.
```
