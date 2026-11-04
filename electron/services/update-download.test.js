import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { assertTrustedUrl, sha256File, compareVersions } from './update-download';

describe('assertTrustedUrl', () => {
  it('accepts GitHub hosts over https', () => {
    for (const url of [
      'https://api.github.com/repos/a/b/releases/latest',
      'https://github.com/a/b/releases/download/v1/x.zip',
      'https://objects.githubusercontent.com/some/path',
    ]) {
      expect(assertTrustedUrl(url).hostname).toBe(new URL(url).hostname);
    }
  });

  it('rejects other schemes and hosts', () => {
    for (const url of [
      'http://github.com/a.zip',
      'file:///etc/passwd',
      'https://example.com/a.zip',
      'https://github.com.evil.tld/a.zip',
      'not a url',
    ]) {
      expect(() => assertTrustedUrl(url)).toThrow();
    }
  });
});

describe('compareVersions', () => {
  it('orders versions numerically', () => {
    expect(compareVersions('1.1.3', '1.1.2')).toBe(1);
    expect(compareVersions('1.1.2', '1.1.2')).toBe(0);
    expect(compareVersions('v1.1.0', '1.1.2')).toBe(-1);
    expect(compareVersions('1.10.0', '1.9.9')).toBe(1);
    expect(compareVersions('2.0', '2.0.0')).toBe(0);
  });
});

describe('sha256File', () => {
  it('hashes file contents', async () => {
    const file = path.join(os.tmpdir(), `rc-sha-${process.pid}.txt`);
    fs.writeFileSync(file, 'abc');
    try {
      expect(await sha256File(file)).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    } finally {
      fs.rmSync(file, { force: true });
    }
  });
});
