const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, 'store');

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function filePath(name) {
  return path.join(STORE_DIR, `${name}.json`);
}

function read(name, fallback) {
  ensureStore();
  const p = filePath(name);
  if (!fs.existsSync(p)) return fallback;
  try {
    const raw = fs.readFileSync(p, 'utf-8');
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read ${name}:`, err.message);
    return fallback;
  }
}

function write(name, data) {
  ensureStore();
  const p = filePath(name);
  const tmp = `${p}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
}

module.exports = { read, write };
