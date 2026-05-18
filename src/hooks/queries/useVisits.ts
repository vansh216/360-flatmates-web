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
    queryFn: () =>
      apiClient.request<VisitList>({
        method: "GET",
        path: "/visits",
        query: (filters ?? {}) as Record<string, QueryValue>
      })
  });
}

export function useVisit(id: number) {
  return useQuery({
    queryKey: ["visits", id],
    queryFn: () =>
      apiClient.request<Visit>({
        method: "GET",
        path: `/visits/${id}`
      }),
    enabled: id > 0
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits", id] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits", id] });
    }
  });
}
