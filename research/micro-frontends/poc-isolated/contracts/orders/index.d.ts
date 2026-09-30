/**
 * @mfe/orders-contract: the public API of `<mfe-orders>`, published by the
 * orders team and consumed by the host. Types only; no framework dependency.
 *
 * A breaking change (removing or retyping an input or event) is a new major of
 * this package; the orders MFE's build fails until its implementation matches,
 * and the host's build fails until its usage does.
 */
import type {
  ContractElement,
  ContractEventMap,
  HostRoutedEvents,
  HostRoutedInputs,
} from "@platform/element-contract";

export interface MfeOrdersInputs extends HostRoutedInputs {
  /** Customer name shown in the header. Default `"guest"`. */
  customer: string;
}

export interface MfeOrdersEvents extends HostRoutedEvents {
  /** An order was picked; `detail` is its display id, e.g. `"#1001"`. */
  orderSelected: string;
}

export interface MfeOrdersContract {
  readonly tag: "mfe-orders";
  readonly inputs: MfeOrdersInputs;
  readonly events: MfeOrdersEvents;
}

export type MfeOrdersEventMap = ContractEventMap<MfeOrdersContract>;

export interface MfeOrdersElement
  extends ContractElement<MfeOrdersContract>, MfeOrdersInputs {}

declare global {
  interface HTMLElementTagNameMap {
    "mfe-orders": MfeOrdersElement;
  }
}
