const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || './data';

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const store = {};

function save() {
  try {
    fs.writeFileSync(path.join(DATA_DIR, 'progress.json'), JSON.stringify(store));
  } catch (e) {}
}

const server = http.createServer((req, res) => {
  const url = require('url').parse(req.url || '/', true);
  const pathname = url.pathname || '/';

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    if (pathname === '/') {
      serveFile(res, path.join('public', 'index.html'));
    } else if (pathname === '/api/me') {
      const id = Object.keys(store)[0] || 'anonymous';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 200, user: store[id] || { daysDone: [], reflections: [] } }));
    } else if (pathname === '/api/auth/start') {
      const id = `UGT-${Date.now().toString(36).slice(0, 8)}`;
      store[id] = JSON.parse(body) || { daysDone: [], reflections: [] };
      save();
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 201, user: { id, ...store[id] } }));
    } else if (pathname === '/api/gate/open') {
      const count = Math.floor(Math.random() * 5) + 1;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 200, view: { gate: { day: 1, stations: Array.from({ length: count }, (_, i) => ({ type: 'unit', idx: i })) } } }));
    } else if (pathname === '/api/unit/complete') {
      const { seconds } = JSON.parse(body) || {};
      const code = (seconds && seconds < 60) ? 'too_fast' : 'ok';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 200, code }));
    } else if (pathname === '/api/seal') {
      const { after } = JSON.parse(body) || {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 200, view: { gateSealed: after === 'same', teaser: after === 'same' ? 'Progress saved.' : '' } }));
    } else if (pathname === '/api/experience/complete') {
      const { realm } = JSON.parse(body) || {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: realm === 'passage' ? 403 : 200 }));
    } else if (pathname === '/api/pin') {
      const { pin } = JSON.parse(body) || {};
      if (pin) { store.pin = pin; save(); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ status: 200 })); }
      else { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ status: store.pin ? 200 : 400, pin: store.pin })); }
    } else if (pathname === '/api/auth/restore') {
      const { id, pin } = JSON.parse(body) || {};
      if (store[id] && store[id].pin === pin) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 200, token: `temp-${Date.now()}`, doc: store[id] }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 401 }));
      }
    } else {
      serveFile(res, path.join('public', pathname === '/' ? 'index.html' : pathname));
    }
  });
});

function serveFile(res, filePath) {
  if (!filePath.includes('.')) {
    filePath += '.html';
  }
  if (fs.existsSync(filePath)) {
    let contentType = 'text/html';
    if (filePath.endsWith('.css')) contentType = 'text/css';
    if (filePath.endsWith('.js')) contentType = 'application/javascript';
    if (filePath.endsWith('.png')) contentType = 'image/png';
    if (filePath.endsWith('.webp')) contentType = 'image/webp';
    if (filePath.endsWith('.webmanifest')) contentType = 'application/manifest+json';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('404 Not Found');
  }
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Human Within Server running at http://0.0.0.0:${PORT}`);
});