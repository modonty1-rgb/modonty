'use client';

import { useState, useCallback, useRef } from 'react';
import { getEntityName } from './breadcrumb-actions';

interface EntityCache {
  [key: string]: string;
}

export function useEntityName() {
  const cacheRef = useRef<EntityCache>({});
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());
  const fetchQueueRef = useRef<Map<string, Promise<string | null>>>(new Map());

  const getEntityNameCached = useCallback(
    async (type: string, id: string): Promise<string | undefined> => {
      const cacheKey = `${type}:${id}`;

      if (cacheRef.current[cacheKey]) {
        return cacheRef.current[cacheKey];
      }

      const existingPromise = fetchQueueRef.current.get(cacheKey);
      if (existingPromise) {
        const result = await existingPromise;
        return result || undefined;
      }

      setLoadingSet((prev) => new Set(prev).add(cacheKey));

      const fetchPromise = getEntityName(type, id);
      fetchQueueRef.current.set(cacheKey, fetchPromise);

      try {
        const name = await fetchPromise;

        if (name) {
          cacheRef.current[cacheKey] = name;
          setLoadingSet((prev) => {
            const next = new Set(prev);
            next.delete(cacheKey);
            return next;
          });
          fetchQueueRef.current.delete(cacheKey);
          return name;
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} name:`, error);
      } finally {
        setLoadingSet((prev) => {
          const next = new Set(prev);
          next.delete(cacheKey);
          return next;
        });
        fetchQueueRef.current.delete(cacheKey);
      }

      return undefined;
    },
    [],
  );

  return {
    getEntityName: getEntityNameCached,
    isLoading: loadingSet.size > 0,
  };
}