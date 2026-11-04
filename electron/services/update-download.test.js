import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import AdmZip from 'adm-zip';
import { assertTrustedUrl, sha256File, compareVersions, restoreUnixModes } from './update-download';

describe('assertTrustedUrl', () => {
  it('accepts GitHub hosts over https', () => {
    for (const url of [
      'https://api.github.com/repos/a/b/releases/latest',
      'https://github.com/a/b/releases/download/v1/x.zip',
      'https://objects.githubusercontent.com/some/path',
      'https://release-assets.githubusercontent.com/github-production-release-asset/1/2',
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

describe('restoreUnixModes', () => {
  it('restores executable bits lost during adm-zip extraction', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-modes-'));
    const archive = path.join(dir, 'update.zip');
    const zip = new AdmZip();
    zip.addFile('RobloxCustomizer-linux-x64/RobloxCustomizer', Buffer.from('bin'), '', 0o755);
    zip.addFile('RobloxCustomizer-linux-x64/version', Buffer.from('1'), '', 0o644);
    zip.writeZip(archive);

    const extracted = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-modes-out-'));
    const source = new AdmZip(archive);
    source.extractAllTo(extracted, true);
    restoreUnixModes(source, extracted);

    expect(fs.statSync(path.join(extracted, 'RobloxCustomizer-linux-x64/RobloxCustomizer')).mode & 0o777).toBe(0o755);
    expect(fs.statSync(path.join(extracted, 'RobloxCustomizer-linux-x64/version')).mode & 0o777).toBe(0o644);

    fs.rmSync(dir, { recursive: true, force: true });
    fs.rmSync(extracted, { recursive: true, force: true });
  });
});
