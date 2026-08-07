const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const extract = require('extract-zip');
const { dialog } = require('electron');
const { DIRS, loadConfig, saveConfig } = require('./config');
const { reapplyAllMods } = require('./presets');

function exportPack(type, presetName, win) {
  const presetDir = path.join(DIRS[type], presetName);
  if (!fs.existsSync(presetDir)) return { success: false, reason: 'Preset not found' };

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
  const tempDir = path.join(DIRS.cursors, '..', '.tmp-import-' + Date.now());
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    await extract(packPath, { dir: tempDir });
    const manifestPath = path.join(tempDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) return { success: false, reason: 'Invalid pack: no manifest' };
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const { type, name } = manifest;
    if (!type || !DIRS[type]) return { success: false, reason: 'Invalid pack: unknown type' };
    if (!name) return { success: false, reason: 'Invalid pack: no name' };

    const destDir = path.join(DIRS[type], name);
    if (fs.existsSync(destDir)) return { success: false, reason: `Preset "${name}" already exists` };
    fs.mkdirSync(destDir, { recursive: true });

    fs.readdirSync(tempDir).forEach((file) => {
      if (file === 'manifest.json') return;
      const srcFile = path.join(tempDir, file);
      if (fs.statSync(srcFile).isFile()) fs.copyFileSync(srcFile, path.join(destDir, file));
    });

    const subdirs = fs.readdirSync(tempDir).filter((d) => fs.statSync(path.join(tempDir, d)).isDirectory());
    subdirs.forEach((sub) => {
      fs.readdirSync(path.join(tempDir, sub)).forEach((file) => {
        fs.copyFileSync(path.join(tempDir, sub, file), path.join(destDir, file));
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
    saveConfig(data);
    reapplyAllMods();
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

module.exports = { exportPack, importPack, backupConfig, restoreConfig };
