import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import {
  Component,
  Input,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";

/** A second self-contained domain MFE, to show several MFEs composing on one page. */
@Component({
  selector: "app-profile",
  template: `
    <section class="mfe">
      <h3>Profile</h3>
      <p>
        User: <strong>{{ userId }}</strong>
      </p>
      <p>Plan: Pro</p>
    </section>
  `,
  styles: `
    .mfe {
      padding: 12px;
      border: 1px solid #888;
      border-radius: 8px;
    }
    h3 {
      margin: 0 0 8px;
    }
    p {
      margin: 2px 0;
    }
  `,
})
export class ProfileComponent {
  @Input() userId = "unknown";
}

void (async () => {
  const app = await createApplication({
    providers: [provideBrowserGlobalErrorListeners()],
  });
  customElements.define(
    "mfe-profile",
    createCustomElement(ProfileComponent, { injector: app.injector }),
  );
})();
