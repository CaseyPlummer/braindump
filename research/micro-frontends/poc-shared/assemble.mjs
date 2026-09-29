// Places each built remote under the host's output so the whole demo serves from
// one origin (mirrors a CDN layout). The host manifest already points at
// `<remote>/remoteEntry.json`. In production each remote is its own deploy on a CDN.
//   npm run build   (== build:mfes + build:ng21 + build:host + this)
import { cpSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const hostBrowser = join(here, 'dist', 'host', 'browser');
const remotes = [
  // Angular 22 remotes built in this workspace (share the host's runtime).
  { name: 'mfe-orders', dist: join(here, 'dist', 'mfe-orders', 'browser') },
  { name: 'mfe-profile', dist: join(here, 'dist', 'mfe-profile', 'browser') },
  // Angular 21 remote built in its own workspace (ng21/), one major behind.
  { name: 'mfe-orders-ng21', dist: join(here, 'ng21', 'dist', 'mfe-orders-ng21', 'browser') },
];

for (const { name, dist } of remotes) {
  if (!existsSync(dist))
    throw new Error(`Missing build for "${name}" at ${dist} — run npm run build.`);
  const dest = join(hostBrowser, name);
  rmSync(dest, { recursive: true, force: true });
  cpSync(dist, dest, { recursive: true });
}

console.log(`Assembled ${remotes.length} remotes into dist/host/browser/<remote>/`);
