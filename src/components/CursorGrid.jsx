import React, { useEffect, useState } from 'react';
import useStore from '../store';
import usePresetGrid from '../hooks/usePresetGrid';
import { Check, Export, XMark, Spinner, Folder, Import } from './icons';

function PresetCard({ preset, isActive, onApply, onExport, onDelete, isOwner }) {
  const { previewCache, setPreview } = useStore();
  const [loading, setLoading] = useState(false);

  const thumbKey = `${preset.source}/${preset.name}/ArrowCursor.png`;
  const fallbackKey = `${preset.source}/${preset.name}/${preset.files[0]}`;

  useEffect(() => {
    const cache = useStore.getState().previewCache;
    if (preset.files.includes('ArrowCursor.png')) {
      if (!cache[thumbKey]) {
        window.api.getCursorPreview(preset.name, 'ArrowCursor.png', preset.source).then((data) => {
          if (data) setPreview(thumbKey, data);
        });
      }
    } else if (preset.files.length > 0 && !cache[fallbackKey]) {
      window.api.getCursorPreview(preset.name, preset.files[0], preset.source).then((data) => {
        if (data) setPreview(fallbackKey, data);
      });
    }
  }, [preset.name, preset.source, preset.files, thumbKey, fallbackKey, setPreview]);

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
          <Check className="text-white" />
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
          <Export className="text-surface-300" />
        </button>
        {!isOwner && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(preset.name); }}
            className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-danger/30" title="Delete">
            <XMark className="text-surface-400 hover:text-danger" />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
          <Spinner size={24} className="text-accent" />
        </div>
      )}
    </div>
  );
}

export default function CursorGrid() {
  const {
    presets, config, search, setSearch, filteredPresets,
    handleApply, handleRemove, handleExport, handleImport, handleDelete,
    handleOpenFolder, isActive,
  } = usePresetGrid('cursors');

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
              <Import />
              Import Pack
            </span>
          </button>
          <button onClick={handleOpenFolder} className="btn text-sm">
            <span className="flex items-center gap-2">
              <Folder />
              Open Folder
            </span>
          </button>
        </div>
      </div>

      {presets.length === 0 ? (
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
            <p className="text-sm text-surface-500 text-center py-8">No cursors found matching &quot;{search}&quot;</p>
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
