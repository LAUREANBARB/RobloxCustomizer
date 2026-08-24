import React from 'react';
import useStore from '../store';
import { CursorIcon, SoundIcon, FontIcon, SkyboxIcon, MaterialIcon, ProfileIcon, StarIcon, FolderOpenIcon } from './icons';

export default function Sidebar() {
  const { activeTab, setActiveTab, config, cursorPresets, soundPresets, setSettingsOpen } = useStore();

  const favCount = Object.values(config.favorites || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  const tabs = [
    { id: 'favorites', label: 'Favorites', count: favCount || null, icon: <StarIcon /> },
    { id: 'profiles', label: 'Profiles', count: null, icon: <ProfileIcon /> },
    { id: 'cursors', label: 'Cursors', count: (cursorPresets ?? []).length, icon: <CursorIcon /> },
    { id: 'shiftlock', label: 'Shiftlock', count: null, icon: <CursorIcon /> },
    { id: 'sounds', label: 'Sounds', count: (soundPresets ?? []).length, icon: <SoundIcon /> },
    { id: 'fonts', label: 'Fonts', count: null, icon: <FontIcon /> },
    { id: 'skyboxes', label: 'Skybox', count: null, icon: <SkyboxIcon /> },
    { id: 'materials', label: 'Materials', count: null, icon: <MaterialIcon /> },
  ];

  const activeCount = (config.activeCursorPreset ? 1 : 0)
    + (config.activeShiftlockPreset ? 1 : 0)
    + (config.activeSoundPreset ? 1 : 0)
    + (config.activeFontPreset ? 1 : 0)
    + (config.activeSkyboxPreset ? 1 : 0)
    + (config.activeMaterialPreset ? 1 : 0);

  const handleOpenRobloxFolder = () => window.api.openRobloxFolder();

  return (
    <aside className="w-56 glass border-r flex flex-col py-4" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="px-4 mb-4">
        <h2 className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--text-dim)' }}>
          Navigation
        </h2>
      </div>

      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2 rounded-xl relative ${
                isActive ? '' : 'hover:bg-white/[0.03]'
              }`}
              style={{ color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)' }}
            >
              {isActive && (
                <div className="nav-active-bg absolute inset-0 rounded-xl" style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-accent)' }} />
              )}
              <span className="relative z-10 flex items-center gap-3 w-full">
                <span style={{ color: isActive ? 'var(--accent)' : undefined }}>{tab.icon}</span>
                <span className="font-medium text-sm">{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>{tab.count}</span>
                )}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="px-2 mt-auto pt-3 border-t space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
        <button onClick={handleOpenRobloxFolder} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/[0.03]" style={{ color: 'var(--text-muted)' }}>
          <FolderOpenIcon size={14} />
          <span>Open Roblox Folder</span>
        </button>
        <button onClick={() => setSettingsOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-colors hover:bg-white/[0.03]" style={{ color: 'var(--text-muted)' }}>
          <img src="gear.png" alt="Settings" className="w-3.5 h-3.5 opacity-50 hover:opacity-100 transition-opacity" />
          <span>Settings</span>
        </button>
        <div className="flex items-center gap-2 text-[10px] px-3 pt-1" style={{ color: 'var(--text-dim)' }}>
          {activeCount > 0 && <span style={{ color: 'var(--accent)' }}>{activeCount} active</span>}
        </div>
      </div>
    </aside>
  );
}
