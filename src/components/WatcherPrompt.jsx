import React, { useState, useEffect } from 'react';
import useStore from '../store';

export default function WatcherPrompt() {
  const { config, setConfig, addNotification } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('watcher-prompt-dismissed');
    if (!config.watcherEnabled && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [config.watcherEnabled]);

  const handleEnable = async () => {
    try {
      const result = await window.api.toggleWatcher(true);
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification('Auto-apply enabled', 'success');
    } catch {}
    localStorage.setItem('watcher-prompt-dismissed', 'true');
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('watcher-prompt-dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 right-4 z-40 w-80 notif-enter">
      <div
        className="rounded-xl border p-4 backdrop-blur-xl"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border-accent)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-glow)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--accent)' }}>
              <path d="M10 2C6 2 3 5 3 9C3 13 6 16 6 18H14C14 16 17 13 17 9C17 5 14 2 10 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="10" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              Enable Auto-Apply?
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Automatically reapply your mods when Roblox updates. This keeps your customizations active without manual intervention.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleEnable}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 bg-[var(--success)] text-white shadow-[0_0_12px_rgba(74,222,128,0.3)] hover:shadow-[0_0_16px_rgba(74,222,128,0.4)]"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 bg-[var(--danger)] text-white shadow-[0_0_12px_rgba(248,113,113,0.2)] hover:shadow-[0_0_16px_rgba(248,113,113,0.3)]"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
