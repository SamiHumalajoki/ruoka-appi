import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const PORT = process.env.API_PORT || 3001;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  const urlPath = new URL(req.url, 'http://localhost').pathname;

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

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
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API server käynnissä: http://localhost:${PORT}`);
});
