# Roblox Customizer

keep your cursors, sounds, textures, fonts in one place and easily apply them to new versions / automatically apply seamlessly (at least trying to lmao)

# Features

- Cursors, sounds, fonts, skyboxes, materials — each with presets
- Profiles to save and switch between complete setups
- Auto-apply watcher: detects Roblox version changes and reapplies mods
- Import/export preset packs
- Bundled cursor and sound presets in `custom-assets/`

# Stack

Electron, React, Vite, Tailwind CSS, zustand

output in `release/`.

# For building from source

How to run?:

- npm start        # build + launch (if you get errors run *npm install*)
- npm run dev      # dev mode with hot reload

How to build without running?:

- npm run dist         # Windows
- npm run dist:linux   # Linux
- npm run dist:all     # Windows + Linux
