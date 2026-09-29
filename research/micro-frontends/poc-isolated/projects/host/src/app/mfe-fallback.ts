import { Component, computed, inject, input } from "@angular/core";
import { MfeLoaderService } from "./mfe-loader.service";

/** Rendered in an MFE's slot when it failed to load; the rest of the page is unaffected. */
@Component({
  selector: "app-mfe-fallback",
  template: `
    <div class="fallback" role="status" [attr.data-mfe]="tag()">
      <strong>{{ label() }} is unavailable right now.</strong>
      <small>{{ status().error }}</small>
    </div>
  `,
  styles: `
    .fallback {
      border: 1px solid #d9822b;
      background: #fff6ec;
      color: #6b3d0a;
      border-radius: 8px;
      padding: 10px 12px;
    }
    small {
      display: block;
      margin-top: 4px;
      word-break: break-word;
    }
  `,
})
export class MfeFallback {
  private readonly loader = inject(MfeLoaderService);
  readonly tag = input.required<string>();
  readonly label = input.required<string>();
  protected readonly status = computed(() => this.loader.status(this.tag()));
}
