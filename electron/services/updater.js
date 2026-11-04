const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { spawn } = require('child_process');
const AdmZip = require('adm-zip');
const { app } = require('electron');
const { downloadToFile, sha256File, compareVersions } = require('./update-download');

const OWNER = 'LAUREANBARB';
const REPO = 'RobloxCustomizer';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;
const PLATFORM_ASSET = process.platform === 'win32' ? /-win32-/ : /-linux-/;

function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    https
      .get(API_URL, { headers: { 'User-Agent': 'RobloxCustomizer-Updater' } }, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`GitHub API returned HTTP ${res.statusCode}`));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error('GitHub API returned invalid JSON'));
          }
        });
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

function parseDigest(digest) {
  const match = /^sha256:([0-9a-f]{64})$/i.exec(String(digest || ''));
  return match ? match[1].toLowerCase() : null;
}

async function checkForUpdates(currentVersion) {
  let release;
  try {
    release = await fetchLatestRelease();
  } catch (err) {
    console.error('Update check failed:', err.message);
    return null;
  }

  const latest = String(release.tag_name || '').replace(/^v/, '');
  if (!latest || compareVersions(latest, currentVersion) <= 0) return null;

  const asset = (release.assets || []).find((a) => PLATFORM_ASSET.test(a.name) && a.name.endsWith('.zip'));
  if (!asset) return null;

  return {
    version: latest,
    url: asset.browser_download_url,
    releaseUrl: release.html_url,
    sha256: parseDigest(asset.digest),
  };
}

function copyUpdate(sourceDir, destDir, executableName) {
  for (const entry of fs.readdirSync(sourceDir)) {
    const src = path.join(sourceDir, entry);
    const dest = path.join(destDir, entry);
    if (fs.lstatSync(src).isDirectory()) {
      fs.cpSync(src, dest, { recursive: true, force: true });
    } else if (entry === executableName) {
      const staged = `${dest}.new`;
      fs.copyFileSync(src, staged);
      fs.chmodSync(staged, fs.statSync(src).mode);
      fs.renameSync(staged, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
  }
}

async function downloadAndInstall(onStatus) {
  if (!app.isPackaged) throw new Error('Updates are disabled in development');

  onStatus('Checking for updates...');
  const update = await checkForUpdates(app.getVersion());
  if (!update) throw new Error('No update available');
  if (!update.sha256) throw new Error('Update asset has no checksum');

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rc-update-'));
  const zipPath = path.join(tmpDir, 'update.zip');
  const exePath = app.getPath('exe');
  const appDir = path.dirname(exePath);

  try {
    onStatus('Downloading update...');
    await downloadToFile(update.url, zipPath, (pct) => onStatus(`Downloading... ${pct}%`));

    onStatus('Verifying...');
    if ((await sha256File(zipPath)) !== update.sha256) throw new Error('Update checksum mismatch');

    onStatus('Installing...');
    new AdmZip(zipPath).extractAllTo(tmpDir, true);
    const extracted = fs
      .readdirSync(tmpDir)
      .find((d) => /^RobloxCustomizer-[A-Za-z0-9._-]+$/.test(d) && fs.lstatSync(path.join(tmpDir, d)).isDirectory());
    if (!extracted) throw new Error('Extraction failed');
    const sourceDir = path.join(tmpDir, extracted);

    if (process.platform === 'win32') {
      const batPath = path.join(tmpDir, 'update.bat');
      const script = [
        '@echo off',
        'timeout /t 2 /nobreak >nul',
        `xcopy /E /Y "${sourceDir}\\*" "${appDir}\\" >nul`,
        `rmdir /S /Q "${tmpDir}"`,
        `start "" "${exePath}"`,
      ].join('\r\n');
      fs.writeFileSync(batPath, `${script}\r\n`);
      spawn('cmd.exe', ['/c', batPath], { detached: true, stdio: 'ignore' }).unref();
      app.quit();
      return;
    }

    copyUpdate(sourceDir, appDir, path.basename(exePath));
    fs.rmSync(tmpDir, { recursive: true, force: true });
    app.relaunch();
    app.exit();
  } catch (err) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw err;
  }
}

module.exports = { checkForUpdates, downloadAndInstall };
