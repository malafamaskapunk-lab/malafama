# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a single-page internal management app for Mala Fama, a Costa Rican ska-punk band (events, songs, media, members). The frontend is still vanilla HTML/CSS/JS — no framework, no build step, no npm dependencies (only Google Fonts loaded from the CDN in `index.html`). The project folder, `localStorage` key prefix (`malaifama_*`), and internal identifiers still use the app's original working name "Malaifama" — only user-facing text was updated to the band's real name "Mala Fama".

As of 2026-07, the app also has a thin serverless backend (`api/`, `middleware.js`) deployed on **Vercel**, added specifically to support a real Google login gate and Google Drive integration — see "Auth & Drive backend" below. `package.json` exists only to mark the project for Vercel; there is still no build step and no npm dependencies (the backend uses only Web platform APIs: `fetch`, `crypto.subtle`, `Response`/`Headers`).

## Running / developing

There is no build or dev-server command. Open `index.html` directly in a browser, or serve the folder with any static server (e.g. VS Code "Live Server") for a better experience. No test suite or linter is configured.

## Deployment

Two deploy targets are wired to push on `main`:
- **GitHub Pages** via `.github/workflows/pages.yml` (`actions/deploy-pages@v4`) — static-only, this target does NOT run `api/`/`middleware.js` (GitHub Pages has no serverless functions), so the login gate and Drive explorer silently don't work there.
- **Vercel**, connected directly to the GitHub repo (`malafamaskapunk-lab/malafama`), auto-deploys on every push to `main`. This is the target that actually runs `api/` and `middleware.js`. Production URL: `https://malafama.vercel.app`.

Since the login middleware only protects `/` and `/index.html` (see below), and GitHub Pages serves the exact same files without honoring `middleware.js` at all, **the GitHub Pages copy of this site has no login protection** — treat `malafama.vercel.app` as the real/current deployment.

## Architecture

- `index.html` — the only HTML page. Contains the shell (sidebar, topbar, one `<section class="page" id="page-*">` per view, and modal overlay markup) that `app.js` shows/hides and fills in.
- `js/data.js` — seed data only: `window.MEMBERS`, `window.EVENTS`, `window.SONGS`, `window.MEDIA`, `window.DEFAULT_SETTINGS`. Edited directly by non-technical users per `LEEME.txt`.
- `js/app.js` — all application logic, organized as one file with `═══` banner comments dividing sections (Dashboard, Calendario, Canciones, Multimedia, Nosotros, etc.). Key pieces:
  - **Global state**: single `App` object (`currentPage`, `calView`, `calDate`, `songFilter`, `mediaTab`, `settings`, `events`, `songs`, `members`, `media`).
  - **Persistence**: `loadAllData()`/`saveAll()` read/write `localStorage` under `malaifama_settings` / `malaifama_events` / `malaifama_songs` / `malaifama_members` / `malaifama_media`, falling back to the `data.js` seed via `tryParse()`. There is no backend — all CRUD mutates `App.*` in memory then calls `saveAll()`.
  - **Router**: `navigateTo(page)` toggles `.page`/`.nav-item` `active` classes, calls the matching `renderX()` function (`renderDashboard`, `renderCalendar`, `renderSongs`, `renderMedia`, `renderAbout`), and updates the URL via `history.replaceState(null, '', '#'+page)`. Initial page on load is read from `window.location.hash` in the `DOMContentLoaded` handler.
  - **Rendering pattern**: each `renderX()` queries the DOM by id and overwrites `.innerHTML` with a template-literal string; use `esc()` to HTML-escape any user-supplied text interpolated into markup.
  - **Modals**: generic `openModal(id, htmlContent, title)` / `closeModal(id)` inject content into a `<div id="{id}-overlay">` that already exists in `index.html`; there's no per-modal component, just string templates built by `open*Modal`/`open*Form` functions.
  - **Toasts**: `showToast(msg, type)` appends a transient `.toast` element.
  - **Event wiring**: static/global listeners (nav clicks, calendar controls, modal close, Escape key, etc.) are attached once in the single `DOMContentLoaded` handler at the bottom of `app.js`. Listeners on *dynamically rendered* content (e.g. items inside a `renderX()`-generated list) are instead wired via inline `onclick="fn(id)"` attributes in the template strings, since that content is replaced wholesale on every re-render.
  - **Export/Import**: `exportData()`/`importData()` serialize/restore the entire `App` state (minus `currentPage`) as a downloadable/uploadable JSON backup; `resetToDefaults()` wipes `localStorage` and reloads.
- `css/styles.css` — all styling, no CSS framework.
- `assets/images/` — photos referenced by fixed filenames (see `LEEME.txt` and `assets/images/README.txt` for the full list); the UI degrades to CSS gradients when a file is missing, so missing images are never an error condition. `MEDIA.photos` entries in `data.js` must use the `assets/images/...` path (not a bare filename) since `renderMedia()` writes `p.thumb`/`p.file` straight into an `<img src>` with no base path.
- `assets/brand/` — source brand assets (wordmark lockups, sticker artwork) not directly referenced by the app; kept for future edits/print use, separate from the web-optimized files in `assets/images/`.

### Auth & Drive backend (Vercel Edge Functions)

Added to gate the app behind a Google login restricted to one email, and to let the Multimedia page list files from a real Google Drive folder instead of only manually-pasted links.

- `middleware.js` (repo root) — Vercel Edge Middleware, `matcher: ['/', '/index.html']`. Reads the `mf_session` cookie; if missing/invalid, redirects to `/login.html`. Nothing else is gated (assets, `/api/*`, `login.html` all bypass it) — this is intentional, see [[feedback-vercel-edge-middleware-gotchas]].
- `api/_lib/session.js` — shared helper, `signSession`/`verifySession`. Implements a minimal signed-cookie scheme (HMAC-SHA256 via `crypto.subtle`, no JWT library) keyed by the `SESSION_SECRET` env var. Session payload: `{ email, access_token, refresh_token, token_expiry, exp }`.
- `api/auth/login.js` → redirects to Google's OAuth consent screen (sets a short-lived `mf_oauth_state` CSRF cookie).
- `api/auth/callback/google.js` → exchanges the `code` for tokens, decodes the `id_token` to get the email, rejects anything not matching `ALLOWED_EMAIL`, then sets the signed `mf_session` cookie and redirects to `/`. On failure redirects to `/login.html?error=...&detail=...` (the `detail` param surfaces Google's raw error response for debugging without needing Vercel log access).
- `api/auth/logout.js` → clears `mf_session`.
- `api/auth/session.js` → `{ authenticated, email, hasDrive }` JSON, used by the frontend (`index.html`'s inline script) to show "Conectado: email" in the sidebar, and by `renderDriveExplorer()` in `app.js`.
- `api/drive/list.js` → given `?driveUrl=` (a Drive folder share link) or `?folderId=`, lists files in that folder via the Drive API using the session's access token, auto-refreshing it from the refresh token when expired (and re-signing/re-setting the cookie).
- Frontend hook: `renderDriveExplorer()` in `js/app.js`, called from `navigateTo()` when `page === 'media'`, fills `#drive-explorer` (in `index.html`, above the Multimedia tabs) by calling `/api/auth/session` then `/api/drive/list?driveUrl=<App.settings.driveRootUrl>`. Does nothing useful until `driveRootUrl` is set to a real folder link.

**Required Vercel env vars** (Project Settings → Environment Variables, Production): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAIL` (`malafamaskapunk@gmail.com`), `SESSION_SECRET`. Changing any of these requires a manual redeploy (Deployments → ⋯ → Redeploy) to take effect.

**Google Cloud project**: `mala-fama-web`, OAuth client "Mala Fama Web Client" (Client ID `1098417898448-3klt3pbengv6lrno7fe5569f5tekmmv4.apps.googleusercontent.com`). The OAuth consent screen is intentionally left in **Testing** status with `malafamaskapunk@gmail.com` as the only test user — this is what actually enforces "only this email can log in" (Google itself rejects any other account at the consent step), not just the `ALLOWED_EMAIL` check in `callback/google.js`. Publishing the consent screen to production would remove that restriction.

## Conventions

- User-facing strings (labels, toasts, modal titles, `LEEME.txt`) are in Spanish — match this when adding UI text.
- New content types follow the existing pattern: a `window.X` seed array in `data.js`, a `malaifama_x` localStorage key, a `renderX()` function, and `open*Form()`/`save*()`/`delete*()` CRUD functions in `app.js`.
