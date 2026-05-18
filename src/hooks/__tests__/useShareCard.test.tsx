import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockRequest = vi.fn();
vi.mock("@/lib/api", () => ({
  apiClient: { request: (...args: unknown[]) => mockRequest(...args) }
}));

import { useShareCard } from "@/hooks/queries/useShareCard";
import type { ShareCardResponse } from "@/lib/api/types";

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

describe("useShareCard hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useShareCard(listingId, format?)", () => {
    it("uses query key ['share-card', listingId, format]", async () => {
      const mockResponse: ShareCardResponse = {
        card_url: "https://example.com/card.png",
        format: "whatsapp_square"
      };
      mockRequest.mockResolvedValue(mockResponse);

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );

      renderHook(() => useShareCard(99, "whatsapp_square"), { wrapper });
      await waitFor(() => expect(mockRequest).toHaveBeenCalled());

      const cache = queryClient.getQueryData(["share-card", 99, "whatsapp_square"]);
      expect(cache).toEqual(mockResponse);
    });

    it("requests GET /flatmates/web/listings/{listingId}/share-card", async () => {
      mockRequest.mockResolvedValue({
        card_url: "https://example.com/card.png",
        format: "whatsapp_square"
      });

      renderHook(() => useShareCard(55), { wrapper: createWrapper() });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.path).toBe("/flatmates/web/listings/55/share-card");
    });

    it("passes format as query param when provided", async () => {
      mockRequest.mockResolvedValue({
        card_url: "https://example.com/card.png",
        format: "instagram_story"
      });

      renderHook(() => useShareCard(55, "instagram_story"), { wrapper: createWrapper() });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.query).toEqual({ format: "instagram_story" });
    });

    it("omits query param when format is undefined", async () => {
      mockRequest.mockResolvedValue({
        card_url: "https://example.com/card.png",
        format: "whatsapp_square"
      });

      renderHook(() => useShareCard(55), { wrapper: createWrapper() });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      const call = mockRequest.mock.calls[0][0];
      expect(call.query).toBeUndefined();
    });

    it("is enabled when listingId > 0", async () => {
      mockRequest.mockResolvedValue({
        card_url: "https://example.com/card.png",
        format: "whatsapp_square"
      });

      const { result } = renderHook(() => useShareCard(1), {
        wrapper: createWrapper()
      });

      await waitFor(() => expect(mockRequest).toHaveBeenCalled());
      expect(result.current.fetchStatus).toBe("fetching");
    });

    it("is disabled when listingId <= 0", () => {
      mockRequest.mockReturnValue(new Promise(() => {}));
      const { result } = renderHook(() => useShareCard(0), {
        wrapper: createWrapper()
      });
      expect(result.current.fetchStatus).toBe("idle");
    });
  });
});
