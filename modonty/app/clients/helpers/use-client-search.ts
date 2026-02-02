'use client';

import { useState, useMemo } from 'react';
import { useDebounce } from '@/lib/hooks/use-debounce';

export function useClientSearch<T extends { 
  name: string; 
  legalName?: string; 
  description?: string 
}>(clients: T[]) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return clients;
    
    const lowerQuery = debouncedQuery.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(lowerQuery) ||
      client.legalName?.toLowerCase().includes(lowerQuery) ||
      client.description?.toLowerCase().includes(lowerQuery)
    );
  }, [clients, debouncedQuery]);

  return { filtered, query, setQuery, resultsCount: filtered.length };
}
