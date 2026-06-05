import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import { Component, Input } from "@angular/core";
import { appConfig } from "./app/app.config";

/**
 * A minimal standalone Angular component packaged as a framework-agnostic
 * Custom Element.
 *
 * This is the core "MFE as a self-contained web component" concept: the
 * component carries its own Angular runtime and exposes a plain DOM contract
 * (attributes/properties in, DOM events out). A host embeds it as an ordinary
 * HTML element and does not need to know it is Angular — or which version.
 */
@Component({
  selector: "app-counter",
  template: `<div class="mfe">
    <strong>MFE {{ name }}</strong>
    <button (click)="inc()">clicks: {{ count }}</button>
  </div>`,
  styles: `
    .mfe {
      padding: 12px;
      margin: 8px;
      border: 1px solid #888;
      border-radius: 8px;
      font: 14px sans-serif;
    }
  `,
})
export class CounterComponent {
  @Input() name = "?";
  count = 0;
  inc() {
    this.count++;
  }
}

void (async () => {
  const app = await createApplication(appConfig);
  const element = createCustomElement(CounterComponent, {
    injector: app.injector,
  });
  // A real MFE owns a unique element name per build. The multi-runtime demo
  // (see host/assemble.mjs) rewrites this placeholder name to mount several
  // independent copies on one page.
  customElements.define("mfe-counter", element);
})();
