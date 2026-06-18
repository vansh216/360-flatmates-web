import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockRequest = vi.fn();
vi.mock("@/lib/api", () => ({
  apiClient: { request: (...args: unknown[]) => mockRequest(...args) }
}));

import {
  useVisits,
  useCreateVisit,
  useCancelVisit
} from "@/hooks/queries/useVisits";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useVisits hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useVisits(filters)", () => {
    it("uses query key ['visits', filters]", async () => {
      const mockVisits = {
        visits: [
          {
            id: 1,
            property_id: 301,
            visit_context: "property_tour",
            scheduled_date: "2026-06-01",
            status: "confirmed"
          }
        ],
        total: 1
      };
      mockRequest.mockResolvedValue(mockVisits);

      const filters = { status: "confirmed" as const };
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      renderHook(() => useVisits(filters), { wrapper });
      await waitFor(() => expect(mockRequest).toHaveBeenCalled());

      const cache = queryClient.getQueryData(["visits", filters]);
      expect(cache).toEqual(mockVisits);
    });

    it("requests GET /visits with filters", async () => {
      mockRequest.mockResolvedValue({ visits: [], total: 0 });

      const filters = { upcoming: true, limit: 10 };
      renderHook(() => useVisits(filters), { wrapper: createWrapper() });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.path).toBe("/visits");
      expect(call.query).toEqual(filters);
    });

    it("works without filters", async () => {
      mockRequest.mockResolvedValue({ visits: [], total: 0 });

      renderHook(() => useVisits(), { wrapper: createWrapper() });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.path).toBe("/visits");
    });
  });

  describe("useCreateVisit", () => {
    it("invalidates ['visits'] on success", async () => {
      mockRequest.mockResolvedValue({
        id: 10,
        property_id: 301,
        visit_context: "property_tour",
        scheduled_date: "2026-06-01",
        status: "requested"
      });

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useCreateVisit(), { wrapper });

      result.current.mutate({
        property_id: 301,
        scheduled_date: "2026-06-01"
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["visits"] });
    });

    it("sends POST /visits", async () => {
      mockRequest.mockResolvedValue({
        id: 10,
        property_id: 301,
        visit_context: "property_tour",
        scheduled_date: "2026-06-01",
        status: "requested"
      });

      const payload = {
        property_id: 301,
        scheduled_date: "2026-06-01",
        visit_context: "property_tour" as const
      };
      const { result } = renderHook(() => useCreateVisit(), {
        wrapper: createWrapper()
      });

      result.current.mutate(payload);

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.method).toBe("POST");
      expect(call.path).toBe("/visits");
      expect(call.body).toEqual(payload);
    });
  });

  describe("useCancelVisit(id)", () => {
    it("invalidates ['visits'] on success", async () => {
      mockRequest.mockResolvedValue({
        id: 10,
        property_id: 301,
        visit_context: "property_tour",
        scheduled_date: "2026-06-01",
        status: "cancelled"
      });

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
      const { result } = renderHook(() => useCancelVisit(10), { wrapper });

      result.current.mutate({ reason: "Schedule conflict" });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["visits"] });
    });

    it("sends POST /visits/{id}/cancel", async () => {
      mockRequest.mockResolvedValue({
        id: 10,
        property_id: 301,
        visit_context: "property_tour",
        scheduled_date: "2026-06-01",
        status: "cancelled"
      });

      const { result } = renderHook(() => useCancelVisit(10), {
        wrapper: createWrapper()
      });

      result.current.mutate({ reason: "Conflict" });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.method).toBe("POST");
      expect(call.path).toBe("/visits/10/cancel");
    });
  });
});
