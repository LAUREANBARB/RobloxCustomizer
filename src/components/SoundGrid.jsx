import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store';
import usePresetGrid from '../hooks/usePresetGrid';
import { Check, Export, XMark, Spinner, Folder, Import, PlayIcon, StarIcon } from './icons';

function SoundPresetCard({ preset, isActive, onApply, onRemove, onExport, onDelete, isOwner, volume }) {
  const { previewCache, setPreview, playingSound, setPlayingSound, config, setConfig } = useStore();
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const isFav = !!(config.favorites && config.favorites.sounds && config.favorites.sounds.includes(preset.name));

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    await window.api.toggleFavorite('sounds', preset.name);
    const cfg = await window.api.getConfig();
    setConfig(cfg);
  };

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
      if (data) setPreview(key, data);
      else return;
    }
    try {
      const audio = new Audio(previewCache[key]);
      audio.volume = (volume ?? 50) / 100;
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
      console.error('Audio playback failed');
      setPlayingSound(null);
      audioRef.current = null;
    }
  };

  const SoundBars = () => (
    <div className="flex items-end gap-[1.5px] h-3">
      {[1, 0.6, 0.8].map((h, i) => <div key={i} className="w-[1.5px] rounded-full bg-accent" style={{ height: `${h * 12}px` }} />)}
    </div>
  );

  return (
    <div className={`card p-5 group relative ${isActive ? 'card-active' : ''}`}>
      {isActive && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center z-10">
          <Check className="text-white" />
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
                {isPlaying ? <SoundBars /> : <PlayIcon />}
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
        <button onClick={handleToggleFavorite}
          className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-yellow-500/30" title={isFav ? 'Unfavorite' : 'Favorite'}>
          <StarIcon size={10} filled={isFav} className={isFav ? 'text-yellow-400' : 'text-surface-300'} />
        </button>
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

export default function SoundGrid() {
  const {
    presets, config, search, setSearch, filteredPresets,
    handleApply, handleRemove, handleExport, handleImport, handleDelete,
    handleOpenFolder, isActive,
  } = usePresetGrid('sounds');

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-surface-100">Sounds</h1>
          <p className="text-sm text-surface-500 mt-0.5">All sound presets. Click to apply.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleImport} className="btn text-sm">
            <span className="flex items-center gap-2"><Import />Import Pack</span>
          </button>
          <button onClick={handleOpenFolder} className="btn text-sm">
            <span className="flex items-center gap-2"><Folder />Open Folder</span>
          </button>
        </div>
      </div>

      <div className="mb-5 px-4 py-3 rounded-xl border text-sm" style={{ borderColor: 'var(--warning-border, rgba(251,191,36,0.25))', background: 'var(--warning-bg, rgba(251,191,36,0.06))', color: 'var(--text-secondary, #d4a853)' }}>
        <span className="font-semibold">Note:</span> You may need to click the play button twice for audio to start. This will be fixed in a future update.
      </div>

      {presets.length === 0 ? (
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
            <p className="text-sm text-surface-500 text-center py-8">No sounds found matching &quot;{search}&quot;</p>
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
                    volume={config.previewVolume}
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
