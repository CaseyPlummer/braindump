import {
  DestroyRef,
  Injectable,
  Signal,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from "@angular/core";
import {
  AuthProvider,
  Context,
  ContextProvider,
  FeatureFlags,
  Session,
  Theme,
  authContext,
  featureFlagsContext,
  localeContext,
  sessionContext,
  themeContext,
  version as sdkVersion,
} from "@platform/sdk";

const USERS = [
  { id: "u-42", name: "Ada" },
  { id: "u-7", name: "Grace" },
] as const;
const TENANTS = [
  { id: "tenant-a", name: "Tenant A" },
  { id: "tenant-b", name: "Tenant B" },
] as const;
const ACCENT = { light: "#3558d6", dark: "#7aa2ff" } as const;

/**
 * Host side of the platform contract: owns session, locale, theme, feature flags
 * and the token provider, and serves them to every MFE below the host element
 * through the context protocol. MFEs never import anything from the host.
 */
@Injectable({ providedIn: "root" })
export class PlatformHost {
  readonly sdkVersion = sdkVersion;
  readonly users = USERS;
  readonly tenants = TENANTS;
  readonly locales = ["en-US", "de-DE", "fr-FR", "ja-JP"] as const;

  readonly userId = signal<string>(USERS[0].id);
  readonly tenantId = signal<string>(TENANTS[0].id);
  readonly locale = signal<string>("en-US");
  readonly themeMode = signal<Theme["mode"]>("light");
  readonly flags = signal<FeatureFlags>({
    "orders.showTotals": true,
    "cart.recommendations": true,
  });

  readonly session = computed<Session>(() => ({
    user: USERS.find((u) => u.id === this.userId()) ?? USERS[0],
    tenant: TENANTS.find((t) => t.id === this.tenantId()) ?? TENANTS[0],
  }));
  readonly theme = computed<Theme>(() => ({
    mode: this.themeMode(),
    accent: ACCENT[this.themeMode()],
  }));

  private tokenSerial = 0;
  /**
   * Mock token provider. A real host would delegate to its identity library
   * (silent refresh, caching); MFEs only ever see this function.
   */
  readonly auth: AuthProvider = {
    getAccessToken: async () => {
      const { user, tenant } = untracked(this.session);
      await new Promise((r) => setTimeout(r, 20)); // simulate async acquisition
      return `mock-at.${user.id}@${tenant.id}.${++this.tokenSerial}`;
    },
  };

  /** Starts serving all platform contexts below `element`. Call in an injection context. */
  provideTo(element: Element): void {
    const destroyRef = inject(DestroyRef);
    const serve = <V>(context: Context<V>, value: Signal<V>) => {
      const provider = new ContextProvider(element, context, untracked(value));
      effect(() => provider.setValue(value()));
      destroyRef.onDestroy(() => provider.dispose());
    };
    serve(sessionContext, this.session);
    serve(localeContext, this.locale);
    serve(themeContext, this.theme);
    serve(featureFlagsContext, this.flags);
    serve(authContext, signal(this.auth));
  }

  toggleFlag(name: string, on: boolean): void {
    this.flags.update((f) => ({ ...f, [name]: on }));
  }
}
