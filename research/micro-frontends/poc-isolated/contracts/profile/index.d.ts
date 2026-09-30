/**
 * @mfe/profile-contract: the public API of `<mfe-profile>`. Types only; no
 * framework dependency.
 */
import type {
  ContractElement,
  ContractEventMap,
} from "@platform/element-contract";

export interface MfeProfileInputs {
  /** Id of the user whose profile is shown (attribute `user-id`). */
  userId: string;
}

/** `<mfe-profile>` dispatches no events. */
export interface MfeProfileEvents {}

export interface MfeProfileContract {
  readonly tag: "mfe-profile";
  readonly inputs: MfeProfileInputs;
  readonly events: MfeProfileEvents;
}

export type MfeProfileEventMap = ContractEventMap<MfeProfileContract>;

export interface MfeProfileElement
  extends ContractElement<MfeProfileContract>, MfeProfileInputs {}

declare global {
  interface HTMLElementTagNameMap {
    "mfe-profile": MfeProfileElement;
  }
}
