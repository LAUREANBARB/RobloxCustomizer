import React, { useState } from 'react';
import useStore from '../store';

const SIZES = Array.from({ length: 19 }, (_, i) => 12 + i * 2);

export default function ForceSizeControl({ overrideKey = null }) {
  const { config, setConfig, addNotification } = useStore();
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const override = Boolean(overrideKey && config[overrideKey] > 0);
  const forceSize = override ? config[overrideKey] : config.forceSize;
  const isCustom = forceSize > 0 && !SIZES.includes(forceSize);

  const apply = async (value) => {
    try {
      const cfg = await window.api.getConfig();
      cfg[override ? overrideKey : 'forceSize'] = value;
      await window.api.saveConfig(cfg);
      setConfig(cfg);
      await window.api.reapplyAll();
      addNotification(value > 0 ? `Force size: ${value}px` : 'Force size off', 'success');
    } catch {
      addNotification('Failed to save force size', 'error');
    }
  };

  const handleToggle = (checked) => {
    setCustomOpen(false);
    apply(checked ? 12 : 0);
  };

  const handleOverride = (checked) => {
    setCustomOpen(false);
    const cfg = { ...config };
    cfg[overrideKey] = checked ? (config.forceSize > 0 ? config.forceSize : 12) : 0;
    setConfig(cfg);
    window.api.saveConfig(cfg).then(() => window.api.reapplyAll());
  };

  const handleSelect = (e) => {
    if (e.target.value === 'custom') {
      setCustomOpen(true);
    } else {
      apply(parseInt(e.target.value, 10));
    }
  };

  const handleCustom = (e) => {
    if (e.key === 'Enter' && customValue) {
      const n = parseInt(customValue, 10);
      if (n > 0 && n <= 512) {
        setCustomOpen(false);
        apply(n);
      }
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => handleToggle(!(forceSize > 0))}
        className="relative w-10 h-5 rounded-full shrink-0 transition-all duration-300"
        style={{
          background: forceSize > 0 ? 'var(--accent)' : 'var(--bg-surface-alt)',
          boxShadow: forceSize > 0 ? '0 0 12px var(--accent-glow)' : 'none',
        }}
      >
        <span
          className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{ left: forceSize > 0 ? '22px' : '3px' }}
        />
      </button>

      <span
        className="text-sm font-medium whitespace-nowrap transition-all duration-300 ml-2"
        style={{ color: forceSize > 0 ? 'var(--accent-light)' : 'var(--text-secondary)' }}
      >
        Force size
      </span>

      <div
        className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ maxWidth: forceSize > 0 ? '140px' : '0', opacity: forceSize > 0 ? 1 : 0, marginLeft: forceSize > 0 ? '8px' : '0' }}
      >
        {customOpen ? (
          <input
            autoFocus
            type="number"
            min="1"
            max="512"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={handleCustom}
            onBlur={() => setCustomOpen(false)}
            className="w-20 px-2 py-1 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-all"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-surface-alt)',
              color: 'var(--text-primary)',
              boxShadow: '0 0 12px var(--accent-glow)',
            }}
            placeholder="px"
          />
        ) : (
          <select
            value={isCustom ? 'custom' : forceSize}
            onChange={handleSelect}
            className="px-2 py-1 rounded-lg border text-sm cursor-pointer transition-all focus:outline-none focus:ring-2"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-surface-alt)',
              color: 'var(--text-primary)',
            }}
          >
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}px</option>
            ))}
            <option value="custom">Custom...</option>
          </select>
        )}
      </div>

      {overrideKey && (
        <div
          className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ maxWidth: forceSize > 0 ? '160px' : '0', opacity: forceSize > 0 ? 1 : 0, marginLeft: forceSize > 0 ? '12px' : '0' }}
        >
          <div className="flex items-center border-l pl-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => handleOverride(!override)}
              className="relative w-8 h-4 rounded-full shrink-0 transition-all duration-300"
              style={{
                background: override ? 'var(--accent)' : 'var(--bg-surface-alt)',
                boxShadow: override ? '0 0 10px var(--accent-glow)' : 'none',
              }}
            >
              <span
                className="absolute top-[2px] w-3 h-3 rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{ left: override ? '18px' : '2px' }}
              />
            </button>
            <span
              className="text-xs font-medium whitespace-nowrap ml-1.5 transition-all duration-300"
              style={{ color: override ? 'var(--accent-light)' : 'var(--text-secondary)' }}
            >
              Override cursors
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
