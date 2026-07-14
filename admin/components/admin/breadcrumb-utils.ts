export interface BreadcrumbItem {
  label: string;
  href: string;
  /** True when this segment isn't a real route (only a parent for dynamic children).
   *  Renderer should display as plain text, not a Link, to avoid 404s. */
  disabled?: boolean;
}

/**
 * Full paths that are NOT real routes — folders with no page.tsx of their own,
 * existing only as parents for dynamic children. Clicking them in the breadcrumb
 * either 404s or (when a sibling [id] route swallows them) bounces the admin back
 * to the list — e.g. /articles/segment was matched by /articles/[id] as if "segment"
 * were an article id (live test 2026-07-14).
 *
 * Matched on the FULL path, never the bare segment name: "social" and "modonty" are
 * dead as top-level paths but REAL pages under /settings/ — a name-keyed list would
 * silently kill those working links.
 *
 * Keep in sync with the router: a folder here must have no page.tsx.
 */
const NON_NAVIGABLE_PATHS = new Set([
  "/articles/pipeline",              // page is /articles/pipeline/[id]
  "/articles/segment",               // page is /articles/segment/[key]
  "/articles/workflow",              // pages are /articles/workflow/[transition] + /maintenance
  "/articles/workflow/quality-check",// page is .../quality-check/[articleId]
  "/clients/segment",                // page is /clients/segment/[key]
  "/media/segment",                  // page is /media/segment/[key]
  "/reference",                      // page is /reference/segment/[key]
  "/reference/segment",
  "/campaigns",                      // page is /campaigns/leads
  "/modonty",                        // pages are /modonty/faq + /modonty/pages/[slug]
  "/modonty/pages",                  // page is /modonty/pages/[slug]
  "/social",                         // pages are /social/facebook + /social/instagram
]);

export interface EntityRouteConfig {
  type: 'article' | 'client' | 'category' | 'tag' | 'author' | 'industry' | 'media' | 'user';
  id: string;
  action?: 'view' | 'edit' | 'preview';
  section?: string;
}

const routeLabels: Record<string, string> = {
  articles: 'Articles',
  clients: 'Clients',
  categories: 'Categories',
  industries: 'Industries',
  tags: 'Tags',
  authors: 'Authors',
  media: 'Media',
  users: 'Users',
  subscribers: 'Subscribers',
  analytics: 'Analytics',
  settings: 'Settings',
  'export-data': 'Export Data',
  'system-errors': 'Error Logs',
  guidelines: 'Guidelines',
  new: 'New',
  edit: 'Edit',
  preview: 'Preview',
};

const sectionLabels: Record<string, string> = {
  basic: 'Basic',
  content: 'Content',
  seo: 'SEO',
  media: 'Media',
  tags: 'Tags',
  'seo-validation': 'SEO Validation',
  jsonld: 'JSON-LD',
  meta: 'Meta',
  social: 'Social',
  technical: 'Technical',
  'tags-faq': 'Tags & FAQ',
};

export function isObjectId(str: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parsePathname(pathname: string): string[] {
  return pathname.split('/').filter(Boolean);
}

export function getRouteLabel(segment: string, index: number, segments: string[]): string {
  if (routeLabels[segment]) {
    return routeLabels[segment];
  }

  if (sectionLabels[segment]) {
    return sectionLabels[segment];
  }

  if (segment === 'edit' && index > 0) {
    return 'Edit';
  }

  return capitalize(segment);
}

export function getEntityRouteConfig(segments: string[]): EntityRouteConfig | null {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (isObjectId(segment) && i > 0) {
      const entityType = segments[i - 1] as EntityRouteConfig['type'];
      const validTypes: EntityRouteConfig['type'][] = [
        'article',
        'client',
        'category',
        'tag',
        'author',
        'industry',
        'media',
        'user',
      ];

      if (validTypes.includes(entityType)) {
        const config: EntityRouteConfig = {
          type: entityType,
          id: segment,
        };

        if (i + 1 < segments.length) {
          const nextSegment = segments[i + 1];
          if (nextSegment === 'edit') {
            config.action = 'edit';
            if (i + 2 < segments.length) {
              config.section = segments[i + 2];
            }
          } else if (nextSegment === 'preview') {
            config.action = 'preview';
          } else {
            config.action = 'view';
          }
        } else {
          config.action = 'view';
        }

        return config;
      }
    }
  }

  return null;
}

export function generateBreadcrumbs(
  pathname: string,
  getEntityName?: (type: string, id: string) => string | undefined,
): BreadcrumbItem[] {
  const segments = parsePathname(pathname);
  const items: BreadcrumbItem[] = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    if (isObjectId(segment) && i > 0) {
      const entityType = segments[i - 1];
      const entityName = getEntityName?.(entityType, segment);

      items.push({
        label: entityName || `${capitalize(entityType)} ${segment.slice(0, 8)}...`,
        href: currentPath,
      });
    } else if (segment === 'edit' && i > 1 && isObjectId(segments[i - 1])) {
      items.push({
        label: 'Edit',
        href: currentPath,
      });
    } else if (sectionLabels[segment] && i > 2 && segments[i - 2] === 'edit') {
      items.push({
        label: sectionLabels[segment],
        href: currentPath,
      });
    } else {
      const label = getRouteLabel(segment, i, segments);
      items.push({
        label,
        href: currentPath,
        disabled: NON_NAVIGABLE_PATHS.has(currentPath),
      });
    }
  }

  return items;
}