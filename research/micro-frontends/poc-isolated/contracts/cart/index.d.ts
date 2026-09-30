/**
 * @mfe/cart-contract: the public API of `<mfe-cart-ng21>` (built on Angular 21).
 * Types only; no framework dependency, so the Angular 22 host and the Angular 21
 * MFE compile against the same package.
 */
import type {
  ContractElement,
  ContractEventMap,
} from "@platform/element-contract";

export interface MfeCartInputs {
  /** ISO 4217 currency the cart formats amounts in. Default `"EUR"`. */
  currency: string;
}

/** `checkout` event detail. */
export interface CartCheckoutDetail {
  /** Number of units in the cart. */
  items: number;
  /** Sum of all lines, in `currency`. */
  total: number;
  currency: string;
}

export interface MfeCartEvents {
  /** The user asked to check out; the host owns the checkout flow. */
  checkout: CartCheckoutDetail;
}

export interface MfeCartContract {
  readonly tag: "mfe-cart-ng21";
  readonly inputs: MfeCartInputs;
  readonly events: MfeCartEvents;
}

export type MfeCartEventMap = ContractEventMap<MfeCartContract>;

export interface MfeCartElement
  extends ContractElement<MfeCartContract>, MfeCartInputs {}

declare global {
  interface HTMLElementTagNameMap {
    "mfe-cart-ng21": MfeCartElement;
  }
}
