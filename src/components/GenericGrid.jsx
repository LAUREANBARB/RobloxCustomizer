import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../store';
import { Check, Export, XMark, Spinner, Folder, StarIcon } from './icons';

const CONFIG = {
  skyboxes: {
    type: 'skyboxes',
    apiLabel: 'Skybox',
    label: 'Skyboxes',
    desc: 'Replace the sky with custom textures (.tex)',
    storeList: 'skyboxPresets',
    setList: 'setSkyboxPresets',
    activeKey: 'activeSkyboxPreset',
    emptyText: 'No skybox presets',
    emptyHint: 'Add a folder with 6 .tex files:',
    emptyDetail: 'sky512_bk.tex, sky512_dn.tex, sky512_ft.tex, sky512_lf.tex, sky512_rt.tex, sky512_up.tex',
    apiFn: (name) => window.api.applySkyboxPreset(name),
    removeFn: () => window.api.removeSkyboxPreset(),
    exportFn: (name) => window.api.exportPack({ type: 'skyboxes', presetName: name }),
    deleteFn: (name) => window.api.deleteSkyboxPreset(name),
    folderType: 'skyboxes',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M16 6C12 10 12 22 16 26C20 22 20 10 16 6Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    cardIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M12 4C9 8 9 16 12 20C15 16 15 8 12 4Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
  materials: {
    type: 'materials',
    apiLabel: 'Material',
    label: 'Materials',
    desc: 'Replace surface textures (.tex / .png)',
    storeList: 'materialPresets',
    setList: 'setMaterialPresets',
    activeKey: 'activeMaterialPreset',
    emptyText: 'No material presets',
    emptyHint: 'Add texture files (.tex / .png) to the material-presets folder.',
    apiFn: (name) => window.api.applyMaterialPreset(name),
    removeFn: () => window.api.removeMaterialPreset(),
    exportFn: (name) => window.api.exportPack({ type: 'materials', presetName: name }),
    deleteFn: (name) => window.api.deleteMaterialPreset(name),
    folderType: 'materials',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="8" y="8" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="18" y="8" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="8" y="18" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="18" y="18" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    cardIcon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <rect x="6" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <rect x="13" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <rect x="6" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
        <rect x="13" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
      </svg>
    ),
  },
};

function GenericCard({ preset, isActive, cfg, onApply, onExport, onDelete, loading, favorites, onToggleFavorite }) {
  const isFav = favorites.includes(preset.name);

  return (
    <div
      className={`card-stagger card p-4 cursor-pointer group relative ${isActive ? 'card-active' : ''}`}
      onClick={() => onApply(preset.name)}
    >
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: 'var(--accent)' }}>
          <Check className="text-white" />
        </div>
      )}
      <div className="aspect-square rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--bg-surface-alt)', color: 'var(--accent-light)' }}>
        {cfg.cardIcon}
      </div>
      <p className="text-sm font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>{preset.name}</p>
      <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{preset.files.length} texture files</p>
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(preset.name); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-yellow-500/30" style={{ background: 'rgba(0,0,0,0.6)' }} title={isFav ? 'Unfavorite' : 'Favorite'}>
          <StarIcon size={10} filled={isFav} className={isFav ? 'text-yellow-400' : 'text-surface-300'} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onExport(preset.name); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-accent/30" style={{ background: 'rgba(0,0,0,0.6)' }} title="Export">
          <Export size={10} />
        </button>
        {preset.source === 'custom' && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(preset.name); }}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-danger/30" style={{ background: 'rgba(0,0,0,0.6)' }} title="Delete">
            <XMark size={10} />
          </button>
        )}
      </div>
      {loading === preset.name && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
          <Spinner size={24} className="text-accent" />
        </div>
      )}
    </div>
  );
}

export default function GenericGrid({ presetType }) {
  const cfg = CONFIG[presetType];
  const store = useStore();
  const presets = store[cfg.storeList];
  const setPresets = store[cfg.setList];
  const { config, setConfig, addNotification } = store;
  const [loading, setLoading] = useState(null);
  const [search, setSearch] = useState('');

  const filteredPresets = (presets ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const favorites = (config.favorites && config.favorites[cfg.type]) || [];

  const handleToggleFavorite = async (name) => {
    await window.api.toggleFavorite(cfg.type, name);
    const c = await window.api.getConfig();
    setConfig(c);
  };

  const loadPresets = useCallback(async () => {
    try { const p = await window.api[`get${cfg.apiLabel}Presets`](); setPresets(p); } catch { addNotification('Failed to load presets', 'error'); }
  }, [cfg.apiLabel, setPresets, addNotification]);

  useEffect(() => { loadPresets(); }, [loadPresets]);

  const handleApply = async (name) => {
    setLoading(name);
    try {
      const result = await cfg.apiFn(name);
      if (result.success) { const c = await window.api.getConfig(); setConfig(c); addNotification(`${cfg.apiLabel} "${name}" applied`, 'success'); }
      else addNotification(result.reason || 'Failed', 'error');
    } catch { addNotification('Apply failed', 'error'); }
    setLoading(null);
  };

  const handleRemove = async () => {
    try { await cfg.removeFn(); const c = await window.api.getConfig(); setConfig(c); addNotification(`${cfg.label} reset to default`, 'info'); }
    catch { addNotification('Failed', 'error'); }
  };

  const handleExport = async (name) => {
    try {
      const result = await cfg.exportFn(name);
      if (result.success) addNotification(`Exported "${name}"`, 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Export failed', 'error');
    } catch { addNotification('Export failed', 'error'); }
  };

  const handleDelete = async (name) => {
    try { await cfg.deleteFn(name); loadPresets(); const c = await window.api.getConfig(); setConfig(c); addNotification(`Deleted "${name}"`, 'info'); }
    catch { addNotification('Delete failed', 'error'); }
  };

  const isActive = (name) => config[cfg.activeKey] === name;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{cfg.label}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{cfg.desc}</p>
        </div>
        <div className="flex items-center gap-2">
          {config[cfg.activeKey] && <button onClick={handleRemove} className="btn btn-danger text-sm">Reset</button>}
          <button onClick={() => window.api.openPresetFolder(cfg.folderType)} className="btn text-sm">
            <span className="flex items-center gap-2"><Folder />Open Folder</span>
          </button>
        </div>
      </div>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5" style={{ color: 'var(--text-dim)' }}>
            {cfg.icon}
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{cfg.emptyText}</h3>
          <p className="text-sm max-w-md mb-1" style={{ color: 'var(--text-muted)' }}>{cfg.emptyHint}</p>
          {cfg.emptyDetail && (
            <p className="text-xs mb-4" style={{ color: 'var(--text-dim)' }}>{cfg.emptyDetail}</p>
          )}
          <button onClick={() => window.api.openPresetFolder(cfg.folderType)} className="btn mt-5">Open {cfg.label} Folder</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder={`Search ${cfg.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {filteredPresets.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No {cfg.label.toLowerCase()} found matching &quot;{search}&quot;</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPresets.map((preset, i) => (
                <div key={`${preset.source}-${preset.name}`} style={{ animationDelay: `${i * 0.1}s` }}>
                  <GenericCard
                    preset={preset}
                    isActive={isActive(preset.name)}
                    cfg={cfg}
                    onApply={handleApply}
                    onExport={handleExport}
                    onDelete={handleDelete}
                    loading={loading}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { CONFIG as GRID_CONFIG };
