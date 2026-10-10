'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { useMemo, useEffect, useState, useRef } from 'react';
import { generateBreadcrumbs, parsePathname, isObjectId } from './breadcrumb-utils';
import { useEntityName } from './use-entity-name';

const MAX_VISIBLE = 2;

export function Breadcrumb() {
  const pathname = usePathname();
  const { getEntityName } = useEntityName();
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});
  const entityNamesRef = useRef<Record<string, string>>({});
  const requestedRef = useRef<Set<string>>(new Set());

  const segments = useMemo(() => parsePathname(pathname), [pathname]);

  useEffect(() => {
    entityNamesRef.current = entityNames;
  }, [entityNames]);

  useEffect(() => {
    const fetchEntityNames = async () => {
      const entityRequests: Array<{ type: string; id: string; cacheKey: string }> = [];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (isObjectId(segment) && i > 0) {
          const entityType = segments[i - 1];
          const cacheKey = `${entityType}:${segment}`;
          
          if (!entityNamesRef.current[cacheKey] && !requestedRef.current.has(cacheKey)) {
            requestedRef.current.add(cacheKey);
            entityRequests.push({ type: entityType, id: segment, cacheKey });
          }
        }
      }

      if (entityRequests.length === 0) {
        return;
      }

      const names: Record<string, string> = {};
      
      for (const { type, id, cacheKey } of entityRequests) {
        try {
          const name = await getEntityName(type, id);
          if (name) {
            names[cacheKey] = name;
          }
        } catch (error) {
          console.error(`Error fetching entity name for ${cacheKey}:`, error);
        }
      }

      if (Object.keys(names).length > 0) {
        setEntityNames((prev) => ({ ...prev, ...names }));
      }
    };

    fetchEntityNames();
  }, [segments, getEntityName]);

  const items = useMemo(() => {
    const getName = (type: string, id: string) => {
      const cacheKey = `${type}:${id}`;
      return entityNames[cacheKey];
    };

    return generateBreadcrumbs(pathname, getName);
  }, [pathname, entityNames]);

  if (items.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Go to dashboard"
        >
          <Home className="h-4 w-4" />
        </Link>
      </nav>
    );
  }

  // الرأس مزدحم بالقوائم: على ١٢٨٠ يبقى للفتات ~١٧٥px (قيس ١٠ أكتوبر ٢٠٢٦). فيظهر المستوى الحالي،
  // والذي قبله من 2xl فقط، وما قبلهما «…» يرجع مستوى واحداً ويحمل المسار كاملاً في التلميح —
  // بدل أن يلتفّ الفتات على أربعة أسطر داخل رأس بارتفاع ثابت.
  const hidden = items.length > MAX_VISIBLE ? items.slice(0, items.length - MAX_VISIBLE) : [];
  const visible = items.slice(hidden.length);
  const backTo = [...items.slice(0, -1)].reverse().find((i) => !i.disabled);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 whitespace-nowrap text-sm">
      <Link
        href="/"
        className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Go to dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.length > 1 && (
        <div className={`${hidden.length > 0 ? 'flex' : 'flex 2xl:hidden'} shrink-0 items-center gap-2`}>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          <Link
            href={backTo?.href ?? '/'}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={items.slice(0, -1).map((i) => i.label).join(' › ')}
          >
            …
          </Link>
        </div>
      )}
      {visible.map((item, index) => {
        const isLast = index === visible.length - 1;
        return (
          <div key={`${item.href}-${index}`} className={`${isLast ? 'flex' : 'hidden 2xl:flex'} min-w-0 items-center gap-2`}>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            {isLast ? (
              <span className="max-w-[14rem] truncate text-foreground font-medium" aria-current="page" title={item.label}>
                {item.label}
              </span>
            ) : item.disabled ? (
              <span className="max-w-[12rem] truncate text-muted-foreground/70 cursor-default select-none" title={item.label}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="max-w-[12rem] truncate text-muted-foreground hover:text-foreground transition-colors"
                title={item.label}
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}