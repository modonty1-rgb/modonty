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
]);

export interface EntityRouteConfig {
  type: 'article' | 'client' | 'category' | 'tag' | 'author' | 'industry' | 'media' | 'user';
  id: string;
  action?: 'view' | 'edit' | 'preview';
  section?: string;
}

const routeLabels: Record<string, string> = {
  articles: 'المقالات',
  briefs: 'Content Briefs',
  clients: 'العملاء',
  categories: 'Categories',
  industries: 'Industries',
  tags: 'Tags',
  authors: 'Authors',
  media: 'الوسائط',
  users: 'Users',
  subscribers: 'مشتركو العملاء',
  analytics: 'التحاليل',
  settings: 'Settings',
  'export-data': 'Export Data',
  'system-errors': 'Error Logs',
  guidelines: 'Guidelines',
  new: 'New',
  edit: 'Edit',
  preview: 'Preview',
  // The two article pages renamed on 27 Sep 2026 — the crumb read «Clients-guide» from the URL.
  'clients-guide': 'Client Quotas',
  'client-articles': 'Client-Site Articles',
  // الحملات الإعلانية شاشة عربية بالكامل (تقارير Meta ولوحة الحملات) — نفس منطق
  // sales-leads تحت: الكسرة الإنجليزية الوحيدة فوق شاشة عربية بالكامل.
  campaigns: 'الحملات الإعلانية',
  reports: 'التقارير',
  // شاشات «إدارة الدفع» عربية بالكامل — والبريدكرَمب كان يسقط على التحويل الآلي فيكتب
  // «Pay-preview» فوق صفحة كل كلمة فيها عربية (خالد ١٣ سبتمبر ٢٠٢٦: «خلّيها عربية»).
  // نفس منطق `campaigns` فوقها: الاسم يتبع لغة الشاشة لا لغة المسار.
  'pay-preview': 'معاينة صفحة الدفع',
  'commercial-plans': 'الباقات والأسعار',
  'commercial-features': 'مكتبة المزايا',
  'payment-failures': 'إخفاقات الدفع',
  // «الاشتراكات» لا «الطلبات» (خالد ١٦ و١٨ سبتمبر ٢٠٢٦): في متجرٍ «طلب» بضاعةٌ
  // تُشحن، ونحن لا نبيع بضاعة — وهو المسمّى نفسه في قائمة المبيعات وفي الصفحة.
  orders: 'الاشتراكات',
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
  // Faten's screens are Arabic end to end (Khalid, 2026-09-04), and the crumb is the first
  // thing above them. Left alone it reads «Sales-leads» — the one English word on an
  // otherwise Arabic page, sitting exactly where the eye lands first.
  'sales-leads': 'العملاء المحتملون',
  'sales-commissions': 'عمولات المناديب',
  kpi: 'KPI',
  'contact-messages': 'رسائل التواصل',
  members: 'الأعضاء',
  segment: 'القوائم',
  reference: 'التصنيفات',
};

/**
 * Segments whose label depends on the section above them. `new` under `sales-leads` is
 * «عميل محتمل جديد»; anywhere else it stays "New". Keyed by parent so one Arabic screen
 * does not rename the crumb on twenty English ones.
 */
const scopedLabels: Record<string, Record<string, string>> = {
  'sales-leads': { new: 'عميل جديد', edit: 'تعديل', 'follow-ups': 'المتابعة' },
  // /clients/[id]/edit — the client pages are Arabic; «edit» elsewhere stays English.
  clients: { edit: 'تعديل' },
  // Dashboard drill-downs (/clients|/articles|/media|/reference/segment/[key]) — Arabic like the pages.
  segment: { 'overdue': 'فواتير غير مدفوعة', 'expired': 'الاشتراك انتهى', 'expiring-soon': 'تنتهي هذا الأسبوع', 'expiring-month': 'تنتهي هذا الشهر', 'pending': 'بانتظار التفعيل', 'form': 'نموذج حجز', 'link': 'رابط خارجي', 'none': 'بلا زر', 'unset': 'الزر ما انضبط', 'active': 'نشط', 'ymyl': 'YMYL', 'standard': 'عادي', 'cancelled': 'ملغي', 'no-articles': 'بلا مقالات', 'has-published': 'نشر مقالات', 'awaiting-approval': 'بانتظار الموافقة', 'content-in-progress': 'المحتوى قيد التنفيذ', 'no-logo': 'بلا شعار', 'no-hero': 'بلا غلاف', 'no-og': 'بلا صورة مشاركة', 'no-image': 'بلا أي صورة', 'no-end-date': 'تاريخ التجديد ناقص', 'no-address': 'بلا عنوان', 'no-social': 'بلا سوشال', 'no-description': 'بلا وصف', 'seo-imperfect': 'فيها نقص سيو', 'seo-perfect': 'سيو كامل', 'unreachable': 'ما يوصلهم الزائر', 'published': 'منشور', 'published-on-client-site': 'على موقع العميل', 'approved': 'معتمد بلا تاريخ', 'scheduled': 'مجدول', 'writing': 'يُكتب', 'draft': 'مسودات', 'needs-revision': 'تحتاج تعديل', 'archived': 'مؤرشف', 'ymyl-uncited': 'YMYL بلا مصادر', 'unused': 'غير مستخدمة', 'no-alt': 'بلا نص بديل', 'failing-seo': 'تفشل في السيو', 'no-dimensions': 'بلا أبعاد', 'categories': 'الفئات', 'tags': 'الوسوم', 'industries': 'الصناعات', 'authors': 'الكتّاب' },
  reports: { modonty: 'مدونتي', jbrseo: 'جبر سيو' },
  // Scoped: /campaigns/leads is a different page with the same segment name.
  analytics: { leads: 'أفعال الزوار' },
  leads: { bookings: 'الحجوزات', questions: 'الأسئلة' },
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
  // The section above wins over the global maps: `new` is a generic word whose right
  // translation depends on where it sits, and only its parent knows that.
  // An id between them (/clients/[id]/edit) is not the section — look one further up.
  const direct = segments[index - 1];
  const parent = direct && isObjectId(direct) ? segments[index - 2] : direct;
  if (parent && scopedLabels[parent]?.[segment]) {
    return scopedLabels[parent][segment];
  }

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
        // Scoped first: /clients/[id]/edit is Arabic (1 Oct 2026); other entities stay English.
        label: scopedLabels[segments[i - 2]]?.edit ?? 'Edit',
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