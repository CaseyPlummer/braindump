import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { from, switchMap } from "rxjs";
import { PlatformTokens } from "./platform";

/**
 * Adds `Authorization: Bearer <token>` to requests for the platform API, asking
 * the host's token provider for a fresh token each time. Requests to any other
 * origin or path (CDNs, third parties) never receive the token.
 */
export const platformAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const url = new URL(req.url, document.baseURI);
  const isPlatformApi =
    url.origin === location.origin && url.pathname.startsWith("/api/");
  if (!isPlatformApi) return next(req);
  const tokens = inject(PlatformTokens);
  return from(tokens.getAccessToken()).pipe(
    switchMap((token) =>
      next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })),
    ),
  );
};
