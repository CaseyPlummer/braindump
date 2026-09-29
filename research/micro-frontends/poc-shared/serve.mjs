// Static server for the assembled host (dist/host/browser), including the remotes
// copied under it. ES modules + import maps need HTTP, not file://.
//   npm run build && npm run serve:dist   (then open http://localhost:8138/)
import { createServer } from 'node:http';
import { readFile } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), 'dist', 'host', 'browser');
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const file = path === '/' ? '/index.html' : path;
  readFile(join(root, file), (err, data) => {
    if (err) {
      if (extname(file) === '') {
        readFile(join(root, 'index.html'), (e2, idx) => {
          if (e2) {
            res.writeHead(404);
            res.end('not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(idx);
          }
        });
      } else {
        res.writeHead(404);
        res.end('not found');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(data);
  });
}).listen(8138, () => console.log('Hybrid host served on http://localhost:8138/'));
