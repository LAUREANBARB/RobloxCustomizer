import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { themes, applyTheme } from '../themes';

function ToggleButton({ enabled, onToggle }) {
  return (
    <button
      onClick={() => onToggle(!enabled)}
      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
        enabled
          ? 'bg-[var(--success)] text-white shadow-[0_0_12px_rgba(74,222,128,0.3)]'
          : 'bg-[var(--danger)] text-white shadow-[0_0_12px_rgba(248,113,113,0.2)]'
      }`}
    >
      {enabled ? 'ON' : 'OFF'}
    </button>
  );
}

export default function Settings() {
  const { settingsOpen, setSettingsOpen, setConfig, setTheme, addNotification } = useStore();
  const [localSettings, setLocalSettings] = useState({
    theme: '',
    startMinimized: false,
    previewVolume: 50,
    watcherInterval: 2,
  });
  const [watcherEnabled, setWatcherEnabled] = useState(false);
  const [autostart, setAutostart] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settingsOpen) {
      window.api.getSettings().then((s) => {
        setLocalSettings(s);
        setWatcherEnabled(s.watcherEnabled ?? false);
        applyTheme(s.theme || '');
        setDirty(false);
      });
      window.api.getAutostart().then((enabled) => setAutostart(enabled));
    }
  }, [settingsOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.api.saveSettings(localSettings);
      await window.api.toggleWatcher(watcherEnabled);
      await window.api.setAutostart(autostart);
      applyTheme(localSettings.theme || '');
      setTheme(localSettings.theme);
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      setDirty(false);
      addNotification('Settings saved', 'success');
    } catch {
      addNotification('Failed to save', 'error');
    }
    setSaving(false);
  };

  const handleClose = async () => {
    if (dirty) await handleSave();
    setSettingsOpen(false);
  };

  const updateSetting = (key, value) => {
    setLocalSettings((s) => ({ ...s, [key]: value }));
    setDirty(true);
  };

  const handleThemeChange = (themeId) => {
    updateSetting('theme', themeId);
    setTheme(themeId);
    applyTheme(themeId || '');
  };

  const handleAutostart = (enabled) => {
    setAutostart(enabled);
    setDirty(true);
  };

  const handleWatcherToggle = (enabled) => {
    setWatcherEnabled(enabled);
    setDirty(true);
  };

  if (!settingsOpen) return null;

  return (
    <div className="settings-overlay backdrop-enter" onClick={handleClose}>
      <div className="settings-panel settings-enter" onClick={(e) => e.stopPropagation()}>
        <div className="settings-section flex items-center justify-between" style={{ borderBottom: 'none', paddingBottom: 12 }}>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h2>
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={`px-3 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase transition-all duration-200 ${
                dirty
                  ? 'bg-[var(--accent)] shadow-[0_0_12px_var(--accent-glow)] hover:shadow-[0_0_16px_var(--accent-glow)]'
                  : 'bg-[var(--bg-surface-alt)] cursor-default'
              }`}
              style={{ color: dirty ? 'var(--bg-primary)' : 'var(--text-muted)' }}
            >
              {saving ? 'Saving...' : dirty ? 'Save' : 'Saved'}
            </button>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: 'var(--text-muted)' }}>
              <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-label">Theme</div>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  localSettings.theme === t.id
                    ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                    : 'border-[var(--border-subtle)] hover:border-[var(--card-hover-border)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: t.color }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                </div>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Auto-Apply</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Watcher</div>
              <div className="settings-row-desc">Auto-reapply mods when Roblox updates</div>
            </div>
            <ToggleButton enabled={watcherEnabled} onToggle={handleWatcherToggle} />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Watcher interval</div>
              <div className="settings-row-desc">Check every {localSettings.watcherInterval} second{localSettings.watcherInterval !== 1 ? 's' : ''}</div>
            </div>
            <input
              type="range"
              min="1" max="10"
              value={localSettings.watcherInterval}
              onChange={(e) => updateSetting('watcherInterval', parseInt(e.target.value))}
            />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Startup</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Start with System</div>
              <div className="settings-row-desc">Launch on system boot. Note: for Linux users this assumes you have systemd</div>
            </div>
            <ToggleButton enabled={autostart} onToggle={handleAutostart} />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Start minimized</div>
              <div className="settings-row-desc">Go straight to system tray</div>
            </div>
            <ToggleButton enabled={localSettings.startMinimized} onToggle={(v) => updateSetting('startMinimized', v)} />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Interface</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Animations</div>
              <div className="settings-row-desc">Enable UI animations and transitions</div>
            </div>
            <ToggleButton enabled={localSettings.animationsEnabled !== false} onToggle={(v) => updateSetting('animationsEnabled', v)} />
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Sound</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Preview volume</div>
              <div className="settings-row-desc">Sound preview playback volume ({localSettings.previewVolume}%)</div>
            </div>
            <input
              type="range"
              min="0" max="100" step="5"
              value={localSettings.previewVolume}
              onChange={(e) => updateSetting('previewVolume', parseInt(e.target.value))}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
