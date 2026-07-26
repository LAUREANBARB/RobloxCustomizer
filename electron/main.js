const { app, BrowserWindow, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

const { loadConfig, saveConfig, ensureDirs, IS_LINUX, IS_WINDOWS, DIRS, CONFIG_PATH } = require('./services/config');
const { getLatestRobloxVersion, getOldRobloxVersions, isRobloxRunning, killRobloxProcess, launchRoblox, cleanOldVersions, getRobloxSoundFiles, getRobloxCursorFiles } = require('./services/roblox');
const { syncBundledPresets, getAllPresets, setActivePreset, removeActivePreset, deletePreset, getPreviewData, reapplyAllMods, getCategorizedPresets, listProfiles, saveProfile, applyProfile, deleteProfile, activeKey } = require('./services/presets');
const { startWatcher, stopWatcher, restartWatcherIfConfigChanged } = require('./services/watcher');
const { createTray, rebuildMenu } = require('./services/tray');
const { exportPack, importPack, backupConfig, restoreConfig } = require('./services/packs');

let mainWindow = null;
let isQuitting = false;

const PRESET_TYPES = ['cursors', 'sounds', 'fonts', 'skyboxes', 'materials'];

// -- Helpers -----------------------------------------------------------------

function send(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(channel, data);
}

function handleConfigChange(newConfig) {
  saveConfig(newConfig);
  restartWatcherIfConfigChanged(newConfig, mainWindow);
  rebuildMenu();
}

// -- Window ------------------------------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    show: false,
    frame: false, transparent: true,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
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

// -- IPC: Config -------------------------------------------------------------

ipcMain.handle('get-config', () => loadConfig());
ipcMain.handle('save-config', (_e, c) => { handleConfigChange(c); return { success: true }; });

ipcMain.handle('get-welcome-dismissed', () => { const c = loadConfig(); return c.welcomeDismissed || false; });
ipcMain.handle('set-welcome-dismissed', (_e, v) => {
  const c = loadConfig();
  c.welcomeDismissed = v;
  handleConfigChange(c);
  return { success: true };
});

ipcMain.handle('get-settings', () => {
  const config = loadConfig();
  try {
    const autoStart = app.getLoginItemSettings().openAtLogin;
    return { ...config, autoStart };
  } catch {
    return { ...config, autoStart: false };
  }
});

ipcMain.handle('save-settings', (_e, settings) => {
  const config = loadConfig();
  Object.assign(config, settings);
  handleConfigChange(config);
  return { success: true };
});

// -- IPC: Roblox -------------------------------------------------------------

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
ipcMain.handle('get-roblox-sound-files', () => getRobloxSoundFiles());
ipcMain.handle('get-roblox-cursor-files', () => getRobloxCursorFiles());

// -- IPC: Backup -------------------------------------------------------------

ipcMain.handle('backup-all', () => backupConfig(mainWindow));
ipcMain.handle('restore-backup', () => restoreConfig(mainWindow));

// -- IPC: Presets (generic, type-driven) -------------------------------------

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

// Preview handlers (cursors + sounds only)
ipcMain.handle('get-cursor-preview', (_e, preset, file, source) => getPreviewData('cursors', preset, file, source));
ipcMain.handle('get-sound-preview', (_e, preset, file, source) => getPreviewData('sounds', preset, file, source));

// -- IPC: Categorized --------------------------------------------------------

ipcMain.handle('get-categorized-presets', () => getCategorizedPresets());

// -- IPC: Profiles -----------------------------------------------------------

ipcMain.handle('get-profiles', () => listProfiles());
ipcMain.handle('save-profile', (_e, p) => saveProfile(p));
ipcMain.handle('apply-profile', (_e, p) => {
  const r = applyProfile(p);
  rebuildMenu();
  return r;
});
ipcMain.handle('delete-profile', (_e, n) => deleteProfile(n));

// -- IPC: Watcher ------------------------------------------------------------

ipcMain.handle('toggle-watcher', (_e, enabled) => {
  const config = loadConfig();
  config.watcherEnabled = enabled;
  handleConfigChange(config);
  return { success: true };
});

// -- IPC: Reapply ------------------------------------------------------------

ipcMain.handle('reapply-all', () => {
  const r = reapplyAllMods();
  send('mods-reapplied', r);
  rebuildMenu();
  return r;
});

// -- IPC: Folders ------------------------------------------------------------

ipcMain.handle('open-preset-folder', (_e, type) => {
  if (DIRS[type]) shell.openPath(DIRS[type]);
});

// -- IPC: Packs --------------------------------------------------------------

ipcMain.handle('export-pack', (_e, data) => exportPack(data.type, data.name, mainWindow));
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

// -- IPC: Theme --------------------------------------------------------------

ipcMain.handle('set-theme', (_e, theme) => {
  const config = loadConfig();
  config.theme = theme;
  handleConfigChange(config);
  send('theme-changed', theme);
  return { success: true };
});

// -- IPC: Auto-start ---------------------------------------------------------

ipcMain.handle('get-autostart', () => {
  try { return app.getLoginItemSettings().openAtLogin; } catch { return false; }
});

ipcMain.handle('set-autostart', (_e, enabled) => {
  try { app.setLoginItemSettings({ openAtLogin: enabled }); } catch {}
  return { success: true };
});

// -- IPC: Window controls ----------------------------------------------------

ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize(); else mainWindow?.maximize();
});
ipcMain.handle('window-close', () => { mainWindow?.close(); });

// -- App lifecycle -----------------------------------------------------------

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
  syncBundledPresets();
  createWindow();
  createTray(mainWindow, app);

  const config = loadConfig();
  if (!config.startMinimized) mainWindow.show();

  if (config.watcherEnabled) {
    startWatcher(config.watcherInterval, mainWindow);
  }

  app.on('activate', () => { if (mainWindow) mainWindow.show(); });
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => { if (!IS_LINUX) app.quit(); });
