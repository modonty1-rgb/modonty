export interface BreadcrumbItem {
  label: string;
  href: string;
}

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
      });
    }
  }

  return items;
}