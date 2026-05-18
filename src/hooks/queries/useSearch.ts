import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  PaginatedPropertyResponse,
  SearchFilters,
  WebSearchResponse,
  SavedSearch,
  SavedSearchCreate,
  SearchAlert,
  SearchAlertCreate
} from "@/lib/api/types";
import type { QueryValue } from "@/lib/api/client";

export function useWebSearch(filters: SearchFilters) {
  return useQuery({
    queryKey: ["search", "web", filters],
    queryFn: async () => {
      const response = await apiClient.request<PaginatedPropertyResponse>({
        method: "GET",
        path: "/properties",
        query: {
          q: filters.q,
          lat: filters.lat,
          lng: filters.lng,
          radius: filters.radius,
          city: filters.city,
          locality: filters.locality,
          price_min: filters.price_min,
          price_max: filters.price_max,
          property_type: filters.property_type,
          purpose: filters.purpose,
          bedrooms_min: filters.bedrooms_min,
          bedrooms_max: filters.bedrooms_max,
          // GET /properties expects singular strings for these fields (not arrays)
          sharing_type: filters.sharing_type?.[0],
          gender_preference: filters.gender_preference?.[0],
          move_in: filters.move_in?.[0],
          available_from: filters.available_from,
          amenities: filters.amenities,
          features: filters.features,
          sort_by: filters.sort_by,
          semantic_search: filters.semantic_search,
          exclude_swiped: filters.exclude_swiped,
          page: filters.page,
          limit: filters.limit,
        } as Record<string, QueryValue>,
      });

      return {
        results: response.properties,
        total: response.total,
        page: response.page,
        limit: response.limit,
        total_pages: response.total_pages,
        search_type: "listings" as const,
        filters_applied: response.filters_applied,
        search_center: response.search_center,
      } satisfies WebSearchResponse;
    },
    enabled: Object.values(filters).some(
      (value) => value !== undefined && value !== null && value !== ""
    )
  });
}

// Saved searches and alerts — endpoints not yet implemented in backend
// Stubs to prevent 404 errors; will be enabled when backend adds these routes

export function useSavedSearches() {
  return useQuery({
    queryKey: ["search", "saved"],
    queryFn: () =>
      apiClient.request<SavedSearch[]>({
        method: "GET",
        path: "/flatmates/web/saved-searches"
      }),
    enabled: false
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SavedSearchCreate) =>
      apiClient.request<SavedSearch>({
        method: "POST",
        path: "/flatmates/web/saved-searches",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "saved"] });
    }
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      apiClient.request<{ message: string }>({
        method: "DELETE",
        path: `/flatmates/web/saved-searches/${id}`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "saved"] });
    }
  });
}

export function useSearchAlerts() {
  return useQuery({
    queryKey: ["search", "alerts"],
    queryFn: () =>
      apiClient.request<SearchAlert[]>({
        method: "GET",
        path: "/flatmates/web/alerts"
      }),
    enabled: false
  });
}

export function useCreateSearchAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SearchAlertCreate) =>
      apiClient.request<SearchAlert>({
        method: "POST",
        path: "/flatmates/web/alerts",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search", "alerts"] });
    }
  });
}
