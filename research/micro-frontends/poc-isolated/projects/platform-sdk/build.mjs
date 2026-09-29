// Builds @platform/sdk to a single minified ES module: dist/platform-sdk/sdk.js.
// `npm run assemble` then publishes it at /platform/sdk/<version>/sdk.js, the URL
// the host's import map points `@platform/sdk` at.
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { version } = JSON.parse(
  readFileSync(join(here, "package.json"), "utf8"),
);
const source = readFileSync(join(here, "src", "index.ts"), "utf8");
if (!source.includes(`export const version = "${version}";`)) {
  throw new Error(
    `projects/platform-sdk/src/index.ts \`version\` must match package.json (${version})`,
  );
}

await build({
  entryPoints: [join(here, "src", "index.ts")],
  outfile: join(here, "..", "..", "dist", "platform-sdk", "sdk.js"),
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  sourcemap: false,
  legalComments: "none",
});
console.log(`Built @platform/sdk ${version} -> dist/platform-sdk/sdk.js`);
