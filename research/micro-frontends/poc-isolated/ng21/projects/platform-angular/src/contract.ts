import type { InputSignalWithTransform, OutputRef } from "@angular/core";
import type { ElementContract } from "@platform/element-contract";

/**
 * Compile-time conformance between an MFE's root component and its published
 * contract package. Types only: nothing here reaches the bundle.
 *
 *   type _ = AssertConforms<ContractCheck<OrdersShell, MfeOrdersContract>>;
 *
 * compiles only while the component's signal inputs (`input()`) and outputs
 * (`output()`) are exactly the contract's inputs and events, with identical
 * types. A contract change without the matching implementation change fails the
 * MFE build, and so does an implementation change the contract doesn't declare.
 * The error names each difference, e.g.
 *   Type '"mfe-orders: contract input \"customer\" is missing from the component"'
 *   does not satisfy the constraint '"conforms"'.
 *
 * Detection is by type, so the component must use public signal inputs and
 * outputs without aliases (decorator `@Input`s are invisible to it; an alias
 * would change the DOM name without changing the property name).
 */

// `any`, not `unknown`: an input signal's node makes it invariant in both parameters.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyInput = InputSignalWithTransform<any, any>;

type InputKeys<C> = {
  [K in keyof C]-?: C[K] extends AnyInput ? K : never;
}[keyof C] &
  string;

type OutputKeys<C> = {
  [K in keyof C]-?: C[K] extends OutputRef<unknown> ? K : never;
}[keyof C] &
  string;

/** Signal inputs of a component: property → the type the element accepts. */
export type ComponentInputs<C> = {
  [K in InputKeys<C>]: C[K] extends InputSignalWithTransform<any, infer W>
    ? W
    : never;
};

/** Signal outputs of a component: event name → emitted (`detail`) type. */
export type ComponentOutputs<C> = {
  [K in OutputKeys<C>]: C[K] extends OutputRef<infer T> ? T : never;
};

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;

type Differing<A, B> = {
  [K in keyof A & keyof B & string]: Equals<A[K], B[K]> extends true
    ? never
    : K;
}[keyof A & keyof B & string];

type Missing<A, B> = Exclude<keyof A & string, keyof B>;

// A template literal type distributes over a union of keys and collapses to
// `never` when there are none: one message per difference.
type Violations<Tag extends string, Inputs, Events, Actual, Emitted> =
  | `${Tag}: contract input "${Missing<Inputs, Actual>}" is missing from the component`
  | `${Tag}: component input "${Missing<Actual, Inputs>}" is not in the contract`
  | `${Tag}: input "${Differing<Inputs, Actual>}" has a different type in the contract`
  | `${Tag}: contract event "${Missing<Events, Emitted>}" is missing from the component`
  | `${Tag}: component output "${Missing<Emitted, Events>}" is not in the contract`
  | `${Tag}: event "${Differing<Events, Emitted>}" has a different detail type in the contract`;

type OrConforms<V> = [V] extends [never] ? "conforms" : V;

/** `"conforms"`, or a union of messages describing every difference. */
export type ContractCheck<Component, C extends ElementContract> = OrConforms<
  Violations<
    C["tag"],
    C["inputs"],
    C["events"],
    ComponentInputs<Component>,
    ComponentOutputs<Component>
  >
>;

/** Fails to compile unless `Check` is `"conforms"`. */
export type AssertConforms<Check extends "conforms"> = Check;
