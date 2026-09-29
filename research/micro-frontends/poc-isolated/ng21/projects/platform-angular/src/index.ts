/**
 * @platform/angular — the thin Angular adapter over @platform/sdk. It is compiled
 * into each MFE (it depends on that MFE's Angular), while the SDK itself is
 * loaded once by the host. `ng21/projects/platform-angular/` is a verbatim copy
 * built against Angular 21; in production this would be one package published
 * per supported Angular major.
 *
 * Secondary entry points keep optional dependencies out of MFEs that don't use
 * them (decorated classes are not tree-shaken reliably):
 *   @platform/angular          contexts as signals, bus helper
 *   @platform/angular/http     token interceptor (needs @angular/common/http)
 *   @platform/angular/routing  host-owned routing (needs @angular/router)
 */
export {
  injectContext,
  Platform,
  PlatformTokens,
  onPlatformEvent,
} from "./platform";
