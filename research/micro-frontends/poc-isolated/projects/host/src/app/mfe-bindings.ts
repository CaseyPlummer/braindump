import { Directive, ElementRef, Input, inject } from "@angular/core";
import type { MfeCartInputs } from "@mfe/cart-contract";
import type { MfeOrdersInputs } from "@mfe/orders-contract";
import type { MfeProfileInputs } from "@mfe/profile-contract";

/**
 * Typed template bindings for the MFE elements, derived from their contract
 * packages.
 *
 * Under CUSTOM_ELEMENTS_SCHEMA, Angular accepts any property binding on an
 * unknown element and never type-checks it. Each directive here matches one
 * element and claims its inputs, so `strictTemplates` checks `[customer]="…"`
 * against the contract. A misspelt input still slips through: the schema lets
 * any property binding on a custom element fall back to an unchecked DOM
 * property. The setter forwards the value to the element property,
 * which is typed through `HTMLElementTagNameMap`, and runs at the same point in
 * change detection as a plain property binding would. Unbound inputs are never
 * touched, so the element keeps its own defaults.
 *
 * Events need no directive: the template type-checker creates the element with
 * `document.createElement(tag)` and types `$event` through its
 * `addEventListener` overloads, which the contract provides.
 *
 * `implements` makes each directive cover every contract input; the typed
 * assignment rejects anything the contract doesn't declare.
 */
function element<T extends keyof HTMLElementTagNameMap>(
  _tag: T,
): HTMLElementTagNameMap[T] {
  return inject<ElementRef<HTMLElementTagNameMap[T]>>(ElementRef).nativeElement;
}

@Directive({ selector: "mfe-orders" })
export class MfeOrdersBinding implements MfeOrdersInputs {
  private readonly el = element("mfe-orders");
  @Input() set customer(value: MfeOrdersInputs["customer"]) {
    this.el.customer = value;
  }
  @Input() set route(value: MfeOrdersInputs["route"]) {
    this.el.route = value;
  }
  @Input() set base(value: MfeOrdersInputs["base"]) {
    this.el.base = value;
  }
}

@Directive({ selector: "mfe-profile" })
export class MfeProfileBinding implements MfeProfileInputs {
  private readonly el = element("mfe-profile");
  @Input() set userId(value: MfeProfileInputs["userId"]) {
    this.el.userId = value;
  }
}

@Directive({ selector: "mfe-cart-ng21" })
export class MfeCartBinding implements MfeCartInputs {
  private readonly el = element("mfe-cart-ng21");
  @Input() set currency(value: MfeCartInputs["currency"]) {
    this.el.currency = value;
  }
}
