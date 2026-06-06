// Places each built remote under the host's output so the whole demo serves from
// one origin (mirrors a CDN layout). The host manifest already points at
// `<remote>/remoteEntry.json`. In production each remote is its own deploy on a CDN.
//   npm run build   (== build:mfes + build:host + this)
import { cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hostBrowser = join(here, 'dist', 'host', 'browser');
const remotes = ['mfe-orders', 'mfe-profile'];

for (const name of remotes) {
  const src = join(here, 'dist', name, 'browser');
  if (!existsSync(src)) throw new Error(`Missing build for "${name}" — run build:mfes first.`);
  const dest = join(hostBrowser, name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
}

console.log(`Assembled ${remotes.length} remotes into dist/host/browser/<remote>/`);
