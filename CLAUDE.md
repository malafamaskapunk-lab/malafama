# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a single-page internal management app for Mala Fama, a Costa Rican ska-punk band (events, songs, media, members). The frontend is still vanilla HTML/CSS/JS — no framework, no build step, no npm dependencies (only Google Fonts loaded from the CDN in `index.html`). The project folder, `localStorage` key prefix (`malaifama_*`), and internal identifiers still use the app's original working name "Malaifama" — only user-facing text was updated to the band's real name "Mala Fama".

As of 2026-07, the app also has a thin serverless backend (`api/`, `middleware.js`) deployed on **Vercel**, added specifically to support a real Google login gate and Google Drive integration — see "Auth & Drive backend" below. There is still no frontend build step. Most of `api/` uses only Web platform APIs (`fetch`, `crypto.subtle`, `Response`/`Headers`) with zero dependencies — the one exception is `api/audio/*`, which uses the `@vercel/blob` npm package (the project's only real dependency, see "Song audio (Vercel Blob)" below) because Vercel does not publish a stable raw HTTP contract for Blob storage, only the SDK.

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
- `api/_lib/googleDrive.js` → shared by `list.js` and `drive/state.js` (below): `requireDriveSession(request, {requireAppData})` resolves the session cookie to a valid (refreshed if needed) access token, throwing a typed `DriveAuthError` for the 401/403 cases instead of each endpoint re-implementing them.
- Frontend hook: `renderDriveExplorer()` in `js/app.js`, called from `navigateTo()` when `page === 'media'`, fills `#drive-explorer` (in `index.html`, above the Multimedia tabs) by calling `/api/auth/session` then `/api/drive/list?driveUrl=<App.settings.driveRootUrl>`. Does nothing useful until `driveRootUrl` is set to a real folder link.

### Cross-device sync (Google Drive `appDataFolder`)

The app's entire state (`App.settings/events/songs/members/media` — everything `saveAll()` in `js/app.js` writes) is mirrored to a single hidden file, `malaifama-state.json`, in the logged-in user's Drive `appDataFolder` (a per-app hidden folder, invisible in the user's normal Drive UI — not the same as `drive.file`). This is what makes edits made on one device show up on another, despite there being no real database — see "What this is" above, that's still true, this just piggybacks the existing Drive login instead of adding one.

- Requires the OAuth scope `https://www.googleapis.com/auth/drive.appdata` (`api/auth/login.js`), granted alongside the pre-existing `drive.readonly`. The scope Google actually grants is stored in the session payload (`scope`, set in `callback/google.js`) and exposed as `hasAppData` by `api/auth/session.js` (distinct from `hasDrive`, which only means "has a refresh token" — a session can have Drive access for browsing but not for sync if it predates this feature). **Sessions signed before this feature shipped have no `scope` stored, so `hasAppData` is `false` until the user logs out and back in** — the frontend surfaces this explicitly (Ajustes modal, "cierra sesión y vuelve a entrar") rather than letting Drive's own 403 fail silently.
- `api/drive/state.js` (Edge runtime — no `@vercel/blob` involved here, so none of the Node-runtime issues from the audio feature apply) — `GET` returns `{exists:false}` or `{exists:true, state}`; `POST` creates the file if needed (plain metadata `POST` to `drive/v3/files`, then a `PATCH .../upload/drive/v3/files/{id}?uploadType=media` for content — deliberately avoiding a hand-rolled `multipart/related` body, which Drive's API also supports but isn't worth the added risk here) and overwrites its content; `DELETE` removes it (used by `resetToDefaults()` so a reset isn't silently undone by the next sync).
- Frontend (`js/app.js`): `buildBackupPayload()`/`applyBackupPayload()` are shared between the manual JSON export/import feature and this sync — same shape. `pushToDrive()` runs after every `saveAll()` (best-effort, fire-and-forget) with an in-flight/queued coalescing guard so rapid successive saves (e.g. clicking reorder arrows repeatedly) never fire overlapping requests — at most one extra push runs after the current one finishes, always with the latest state. `syncFromDrive()` runs once on load, awaited before the first `navigateTo()` call, so the app doesn't paint stale local data and then visibly "jump" to synced data a moment later; it's capped by an 8s timeout (`fetchWithTimeout`, wraps `AbortSignal.timeout`) so a backend hang can't freeze the app's first render indefinitely.
- Known limitation, accepted rather than solved: no real conflict resolution across devices — last write to the Drive file wins. Fine in practice since there's exactly one authorized login (`ALLOWED_EMAIL`), so different devices are used sequentially, not concurrently.

**Manual step required** (Google Cloud Console, not doable from this repo): add `drive.appdata` to the OAuth consent screen's configured scopes for the `mala-fama-web` project. Should not require Google verification while the app stays in Testing status. After deploying, the user must log out and back in once for existing sessions to pick up the new scope.

**Required Vercel env vars** (Project Settings → Environment Variables, Production): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_EMAIL` (`malafamaskapunk@gmail.com`), `SESSION_SECRET`, `BLOB_READ_WRITE_TOKEN` (see below). Changing any of these requires a manual redeploy (Deployments → ⋯ → Redeploy) to take effect.

**Google Cloud project**: `mala-fama-web`, OAuth client "Mala Fama Web Client" (Client ID `1098417898448-3klt3pbengv6lrno7fe5569f5tekmmv4.apps.googleusercontent.com`). The OAuth consent screen is intentionally left in **Testing** status with `malafamaskapunk@gmail.com` as the only test user — this is what actually enforces "only this email can log in" (Google itself rejects any other account at the consent step), not just the `ALLOWED_EMAIL` check in `callback/google.js`. Publishing the consent screen to production would remove that restriction.

### Song audio (Vercel Blob)

Each song in `SONGS` (`js/data.js`) has an `audio: { source, driveUrl, upload }` field, independent from the generic `links` array (which is just arbitrary labeled links, e.g. Spotify). `source` is `'drive' | 'upload' | 'none'` and picks which of `driveUrl`/`upload` currently drives playback; the form (`openSongForm()` in `js/app.js`) keeps both populated when the user switches tabs, so nothing is lost until they explicitly remove a file or clear the Drive field. `upload` is Blob metadata only — `{ url, pathname, name, size, type }` — never the file bytes; the bytes live only in Vercel Blob.

- **Playback** (cards and detail modal): `songAudioPlayableUrl()` in `js/app.js` resolves the active source to a URL an `<audio>` tag can play directly. For `source: 'upload'` that's just `upload.url` (a public `*.blob.vercel-storage.com` URL). For `source: 'drive'`, `driveDirectAudioUrl()` rewrites a Drive file share link (`/file/d/<id>/...`) into `https://drive.google.com/uc?export=download&id=<id>`, which streams instead of opening Drive's viewer — this only works for a *file* link, not a folder link, so the UI falls back to a plain "Abrir en Drive" link when the URL doesn't match.
- **Upload flow**: the browser uploads directly to Vercel Blob using Vercel's "client uploads" pattern — bytes never pass through a Vercel Function, which matters because Serverless Functions have a request body limit well under typical song file sizes. `js/app.js` dynamically imports `@vercel/blob/client`'s `upload()` from `https://esm.sh/@vercel/blob@2.6.1/client` at the moment a file is picked (no bundler needed, same spirit as the Google Fonts CDN `<link>` already in `index.html`) and points it at `handleUploadUrl: '/api/audio/upload-token'`.
- **`api/audio/upload-token.js`** — Node.js runtime (no `config.runtime = 'edge'`; `@vercel/blob/client`'s `handleUpload` is documented against the default Node runtime). Requires the `mf_session` cookie before minting a client token, then calls `handleUpload()` restricting `allowedContentTypes` to common audio MIME types and `maximumSizeInBytes` to 150 MB. There's no `onUploadCompleted` database write — there's no database — the frontend gets the blob metadata straight back from `upload()`'s resolved value and saves it itself.
- **`api/audio/delete.js`** — session-gated POST that calls Blob's `del(url)`, used when a song is deleted or its audio file is replaced/removed, to avoid orphaning storage. Validates the URL matches `*.public.blob.vercel-storage.com` first. Called best-effort (fire-and-forget) from the frontend — a failed delete never blocks the localStorage-side operation.
- **Blob store access**: uploads use `access: 'public'` — there's no per-file access control need here (same trust model as the Drive links already used throughout the app), and public access is what lets the `<audio src>` play the file with no signed-URL/session dance.

**Manual setup required** (not something Claude Code can do from the repo): a Vercel Blob store must be created and connected to this project (Project → Storage → Create Database → Blob), which populates `BLOB_READ_WRITE_TOKEN`. Without it, `/api/audio/upload-token` and `/api/audio/delete` will fail at runtime even though the code deploys fine.

## Conventions

- User-facing strings (labels, toasts, modal titles, `LEEME.txt`) are in Spanish — match this when adding UI text.
- New content types follow the existing pattern: a `window.X` seed array in `data.js`, a `malaifama_x` localStorage key, a `renderX()` function, and `open*Form()`/`save*()`/`delete*()` CRUD functions in `app.js`.
