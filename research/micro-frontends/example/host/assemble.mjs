// Assembles a demo page that runs N *independent* Angular runtimes on one page,
// each as a separately-named custom element, from a single production build.
//
//   npm run demo      (== ng build && node host/assemble.mjs)
//
// In production each MFE is its own build with its own element name and its own
// deploy. Here we reuse one build and rewrite the element name to keep the demo
// tiny while still proving the architecture: multiple self-contained runtimes
// coexisting and staying isolated.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "..", "dist", "mfe-element", "browser");

const mainFile = readdirSync(distDir).find((f) => /^main.*\.js$/.test(f));
if (!mainFile) {
  throw new Error(
    "No build found. Run `npm run build` first (or use `npm run demo`).",
  );
}
const bundle = readFileSync(join(distDir, mainFile), "utf8");

const instances = ["a", "b", "c"];
for (const id of instances) {
  // Same bundle, unique element name -> a distinct, self-contained runtime.
  writeFileSync(
    join(here, `mfe-${id}.js`),
    bundle.replaceAll("mfe-counter", `mfe-${id}`),
  );
}

const tags = instances
  .map(
    (id) =>
      `    <mfe-${id} name="${id.toUpperCase()} (own runtime)"></mfe-${id}>`,
  )
  .join("\n");
const scripts = instances
  .map((id) => `    <script type="module" src="./mfe-${id}.js"></script>`)
  .join("\n");

writeFileSync(
  join(here, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Independent Angular runtimes on one page</title>
  </head>
  <body>
    <h1>Independent, self-contained Angular MFEs on one page</h1>
    <p>Each box below is a separate Angular runtime. Clicking one does not affect the others.</p>
${tags}
${scripts}
  </body>
</html>
`,
);

console.log(
  `Assembled host/index.html with ${instances.length} independent runtimes.`,
);
console.log(
  "Serve it with:  npm run serve:host   (then open http://localhost:8137/)",
);
