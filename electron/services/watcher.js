const { loadConfig } = require('./config');
const { getLatestRobloxVersion } = require('./roblox');
const { reapplyAllMods } = require('./presets');

let watcher = null;

function startWatcher(intervalSec) {
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
}

function stopWatcher() {
  if (watcher) { clearInterval(watcher); watcher = null; }
}

function restartWatcherIfConfigChanged(newConfig) {
  if (newConfig.watcherEnabled) {
    if (watcher) {
      clearInterval(watcher);
      watcher = null;
    }
    startWatcher(newConfig.watcherInterval);
  } else {
    stopWatcher();
  }
}

module.exports = { startWatcher, stopWatcher, restartWatcherIfConfigChanged };
