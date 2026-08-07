const path = require('path');
const fs = require('fs');
const { execSync, execFile } = require('child_process');
const { IS_WINDOWS, IS_LINUX, IS_MAC } = require('./config');

function isSoberRoblox() {
  if (!IS_LINUX) return false;
  return fs.existsSync(path.join(process.env.HOME, '.var', 'app', 'org.vinegarhq.Sober', 'data', 'sober'));
}

function getRobloxCursorsDir() {
  if (IS_WINDOWS) {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) return null;
    return path.join(localAppData, 'Roblox', 'Versions');
  }
  if (IS_LINUX) {
    const soberPath = path.join(process.env.HOME, '.var', 'app', 'org.vinegarhq.Sober', 'data', 'sober');
    if (fs.existsSync(soberPath)) return soberPath;
    const candidates = [
      path.join(process.env.HOME, '.wine', 'drive_c', 'users', path.basename(process.env.HOME), 'Local Settings', 'Application Data', 'Roblox', 'Versions'),
      path.join(process.env.HOME, '.local', 'share', 'Steam', 'steamapps', 'compatdata', '480', 'pfx', 'drive_c', 'users', 'steamuser', 'Local Settings', 'Application Data', 'Roblox', 'Versions'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }
  return null;
}

function getRobloxOverlayDir() {
  if (IS_LINUX && isSoberRoblox()) {
    return path.join(process.env.HOME, '.var', 'app', 'org.vinegarhq.Sober', 'data', 'sober', 'asset_overlay');
  }
  return null;
}

function getRobloxBase() {
  return getRobloxCursorsDir();
}

function getLatestRobloxVersion() {
  if (IS_LINUX && isSoberRoblox()) return 'latest';

  const base = getRobloxBase();
  if (!base || !fs.existsSync(base)) return null;

  const dirs = fs.readdirSync(base).filter((d) => {
    const full = path.join(base, d);
    return fs.statSync(full).isDirectory() && d.startsWith('version-');
  });
  if (dirs.length === 0) return null;

  const isLinuxRoblox = isSoberRoblox();
  const validDirs = dirs.filter((d) => {
    if (isLinuxRoblox) {
      return fs.existsSync(path.join(base, d, 'RobloxPlayerBeta')) ||
             fs.existsSync(path.join(base, d, 'RobloxPlayerBeta.so'));
    }
    return fs.existsSync(path.join(base, d, 'RobloxPlayerBeta.exe'));
  });
  if (validDirs.length === 0) return null;

  validDirs.sort((a, b) => {
    let statA, statB;
    if (isLinuxRoblox) {
      const exeA = path.join(base, a, 'RobloxPlayerBeta');
      const exeB = path.join(base, b, 'RobloxPlayerBeta');
      const altA = path.join(base, a, 'RobloxPlayerBeta.so');
      const altB = path.join(base, b, 'RobloxPlayerBeta.so');
      statA = fs.existsSync(exeA) ? fs.statSync(exeA) : (fs.existsSync(altA) ? fs.statSync(altA) : null);
      statB = fs.existsSync(exeB) ? fs.statSync(exeB) : (fs.existsSync(altB) ? fs.statSync(altB) : null);
    } else {
      statA = fs.statSync(path.join(base, a, 'RobloxPlayerBeta.exe'));
      statB = fs.statSync(path.join(base, b, 'RobloxPlayerBeta.exe'));
    }
    if (!statA || !statB) return 0;
    return statB.mtimeMs - statA.mtimeMs;
  });
  return validDirs[0];
}

function getOldRobloxVersions() {
  const base = getRobloxBase();
  if ((IS_LINUX && isSoberRoblox()) || !base || !fs.existsSync(base)) return [];
  const currentVersion = getLatestRobloxVersion();
  if (!currentVersion) return [];
  const isLinuxRoblox = isSoberRoblox();
  return fs.readdirSync(base).filter((d) => {
    const full = path.join(base, d);
    let hasPlayer;
    if (isLinuxRoblox) {
      hasPlayer = fs.existsSync(path.join(base, d, 'RobloxPlayerBeta')) ||
                  fs.existsSync(path.join(base, d, 'RobloxPlayerBeta.so'));
    } else {
      hasPlayer = fs.existsSync(path.join(base, d, 'RobloxPlayerBeta.exe'));
    }
    return fs.statSync(full).isDirectory() && d.startsWith('version-') && d !== currentVersion && hasPlayer;
  });
}

let robloxRunningCache = false;
let robloxRunningCacheTime = 0;
const ROBLOX_CACHE_TTL = 2000;

function isRobloxRunning() {
  const now = Date.now();
  if (now - robloxRunningCacheTime < ROBLOX_CACHE_TTL) return robloxRunningCache;
  try {
    if (IS_WINDOWS) {
      const output = execSync('tasklist /FI "IMAGENAME eq RobloxPlayerBeta.exe" /NH', { encoding: 'utf-8', timeout: 5000 });
      robloxRunningCache = output.includes('RobloxPlayerBeta.exe');
    } else {
      try {
        execSync('pgrep -f RobloxPlayerBeta', { encoding: 'utf-8', timeout: 5000 });
        robloxRunningCache = true;
      } catch {
        robloxRunningCache = false;
      }
    }
    robloxRunningCacheTime = now;
    return robloxRunningCache;
  } catch (err) {
    console.error('Failed to check Roblox process status:', err.message);
    robloxRunningCache = false;
    robloxRunningCacheTime = now;
    return false;
  }
}

function killRobloxProcess() {
  if (IS_WINDOWS) {
    execSync('taskkill /F /IM RobloxPlayerBeta.exe', { timeout: 5000 });
  } else {
    execSync('pkill -f RobloxPlayerBeta', { timeout: 5000 });
  }
}

function launchRoblox() {
  const version = getLatestRobloxVersion();
  if (!version) return false;
  if (IS_WINDOWS) {
    const exePath = path.join(getRobloxBase(), version, 'RobloxPlayerBeta.exe');
    if (!fs.existsSync(exePath)) return false;
    execFile(exePath);
  } else if (IS_LINUX) {
    execFile('flatpak', isSoberRoblox() ? ['run', 'com.soberhaseg.Roblox'] : ['run', 'com.roblox.client']);
  } else if (IS_MAC) {
    execFile('wine', [path.join(getRobloxBase(), version, 'RobloxPlayerBeta.exe')]);
  }
  return true;
}

function cleanOldVersions() {
  const old = getOldRobloxVersions();
  const base = getRobloxBase();
  old.forEach((v) => fs.rmSync(path.join(base, v), { recursive: true, force: true }));
  return { success: true, removed: old.length };
}

module.exports = {
  getRobloxBase, getRobloxOverlayDir, isSoberRoblox,
  getLatestRobloxVersion, getOldRobloxVersions,
  isRobloxRunning, killRobloxProcess, launchRoblox,
  cleanOldVersions,
};
