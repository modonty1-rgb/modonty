'use client';

import { useState, useMemo } from 'react';

export interface ClientFilters {
  industries: string[];
  articleCountRange: [number, number];
  subscriptionTiers: string[];
}

export function useClientFilters<T extends { 
  industry?: { id: string; name: string }; 
  articleCount: number;
  subscriptionTier?: string;
  isVerified?: boolean;
}>(clients: T[]) {
  const [filters, setFilters] = useState<ClientFilters>({
    industries: [],
    articleCountRange: [0, 50],
    subscriptionTiers: []
  });

  const filtered = useMemo(() => {
    return clients.filter(client => {
      if (filters.industries.length > 0 && !filters.industries.includes(client.industry?.id || '')) {
        return false;
      }

      if (client.articleCount < filters.articleCountRange[0] || 
          client.articleCount > filters.articleCountRange[1]) {
        return false;
      }

      if (filters.subscriptionTiers.length > 0 && 
          !filters.subscriptionTiers.includes(client.subscriptionTier || '')) {
        return false;
      }

      return true;
    });
  }, [clients, filters]);

  const updateFilter = (key: keyof ClientFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      industries: [],
      articleCountRange: [0, 50],
      subscriptionTiers: []
    });
  };

  const hasActiveFilters = 
    filters.industries.length > 0 ||
    filters.articleCountRange[0] > 0 ||
    filters.articleCountRange[1] < 50 ||
    filters.subscriptionTiers.length > 0;

  return { 
    filtered, 
    filters, 
    updateFilter, 
    clearFilters, 
    hasActiveFilters,
    activeFilterCount: [
      filters.industries.length,
      filters.subscriptionTiers.length
    ].reduce((a, b) => a + b, 0)
  };
}
