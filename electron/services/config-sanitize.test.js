import { describe, it, expect } from 'vitest';
import { sanitizeConfig, DEFAULT_CONFIG } from './config';

describe('sanitizeConfig', () => {
  it('returns defaults for non-objects', () => {
    expect(sanitizeConfig(null)).toEqual(DEFAULT_CONFIG);
    expect(sanitizeConfig('x')).toEqual(DEFAULT_CONFIG);
    expect(sanitizeConfig([])).toEqual(DEFAULT_CONFIG);
  });

  it('keeps valid values and drops unknown keys', () => {
    const out = sanitizeConfig({ theme: 'sublevel4', watcherEnabled: true, previewVolume: 20, evil: 1 });
    expect(out.theme).toBe('sublevel4');
    expect(out.watcherEnabled).toBe(true);
    expect(out.previewVolume).toBe(20);
    expect(out).not.toHaveProperty('evil');
  });

  it('nulls traversal preset names', () => {
    const out = sanitizeConfig({ activeCursorPreset: '../../../../home/dvrkxn/.ssh', activeProfile: 'ok' });
    expect(out.activeCursorPreset).toBeNull();
    expect(out.activeProfile).toBe('ok');
  });

  it('drops values of the wrong type', () => {
    const out = sanitizeConfig({ watcherEnabled: 'yes', previewVolume: -5, watcherInterval: 'x', theme: 5 });
    expect(out.watcherEnabled).toBe(DEFAULT_CONFIG.watcherEnabled);
    expect(out.previewVolume).toBe(DEFAULT_CONFIG.previewVolume);
    expect(out.watcherInterval).toBe(DEFAULT_CONFIG.watcherInterval);
    expect(out.theme).toBe(DEFAULT_CONFIG.theme);
  });

  it('filters favorites to known types and safe names', () => {
    const out = sanitizeConfig({
      favorites: { cursors: ['Ok', '../bad', 7], profiles: ['X'], sounds: 'nope' },
    });
    expect(out.favorites).toEqual({ cursors: ['Ok'] });
  });
});
