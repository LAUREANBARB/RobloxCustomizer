import React, { useEffect, useState } from 'react';
import useStore from '../store';
import { Check, Export, XMark, Spinner } from './icons';

export default function CursorPreviewCard({ preset, isActive, onApply, onExport, onDelete, isOwner, previewType }) {
  const { previewCache, setPreview } = useStore();
  const [loading, setLoading] = useState(false);

  const thumbKey = `${preset.source}/${preset.name}/ArrowCursor.png`;
  const fallbackKey = `${preset.source}/${preset.name}/${preset.files[0]}`;

  useEffect(() => {
    const cache = useStore.getState().previewCache;
    const getPreview = previewType === 'shiftlock'
      ? window.api.getCursorPreview
      : (name, file, src) => window.api.getCursorPreview(name, file, src);
    if (preset.files.includes('ArrowCursor.png')) {
      if (!cache[thumbKey]) {
        getPreview(preset.name, 'ArrowCursor.png', preset.source).then((data) => {
          if (data) setPreview(thumbKey, data);
        });
      }
    } else if (preset.files.length > 0 && !cache[fallbackKey]) {
      getPreview(preset.name, preset.files[0], preset.source).then((data) => {
        if (data) setPreview(fallbackKey, data);
      });
    }
  }, [preset.name, preset.source, preset.files, thumbKey, fallbackKey, setPreview, previewType]);

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
