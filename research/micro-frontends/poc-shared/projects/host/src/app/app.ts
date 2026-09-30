import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject, signal } from '@angular/core';
import { NATIVE_FEDERATION } from './app.config';

interface RemoteWebComponent {
  register(): Promise<void>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  // Same web-component boundary as the Isolated runtime POC; the difference is
  // purely how the runtime is loaded (shared via Native Federation, not bundled per MFE).
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
  private readonly nf = inject(NATIVE_FEDERATION);
  readonly loaded = signal(new Set<string>());
  readonly expected = signal(new Set<string>());
  readonly customer = signal('ACME Corp');
  readonly lastOrder = signal<string | null>(null);

  private readonly remotes: {
    remoteName: string;
    exposedModule: string;
    tag: string;
    optional?: boolean;
  }[] = [
    { remoteName: 'mfe-orders', exposedModule: './web-component', tag: 'mfe-orders' },
    { remoteName: 'mfe-profile', exposedModule: './web-component', tag: 'mfe-profile' },
    // Built on older Angular majors (ng21/ and ng20/ workspaces): each lands in its
    // own share scope and brings its own Angular runtime; same DOM contract as mfe-orders.
    { remoteName: 'mfe-orders-ng21', exposedModule: './web-component', tag: 'mfe-orders-ng21' },
    { remoteName: 'mfe-orders-ng20', exposedModule: './web-component', tag: 'mfe-orders-ng20' },
    // Opt-in (serve.mjs --ng19): Angular 19 on the Native Federation v3 line, loaded
    // only when the manifest lists it.
    {
      remoteName: 'mfe-orders-ng19',
      exposedModule: './web-component',
      tag: 'mfe-orders-ng19',
      optional: true,
    },
  ];

  async ngOnInit(): Promise<void> {
    // initFederation() already ran in main.ts; its loadRemoteModule pulls each remote's
    // exposed module, which registers its custom element on the Angular runtime of the
    // remote's share scope (the host's for aligned remotes, a private copy otherwise).
    const remotes = this.remotes.filter(
      (r) => !r.optional || this.nf.adapters.remoteInfoRepo.contains(r.remoteName),
    );
    this.expected.set(new Set(remotes.map((r) => r.tag)));
    for (const r of remotes) {
      try {
        const mod = await this.nf.loadRemoteModule<RemoteWebComponent>(
          r.remoteName,
          r.exposedModule,
        );
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

  expects(tag: string): boolean {
    return this.expected().has(tag);
  }

  onCustomerInput(event: Event): void {
    this.customer.set((event.target as HTMLInputElement).value);
  }

  onOrderSelected(event: Event): void {
    this.lastOrder.set((event as CustomEvent<string>).detail);
  }
}
