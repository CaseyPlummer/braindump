// Prints raw and gzip (level 9) sizes of what the built host page downloads.
//   npm run build && npm run sizes
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(
  dirname(fileURLToPath(import.meta.url)),
  "dist",
  "host",
  "browser",
);
const { version } = JSON.parse(
  readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      "projects",
      "platform-sdk",
      "package.json",
    ),
    "utf8",
  ),
);
const files = [
  "main.js",
  `platform/sdk/${version}/sdk.js`,
  "mfes/mfe-orders.js",
  "mfes/mfe-profile.js",
  "mfes/mfe-cart-ng21.js",
];
const kB = (n) => `${(n / 1000).toFixed(1)} kB`;
let raw = 0;
let gz = 0;
for (const file of files) {
  const bytes = readFileSync(join(root, file));
  const g = gzipSync(bytes, { level: 9 }).length;
  raw += bytes.length;
  gz += g;
  console.log(
    `${file.padEnd(28)} ${kB(bytes.length).padStart(10)} ${kB(g).padStart(10)}`,
  );
}
console.log(
  `${"total".padEnd(28)} ${kB(raw).padStart(10)} ${kB(gz).padStart(10)}`,
);
