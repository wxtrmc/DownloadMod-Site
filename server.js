const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const MOD_DIR = path.join(__dirname, 'mod');
const COUNT_FILE = path.join(__dirname, 'count.json');
const CONFIG_FILE = path.join(__dirname, 'config.json');

let count = 0;
try {
  count = JSON.parse(fs.readFileSync(COUNT_FILE, 'utf8')).count || 0;
} catch (e) {}

function saveCount() {
  fs.writeFile(COUNT_FILE, JSON.stringify({ count }), () => {});
}

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function listJars() {
  if (!fs.existsSync(MOD_DIR)) return [];
  return fs.readdirSync(MOD_DIR).filter(f => f.toLowerCase().endsWith('.jar'));
}

function parseVer(v) {
  const p = v.split('.').map(Number);
  while (p.length < 3) p.push(0);
  return p;
}

function cmpVer(a, b) {
  const x = parseVer(a), y = parseVer(b);
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] - y[i];
  }
  return 0;
}

function fileSupports(file, version) {
  const m = file.match(/mc(\d+(?:\.\d+)+)(?:-(\d+(?:\.\d+)+))?/);
  if (m) {
    const from = m[1];
    const to = m[2] || m[1];
    return cmpVer(version, from) >= 0 && cmpVer(version, to) <= 0;
  }
  const escaped = version.replace(/\./g, '\\.');
  return new RegExp('(?<![0-9])' + escaped + '(?!\\.?[0-9])').test(file);
}

function getModFile(version) {
  const jars = listJars();
  if (!jars.length) return null;

  const match = jars.find(f => fileSupports(f, version));
  if (match) return path.join(MOD_DIR, match);

  if (jars.length === 1 && !/1\.21/.test(jars[0])) {
    return path.join(MOD_DIR, jars[0]);
  }
  return null;
}

const clients = new Set();

function broadcast() {
  for (const res of clients) res.write(`data: ${count}\n\n`);
}

app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });
  res.flushHeaders();
  res.write(`data: ${count}\n\n`);
  clients.add(res);
  req.on('close', () => clients.delete(res));
});

setInterval(() => {
  for (const res of clients) res.write(': ping\n\n');
}, 25000);

app.get('/api/info', (req, res) => {
  const config = getConfig();
  const versions = config.versions || [];
  const available = {};
  versions.forEach(v => { available[v] = !!getModFile(v); });
  res.json({ ...config, count, available });
});

app.get('/download', (req, res) => {
  const versions = getConfig().versions || [];
  const v = String(req.query.v || '');
  if (!versions.includes(v)) return res.status(400).send('Invalid version');

  const file = getModFile(v);
  if (!file) return res.status(404).send('This version is not available yet');

  count++;
  saveCount();
  broadcast();
  res.download(file);
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
