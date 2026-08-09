import React from 'react';
import useStore from '../store';
import { CursorIcon, SoundIcon, FontIcon, SkyboxIcon, MaterialIcon, ProfileIcon } from './icons';

export default function Sidebar() {
  const { activeTab, setActiveTab, config, cursorPresets, soundPresets } = useStore();

  const tabs = [
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

      <div className="px-4 mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-dim)' }}>
          {activeCount > 0 && <span className="ml-auto" style={{ color: 'var(--accent)' }}>{activeCount} active</span>}
        </div>
      </div>
    </aside>
  );
}
