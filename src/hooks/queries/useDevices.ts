import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useRegisterDeviceMutation() {
  return useMutation({
    mutationFn: (payload: { device_token: string; platform?: string }) =>
      apiClient.request<{ message: string }>({
        method: "POST",
        path: "/notifications/devices/register",
        body: {
          token: payload.device_token,
          platform: payload.platform ?? "web"
        }
      })
  });
}

export function useUnregisterDeviceMutation() {
  return useMutation({
    mutationFn: (payload: { device_token: string }) =>
      apiClient.request<{ message: string }>({
        method: "DELETE",
        path: "/notifications/devices/unregister",
        query: { token: payload.device_token }
      })
  });
}
