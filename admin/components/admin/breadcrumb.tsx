'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronRight } from 'lucide-react';
import { useMemo, useEffect, useState, useRef } from 'react';
import { generateBreadcrumbs, parsePathname, isObjectId } from './breadcrumb-utils';
import { useEntityName } from './use-entity-name';

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

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Go to dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.href}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            {isLast ? (
              <span className="text-foreground font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
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