# Horizon Plus Login Flow

> Findings from inspecting the real application
> (https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/languages)
> **before** writing any selectors or assertions.
>
> Method: Playwright (headless Chromium) session from this repository,
> capturing screenshots, ARIA snapshots and DOM element inventory at each
> step. Artifacts in `discovery-artifacts/` (not committed):
> `01-initial-languages.png`, `02-after-login-click.png`, `03-direct-login.png`
> plus matching `.a11y.json` / `.text.txt` files.
>
> Every statement below is an observed fact unless explicitly marked
> "Not verified.".

## 1. Entry Point

- Observed start URL: `https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/languages`
- The URL loads directly without redirect (final URL identical to requested URL).
- The application is a Kaltura-based streaming platform; footer shows
  "©2026 KSP New. All rights reserved." and version `2026.08.31.13.06`.

## 2. Initial Application State

Observed on a fresh (unauthenticated) headless session:

- Left sidebar navigation with the items: Home, Monetization, AI Show,
  Premium+, Kids, Sports, Live (top group) and Language, Feedback And Help,
  About Us, Privacy Policy, Terms Of Service, **Log In** (bottom group).
- Main panel: "Language" settings page with three dropdowns, each defaulting
  to English: "App Display Language:", "Audio Language:",
  "Subtitles Language:".
- Top search input with placeholder `Search…`.
- The presence of a "Log In" sidebar item indicates the session is
  unauthenticated.
- UI framework observed in DOM classes: Material UI (MuiButtonBase-root,
  MuiTab-root, MuiInputBase-input) — relevant because MUI often renders
  accessible roles on button elements.

## 3. Onboarding Flow

- **No onboarding was shown** on a fresh session: no Next / Skip /
  Get Started steps appeared when loading `/languages` directly.
- Not verified: whether onboarding appears when starting from `/` (root URL)
  on a brand-new session, or whether onboarding state is persisted per user.

## 4. Language Selection

- The `/languages` page shows three language dropdowns (App Display, Audio,
  Subtitles), each currently "English".
- Each dropdown is a `[role=button]` element with `aria-label="Select language"`
  and class `selectlan-dropdown`; there are three of them (one per setting).
- **Not verified:** whether a Save/Continue action exists after changing a
  language (none was observed in the static DOM), whether changing language
  triggers navigation, and which language options are available beyond
  English (only the closed dropdowns were inspected).
- The application did **not** force language selection before any other
  action: the sidebar (including Log In) was fully usable without touching
  the language settings.

## 5. Authentication Entry

- Clicking the **"Log In"** sidebar item navigated (client-side) from
  `/languages` to **`/signin`**.
- The resulting URL: `https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com/signin`
- Not verified: whether `/signin` is reachable by direct navigation and
  whether unauthenticated users hitting protected routes get redirected to it.

## 6. Authentication Flow

Observed on the `/signin` page (screenshot `02-after-login-click.png`):

- Heading/text: "Login to your account".
- Two inputs:
  - Email: `id="email"`, `name="email"`, `type="text"`,
    placeholder `"Enter your Email"`, `required=false` in the DOM.
  - Password: `id="pass"`, `name="pass"`, `type="password"`,
    placeholder `"Enter your password"`, `required=false` in the DOM.
- Primary submit button: **"Login Now"** (`type="submit"`), Material UI
  styled (`MuiButtonBase-root MuiButton-root`).
- **Verified behavior:** when either the email or password field is empty,
  the "Login Now" button is disabled (`disabled` attribute present,
  `Mui-disabled` class applied). No browser-native validation popup and no
  application error message is shown for empty fields; submission is
  prevented entirely by the disabled button.
- Secondary options observed: "Forget Password ?" link,
  "Continue as Guest" button, "Don't Have An Account? **Sign Up**".
- Social/footer buttons (Facebook, YouTube, Twitter, Terms and Conditions,
  Privacy Policy) are rendered as `type="submit"` buttons with
  `aria-label`s Facebook / YouTube / Twitter — they appear to be footer
  links misusing submit semantics; **not verified** whether they trigger
  social login.
- No visible CAPTCHA, OTP field, or MFA step on the initial form.
- **Invalid credentials behavior (verified):** when both fields are filled
  with invalid data (`qa.invalid@example.com` / `InvalidPassword123!`) and
  submitted, the application displays the error message:
  **"The email address or password are incorrect."**
  The page remains on `/signin`. This message was observed in the live DOM
  and is the only reliable validation/error state currently identified.
- Authentication mechanism: **Not verified.** The Firebase SDK was observed
  in console logs attempting service-worker registration, suggesting a
  Firebase-backed backend, but no authentication request/response was
  captured because no real credentials were submitted.

## 7. Successful Authentication State

- **Not verified with real credentials** — no valid credentials were
  available during discovery, so no login was actually performed.
- For documentation purposes only: a screenshot named
  `03-direct-login.png` (taken after navigating to `/login`) shows a fully
  authenticated-style home page (`/home`) with a hero banner (e.g.
  "Hunting Season", "Ice Road: Vengeance") and content rows (My Channels,
  Genre Subscreens, Top Picks For You, People Also Watched, Because You
  Watched Shelter, Interactive TV).
- **Important caveat:** it is *not verified* that this `/home` state is the
  result of authentication — the app may serve browse-able content to
  guests, or `/login` may redirect without auth. Do not treat this as proof
  of a successful-login indicator until a real authenticated session is
  observed.

## 8. Testable Assertions

Candidate assertions for later implementation (all derived from observed
DOM; final choice to be confirmed during test implementation):

- URL assertion: after clicking "Log In", page URL ends with `/signin`.
- Visibility of the email input (`#email` / placeholder "Enter your Email")
  and password input (`#pass` / placeholder "Enter your password") on
  `/signin`.
- Visibility of the "Login Now" button.
- Presence of sidebar item "Log In" when unauthenticated.
- Post-login state: **Not verified** (see §7) — a reliable authenticated-state
  indicator (URL change, avatar/user menu, absence of "Log In") must be
  established during a real credential-based run before success-path tests
  are written.

## 9. Authentication Dependencies

| Dependency | Status |
|---|---|
| CAPTCHA | Not observed on the login form. Not verified beyond visual/DOM inspection. |
| OTP / MFA | Not observed on initial login screen. Not verified past first submit. |
| Email verification | Not verified. |
| Social login | Buttons with aria-labels Facebook/YouTube/Twitter observed, but actual social-login behavior not verified. |
| External identity provider | Not verified. Firebase SDK presence observed in console; backend auth mechanism unconfirmed. |
| Rate limiting / lockout | Not verified. |

## 10. Environment Variables

Per project rules, credentials come from the environment (see `.env.example`):

- `UI_BASE_URL` — base URL of the app (default:
  `https://horizon-plus.dfp8hwwhcxnpq.amplifyapp.com`).
- `LOGIN_EMAIL` — login e-mail (no value committed).
- `LOGIN_PASSWORD` — login password (no value committed).

No real credentials were used or committed during discovery.

## 11. Automation Strategy

Planned (not yet implemented):

- Page Object Model: `LanguageSelectionPage` (sidebar + language dropdowns)
  and `SignInPage` (login form).
- Locator preference based on observed DOM:
  1. `getByText('Log In')` for the sidebar entry.
     > Note: the originally documented candidate `getByRole('button', { name: 'Log In' })`
     > was tested against the live application. The Log In element is exposed as a
     > `<div>` with a generated class (`jss1058`), not as a `<button>` / `role="button"`.
     > Therefore the role-based locator was rejected. Live DOM validation confirmed
     > `getByText('Log In')` works. Do not use the generated `jss1058` class as a selector.
  2. `getByPlaceholder('Enter your Email')` / `getByPlaceholder('Enter your password')`
     for form fields (stable, user-visible, observed in DOM).
  3. `getByRole('button', { name: 'Login Now' })` for submit.
  4. IDs `#email` / `#pass` as documented fallbacks.
- Assertions built on web-first `expect` APIs (visibility, URL), no fixed
  waits beyond app-load tolerance in the discovery harness.
- Data-driven cases: empty fields, invalid password, valid login (blocked
  until credentials are provided via env vars).
- Failure artifacts already configured: trace + screenshot on failure.

## 12. Known Limitations

1. Discovery was performed headless via this repo's Playwright; network
   errors (`ERR_CERT_AUTHORITY_INVALID`, `ERR_NAME_NOT_RESOLVED`, 404 for a
   script, failed Firebase service-worker registration) were observed in
   the console. The app still rendered and functioned; these may be
   sandbox/proxy artifacts rather than app defects — not verified.
2. No credentials were available, so the actual login submit behavior
   (request/response, success indicator, invalid-credential error message)
   is **not verified**.
3. Onboarding behavior from the root URL and language dropdown contents
   were not explored (out of scope for login discovery).
4. A wrong-route observation: navigating to `/login` (rather than `/signin`)
   landed on `/home`; route-guard behavior is not verified.
5. DOM class names are Material UI generated; selectors should rely on
   roles/labels/placeholders/IDs, not generated classes.
