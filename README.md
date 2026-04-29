# Api Requests Deduper

Chrome DevTools extension that adds an **Api Requests Deduper** panel next to
*Network*. The panel lists only XHR/fetch requests and groups identical calls
into a single row with a counter — perfect for spotting React Query
`refetchInterval` polling and other duplicate API traffic.

<img width="1144" height="397" alt="Screenshot 2026-04-29 at 08 49 16" src="https://github.com/user-attachments/assets/ef2c360c-9a2c-4f89-9072-34838398ab50" />

## Features

- DevTools panel that captures only `xhr` and `fetch` resources via
  `chrome.devtools.network.onRequestFinished`.
- Grouping with a configurable dedup key:
  - **Include query string** (default: on) — when off, `?page=1` and `?page=2`
    collapse into one row.
  - **Include request body** (default: off) — useful when polling sends
    different POST bodies.
- Per-row counter (`×N`), method badge with method-specific color, response
  status with HTTP class color, sortable by recency or call count, and a
  free-text filter.
- **Preserve log** toggle that keeps entries across page reloads (off by
  default, just like *Network*).
- Click any row to open a details pane with `Headers` / `Query` /
  `Request Body` / `Response` tabs. The response body is loaded lazily via
  `entry.getContent`, with JSON pretty-printing.

## Project layout

```
manifest.json              # MV3 manifest (devtools_page only)
src/
  devtools/devtools.html   # host page that registers the panel
  devtools/devtools.ts     # chrome.devtools.panels.create(...)
  panel/                   # React app rendered inside the panel
    App.tsx                # raw log -> groups state
    hooks/useNetworkRequests.ts
    lib/dedupKey.ts        # key building + group rebuild
    lib/types.ts
    components/
      Toolbar/             # Clear, Preserve log, dedup toggles, filter, sort
      RequestList/         # left column (header + scroll)
      RequestRow/          # counter badge + method + url + status
      RequestDetails/      # right column with tabs
      Tabs/                # generic tab strip
    styles/global.scss     # DevTools dark palette via CSS variables
```

## Build

Requires **Node 22+** (`.nvmrc` pins the major). With nvm:

```bash
nvm use            # picks up .nvmrc -> Node 22
npm install
npm run build       # tsc --noEmit && vite build  -> dist/
npm run dev         # vite build --watch (rebuilds on save)
```

`dist/` contains the unpacked extension: `manifest.json`, `src/devtools/devtools.html`,
`src/panel/panel.html`, and the bundled assets under `dist/assets/`.

## Install in Chrome

1. Run `npm run build` (or `npm run dev` to keep the bundle fresh while
   editing).
2. Open `chrome://extensions` and turn on **Developer mode** (top-right).
3. Click **Load unpacked** and pick the `dist/` directory.
4. Open DevTools on any page and switch to the **Api Requests Deduper** tab.
5. Refresh the page to start capturing.

Reloading the extension in `chrome://extensions` is required after rebuilding
the `devtools.ts` entry; rebuilds of the panel itself are picked up by simply
closing and reopening DevTools.

## Limitations (intentional, MVP)

- State is per-DevTools session (not persisted to `chrome.storage`).
- No splitter, no list virtualization, no HAR export.
- The dedup-settings toggles are kept in component state, so closing and
  re-opening DevTools resets them to defaults.
