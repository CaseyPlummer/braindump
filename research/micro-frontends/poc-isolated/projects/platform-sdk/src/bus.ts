/**
 * App-wide event bus for many-to-many communication between MFEs that have no
 * parent/child relationship in the DOM.
 *
 * Events are named `<domain>.<event>@<major>`. The payload type for each name is
 * declared in `PlatformEvents`; domain teams add their own events by declaration
 * merging (`declare module "@platform/sdk" { interface PlatformEvents { … } }`).
 * A breaking payload change ships as a new major (`cart.itemAdded@2`) and the
 * publisher emits both majors during the migration window.
 *
 * Transport is a DOM CustomEvent on `document`, not an in-module listener list,
 * so publishers and subscribers interoperate even if they hold different copies
 * of this SDK. Payloads should be plain JSON-compatible data (they are frozen) so
 * the same contract could cross an iframe boundary via postMessage.
 *
 * The bus carries events, not state: a subscriber that mounts later does not see
 * earlier events. Shared state belongs in a host-provided context.
 */

export interface PlatformEvents {
  "cart.itemAdded@1": {
    sku: string;
    name: string;
    qty: number;
    unitPrice: number;
  };
  "cart.cleared@1": Record<string, never>;
}

export type PlatformEventType = keyof PlatformEvents;

export interface BusEnvelope<K extends PlatformEventType = PlatformEventType> {
  readonly type: K;
  readonly payload: Readonly<PlatformEvents[K]>;
  /** Who published it (an MFE tag or `host`). Diagnostics only; never branch on it. */
  readonly source: string;
  readonly id: string;
  readonly at: number;
}

/** DOM event name; versioned so a future transport change can coexist. */
export const BUS_EVENT = "platform-bus@1";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value)) deepFreeze(v);
  }
  return value;
}

let sequence = 0;

export const bus = {
  publish<K extends PlatformEventType>(
    type: K,
    payload: PlatformEvents[K],
    source: string,
  ): void {
    const envelope: BusEnvelope<K> = deepFreeze({
      type,
      payload: structuredClone(payload),
      source,
      id: `${source}:${Date.now().toString(36)}:${(sequence++).toString(36)}`,
      at: Date.now(),
    });
    document.dispatchEvent(new CustomEvent(BUS_EVENT, { detail: envelope }));
  },

  /**
   * Subscribes to one event type, or `"*"` for all. Returns the unsubscribe
   * function. A throwing handler is reported but does not stop other handlers.
   */
  subscribe<K extends PlatformEventType>(
    type: K | "*",
    handler: (payload: PlatformEvents[K], envelope: BusEnvelope<K>) => void,
  ): () => void {
    const listener = (event: Event) => {
      const envelope = (event as CustomEvent<BusEnvelope<K>>).detail;
      if (type === "*" || envelope.type === type) {
        handler(envelope.payload as PlatformEvents[K], envelope);
      }
    };
    document.addEventListener(BUS_EVENT, listener);
    return () => document.removeEventListener(BUS_EVENT, listener);
  },
};
