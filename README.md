# Roblox Customizer

> A desktop utility for managing and applying local Roblox cosmetic customizations.

> [!CAUTION]
> **Use at your own risk.**
>
> Roblox Customizer only applies local cosmetic modifications such as cursors,
> fonts, sounds, textures, skyboxes, and materials. It does not inject code,
> modify the Roblox executable, manipulate memory, automate gameplay, or provide
> gameplay advantages.
>
> Roblox may detect modified client files or third-party software and take
> action on an account. I cannot guarantee that using this tool will never
> result in account restrictions.
>
> By using this tool, you acknowledge that you are responsible for your own
> use of it and any consequences that may result from doing so.

## Features

- Cursors, sounds, fonts, skyboxes, and materials
- Presets for each asset type
- Profiles for saving and switching between complete setups
- Automatic reapplication when Roblox updates
- Import/export preset packs
- Bundled assets and sound presets

## Compatibility

### Windows

Supports the native Roblox client.

Third-party bootstrapper clients such as Bloxstrap and Fishstrap are
currently not supported.

### Linux

Currently supports Sober via Flatpak.

## Asset Library

Additional cursors, fonts, and other assets can be added manually to
`custom-assets/`.

More asset types are currently being added.

## Tech Stack

- Electron
- React
- Vite
- Tailwind CSS
- Zustand

## Building from Source

### Requirements

- Node.js

### Run

```bash
npm install
npm start
