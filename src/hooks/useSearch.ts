import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { discoveryApi } from '../api';
import { Product } from '../domain/Product';
import { Store } from '../domain/Store';

interface SearchParams {
  lat: number;
  lng: number;
}

interface SearchResults {
  products: Product[];
  stores: Store[];
}

/**
 * Custom hook for searching products and stores with debounced input.
 * Calls GET /discovery/search?q=...&lat=...&lng=...
 */
export const useSearch = (query: string, params: SearchParams) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the search query by 400ms
  useEffect(() => {
    if (query.trim().length === 0) {
      setDebouncedQuery('');
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<SearchResults>({
    queryKey: ['search', debouncedQuery, params.lat, params.lng],
    queryFn: () =>
      discoveryApi.search({
        q: debouncedQuery,
        lat: params.lat,
        lng: params.lng,
        limit: 30,
      }),
    enabled: debouncedQuery.length >= 2, // Only search when 2+ chars typed
    staleTime: 1000 * 60, // Cache results for 1 minute
    gcTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // Keep previous data while loading new results
  });

  const isSearchActive = query.trim().length > 0;
  const isSearching = isSearchActive && (isFetching || debouncedQuery !== query.trim());

  return {
    products: data?.products ?? [],
    stores: data?.stores ?? [],
    isSearchActive,
    isSearching,
    isLoading,
    isError,
    error,
  };
};
