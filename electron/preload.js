const { contextBridge, ipcRenderer } = require('electron');

const PRESET_TYPES = ['cursor', 'sound', 'font', 'skybox', 'material'];

function presetApi(type) {
  const cap = type.charAt(0).toUpperCase() + type.slice(1);
  return {
    [`get${cap}Presets`]: () => ipcRenderer.invoke(`get-${type}-presets`),
    [`apply${cap}Preset`]: (name) => ipcRenderer.invoke(`apply-${type}-preset`, name),
    [`remove${cap}Preset`]: () => ipcRenderer.invoke(`remove-${type}-preset`),
    [`delete${cap}Preset`]: (name) => ipcRenderer.invoke(`delete-${type}-preset`, name),
  };
}

const previewApi = {
  getCursorPreview: (preset, file, source) => ipcRenderer.invoke('get-cursor-preview', preset, file, source),
  getSoundPreview: (preset, file, source) => ipcRenderer.invoke('get-sound-preview', preset, file, source),
};

const presetApis = PRESET_TYPES.reduce((acc, type) => ({ ...acc, ...presetApi(type) }), previewApi);

contextBridge.exposeInMainWorld('api', {
  ...presetApis,

  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),

  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (c) => ipcRenderer.invoke('save-config', c),

  getRobloxVersion: () => ipcRenderer.invoke('get-roblox-version'),
  getOldRobloxVersions: () => ipcRenderer.invoke('get-old-roblox-versions'),
  cleanOldVersions: () => ipcRenderer.invoke('clean-old-versions'),
  backupAll: () => ipcRenderer.invoke('backup-all'),
  restoreBackup: () => ipcRenderer.invoke('restore-backup'),
  getWelcomeDismissed: () => ipcRenderer.invoke('get-welcome-dismissed'),
  setWelcomeDismissed: (v) => ipcRenderer.invoke('set-welcome-dismissed', v),
  getRobloxSoundFiles: () => ipcRenderer.invoke('get-roblox-sound-files'),
  getRobloxCursorFiles: () => ipcRenderer.invoke('get-roblox-cursor-files'),
  isRobloxRunning: () => ipcRenderer.invoke('is-roblox-running'),
  killRoblox: () => ipcRenderer.invoke('kill-roblox'),
  restartRoblox: () => ipcRenderer.invoke('restart-roblox'),

  getCategorizedPresets: () => ipcRenderer.invoke('get-categorized-presets'),

  getProfiles: () => ipcRenderer.invoke('get-profiles'),
  saveProfile: (profile) => ipcRenderer.invoke('save-profile', profile),
  applyProfile: (profile) => ipcRenderer.invoke('apply-profile', profile),
  deleteProfile: (name) => ipcRenderer.invoke('delete-profile', name),

  toggleWatcher: (enabled) => ipcRenderer.invoke('toggle-watcher', enabled),
  reapplyAll: () => ipcRenderer.invoke('reapply-all'),

  openPresetFolder: (type) => ipcRenderer.invoke('open-preset-folder', type),

  exportPack: (data) => ipcRenderer.invoke('export-pack', data),
  importPack: () => ipcRenderer.invoke('import-pack'),
  createPackFromActive: () => ipcRenderer.invoke('create-pack-from-active'),

  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getAutostart: () => ipcRenderer.invoke('get-autostart'),
  setAutostart: (enabled) => ipcRenderer.invoke('set-autostart', enabled),

  onModsReapplied: (cb) => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('mods-reapplied', handler);
    return () => ipcRenderer.removeListener('mods-reapplied', handler);
  },
  onWatcherChanged: (cb) => {
    const handler = (_e, enabled) => cb(enabled);
    ipcRenderer.on('watcher-changed', handler);
    return () => ipcRenderer.removeListener('watcher-changed', handler);
  },
  onThemeChanged: (cb) => {
    const handler = (_e, theme) => cb(theme);
    ipcRenderer.on('theme-changed', handler);
    return () => ipcRenderer.removeListener('theme-changed', handler);
  },
});
