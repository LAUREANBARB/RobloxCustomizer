import { create } from 'zustand';

const useStore = create((set) => ({
  activeTab: 'cursors',
  setActiveTab: (tab) => set({ activeTab: tab }),

  config: {
    activeCursorPreset: null,
    activeSoundPreset: null,
    activeFontPreset: null,
    activeSkyboxPreset: null,
    activeMaterialPreset: null,
    activeProfile: null,
    watcherEnabled: false,
    theme: '',
    startMinimized: false,
    previewVolume: 50,
    watcherInterval: 2,
  },
  setConfig: (config) => set({ config }),

  theme: '',
  setTheme: (theme) => set({ theme }),

  settingsOpen: false,
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  cursorPresets: [],
  soundPresets: [],
  fontPresets: [],
  skyboxPresets: [],
  materialPresets: [],
  setCursorPresets: (p) => set({ cursorPresets: p ?? [] }),
  setSoundPresets: (p) => set({ soundPresets: p ?? [] }),
  setFontPresets: (p) => set({ fontPresets: p ?? [] }),
  setSkyboxPresets: (p) => set({ skyboxPresets: p ?? [] }),
  setMaterialPresets: (p) => set({ materialPresets: p ?? [] }),

  robloxVersion: null,
  robloxRunning: false,
  setRobloxVersion: (v) => set({ robloxVersion: v }),
  setRobloxRunning: (v) => set({ robloxRunning: v }),

  previewCache: {},
  setPreview: (key, data) =>
    set((s) => ({ previewCache: { ...s.previewCache, [key]: data } })),

  playingSound: null,
  setPlayingSound: (s) => set({ playingSound: s }),

  notifications: [],
  addNotification: (msg, type = 'info', action = null) => {
    const id = Date.now();
    set((s) => ({
      notifications: [...s.notifications, { id, msg, type, action, exiting: false }],
    }));
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.map((n) => n.id === id ? { ...n, exiting: true } : n),
      }));
      setTimeout(() => {
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        }));
      }, 300);
    }, 3000);
  },
}));

export default useStore;
