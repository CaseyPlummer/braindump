import {
  Directive,
  ElementRef,
  OnInit,
  PLATFORM_ID,
  PendingTasks,
  REQUEST_CONTEXT,
  inject,
  input,
} from "@angular/core";
import { PlatformLocation, isPlatformServer } from "@angular/common";
import type { FragmentContext } from "./fragment-context";

/**
 * Fragment SSR for one MFE element. On the server only: fetch the MFE's
 * server-rendered HTML (with the same inputs the host binds) under a timeout and
 * place it inside the element as light DOM. On timeout or error, leave the element
 * empty so it renders client-side. In the browser this directive does nothing: the
 * element's own bundle upgrades it and replaces the server markup.
 *
 * Page query parameters (for experiments): `fragments=off` skips fetching
 * (client-only baseline); `delay=<ms>` asks fragment servers to respond late.
 */
@Directive({ selector: "[mfeFragment]" })
export class MfeFragment implements OnInit {
  /** Inputs to render the fragment with; sent as query parameters. */
  readonly mfeFragment = input<Record<string, string>>({});

  private readonly el =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly context = inject(REQUEST_CONTEXT, {
    optional: true,
  }) as FragmentContext | null;
  private readonly location = inject(PlatformLocation);
  private readonly pendingTasks = inject(PendingTasks);

  ngOnInit(): void {
    if (!this.isServer || !this.context) return;
    const tag = this.el.tagName.toLowerCase();
    const page = new URLSearchParams(this.location.search);
    const endpoint = this.context.fragmentUrls[tag];

    if (page.get("fragments") === "off" || !endpoint) {
      this.el.setAttribute("data-fragment", "off");
      return;
    }

    const url = new URL(endpoint);
    for (const [k, v] of Object.entries(this.mfeFragment()))
      url.searchParams.set(k, v);
    const delay = page.get("delay");
    if (delay) url.searchParams.set("delay", delay);

    // PendingTasks keeps the SSR render open until the fetch settles (bounded by the timeout).
    void this.pendingTasks.run(async () => {
      const started = performance.now();
      let status: string;
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(this.context!.timeoutMs),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.el.innerHTML = await res.text();
        status = "ssr";
      } catch (err) {
        status = (err as Error).name === "TimeoutError" ? "timeout" : "error";
      }
      const ms = (performance.now() - started).toFixed(1);
      this.el.setAttribute("data-fragment", status);
      console.log(
        `[${this.context!.hostName}] fragment <${tag}> ${status} in ${ms} ms`,
      );
    });
  }
}
