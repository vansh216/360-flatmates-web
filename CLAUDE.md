# Repository Guidelines

## Project Structure & Module Organization

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # Shared UI components (see DESIGN.md component catalog)
  hooks/        # Custom React hooks
  lib/          # Utilities, API clients, Supabase config
  types/        # Shared TypeScript types and interfaces
docs/            # OpenAPI spec (flatmates-openapi.yaml)
plans/           # PRD (prd.md) and UI/UX specification (ui_ux.md)
DESIGN.md        # Canonical design system — color, typography, spacing, shadows, animations, dark mode
```

Key reference documents:
- **DESIGN.md** — single source of truth for all UI tokens, component specs, and visual targets
- **plans/prd.md** — product requirements and technical architecture
- **plans/ui_ux.md** — detailed page, component, and interaction specifications
- **docs/flatmates-openapi.yaml** — backend API contract (FastAPI at `/api/v1`)

## Build, Test, and Development Commands

```bash
npm run dev       # Start Next.js dev server
npm run build     # Production build
npm run lint      # ESLint + Prettier check
npm test          # Run Vitest unit tests
npm run test:e2e  # Playwright end-to-end tests
```

## Coding Style & Naming Conventions

- **TypeScript** in strict mode; no `any` types
- **Tailwind CSS** with custom design tokens defined as CSS custom properties in `:root` (see DESIGN.md)
- Use Tailwind semantic utilities (`bg-accent`, `text-ink`, `shadow-sm`) over raw values
- **Fonts**: Fraunces (headlines), Inter (body), JetBrains Mono (eyebrow/tabular), Instrument Serif (italic emphasis) — loaded via `next/font/google`
- **Components**: PascalCase files co-located with tests (`Button.tsx` + `Button.test.tsx`)
- **Hooks**: camelCase prefixed with `use` (`useCompatibility.ts`)
- **Dark mode**: toggled via `[data-theme="dark"]` on `<html>`; never hardcode light-only colors

## Testing Guidelines

- **Vitest** + **React Testing Library** for unit/integration tests
- **Playwright** for E2E flows
- Test files co-located: `Component.test.tsx` next to `Component.tsx`
- Run affected tests before committing: `npm test -- --related`

## Commit & Pull Request Guidelines

- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- PRs must reference DESIGN.md tokens for any visual changes
- Verify dark mode rendering for all UI changes
- Include screenshots for visual PRs (both light and dark mode)

## Architecture Overview

Next.js App Router consuming a shared FastAPI backend (`/api/v1`). Authentication via Supabase (Phone OTP + Password). Responsive navigation: bottom nav on mobile, collapsed icon sidebar on tablet, full sidebar on desktop. Three user modes (Room Poster, Co-Hunter, Open to Both) control navigation tabs and feature access. Real-time updates via SSE. All design tokens are CSS custom properties with dark mode overrides.
