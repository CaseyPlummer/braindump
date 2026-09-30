/**
 * @platform/element-contract: the shape every MFE contract package follows, and
 * the platform conventions shared by all MFE elements (the host-owned routing
 * inputs and event).
 *
 * Types only: no runtime code and no framework dependency, so the host and MFEs
 * on any Angular major (or any other framework) can depend on it. Only DOM lib
 * types are referenced.
 */

/** Public API of one MFE custom element. */
export interface ElementContract {
  /** Custom-element name the MFE registers. */
  readonly tag: `${string}-${string}`;
  /**
   * Properties the host sets, with their types. Angular Elements also observes
   * each one as a kebab-case attribute (`userId` → `user-id`, string values).
   */
  readonly inputs: object;
  /**
   * `CustomEvent`s the element dispatches: event name → `detail` type. Angular
   * Elements dispatches them on the element itself; they do not bubble.
   */
  readonly events: object;
}

/** Event name → `CustomEvent<detail>`, in the style of `HTMLElementEventMap`. */
export type ContractEventMap<C extends ElementContract> = {
  [K in keyof C["events"]]: CustomEvent<C["events"][K]>;
};

/** `userId` → `user-id`. */
export type KebabCase<S extends string> = S extends `${infer Head}${infer Tail}`
  ? `${Head extends Lowercase<Head> ? Head : `-${Lowercase<Head>}`}${KebabCase<Tail>}`
  : S;

/** Attribute form of the inputs (attribute values are always strings). */
export type ContractAttributes<C extends ElementContract> = {
  [K in keyof C["inputs"] & string as KebabCase<K>]?: string;
};

/**
 * Base interface for a contract's element type: an `HTMLElement` whose
 * `addEventListener` knows the contract's event names and `detail` types. The
 * contract's element interface also extends its inputs interface.
 */
export interface ContractElement<
  C extends ElementContract,
> extends HTMLElement {
  addEventListener<K extends keyof C["events"] & string>(
    type: K,
    listener: (this: HTMLElement, ev: CustomEvent<C["events"][K]>) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof C["events"] & string>(
    type: K,
    listener: (this: HTMLElement, ev: CustomEvent<C["events"][K]>) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

// --- Platform convention: host-owned routing ---------------------------------------
// An MFE with internal routes takes these inputs and dispatches `navigate`; the
// host owns the address bar (see the routing contract in the POC README).

/** `navigate` event detail: a sub-path relative to `base`. */
export interface NavigateDetail {
  path: string;
  /** The host should replace the current history entry instead of pushing. */
  replace?: boolean;
}

export interface HostRoutedInputs {
  /** The MFE's sub-path, owned by the host, e.g. `/1002`. */
  route: string;
  /** Mount path of the MFE in the host URL, e.g. `/orders`. */
  base: string;
}

export interface HostRoutedEvents {
  navigate: NavigateDetail;
}
