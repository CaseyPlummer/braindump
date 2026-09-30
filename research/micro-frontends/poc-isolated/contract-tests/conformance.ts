/**
 * Tests of the conformance check itself (`@platform/angular/contract`): given
 * component shapes that drift from a fixture contract in each possible way, it
 * must report exactly that drift. The real MFEs are checked in their own
 * sources; a fixture keeps these tests independent of contract changes.
 * Type-checked by `npm run test:contracts`, never executed.
 */
import type {
  InputSignal,
  InputSignalWithTransform,
  OutputEmitterRef,
} from "@angular/core";
import type { AssertConforms, ContractCheck } from "@platform/angular/contract";
import type {
  HostRoutedEvents,
  HostRoutedInputs,
  NavigateDetail,
} from "@platform/element-contract";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;
interface FixtureContract {
  readonly tag: "mfe-orders";
  readonly inputs: HostRoutedInputs & { customer: string };
  readonly events: HostRoutedEvents & { orderSelected: string };
}
type Check<C> = ContractCheck<C, FixtureContract>;

declare class Conforming {
  readonly customer: InputSignal<string>;
  readonly route: InputSignal<string>;
  readonly base: InputSignal<string>;
  readonly orderSelected: OutputEmitterRef<string>;
  readonly navigate: OutputEmitterRef<NavigateDetail>;
  // Other public members are not part of the element API.
  select(id: string): void;
  readonly version: string;
}

export type Conforms = AssertConforms<Check<Conforming>>;

declare class MissingInput {
  readonly route: InputSignal<string>;
  readonly base: InputSignal<string>;
  readonly orderSelected: OutputEmitterRef<string>;
  readonly navigate: OutputEmitterRef<NavigateDetail>;
}
export type ReportsMissingInput = Expect<
  Equal<
    Check<MissingInput>,
    'mfe-orders: contract input "customer" is missing from the component'
  >
>;

declare class ExtraInput extends Conforming {
  readonly compact: InputSignal<boolean>;
}
export type ReportsExtraInput = Expect<
  Equal<
    Check<ExtraInput>,
    'mfe-orders: component input "compact" is not in the contract'
  >
>;

declare class RetypedInput extends MissingInput {
  // The element accepts the transform's write type, so that is what is compared.
  readonly customer: InputSignalWithTransform<string, string | number>;
}
export type ReportsRetypedInput = Expect<
  Equal<
    Check<RetypedInput>,
    'mfe-orders: input "customer" has a different type in the contract'
  >
>;

declare class MissingEvent {
  readonly customer: InputSignal<string>;
  readonly route: InputSignal<string>;
  readonly base: InputSignal<string>;
  readonly navigate: OutputEmitterRef<NavigateDetail>;
}
export type ReportsMissingEvent = Expect<
  Equal<
    Check<MissingEvent>,
    'mfe-orders: contract event "orderSelected" is missing from the component'
  >
>;

declare class ExtraOutput extends Conforming {
  readonly orderHovered: OutputEmitterRef<string>;
}
export type ReportsExtraOutput = Expect<
  Equal<
    Check<ExtraOutput>,
    'mfe-orders: component output "orderHovered" is not in the contract'
  >
>;

declare class RetypedDetail {
  readonly customer: InputSignal<string>;
  readonly route: InputSignal<string>;
  readonly base: InputSignal<string>;
  readonly orderSelected: OutputEmitterRef<string>;
  // Only an optional property is missing: still a difference (types must be identical).
  readonly navigate: OutputEmitterRef<{ path: string }>;
}
export type ReportsRetypedDetail = Expect<
  Equal<
    Check<RetypedDetail>,
    'mfe-orders: event "navigate" has a different detail type in the contract'
  >
>;

// Several differences are all reported.
declare class Several {
  readonly route: InputSignal<string>;
  readonly base: InputSignal<string>;
  readonly navigate: OutputEmitterRef<NavigateDetail>;
}
export type ReportsEveryDifference = Expect<
  Equal<
    Check<Several>,
    | 'mfe-orders: contract input "customer" is missing from the component'
    | 'mfe-orders: contract event "orderSelected" is missing from the component'
  >
>;

// @ts-expect-error AssertConforms rejects a drifting component
export type Rejected = AssertConforms<Check<MissingInput>>;
