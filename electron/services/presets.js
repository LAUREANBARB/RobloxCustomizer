const path = require('path');
const fs = require('fs');
const { DIRS, CURSOR_SUBPATH, SHIFTLOCK_SUBPATH, SOUND_SUBPATH, FONT_SUBPATH, SKYBOX_SUBPATH, MATERIAL_SUBPATH, loadConfig, saveConfig, IS_LINUX, cap } = require('./config');
const { getRobloxBase, getRobloxOverlayDir, getLatestRobloxVersion } = require('./roblox');

const PRESET_TYPES = {
  cursors: {
    extensions: ['.png'],
    overlaySubpath: path.join('content', 'textures', 'Cursors', 'KeyboardMouse'),
    robloxSubpath: CURSOR_SUBPATH,
  },
  shiftlock: {
    extensions: ['.png'],
    overlaySubpath: path.join('content', 'textures'),
    robloxSubpath: SHIFTLOCK_SUBPATH,
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

function activeKey(type) {
  return 'active' + cap(type.replace(/s$/, '')) + 'Preset';
}

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
  const dir = path.join(DIRS[type], name);
  if (fs.existsSync(dir)) return { dir, source: 'custom' };
  return null;
}

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

  if (type === 'shiftlock' && files.length > 0) {
    fs.copyFileSync(path.join(src, files[0]), path.join(destDir, 'MouseLockedCursor.png'));
    return true;
  }

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

function getAllPresets(type) {
  const config = loadConfig();
  const key = activeKey(type);
  const activeName = config[key] || null;
  return scanTypeDirs(type).map((name) => {
    const resolved = resolvePresetDir(type, name);
    return {
      name,
      files: getPresetFiles(type, name),
      source: resolved ? resolved.source : 'custom',
      active: name === activeName,
    };
  });
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

function getPreviewData(type, presetName, fileName) {
  const MAX_SIZE = 5 * 1024 * 1024;
  const base = DIRS[type];
  const filePath = path.join(base, presetName, fileName);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(base) + path.sep)) return null;
  if (!fs.existsSync(resolved)) return null;
  const stat = fs.statSync(resolved);
  if (stat.size > MAX_SIZE) return null;
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') {
    return 'data:image/png;base64,' + fs.readFileSync(resolved).toString('base64');
  }
  if (['.ogg', '.mp3', '.wav'].includes(ext)) {
    const mime = ext === '.ogg' ? 'audio/ogg' : 'audio/' + ext.slice(1);
    return 'data:' + mime + ';base64,' + fs.readFileSync(resolved).toString('base64');
  }
  return null;
}

function getCategorizedPresets() {
  const result = {};
  Object.keys(PRESET_TYPES).forEach((type) => {
    const presetNames = scanTypeDirs(type);
    const groups = {};
    presetNames.forEach((name) => {
      const resolved = resolvePresetDir(type, name);
      const source = resolved ? resolved.source : 'custom';
      if (!groups[source]) groups[source] = [];
      groups[source].push({
        name,
        files: getPresetFiles(type, name),
        source,
      });
    });
    result[type] = Object.entries(groups).map(([source, presets]) => ({
      name: source.charAt(0).toUpperCase() + source.slice(1), // Bundled / Custom
      presets,
    }));
  });
  return result;
}

function listProfiles() {
  if (!fs.existsSync(DIRS.profiles)) return [];
  return fs.readdirSync(DIRS.profiles)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(DIRS.profiles, f), 'utf-8'));
      } catch (err) {
        console.error('Failed to parse profile:', err.message); return null; }
    })
    .filter(Boolean);
}

function saveProfile(profile) {
  if (!fs.existsSync(DIRS.profiles)) fs.mkdirSync(DIRS.profiles, { recursive: true });
  fs.writeFileSync(path.join(DIRS.profiles, profile.name + '.json'), JSON.stringify(profile, null, 2));
  return { success: true };
}

const PROFILE_KEYS = {
  cursor: 'activeCursorPreset',
  sound: 'activeSoundPreset',
  font: 'activeFontPreset',
  skybox: 'activeSkyboxPreset',
  material: 'activeMaterialPreset',
};

function applyProfile(profile) {
  const config = loadConfig();
  Object.entries(PROFILE_KEYS).forEach(([shortKey, ak]) => {
    config[ak] = profile[shortKey] || null;
  });
  config.activeProfile = profile.name || null;
  saveConfig(config);
  reapplyAllMods();
  return { success: true };
}

function deleteProfile(name) {
  const filePath = path.join(DIRS.profiles, name + '.json');
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { success: true };
}

module.exports = {
  activeKey,
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
