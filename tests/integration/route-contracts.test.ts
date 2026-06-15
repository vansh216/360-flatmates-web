import { describe, expect, it } from "vitest";

import { routeInventory } from "@/lib/route-inventory";

const expectedRoutes = [
  "/",
  "/discover",
  "/discover/koramangala-studio",
  "/search",
  "/search/semantic",
  "/stats",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/onboarding",
  "/onboarding/mode",
  "/home",
  "/swipe",
  "/likes",
  "/matches",
  "/chats",
  "/chats/c-priya",
  "/compatibility/1",
  "/explore",
  "/post",
  "/post/review",
  "/manage",
  "/dashboard",
  "/dashboard/analytics",
  "/visits",
  "/visits/v-1",
  "/profile",
  "/profile/priya",
  "/profile/edit",
  "/settings",
  "/settings/appearance",
  "/settings/blocked-users",
  "/settings/notifications",
  "/settings/report-problem",
  "/notifications",
  "/saved-searches",
  "/alerts",
  "/my-listings/koramangala-studio/edit",
  "/my-listings/koramangala-studio",
  "/choose-role",
  "/location",
  "/help",
  "/verify",
  "/terms",
  "/privacy",
  "/about",
  "/maintenance",
  "/not-found",
  "/error",
  "/admin/stats",
  "/admin/moderation/listings",
  "/admin/moderation/reports",
  "/admin/moderation/prescreen/koramangala-studio",
] as const;

const staleDesignAliases = ["/chat", "/bookings", "/admin/moderation", "/app/compatibility/1", "/app/explore"] as const;

describe("route contracts", () => {
  it("tracks every documented route sample in one canonical inventory", () => {
    expect(new Set(routeInventory).size).toBe(routeInventory.length);
    for (const stale of staleDesignAliases) {
      expect(routeInventory).not.toContain(stale);
    }
  });

  it("covers all expected route samples in the inventory", () => {
    for (const route of expectedRoutes) {
      const pattern = route.replace(/\/[^/]+$/, "/:id");
      const matches = routeInventory.some(
        (inv) => inv === route || patternMatchesRoute(pattern, inv)
      );
      expect(matches, `Missing route: ${route}`).toBe(true);
    }
  });
});

function patternMatchesRoute(pattern: string, route: string) {
  const regexSource = pattern
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        return "[^/]+";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");

  return new RegExp(`^${regexSource}$`).test(route);
}
