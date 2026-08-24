import React, { useEffect, useState } from 'react';
import usePresetGrid from '../hooks/usePresetGrid';
import { Check, Export, XMark } from './icons';

function FontPreviewCard({ preset, isActive, onApply, onExport, onDelete }) {
  const file = preset.files.find((f) => /\.(ttf|otf)$/i.test(f));
  const [fontUrl, setFontUrl] = useState(null);
  const [loading, setLoading] = useState(!!file);
  const fontFamily = `rc-font-${preset.source}-${preset.name}`.replace(/[^a-zA-Z0-9-]/g, '-');

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    window.api.getFontPreview(preset.name, file, preset.source).then((data) => {
      if (cancelled || !data) {
        setLoading(false);
        return;
      }
      const style = document.createElement('style');
      style.id = `rc-font-${fontFamily}`;
      style.textContent = `@font-face { font-family: '${fontFamily}'; src: url('${data}') format('${data.includes('font/otf') ? 'opentype' : 'truetype'}'); }`;
      document.head.appendChild(style);
      setFontUrl(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      document.getElementById(`rc-font-${fontFamily}`)?.remove();
    };
  }, [preset.name, preset.source, preset.files, file, fontFamily]);

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
      <div className="aspect-square rounded-xl bg-surface-800 flex items-center justify-center mb-3 overflow-hidden">
        {fontUrl ? (
          <span className="text-5xl font-bold" style={{ fontFamily: `'${fontFamily}', sans-serif` }}>Aa</span>
        ) : loading ? (
          <div className="w-8 h-8 rounded-lg bg-surface-700 animate-pulse" />
        ) : (
          <span className="text-4xl font-bold text-surface-600">Aa</span>
        )}
      </div>
      <p className="text-sm font-medium text-surface-200 truncate mb-1">{preset.name}</p>
      <p className="text-[10px] text-surface-500 truncate">{preset.files[0]}</p>
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button onClick={(e) => { e.stopPropagation(); onExport(preset.name); }}
          className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-accent/30" title="Export">
          <Export className="text-surface-300" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(preset.name); }}
          className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-danger/30" title="Delete">
          <XMark className="text-surface-400 hover:text-danger" />
        </button>
      </div>
    </div>
  );
}

export default function FontGrid() {
  const {
    presets, config, search, setSearch, filteredPresets,
    handleApply, handleRemove, handleExport, handleDelete,
    handleOpenFolder, isActive,
  } = usePresetGrid('fonts');

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-surface-100">Fonts</h1>
          <p className="text-sm text-surface-500 mt-0.5">Replace Roblox&apos;s in-game fonts</p>
        </div>
        <div className="flex items-center gap-2">
          {config.activeFontPreset && <button onClick={handleRemove} className="btn btn-danger text-sm">Reset</button>}
          <button onClick={handleOpenFolder} className="btn text-sm">
            <span className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3C1 2.44772 1.44772 2 2 2H4.5L6 3.5H12C12.5523 3.5 13 3.94772 13 4.5V11C13 11.5523 12.5523 12 12 12H2C1.44772 12 1 11.5523 1 11V3Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>Open Folder</span>
          </button>
        </div>
      </div>

      <div className="mb-5 px-4 py-3 rounded-xl border text-sm" style={{ borderColor: 'var(--warning-border, rgba(251,191,36,0.25))', background: 'var(--warning-bg, rgba(251,191,36,0.06))', color: 'var(--text-secondary, #d4a853)' }}>
        <span className="font-semibold">Note:</span> Most in-game UI and chat fonts will change, but not all are guaranteed. Fonts loaded from the cloud by games at runtime cannot be overridden locally.
      </div>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-surface-500">
              <path d="M4 7H28M16 7V28M10 28H22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-300 mb-2">No font presets</h3>
          <p className="text-sm text-surface-500 max-w-md">Add a folder with .ttf or .otf files to the fonts directory.</p>
          <button onClick={handleOpenFolder} className="btn mt-5">Open Fonts Folder</button>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search fonts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {filteredPresets.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No fonts found matching &quot;{search}&quot;</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPresets.map((preset, i) => (
                <div key={`${preset.source}-${preset.name}`} className="card-stagger" style={{ animationDelay: `${i * 0.1}s` }}>
                  <FontPreviewCard
                    preset={preset}
                    isActive={isActive(preset.name)}
                    onApply={handleApply}
                    onExport={handleExport}
                    onDelete={handleDelete}
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
