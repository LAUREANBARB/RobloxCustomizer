import { describe, it, expect } from 'vitest';
import path from 'path';
import { isSafeName, resolveInside } from './safe-path';

describe('isSafeName', () => {
  it('accepts shipped preset names', () => {
    for (const name of ['BigPurpleCross', 'Minecraft', 'My Preset_1', 'XboxStyle']) {
      expect(isSafeName(name)).toBe(true);
    }
  });

  it('rejects traversal and path separators', () => {
    for (const name of ['..', '.', '../evil', 'a/b', 'a\\b', '/etc/passwd', 'C:\\Windows']) {
      expect(isSafeName(name)).toBe(false);
    }
  });

  it('rejects non-strings, empty and overlong names', () => {
    for (const name of ['', null, undefined, 42, 'x'.repeat(65)]) {
      expect(isSafeName(name)).toBe(false);
    }
  });
});

describe('resolveInside', () => {
  const base = path.join(path.sep, 'srv', 'presets');

  it('resolves a child path', () => {
    expect(resolveInside(base, 'Preset')).toBe(path.join(base, 'Preset'));
  });

  it('rejects escapes and the base itself', () => {
    for (const parts of [['..'], ['../x'], ['/etc'], [''], ['.']]) {
      expect(resolveInside(base, ...parts)).toBeNull();
    }
  });
});
