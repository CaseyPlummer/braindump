/**
 * Minimal implementation of the Web Components Community Group Context Protocol
 * (https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md),
 * wire-compatible with @lit/context.
 *
 * A consumer dispatches a bubbling, composed `context-request` event from its own
 * element; the nearest ancestor provider for that context answers through the
 * event's `callback` and stops propagation. With `subscribe: true` the provider
 * keeps the callback and calls it again whenever the value changes, passing an
 * `unsubscribe` function the consumer calls when it is torn down.
 *
 * Context keys are plain strings, not Symbols, so that two copies of this SDK
 * (e.g. one accidentally bundled into an MFE) still agree on identity. Nothing in
 * this file relies on module-level singletons.
 */

/** A context key carrying its value type. Namespaced + versioned by convention: `platform.session@1`. */
export type Context<V> = string & { readonly __context__?: V };

/** Extracts the value type of a context key. */
export type ContextType<C> = C extends Context<infer V> ? V : never;

export type ContextCallback<V> = (value: V, unsubscribe?: () => void) => void;

export function createContext<V>(key: string): Context<V> {
  return key as Context<V>;
}

export class ContextRequestEvent<V> extends Event {
  constructor(
    readonly context: Context<V>,
    readonly contextTarget: Element,
    readonly callback: ContextCallback<V>,
    readonly subscribe?: boolean,
  ) {
    super("context-request", { bubbles: true, composed: true });
  }
}

declare global {
  interface HTMLElementEventMap {
    "context-request": ContextRequestEvent<unknown>;
  }
}

/**
 * Requests `context` from the nearest provider above `target`. Returns a cleanup
 * function; call it when the consumer is destroyed. Resolves synchronously when a
 * provider is present (providers answer inside `dispatchEvent`).
 */
export function requestContext<V>(
  target: Element,
  context: Context<V>,
  callback: (value: V) => void,
  options: { subscribe?: boolean } = {},
): () => void {
  let active = true;
  let unsubscribe: (() => void) | undefined;
  target.dispatchEvent(
    new ContextRequestEvent<V>(
      context,
      target,
      (value, unsub) => {
        if (!active) return;
        // A provider may re-deliver with a different unsubscribe (e.g. a closer
        // provider took over); release the old subscription first.
        if (unsub !== unsubscribe) {
          unsubscribe?.();
          unsubscribe = unsub;
        }
        callback(value);
      },
      options.subscribe,
    ),
  );
  return () => {
    active = false;
    unsubscribe?.();
    unsubscribe = undefined;
  };
}

/** Provides one context value to every consumer below `host`. */
export class ContextProvider<V> {
  private readonly subscribers = new Map<ContextCallback<V>, () => void>();

  constructor(
    private readonly host: Element,
    readonly context: Context<V>,
    private current: V,
  ) {
    host.addEventListener("context-request", this.onRequest);
  }

  get value(): V {
    return this.current;
  }

  /** Updates the value and notifies every subscribed consumer. */
  setValue(value: V): void {
    if (Object.is(value, this.current)) return;
    this.current = value;
    for (const [callback, unsubscribe] of this.subscribers) {
      callback(value, unsubscribe);
    }
  }

  /** Number of live subscriptions (diagnostics). */
  get subscriberCount(): number {
    return this.subscribers.size;
  }

  dispose(): void {
    this.host.removeEventListener("context-request", this.onRequest);
    this.subscribers.clear();
  }

  private readonly onRequest = (event: Event): void => {
    // Duck-typed, not `instanceof`, so requests from another SDK copy are answered too.
    const request = event as ContextRequestEvent<V>;
    if (request.context !== this.context) return;
    event.stopPropagation();
    if (request.subscribe) {
      const callback = request.callback;
      let unsubscribe = this.subscribers.get(callback);
      if (!unsubscribe) {
        unsubscribe = () => this.subscribers.delete(callback);
        this.subscribers.set(callback, unsubscribe);
      }
      callback(this.current, unsubscribe);
    } else {
      request.callback(this.current);
    }
  };
}
