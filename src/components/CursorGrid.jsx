import React, { useEffect, useState, useCallback } from 'react';
import useStore from '../store';

function PresetCard({ preset, isActive, onApply, onExport, onDelete, isOwner }) {
  const { previewCache, setPreview } = useStore();
  const [loading, setLoading] = useState(false);

  const thumbKey = `${preset.source}/${preset.name}/ArrowCursor.png`;
  const fallbackKey = `${preset.source}/${preset.name}/${preset.files[0]}`;

  useEffect(() => {
    if (preset.files.includes('ArrowCursor.png') && !previewCache[thumbKey]) {
      window.api.getCursorPreview(preset.name, 'ArrowCursor.png', preset.source).then((data) => {
        if (data) setPreview(thumbKey, data);
      });
    } else if (!previewCache[fallbackKey] && preset.files.length > 0) {
      window.api.getCursorPreview(preset.name, preset.files[0], preset.source).then((data) => {
        if (data) setPreview(fallbackKey, data);
      });
    }
  }, [preset.name]);

  const thumbnail = previewCache[thumbKey] || previewCache[fallbackKey] || null;

  const handleApply = async () => {
    setLoading(true);
    await onApply(preset.name);
    setLoading(false);
  };

  return (
    <div className={`card p-4 cursor-pointer group relative ${isActive ? 'card-active' : ''}`} onClick={handleApply}>
      {isActive && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center z-10">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      <div className="aspect-square rounded-xl checker-bg flex items-center justify-center mb-3 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={preset.name} className="w-full h-full object-contain p-4" style={{ imageRendering: 'pixelated' }} />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-surface-800 animate-pulse" />
        )}
      </div>

      <p className="text-sm font-medium text-surface-200 truncate mb-1">{preset.name}</p>
      <div className="flex flex-wrap gap-1">
        {preset.files.map((f) => (
          <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-surface-500">{f.replace('.png', '')}</span>
        ))}
      </div>

      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => { e.stopPropagation(); onExport(preset.name); }}
          className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-accent/30" title="Export">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-surface-300">
            <path d="M5 1V7M3 5L5 7L7 5M2 9H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {!isOwner && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(preset.name); }}
            className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-danger/30" title="Delete">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-surface-400 hover:text-danger">
              <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
          <svg className="animate-spin w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

export default function CursorGrid() {
  const { cursorPresets, config, setCursorPresets, setConfig, addNotification } = useStore();
  const [search, setSearch] = useState('');

  const filteredPresets = cursorPresets.filter(preset =>
    preset.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadPresets = useCallback(async () => {
    try {
      const presets = await window.api.getCursorPresets();
      setCursorPresets(presets);
    } catch {}
  }, []);

  useEffect(() => { loadPresets(); }, []);

  const handleApply = async (name) => {
    try {
      const result = await window.api.applyCursorPreset(name);
      if (result.success) {
        const cfg = await window.api.getConfig();
        setConfig(cfg);
        addNotification(`Applied "${name}" to Roblox`, 'success');
      } else { addNotification(result.reason || 'Failed', 'error'); }
    } catch { addNotification('Apply failed', 'error'); }
  };

  const handleRemove = async () => {
    try {
      await window.api.removeCursorPreset();
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification('Cursors reset to default', 'info');
    } catch { addNotification('Failed', 'error'); }
  };

  const handleExport = async (name) => {
    try {
      const result = await window.api.exportPack({ type: 'cursors', presetName: name });
      if (result.success) addNotification(`Exported "${name}"`, 'success');
      else if (result.reason !== 'Cancelled') addNotification(result.reason || 'Export failed', 'error');
    } catch { addNotification('Export failed', 'error'); }
  };

  const handleImport = async () => {
    try {
      const result = await window.api.importPack();
      if (result.success) { loadPresets(); addNotification(`Imported: ${result.name}`, 'success'); }
      else addNotification('No packs imported', 'info');
    } catch { addNotification('Import failed', 'error'); }
  };

  const handleDelete = async (name) => {
    try {
      await window.api.deleteCursorPreset(name);
      loadPresets();
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification(`Deleted "${name}"`, 'info');
    } catch { addNotification('Delete failed', 'error'); }
  };

  const handleOpenFolder = () => window.api.openPresetFolder('cursors');
  const isActive = (name) => config.activeCursorPreset === name;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-surface-100">Cursors</h1>
          <p className="text-sm text-surface-500 mt-0.5">All cursor presets. Click to apply.</p>
        </div>
        <div className="flex items-center gap-2">
          {config.activeCursorPreset && <button onClick={handleRemove} className="btn btn-danger text-sm">Reset</button>}
          <button onClick={handleImport} className="btn text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2V9M4 7L7 10L10 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12H12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Import Pack
            </span>
          </button>
          <button onClick={handleOpenFolder} className="btn text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4H5.5L7 5.5H12V12H2V4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
              </svg>
              Open Folder
            </span>
          </button>
        </div>
      </div>

      {cursorPresets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-surface-500">
              <path d="M6 4L26 16L16 18L12 28L6 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-300 mb-2">No cursor presets</h3>
          <p className="text-sm text-surface-500 max-w-md">Import a .rcpack file or create a folder in the presets directory.</p>
          <div className="flex gap-2 mt-5">
            <button onClick={handleImport} className="btn">Import Pack</button>
            <button onClick={handleOpenFolder} className="btn">Open Folder</button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search cursors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {filteredPresets.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No cursors found matching "{search}"</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPresets.map((preset, i) => (
                <div
                  key={`${preset.source}-${preset.name}`}
                  className="card-stagger"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <PresetCard
                    preset={preset}
                    isActive={isActive(preset.name)}
                    onApply={handleApply}
                    onExport={handleExport}
                    onDelete={handleDelete}
                    isOwner={preset.source === 'owner'}
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
