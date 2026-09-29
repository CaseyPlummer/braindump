// Publishes the built SDK and MFE bundles into the host's public/ folder and
// writes the runtime manifests the host reads. In production each MFE is its own
// repo/pipeline publishing to a CDN, and the SDK is published by the platform
// team; here everything is copied into projects/host/public/ so one
// `npm run build` serves the whole demo.
//
//   npm run build:sdk && npm run build:mfes && npm run build:ng21 && node assemble.mjs
//   (or just `npm run build`)
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "projects", "host", "public");
const mfesDir = join(publicDir, "mfes");

// --- Platform SDK: /platform/sdk/<version>/sdk.js --------------------------------
const { version: sdkVersion } = JSON.parse(
  readFileSync(join(here, "projects", "platform-sdk", "package.json"), "utf8"),
);
const sdkPath = `platform/sdk/${sdkVersion}/sdk.js`;
const hostIndex = readFileSync(
  join(here, "projects", "host", "src", "index.html"),
  "utf8",
);
if (!hostIndex.includes(`"/${sdkPath}"`)) {
  throw new Error(
    `projects/host/src/index.html import map must point @platform/sdk at "/${sdkPath}"`,
  );
}
rmSync(join(publicDir, "platform"), { recursive: true, force: true });
mkdirSync(join(publicDir, dirname(sdkPath)), { recursive: true });
writeFileSync(
  join(publicDir, sdkPath),
  readFileSync(join(here, "dist", "platform-sdk", "sdk.js")),
);

// --- The Angular adapter is duplicated per Angular major; keep the copies identical.
const adapterSrc = join(here, "projects", "platform-angular", "src");
const adapterNg21 = join(here, "ng21", "projects", "platform-angular", "src");
for (const file of readdirSync(adapterSrc)) {
  const a = readFileSync(join(adapterSrc, file), "utf8");
  const b = readFileSync(join(adapterNg21, file), "utf8");
  if (a !== b) {
    throw new Error(
      `ng21/projects/platform-angular/src/${file} differs from projects/platform-angular/src/${file}`,
    );
  }
}

// --- MFE bundles -------------------------------------------------------------------
const remotes = [
  { tag: "mfe-orders", dist: join(here, "dist", "mfe-orders", "browser") },
  { tag: "mfe-profile", dist: join(here, "dist", "mfe-profile", "browser") },
  {
    tag: "mfe-cart-ng21",
    dist: join(here, "ng21", "dist", "mfe-cart-ng21", "browser"),
  },
];

rmSync(mfesDir, { recursive: true, force: true });
mkdirSync(join(mfesDir, "fixtures"), { recursive: true });

const sri = (bytes) =>
  `sha384-${createHash("sha384").update(bytes).digest("base64")}`;

const manifest = [];
for (const { tag, dist } of remotes) {
  const scripts = readdirSync(dist).filter((f) => f.endsWith(".js"));
  if (scripts.length !== 1 || scripts[0] !== "main.js") {
    throw new Error(
      `${tag}: expected a single main.js, found ${scripts.join(", ")} (lazy chunks are not published by this script)`,
    );
  }
  const bytes = readFileSync(join(dist, "main.js"));
  writeFileSync(join(mfesDir, `${tag}.js`), bytes);
  // tag === the custom-element name the MFE registers; url is host-relative.
  manifest.push({ tag, url: `mfes/${tag}.js`, integrity: sri(bytes) });
}
const byTag = Object.fromEntries(manifest.map((e) => [e.tag, e]));
const write = (name, entries) =>
  writeFileSync(join(mfesDir, name), JSON.stringify(entries, null, 2) + "\n");

write("manifest.json", manifest);

// --- Failure scenarios (host: /?manifest=broken, /?manifest=faulty) ----------------
writeFileSync(
  join(mfesDir, "fixtures", "throws.js"),
  'throw new Error("Deliberate failure: this bundle throws while evaluating");\n',
);
writeFileSync(
  join(mfesDir, "fixtures", "never-defines.js"),
  'console.info("[fixture] bundle loaded but never registers its element");\n',
);
write("manifest.broken.json", [
  byTag["mfe-orders"],
  // Right bundle, wrong hash (as if the file on the CDN were tampered with).
  { ...byTag["mfe-profile"], integrity: byTag["mfe-orders"].integrity },
  // The bundle is missing (404).
  { ...byTag["mfe-cart-ng21"], url: "mfes/missing-bundle.js" },
]);
write("manifest.faulty.json", [
  byTag["mfe-orders"],
  { tag: "mfe-profile", url: "mfes/fixtures/throws.js" },
  {
    tag: "mfe-cart-ng21",
    url: "mfes/fixtures/never-defines.js",
    timeoutMs: 3000,
  },
]);

console.log(
  `Assembled @platform/sdk ${sdkVersion}, ${remotes.length} MFE bundles and manifests into projects/host/public/`,
);
