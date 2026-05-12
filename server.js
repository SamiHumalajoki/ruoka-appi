import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const PORT = process.env.PORT || 3000;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function handleApi(req, res, urlPath) {
  res.setHeader('Content-Type', 'application/json');

  if (urlPath === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (urlPath === '/api/state' && req.method === 'GET') {
    if (fs.existsSync(STATE_FILE)) {
      res.writeHead(200);
      res.end(fs.readFileSync(STATE_FILE, 'utf8'));
    } else {
      res.writeHead(200);
      res.end('{}');
    }
    return;
  }

  if (urlPath === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        JSON.parse(body);
        ensureDataDir();
        fs.writeFileSync(STATE_FILE, body);
        res.writeHead(200);
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400);
        res.end('{"error":"invalid json"}');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('{"error":"not found"}');
}

const MIME = {
  '.html':  'text/html; charset=utf-8',
  '.js':    'application/javascript',
  '.css':   'text/css',
  '.svg':   'image/svg+xml',
  '.png':   'image/png',
  '.ico':   'image/x-icon',
  '.json':  'application/json',
  '.woff2': 'font/woff2',
  '.woff':  'font/woff',
};

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://localhost').pathname;

  if (urlPath.startsWith('/api/')) {
    handleApi(req, res, urlPath);
    return;
  }

  let filePath = path.join(DIST, urlPath);

  // SPA-reititys: tuntematon polku → index.html
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=31536000,immutable',
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const localIPs = Object.values(os.networkInterfaces())
    .flat()
    .filter(i => i?.family === 'IPv4' && !i.internal)
    .map(i => `  http://${i.address}:${PORT}`);
  console.log(`\nRuoka-appi käynnissä:`);
  console.log(`  http://localhost:${PORT}`);
  if (localIPs.length) console.log(localIPs.join('\n'));
  console.log();
});
