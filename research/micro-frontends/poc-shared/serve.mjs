// Static server for the assembled host (dist/host/browser), including the remotes
// copied under it. ES modules + import maps need HTTP, not file://.
//   npm run build && npm run serve:dist   (then open http://localhost:8138/)
//
// Opt-in Angular 19 remote (built by `npm run build:ng19`, Native Federation v3 line):
//   node serve.mjs --ng19               serves it from its own origin (http://localhost:8139)
//   node serve.mjs --ng19-same-origin   serves it under /mfe-orders-ng19/ on the host origin
// Either flag adds a "mfe-orders-ng19" entry to the served federation.manifest.json; the
// built host only loads that remote when the manifest lists it.
import { createServer } from 'node:http';
import { readFile } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, 'dist', 'host', 'browser');
const ng19Root = join(here, 'ng19', 'dist', 'mfe-orders-ng19', 'browser');
const ng19Mode = process.argv.includes('--ng19')
  ? 'cross-origin'
  : process.argv.includes('--ng19-same-origin')
    ? 'same-origin'
    : null;
const NG19_PORT = 8139;

const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function send(res, status, body, type, extraHeaders = {}) {
  res.writeHead(status, { ...(type && { 'Content-Type': type }), ...extraHeaders });
  res.end(body);
}

function serveStatic(dir, { spaFallback, headers = {} }) {
  return (req, res) => {
    const path = decodeURIComponent(req.url.split('?')[0]);
    const file = path === '/' ? '/index.html' : path;
    readFile(join(dir, file), (err, data) => {
      if (!err)
        return send(res, 200, data, types[extname(file)] ?? 'application/octet-stream', headers);
      if (spaFallback && extname(file) === '') {
        return readFile(join(dir, 'index.html'), (e2, idx) =>
          e2 ? send(res, 404, 'not found') : send(res, 200, idx, 'text/html'),
        );
      }
      send(res, 404, 'not found', undefined, headers);
    });
  };
}

const host = serveStatic(root, { spaFallback: true });
const ng19SameOrigin = serveStatic(ng19Root, { spaFallback: false });

createServer((req, res) => {
  const path = req.url.split('?')[0];
  if (ng19Mode && path === '/federation.manifest.json') {
    return readFile(join(root, 'federation.manifest.json'), 'utf8', (err, text) => {
      if (err) return send(res, 404, 'not found');
      const manifest = JSON.parse(text);
      manifest['mfe-orders-ng19'] =
        ng19Mode === 'cross-origin'
          ? `http://localhost:${NG19_PORT}/remoteEntry.json`
          : '/mfe-orders-ng19/remoteEntry.json';
      send(res, 200, JSON.stringify(manifest, null, 2), 'application/json');
    });
  }
  if (ng19Mode === 'same-origin' && path.startsWith('/mfe-orders-ng19/')) {
    req.url = req.url.slice('/mfe-orders-ng19'.length);
    return ng19SameOrigin(req, res);
  }
  host(req, res);
}).listen(8138, () => console.log('Shared-runtime host served on http://localhost:8138/'));

if (ng19Mode === 'cross-origin') {
  createServer(
    serveStatic(ng19Root, { spaFallback: false, headers: { 'Access-Control-Allow-Origin': '*' } }),
  ).listen(NG19_PORT, () =>
    console.log(`Angular 19 remote served on http://localhost:${NG19_PORT}/ (own origin)`),
  );
}
