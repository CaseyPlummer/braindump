import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/native-federation';

interface RemoteWebComponent {
  register(): Promise<void>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  // Same web-component boundary as the Flavor 1 POC; the difference is purely how
  // the runtime is loaded (shared via Native Federation, not bundled per MFE).
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    :host {
      display: block;
      font:
        15px/1.5 system-ui,
        sans-serif;
      max-width: 760px;
      margin: 24px auto;
      padding: 0 16px;
    }
    header {
      border-bottom: 1px solid #ddd;
      margin-bottom: 16px;
    }
    .controls {
      background: #f6f6f6;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .grid {
      display: grid;
      gap: 12px;
    }
    input {
      padding: 4px 8px;
    }
  `,
})
export class App implements OnInit {
  readonly loaded = signal(new Set<string>());
  readonly customer = signal('ACME Corp');
  readonly lastOrder = signal<string | null>(null);

  private readonly remotes = [
    { remoteName: 'mfe-orders', exposedModule: './web-component', tag: 'mfe-orders' },
    { remoteName: 'mfe-profile', exposedModule: './web-component', tag: 'mfe-profile' },
  ];

  async ngOnInit(): Promise<void> {
    // initFederation() already ran in main.ts; loadRemoteModule pulls each remote's
    // exposed module, which registers its custom element on the SHARED Angular runtime.
    for (const r of this.remotes) {
      try {
        const mod = (await loadRemoteModule(r.remoteName, r.exposedModule)) as RemoteWebComponent;
        await mod.register();
        this.loaded.update((s) => new Set(s).add(r.tag));
      } catch (err) {
        console.error(`Failed to load ${r.remoteName}`, err);
      }
    }
  }

  has(tag: string): boolean {
    return this.loaded().has(tag);
  }

  onCustomerInput(event: Event): void {
    this.customer.set((event.target as HTMLInputElement).value);
  }

  onOrderSelected(event: Event): void {
    this.lastOrder.set((event as CustomEvent<string>).detail);
  }
}
