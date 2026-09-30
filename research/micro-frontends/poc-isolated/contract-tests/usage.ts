/**
 * Consumer-side contract tests: what the contract packages allow and reject in
 * plain TypeScript, with no framework involved. Type-checked by
 * `npm run test:contracts`, never executed. Each `@ts-expect-error` line must
 * fail to compile; if a contract stops rejecting it, the test run fails.
 */
import type { MfeCartContract } from "@mfe/cart-contract";
import type {} from "@mfe/orders-contract";
import type { MfeProfileContract } from "@mfe/profile-contract";
import type { ContractAttributes } from "@platform/element-contract";

export function ordersElement(): void {
  // HTMLElementTagNameMap: the tag name alone selects the contract's element type.
  const orders = document.createElement("mfe-orders");
  orders.customer = "ACME Corp";
  orders.route = "/1002";
  // @ts-expect-error inputs have the contract's types
  orders.customer = 42;
  // @ts-expect-error unknown properties are rejected
  orders.custmer = "ACME Corp";

  // Contract events: `detail` typed per event name.
  orders.addEventListener("orderSelected", (e) => e.detail.startsWith("#"));
  orders.addEventListener(
    "navigate",
    (e) => e.detail.path + !!e.detail.replace,
  );
  // @ts-expect-error orderSelected's detail is a string
  orders.addEventListener("orderSelected", (e) => e.detail.toFixed());
  // Native events keep their DOM types.
  orders.addEventListener("click", (e) => e.clientX);
  // An unknown event name falls back to plain `Event`: no `detail`.
  // @ts-expect-error misspelt event names get no detail type
  orders.addEventListener("orderSelectd", (e) => e.detail);
}

export function cartElement(): void {
  const cart = document.querySelector("mfe-cart-ng21");
  cart?.addEventListener("checkout", (e) => e.detail.total.toFixed(2));
  // @ts-expect-error checkout has no `amount`
  cart?.addEventListener("checkout", (e) => e.detail.amount);
  const tag: MfeCartContract["tag"] = "mfe-cart-ng21";
  // @ts-expect-error the tag is part of the contract
  const wrongTag: MfeCartContract["tag"] = "mfe-cart";
  void [tag, wrongTag];
}

export function attributes(): void {
  // Inputs as (string-valued) kebab-case attributes.
  const ok: ContractAttributes<MfeProfileContract> = { "user-id": "u-42" };
  // @ts-expect-error attribute names are kebab-case
  const camel: ContractAttributes<MfeProfileContract> = { userId: "u-42" };
  void [ok, camel];
}
