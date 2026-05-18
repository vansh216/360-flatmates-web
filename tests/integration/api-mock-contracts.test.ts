import { describe, expect, it } from "vitest";
import { createMockApiClient } from "@/lib/api/mock-client";
import { mockListings, mockPeers } from "@/lib/api/mock-data";
import type {
  CompatibilityBreakdown,
  FlatmatesBootstrap,
  SavedSearch,
  WebSearchResponse
} from "@/lib/api/types";
import {
  flatmatesPeerSchema,
  flatmatesProfileSchema,
  propertySchema,
  savedSearchSchema,
  webSearchResponseSchema
} from "@/lib/schemas";

describe("mock API contracts", () => {
  it("keeps seeded profile, peer, and listing data parseable by schemas", () => {
    expect(() => flatmatesPeerSchema.array().parse(mockPeers)).not.toThrow();
    expect(() => propertySchema.array().parse(mockListings)).not.toThrow();
  });

  it("serves bootstrap and search responses through the API adapter seam", async () => {
    const client = createMockApiClient();

    const bootstrap = await client.request<FlatmatesBootstrap>({
      path: "/flatmates/bootstrap"
    });
    expect(flatmatesProfileSchema.parse(bootstrap.profile).id).toBe(101);
    expect(bootstrap.catalogs.map((catalog) => catalog.key)).toContain(
      "quiz_dimensions"
    );

    const search = await client.request<WebSearchResponse>({
      path: "/flatmates/web/search",
      query: { search_type: "all" }
    });
    const parsedSearch = webSearchResponseSchema.parse(search);

    expect(parsedSearch.search_type).toBe("all");
    expect(parsedSearch.results).toHaveLength(mockListings.length + mockPeers.length);
  });

  it("creates saved searches with OpenAPI-compatible defaults", async () => {
    const client = createMockApiClient();
    const savedSearch = await client.request<SavedSearch>({
      method: "POST",
      path: "/flatmates/web/saved-searches",
      body: {
        name: "HSR under 30k",
        filters: {
          q: "HSR",
          search_type: "listings",
          city: "Bangalore",
          price_max: 30000,
          radius: 5,
          purpose: "rent",
          sort_by: "newest",
          page: 1,
          limit: 20
        }
      }
    });

    const parsed = savedSearchSchema.parse(savedSearch);

    expect(parsed.alert_enabled).toBe(false);
    expect(parsed.alert_frequency).toBe("daily");
    expect(parsed.alert_channels).toEqual(["in_app"]);
  });

  it("returns a six-dimension compatibility breakdown for a peer", async () => {
    const client = createMockApiClient();
    const breakdown = await client.request<CompatibilityBreakdown>({
      path: "/flatmates/web/compatibility/202"
    });

    expect(breakdown.peer_id).toBe(202);
    expect(breakdown.overall_percentage).toBe(100);
    expect(breakdown.color).toBe("green");
    expect(breakdown.dimensions.map((dimension) => dimension.name)).toEqual([
      "sleep_schedule",
      "cleanliness",
      "food_habits",
      "smoking_drinking",
      "guests_policy",
      "work_style"
    ]);
  });
});

