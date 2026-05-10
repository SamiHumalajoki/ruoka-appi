import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

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
