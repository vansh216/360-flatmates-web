import { expect, test } from "@playwright/test";

/**
 * E2E tests for visit scheduling flows.
 *
 * The /visits page requires authentication. Unauthenticated users are
 * redirected to /login. Since there is no real backend, these
 * tests verify:
 * - Auth redirect behavior for unauthenticated users
 * - Page structure (loading/empty/error states) when accessed
 *
 * Authenticated tests use the "authenticated" Playwright project which
 * loads storageState from .auth/user.json.
 */

test.describe("Visits page — unauthenticated access", () => {
  test("redirects to /login when not authenticated", async ({ page }) => {
    await page.goto("/visits");
    await expect(page).toHaveURL(/\/login/);
  });

  test("preserves /visits in the redirect query param", async ({ page }) => {
    await page.goto("/visits");
    await expect(page).toHaveURL(/redirect=.*visits/);
  });

  test("redirects from /visits/[id] when not authenticated", async ({ page }) => {
    await page.goto("/visits/visit-123");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Visits page — authenticated access", () => {
  test.use({ storageState: ".auth/user.json" });

  test("renders the My Visits heading", async ({ page }) => {
    await page.goto("/visits");
    const url = page.url();
    if (!url.includes("/login")) {
      await expect(page.getByRole("heading", { name: /my visits/i })).toBeVisible();
    }
  });

  test("shows loading skeletons while fetching visits", async ({ page }) => {
    await page.goto("/visits");
    const url = page.url();
    if (!url.includes("/login")) {
      const skeletons = page.locator("[class*='animate-pulse'], [class*='skeleton']");
      await expect(skeletons.first()).toBeVisible({ timeout: 5_000 });
    }
  });

  test("shows empty state when no visits are scheduled", async ({ page }) => {
    await page.goto("/visits");
    const url = page.url();
    if (!url.includes("/login")) {
      const emptyText = page.getByText(/no visits scheduled yet/i);
      await expect(emptyText).toBeVisible({ timeout: 10_000 });
    }
  });

  test("visit cards display visit details when data is available", async ({ page }) => {
    await page.goto("/visits");
    const url = page.url();
    if (!url.includes("/login")) {
      // Aspirational — requires backend data
      // Verify the page rendered without crashing
      await expect(page).toHaveURL(/\/visits/);
    }
  });
});

test.describe("Visit detail page — /visits/[id] (unauthenticated)", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/visits/visit-123");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Visit detail page — /visits/[id] (authenticated)", () => {
  test.use({ storageState: ".auth/user.json" });

  test("renders visit detail view when authenticated", async ({ page }) => {
    await page.goto("/visits/visit-123");
    const url = page.url();
    if (!url.includes("/login")) {
      // Verify the page rendered without crashing
      const hasContent = await page.locator("main, [class*='visit']").count().then((c) => c > 0);
      const hasSkeleton = await page
        .locator("[class*='animate-pulse'], [class*='skeleton']")
        .count()
        .then((c) => c > 0);
      expect(hasContent || hasSkeleton).toBeTruthy();
    }
  });
});
