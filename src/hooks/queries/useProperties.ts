import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type {
  Property,
  PropertyCreate,
  PropertyUpdate,
  PropertyImageUploadPayload,
  PropertyImageUploadResponse,
  BoostListingPayload,
  BoostListingResponse,
  RenewListingPayload
} from "@/lib/api/types";

export function useProperty(id: number) {
  return useQuery({
    queryKey: ["properties", id],
    queryFn: () =>
      apiClient.request<Property>({
        method: "GET",
        path: `/properties/${id}`
      }),
    enabled: id > 0
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ["properties", "mine"],
    queryFn: () =>
      apiClient.request<Property[]>({
        method: "GET",
        path: "/properties/me"
      })
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PropertyCreate) =>
      apiClient.request<Property>({
        method: "POST",
        path: "/properties",
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
    }
  });
}

export function useUpdateProperty(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PropertyUpdate) =>
      apiClient.request<Property>({
        method: "PUT",
        path: `/properties/${id}`,
        body: payload
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", id] });
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
    }
  });
}

export function useDeleteProperty(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.request<{ message: string }>({
        method: "DELETE",
        path: `/properties/${id}`
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
    }
  });
}

export function useUploadPropertyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      payload
    }: {
      propertyId: number;
      payload: PropertyImageUploadPayload;
    }) =>
      apiClient.request<PropertyImageUploadResponse>({
        method: "POST",
        path: `/properties/${propertyId}/images`,
        body: payload
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId]
      });
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
    }
  });
}

export function useBoostListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      payload
    }: {
      propertyId: number;
      payload: BoostListingPayload;
    }) =>
      apiClient.request<BoostListingResponse>({
        method: "POST",
        path: `/properties/${propertyId}/boost`,
        body: payload
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId]
      });
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}

export function useRenewListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      payload
    }: {
      propertyId: number;
      payload: RenewListingPayload;
    }) =>
      apiClient.request<Property>({
        method: "POST",
        path: `/properties/${propertyId}/renew`,
        body: payload
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["properties", variables.propertyId]
      });
      queryClient.invalidateQueries({ queryKey: ["properties", "mine"] });
    }
  });
}
