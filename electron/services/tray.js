const path = require('path');
const fs = require('fs');
const { Tray, Menu, nativeImage } = require('electron');
const { loadConfig } = require('./config');
const { getLatestRobloxVersion, isRobloxRunning, launchRoblox } = require('./roblox');
const { reapplyAllMods } = require('./presets');

let tray = null;
let currentWindow = null;
let currentApp = null;

function createTray(mainWindow, app) {
  currentWindow = mainWindow;
  currentApp = app;
  const iconPath = path.join(__dirname, '..', '..', 'assets', 'icon.png');
  let trayIcon;
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  }
  tray = new Tray(trayIcon || nativeImage.createEmpty());
  rebuildMenu();
  tray.setToolTip('Roblox Customizer');
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : (mainWindow.show(), mainWindow.focus());
    }
  });
  return tray;
}

function rebuildMenu() {
  if (!tray || !currentWindow) return;

  const config = loadConfig();
  const version = getLatestRobloxVersion();
  const running = isRobloxRunning();

  const activePresets = ['Cursor', 'Sound', 'Font', 'Skybox', 'Material']
    .map((label) => {
      const key = 'active' + label + 'Preset';
      const name = config[key];
      return name ? `${label}: ${name}` : null;
    })
    .filter(Boolean);

  const menuItems = [];
  if (activePresets.length > 0) {
    menuItems.push({ label: `Version: ${version || 'Not found'}`, enabled: false });
    menuItems.push({ label: `Roblox: ${running ? 'Running' : 'Stopped'}`, enabled: false });
    menuItems.push({ type: 'separator' });
    activePresets.forEach((p) => menuItems.push({ label: p, enabled: false }));
    menuItems.push({ type: 'separator' });
  } else {
    menuItems.push({ label: 'No active presets', enabled: false });
    menuItems.push({ type: 'separator' });
  }

  menuItems.push({
    label: running ? 'Roblox is running' : 'Launch Roblox',
    enabled: !running,
    click: () => launchRoblox(),
  }, {
    label: 'Re-apply mods',
    click: () => reapplyAllMods(),
  }, { type: 'separator' }, {
    label: 'Open',
    click: () => { if (currentWindow) { currentWindow.show(); currentWindow.focus(); } },
  }, {
    label: 'Quit',
    click: () => { currentApp.isQuitting = true; currentApp.quit(); },
  });

  tray.setContextMenu(Menu.buildFromTemplate(menuItems));
}

module.exports = { createTray, rebuildMenu };
