/**
 * Neighborhood / area data for each supported city.
 *
 * Source of truth for the programmatic neighborhood/area pages served at
 * `/cities/:slug/:neighborhood` (see `src/pages/public/NeighborhoodPage.tsx`
 * and the route in `src/App.tsx`).
 *
 * Both build-time consumers — `scripts/generate-sitemap.ts` (emits the URLs)
 * and `scripts/prerender.ts` (renders the pages) — read this file, so the
 * sitemap and the prerendered output always cover the same set.
 *
 * The neighborhood names below are kept in sync with the lists already
 * shown publicly on `src/pages/public/CityPage.tsx` so SEO copy and on-page
 * copy never diverge.
 */

export interface Neighborhood {
  /** URL-safe slug, e.g. "koramangala". */
  slug: string;
  /** Display name, e.g. "Koramangala". */
  name: string;
  /** Short, factual descriptor used for meta copy / llms context. */
  blurb: string;
}

export interface CityNeighborhoods {
  /** Matches a slug in {@link SUPPORTED_CITIES}. */
  citySlug: string;
  neighborhoods: Neighborhood[];
}

/**
 * Neighborhoods grouped by city slug. Keys correspond to
 * `SUPPORTED_CITIES` slugs ("bangalore", "gurugram").
 */
export const CITY_NEIGHBORHOODS: readonly CityNeighborhoods[] = [
  {
    citySlug: "bangalore",
    neighborhoods: [
      {
        slug: "koramangala",
        name: "Koramangala",
        blurb: "Popular startup-and-cafés hub in south-east Bangalore.",
      },
      {
        slug: "indiranagar",
        name: "Indiranagar",
        blurb: "Leafy, well-connected neighbourhood known for dining and nightlife.",
      },
      {
        slug: "whitefield",
        name: "Whitefield",
        blurb: "Major IT corridor and residential area in east Bangalore.",
      },
      {
        slug: "electronic-city",
        name: "Electronic City",
        blurb: "Large tech park cluster in south Bangalore.",
      },
      {
        slug: "hsr-layout",
        name: "HSR Layout",
        blurb: "Planned locality near Sarjapur popular with young professionals.",
      },
      {
        slug: "jayanagar",
        name: "Jayanagar",
        blurb: "Established residential and commercial area in south Bangalore.",
      },
      {
        slug: "btm-layout",
        name: "BTM Layout",
        blurb: "Affordable, student- and professional-friendly south Bangalore locality.",
      },
      {
        slug: "marathahalli",
        name: "Marathahalli",
        blurb: "Well-connected eastern suburb near Outer Ring Road tech offices.",
      },
      {
        slug: "bellandur",
        name: "Bellandur",
        blurb: "Outer Ring Road tech belt locality in south-east Bangalore.",
      },
      {
        slug: "hebbal",
        name: "Hebbal",
        blurb: "Northern Bangalore locality near Manyata Tech Park and the lake.",
      },
    ],
  },
  {
    citySlug: "gurugram",
    neighborhoods: [
      {
        slug: "dlf-phase-1-5",
        name: "DLF Phase 1-5",
        blurb: "Premium residential and commercial sectors in central Gurugram.",
      },
      {
        slug: "golf-course-road",
        name: "Golf Course Road",
        blurb: "Premium residential and corporate stretch in Gurugram.",
      },
      {
        slug: "sector-29",
        name: "Sector 29",
        blurb: "Hub for dining, breweries, and offices in Gurugram.",
      },
      {
        slug: "mg-road",
        name: "MG Road",
        blurb: "Central commercial and residential corridor in Gurugram.",
      },
      {
        slug: "sohna-road",
        name: "Sohna Road",
        blurb: "Growing residential and commercial corridor in south Gurugram.",
      },
      {
        slug: "cyber-city",
        name: "Cyber City",
        blurb: "Premier corporate park and surrounding residential cluster.",
      },
    ],
  },
] as const;

/** All neighborhoods for a given city slug (empty if the city is unsupported). */
export function getNeighborhoodsForCity(citySlug: string): readonly Neighborhood[] {
  return CITY_NEIGHBORHOODS.find((c) => c.citySlug === citySlug)?.neighborhoods ?? [];
}
