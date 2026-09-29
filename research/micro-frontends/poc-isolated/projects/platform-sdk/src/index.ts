/**
 * @platform/sdk — the framework-agnostic platform contract between the host and
 * its MFEs. Plain TypeScript, no framework dependency. The host loads one copy
 * per page through an import map; MFE bundles import it as an external
 * (`import … from "@platform/sdk"`), so it is never bundled into them.
 *
 * Semver applies to everything exported here: additions are minor, removals or
 * shape changes are major. MFEs call `assertSdkMajor(1, …)` at bootstrap so an
 * incompatible host fails fast into the loader's fallback UI.
 */
export {
  createContext,
  requestContext,
  ContextProvider,
  ContextRequestEvent,
} from "./context";
export type { Context, ContextCallback, ContextType } from "./context";
export {
  sessionContext,
  localeContext,
  themeContext,
  featureFlagsContext,
  authContext,
} from "./contexts";
export type {
  Session,
  Locale,
  Theme,
  FeatureFlags,
  AuthProvider,
} from "./contexts";
export { bus, BUS_EVENT } from "./bus";
export type { PlatformEvents, PlatformEventType, BusEnvelope } from "./bus";

/** Semver of this SDK build. Kept in sync with package.json by build.mjs. */
export const version = "1.0.0";

/** Throws if the loaded SDK is not the major the caller was built against. */
export function assertSdkMajor(major: number, consumer: string): void {
  const loaded = Number(version.split(".")[0]);
  if (loaded !== major) {
    throw new Error(
      `${consumer} was built for @platform/sdk ${major}.x but ${version} is loaded`,
    );
  }
}

// Diagnostics: counts evaluations of this module on the page. With the import
// map in place it stays at 1 however many MFEs import the SDK.
const g = globalThis as { __platformSdkEvaluations?: number };
g.__platformSdkEvaluations = (g.__platformSdkEvaluations ?? 0) + 1;
