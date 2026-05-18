/**
 * nuqs parser definitions for URL search params.
 *
 * These parsers define the shape of query-string state for /search and /discover.
 * They enable deep-linking (visiting /search?city=Delhi pre-fills filters) and
 * shareable URLs out of the box.
 *
 * Usage:
 *   import { searchPageParams, discoverPageParams } from "@/lib/schemas/search-params";
 *   const [params, setParams] = useQueryStates(searchPageParams);
 */
import {
  parseAsString,
  parseAsInteger,
  parseAsArrayOf,
} from "nuqs";

// ── Search page params ─────────────────────────────────────────
// URL: /search?q=Delhi&city=1&bedrooms=2&amenities=WiFi,Parking&priceMin=3000&priceMax=15000&page=1

export const searchPageParams = {
  q: parseAsString.withDefault(""),
  city: parseAsInteger.withDefault(0),
  bedrooms: parseAsString.withDefault(""),
  amenities: parseAsArrayOf(parseAsString, ",").withDefault([]),
  priceMin: parseAsInteger,
  priceMax: parseAsInteger,
  page: parseAsInteger.withDefault(1),
};

// ── Discover page params ───────────────────────────────────────
// URL: /discover?city=2&filter=Nearby&page=1

export const discoverPageParams = {
  city: parseAsInteger.withDefault(0),
  filter: parseAsString.withDefault("Nearby"),
  page: parseAsInteger.withDefault(1),
};
