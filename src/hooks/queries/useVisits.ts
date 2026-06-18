import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  Visit,
  VisitList,
  VisitCreate,
  VisitUpdate,
  VisitCancel,
  VisitFilters
} from "@/lib/api/types";
import type { QueryValue } from "@/lib/api/client";

export function useVisits(filters?: VisitFilters) {
  return useQuery({
    queryKey: ["visits", filters],
    queryFn: ({ signal }) =>
      apiClient.request<VisitList>({
        method: "GET",
        path: "/visits",
        query: (filters ?? {}) as Record<string, QueryValue>,
        signal
      })
  });
}

export function useVisit(id: number) {
  return useQuery({
    queryKey: ["visits", id],
    queryFn: ({ signal }) =>
      apiClient.request<Visit>({
        method: "GET",
        path: `/visits/${id}`,
        signal
      }),
    enabled: Number.isFinite(id) && id > 0
  });
}

export function useCreateVisit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VisitCreate) =>
      apiClient.request<Visit>({
        method: "POST",
        path: "/visits",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    }
  });
}

export function useUpdateVisit(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: VisitUpdate) =>
      apiClient.request<Visit>({
        method: "PUT",
        path: `/visits/${id}`,
        body: payload
      }),
    onSuccess: (updated) => {
      // Seed the detail cache with the server response, then invalidate the
      // whole "visits" namespace so the list and calendar reflect the new
      // status/date as well as the detail view.
      queryClient.setQueryData(["visits", id], updated);
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    }
  });
}

export function useCancelVisit(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: VisitCancel) =>
      apiClient.request<Visit>({
        method: "POST",
        path: `/visits/${id}/cancel`,
        body: payload ?? {}
      }),
    onSuccess: (cancelled) => {
      queryClient.setQueryData(["visits", id], cancelled);
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    }
  });
}
