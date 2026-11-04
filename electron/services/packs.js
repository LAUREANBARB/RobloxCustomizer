const path = require('path');
const fs = require('fs');
const os = require('os');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { dialog } = require('electron');
const { DIRS, PRESET_TYPES, loadConfig, saveConfig, sanitizeConfig } = require('./config');
const { reapplyAllMods } = require('./presets');
const { isSafeName, resolveInside } = require('./safe-path');

const MAX_PACK_BYTES = 50 * 1024 * 1024;
const MAX_PACK_ENTRIES = 1000;
const MAX_UNPACKED_BYTES = 200 * 1024 * 1024;

function exportPack(type, presetName, win) {
  if (!PRESET_TYPES.includes(type) || !isSafeName(presetName)) {
    return { success: false, reason: 'Invalid preset' };
  }
  const presetDir = resolveInside(DIRS[type], presetName);
  if (!presetDir || !fs.existsSync(presetDir)) return { success: false, reason: 'Preset not found' };

  return new Promise((resolve) => {
    dialog.showSaveDialog(win, {
      defaultPath: `${presetName}.rcpack`,
      filters: [{ name: 'Roblox Customizer Pack', extensions: ['rcpack'] }],
    }).then((result) => {
      if (result.canceled) return resolve({ success: false, reason: 'Cancelled' });
      const output = fs.createWriteStream(result.filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', (err) => resolve({ success: false, reason: err.message }));
      output.on('close', () => resolve({ success: true, path: result.filePath }));
      archive.pipe(output);
      archive.directory(presetDir, false);
      archive.append(JSON.stringify({ type, name: presetName, version: 1 }), { name: 'manifest.json' });
      archive.finalize();
    }).catch((err) => resolve({ success: false, reason: err.message }));
  });
}

async function importPack(win) {
  const result = await dialog.showOpenDialog(win, {
    filters: [{ name: 'Roblox Customizer Pack', extensions: ['rcpack'] }],
    properties: ['openFile'],
  });
  if (result.canceled || result.filePaths.length === 0) return { success: false, reason: 'Cancelled' };

  const packPath = result.filePaths[0];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-import-'));

  try {
    if (fs.statSync(packPath).size > MAX_PACK_BYTES) return { success: false, reason: 'Pack is too large' };

    const zip = new AdmZip(packPath);
    const entries = zip.getEntries();
    if (entries.length > MAX_PACK_ENTRIES) return { success: false, reason: 'Pack has too many files' };

    let unpackedBytes = 0;
    for (const entry of entries) {
      const parts = entry.entryName.split(/[\\/]/);
      if (path.isAbsolute(entry.entryName) || parts.includes('..')) {
        return { success: false, reason: 'Invalid pack: unsafe file path' };
      }
      unpackedBytes += entry.header.size;
      if (unpackedBytes > MAX_UNPACKED_BYTES) return { success: false, reason: 'Pack is too large' };
    }
    zip.extractAllTo(tempDir, true);

    const manifestPath = path.join(tempDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return { success: false, reason: 'Invalid pack: no manifest' };
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const { type, name } = manifest;
    if (!PRESET_TYPES.includes(type)) return { success: false, reason: 'Invalid pack: unknown type' };
    if (!isSafeName(name)) return { success: false, reason: 'Invalid pack: invalid name' };

    const destDir = resolveInside(DIRS[type], name);
    if (!destDir) return { success: false, reason: 'Invalid pack: invalid name' };
    if (fs.existsSync(destDir)) return { success: false, reason: `Preset "${name}" already exists` };
    fs.mkdirSync(destDir, { recursive: true });

    const topLevel = fs.readdirSync(tempDir);
    topLevel.forEach((file) => {
      if (file === 'manifest.json') return;
      const srcFile = path.join(tempDir, file);
      if (fs.lstatSync(srcFile).isFile()) fs.copyFileSync(srcFile, path.join(destDir, file));
    });

    topLevel.forEach((sub) => {
      const subDir = path.join(tempDir, sub);
      if (!fs.lstatSync(subDir).isDirectory()) return;
      fs.readdirSync(subDir).forEach((file) => {
        const srcFile = path.join(subDir, file);
        if (fs.lstatSync(srcFile).isFile()) fs.copyFileSync(srcFile, path.join(destDir, file));
      });
    });

    return { success: true, type, name };
  } catch (err) {
    return { success: false, reason: err.message };
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function backupConfig(win) {
  const config = loadConfig();
  return new Promise((resolve) => {
    dialog.showSaveDialog(win, {
      defaultPath: `RobloxCustomizer-backup.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }],
    }).then((result) => {
      if (result.canceled) return resolve({ success: false, reason: 'Cancelled' });
      fs.writeFileSync(result.filePath, JSON.stringify(config, null, 2));
      resolve({ success: true, path: result.filePath });
    }).catch((err) => resolve({ success: false, reason: err.message }));
  });
}

async function restoreConfig(win) {
  const result = await dialog.showOpenDialog(win, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (result.canceled || result.filePaths.length === 0) return { success: false, reason: 'Cancelled' };
  try {
    const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
    saveConfig(sanitizeConfig(data));
    await reapplyAllMods();
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

module.exports = { exportPack, importPack, backupConfig, restoreConfig };
