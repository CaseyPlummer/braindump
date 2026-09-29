import express from "express";
import { isMainModule } from "@angular/ssr/node";
import { renderOrdersFragment } from "./main.server";

/**
 * Fragment endpoint for the orders MFE.
 *   GET /fragment?customer=<name>[&delay=<ms>]  ->  text/html fragment
 * `delay` adds artificial latency so the host's timeout fallback can be exercised.
 */
const app = express();
const port = Number(process.env["PORT"] ?? 8151);

app.get("/fragment", async (req, res) => {
  const started = performance.now();
  const customer = String(req.query["customer"] ?? "guest").slice(0, 100);
  const delay = Math.min(Number(req.query["delay"] ?? 0) || 0, 10_000);
  try {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    const html = await renderOrdersFragment({ customer });
    res.type("text/html").set("Cache-Control", "no-store").send(html);
    const ms = (performance.now() - started).toFixed(1);
    console.log(
      `[mfe-orders-ng21] fragment customer="${customer}" ${html.length} B in ${ms} ms`,
    );
  } catch (err) {
    console.error("[mfe-orders-ng21] render failed", err);
    res.status(500).type("text/plain").send("render failed");
  }
});

app.get("/healthz", (_req, res) => {
  res.type("text/plain").send("ok");
});

// Guarded so the Angular builder can import this module without starting a server.
if (isMainModule(import.meta.url)) {
  app.listen(port, () => {
    console.log(`[mfe-orders-ng21] fragment server on http://localhost:${port}/fragment`);
  });
}
