import { ApiClientError } from "./errors";
import type {
  ApiAdapter,
  ApiRequest,
  QueryValue
} from "./client";
import {
  createMockCompatibility,
  createMockWebSearchResponse,
  mockBootstrap,
  mockCatalogs,
  mockCityStats,
  mockCurrentProfile,
  mockListings,
  mockPeers,
  mockSavedSearches,
  mockSearchAlerts
} from "./mock-data";
import type {
  FlatmatesProfile,
  FlatmatesBootstrap,
  FlatmatesPeer,
  Property,
  SavedSearch,
  SavedSearchCreate,
  SearchAlert,
  SearchType,
  SwipeRequest,
  SwipeResult,
  WebSearchResponse
} from "./types";

export interface MockApiSeed {
  profile: FlatmatesProfile;
  peers: FlatmatesPeer[];
  listings: Property[];
  savedSearches: SavedSearch[];
  searchAlerts: SearchAlert[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function notFound(path: string): ApiClientError {
  return new ApiClientError(
    { type: "not_found", message: `No mock route registered for ${path}` },
    404
  );
}

function getFirstQueryValue(value: QueryValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0] === undefined ? undefined : String(value[0]);
  }

  return value === undefined || value === null ? undefined : String(value);
}

export class MockApiClient implements ApiAdapter {
  private readonly seed: MockApiSeed;

  constructor(seed: Partial<MockApiSeed> = {}) {
    this.seed = {
      profile: seed.profile ?? mockCurrentProfile,
      peers: seed.peers ?? [...mockPeers],
      listings: seed.listings ?? [...mockListings],
      savedSearches: seed.savedSearches ?? [...mockSavedSearches],
      searchAlerts: seed.searchAlerts ?? [...mockSearchAlerts]
    };
  }

  async request<TResponse, TBody = unknown>({
    method = "GET",
    path,
    query,
    body
  }: ApiRequest<TBody>): Promise<TResponse> {
    const normalizedPath = path.replace(/\/$/, "");

    if (method === "GET" && normalizedPath === "/flatmates/bootstrap") {
      const bootstrap: FlatmatesBootstrap = {
        ...mockBootstrap,
        profile: this.seed.profile,
        catalogs: [...mockCatalogs]
      };
      return clone(bootstrap) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/catalogs") {
      return clone([...mockCatalogs]) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/profile") {
      return clone(this.seed.profile) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/profiles") {
      return clone(this.seed.peers) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/properties") {
      return clone({
        properties: this.seed.listings,
        total: this.seed.listings.length,
        page: 1,
        limit: 20,
        total_pages: 1,
        filters_applied: query ?? {}
      }) as TResponse;
    }

    if (method === "GET" && normalizedPath.startsWith("/properties/")) {
      const id = Number(normalizedPath.split("/").at(-1));
      const listing = this.seed.listings.find((item) => item.id === id);
      if (!listing) {
        throw notFound(normalizedPath);
      }
      return clone(listing) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/web/search") {
      const searchType = getFirstQueryValue(query?.search_type) as
        | SearchType
        | undefined;
      const response: WebSearchResponse = createMockWebSearchResponse(
        searchType ?? "listings"
      );
      return clone(response) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/web/saved-searches") {
      return clone(this.seed.savedSearches) as TResponse;
    }

    if (method === "POST" && normalizedPath === "/flatmates/web/saved-searches") {
      const payload = body as SavedSearchCreate;
      const savedSearch: SavedSearch = {
        id: 900 + this.seed.savedSearches.length,
        user_id: this.seed.profile.id,
        name: payload.name,
        filters: payload.filters,
        alert_enabled: payload.alert_enabled ?? false,
        alert_frequency: payload.alert_frequency ?? "daily",
        alert_channels: payload.alert_channels ?? ["in_app"],
        new_results_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.seed.savedSearches = [...this.seed.savedSearches, savedSearch];
      return clone(savedSearch) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/web/alerts") {
      return clone(this.seed.searchAlerts) as TResponse;
    }

    if (method === "GET" && normalizedPath === "/flatmates/web/stats") {
      return clone([...mockCityStats]) as TResponse;
    }

    if (
      method === "GET" &&
      normalizedPath.startsWith("/flatmates/web/compatibility/")
    ) {
      const peerId = Number(normalizedPath.split("/").at(-1));
      return clone(createMockCompatibility(peerId)) as TResponse;
    }

    if (method === "POST" && normalizedPath === "/flatmates/swipes") {
      const payload = body as SwipeRequest;
      const result: SwipeResult = {
        stored: true,
        action: payload.action,
        target_type: payload.target_type,
        did_match: payload.action !== "pass" && payload.target_user_id === 202,
        match_id: payload.action !== "pass" ? 700 : undefined,
        conversation_id: payload.action !== "pass" ? 800 : undefined
      };
      return clone(result) as TResponse;
    }

    throw notFound(normalizedPath);
  }
}

export function createMockApiClient(seed: Partial<MockApiSeed> = {}): ApiAdapter {
  return new MockApiClient(seed);
}
