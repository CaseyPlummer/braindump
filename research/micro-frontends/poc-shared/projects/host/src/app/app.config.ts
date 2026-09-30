import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import type { NativeFederationResult } from '@angular-architects/native-federation';

/** The federation instance returned by `initFederation()` in main.ts. */
export const NATIVE_FEDERATION = new InjectionToken<NativeFederationResult>('NATIVE_FEDERATION');

export const appConfig = (nf: NativeFederationResult): ApplicationConfig => ({
  providers: [provideBrowserGlobalErrorListeners(), { provide: NATIVE_FEDERATION, useValue: nf }],
});
