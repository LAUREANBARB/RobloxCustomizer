import React from 'react';
import useStore from '../store';
import { AppIcon } from './icons';

export default function TitleBar() {
  const { setSettingsOpen } = useStore();

  return (
    <div className="h-10 flex items-center justify-between px-4 glass border-b select-none"
         style={{ borderColor: 'var(--border-subtle)', WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}>
          <AppIcon className="text-white" />
        </div>
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          ROBLOX CUSTOMIZER
        </span>

        <button
          onClick={() => setSettingsOpen(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{ WebkitAppRegion: 'no-drag' }}
          title="Settings"
        >
          <img src="gear.png" alt="Settings" className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <button onClick={() => window.api.minimize()} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors group">
          <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button onClick={() => window.api.maximize()} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors group">
          <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <rect x="2" y="2" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
        <button onClick={() => window.api.close()} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-danger/20 transition-colors group">
          <svg width="12" height="12" viewBox="0 0 12 12" className="opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
            <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
