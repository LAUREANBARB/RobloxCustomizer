import React, { useState, useEffect } from 'react';
import useStore from '../store';

export default function StatusBar() {
  const { config, setConfig, robloxVersion, robloxRunning, setRobloxVersion, addNotification } = useStore();
  const [reapplying, setReapplying] = useState(false);
  const [oldVersions, setOldVersions] = useState([]);
  const [cleaning, setCleaning] = useState(false);

  useEffect(() => {
    window.api.getOldRobloxVersions().then(setOldVersions).catch(() => {});
  }, [robloxVersion]);

  const handleCleanVersions = async () => {
    if (oldVersions.length === 0) return;
    setCleaning(true);
    try {
      const result = await window.api.cleanOldVersions();
      if (result.deleted.length > 0) {
        addNotification(`Cleaned ${result.deleted.length} old version(s)`, 'success');
        const version = await window.api.getRobloxVersion();
        setRobloxVersion(version);
        const old = await window.api.getOldRobloxVersions();
        setOldVersions(old);
      }
      if (result.failed.length > 0) {
        addNotification(`Failed to delete: ${result.failed.join(', ')}`, 'error');
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
    try {
      const result = await window.api.createPackFromActive();
      if (result.success) addNotification(`Exported ${result.packs.length} pack(s)`, 'success');
      else addNotification('No active mods to export', 'info');
    } catch { addNotification('Export failed', 'error'); }
  };

  const handleBackup = async () => {
    try {
      const result = await window.api.backupAll();
      if (result.success) addNotification(`Backup saved to ${result.path}`, 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Backup failed', 'error');
    } catch { addNotification('Backup failed', 'error'); }
  };

  const handleRestore = async () => {
    try {
      const result = await window.api.restoreBackup();
      if (result.success) {
        addNotification('Backup restored! Restarting...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Restore failed', 'error');
    } catch { addNotification('Restore failed', 'error'); }
  };

  const activeCount =
    (config.activeCursorPreset ? 1 : 0) +
    (config.activeSoundPreset ? 1 : 0) +
    (config.activeFontPreset ? 1 : 0) +
    (config.activeSkyboxPreset ? 1 : 0) +
    (config.activeMaterialPreset ? 1 : 0);

  return (
    <div className="h-10 glass border-t flex items-center justify-between px-4 text-[11px]" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2L6 1L10 2L11 6L10 10L6 11L2 10L1 6L2 2Z" stroke="currentColor" strokeWidth="1" fill="none"/>
          </svg>
          <span>{robloxVersion ? <span style={{ color: 'var(--text-primary)' }}>{robloxVersion}</span> : <span style={{ color: 'var(--danger)' }}>No Roblox found</span>}</span>
        </div>

        <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${robloxRunning ? 'animate-pulse' : ''}`}
               style={{ background: robloxRunning ? 'var(--success)' : 'var(--text-dim)' }} />
          <span style={{ color: robloxRunning ? 'var(--success)' : 'var(--text-muted)' }}>
            {robloxRunning ? 'Roblox running' : 'Roblox off'}
          </span>

          {robloxRunning && (
            <>
              <button
                onClick={async () => {
                  const result = await window.api.killRoblox();
                  if (result.success) addNotification('Roblox killed', 'info');
                  else addNotification(result.reason || 'Failed', 'error');
                }}
                className="group/kill flex items-center justify-center h-5 rounded-md overflow-hidden transition-all duration-200 w-5 hover:w-14"
                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                  <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <span className="whitespace-nowrap text-[9px] font-medium opacity-0 group-hover/kill:opacity-100 transition-opacity ml-0.5">Kill</span>
              </button>
              <button
                onClick={async () => {
                  const result = await window.api.restartRoblox();
                  if (result.success) addNotification('Roblox restarting...', 'success');
                  else addNotification(result.reason || 'Failed', 'error');
                }}
                className="group/restart flex items-center justify-center h-5 rounded-md overflow-hidden transition-all duration-200 w-5 hover:w-[68px]"
                style={{ background: 'var(--accent-glow)', border: '1px solid var(--border-accent)', color: 'var(--accent-light)' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                  <path d="M1 5C1 2.8 2.8 1 5 1C7.2 1 9 2.8 9 5C9 7.2 7.2 9 5 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M1 3.5V6H3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="whitespace-nowrap text-[9px] font-medium opacity-0 group-hover/restart:opacity-100 transition-opacity ml-0.5">Restart</span>
              </button>
            </>
          )}
        </div>

        <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

        <span style={{ color: 'var(--text-muted)' }}>
          {activeCount} active mod{activeCount !== 1 ? 's' : ''}
        </span>

        {oldVersions.length > 0 && (
          <>
            <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />
            <button onClick={handleCleanVersions} disabled={cleaning} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--warning)' }}>
              {cleaning ? (
                <svg className="animate-spin w-3 h-3" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="16" strokeLinecap="round"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 3H10M4 3V2C4 1.45 4.45 1 5 1H7C7.55 1 8 1.45 8 2V3M5 5.5V8.5M7 5.5V8.5M3 3L3.5 10.5C3.52 10.78 3.75 11 4 11H8C8.25 11 8.48 10.78 8.5 10.5L9 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
              Clean {oldVersions.length} old version{oldVersions.length !== 1 ? 's' : ''}
            </button>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleBackup} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1C3.24 1 1 3.24 1 6C1 8.76 3.24 11 6 11C8.76 11 11 8.76 11 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M11 1V4H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 1L7 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Backup
        </button>

        <button onClick={handleRestore} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 11C8.76 11 11 8.76 11 6C11 3.24 8.76 1 6 1C3.24 1 1 3.24 1 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M1 11V8H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M1 11L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Restore
        </button>

        <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

        <button onClick={handleExportActive} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 9V3M4 5L6 3L8 5M3 10H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Export
        </button>

        <div className="w-px h-4" style={{ background: 'var(--border-subtle)' }} />

        <button onClick={handleReapply} disabled={reapplying} className="flex items-center gap-1.5 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          {reapplying ? (
            <svg className="animate-spin w-3 h-3" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="16" strokeLinecap="round"/></svg>
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
          className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
            config.watcherEnabled
              ? 'bg-[var(--success)] text-white shadow-[0_0_8px_rgba(74,222,128,0.2)]'
              : 'bg-[var(--danger)] text-white shadow-[0_0_8px_rgba(248,113,113,0.15)]'
          }`}
        >
          {config.watcherEnabled ? 'ON' : 'OFF'}
          <span className="ml-1 opacity-80">Auto-apply</span>
        </button>
      </div>
    </div>
  );
}
