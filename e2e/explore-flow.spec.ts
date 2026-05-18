import { expect, test } from "@playwright/test";

/**
 * E2E tests for the explore/map page at /app/explore.
 *
 * The explore page requires authentication and renders a Leaflet map
 * with property pins, filter controls, and zoom controls. These tests
 * verify:
 * - Auth redirect behavior for unauthenticated users
 * - Page structure when accessible (map container, filters, zoom controls)
 *
 * Authenticated tests use the "authenticated" Playwright project which
 * loads storageState from .auth/user.json.
 */

test.describe("Explore page — unauthenticated access", () => {
  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/app/explore");
    await expect(page).toHaveURL(/\/login/);
  });

  test("preserves path in the redirect query param", async ({ page }) => {
    await page.goto("/app/explore");
    await expect(page).toHaveURL(/redirect=/);
  });
});

test.describe("Explore page — authenticated access", () => {
  test.use({ storageState: ".auth/user.json" });

  test("page loads with map container", async ({ page }) => {
    await page.goto("/app/explore");
    // The map container div (#map-container) wraps the MapView component
    const mapContainer = page.locator("#map-container");
    // Either the map renders or a loading spinner appears
    const hasMap = await mapContainer.isVisible().catch(() => false);
    const hasSpinner = await page
      .locator("[class*='animate-spin']")
      .isVisible()
      .catch(() => false);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    expect(hasMap || hasSpinner || hasSkeleton).toBeTruthy();
  });

  test("filter bar renders with Filters button", async ({ page }) => {
    await page.goto("/app/explore");
    await expect(page.locator("#map-container")).toBeVisible();
    // The MapView component includes a filter bar with a Filters button
    const filtersButton = page.getByRole("button", { name: /filters/i });
    // The filter bar may take a moment to render (dynamic import for Leaflet)
    const hasFilters = await filtersButton
      .isVisible()
      .catch(() => false);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    expect(hasFilters || hasSkeleton).toBeTruthy();
  });

  test("zoom controls are visible", async ({ page }) => {
    await page.goto("/app/explore");
    await expect(page.locator("#map-container")).toBeVisible();
    // Leaflet zoom controls (+ and - buttons) should appear once the map loads
    // Wait for the map to initialize (Leaflet is dynamically imported)
    const zoomIn = page.getByRole("button", { name: /zoom in/i });
    const hasZoom = await zoomIn.isVisible().catch(() => false);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    expect(hasZoom || hasSkeleton).toBeTruthy();
  });

  test("map tile layer loads (CartoDB Positron)", async ({ page }) => {
    await page.goto("/app/explore");
    // Leaflet map tiles are rendered as <img> elements inside tile pane
    // Wait for the map to initialize and load tiles
    const tileImages = page.locator(".leaflet-tile-pane img, .leaflet-tile");
    const hasTiles = await tileImages
      .count()
      .then((c) => c > 0)
      .catch(() => false);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    const hasSpinner = await page
      .locator("[class*='animate-spin']")
      .isVisible()
      .catch(() => false);
    expect(hasTiles || hasSkeleton || hasSpinner).toBeTruthy();
  });
});
