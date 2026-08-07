Roblox Customizer

keep your cursors, sounds, textures, fonts in one place and easily apply them to new versions / automatically apply seamlessly (at least trying to lmao)

Features

- Cursors, sounds, fonts, skyboxes, materials — each with presets
- Profiles to save and switch between complete setups
- Auto-apply watcher: detects Roblox version changes and reapplies mods
- Import/export preset packs
- Bundled cursor and sound presets in `custom-assets/`

Stack

Electron, React, Vite, Tailwind CSS, zustand



how to run?:

npm install
npm start        # build + launch
npm run dev      # dev mode with hot reload

how to build?:

npm run dist         # Windows
npm run dist:linux   # Linux
npm run dist:all     # Windows + Linux

output in `release/`.

# for none tech geeks, open your terminal either by administrator/root preveligies or not then change the directory into where this project is. Type npm run dist, in the main folder a release folder will be created and you can run the app from there easily
