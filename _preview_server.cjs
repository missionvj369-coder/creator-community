// _preview_server.cjs — minimal static file server for local preview
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT ? Number(process.env.PORT) : 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.m4v': 'video/mp4'
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    // Prevent path traversal
    const target = path.normalize(path.join(ROOT, urlPath));
    if (!target.startsWith(ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.stat(target, (err, stat) => {
      if (err || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: ' + urlPath);
        return;
      }
      const ext = path.extname(target).toLowerCase();
      const type = TYPES[ext] || 'application/octet-stream';

      // HTTP Range support (required for <video> playback + seeking)
      const range = req.headers.range;
      if (range) {
        const m = /bytes=(\d*)-(\d*)/.exec(range);
        if (m) {
          let start = m[1] ? parseInt(m[1], 10) : 0;
          let end = m[2] ? parseInt(m[2], 10) : stat.size - 1;
          if (isNaN(start)) start = 0;
          if (isNaN(end) || end >= stat.size) end = stat.size - 1;
          if (start > end || start >= stat.size) {
            res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size });
            res.end();
            return;
          }
          res.writeHead(206, {
            'Content-Type': type,
            'Content-Length': end - start + 1,
            'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-store'
          });
          if (req.method === 'HEAD') { res.end(); return; }
          fs.createReadStream(target, { start, end }).pipe(res);
          return;
        }
      }

      res.writeHead(200, {
        'Content-Type': type,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store'
      });
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(target).pipe(res);
    });
  } catch (e) {
    res.writeHead(500); res.end('Server Error: ' + e.message);
  }
});

server.listen(PORT, () => {
  console.log('Preview server running:');
  console.log('  http://localhost:' + PORT + '/');
  console.log('  (serving ' + ROOT + ')');
  console.log('Press Ctrl+C to stop.');
});
