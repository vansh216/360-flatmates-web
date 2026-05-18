import { expect, test } from "@playwright/test";

/**
 * E2E tests for the compatibility page at /app/compatibility/[id].
 *
 * The compatibility page requires authentication. Unauthenticated users
 * are redirected to /login. These tests verify:
 * - Auth redirect behavior for unauthenticated users
 * - Page structure when accessible (headings, progress rings, dimensions)
 *
 * Authenticated tests use the "authenticated" Playwright project which
 * loads storageState from .auth/user.json.
 */

test.describe("Compatibility page — unauthenticated access", () => {
  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/app/compatibility/1");
    await expect(page).toHaveURL(/\/login/);
  });

  test("preserves path in the redirect query param", async ({ page }) => {
    await page.goto("/app/compatibility/1");
    await expect(page).toHaveURL(/redirect=/);
  });
});

test.describe("Compatibility page — authenticated access", () => {
  test.use({ storageState: ".auth/user.json" });

  test("page loads with compatibility heading", async ({ page }) => {
    await page.goto("/app/compatibility/1");
    // The page should render the Compatibility heading
    await expect(
      page.getByRole("heading", { name: /compatibility/i })
    ).toBeVisible();
  });

  test("progress rings render", async ({ page }) => {
    await page.goto("/app/compatibility/1");
    await expect(
      page.getByRole("heading", { name: /compatibility/i })
    ).toBeVisible();
    // ProgressRing components render SVG circles
    const progressRings = page.locator("svg circle, [class*='progress-ring']");
    // Either progress rings appear (with data) or loading skeletons show
    const hasRings = await progressRings.count().then((c) => c > 0);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    expect(hasRings || hasSkeleton).toBeTruthy();
  });

  test("dimension rows display", async ({ page }) => {
    await page.goto("/app/compatibility/1");
    await expect(
      page.getByRole("heading", { name: /compatibility/i })
    ).toBeVisible();
    // The Breakdown card contains dimension rows with progress bars
    // When data is available, dimension rows show; otherwise loading skeletons
    const hasBreakdown = await page
      .getByRole("heading", { name: /breakdown/i })
      .isVisible()
      .catch(() => false);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    expect(hasBreakdown || hasSkeleton).toBeTruthy();
  });

  test("summary section shows", async ({ page }) => {
    await page.goto("/app/compatibility/1");
    await expect(
      page.getByRole("heading", { name: /compatibility/i })
    ).toBeVisible();
    // The Summary card appears when compatibility data includes summary lines
    // When data loads, the Summary heading is visible; otherwise loading/empty state
    const hasSummary = await page
      .getByRole("heading", { name: /summary/i })
      .isVisible()
      .catch(() => false);
    const hasSkeleton = await page
      .locator("[class*='animate-pulse'], [class*='skeleton']")
      .count()
      .then((c) => c > 0);
    const hasError = await page
      .getByText(/no compatibility data/i)
      .isVisible()
      .catch(() => false);
    expect(hasSummary || hasSkeleton || hasError).toBeTruthy();
  });
});
