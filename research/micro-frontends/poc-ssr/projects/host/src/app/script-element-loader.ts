import { Injectable } from "@angular/core";
import { ElementLoader } from "../../../shell/element-loader";

/**
 * Isolated-runtime loading: inject the MFE's own ES-module bundle (which carries its
 * own Angular runtime) and resolve once the custom element is defined. Deduped per
 * tag. Bundles are assembled under `mfes/<tag>.js`; in production they come from a
 * CDN URL in a runtime manifest (see the Isolated POC, ../poc-isolated/ next to this
 * workspace).
 */
@Injectable()
export class ScriptElementLoader extends ElementLoader {
  private readonly loading = new Map<string, Promise<void>>();

  load(tag: string): Promise<void> {
    let pending = this.loading.get(tag);
    if (!pending) {
      pending = new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = `mfes/${tag}.js`;
        script.onerror = () =>
          reject(new Error(`Failed to load ${script.src}`));
        script.onload = () =>
          customElements.whenDefined(tag).then(() => resolve());
        document.head.appendChild(script);
      });
      this.loading.set(tag, pending);
    }
    return pending;
  }
}
