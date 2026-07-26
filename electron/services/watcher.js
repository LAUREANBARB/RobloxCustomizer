const { loadConfig, saveConfig } = require('./config');
const { getLatestRobloxVersion } = require('./roblox');
const { reapplyAllMods } = require('./presets');

let watcher = null;
let watcherTimeout = null;

function startWatcher(intervalSec, mainWindow) {
  stopWatcher();
  const intervalMs = (intervalSec || 2) * 1000;
  const check = () => {
    const config = loadConfig();
    if (!config.watcherEnabled) return;
    const version = getLatestRobloxVersion();
    if (!version) return;
    reapplyAllMods(version);
  };
  watcher = setInterval(check, intervalMs);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('watcher-status', { running: true, interval: intervalSec || 2 });
  }
}

function stopWatcher(mainWindow) {
  if (watcherTimeout) { clearTimeout(watcherTimeout); watcherTimeout = null; }
  if (watcher) { clearInterval(watcher); watcher = null; }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('watcher-status', { running: false });
  }
}

function restartWatcherIfConfigChanged(newConfig, mainWindow) {
  if (newConfig.watcherEnabled) {
    if (watcher) {
      clearInterval(watcher);
      watcher = null;
    }
    startWatcher(newConfig.watcherInterval, mainWindow);
  } else {
    stopWatcher(mainWindow);
  }
}

module.exports = { startWatcher, stopWatcher, restartWatcherIfConfigChanged };
