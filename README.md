# scratchpad

A fast, minimal scratchpad + text editor that runs in the browser. Installable as a PWA — doubles as a lightweight replacement for firing up VS Code to tweak a single file.

Live: https://matan1905.github.io/scratchpad/

## Features

- Tabbed scratch notes (persistent in IndexedDB)
- Open files from disk via picker, drag-drop, or OS double-click (PWA file handlers, Chromium)
- Edit + Save back to the original file (File System Access API)
- Syntax highlighting for ~40 languages via CodeMirror 6
- Auto RTL/LTR per line (Hebrew + English mixed docs look right); forced LTR for code
- Offline-capable (service worker)

## Keyboard

- `⌘N` / `Ctrl+N` — new scratch tab
- `⌘O` / `Ctrl+O` — open file
- `⌘S` / `Ctrl+S` — save (writes back to the original file if opened from disk)
- `⌘W` / `Ctrl+W` — close tab
- Double-click a tab title to rename

## Dev

```bash
npm install
npm run dev
npm run build   # outputs dist/
```

Deployed automatically on push to `main` via GitHub Actions (see `.github/workflows/deploy.yml`). Repo Pages setting must be "GitHub Actions".
