import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import express from "express";
import type { FragmentContext } from "./fragment-context";

/**
 * Express server shared by both hosts: static assets from the browser build (which
 * also holds the assembled MFE bundles), then Angular SSR for everything else.
 *
 * Env: PORT, FRAGMENT_TIMEOUT_MS (default 300), FRAGMENT_ORDERS_URL,
 * FRAGMENT_ORDERS_NG21_URL.
 */
export function startHostServer(options: {
  hostName: string;
  browserDistFolder: string;
  defaultPort: number;
  /** False while the Angular builder imports this module to extract routes. */
  listen: boolean;
}) {
  const env = process.env;
  const context: FragmentContext = {
    hostName: options.hostName,
    timeoutMs: Number(env["FRAGMENT_TIMEOUT_MS"] ?? 300),
    fragmentUrls: {
      "mfe-orders":
        env["FRAGMENT_ORDERS_URL"] ?? "http://localhost:8150/fragment",
      "mfe-orders-ng21":
        env["FRAGMENT_ORDERS_NG21_URL"] ?? "http://localhost:8151/fragment",
    },
  };

  const app = express();
  // Demo runs on localhost only; production lists its real hostnames (SSRF guard).
  const angularApp = new AngularNodeAppEngine({ allowedHosts: ["localhost"] });

  app.use(
    express.static(options.browserDistFolder, {
      index: false,
      redirect: false,
    }),
  );

  app.use((req, res, next) => {
    const started = performance.now();
    angularApp
      .handle(req, context)
      .then((response) => {
        if (!response) return next();
        console.log(
          `[${options.hostName}] SSR ${req.originalUrl} ${(performance.now() - started).toFixed(1)} ms`,
        );
        return writeResponseToNodeResponse(response, res);
      })
      .catch(next);
  });

  if (options.listen) {
    const port = Number(env["PORT"] ?? options.defaultPort);
    app.listen(port, (error) => {
      if (error) throw error;
      console.log(
        `[${options.hostName}] http://localhost:${port}/ (fragment timeout ${context.timeoutMs} ms)`,
      );
    });
  }

  return createNodeRequestHandler(app);
}
