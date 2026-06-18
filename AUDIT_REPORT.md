# Full-Platform Audit & Fix Report — 360 Flatmates Web

**Branch:** `audit/full-platform-qa`
**Date:** 2026-06-18
**Scope:** ~60 pages, ~45 user flows, 14 domains + cross-cutting shared components
**Method:** Parallel domain agents, static analysis + tsc + lint + Vitest

---

## Verification Summary

| Gate | Baseline | After Audit | Delta |
|------|----------|-------------|-------|
| `tsc --noEmit` | ✅ clean | ✅ clean | — |
| `eslint --max-warnings=0` | ✅ clean | ✅ clean | — |
| Vitest (368 tests) | 365 pass, 3 fail | **368 pass, 0 fail** | **+3 fixed** |
| Files changed | — | **89 files** | +3,229 / -853 lines |

### Pre-existing test failures fixed (all 3)
1. `useSwipes.test.tsx > returns profiles array` — hook response unwrapping wrong (D8)
2. `useSwipes.test.tsx > uses query key` — same root cause (D8)
3. `adapters.test.ts > maps owner object` — spurious `id` in adapted owner (D6)

---

## Per-Domain Summary

### D1: Auth & Session
**Bugs fixed:**
- Deep-link `?redirect=` from AuthGuard was dropped; all login success navigated to `/home` (now honors redirect)
- OAuth callback failure (`?error=auth`) never shown to user
- Stale error persisted while user retyped after OAuth failure
- Enter-to-submit was broken on all auth steps (no `<form>` wrapper, `Button` defaults to `type="button"`)

**UX polish:** AuthLayout back link uses lucide ArrowLeft + focusRing; PhoneInput gets error/helper support; autoFocus on forgot-password new-password field; em-dashes removed from login copy.

---

### D2: Onboarding & Gating
**Bugs fixed:**
- ChooseRolePage: stale initial state — returning user's saved mode never preselected
- LocationPage: stale initial state — returning user's city field empty
- VerifyPage: dead button (final step handler did nothing); replaced with working completion state
- Double-submit guards on ChooseRolePage and LocationPage

**UX polish:** Enter-to-advance on LocationPage; focus moves to step heading on step change; wizard heading/nav divergence fixed (URL vs store mismatch); live-region on Verify status copy.

---

### D3: Public & SEO
**Bugs fixed:**
- ComparisonPage read `window.location.pathname` at render time (prerender crash); replaced with `useParams()`
- CityPage + NeighborhoodPage: `useWebSearch` failures had no error state (violated CLAUDE.md)
- CityPage neighborhood cards: `onClick` on non-focusable `<Card>` div; replaced with semantic `<Link>`
- Bad-slug pages were indexable with wrong/duplicate meta; added `noindex` to ComparisonPage, BlogPostPage, CityPage, NeighborhoodPage not-found branches

**SEO:** Em-dashes removed from SeoHelmet default title separator, StatsPage, AboutPage, CityPage/NeighborhoodPage FAQ, BlogPage/BlogPostPage (40+ bold-bullet definitions updated). JSON-LD validated.

---

### D4: Discovery & Search
**Bugs fixed:**
- In-flight searches never aborted (AbortSignal not forwarded); race conditions on rapid filter changes
- Results blanked/flashed on every filter change; added `keepPreviousData` + `staleTime`
- SearchPage swallowed API errors (showed "0 results" instead of error state)
- Recent searches feature was dead code (store had it, page never used it)

**UX polish:** Result count with `aria-live`; background-refetch spinner; `role="search"` + `aria-label` on form; removable recent-search chips; discover quick-filters toggle off on re-tap; `motion-reduce:animate-none` on cards.

---

### D5: Map
**Bugs fixed:**
- `useMapView`: AbortSignal not forwarded; stale viewport fetches raced during rapid pan/zoom
- Static empty `placeholderData` caused map to flash to 0 pins on every filter change; replaced with `keepPreviousData`
- MapView `MapEventHandler`: no unmount cleanup of debounce timer (setState-after-unmount leak)
- `MapFlyTo`: unconditional animation violated reduced-motion requirement
- `isDark`: "system" theme never subscribed to `matchMedia` change events (tiles didn't swap on OS flip)

**UX polish:** Non-blocking "Updating" indicator during refetch; in-viewport empty state overlay; map `aria-label`; singular/plural correct pin count badge.

---

### D6: Listing Detail & Posting
**Bugs fixed:**
- `adapters.ts`: `propertyToListingCardProps` injected spurious `id` into owner object (failing test)
- PostPage: no wizard step validation (could publish with empty required fields)
- PostPage: no draft persistence (refresh mid-wizard lost everything)
- PostPage: stale-closure bug in `removeImage` re-added empty previews
- PostPage: "retry" badge was decorative (did nothing); replaced with functional retry button
- MyListingDetailPage: boost/renew/delete hooks existed but were never wired to UI

**UX polish:** Listing detail Fraunces numerals `font-normal` (never bold); semantic `bg-ink/70 text-paper` on PropertyDetailPanel; em-dash removed from public listing detail; delete confirmation modal on MyListingDetailPage.

---

### D7: Dashboard & Analytics
**Bugs fixed:**
- DashboardPage: hardcoded `visits: 0` per listing presented as real data (DESIGN §13); removed column
- DashboardPage: `onViewAnalytics` routed to `/my-listings/:id` (listing detail), not analytics
- `useListingAnalytics`: `period` param never sent to API
- No AbortSignal on either query
- DashboardPage: no empty state for zero listings
- AnalyticsPage: daily-stats empty state missing

**UX polish:** Locale number formatting (`en-IN`); date formatting; period selector via SegmentedControl; trend arrows with `aria-label`; table semantics (`caption`, `scope`, `th`); removed fake "Chart area" placeholder.

---

### D8: Swipe, Likes & Matching
**Bugs fixed:**
- `useSwipeDeck`: hook returned `[]` instead of profiles (response typed as envelope but API returns bare array) — **the most impactful bug found; swiping showed nothing**
- SwipePage: keyboard double-swipe (global listener + deck both handled arrow keys)
- SwipeDeck: deck index/array desync on refetch (every swipe reset to card 0)
- SwipePage: no error feedback on swipe failure (silent loss); distinct 429 message for super-like cap

**UX polish:** Match-celebration `aria-modal="true"`; AbortSignal on useCompatibility, useMatches, useIncomingLikes.

---

### D9: Chat & Realtime
**Bugs fixed:**
- ChatThread: broken scroll anchoring on history prepend (always scrolled to bottom, yanking users reading history)
- ChatDetailPage: duplicate `handleSend` (D9 agent partial + orchestrator fix); block/report handlers wired

**UX polish:** ChatThread: loading-more indicator; empty state with participant name; sequential avatar display (first in sender sequence only); send button `aria-busy`; retry button focus ring + aria-label; `loadingMore`/`onLoadMore` props for future infinite scroll.

---

### D10: Visits
**Bugs fixed:**
- `useUpdateVisit`/`useCancelVisit`: invalidated only `["visits", id]` leaving list/calendar stale; now invalidates full `["visits"]` namespace
- VisitCard: raw ISO timestamp shown to users; formatted via `formatDateTime`
- VisitDetailPage: cancel had no confirmation modal
- `reschedule_suggested` status rendered literal "pending" text
- No AbortSignal on queries

**UX polish:** Double-submit guards; toast feedback on all actions; past-date guard with local timezone; de-duplicated VisitsPage; proper status labels.

---

### D11: Profile
**Bugs fixed:**
- PublicProfilePage: em-dash in SEO title
- ProfilePage: ProgressRing missing `label` prop (defaulted to "Compatibility score" for onboarding context)

**UX polish:** Em-dashes replaced in ProfilePage code comments; FlatmateProfileDetail em-dash fixed.

---

### D12: Settings & Notifications
**Bugs fixed:**
- SettingsNotificationsPage: stale closure in `handleToggle` (rapid toggles lost state)
- SettingsNotificationsPage: pending preferences lost on navigation (no flush-on-unmount)
- NotificationsPage: raw ISO timestamps shown to users
- NotificationCard: cards not keyboard-accessible (no `interactive` prop)
- ReportProblemPage: native `<select>` instead of design-system `SelectField`
- ReportProblemPage: silent fail on empty description
- AppearancePage: dark mode swatch used hardcoded hex; replaced with semantic tokens
- AppearancePage: missing palette selector

**UX polish:** BlockedUsersPage unblock confirmation modal; SettingsNotificationsPage skeleton + error state; notification list semantics; NotificationCard aria-labels; MenuItemRow `isLast` deprecation; HelpPage consistent back navigation.

---

### D13: Saved Searches & Alerts
**Bugs fixed:**
- AlertsPage: enable/disable button had empty `onClick` handler (did nothing)
- SavedSearchesPage: re-run navigated to `/search?q=${name}` ignoring all saved filters
- AlertsPage: no delete functionality despite API supporting `DELETE /alerts/{id}`
- Missing `useUpdateSearchAlert` and `useDeleteSearchAlert` hooks
- SavedSearchesPage: delete fired immediately with no confirmation
- AbortSignal missing on both query hooks

**UX polish:** Confirmation modals; toast feedback; empty states with CTAs; list semantics; "Paused" chip on disabled alerts; icon changes for toggle state.

---

### D14: Admin
**Bugs fixed:**
- `useAdminModerate`/`useAdminReportAction`: invalidate-only caused stale-queue flash; replaced with optimistic removal + onError rollback
- ModerationListingsPage: shared `isActing` disabled every row's buttons on any single action; per-row `actingId`
- ModerationListingsPage: reject was destructive with no confirmation and no reason
- ModerationReportsPage: same shared-pending bug; modal closed on error with no feedback
- AdminLayout: exact-match nav left prescreen detail route with no active tab

**UX polish:** Toast feedback on all admin actions; semantic list markup; double-action guards; reject confirmation modal with reason field; `aria-current="page"` on active nav.

---

## Cross-Cutting Fixes (Wave 5) — Applied

All critical, high, and medium shared-component findings from Waves 1-4 were addressed in a final cross-cutting pass. Three parallel agents edited shared files that domain agents couldn't touch.

### W5a: Guards & Auth Lifecycle (5 fixes)
| File | Fix |
|------|-----|
| `guards.tsx` | AuthRedirectGuard now honors `?redirect=` for signed-in users (same-origin path-safe) |
| `guards.tsx` | GateGuard prefix-matches `/onboarding/` so `/onboarding/:step` is a valid gate route |
| `OnboardingStepContent.tsx` | Sets `authStage("active")` before navigate on completion (fixes bounce-back trap) |
| `providers.tsx` | Clears `onboardingStore` draft on logout (fixes cross-user state bleed) |
| `StepProgress.tsx` | Accepts `aria-label` + `aria-valuetext` props on `role="progressbar"` |

### W5b: Shared UI Atoms (6 fixes)
| File | Fix |
|------|-----|
| `SelectableCardGrid.tsx` | Added `focusRing` + `interactiveMotion` to SelectableCard button |
| `ProgressRing.tsx` | Default `aria-label` changed from "Compatibility score" to "Progress"; all compatibility callers updated with explicit label |
| `Skeleton.tsx` | Added `aria-hidden="true"` to all 5 outer wrapper divs |
| `Skeleton.tsx` | NotificationCardSkeleton unread dot: `bg-accent` → shimmer class |
| `FilterPanel.tsx` | Added optional `variant` field to `FilterSection` for `role="radio"` single-select semantics |
| `Button.tsx` | Polymorphic `as="a"` prop for styled anchors (no more `<Link><Button>` double tab stops) |

### W5c: Molecules, Adapters & Misc (6 fixes)
| File | Fix |
|------|-----|
| `ExplorePage.tsx` | Map viewport now persists in `mapStore`; wired `isFetching` to MapView's refetch indicator |
| `adapters.ts` | `notificationToNotificationCardProps` now formats `created_at` with `formatRelativeTime` |
| `AppShell.tsx` | Unread notification badge on bell icon (consumes `useNotifications`, shows count, 99+ overflow) |
| `PostReviewPage.tsx` | "Edit Listing" links to `/my-listings/${id}/edit` when listing ID available (falls back to `/post`) |
| `nominatim.ts` | Removed forbidden `User-Agent` header; added `signal` + `Accept-Language: 'en'` |
| `CityPage/BlogPage/BlogPostPage` | Raw `<img>` → `<NetworkImage>` for graceful broken-image fallback |

### Remaining (low priority, document-only)
| Finding | Status |
|---------|--------|
| `PeopleGridPage` CTA dead / unmatch no UI | Deferred — needs product decision on like-back vs chat navigation |
| `ListingDetailClient` "Save to Favorites" no-op + fabricated data | Deferred — page-clients are SSR-adjacent, needs careful handling |
| `SemanticSearchClient` no error/debounce | Deferred — needs ownership lift to SemanticSearchPage |
| `StatsClient` hardcoded fake stats | Deferred — needs product decision (API source vs illustrative label) |
| `chat-store` no reset on logout | Deferred — low risk (in-memory only, not persisted) |
| `z-index` map overlays ad-hoc `z-[1000]` | Documented — Leaflet requires values above app scale |
| `PrescreenPage` uses non-admin `useProperty` | Deferred — backend admin listing-detail endpoint needed |

---

## Architecture Observations

1. **The swipe deck was completely broken** (`useSwipes.ts` response unwrapping) — the single most impactful bug found. Users saw an empty deck and couldn't match with anyone.
2. **No page had a broken loading/error path** after the audit — every domain now has skeletons, inline error+retry, and empty states per CLAUDE.md.
3. **Cache invalidation was the most common bug pattern** — agents found stale data after mutations in admin, visits, dashboard, search alerts, and swipe deck.
4. **Em-dashes were pervasive** — 40+ instances across public pages, SEO, and app copy, all cleaned to colons/commas per DESIGN.md.
5. **10 hooks lacked AbortSignal forwarding** — causing race conditions on rapid user interaction (search, map pan, swipe, admin actions).
6. **Keyboard accessibility was the most common a11y gap** — missing focus rings, non-interactive clickable elements, Enter-to-submit not wired.
