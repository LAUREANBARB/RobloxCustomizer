import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { SmallSpinner } from './icons';

export default function StatusBar() {
  const { config, setConfig, robloxVersion, robloxRunning, setRobloxVersion, addNotification } = useStore();
  const [reapplying, setReapplying] = useState(false);
  const [oldVersions, setOldVersions] = useState([]);
  const [cleaning, setCleaning] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.api.getOldRobloxVersions().then(setOldVersions).catch(() => setOldVersions([]));
  }, [robloxVersion]);

  const handleCleanVersions = async () => {
    if (oldVersions.length === 0) return;
    setCleaning(true);
    setMenuOpen(false);
    try {
      const result = await window.api.cleanOldVersions();
      if (result.removed > 0) {
        addNotification(`Cleaned ${result.removed} old version(s)`, 'success');
        const version = await window.api.getRobloxVersion();
        setRobloxVersion(version);
        const old = await window.api.getOldRobloxVersions();
        setOldVersions(old);
      }
    } catch { addNotification('Failed to clean old versions', 'error'); }
    setCleaning(false);
  };

  const handleToggleWatcher = async () => {
    try {
      const result = await window.api.toggleWatcher(!config.watcherEnabled);
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification(result.watcherEnabled ? 'Auto-apply enabled' : 'Auto-apply disabled', 'info');
    } catch { addNotification('Failed to toggle', 'error'); }
  };

  const handleReapply = async () => {
    setReapplying(true);
    try {
      const result = await window.api.reapplyAll();
      if (result.success) addNotification(`Re-applied to ${result.version}`, 'success');
      else addNotification(result.reason || 'Re-apply failed', 'error');
    } catch { addNotification('Re-apply failed', 'error'); }
    setReapplying(false);
  };

  const handleExportActive = async () => {
    setMenuOpen(false);
    try {
      const result = await window.api.createPackFromActive();
      if (result.success) addNotification('Exported active preset', 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'No active mods to export', 'info');
    } catch { addNotification('Export failed', 'error'); }
  };

  const handleBackup = async () => {
    setMenuOpen(false);
    try {
      const result = await window.api.backupAll();
      if (result.success) addNotification(`Backup saved to ${result.path}`, 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Backup failed', 'error');
    } catch { addNotification('Backup failed', 'error'); }
  };

  const handleRestore = async () => {
    setMenuOpen(false);
    try {
      const result = await window.api.restoreBackup();
      if (result.success) {
        addNotification('Backup restored! Restarting...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Restore failed', 'error');
    } catch { addNotification('Restore failed', 'error'); }
  };

  return (
    <div className="h-10 glass border-t flex items-center justify-between px-4 text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <span>{robloxVersion ? <span style={{ color: 'var(--text-primary)' }}>{robloxVersion}</span> : <span style={{ color: 'var(--danger)' }}>No Roblox found</span>}</span>
        </div>

        <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${robloxRunning ? 'animate-pulse' : ''}`}
               style={{ background: robloxRunning ? 'var(--success)' : 'var(--text-dim)' }} />
          <span style={{ color: robloxRunning ? 'var(--success)' : 'var(--text-muted)' }}>
            {robloxRunning ? 'Running' : 'Off'}
          </span>
        </div>

        {oldVersions.length > 0 && (
          <>
            <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />
            <button onClick={handleCleanVersions} disabled={cleaning} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--warning)' }}>
              {cleaning ? <SmallSpinner /> : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 3H10M4 3V2C4 1.45 4.45 1 5 1H7C7.55 1 8 1.45 8 2V3M5 5.5V8.5M7 5.5V8.5M3 3L3.5 10.5C3.52 10.78 3.75 11 4 11H8C8.25 11 8.48 10.78 8.5 10.5L9 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
              Clean {oldVersions.length}
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleReapply} disabled={reapplying} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          {reapplying ? (
            <SmallSpinner />
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 6C1 3.24 3.24 1 6 1C8.76 1 11 3.24 11 6C11 8.76 8.76 11 6 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M1 4V7H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          Re-apply
        </button>

        <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

        <button
          onClick={handleToggleWatcher}
          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
            config.watcherEnabled
              ? 'bg-[var(--success)] text-white shadow-[0_0_8px_rgba(74,222,128,0.2)]'
              : 'bg-[var(--danger)] text-white shadow-[0_0_8px_rgba(248,113,113,0.15)]'
          }`}
        >
          {config.watcherEnabled ? 'ON' : 'OFF'}
          <span className="ml-1 opacity-80">Auto</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="3" r="1.2" fill="currentColor"/>
              <circle cx="7" cy="7" r="1.2" fill="currentColor"/>
              <circle cx="7" cy="11" r="1.2" fill="currentColor"/>
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border z-50 py-1" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                <button onClick={handleBackup} className="w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Backup
                </button>
                <button onClick={handleRestore} className="w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Restore
                </button>
                <button onClick={handleExportActive} className="w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Export Active
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
