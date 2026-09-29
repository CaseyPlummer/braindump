// Minimal static server for the built host (dist/host/browser), with a SPA
// fallback for extensionless routes and a mock API. ES modules need HTTP, not file://.
//   npm run build && npm run serve:dist   (then open http://localhost:8137/)
//
// Also serves any other build folder, e.g. an MFE for the local-dev override:
//   node serve.mjs --root dist/mfe-orders/browser --port 4201
//
// Mock API: GET /api/echo echoes the request's Authorization header, so the demo
// can show the token each MFE's HTTP interceptor attached. No real auth.
import { createServer } from "node:http";
import { readFile } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const { values: args } = parseArgs({
  options: {
    root: { type: "string", default: join("dist", "host", "browser") },
    port: { type: "string", default: "8137" },
  },
});
const root = resolve(here, args.root);
const port = Number(args.port);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".map": "application/json",
};

createServer((req, res) => {
  const [rawPath, query = ""] = req.url.split("?");
  const path = decodeURIComponent(rawPath);

  if (path === "/api/echo") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        path: `${path}${query ? `?${query}` : ""}`,
        authorization: req.headers.authorization ?? null,
        caller: req.headers["x-caller"] ?? null,
      }),
    );
    return;
  }

  const file = path === "/" ? "/index.html" : path;
  const full = join(root, file);
  if (!full.startsWith(root)) {
    res.writeHead(400);
    res.end("bad path");
    return;
  }
  readFile(full, (err, data) => {
    if (err) {
      if (extname(file) === "") {
        // extensionless -> SPA route, serve index.html
        readFile(join(root, "index.html"), (e2, idx) => {
          if (e2) {
            res.writeHead(404);
            res.end("not found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(idx);
          }
        });
      } else {
        res.writeHead(404);
        res.end("not found");
      }
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      // Static bundles are public, CDN-style assets: loadable cross-origin as modules.
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
}).listen(port, () =>
  console.log(`Serving ${root} on http://localhost:${port}/`),
);
