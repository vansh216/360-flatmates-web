import { expect, test } from "@playwright/test";

test("public discovery opens the unauthenticated contact wall", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Find Your Flatmate/i })).toBeVisible();
  await page.getByRole("link", { name: "Get Started" }).first().click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(page.getByRole("heading", { name: "Browse Listings" })).toBeVisible();

  await page.getByRole("button", { name: "Contact" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Sign in to continue" });
  await expect(dialog).toBeVisible();
  await dialog.getByPlaceholder("98765 43210").fill("9876543210");
  await dialog.getByRole("button", { name: "Continue with OTP", exact: true }).click();
  await expect(dialog.getByText("6 digit OTP")).toBeVisible();
});

test("search filters can save reusable alerts", async ({ page }) => {
  await page.goto("/search");

  await expect(page.getByRole("heading", { name: "Search Flatmates & Rooms" })).toBeVisible();
  await page.getByRole("button", { name: "Mumbai" }).click();
  await page.getByRole("button", { name: "Save this search" }).click();

  const dialog = page.getByRole("dialog", { name: "Save this search" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Search name")).toHaveValue("My Koramangala Search");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).toBeHidden();
});

test("login OTP continues into the full onboarding path", async ({ page }) => {
  await page.goto("/login");

  await page.getByPlaceholder("98765 43210").fill("9876543210");
  await page.getByRole("button", { name: "Continue with OTP", exact: true }).click();
  await page.getByLabel("6 digit OTP").fill("123456");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();

  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/\/onboarding\/mode$/);
  for (const route of ["location", "basic-info", "photo", "lifestyle", "budget", "preferences"]) {
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/onboarding/${route}$`));
  }
  await expect(page.getByRole("heading", { name: "Preferences & Non-Negotiables" })).toBeVisible();
  await page.getByRole("button", { name: "Complete Setup" }).click();
  await expect(page).toHaveURL(/\/home$/);
});

test("swipe interactions open match and profile detail states", async ({ page }) => {
  await page.goto("/swipe");

  const deck = page.getByRole("region", { name: /Profile cards/i });
  await expect(deck).toBeVisible();
  await deck.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("heading", { name: "It is a Match!" })).toBeVisible();
  await page.getByRole("button", { name: "Keep Swiping" }).click();

  await deck.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("heading", { name: "Compatibility Breakdown" })).toBeVisible();
});

test("chat supports visit scheduling and live draft send", async ({ page }) => {
  await page.goto("/chats/c-priya");

  await expect(page.getByText("SSE connected, messages are live")).toBeVisible();
  await page.getByRole("button", { name: "Schedule visit" }).click();
  await expect(page.getByRole("heading", { name: "Schedule Visit" })).toBeVisible();
  await page.getByRole("button", { name: "Send Request" }).click();
  await expect(page.getByRole("heading", { name: "Schedule Visit" })).toBeHidden();

  await page.getByPlaceholder("Type a message...").fill("Can I visit this weekend?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Can I visit this weekend?")).toBeVisible();
});

test("listing builder submits into moderation review", async ({ page }) => {
  await page.goto("/post");

  await expect(page.getByRole("heading", { name: "Location" })).toBeVisible();
  for (let step = 0; step < 7; step += 1) {
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(page.getByRole("heading", { name: "Review" })).toBeVisible();
  await page.getByRole("button", { name: "Publish Listing" }).click();
  await expect(page).toHaveURL(/\/post\/review$/);
  await expect(page.getByRole("heading", { name: "Under Review" })).toBeVisible();
});

test("settings apply theme and palette tokens", async ({ page }) => {
  await page.goto("/settings");

  await page.getByRole("button", { name: "dark", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "monsoon teal", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-palette", "monsoon_teal");
});

test("admin moderation list links into prescreen and reports workflows", async ({ page }) => {
  await page.goto("/admin/moderation/listings");

  await expect(page.getByRole("heading", { name: "Listing Review Queue" })).toBeVisible();
  await page.getByRole("link", { name: "Prescreen" }).first().click();
  await expect(page).toHaveURL(/\/admin\/moderation\/prescreen\/.+/);
  await expect(page.getByRole("heading", { name: "AI check results" })).toBeVisible();

  await page.goto("/admin/moderation/reports");
  await expect(page.getByRole("heading", { name: "Report Review Queue" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Suspend" }).first()).toBeVisible();
});
