# Roblox Customizer

A desktop utility for managing and applying local Roblox cosmetic customizations.

> [!CAUTION]
> Roblox Customizer only applies local cosmetic changes (cursors, fonts,
> sounds, textures, skyboxes, materials). It does not inject code, modify the
> Roblox executable, read or write process memory, or automate gameplay.
>
> Modifying Roblox's local files may still go against Roblox's Terms of Use,
> and I can't guarantee it won't be flagged. Use at your own risk.
>
> This project is not affiliated with or endorsed by Roblox Corporation.

## Features

- Cursors, sounds, fonts, skyboxes, and materials
- Presets for each asset type
- Profiles for saving and switching between complete setups
- Automatic reapplication when Roblox updates
- Import/export preset packs
- Bundled assets and sound presets

## Compatibility

| Platform | Support |
|----------|---------|
| Windows | Native Roblox client. Bloxstrap and Fishstrap are not supported yet. |
| Linux | Sober (Flatpak) |

## Asset Library

Add your own cursors, fonts, and other assets to `custom-assets/`.
More asset types are coming.

## Tech Stack

Electron, React, Vite, Tailwind CSS, Zustand

## Building from Source

Requires Node.js.

```bash
npm install
npm start
```
