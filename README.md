# Horizon QA Automation

## 1. Project Overview

This repository contains two independent QA automation modules created for the Horizon Broadband QA assessment:

1. **Lighthouse Performance Monitoring CLI** — accepts a web URL, validates it, runs Lighthouse, summarizes performance results, generates deterministic fix recommendations, evaluates configurable quality gates, and produces HTML and JSON reports.
2. **Playwright Login Automation** — automates the Horizon Plus login use case using the Page Object Model, stable locators, and environment-based credentials.

Both modules are written in TypeScript and validated through GitHub Actions CI.

## 2. Features

### Lighthouse Performance Monitoring

- HTTP/HTTPS URL validation
- Programmatic Lighthouse execution via the Node API
- Category scores: Performance, Accessibility, Best Practices, SEO
- Core metrics: First Contentful Paint (FCP), Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), Total Blocking Time (TBT), Interaction to Next Paint (INP) when available
- Parsed Lighthouse audit findings with score and display values
- Deterministic rule-based recommendations for performance, accessibility, SEO, and general findings
- Configurable quality gates with minimum passing percentages
- PASS/FAIL evaluation per gate and overall
- CLI exit codes based on quality-gate results (recommendations alone do not cause failure)
- HTML report generation
- JSON report generation
- Report output under `lighthouse-reports/`

### Login Automation

- Horizon Plus language page (`/languages`) navigation
- Login page (`/signin`) navigation
- Page Object Model (`LanguageSelectionPage`, `SignInPage`)
- Login form validation scenarios (empty fields, invalid credentials)
- Invalid credential error assertion
- Successful login scenario using environment variables
- Playwright screenshots and traces on failure

## 3. Technology Stack

| Technology | Purpose |
|------------|---------|
| TypeScript | Type safety and maintainability across both modules |
| Node.js | Runtime for the Lighthouse CLI and test tooling |
| Playwright / Playwright Test | Browser automation and UI test framework |
| Lighthouse | Web performance and best-practices auditing |
| chrome-launcher | Local Chromium management for Lighthouse |
| dotenv | Environment variable loading for local development |
| GitHub Actions | Continuous integration for TypeScript, Lighthouse tests, and Playwright tests |
| HTML | Self-contained Lighthouse report output |
| JSON | Machine-readable Lighthouse report output |

## 4. Architecture

### Module Separation

The repository contains two independent modules:

```
lighthouse-tool/   # Lighthouse CLI, parsing, recommendations, quality gates, reports
ui-tests/          # Playwright login automation
```

### Lighthouse Flow

```
URL
  → validation
  → Lighthouse runner
  → result parser
  → recommendation engine
  → quality gates
  → HTML report
  → JSON report
  → exit based on quality gates
```

### Login Flow

```
/languages
  → click "Log In"
  → /signin
  → email input
  → password input
  → click "Login Now"
  → authenticated-state assertion
```

Separation of concerns is maintained throughout: URL validation, Lighthouse execution, result parsing, recommendation generation, quality-gate evaluation, and report generation are each isolated in their own modules.

## 5. Project Structure

```
.github/
  workflows/
    ci.yml                         # GitHub Actions CI workflow

docs/
  login-flow.md                    # Documented login flow observations

lighthouse-tool/
  bin/
    lh-audit.ts                    # CLI entry point
  config/
    quality-gates.json             # Default quality-gate thresholds
  src/
    index.ts                       # Module entry
    validate-url.ts                # URL validation
    run-lighthouse.ts              # Lighthouse execution
    parse-results.ts               # Raw result → summary
    rule-engine.ts                 # Summary → recommendations
    gates.ts                       # Summary + config → quality gates
    report/
      html.ts                      # HTML report generator
      json.ts                      # JSON report generator
  tests/
    validate-url.test.ts
    parse-results.test.ts
    rule-engine.test.ts
    gates.test.ts
    report-html.test.ts
    report-json.test.ts

ui-tests/
  playwright.config.ts             # Playwright configuration
  tsconfig.json                    # TypeScript configuration
  src/
    index.ts                       # Module entry
    pages/
      language-selection.page.ts   # Language page Page Object
      sign-in.page.ts              # Sign-in page Page Object
  tests/
    login.spec.ts                  # Login navigation test
    login-validation.spec.ts       # Login validation / negative tests
    login-success.spec.ts          # Successful login test

.env.example                       # Environment variable placeholders
.gitignore                         # Git ignore rules
package.json                       # Project scripts and dependencies
package-lock.json                  # Locked dependency tree
tsconfig.base.json                 # Shared TypeScript configuration
```

## 6. Lighthouse Tool

The Lighthouse CLI is invoked through npm:

```bash
npm run lh -- https://example.com
```

The tool:

1. Validates the supplied URL (rejects empty, malformed, or non-HTTP/HTTPS URLs)
2. Launches a local Chromium instance and runs Lighthouse programmatically
3. Parses the raw Lighthouse result into a structured summary
4. Generates deterministic recommendations based on actual audit findings
5. Evaluates category scores against configurable quality-gate thresholds
6. Writes an HTML report and a JSON report to `lighthouse-reports/`
7. Returns a non-zero exit code when any configured quality gate fails

Recommendations alone do not cause a non-zero exit code.

## 7. Quality Gates

Default quality-gate thresholds are defined in `lighthouse-tool/config/quality-gates.json`:

```json
{
  "performance": 80,
  "accessibility": 90,
  "bestPractices": 90,
  "seo": 80
}
```

These values represent minimum passing percentages for each Lighthouse category. Thresholds are configurable and validated at runtime. Missing category scores are treated as failures rather than silently passing.

## 8. Reports

After a successful scan, two reports are generated:

- **HTML:** `lighthouse-reports/report-<timestamp>.html`
- **JSON:** `lighthouse-reports/report-<timestamp>.json`

The HTML report is a self-contained, human-readable document with category scores, core metrics, quality-gate results, and recommendations.

The JSON report is a machine-readable document containing the same structured data, suitable for downstream tooling.

Generated reports are ignored by Git and are not committed to the repository.

## 9. Login Automation

The Playwright suite uses the Page Object Model:

- `LanguageSelectionPage` — represents `/languages` and exposes the Log In control
- `SignInPage` — represents `/signin` and exposes the email field, password field, Login Now button, error message locator, and a login helper

Tested scenarios:

- Navigation from `/languages` to `/signin`
- Empty email and password validation
- Empty email with populated password validation
- Populated email with empty password validation
- Invalid credential error assertion
- Successful login with environment-based credentials

### Environment Variables

Local credentials are stored in a root `.env` file:

```
UI_BASE_URL=
LOGIN_EMAIL=
LOGIN_PASSWORD=
```

`.env` is gitignored and must never be committed. `.env.example` contains placeholders only.

In GitHub Actions, `LOGIN_EMAIL` and `LOGIN_PASSWORD` are supplied through repository Secrets.

## 10. Setup Instructions

```bash
git clone <repository-url>
cd horizon-qa-automation
npm ci
```

Create a local `.env` file from `.env.example` and populate it with valid Horizon Plus credentials if you want to run the successful-login test locally.

Install Playwright browsers:

```bash
npx playwright install
```

On Linux/CI environments:

```bash
npx playwright install --with-deps
```

## 11. Running Tests

### TypeScript Checks

```bash
cd lighthouse-tool && npx tsc --noEmit
cd ui-tests && npx tsc --noEmit
```

### Lighthouse Unit Tests

```bash
cd lighthouse-tool && npx ts-node tests/validate-url.test.ts
cd lighthouse-tool && npx ts-node tests/parse-results.test.ts
cd lighthouse-tool && npx ts-node tests/rule-engine.test.ts
cd lighthouse-tool && npx ts-node tests/gates.test.ts
cd lighthouse-tool && npx ts-node tests/report-html.test.ts
cd lighthouse-tool && npx ts-node tests/report-json.test.ts
```

### Playwright UI Tests

```bash
npm run ui:test
```

### Lighthouse CLI

```bash
npm run lh -- https://example.com
```

## 12. CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

The workflow runs on:

- `push` to `main`
- `pull_request` targeting `main`

It uses `ubuntu-latest` with Node.js 20 LTS and performs:

1. `npm ci`
2. TypeScript check for `lighthouse-tool`
3. TypeScript check for `ui-tests`
4. Lighthouse unit tests
5. Playwright browser installation (`npx playwright install --with-deps`)
6. Playwright UI tests
7. Artifact upload on failure (`playwright-report/` and `test-results/`)

Login credentials in CI are supplied through GitHub Secrets (`LOGIN_EMAIL`, `LOGIN_PASSWORD`, `UI_BASE_URL`) and are not hardcoded in the repository.

## 13. Test Coverage / Validation

### Lighthouse Unit Tests

| Suite | Tests | Result |
|-------|-------|--------|
| validate-url | 7 | Pass |
| parse-results | 26 | Pass |
| rule-engine | 9 | Pass |
| gates | 9 | Pass |
| report-html | 43 | Pass |
| report-json | 43 | Pass |
| **Total** | **137** | **Pass** |

### GitHub Actions

| Check | Result |
|-------|--------|
| TypeScript (lighthouse-tool) | Pass |
| TypeScript (ui-tests) | Pass |
| Lighthouse tests | Pass |
| Playwright tests | Pass |

### Real Lighthouse Validation

The CLI has been validated against live public websites:

- `https://example.com` — scan completed successfully
- `https://www.wikipedia.org` — scan completed successfully; all configured quality gates passed

Scores vary between runs because real websites and network conditions change.

## 14. Git Workflow

Development was performed through incremental, descriptive commits rather than a single final commit. Each phase built on the previous one, with review and verification at each step.

## 15. Design Decisions

- **TypeScript** for maintainability and type safety across both modules
- **Page Object Model** for Playwright test reuse and maintainability
- **Environment variables** for credentials — never hardcoded or committed
- **Programmatic Lighthouse API** rather than shelling out to a global CLI
- **Pure parsing, recommendation, and quality-gate logic** where practical for testability
- **Deterministic recommendations** based on actual audit findings — no external AI dependency
- **Separate HTML and JSON reporting** for human and machine consumers
- **Quality gates** determine CLI failure status, not recommendations alone

## 16. Known Limitations

- Lighthouse is operated through the CLI rather than a web frontend.
- Successful login automation requires valid test credentials supplied through environment variables.
- Lighthouse scores can vary between runs because real websites, content, and network conditions change.
- The successful-login test is skipped when `LOGIN_EMAIL` or `LOGIN_PASSWORD` are not configured.

## 17. Assessment Submission

This repository was created for the Horizon Broadband QA Automation assessment. It demonstrates end-to-end QA automation skills including web performance monitoring, browser automation, test architecture, CI integration, and professional documentation.

No personal credentials or sensitive information are included in this repository.
