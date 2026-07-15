# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a static, single-page internal management app for Mala Fama, a Costa Rican ska-punk band (events, songs, media, members). Vanilla HTML/CSS/JS — no framework, no build step, no `package.json`, no npm dependencies (only Google Fonts loaded from the CDN in `index.html`). The project folder, `localStorage` key prefix (`malaifama_*`), and internal identifiers still use the app's original working name "Malaifama" — only user-facing text was updated to the band's real name "Mala Fama".

## Running / developing

There is no build or dev-server command. Open `index.html` directly in a browser, or serve the folder with any static server (e.g. VS Code "Live Server") for a better experience. No test suite or linter is configured.

## Deployment

Pushing to `main` triggers `.github/workflows/pages.yml`, which deploys the repository root as-is to GitHub Pages (`actions/deploy-pages@v4`). No build artifacts are produced — the checked-out tree is uploaded directly.

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

## Conventions

- User-facing strings (labels, toasts, modal titles, `LEEME.txt`) are in Spanish — match this when adding UI text.
- New content types follow the existing pattern: a `window.X` seed array in `data.js`, a `malaifama_x` localStorage key, a `renderX()` function, and `open*Form()`/`save*()`/`delete*()` CRUD functions in `app.js`.
