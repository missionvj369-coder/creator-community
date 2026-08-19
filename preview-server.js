import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3001;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let filePath = join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  
  const extname = '.' + String(filePath).split('.').pop();
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  try {
    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      
      // For HTML files, ensure proper headers
      if (extname === '.html') {
        res.writeHead(200, { 
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Content-Disposition': 'inline'
        });
      }
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 - File Not Found</h1>');
    }
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h1>500 - Server Error</h1><pre>${err.message}</pre>`);
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Preview server running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop\n`);
});