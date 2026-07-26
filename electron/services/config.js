const path = require('path');
const fs = require('fs');

const IS_WINDOWS = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';
const IS_MAC = process.platform === 'darwin';

function getAppDataDir() {
  if (IS_WINDOWS) return path.join(process.env.APPDATA, 'RobloxCustomizer');
  if (IS_LINUX) return path.join(process.env.HOME, '.config', 'RobloxCustomizer');
  if (IS_MAC) return path.join(process.env.HOME, 'Library', 'Application Support', 'RobloxCustomizer');
  return path.join(__dirname, '..', '..', 'RobloxCustomizer');
}

const APP_DATA = getAppDataDir();

const DIRS = {
  cursors: path.join(APP_DATA, 'cursor-presets'),
  sounds: path.join(APP_DATA, 'sound-presets'),
  fonts: path.join(APP_DATA, 'font-presets'),
  skyboxes: path.join(APP_DATA, 'skybox-presets'),
  materials: path.join(APP_DATA, 'material-presets'),
  profiles: path.join(APP_DATA, 'profiles'),
};

const OWNER_DIRS = {
  cursors: path.join(__dirname, '..', '..', 'custom-assets', 'cursors'),
  sounds: path.join(__dirname, '..', '..', 'custom-assets', 'sounds'),
  fonts: path.join(__dirname, '..', '..', 'custom-assets', 'fonts'),
  skyboxes: path.join(__dirname, '..', '..', 'custom-assets', 'skyboxes'),
  materials: path.join(__dirname, '..', '..', 'custom-assets', 'materials'),
};

const CURSOR_SUBPATH = path.join('content', 'textures', 'Cursors', 'keyboardmouse');
const SOUND_SUBPATH = path.join('content', 'Sounds');
const FONT_SUBPATH = path.join('content', 'fonts');
const SKYBOX_SUBPATH = path.join('PlatformContent', 'pc', 'textures', 'sky');
const MATERIAL_SUBPATH = path.join('PlatformContent', 'pc', 'textures');

const CONFIG_PATH = path.join(APP_DATA, 'config.json');

const DEFAULT_CONFIG = {
  activeCursorPreset: null, activeSoundPreset: null, activeFontPreset: null,
  activeSkyboxPreset: null, activeMaterialPreset: null, activeProfile: null,
  watcherEnabled: false, trayNotified: false, theme: '',
  startMinimized: false, previewVolume: 50, watcherInterval: 2,
};

let configCache = null;
let configCacheTime = 0;
const CONFIG_CACHE_TTL = 2000;

function ensureDirs() {
  Object.values(DIRS).forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

function loadConfig(bypassCache) {
  const now = Date.now();
  if (!bypassCache && configCache && (now - configCacheTime) < CONFIG_CACHE_TTL) return configCache;
  if (!fs.existsSync(CONFIG_PATH)) {
    const def = { ...DEFAULT_CONFIG };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(def, null, 2));
    configCache = def; configCacheTime = now; return def;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    configCache = parsed; configCacheTime = now; return parsed;
  } catch {
    configCache = { ...DEFAULT_CONFIG }; configCacheTime = now; return configCache;
  }
}

function saveConfig(config) {
  ensureDirs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  configCache = config; configCacheTime = Date.now();
}

module.exports = {
  APP_DATA, DIRS, OWNER_DIRS, CONFIG_PATH, DEFAULT_CONFIG,
  CURSOR_SUBPATH, SOUND_SUBPATH, FONT_SUBPATH, SKYBOX_SUBPATH, MATERIAL_SUBPATH,
  IS_WINDOWS, IS_LINUX, IS_MAC,
  ensureDirs, loadConfig, saveConfig,
};
