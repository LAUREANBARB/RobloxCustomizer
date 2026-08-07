import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { Check, Spinner } from './icons';

function MiniPresetCard({ preset, isActive, onApply }) {
  const { previewCache, setPreview } = useStore();
  const [loading, setLoading] = useState(false);

  const thumbKey = `${preset.source}/${preset.name}/ArrowCursor.png`;

  useEffect(() => {
    const cache = useStore.getState().previewCache;
    if (preset.files[0]?.endsWith('.png') && !cache[thumbKey]) {
      window.api.getCursorPreview(preset.name, preset.files.includes('ArrowCursor.png') ? 'ArrowCursor.png' : preset.files[0], preset.source)
        .then((data) => { if (data) setPreview(thumbKey, data); });
    }
  }, [preset.name, preset.source, preset.files, thumbKey, setPreview]);

  const thumbnail = previewCache[thumbKey] || null;
  const isSound = preset.files[0]?.match(/\\.(ogg|mp3|wav)$/i);

  const handleApply = async () => {
    setLoading(true);
    await onApply(preset.name);
    setLoading(false);
  };

  return (
    <div className={`card p-3 cursor-pointer group relative ${isActive ? 'card-active' : ''}`} onClick={handleApply}>
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center z-10">
          <Check size={8} className="text-white" />
        </div>
      )}
      <div className="aspect-square rounded-lg checker-bg flex items-center justify-center mb-2 overflow-hidden">
        {isSound ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-surface-500">
            <path d="M3 7V9M5.5 5V11M8 3V13M10.5 6V10M13 7.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : thumbnail ? (
          <img src={thumbnail} alt={preset.name} className="w-full h-full object-contain p-2" style={{ imageRendering: 'pixelated' }} />
        ) : (
          <div className="w-6 h-6 rounded bg-surface-800 animate-pulse" />
        )}
      </div>
      <p className="text-xs font-medium text-surface-300 truncate">{preset.name}</p>
      {loading && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center z-20">
          <Spinner size={20} className="text-accent" />
        </div>
      )}
    </div>
  );
}

export default function PresetsGrid() {
  const { categorizedCursors, categorizedSounds, config, setConfig, addNotification } = useStore();

  const handleApplyCursor = async (name) => {
    try {
      const result = await window.api.applyCursorPreset(name);
      if (result.success) {
        const cfg = await window.api.getConfig();
        setConfig(cfg);
        addNotification(`Applied "${name}"`, 'success');
      } else { addNotification(result.reason || 'Failed', 'error'); }
    } catch { addNotification('Apply failed', 'error'); }
  };

  const handleApplySound = async (name) => {
    try {
      const result = await window.api.applySoundPreset(name);
      if (result.success) {
        const cfg = await window.api.getConfig();
        setConfig(cfg);
        addNotification(`Sound "${name}" applied`, 'success');
      } else { addNotification(result.reason || 'Failed', 'error'); }
    } catch { addNotification('Apply failed', 'error'); }
  };

  let globalIndex = 0;

  return (
    <div className="fade-in space-y-10">
      {(categorizedCursors ?? []).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-accent">
              <path d="M3 2L15 9L9 10L7 16L3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            </svg>
            <h2 className="text-lg font-semibold text-surface-200">Cursors</h2>
          </div>
          <p className="text-xs text-surface-500 mb-6 ml-6">Curated crosshair and cursor presets</p>
          <div className="space-y-6">
            {categorizedCursors.map((section) => (
              <section key={section.name}>
                <h3 className="text-sm font-medium text-surface-300 mb-3">{section.name}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {section.presets.map((preset) => {
                    const idx = globalIndex++;
                    return (
                      <div key={preset.name} className="card-stagger" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <MiniPresetCard
                          preset={preset}
                          isActive={config.activeCursorPreset === preset.name}
                          onApply={handleApplyCursor}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {(categorizedSounds ?? []).length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" className="text-accent">
              <path d="M3 7V11M6 5V13M9 3V15M12 6V12M15 8V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h2 className="text-lg font-semibold text-surface-200">Sounds</h2>
          </div>
          <p className="text-xs text-surface-500 mb-6 ml-6">Curated sound packs</p>
          <div className="space-y-6">
            {categorizedSounds.map((section) => (
              <section key={section.name}>
                <h3 className="text-sm font-medium text-surface-300 mb-3">{section.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {section.presets.map((preset) => {
                    const idx = globalIndex++;
                    return (
                      <div key={preset.name} className="card-stagger" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div
                          className={`card p-3 cursor-pointer group relative ${config.activeSoundPreset === preset.name ? 'card-active' : ''}`}
                          onClick={() => handleApplySound(preset.name)}
                        >
                          {config.activeSoundPreset === preset.name && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center z-10">
                              <Check size={8} className="text-white" />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-surface-500">
                                <path d="M3 7V9M5.5 5V11M8 3V13M10.5 6V10M13 7.5V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-surface-300">{preset.name}</p>
                              <p className="text-[9px] text-surface-600">{preset.files.length} files</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {(categorizedCursors ?? []).length === 0 && (categorizedSounds ?? []).length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-surface-500">
              <rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="4" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="18" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-300 mb-2">No categorized presets</h3>
          <p className="text-sm text-surface-500">Presets will appear here once configured.</p>
        </div>
      )}
    </div>
  );
}
