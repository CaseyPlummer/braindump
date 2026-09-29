import { createContext } from "./context";

/**
 * The well-known contexts the host provides. Each key carries a contract major
 * (`@1`); a breaking change to a value shape ships as a new key (`@2`) that the
 * host provides alongside the old one until every MFE has moved.
 */

export interface Session {
  readonly user: { readonly id: string; readonly name: string };
  readonly tenant: { readonly id: string; readonly name: string };
}

/** A BCP 47 language tag, e.g. `en-US`. Format with `Intl`, not framework locale data. */
export type Locale = string;

export interface Theme {
  readonly mode: "light" | "dark";
  /** Accent colour as a CSS colour value. */
  readonly accent: string;
}

export type FeatureFlags = Readonly<Record<string, boolean>>;

/**
 * Token provider. MFEs never see refresh tokens or the identity library; they ask
 * for a short-lived access token per request and the host decides how to get it.
 */
export interface AuthProvider {
  getAccessToken(): Promise<string>;
}

export const sessionContext = createContext<Session>("platform.session@1");
export const localeContext = createContext<Locale>("platform.locale@1");
export const themeContext = createContext<Theme>("platform.theme@1");
export const featureFlagsContext = createContext<FeatureFlags>(
  "platform.featureFlags@1",
);
export const authContext = createContext<AuthProvider>("platform.auth@1");
