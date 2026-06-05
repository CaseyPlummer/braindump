// Minimal dependency-free static server for the assembled demo page.
// ES module <script> tags will not load over file://, so serve over HTTP:
//   npm run serve:host    (then open http://localhost:8137/)
import { createServer } from "node:http";
import { readFile } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
};

createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  readFile(join(root, p), (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[extname(p)] ?? "application/octet-stream",
    });
    res.end(data);
  });
}).listen(8137, () => console.log("Serving demo on http://localhost:8137/"));
