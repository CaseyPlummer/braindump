// Collects the built MFE bundles and writes the runtime manifest the host reads.
// In production each MFE is its own repo/pipeline and these land on a CDN; here we
// copy them into the host's public/ so one `npm run build` serves the whole demo.
//
//   npm run build:mfes && node assemble.mjs   (or just `npm run build`)
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const remotes = ["mfe-orders", "mfe-profile"];
const outDir = join(here, "projects", "host", "public", "mfes");

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const manifest = [];
for (const name of remotes) {
  const src = join(here, "dist", name, "browser", "main.js");
  writeFileSync(join(outDir, `${name}.js`), readFileSync(src));
  // tag === the custom-element name the MFE registers; url is host-relative.
  manifest.push({ tag: name, url: `mfes/${name}.js` });
}
writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

console.log(
  `Assembled ${remotes.length} MFE bundles + manifest into projects/host/public/mfes/`,
);
