# Roblox Customizer

Swap Roblox cursors, sounds, fonts, skyboxes, and materials — survives updates via auto-apply.

## Stack

- Electron + Vite + React
- Tailwind CSS + zustand
- chokidar (file watcher)

## Quick start

```bash
npm install
npm run dev       # dev mode with hot reload
npm run build    # build frontend
npm run dist     # package for your platform
```

## Preset packs

Import/export `.rcpack` files (zip archives with a manifest). Bundled presets live in `custom-assets/`.

Currently supports Linux with Sober and Windows with vanilla Roblox.
