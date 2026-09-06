# QA Horizon Assignment

Web Lighthouse Performance Monitoring Tool + Playwright login automation for the
Horizon Plus application.

> **Status:** Phase 0 — project foundation scaffolded. Core modules are being
> implemented in phases (see plan below).

## Project Overview (placeholder)

Two independent modules in one repository:

- **`lighthouse-tool/`** — standalone CLI that accepts any web URL, validates it,
  runs a Lighthouse analysis, produces findings with severity and actionable
  recommendations, enforces configurable quality gates, and emits JSON/HTML reports.
- **`ui-tests/`** — Playwright Test suite automating the login use case using the
  Page Object Model, stable locators, and data-driven scenarios.

## Technology Stack

- TypeScript, Node.js (>= 18)
- Playwright / Playwright Test (UI automation)
- Lighthouse (performance auditing — added in a later phase)
- GitHub Actions (CI — added last, after core functionality works)

## Setup

```bash
npm install
npx playwright install chromium
```

## Verify the foundation works

```bash
npx tsc -p lighthouse-tool/tsconfig.json --noEmit
npx tsc -p ui-tests/tsconfig.json --noEmit
npm run ui:test
```

## Documentation

- `docs/login-flow.md` — findings from inspecting the real application's login
  flow (written during the discovery phase, before any selectors are coded).
