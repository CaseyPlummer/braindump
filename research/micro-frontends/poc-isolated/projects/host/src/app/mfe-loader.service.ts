import { Injectable } from "@angular/core";

/** One entry in the runtime manifest: which custom-element tag lives at which URL. */
export interface MfeManifestEntry {
  tag: string;
  url: string;
}

/**
 * Loads a self-contained MFE bundle at runtime and resolves once its custom
 * element is actually defined. This is the entire "Flavor 1" host mechanism:
 * no federation, no shared runtime — just inject the script and wait for the
 * element. Each tag is loaded at most once (deduped), so the same MFE used in
 * several places on a page costs a single network fetch.
 */
@Injectable({ providedIn: "root" })
export class MfeLoaderService {
  private readonly loading = new Map<string, Promise<void>>();

  load(entry: MfeManifestEntry): Promise<void> {
    let pending = this.loading.get(entry.tag);
    if (!pending) {
      pending = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = entry.url;
        script.onerror = () =>
          reject(
            new Error(`Failed to load MFE "${entry.tag}" from ${entry.url}`),
          );
        // The element is registered inside the MFE's async bootstrap, so wait
        // for whenDefined rather than the script's load event alone.
        script.onload = () =>
          customElements.whenDefined(entry.tag).then(() => resolve());
        document.head.appendChild(script);
      });
      this.loading.set(entry.tag, pending);
    }
    return pending;
  }
}
