const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { app } = require('electron');

const OWNER = 'LAUREANBARB';
const REPO = 'RobloxCustomizer';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`;

function checkForUpdates(currentVersion) {
  return new Promise((resolve) => {
    const options = { headers: { 'User-Agent': 'RobloxCustomizer-Updater' } };

    https
      .get(API_URL, options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const release = JSON.parse(data);
            const latest = release.tag_name.replace(/^v/, '');
            if (latest === currentVersion) return resolve(null);
            const asset = release.assets.find((a) => {
              const platform = process.platform === 'win32' ? 'windows' : 'linux';
              return a.name.includes(platform);
            });
            if (!asset) return resolve(null);
            resolve({ version: latest, url: asset.browser_download_url, releaseUrl: release.html_url });
          } catch {
            resolve(null);
          }
        });
      })
      .on('error', () => resolve(null));
  });
}

function downloadUpdate(url, dest, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 302) return downloadUpdate(res.headers.location, dest, onProgress).then(resolve, reject);
        const total = parseInt(res.headers['content-length'], 10);
        let downloaded = 0;
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          if (onProgress) onProgress(Math.round((downloaded / total) * 100));
        });
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      })
      .on('error', reject);
  });
}

async function downloadAndInstall(updateInfo, win, onStatus) {
  const tmpDir = path.join(app.getPath('temp'), 'roblox-customizer-update');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const zipPath = path.join(tmpDir, 'update.zip');

  try {
    const AdmZip = require('adm-zip');
    onStatus('Downloading update...');
    await downloadUpdate(updateInfo.url, zipPath, (pct) => onStatus(`Downloading... ${pct}%`));

    onStatus('Installing...');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(tmpDir, true);

    const extracted = fs.readdirSync(tmpDir).find((d) => d.startsWith('RobloxCustomizer-'));
    if (!extracted) throw new Error('Extraction failed');
    const sourceDir = path.join(tmpDir, extracted);

    const appDir = path.dirname(app.getAppPath());

    if (process.platform === 'win32') {
      const batPath = path.join(tmpDir, 'update.bat');
      fs.writeFileSync(batPath, `@echo off\r\ntimeout /t 2 /nobreak >nul\r\nxcopy /E /Y "${sourceDir}\\\\*" "${appDir}\\\\" >nul\r\nrmdir /S /Q "${tmpDir}"\r\nstart "" "${appDir}\\\\${extracted}\\\\RobloxCustomizer.exe"\r\n`);
      exec(`start "" "${batPath}"`);
      app.quit();
    } else {
      exec(`cp -r "${sourceDir}/"* "${appDir}/" && rm -rf "${tmpDir}"`, () => {
        app.relaunch();
        app.exit();
      });
    }
  } catch (err) {
    try { fs.rmSync(tmpDir, { recursive: true }); } catch {}
    throw err;
  }
}

module.exports = { checkForUpdates, downloadAndInstall };
