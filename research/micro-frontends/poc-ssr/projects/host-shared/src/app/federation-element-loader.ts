import { Injectable } from "@angular/core";
import { loadRemoteModule } from "@angular-architects/native-federation";
import { ElementLoader } from "../../../shell/element-loader";

interface RemoteWebComponent {
  register(): Promise<void>;
}

/**
 * Shared-runtime loading: pull the remote's exposed `./web-component` module through
 * Native Federation (remote name == tag) and let it define its element. Aligned
 * remotes run on the host's Angular; the Angular 21 remote gets its own copy
 * through its "ng21" share scope.
 */
@Injectable()
export class FederationElementLoader extends ElementLoader {
  private readonly loading = new Map<string, Promise<void>>();

  load(tag: string): Promise<void> {
    let pending = this.loading.get(tag);
    if (!pending) {
      pending = loadRemoteModule<RemoteWebComponent>(tag, "./web-component")
        .then((m) => m.register())
        .then(() => customElements.whenDefined(tag))
        .then(() => undefined);
      this.loading.set(tag, pending);
    }
    return pending;
  }
}
