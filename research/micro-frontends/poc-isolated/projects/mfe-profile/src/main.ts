import { createApplication } from "@angular/platform-browser";
import { createCustomElement } from "@angular/elements";
import {
  Component,
  Input,
  VERSION,
  computed,
  inject,
  provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { assertSdkMajor } from "@platform/sdk";
import { Platform } from "@platform/angular";

assertSdkMajor(1, "mfe-profile");

/**
 * A second self-contained domain MFE. Besides its `userId` input it reads the
 * session, locale and theme from host-provided platform contexts.
 */
@Component({
  selector: "app-profile",
  providers: [Platform],
  host: {
    "[attr.data-theme]": "platform.theme()?.mode ?? 'light'",
    "[style.--accent]": "platform.theme()?.accent",
  },
  template: `
    <section class="mfe">
      <h3>Profile</h3>
      <p>
        User (input): <strong>{{ userId }}</strong>
      </p>
      <p data-testid="profile-session">
        Session (context):
        <strong>{{ platform.session()?.user?.name ?? "—" }}</strong>
        in {{ platform.session()?.tenant?.name ?? "—" }}
      </p>
      <p data-testid="profile-locale">
        Member since: {{ memberSince() }} ({{ platform.locale() ?? "—" }})
      </p>
      <p class="meta">Angular {{ version }}</p>
    </section>
  `,
  styles: `
    :host {
      display: block;
      --bg: #fff;
      --fg: #222;
      --muted: #666;
      --accent: #3558d6;
    }
    :host([data-theme="dark"]) {
      --bg: #1e2127;
      --fg: #e8e8e8;
      --muted: #a0a4ab;
    }
    .mfe {
      padding: 12px;
      border: 1px solid var(--accent);
      border-radius: 8px;
      background: var(--bg);
      color: var(--fg);
    }
    h3 {
      margin: 0 0 8px;
    }
    p {
      margin: 2px 0;
    }
    .meta {
      color: var(--muted);
      font-size: 13px;
    }
  `,
})
export class ProfileComponent {
  protected readonly platform = inject(Platform);
  protected readonly version = VERSION.full;
  protected readonly memberSince = computed(() =>
    new Intl.DateTimeFormat(this.platform.locale() ?? "en-US", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date("2024-03-14")),
  );

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
