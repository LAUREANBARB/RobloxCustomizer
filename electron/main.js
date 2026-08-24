const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

if (process.platform === 'linux') {
  app.disableHardwareAcceleration();
}

const { loadConfig, saveConfig, ensureDirs, IS_LINUX, DIRS } = require('./services/config');
const { getLatestRobloxVersion, getOldRobloxVersions, isRobloxRunning, killRobloxProcess, launchRoblox, cleanOldVersions } = require('./services/roblox');
const { getAllPresets, setActivePreset, removeActivePreset, deletePreset, getPreviewData, reapplyAllMods, getCategorizedPresets, listProfiles, saveProfile, applyProfile, deleteProfile, activeKey } = require('./services/presets');
const { startWatcher, restartWatcherIfConfigChanged } = require('./services/watcher');
const { createTray, rebuildMenu } = require('./services/tray');
const { exportPack, importPack, backupConfig, restoreConfig } = require('./services/packs');
const { checkForUpdates, downloadAndInstall } = require('./services/updater');

let mainWindow = null;
let isQuitting = false;

const PRESET_TYPES = ['cursors', 'shiftlock', 'sounds', 'fonts', 'skyboxes', 'materials'];

function send(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, data);
}

function handleConfigChange(newConfig) {
  saveConfig(newConfig);
  restartWatcherIfConfigChanged(newConfig);
  rebuildMenu();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    show: false,
    frame: false, backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  const config = loadConfig();
  if (config.theme) {
    mainWindow.webContents.on('did-finish-load', () => {
      send('theme-changed', config.theme);
    });
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting && !IS_LINUX) {
      e.preventDefault();
      mainWindow.hide();
      return;
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_e, c) => { handleConfigChange(c); return { success: true }; });

ipcMain.handle('get-welcome-dismissed', () => { const c = loadConfig(); return c.welcomeDismissed || false; });
ipcMain.handle('set-welcome-dismissed', (_e, v) => {
  const c = loadConfig();
  c.welcomeDismissed = v;
  handleConfigChange(c);
  return { success: true };
});

ipcMain.handle('get-settings', () => loadConfig());

ipcMain.handle('save-settings', (_e, settings) => {
  const config = loadConfig();
  Object.assign(config, settings);
  handleConfigChange(config);
  return { success: true };
});

ipcMain.handle('get-roblox-version', () => getLatestRobloxVersion());
ipcMain.handle('get-old-roblox-versions', () => getOldRobloxVersions());
ipcMain.handle('clean-old-versions', () => cleanOldVersions());
ipcMain.handle('is-roblox-running', () => isRobloxRunning());
ipcMain.handle('kill-roblox', () => { killRobloxProcess(); return { success: true }; });
ipcMain.handle('restart-roblox', () => {
  killRobloxProcess();
  setTimeout(() => launchRoblox(), 1000);
  return { success: true };
});

ipcMain.handle('backup-all', () => backupConfig(mainWindow));
ipcMain.handle('restore-backup', () => restoreConfig(mainWindow));

PRESET_TYPES.forEach((type) => {
  ipcMain.handle(`get-${type}-presets`, () => getAllPresets(type));
  ipcMain.handle(`apply-${type}-preset`, (_e, name) => {
    const r = setActivePreset(type, name);
    rebuildMenu();
    return r;
  });
  ipcMain.handle(`remove-${type}-preset`, () => {
    const r = removeActivePreset(type);
    rebuildMenu();
    return r;
  });
  ipcMain.handle(`delete-${type}-preset`, (_e, name) => {
    const r = deletePreset(type, name);
    rebuildMenu();
    return r;
  });
});

ipcMain.handle('get-cursor-preview', (_e, preset, file, source) => getPreviewData('cursors', preset, file, source));
ipcMain.handle('get-sound-preview', (_e, preset, file, source) => getPreviewData('sounds', preset, file, source));
ipcMain.handle('get-font-preview', (_e, preset, file, source) => getPreviewData('fonts', preset, file, source));

ipcMain.handle('get-categorized-presets', () => getCategorizedPresets());

ipcMain.handle('get-profiles', () => listProfiles());
ipcMain.handle('save-profile', (_e, p) => saveProfile(p));
ipcMain.handle('apply-profile', (_e, p) => {
  const r = applyProfile(p);
  rebuildMenu();
  return r;
});
ipcMain.handle('delete-profile', (_e, n) => deleteProfile(n));

ipcMain.handle('toggle-watcher', (_e, enabled) => {
  const config = loadConfig();
  config.watcherEnabled = enabled;
  handleConfigChange(config);
  return { success: true, watcherEnabled: enabled };
});

ipcMain.handle('reapply-all', async () => {
  const r = await reapplyAllMods();
  send('mods-reapplied', r);
  rebuildMenu();
  return r;
});

ipcMain.handle('open-preset-folder', (_e, type) => {
  if (DIRS[type]) shell.openPath(DIRS[type]);
});

ipcMain.handle('export-pack', (_e, data) => exportPack(data.type, data.presetName, mainWindow));
ipcMain.handle('import-pack', () => importPack(mainWindow));
ipcMain.handle('create-pack-from-active', async () => {
  const config = loadConfig();
  for (const type of PRESET_TYPES) {
    const key = activeKey(type);
    const name = config[key];
    if (name) return await exportPack(type, name, mainWindow);
  }
  return { success: false, reason: 'No active preset to export' };
});

ipcMain.handle('set-theme', (_e, theme) => {
  const config = loadConfig();
  config.theme = theme;
  handleConfigChange(config);
  send('theme-changed', theme);
  return { success: true };
});

ipcMain.handle('get-autostart', () => {
  try { return app.getLoginItemSettings().openAtLogin; } catch (err) { console.error('Failed to get autostart:', err.message); return false; }
});

ipcMain.handle('set-autostart', (_e, enabled) => {
  try { app.setLoginItemSettings({ openAtLogin: enabled }); } catch (err) { console.error('Failed to set autostart:', err.message); }
  return { success: true };
});

ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize(); else mainWindow?.maximize();
});
ipcMain.handle('window-close', () => { mainWindow?.close(); });

ipcMain.handle('check-for-updates', async () => {
  return await checkForUpdates(app.getVersion());
});

ipcMain.handle('open-external', (_e, url) => { shell.openExternal(url); });

ipcMain.handle('open-roblox-folder', () => {
  const { getRobloxBase } = require('./services/roblox');
  const base = getRobloxBase();
  if (base) shell.openPath(base);
  return { success: !!base };
});

ipcMain.handle('toggle-favorite', (_e, { type, name }) => {
  const config = loadConfig();
  if (!config.favorites) config.favorites = {};
  if (!config.favorites[type]) config.favorites[type] = [];
  const idx = config.favorites[type].indexOf(name);
  if (idx >= 0) config.favorites[type].splice(idx, 1);
  else config.favorites[type].push(name);
  handleConfigChange(config);
  return { success: true, favorites: config.favorites };
});

ipcMain.handle('get-favorites', () => {
  const config = loadConfig();
  return config.favorites || {};
});

ipcMain.handle('is-favorite', (_e, { type, name }) => {
  const config = loadConfig();
  return !!(config.favorites && config.favorites[type] && config.favorites[type].includes(name));
});

ipcMain.handle('download-and-install', async (_e, updateInfo) => {
  try {
    await downloadAndInstall(updateInfo, mainWindow, (status) => {
      send('update-status', { status });
    });
  } catch (err) {
    send('update-status', { status: `Failed: ${err.message}`, error: true });
  }
});

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(async () => {
  ensureDirs();
  createWindow();
  createTray(mainWindow, app);

  const config = loadConfig();
  if (!config.startMinimized) mainWindow.show();

  if (config.watcherEnabled) {
    startWatcher(config.watcherInterval);
  }

  setTimeout(async () => {
    const update = await checkForUpdates(app.getVersion());
    if (update) send('update-available', update);
  }, 5000);

  app.on('activate', () => { if (mainWindow) mainWindow.show(); });
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => { if (!IS_LINUX) app.quit(); });
