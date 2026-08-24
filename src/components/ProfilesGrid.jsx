import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { Check, Spinner } from './icons';

function ProfilePreview({ profile }) {
  const [hovered, setHovered] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const prevHovered = React.useRef(false);
  const [ previews, setPreviews ] = useState({});

  const items = [
    profile.cursor && { label: 'Cursor', value: profile.cursor, type: 'cursor' },
    profile.sound && { label: 'Sound', value: profile.sound, type: 'sound' },
    profile.font && { label: 'Font', value: profile.font, type: 'font' },
    profile.skybox && { label: 'Skybox', value: profile.skybox, type: 'skybox' },
    profile.material && { label: 'Material', value: profile.material, type: 'material' },
  ].filter(Boolean);

  useEffect(() => {
    const load = async () => {
      const newPreviews = {};
      if (profile.cursor) {
        const data = await window.api.getCursorPreview(profile.cursor, 'ArrowCursor.png', 'custom');
        if (data) newPreviews.cursor = data;
      }
      if (profile.font) {
        const data = await window.api.getFontPreview(profile.font, profile.font.includes('.') ? profile.font : profile.font + '.ttf', 'custom');
        if (data) newPreviews.font = data;
      }
      if (profile.skybox) {
        const data = await window.api.getCursorPreview(profile.skybox, 'sky512_ft.tex', 'custom');
        if (data) newPreviews.skybox = data;
      }
      if (profile.material) {
        const files = ['Wood planks.dds', 'brick.png', 'sand.dds'];
        for (const f of files) {
          const data = await window.api.getCursorPreview(profile.material, f, 'custom');
          if (data) { newPreviews.material = data; break; }
        }
      }
      setPreviews(newPreviews);
    };
    load();
  }, [profile.cursor, profile.font, profile.skybox, profile.material, profile.sound]);

  useEffect(() => {
    if (hovered && !prevHovered.current) {
      setPreviewIdx(0);
    }
    prevHovered.current = hovered;

    if (!hovered || items.length <= 1) return;
    const interval = setInterval(() => {
      setPreviewIdx((i) => (i + 1) % items.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [hovered, items.length]);

  const current = items[previewIdx] || items[0];

  const getPreview = (item) => {
    if (!item) return null;
    if (item.type === 'cursor' && previews.cursor) {
      return <img src={previews.cursor} alt={item.value} className="w-full h-full object-contain p-1.5" style={{ imageRendering: 'pixelated' }} />;
    }
    if (item.type === 'font') {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-xl font-bold" style={{ color: 'var(--accent-light)', fontFamily: previews.font ? `font-family-name-${item.value}` : undefined }}>
            {previews.font ? (
              <span style={{ fontDisplay: 'swap' }}>Aa</span>
            ) : 'Aa'}
          </span>
        </div>
      );
    }
    if (item.type === 'skybox' && previews.skybox) {
      return <img src={previews.skybox} alt={item.value} className="w-full h-full object-cover" />;
    }
    if (item.type === 'material' && previews.material) {
      return <img src={previews.material} alt={item.value} className="w-full h-full object-cover" />;
    }
    if (item.type === 'sound') {
      return (
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--accent-light)' }}>
          <path d="M3 7V11M6 5V13M9 3V15M12 6V12M15 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    }
    return (
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--text-dim)' }}>
        <path d="M3 2L15 9L9 10L7 16L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    );
  };

  return (
    <div
      className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 transition-all overflow-hidden checker-bg"
      style={{ background: 'var(--bg-surface-alt)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {current ? getPreview(current) : (
        <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>Empty</span>
      )}
    </div>
  );
}

export default function ProfilesGrid() {
  const {
    config, setConfig, addNotification,
  } = useStore();
  const [profiles, setProfiles] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(null);

  const loadProfiles = async () => {
    try { const p = await window.api.getProfiles(); setProfiles(p); } catch { addNotification('Failed to load profiles', 'error'); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { const p = await window.api.getProfiles(); if (!cancelled) setProfiles(p); }
      catch { addNotification('Failed to load profiles', 'error'); }
    })();
    return () => { cancelled = true; };
  }, [addNotification]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await window.api.saveProfile({
      name: newName.trim(),
      cursor: config.activeCursorPreset,
      sound: config.activeSoundPreset,
      font: config.activeFontPreset,
      skybox: config.activeSkyboxPreset,
      material: config.activeMaterialPreset,
    });
    setNewName('');
    setCreating(false);
    loadProfiles();
    addNotification(`Profile "${newName.trim()}" created`, 'success');
  };

  const handleApply = async (profile) => {
    setLoading(profile.name);
    try {
      const result = await window.api.applyProfile(profile);
      if (result.success) {
        const cfg = await window.api.getConfig();
        setConfig(cfg);
        addNotification(`Profile "${profile.name}" applied`, 'success');
      } else {
        addNotification(result.reason || 'Failed', 'error');
      }
    } catch { addNotification('Apply failed', 'error'); }
    setLoading(null);
  };

  const handleDelete = async (name) => {
    await window.api.deleteProfile(name);
    const cfg = await window.api.getConfig();
    setConfig(cfg);
    loadProfiles();
    addNotification(`Profile "${name}" deleted`, 'info');
  };

  const hasActive = config.activeCursorPreset || config.activeSoundPreset || config.activeFontPreset || config.activeSkyboxPreset || config.activeMaterialPreset;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Profiles</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Save and apply combos of cursor + sound + font + skybox</p>
        </div>
        <div className="flex items-center gap-2">
          {hasActive && !creating && (
            <button onClick={() => setCreating(true)} className="btn text-sm">
              <span className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Save Current
              </span>
            </button>
          )}
        </div>
      </div>

      {creating && (
        <div className="card p-4 mb-6 fade-in">
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Save current as profile</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Profile name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              autoFocus
            />
            <button onClick={handleCreate} className="btn btn-success text-sm">Save</button>
            <button onClick={() => { setCreating(false); setNewName(''); }} className="btn btn-danger text-sm">Cancel</button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {config.activeCursorPreset && <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>Cursor: {config.activeCursorPreset}</span>}
            {config.activeSoundPreset && <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>Sound: {config.activeSoundPreset}</span>}
            {config.activeFontPreset && <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>Font: {config.activeFontPreset}</span>}
            {config.activeSkyboxPreset && <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>Skybox: {config.activeSkyboxPreset}</span>}
            {config.activeMaterialPreset && <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ background: 'var(--accent-glow)', color: 'var(--accent-light)' }}>Material: {config.activeMaterialPreset}</span>}
          </div>
        </div>
      )}

      {profiles.length === 0 && !creating ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--text-dim)' }}>
              <path d="M8 4H24V28H8V4Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 12H20M12 17H20M12 22H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No profiles yet</h3>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-muted)' }}>
            Apply some presets, then click &quot;Save Current&quot; to create a profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile, i) => {
            const isActive = config.activeProfile === profile.name;
            const isLoading = loading === profile.name;
            return (
              <div key={profile.name} className={`card-stagger card p-5 group relative ${isActive ? 'card-active' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {isActive && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: 'var(--accent)' }}>
                    <Check className="text-white" />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-2 truncate" style={{ color: 'var(--text-primary)' }}>{profile.name}</h3>
                    <div className="space-y-1">
                      {profile.cursor && <div className="flex items-center gap-2 text-[11px]"><span style={{ color: 'var(--text-dim)' }}>Cursor</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>{profile.cursor}</span></div>}
                      {profile.sound && <div className="flex items-center gap-2 text-[11px]"><span style={{ color: 'var(--text-dim)' }}>Sound</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>{profile.sound}</span></div>}
                      {profile.font && <div className="flex items-center gap-2 text-[11px]"><span style={{ color: 'var(--text-dim)' }}>Font</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>{profile.font}</span></div>}
                      {profile.skybox && <div className="flex items-center gap-2 text-[11px]"><span style={{ color: 'var(--text-dim)' }}>Skybox</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>{profile.skybox}</span></div>}
                      {profile.material && <div className="flex items-center gap-2 text-[11px]"><span style={{ color: 'var(--text-dim)' }}>Material</span><span className="truncate" style={{ color: 'var(--text-secondary)' }}>{profile.material}</span></div>}
                    </div>
                  </div>
                  <ProfilePreview profile={profile} />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApply(profile)} className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all ${isActive ? 'bg-[var(--accent-glow)] text-[var(--accent-light)] border border-[var(--border-accent)]' : 'btn'}`}>
                    {isActive ? 'Active' : 'Apply'}
                  </button>
                  <button onClick={() => handleDelete(profile.name)} className="btn btn-danger text-xs py-2 px-3">Del</button>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
                    <Spinner size={24} className="text-accent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
