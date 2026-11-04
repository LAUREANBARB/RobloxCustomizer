const path = require('path');

const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,63}$/;

function isSafeName(name) {
  return typeof name === 'string' && SAFE_NAME.test(name);
}

function resolveInside(base, ...parts) {
  const root = path.resolve(base);
  const target = path.resolve(root, ...parts);
  if (target === root) return null;
  return target.startsWith(root + path.sep) ? target : null;
}

module.exports = { isSafeName, resolveInside };
