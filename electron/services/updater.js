const https = require('https');

const GITHUB_API = 'https://api.github.com/repos/LAUREANBARB/RobloxCustomizer/releases/latest';

function checkForUpdates(currentVersion, callback) {
  const options = {
    headers: { 'User-Agent': 'RobloxCustomizer-AutoUpdater' },
  };

  https
    .get(GITHUB_API, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const release = JSON.parse(data);
          const latest = release.tag_name.replace(/^v/, '');
          if (latest !== currentVersion) {
            callback({ updateAvailable: true, latest, url: release.html_url });
            return;
          }
        } catch {}
        callback({ updateAvailable: false });
      });
    })
    .on('error', () => callback({ updateAvailable: false }));
}

module.exports = { checkForUpdates };
