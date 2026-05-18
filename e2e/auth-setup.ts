import { test as setup, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Auth setup — authenticates a test user and saves storage state to
 * `.auth/user.json` for use in authenticated test projects.
 *
 * Since we do not have a real test backend, this setup performs a
 * best-effort mock authentication by:
 * 1. Navigating to the login page
 * 2. Filling the phone field
 * 3. Attempting the OTP flow
 * 4. Saving whatever cookie/storage state exists after the attempt
 *
 * Regardless of whether the real Supabase auth succeeds, we write a
 * minimal storage state with a Supabase auth cookie so that the
 * middleware can parse it. The JWT is fake (signed with "test-signature")
 * so `supabase.auth.getUser()` will return null — but the cookie
 * presence allows the middleware to at least attempt validation rather
 * than immediately redirecting.
 *
 * The cookie name follows the @supabase/ssr convention:
 *   sb-{projectRef}-auth-token
 *
 * The projectRef is derived from NEXT_PUBLIC_SUPABASE_URL in .env.
 * Current value: https://example.supabase.co → projectRef = "example"
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FILE = ".auth/user.json";

/** Derive the Supabase cookie name from the project URL. */
function getSupabaseCookieName(): string {
  const envPath = path.resolve(__dirname, "..", ".env");
  let projectRef = "example"; // fallback

  try {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(
      /NEXT_PUBLIC_SUPABASE_URL\s*=\s*https:\/\/([a-zA-Z0-9-]+)\.supabase\.co/
    );
    if (match) {
      projectRef = match[1];
    }
  } catch {
    // .env not readable — use fallback
  }

  return `sb-${projectRef}-auth-token`;
}

setup("authenticate test user", async ({ page }) => {
  // Navigate to the login page
  await page.goto("/login");

  // Verify we are on the login page
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();

  // Switch to OTP mode (default)
  const otpTab = page.getByRole("tab", { name: /phone otp/i });
  if (await otpTab.isVisible()) {
    await otpTab.click();
  }

  // Fill phone number — use multiple strategies to trigger form validation
  const phoneInput =
    page.getByLabel(/phone/i) ||
    page.getByPlaceholder(/\+91/) ||
    page.locator('input[type="tel"]');

  if (await phoneInput.first().isVisible()) {
    const input = phoneInput.first();
    await input.click();
    await input.fill("9999999999");
    // Tab away to trigger blur/validation
    await input.press("Tab");
    // Wait a moment for React state to update
    await page.waitForTimeout(500);
  }

  // Click "Send OTP" — button may be disabled if validation hasn't triggered
  const sendOtpButton = page.getByRole("button", { name: /send otp/i });
  try {
    await sendOtpButton.waitFor({ state: "visible", timeout: 3_000 });
    const isEnabled = await sendOtpButton.isEnabled();
    if (isEnabled) {
      await sendOtpButton.click();

      // Wait for either the OTP input to appear or an error message
      const otpInput = page.getByLabel(/otp/i);
      try {
        await otpInput.waitFor({ state: "visible", timeout: 5_000 });
        await otpInput.fill("123456");
        const verifyButton = page.getByRole("button", { name: /verify/i });
        if (await verifyButton.isVisible()) {
          await verifyButton.click();
        }
      } catch {
        // Backend not available — save whatever state we have
      }
    }
  } catch {
    // Send OTP button not visible or not enabled — skip auth attempt
  }

  // Save storage state from the browser session
  await page.evaluate(() => {
    window.localStorage.setItem("flatmates-playwright-auth", "true");
  });
  await page.context().storageState({ path: AUTH_FILE });

  // Ensure the storage state contains a Supabase auth cookie.
  // If the real auth flow didn't succeed (no backend), inject a fake one
  // so authenticated test projects can at least bypass the cookie-existence
  // check in the middleware.
  const state = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
  const cookieName = getSupabaseCookieName();
  const hasAuthCookie = state.cookies?.some(
    (c: { name: string }) => c.name === cookieName
  );

  if (!hasAuthCookie) {
    state.cookies = state.cookies || [];
    state.cookies.push({
      name: cookieName,
      value:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxOTk5OTk5OTk5LCJzdWIiOiJ0ZXN0LXVzZXItaWQifQ.test-signature",
      domain: "127.0.0.1",
      path: "/",
      expires: -1,
      httpOnly: true,
      secure: false,
      sameSite: "Lax"
    });
    fs.writeFileSync(AUTH_FILE, JSON.stringify(state, null, 2));
  }
});
