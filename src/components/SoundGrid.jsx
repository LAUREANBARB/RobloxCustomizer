import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store';

function SoundPresetCard({ preset, isActive, onApply, onRemove, onExport, onDelete, isOwner }) {
  const { previewCache, setPreview, playingSound, setPlayingSound } = useStore();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current = null;
      }
    };
  }, []);

  const handleApply = async () => { setLoading(true); await onApply(preset.name); setLoading(false); };

  const handlePlay = async (fileName, e) => {
    e.stopPropagation();
    const key = `${preset.source}/${preset.name}/${fileName}`;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (playingSound === key) {
      setPlayingSound(null);
      return;
    }
    if (!previewCache[key]) {
      const data = await window.api.getSoundPreview(preset.name, fileName, preset.source);
      if (data) setPreview(key, data); else return;
    }
    try {
      const audio = new Audio(previewCache[key]);
      audio.volume = 0.5;
      audioRef.current = audio;
      setPlayingSound(key);
      await audio.play();
      audio.onended = () => {
        setPlayingSound(null);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setPlayingSound(null);
        audioRef.current = null;
      };
    } catch {
      setPlayingSound(null);
      audioRef.current = null;
    }
  };

  return (
    <div className={`card p-5 group relative ${isActive ? 'card-active' : ''}`}>
      {isActive && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center z-10">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-accent/10' : 'glass'}`}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={isActive ? 'text-accent' : 'text-surface-400'}>
            <path d="M3 7V11M6 5V13M9 3V15M12 6V12M15 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-200 truncate">{preset.name}</p>
          <p className="text-[10px] text-surface-500">{preset.files.length} file{preset.files.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="space-y-1 mb-4">
        {preset.files.map((file) => {
          const key = `${preset.source}/${preset.name}/${file}`;
          const isPlaying = playingSound === key;
          return (
            <div key={file} className="flex items-center gap-2">
              <button onClick={(e) => handlePlay(file, e)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? 'bg-accent/20 text-accent' : 'bg-white/[0.03] text-surface-500 hover:text-accent hover:bg-accent/5'}`}>
                {isPlaying ? (
                  <div className="flex items-end gap-[1.5px] h-3">
                    {[1, 0.6, 0.8].map((h, i) => <div key={i} className="w-[1.5px] rounded-full bg-accent" style={{ height: `${h * 12}px` }} />)}
                  </div>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><polygon points="3,1 9,5 3,9" fill="currentColor"/></svg>
                )}
              </button>
              <span className="text-xs text-surface-400 truncate flex-1">{file}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button onClick={handleApply} className={`flex-1 text-xs py-2 rounded-xl font-medium transition-all ${isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'btn'}`}>
          {isActive ? 'Active' : 'Apply'}
        </button>
        {isActive && <button onClick={onRemove} className="btn btn-danger text-xs py-2 px-3">Remove</button>}
      </div>
      <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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

export default function SoundGrid() {
  const { soundPresets, config, setSoundPresets, setConfig, addNotification } = useStore();
  const [search, setSearch] = useState('');

  const filteredPresets = soundPresets.filter(preset =>
    preset.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadAll = async () => {
    try { const s = await window.api.getSoundPresets(); setSoundPresets(s); } catch { addNotification('Failed to load presets', 'error'); }
  };

  useEffect(() => { loadPresets(); }, []);

  const handleApply = async (name) => {
    try {
      const result = await window.api.applySoundPreset(name);
      if (result.success) { const cfg = await window.api.getConfig(); setConfig(cfg); addNotification(`Sound "${name}" applied`, 'success'); }
      else addNotification(result.reason || 'Failed', 'error');
    } catch { addNotification('Apply failed', 'error'); }
  };

  const handleRemove = async () => {
    try {
      await window.api.removeSoundPreset();
      const cfg = await window.api.getConfig();
      setConfig(cfg);
      addNotification('Sound reset to default', 'info');
    } catch { addNotification('Failed', 'error'); }
  };

  const handleExport = async (name) => {
    try {
      const result = await window.api.exportPack({ type: 'sounds', presetName: name });
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
    try { await window.api.deleteSoundPreset(name); loadPresets(); const cfg = await window.api.getConfig(); setConfig(cfg); addNotification(`Deleted "${name}"`, 'info'); }
    catch { addNotification('Delete failed', 'error'); }
  };

  const handleOpenFolder = () => window.api.openPresetFolder('sounds');
  const isActive = (name) => config.activeSoundPreset === name;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-surface-100">Sounds</h1>
          <p className="text-sm text-surface-500 mt-0.5">All sound presets. Click to apply.</p>
        </div>
        <div className="flex items-center gap-2">
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

      {soundPresets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-surface-500">
              <path d="M6 14V18M11 10V22M16 7V25M21 11V21M26 14V18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-300 mb-2">No sound presets</h3>
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
            placeholder="Search sounds..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {filteredPresets.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No sounds found matching "{search}"</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPresets.map((preset, i) => (
                <div
                  key={`${preset.source}-${preset.name}`}
                  className="card-stagger"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <SoundPresetCard
                    preset={preset}
                    isActive={isActive(preset.name)}
                    onApply={handleApply}
                    onRemove={handleRemove}
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
