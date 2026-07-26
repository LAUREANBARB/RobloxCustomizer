const path = require('path');
const fs = require('fs');
const { DIRS, OWNER_DIRS, PROFILES_DIR, CURSOR_SUBPATH, SOUND_SUBPATH, FONT_SUBPATH, SKYBOX_SUBPATH, MATERIAL_SUBPATH, loadConfig, saveConfig, IS_LINUX } = require('./config');
const { getRobloxBase, getRobloxOverlayDir, isSoberRoblox, getLatestRobloxVersion } = require('./roblox');

const PRESET_TYPES = {
  cursors: {
    extensions: ['.png'],
    overlaySubpath: path.join('content', 'textures', 'Cursors', 'KeyboardMouse'),
    robloxSubpath: CURSOR_SUBPATH,
  },
  sounds: {
    extensions: ['.ogg', '.mp3', '.wav'],
    overlaySubpath: path.join('content', 'sounds'),
    robloxSubpath: SOUND_SUBPATH,
  },
  fonts: {
    extensions: ['.ttf', '.otf'],
    overlaySubpath: path.join('content', 'fonts'),
    robloxSubpath: FONT_SUBPATH,
  },
  skyboxes: {
    extensions: ['.tex'],
    overlaySubpath: path.join('content', 'sky'),
    robloxSubpath: SKYBOX_SUBPATH,
  },
  materials: {
    extensions: ['.tex', '.png'],
    overlaySubpath: path.join('content', 'textures'),
    robloxSubpath: MATERIAL_SUBPATH,
  },
};

function cap(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function activeKey(type) {
  return 'active' + cap(type) + 'Preset';
}

// -- Bundled presets ---------------------------------------------------------

function syncBundledPresets() {
  const bundledBase = path.join(__dirname, '..', '..', 'custom-assets');
  if (!fs.existsSync(bundledBase)) return;

  const mappings = Object.keys(PRESET_TYPES).map((type) => ({
    src: path.join(bundledBase, type === 'cursors' ? 'cursors' : type),
    dest: DIRS[type],
  }));

  mappings.forEach(({ src, dest }) => {
    if (!fs.existsSync(src)) return;
    fs.readdirSync(src)
      .filter((d) => fs.statSync(path.join(src, d)).isDirectory())
      .forEach((presetName) => {
        const srcDir = path.join(src, presetName);
        const destDir = path.join(dest, presetName);
        if (fs.existsSync(destDir)) return;
        fs.mkdirSync(destDir, { recursive: true });
        fs.readdirSync(srcDir).forEach((file) => {
          const srcFile = path.join(srcDir, file);
          if (fs.statSync(srcFile).isFile()) fs.copyFileSync(srcFile, path.join(destDir, file));
        });
      });
  });
}

// -- Scanning & resolution ---------------------------------------------------

function scanTypeDirs(type) {
  if (!DIRS[type]) return [];
  if (!fs.existsSync(DIRS[type])) return [];
  return fs.readdirSync(DIRS[type]).filter((d) => fs.statSync(path.join(DIRS[type], d)).isDirectory());
}

function getPresetFiles(type, presetName) {
  const dir = path.join(DIRS[type], presetName);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile());
}

function resolvePresetDir(type, name) {
  const userPath = path.join(DIRS[type], name);
  if (fs.existsSync(userPath)) return { dir: userPath, source: 'custom' };
  const ownerPath = path.join(OWNER_DIRS[type], name);
  if (fs.existsSync(ownerPath)) return { dir: ownerPath, source: 'owner' };
  return null;
}

// -- Apply helpers -----------------------------------------------------------

function getOverlayOrRobloxDir(type, versionDir) {
  const overlayDir = getRobloxOverlayDir();
  if (overlayDir && IS_LINUX) {
    const targetDir = path.join(overlayDir, PRESET_TYPES[type].overlaySubpath);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    return targetDir;
  }
  const baseDir = path.join(getRobloxBase(), versionDir, PRESET_TYPES[type].robloxSubpath);
  if (versionDir !== 'latest' && !fs.existsSync(baseDir)) return null;
  return baseDir;
}

function applyPreset(type, presetName, versionDir, presetDir) {
  const cfg = PRESET_TYPES[type];
  const src = presetDir || path.join(DIRS[type], presetName);
  if (!fs.existsSync(src)) return false;
  const destDir = getOverlayOrRobloxDir(type, versionDir);
  if (!destDir) return false;
  const files = fs.readdirSync(src).filter((f) => cfg.extensions.some((ext) => f.toLowerCase().endsWith(ext)));
  files.forEach((f) => fs.copyFileSync(path.join(src, f), path.join(destDir, f)));
  return files.length > 0;
}

function reapplyAllMods(version) {
  const config = loadConfig();
  if (!version) {
    version = getLatestRobloxVersion();
    if (!version) return { success: false, reason: 'No Roblox version found' };
  }
  const applied = {};
  Object.keys(PRESET_TYPES).forEach((type) => {
    const key = activeKey(type);
    const presetName = config[key];
    if (presetName) {
      const resolved = resolvePresetDir(type, presetName);
      applied[type] = resolved ? applyPreset(type, presetName, version, resolved.dir) : false;
    } else {
      applied[type] = false;
    }
  });
  return { success: true, version, applied };
}

// -- IPC-friendly handler functions ------------------------------------------

function getAllPresets(type) {
  const config = loadConfig();
  const key = activeKey(type);
  return {
    presets: scanTypeDirs(type),
    active: config[key] || null,
  };
}

function setActivePreset(type, presetName) {
  const config = loadConfig();
  const key = activeKey(type);
  config[key] = presetName;
  saveConfig(config);
  const version = getLatestRobloxVersion();
  if (version && presetName) {
    const resolved = resolvePresetDir(type, presetName);
    if (resolved) applyPreset(type, presetName, version, resolved.dir);
  }
  return { success: true };
}

function removeActivePreset(type) {
  const config = loadConfig();
  const key = activeKey(type);
  const wasActive = config[key];
  config[key] = null;
  saveConfig(config);
  if (wasActive) reapplyAllMods();
  return { success: true };
}

function deletePreset(type, presetName) {
  const dir = path.join(DIRS[type], presetName);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  const config = loadConfig();
  const key = activeKey(type);
  if (config[key] === presetName) {
    config[key] = null;
    saveConfig(config);
    reapplyAllMods();
  }
  return { success: true };
}

function getPreviewData(type, presetName, fileName, source) {
  const MAX_SIZE = 5 * 1024 * 1024;
  const base = source === 'owner' ? OWNER_DIRS[type] : DIRS[type];
  const filePath = path.join(base, presetName, fileName);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(base) + path.sep)) return { error: 'Invalid path' };
  if (!fs.existsSync(resolved)) return { error: 'File not found' };
  const stat = fs.statSync(resolved);
  if (stat.size > MAX_SIZE) return { error: 'File too large' };
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') {
    return { data: fs.readFileSync(resolved).toString('base64'), type: 'image/png' };
  }
  if (['.ogg', '.mp3', '.wav'].includes(ext)) {
    return { data: fs.readFileSync(resolved).toString('base64'), type: 'audio/' + (ext === '.ogg' ? 'ogg' : ext.slice(1)) };
  }
  return { error: 'Unsupported file type' };
}

// -- Categorized ------------------------------------------------------------

function getCategorizedPresets() {
  const result = {};
  Object.keys(PRESET_TYPES).forEach((type) => {
    result[type] = scanTypeDirs(type);
  });
  return result;
}

// -- Profiles ---------------------------------------------------------------

function listProfiles() {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs.readdirSync(PROFILES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(PROFILES_DIR, f), 'utf-8'));
      } catch { return null; }
    })
    .filter(Boolean);
}

function saveProfile(profile) {
  if (!fs.existsSync(PROFILES_DIR)) fs.mkdirSync(PROFILES_DIR, { recursive: true });
  fs.writeFileSync(path.join(PROFILES_DIR, profile.name + '.json'), JSON.stringify(profile, null, 2));
  return { success: true };
}

function applyProfile(profile) {
  const config = loadConfig();
  Object.keys(PRESET_TYPES).forEach((type) => {
    const ak = activeKey(type);
    config[ak] = profile[ak] || null;
  });
  config.activeProfile = profile.name || null;
  saveConfig(config);
  reapplyAllMods();
  return { success: true };
}

function deleteProfile(name) {
  const filePath = path.join(PROFILES_DIR, name + '.json');
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { success: true };
}

module.exports = {
  cap,
  activeKey,
  syncBundledPresets,
  scanTypeDirs,
  getPresetFiles,
  resolvePresetDir,
  applyPreset,
  reapplyAllMods,
  getAllPresets,
  setActivePreset,
  removeActivePreset,
  deletePreset,
  getPreviewData,
  getCategorizedPresets,
  listProfiles,
  saveProfile,
  applyProfile,
  deleteProfile,
};
