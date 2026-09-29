// Starts every server of the demo in one terminal (Ctrl+C stops them all):
//   8140  Isolated-runtime takeover host (Angular SSR)
//   8141  Shared-runtime takeover host (Angular SSR + Native Federation in the browser)
//   8150  mfe-orders fragment endpoint (Angular 22)
//   8151  mfe-orders-ng21 fragment endpoint (Angular 21)
// Environment variables (PORT excepted) pass through, e.g. FRAGMENT_TIMEOUT_MS=100.
// Name servers to start a subset: `node start.mjs host mfe-orders`.
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const servers = [
  { name: "host", port: 8140, entry: "dist/host/server/server.mjs" },
  {
    name: "host-shared",
    port: 8141,
    entry: "dist/host-shared/server/server.mjs",
  },
  {
    name: "mfe-orders",
    port: 8150,
    entry: "dist/mfe-orders/server/server.mjs",
  },
  {
    name: "mfe-orders-ng21",
    port: 8151,
    entry: "ng21/dist/mfe-orders-ng21/server/server.mjs",
  },
];

const only = process.argv.slice(2);
const selected = only.length
  ? servers.filter((s) => only.includes(s.name))
  : servers;

const children = selected.map(({ name, port, entry }) => {
  const child = spawn(process.execPath, [join(here, entry)], {
    env: { ...process.env, PORT: String(port) },
    stdio: "inherit",
  });
  child.on("exit", (code, signal) => {
    if (signal !== "SIGTERM")
      console.log(`[start] ${name} exited (${signal ?? code})`);
  });
  return child;
});

const stop = () => {
  for (const c of children) c.kill("SIGTERM");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
