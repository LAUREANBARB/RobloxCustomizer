import React from 'react';
import usePresetGrid from '../hooks/usePresetGrid';
import { Folder, Import } from './icons';
import CursorPreviewCard from './CursorPreviewCard';
import ForceSizeControl from './ForceSizeControl';

export default function ShiftlockGrid() {
  const {
    presets, config, search, setSearch, filteredPresets,
    handleApply, handleRemove, handleExport, handleImport, handleDelete,
    handleOpenFolder, isActive,
  } = usePresetGrid('shiftlock');

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-surface-100">Shiftlock</h1>
          <p className="text-sm text-surface-500 mt-0.5">Shiftlock cursor presets. Click to apply.</p>
        </div>
        <div className="flex items-center gap-2">
          <ForceSizeControl overrideKey="forceShiftlockSize" />
          {config.activeShiftlockPreset && <button onClick={handleRemove} className="btn btn-danger text-sm">Reset</button>}
          <button onClick={handleImport} className="btn text-sm">
            <span className="flex items-center gap-2"><Import />Import Pack</span>
          </button>
          <button onClick={handleOpenFolder} className="btn text-sm">
            <span className="flex items-center gap-2"><Folder />Open Folder</span>
          </button>
        </div>
      </div>

      {presets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl glass flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-surface-500">
              <rect x="8" y="14" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <circle cx="16" cy="10" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-surface-300 mb-2">No shiftlock presets</h3>
          <p className="text-sm text-surface-500 max-w-md">Add cursor PNGs to the cursors folder — shiftlock uses the same preset pool.</p>
          <div className="flex gap-2 mt-5">
            <button onClick={handleImport} className="btn">Import Pack</button>
            <button onClick={handleOpenFolder} className="btn">Open Folder</button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search shiftlock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-200 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {filteredPresets.length === 0 ? (
            <p className="text-sm text-surface-500 text-center py-8">No presets found matching &quot;{search}&quot;</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPresets.map((preset, i) => (
                <div
                  key={`${preset.source}-${preset.name}`}
                  className="card-stagger"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <CursorPreviewCard
                    preset={preset}
                    isActive={isActive(preset.name)}
                    onApply={handleApply}
                    onExport={handleExport}
                    onDelete={handleDelete}
                    isOwner={preset.source === 'owner'}
                    previewType="shiftlock"
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
