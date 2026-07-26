import React from 'react';
import useStore from '../store';

export default function Sidebar() {
  const { activeTab, setActiveTab, config, cursorPresets, soundPresets } = useStore();

  const tabs = [
    { id: 'presets', label: 'Presets', count: null,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="10" y="2" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="2" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="10" y="10" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg> },
    { id: 'cursors', label: 'Cursors', count: cursorPresets.length,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 2L15 9L9 10L7 16L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/></svg> },
    { id: 'sounds', label: 'Sounds', count: soundPresets.length,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 7V11M6 5V13M9 3V15M12 6V12M15 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { id: 'fonts', label: 'Fonts', count: null,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4H14M9 4V15M6 15H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: 'skyboxes', label: 'Skybox', count: null,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M9 2C6 6 6 12 9 16C12 12 12 6 9 2Z" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg> },
    { id: 'materials', label: 'Materials', count: null,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="5" y="5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="10" y="5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="5" y="10" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="10" y="10" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none"/></svg> },
    { id: 'profiles', label: 'Profiles', count: null,
      icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 2H14V16H4V2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M7 6H11M7 9H11M7 12H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg> },
  ];

  const activeCount = config.activeCursorPreset ? 1 : 0
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
          <div className={`w-1.5 h-1.5 rounded-full ${config.watcherEnabled ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--text-dim)]'}`} />
          <span>Watcher {config.watcherEnabled ? 'Active' : 'Off'}</span>
          {activeCount > 0 && <span className="ml-auto" style={{ color: 'var(--accent)' }}>{activeCount} active</span>}
        </div>
      </div>
    </aside>
  );
}
