const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

const TRUSTED_HOSTS = ['github.com', 'objects.githubusercontent.com', 'api.github.com'];
const MAX_REDIRECTS = 3;

function assertTrustedUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid update URL: ${value}`);
  }
  if (url.protocol !== 'https:' || !TRUSTED_HOSTS.includes(url.hostname)) {
    throw new Error(`Untrusted update URL: ${value}`);
  }
  return url;
}

function downloadToFile(url, dest, onProgress, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const target = assertTrustedUrl(url);

    https
      .get(target, { headers: { 'User-Agent': 'RobloxCustomizer-Updater' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400) {
          res.resume();
          if (redirectsLeft <= 0) return reject(new Error('Too many redirects'));
          if (!res.headers.location) return reject(new Error('Redirect without a location'));
          const next = new URL(res.headers.location, target).toString();
          return downloadToFile(next, dest, onProgress, redirectsLeft - 1).then(resolve, reject);
        }

        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`Update download failed with HTTP ${res.statusCode}`));
        }

        const total = Number(res.headers['content-length']);
        const hasTotal = Number.isFinite(total) && total > 0;
        let downloaded = 0;

        const file = fs.createWriteStream(dest);
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          if (hasTotal && onProgress) onProgress(Math.round((downloaded / total) * 100));
        });
        res.on('error', (err) => {
          file.destroy();
          reject(err);
        });
        file.on('error', reject);
        file.on('finish', () => resolve());
        res.pipe(file);
      })
      .on('error', reject);
  });
}

function sha256File(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(filePath)
      .on('error', reject)
      .on('data', (chunk) => hash.update(chunk))
      .on('end', () => resolve(hash.digest('hex')));
  });
}

function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

module.exports = { assertTrustedUrl, downloadToFile, sha256File, compareVersions };
