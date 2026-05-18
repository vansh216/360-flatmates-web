---
name: qa-web
description: >
  QA tests for the 360 Flatmates web frontend (local only). Covers auth flows,
  onboarding, home feed, swipe, likes/matches, chat, listings, profile, settings,
  admin moderation, visits, notifications, and public pages. Uses agent-browser for
  browser-based functional testing against the local dev server.
---

# QA Tests — 360 Flatmates Web

## Testing Target

This skill runs locally only. The testing strategy is:

1. Start the dev server locally: `npm run dev`
2. Poll `http://localhost:3000` until it responds (max 120s)
3. Use `http://localhost:3000` as the base URL for all browser tests

If the local dev server cannot start, report ALL web tests as BLOCKED.

## Authentication

The app uses Supabase Auth with three methods:
- **Phone OTP** (default): Phone number → Send OTP → Enter 6-digit code → Verify
- **Phone + Password**: Phone number + password → Sign In
- **Google OAuth**: Google sign-in button → OAuth redirect → Callback

**Environment variables needed:**
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/publishable key
- `TEST_PHONE` — Test phone number for login
- `TEST_PASSWORD` — Test password for password login

**Auth UI details:**
- Login page (`/login`) has a `SegmentedControl` with two tabs: "Phone OTP" and "Password"
- OTP mode: phone input → "Send OTP" button → OTP input → "Verify" button
- Password mode: phone input + password input → "Sign In" button
- "Forgot password?" link on password tab → navigates to `/forgot-password`
- Google OAuth button on login page
- Step progress indicator shows: "Enter phone" → "Verify OTP"

**Cookie-based auth:**
- Supabase sets `sb-{projectRef}-auth-token` cookie
- Middleware checks this cookie on `/(app)` routes
- Unauthenticated users are redirected to `/login?redirect=/original-path`

## App Structure

### Route Groups
- `/(public)` — Landing, discover, search, about, terms, privacy, stats, share, error, maintenance, not-found
- `/(auth)` — Login, signup, forgot password
- `/(app)` — All authenticated pages wrapped in `AppShell` with sidebar/bottom nav
- `/(admin)` — Admin moderation pages

### Navigation (AppShell)
- **Mobile (<768px)**: Bottom nav with 5 tabs
- **Tablet (768px+)**: Collapsed sidebar (64px, icons only)
- **Desktop (1024px+)**: Expanded sidebar (240px, icons + labels)
- **Wide (1440px+)**: Wider sidebar (280px)

### User Modes (affects visible tabs)
- **Room Poster**: Home, Post, Swipe, Likes & Chat, Profile
- **Co-Hunter**: Home, Explore, Swipe, Likes & Chat, Profile
- **Open to Both**: Home, Explore, Swipe, Likes & Chat, Profile

## Test Flows Menu

The orchestrator selects only the flows relevant to the current diff. Each flow is labeled so the orchestrator can match it to changed code.

### Flow 1: Public Pages
**Relevant when:** `src/app/(public)/**`, `src/components/landing/**`, landing page components change
**Persona:** Unauthenticated (no login needed)

1. Navigate to `/` (landing page)
2. Verify hero section is visible with CTA
3. Navigate to `/discover` — verify listing cards or discover content loads
4. Navigate to `/search` — verify search interface renders
5. Navigate to `/about` — verify about page content
6. Navigate to `/terms` — verify terms content
7. Navigate to `/privacy` — verify privacy content
8. Verify all public pages load without JS errors

**Success criteria:** Each page loads, key headings visible, no console errors

### Flow 2: Auth — Login OTP
**Relevant when:** `src/app/(auth)/**`, `src/hooks/useAuth.ts`, `src/lib/supabase/**` change
**Persona:** Existing user (room_poster, co_hunter, open_to_both)

1. Navigate to `/login`
2. Verify "Sign In" heading is visible
3. Verify OTP tab is selected by default
4. Verify phone input is visible
5. Verify "Send OTP" button is disabled when phone is empty
6. Fill phone number from `TEST_PHONE` env var
7. Verify "Send OTP" button becomes enabled
8. Click "Send OTP"
9. Wait for OTP input to appear
10. Enter OTP code
11. Click "Verify"
12. Verify redirect to `/home` or the `redirect` query param destination

**Success criteria:** Login form renders correctly, OTP flow progresses through steps, user reaches home page

### Flow 3: Auth — Login Password
**Relevant when:** `src/app/(auth)/**`, password login components change
**Persona:** Existing user

1. Navigate to `/login`
2. Click "Password" tab in segmented control
3. Verify phone input and password input are visible
4. Verify "Sign In" button is disabled when fields are empty
5. Fill phone number and password from env vars
6. Verify "Sign In" button becomes enabled
7. Click "Sign In"
8. Verify redirect to `/home`

**Success criteria:** Password tab renders, form validation works, user reaches home page

### Flow 4: Auth — Signup
**Relevant when:** `src/app/(auth)/signup/**` changes
**Persona:** new_user

1. Navigate to `/signup`
2. Verify signup form renders with phone and password inputs
3. Fill in phone number and password
4. Click "Sign Up"
5. Verify OTP verification step appears
6. Complete verification
7. Verify redirect to onboarding

**Success criteria:** Signup form renders, validation works, new user reaches onboarding

### Flow 5: Auth — Forgot Password
**Relevant when:** `src/app/(auth)/forgot-password/**` changes
**Persona:** Existing user

1. Navigate to `/forgot-password`
2. Verify "Reset Password" heading is visible
3. Verify 3-step progress indicator (Verify Phone → Enter OTP → Set Password)
4. Verify phone input and "Send OTP" button
5. Verify "Back to Login" link
6. Click "Back to Login" — verify navigation to `/login`

**Success criteria:** Reset password page renders correctly, step progress visible, back link works

### Flow 6: Auth — Middleware Protection
**Relevant when:** `src/lib/supabase/middleware.ts`, `src/middleware.ts` changes
**Persona:** Unauthenticated

1. Navigate to `/home` — verify redirect to `/login?redirect=/home`
2. Navigate to `/swipe` — verify redirect to `/login`
3. Navigate to `/chats` — verify redirect to `/login`
4. Navigate to `/settings` — verify redirect to `/login`
5. Navigate to `/profile` — verify redirect to `/login`
6. Navigate to `/admin/moderation/listings` — verify redirect to `/login`

**Success criteria:** All protected routes redirect unauthenticated users to login with the original path in the redirect param

### Flow 7: Onboarding
**Relevant when:** `src/app/(app)/onboarding/**` changes
**Persona:** new_user

1. After signup, verify onboarding page loads
2. Verify `StepProgress` component is visible with step labels
3. Verify `OnboardingStepContent` renders the current step
4. Complete each step of the onboarding flow
5. Verify redirect to `/home` after onboarding completion

**Success criteria:** Onboarding steps render correctly, user can progress through steps, completes to home

### Flow 8: Choose Role
**Relevant when:** `src/app/(app)/choose-role/**` changes
**Persona:** new_user

1. Navigate to `/choose-role`
2. Verify three mode options are visible: Room Poster, Co-Hunter, Open to Both
3. Click each option — verify selection state updates (accent border, accent dot)
4. Verify "Continue" button is disabled when no option is selected
5. Select a mode and click "Continue"
6. Verify navigation to `/home`

**Success criteria:** Role selection renders, selection works, Continue button enables/disabled correctly, navigation after selection

### Flow 9: Home Feed
**Relevant when:** `src/app/(app)/home/**`, `src/components/**` (listing cards, filter chips) change
**Persona:** co_hunter or open_to_both

1. Navigate to `/home`
2. Verify greeting heading is visible
3. Verify "Nearby" section or feed content loads
4. Verify filter chips are visible (1BHK, Furnished, Budget+, Vegetarian, etc.)
5. Click a filter chip — verify selection animation (scale spring)
6. Verify listing cards render (or loading skeletons, or empty state)
7. If listing cards exist: verify price, title, location, feature pills are visible
8. Verify heart/favorite icon on cards

**Success criteria:** Home page loads with greeting, filters, and feed content (cards, skeletons, or empty state)

### Flow 10: Explore / Map View
**Relevant when:** `src/app/(app)/explore/**`, `src/components/organisms/MapView.tsx` change
**Persona:** co_hunter or open_to_both

1. Navigate to `/explore`
2. Verify map component renders (Leaflet map container)
3. Verify map loads (check for tile layer or loading state)
4. If markers/listings: verify they appear on the map

**Note:** Google Maps API key must be set in `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for map to render. If missing, map may show an error.

**Success criteria:** Map view page renders, map container is visible

### Flow 11: Swipe Deck
**Relevant when:** `src/app/(app)/swipe/**`, swipe store, swipe components change
**Persona:** co_hunter or open_to_both

1. Navigate to `/swipe`
2. Verify swipe deck renders (profile cards or loading skeleton)
3. If profile cards exist: verify profile info is visible (name, age, profession, compatibility %)
4. If swipe actions exist: verify Like/Pass buttons or swipe gesture targets

**Success criteria:** Swipe page renders with deck or appropriate loading/empty state

### Flow 12: Likes & Matches
**Relevant when:** `src/app/(app)/likes/**` changes
**Persona:** Any authenticated user

1. Navigate to `/likes`
2. Verify "Likes" and "Matches" tabs are visible
3. Verify tab switching works (segmented control)
4. If on Likes tab: verify heading "People who liked you" or similar
5. If on Matches tab: verify heading "Your matches" or similar
6. Verify grid of profile cards or empty state

**Success criteria:** Likes page renders with tabs, tab switching works, content (cards or empty state) displays

### Flow 13: Chat Conversations
**Relevant when:** `src/app/(app)/chats/**`, `src/components/organisms/ChatThread.tsx` changes
**Persona:** Any authenticated user with matches

1. Navigate to `/chats`
2. Verify "Chats" heading is visible
3. Verify conversation list renders (or empty state if no matches)
4. If conversations exist: click a conversation
5. Verify chat thread view renders with messages
6. Verify message input is present (contenteditable div or textarea)

**Success criteria:** Chat page renders, conversation list or empty state visible, thread view works if conversations exist

### Flow 14: Post Listing
**Relevant when:** `src/app/(app)/post/**` changes
**Persona:** room_poster

1. Navigate to `/post`
2. Verify listing creation form renders
3. Verify form fields are visible (title, description, rent, location, etc.)
4. Fill in required fields
5. Submit the form
6. Verify success feedback or navigation to review page

**Success criteria:** Post listing form renders, form fields are interactive, submission works or shows validation

### Flow 15: Manage Listings
**Relevant when:** `src/app/(app)/manage/**`, `src/app/(app)/my-listings/**` changes
**Persona:** room_poster

1. Navigate to `/manage`
2. Verify listings management page renders
3. Verify existing listings display (or empty state)
4. If listings exist: verify edit/delete options

**Success criteria:** Manage listings page renders with listing cards or empty state

### Flow 16: Profile View & Edit
**Relevant when:** `src/app/(app)/profile/**` changes
**Persona:** Any authenticated user

1. Navigate to `/profile`
2. Verify profile page renders with user info
3. Navigate to `/profile/edit`
4. Verify edit form renders with existing profile data
5. Make a change and save
6. Verify save success (toast or navigation back to profile)

**Success criteria:** Profile page renders with user data, edit form is functional

### Flow 17: Settings
**Relevant when:** `src/app/(app)/settings/**` changes
**Persona:** Any authenticated user

1. Navigate to `/settings`
2. Verify "Settings" heading is visible
3. Verify menu items: Notifications, Appearance, Blocked Users, Sign Out, Delete Account
4. Click "Notifications" — verify navigation to `/settings/notifications`
5. Click "Appearance" — verify navigation to `/settings/appearance`
6. Click "Blocked Users" — verify navigation to `/settings/blocked-users`
7. Verify "Sign Out" button is present

**Success criteria:** Settings page renders all menu items, navigation to sub-pages works

### Flow 18: Admin Moderation
**Relevant when:** `src/app/(admin)/**` changes
**Persona:** admin

1. Navigate to `/admin/moderation/listings`
2. Verify moderation listings page renders (or redirect if no admin access)
3. Navigate to `/admin/moderation/reports`
4. Verify reports page renders (or redirect)
5. Verify admin stats page loads

**Success criteria:** Admin pages render for admin user, show moderation tools

### Flow 19: Visits
**Relevant when:** `src/app/(app)/visits/**` changes
**Persona:** Any authenticated user

1. Navigate to `/visits`
2. Verify "My Visits" heading is visible
3. Verify visits list renders (or empty state)
4. If visits exist: click a visit to view details

**Success criteria:** Visits page renders with visit list or empty state

### Flow 20: Notifications
**Relevant when:** `src/app/(app)/notifications/**`, notification components change
**Persona:** Any authenticated user

1. Navigate to `/notifications`
2. Verify notifications page renders
3. Verify notification cards or empty state
4. If notification cards exist: verify icon, title, description, timestamp

**Success criteria:** Notifications page renders with cards or empty state

### Flow 21: Dark Mode / Appearance
**Relevant when:** `src/app/(app)/settings/appearance/**`, dark mode CSS changes
**Persona:** Any authenticated user

1. Navigate to `/settings/appearance`
2. Verify theme toggle is visible
3. Toggle dark mode on
4. Verify page background and text colors change (dark paper bg `#1A1612`)
5. Toggle dark mode off
6. Verify colors revert to light mode

**Success criteria:** Dark mode toggle works, visual theme changes correctly

## Responsive Testing

When the diff affects layout or responsive components, test at these breakpoints:

| Breakpoint | Viewport | Navigation | Focus |
|-----------|----------|------------|-------|
| Mobile | 375×812 | Bottom nav | Single column, full-width cards |
| Tablet | 768×1024 | Collapsed sidebar (64px) | Two-column where applicable |
| Desktop | 1440×900 | Full sidebar (240px) | Multi-column, horizontal cards |
| Wide | 1920×1080 | Wider sidebar (280px) | Full layout |

Use `agent-browser` viewport resizing to test at different breakpoints.

## Per-Persona Navigation Variations

| Persona | Visible Tabs |
|----------|-------------|
| room_poster | Home, Post, Swipe, Likes & Chat, Profile |
| co_hunter | Home, Explore, Swipe, Likes & Chat, Profile |
| open_to_both | Home, Explore, Swipe, Likes & Chat, Profile |
| admin | Standard tabs + Admin sidebar item |

## Known Failure Modes

1. **Dev server not ready.** The Next.js dev server can take 30-60s to compile the first page. Poll `http://localhost:3000` with retries before starting tests.
2. **Supabase auth cookie not set.** If the Supabase URL or key is incorrect, auth will silently fail. Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are set.
3. **Google Maps blank.** Without `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, the map component will render a blank or error state. This is expected in local dev without the key.
4. **SSE connection refused.** Real-time updates via SSE (`useSSE`) will fail if the backend is not running at `NEXT_PUBLIC_API_BASE_URL`. The app handles this gracefully but won't show live updates.
5. **Protected route redirect.** Unauthenticated users accessing `/(app)` routes are redirected to `/login?redirect=/original-path`. This is correct behavior, not a failure.
6. **Mode-dependent navigation.** The sidebar/bottom nav tabs change based on user mode (room_poster vs co_hunter vs open_to_both). Test navigation with the correct mode for the persona.
7. **FCM push not available.** Without `NEXT_PUBLIC_FCM_VAPID_KEY` and HTTPS, push notification registration is skipped. This is expected in local dev.
