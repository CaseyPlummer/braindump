import {
  DestroyRef,
  ElementRef,
  Injectable,
  Signal,
  computed,
  inject,
  signal,
} from "@angular/core";
import {
  AuthProvider,
  BusEnvelope,
  Context,
  PlatformEventType,
  PlatformEvents,
  authContext,
  bus,
  featureFlagsContext,
  localeContext,
  requestContext,
  sessionContext,
  themeContext,
} from "@platform/sdk";

/**
 * Subscribes to a platform context from the current component's host element and
 * exposes it as a signal. Unsubscribes when the component is destroyed. Call it in
 * a component (or a component-level provider) whose host element is connected at
 * construction time — the custom element's root component is; routed children
 * should read the root's values through DI (`Platform`).
 */
export function injectContext<V>(context: Context<V>): Signal<V | undefined> {
  const element = inject<ElementRef<Element>>(ElementRef).nativeElement;
  const value = signal<V | undefined>(undefined);
  const stop = requestContext(element, context, (v) => value.set(v), {
    subscribe: true,
  });
  inject(DestroyRef).onDestroy(stop);
  return value.asReadonly();
}

/**
 * Registry the HTTP interceptor reads tokens through. The interceptor lives in the
 * application (environment) injector and has no element to dispatch a
 * context-request from, so connected `Platform` instances register their auth
 * context here.
 */
@Injectable({ providedIn: "root" })
export class PlatformTokens {
  private readonly sources = new Set<Signal<AuthProvider | undefined>>();

  register(source: Signal<AuthProvider | undefined>): () => void {
    this.sources.add(source);
    return () => this.sources.delete(source);
  }

  getAccessToken(): Promise<string> {
    for (const source of this.sources) {
      const provider = source();
      if (provider) return provider.getAccessToken();
    }
    return Promise.reject(new Error("No platform auth provider is connected"));
  }
}

/**
 * The well-known platform contexts as signals. Provide it on the custom element's
 * root component (`providers: [Platform]`); children, including routed ones,
 * inject it.
 */
@Injectable()
export class Platform {
  readonly session = injectContext(sessionContext);
  readonly locale = injectContext(localeContext);
  readonly theme = injectContext(themeContext);
  readonly flags = injectContext(featureFlagsContext);
  private readonly auth = injectContext(authContext);

  constructor() {
    const unregister = inject(PlatformTokens).register(this.auth);
    inject(DestroyRef).onDestroy(unregister);
  }

  /** A feature flag as a signal; false until the host provides flags. */
  flag(name: string): Signal<boolean> {
    return computed(() => this.flags()?.[name] ?? false);
  }
}

/** Subscribes to a platform bus event for the lifetime of the calling component. */
export function onPlatformEvent<K extends PlatformEventType>(
  type: K | "*",
  handler: (payload: PlatformEvents[K], envelope: BusEnvelope<K>) => void,
): void {
  const off = bus.subscribe(type, handler);
  inject(DestroyRef).onDestroy(off);
}
