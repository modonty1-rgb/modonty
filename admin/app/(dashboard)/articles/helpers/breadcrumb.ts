/**
 * Breadcrumb generation utilities
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate breadcrumb path for article
 */
export function generateBreadcrumbPath(
  categoryName?: string,
  categorySlug?: string,
  articleTitle?: string,
  articleSlug?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { name: "الرئيسية", url: "/" },
  ];

  if (categoryName && categorySlug) {
    items.push({
      name: categoryName,
      url: `/categories/${categorySlug}`,
    });
  }

  if (articleTitle && articleSlug) {
    items.push({
      name: articleTitle,
      url: `/articles/${articleSlug}`,
    });
  }

  return items;
}
