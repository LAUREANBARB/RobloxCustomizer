const path = require('path');
const fs = require('fs');
const { DIRS, CURSOR_SUBPATH, SHIFTLOCK_SUBPATH, SOUND_SUBPATH, FONT_SUBPATH, SKYBOX_SUBPATH, MATERIAL_SUBPATH, APP_DATA, loadConfig, saveConfig, IS_LINUX, cap } = require('./config');
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

const BACKUP_DIR = path.join(APP_DATA, 'backups');

function backupFile(destDir, fileName, type) {
  if (getRobloxOverlayDir()) return;
  const src = path.join(destDir, fileName);
  if (!fs.existsSync(src)) return;
  const backupDir = path.join(BACKUP_DIR, type);
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, fileName);
  if (!fs.existsSync(backupPath)) fs.copyFileSync(src, backupPath);
}

function restoreFile(destDir, fileName, type) {
  const dest = path.join(destDir, fileName);
  const backupPath = path.join(BACKUP_DIR, type, fileName);
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, dest);
    fs.rmSync(backupPath);
  } else if (fs.existsSync(dest)) {
    fs.rmSync(dest);
  }
}

const { PNG } = require('pngjs');

async function writeImage(src, dest, size) {
  if (size > 0) {
    try {
      const input = PNG.sync.read(fs.readFileSync(src));
      const { width, height } = input;
      if (width !== size || height !== size) {
        const ratioX = width / size;
        const ratioY = height / size;
        const out = new PNG({ width: size, height: size });
        for (let y = 0; y < size; y++) {
          const sy = Math.min(Math.floor(y * ratioY), height - 1);
          for (let x = 0; x < size; x++) {
            const sx = Math.min(Math.floor(x * ratioX), width - 1);
            const si = (sy * width + sx) << 2;
            const di = (y * size + x) << 2;
            out.data[di] = input.data[si];
            out.data[di + 1] = input.data[si + 1];
            out.data[di + 2] = input.data[si + 2];
            out.data[di + 3] = input.data[si + 3];
          }
        }
        fs.writeFileSync(dest, PNG.sync.write(out));
        return;
      }
    } catch {
      fs.copyFileSync(src, dest);
      return;
    }
  }
  fs.copyFileSync(src, dest);
}

async function applyPreset(type, presetName, versionDir, presetDir) {
  const cfg = PRESET_TYPES[type];
  const config = loadConfig();
  const size = (type === 'cursors' || type === 'shiftlock') ? (type === 'shiftlock' && config.forceShiftlockSize > 0 ? config.forceShiftlockSize : config.forceSize || 0) : 0;
  const src = presetDir || path.join(DIRS[type], presetName);
  if (!fs.existsSync(src)) return false;
  const destDir = getOverlayOrRobloxDir(type, versionDir);
  if (!destDir) return false;
  const files = fs.readdirSync(src).filter((f) => cfg.extensions.some((ext) => f.toLowerCase().endsWith(ext)));

  if (type === 'shiftlock' && files.length > 0) {
    backupFile(destDir, 'MouseLockedCursor.png', type);
    await writeImage(path.join(src, files[0]), path.join(destDir, 'MouseLockedCursor.png'), size);
    return true;
  }

  for (const f of files) {
    backupFile(destDir, f, type);
    await writeImage(path.join(src, f), path.join(destDir, f), size);
  }
  return files.length > 0;
}

function removeAppliedFiles(type, presetName) {
  const version = getLatestRobloxVersion();
  if (!version) return;
  const destDir = getOverlayOrRobloxDir(type, version);
  if (!destDir) return;
  const cfg = PRESET_TYPES[type];
  const src = path.join(DIRS[type], presetName);
  if (!fs.existsSync(src)) return;
  const files = fs.readdirSync(src).filter((f) => cfg.extensions.some((ext) => f.toLowerCase().endsWith(ext)));

  if (type === 'shiftlock' && files.length > 0) {
    restoreFile(destDir, 'MouseLockedCursor.png', type);
    return;
  }

  files.forEach((f) => restoreFile(destDir, f, type));
}

async function reapplyAllMods(version) {
  const config = loadConfig();
  if (!version) {
    version = getLatestRobloxVersion();
    if (!version) return { success: false, reason: 'No Roblox version found' };
  }
  const applied = {};
  for (const type of Object.keys(PRESET_TYPES)) {
    const key = activeKey(type);
    const presetName = config[key];
    if (presetName) {
      const resolved = resolvePresetDir(type, presetName);
      applied[type] = resolved ? await applyPreset(type, presetName, version, resolved.dir) : false;
    } else {
      applied[type] = false;
    }
  }
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

async function setActivePreset(type, presetName) {
  const config = loadConfig();
  const key = activeKey(type);
  config[key] = presetName;
  saveConfig(config);
  const version = getLatestRobloxVersion();
  if (version && presetName) {
    const resolved = resolvePresetDir(type, presetName);
    if (resolved) await applyPreset(type, presetName, version, resolved.dir);
  }
  return { success: true };
}

async function removeActivePreset(type) {
  const config = loadConfig();
  const key = activeKey(type);
  const wasActive = config[key];
  config[key] = null;
  saveConfig(config);
  if (wasActive) {
    removeAppliedFiles(type, wasActive);
    await reapplyAllMods();
  }
  return { success: true };
}

async function deletePreset(type, presetName) {
  const config = loadConfig();
  const key = activeKey(type);
  if (config[key] === presetName) {
    removeAppliedFiles(type, presetName);
    config[key] = null;
    saveConfig(config);
  }
  const dir = path.join(DIRS[type], presetName);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
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
  if (['.ttf', '.otf'].includes(ext)) {
    const mime = ext === '.ttf' ? 'font/ttf' : 'font/otf';
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

async function applyProfile(profile) {
  const config = loadConfig();
  Object.entries(PROFILE_KEYS).forEach(([shortKey, ak]) => {
    config[ak] = profile[shortKey] || null;
  });
  config.activeProfile = profile.name || null;
  saveConfig(config);
  await reapplyAllMods();
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
