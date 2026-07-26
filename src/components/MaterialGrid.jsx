import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../store';

export default function MaterialGrid() {
  const { materialPresets, config, setMaterialPresets, setConfig, addNotification } = useStore();
  const [loading, setLoading] = useState(null);
  const [search, setSearch] = useState('');

  const filteredPresets = materialPresets.filter(preset =>
    preset.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadPresets = useCallback(async () => {
    try { const p = await window.api.getMaterialPresets(); setMaterialPresets(p); } catch { addNotification('Failed to load presets', 'error'); }
  }, []);

  useEffect(() => { loadPresets(); }, []);

  const handleApply = async (name) => {
    setLoading(name);
    try {
      const result = await window.api.applyMaterialPreset(name);
      if (result.success) { const cfg = await window.api.getConfig(); setConfig(cfg); addNotification(`Material "${name}" applied`, 'success'); }
      else addNotification(result.reason || 'Failed', 'error');
    } catch { addNotification('Apply failed', 'error'); }
    setLoading(null);
  };

  const handleRemove = async () => {
    try { await window.api.removeMaterialPreset(); const cfg = await window.api.getConfig(); setConfig(cfg); addNotification('Materials reset to default', 'info'); }
    catch { addNotification('Failed', 'error'); }
  };

  const handleExport = async (name) => {
    try {
      const result = await window.api.exportPack({ type: 'materials', presetName: name });
      if (result.success) addNotification(`Exported "${name}"`, 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Export failed', 'error');
    } catch { addNotification('Export failed', 'error'); }
  };

  const handleDelete = async (name) => {
    try { await window.api.deleteMaterialPreset(name); loadPresets(); const cfg = await window.api.getConfig(); setConfig(cfg); addNotification(`Deleted "${name}"`, 'info'); }
    catch { addNotification('Delete failed', 'error'); }
  };

  const isActive = (name) => config.activeMaterialPreset === name;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Materials</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Replace surface textures (.tex / .png)</p>
        </div>
        <div className="flex items-center gap-2">
          {config.activeMaterialPreset && <button onClick={handleRemove} className="btn btn-danger text-sm">Reset</button>}
          <button onClick={() => window.api.openPresetFolder('materials')} className="btn text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4H5.5L7 5.5H12V12H2V4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
              </svg>
              Open Folder
            </span>
          </button>
        </div>
      </div>

      {materialPresets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--text-dim)' }}>
              <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="8" y="8" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="18" y="8" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="8" y="18" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="18" y="18" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No material presets</h3>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-muted)' }}>
            Add texture files (.tex / .png) to the material-presets folder.
          </p>
          <button onClick={() => window.api.openPresetFolder('materials')} className="btn mt-5">Open Materials Folder</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {filteredPresets.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No materials found matching &quot;{search}&quot;</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPresets.map((preset, i) => (
                <div
                  key={`${preset.source}-${preset.name}`}
                  className={`card-stagger card p-4 cursor-pointer group relative ${isActive(preset.name) ? 'card-active' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                  onClick={() => handleApply(preset.name)}
                >
              {isActive(preset.name) && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center z-10" style={{ background: 'var(--accent)' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className="aspect-square rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--bg-surface-alt)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--accent-light)' }}>
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="6" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="13" y="6" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="6" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  <rect x="13" y="13" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                </svg>
              </div>
              <p className="text-sm font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>{preset.name}</p>
              <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{preset.files.length} texture files</p>
              <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onClick={(e) => { e.stopPropagation(); handleExport(preset.name); }}
                  className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} title="Export">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--text-secondary)' }}>
                    <path d="M5 1V7M3 5L5 7L7 5M2 9H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {preset.source === 'custom' && (
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(preset.name); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-danger/30" style={{ background: 'rgba(0,0,0,0.6)' }} title="Delete">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ color: 'var(--danger)' }}>
                      <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
              {loading === preset.name && (
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
                  <svg className="animate-spin w-6 h-6" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
          )}
        </>
      )}
    </div>
  );
}
