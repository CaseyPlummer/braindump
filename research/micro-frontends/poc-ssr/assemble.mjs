// Places each MFE's browser build under the host that loads it, so every host
// serves its page and the MFE assets from one origin (mirrors a CDN layout).
//   Isolated host: dist/host/browser/mfes/<tag>.js          (one bundle per MFE)
//   Shared host:      dist/host-shared/browser/<remote>/     (remoteEntry.json + chunks)
// Fragment servers are separate processes and are not assembled.
import { cpSync, rmSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = (...p) => join(here, ...p);

function need(path) {
  if (!existsSync(path))
    throw new Error(`Missing build output ${path}. Run npm run build.`);
  return path;
}

// Isolated: copy each element bundle (it carries its own Angular runtime).
const mfes = dist("dist", "host", "browser", "mfes");
rmSync(mfes, { recursive: true, force: true });
mkdirSync(mfes, { recursive: true });
cpSync(
  need(dist("dist", "mfe-orders", "browser", "main.js")),
  join(mfes, "mfe-orders.js"),
);
cpSync(
  need(dist("ng21", "dist", "mfe-orders-ng21", "browser", "main.js")),
  join(mfes, "mfe-orders-ng21.js"),
);

// Shared: copy each remote's whole output under /<remote>/ (see federation.manifest.json).
const remotes = [
  ["mfe-orders", dist("dist", "mfe-orders-federated", "browser")],
  [
    "mfe-orders-ng21",
    dist("ng21", "dist", "mfe-orders-ng21-federated", "browser"),
  ],
];
for (const [name, src] of remotes) {
  const dest = dist("dist", "host-shared", "browser", name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(need(src), dest, { recursive: true });
}

console.log(
  "Assembled MFE bundles into dist/host/browser/mfes/ and dist/host-shared/browser/<remote>/",
);
