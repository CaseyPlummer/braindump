import { LocationStrategy } from "@angular/common";
import {
  DestroyRef,
  EnvironmentProviders,
  Injectable,
  Provider,
  inject,
} from "@angular/core";
import {
  NavigationEnd,
  NavigationStart,
  Router,
  Routes,
  provideRouter,
  withDisabledInitialNavigation,
} from "@angular/router";
import { Observable, filter, map } from "rxjs";

/**
 * Routing contract for an MFE with internal routes, where the HOST owns the URL.
 *
 *  - host → MFE: the `route` input carries the MFE's sub-path (browser at
 *    `/orders/1002` → `route="/1002"`); `base` carries the mount path
 *    (`/orders`) so generated hrefs are real, shareable URLs.
 *  - MFE → host: a `navigate` event (`{ path, replace? }`) when the MFE navigated
 *    on its own (link click, redirect); the host applies it to the address bar,
 *    which flows back as a new `route` input that the MFE recognises as current.
 *
 * The MFE's router runs on `MemoryLocationStrategy`: it never reads or writes
 * `window.history` and never subscribes to `popstate`. Only the host's router
 * reacts to back/forward, so a history step causes exactly one navigation per
 * router and the two can never fight over the address bar.
 */
export interface NavigateDetail {
  path: string;
  replace?: boolean;
}

/** In-memory LocationStrategy: the router's URL lives only inside the MFE. */
@Injectable()
export class MemoryLocationStrategy extends LocationStrategy {
  private base = "";
  private url = "/";
  private state: unknown = null;

  setBase(base: string): void {
    this.base = base.replace(/\/+$/, "");
  }

  override path(): string {
    return this.url;
  }

  /** Used by RouterLink for `href`: the host-level URL, so middle-click/copy-link work. */
  override prepareExternalUrl(internal: string): string {
    const path = internal.startsWith("/") ? internal : `/${internal}`;
    return path === "/" ? this.base || "/" : `${this.base}${path}`;
  }

  override getState(): unknown {
    return this.state;
  }

  override pushState(
    state: unknown,
    _title: string,
    url: string,
    queryParams: string,
  ): void {
    this.url = queryParams ? `${url}?${queryParams}` : url;
    this.state = state;
  }

  override replaceState(
    state: unknown,
    title: string,
    url: string,
    queryParams: string,
  ): void {
    this.pushState(state, title, url, queryParams);
  }

  // History traversal belongs to the host; the MFE never initiates it.
  override forward(): void {}
  override back(): void {}
  override historyGo(): void {}

  /** Deliberately never fires: back/forward reaches the MFE only as a new `route` input. */
  override onPopState(): void {}

  override getBaseHref(): string {
    return "";
  }
}

/** Router providers for an MFE whose URL is owned by the host. */
export function provideHostOwnedRouting(
  routes: Routes,
): (Provider | EnvironmentProviders)[] {
  return [
    provideRouter(routes, withDisabledInitialNavigation()),
    { provide: LocationStrategy, useClass: MemoryLocationStrategy },
  ];
}

function normalize(route: string | null | undefined): string {
  if (!route) return "/";
  return route.startsWith("/") ? route : `/${route}`;
}

/**
 * Glue between the element's `route`/`base` inputs, its router and its
 * `navigate` output. Provide it on the element's root component.
 */
@Injectable()
export class HostRouteSync {
  private readonly router = inject(Router);
  private readonly strategy = inject(LocationStrategy);
  private hostRoute: string | null = null;

  /** Navigations the MFE made on its own, for the host to apply to the address bar. */
  readonly navigations: Observable<NavigateDetail>;

  constructor() {
    const log = this.router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe((e) =>
        // `navigationTrigger` is never "popstate" here: MemoryLocationStrategy has no popstate.
        console.debug(`[mfe-router] ${e.navigationTrigger} ${e.url}`),
      );
    inject(DestroyRef).onDestroy(() => log.unsubscribe());

    this.navigations = this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      filter((e) => e.urlAfterRedirects !== this.hostRoute),
      map((e) => {
        // The host asked for a URL that redirected inside the MFE: replace, don't push.
        const replace = e.url === this.hostRoute;
        this.hostRoute = e.urlAfterRedirects;
        return { path: e.urlAfterRedirects, replace };
      }),
    );
  }

  setBase(base: string): void {
    if (this.strategy instanceof MemoryLocationStrategy) {
      this.strategy.setBase(base);
    }
  }

  /** Applies the host's `route` input. Navigating to the current URL is a no-op. */
  setRoute(route: string): void {
    const path = normalize(route);
    this.hostRoute = path;
    if (!this.router.navigated || this.router.url !== path) {
      void this.router.navigateByUrl(path);
    }
  }
}
