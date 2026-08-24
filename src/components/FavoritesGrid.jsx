import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { Check, Export, Spinner, StarIcon } from './icons';

function FavoriteCard({ preset, type, onApply, onExport, onToggleFavorite, isActive }) {
  const [loading, setLoading] = useState(false);
  const previewCache = useStore((s) => s.previewCache);

  const handleApply = async () => {
    setLoading(true);
    await onApply(type, preset.name);
    setLoading(false);
  };

  const getPreviewContent = () => {
    if (type === 'cursors' || type === 'shiftlock') {
      const thumbKey = `${preset.source}/${preset.name}/ArrowCursor.png`;
      const fallbackKey = `${preset.source}/${preset.name}/${preset.files[0]}`;
      const thumbnail = previewCache[thumbKey] || previewCache[fallbackKey];
      return thumbnail ? (
        <img src={thumbnail} alt={preset.name} className="w-full h-full object-contain p-3" style={{ imageRendering: 'pixelated' }} />
      ) : (
        <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: 'var(--bg-surface-alt)' }} />
      );
    }
    if (type === 'fonts') {
      return (
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: 'var(--accent-light)' }}>Aa</span>
          <span className="text-[9px] mt-1" style={{ color: 'var(--text-dim)' }}>Font</span>
        </div>
      );
    }
    if (type === 'sounds') {
      return (
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--accent-light)' }}>
          <path d="M3 7V11M6 5V13M9 3V15M12 6V12M15 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    }
    if (type === 'skyboxes') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-light)' }}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <path d="M12 4C9 8 9 16 12 20C15 16 15 8 12 4Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        </svg>
      );
    }
    if (type === 'materials') {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-light)' }}>
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <rect x="6" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <rect x="13" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <rect x="6" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <rect x="13" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        </svg>
      );
    }
    return null;
  };

  const typeLabel = { cursors: 'Cursor', shiftlock: 'Shiftlock', sounds: 'Sound', fonts: 'Font', skyboxes: 'Skybox', materials: 'Material' }[type];

  return (
    <div className={`card p-4 group relative ${isActive ? 'card-active' : ''}`}>
      {isActive && (
        <div className="absolute top-2 right-8 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: 'var(--accent)' }}>
          <Check className="text-white" />
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(type, preset.name); }}
        className="absolute top-2 right-2 z-10"
        title="Remove from favorites"
      >
        <StarIcon size={14} filled className="text-yellow-400 hover:text-yellow-300" />
      </button>

      <div className="aspect-square rounded-xl flex items-center justify-center mb-3 checker-bg overflow-hidden" style={{ background: 'var(--bg-surface-alt)' }}>
        {getPreviewContent()}
      </div>

      <p className="text-[10px] font-medium mb-0.5 truncate" style={{ color: 'var(--text-dim)' }}>{typeLabel}</p>
      <p className="text-sm font-medium truncate mb-3" style={{ color: 'var(--text-primary)' }}>{preset.name}</p>

      <div className="flex gap-2">
        <button onClick={handleApply} className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all ${isActive ? 'bg-[var(--accent-glow)] text-[var(--accent-light)] border border-[var(--border-accent)]' : 'btn'}`}>
          {isActive ? 'Active' : 'Apply'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onExport(type, preset.name); }} className="btn text-xs py-2 px-3" title="Export">
          <Export size={10} />
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
          <Spinner size={24} />
        </div>
      )}
    </div>
  );
}

const CATEGORY_API = {
  cursors: { get: 'getCursorPresets', apply: 'applyCursorPreset', remove: 'removeCursorPreset', deletePreset: 'deleteCursorPreset', exportPreset: (name) => window.api.exportPack({ type: 'cursors', presetName: name }), activeKey: 'activeCursorPreset' },
  shiftlock: { get: 'getShiftlockPresets', apply: 'applyShiftlockPreset', remove: 'removeShiftlockPreset', deletePreset: 'deleteShiftlockPreset', exportPreset: (name) => window.api.exportPack({ type: 'shiftlock', presetName: name }), activeKey: 'activeShiftlockPreset' },
  sounds: { get: 'getSoundPresets', apply: 'applySoundPreset', remove: 'removeSoundPreset', deletePreset: 'deleteSoundPreset', exportPreset: (name) => window.api.exportPack({ type: 'sounds', presetName: name }), activeKey: 'activeSoundPreset' },
  fonts: { get: 'getFontPresets', apply: 'applyFontPreset', remove: 'removeFontPreset', deletePreset: 'deleteFontPreset', exportPreset: (name) => window.api.exportPack({ type: 'fonts', presetName: name }), activeKey: 'activeFontPreset' },
  skyboxes: { get: 'getSkyboxPresets', apply: 'applySkyboxPreset', remove: 'removeSkyboxPreset', deletePreset: 'deleteSkyboxPreset', exportPreset: (name) => window.api.exportPack({ type: 'skyboxes', presetName: name }), activeKey: 'activeSkyboxPreset' },
  materials: { get: 'getMaterialPresets', apply: 'applyMaterialPreset', remove: 'removeMaterialPreset', deletePreset: 'deleteMaterialPreset', exportPreset: (name) => window.api.exportPack({ type: 'materials', presetName: name }), activeKey: 'activeMaterialPreset' },
};

export default function FavoritesGrid() {
  const { config, setConfig, addNotification } = useStore();
  const [allPresets, setAllPresets] = useState({});
  const favorites = config.favorites || {};

  useEffect(() => {
    const loadAll = async () => {
      const results = {};
      for (const [type, api] of Object.entries(CATEGORY_API)) {
        try {
          results[type] = await window.api[api.get]();
        } catch {
          results[type] = [];
        }
      }
      setAllPresets(results);
    };
    loadAll();
  }, [config.favorites]);

  const favTypes = Object.keys(favorites).filter((t) => favorites[t] && favorites[t].length > 0);

  const handleToggleFavorite = async (type, name) => {
    await window.api.toggleFavorite(type, name);
    const cfg = await window.api.getConfig();
    setConfig(cfg);
  };

  const handleApply = async (type, name) => {
    const api = CATEGORY_API[type];
    try {
      const result = await window.api[api.apply](name);
      if (result.success) {
        const cfg = await window.api.getConfig();
        setConfig(cfg);
        addNotification(`Applied "${name}"`, 'success');
      } else {
        addNotification(result.reason || 'Failed', 'error');
      }
    } catch {
      addNotification('Apply failed', 'error');
    }
  };

  const handleExport = async (type, name) => {
    try {
      const result = await CATEGORY_API[type].exportPreset(name);
      if (result.success) addNotification(`Exported "${name}"`, 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Export failed', 'error');
    } catch {
      addNotification('Export failed', 'error');
    }
  };

  const handleDelete = async (type, name) => {
    try {
      await window.api[CATEGORY_API[type].deletePreset](name);
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification(`Deleted "${name}"`, 'info');
    } catch {
      addNotification('Delete failed', 'error');
    }
  };

  const CATEGORY_LABELS = { cursors: 'Cursors', shiftlock: 'Shiftlock', sounds: 'Sounds', fonts: 'Fonts', skyboxes: 'Skyboxes', materials: 'Materials' };

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Favorites</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Your starred presets across all categories</p>
        </div>
      </div>

      {favTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 18 18" fill="none" style={{ color: 'var(--text-dim)' }}>
              <path d="M9 2L11.1 6.3L16 6.9L12.5 10.3L13.3 15.2L9 12.9L4.7 15.2L5.5 10.3L2 6.9L6.9 6.3L9 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No favorites yet</h3>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-muted)' }}>
            Click the star icon on any preset to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {favTypes.map((type) => {
            const presets = allPresets[type] || [];
            const favNames = favorites[type] || [];
            const favPresets = favNames
              .map((name) => presets.find((p) => p.name === name))
              .filter(Boolean);

            if (favPresets.length === 0) return null;

            return (
              <div key={type}>
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{CATEGORY_LABELS[type]}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {favPresets.map((preset, i) => (
                    <div key={`${type}-${preset.name}`} className="card-stagger" style={{ animationDelay: `${i * 0.05}s` }}>
                      <FavoriteCard
                        preset={preset}
                        type={type}
                        onApply={handleApply}
                        onExport={handleExport}
                        onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite}
                        isActive={config[CATEGORY_API[type].activeKey] === preset.name}
                        config={config}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
